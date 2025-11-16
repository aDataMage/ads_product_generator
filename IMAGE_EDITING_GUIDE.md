# Image Editing Features Guide

## Overview

The Image Editing Features extend the product image generation system with professional post-generation editing capabilities. Using Bria's Image Editing API, users can refine, enhance, and customize generated images without regenerating from scratch.

This guide covers all available editing features, their usage, best practices, and troubleshooting tips.

---

## Visual Documentation

This guide includes screenshots and animated GIFs demonstrating each editing tool. All visual assets are located in the `./docs/screenshots/` directory.

> **Note**: Screenshot placeholders are currently embedded in this documentation. To capture actual screenshots and GIFs, follow the detailed instructions in `./docs/screenshots/README.md`. The application must be running to capture these visuals.

### Screenshot Capture Instructions

To update or recreate the visual documentation:

1. **Start the application**:

   ```bash
   # Terminal 1: Start backend
   python api_server.py
   
   # Terminal 2: Start frontend
   cd elegant-flow-ui
   npm run dev
   ```

2. **Capture screenshots** using your preferred tool:
   - Windows: Snipping Tool, Snip & Sketch, or ShareX
   - macOS: Cmd+Shift+4 or Screenshot app
   - Linux: GNOME Screenshot or Flameshot

3. **Create GIFs** for animated demonstrations:
   - Use ScreenToGif (Windows), Kap (macOS), or Peek (Linux)
   - Keep GIFs under 5MB for documentation
   - Use 10-15 FPS for smooth playback
   - Crop to show only relevant UI areas

4. **Save files** with descriptive names in `./docs/screenshots/`:
   - Use kebab-case naming: `tool-name-description.png`
   - PNG for static screenshots (use compression)
   - GIF for animations and processes

5. **Optimize images**:
   - Compress PNGs using TinyPNG or similar
   - Optimize GIFs using Gifsicle or ezgif.com
   - Target: <500KB for PNGs, <2MB for GIFs

### Required Screenshots

The following visual assets should be captured:

**Background Manipulation**:

- `remove-background-tool.png` - Remove Background button interface
- `remove-background-comparison.gif` - Before/after animation
- `replace-background-interface.png` - Replace form with inputs
- `replace-background-presets.png` - Preset selector UI
- `replace-background-results.gif` - Multiple background replacements
- `blur-background-slider.png` - Blur strength slider control
- `blur-background-comparison.gif` - Blur progression animation

**Generative Fill**:

- `generative-fill-interface.png` - Complete editor interface
- `mask-drawing-tools.gif` - Drawing tools demonstration
- `generative-fill-process.gif` - Full workflow animation
- `generative-fill-examples.png` - Before/after examples

**Enhancement**:

- `enhance-quality-button.png` - Enhancement editor interface
- `enhance-quality-comparison.gif` - Before/after with slider
- `upscale-resolution-selector.png` - Upscale options UI
- `upscale-resolution-results.png` - Dimension comparison
- `upscale-detail-zoom.gif` - Detail zoom animation

**Canvas Expansion**:

- `canvas-expander-interface.png` - Expander UI with presets
- `canvas-expansion-preview.png` - Preview overlay
- `canvas-expansion-results.gif` - Multiple aspect ratios
- `canvas-expansion-examples.png` - Various examples

---

## Table of Contents

