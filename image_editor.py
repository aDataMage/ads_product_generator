"""
Image editing module for Bria API integration.

Provides functions for background manipulation, generative fill, enhancement, and canvas expansion.

This module integrates with Bria's Image Editing API to provide the following capabilities:
- Background removal, replacement, and blurring
- Generative fill with text prompts and masks
- Image quality enhancement
- Resolution upscaling (2x, 4x)
- Canvas expansion to different aspect ratios

All functions include comprehensive error handling and validation:
- Input validation for all parameters
- Type checking and range validation
- Network error handling with retries
- API response validation
- Consistent error response format

Error Handling:
    All functions return a dict with 'success' key:
    - On success: {'success': True, ...result data...}
    - On error: {'success': False, 'error': str}
    
    Exceptions are caught and logged, then converted to error responses.

Logging:
    All operations are logged to stderr with INFO level for normal operations
    and ERROR level for failures. This is compatible with MCP server requirements.

Example:
    >>> result = remove_background("https://example.com/image.jpg", sync=True)
    >>> if result['success']:
    ...     print(f"Result URL: {result['result_url']}")
    ... else:
    ...     print(f"Error: {result['error']}")
"""
import requests
import time
import logging
import sys
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
BRIA_EDIT_BASE_URL = "https://engine.prod.bria-api.com/v2/image/edit"
BRIA_HEADERS = {
    'api_token': BRIA_API_KEY,
    'Content-Type': 'application/json'
}

# API timeout settings
API_REQUEST_TIMEOUT = 30  # seconds for initial API request
DEFAULT_POLL_TIMEOUT = 60  # seconds for status polling
POLL_INTERVAL = 5  # seconds between status checks
MAX_CONSECUTIVE_ERRORS = 3  # max consecutive polling errors before abort

# --- VALIDATION HELPERS ---


def _validate_image_input(image_url_or_base64: str, param_name: str = "image") -> None:
    """Validate image input parameter.

    Args:
        image_url_or_base64: Image URL or base64-encoded image string
        param_name: Name of the parameter for error messages

    Raises:
        ValueError: If image input is invalid
    """
    if not image_url_or_base64:
        raise ValueError(f"{param_name} input cannot be empty")

    if not isinstance(image_url_or_base64, str):
        raise ValueError(
            f"{param_name} input must be a string (URL or base64), got {type(image_url_or_base64).__name__}")

    # Basic format validation
    if len(image_url_or_base64.strip()) == 0:
        raise ValueError(f"{param_name} input cannot be whitespace only")


def _validate_positive_integer(value: int, param_name: str, min_value: int = 1) -> None:
    """Validate that a parameter is a positive integer.

    Args:
        value: The value to validate
        param_name: Name of the parameter for error messages
        min_value: Minimum allowed value (default: 1)

    Raises:
        ValueError: If value is not a positive integer
    """
    if not isinstance(value, int):
        raise ValueError(
            f"{param_name} must be an integer, got {type(value).__name__}")

    if value < min_value:
        raise ValueError(
            f"{param_name} must be at least {min_value}, got {value}")


def _validate_range(value: int, param_name: str, min_value: int, max_value: int) -> None:
    """Validate that a parameter is within a specific range.

    Args:
        value: The value to validate
        param_name: Name of the parameter for error messages
        min_value: Minimum allowed value (inclusive)
        max_value: Maximum allowed value (inclusive)

    Raises:
        ValueError: If value is not in the valid range
    """
    if not isinstance(value, int):
        raise ValueError(
            f"{param_name} must be an integer, got {type(value).__name__}")

    if value < min_value or value > max_value:
        raise ValueError(
            f"{param_name} must be between {min_value} and {max_value}, got {value}")


def _validate_string_input(value: str, param_name: str, allow_empty: bool = False) -> None:
    """Validate string input parameter.

    Args:
        value: The string value to validate
        param_name: Name of the parameter for error messages
        allow_empty: Whether to allow empty strings (default: False)

    Raises:
        ValueError: If string input is invalid
    """
    if value is None:
        raise ValueError(f"{param_name} cannot be None")

    if not isinstance(value, str):
        raise ValueError(
            f"{param_name} must be a string, got {type(value).__name__}")

    if not allow_empty and len(value.strip()) == 0:
        raise ValueError(f"{param_name} cannot be empty")


