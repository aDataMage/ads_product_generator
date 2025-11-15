# EditingToolbar Component

## Overview

The `EditingToolbar` component provides a horizontal toolbar with dropdown menus for accessing all image editing tools. It serves as the primary navigation interface for the image editing features.

## Features

- **Background Editing Dropdown**: Access to remove, replace, and blur background tools
- **Generative Fill Button**: Direct access to generative fill tool
- **Enhancement Dropdown**: Access to enhance quality and upscale resolution tools
- **Canvas Expansion Button**: Direct access to canvas expansion tool
- **Visual Feedback**: Highlights selected tool with different button variant
- **Accessibility**: Full keyboard navigation and ARIA attributes
- **Responsive**: Wraps on smaller screens

## Usage

### Basic Usage

```tsx
import { EditingToolbar, type EditingTool } from '@/components/EditingToolbar';
import { useState } from 'react';

function MyComponent() {
    const [selectedTool, setSelectedTool] = useState<EditingTool>(null);

    return (
        <EditingToolbar
            onToolSelect={setSelectedTool}
            selectedTool={selectedTool}
        />
    );
}
```

### With Editing Components

```tsx
import { EditingToolbar, type EditingTool } from '@/components/EditingToolbar';
import { BackgroundEditor } from '@/components/BackgroundEditor';
import { GenerativeFillEditor } from '@/components/GenerativeFillEditor';
import { EnhancementEditor } from '@/components/EnhancementEditor';
import { CanvasExpander } from '@/components/CanvasExpander';
import { useState } from 'react';

function ImageEditor({ imageUrl, onEditComplete }) {
    const [selectedTool, setSelectedTool] = useState<EditingTool>(null);

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <EditingToolbar
                onToolSelect={setSelectedTool}
                selectedTool={selectedTool}
            />

            {/* Conditional rendering of editing tools */}
            {selectedTool?.startsWith('background-') && (
                <BackgroundEditor
                    imageUrl={imageUrl}
                    onEditComplete={onEditComplete}
                    onError={(error) => console.error(error)}
                />
            )}

            {selectedTool === 'generative-fill' && (
                <GenerativeFillEditor
                    imageUrl={imageUrl}
                    onResult={onEditComplete}
                />
            )}

            {(selectedTool === 'enhance' || selectedTool === 'upscale') && (
                <EnhancementEditor
                    imageUrl={imageUrl}
                    onEditComplete={onEditComplete}
                    onError={(error) => console.error(error)}
                />
            )}

            {selectedTool === 'expand' && (
                <CanvasExpander
                    imageUrl={imageUrl}
                    onEditComplete={onEditComplete}
                    onError={(error) => console.error(error)}
                />
            )}
        </div>
    );
}
```

## Props

### EditingToolbarProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onToolSelect` | `(tool: EditingTool) => void` | Yes | - | Callback when a tool is selected |
| `selectedTool` | `EditingTool` | Yes | - | Currently selected tool |
| `disabled` | `boolean` | No | `false` | Whether editing operations are disabled |

### EditingTool Type

```typescript
type EditingTool =
    | 'background-remove'
    | 'background-replace'
    | 'background-blur'
    | 'generative-fill'
    | 'enhance'
    | 'upscale'
    | 'expand'
    | null;
```

## Tool Categories

### Background Tools (Dropdown)

- **Remove Background**: `'background-remove'`
- **Replace Background**: `'background-replace'`
- **Blur Background**: `'background-blur'`

### Generative Fill (Button)

- **Generative Fill**: `'generative-fill'`

### Enhancement Tools (Dropdown)

- **Enhance Quality**: `'enhance'`
- **Upscale Resolution**: `'upscale'`

### Canvas Expansion (Button)

- **Expand Canvas**: `'expand'`

## Styling

The toolbar uses Tailwind CSS classes and shadcn/ui components:

- Container: `flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border`
- Buttons: shadcn/ui `Button` component with `outline` or `default` variant
- Dropdowns: shadcn/ui `DropdownMenu` component

### Customization

You can customize the toolbar appearance by wrapping it in a container with custom styles:

```tsx
<div className="my-custom-toolbar-container">
    <EditingToolbar
        onToolSelect={handleToolSelect}
        selectedTool={selectedTool}
    />
</div>
```

## Accessibility

The component follows accessibility best practices:

- **Keyboard Navigation**: Full keyboard support for all buttons and dropdowns
- **ARIA Attributes**:
  - `role="toolbar"` on container
  - `aria-label="Image editing tools"` on toolbar
  - `aria-haspopup="menu"` on dropdown triggers
  - `aria-expanded` on dropdown triggers
  - `aria-pressed` on toggle buttons
  - `role="menu"` and `role="menuitem"` on dropdown menus
- **Screen Reader Support**: All buttons have descriptive labels
- **Focus Management**: Proper focus handling in dropdowns

## Integration with ResultsPanel

To integrate the toolbar into the ResultsPanel:

```tsx
import { EditingToolbar, type EditingTool } from '@/components/EditingToolbar';

function ResultsPanel({ generatedImageUrl }) {
    const [selectedTool, setSelectedTool] = useState<EditingTool>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    return (
        <div>
            {/* Image display */}
            <img src={generatedImageUrl} alt="Generated image" />

            {/* Edit button */}
            <Button onClick={() => setIsEditMode(true)}>
                Edit Image
            </Button>

            {/* Editing interface */}
            {isEditMode && (
                <div className="mt-4">
                    <EditingToolbar
                        onToolSelect={setSelectedTool}
                        selectedTool={selectedTool}
                    />
                    {/* Render appropriate editing component based on selectedTool */}
                </div>
            )}
        </div>
    );
}
```

## Examples

See `EditingToolbar.example.tsx` for complete working examples:

1. **Full Integration Example**: Shows how to integrate with all editing components
2. **Simple Example**: Minimal implementation showing tool selection

## Testing

The component includes comprehensive tests in `editing-toolbar.test.tsx`:

- Renders all tool buttons
- Handles tool selection callbacks
- Opens dropdown menus
- Highlights selected tools
- Disables buttons when disabled prop is true
- Has proper ARIA attributes

Run tests:

```bash
npm test -- editing-toolbar.test.tsx
```

## Dependencies

- React
- shadcn/ui components:
  - `Button`
  - `DropdownMenu`
- Lucide React icons
- @radix-ui/react-dropdown-menu

## Browser Support

The component works in all modern browsers that support:

- CSS Flexbox
- CSS Grid (for responsive wrapping)
- ES6+ JavaScript features

## Performance

The component is lightweight and performant:

- Minimal re-renders (only when props change)
- Lazy dropdown rendering (menus only render when opened)
- No heavy computations or side effects

## Future Enhancements

Potential improvements for future versions:

- Keyboard shortcuts for quick tool access
- Tool history/recent tools
- Customizable tool order
- Collapsible toolbar for mobile
- Tool presets/favorites
- Tooltips with keyboard shortcuts
