"""
Reusable workflow module for AI-powered product image generation.
Implements the 2-stage workflow: Gemini (Translator) -> Bria (Image Engine)
"""
import requests
import json
import base64
import time
import os
import sys
import logging
import google.generativeai as genai
from config import BRIA_API_KEY

# Configure module logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Add stderr handler if not already configured
if not logger.handlers:
    handler = logging.StreamHandler(sys.stderr)
    handler.setLevel(logging.INFO)
    formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)


# --- CONFIGURATION ---
BRIA_API_ENDPOINT = "https://engine.prod.bria-api.com/v2/image/generate"
BRIA_HEADERS = {
    'api_token': BRIA_API_KEY,
    'Content-Type': 'application/json'
}

# Configure Gemini
try:
    gemini_key = os.environ.get("GOOGLE_API_KEY")
    if not gemini_key:
        logger.critical("GOOGLE_API_KEY environment variable not set")
        raise ValueError("GOOGLE_API_KEY environment variable not set.")

    # Validate API key format (basic check)
    if len(gemini_key) < 20:
        logger.critical("GOOGLE_API_KEY appears to be invalid (too short)")
        raise ValueError("GOOGLE_API_KEY appears to be invalid")

    genai.configure(api_key=gemini_key)
    gemini_model = genai.GenerativeModel('gemini-2.5-flash')
    logger.info("Gemini API configured successfully")
except Exception as e:
    logger.critical(
        f"Fatal error configuring Gemini API: {str(e)}", exc_info=True)
    raise


# --- HELPER FUNCTIONS ---

def encode_base64_to_bytes(base64_string: str) -> bytes:
    """Decode base64 string to image bytes.

    Args:
        base64_string: Base64-encoded image data

    Returns:
        bytes: Decoded image bytes

    Raises:
        ValueError: If base64 string is invalid
    """
    try:
        if not base64_string:
            raise ValueError("Base64 string is empty")

        decoded = base64.b64decode(base64_string, validate=True)
        logger.debug(
            f"Successfully decoded base64 image ({len(decoded)} bytes)")
        return decoded
    except Exception as e:
        logger.error(f"Failed to decode base64 image: {str(e)}")
        raise ValueError(f"Invalid base64 image data: {e}")


def clean_json_response(text: str) -> str:
    """Cleans the markdown json wrapper from Gemini's response."""
    if text.strip().startswith("```json"):
        text = text.strip()[7:-3]
    return text.strip()


def poll_for_result(status_url: str, max_attempts: int = 60) -> dict:
    """Polls Bria's status URL until the job is COMPLETED or FAILED.

    Args:
        status_url: Bria status endpoint URL
        max_attempts: Maximum number of polling attempts (default: 60 = 5 minutes)

    Returns:
        dict with 'image_url' on success, None on failure

    Raises:
        Exception: If polling exceeds max attempts or encounters fatal errors
    """
    attempt = 0
    consecutive_errors = 0
    max_consecutive_errors = 3

    logger.info(
        f"Starting to poll Bria status URL (max {max_attempts} attempts)")

    while attempt < max_attempts:
        attempt += 1
        try:
            status_response = requests.get(
                status_url, headers=BRIA_HEADERS, timeout=10)
            status_response.raise_for_status()
            status_data = status_response.json()

            # Reset consecutive error counter on successful request
            consecutive_errors = 0

            status = status_data.get('status', 'UNKNOWN')

            if status == "COMPLETED":
                logger.info(
                    f"Bria job completed successfully (attempt {attempt})")
                return status_data['result']
            elif status == "ERROR":
                error_msg = status_data.get(
                    'error', 'Unknown processing error')
                logger.error(f"Bria job failed with error: {error_msg}")
                return None
            else:
                logger.debug(
                    f"Bria job status: {status} (attempt {attempt}/{max_attempts})")
                time.sleep(5)

        except requests.exceptions.Timeout:
            consecutive_errors += 1
            logger.warning(
                f"Polling timeout (attempt {attempt}, consecutive errors: {consecutive_errors})")
            if consecutive_errors >= max_consecutive_errors:
                logger.error(
                    f"Too many consecutive polling errors ({consecutive_errors}), aborting")
                raise Exception(
                    f"Bria polling failed after {consecutive_errors} consecutive timeouts")
            time.sleep(5)

        except requests.exceptions.RequestException as e:
            consecutive_errors += 1
            logger.warning(
                f"Polling error: {str(e)} (attempt {attempt}, consecutive errors: {consecutive_errors})")
            if consecutive_errors >= max_consecutive_errors:
                logger.error(
                    f"Too many consecutive polling errors ({consecutive_errors}), aborting")
                raise Exception(f"Bria polling failed: {str(e)}")
            time.sleep(5)

        except Exception as e:
            logger.error(f"Unexpected polling error: {str(e)}", exc_info=True)
            raise Exception(f"Unexpected error during Bria polling: {str(e)}")

    logger.error(f"Bria polling exceeded maximum attempts ({max_attempts})")
    raise Exception(f"Bria job polling timeout after {max_attempts} attempts")


