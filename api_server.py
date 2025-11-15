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
            "pro_mode": "/api/generate/pro"
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
