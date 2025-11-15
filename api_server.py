"""Flask API Server for AI Product Image Generation.

This module provides a REST API that exposes the 2-stage image generation
workflow (Gemini -> Bria) through HTTP endpoints.
"""

import os
import sys
import logging
import re
import argparse
import json
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from workflow import run_generation_workflow, call_bria_with_structured_prompt


def sanitize_log_message(message):
    """Remove potential API keys from log messages.

    Args:
        message (str): Log message to sanitize

    Returns:
        str: Sanitized message with API keys redacted
    """
    # Pattern to match common API key formats
    patterns = [
        (r'api_token["\']?\s*:\s*["\']?([A-Za-z0-9_\-]{20,})["\']?',
         'api_token: [REDACTED]'),
        (r'api_key["\']?\s*:\s*["\']?([A-Za-z0-9_\-]{20,})["\']?',
         'api_key: [REDACTED]'),
        (r'GOOGLE_API_KEY["\']?\s*:\s*["\']?([A-Za-z0-9_\-]{20,})["\']?',
         'GOOGLE_API_KEY: [REDACTED]'),
        (r'BRIA_API_KEY["\']?\s*:\s*["\']?([A-Za-z0-9_\-]{20,})["\']?',
         'BRIA_API_KEY: [REDACTED]'),
    ]

    sanitized = str(message)
    for pattern, replacement in patterns:
        sanitized = re.sub(pattern, replacement,
                           sanitized, flags=re.IGNORECASE)

    return sanitized


def setup_logging(app):
    """Configure Flask application logging.

    Args:
        app (Flask): Flask application instance
    """
    # Create a custom formatter that sanitizes API keys
    class SanitizingFormatter(logging.Formatter):
        def format(self, record):
            # Sanitize the message before formatting
            record.msg = sanitize_log_message(record.msg)
            if record.args:
                record.args = tuple(sanitize_log_message(str(arg))
                                    for arg in record.args)
            return super().format(record)

    # Configure logging to stderr (consistent with MCP server)
    handler = logging.StreamHandler(sys.stderr)
    handler.setLevel(logging.INFO)

    # Set format with timestamp
    formatter = SanitizingFormatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    handler.setFormatter(formatter)

    # Configure Flask's logger
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)

    # Disable default Flask logger to avoid duplicate logs
    app.logger.propagate = False

    return app.logger


def create_app():
    """Initialize and configure Flask application with CORS.

    Returns:
        Flask: Configured Flask application instance
    """
    app = Flask(__name__)

    # Configure CORS to allow requests from React development servers
    # This applies to ALL routes including:
    # - /api/generate (standard mode)
    # - /api/generate/pro (Pro Mode)
    # Automatically handles preflight OPTIONS requests
    CORS(app, origins=["http://localhost:3000",
         "http://localhost:5173", "http://localhost:5174"])

    # Basic Flask configuration
    app.config['DEBUG'] = os.environ.get('FLASK_ENV') != 'production'
    app.config['JSON_SORT_KEYS'] = False

    # Set up logging
    setup_logging(app)

    return app


def validate_request(data):
    """Validate request body contains required fields.

    Args:
        data (dict): Request body data

    Returns:
        tuple: (is_valid, error_message)
            - is_valid (bool): True if validation passes
            - error_message (str): Error description if validation fails, None otherwise
    """
    # Check if data is a dictionary
    if not isinstance(data, dict):
        return False, "Request body must be a JSON object"

    # Validate user_prompt field
    if 'user_prompt' not in data:
        return False, "Missing required field: user_prompt"

    if not isinstance(data['user_prompt'], str) or not data['user_prompt'].strip():
        return False, "Field 'user_prompt' must be a non-empty string"

    # Validate preset_name field
    if 'preset_name' not in data:
        return False, "Missing required field: preset_name"

    if not isinstance(data['preset_name'], str) or not data['preset_name'].strip():
        return False, "Field 'preset_name' must be a non-empty string"

    # Validate preset_name corresponds to an existing file
    preset_path = Path('presets') / data['preset_name']
    if not preset_path.exists() or not preset_path.is_file():
        return False, f"Preset file '{data['preset_name']}' not found in presets directory"

    # Validate optional reference_image_base64 if provided
    if 'reference_image_base64' in data:
        if not isinstance(data['reference_image_base64'], str):
            return False, "Field 'reference_image_base64' must be a string"

    return True, None


