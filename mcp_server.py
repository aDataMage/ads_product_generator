"""
Project Prodigy: MCP Server
This script runs our 2-call "Smart Prompt Engineer" workflow
as a persistent server that listens for JSON-RPC messages from Kiro.
"""
import requests
import json
import base64
import time
import os
import google.generativeai as genai
import sys
from config import BRIA_API_KEY

# --- 1. CONFIGURATION ---
# Bria Config
BRIA_API_ENDPOINT = "https://engine.prod.bria-api.com/v2/image/generate"
BRIA_HEADERS = {
    'api_token': BRIA_API_KEY,
    'Content-Type': 'application/json'
}

# Gemini Config
try:
    gemini_key = os.environ.get("GOOGLE_API_KEY")
    if not gemini_key:
        raise ValueError("GOOGLE_API_KEY environment variable not set.")
    genai.configure(api_key=gemini_key)
    gemini_model = genai.GenerativeModel('gemini-2.5-flash')
except Exception as e:
    # If config fails, we can't run. Log to stderr for Kiro to see.
    sys.stderr.write(f"FATAL: GEMINI CONFIG ERROR: {e}\n")
    sys.stderr.flush()
    exit(1)  # Exit with an error code

# --- 2. HELPER FUNCTIONS ---
# Note: All logging now goes to sys.stderr to avoid polluting stdout


def log_message(message):
    """Sends a log message to Kiro's output console."""
    sys.stderr.write(f"[MCP Server]: {message}\n")
    sys.stderr.flush()


def encode_image(image_path):
    """Encode image to base64 string."""
    try:
        with open(image_path, 'rb') as image_file:
            base64_string = base64.b64encode(image_file.read()).decode('utf-8')
        return base64_string
    except FileNotFoundError:
        log_message(
            f"Warning: Reference image not found at {image_path}. Proceeding without it.")
        return None


def download_image(url, save_path):
    """Download image from URL and save to disk."""
    try:
        response = requests.get(url)
        response.raise_for_status()
        with open(save_path, 'wb') as file:
            file.write(response.content)
        log_message(f"Image successfully saved to {save_path}")
        return save_path
    except requests.exceptions.RequestException as e:
        log_message(f"Error downloading final image: {e}")
        return None


def clean_json_response(text):
    """Cleans the markdown json ...  from Gemini's response."""
    if text.strip().startswith("```json"):
        text = text.strip()[7:-3]
    return text.strip()


def poll_for_result(status_url):
    """Polls Bria's status URL until the job is COMPLETED or FAILED."""
    while True:
        try:
            status_response = requests.get(status_url, headers=BRIA_HEADERS)
            status_data = status_response.json()
            if status_data['status'] == "COMPLETED":
                log_message("...Generation complete.")
                return status_data['result']
            elif status_data['status'] == "ERROR":
                log_message(
                    f"...Error: {status_data.get('error', 'Unknown processing error')}")
                return None
            else:
                log_message(
                    f"...Status: {status_data['status']}. Checking again in 5s.")
                time.sleep(5)
        except requests.exceptions.RequestException as e:
            log_message(f"...Polling error: {e}. Retrying...")
            time.sleep(5)

# --- 3. CORE AGENTIC FUNCTION ---