def call_gemini_translator(user_prompt: str, preset_json: dict) -> str:
    """Call Gemini to generate master prompt from user input and preset.

    Args:
        user_prompt: Simple user description of the product
        preset_json: Style preset configuration as dict

    Returns:
        Master prompt string optimized for image generation

    Raises:
        Exception: If Gemini API call fails
    """
    try:
        logger.info("Loading merger prompt template")

        # Load merger prompt template
        try:
            with open('merger_prompt.txt', 'r') as f:
                merger_prompt_template = f.read()
        except FileNotFoundError:
            logger.error("merger_prompt.txt file not found")
            raise Exception("Merger prompt template file not found")
        except Exception as e:
            logger.error(f"Failed to read merger prompt template: {str(e)}")
            raise Exception(f"Failed to read merger prompt template: {str(e)}")

        # Convert preset to JSON string
        try:
            style_json_string = json.dumps(preset_json)
        except Exception as e:
            logger.error(f"Failed to serialize preset JSON: {str(e)}")
            raise Exception(f"Invalid preset JSON format: {str(e)}")

        # Inject components into the master prompt
        final_merger_prompt = merger_prompt_template.replace(
            "[USER_PROMPT]", user_prompt)
        final_merger_prompt = final_merger_prompt.replace(
            "[STYLE_JSON]", style_json_string)

        # Call Gemini
        logger.info("Calling Gemini API to generate master prompt")
        try:
            gemini_response = gemini_model.generate_content(
                final_merger_prompt)

            if not gemini_response or not gemini_response.text:
                logger.error("Gemini returned empty response")
                raise Exception("Gemini API returned empty response")

            master_prompt_string = clean_json_response(gemini_response.text)

            # Log preview of generated prompt (truncated)
            prompt_preview = master_prompt_string[:75] + '...' if len(
                master_prompt_string) > 75 else master_prompt_string
            logger.info(
                f"Gemini generated master prompt: \"{prompt_preview}\"")

            return master_prompt_string

        except Exception as e:
            logger.error(f"Gemini API call failed: {str(e)}", exc_info=True)
            raise Exception(f"Gemini API call failed: {str(e)}")

    except Exception as e:
        # Re-raise with context if not already wrapped
        if "Gemini" not in str(e):
            logger.error(f"Gemini translator error: {str(e)}")
            raise Exception(f"Gemini translator call failed: {e}")
        raise


