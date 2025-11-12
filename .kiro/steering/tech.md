# Tech Stack

## Build System & Package Management

- **Python Version**: 3.13+
- **Package Manager**: `uv` (modern Python package manager)
- **Project Config**: `pyproject.toml` with uv.lock for dependency locking

## Core Dependencies

- `google-generativeai` (>=0.8.5) - Gemini API for prompt engineering
- `requests` (>=2.32.5) - HTTP client for Bria API calls
- `google` (>=3.0.0) - Google API support
- `flask` (>=3.1.0) - Web framework for REST API server
- `flask-cors` (>=5.0.0) - CORS support for cross-origin requests

## External APIs

- **Gemini API**: Requires `GOOGLE_API_KEY` environment variable
- **Bria API**: Uses `BRIA_API_KEY` from `config.py`

## Common Commands

```bash
# Install dependencies
uv sync

# Run Flask API server (for web integration)
python api_server.py

# Run standalone generation
python generate_image.py

# Run MCP server (for IDE integration)
python mcp_server.py

# Activate virtual environment
.venv\Scripts\activate  # Windows
```

## Environment Setup

Set the `GOOGLE_API_KEY` environment variable before running:

```bash
set GOOGLE_API_KEY=your_key_here  # Windows CMD
```

## Flask API Server

The project includes a Flask-based REST API server (`api_server.py`) that exposes the image generation workflow through HTTP endpoints. The server:

- Runs on `localhost:5000` by default
- Accepts POST requests at `/api/generate`
- Supports CORS for requests from `http://localhost:3000`
- Returns JSON responses with generated image URLs or error messages

### API Request Format

```json
{
  "user_prompt": "a smartphone on a white background",
  "preset_name": "preset_bright_clean.json",
  "reference_image_base64": "base64_string_here"  // optional
}
```

### API Response Format

Success (200):

```json
{
  "success": true,
  "final_image_url": "https://bria-api.com/images/abc123.jpg"
}
```

Error (400/500):

```json
{
  "success": false,
  "error": "Error message here"
}
```

## MCP Server

The project includes an MCP (Model Context Protocol) server that exposes the image generation workflow as a tool callable from Kiro IDE. The server listens on stdin/stdout using JSON-RPC protocol.