def _make_api_request(endpoint: str, payload: dict, operation_name: str) -> dict:
    """Make a request to Bria API with comprehensive error handling.

    Args:
        endpoint: Full API endpoint URL
        payload: Request payload dictionary
        operation_name: Name of the operation for logging (e.g., "remove_background")

    Returns:
        dict with 'request_id' and 'status_url' keys

    Raises:
        ValueError: If API response is invalid
        Exception: If API request fails
    """
    logger.info(f"Submitting {operation_name} job to Bria API")

    try:
        response = requests.post(
            endpoint,
            json=payload,
            headers=BRIA_HEADERS,
            timeout=API_REQUEST_TIMEOUT
        )

        # Check response status
        if response.status_code != 202:
            error_detail = response.text[:200] if response.text else "No error details"
            logger.error(
                f"Bria API rejected {operation_name} request with status {response.status_code}: {error_detail}")

            # Try to parse error message from response
            try:
                error_json = response.json()
                error_msg = error_json.get(
                    'error', error_json.get('message', error_detail))
            except:
                error_msg = error_detail

            raise Exception(
                f"Bria API request failed with status code {response.status_code}: {error_msg}")

        response_data = response.json()
        request_id = response_data.get('request_id', 'unknown')
        status_url = response_data.get('status_url')

        if not status_url:
            logger.error(
                f"Bria API response for {operation_name} missing status_url")
            raise ValueError("Bria API response missing status_url")

        logger.info(
            f"Bria {operation_name} job accepted. Request ID: {request_id}")

        return {
            'request_id': request_id,
            'status_url': status_url
        }

    except requests.exceptions.Timeout:
        logger.error(f"Bria API request for {operation_name} timed out")
        raise Exception(
            f"Bria API request timed out after {API_REQUEST_TIMEOUT} seconds")

    except requests.exceptions.ConnectionError as e:
        logger.error(
            f"Failed to connect to Bria API for {operation_name}: {str(e)}")
        raise Exception(f"Failed to connect to Bria API: {str(e)}")

    except requests.exceptions.RequestException as e:
        logger.error(
            f"Bria API request error for {operation_name}: {str(e)}", exc_info=True)
        raise Exception(f"Bria API request failed: {str(e)}")


def _process_sync_result(result: dict, operation_name: str) -> str:
    """Process and validate synchronous operation result.

    Args:
        result: Result dictionary from poll_status
        operation_name: Name of the operation for error messages

    Returns:
        str: The result image URL

    Raises:
        Exception: If result is invalid or missing required fields
    """
    if not result:
        logger.error(
            f"Bria {operation_name} job completed but returned no result")
        raise Exception(
            f"{operation_name} operation failed - no result returned")

    result_url = result.get('image_url')
    if not result_url:
        logger.error(f"Bria {operation_name} result missing image_url")
        raise Exception(f"Bria result missing image_url")

    logger.info(f"{operation_name} completed successfully: {result_url}")
    return result_url


# --- SHARED UTILITIES ---


def poll_status(status_url: str, timeout: int = DEFAULT_POLL_TIMEOUT) -> dict:
    """Poll Bria's status URL until the job is COMPLETED or FAILED.

    Args:
        status_url: Bria status endpoint URL
        timeout: Maximum wait time in seconds (default: 60)

    Returns:
        dict with result data on success, None on failure

    Raises:
        ValueError: If status_url is invalid
        Exception: If polling exceeds timeout or encounters fatal errors
    """
    # Validate status URL
    if not status_url or not isinstance(status_url, str):
        raise ValueError("status_url must be a non-empty string")

    if not status_url.startswith('http'):
        raise ValueError(
            f"status_url must be a valid HTTP(S) URL, got: {status_url[:50]}")

    max_attempts = timeout // POLL_INTERVAL  # Poll every POLL_INTERVAL seconds
    attempt = 0
    consecutive_errors = 0

    logger.info(f"Starting to poll Bria status URL (timeout: {timeout}s)")

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
                return status_data.get('result')
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
            if consecutive_errors >= MAX_CONSECUTIVE_ERRORS:
                logger.error(
                    f"Too many consecutive polling errors ({consecutive_errors}), aborting")
                raise Exception(
                    f"Bria polling failed after {consecutive_errors} consecutive timeouts")
            time.sleep(POLL_INTERVAL)

        except requests.exceptions.RequestException as e:
            consecutive_errors += 1
            logger.warning(
                f"Polling error: {str(e)} (attempt {attempt}, consecutive errors: {consecutive_errors})")
            if consecutive_errors >= MAX_CONSECUTIVE_ERRORS:
                logger.error(
                    f"Too many consecutive polling errors ({consecutive_errors}), aborting")
                raise Exception(f"Bria polling failed: {str(e)}")
            time.sleep(POLL_INTERVAL)

        except Exception as e:
            logger.error(f"Unexpected polling error: {str(e)}", exc_info=True)
            raise Exception(f"Unexpected error during Bria polling: {str(e)}")

    logger.error(f"Bria polling exceeded timeout ({timeout}s)")
    raise Exception(f"Bria job polling timeout after {timeout} seconds")


# --- BACKGROUND MANIPULATION FUNCTIONS ---

