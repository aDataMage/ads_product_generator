# Image Comparison Slider Component

## Overview

The `ImageComparisonSlider` component provides a split-view interface for comparing two images side-by-side with a draggable slider. This is commonly used for before/after comparisons, particularly useful for showing the effects of image enhancement operations.

## Features

- **Interactive Slider**: Drag the slider handle to reveal more or less of each image
- **Keyboard Navigation**: Full keyboard support with arrow keys, Home, and End
- **Touch Support**: Works on mobile devices with touch gestures
- **Click to Position**: Click anywhere on the image to move the slider
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Responsive**: Works on all screen sizes
- **Customizable**: Configurable initial position and styling

## Usage

### Basic Example

```tsx
import { ImageComparisonSlider } from '@/components/ImageComparisonSlider';

function MyComponent() {
  return (
    <ImageComparisonSlider
      beforeImage="https://example.com/original.jpg"
      afterImage="https://example.com/enhanced.jpg"
      beforeAlt="Original image"
      afterAlt="Enhanced image"
    />
  );
}
```

### With Custom Initial Position

```tsx
<ImageComparisonSlider
  beforeImage={originalUrl}
  afterImage={enhancedUrl}
  initialPosition={75} // Start with 75% of after image visible
/>
```

### Integration with Enhancement Editor

```tsx
function EnhancementComparison({ originalUrl, enhancedUrl }) {
  return (
    <div className="space-y-4">
      <h3>Compare Quality</h3>
      <ImageComparisonSlider
        beforeImage={originalUrl}
        afterImage={enhancedUrl}
        className="shadow-lg"
      />
      <div className="flex gap-2">
        <Button onClick={() => downloadImage(originalUrl)}>
          Download Original
        </Button>
        <Button onClick={() => downloadImage(enhancedUrl)}>
          Download Enhanced
        </Button>
      </div>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `beforeImage` | `string` | Required | URL of the original/before image |
| `afterImage` | `string` | Required | URL of the enhanced/after image |
| `beforeAlt` | `string` | `"Original image"` | Alt text for the before image |
| `afterAlt` | `string` | `"Enhanced image"` | Alt text for the after image |
| `initialPosition` | `number` | `50` | Initial slider position (0-100) |
| `className` | `string` | `undefined` | Additional CSS classes |

## Keyboard Controls

- **Arrow Left (←)**: Move slider left (show more of before image)
- **Arrow Right (→)**: Move slider right (show more of after image)
- **Home**: Jump to start (show all of before image)
- **End**: Jump to end (show all of after image)

## Accessibility

The component includes:

- Proper ARIA roles (`slider`, `group`)
- ARIA labels for screen readers
- Keyboard navigation support
- Focus indicators
- Value announcements for screen readers

## Implementation Details

### File Structure

```
elegant-flow-ui/src/
├── components/
│   ├── ImageComparisonSlider.tsx          # Main component
│   ├── ImageComparisonSlider.example.tsx  # Usage examples
│   └── ui/
│       └── slider.tsx                     # Base slider component
└── test/
    └── image-comparison-slider.test.tsx   # Component tests
```

### How It Works

1. **Two Image Layers**: The after image is displayed at full width, with the before image layered on top
2. **Clip Path**: The before image is clipped using CSS `clip-path` based on slider position
3. **Event Handling**: Mouse, touch, and keyboard events update the slider position
4. **Smooth Interaction**: The slider responds to drag, click, and keyboard input

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires CSS `clip-path` support (all modern browsers)

## Testing

The component includes comprehensive tests covering:

- Image rendering
- Accessibility attributes
- Keyboard navigation
- Custom props
- ARIA labels

Run tests with:

```bash
npm test image-comparison-slider.test.tsx
```

## Related Components

- `EnhancementEditor`: Uses this component for quality comparison
- `Slider`: Base slider UI component

## Future Enhancements

Potential improvements for future versions:

- Zoom functionality for detail comparison
- Vertical slider orientation option
- Multiple comparison points
- Animation on initial load
- Preset positions (25%, 50%, 75%)
