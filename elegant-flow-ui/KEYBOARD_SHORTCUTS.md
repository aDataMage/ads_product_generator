# Keyboard Shortcuts

This document describes the keyboard shortcuts available in the image editing interface.

## Editing Mode Shortcuts

When you're in editing mode (after clicking "Edit Image"), the following keyboard shortcuts are available:

### Undo/Redo Operations

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+Z` (Windows/Linux)<br>`⌘+Z` (Mac) | **Undo** | Undo the last edit operation |
| `Ctrl+Y` (Windows/Linux)<br>`⌘+Shift+Z` (Mac) | **Redo** | Redo the last undone edit operation |
| `Ctrl+Shift+Z` (All platforms) | **Redo** | Alternative redo shortcut |

### File Operations

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+S` (Windows/Linux)<br>`⌘+S` (Mac) | **Download** | Download the current image (edited or original) |
| `Ctrl+R` (Windows/Linux)<br>`⌘+R` (Mac) | **Reset** | Reset to the original image, removing all edits |

### Navigation

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Esc` | **Exit/Close** | Exit editing mode or close the current tool |

## Features

### Smart Input Detection

Keyboard shortcuts are automatically disabled when you're typing in text fields (like prompt inputs or background descriptions). This prevents accidental triggering of shortcuts while entering text.

**Exception:** The `Esc` key works even in input fields, allowing you to quickly exit or cancel operations.

### Visual Feedback

Hover over buttons with keyboard shortcuts to see tooltips that display the available shortcut for that action.

### Cross-Platform Support

The shortcuts automatically adapt to your operating system:

- **Windows/Linux:** Uses `Ctrl` key
- **Mac:** Uses `⌘` (Command) key

### Accessibility

All keyboard shortcuts are properly announced to screen readers through ARIA labels, ensuring the interface is accessible to all users.

## Tips

1. **Quick Undo/Redo:** Use `Ctrl+Z` and `Ctrl+Y` (or `Ctrl+Shift+Z`) to quickly iterate through different edits
2. **Fast Download:** Press `Ctrl+S` to quickly download your image without reaching for the mouse
3. **Quick Reset:** If you want to start over, press `Ctrl+R` to reset to the original image
4. **Exit Quickly:** Press `Esc` to exit editing mode or close any open tool panels

## Implementation Details

The keyboard shortcuts are implemented using the `useKeyboardShortcuts` hook, which:

- Listens for keyboard events globally when editing mode is active
- Prevents default browser behavior for shortcuts like `Ctrl+S` (save page) and `Ctrl+R` (reload page)
- Respects input field focus to avoid conflicts with text entry
- Provides platform-specific shortcut detection (Mac vs Windows/Linux)
- Can be easily extended with additional shortcuts in the future