def remove_background(image_url_or_base64: str, sync: bool = False) -> dict:
    """Remove background from an image using Bria API.

    Args:
        image_url_or_base64: Image URL or base64-encoded image string
        sync: If True, wait for result synchronously; if False, return immediately with status_url

    Returns:
        dict with result:
            - If sync=True: {'success': True, 'result_url': str, 'original_url': str}
            - If sync=False: {'success': True, 'status_url': str, 'request_id': str}
            - On error: {'success': False, 'error': str}

    Raises:
        ValueError: If image input is invalid
        Exception: If API call fails
    """
    try:
        # Validate input
        if not image_url_or_base64 or not isinstance(image_url_or_base64, str):
            logger.error("Invalid image input: must be non-empty string")
            raise ValueError(
                "Image input must be a non-empty string (URL or base64)")

        logger.info(f"Removing background from image (sync={sync})")

        # Build API endpoint
        endpoint = f"{BRIA_EDIT_BASE_URL}/remove_background"

        # Build payload
        payload = {
            "image": image_url_or_base64
        }

        # Submit job to Bria
        logger.info("Submitting remove_background job to Bria API")
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers=BRIA_HEADERS,
                timeout=30
            )

            # Check response status
            if response.status_code != 202:
                error_detail = response.text[:200] if response.text else "No error details"
                logger.error(
                    f"Bria API rejected request with status {response.status_code}: {error_detail}")
                raise Exception(
                    f"Bria API request failed with status code {response.status_code}")

            response_data = response.json()
            request_id = response_data.get('request_id', 'unknown')
            status_url = response_data.get('status_url')

            if not status_url:
                logger.error("Bria API response missing status_url")
                raise Exception("Bria API response missing status_url")

            logger.info(
                f"Bria remove_background job accepted. Request ID: {request_id}")

            # If async mode, return immediately with status URL
            if not sync:
                return {
                    'success': True,
                    'status_url': status_url,
                    'request_id': request_id
                }

            # If sync mode, poll for result
            result = poll_status(status_url)

            if not result:
                logger.error("Bria job completed but returned no result")
                raise Exception("Background removal failed")

            result_url = result.get('image_url')
            if not result_url:
                logger.error("Bria result missing image_url")
                raise Exception("Bria result missing image_url")

            logger.info(f"Background removed successfully: {result_url}")

            return {
                'success': True,
                'result_url': result_url,
                'original_url': image_url_or_base64 if image_url_or_base64.startswith('http') else None
            }

        except requests.exceptions.Timeout:
            logger.error("Bria API request timed out")
            raise Exception("Bria API request timed out after 30 seconds")

        except requests.exceptions.ConnectionError as e:
            logger.error(f"Failed to connect to Bria API: {str(e)}")
            raise Exception(f"Failed to connect to Bria API: {str(e)}")

        except requests.exceptions.RequestException as e:
            logger.error(f"Bria API request error: {str(e)}", exc_info=True)
            raise Exception(f"Bria API request failed: {str(e)}")

    except ValueError as ve:
        logger.error(f"Validation error in remove_background: {str(ve)}")
        return {
            'success': False,
            'error': str(ve)
        }

    except Exception as e:
        logger.error(f"Error in remove_background: {str(e)}", exc_info=True)
        return {
            'success': False,
            'error': str(e)
        }


