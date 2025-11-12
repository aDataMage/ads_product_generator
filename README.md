# AI Product Image Generation System

An AI-powered product image generation system that creates styled product photography using a two-stage agentic workflow combining Gemini and Bria APIs.

## Overview

This system generates professional product photography for e-commerce, catalogs, and advertising materials through a two-stage process:

1. **Gemini (Translator)**: Takes a simple user prompt and a style preset, then generates a detailed master prompt optimized for image generation
2. **Bria (Image Engine)**: Uses the master prompt to generate the final styled product image

The system supports both text-to-image generation and image-to-image transformation with reference images.

## Features

- Multiple style presets (bright clean, luxury reflection, minimalist shadow, etc.)
- Reference image support for product preservation
- REST API server for web integration
- MCP server integration for IDE tool calls
- Automated prompt engineering via Gemini
- Professional product photography output via Bria API

## Prerequisites

- Python 3.13+
- `uv` package manager ([installation guide](https://docs.astral.sh/uv/getting-started/installation/))
- Gemini API key (set as `GOOGLE_API_KEY` environment variable)
- Bria API key (configured in `config.py`)

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   uv sync
   ```

3. Set up environment variables:

   ```bash
   # Windows CMD
   set GOOGLE_API_KEY=your_gemini_api_key_here
   
   # Windows PowerShell
   $env:GOOGLE_API_KEY="your_gemini_api_key_here"
   ```

4. Configure Bria API key in `config.py`:

   ```python
   BRIA_API_KEY = "your_bria_api_key_here"
   ```

## Usage

### Option 1: REST API Server (Recommended for Web Apps)

Start the Flask API server:

```bash
python api_server.py
```

The server runs on `http://localhost:5000` by default.

#### API Endpoint

**POST /api/generate**

Generate a styled product image.

**Request Body:**

```json
{
  "user_prompt": "a smartphone on a white background",
  "preset_name": "preset_bright_clean.json",
  "reference_image_base64": "iVBORw0KGgoAAAANS..."  // optional
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

#### Example cURL Commands

**Text-to-image generation:**

```bash
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d "{\"user_prompt\": \"a luxury watch on a dark background\", \"preset_name\": \"preset_luxury_reflection.json\"}"
```

**Image-to-image with reference:**

```bash
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d "{\"user_prompt\": \"product on white background\", \"preset_name\": \"preset_bright_clean.json\", \"reference_image_base64\": \"$(base64 -w 0 inputs/product_image.png)\"}"
```

**Test from React app (localhost:3000):**

```javascript
const response = await fetch('http://localhost:5000/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user_prompt: 'a smartphone on a white background',
    preset_name: 'preset_bright_clean.json',
  }),
});

const result = await response.json();
console.log(result.final_image_url);
```

### Option 2: Standalone Script

Run the generation workflow directly:

```bash
python generate_image.py
```

This will use the default configuration and save outputs to the `/outputs` directory.

### Option 3: MCP Server (IDE Integration)

Run the MCP server for integration with Kiro IDE:

```bash
python mcp_server.py
```

The server exposes the image generation workflow as a tool callable from the IDE.

## Available Style Presets

The system includes 10 professional photography presets:

- `preset_bright_clean.json` - Clean white background, studio lighting
- `preset_detail_macro.json` - Close-up detail shots
- `preset_editorial_dark.json` - Dark, editorial style
- `preset_flat_lay.json` - Overhead flat lay composition
- `preset_hero_shot.json` - Dramatic hero product shots
- `preset_lifestyle_context.json` - Product in lifestyle context
- `preset_luxury_reflection.json` - Luxury with reflective surfaces
- `preset_minimalist_shadow.json` - Minimalist with shadow play
- `preset_natural_warm.json` - Natural, warm lighting
- `preset_vibrant_pop.json` - Vibrant, colorful backgrounds

## Project Structure

```
├── api_server.py           # Flask REST API server
├── workflow.py             # Core generation workflow module
├── generate_image.py       # Standalone generation script
├── mcp_server.py          # MCP server for IDE integration
├── config.py              # API keys configuration
├── merger_prompt.txt      # Prompt template
├── /inputs                # Reference product images
├── /outputs               # Generated images and prompts
└── /presets               # Style preset JSON files
```

## Environment Variables

- `GOOGLE_API_KEY` (Required) - Your Gemini API key for prompt engineering
- `FLASK_ENV` (Optional) - Set to 'production' for production deployment
- `FLASK_PORT` (Optional) - Custom port for Flask server (default: 5000)

## API Server Configuration

The Flask API server includes:

- CORS support for cross-origin requests (configured for `http://localhost:3000`)
- Request validation for required fields
- Structured JSON error responses
- Logging for debugging and monitoring

## Development

### Running Tests

```bash
# Run all tests
python -m pytest

# Run specific test file
python -m pytest test_workflow.py
```

### Activating Virtual Environment

```bash
# Windows
.venv\Scripts\activate
```

## Troubleshooting

### API Server Issues

- **CORS errors**: Ensure the React app is running on `http://localhost:3000` or update CORS configuration in `api_server.py`
- **Missing API keys**: Verify `GOOGLE_API_KEY` environment variable and `BRIA_API_KEY` in `config.py`
- **Invalid preset**: Check that the preset file exists in the `/presets` directory

### Generation Failures

- **Gemini API errors**: Check API key and quota limits
- **Bria API errors**: Verify Bria API key and check service status
- **Timeout issues**: Large images may take longer to process

## License

[Add your license information here]

## Contributing

[Add contribution guidelines here]
