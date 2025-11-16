# Edit Page User Guide

## Overview

The Edit Page is a dedicated workspace for editing your generated product images. It provides a professional split-panel interface with all editing tools on the left and your image on the right, allowing you to refine and perfect your product photography.

## Getting Started

### Accessing the Edit Page

1. Generate an image using the standard or pro mode
2. Click the **"Edit"** button in the results panel
3. You'll be taken to the `/edit` route with your image loaded

### Interface Layout

```
┌─────────────────────────────────────────────────────┐
│  ← Back    Image Editor              Download       │
├──────────────────┬──────────────────────────────────┤
│                  │                                  │
│  Editing Tools   │     Image Canvas                │
│                  │                                  │
│  • Background    │  [Your Image]                   │
│  • Gen Fill      │                                  │
│  • Enhance       │  Zoom: 100%                     │
│  • Upscale       │  [Undo] [Redo] [Compare]        │
│  • Expand        │                                  │
│                  │                                  │
└──────────────────┴──────────────────────────────────┘
```

## Editing Tools

### Background Tools

#### Remove Background

Removes the background from your product image, leaving only the product on a transparent background.

**How to use:**

1. Open the "Background Tools" accordion section
2. Click **"Remove Background"**
3. Wait for processing (usually 5-10 seconds)
4. Your image will update with the background removed

**Best for:**

- Creating product cutouts
- Preparing images for different backgrounds
- E-commerce product listings

#### Replace Background

Replaces the current background with a new one of your choice.

**How to use:**

1. Open the "Background Tools" accordion section
2. Select a background preset (e.g., "White Studio", "Gradient Blue")
3. Click **"Replace Background"**
4. Wait for processing
5. Your image will update with the new background

**Available Presets:**

- White Studio
- Black Studio
- Gradient Blue
- Gradient Purple
- Wooden Surface
- Marble Surface
- Outdoor Scene
- Custom (upload your own)

#### Blur Background

Applies a professional blur effect to the background while keeping the product sharp.

**How to use:**

1. Open the "Background Tools" accordion section
2. Adjust the blur intensity slider (0-100)
3. Click **"Apply Blur"**
4. Wait for processing
5. Your image will update with the blurred background

**Best for:**

- Creating depth of field effects
- Focusing attention on the product
- Professional photography look

### Generative Fill

Uses AI to fill in or modify specific areas of your image based on a text prompt.

**How to use:**

1. Open the "Generative Fill" accordion section
2. Use the brush tool to draw a mask over the area you want to modify
3. Enter a text prompt describing what you want (e.g., "wooden table", "blue sky")
4. Click **"Generate"**
5. Wait for processing (15-30 seconds)
6. Review the result and adjust if needed

**Tips:**

- Be specific in your prompts
- Use the eraser tool to refine your mask
- Adjust brush size for precision
- Try multiple variations if needed

### Enhancement

Applies AI-powered quality enhancement to improve image clarity, color, and detail.

**How to use:**

1. Open the "Enhancement" accordion section
2. Click **"Enhance Image"**
3. Wait for processing (10-15 seconds)
4. Your image will update with improved quality

**What it does:**

- Increases sharpness and detail
- Improves color vibrancy
- Reduces noise and artifacts
- Enhances overall image quality

**Best for:**

- Low-resolution images
- Images with compression artifacts
- Final quality polish

### Upscale

Increases the resolution of your image using AI upscaling.

**How to use:**

1. Open the "Upscale" accordion section
2. Select a scale factor:
   - **2x**: Doubles the resolution
   - **4x**: Quadruples the resolution
3. Click **"Upscale"**
4. Wait for processing (20-40 seconds depending on size)
5. Your image will update with higher resolution

**Best for:**

- Preparing images for print
- Large format displays
- High-resolution requirements

**Note:** Larger scale factors take longer to process and result in larger file sizes.

### Canvas Expander

Expands the canvas around your image to change aspect ratio or add space.

**How to use:**

1. Open the "Canvas Expander" accordion section
2. Choose an aspect ratio preset or enter custom dimensions:
   - **Square (1:1)**: Instagram posts
   - **Portrait (4:5)**: Instagram portraits
   - **Landscape (16:9)**: Widescreen displays
   - **Custom**: Enter specific width and height
3. Select expansion direction (all sides, top/bottom, left/right)
4. Click **"Expand Canvas"**
5. Wait for processing
6. Your image will update with the expanded canvas

**Best for:**

- Changing aspect ratios for different platforms
- Adding breathing room around products
- Creating specific dimensions for layouts

## Image Controls

### Zoom Controls

Located in the image panel toolbar:

- **Fit**: Zoom to fit the entire image in the viewport
- **100%**: View at actual size (1:1 pixels)
- **200%**: View at 2x magnification
- **Zoom In (+)**: Increase zoom level
- **Zoom Out (-)**: Decrease zoom level

**Keyboard Shortcuts:**

- `Ctrl+0`: Zoom to fit
- `Ctrl++` or `Ctrl+=`: Zoom in
- `Ctrl+-`: Zoom out

### Pan/Drag

When zoomed in beyond fit level:

- **Mouse**: Click and drag to pan around the image
- **Touch**: Touch and drag on mobile devices
- **Trackpad**: Two-finger scroll to pan

### Image Comparison

Compare your edited image with the original:

1. Click the **"Compare"** button in the toolbar
2. A slider will appear showing original (left) and edited (right)
3. Drag the slider to compare different areas
4. Zoom and pan work in comparison mode
5. Click **"Compare"** again to exit

**Keyboard Shortcut:** `C` key

## History Management

### Undo/Redo

Every edit operation is saved to history, allowing you to undo and redo changes.