def replace_background(image_url_or_base64: str, background_prompt: str = None,
                       background_color: str = None, sync: bool = False) -> dict:
    """Replace background of an image using Bria API.

    Args:
        image_url_or_base64: Image URL or base64-encoded image string
        background_prompt: Text description of desired background (e.g., "white studio background")
        background_color: Hex color code for solid background (e.g., "#FFFFFF"). 
                         This will be converted to a prompt format like "solid #FFFFFF background".
        sync: If True, wait for result synchronously; if False, return immediately with status_url

    Returns:
        dict with result:
            - If sync=True: {'success': True, 'result_url': str}
            - If sync=False: {'success': True, 'status_url': str, 'request_id': str}
            - On error: {'success': False, 'error': str}

    Raises:
        ValueError: If image input is invalid or both prompt and color are missing
        Exception: If API call fails
    """
    try:
        # Validate input
        if not image_url_or_base64 or not isinstance(image_url_or_base64, str):
            logger.error("Invalid image input: must be non-empty string")
            raise ValueError(
                "Image input must be a non-empty string (URL or base64)")

        if not background_prompt and not background_color:
            logger.error(
                "Must provide either background_prompt or background_color")
            raise ValueError(
                "Must provide either background_prompt or background_color")

        # Build the prompt - if color is provided, convert to prompt format
        if background_color and not background_prompt:
            prompt = f"solid {background_color} background"
            logger.info(
                f"Converting color {background_color} to prompt: {prompt}")
        else:
            prompt = background_prompt

        logger.info(
            f"Replacing background (prompt={prompt}, sync={sync})")

        # Build API endpoint
        endpoint = f"{BRIA_EDIT_BASE_URL}/replace_background"

        # Build payload
        payload = {
            "image": image_url_or_base64,
            "prompt": prompt
        }

        # Submit job to Bria
        logger.info("Submitting replace_background job to Bria API")
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers=BRIA_HEADERS,
                timeout=30
            )

            # Check response status
            if response.status_code != 202:
                error_detail = response.text[:200] if response.text else "No error details"
                logger.error(
                    f"Bria API rejected request with status {response.status_code}: {error_detail}")
                raise Exception(
                    f"Bria API request failed with status code {response.status_code}")

            response_data = response.json()
            request_id = response_data.get('request_id', 'unknown')
            status_url = response_data.get('status_url')

            if not status_url:
                logger.error("Bria API response missing status_url")
                raise Exception("Bria API response missing status_url")

            logger.info(
                f"Bria replace_background job accepted. Request ID: {request_id}")

            # If async mode, return immediately with status URL
            if not sync:
                return {
                    'success': True,
                    'status_url': status_url,
                    'request_id': request_id
                }

            # If sync mode, poll for result
            result = poll_status(status_url)

            if not result:
                logger.error("Bria job completed but returned no result")
                raise Exception("Background replacement failed")

            result_url = result.get('image_url')
            if not result_url:
                logger.error("Bria result missing image_url")
                raise Exception("Bria result missing image_url")

            logger.info(f"Background replaced successfully: {result_url}")

            return {
                'success': True,
                'result_url': result_url
            }

        except requests.exceptions.Timeout:
            logger.error("Bria API request timed out")
            raise Exception("Bria API request timed out after 30 seconds")

        except requests.exceptions.ConnectionError as e:
            logger.error(f"Failed to connect to Bria API: {str(e)}")
            raise Exception(f"Failed to connect to Bria API: {str(e)}")

        except requests.exceptions.RequestException as e:
            logger.error(f"Bria API request error: {str(e)}", exc_info=True)
            raise Exception(f"Bria API request failed: {str(e)}")

    except ValueError as ve:
        logger.error(f"Validation error in replace_background: {str(ve)}")
        return {
            'success': False,
            'error': str(ve)
        }

    except Exception as e:
        logger.error(f"Error in replace_background: {str(e)}", exc_info=True)
        return {
            'success': False,
            'error': str(e)
        }


def blur_background(image_url_or_base64: str, blur_strength: int, sync: bool = False) -> dict:
    """Blur the background of an image using Bria API.

    Args:
        image_url_or_base64: Image URL or base64-encoded image string
        blur_strength: Blur intensity (0-100, where 0 is no blur and 100 is maximum blur)
        sync: If True, wait for result synchronously; if False, return immediately with status_url

    Returns:
        dict with result:
            - If sync=True: {'success': True, 'result_url': str}
            - If sync=False: {'success': True, 'status_url': str, 'request_id': str}
            - On error: {'success': False, 'error': str}

    Raises:
        ValueError: If image input is invalid or blur_strength is out of range
        Exception: If API call fails
    """
    try:
        # Validate input
        if not image_url_or_base64 or not isinstance(image_url_or_base64, str):
            logger.error("Invalid image input: must be non-empty string")
            raise ValueError(
                "Image input must be a non-empty string (URL or base64)")

        if not isinstance(blur_strength, int) or blur_strength < 0 or blur_strength > 100:
            logger.error(
                f"Invalid blur_strength: {blur_strength}. Must be integer between 0-100")
            raise ValueError(
                "blur_strength must be an integer between 0 and 100")

        logger.info(
            f"Blurring background (strength={blur_strength}, sync={sync})")

        # Build API endpoint
        endpoint = f"{BRIA_EDIT_BASE_URL}/blur_background"

        # Build payload
        payload = {
            "image": image_url_or_base64,
            "blur_strength": blur_strength
        }

        # Submit job to Bria
        logger.info("Submitting blur_background job to Bria API")
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers=BRIA_HEADERS,
                timeout=30
            )

            # Check response status
            if response.status_code != 202:
                error_detail = response.text[:200] if response.text else "No error details"
                logger.error(
                    f"Bria API rejected request with status {response.status_code}: {error_detail}")
                raise Exception(
                    f"Bria API request failed with status code {response.status_code}")

            response_data = response.json()
            request_id = response_data.get('request_id', 'unknown')
            status_url = response_data.get('status_url')

            if not status_url:
                logger.error("Bria API response missing status_url")
                raise Exception("Bria API response missing status_url")

            logger.info(
                f"Bria blur_background job accepted. Request ID: {request_id}")

            # If async mode, return immediately with status URL
            if not sync:
                return {
                    'success': True,
                    'status_url': status_url,
                    'request_id': request_id
                }

            # If sync mode, poll for result
            result = poll_status(status_url)

            if not result:
                logger.error("Bria job completed but returned no result")
                raise Exception("Background blur failed")

            result_url = result.get('image_url')
            if not result_url:
                logger.error("Bria result missing image_url")
                raise Exception("Bria result missing image_url")

            logger.info(f"Background blurred successfully: {result_url}")

            return {
                'success': True,
                'result_url': result_url
            }

        except requests.exceptions.Timeout:
            logger.error("Bria API request timed out")
            raise Exception("Bria API request timed out after 30 seconds")

        except requests.exceptions.ConnectionError as e:
            logger.error(f"Failed to connect to Bria API: {str(e)}")
            raise Exception(f"Failed to connect to Bria API: {str(e)}")

        except requests.exceptions.RequestException as e:
            logger.error(f"Bria API request error: {str(e)}", exc_info=True)
            raise Exception(f"Bria API request failed: {str(e)}")

    except ValueError as ve:
        logger.error(f"Validation error in blur_background: {str(ve)}")
        return {
            'success': False,
            'error': str(ve)
        }

    except Exception as e:
        logger.error(f"Error in blur_background: {str(e)}", exc_info=True)
        return {
            'success': False,
            'error': str(e)
        }