def validate_pro_mode_request(data):
    """Validate Pro Mode request body contains all required structured prompt fields.

    Args:
        data (dict): Request body data containing structured_prompt and seed

    Returns:
        tuple: (is_valid, error_message)
            - is_valid (bool): True if validation passes
            - error_message (str): Error description if validation fails, None otherwise
    """
    # Check if data is a dictionary
    if not isinstance(data, dict):
        return False, "Request body must be a JSON object"

    # Validate presence of structured_prompt field
    if 'structured_prompt' not in data:
        return False, "Missing required field: structured_prompt"

    if not isinstance(data['structured_prompt'], dict):
        return False, "Field 'structured_prompt' must be an object"

    # Validate presence of seed field
    if 'seed' not in data:
        return False, "Missing required field: seed"

    if not isinstance(data['seed'], int):
        return False, "Field 'seed' must be an integer"

    sp = data['structured_prompt']

    # Validate all top-level string fields
    required_fields = ['short_description', 'background_setting', 'style_medium',
                       'artistic_style', 'context']
    for field in required_fields:
        if field not in sp or not isinstance(sp[field], str) or not sp[field].strip():
            return False, f"Missing or invalid field: {field}"

    # Validate lighting nested object
    if 'lighting' not in sp or not isinstance(sp['lighting'], dict):
        return False, "Missing or invalid field: lighting"

    lighting_fields = ['conditions', 'direction', 'shadows']
    for field in lighting_fields:
        if field not in sp['lighting'] or not isinstance(sp['lighting'][field], str):
            return False, f"Missing or invalid field: lighting.{field}"

    # Validate aesthetics nested object
    if 'aesthetics' not in sp or not isinstance(sp['aesthetics'], dict):
        return False, "Missing or invalid field: aesthetics"

    aesthetics_fields = ['composition', 'color_scheme', 'mood_atmosphere']
    for field in aesthetics_fields:
        if field not in sp['aesthetics'] or not isinstance(sp['aesthetics'][field], str):
            return False, f"Missing or invalid field: aesthetics.{field}"

    # Validate photographic_characteristics nested object
    if 'photographic_characteristics' not in sp or not isinstance(sp['photographic_characteristics'], dict):
        return False, "Missing or invalid field: photographic_characteristics"

    camera_fields = ['camera_angle',
                     'lens_focal_length', 'depth_of_field', 'focus']
    for field in camera_fields:
        if field not in sp['photographic_characteristics'] or not isinstance(sp['photographic_characteristics'][field], str):
            return False, f"Missing or invalid field: photographic_characteristics.{field}"

    # Validate objects array
    if 'objects' not in sp or not isinstance(sp['objects'], list):
        return False, "Missing or invalid field: objects (must be a list)"

    # Validate each object in array
    object_fields = ['description', 'location', 'relationship', 'relative_size',
                     'shape_and_color', 'texture', 'appearance_details']
    for i, obj in enumerate(sp['objects']):
        if not isinstance(obj, dict):
            return False, f"Object at index {i} must be a dict"
        for field in object_fields:
            if field not in obj or not isinstance(obj[field], str):
                return False, f"Missing or invalid field in object {i}: {field}"

    return True, None


# Create Flask app instance
app = create_app()


@app.route('/api/generate', methods=['POST'])
def generate_image():
    """Handle POST requests to generate styled product images.

    Request Body:
        {
            "user_prompt": str,              # Required: Simple product description
            "preset_name": str,              # Required: Preset filename
            "reference_image_base64": str    # Optional: Base64-encoded image
        }

    Returns:
        Success (200): {"success": true, "final_image_url": "..."}
        Error (400/500): {"success": false, "error": "..."}
    """
    request_id = id(request)  # Simple request ID for tracking

    try:
        # Log incoming request
        app.logger.info(
            f"[Request {request_id}] Received POST /api/generate from {request.remote_addr}")

        # Parse incoming JSON request body
        try:
            data = request.get_json()
            if data is None:
                app.logger.warning(
                    f"[Request {request_id}] Empty or invalid JSON body received")
                return jsonify({
                    "success": False,
                    "error": "Request body must contain valid JSON"
                }), 400
        except Exception as e:
            app.logger.error(
                f"[Request {request_id}] JSON parsing error: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Invalid JSON body: {str(e)}"
            }), 400

        # Validate request data
        is_valid, error_message = validate_request(data)
        if not is_valid:
            app.logger.warning(
                f"[Request {request_id}] Validation failed: {error_message}")
            return jsonify({
                "success": False,
                "error": error_message
            }), 400

        # Extract parameters from request
        user_prompt = data['user_prompt']
        preset_name = data['preset_name']
        reference_image_base64 = data.get('reference_image_base64')
        has_reference_image = reference_image_base64 is not None

        # Log request details (truncate prompt for readability)
        prompt_preview = user_prompt[:50] + \
            '...' if len(user_prompt) > 50 else user_prompt
        app.logger.info(
            f"[Request {request_id}] Parameters - Prompt: '{prompt_preview}', "
            f"Preset: {preset_name}, Has reference image: {has_reference_image}"
        )

        # Execute workflow
        app.logger.info(f"[Request {request_id}] Starting workflow execution")
        try:
            result = run_generation_workflow(
                user_prompt=user_prompt,
                preset_name=preset_name,
                reference_image_base64=reference_image_base64
            )
        except ValueError as ve:
            # Client error (e.g., invalid base64, bad preset)
            app.logger.error(
                f"[Request {request_id}] Workflow validation error: {str(ve)}")
            return jsonify({
                "success": False,
                "error": str(ve)
            }), 400
        except Exception as we:
            # Server error (e.g., API failures)
            app.logger.error(
                f"[Request {request_id}] Workflow execution error: {str(we)}", exc_info=True)
            return jsonify({
                "success": False,
                "error": f"Workflow execution failed: {str(we)}"
            }), 500

        # Format and return response
        if result["success"]:
            app.logger.info(
                f"[Request {request_id}] Workflow completed successfully. "
                f"Image URL: {result.get('final_image_url', 'N/A')}"
            )
            return jsonify(result), 200
        else:
            # Workflow failed - return 500 for server errors
            error_msg = result.get('error', 'Unknown error')
            app.logger.error(
                f"[Request {request_id}] Workflow failed: {error_msg}")
            return jsonify(result), 500

    except Exception as e:
        # Unexpected server error
        app.logger.error(
            f"[Request {request_id}] Unexpected error in generate_image endpoint: {str(e)}",
            exc_info=True
        )
        return jsonify({
            "success": False,
            "error": "Internal server error occurred"
        }), 500