**Undo:**

- Click the **Undo** button (↶)
- Press `Ctrl+Z`
- Reverts to the previous image state

**Redo:**

- Click the **Redo** button (↷)
- Press `Ctrl+Y`
- Restores the next image state

**History Limit:** Up to 20 edit operations are stored

### Reset

To return to the original image:

1. Click the **Reset** button in the toolbar
2. Confirm the action
3. All edits will be cleared and you'll return to the original

**Note:** This action cannot be undone.

## Downloading Your Image

### Download Current Image

1. Click the **"Download"** button in the header
2. The image will download to your default downloads folder
3. Filename format: `edited-image-YYYY-MM-DD-HHmmss.jpg`

**Keyboard Shortcut:** `Ctrl+S`

### Download Options

The download includes:

- Current image state (with all edits applied)
- Original image format (JPEG or PNG)
- Full resolution
- Metadata preserved

## Keyboard Shortcuts

### Essential Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo last edit |
| `Ctrl+Y` | Redo next edit |
| `Ctrl+0` | Zoom to fit |
| `Ctrl++` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+S` | Download image |
| `Escape` | Close dialogs/Cancel operation |
| `C` | Toggle comparison mode |

### Navigation Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Navigate between tools |
| `Enter` | Activate focused button |
| `Space` | Toggle accordion sections |
| `Arrow Keys` | Navigate within tool sections |

**Tip:** Hover over any button to see its keyboard shortcut in the tooltip.

## Mobile Usage

### Responsive Layout

On mobile devices (screens < 768px):

- Tools panel appears above the image
- Image panel is scrollable
- Touch gestures work for zoom and pan
- All tools remain fully functional

### Touch Gestures

- **Pinch**: Zoom in/out
- **Drag**: Pan when zoomed
- **Tap**: Select tools and buttons
- **Double-tap**: Zoom to 100%

### Mobile Tips

- Use landscape orientation for better workspace
- Collapse tool sections you're not using
- Use the "Fit" zoom for overview
- Zoom in for precise mask drawing

## Best Practices

### Workflow Tips

1. **Start with background edits** (remove/replace) before other operations
2. **Use enhancement** as a final polish step
3. **Upscale last** to avoid processing large files unnecessarily
4. **Save frequently** by downloading intermediate versions
5. **Use comparison mode** to verify improvements

### Performance Tips

1. **Close unused tool sections** to improve scrolling performance
2. **Avoid excessive zoom** on large images
3. **Clear history** if experiencing slowness (reset button)
4. **Use smaller scale factors** for faster upscaling
5. **Wait for operations to complete** before starting new ones

### Quality Tips

1. **Remove background first** for cleaner results
2. **Use specific prompts** in generative fill
3. **Enhance before upscaling** for better detail
4. **Compare with original** to avoid over-editing
5. **Download at key stages** to preserve good versions

## Troubleshooting

### Image Not Loading

**Problem:** Edit page shows "No image to edit" error

**Solutions:**

- Ensure you navigated from a results page with a generated image
- Check that the image URL is valid
- Try generating a new image and editing again
- Clear browser cache and retry

### Edit Operation Failed

**Problem:** Edit operation shows an error message

**Solutions:**

- Check your internet connection
- Retry the operation
- Try a different tool or setting
- Refresh the page and try again
- Contact support if the issue persists

### Slow Performance

**Problem:** Edit page is laggy or slow

**Solutions:**

- Close unused tool accordion sections
- Reduce zoom level
- Clear edit history (reset)
- Close other browser tabs
- Try a different browser
- Check your internet speed

### Undo/Redo Not Working

**Problem:** Undo or redo buttons are disabled

**Solutions:**

- Ensure you have made edits (undo requires history)
- Check that you're not at the beginning/end of history
- Try refreshing the page
- Clear session storage and start fresh

### Download Not Working

**Problem:** Download button doesn't work or downloads wrong image

**Solutions:**

- Check browser download permissions
- Try right-click > Save Image As
- Ensure popup blocker isn't interfering
- Try a different browser
- Check available disk space

## Accessibility Features

### Screen Reader Support

- All buttons have descriptive ARIA labels
- Edit operations announce status changes
- Loading states are announced
- Error messages are read aloud
- Image metadata is accessible

### Keyboard Navigation

- Full keyboard navigation support
- Visible focus indicators
- Logical tab order
- Keyboard shortcuts for all actions
- Skip links for quick navigation

### Visual Accessibility

- High contrast mode support
- Respects reduced motion preferences
- Clear visual feedback for all actions
- Large touch targets (44x44px minimum)
- Color-blind friendly interface

## Privacy & Data

### Image Storage

- Images are not stored on our servers permanently
- Edit history is stored in browser session storage
- Clearing browser data removes all edit history
- Images are processed securely via API

### Session Persistence

- Edit state persists during browser session
- Closing the tab clears edit history
- Refreshing the page may restore recent edits
- Use download to save permanent copies

## Support

### Getting Help

- Hover over any tool for a description
- Check tooltips for keyboard shortcuts
- Review this guide for detailed instructions
- Contact support for technical issues

### Feedback

We welcome your feedback on the Edit Page:

- Report bugs or issues
- Suggest new features
- Share your experience
- Request additional tools

## Version History

### Current Version: 1.0

**Features:**

- Split-panel editing interface
- 5 tool categories with multiple options
- Undo/redo with 20-step history
- Zoom and pan controls
- Image comparison mode
- Keyboard shortcuts
- Mobile responsive design
- Accessibility features

**Coming Soon:**

- Batch editing
- Preset workflows
- Layer support
- Advanced masking tools
- Color adjustments
- Filters and effects