def run_generation_workflow(user_prompt, preset_name, reference_image_path=None):
    """This is the main "agentic chain" logic, refactored into a function.
    It returns a dictionary with the final result."""
    log_message("--- 1. GEMINI TRANSLATOR CALL ---")
    master_prompt_string = ""
    try:
        # 1a. Load all prompt components
        with open('merger_prompt.txt', 'r') as f:
            merger_prompt_template = f.read()
        preset_file_path = os.path.join('presets', preset_name)
        with open(preset_file_path, 'r') as f:
            style_json_string = json.dumps(json.load(f))

        # 1b. Inject components into the master prompt
        final_merger_prompt = merger_prompt_template.replace(
            "[USER_PROMPT]", user_prompt)
        final_merger_prompt = final_merger_prompt.replace(
            "[STYLE_JSON]", style_json_string)

        # 1c. Call Gemini
        log_message("Sending user prompt and style JSON to Gemini...")
        gemini_response = gemini_model.generate_content(final_merger_prompt)
        master_prompt_string = clean_json_response(gemini_response.text)
        log_message(
            f"Gemini created new Master Prompt: \"{master_prompt_string[:75]}...\"")

        with open('outputs/master_prompt.txt', 'w') as f:
            f.write(master_prompt_string)
    except Exception as e:
        log_message(f"Gemini Call 1 Failed. The raw error was: {e}")
        return {"success": False, "error": str(e)}

    # --- CALL 2: BRIA (The "Image Engine") ---
    log_message("\n--- 2. BRIA IMAGE ENGINE CALL ---")
    try:
        payload = {"prompt": master_prompt_string}

        if reference_image_path:
            log_message(
                f"...Reference image '{reference_image_path}' found. Encoding.")
            base64_image_string = encode_image(reference_image_path)
            if base64_image_string:
                payload["images"] = [base64_image_string]
        else:
            log_message(
                "...No reference image. Proceeding with text-to-image.")

        log_message("Submitting final job to Bria...")
        response = requests.post(
            BRIA_API_ENDPOINT, json=payload, headers=BRIA_HEADERS)
        if response.status_code != 202:
            log_message(
                f"--- BRIA ERROR --- Status: {response.status_code}, {response.text}")
            return {"success": False, "error": response.text}

        response_data = response.json()
        log_message(
            f"Job accepted by Bria. Request ID: {response_data['request_id']}")
        result = poll_for_result(response_data['status_url'])

        if result:
            final_image_url = result['image_url']
            saved_path = download_image(
                final_image_url, 'outputs/final_image.jpg')
            log_message("\n--- PROJECT SUCCESS! ---")
            return {"success": True, "image_path": saved_path, "url": final_image_url}
        else:
            log_message("\n--- PROJECT FAILED --- Bria job failed.")
            return {"success": False, "error": "Bria job failed to generate a final image."}
    except Exception as e:
        log_message(f"Bria Call 2 Connection Error: {e}")
        return {"success": False, "error": str(e)}

# --- 4. MCP SERVER LISTENER ---


def main_server_loop():
    """This is the main MCP server loop. It listens for JSON-RPC
    messages on stdin and sends responses on stdout."""
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                time.sleep(0.1)
                continue

            message = json.loads(line)
            msg_id = message.get("id")
            method = message.get("method")
            params = message.get("params", {})

            if method == "initialize":
                log_message("Received initialize request")
                response = {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "result": {
                        "protocolVersion": "2024-11-05",
                        "capabilities": {
                            "tools": {}
                        },
                        "serverInfo": {
                            "name": "product-shot-agent",
                            "version": "1.0.0"
                        }
                    }
                }
            elif method == "tools/list":
                log_message("Received tools/list request")
                response = {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "result": {
                        "tools": [
                            {
                                "name": "generate_styled_image",
                                "description": "Runs the 2-call (Gemini -> Bria) chain to generate a new, styled image.",
                                "inputSchema": {
                                    "type": "object",
                                    "properties": {
                                        "user_prompt": {
                                            "type": "string",
                                            "description": "The user's simple text prompt (e.g., 'a smartphone')."
                                        },
                                        "preset_name": {
                                            "type": "string",
                                            "description": "The filename of the preset to use (e.g., 'preset_bright_clean.json')."
                                        },
                                        "reference_image_path": {
                                            "type": "string",
                                            "description": "(Optional) The file path to a reference image."
                                        }
                                    },
                                    "required": ["user_prompt", "preset_name"]
                                }
                            }
                        ]
                    }
                }
            elif method == "tools/call":
                tool_name = params.get("name")
                if tool_name == "generate_styled_image":
                    log_message(
                        f"Received job (ID: {msg_id}): generate_styled_image")

                    # Call our main function with the params Kiro sent
                    arguments = params.get("arguments", {})
                    result = run_generation_workflow(
                        user_prompt=arguments.get("user_prompt"),
                        preset_name=arguments.get("preset_name"),
                        reference_image_path=arguments.get(
                            "reference_image_path")
                    )

                    # Send the successful result back to Kiro
                    response = {
                        "jsonrpc": "2.0",
                        "id": msg_id,
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": json.dumps(result)
                                }
                            ]
                        }
                    }
                else:
                    response = {
                        "jsonrpc": "2.0",
                        "id": msg_id,
                        "error": {"code": -32601, "message": f"Unknown tool: {tool_name}"}
                    }
            else:
                # Handle unknown methods
                response = {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "error": {"code": -32601, "message": f"Method not found: {method}"}
                }

            # Print the JSON-RPC response to stdout for Kiro
            print(json.dumps(response))
            sys.stdout.flush()

        except json.JSONDecodeError:
            log_message("Error: Received invalid JSON from stdin.")
        except Exception as e:
            log_message(f"Unhandled server error: {e}")


if __name__ == "__main__":
    log_message("MCP server started. Listening for Kiro tool calls...")
    main_server_loop()
