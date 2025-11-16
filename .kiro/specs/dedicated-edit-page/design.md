# Design Document - Dedicated Edit Page

## Overview

The dedicated edit page provides a professional, focused environment for image editing with a split-panel layout. The left panel contains all editing tools organized in collapsible sections, while the right panel displays the image with zoom, pan, and comparison capabilities.

## Architecture

### Route Structure

```
/edit
  - Query params: imageUrl (required)
  - State: originalImageUrl, editHistory
```

### Component Hierarchy

```
EditPage
├── EditPageHeader
│   ├── BackButton
│   ├── PageTitle
│   └── ActionButtons (Download, Share)
├── EditPageLayout
│   ├── ToolPanel (Left - 30-40% width)
│   │   ├── ToolPanelHeader
│   │   └── ToolAccordion
│   │       ├── BackgroundEditorSection
│   │       ├── GenerativeFillSection
│   │       ├── EnhancementSection
│   │       ├── UpscaleSection
│   │       └── CanvasExpanderSection
│   └── ImagePanel (Right - 60-70% width)
│       ├── ImageToolbar (Undo/Redo/Reset/Compare)
│       ├── ImageCanvas
│       │   ├── ZoomControls
│       │   └── ImageDisplay
│       └── ImageInfo (Dimensions, File size)
```

## Components and Interfaces

### 1. EditPage Component

**Location:** `src/pages/EditPage.tsx`

**Purpose:** Main container for the editing interface

**Props:**

```typescript
interface EditPageProps {
  // No props - uses URL params and location state
}
```

**State:**

```typescript
interface EditPageState {
  currentImageUrl: string;
  originalImageUrl: string;
  editHistory: EditHistoryItem[];
  historyIndex: number;
  isLoading: boolean;
  loadingMessage: string;
  zoom: number;
  panPosition: { x: number; y: number };
  showComparison: boolean;
}

interface EditHistoryItem {
  imageUrl: string;
  operation: string;
  timestamp: number;
}
```

**Key Methods:**

- `loadImageFromParams()` - Extract image URL from route params
- `handleEditComplete(newImageUrl, operation)` - Add to history
- `handleUndo()` - Navigate back in history
- `handleRedo()` - Navigate forward in history
- `handleDownload()` - Download current image
- `handleBack()` - Navigate to previous page

### 2. EditPageLayout Component

**Location:** `src/components/EditPageLayout.tsx`

**Purpose:** Manages the split-panel layout with responsive behavior

**Props:**

```typescript
interface EditPageLayoutProps {
  toolPanel: React.ReactNode;
  imagePanel: React.ReactNode;
}
```

**Responsive Breakpoints:**

- Desktop (>1024px): Side-by-side panels (40% / 60%)
- Tablet (768px-1024px): Side-by-side panels (35% / 65%)
- Mobile (<768px): Stacked layout (tools above, image below)

**CSS Grid Layout:**

```css
.edit-page-layout {
  display: grid;
  grid-template-columns: 40% 60%;
  height: calc(100vh - 64px); /* Subtract header height */
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

### 3. ToolPanel Component

**Location:** `src/components/ToolPanel.tsx`

**Purpose:** Container for all editing tools with accordion organization

**Props:**

```typescript
interface ToolPanelProps {
  currentImageUrl: string;
  onEditComplete: (newImageUrl: string, operation: string) => void;
  isProcessing: boolean;
}
```

**Features:**

- Scrollable container with fixed header
- Accordion sections for each tool category
- Disabled state when processing
- Keyboard navigation support

**Tool Sections:**

1. **Background Tools**
   - Remove Background
   - Replace Background
   - Blur Background

2. **Generative Fill**
   - Mask drawing canvas
   - Prompt input
   - Version selector

3. **Enhancement**
   - Quality enhancement
   - One-click operation

4. **Upscale**
   - 2x / 4x scale selector
   - Resolution preview

5. **Canvas Expander**
   - Aspect ratio presets
   - Custom dimensions
   - Expansion preview

### 4. ImagePanel Component

**Location:** `src/components/ImagePanel.tsx`

**Purpose:** Display and interact with the image being edited

**Props:**

```typescript
interface ImagePanelProps {
  imageUrl: string;
  originalImageUrl: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  isLoading: boolean;
  loadingMessage?: string;
}
```

**Features:**

- Zoom controls (fit, 100%, 200%, custom)
- Pan/drag functionality
- Image comparison slider (original vs edited)
- Loading overlay with progress
- Image metadata display

**Zoom Implementation:**

```typescript
const zoomLevels = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];

function handleZoom(direction: 'in' | 'out' | 'fit' | number) {
  if (direction === 'fit') {
    // Calculate zoom to fit image in viewport
    const fitZoom = calculateFitZoom(imageSize, viewportSize);
    setZoom(fitZoom);
  } else if (typeof direction === 'number') {
    setZoom(direction);
  } else {
    const currentIndex = zoomLevels.indexOf(zoom);
    const newIndex = direction === 'in' 
      ? Math.min(currentIndex + 1, zoomLevels.length - 1)
      : Math.max(currentIndex - 1, 0);
    setZoom(zoomLevels[newIndex]);
  }
}
```

### 5. EditPageHeader Component

**Location:** `src/components/EditPageHeader.tsx`

**Purpose:** Top navigation and action buttons

**Props:**

```typescript
interface EditPageHeaderProps {
  onBack: () => void;
  onDownload: () => void;
  hasUnsavedChanges: boolean;
}
```

**Layout:**

```
[← Back] [Image Editor] ........................ [Download] [Share]
```

## Data Models

### Edit History

```typescript
interface EditHistory {
  items: EditHistoryItem[];
  currentIndex: number;
  maxSize: number; // Default: 20
}

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
  | 'remove_background'
  | 'replace_background'
  | 'blur_background'
  | 'generative_fill'
  | 'enhance'
  | 'upscale'
  | 'expand_canvas';
