"""Flask API Server for AI Product Image Generation.

This module provides a REST API that exposes the 2-stage image generation
workflow (Gemini -> Bria) through HTTP endpoints.
"""

import os
import sys
import logging
import re
import argparse
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from workflow import run_generation_workflow


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

    # Configure CORS to allow requests from React development server
    CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])

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
    app.logger.info(f"CORS enabled for: http://localhost:3000")
    app.logger.info(
        f"Environment: {'production' if os.environ.get('FLASK_ENV') == 'production' else 'development'}")

    try:
        # Run Flask application
        app.run(host=host, port=port)
    except Exception as e:
        app.logger.critical(
            f"Failed to start Flask server: {str(e)}", exc_info=True)
        sys.exit(1)
