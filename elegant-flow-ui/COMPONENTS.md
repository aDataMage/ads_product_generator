# Component API Documentation

This document provides detailed API documentation for all components in the Elegant Flow UI.

## Table of Contents

- [Core Components](#core-components)
  - [App](#app)
  - [SetupPanel](#setuppanel)
  - [ResultsPanel](#resultspanel)
- [Edit Page Components](#edit-page-components)
  - [EditPage](#editpage)
  - [EditPageLayout](#editpagelayout)
  - [EditPageHeader](#editpageheader)
  - [ToolPanel](#toolpanel)
  - [ImagePanel](#imagepanel)
- [Input Components](#input-components)
  - [ProductDescriptionCard](#productdescriptioncard)
  - [StylePresetCard](#stylepresetcard)
  - [ReferenceImageCard](#referenceimagecard)
  - [GenerateButton](#generatebutton)
- [UI Components](#ui-components)
- [Custom Hooks](#custom-hooks)
- [TypeScript Interfaces](#typescript-interfaces)

## Core Components

### App

The root application component that orchestrates state management and layout.

**Location:** `src/App.tsx`

**State:**

```typescript
interface AppState {
  userPrompt: string;              // Product description text
  selectedPreset: string | null;   // Selected style preset filename
  referenceImage: string | null;   // Base64 encoded reference image
  isLoading: boolean;              // Generation in progress
  generatedImageUrl: string | null; // URL of generated image
  error: string | null;            // Error message if generation failed
}
```

**Features:**

- Two-column responsive layout (desktop) / single-column (mobile)
- Form validation before submission
- API integration for image generation
- State management for entire workflow
- Framer Motion animations for initial load

**Requirements:** 2.1, 2.2, 2.4, 6.3, 6.4, 6.5, 7.1

---

### SetupPanel

Container component for all input controls in the left panel.

**Location:** `src/components/SetupPanel.tsx`

**Props:**

```typescript
interface SetupPanelProps {
  userPrompt: string;                      // Current product description
  selectedPreset: string | null;           // Currently selected preset
  referenceImage: string | null;           // Base64 encoded image
  isLoading: boolean;                      // Generation in progress
  validationErrors: ValidationErrors;      // Field validation errors
  onPromptChange: (value: string) => void; // Description change handler
  onPresetChange: (value: string) => void; // Preset selection handler
  onImageUpload: (base64: string | null) => void; // Image upload handler
  onGenerate: () => void;                  // Generate button handler
}
```

**Child Components:**

- ProductDescriptionCard
- StylePresetCard
- ReferenceImageCard
- GenerateButton

**Features:**

- Form validation logic
- Disabled state during loading
- ARIA labels for accessibility
- Responsive spacing

**Requirements:** 2.2, 6.3, 6.4, 7.1

---

### ResultsPanel

Container for displaying generation status and results in the right panel.

**Location:** `src/components/ResultsPanel.tsx`

**Props:**

```typescript
interface ResultsPanelProps {
  isLoading: boolean;              // Generation in progress
  generatedImageUrl: string | null; // URL of generated image
  error: string | null;            // Error message if failed
}
```

**States:**

1. **Idle:** Empty state with placeholder message
2. **Loading:** Spinner + "Generating your image..." + time estimate
3. **Success:** Generated image + download button
4. **Error:** Alert with error message

**Features:**

- Framer Motion AnimatePresence for state transitions
- Lazy loading for performance
- Focus management (focuses download button on success)
- ARIA live regions for screen reader announcements
- Responsive sizing and spacing

**Requirements:** 2.2, 7.2, 7.3, 7.4, 7.5, 8.1-8.5, 9.1-9.5, 10.2, 13.4

---

## Edit Page Components

### EditPage

The main container component for the dedicated image editing page with split-panel layout.

**Location:** `src/pages/EditPage.tsx`

**Route:** `/edit`

**URL Parameters:**

- `imageUrl` (query param): URL of the image to edit (required)

**Navigation State:**

```typescript
interface EditPageNavigationState {
  imageUrl: string;              // Current image URL
  originalImageUrl?: string;     // Original image for comparison
  fromRoute?: string;            // Previous route for back navigation
}
```

**State:**

```typescript
interface EditPageState {
  currentImageUrl: string;       // Currently displayed image
  originalImageUrl: string;      // Original image for comparison
  editHistory: EditHistoryItem[]; // Array of edit operations
  historyIndex: number;          // Current position in history
  isLoading: boolean;            // Edit operation in progress
  loadingMessage: string;        // Current operation description
  zoom: number;                  // Current zoom level (0.25 to 4)
  panPosition: { x: number; y: number }; // Pan offset for zoomed images
  showComparison: boolean;       // Whether comparison mode is active
  hasUnsavedChanges: boolean;    // Whether edits have been made
}
```

**Key Methods:**

- `loadImageFromParams()` - Extract and validate image URL from route
- `handleEditComplete(newImageUrl, operation)` - Add edit to history and update display
- `handleUndo()` - Navigate back in edit history
- `handleRedo()` - Navigate forward in edit history
- `handleReset()` - Reset to original image
- `handleDownload()` - Download current image with timestamp
- `handleBack()` - Navigate to previous page with confirmation if unsaved changes

**Features:**

- Split-panel layout with tools on left, image on right
- Edit history management (undo/redo)
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+0, Ctrl+/-)
- Image zoom and pan controls
- Loading overlay during operations
- Error boundary for graceful error handling
- Session storage persistence
- Responsive mobile layout

**Keyboard Shortcuts:**

| Shortcut | Action |
|----------|--------|
| Ctrl+Z | Undo last edit |
| Ctrl+Y | Redo next edit |
| Ctrl+0 | Zoom to fit |
| Ctrl++ | Zoom in |
| Ctrl+- | Zoom out |
| Escape | Close dialogs/Cancel |

**Requirements:** 1.1, 1.2, 1.3, 1.4, 3.5, 4.1, 4.2, 4.3, 4.4, 8.1, 8.2, 8.3, 8.4

---

### EditPageLayout

Responsive split-panel layout component for the edit page.

**Location:** `src/components/EditPageLayout.tsx`

**Props:**

```typescript
interface EditPageLayoutProps {
  toolPanel: React.ReactNode;     // Left panel content (editing tools)
  imagePanel: React.ReactNode;    // Right panel content (image display)
}
```

**Layout Structure:**

```
┌─────────────────────────────────────┐
│         EditPageHeader              │
├──────────────┬──────────────────────┤
│              │                      │
│  ToolPanel   │    ImagePanel        │
│   (30-40%)   │     (60-70%)         │
│              │                      │
└──────────────┴──────────────────────┘
```

**Responsive Breakpoints:**

- **Desktop (>1024px):** Side-by-side panels (40% / 60%)
- **Tablet (768px-1024px):** Side-by-side panels (35% / 65%)
- **Mobile (<768px):** Stacked layout (tools above, image below)

**Features:**

- CSS Grid-based layout
- Responsive panel sizing
- Fixed header with scrollable panels
- Smooth transitions between breakpoints
- Touch-friendly on mobile devices

**Requirements:** 2.1, 2.2, 2.3, 5.1, 5.2, 5.3, 5.4

---

### EditPageHeader

Top navigation bar with back button, title, and action buttons.

**Location:** `src/components/EditPageHeader.tsx`

**Props:**

```typescript
interface EditPageHeaderProps {
  onBack: () => void;              // Back button handler
  onDownload: () => void;          // Download button handler
  hasUnsavedChanges: boolean;      // Whether to show confirmation on back
  isLoading?: boolean;             // Disable actions during operations
}
```

**Layout:**

```
[← Back] [Image Editor] ........................ [Download]
```

**Features:**

- Back navigation with unsaved changes confirmation
- Download button with icon
- Responsive spacing and sizing
- Disabled state during loading
- ARIA labels for accessibility
- Sticky positioning at top

**Requirements:** 4.1, 4.2, 4.3, 6.1, 6.2

---

### ToolPanel

Scrollable container for all image editing tools organized in accordion sections.

**Location:** `src/components/ToolPanel.tsx`

**Props:**

```typescript
interface ToolPanelProps {
  currentImageUrl: string;         // Current image being edited
  onEditComplete: (newImageUrl: string, operation: string) => void; // Edit completion handler
  isProcessing: boolean;           // Whether an operation is in progress
}
```

**Tool Sections:**

1. **Background Tools**
   - Remove Background
   - Replace Background
   - Blur Background

2. **Generative Fill**
   - Mask drawing canvas
   - Prompt input
   - Generate button

3. **Enhancement**
   - One-click quality enhancement

4. **Upscale**
   - 2x / 4x scale options

5. **Canvas Expander**
   - Aspect ratio presets
   - Custom dimensions

**Features:**

- Accordion organization for better space management
- Scrollable container with fixed header
- Disabled state during processing
- Lazy loading of tool components
- Keyboard navigation support
- ARIA labels and descriptions
- Visual feedback for active tools

**Requirements:** 2.1, 2.2, 2.3, 2.4, 2.5

---

### ImagePanel

Image display area with zoom, pan, and comparison capabilities.

**Location:** `src/components/ImagePanel.tsx`

**Props:**

```typescript
interface ImagePanelProps {
  imageUrl: string;                // Current image URL
  originalImageUrl: string;        // Original image for comparison
  canUndo: boolean;                // Whether undo is available
  canRedo: boolean;                // Whether redo is available
  onUndo: () => void;              // Undo handler
  onRedo: () => void;              // Redo handler
  onReset: () => void;             // Reset to original handler
  isLoading: boolean;              // Loading state
  loadingMessage?: string;         // Operation description
}
```

**Features:**

- **Zoom Controls:**
  - Fit to viewport
  - 100%, 200% presets
  - Zoom in/out buttons
  - Custom zoom levels (0.25x to 4x)

- **Pan/Drag:**
  - Mouse drag when zoomed
  - Touch drag on mobile
  - Smooth momentum scrolling

- **Image Comparison:**
  - Side-by-side slider view
  - Original vs edited comparison
  - Synchronized zoom and pan

- **Toolbar:**
  - Undo/Redo buttons with keyboard shortcuts
  - Reset button
  - Compare toggle
  - Zoom controls

- **Loading Overlay:**
  - Spinner with operation name
  - Progress indication
  - Disabled interactions during loading

- **Image Metadata:**
  - Dimensions display
  - File size (if available)
  - Zoom percentage

**Zoom Levels:**

```typescript
const zoomLevels = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];
```

**Requirements:** 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2, 7.3, 7.4

---

## Input Components

### ProductDescriptionCard

Card component containing a textarea for product description input.

**Location:** `src/components/ProductDescriptionCard.tsx`

**Props:**

```typescript
interface ProductDescriptionCardProps {
  value: string;                   // Current text value
  onChange: (value: string) => void; // Change handler
  isLoading: boolean;              // Disabled during loading
  error?: string;                  // Validation error message
}
```

**Constants:**

```typescript
export const MIN_CHARACTERS = 3;
export const MAX_CHARACTERS = 500;
```

**Features:**

- Character counter (current/max)
- Real-time validation
- Error message display
- ARIA labels and descriptions
- Responsive text sizing

**Validation:**

- Minimum 3 characters required
- Maximum 500 characters
- Shows error when below minimum

**Requirements:** 3.1, 3.2, 3.3, 3.4, 3.5, 13.2, 13.4

---

### StylePresetCard

Card component containing a radio group for style preset selection.

**Location:** `src/components/StylePresetCard.tsx`

**Props:**

```typescript
interface StylePresetCardProps {
  value: string | null;            // Selected preset filename
  onChange: (value: string) => void; // Selection handler
  isLoading: boolean;              // Disabled during loading
  error?: string;                  // Validation error message
}
```

**Available Presets:**

1. Bright Clean (`preset_bright_clean.json`)
2. Luxury Reflection (`preset_luxury_reflection.json`)
3. Minimalist Shadow (`preset_minimalist_shadow.json`)
4. Natural Warm (`preset_natural_warm.json`)
5. Vibrant Pop (`preset_vibrant_pop.json`)
6. Detail Macro (`preset_detail_macro.json`)
7. Editorial Dark (`preset_editorial_dark.json`)
8. Flat Lay (`preset_flat_lay.json`)
9. Hero Shot (`preset_hero_shot.json`)
10. Lifestyle Context (`preset_lifestyle_context.json`)

**Features:**

- Radio group with all 10 presets
- Visual selection indicator
- Keyboard navigation (arrow keys)
- ARIA labels for accessibility
- Responsive grid layout

**Validation:**

- Exactly one preset must be selected

**Requirements:** 4.1, 4.2, 4.3, 4.4, 4.5, 13.2

---

### ReferenceImageCard

Card component containing a file dropzone for optional reference image upload.

**Location:** `src/components/ReferenceImageCard.tsx`

**Props:**

```typescript
interface ReferenceImageCardProps {
  value: string | null;            // Base64 encoded image
  onChange: (base64: string | null) => void; // Upload/remove handler
  isLoading: boolean;              // Disabled during loading
  error?: string;                  // Validation error message
}
```

**Features:**

- Drag-and-drop support
- Click to browse files
- Image preview with thumbnail
- Remove button for uploaded images
- File type validation (PNG, JPEG, JPG)
- Base64 encoding
- ARIA labels and file input descriptions

**States:**

1. **Empty:** Dropzone prompt with upload icon
2. **Preview:** Thumbnail + filename + remove button
3. **Disabled:** Grayed out during loading

**Validation:**

- Only PNG, JPEG, JPG files accepted
- File size limits (handled by browser)

**Requirements:** 5.1, 5.2, 5.3, 5.4, 5.5, 13.2

---

### GenerateButton

Primary action button for form submission.

**Location:** `src/components/GenerateButton.tsx`

**Props:**

```typescript
interface GenerateButtonProps {
  isFormValid: boolean;            // Whether form passes validation
  isLoading: boolean;              // Generation in progress
  onGenerate: () => void;          // Click handler
}
```

**Features:**

- Disabled when form is invalid
- Loading state with spinner
- Full width on mobile, auto width on desktop
- ARIA labels for button states
- Visual feedback on hover/focus

**States:**

1. **Disabled:** Form is invalid (grayed out)
2. **Enabled:** Form is valid (primary color)
3. **Loading:** Generation in progress (spinner + "Generating...")

**Requirements:** 6.1, 6.2, 6.5, 13.2

---

## UI Components

The application uses shadcn/ui components for consistent, accessible UI elements:

### Button

**Location:** `src/components/ui/button.tsx`

Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`

Sizes: `default`, `sm`, `lg`, `icon`

### Card

**Location:** `src/components/ui/card.tsx`

Sub-components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

### Textarea

**Location:** `src/components/ui/textarea.tsx`

Features: Auto-resize, character limit, disabled state

### RadioGroup

**Location:** `src/components/ui/radio-group.tsx`

Sub-components: `RadioGroup`, `RadioGroupItem`

Features: Keyboard navigation, ARIA support

### Alert

**Location:** `src/components/ui/alert.tsx`

Variants: `default`, `destructive`

Sub-components: `Alert`, `AlertTitle`, `AlertDescription`

### Label

**Location:** `src/components/ui/label.tsx`

Features: Associated with form inputs, ARIA support

---

## TypeScript Interfaces

### GenerateImageRequest

API request payload for image generation.

```typescript
interface GenerateImageRequest {
  user_prompt: string;              // Product description
  preset_name: string;              // Preset filename (e.g., "preset_bright_clean.json")
  reference_image_base64?: string;  // Optional base64 encoded image
}
```

**Location:** `src/lib/types.ts`

**Requirements:** 14.2

---

### GenerateImageResponse

API response from image generation endpoint.

```typescript
interface GenerateImageResponse {
  success: boolean;                 // Whether generation succeeded
  final_image_url?: string;         // URL of generated image (on success)
  error?: string;                   // Error message (on failure)
}
```

**Location:** `src/lib/types.ts`

**Requirements:** 14.3

---

### StylePreset

Style preset definition.

```typescript
interface StylePreset {
  value: string;                    // Preset filename
  label: string;                    // Display name
  description?: string;             // Optional description
}
```

**Location:** `src/lib/types.ts`

**Requirements:** 4.3

---

### FormState

User input values for the generation form.

```typescript
interface FormState {
  userPrompt: string;               // Product description
  selectedPreset: string | null;    // Selected preset filename
  referenceImage: string | null;    // Base64 encoded image
}
```

**Location:** `src/lib/types.ts`

---

### ValidationErrors

Validation error messages for form fields.

```typescript
interface ValidationErrors {
  userPrompt?: string;              // Description validation error
  selectedPreset?: string;          // Preset validation error
  referenceImage?: string;          // Image validation error
}
```

**Location:** `src/lib/types.ts`

**Requirements:** 3.4, 4.4, 5.2

---

### AppState

Complete application state.

```typescript
interface AppState extends FormState {
  isLoading: boolean;               // Generation in progress
  generatedImageUrl: string | null; // URL of generated image
  error: string | null;             // Error message
}
```

**Location:** `src/lib/types.ts`

**Requirements:** 2.4, 6.3, 7.1

---

### EditHistoryItem

Individual edit operation in the history.

```typescript
interface EditHistoryItem {
  imageUrl: string;              // URL of the image after this edit
  operation: EditOperation;      // Type of edit operation
  timestamp: number;             // Unix timestamp of the edit
  metadata?: {                   // Optional metadata
    operationParams?: any;       // Parameters used for the operation
    fileSize?: number;           // File size in bytes
    dimensions?: {               // Image dimensions
      width: number;
      height: number;
    };
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

**Location:** `src/lib/types.ts`

**Requirements:** 3.5, 8.1, 8.2

---

### ZoomLevel

Zoom level configuration for image display.

```typescript
type ZoomLevel = 0.25 | 0.5 | 0.75 | 1 | 1.5 | 2 | 3 | 4;

interface ZoomState {
  level: ZoomLevel;              // Current zoom level
  position: {                    // Pan position
    x: number;
    y: number;
  };
}
```

**Location:** `src/lib/types.ts`

**Requirements:** 3.2, 3.3

---

## API Client

### generateImage()

Sends a generation request to the backend API.

**Location:** `src/lib/api.ts`

**Signature:**

```typescript
async function generateImage(
  payload: GenerateImageRequest
): Promise<GenerateImageResponse>
```

**Parameters:**

- `payload`: Request payload with user_prompt, preset_name, and optional reference_image_base64

**Returns:**

- Promise resolving to GenerateImageResponse

**Error Handling:**

- Network errors: Throws TypeError
- HTTP errors: Returns response with success: false and error message
- Timeout: Handled by fetch timeout

**Requirements:** 14.1, 14.2, 14.3, 14.4

---

## Utility Functions

### cn()

Merges Tailwind CSS class names with clsx and tailwind-merge.

**Location:** `src/lib/utils.ts`

**Signature:**

```typescript
function cn(...inputs: ClassValue[]): string
```

**Usage:**

```typescript
<div className={cn("base-class", condition && "conditional-class")} />
```

---

### getAnimationDuration()

Returns animation duration respecting user's motion preferences.

**Location:** `src/lib/utils.ts`

**Signature:**

```typescript
function getAnimationDuration(duration: number): number
```

**Parameters:**

- `duration`: Desired animation duration in seconds

**Returns:**

- 0 if user prefers reduced motion, otherwise the provided duration

**Requirements:** 10.5

---

## Custom Hooks

### useEditHistory()

Manages edit history with undo/redo functionality and session storage persistence.

**Location:** `src/hooks/useEditHistory.ts`

**Signature:**

```typescript
function useEditHistory(initialImageUrl: string): {
  currentImageUrl: string;
  canUndo: boolean;
  canRedo: boolean;
  history: EditHistoryItem[];
  historyIndex: number;
  addEdit: (imageUrl: string, operation: string) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}
```

**Parameters:**

- `initialImageUrl`: The original image URL to start with

**Returns:**

- `currentImageUrl`: The current image URL at the history index
- `canUndo`: Whether undo operation is available
- `canRedo`: Whether redo operation is available
- `history`: Array of all edit history items
- `historyIndex`: Current position in history
- `addEdit`: Function to add a new edit to history
- `undo`: Function to move back in history
- `redo`: Function to move forward in history
- `reset`: Function to reset to original image

**Features:**

- Maximum 20 history items (configurable)
- Automatic session storage persistence
- Clears future history when new edit is added
- Prevents duplicate consecutive operations

**Usage Example:**

```typescript
const {
  currentImageUrl,
  canUndo,
  canRedo,
  addEdit,
  undo,
  redo,
  reset
} = useEditHistory(originalImageUrl);

// Add an edit
addEdit(newImageUrl, 'remove_background');

// Undo/redo
if (canUndo) undo();
if (canRedo) redo();
```

**Requirements:** 3.5, 8.1, 8.2

---

### useFormValidation()

Validates form inputs and returns validation errors.

**Location:** `src/hooks/useFormValidation.ts`

**Signature:**

```typescript
function useFormValidation(
  userPrompt: string,
  selectedPreset: string | null,
  referenceImage: string | null
): ValidationErrors
```

**Returns:**

- Object with validation error messages for each field

**Validation Rules:**

- userPrompt: Minimum 3 characters
- selectedPreset: Must be selected
- referenceImage: Valid file type (handled by upload component)

---

### useKeyboardShortcuts()

Manages keyboard shortcuts for the edit page.

**Location:** `src/hooks/useKeyboardShortcuts.ts`

**Signature:**

```typescript
function useKeyboardShortcuts(handlers: {
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomFit?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onEscape?: () => void;
  onSave?: () => void;
}): void
```

**Parameters:**

- `handlers`: Object with optional handler functions for each shortcut

**Supported Shortcuts:**

- `Ctrl+Z`: Undo
- `Ctrl+Y` / `Ctrl+Shift+Z`: Redo
- `Ctrl+0`: Zoom to fit
- `Ctrl++` / `Ctrl+=`: Zoom in
- `Ctrl+-`: Zoom out
- `Escape`: Close dialogs/Cancel
- `Ctrl+S`: Save/Download

**Features:**

- Prevents default browser behavior
- Works across Windows/Mac (Cmd on Mac)
- Disabled when typing in input fields
- ARIA announcements for screen readers

**Requirements:** 8.1, 8.2, 8.3, 8.4

---

## Animation Specifications

### Framer Motion Variants

**Fade In:**

```typescript
{
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: "easeOut" }
}
```

**Scale In:**

```typescript
{
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.4, ease: "easeOut" }
}
```

**Slide Up:**

```typescript
{
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3, ease: "easeOut" }
}
```

**Requirements:** 10.1, 10.3, 10.4, 10.5

---

## Accessibility Features

### Keyboard Navigation

**Tab Order:**

1. Product description textarea
2. Style preset radio buttons (arrow keys to navigate within group)
3. Reference image dropzone
4. Generate button
5. Download button (when visible)

### ARIA Labels

All interactive elements have descriptive ARIA labels:

- Form inputs: `aria-label`, `aria-describedby`, `aria-required`
- Buttons: `aria-label` for clear action description
- Images: `alt` text for meaningful description
- Live regions: `aria-live`, `aria-atomic` for dynamic content

### Screen Reader Support

- Character counter: `aria-live="polite"`
- Validation errors: `aria-live="assertive"`
- Loading status: `aria-live="polite"`
- Success/error messages: `aria-live="assertive"`

### Focus Management

- Focus textarea on page load
- Focus download button when image loads
- Visible focus indicators on all interactive elements
- Focus trap in modal dialogs (if any)

**Requirements:** 13.1, 13.2, 13.3, 13.4, 13.5

---

## Responsive Design

### Breakpoints

- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1023px (sm to lg)
- **Desktop:** ≥ 1024px (lg)

### Layout Changes

- **Desktop (≥1024px):** Two-column grid layout
- **Mobile (<1024px):** Single-column stack layout

### Responsive Utilities

- Spacing: `space-y-4 sm:space-y-6`
- Typography: `text-sm sm:text-base`
- Sizing: `min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]`
- Padding: `p-4 sm:p-6`

**Requirements:** 12.1, 12.2, 12.3, 12.4, 12.5

---

## Performance Optimizations

### Code Splitting

ResultsPanel is lazy-loaded for optimal bundle size:

```typescript
const ResultsPanel = lazy(() => import('./components/ResultsPanel'));
```

### Image Optimization

- `loading="lazy"` attribute on generated images
- Base64 encoding for reference images (no additional requests)

### Bundle Optimization

- Tree-shaking of unused shadcn/ui components
- Vite's automatic code splitting
- Production builds with minification

**Requirements:** 15.1, 15.2, 15.3, 15.5
