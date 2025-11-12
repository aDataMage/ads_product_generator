# Design Document

## Overview

The Backend API Server is a Flask-based REST API that exposes the existing 2-stage image generation workflow (Gemini -> Bria) through HTTP endpoints. The server acts as a bridge between web clients (particularly the React frontend) and the AI-powered product image generation system.

The design leverages the existing `generate_image.py` workflow logic by refactoring it into reusable functions that can be called from Flask route handlers. This approach minimizes code duplication and maintains consistency with the proven workflow implementation.

## Architecture

### High-Level Architecture

```
React App (localhost:3000)
    |
    | HTTP POST /api/generate
    | (JSON: user_prompt, preset_name, reference_image_base64?)
    |
    v
Flask API Server (localhost:5000)
    |
    |-- Request Validation
    |-- CORS Handling
    |
    v
Generation Workflow Module
    |
    |-- Step 1: Gemini Translator
    |       (user_prompt + preset -> master_prompt)
    |
    |-- Step 2: Bria Image Engine
    |       (master_prompt + optional image -> final_image_url)
    |
    v
JSON Response
    Success: { "success": true, "final_image_url": "..." }
    Error:   { "success": false, "error": "..." }
```

### Component Architecture

1. **Flask Application** (`api_server.py`)
   - Main Flask app initialization
   - Route definitions
   - CORS configuration
   - Request/response handling

2. **Workflow Module** (refactored from `generate_image.py`)
   - Core generation logic extracted into reusable functions
   - Gemini API integration
   - Bria API integration
   - Helper functions for image encoding, polling, etc.

3. **Validation Layer**
   - Request body validation
   - Preset file existence checks
   - Base64 image validation

## Components and Interfaces

### 1. Flask API Server (`api_server.py`)

**Responsibilities:**

- Initialize Flask application with CORS support
- Define API routes
- Handle HTTP request/response cycle
- Validate incoming requests
- Invoke workflow functions
- Format and return JSON responses

**Key Functions:**

```python
def create_app() -> Flask:
    """Initialize and configure Flask application with CORS."""
    
def validate_request(data: dict) -> tuple[bool, str]:
    """Validate request body contains required fields.
    Returns: (is_valid, error_message)
    """
    
@app.route('/api/generate', methods=['POST'])
def generate_image():
    """Handle POST requests to generate styled product images."""
```

**Dependencies:**

- Flask framework
- Flask-CORS extension
- workflow module

### 2. Workflow Module (`workflow.py`)

**Responsibilities:**

- Execute the 2-stage generation workflow
- Manage Gemini and Bria API interactions
- Handle image encoding/decoding
- Poll Bria API for job completion

**Key Functions:**

```python
def run_generation_workflow(
    user_prompt: str,
    preset_name: str,
    reference_image_base64: str = None
) -> dict:
    """Execute the full Gemini -> Bria workflow.
    
    Returns:
        {
            "success": bool,
            "final_image_url": str (if success),
            "error": str (if failure)
        }
    """

def call_gemini_translator(user_prompt: str, preset_json: dict) -> str:
    """Call Gemini to generate master prompt from user input and preset."""

def call_bria_engine(master_prompt: str, image_base64: str = None) -> dict:
    """Call Bria API to generate final image."""

def encode_base64_to_image(base64_string: str) -> bytes:
    """Decode base64 string to image bytes."""

def poll_bria_status(status_url: str) -> dict:
    """Poll Bria status endpoint until job completes."""
```

**Dependencies:**

- google-generativeai
- requests
- config module (API keys)

### 3. Configuration Module (`config.py`)

**Existing module - no changes needed:**

- BRIA_API_KEY
- GEMINI_API_KEY (from environment)

### 4. Request/Response Interfaces

**POST /api/generate Request:**

```json
{
  "user_prompt": "a smartphone on a white background",
  "preset_name": "preset_bright_clean.json",
  "reference_image_base64": "iVBORw0KGgoAAAANS..." // optional
}
```

**Success Response (200):**

```json
{
  "success": true,
  "final_image_url": "https://bria-api.com/images/abc123.jpg"
}
```

**Error Response (400/500):**

```json
{
  "success": false,
  "error": "Preset file 'preset_invalid.json' not found"
}
```

## Data Models

### Request Model

```python
{
    "user_prompt": str,        # Required: Simple description of product
    "preset_name": str,        # Required: Filename of preset (e.g., "preset_bright_clean.json")
    "reference_image_base64": str  # Optional: Base64-encoded image data
}
```