# --- GENERATIVE EDITING FUNCTIONS ---

def generative_fill(image_url_or_base64: str, mask: str, prompt: str,
                    negative_prompt: str = None, version: int = 2, sync: bool = False) -> dict:
    """Fill masked regions of an image using generative AI based on text prompts.

    Args:
        image_url_or_base64: Image URL or base64-encoded image string
        mask: Mask image URL or base64-encoded mask string (white areas will be filled)
        prompt: Text description of what to generate in the masked area
        negative_prompt: Optional text description of what to avoid in generation
        version: API version to use (1 or 2, default: 2). Version 2 returns refined_prompt.
        sync: If True, wait for result synchronously; if False, return immediately with status_url

    Returns:
        dict with result:
            - If sync=True: {'success': True, 'result_url': str, 'refined_prompt': str (v2 only)}
            - If sync=False: {'success': True, 'status_url': str, 'request_id': str}
            - On error: {'success': False, 'error': str}

    Raises:
        ValueError: If image, mask, or prompt is invalid, or version is not 1 or 2
        Exception: If API call fails
    """
    try:
        # Validate input
        if not image_url_or_base64 or not isinstance(image_url_or_base64, str):
            logger.error("Invalid image input: must be non-empty string")
            raise ValueError(
                "Image input must be a non-empty string (URL or base64)")

        if not mask or not isinstance(mask, str):
            logger.error("Invalid mask input: must be non-empty string")
            raise ValueError(
                "Mask input must be a non-empty string (URL or base64)")

        if not prompt or not isinstance(prompt, str):
            logger.error("Invalid prompt: must be non-empty string")
            raise ValueError("Prompt must be a non-empty string")

        if version not in [1, 2]:
            logger.error(f"Invalid version: {version}. Must be 1 or 2")
            raise ValueError("Version must be 1 or 2")

        logger.info(
            f"Generative fill (prompt='{prompt[:50]}...', version={version}, sync={sync})")

        # Build API endpoint
        endpoint = f"{BRIA_EDIT_BASE_URL}/gen_fill"

        # Build payload
        payload = {
            "image": image_url_or_base64,
            "mask": mask,
            "prompt": prompt,
            "version": version
        }

        # Add negative prompt if provided
        if negative_prompt:
            payload["negative_prompt"] = negative_prompt
            logger.info(f"Using negative prompt: '{negative_prompt[:50]}...'")

        # Submit job to Bria
        logger.info("Submitting generative_fill job to Bria API")
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers=BRIA_HEADERS,
                timeout=30
            )

            # Check response status
            if response.status_code != 202:
                error_detail = response.text[:200] if response.text else "No error details"
                logger.error(
                    f"Bria API rejected request with status {response.status_code}: {error_detail}")
                raise Exception(
                    f"Bria API request failed with status code {response.status_code}")

            response_data = response.json()
            request_id = response_data.get('request_id', 'unknown')
            status_url = response_data.get('status_url')

            if not status_url:
                logger.error("Bria API response missing status_url")
                raise Exception("Bria API response missing status_url")

            logger.info(
                f"Bria generative_fill job accepted. Request ID: {request_id}")

            # If async mode, return immediately with status URL
            if not sync:
                return {
                    'success': True,
                    'status_url': status_url,
                    'request_id': request_id
                }

            # If sync mode, poll for result
            result = poll_status(status_url)

            if not result:
                logger.error("Bria job completed but returned no result")
                raise Exception("Generative fill failed")

            result_url = result.get('image_url')
            if not result_url:
                logger.error("Bria result missing image_url")
                raise Exception("Bria result missing image_url")

            logger.info(
                f"Generative fill completed successfully: {result_url}")

            # Build response
            response_dict = {
                'success': True,
                'result_url': result_url
            }

            # Add refined_prompt if version 2 and available
            if version == 2 and 'refined_prompt' in result:
                response_dict['refined_prompt'] = result['refined_prompt']
                logger.info(
                    f"Refined prompt (v2): '{result['refined_prompt'][:50]}...'")

            return response_dict

        except requests.exceptions.Timeout:
            logger.error("Bria API request timed out")
            raise Exception("Bria API request timed out after 30 seconds")

        except requests.exceptions.ConnectionError as e:
            logger.error(f"Failed to connect to Bria API: {str(e)}")
            raise Exception(f"Failed to connect to Bria API: {str(e)}")

        except requests.exceptions.RequestException as e:
            logger.error(f"Bria API request error: {str(e)}", exc_info=True)
            raise Exception(f"Bria API request failed: {str(e)}")

    except ValueError as ve:
        logger.error(f"Validation error in generative_fill: {str(ve)}")
        return {
            'success': False,
            'error': str(ve)
        }

    except Exception as e:
        logger.error(f"Error in generative_fill: {str(e)}", exc_info=True)
        return {
            'success': False,
            'error': str(e)
        }


