"""
Project Prodigy: 2-Call "Smart Prompt Engineer" Workflow
(Gemini -> Bria)
"""
import requests
import json
import base64
import time
import os
import google.generativeai as genai
from config import BRIA_API_KEY

# --- 0. USER-CONFIGURABLE INPUTS ---
# This is what our UI will eventually control
USER_PROMPT = "a new, unbranded smartphone in a box"
REFERENCE_IMAGE_PATH = "inputs/product_image.png"  # Set to None to test text-only
PRESET_FILE = "presets/preset_bright_clean.json"

# --- 1. CONFIGURATION ---
# Configure Bria
BRIA_API_ENDPOINT = "https://engine.prod.bria-api.com/v2/image/generate"
BRIA_HEADERS = {
    'api_token': BRIA_API_KEY,
    'Content-Type': 'application/json'
}

# Configure Gemini
try:
    gemini_key = os.environ.get("GOOGLE_API_KEY")
    if not gemini_key:
        raise ValueError("GOOGLE_API_KEY environment variable not set.")
    genai.configure(api_key=gemini_key)
    gemini_model = genai.GenerativeModel('gemini-2.5-flash')
except Exception as e:
    print(f"--- FATAL: GEMINI CONFIG ERROR ---")
    print(f"Error: {e}")
    print("Please check your GOOGLE_API_KEY setup.")
    exit()

# --- 2. HELPER FUNCTIONS ---


def encode_image(image_path):
    """Encode image to base64 string."""
    try:
        with open(image_path, 'rb') as image_file:
            base64_string = base64.b64encode(image_file.read()).decode('utf-8')
        return base64_string
    except FileNotFoundError:
        print(
            f"Warning: Reference image not found at {image_path}. Proceeding without it.")
        return None


def download_image(url, save_path):
    """Download image from URL and save to disk."""
    try:
        response = requests.get(url)
        response.raise_for_status()
        with open(save_path, 'wb') as file:
            file.write(response.content)
        print(f"\nImage successfully saved to {save_path}")
    except requests.exceptions.RequestException as e:
        print(f"\nError downloading final image: {e}")


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
                print("...Generation complete.")
                return status_data['result']
            elif status_data['status'] == "ERROR":
                print(
                    f"...Error: {status_data.get('error', 'Unknown processing error')}")
                return None
            else:
                print(
                    f"...Status: {status_data['status']}. Checking again in 5s.")
                time.sleep(5)
        except requests.exceptions.RequestException as e:
            print(f"...Polling error: {e}. Retrying...")
            time.sleep(5)


# --- 3. MAIN EXECUTION ---
if __name__ == "__main__":
    # --- CALL 1: GEMINI (The "Translator") ---
    print("--- 1. GEMINI TRANSLATOR CALL ---")
    master_prompt_string = ""
    try:
        # 1a. Load all prompt components
        with open('merger_prompt.txt', 'r') as f:
            merger_prompt_template = f.read()
        with open(PRESET_FILE, 'r') as f:
            style_json_string = json.dumps(json.load(f))

        # 1b. Inject components into the master prompt
        final_merger_prompt = merger_prompt_template.replace(
            "[USER_PROMPT]", USER_PROMPT)
        final_merger_prompt = final_merger_prompt.replace(
            "[STYLE_JSON]", style_json_string)

        # 1c. Call Gemini
        print("Sending user prompt and style JSON to Gemini...")
        gemini_response = gemini_model.generate_content(final_merger_prompt)
        master_prompt_string = clean_json_response(gemini_response.text)
        print(
            f"Gemini created new Master Prompt: \"{master_prompt_string[:75]}...\"")

        # Save the master prompt for debugging
        with open('outputs/master_prompt.txt', 'w') as f:
            f.write(master_prompt_string)
    except Exception as e:
        print(f"Gemini Call 1 Failed. The raw error was: {e}")
        exit()

    # --- CALL 2: BRIA (The "Image Engine") ---
    print("\n--- 2. BRIA IMAGE ENGINE CALL ---")
    try:
        # 2a. Build the Bria payload
        payload = {
            "prompt": master_prompt_string
        }

        # 2b. **CRITICAL LOGIC**: Add image *only if* it exists
        if REFERENCE_IMAGE_PATH:
            print("...Reference image found. Encoding and adding to payload.")
            base64_image_string = encode_image(REFERENCE_IMAGE_PATH)
            if base64_image_string:
                payload["images"] = [base64_image_string]
        else:
            print("...No reference image. Proceeding with text-to-image.")

        # 2c. Submit and Poll
        print("Submitting final job to Bria...")
        response = requests.post(
            BRIA_API_ENDPOINT, json=payload, headers=BRIA_HEADERS)
        if response.status_code != 202:
            print(f"--- BRIA ERROR ---")
            print(
                f"API request failed with status code: {response.status_code}")
            print(f"Response from server: {response.text}")
            exit()

        print("Job accepted by Bria API.")
        response_data = response.json()
        print(f"Request ID: {response_data['request_id']}")
        result = poll_for_result(response_data['status_url'])

        # 2d. Save Final Image
        if result:
            final_image_url = result['image_url']
            download_image(final_image_url, 'outputs/final_image.jpg')
            print("\n--- PROJECT SUCCESS! ---")
            print("Agentic chain complete. Final image saved.")
        else:
            print("\n--- PROJECT FAILED ---")
            print("Bria job failed to generate a final image.")
    except requests.exceptions.RequestException as e:
        print(f"Bria Call 2 Connection Error: {e}")