def call_bria_with_structured_prompt(prompt_json_string: str, seed: int) -> dict:
    """Call Bria API directly with structured prompt JSON string (bypassing Gemini).

    This is the Pro Mode "Direct Line" - no translation, no Gemini.
    The structured_prompt has already been converted to a JSON string by the endpoint.

    Args:
        prompt_json_string: The structured prompt as a JSON string (from json.dumps())
        seed: Random seed for generation consistency

    Returns:
        dict with 'image_url' on success

    Raises:
        Exception: If Bria API call fails
    """
    try:
        logger.info("Pro Mode: Calling Bria API directly (bypassing Gemini)")
        logger.debug(
            f"Prompt JSON string length: {len(prompt_json_string)} characters")
        logger.debug(f"Seed: {seed}")

        # Build the Bria payload
        # CRITICAL: The "prompt" field contains the JSON string
        payload = {
            "prompt": prompt_json_string,
            "seed": seed
        }

        # Submit job to Bria (same API call as standard mode)
        logger.info("Submitting Pro Mode job to Bria API")
        response = requests.post(
            BRIA_API_ENDPOINT,
            json=payload,
            headers=BRIA_HEADERS,
            timeout=30
        )

        # Check response status
        if response.status_code != 202:
            error_detail = response.text[:200] if response.text else "No error details"
            logger.error(
                f"Bria API rejected Pro Mode request with status {response.status_code}: {error_detail}"
            )
            raise Exception(
                f"Bria API request failed with status code {response.status_code}"
            )

        response_data = response.json()
        request_id = response_data.get('request_id', 'unknown')
        status_url = response_data.get('status_url')

        if not status_url:
            logger.error("Bria API response missing status_url")
            raise Exception("Bria API response missing status_url")

        logger.info(f"Pro Mode: Bria job accepted. Request ID: {request_id}")

        # Poll for result (reuse existing polling logic)
        result = poll_for_result(status_url)

        if not result:
            logger.error("Pro Mode: Bria job completed but returned no result")
            raise Exception("Bria job failed to generate a final image")

        image_url = result.get('image_url')
        if not image_url:
            logger.error("Pro Mode: Bria result missing image_url")
            raise Exception("Bria result missing image_url")

        logger.info(
            f"Pro Mode: Bria successfully generated image: {image_url}")
        return result

    except requests.exceptions.Timeout:
        logger.error("Pro Mode: Bria API request timed out")
        raise Exception("Bria API request timed out after 30 seconds")
    except requests.exceptions.RequestException as e:
        logger.error(
            f"Pro Mode: Bria API request error: {str(e)}", exc_info=True)
        raise Exception(f"Bria API request failed: {str(e)}")
    except Exception as e:
        logger.error(f"Pro Mode: Bria call failed: {str(e)}", exc_info=True)
        raise


def call_bria_engine(master_prompt: str, image_base64: str = None) -> dict:
    """Call Bria API to generate final image.

    Args:
        master_prompt: Engineered prompt from Gemini
        image_base64: Optional base64-encoded reference image

    Returns:
        dict with 'image_url' on success

    Raises:
        Exception: If Bria API call fails
    """
    try:
        # Validate master prompt
        if not master_prompt or not master_prompt.strip():
            logger.error("Master prompt is empty")
            raise ValueError("Master prompt cannot be empty")

        # Build the Bria payload
        payload = {
            "prompt": master_prompt
        }

        # Add reference image if provided
        if image_base64:
            logger.info("Reference image provided, adding to Bria payload")
            payload["images"] = [image_base64]
        else:
            logger.info(
                "No reference image, proceeding with text-to-image generation")

        # Submit job to Bria
        logger.info("Submitting job to Bria API")
        try:
            response = requests.post(
                BRIA_API_ENDPOINT,
                json=payload,
                headers=BRIA_HEADERS,
                timeout=30
            )

            # Check response status
            if response.status_code != 202:
                error_detail = response.text[:200] if response.text else "No error details"
                logger.error(
                    f"Bria API rejected request with status {response.status_code}: {error_detail}"
                )
                raise Exception(
                    f"Bria API request failed with status code {response.status_code}"
                )

            response_data = response.json()
            request_id = response_data.get('request_id', 'unknown')
            status_url = response_data.get('status_url')

            if not status_url:
                logger.error("Bria API response missing status_url")
                raise Exception("Bria API response missing status_url")

            logger.info(f"Bria job accepted. Request ID: {request_id}")

            # Poll for result
            result = poll_for_result(status_url)

            if not result:
                logger.error("Bria job completed but returned no result")
                raise Exception("Bria job failed to generate a final image")

            image_url = result.get('image_url')
            if not image_url:
                logger.error("Bria result missing image_url")
                raise Exception("Bria result missing image_url")

            logger.info(f"Bria successfully generated image: {image_url}")
            return result

        except requests.exceptions.Timeout:
            logger.error("Bria API request timed out")
            raise Exception("Bria API request timed out after 30 seconds")

        except requests.exceptions.ConnectionError as e:
            logger.error(f"Failed to connect to Bria API: {str(e)}")
            raise Exception(f"Failed to connect to Bria API: {str(e)}")

        except requests.exceptions.RequestException as e:
            logger.error(f"Bria API request error: {str(e)}", exc_info=True)
            raise Exception(f"Bria API request failed: {str(e)}")

    except Exception as e:
        # Re-raise with context if not already wrapped
        if "Bria" not in str(e):
            logger.error(f"Bria engine error: {str(e)}")
            raise Exception(f"Bria engine call failed: {e}")
        raise


