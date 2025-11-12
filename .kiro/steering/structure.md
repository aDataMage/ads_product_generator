# Project Structure

## Root Files

- `config.py` - API keys configuration (Bria and Gemini)
- `api_server.py` - Flask REST API server for web integration
- `workflow.py` - Core generation workflow module (refactored from generate_image.py)
- `generate_image.py` - Standalone script for running the 2-call workflow
- `mcp_server.py` - MCP server implementation for IDE integration
- `main.py` - Basic entry point (minimal implementation)
- `merger_prompt.txt` - Template for combining user prompts with style presets

## Directories

### `/inputs`

Contains reference product images for image-to-image generation.

- Example: `product_image.png`

### `/outputs`

Generated artifacts from the workflow:

- `final_image.jpg` - The generated product image from Bria
- `master_prompt.txt` - The engineered prompt created by Gemini

### `/presets`

JSON files defining style presets for product photography. Each preset includes:

- Visual settings (brightness, contrast, saturation, etc.)
- Product preservation instructions
- Background, lighting, and camera specifications
- Aesthetic preferences and mood

Available presets:

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

## Code Organization

The codebase follows a functional approach with clear separation:

### Core Modules

- **`workflow.py`**: Contains the core generation workflow logic
  - `run_generation_workflow()` - Orchestrates the 2-call chain (Gemini -> Bria)
  - Helper functions for image encoding, downloading, and API polling
  - Returns structured dict with success/error information

- **`api_server.py`**: Flask REST API server
  - POST `/api/generate` endpoint for web clients
  - Request validation and error handling
  - CORS support for cross-origin requests from React apps
  - JSON response formatting

- **`mcp_server.py`**: MCP server for IDE integration
  - JSON-RPC message handling loop
  - Exposes workflow as callable tool
  - All logging goes to stderr (MCP protocol requirement)

- **`generate_image.py`**: Standalone script for direct execution
  - Command-line interface for testing
  - Uses workflow module internally
