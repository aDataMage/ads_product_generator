"""Project Prodigy: Agentic Chain Script (Bria -> Gemini -> Bria)"""
import requests
import json
import base64
import time
import os
import google.generativeai as genai
from config import BRIA_API_KEY

# --- 1. CONFIGURATION ---

# Configure Bria
BRIA_API_ENDPOINT = "https://engine.prod.bria-api.com/v2/image/generate"
BRIA_HEADERS = {
    'api_token': BRIA_API_KEY,
    'Content-Type': 'application/json'
}

# Configure Gemini
gemini_key = os.environ.get("GOOGLE_API_KEY")
if not gemini_key:
    print("--- ERROR ---")
    print("GOOGLE_API_KEY environment variable not set.")
    print("Please follow the setup instructions at https://ai.google.dev/gemini-api/docs/api-key#windows")
    exit()
genai.configure(api_key=gemini_key)
gemini_model = genai.GenerativeModel('gemini-2.5-flash')

# --- 2. HELPER FUNCTIONS ---


def encode_image(image_path):
    """Encode image to base64 string."""
    with open(image_path, 'rb') as image_file:
        base64_string = base64.b64encode(image_file.read()).decode('utf-8')
    return base64_string


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
    """Cleans the markdown json ... from Gemini's response."""
    if text.strip().startswith("```json"):
        text = text.strip()[7:-3]
    return text


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

    # --- CALL 1: BRIA (Context Call) ---
    print("--- 1. BRIA CONTEXT CALL ---")

    # 1a. Load Inputs
    with open('presets/preset_editorial_dark.json', 'r') as f:
        preset_data = json.load(f)

    initial_prompt = preset_data.get(
        'short_description', 'A professional product shot')
    base64_image_string = encode_image('inputs/product_image.png')

    # 1b. Build Payload
    payload_1 = {
        "images": [base64_image_string],
        "prompt": initial_prompt
    }

    # 1c. Submit and Poll
    try:
        print("Submitting initial job to Bria...")
        response_1 = requests.post(
            BRIA_API_ENDPOINT, json=payload_1, headers=BRIA_HEADERS)

        if response_1.status_code != 202:
            print(
                f"Bria Call 1 Failed! Status: {response_1.status_code}, {response_1.text}")
            exit()

        response_data_1 = response_1.json()
        print(
            f"Bria Call 1 Accepted. Request ID: {response_data_1['request_id']}")

        result_1 = poll_for_result(response_data_1['status_url'])

        print(f"Downloading initial image from Call 1...")
        download_image(result_1['image_url'], 'outputs/1_initial_image.jpg')

        if not result_1:
            print("Bria Call 1 failed to generate. Exiting.")
            exit()

        seed = result_1['seed']
        context_json_string = result_1['structured_prompt']
        print(f"Got Bria context. Seed: {seed}")

        print("Saving Bria's returned 'context' JSON...")
        with open('outputs/2_bria_context.json', 'w') as f:
            json.dump(json.loads(context_json_string), f, indent=2)

    except requests.exceptions.RequestException as e:
        print(f"Bria Call 1 Connection Error: {e}")
        exit()

    # --- CALL 2: GEMINI (Smart Merge) ---
    print("\n--- 2. GEMINI MERGE CALL ---")

    try:
        # 2a. Load Prompts
        with open('merger_prompt.txt', 'r') as f:
            merger_prompt_template = f.read()

        # 2b. Inject our two JSONs into the prompt template
        final_merger_prompt = merger_prompt_template.replace(
            "[CONTEXT_JSON]", context_json_string)
        final_merger_prompt = final_merger_prompt.replace(
            "[STYLE_JSON]", json.dumps(preset_data))

        # 2c. Call Gemini
        print("Sending JSONs to Gemini for smart merge...")
        gemini_response = gemini_model.generate_content(final_merger_prompt)
        merged_json_string = clean_json_response(gemini_response.text)
        print("Gemini merge complete.")

        # Verify the merge
        # This will raise an error if Gemini returned bad JSON
        json.loads(merged_json_string)

        print("Saving Gemini's 'merged' JSON...")
        with open('outputs/3_gemini_merged.json', 'w') as f:
            json.dump(json.loads(merged_json_string), f, indent=2)

    except Exception as e:
        print(f"Gemini Call 2 Failed. The raw error was: {e}")
        exit()

    # --- CALL 3: BRIA (Refinement Call) ---
    print("\n--- 3. BRIA REFINEMENT CALL ---")

    try:
        # 3a. Build Payload
        payload_3 = {
            "structured_prompt": merged_json_string,
            "seed": seed,
            "prompt": "Refine image using the provided structured prompt."
        }

        # 3b. Submit and Poll
        print("Submitting refinement job to Bria...")
        response_3 = requests.post(
            BRIA_API_ENDPOINT, json=payload_3, headers=BRIA_HEADERS)

        if response_3.status_code != 202:
            print(
                f"Bria Call 3 Failed! Status: {response_3.status_code}, {response_3.text}")
            exit()

        response_data_3 = response_3.json()
        print(
            f"Bria Call 3 Accepted. Request ID: {response_data_3['request_id']}")

        result_3 = poll_for_result(response_data_3['status_url'])

        # 3c. Save Final Image
        if result_3:
            final_image_url = result_3['image_url']
            download_image(final_image_url, 'outputs/4_final_image.jpg')
            print("\n--- PROJECT SUCCESS! ---")
            print("Agentic chain complete. Final image saved.")
        else:
            print("Bria Call 3 failed to generate a final image.")

    except requests.exceptions.RequestException as e:
        print(f"Bria Call 3 Connection Error: {e}")
