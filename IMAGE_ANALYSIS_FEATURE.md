# Image-to-Structured-Prompt Feature

## Overview

The Image Analysis feature in Pro Mode allows users to upload a product image and automatically generate a complete structured prompt that populates all form fields. This enables users to:

- Quickly recreate similar product images
- Learn from existing professional photography
- Use reference images as starting points
- Save time on manual prompt creation

## How It Works

### 1. User Workflow

```
Upload Image → AI Analysis → Auto-Fill Form → Edit & Refine → Generate New Image
```

1. **Upload Image**: User uploads a product image (JPEG, PNG, WebP, max 10MB)
2. **AI Analysis**: Gemini Vision API analyzes the image in extreme detail
3. **Auto-Fill Form**: All 8 sections of Pro Mode are automatically populated
4. **Edit & Refine**: User can review and modify any field
5. **Generate**: Create new image based on analyzed and refined prompt

### 2. Technical Architecture

#### Frontend (React/TypeScript)

- **Component**: `ImageAnalyzer.tsx`
  - File upload with preview
  - Base64 encoding
  - Loading states and error handling
  - Calls `/api/analyze-image` endpoint

#### Backend (Python/Flask)

- **Module**: `image_analyzer.py`
  - Uses Gemini 1.5 Flash Vision model
  - Detailed analysis prompt
  - JSON response parsing and validation
  
- **Endpoint**: `POST /api/analyze-image`
  - Accepts base64-encoded image
  - Returns structured prompt JSON
  - Error handling and logging

### 3. Analyzed Fields

The AI analyzes and populates all these fields:

#### Scene & Style

- `short_description`: Brief description of main subject
- `background_setting`: Detailed background description
- `style_medium`: Photography style or medium
- `artistic_style`: Overall artistic approach
- `context`: Additional context and purpose

#### Lighting

- `conditions`: Type and quality of lighting
- `direction`: Where light is coming from
- `shadows`: Shadow characteristics

#### Aesthetics

- `composition`: How elements are arranged
- `color_scheme`: Dominant colors and palette
- `mood_atmosphere`: Overall feeling

#### Camera

- `camera_angle`: Viewpoint and angle
- `lens_focal_length`: Lens type
- `depth_of_field`: Focus range
- `focus`: What's in focus

#### Objects

- Array of objects with detailed properties (optional)

## API Reference

### POST /api/analyze-image

Analyze an image and generate a structured prompt.

**Request:**

```json
{
  "image_base64": "base64_encoded_image_string"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "structured_prompt": {
    "short_description": "A premium wireless headphone...",
    "background_setting": "Clean gradient background...",
    "style_medium": "Professional Product Photography",
    "artistic_style": "Modern Minimalist",
    "context": "E-commerce product shot",
    "lighting": {
      "conditions": "Soft studio lighting",
      "direction": "Front and top",
      "shadows": "Minimal soft shadows"
    },
    "aesthetics": {
      "composition": "Centered with negative space",
      "color_scheme": "Monochromatic blacks and grays",
      "mood_atmosphere": "Professional and premium"
    },
    "photographic_characteristics": {
      "camera_angle": "Eye level straight on",
      "lens_focal_length": "85mm portrait lens",
      "depth_of_field": "Shallow depth of field",
      "focus": "Sharp focus on product"
    },
    "objects": []
  }
}
```

**Error Response (400/500):**

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Configuration

### API Key Setup

The feature requires a Gemini API key. Configure it in one of two ways:

**Option 1: Environment Variable (Recommended)**

```bash
# Windows CMD
set GOOGLE_API_KEY=your_gemini_api_key_here

# Windows PowerShell
$env:GOOGLE_API_KEY="your_gemini_api_key_here"

# Linux/Mac
export GOOGLE_API_KEY=your_gemini_api_key_here
```

**Option 2: Config File**

```python
# config.py
GEMINI_API_KEY = "your_gemini_api_key_here"
```

### File Size Limits

- **Maximum file size**: 10MB
- **Supported formats**: JPEG, PNG, WebP
- **Recommended**: High-quality product images for best analysis

## Usage Examples

### Example 1: Analyze Product Photo

```python
from image_analyzer import analyze_image_file

# Analyze an image file
structured_prompt = analyze_image_file('inputs/product_image.png')

# Use the structured prompt
print(structured_prompt['short_description'])
print(structured_prompt['lighting']['conditions'])
```

### Example 2: API Call from Frontend

```typescript
import { analyzeImage } from '@/lib/api';

// Convert file to base64
const base64 = await fileToBase64(file);
const base64Data = base64.split(',')[1];

// Analyze image
const result = await analyzeImage(base64Data);

if (result.success) {
  // Populate form with structured prompt
  setStructuredPrompt(result.structured_prompt);
}
```

## Benefits

### For Users

- **Time Saving**: No need to manually describe every aspect
- **Accuracy**: AI captures details humans might miss
- **Learning Tool**: See how professionals structure prompts
- **Consistency**: Recreate similar styles easily

### For Workflow

- **Faster Iteration**: Start with analyzed prompt, refine as needed
- **Better Results**: More detailed prompts = better images
- **Flexibility**: Can edit any field before generating
- **Optional**: Can skip and enter manually if preferred

## Integration with Pro Mode

The Image Analysis is seamlessly integrated as **Step 1** of the 8-step Pro Mode wizard:

1. **Image Analysis** (optional) ← NEW
2. Scene & Style
3. Photography Mode
4. Lighting
5. Aesthetics
6. Camera
7. Objects
8. Review & Generate

Users can:

- Upload image and auto-fill all fields
- Skip to manual entry
- Upload image, then edit fields before generating

## Error Handling

The feature includes comprehensive error handling:

- **Invalid file type**: Clear error message
- **File too large**: Size limit warning
- **Network errors**: Retry capability
- **API failures**: Detailed error messages
- **Invalid JSON**: Parsing error handling
- **Missing fields**: Validation errors

## Performance

- **Analysis time**: 10-30 seconds (depends on image size and API response)
- **Timeout**: 60 seconds
- **Loading states**: Visual feedback during analysis
- **Preview**: Image preview before analysis

## Future Enhancements

Potential improvements:

- Support for multiple images
- Batch analysis
- Save analyzed prompts
- Compare original vs generated
- Fine-tune analysis parameters
- Custom analysis prompts
