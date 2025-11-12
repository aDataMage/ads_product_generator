# Product Overview

This is an AI-powered product image generation system that creates styled product photography using a two-stage agentic workflow:

1. **Gemini (Translator)**: Takes a simple user prompt and a style preset, then generates a detailed master prompt optimized for image generation
2. **Bria (Image Engine)**: Uses the master prompt to generate the final styled product image

The system supports both text-to-image generation and image-to-image transformation with reference images. It's designed to create professional product photography for e-commerce, catalogs, and advertising materials.

## Key Features

- Multiple style presets (bright clean, luxury reflection, minimalist shadow, etc.)
- Reference image support for product preservation
- REST API server for web application integration
- MCP server integration for IDE tool calls
- Automated prompt engineering via Gemini
- Professional product photography output via Bria API

## Usage Modes

The system can be used in three ways:

1. **REST API Server** (`api_server.py`) - For web applications and frontend integration
   - Exposes HTTP POST endpoint at `/api/generate`
   - Accepts JSON requests with user_prompt, preset_name, and optional reference_image_base64
   - Returns JSON with generated image URL or error message
   - Includes CORS support for React apps on localhost:3000

2. **Standalone Script** (`generate_image.py`) - For direct command-line usage
   - Runs the workflow directly from the terminal
   - Saves outputs to `/outputs` directory

3. **MCP Server** (`mcp_server.py`) - For IDE integration
   - Exposes workflow as a tool callable from Kiro IDE
   - Uses JSON-RPC protocol over stdin/stdout
