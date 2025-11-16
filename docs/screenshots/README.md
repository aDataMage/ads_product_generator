# Screenshot Documentation

This directory contains visual documentation for the Image Editing Features Guide.

## Directory Structure

```
docs/screenshots/
├── README.md (this file)
├── remove-background-tool.png
├── remove-background-comparison.gif
├── replace-background-interface.png
├── replace-background-presets.png
├── replace-background-results.gif
├── blur-background-slider.png
├── blur-background-comparison.gif
├── generative-fill-interface.png
├── mask-drawing-tools.gif
├── generative-fill-process.gif
├── generative-fill-examples.png
├── enhance-quality-button.png
├── enhance-quality-comparison.gif
├── upscale-resolution-selector.png
├── upscale-resolution-results.png
├── upscale-detail-zoom.gif
├── canvas-expander-interface.png
├── canvas-expansion-preview.png
├── canvas-expansion-results.gif
└── canvas-expansion-examples.png
```

## Capture Guidelines

### Prerequisites

1. **Start the application**:

   ```bash
   # Terminal 1: Backend API server
   python api_server.py
   
   # Terminal 2: Frontend development server
   cd elegant-flow-ui
   npm run dev
   ```

2. **Generate a test image** to use for editing demonstrations

3. **Prepare screen capture tools**:
   - **Screenshots**: Snipping Tool (Windows), Screenshot (macOS), GNOME Screenshot (Linux)
   - **GIF Recording**: ScreenToGif (Windows), Kap (macOS), Peek (Linux)

### Screenshot Specifications

#### Static Screenshots (PNG)

- **Format**: PNG with transparency where applicable
- **Resolution**: Capture at 1920×1080 or higher, crop to relevant area
- **Compression**: Use TinyPNG or similar to reduce file size
- **Target Size**: <500KB per image
- **Content**: Show only the relevant UI component, avoid unnecessary chrome

#### Animated GIFs

- **Format**: GIF
- **Frame Rate**: 10-15 FPS for smooth playback
- **Duration**: 3-10 seconds per animation
- **Resolution**: Crop to show only relevant area (typically 800-1200px wide)
- **Compression**: Optimize using Gifsicle or ezgif.com
- **Target Size**: <2MB per GIF
- **Loop**: Set to infinite loop

### Capture Instructions by Tool

#### 1. Background Manipulation

**remove-background-tool.png**:

- Navigate to Results Panel after generating an image
- Click "Edit Image" to open editing toolbar
- Expand "Background" dropdown menu
- Capture the interface showing the "Remove Background" button
- Crop to show the editing toolbar and button clearly

**remove-background-comparison.gif**:

- Start recording
- Click "Remove Background" button
- Show loading state (spinner/progress)
- Display the result with transparent background (use checkered pattern)
- Show before/after using the comparison slider
- Stop recording (total: ~5-8 seconds)

**replace-background-interface.png**:

- Open Background Editor in "Replace" mode
- Show the prompt input field with example text
- Display the color picker (if visible)
- Show background preset selector
- Capture the complete form interface

**replace-background-presets.png**:

- Open the background preset selector
- Ensure all categories are visible (Studio, Outdoor, Abstract, Solid Colors)
- Show preset thumbnails/icons
- Capture the full preset selection UI

**replace-background-results.gif**:

- Start recording
- Apply "White Studio" preset → show result
- Apply "Marble Surface" preset → show result
- Apply "Gradient Blue" preset → show result
- Use comparison slider to show before/after for each
- Stop recording (total: ~8-10 seconds)

**blur-background-slider.png**:

- Open Background Editor in "Blur" mode
- Set blur strength to 50
- Show the slider control with value label
- Display preview of blurred background
- Capture the slider and preview area

**blur-background-comparison.gif**:

- Start recording
- Drag blur slider from 0 → 25 → 50 → 75 → 100
- Pause briefly at each increment to show effect
- Show the background progressively blurring
- Stop recording (total: ~6-8 seconds)

#### 2. Generative Fill

**generative-fill-interface.png**:

- Open Generative Fill Editor
- Show the complete interface:
  - Mask drawing canvas with an image loaded
  - Brush/eraser tool buttons
  - Brush size slider
  - Undo/redo buttons
  - Prompt input field with example text
  - Negative prompt field
  - Version selector (v1/v2)
  - Generate button
- Capture the full editor layout

**mask-drawing-tools.gif**:

- Start recording
- Select brush tool
- Draw a mask area on the image
- Adjust brush size using slider
- Switch to eraser tool
- Erase part of the mask
- Click undo button
- Click redo button
- Click clear button
- Stop recording (total: ~8-10 seconds)

**generative-fill-process.gif**:

- Start recording
- Draw a mask around product area
- Enter prompt: "add flowers around the product"
- Enter negative prompt: "blurry, artificial"
- Click "Generate" button
- Show loading state with progress indicator
- Display result with refined prompt
- Show before/after comparison
- Stop recording (total: ~10-12 seconds)

**generative-fill-examples.png**:

- Create a grid layout showing 3-4 examples:
  - Example 1: Original → Mask → Result (flowers added)
  - Example 2: Original → Mask → Result (props added)
  - Example 3: Original → Mask → Result (context elements)
- Capture or create composite image showing all examples

#### 3. Image Enhancement

**enhance-quality-button.png**:

- Open Enhancement Editor
- Show the "Enhance Quality" button
- Display the upscale selector (2x, 4x options)
- Show file size information if visible
- Capture the enhancement controls

