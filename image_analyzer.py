"""Image Analysis Module for Structured Prompt Generation.

This module uses Gemini Vision API to analyze product images and generate
structured prompts that can be used in Pro Mode.
"""

import base64
import json
import os
import google.generativeai as genai

# Get API key from config or environment variable
try:
    from config import GEMINI_API_KEY
    api_key = GEMINI_API_KEY
except ImportError:
    api_key = None

if not api_key or api_key == "your_gemini_api_key_here":
    api_key = os.environ.get('GOOGLE_API_KEY')

if not api_key:
    raise ValueError(
        "Gemini API key not found. Set GOOGLE_API_KEY environment variable or configure in config.py")

# Configure Gemini API
genai.configure(api_key=api_key)


def analyze_image_to_structured_prompt(image_base64: str) -> dict:
    """Analyze an image and generate a structured prompt.

    Args:
        image_base64: Base64-encoded image string

    Returns:
        dict: Structured prompt with all fields populated based on image analysis

    Raises:
        Exception: If Gemini API call fails
    """

    # Decode base64 image
    image_data = base64.b64decode(image_base64)

    # Create the analysis prompt
    analysis_prompt = """Analyze this product image in extreme detail and generate a structured prompt for recreating it.

You must respond with ONLY a valid JSON object (no markdown, no explanations) with this exact structure:

{
  "short_description": "Brief description of the main subject (50 words max)",
  "background_setting": "Detailed description of background, surfaces, environment (100 words max)",
  "style_medium": "Photography style or medium (e.g., 'Professional Product Photography', 'Digital Art', '3D Render')",
  "artistic_style": "Overall artistic approach (e.g., 'Minimalist', 'Luxury', 'Editorial', 'Commercial')",
  "context": "Additional context, mood, purpose (e.g., 'E-commerce product shot', 'Marketing hero image')",
  "lighting": {
    "conditions": "Type and quality of lighting (e.g., 'Soft studio lighting', 'Natural window light', 'Dramatic spotlights')",
    "direction": "Where light is coming from (e.g., 'Front and top', 'Side lighting from left', 'Backlit')",
    "shadows": "Shadow characteristics (e.g., 'Soft diffused shadows', 'Hard dramatic shadows', 'No shadows')"
  },
  "aesthetics": {
    "composition": "How elements are arranged (e.g., 'Centered with negative space', 'Rule of thirds', 'Diagonal composition')",
    "color_scheme": "Dominant colors and palette (e.g., 'Monochromatic blues', 'Warm earth tones', 'High contrast black and white')",
    "mood_atmosphere": "Overall feeling and atmosphere (e.g., 'Professional and clean', 'Warm and inviting', 'Bold and energetic')"
  },
  "photographic_characteristics": {
    "camera_angle": "Viewpoint and angle (e.g., 'Eye level straight on', '45-degree angle', 'Top-down flat lay', 'Low angle looking up')",
    "lens_focal_length": "Lens type and focal length (e.g., '50mm standard', '85mm portrait', '24mm wide angle', 'Macro lens')",
    "depth_of_field": "Focus range (e.g., 'Shallow depth of field with blurred background', 'Deep focus everything sharp', 'Medium depth')",
    "focus": "What's in focus (e.g., 'Product sharp, background soft', 'Everything in focus', 'Selective focus on details')"
  },
  "objects": [
    {
      "description": "Brief description of the object (e.g., 'A red ceramic coffee mug')",
      "location": "Where the object is positioned in the scene (e.g., 'Center foreground', 'Left side of frame', 'Background right')",
      "relationship": "How this object relates to other objects or the scene (e.g., 'Sitting on the table', 'Next to the laptop', 'Floating above surface')",
      "relative_size": "Size relative to other objects or frame (e.g., 'Large, occupying 40% of frame', 'Small accent piece', 'Medium-sized, proportional to hand')",
      "shape_and_color": "Detailed shape and color description (e.g., 'Cylindrical shape, glossy crimson red with white rim')",
      "texture": "Surface texture and material feel (e.g., 'Smooth glazed ceramic with slight sheen', 'Rough matte fabric', 'Polished metallic')",
      "appearance_details": "Additional visual details (e.g., 'Brand logo on side, slight reflection on surface, steam rising from top')"
    }
  ]
}

IMPORTANT: For the "objects" array, if there are multiple distinct objects in the image, create a separate entry for each one with ALL seven fields filled in. If the image is a simple product shot with just one main product, you can leave the objects array empty [] since the product is already described in short_description.

Analyze the image carefully and fill in each field with accurate, detailed descriptions. Be specific about colors, materials, lighting, and composition. The goal is to recreate this image as closely as possible using the structured prompt."""

    try:
        # Use Gemini Vision model
        model = genai.GenerativeModel('gemini-2.5-flash')

        # Create image part
        image_part = {
            "mime_type": "image/jpeg",
            "data": image_data
        }

        # Generate content
        response = model.generate_content([analysis_prompt, image_part])

        # Parse JSON response
        response_text = response.text.strip()

        # Remove markdown code blocks if present
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]

        response_text = response_text.strip()

        # Parse JSON
        structured_prompt = json.loads(response_text)

        # Validate structure
        required_fields = [
            'short_description', 'background_setting', 'style_medium',
            'artistic_style', 'context', 'lighting', 'aesthetics',
            'photographic_characteristics', 'objects'
        ]

        for field in required_fields:
            if field not in structured_prompt:
                raise ValueError(f"Missing required field: {field}")

        return structured_prompt

    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse Gemini response as JSON: {str(e)}")
    except Exception as e:
        raise Exception(f"Image analysis failed: {str(e)}")


def analyze_image_file(file_path: str) -> dict:
    """Analyze an image file and generate a structured prompt.

    Args:
        file_path: Path to image file

    Returns:
        dict: Structured prompt
    """
    with open(file_path, 'rb') as f:
        image_data = f.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        return analyze_image_to_structured_prompt(image_base64)