# --- MAIN WORKFLOW FUNCTION ---

def run_generation_workflow(
    user_prompt: str,
    preset_name: str,
    reference_image_base64: str = None
) -> dict:
    """Execute the full Gemini -> Bria workflow.

    Args:
        user_prompt: Simple description of the product (e.g., "a smartphone")
        preset_name: Filename of preset (e.g., "preset_bright_clean.json")
        reference_image_base64: Optional base64-encoded reference image

    Returns:
        {
            "success": bool,
            "final_image_url": str (if success),
            "error": str (if failure)
        }
    """
    workflow_start_time = time.time()

    try:
        # Validate inputs
        if not user_prompt or not user_prompt.strip():
            logger.warning("Workflow called with empty user_prompt")
            return {
                "success": False,
                "error": "user_prompt is required and cannot be empty"
            }

        if not preset_name or not preset_name.strip():
            logger.warning("Workflow called with empty preset_name")
            return {
                "success": False,
                "error": "preset_name is required and cannot be empty"
            }

        # Load preset file
        preset_path = os.path.join("presets", preset_name)
        if not os.path.exists(preset_path):
            logger.error(f"Preset file not found: {preset_path}")
            return {
                "success": False,
                "error": f"Preset file '{preset_name}' not found in presets/ directory"
            }

        logger.info("=" * 60)
        logger.info("STARTING WORKFLOW")
        logger.info(f"User Prompt: {user_prompt}")
        logger.info(f"Preset: {preset_name}")
        logger.info(
            f"Has reference image: {reference_image_base64 is not None}")
        logger.info("=" * 60)

        # Load and validate preset JSON
        try:
            with open(preset_path, 'r') as f:
                preset_json = json.load(f)
            logger.info(f"Successfully loaded preset from {preset_path}")
        except json.JSONDecodeError as e:
            logger.error(
                f"Invalid JSON in preset file {preset_name}: {str(e)}")
            return {
                "success": False,
                "error": f"Invalid JSON in preset file: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Failed to load preset file: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to load preset file: {str(e)}"
            }

        # CALL 1: Gemini Translator
        logger.info("-" * 60)
        logger.info("STAGE 1: GEMINI TRANSLATOR")
        logger.info("-" * 60)

        gemini_start_time = time.time()
        try:
            master_prompt = call_gemini_translator(user_prompt, preset_json)
            gemini_duration = time.time() - gemini_start_time
            logger.info(
                f"Gemini stage completed in {gemini_duration:.2f} seconds")
        except Exception as e:
            logger.error(f"Gemini stage failed: {str(e)}")
            raise

        # CALL 2: Bria Image Engine
        logger.info("-" * 60)
        logger.info("STAGE 2: BRIA IMAGE ENGINE")
        logger.info("-" * 60)

        bria_start_time = time.time()
        try:
            result = call_bria_engine(master_prompt, reference_image_base64)
            bria_duration = time.time() - bria_start_time
            logger.info(f"Bria stage completed in {bria_duration:.2f} seconds")
        except Exception as e:
            logger.error(f"Bria stage failed: {str(e)}")
            raise

        final_image_url = result.get('image_url')
        if not final_image_url:
            logger.error("Bria result missing image_url field")
            raise Exception("Bria result missing image_url")

        workflow_duration = time.time() - workflow_start_time

        logger.info("=" * 60)
        logger.info("WORKFLOW COMPLETED SUCCESSFULLY")
        logger.info(f"Total duration: {workflow_duration:.2f} seconds")
        logger.info(f"Final image URL: {final_image_url}")
        logger.info("=" * 60)

        return {
            "success": True,
            "final_image_url": final_image_url
        }

    except ValueError as ve:
        # Client errors (validation, bad input)
        workflow_duration = time.time() - workflow_start_time
        logger.error(
            f"Workflow validation error after {workflow_duration:.2f}s: {str(ve)}")
        return {
            "success": False,
            "error": str(ve)
        }

    except Exception as e:
        # Server errors (API failures, unexpected errors)
        workflow_duration = time.time() - workflow_start_time
        logger.error(
            f"Workflow failed after {workflow_duration:.2f}s: {str(e)}",
            exc_info=True
        )
        return {
            "success": False,
            "error": str(e)
        }