@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    """Handle POST requests to analyze an image and generate structured prompt.

    Request Body:
        {
            "image_base64": str  # Required: Base64-encoded image
        }

    Returns:
        Success (200): {"success": true, "structured_prompt": {...}}
        Error (400/500): {"success": false, "error": "..."}
    """
    request_id = id(request)

    try:
        # Log incoming request
        app.logger.info(
            f"[Request {request_id}] Received POST /api/analyze-image from {request.remote_addr}")

        # Parse incoming JSON request body
        try:
            data = request.get_json()
            if data is None:
                app.logger.warning(
                    f"[Request {request_id}] Empty or invalid JSON body received")
                return jsonify({
                    "success": False,
                    "error": "Request body must contain valid JSON"
                }), 400
        except Exception as e:
            app.logger.error(
                f"[Request {request_id}] JSON parsing error: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Invalid JSON body: {str(e)}"
            }), 400

        # Validate image_base64 field
        if 'image_base64' not in data:
            app.logger.warning(
                f"[Request {request_id}] Missing required field: image_base64")
            return jsonify({
                "success": False,
                "error": "Missing required field: image_base64"
            }), 400

        if not isinstance(data['image_base64'], str) or not data['image_base64'].strip():
            app.logger.warning(
                f"[Request {request_id}] Invalid image_base64 field")
            return jsonify({
                "success": False,
                "error": "Field 'image_base64' must be a non-empty string"
            }), 400

        image_base64 = data['image_base64']

        app.logger.info(
            f"[Request {request_id}] Analyzing image ({len(image_base64)} chars)")

        # Import and call image analyzer
        try:
            from image_analyzer import analyze_image_to_structured_prompt
            structured_prompt = analyze_image_to_structured_prompt(
                image_base64)
        except Exception as analysis_error:
            app.logger.error(
                f"[Request {request_id}] Image analysis failed: {str(analysis_error)}",
                exc_info=True
            )
            return jsonify({
                "success": False,
                "error": f"Image analysis failed: {str(analysis_error)}"
            }), 500

        app.logger.info(
            f"[Request {request_id}] Image analysis completed successfully")

        return jsonify({
            "success": True,
            "structured_prompt": structured_prompt
        }), 200

    except Exception as e:
        # Unexpected server error
        app.logger.error(
            f"[Request {request_id}] Unexpected error in analyze_image endpoint: {str(e)}",
            exc_info=True
        )
        return jsonify({
            "success": False,
            "error": "Internal server error occurred"
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring server status.

    Returns:
        Success (200): {"status": "healthy", "version": "1.0"}
    """
    return jsonify({
        "status": "healthy",
        "version": "1.0",
        "endpoints": {
            "standard": "/api/generate",
            "pro_mode": "/api/generate/pro",
            "image_analysis": "/api/analyze-image",
            "edit_remove_background": "/api/edit/remove-background",
            "edit_replace_background": "/api/edit/replace-background",
            "edit_blur_background": "/api/edit/blur-background",
            "edit_generative_fill": "/api/edit/generative-fill",
            "edit_expand": "/api/edit/expand",
            "edit_enhance": "/api/edit/enhance",
            "edit_upscale": "/api/edit/upscale"
        }
    }), 200


@app.route('/api/generate/pro', methods=['POST'])
def generate_pro_mode():
    """Handle POST requests to generate images using Pro Mode (structured prompt).

    Pro Mode endpoint - Direct Line to Bria (NO GEMINI).
    This endpoint bypasses the Gemini translation layer entirely.

    Request Body:
        {
            "structured_prompt": {
                "short_description": str,
                "background_setting": str,
                "style_medium": str,
                "artistic_style": str,
                "context": str,
                "lighting": {
                    "conditions": str,
                    "direction": str,
                    "shadows": str
                },
                "aesthetics": {
                    "composition": str,
                    "color_scheme": str,
                    "mood_atmosphere": str
                },
                "photographic_characteristics": {
                    "camera_angle": str,
                    "lens_focal_length": str,
                    "depth_of_field": str,
                    "focus": str
                },
                "objects": [
                    {
                        "description": str,
                        "location": str,
                        "relationship": str,
                        "relative_size": str,
                        "shape_and_color": str,
                        "texture": str,
                        "appearance_details": str
                    }
                ]
            },
            "seed": int
        }

    Returns:
        Success (200): {"success": true, "final_image_url": "..."}
        Error (400/500): {"success": false, "error": "..."}
    """
    request_id = id(request)

    try:
        # Log incoming request
        app.logger.info(
            f"[Request {request_id}] Received POST /api/generate/pro from {request.remote_addr}")

        # Parse incoming JSON request body
        try:
            data = request.get_json()
            if data is None:
                app.logger.warning(
                    f"[Request {request_id}] Empty or invalid JSON body received")
                return jsonify({
                    "success": False,
                    "error": "Request body must contain valid JSON"
                }), 400
        except Exception as e:
            app.logger.error(
                f"[Request {request_id}] JSON parsing error: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Invalid JSON body: {str(e)}"
            }), 400

        # Validate structured_prompt structure
        is_valid, error_msg = validate_pro_mode_request(data)
        if not is_valid:
            app.logger.warning(
                f"[Request {request_id}] Pro Mode validation failed: {error_msg}")
            return jsonify({
                "success": False,
                "error": error_msg
            }), 400

        structured_prompt = data['structured_prompt']
        seed = data['seed']

        app.logger.info(
            f"[Request {request_id}] Pro Mode generation with seed {seed}")

        # CRITICAL: Convert structured_prompt to JSON string
        # This is the "Direct Line" - we send the JSON as a string to Bria
        prompt_json_string = json.dumps(structured_prompt)

        app.logger.info(
            f"[Request {request_id}] Converted structured prompt to JSON string "
            f"({len(prompt_json_string)} chars)")

        # Call Bria API directly (NO GEMINI - this is the key difference)
        try:
            result = call_bria_with_structured_prompt(prompt_json_string, seed)
        except Exception as bria_error:
            app.logger.error(
                f"[Request {request_id}] Bria API call failed: {str(bria_error)}",
                exc_info=True
            )
            return jsonify({
                "success": False,
                "error": f"Image generation failed: {str(bria_error)}"
            }), 500

        # Return response
        if result and result.get('image_url'):
            app.logger.info(
                f"[Request {request_id}] Pro Mode generation successful")
            return jsonify({
                "success": True,
                "final_image_url": result['image_url']
            }), 200
        else:
            app.logger.error(
                f"[Request {request_id}] Pro Mode generation failed")
            return jsonify({
                "success": False,
                "error": "Image generation failed"
            }), 500

    except Exception as e:
        # Unexpected server error
        app.logger.error(
            f"[Request {request_id}] Unexpected error in generate_pro_mode endpoint: {str(e)}",
            exc_info=True
        )
        return jsonify({
            "success": False,
            "error": "Internal server error occurred"
        }), 500


@app.route('/api/edit/remove-background', methods=['POST'])
def edit_remove_background():
    """Handle POST requests to remove background from an image.

    Request Body:
        {
            "image": str,  # Required: Image URL or base64-encoded image
            "preserve_alpha": bool  # Optional: Preserve alpha channel (default: true)
        }

    Returns:
        Success (200): {"success": true, "result_url": "...", "original_url": "..."}
        Error (400/500): {"success": false, "error": "..."}
    """
    request_id = id(request)

    try:
        # Log incoming request
        app.logger.info(
            f"[Request {request_id}] Received POST /api/edit/remove-background from {request.remote_addr}")

        # Parse incoming JSON request body
        try:
            data = request.get_json()
            if data is None:
                app.logger.warning(
                    f"[Request {request_id}] Empty or invalid JSON body received")
                return jsonify({
                    "success": False,
                    "error": "Request body must contain valid JSON"
                }), 400
        except Exception as e:
            app.logger.error(
                f"[Request {request_id}] JSON parsing error: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Invalid JSON body: {str(e)}"
            }), 400

        # Validate required field: image
        if 'image' not in data:
            app.logger.warning(
                f"[Request {request_id}] Missing required field: image")
            return jsonify({
                "success": False,
                "error": "Missing required field: image"
            }), 400

        if not isinstance(data['image'], str) or not data['image'].strip():
            app.logger.warning(
                f"[Request {request_id}] Invalid image field")
            return jsonify({
                "success": False,
                "error": "Field 'image' must be a non-empty string"
            }), 400

        image = data['image']

        # Log request details
        image_preview = image[:50] + '...' if len(image) > 50 else image
        app.logger.info(
            f"[Request {request_id}] Removing background from image: {image_preview}")

        # Call image_editor module
        try:
            from image_editor import remove_background
            result = remove_background(image, sync=True)
        except Exception as editor_error:
            app.logger.error(
                f"[Request {request_id}] Background removal failed: {str(editor_error)}",
                exc_info=True
            )
            return jsonify({
                "success": False,
                "error": f"Background removal failed: {str(editor_error)}"
            }), 500

        # Return response
        if result.get('success'):
            app.logger.info(
                f"[Request {request_id}] Background removal completed successfully")
            return jsonify(result), 200
        else:
            error_msg = result.get('error', 'Unknown error')
            app.logger.error(
                f"[Request {request_id}] Background removal failed: {error_msg}")
            return jsonify(result), 500

    except Exception as e:
        # Unexpected server error
        app.logger.error(
            f"[Request {request_id}] Unexpected error in edit_remove_background endpoint: {str(e)}",
            exc_info=True
        )
        return jsonify({
            "success": False,
            "error": "Internal server error occurred"
        }), 500


@app.route('/api/edit/replace-background', methods=['POST'])
def edit_replace_background():
    """Handle POST requests to replace background of an image.

    Request Body:
        {
            "image": str,  # Required: Image URL or base64-encoded image
            "background_prompt": str,  # Optional: Text description of desired background
            "background_color": str  # Optional: Hex color code (e.g., "#FFFFFF")
        }

    Note: Either background_prompt or background_color must be provided.

    Returns:
        Success (200): {"success": true, "result_url": "..."}
        Error (400/500): {"success": false, "error": "..."}
    """
    request_id = id(request)

    try:
        # Log incoming request
        app.logger.info(
            f"[Request {request_id}] Received POST /api/edit/replace-background from {request.remote_addr}")

        # Parse incoming JSON request body
        try:
            data = request.get_json()
            if data is None:
                app.logger.warning(
                    f"[Request {request_id}] Empty or invalid JSON body received")
                return jsonify({
                    "success": False,
                    "error": "Request body must contain valid JSON"
                }), 400
        except Exception as e:
            app.logger.error(
                f"[Request {request_id}] JSON parsing error: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Invalid JSON body: {str(e)}"
            }), 400

        # Validate required field: image
        if 'image' not in data:
            app.logger.warning(
                f"[Request {request_id}] Missing required field: image")
            return jsonify({
                "success": False,
                "error": "Missing required field: image"
            }), 400

        if not isinstance(data['image'], str) or not data['image'].strip():
            app.logger.warning(
                f"[Request {request_id}] Invalid image field")
            return jsonify({
                "success": False,
                "error": "Field 'image' must be a non-empty string"
            }), 400

        # Validate that at least one of background_prompt or background_color is provided
        background_prompt = data.get('background_prompt')
        background_color = data.get('background_color')

        if not background_prompt and not background_color:
            app.logger.warning(
                f"[Request {request_id}] Missing both background_prompt and background_color")
            return jsonify({
                "success": False,
                "error": "Must provide either 'background_prompt' or 'background_color'"
            }), 400

        # Validate background_prompt if provided
        if background_prompt is not None and (not isinstance(background_prompt, str) or not background_prompt.strip()):
            app.logger.warning(
                f"[Request {request_id}] Invalid background_prompt field")
            return jsonify({
                "success": False,
                "error": "Field 'background_prompt' must be a non-empty string"
            }), 400

        # Validate background_color if provided
        if background_color is not None and (not isinstance(background_color, str) or not background_color.strip()):
            app.logger.warning(
                f"[Request {request_id}] Invalid background_color field")
            return jsonify({
                "success": False,
                "error": "Field 'background_color' must be a non-empty string"
            }), 400

        image = data['image']

        # Log request details
        image_preview = image[:50] + '...' if len(image) > 50 else image
        prompt_info = f"prompt='{background_prompt[:30]}...'" if background_prompt else f"color={background_color}"
        app.logger.info(
            f"[Request {request_id}] Replacing background ({prompt_info}): {image_preview}")

        # Call image_editor module
        try:
            from image_editor import replace_background
            result = replace_background(
                image,
                background_prompt=background_prompt,
                background_color=background_color,
                sync=True
            )
        except Exception as editor_error:
            app.logger.error(
                f"[Request {request_id}] Background replacement failed: {str(editor_error)}",
                exc_info=True
            )
            return jsonify({
                "success": False,
                "error": f"Background replacement failed: {str(editor_error)}"
            }), 500

        # Return response
        if result.get('success'):
            app.logger.info(
                f"[Request {request_id}] Background replacement completed successfully")
            return jsonify(result), 200
        else:
            error_msg = result.get('error', 'Unknown error')
            app.logger.error(
                f"[Request {request_id}] Background replacement failed: {error_msg}")
            return jsonify(result), 500

    except Exception as e:
        # Unexpected server error
        app.logger.error(
            f"[Request {request_id}] Unexpected error in edit_replace_background endpoint: {str(e)}",
            exc_info=True
        )
        return jsonify({
            "success": False,
            "error": "Internal server error occurred"
        }), 500


@app.route('/api/edit/blur-background', methods=['POST'])
def edit_blur_background():
    """Handle POST requests to blur background of an image.

    Request Body:
        {
            "image": str,  # Required: Image URL or base64-encoded image
            "blur_strength": int  # Required: Blur strength (0-100)
        }

    Returns:
        Success (200): {"success": true, "result_url": "..."}
        Error (400/500): {"success": false, "error": "..."}
    """
    request_id = id(request)

    try:
        # Log incoming request
        app.logger.info(
            f"[Request {request_id}] Received POST /api/edit/blur-background from {request.remote_addr}")

        # Parse incoming JSON request body
        try:
            data = request.get_json()
            if data is None:
                app.logger.warning(
                    f"[Request {request_id}] Empty or invalid JSON body received")
                return jsonify({
                    "success": False,
                    "error": "Request body must contain valid JSON"
                }), 400
        except Exception as e:
            app.logger.error(
                f"[Request {request_id}] JSON parsing error: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Invalid JSON body: {str(e)}"
            }), 400

        # Validate required field: image
        if 'image' not in data:
            app.logger.warning(
                f"[Request {request_id}] Missing required field: image")
            return jsonify({
                "success": False,
                "error": "Missing required field: image"
            }), 400

        if not isinstance(data['image'], str) or not data['image'].strip():
            app.logger.warning(
                f"[Request {request_id}] Invalid image field")
            return jsonify({
                "success": False,
                "error": "Field 'image' must be a non-empty string"
            }), 400

        # Validate required field: blur_strength
        if 'blur_strength' not in data:
            app.logger.warning(
                f"[Request {request_id}] Missing required field: blur_strength")
            return jsonify({
                "success": False,
                "error": "Missing required field: blur_strength"
            }), 400

        if not isinstance(data['blur_strength'], int):
            app.logger.warning(
                f"[Request {request_id}] Invalid blur_strength field type")
            return jsonify({
                "success": False,
                "error": "Field 'blur_strength' must be an integer"
            }), 400

        blur_strength = data['blur_strength']

        # Validate blur_strength range
        if blur_strength < 0 or blur_strength > 100:
            app.logger.warning(
                f"[Request {request_id}] blur_strength out of range: {blur_strength}")
            return jsonify({
                "success": False,
                "error": "Field 'blur_strength' must be between 0 and 100"
            }), 400

        image = data['image']

        # Log request details
        image_preview = image[:50] + '...' if len(image) > 50 else image
        app.logger.info(
            f"[Request {request_id}] Blurring background of image: {image_preview}, strength: {blur_strength}")

        # Call image_editor module
        try:
            from image_editor import blur_background
            result = blur_background(image, blur_strength, sync=True)
        except Exception as editor_error:
            app.logger.error(
                f"[Request {request_id}] Background blur failed: {str(editor_error)}",
                exc_info=True
            )
            return jsonify({
                "success": False,
                "error": f"Background blur failed: {str(editor_error)}"
            }), 500

        # Return response
        if result.get('success'):
            app.logger.info(
                f"[Request {request_id}] Background blur completed successfully")
            return jsonify(result), 200
        else:
            error_msg = result.get('error', 'Unknown error')
            app.logger.error(
                f"[Request {request_id}] Background blur failed: {error_msg}")
            return jsonify(result), 500

    except Exception as e:
        # Unexpected server error
        app.logger.error(
            f"[Request {request_id}] Unexpected error in edit_blur_background endpoint: {str(e)}",
            exc_info=True
        )
        return jsonify({
            "success": False,
            "error": "Internal server error occurred"
        }), 500


@app.route('/api/edit/generative-fill', methods=['POST'])
def edit_generative_fill():
    """Handle POST requests to fill masked regions of an image using generative AI.

    Request Body:
        {
            "image": str,  # Required: Image URL or base64-encoded image
            "mask": str,  # Required: Mask image URL or base64-encoded mask
            "prompt": str,  # Required: Text description of what to generate
            "negative_prompt": str,  # Optional: Text description of what to avoid
            "version": int  # Optional: API version (1 or 2, default: 2)
        }

    Returns:
        Success (200): {"success": true, "result_url": "...", "refined_prompt": "..." (v2 only)}
        Error (400/500): {"success": false, "error": "..."}
    """
    request_id = id(request)

    try:
        # Log incoming request
        app.logger.info(
            f"[Request {request_id}] Received POST /api/edit/generative-fill from {request.remote_addr}")

        # Parse incoming JSON request body
        try:
            data = request.get_json()
            if data is None:
                app.logger.warning(
                    f"[Request {request_id}] Empty or invalid JSON body received")
                return jsonify({
                    "success": False,
                    "error": "Request body must contain valid JSON"
                }), 400
        except Exception as e:
            app.logger.error(
                f"[Request {request_id}] JSON parsing error: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Invalid JSON body: {str(e)}"
            }), 400

        # Validate required field: image
        if 'image' not in data:
            app.logger.warning(
                f"[Request {request_id}] Missing required field: image")
            return jsonify({
                "success": False,
                "error": "Missing required field: image"
            }), 400

        if not isinstance(data['image'], str) or not data['image'].strip():
            app.logger.warning(
                f"[Request {request_id}] Invalid image field")
            return jsonify({
                "success": False,
                "error": "Field 'image' must be a non-empty string"
            }), 400

        # Validate required field: mask
        if 'mask' not in data:
            app.logger.warning(
                f"[Request {request_id}] Missing required field: mask")
            return jsonify({
                "success": False,
                "error": "Missing required field: mask"
            }), 400

        if not isinstance(data['mask'], str) or not data['mask'].strip():
            app.logger.warning(
                f"[Request {request_id}] Invalid mask field")
            return jsonify({
                "success": False,
                "error": "Field 'mask' must be a non-empty string"
            }), 400

        # Validate required field: prompt
        if 'prompt' not in data:
            app.logger.warning(
                f"[Request {request_id}] Missing required field: prompt")
            return jsonify({
                "success": False,
                "error": "Missing required field: prompt"
            }), 400

        if not isinstance(data['prompt'], str) or not data['prompt'].strip():
            app.logger.warning(
                f"[Request {request_id}] Invalid prompt field")
            return jsonify({
                "success": False,
                "error": "Field 'prompt' must be a non-empty string"
            }), 400

        # Extract required fields
        image = data['image']
        mask = data['mask']
        prompt = data['prompt']

        # Extract optional fields
        negative_prompt = data.get('negative_prompt')
        version = data.get('version', 2)

        # Validate negative_prompt if provided
        if negative_prompt is not None and (not isinstance(negative_prompt, str) or not negative_prompt.strip()):
            app.logger.warning(
                f"[Request {request_id}] Invalid negative_prompt field")
            return jsonify({
                "success": False,
                "error": "Field 'negative_prompt' must be a non-empty string if provided"
            }), 400

        # Validate version if provided
        if not isinstance(version, int) or version not in [1, 2]:
            app.logger.warning(
                f"[Request {request_id}] Invalid version field: {version}")
            return jsonify({
                "success": False,
                "error": "Field 'version' must be 1 or 2"
            }), 400

        # Log request details
        image_preview = image[:50] + '...' if len(image) > 50 else image
        mask_preview = mask[:50] + '...' if len(mask) > 50 else mask
        prompt_preview = prompt[:50] + '...' if len(prompt) > 50 else prompt
        app.logger.info(
            f"[Request {request_id}] Generative fill - Image: {image_preview}, "
            f"Mask: {mask_preview}, Prompt: '{prompt_preview}', Version: {version}")

        # Call image_editor module
        try:
            from image_editor import generative_fill
            result = generative_fill(
                image,
                mask,
                prompt,
                negative_prompt=negative_prompt,
                version=version,
                sync=True
            )
        except Exception as editor_error:
            app.logger.error(
                f"[Request {request_id}] Generative fill failed: {str(editor_error)}",
                exc_info=True
            )
            return jsonify({
                "success": False,
                "error": f"Generative fill failed: {str(editor_error)}"
            }), 500

        # Return response
        if result.get('success'):
            app.logger.info(
                f"[Request {request_id}] Generative fill completed successfully")
            return jsonify(result), 200
        else:
            error_msg = result.get('error', 'Unknown error')
            app.logger.error(
                f"[Request {request_id}] Generative fill failed: {error_msg}")
            return jsonify(result), 500

    except Exception as e:
        # Unexpected server error
        app.logger.error(
            f"[Request {request_id}] Unexpected error in edit_generative_fill endpoint: {str(e)}",
            exc_info=True
        )
        return jsonify({
            "success": False,
            "error": "Internal server error occurred"
        }), 500


@app.route('/api/edit/expand', methods=['POST'])
def edit_expand():
    """Handle POST requests to expand the canvas of an image to new dimensions.

    Request Body:
        {
            "image": str,  # Required: Image URL or base64-encoded image
            "target_width": int,  # Required: Target width in pixels
            "target_height": int,  # Required: Target height in pixels
            "prompt": str  # Optional: Text description to guide expansion
        }

    Returns:
        Success (200): {"success": true, "result_url": "..."}
        Error (400/500): {"success": false, "error": "..."}
    """
    request_id = id(request)

    try:
        # Log incoming request
        app.logger.info(
            f"[Request {request_id}] Received POST /api/edit/expand from {request.remote_addr}")

        # Parse incoming JSON request body
        try:
            data = request.get_json()
            if data is None:
                app.logger.warning(
                    f"[Request {request_id}] Empty or invalid JSON body received")
                return jsonify({
                    "success": False,
                    "error": "Request body must contain valid JSON"
                }), 400
        except Exception as e:
            app.logger.error(
                f"[Request {request_id}] JSON parsing error: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Invalid JSON body: {str(e)}"
            }), 400

        # Validate required field: image
        if 'image' not in data:
            app.logger.warning(
                f"[Request {request_id}] Missing required field: image")
            return jsonify({
                "success": False,
                "error": "Missing required field: image"
            }), 400

        if not isinstance(data['image'], str) or not data['image'].strip():
            app.logger.warning(
                f"[Request {request_id}] Invalid image field")
            return jsonify({
                "success": False,
                "error": "Field 'image' must be a non-empty string"
            }), 400

        # Validate required field: target_width
        if 'target_width' not in data:
            app.logger.warning(
                f"[Request {request_id}] Missing required field: target_width")
            return jsonify({
                "success": False,
                "error": "Missing required field: target_width"
            }), 400

        if not isinstance(data['target_width'], int):
            app.logger.warning(
                f"[Request {request_id}] Invalid target_width field type")
            return jsonify({
                "success": False,
                "error": "Field 'target_width' must be an integer"
            }), 400

        # Validate required field: target_height
        if 'target_height' not in data:
            app.logger.warning(
                f"[Request {request_id}] Missing required field: target_height")
            return jsonify({
                "success": False,
                "error": "Missing required field: target_height"
            }), 400

        if not isinstance(data['target_height'], int):
            app.logger.warning(
                f"[Request {request_id}] Invalid target_height field type")
            return jsonify({
                "success": False,
                "error": "Field 'target_height' must be an integer"
            }), 400

        # Extract required fields
        image = data['image']
        target_width = data['target_width']
        target_height = data['target_height']

        # Validate dimensions are positive
        if target_width <= 0:
            app.logger.warning(
                f"[Request {request_id}] Invalid target_width: {target_width}")
            return jsonify({
                "success": False,
                "error": "Field 'target_width' must be greater than 0"
            }), 400

        if target_height <= 0:
            app.logger.warning(
                f"[Request {request_id}] Invalid target_height: {target_height}")
            return jsonify({
                "success": False,
                "error": "Field 'target_height' must be greater than 0"
            }), 400

        # Extract optional field: prompt
        prompt = data.get('prompt')

        # Validate prompt if provided
        if prompt is not None and (not isinstance(prompt, str) or not prompt.strip()):
            app.logger.warning(
                f"[Request {request_id}] Invalid prompt field")
            return jsonify({
                "success": False,
                "error": "Field 'prompt' must be a non-empty string if provided"
            }), 400

        # Log request details
        image_preview = image[:50] + '...' if len(image) > 50 else image
        prompt_info = f"with prompt '{prompt[:30]}...'" if prompt and len(
            prompt) > 30 else f"with prompt '{prompt}'" if prompt else "without prompt"
        app.logger.info(
            f"[Request {request_id}] Expanding canvas - Image: {image_preview}, "
            f"Target: {target_width}x{target_height}, {prompt_info}")

        # Call image_editor module
        try:
            from image_editor import expand_image
            result = expand_image(
                image,
                target_width,
                target_height,
                prompt=prompt,
                sync=True
            )
        except Exception as editor_error:
            app.logger.error(
                f"[Request {request_id}] Canvas expansion failed: {str(editor_error)}",
                exc_info=True
            )
            return jsonify({
                "success": False,
                "error": f"Canvas expansion failed: {str(editor_error)}"
            }), 500

        # Return response
        if result.get('success'):
            app.logger.info(
                f"[Request {request_id}] Canvas expansion completed successfully")
            return jsonify(result), 200
        else:
            error_msg = result.get('error', 'Unknown error')
            app.logger.error(
                f"[Request {request_id}] Canvas expansion failed: {error_msg}")
            return jsonify(result), 500

    except Exception as e:
        # Unexpected server error
        app.logger.error(
            f"[Request {request_id}] Unexpected error in edit_expand endpoint: {str(e)}",
            exc_info=True
        )
        return jsonify({
            "success": False,
            "error": "Internal server error occurred"
        }), 500


@app.route('/api/edit/enhance', methods=['POST'])
def edit_enhance():
    """Handle POST requests to enhance image quality.

    Request Body:
        {
            "image": str  # Required: Image URL or base64-encoded image
        }

    Returns:
        Success (200): {"success": true, "result_url": "..."}
        Error (400/500): {"success": false, "error": "..."}
    """
    request_id = id(request)

    try:
        # Log incoming request
        app.logger.info(
            f"[Request {request_id}] Received POST /api/edit/enhance from {request.remote_addr}")

        # Parse incoming JSON request body
        try:
            data = request.get_json()
            if data is None:
                app.logger.warning(
                    f"[Request {request_id}] Empty or invalid JSON body received")
                return jsonify({
                    "success": False,
                    "error": "Request body must contain valid JSON"
                }), 400
        except Exception as e:
            app.logger.error(
                f"[Request {request_id}] JSON parsing error: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Invalid JSON body: {str(e)}"
            }), 400

        # Validate required field: image
        if 'image' not in data:
            app.logger.warning(
                f"[Request {request_id}] Missing required field: image")
            return jsonify({
                "success": False,
                "error": "Missing required field: image"
            }), 400

        if not isinstance(data['image'], str) or not data['image'].strip():
            app.logger.warning(
                f"[Request {request_id}] Invalid image field")
            return jsonify({
                "success": False,
                "error": "Field 'image' must be a non-empty string"
            }), 400

        image = data['image']

        # Log request details
        image_preview = image[:50] + '...' if len(image) > 50 else image
        app.logger.info(
            f"[Request {request_id}] Enhancing image: {image_preview}")

        # Call image_editor module
        try:
            from image_editor import enhance_image
            result = enhance_image(image, sync=True)
        except Exception as editor_error:
            app.logger.error(
                f"[Request {request_id}] Image enhancement failed: {str(editor_error)}",
                exc_info=True
            )
            return jsonify({
                "success": False,
                "error": f"Image enhancement failed: {str(editor_error)}"
            }), 500

        # Return response
        if result.get('success'):
            app.logger.info(
                f"[Request {request_id}] Image enhancement completed successfully")
            return jsonify(result), 200
        else:
            error_msg = result.get('error', 'Unknown error')
            app.logger.error(
                f"[Request {request_id}] Image enhancement failed: {error_msg}")
            return jsonify(result), 500

    except Exception as e:
        # Unexpected server error
        app.logger.error(
            f"[Request {request_id}] Unexpected error in edit_enhance endpoint: {str(e)}",
            exc_info=True
        )
        return jsonify({
            "success": False,
            "error": "Internal server error occurred"
        }), 500


@app.route('/api/edit/upscale', methods=['POST'])
def edit_upscale():
    """Handle POST requests to upscale image resolution.

    Request Body:
        {
            "image": str,  # Required: Image URL or base64-encoded image
            "scale_factor": int  # Required: Scale factor (2 or 4)
        }

    Returns:
        Success (200): {"success": true, "result_url": "..."}
        Error (400/500): {"success": false, "error": "..."}
    """
    request_id = id(request)

    try:
        # Log incoming request
        app.logger.info(
            f"[Request {request_id}] Received POST /api/edit/upscale from {request.remote_addr}")

        # Parse incoming JSON request body
        try:
            data = request.get_json()
            if data is None:
                app.logger.warning(
                    f"[Request {request_id}] Empty or invalid JSON body received")
                return jsonify({
                    "success": False,
                    "error": "Request body must contain valid JSON"
                }), 400
        except Exception as e:
            app.logger.error(
                f"[Request {request_id}] JSON parsing error: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Invalid JSON body: {str(e)}"
            }), 400

        # Validate required field: image
        if 'image' not in data:
            app.logger.warning(
                f"[Request {request_id}] Missing required field: image")
            return jsonify({
                "success": False,
                "error": "Missing required field: image"
            }), 400

        if not isinstance(data['image'], str) or not data['image'].strip():
            app.logger.warning(
                f"[Request {request_id}] Invalid image field")
            return jsonify({
                "success": False,
                "error": "Field 'image' must be a non-empty string"
            }), 400

        # Validate required field: scale_factor
        if 'scale_factor' not in data:
            app.logger.warning(
                f"[Request {request_id}] Missing required field: scale_factor")
            return jsonify({
                "success": False,
                "error": "Missing required field: scale_factor"
            }), 400

        if not isinstance(data['scale_factor'], int):
            app.logger.warning(
                f"[Request {request_id}] Invalid scale_factor field type")
            return jsonify({
                "success": False,
                "error": "Field 'scale_factor' must be an integer"
            }), 400

        scale_factor = data['scale_factor']

        # Validate scale_factor value
        if scale_factor not in [2, 4]:
            app.logger.warning(
                f"[Request {request_id}] Invalid scale_factor value: {scale_factor}")
            return jsonify({
                "success": False,
                "error": "Field 'scale_factor' must be 2 or 4"
            }), 400

        image = data['image']

        # Log request details
        image_preview = image[:50] + '...' if len(image) > 50 else image
        app.logger.info(
            f"[Request {request_id}] Upscaling image: {image_preview}, scale: {scale_factor}x")

        # Call image_editor module
        try:
            from image_editor import increase_resolution
            result = increase_resolution(image, scale_factor, sync=True)
        except Exception as editor_error:
            app.logger.error(
                f"[Request {request_id}] Image upscaling failed: {str(editor_error)}",
                exc_info=True
            )
            return jsonify({
                "success": False,
                "error": f"Image upscaling failed: {str(editor_error)}"
            }), 500

        # Return response
        if result.get('success'):
            app.logger.info(
                f"[Request {request_id}] Image upscaling completed successfully")
            return jsonify(result), 200
        else:
            error_msg = result.get('error', 'Unknown error')
            app.logger.error(
                f"[Request {request_id}] Image upscaling failed: {error_msg}")
            return jsonify(result), 500

    except Exception as e:
        # Unexpected server error
        app.logger.error(
            f"[Request {request_id}] Unexpected error in edit_upscale endpoint: {str(e)}",
            exc_info=True
        )
        return jsonify({
            "success": False,
            "error": "Internal server error occurred"
        }), 500


if __name__ == '__main__':
    # Parse command-line arguments
    parser = argparse.ArgumentParser(
        description='Flask API Server for AI Product Image Generation'
    )
    parser.add_argument(
        '--host',
        type=str,
        default=os.environ.get('FLASK_HOST', 'localhost'),
        help='Host to bind the server to (default: localhost)'
    )
    parser.add_argument(
        '--port',
        type=int,
        default=int(os.environ.get('FLASK_PORT', 5000)),
        help='Port to bind the server to (default: 5000)'
    )

    args = parser.parse_args()

    # Use command-line arguments (which may have defaults from environment)
    host = args.host
    port = args.port

    # Log startup information
    app.logger.info(f"Starting Flask API server on {host}:{port}")
    app.logger.info(
        f"CORS enabled for: http://localhost:3000, http://localhost:5173, http://localhost:5174")
    app.logger.info(
        f"Endpoints: /api/generate (standard), /api/generate/pro (Pro Mode)")
    app.logger.info(
        f"Environment: {'production' if os.environ.get('FLASK_ENV') == 'production' else 'development'}")

    try:
        # Run Flask application
        app.run(host=host, port=port)
    except Exception as e:
        app.logger.critical(
            f"Failed to start Flask server: {str(e)}", exc_info=True)
        sys.exit(1)