**enhance-quality-comparison.gif**:

- Start recording
- Click "Enhance Quality" button
- Show loading state
- Display enhanced result
- Use comparison slider to show before/after
- Drag slider left and right to demonstrate improvement
- Stop recording (total: ~5-7 seconds)

**upscale-resolution-selector.png**:

- Open Enhancement Editor
- Show the resolution upscale selector
- Display 2x and 4x options
- Show dimension preview (e.g., "1024×1024 → 2048×2048")
- Show estimated file size if available
- Capture the upscale controls

**upscale-resolution-results.png**:

- Create side-by-side comparison:
  - Left: Original image with dimensions (1024×1024) and file size
  - Right: Upscaled image with dimensions (2048×2048) and file size
- Add labels clearly showing the difference
- Capture or create composite image

**upscale-detail-zoom.gif**:

- Start recording
- Show original image
- Zoom into product detail area
- Switch to upscaled version
- Zoom into same detail area
- Compare the quality improvement
- Zoom out
- Stop recording (total: ~6-8 seconds)

#### 4. Canvas Expansion

**canvas-expander-interface.png**:

- Open Canvas Expander
- Show aspect ratio preset buttons (1:1, 4:3, 16:9, 9:16)
- Display custom dimension inputs
- Show optional prompt field with example text
- Display current vs target dimensions
- Capture the complete expander interface

**canvas-expansion-preview.png**:

- Select an aspect ratio (e.g., 16:9)
- Show the preview overlay on the image:
  - Original image boundaries (solid outline)
  - New canvas areas to be generated (highlighted/shaded)
  - Dimension labels
- Capture the preview visualization

**canvas-expansion-results.gif**:

- Start recording
- Original image (1:1 square)
- Click "16:9 Landscape" preset → show result
- Click "9:16 Portrait" preset → show result
- Click "4:3 Standard" preset → show result
- Show each result for 2-3 seconds
- Stop recording (total: ~10-12 seconds)

**canvas-expansion-examples.png**:

- Create a grid showing multiple examples:
  - Example 1: 1:1 → 16:9 (white studio background)
  - Example 2: 1:1 → 9:16 (natural background)
  - Example 3: 1:1 → 4:3 (gradient background)
- Show original and expanded version for each
- Capture or create composite image

### Post-Processing

After capturing all screenshots and GIFs:

1. **Optimize file sizes**:

   ```bash
   # For PNGs (using TinyPNG CLI or similar)
   tinypng docs/screenshots/*.png
   
   # For GIFs (using Gifsicle)
   gifsicle -O3 --colors 256 input.gif -o output.gif
   ```

2. **Verify all files are present**:
   - Check against the list in this README
   - Ensure file names match exactly (kebab-case)

3. **Test in documentation**:
   - Open IMAGE_EDITING_GUIDE.md
   - Verify all images load correctly
   - Check that GIFs play smoothly

4. **Commit to repository**:

   ```bash
   git add docs/screenshots/
   git commit -m "Add visual documentation for image editing features"
   ```

## File Naming Convention

- Use **kebab-case** for all filenames
- Be descriptive but concise
- Include the tool name and what's being shown
- Use `.png` for static screenshots
- Use `.gif` for animations

Examples:

- ✅ `remove-background-tool.png`
- ✅ `generative-fill-process.gif`
- ❌ `screenshot1.png`
- ❌ `RemoveBackground.PNG`

## Quality Checklist

Before finalizing screenshots:

- [ ] All images are properly cropped (no unnecessary UI)
- [ ] Text is readable (minimum 12px font size visible)
- [ ] Colors are accurate (no washed out or oversaturated)
- [ ] GIFs loop smoothly without jarring transitions
- [ ] File sizes are optimized (<500KB PNG, <2MB GIF)
- [ ] Filenames match documentation references exactly
- [ ] All required screenshots are captured
- [ ] Images demonstrate the feature clearly
- [ ] Consistent styling across all screenshots

## Tools Recommendations

### Screenshot Capture

- **Windows**:
  - Snipping Tool (built-in)
  - ShareX (free, advanced features)
  - Greenshot (free, open-source)

- **macOS**:
  - Screenshot app (built-in, Cmd+Shift+5)
  - CleanShot X (paid, professional)
  - Skitch (free, annotations)

- **Linux**:
  - GNOME Screenshot (built-in)
  - Flameshot (free, annotations)
  - Spectacle (KDE)

### GIF Recording

- **Windows**:
  - ScreenToGif (free, excellent quality)
  - LICEcap (free, simple)
  - Gifcam (free, lightweight)

- **macOS**:
  - Kap (free, open-source)
  - Gifox (paid, professional)
  - GIPHY Capture (free)

- **Linux**:
  - Peek (free, simple)
  - Gifine (free)
  - SimpleScreenRecorder + ffmpeg

### Image Optimization

- **Online**:
  - TinyPNG (<https://tinypng.com>)
  - ezgif.com (GIF optimization)
  - Squoosh (<https://squoosh.app>)

- **CLI Tools**:
  - `pngquant` - PNG compression
  - `gifsicle` - GIF optimization
  - `imagemagick` - Batch processing

## Maintenance

Update screenshots when:

- UI design changes significantly
- New features are added to existing tools
- Better examples become available
- File sizes can be further optimized
- User feedback indicates confusion

Last updated: November 15, 2025