### Response Model (Success)

```python
{
    "success": True,
    "final_image_url": str     # URL to generated image from Bria
}
```

### Response Model (Error)

```python
{
    "success": False,
    "error": str               # Human-readable error message
}
```

### Internal Workflow Result

```python
{
    "success": bool,
    "final_image_url": str,    # Present if success=True
    "error": str               # Present if success=False
}
```

## Error Handling

### Error Categories

1. **Client Errors (400 Bad Request)**
   - Missing required fields (user_prompt, preset_name)
   - Invalid JSON body
   - Invalid preset_name (file doesn't exist)
   - Invalid base64 image data

2. **Server Errors (500 Internal Server Error)**
   - Gemini API failures
   - Bria API failures
   - Network connectivity issues
   - Unexpected exceptions

### Error Handling Strategy

```python
try:
    # Validate request
    if not valid:
        return jsonify({"success": False, "error": "..."}), 400
    
    # Execute workflow
    result = run_generation_workflow(...)
    
    if result["success"]:
        return jsonify(result), 200
    else:
        # Workflow failed - determine if client or server error
        return jsonify(result), 500
        
except ValueError as e:
    # Client error
    return jsonify({"success": False, "error": str(e)}), 400
except Exception as e:
    # Server error
    return jsonify({"success": False, "error": str(e)}), 500
```

### Logging Strategy

- Log all incoming requests with timestamp and parameters
- Log workflow execution stages (Gemini call, Bria call)
- Log errors with full stack traces
- Use Flask's built-in logger
- Log to stderr for consistency with MCP server

## Testing Strategy

### Unit Tests

1. **Request Validation Tests**
   - Test missing user_prompt
   - Test missing preset_name
   - Test invalid JSON
   - Test invalid preset file
   - Test valid requests

2. **Workflow Function Tests**
   - Test Gemini translator with mock API
   - Test Bria engine with mock API
   - Test base64 decoding
   - Test error handling in each stage

3. **CORS Tests**
   - Test OPTIONS preflight requests
   - Test CORS headers in responses
   - Test allowed origins

### Integration Tests

1. **End-to-End API Tests**
   - Test successful generation (text-only)
   - Test successful generation (with reference image)
   - Test error scenarios (invalid preset, API failures)
   - Test CORS from simulated frontend

2. **API Contract Tests**
   - Verify request/response schemas
   - Verify HTTP status codes
   - Verify error message formats

### Manual Testing

1. Test with curl commands
2. Test with Postman/Insomnia
3. Test with actual React frontend
4. Test with various presets
5. Test with large base64 images

## Deployment Considerations

### Development Mode

```bash
python api_server.py
# Runs on localhost:5000 with debug mode enabled
```

### Production Mode

- Use production WSGI server (gunicorn, waitress)
- Disable Flask debug mode
- Configure proper logging
- Set up environment variables securely
- Consider rate limiting
- Add authentication if needed

### Environment Variables

- `GOOGLE_API_KEY` - Required for Gemini API
- `FLASK_ENV` - Set to 'production' for production
- `FLASK_PORT` - Optional, defaults to 5000

## Security Considerations

1. **API Keys**: Never expose API keys in responses or logs
2. **Input Validation**: Strictly validate all inputs before processing
3. **Base64 Size Limits**: Limit maximum size of reference_image_base64 to prevent memory issues
4. **CORS**: In production, restrict CORS to specific trusted origins
5. **Rate Limiting**: Consider adding rate limiting to prevent abuse
6. **Error Messages**: Don't expose internal system details in error messages

## Performance Considerations

1. **Async Processing**: Current design is synchronous - consider async for long-running jobs
2. **Timeout Handling**: Set reasonable timeouts for Gemini and Bria API calls
3. **Connection Pooling**: Reuse HTTP connections for API calls
4. **Caching**: Consider caching preset files in memory
5. **Request Size**: Limit maximum request body size

## Future Enhancements

1. **Job Queue**: Implement async job processing with status polling endpoint
2. **Webhooks**: Allow clients to provide callback URLs for completion notifications
3. **Batch Processing**: Support multiple image generations in one request
4. **Authentication**: Add API key or OAuth authentication
5. **Rate Limiting**: Implement per-client rate limits
6. **Metrics**: Add endpoint for health checks and metrics
7. **Image Storage**: Store generated images on server instead of relying on Bria URLs
