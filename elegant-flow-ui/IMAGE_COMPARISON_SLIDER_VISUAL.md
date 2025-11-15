# Image Comparison Slider - Visual Reference

## Component Appearance

The `ImageComparisonSlider` creates a split-view comparison interface:

```
┌─────────────────────────────────────────────────────────┐
│ [Before]                              [After]            │
│                                                           │
│                          │                                │
│                          │                                │
│   Original Image         │    Enhanced Image             │
│   (Left Side)            │    (Right Side)               │
│                          │                                │
│                          ◉                                │
│                          │                                │
│                          │                                │
│                          │                                │
└─────────────────────────────────────────────────────────┘
                           ↑
                    Draggable Slider
```

## Visual Elements

### 1. Image Layers

- **After Image**: Full-width background image (enhanced version)
- **Before Image**: Overlaid on top, clipped by slider position (original version)

### 2. Slider Line

- Vertical white line with shadow
- Spans full height of the image
- Positioned based on slider value (0-100%)

### 3. Slider Handle

- Circular white button at center of slider line
- Contains left and right arrow icons (◀ ▶)
- Size: 40px × 40px
- Cursor changes to `ew-resize` on hover

### 4. Labels

- **"Before"** label: Top-left corner, black background with white text
- **"After"** label: Top-right corner, black background with white text
- Semi-transparent background (70% opacity)

## Interaction States

### Default State

```
Slider at 50% (middle)
- Left half shows "Before" image
- Right half shows "After" image
```

### Dragging State

```
User drags slider handle
- Slider follows cursor/touch position
- Image reveal updates in real-time
- Smooth, responsive movement
```

### Keyboard Focus State

```
Slider handle has focus ring
- Blue focus outline (2px)
- Visible keyboard focus indicator
```

## Responsive Behavior

### Desktop (≥1024px)

- Full-size images
- Smooth drag interaction
- Hover effects on slider handle

### Tablet (768px - 1023px)

- Scaled images
- Touch-friendly slider handle
- Larger touch target

### Mobile (≤767px)

- Optimized for touch
- Larger slider handle (easier to grab)
- Swipe gesture support

## Color Scheme

### Light Mode

- Slider line: White (#FFFFFF)
- Slider handle: White with shadow
- Labels: Black background (rgba(0,0,0,0.7)), white text
- Focus ring: Primary color

### Dark Mode

- Slider line: White (#FFFFFF) - maintains contrast
- Slider handle: White with shadow
- Labels: Black background (rgba(0,0,0,0.7)), white text
- Focus ring: Primary color

## Animation & Transitions

### Slider Movement

- Smooth position updates (no transition delay)
- Immediate response to user input

### Hover Effects

- Slider handle scales slightly on hover (1.05x)
- Cursor changes to resize indicator

### Focus Effects

- Focus ring appears with smooth transition
- Maintains visibility for accessibility

## Accessibility Features

### Visual Indicators

- High contrast slider line and handle
- Clear "Before" and "After" labels
- Visible focus states

### Screen Reader Support

- ARIA slider role with value announcements
- Descriptive labels for images
- Group label for entire component

### Keyboard Navigation

- Arrow keys for fine control (1% increments)
- Home/End keys for quick navigation
- Tab key to focus slider handle

## Usage Context

### In Enhancement Editor

```
┌─────────────────────────────────────────────────────────┐
│ Image Enhancement                                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ [Enhance Quality Button]  [Upscale 2x]  [Upscale 4x]    │
│                                                           │
│ ┌───────────────────────────────────────────────────┐   │
│ │                                                     │   │
│ │        Image Comparison Slider                     │   │
│ │        (Shows before/after)                        │   │
│ │                                                     │   │
│ └───────────────────────────────────────────────────┘   │
│                                                           │
│ Original: 1024 × 768 px                                  │
│ Enhanced: 2048 × 1536 px                                 │
│                                                           │
│ [Download Original]  [Download Enhanced]                 │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Implementation Notes

### CSS Clip Path

The component uses `clip-path: inset()` to reveal the before image:

- `inset(0 ${100-position}% 0 0)` clips from the right
- Creates a sharp, clean division line
- Performs well across browsers

### Event Handling

- Mouse events: `mousedown`, `mousemove`, `mouseup`
- Touch events: `touchstart`, `touchmove`, `touchend`
- Keyboard events: `keydown` for arrow keys
- Click events: Direct positioning on click

### Performance

- No heavy animations or transitions
- Efficient clip-path rendering
- Minimal re-renders
- Optimized for 60fps interaction
