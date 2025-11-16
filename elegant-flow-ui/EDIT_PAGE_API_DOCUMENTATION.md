# Edit Page API Documentation

## Overview

This document provides detailed API documentation for all components, hooks, and utilities related to the Edit Page feature.

## Table of Contents

- [Components](#components)
  - [EditPage](#editpage)
  - [EditPageLayout](#editpagelayout)
  - [EditPageHeader](#editpageheader)
  - [ToolPanel](#toolpanel)
  - [ImagePanel](#imagepanel)
  - [LazyToolPanel](#lazytoolpanel)
- [Hooks](#hooks)
  - [useEditHistory](#useedithistory)
  - [useKeyboardShortcuts](#usekeyboardshortcuts)
- [Utilities](#utilities)
  - [imageCache](#imagecache)
  - [performanceMonitor](#performancemonitor)
  - [debounce](#debounce)
- [Types](#types)
- [Constants](#constants)

---

## Components

### EditPage

Main container component for the dedicated image editing page.

**Location:** `src/pages/EditPage.tsx`

**Route:** `/edit`

#### Props

None (uses URL parameters and navigation state)

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `imageUrl` | string | Yes | URL of the image to edit |

#### Navigation State

```typescript
interface EditPageNavigationState {
  imageUrl?: string;              // Current image URL
  originalImageUrl?: string;      // Original image for comparison
  fromRoute?: string;             // Previous route for back navigation
}
```

**Example:**

```typescript
navigate('/edit', {
  state: {
    imageUrl: 'https://example.com/image.jpg',
    originalImageUrl: 'https://example.com/original.jpg',
    fromRoute: '/results'
  }
});
```

#### State Management

```typescript
interface EditPageState {
  currentImageUrl: string;        // Currently displayed image
  originalImageUrl: string;       // Original image for comparison
  editHistory: EditHistoryItem[]; // Array of edit operations
  historyIndex: number;           // Current position in history
  isLoading: boolean;             // Edit operation in progress
  loadingMessage: string;         // Current operation description
  zoom: number;                   // Current zoom level (0.25 to 4)
  panPosition: { x: number; y: number }; // Pan offset
  showComparison: boolean;        // Comparison mode active
  hasUnsavedChanges: boolean;     // Edits have been made
}
```

#### Methods

##### handleEditComplete

Called when an edit operation completes successfully.

```typescript
function handleEditComplete(
  newImageUrl: string,
  operation: string
): void
```

**Parameters:**

- `newImageUrl`: URL of the edited image
- `operation`: Type of edit operation (e.g., 'remove-bg', 'enhance')

**Behavior:**

- Adds edit to history
- Updates current image display
- Clears loading state
- Shows success toast
- Preloads image into cache

##### handleEditError

Called when an edit operation fails.

```typescript
function handleEditError(
  operation: string,
  errorMessage?: string
): void
```

**Parameters:**

- `operation`: Type of edit operation that failed
- `errorMessage`: Optional error message to display

**Behavior:**

- Clears loading state
- Shows error toast
- Keeps previous image state

##### handleEditStart

Called when an edit operation begins.

```typescript
function handleEditStart(
  operation: string
): void
```

**Parameters:**

- `operation`: Type of edit operation starting

**Behavior:**

- Sets loading state
- Shows loading overlay
- Disables tool interactions
- Starts performance monitoring

##### handleUndo

Reverts to the previous image in history.

```typescript
function handleUndo(): void
```

**Keyboard Shortcut:** `Ctrl+Z`

**Behavior:**

- Moves back one step in history
- Updates current image
- Disabled when at beginning of history

##### handleRedo

Restores the next image in history.

```typescript
function handleRedo(): void
```

**Keyboard Shortcut:** `Ctrl+Y`

**Behavior:**

- Moves forward one step in history
- Updates current image
- Disabled when at end of history

##### handleReset

Resets to the original image, clearing all edits.

```typescript
function handleReset(): void
```

**Behavior:**

- Clears entire edit history
- Returns to original image
- Requires confirmation

##### handleDownload

Downloads the current image to the user's device.

```typescript
async function handleDownload(): Promise<void>
```

**Keyboard Shortcut:** `Ctrl+S`

**Behavior:**

- Fetches current image
- Determines file format
- Creates descriptive filename with timestamp
- Triggers browser download
- Shows success/error toast

**Filename Format:** `edited-image-YYYY-MM-DD-HHmmss.{ext}`

##### handleBack

Navigates back to the previous page.

```typescript
function handleBack(): void
```

**Behavior:**

- Shows confirmation if unsaved changes exist
- Navigates to `fromRoute` or home
- Preserves navigation state

#### Keyboard Shortcuts

| Shortcut | Action | Handler |
|----------|--------|---------|
| `Ctrl+Z` | Undo | `handleUndo()` |
| `Ctrl+Y` | Redo | `handleRedo()` |
| `Ctrl+0` | Zoom to fit | `zoomControlsRef.current?.zoomFit()` |
| `Ctrl++` | Zoom in | `zoomControlsRef.current?.zoomIn()` |
| `Ctrl+-` | Zoom out | `zoomControlsRef.current?.zoomOut()` |
| `Ctrl+S` | Download | `handleDownload()` |
| `Escape` | Cancel/Back | `handleBack()` |

#### Error Handling

**Missing Image URL:**

```typescript
if (!imageUrl) {
  // Shows error screen with "Go Back" button
  setError('No image URL provided. Please select an image to edit.');
}
```

**Image Load Failure:**

```typescript
if (imageLoadError) {
  // Shows error screen with "Retry" and "Go Back" buttons
  setImageLoadError(true);
}
```

**Edit Operation Failure:**

```typescript
handleEditError(operation, errorMessage);
// Shows toast notification with error details
```

#### Accessibility

- Skip links for keyboard navigation
- ARIA labels on all interactive elements
- Live regions for status announcements
- Focus management
- Screen reader support

#### Performance

- Image preloading and caching
- Lazy loading of tool components
- Performance monitoring
- Debounced zoom/pan operations

---

### EditPageLayout

Responsive split-panel layout component.

**Location:** `src/components/EditPageLayout.tsx`

#### Props

```typescript
interface EditPageLayoutProps {
  toolPanel: React.ReactNode;    // Left panel content
  imagePanel: React.ReactNode;   // Right panel content
  enableResize?: boolean;         // Enable panel resizing (default: false)
}
```

#### Layout Structure

```
Desktop (>1024px):
┌──────────────┬──────────────────────┐
│  ToolPanel   │    ImagePanel        │
│   (40%)      │      (60%)           │
└──────────────┴──────────────────────┘

Tablet (768px-1024px):
┌──────────────┬──────────────────────┐
│  ToolPanel   │    ImagePanel        │
│   (35%)      │      (65%)           │
└──────────────┴──────────────────────┘

Mobile (<768px):
┌──────────────────────────────────────┐
│          ToolPanel                   │
├──────────────────────────────────────┤
│          ImagePanel                  │
└──────────────────────────────────────┘
```

#### CSS Classes

```css
.edit-page-layout {
  display: grid;
  grid-template-columns: 40% 60%;
  height: calc(100vh - 64px);
  gap: 0;
}

@media (max-width: 1024px) {
  .edit-page-layout {
    grid-template-columns: 35% 65%;
  }
}

@media (max-width: 768px) {
  .edit-page-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
}
```

#### Features

- CSS Grid-based responsive layout
- Smooth transitions between breakpoints
- Optional panel resizing (drag divider)
- Touch-friendly on mobile
- Maintains scroll position

---

### EditPageHeader

Top navigation bar with actions.

**Location:** `src/components/EditPageHeader.tsx`

#### Props

```typescript
interface EditPageHeaderProps {
  onBack: () => void;              // Back button handler
  onDownload: () => void;          // Download button handler
  onUndo?: () => void;             // Undo button handler
  onRedo?: () => void;             // Redo button handler
  canUndo?: boolean;               // Enable undo button
  canRedo?: boolean;               // Enable redo button
  hasUnsavedChanges?: boolean;     // Show unsaved indicator
  isLoading?: boolean;             // Disable actions during operations
}
```

#### Layout

```
[← Back] [Image Editor] [Undo] [Redo] .......... [Download]
```

#### Features

- Back navigation with confirmation
- Undo/Redo buttons with keyboard shortcuts
- Download button
- Responsive spacing
- Disabled state during loading
- ARIA labels for accessibility

#### Example Usage

```typescript
<EditPageHeader
  onBack={handleBack}
  onDownload={handleDownload}
  onUndo={handleUndo}
  onRedo={handleRedo}
  canUndo={canUndo}
  canRedo={canRedo}
  hasUnsavedChanges={canUndo}
  isLoading={isLoading}
/>
```

---

### ToolPanel

Container for all editing tools.

**Location:** `src/components/ToolPanel.tsx`

#### Props

```typescript
interface ToolPanelProps {
  currentImageUrl: string;         // Current image being edited
  onEditComplete: (
    newImageUrl: string,
    operation: string
  ) => void;                       // Edit completion handler
  onEditStart?: (
    operation: string
  ) => void;                       // Edit start handler
  onEditError?: (
    operation: string,
    errorMessage?: string
  ) => void;                       // Edit error handler
  isProcessing: boolean;           // Operation in progress
}
```

#### Tool Sections

1. **Background Tools** (`background-tools`)
   - Remove Background
   - Replace Background
   - Blur Background

2. **Generative Fill** (`generative-fill`)
   - Mask drawing canvas
   - Prompt input
   - Generate button

3. **Enhancement** (`enhancement`)
   - One-click quality enhancement

4. **Upscale** (`upscale`)
   - 2x / 4x scale options

5. **Canvas Expander** (`canvas-expander`)
   - Aspect ratio presets
   - Custom dimensions

#### Features

- Accordion organization
- Scrollable container
- Disabled state during processing
- Keyboard navigation
- ARIA labels and descriptions
- Visual feedback for active tools

#### Example Usage

```typescript
<ToolPanel
  currentImageUrl={currentImageUrl}
  onEditComplete={handleEditComplete}
  onEditStart={handleEditStart}
  onEditError={handleEditError}
  isProcessing={isLoading}
/>
```

---

### ImagePanel

Image display area with controls.

**Location:** `src/components/ImagePanel.tsx`

#### Props

```typescript
interface ImagePanelProps {
  imageUrl: string;                // Current image URL
  originalImageUrl: string;        // Original image for comparison
  canUndo: boolean;                // Undo available
  canRedo: boolean;                // Redo available
  onUndo: () => void;              // Undo handler
  onRedo: () => void;              // Redo handler
  onReset: () => void;             // Reset handler
  isLoading: boolean;              // Loading state
  loadingMessage?: string;         // Operation description
  onImageLoadError?: () => void;   // Image load error handler
  retryKey?: number;               // Force image reload
  zoomControlsRef?: React.RefObject<ImagePanelZoomControls>; // Zoom controls ref
}
```

#### Zoom Controls Interface

```typescript
interface ImagePanelZoomControls {
  zoomFit: () => void;             // Zoom to fit viewport
  zoomIn: () => void;              // Increase zoom level
  zoomOut: () => void;             // Decrease zoom level
  setZoom: (level: number) => void; // Set specific zoom level
}
```

#### Zoom Levels

```typescript
const zoomLevels = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];
```

#### Features

**Zoom Controls:**

- Fit to viewport
- 100%, 200% presets
- Zoom in/out buttons
- Custom zoom levels (0.25x to 4x)
- Keyboard shortcuts

**Pan/Drag:**

- Mouse drag when zoomed
- Touch drag on mobile
- Smooth momentum scrolling
- Constrained to image bounds

**Image Comparison:**

- Side-by-side slider view
- Original vs edited comparison
- Synchronized zoom and pan
- Toggle with button or keyboard

**Toolbar:**

- Undo/Redo buttons
- Reset button
- Compare toggle
- Zoom controls

**Loading Overlay:**

- Spinner with operation name
- Progress indication
- Disabled interactions

**Image Metadata:**

- Dimensions display
- File size (if available)
- Zoom percentage

#### Example Usage

```typescript
const zoomControlsRef = useRef<ImagePanelZoomControls>(null);

<ImagePanel
  imageUrl={currentImageUrl}
  originalImageUrl={originalImageUrl}
  canUndo={canUndo}
  canRedo={canRedo}
  onUndo={handleUndo}
  onRedo={handleRedo}
  onReset={handleReset}
  isLoading={isLoading}
  loadingMessage={loadingMessage}
  onImageLoadError={handleImageLoadError}
  retryKey={retryCount}
  zoomControlsRef={zoomControlsRef}
/>
```

---

### LazyToolPanel

Lazy-loaded wrapper for ToolPanel.

**Location:** `src/components/LazyToolPanel.tsx`

#### Props

Same as [ToolPanel](#toolpanel)

#### Features

- Code splitting for better performance
- Loading fallback
- Error boundary
- Suspense support

#### Example Usage

```typescript
<LazyToolPanel
  currentImageUrl={currentImageUrl}
  onEditComplete={handleEditComplete}
  onEditStart={handleEditStart}
  onEditError={handleEditError}
  isProcessing={isLoading}
/>
```

---

## Hooks

### useEditHistory

Manages edit history with undo/redo functionality.

**Location:** `src/hooks/useEditHistory.ts`

#### Signature

```typescript
function useEditHistory(
  maxHistorySize?: number
): UseEditHistoryReturn
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `maxHistorySize` | number | 20 | Maximum number of history items |

#### Return Value

```typescript
interface UseEditHistoryReturn {
  currentImageUrl: string;         // Current image URL
  canUndo: boolean;                // Undo available
  canRedo: boolean;                // Redo available
  history: EditHistoryItem[];      // All history items
  historyIndex: number;            // Current position
  initialize: (imageUrl: string) => void; // Initialize with first image
  addToHistory: (
    imageUrl: string,
    operation: EditOperation
  ) => void;                       // Add new edit
  undo: () => void;                // Move back in history
  redo: () => void;                // Move forward in history
  reset: () => void;               // Reset to original
}
```

#### Types

```typescript
interface EditHistoryItem {
  imageUrl: string;
  operation: EditOperation;
  timestamp: number;
  metadata?: {
    operationParams?: any;
    fileSize?: number;
    dimensions?: { width: number; height: number };
  };
}

type EditOperation =
  | 'remove-bg'
  | 'replace-bg'
  | 'blur-bg'
  | 'generative-fill'
  | 'enhance'
  | 'upscale'
  | 'expand-canvas';
```

#### Features

- Maximum history size (default: 20)
- Session storage persistence
- Clears future history on new edit
- Prevents duplicate consecutive operations
- Automatic cleanup of old items

#### Example Usage

```typescript
const {
  currentImageUrl,
  canUndo,
  canRedo,
  initialize,
  addToHistory,
  undo,
  redo,
  reset
} = useEditHistory(20);

// Initialize with first image
useEffect(() => {
  initialize(originalImageUrl);
}, [originalImageUrl]);

// Add an edit
addToHistory(newImageUrl, 'remove-bg');

// Undo/redo
if (canUndo) undo();
if (canRedo) redo();

// Reset to original
reset();
```

---

### useKeyboardShortcuts

Manages keyboard shortcuts for the edit page.

**Location:** `src/hooks/useKeyboardShortcuts.ts`

#### Signature

```typescript
function useKeyboardShortcuts(
  options: KeyboardShortcutsOptions
): void
```

#### Options

```typescript
interface KeyboardShortcutsOptions {
  enabled?: boolean;               // Enable/disable shortcuts (default: true)
  onUndo?: () => void;             // Ctrl+Z handler
  onRedo?: () => void;             // Ctrl+Y handler
  onReset?: () => void;            // Ctrl+R handler
  onDownload?: () => void;         // Ctrl+S handler
  onZoomFit?: () => void;          // Ctrl+0 handler
  onZoomIn?: () => void;           // Ctrl++ handler
  onZoomOut?: () => void;          // Ctrl+- handler
  onEscape?: () => void;           // Escape handler
  onCompare?: () => void;          // C handler
}
```

#### Supported Shortcuts

| Shortcut | Handler | Description |
|----------|---------|-------------|
| `Ctrl+Z` | `onUndo` | Undo last edit |
| `Ctrl+Y` | `onRedo` | Redo next edit |
| `Ctrl+Shift+Z` | `onRedo` | Redo (alternative) |
| `Ctrl+R` | `onReset` | Reset to original |
| `Ctrl+S` | `onDownload` | Download image |
| `Ctrl+0` | `onZoomFit` | Zoom to fit |
| `Ctrl++` | `onZoomIn` | Zoom in |
| `Ctrl+=` | `onZoomIn` | Zoom in (alternative) |
| `Ctrl+-` | `onZoomOut` | Zoom out |
| `Escape` | `onEscape` | Cancel/Close |
| `C` | `onCompare` | Toggle comparison |

#### Features

- Prevents default browser behavior
- Works across Windows/Mac (Cmd on Mac)
- Disabled when typing in input fields
- Can be enabled/disabled dynamically
- ARIA announcements for screen readers

#### Example Usage

```typescript
useKeyboardShortcuts({
  enabled: !isLoading,
  onUndo: canUndo ? handleUndo : undefined,
  onRedo: canRedo ? handleRedo : undefined,
  onDownload: handleDownload,
  onZoomFit: () => zoomControlsRef.current?.zoomFit(),
  onZoomIn: () => zoomControlsRef.current?.zoomIn(),
  onZoomOut: () => zoomControlsRef.current?.zoomOut(),
  onEscape: handleBack,
});
```

---

## Utilities

### imageCache

Image caching utility for performance optimization.

**Location:** `src/lib/imageCache.ts`

#### API

```typescript
interface ImageCache {
  get: (url: string) => Promise<string>;
  preload: (url: string) => Promise<void>;
  clear: () => void;
  has: (url: string) => boolean;
}
```

#### Methods

##### get

Retrieves an image from cache or fetches it.

```typescript
async function get(url: string): Promise<string>
```

**Returns:** Promise resolving to the image URL (cached or original)

##### preload

Preloads an image into the cache.

```typescript
async function preload(url: string): Promise<void>
```

**Use Case:** Preload images before they're needed

##### clear

Clears all cached images.

```typescript
function clear(): void
```

##### has

Checks if an image is in the cache.

```typescript
function has(url: string): boolean
```

**Returns:** `true` if image is cached, `false` otherwise

#### Example Usage

```typescript
import { imageCache } from '@/lib/imageCache';

// Preload image
await imageCache.preload(imageUrl);

// Get image (from cache or fetch)
const cachedUrl = await imageCache.get(imageUrl);

// Check if cached
if (imageCache.has(imageUrl)) {
  // Image is cached
}

// Clear cache
imageCache.clear();
```

---

### performanceMonitor

Performance monitoring utility.

**Location:** `src/lib/performanceMonitor.ts`

#### API

```typescript
interface PerformanceMonitor {
  start: (label: string) => void;
  end: (label: string, metadata?: Record<string, any>) => void;
  getMetrics: () => PerformanceMetric[];
  clear: () => void;
}
```

#### Methods

##### start

Starts a performance measurement.

```typescript
function start(label: string): void
```

##### end

Ends a performance measurement.

```typescript
function end(
  label: string,
  metadata?: Record<string, any>
): void
```

##### getMetrics

Retrieves all performance metrics.

```typescript
function getMetrics(): PerformanceMetric[]
```

##### clear

Clears all metrics.

```typescript
function clear(): void
```

#### Example Usage

```typescript
import { performanceMonitor } from '@/lib/performanceMonitor';

// Start measurement
performanceMonitor.start('edit-operation-remove-bg');

// ... perform operation ...

// End measurement
performanceMonitor.end('edit-operation-remove-bg', {
  imageSize: '1920x1080',
  success: true
});

// Get metrics
const metrics = performanceMonitor.getMetrics();
console.log(metrics);
```

---

### debounce

Debounce utility for performance optimization.

**Location:** `src/lib/debounce.ts`

#### Signature

```typescript
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `func` | Function | Function to debounce |
| `wait` | number | Delay in milliseconds |

#### Example Usage

```typescript
import { debounce } from '@/lib/debounce';

const handleZoom = debounce((level: number) => {
  setZoom(level);
}, 100);

// Call multiple times, only executes once after 100ms
handleZoom(1.5);
handleZoom(2);
handleZoom(2.5); // Only this will execute
```

---

## Types

### EditOperation

```typescript
type EditOperation =
  | 'remove-bg'
  | 'replace-bg'
  | 'blur-bg'
  | 'generative-fill'
  | 'enhance'
  | 'upscale'
  | 'expand-canvas';
```

### EditHistoryItem

```typescript
interface EditHistoryItem {
  imageUrl: string;
  operation: EditOperation;
  timestamp: number;
  metadata?: {
    operationParams?: any;
    fileSize?: number;
    dimensions?: { width: number; height: number };
  };
}
```

### ZoomLevel

```typescript
type ZoomLevel = 0.25 | 0.5 | 0.75 | 1 | 1.5 | 2 | 3 | 4;
```

### PanPosition

```typescript
interface PanPosition {
  x: number;
  y: number;
}
```

---

## Constants

### Zoom Levels

```typescript
export const ZOOM_LEVELS: ZoomLevel[] = [
  0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4
];
```

### Max History Size

```typescript
export const MAX_HISTORY_SIZE = 20;
```

### Session Storage Keys

```typescript
export const STORAGE_KEYS = {
  EDIT_HISTORY: 'edit-history',
  EDIT_STATE: 'edit-state',
};
```

---

## Error Handling

### Error Types

```typescript
type EditPageError =
  | 'missing-image-url'
  | 'image-load-failed'
  | 'edit-operation-failed'
  | 'download-failed'
  | 'network-error';
```

### Error Messages

```typescript
const ERROR_MESSAGES: Record<EditPageError, string> = {
  'missing-image-url': 'No image URL provided. Please select an image to edit.',
  'image-load-failed': 'Failed to load image. Please try again.',
  'edit-operation-failed': 'Edit operation failed. Please try again.',
  'download-failed': 'Unable to download image. Please try again.',
  'network-error': 'Network error. Please check your connection.',
};
```

---

## Best Practices

### Component Usage

1. **Always provide error handlers:**

   ```typescript
   <ToolPanel
     onEditError={handleEditError}
     // ... other props
   />
   ```

2. **Use refs for zoom controls:**

   ```typescript
   const zoomControlsRef = useRef<ImagePanelZoomControls>(null);
   ```

3. **Enable keyboard shortcuts:**

   ```typescript
   useKeyboardShortcuts({
     enabled: !isLoading,
     // ... handlers
   });
   ```

### Performance

1. **Preload images:**

   ```typescript
   await imageCache.preload(imageUrl);
   ```

2. **Monitor operations:**

   ```typescript
   performanceMonitor.start('operation');
   // ... operation ...
   performanceMonitor.end('operation');
   ```

3. **Debounce frequent operations:**

   ```typescript
   const debouncedZoom = debounce(handleZoom, 100);
   ```

### Accessibility

1. **Provide ARIA labels:**

   ```typescript
   <button aria-label="Undo last edit">Undo</button>
   ```

2. **Use live regions:**

   ```typescript
   <div role="status" aria-live="polite">
     {statusMessage}
   </div>
   ```

3. **Support keyboard navigation:**

   ```typescript
   useKeyboardShortcuts({ /* ... */ });
   ```

---

## Migration Guide

### From v0.x to v1.0

**Breaking Changes:**

1. `onEditComplete` now requires operation type:

   ```typescript
   // Before
   onEditComplete(imageUrl);
   
   // After
   onEditComplete(imageUrl, 'remove-bg');
   ```

2. `useEditHistory` now requires initialization:

   ```typescript
   // Before
   const { currentImageUrl } = useEditHistory(initialUrl);
   
   // After
   const { currentImageUrl, initialize } = useEditHistory();
   useEffect(() => {
     initialize(initialUrl);
   }, [initialUrl]);
   ```

3. Zoom controls now use ref:

   ```typescript
   // Before
   <ImagePanel onZoomFit={handleZoomFit} />
   
   // After
   const zoomControlsRef = useRef<ImagePanelZoomControls>(null);
   <ImagePanel zoomControlsRef={zoomControlsRef} />
   ```

---

## Troubleshooting

### Common Issues

**Issue:** Keyboard shortcuts not working

**Solution:** Ensure the edit page has focus and shortcuts are enabled:

```typescript
useKeyboardShortcuts({ enabled: true, /* ... */ });
```

**Issue:** Images not loading

**Solution:** Check image URLs and network connectivity. Use retry mechanism:

```typescript
<ImagePanel
  onImageLoadError={handleImageLoadError}
  retryKey={retryCount}
/>
```

**Issue:** History not persisting

**Solution:** Ensure session storage is available and not full:

```typescript
try {
  sessionStorage.setItem('test', 'test');
  sessionStorage.removeItem('test');
} catch (e) {
  console.error('Session storage not available');
}
```

---

## Support

For additional help:

- Review the [User Guide](./EDIT_PAGE_USER_GUIDE.md)
- Check [Keyboard Shortcuts](./EDIT_PAGE_KEYBOARD_SHORTCUTS.md)
- See [Performance Guide](./EDIT_PAGE_PERFORMANCE.md)
- Read [Accessibility Guide](./EDIT_PAGE_ACCESSIBILITY.md)