# --- CANVAS EXPANSION FUNCTIONS ---

def expand_image(image_url_or_base64: str, target_width: int, target_height: int,
                 prompt: str = None, sync: bool = False) -> dict:
    """Expand the canvas of an image to new dimensions using generative AI.

    Args:
        image_url_or_base64: Image URL or base64-encoded image string
        target_width: Desired width of the expanded canvas in pixels
        target_height: Desired height of the expanded canvas in pixels
        prompt: Optional text description to guide the expansion content
        sync: If True, wait for result synchronously; if False, return immediately with status_url

    Returns:
        dict with result:
            - If sync=True: {'success': True, 'result_url': str}
            - If sync=False: {'success': True, 'status_url': str, 'request_id': str}
            - On error: {'success': False, 'error': str}

    Raises:
        ValueError: If image input is invalid or dimensions are invalid
        Exception: If API call fails
    """
    try:
        # Validate input
        if not image_url_or_base64 or not isinstance(image_url_or_base64, str):
            logger.error("Invalid image input: must be non-empty string")
            raise ValueError(
                "Image input must be a non-empty string (URL or base64)")

        if not isinstance(target_width, int) or target_width <= 0:
            logger.error(
                f"Invalid target_width: {target_width}. Must be positive integer")
            raise ValueError("target_width must be a positive integer")

        if not isinstance(target_height, int) or target_height <= 0:
            logger.error(
                f"Invalid target_height: {target_height}. Must be positive integer")
            raise ValueError("target_height must be a positive integer")

        logger.info(
            f"Expanding image to {target_width}x{target_height} (prompt={prompt}, sync={sync})")

        # Build API endpoint
        endpoint = f"{BRIA_EDIT_BASE_URL}/expand"

        # Build payload
        payload = {
            "image": image_url_or_base64,
            "target_width": target_width,
            "target_height": target_height
        }

        # Add prompt if provided
        if prompt:
            payload["prompt"] = prompt
            logger.info(f"Using expansion prompt: '{prompt[:50]}...'")

        # Submit job to Bria
        logger.info("Submitting expand_image job to Bria API")
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers=BRIA_HEADERS,
                timeout=30
            )

            # Check response status
            if response.status_code != 202:
                error_detail = response.text[:200] if response.text else "No error details"
                logger.error(
                    f"Bria API rejected request with status {response.status_code}: {error_detail}")
                raise Exception(
                    f"Bria API request failed with status code {response.status_code}")

            response_data = response.json()
            request_id = response_data.get('request_id', 'unknown')
            status_url = response_data.get('status_url')

            if not status_url:
                logger.error("Bria API response missing status_url")
                raise Exception("Bria API response missing status_url")

            logger.info(
                f"Bria expand_image job accepted. Request ID: {request_id}")

            # If async mode, return immediately with status URL
            if not sync:
                return {
                    'success': True,
                    'status_url': status_url,
                    'request_id': request_id
                }

            # If sync mode, poll for result
            result = poll_status(status_url)

            if not result:
                logger.error("Bria job completed but returned no result")
                raise Exception("Image expansion failed")

            result_url = result.get('image_url')
            if not result_url:
                logger.error("Bria result missing image_url")
                raise Exception("Bria result missing image_url")

            logger.info(f"Image expanded successfully: {result_url}")

            return {
                'success': True,
                'result_url': result_url
            }

        except requests.exceptions.Timeout:
            logger.error("Bria API request timed out")
            raise Exception("Bria API request timed out after 30 seconds")

        except requests.exceptions.ConnectionError as e:
            logger.error(f"Failed to connect to Bria API: {str(e)}")
            raise Exception(f"Failed to connect to Bria API: {str(e)}")

        except requests.exceptions.RequestException as e:
            logger.error(f"Bria API request error: {str(e)}", exc_info=True)
            raise Exception(f"Bria API request failed: {str(e)}")

    except ValueError as ve:
        logger.error(f"Validation error in expand_image: {str(ve)}")
        return {
            'success': False,
            'error': str(ve)
        }

    except Exception as e:
        logger.error(f"Error in expand_image: {str(e)}", exc_info=True)
        return {
            'success': False,
            'error': str(e)
        }


