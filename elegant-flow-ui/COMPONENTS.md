# Component API Documentation

This document provides detailed API documentation for all components in the Elegant Flow UI.

## Table of Contents

- [Core Components](#core-components)
  - [App](#app)
  - [SetupPanel](#setuppanel)
  - [ResultsPanel](#resultspanel)
- [Input Components](#input-components)
  - [ProductDescriptionCard](#productdescriptioncard)
  - [StylePresetCard](#stylepresetcard)
  - [ReferenceImageCard](#referenceimagecard)
  - [GenerateButton](#generatebutton)
- [UI Components](#ui-components)
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