1. [Background Manipulation](#1-background-manipulation)
   - [Remove Background](#remove-background)
   - [Replace Background](#replace-background)
   - [Blur Background](#blur-background)
2. [Generative Fill](#2-generative-fill)
3. [Image Enhancement](#3-image-enhancement)
   - [Enhance Quality](#enhance-quality)
   - [Upscale Resolution](#upscale-resolution)
4. [Canvas Expansion](#4-canvas-expansion)
5. [API Reference](#api-reference)
6. [Best Practices](#best-practices)
7. [Limitations](#limitations)
8. [Troubleshooting](#troubleshooting)

---

## 1. Background Manipulation

### Remove Background

**Purpose**: Create transparent product shots by removing the background from generated images.

**Use Cases**:

- Product catalog images requiring transparency
- Images for overlay on different backgrounds
- E-commerce listings with white/transparent backgrounds

**Visual Example**:

![Remove Background Tool](./docs/screenshots/remove-background-tool.png)
*The Remove Background button in the Background Editor interface*

![Remove Background Before/After](./docs/screenshots/remove-background-comparison.gif)
*Animation showing background removal process: original image → processing → transparent background result*

**How to Use**:

**Frontend (React)**:

```typescript
import { BackgroundEditor } from './components/BackgroundEditor';

// In your component
<BackgroundEditor 
  imageUrl={generatedImageUrl}
  onEditComplete={(editedUrl) => console.log(editedUrl)}
/>
```

**Backend API**:

```bash
POST /api/edit/remove-background
Content-Type: application/json

{
  "image": "https://example.com/image.jpg",
  "preserve_alpha": true
}
```

**Response**:

```json
{
  "success": true,
  "result_url": "https://bria-api.com/results/abc123.png",
  "original_url": "https://example.com/image.jpg"
}
```

**Python Module**:

```python
from image_editor import remove_background

result = remove_background(
    image_url_or_base64="https://example.com/image.jpg",
    sync=False  # Use async processing
)

print(result['result_url'])
```

**Tips**:

- Works best with clear product boundaries
- Preserves fine details like hair, fur, or transparent objects
- Output format is PNG with alpha channel
- Processing time: 5-15 seconds

---

### Replace Background

**Purpose**: Replace the existing background with custom colors, gradients, or AI-generated scenes.

**Use Cases**:

- Match brand color guidelines
- Create consistent product line imagery
- Generate lifestyle or contextual backgrounds
- A/B testing different background styles

**Visual Example**:

![Replace Background Interface](./docs/screenshots/replace-background-interface.png)
*Replace Background form with prompt input and color picker*

![Replace Background Presets](./docs/screenshots/replace-background-presets.png)
*Background preset selector showing Studio, Outdoor, Abstract, and Solid Color categories*

![Replace Background Results](./docs/screenshots/replace-background-results.gif)
*Animation showing background replacement: original → white studio → marble surface → gradient background*

**How to Use**:

**Frontend (React)**:

```typescript
<BackgroundEditor 
  imageUrl={generatedImageUrl}
  mode="replace"
  onEditComplete={(editedUrl) => console.log(editedUrl)}
/>
```

**Backend API**:

```bash
POST /api/edit/replace-background
Content-Type: application/json

{
  "image": "https://example.com/image.jpg",
  "background_prompt": "white studio background with soft shadows",
  "background_color": "#FFFFFF"  // Optional: solid color
}
```

**Response**:

```json
{
  "success": true,
  "result_url": "https://bria-api.com/results/def456.jpg"
}
```

**Python Module**:

```python
from image_editor import replace_background

# With AI-generated background
result = replace_background(
    image_url_or_base64="https://example.com/image.jpg",
    background_prompt="luxury marble surface with soft lighting",
    sync=False
)

# With solid color (use hex color in prompt)
result = replace_background(
    image_url_or_base64="https://example.com/image.jpg",
    background_prompt="solid white background",
    sync=False
)
```

**Background Presets**:

The system includes pre-configured background presets:

- **Studio Backgrounds**: White, black, gray studio setups
- **Gradient Backgrounds**: Smooth color transitions
- **Natural Outdoor**: Garden, beach, forest scenes
- **Abstract Patterns**: Geometric, artistic backgrounds

Access presets via:

```typescript
import { backgroundPresets } from './constants/backgroundPresets';

// Use preset prompt
const preset = backgroundPresets.studio.white;
```

**Tips**:

- Be specific in prompts: "soft white studio background with subtle shadows"
- Avoid complex scenes that might distract from the product
- Use negative prompts to avoid unwanted elements
- Processing time: 10-20 seconds

---

### Blur Background

**Purpose**: Create depth-of-field effects by blurring the background while keeping the product sharp.

**Use Cases**:

- Emphasize product focus
- Create professional bokeh effects
- Simulate DSLR camera depth-of-field
- Reduce background distractions

**Visual Example**:

![Blur Background Slider](./docs/screenshots/blur-background-slider.png)
*Blur strength slider control (0-100) with real-time preview*

![Blur Background Comparison](./docs/screenshots/blur-background-comparison.gif)
*Animation showing blur strength progression: 0% → 25% → 50% → 75% → 100%*

**How to Use**:

**Frontend (React)**:

```typescript
<BackgroundEditor 
  imageUrl={generatedImageUrl}
  mode="blur"
  blurStrength={50}  // 0-100
  onEditComplete={(editedUrl) => console.log(editedUrl)}
/>
```

**Backend API**:

```bash
POST /api/edit/blur-background
Content-Type: application/json

{
  "image": "https://example.com/image.jpg",
  "blur_strength": 50  // Range: 0-100
}
```

**Response**:

```json
{
  "success": true,
  "result_url": "https://bria-api.com/results/ghi789.jpg"
}
```

**Python Module**:

```python
from image_editor import blur_background

result = blur_background(
    image_url_or_base64="https://example.com/image.jpg",
    blur_strength=50,  # 0 = no blur, 100 = maximum blur
    sync=False
)
```

**Blur Strength Guide**:

- **0-25**: Subtle blur, slight depth
- **26-50**: Moderate blur, clear focus separation
- **51-75**: Strong blur, dramatic effect
- **76-100**: Maximum blur, abstract background

**Tips**:

- Start with 40-60 for natural-looking results
- Higher values work better with busy backgrounds
- Product edges remain sharp automatically
- Processing time: 5-10 seconds

---

## 2. Generative Fill

**Purpose**: Add, modify, or fill specific regions of the image using AI-generated content based on text prompts.

**Use Cases**:

- Add props or accessories around products
- Fill in missing or unwanted areas
- Extend product context (e.g., add flowers, decorations)
- Remove unwanted objects and fill naturally
- Create lifestyle scenes around products

**Visual Example**:

![Generative Fill Interface](./docs/screenshots/generative-fill-interface.png)
*Complete Generative Fill editor showing mask canvas, prompt inputs, and version selector*

![Mask Drawing Tools](./docs/screenshots/mask-drawing-tools.gif)
*Animation demonstrating brush tool, eraser, size adjustment, and undo/redo functionality*

![Generative Fill Process](./docs/screenshots/generative-fill-process.gif)
*Step-by-step: Draw mask → Enter prompt → Generate → View result with refined prompt*

![Generative Fill Examples](./docs/screenshots/generative-fill-examples.png)
*Before/after examples: adding flowers, props, and context elements around products*

**How to Use**:

**Frontend (React)**:

```typescript
import { GenerativeFillEditor } from './components/GenerativeFillEditor';
import { MaskDrawingCanvas } from './components/MaskDrawingCanvas';

<GenerativeFillEditor 
  imageUrl={generatedImageUrl}
  onEditComplete={(editedUrl, refinedPrompt) => {
    console.log('Edited:', editedUrl);
    console.log('AI refined prompt:', refinedPrompt);
  }}
/>
```

**Backend API**:

```bash
POST /api/edit/generative-fill
Content-Type: application/json

{
  "image": "https://example.com/image.jpg",
  "mask": "data:image/png;base64,iVBORw0KG...",  // Base64 mask
  "prompt": "add flowers around the product",
  "negative_prompt": "blurry, distorted, low quality",
  "version": 2  // Use v2 for better results
}
```

**Response**:

```json
{
  "success": true,
  "result_url": "https://bria-api.com/results/jkl012.jpg",
  "refined_prompt": "vibrant fresh flowers arranged naturally around the product with soft lighting"
}
```

**Python Module**:

```python
from image_editor import generative_fill

result = generative_fill(
    image_url_or_base64="https://example.com/image.jpg",
    mask="data:image/png;base64,iVBORw0KG...",
    prompt="add coffee beans scattered around the mug",
    negative_prompt="blurry, artificial, plastic",
    version=2,
    sync=False
)

print(f"Result: {result['result_url']}")
print(f"Refined prompt: {result.get('refined_prompt', 'N/A')}")
```

**Mask Drawing**:

The mask defines which areas to fill/modify:

1. **White areas**: Regions to be generated/modified
2. **Black areas**: Regions to preserve unchanged
3. **Gray areas**: Partial blending (50% opacity)

**Drawing Tools**:

- **Brush**: Paint mask areas (adjustable size)
- **Eraser**: Remove mask areas
- **Clear**: Reset entire mask
- **Undo/Redo**: Step through drawing history

**Version Differences**:

| Feature | Version 1 | Version 2 |
|---------|-----------|-----------|
| Quality | Good | Excellent |
| Speed | Faster (10-15s) | Slower (15-25s) |
| Prompt Refinement | No | Yes |
| Context Understanding | Basic | Advanced |

**Tips**:

- Use version 2 for production-quality results
- Be specific in prompts: "red roses with green stems" vs "flowers"
- Use negative prompts to avoid common issues
- Draw masks slightly larger than the target area
- Test with different brush sizes for precision
- Processing time: 15-25 seconds (v2)

**Example Prompts**:

- "add wooden cutting board under the product"
- "place product on marble countertop with kitchen utensils"
- "surround with fresh ingredients and herbs"
- "add soft fabric draping in the background"

---

## 3. Image Enhancement

### Enhance Quality

**Purpose**: Automatically improve image quality by adjusting brightness, contrast, sharpness, and color balance.

**Use Cases**:

- Fix underexposed or overexposed images
- Improve color vibrancy
- Sharpen soft details
- Balance lighting inconsistencies
- Prepare images for print

**Visual Example**:

![Enhance Quality Button](./docs/screenshots/enhance-quality-button.png)
*Enhancement Editor interface with "Enhance Quality" button*

![Enhance Quality Comparison](./docs/screenshots/enhance-quality-comparison.gif)
*Side-by-side comparison slider showing before/after enhancement with improved brightness, contrast, and sharpness*

**How to Use**:

**Frontend (React)**:

```typescript
import { EnhancementEditor } from './components/EnhancementEditor';

<EnhancementEditor 
  imageUrl={generatedImageUrl}
  onEditComplete={(editedUrl) => console.log(editedUrl)}
/>
```

**Backend API**:

```bash
POST /api/edit/enhance
Content-Type: application/json

{
  "image": "https://example.com/image.jpg"
}
```

**Response**:

```json
{
  "success": true,
  "result_url": "https://bria-api.com/results/mno345.jpg"
}
```

**Python Module**:

```python
from image_editor import enhance_image

result = enhance_image(
    image_url_or_base64="https://example.com/image.jpg",
    sync=False
)
```

**What Gets Enhanced**:

- **Brightness**: Automatic exposure correction
- **Contrast**: Dynamic range optimization
- **Sharpness**: Edge enhancement without artifacts
- **Color**: Saturation and white balance adjustment
- **Noise**: Reduction of digital noise

**Tips**:

- Works best on images with minor quality issues
- Cannot fix severely damaged or low-resolution images
- Compare before/after using the comparison slider
- Processing time: 5-10 seconds

---

### Upscale Resolution

**Purpose**: Increase image resolution using AI upscaling for print-quality outputs.

**Use Cases**:

- Prepare images for large format printing
- Create high-resolution product sheets
- Generate billboard or poster materials
- Improve detail for zoom functionality
- Archive high-quality versions

**Visual Example**:

![Upscale Resolution Selector](./docs/screenshots/upscale-resolution-selector.png)
*Resolution upscale selector showing 2x and 4x options with dimension preview*

![Upscale Resolution Results](./docs/screenshots/upscale-resolution-results.png)
*Comparison showing original (1024×1024) vs 2x upscaled (2048×2048) with dimension labels and file sizes*

![Upscale Detail Zoom](./docs/screenshots/upscale-detail-zoom.gif)
*Animation zooming into product details showing quality improvement from upscaling*

**How to Use**:

**Frontend (React)**:

```typescript
<EnhancementEditor 
  imageUrl={generatedImageUrl}
  upscaleFactor={2}  // 2x or 4x
  onEditComplete={(editedUrl, newDimensions) => {
    console.log('Upscaled:', editedUrl);
    console.log('New size:', newDimensions);
  }}
/>
```

**Backend API**:

```bash
POST /api/edit/upscale
Content-Type: application/json

{
  "image": "https://example.com/image.jpg",
  "scale_factor": 2  // 2 or 4
}
```

**Response**:

```json
{
  "success": true,
  "result_url": "https://bria-api.com/results/pqr678.jpg",
  "original_dimensions": {"width": 1024, "height": 1024},
  "new_dimensions": {"width": 2048, "height": 2048}
}
```

**Python Module**:

```python
from image_editor import increase_resolution

result = increase_resolution(
    image_url_or_base64="https://example.com/image.jpg",
    scale_factor=2,  # 2x or 4x
    sync=False
)

print(f"Original: {result['original_dimensions']}")
print(f"Upscaled: {result['new_dimensions']}")
```

**Scale Factor Guide**:

| Factor | Input | Output | Use Case | File Size |
|--------|-------|--------|----------|-----------|
| 2x | 1024×1024 | 2048×2048 | Web, small prints | ~2-4 MB |
| 4x | 1024×1024 | 4096×4096 | Large prints, billboards | ~8-15 MB |

**Tips**:

- Use 2x for most web and print needs
- Use 4x only for large format printing
- Upscaling cannot add detail that doesn't exist
- Best results with already high-quality images
- Consider file size for web delivery
- Processing time: 10-20 seconds (2x), 20-40 seconds (4x)

**Print Resolution Guide**:

- **Web**: 72-150 DPI (2x usually sufficient)
- **Photo prints**: 300 DPI (2x recommended)
- **Large format**: 150-300 DPI (4x for billboards)
- **Magazines**: 300 DPI (2x-4x depending on size)

---

## 4. Canvas Expansion

**Purpose**: Expand the canvas to different aspect ratios while intelligently filling new areas with contextually appropriate content.

**Use Cases**:

- Convert square images to landscape/portrait
- Adapt images for different platforms (Instagram, Facebook, Pinterest)
- Create multiple aspect ratios from one image
- Add breathing room around products
- Prepare images for specific print formats

**Visual Example**:

![Canvas Expander Interface](./docs/screenshots/canvas-expander-interface.png)
*Canvas Expander showing aspect ratio presets (1:1, 4:3, 16:9, 9:16) and custom dimension inputs*

![Canvas Expansion Preview](./docs/screenshots/canvas-expansion-preview.png)
*Visual preview overlay showing original image boundaries and new canvas areas to be generated (highlighted)*

![Canvas Expansion Results](./docs/screenshots/canvas-expansion-results.gif)
*Animation showing expansion from 1:1 square → 16:9 landscape → 9:16 portrait with natural background fill*

![Canvas Expansion Examples](./docs/screenshots/canvas-expansion-examples.png)
*Multiple examples showing different aspect ratio conversions with various background styles*

**How to Use**:

**Frontend (React)**:

```typescript
import { CanvasExpander } from './components/CanvasExpander';

<CanvasExpander 
  imageUrl={generatedImageUrl}
  onEditComplete={(editedUrl, dimensions) => {
    console.log('Expanded:', editedUrl);
    console.log('New dimensions:', dimensions);
  }}
/>
```

**Backend API**:

```bash
POST /api/edit/expand
Content-Type: application/json

{
  "image": "https://example.com/image.jpg",
  "target_width": 1920,
  "target_height": 1080,
  "prompt": "continue the background naturally"  // Optional
}
```

**Response**:

```json
{
  "success": true,
  "result_url": "https://bria-api.com/results/stu901.jpg",
  "original_dimensions": {"width": 1024, "height": 1024},
  "new_dimensions": {"width": 1920, "height": 1080}
}
```

**Python Module**:

```python
from image_editor import expand_image

result = expand_image(
    image_url_or_base64="https://example.com/image.jpg",
    target_width=1920,
    target_height=1080,
    prompt="extend the white studio background naturally",
    sync=False
)
```

**Aspect Ratio Presets**:

| Preset | Ratio | Dimensions | Use Case |
|--------|-------|------------|----------|
| Square | 1:1 | 1024×1024 | Instagram posts |
| Landscape | 16:9 | 1920×1080 | YouTube thumbnails, presentations |
| Portrait | 9:16 | 1080×1920 | Instagram Stories, TikTok |
| Standard | 4:3 | 1600×1200 | Traditional displays |
| Wide | 21:9 | 2560×1080 | Ultrawide displays |

**Custom Dimensions**:

- Minimum: 512px on any side
- Maximum: 4096px on any side
- Original image must fit within new dimensions
- Product remains centered by default

**Expansion Prompts**:

Prompts guide how new areas are filled:

**Good Prompts**:

- "continue the white studio background smoothly"
- "extend the wooden table surface naturally"
- "expand the outdoor garden scene with more flowers"
- "fill with matching marble texture"

**Avoid**:

- Vague prompts: "make it bigger"
- Conflicting prompts: "add sky" when expanding a studio shot
- Overly complex: "add mountains, trees, and a sunset"

**Tips**:

- Preview shows exactly what will be expanded
- Product stays in original position
- New areas blend seamlessly with existing content
- Use prompts for better context matching
- Processing time: 15-25 seconds

**Platform-Specific Recommendations**:

| Platform | Recommended Size | Aspect Ratio |
|----------|------------------|--------------|
| Instagram Feed | 1080×1080 | 1:1 |
| Instagram Story | 1080×1920 | 9:16 |
| Facebook Post | 1200×630 | 1.91:1 |
| Pinterest Pin | 1000×1500 | 2:3 |
| Twitter Post | 1200×675 | 16:9 |
| LinkedIn Post | 1200×627 | 1.91:1 |

---

## API Reference

### Base URL

```
http://localhost:5000/api/edit
```

### Authentication

All requests require the Bria API key configured in `config.py`:

```python
BRIA_API_KEY = "your_api_key_here"
```

### Common Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | string | Yes | Image URL or base64 data URI |
| `sync` | boolean | No | Use synchronous processing (default: false) |

### Common Response Format

**Success Response**:

```json
{
  "success": true,
  "result_url": "https://bria-api.com/results/abc123.jpg",
  "processing_time": 12.5,
  "original_url": "https://example.com/image.jpg"
}
```

**Error Response**:

```json
{
  "success": false,
  "error": "Invalid image format",
  "error_code": "INVALID_FORMAT",
  "details": "Supported formats: JPG, PNG, WEBP"
}
```

### Endpoint Details

#### 1. Remove Background

```
POST /api/edit/remove-background
```

**Request Body**:

```json
{
  "image": "string (URL or base64)",
  "preserve_alpha": "boolean (optional, default: true)"
}
```

**Response**: Standard success/error format with `result_url`

---

#### 2. Replace Background

```
POST /api/edit/replace-background
```

**Request Body**:

```json
{
  "image": "string (URL or base64)",
  "background_prompt": "string (required)",
  "background_color": "string (optional, hex color)"
}
```

**Response**: Standard success/error format with `result_url`

---

#### 3. Blur Background

```
POST /api/edit/blur-background
```

**Request Body**:

```json
{
  "image": "string (URL or base64)",
  "blur_strength": "integer (0-100, required)"
}
```

**Response**: Standard success/error format with `result_url`

---

#### 4. Generative Fill

```
POST /api/edit/generative-fill
```

**Request Body**:

```json
{
  "image": "string (URL or base64)",
  "mask": "string (URL or base64, required)",
  "prompt": "string (required)",
  "negative_prompt": "string (optional)",
  "version": "integer (1 or 2, default: 2)"
}
```

**Response**:

```json
{
  "success": true,
  "result_url": "string",
  "refined_prompt": "string (v2 only)"
}
```

---

#### 5. Expand Canvas

```
POST /api/edit/expand
```

**Request Body**:

```json
{
  "image": "string (URL or base64)",
  "target_width": "integer (required)",
  "target_height": "integer (required)",
  "prompt": "string (optional)"
}
```

**Response**:

```json
{
  "success": true,
  "result_url": "string",
  "original_dimensions": {"width": 1024, "height": 1024},
  "new_dimensions": {"width": 1920, "height": 1080}
}
```

---

#### 6. Enhance Image

```
POST /api/edit/enhance
```

**Request Body**:

```json
{
  "image": "string (URL or base64)"
}
```

**Response**: Standard success/error format with `result_url`

---

#### 7. Upscale Resolution

```
POST /api/edit/upscale
```

**Request Body**:

```json
{
  "image": "string (URL or base64)",
  "scale_factor": "integer (2 or 4, required)"
}
```

**Response**:

```json
{
  "success": true,
  "result_url": "string",
  "original_dimensions": {"width": 1024, "height": 1024},
  "new_dimensions": {"width": 2048, "height": 2048}
}
```

---

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `INVALID_FORMAT` | Unsupported image format | Use JPG, PNG, or WEBP |
| `FILE_TOO_LARGE` | Image exceeds size limit | Reduce image size to <10MB |
| `INVALID_DIMENSIONS` | Invalid target dimensions | Check min/max dimension limits |
| `INVALID_MASK` | Mask format or size mismatch | Ensure mask matches image dimensions |
| `API_ERROR` | Bria API error | Check API key and service status |
| `TIMEOUT` | Processing timeout | Retry with smaller image or sync mode |
| `RATE_LIMIT` | Too many requests | Wait and retry |

---

## Usage Examples

This section provides complete end-to-end examples for common editing workflows.

### Example 1: E-Commerce Product Catalog

**Scenario**: You have a generated product image and need to create multiple versions for different catalog pages.

**Workflow**:

```python
from image_editor import remove_background, replace_background, enhance_image, increase_resolution

# Step 1: Remove background for transparent version
transparent_result = remove_background(
    image_url_or_base64="https://example.com/product.jpg",
    sync=False
)
transparent_url = transparent_result['result_url']
print(f"Transparent version: {transparent_url}")

# Step 2: Create white background version
white_bg_result = replace_background(
    image_url_or_base64=transparent_url,
    background_prompt="pure white studio background with subtle soft shadows",
    sync=False
)
white_bg_url = white_bg_result['result_url']
print(f"White background version: {white_bg_url}")

# Step 3: Create lifestyle version
lifestyle_result = replace_background(
    image_url_or_base64=transparent_url,
    background_prompt="modern kitchen countertop with natural wood texture and soft morning light",
    sync=False
)
lifestyle_url = lifestyle_result['result_url']
print(f"Lifestyle version: {lifestyle_url}")

# Step 4: Enhance and upscale for print catalog
enhanced_result = enhance_image(
    image_url_or_base64=white_bg_url,
    sync=False
)
enhanced_url = enhanced_result['result_url']

print_ready_result = increase_resolution(
    image_url_or_base64=enhanced_url,
    scale_factor=2,
    sync=False
)
print_ready_url = print_ready_result['result_url']
print(f"Print-ready version (2048×2048): {print_ready_url}")
```

**Result**: Four versions of the same product:

1. Transparent PNG for flexible use
2. White background for clean catalog pages
3. Lifestyle context for marketing materials
4. High-resolution enhanced version for print

---

### Example 2: Social Media Content Creation

**Scenario**: Create platform-specific versions of a product image for Instagram, Facebook, and Pinterest.

**Workflow**:

```python
from image_editor import expand_image, enhance_image, blur_background

original_image = "https://example.com/product-square.jpg"

# Instagram Feed (1:1 - already square, just enhance)
instagram_feed = enhance_image(
    image_url_or_base64=original_image,
    sync=False
)
print(f"Instagram Feed (1080×1080): {instagram_feed['result_url']}")

# Instagram Story (9:16 portrait)
instagram_story = expand_image(
    image_url_or_base64=original_image,
    target_width=1080,
    target_height=1920,
    prompt="extend the soft gradient background vertically with matching colors",
    sync=False
)
print(f"Instagram Story (1080×1920): {instagram_story['result_url']}")

# Facebook Post (16:9 landscape)
facebook_post = expand_image(
    image_url_or_base64=original_image,
    target_width=1200,
    target_height=630,
    prompt="expand the background horizontally maintaining the studio aesthetic",
    sync=False
)
print(f"Facebook Post (1200×630): {facebook_post['result_url']}")

# Pinterest Pin (2:3 portrait)
pinterest_pin = expand_image(
    image_url_or_base64=original_image,
    target_width=1000,
    target_height=1500,
    prompt="extend vertically with soft bokeh background",
    sync=False
)
print(f"Pinterest Pin (1000×1500): {pinterest_pin['result_url']}")

# Add depth effect for hero image
hero_image = blur_background(
    image_url_or_base64=facebook_post['result_url'],
    blur_strength=60,
    sync=False
)
print(f"Hero image with depth: {hero_image['result_url']}")
```

**Result**: Five platform-optimized versions ready for social media posting.

---

### Example 3: Product Photography Enhancement

**Scenario**: Improve a generated product image that needs quality adjustments and context additions.

**Workflow**:

```python
from image_editor import enhance_image, generative_fill, increase_resolution
import base64

original_image = "https://example.com/coffee-mug.jpg"

# Step 1: Enhance overall quality
enhanced = enhance_image(
    image_url_or_base64=original_image,
    sync=False
)
print(f"Enhanced: {enhanced['result_url']}")

# Step 2: Add context with generative fill
# Assume we have a mask drawn around the mug (white areas to fill)
mask_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."  # Your mask

with_context = generative_fill(
    image_url_or_base64=enhanced['result_url'],
    mask=mask_base64,
    prompt="scattered coffee beans and a small wooden spoon on rustic wooden table",
    negative_prompt="blurry, artificial, plastic, low quality",
    version=2,
    sync=False
)
print(f"With context: {with_context['result_url']}")
print(f"AI refined prompt: {with_context.get('refined_prompt', 'N/A')}")

# Step 3: Upscale for print
final_result = increase_resolution(
    image_url_or_base64=with_context['result_url'],
    scale_factor=2,
    sync=False
)
print(f"Final print-ready: {final_result['result_url']}")
print(f"Dimensions: {final_result['new_dimensions']}")
```

**Result**: Professional product photography with enhanced quality, added context, and print-ready resolution.

---

### Example 4: Batch Background Replacement

**Scenario**: Apply consistent brand backgrounds to multiple product images.

**Workflow**:

```python
from image_editor import replace_background
import os

# List of product images
product_images = [
    "https://example.com/product1.jpg",
    "https://example.com/product2.jpg",
    "https://example.com/product3.jpg",
    "https://example.com/product4.jpg",
]

# Brand background style
brand_background = "soft gradient from light blue to white, professional studio lighting, subtle shadows"

results = []

for idx, image_url in enumerate(product_images, 1):
    print(f"Processing product {idx}/{len(product_images)}...")
    
    result = replace_background(
        image_url_or_base64=image_url,
        background_prompt=brand_background,
        sync=False
    )
    
    results.append({
        'original': image_url,
        'edited': result['result_url'],
        'product_id': f"product_{idx}"
    })
    
    print(f"✓ Product {idx} complete: {result['result_url']}")

# Save results
print(f"\nProcessed {len(results)} products with consistent branding")
for item in results:
    print(f"{item['product_id']}: {item['edited']}")
```

**Result**: All products with consistent brand background styling.

---

### Example 5: Creating Product Variations

**Scenario**: Create multiple background variations of a single product for A/B testing.

**Workflow**:

```python
from image_editor import replace_background, blur_background

original_image = "https://example.com/watch.jpg"

# Define background variations
backgrounds = {
    'white_studio': "pure white studio background with soft shadows",
    'black_luxury': "matte black background with dramatic side lighting",
    'marble_surface': "white marble surface with gold veins and soft reflections",
    'wooden_table': "natural oak wood table with warm lighting",
    'gradient_blue': "smooth gradient from navy blue to light blue",
}

variations = {}

# Create each variation
for name, prompt in backgrounds.items():
    print(f"Creating {name} variation...")
    
    result = replace_background(
        image_url_or_base64=original_image,
        background_prompt=prompt,
        sync=False
    )
    
    variations[name] = result['result_url']
    print(f"✓ {name}: {result['result_url']}")

# Also create a blurred version
print("Creating blurred background variation...")
blurred = blur_background(
    image_url_or_base64=original_image,
    blur_strength=70,
    sync=False
)
variations['blurred_depth'] = blurred['result_url']

# Display all variations
print("\nAll variations created:")
for name, url in variations.items():
    print(f"  {name}: {url}")
```

**Result**: Six different background variations for testing which performs best.

---

### Example 6: Print-Ready Workflow

**Scenario**: Prepare a product image for large format printing (poster/billboard).

**Workflow**:

```python
from image_editor import remove_background, replace_background, enhance_image, increase_resolution

original_image = "https://example.com/product.jpg"

# Step 1: Remove background for clean extraction
print("Step 1: Removing background...")
transparent = remove_background(
    image_url_or_base64=original_image,
    sync=False
)

# Step 2: Replace with print-appropriate background
print("Step 2: Adding print background...")
with_background = replace_background(
    image_url_or_base64=transparent['result_url'],
    background_prompt="professional studio background with soft gradient, optimized for print",
    sync=False
)

# Step 3: Enhance quality
print("Step 3: Enhancing quality...")
enhanced = enhance_image(
    image_url_or_base64=with_background['result_url'],
    sync=False
)

# Step 4: Upscale to 4x for large format
print("Step 4: Upscaling to 4x resolution...")
print_ready = increase_resolution(
    image_url_or_base64=enhanced['result_url'],
    scale_factor=4,
    sync=False
)

print(f"\n✓ Print-ready image created!")
print(f"  URL: {print_ready['result_url']}")
print(f"  Original: {print_ready['original_dimensions']}")
print(f"  Final: {print_ready['new_dimensions']}")
print(f"  Suitable for: Large format printing at 150-300 DPI")
```

**Result**: High-resolution (4096×4096) print-ready image suitable for billboards and posters.

---

### Example 7: Interactive Frontend Usage (React)

**Scenario**: Implement editing features in a React application.

**Complete Component Example**:

```typescript
import React, { useState } from 'react';
import { BackgroundEditor } from './components/BackgroundEditor';
import { GenerativeFillEditor } from './components/GenerativeFillEditor';
import { EnhancementEditor } from './components/EnhancementEditor';
import { CanvasExpander } from './components/CanvasExpander';
import { ImageComparisonSlider } from './components/ImageComparisonSlider';

interface EditingWorkflowProps {
  generatedImageUrl: string;
}

export const EditingWorkflow: React.FC<EditingWorkflowProps> = ({ generatedImageUrl }) => {
  const [currentImage, setCurrentImage] = useState(generatedImageUrl);
  const [originalImage] = useState(generatedImageUrl);
  const [editHistory, setEditHistory] = useState<string[]>([generatedImageUrl]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeEditor, setActiveEditor] = useState<string | null>(null);

  const handleEditComplete = (editedUrl: string) => {
    // Add to history
    const newHistory = [...editHistory.slice(0, currentIndex + 1), editedUrl];
    setEditHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    setCurrentImage(editedUrl);
    setActiveEditor(null);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentImage(editHistory[currentIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (currentIndex < editHistory.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentImage(editHistory[currentIndex + 1]);
    }
  };

  const handleReset = () => {
    setCurrentImage(originalImage);
    setEditHistory([originalImage]);
    setCurrentIndex(0);
  };

  return (
    <div className="editing-workflow">
      {/* Toolbar */}
      <div className="editing-toolbar">
        <button onClick={() => setActiveEditor('background')}>
          Background Tools
        </button>
        <button onClick={() => setActiveEditor('generative-fill')}>
          Generative Fill
        </button>
        <button onClick={() => setActiveEditor('enhance')}>
          Enhance
        </button>
        <button onClick={() => setActiveEditor('expand')}>
          Expand Canvas
        </button>
        
        <div className="history-controls">
          <button onClick={handleUndo} disabled={currentIndex === 0}>
            Undo
          </button>
          <button onClick={handleRedo} disabled={currentIndex === editHistory.length - 1}>
            Redo
          </button>
          <button onClick={handleReset}>
            Reset to Original
          </button>
        </div>
      </div>

      {/* Image Display with Comparison */}
      <ImageComparisonSlider
        originalImage={originalImage}
        editedImage={currentImage}
      />

      {/* Active Editor */}
      {activeEditor === 'background' && (
        <BackgroundEditor
          imageUrl={currentImage}
          onEditComplete={handleEditComplete}
          onCancel={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === 'generative-fill' && (
        <GenerativeFillEditor
          imageUrl={currentImage}
          onEditComplete={handleEditComplete}
          onCancel={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === 'enhance' && (
        <EnhancementEditor
          imageUrl={currentImage}
          onEditComplete={handleEditComplete}
          onCancel={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === 'expand' && (
        <CanvasExpander
          imageUrl={currentImage}
          onEditComplete={handleEditComplete}
          onCancel={() => setActiveEditor(null)}
        />
      )}

      {/* Download Options */}
      <div className="download-options">
        <a href={originalImage} download="original.jpg">
          Download Original
        </a>
        <a href={currentImage} download="edited.jpg">
          Download Edited
        </a>
      </div>
    </div>
  );
};
```

**Result**: Full-featured editing interface with undo/redo, comparison slider, and all editing tools.

---

### Example 8: API Integration with Error Handling

**Scenario**: Robust API integration with proper error handling and retries.

**Complete Implementation**:

```python
from image_editor import replace_background, enhance_image
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def edit_with_retry(edit_function, max_retries=3, **kwargs):
    """
    Execute an editing function with retry logic.
    """
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempt {attempt + 1}/{max_retries}")
            result = edit_function(**kwargs)
            
            if result.get('success'):
                logger.info(f"✓ Success: {result['result_url']}")
                return result
            else:
                logger.warning(f"Failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            logger.error(f"Exception: {str(e)}")
            
        if attempt < max_retries - 1:
            wait_time = 2 ** attempt  # Exponential backoff
            logger.info(f"Waiting {wait_time}s before retry...")
            time.sleep(wait_time)
    
    raise Exception(f"Failed after {max_retries} attempts")

# Usage example
try:
    # Replace background with retry
    result = edit_with_retry(
        replace_background,
        image_url_or_base64="https://example.com/product.jpg",
        background_prompt="white studio background",
        sync=False,
        max_retries=3
    )
    
    # Enhance with retry
    enhanced = edit_with_retry(
        enhance_image,
        image_url_or_base64=result['result_url'],
        sync=False,
        max_retries=3
    )
    
    print(f"Final result: {enhanced['result_url']}")
    
except Exception as e:
    logger.error(f"Editing workflow failed: {str(e)}")
    # Handle failure (notify user, use fallback, etc.)
```

**Result**: Robust editing workflow with automatic retries and comprehensive error handling.

---

### Example 9: Chaining Multiple Edits

**Scenario**: Create a complex editing pipeline with multiple operations.

**Workflow**:

```python
from image_editor import (
    remove_background,
    replace_background,
    generative_fill,
    enhance_image,
    increase_resolution
)

def create_premium_product_image(original_url, mask_base64=None):
    """
    Complete pipeline: remove bg → replace bg → add context → enhance → upscale
    """
    print("Starting premium product image pipeline...")
    
    # Step 1: Remove background
    print("1/5: Removing background...")
    step1 = remove_background(original_url, sync=False)
    
    # Step 2: Replace with luxury background
    print("2/5: Adding luxury background...")
    step2 = replace_background(
        step1['result_url'],
        background_prompt="elegant marble surface with soft gold accents and professional lighting",
        sync=False
    )
    
    # Step 3: Add context elements (if mask provided)
    if mask_base64:
        print("3/5: Adding context elements...")
        step3 = generative_fill(
            step2['result_url'],
            mask=mask_base64,
            prompt="add elegant gold jewelry pieces and silk fabric around the product",
            negative_prompt="cheap, plastic, cluttered",
            version=2,
            sync=False
        )
    else:
        print("3/5: Skipping generative fill (no mask provided)")
        step3 = step2
    
    # Step 4: Enhance quality
    print("4/5: Enhancing quality...")
    step4 = enhance_image(step3['result_url'], sync=False)
    
    # Step 5: Upscale for premium quality
    print("5/5: Upscaling to 2x...")
    step5 = increase_resolution(step4['result_url'], scale_factor=2, sync=False)
    
    print("✓ Pipeline complete!")
    return {
        'original': original_url,
        'transparent': step1['result_url'],
        'with_background': step2['result_url'],
        'with_context': step3['result_url'],
        'enhanced': step4['result_url'],
        'final': step5['result_url'],
        'dimensions': step5['new_dimensions']
    }

# Execute pipeline
result = create_premium_product_image(
    original_url="https://example.com/watch.jpg",
    mask_base64="data:image/png;base64,..."  # Optional
)

print("\nPipeline Results:")
for stage, url in result.items():
    if isinstance(url, str):
        print(f"  {stage}: {url}")
    else:
        print(f"  {stage}: {url}")
```

**Result**: Complete transformation from basic product image to premium marketing asset.

---

### Example 10: Webhook Integration for Async Processing

**Scenario**: Implement webhook callbacks for long-running editing operations.

**Backend Implementation**:

```python
from flask import Flask, request, jsonify
from image_editor import increase_resolution
import threading

app = Flask(__name__)

# Store for tracking jobs
jobs = {}

def process_edit_async(job_id, image_url, callback_url):
    """
    Process edit in background and call webhook when complete.
    """
    try:
        result = increase_resolution(
            image_url_or_base64=image_url,
            scale_factor=4,
            sync=False
        )
        
        jobs[job_id] = {
            'status': 'completed',
            'result_url': result['result_url']
        }
        
        # Call webhook
        if callback_url:
            import requests
            requests.post(callback_url, json={
                'job_id': job_id,
                'status': 'completed',
                'result_url': result['result_url']
            })
            
    except Exception as e:
        jobs[job_id] = {
            'status': 'failed',
            'error': str(e)
        }

@app.route('/api/edit/upscale-async', methods=['POST'])
def upscale_async():
    data = request.json
    job_id = f"job_{int(time.time())}"
    
    jobs[job_id] = {'status': 'processing'}
    
    # Start background processing
    thread = threading.Thread(
        target=process_edit_async,
        args=(job_id, data['image'], data.get('callback_url'))
    )
    thread.start()
    
    return jsonify({
        'job_id': job_id,
        'status': 'processing',
        'status_url': f'/api/jobs/{job_id}'
    })

@app.route('/api/jobs/<job_id>', methods=['GET'])
def get_job_status(job_id):
    if job_id not in jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    return jsonify(jobs[job_id])
```

**Client Usage**:

```python
import requests
import time

# Submit job
response = requests.post('http://localhost:5000/api/edit/upscale-async', json={
    'image': 'https://example.com/product.jpg',
    'callback_url': 'https://myapp.com/webhook/edit-complete'
})

job_data = response.json()
job_id = job_data['job_id']
status_url = f"http://localhost:5000{job_data['status_url']}"

# Poll for completion
while True:
    status_response = requests.get(status_url)
    status = status_response.json()
    
    if status['status'] == 'completed':
        print(f"✓ Complete: {status['result_url']}")
        break
    elif status['status'] == 'failed':
        print(f"✗ Failed: {status['error']}")
        break
    else:
        print("Processing...")
        time.sleep(2)
```

**Result**: Scalable async processing with webhook notifications for long-running operations.

---

## Best Practices

### Image Quality

1. **Start with high-quality images**: Editing cannot fix severely degraded images
   - Minimum recommended resolution: 1024×1024px
   - Avoid heavily compressed or pixelated sources
   - Use original generated images before any compression

2. **Use appropriate formats**:
   - **JPG** for photos and final deliverables (smaller file size)
   - **PNG** for transparency and intermediate edits (lossless)
   - **WEBP** for web optimization (best compression with quality)

3. **Optimize file sizes**: Keep under 10MB for faster processing
   - Compress images before uploading if over 5MB
   - Use tools like TinyPNG or ImageOptim
   - Balance quality vs. file size based on use case

4. **Maintain aspect ratios**: Avoid extreme distortions
   - Don't stretch images beyond 2:1 or 1:2 ratios
   - Use canvas expansion instead of stretching
   - Preserve product proportions in all edits

5. **Color space considerations**:
   - Use sRGB for web delivery
   - Convert to CMYK for print after editing
   - Maintain consistent color profiles throughout workflow

### Prompt Engineering

1. **Be specific and descriptive**:
   - ❌ Bad: "white background"
   - ✅ Good: "pure white studio background with soft shadows and professional lighting"
   - Include details about lighting, texture, mood, and style

2. **Use descriptive language**:
   - Mention lighting: "soft morning light", "dramatic side lighting", "even studio lighting"
   - Describe textures: "smooth marble", "rough wood grain", "soft fabric"
   - Set the mood: "professional", "luxury", "casual", "vibrant"

3. **Leverage negative prompts effectively**:
   - Always include: "blurry, low quality, distorted"
   - For products: "cheap, plastic, artificial"
   - For backgrounds: "cluttered, busy, distracting"
   - Be specific about what to avoid

4. **Test and iterate**:
   - Try 2-3 prompt variations for important images
   - Save successful prompts for reuse
   - Build a library of effective prompts for your use cases

5. **Reference examples and styles**:
   - "marble surface like luxury product photography"
   - "studio lighting similar to Apple product shots"
   - "natural outdoor scene like lifestyle magazines"

6. **Prompt length guidelines**:
   - Optimal: 10-20 words for backgrounds
   - Optimal: 15-30 words for generative fill
   - Too short: May produce generic results
   - Too long: May confuse the AI

### Workflow Optimization

1. **Follow the recommended editing sequence**:
   - **Step 1**: Remove background (if needed)
   - **Step 2**: Replace or blur background
   - **Step 3**: Add context with generative fill
   - **Step 4**: Enhance quality
   - **Step 5**: Upscale resolution (last step)
   - Reason: Each step builds on the previous, upscaling last preserves all edits

2. **Use undo/redo strategically**:
   - Test different options without losing progress
   - Compare multiple variations before committing
   - Keep edit history for A/B testing

3. **Save originals and checkpoints**:
   - Always keep unedited versions
   - Save after major edits (background replacement, generative fill)
   - Create named versions: "product_v1_white_bg.jpg", "product_v2_lifestyle.jpg"

4. **Batch similar edits**:
   - Use same settings for product lines
   - Create templates for common workflows
   - Process multiple images with consistent branding

5. **Preview before downloading**:
   - Use comparison sliders to verify quality
   - Zoom in to check details
   - View at actual display size
   - Test on different backgrounds (for transparent PNGs)

6. **Organize your workflow**:
   - Create folders: originals, edited, final, archive
   - Use consistent naming conventions
   - Document settings used for each edit
   - Keep a log of successful prompt combinations

### Performance

1. **Use async processing by default**:
   - Better user experience with progress indicators
   - Allows UI to remain responsive
   - Handles longer operations gracefully
   - Only use sync mode for debugging

2. **Implement progress indicators**:
   - Show processing status to users
   - Display estimated time remaining
   - Provide cancel option for long operations
   - Use skeleton loaders during processing

3. **Cache results intelligently**:
   - Store edited images to avoid re-processing
   - Use browser localStorage for recent edits
   - Implement server-side caching for common operations
   - Set appropriate cache expiration times

4. **Optimize network usage**:
   - Use CDN for image delivery
   - Implement lazy loading for image galleries
   - Compress images before transmission
   - Use WebP format for web delivery

5. **Handle timeouts gracefully**:
   - Implement retry logic with exponential backoff
   - Show clear error messages
   - Provide manual retry option
   - Log failures for debugging

6. **Monitor and optimize**:
   - Track processing times for each operation
   - Identify bottlenecks in your workflow
   - Optimize image sizes before processing
   - Use appropriate scale factors (2x vs 4x)

### Accessibility

1. **Keyboard shortcuts**:
   - Support Ctrl+Z (undo), Ctrl+Y (redo)
   - Implement Ctrl+S for download
   - Use Esc to close modals
   - Provide [ and ] for brush size adjustment

2. **Screen reader support**:
   - Label all controls with descriptive text
   - Announce processing status changes
   - Provide alt text for all images
   - Use ARIA labels for complex interactions

3. **High contrast mode**:
   - Ensure UI visibility in high contrast
   - Test with Windows High Contrast mode
   - Provide sufficient color contrast (WCAG AA minimum)
   - Use patterns in addition to colors

4. **Focus management**:
   - Clear focus indicators on all interactive elements
   - Logical tab order through editing tools
   - Return focus after modal closes
   - Trap focus within modal dialogs

5. **Alt text and descriptions**:
   - Provide descriptions for all images
   - Describe editing operations in progress
   - Announce completion of operations
   - Include dimension and file size information

### Background Editing Best Practices

1. **Remove Background**:
   - Works best with clear product boundaries
   - Use high-contrast source images
   - Check edges carefully, especially fine details
   - Save as PNG to preserve transparency

2. **Replace Background**:
   - Match lighting direction of original product
   - Keep backgrounds simple for product focus
   - Use brand colors for consistency
   - Test multiple variations for A/B testing

3. **Blur Background**:
   - Start with 40-60 strength for natural look
   - Higher values (70-90) for busy backgrounds
   - Lower values (20-40) for subtle depth
   - Combine with background replacement for best results

### Generative Fill Best Practices

1. **Mask Drawing**:
   - Draw masks slightly larger than target area
   - Use soft edges for better blending
   - Test different brush sizes for precision
   - Use eraser to refine mask boundaries

2. **Prompt Strategy**:
   - Be specific about objects to add
   - Describe placement: "around", "beside", "under"
   - Include style: "realistic", "artistic", "professional"
   - Use version 2 for production work

3. **Context Matching**:
   - Match lighting of existing image
   - Keep style consistent with product
   - Avoid adding too many elements
   - Test with simple additions first

### Enhancement Best Practices

1. **When to Enhance**:
   - Before upscaling (enhance first, then upscale)
   - After background replacement
   - When colors look flat or dull
   - Before final delivery

2. **When NOT to Enhance**:
   - Already high-quality images (may over-process)
   - Before other edits (enhance last)
   - Multiple times (diminishing returns)

3. **Upscaling Strategy**:
   - Use 2x for most web and print needs
   - Use 4x only for large format printing
   - Upscale after all other edits are complete
   - Check file size before upscaling

### Canvas Expansion Best Practices

1. **Aspect Ratio Selection**:
   - Choose based on platform requirements
   - Use presets for common social media sizes
   - Expand gradually for extreme ratios
   - Test expansion before committing

2. **Expansion Prompts**:
   - Describe how to continue the background
   - Match existing background style
   - Keep it simple and natural
   - Avoid adding new focal points

3. **Platform-Specific Tips**:
   - **Instagram**: Use 1:1 for feed, 9:16 for stories
   - **Facebook**: Use 1.91:1 for optimal display
   - **Pinterest**: Use 2:3 for best engagement
   - **Print**: Match standard paper sizes

### Production Workflow Best Practices

1. **E-Commerce Images**:
   - Remove background for marketplace listings
   - Create white background version for catalogs
   - Enhance and upscale 2x for zoom functionality
   - Save both transparent PNG and white JPG versions

2. **Marketing Materials**:
   - Create lifestyle versions with context
   - Use generative fill to add props
   - Expand to multiple aspect ratios
   - Upscale 4x for print materials

3. **Social Media Content**:
   - Create platform-specific sizes
   - Use vibrant backgrounds for engagement
   - Add context elements for storytelling
   - Optimize file sizes for fast loading

4. **Print Production**:
   - Start with highest quality source
   - Enhance before upscaling
   - Upscale to appropriate resolution (300 DPI)
   - Convert to CMYK after editing
   - Save in lossless format (PNG or TIFF)

### Quality Control Checklist

Before finalizing any edited image, verify:

- [ ] Product edges are clean and natural
- [ ] Background matches intended style
- [ ] Lighting is consistent throughout
- [ ] Colors are accurate and vibrant
- [ ] No visible artifacts or distortions
- [ ] Resolution is appropriate for use case
- [ ] File size is optimized for delivery
- [ ] Image works on intended background (for transparent PNGs)
- [ ] Zoom reveals good detail quality
- [ ] Comparison with original shows improvement

### Common Mistakes to Avoid

1. **Over-editing**: Too many operations can degrade quality
2. **Wrong sequence**: Upscaling before other edits wastes processing
3. **Vague prompts**: Generic prompts produce generic results
4. **Ignoring file size**: Large files slow down delivery
5. **Skipping comparison**: Always compare before/after
6. **No backups**: Always keep original versions
7. **Inconsistent branding**: Use same settings for product lines
8. **Extreme upscaling**: 4x from low-quality source looks worse
9. **Complex backgrounds**: Keep backgrounds simple for product focus
10. **Ignoring platform requirements**: Check size specs before expanding

---

## Limitations

### Technical Limitations

1. **File Size**: Maximum 10MB per image
2. **Dimensions**:
   - Minimum: 512×512px
   - Maximum: 4096×4096px
3. **Formats**: JPG, PNG, WEBP only
4. **Processing Time**: 5-40 seconds depending on operation
5. **Concurrent Requests**: Rate limited by Bria API

### Feature Limitations

1. **Background Removal**:
   - May struggle with complex edges (fine hair, transparent objects)
   - Best with clear product boundaries

2. **Generative Fill**:
   - Quality depends on prompt specificity
   - May require multiple attempts for perfect results
   - Limited to areas covered by mask

3. **Upscaling**:
   - Cannot add detail that doesn't exist
   - 4x upscaling may introduce artifacts
   - Large files may be slow to download

4. **Canvas Expansion**:
   - New areas must be contextually appropriate
   - Extreme aspect ratio changes may look unnatural
   - Product position remains fixed (centered)
   - Expansion quality depends on prompt specificity

5. **Mask Drawing**:
   - Requires manual drawing (no auto-mask generation)
   - Touch support may vary by device
   - Undo history limited to session
   - Mask precision depends on brush size and user skill

### Quality Limitations

1. **AI-Generated Content**:
   - Results may vary between attempts
   - Cannot guarantee exact output
   - May require multiple iterations for desired result
   - Prompt interpretation can be subjective

2. **Detail Preservation**:
   - Fine details may be lost in some operations
   - Transparency edges may have slight artifacts
   - Upscaling cannot create detail from nothing
   - Compression may affect final quality

3. **Color Accuracy**:
   - Colors may shift slightly during processing
   - Monitor calibration affects perceived results
   - RGB to CMYK conversion needed for print
   - Color profiles may not be preserved

4. **Consistency**:
   - Same prompt may produce different results
   - Batch processing may have slight variations
   - Version updates may change output quality
   - Results depend on source image quality

### Operational Limitations

1. **Processing Time**:
   - Cannot be guaranteed (5-40 seconds typical)
   - Depends on server load and image complexity
   - No real-time preview for most operations
   - Queue times may vary during peak usage

2. **Undo/Redo**:
   - History limited to current session
   - No persistent edit history across page refreshes
   - Cannot undo after page reload (unless using localStorage)
   - History cleared when starting new image

3. **Batch Operations**:
   - No built-in batch processing UI
   - Must process images sequentially via API
   - Rate limits apply to batch operations
   - No progress tracking for multiple images

4. **Offline Support**:
   - Requires internet connection
   - No offline processing capability
   - Dependent on Bria API availability
   - Cannot cache processing results indefinitely

### Browser and Device Limitations

1. **Browser Requirements**:
   - Modern browser required (Chrome 90+, Firefox 88+, Safari 14+)
   - JavaScript must be enabled
   - Canvas API support required for mask drawing
   - LocalStorage required for edit history

2. **Mobile Devices**:
   - Touch support for mask drawing may be less precise
   - Large images may cause performance issues
   - File upload size limits may apply
   - Screen size limits editing interface usability

3. **Performance**:
   - Large images (>5MB) may be slow to process
   - Multiple concurrent edits may impact performance
   - Browser memory limits may affect large files
   - Older devices may experience lag

### Security and Privacy Limitations

1. **Data Handling**:
   - Images are sent to Bria API for processing
   - Results are temporarily stored on Bria servers
   - No guarantee of data deletion after processing
   - Check Bria's privacy policy for details

2. **API Key Security**:
   - API key must be kept secure
   - Server-side implementation recommended for production
   - Client-side exposure of keys is a security risk
   - Rate limits tied to API key

### Known Issues

1. **Background Removal**:
   - May leave slight halos around edges
   - Transparent objects (glass, water) are challenging
   - Reflections may be partially removed
   - Fine hair or fur may have artifacts

2. **Generative Fill**:
   - May not perfectly match lighting direction
   - Style consistency can vary
   - Complex prompts may be misinterpreted
   - Negative prompts not always fully respected

3. **Upscaling**:
   - May introduce slight softness at 4x
   - Compression artifacts may be amplified
   - Text in images may become less sharp
   - Patterns may show moiré effects

4. **Canvas Expansion**:
   - Corners and edges may show seams
   - Dramatic expansions may look artificial
   - Background patterns may not continue perfectly
   - Lighting consistency may vary in expanded areas

### Future Enhancements (Not Currently Supported)

The following features are planned but not yet implemented:

1. **Advanced Editing**:
   - Manual eraser tool with brush interface
   - Automatic mask generation
   - Color adjustment controls (hue, saturation, brightness)
   - Selective area enhancement

2. **Export Options**:
   - PSD export with layers
   - Batch export in multiple formats
   - Custom compression settings
   - Metadata preservation

3. **Collaboration**:
   - Shared editing sessions
   - Comments and annotations
   - Version control and branching
   - Team workspaces

4. **Advanced Features**:
   - Person modification tools
   - Object removal and inpainting
   - Style transfer
   - Advanced color grading
   - HDR processing

5. **Automation**:
   - Preset workflows
   - Automated batch processing
   - Template-based editing
   - API webhooks for async processing

### Workarounds for Common Limitations

1. **For complex edges**: Use blur background instead of remove background
2. **For large files**: Compress before uploading, then upscale after editing
3. **For inconsistent results**: Try multiple times with refined prompts
4. **For extreme expansions**: Expand in multiple smaller steps
5. **For batch processing**: Use Python scripts with the API
6. **For offline work**: Download and edit locally, then upload results
7. **For precise masks**: Use external tools to create masks, then import
8. **For color accuracy**: Calibrate monitor and use color profilesst be contextually similar
   - Complex scenes may not expand naturally
   - Product position is fixed (centered)

### API Limitations

1. **Rate Limits**: Enforced by Bria API (check your plan)
2. **Quota**: Monthly processing limits may apply
3. **Availability**: Dependent on Bria service uptime
4. **Versioning**: API versions may deprecate

---

## Troubleshooting

### Common Issues

#### 1. "Image failed to load"

**Causes**:

- Invalid image URL
- CORS restrictions
- Network timeout

**Solutions**:

- Verify URL is accessible
- Check CORS configuration in `api_server.py`
- Use base64 encoding for local images
- Increase timeout settings

---

#### 2. "Processing timeout"

**Causes**:

- Large image file
- Complex operation (4x upscale, generative fill)
- API server overload

**Solutions**:

- Reduce image size before editing
- Use 2x instead of 4x upscaling
- Retry during off-peak hours
- Enable sync mode for debugging

---

#### 3. "Background removal incomplete"

**Causes**:

- Complex edges (hair, fur, glass)
- Low contrast between subject and background
- Reflections or shadows

**Solutions**:

- Use higher quality source images
- Try blur background instead
- Manually refine with generative fill
- Adjust lighting in original generation

---

#### 4. "Generative fill doesn't match"

**Causes**:

- Vague prompt
- Mask too small/large
- Conflicting context

**Solutions**:

- Be more specific in prompts
- Use negative prompts
- Try version 2 for better results
- Adjust mask boundaries
- Reference similar examples in prompt

---

#### 5. "Upscaled image looks blurry"

**Causes**:

- Source image already low quality
- Excessive upscaling (4x from small image)
- Compression artifacts

**Solutions**:

- Start with higher quality source
- Use 2x instead of 4x
- Enhance before upscaling
- Check original image quality

---

#### 6. "Canvas expansion looks unnatural"

**Causes**:

- Insufficient context in prompt
- Extreme aspect ratio change
- Complex background

**Solutions**:

- Provide detailed expansion prompt
- Expand gradually (multiple steps)
- Use simpler backgrounds
- Match original background style in prompt

---

### Error Messages

#### "Invalid API key"

**Solution**: Check `config.py` and ensure `BRIA_API_KEY` is set correctly

```python
# config.py
BRIA_API_KEY = "your_actual_api_key_here"
```

---

#### "Rate limit exceeded"

**Solution**: Wait before retrying, or upgrade your Bria API plan

---

#### "Unsupported image format"

**Solution**: Convert image to JPG, PNG, or WEBP

```python
from PIL import Image

img = Image.open('image.bmp')
img.save('image.jpg', 'JPEG')
```

---

#### "Mask dimensions don't match image"

**Solution**: Ensure mask is same size as image

```python
# Resize mask to match image
mask = mask.resize((image_width, image_height))
```

---

### Debug Mode

Enable detailed logging for troubleshooting:

```python
# In api_server.py
import logging

logging.basicConfig(level=logging.DEBUG)
```

Check logs for:

- API request/response details
- Processing times
- Error stack traces
- Network issues

---

### Getting Help

1. **Check logs**: Review `api_server.py` console output
2. **Test API directly**: Use curl or Postman to isolate issues
3. **Verify configuration**: Ensure all API keys are valid
4. **Check Bria status**: Visit Bria API status page
5. **Review documentation**: Refer to Bria API docs for updates

---

## Appendix

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo last edit |
| `Ctrl+Y` | Redo edit |
| `Ctrl+S` | Download current image |
| `Ctrl+O` | Toggle original/edited view |
| `Esc` | Close editing panel |
| `Space` | Toggle mask drawing |
| `[` | Decrease brush size |
| `]` | Increase brush size |

### File Size Guidelines

| Use Case | Recommended Size | Max Size |
|----------|------------------|----------|
| Web display | 500KB - 2MB | 5MB |
| Print (small) | 2MB - 5MB | 10MB |
| Print (large) | 5MB - 10MB | 10MB |
| Archive | 5MB - 15MB | 10MB (API limit) |

### Supported Formats

| Format | Extension | Transparency | Best For |
|--------|-----------|--------------|----------|
| JPEG | .jpg, .jpeg | No | Photos, web |
| PNG | .png | Yes | Transparency, graphics |
| WebP | .webp | Yes | Web optimization |

### Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | Full |
| Firefox | 88+ | Full |
| Safari | 14+ | Full |
| Edge | 90+ | Full |

---

## Changelog

### Version 1.0.0 (Current)

- Initial release with 7 editing features
- Background manipulation (remove, replace, blur)
- Generative fill with mask drawing
- Image enhancement and upscaling
- Canvas expansion with aspect ratio presets
- Full API integration with Bria
- React UI components
- Undo/redo functionality
- Dark mode support

---

## License

This documentation is part of the AI-Powered Product Image Generation System.

---

**Last Updated**: November 15, 2025  
**Version**: 1.0.0  
**Maintained By**: Development Team