# --- IMAGE ENHANCEMENT FUNCTIONS ---

def enhance_image(image_url_or_base64: str, sync: bool = False) -> dict:
    """Enhance image quality (brightness, contrast, sharpness) using Bria API.

    Args:
        image_url_or_base64: Image URL or base64-encoded image string
        sync: If True, wait for result synchronously; if False, return immediately with status_url

    Returns:
        dict with result:
            - If sync=True: {'success': True, 'result_url': str, 'file_size_bytes': int (optional)}
            - If sync=False: {'success': True, 'status_url': str, 'request_id': str}
            - On error: {'success': False, 'error': str}

    Raises:
        ValueError: If image input is invalid
        Exception: If API call fails
    """
    try:
        # Validate input
        if not image_url_or_base64 or not isinstance(image_url_or_base64, str):
            logger.error("Invalid image input: must be non-empty string")
            raise ValueError(
                "Image input must be a non-empty string (URL or base64)")

        logger.info(f"Enhancing image quality (sync={sync})")

        # Build API endpoint
        endpoint = f"{BRIA_EDIT_BASE_URL}/enhance"

        # Build payload
        payload = {
            "image": image_url_or_base64
        }

        # Submit job to Bria
        logger.info("Submitting enhance_image job to Bria API")
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers=BRIA_HEADERS,
                timeout=30
            )

            # Check response status
            if response.status_code != 202:
                error_detail = response.text[:200] if response.text else "No error details"
                logger.error(
                    f"Bria API rejected request with status {response.status_code}: {error_detail}")
                raise Exception(
                    f"Bria API request failed with status code {response.status_code}")

            response_data = response.json()
            request_id = response_data.get('request_id', 'unknown')
            status_url = response_data.get('status_url')

            if not status_url:
                logger.error("Bria API response missing status_url")
                raise Exception("Bria API response missing status_url")

            logger.info(
                f"Bria enhance_image job accepted. Request ID: {request_id}")

            # If async mode, return immediately with status URL
            if not sync:
                return {
                    'success': True,
                    'status_url': status_url,
                    'request_id': request_id
                }

            # If sync mode, poll for result
            result = poll_status(status_url)

            if not result:
                logger.error("Bria job completed but returned no result")
                raise Exception("Image enhancement failed")

            result_url = result.get('image_url')
            if not result_url:
                logger.error("Bria result missing image_url")
                raise Exception("Bria result missing image_url")

            logger.info(f"Image enhanced successfully: {result_url}")

            # Try to get file size from result
            response_dict = {
                'success': True,
                'result_url': result_url
            }

            # Attempt to fetch file size via HEAD request
            try:
                head_response = requests.head(result_url, timeout=5)
                if head_response.status_code == 200:
                    content_length = head_response.headers.get(
                        'Content-Length')
                    if content_length:
                        file_size_bytes = int(content_length)
                        response_dict['file_size_bytes'] = file_size_bytes
                        # Log file size in MB for readability
                        file_size_mb = file_size_bytes / (1024 * 1024)
                        logger.info(
                            f"Enhanced image file size: {file_size_mb:.2f} MB")
            except Exception as size_error:
                # Don't fail the request if we can't get file size
                logger.warning(
                    f"Could not determine file size: {str(size_error)}")

            return response_dict

        except requests.exceptions.Timeout:
            logger.error("Bria API request timed out")
            raise Exception("Bria API request timed out after 30 seconds")

        except requests.exceptions.ConnectionError as e:
            logger.error(f"Failed to connect to Bria API: {str(e)}")
            raise Exception(f"Failed to connect to Bria API: {str(e)}")

        except requests.exceptions.RequestException as e:
            logger.error(f"Bria API request error: {str(e)}", exc_info=True)
            raise Exception(f"Bria API request failed: {str(e)}")

    except ValueError as ve:
        logger.error(f"Validation error in enhance_image: {str(ve)}")
        return {
            'success': False,
            'error': str(ve)
        }

    except Exception as e:
        logger.error(f"Error in enhance_image: {str(e)}", exc_info=True)
        return {
            'success': False,
            'error': str(e)
        }


