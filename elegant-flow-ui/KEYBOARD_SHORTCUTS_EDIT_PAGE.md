# Keyboard Shortcuts - Edit Page

This document describes the keyboard shortcuts available on the dedicated Edit Page.

## Available Shortcuts

### History Controls

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+Z` (Windows/Linux)<br>`⌘+Z` (Mac) | Undo | Undo the last editing operation |
| `Ctrl+Y` (Windows/Linux)<br>`⌘+Shift+Z` (Mac) | Redo | Redo the previously undone operation |
| `Ctrl+R` (Windows/Linux)<br>`⌘+R` (Mac) | Reset | Reset to the original image |

### Zoom Controls

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+0` (Windows/Linux)<br>`⌘+0` (Mac) | Zoom to Fit | Fit the image to the viewport |
| `Ctrl++` (Windows/Linux)<br>`⌘++` (Mac) | Zoom In | Increase zoom level |
| `Ctrl+-` (Windows/Linux)<br>`⌘+-` (Mac) | Zoom Out | Decrease zoom level |

### File Operations

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+S` (Windows/Linux)<br>`⌘+S` (Mac) | Download | Download the current edited image |

### Navigation

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Esc` | Back/Close | Navigate back to the previous page (if no unsaved changes) or close dialogs |

## Implementation Details

### Hook: `useKeyboardShortcuts`

The keyboard shortcuts are implemented using a custom React hook located at `src/hooks/useKeyboardShortcuts.ts`. This hook:

- Listens for keyboard events on the window
- Prevents default browser behavior for shortcuts (e.g., Ctrl+S won't trigger browser save)
- Respects input fields (shortcuts are disabled when typing in inputs/textareas, except Escape)
- Detects platform (Mac vs Windows/Linux) and adjusts shortcuts accordingly
- Can be enabled/disabled dynamically

### Integration in EditPage

The `EditPage` component integrates keyboard shortcuts by:

1. Creating a ref to access zoom controls from the `ImagePanel` component
2. Calling `useKeyboardShortcuts` with handlers for each action
3. Disabling shortcuts during loading operations
4. Conditionally enabling shortcuts based on state (e.g., undo only works if there's history)

### Tooltips

All interactive elements that have keyboard shortcuts display the shortcut in their tooltip:

- **Header buttons**: Undo, Redo, Download, Back
- **Image panel controls**: Zoom In, Zoom Out, Zoom to Fit, Undo, Redo, Reset

The tooltip text automatically adjusts based on the user's platform (Mac vs Windows/Linux).

## Accessibility

The keyboard shortcuts enhance accessibility by:

- Providing keyboard-only navigation and control
- Following platform conventions (Cmd on Mac, Ctrl on Windows/Linux)
- Including ARIA labels that mention the shortcuts
- Displaying shortcuts in tooltips for discoverability
- Not interfering with screen reader shortcuts

## Testing

Keyboard shortcuts can be tested by:

1. Opening the Edit Page with an image
2. Pressing the various keyboard combinations
3. Verifying that the correct actions are triggered
4. Testing in input fields to ensure shortcuts don't interfere with typing
5. Testing on both Mac and Windows/Linux platforms

## Future Enhancements

Potential improvements for keyboard shortcuts:

- **Help dialog**: Display all available shortcuts in a modal (triggered by `?` or `Ctrl+/`)
- **Customization**: Allow users to customize keyboard shortcuts
- **Additional shortcuts**: Add shortcuts for specific tools (e.g., `B` for background removal)
- **Chord shortcuts**: Support multi-key sequences (e.g., `G` then `F` for generative fill)