```

### Navigation State

```typescript
interface EditPageNavigationState {
  imageUrl: string;
  originalImageUrl?: string;
  fromRoute?: string; // For back navigation
}
```

## Error Handling

### Error Scenarios

1. **Missing Image URL**
   - Display error message: "No image to edit"
   - Provide button to return to home page

2. **Image Load Failure**
   - Display error message with retry button
   - Log error details for debugging

3. **Edit Operation Failure**
   - Show toast notification with error
   - Revert to previous image state
   - Keep history intact

4. **Network Errors**
   - Display offline indicator
   - Queue operations for retry
   - Provide manual retry option

### Error Component

```typescript
function EditPageError({ 
  error, 
  onRetry, 
  onBack 
}: EditPageErrorProps) {
  return (
    <div className="edit-page-error">
      <AlertCircle size={48} />
      <h2>Unable to Load Editor</h2>
      <p>{error.message}</p>
      <div className="error-actions">
        <Button onClick={onRetry}>Try Again</Button>
        <Button variant="outline" onClick={onBack}>Go Back</Button>
      </div>
    </div>
  );
}
```

## Testing Strategy

### Unit Tests

1. **EditPage Component**
   - Loads image from URL params
   - Handles missing image URL
   - Manages edit history correctly
   - Undo/redo functionality

2. **ToolPanel Component**
   - Renders all tool sections
   - Disables during processing
   - Emits correct events

3. **ImagePanel Component**
   - Zoom controls work correctly
   - Pan functionality
   - Comparison slider

### Integration Tests

1. **Navigation Flow**
   - Navigate from results to edit page
   - Pass image URL correctly
   - Back navigation preserves state

2. **Edit Operations**
   - Complete edit operation
   - Update image display
   - Add to history

3. **History Management**
   - Undo reverts to previous image
   - Redo restores next image
   - History limit enforced

### Accessibility Tests

1. **Keyboard Navigation**
   - Tab through all controls
   - Keyboard shortcuts work
   - Focus management

2. **Screen Reader**
   - Proper ARIA labels
   - Status announcements
   - Tool descriptions

## Performance Considerations

### Image Loading

- Use progressive image loading
- Cache images in browser storage
- Preload next/previous history items

### Memory Management

- Limit history size to 20 items
- Clear old history items from memory
- Use image URLs instead of base64 when possible

### Responsive Performance

- Lazy load tool components
- Debounce zoom/pan operations
- Use CSS transforms for smooth animations

## Accessibility

### ARIA Labels

```typescript
<div 
  role="region" 
  aria-label="Image editing workspace"
  className="edit-page-layout"
>
  <aside 
    role="complementary" 
    aria-label="Editing tools"
    className="tool-panel"
  >
    {/* Tools */}
  </aside>
  
  <main 
    role="main" 
    aria-label="Image canvas"
    className="image-panel"
  >
    {/* Image */}
  </main>
</div>
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+0 | Zoom to fit |
| Ctrl++ | Zoom in |
| Ctrl+- | Zoom out |
| Escape | Close dialogs/Cancel |
| Ctrl+S | Download image |

### Focus Management

- Focus trap in modal dialogs
- Return focus after operations
- Visible focus indicators
- Skip links for navigation

## Visual Design

### Color Scheme

- Tool panel background: `hsl(var(--muted))`
- Image panel background: `hsl(var(--background))`
- Divider: `hsl(var(--border))`
- Active tool: `hsl(var(--primary))`

### Spacing

- Panel gap: 0 (seamless)
- Tool section padding: 1rem
- Image canvas padding: 2rem
- Button spacing: 0.5rem

### Typography

- Page title: 1.5rem, font-semibold
- Tool section headers: 1rem, font-medium
- Tool labels: 0.875rem, font-normal
- Image info: 0.75rem, text-muted-foreground

## Implementation Notes

### Routing Setup

Update `App.tsx` to include the edit route:

```typescript
<Routes>
  <Route path="/" element={<StandardMode />} />
  <Route path="/pro" element={<ProMode />} />
  <Route path="/edit" element={<EditPage />} />
</Routes>
```

### Navigation from Results

Update `ResultsPanel.tsx` to add Edit button:

```typescript
<Button 
  onClick={() => navigate('/edit', { 
    state: { 
      imageUrl: generatedImageUrl,
      originalImageUrl: generatedImageUrl,
      fromRoute: location.pathname
    } 
  })}
>
  <Edit size={16} />
  Edit Image
</Button>
```

### State Persistence

Use `sessionStorage` to persist edit state:

```typescript
// Save on edit
sessionStorage.setItem('editState', JSON.stringify({
  currentImageUrl,
  history,
  historyIndex
}));

// Load on mount
const savedState = sessionStorage.getItem('editState');
if (savedState) {
  const state = JSON.parse(savedState);
  // Restore state
}
```

## Future Enhancements

1. **Batch Editing**
   - Edit multiple images in sequence
   - Apply same edits to multiple images

2. **Preset Workflows**
   - Save common editing sequences
   - One-click apply preset workflows

3. **Collaboration**
   - Share edit link with others
   - Real-time collaborative editing

4. **Advanced Tools**
   - Layer support
   - Masking tools
   - Color adjustments
   - Filters and effects