def increase_resolution(image_url_or_base64: str, scale_factor: int = 2, sync: bool = False) -> dict:
    """Increase the resolution of an image using Bria API upscaling.

    Args:
        image_url_or_base64: Image URL or base64-encoded image string
        scale_factor: Upscaling factor (2 or 4, default: 2). 2x doubles dimensions, 4x quadruples them.
        sync: If True, wait for result synchronously; if False, return immediately with status_url

    Returns:
        dict with result:
            - If sync=True: {'success': True, 'result_url': str, 'file_size_bytes': int (optional)}
            - If sync=False: {'success': True, 'status_url': str, 'request_id': str}
            - On error: {'success': False, 'error': str}

    Raises:
        ValueError: If image input is invalid or scale_factor is not 2 or 4
        Exception: If API call fails
    """
    try:
        # Validate input
        if not image_url_or_base64 or not isinstance(image_url_or_base64, str):
            logger.error("Invalid image input: must be non-empty string")
            raise ValueError(
                "Image input must be a non-empty string (URL or base64)")

        if scale_factor not in [2, 4]:
            logger.error(
                f"Invalid scale_factor: {scale_factor}. Must be 2 or 4")
            raise ValueError("scale_factor must be 2 or 4")

        logger.info(
            f"Increasing resolution by {scale_factor}x (sync={sync})")

        # Build API endpoint
        endpoint = f"{BRIA_EDIT_BASE_URL}/increase_resolution"

        # Build payload
        payload = {
            "image": image_url_or_base64,
            "scale_factor": scale_factor
        }

        # Submit job to Bria
        logger.info("Submitting increase_resolution job to Bria API")
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers=BRIA_HEADERS,
                timeout=30
            )

            # Check response status
            if response.status_code != 202:
                error_detail = response.text[:200] if response.text else "No error details"
                logger.error(
                    f"Bria API rejected request with status {response.status_code}: {error_detail}")
                raise Exception(
                    f"Bria API request failed with status code {response.status_code}")

            response_data = response.json()
            request_id = response_data.get('request_id', 'unknown')
            status_url = response_data.get('status_url')

            if not status_url:
                logger.error("Bria API response missing status_url")
                raise Exception("Bria API response missing status_url")

            logger.info(
                f"Bria increase_resolution job accepted. Request ID: {request_id}")

            # If async mode, return immediately with status URL
            if not sync:
                return {
                    'success': True,
                    'status_url': status_url,
                    'request_id': request_id
                }

            # If sync mode, poll for result
            result = poll_status(status_url)

            if not result:
                logger.error("Bria job completed but returned no result")
                raise Exception("Resolution increase failed")

            result_url = result.get('image_url')
            if not result_url:
                logger.error("Bria result missing image_url")
                raise Exception("Bria result missing image_url")

            logger.info(
                f"Resolution increased successfully ({scale_factor}x): {result_url}")

            # Try to get file size from result
            response_dict = {
                'success': True,
                'result_url': result_url
            }

            # Attempt to fetch file size via HEAD request
            try:
                head_response = requests.head(result_url, timeout=5)
                if head_response.status_code == 200:
                    content_length = head_response.headers.get(
                        'Content-Length')
                    if content_length:
                        file_size_bytes = int(content_length)
                        response_dict['file_size_bytes'] = file_size_bytes
                        # Log file size in MB for readability
                        file_size_mb = file_size_bytes / (1024 * 1024)
                        logger.info(
                            f"Upscaled image file size: {file_size_mb:.2f} MB")
            except Exception as size_error:
                # Don't fail the request if we can't get file size
                logger.warning(
                    f"Could not determine file size: {str(size_error)}")

            return response_dict

        except requests.exceptions.Timeout:
            logger.error("Bria API request timed out")
            raise Exception("Bria API request timed out after 30 seconds")

        except requests.exceptions.ConnectionError as e:
            logger.error(f"Failed to connect to Bria API: {str(e)}")
            raise Exception(f"Failed to connect to Bria API: {str(e)}")

        except requests.exceptions.RequestException as e:
            logger.error(f"Bria API request error: {str(e)}", exc_info=True)
            raise Exception(f"Bria API request failed: {str(e)}")

    except ValueError as ve:
        logger.error(f"Validation error in increase_resolution: {str(ve)}")
        return {
            'success': False,
            'error': str(ve)
        }

    except Exception as e:
        logger.error(
            f"Error in increase_resolution: {str(e)}", exc_info=True)
        return {
            'success': False,
            'error': str(e)
        }
