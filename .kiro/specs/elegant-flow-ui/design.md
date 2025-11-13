# Design Document: Elegant Flow UI

## Overview

The Elegant Flow UI is a complete redesign of the product image generation interface, built from the ground up with modern web technologies to deliver a "Best New User Experience." The design philosophy centers on creating a seamless, single-view application that guides users through an elegant flow from setup to generation to results.

### Core Design Principles

1. **Elegant Flow**: A single, logical path on one screen without distractions
2. **Minimalist Aesthetics**: Clean design with generous whitespace and professional typography
3. **Purposeful Animation**: Smooth, subtle transitions that guide attention without distraction
4. **Accessibility First**: WCAG 2.1 AA compliant with full keyboard and screen reader support
5. **Type Safety**: Comprehensive TypeScript coverage for reliability

## Architecture

### Technology Stack

- **Framework**: React 18+ with TypeScript 5+
- **Styling**: Tailwind CSS 3+ with shadcn/ui components
- **Animation**: Framer Motion 10+
- **Build Tool**: Vite 5+
- **Package Manager**: npm or pnpm

### Project Structure

```
elegant-flow-ui/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── alert.tsx
│   │   │   └── ...
│   │   ├── SetupPanel.tsx   # Left panel with inputs
│   │   ├── ResultsPanel.tsx # Right panel with results
│   │   ├── ProductDescriptionCard.tsx
│   │   ├── StylePresetCard.tsx
│   │   ├── ReferenceImageCard.tsx
│   │   └── GenerateButton.tsx
│   ├── lib/
│   │   ├── api.ts           # API client functions
│   │   ├── types.ts         # TypeScript interfaces
│   │   └── utils.ts         # Utility functions
│   ├── hooks/
│   │   ├── useImageGeneration.ts
│   │   └── useFormValidation.ts
│   ├── constants/
│   │   └── presets.ts       # Style preset definitions
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles + Tailwind
├── components.json          # shadcn/ui configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── package.json
```

## Components and Interfaces

### Main Application Component (App.tsx)

The root component orchestrates the entire application state and layout.

```typescript
interface AppState {
  userPrompt: string;
  selectedPreset: string | null;
  referenceImage: string | null; // base64
  isLoading: boolean;
  generatedImageUrl: string | null;
  error: string | null;
}
```

**Layout Structure:**

- Two-column grid on desktop (≥1024px)
- Single column stack on mobile (<1024px)
- Framer Motion AnimatePresence for state transitions

### SetupPanel Component

Container for all input controls, wrapped in a Card component.

**Props:**

```typescript
interface SetupPanelProps {
  userPrompt: string;
  selectedPreset: string | null;
  referenceImage: string | null;
  isLoading: boolean;
  onPromptChange: (value: string) => void;
  onPresetChange: (value: string) => void;
  onImageUpload: (base64: string | null) => void;
  onGenerate: () => void;
  validationErrors: ValidationErrors;
}
```

**Child Components:**

1. ProductDescriptionCard
2. StylePresetCard
3. ReferenceImageCard
4. GenerateButton

### ProductDescriptionCard Component

shadcn/ui Card containing a Textarea for product description input.

**Features:**

- Character counter (0/500)
- Real-time validation
- Disabled state during loading
- Error message display
- ARIA labels and descriptions

**Implementation:**

```typescript
<Card>
  <CardHeader>
    <CardTitle>Product Description</CardTitle>
  </CardHeader>
  <CardContent>
    <Textarea
      value={userPrompt}
      onChange={handleChange}
      disabled={isLoading}
      maxLength={500}
      placeholder="Describe your product..."
      aria-label="Product description"
      aria-describedby="char-count"
    />
    <div className="text-sm text-muted-foreground" id="char-count">
      {userPrompt.length} / 500
    </div>
    {error && <Alert variant="destructive">{error}</Alert>}
  </CardContent>
</Card>
```

### StylePresetCard Component

shadcn/ui Card containing a RadioGroup for style preset selection.

**Presets:**

1. Bright Clean
2. Luxury Reflection
3. Minimalist Shadow
4. Natural Warm
5. Vibrant Pop
6. Detail Macro
7. Editorial Dark
8. Flat Lay
9. Hero Shot
10. Lifestyle Context

**Implementation:**

```typescript
<Card>
  <CardHeader>
    <CardTitle>Style Preset</CardTitle>
  </CardHeader>
  <CardContent>
    <RadioGroup
      value={selectedPreset}
      onValueChange={onPresetChange}
      disabled={isLoading}
    >
      {PRESETS.map(preset => (
        <div key={preset.value} className="flex items-center space-x-2">
          <RadioGroupItem value={preset.value} id={preset.value} />
          <Label htmlFor={preset.value}>{preset.label}</Label>
        </div>
      ))}
    </RadioGroup>
  </CardContent>
</Card>
```

### ReferenceImageCard Component

shadcn/ui Card containing a file dropzone for optional reference image upload.

**Features:**

- Drag-and-drop support
- Click to browse
- Image preview with thumbnail
- Remove button
- File type validation (PNG, JPEG, JPG)
- Base64 encoding

**States:**

1. Empty (dropzone prompt)
2. Preview (thumbnail + filename + remove button)
3. Disabled (during loading)

### GenerateButton Component

Primary action button using shadcn/ui Button component.

**States:**

1. Disabled (invalid form)
2. Enabled (valid form)
3. Loading (spinner + "Generating...")

**Implementation:**

```typescript
<Button
  onClick={onGenerate}
  disabled={!isFormValid || isLoading}
  className="w-full"
  size="lg"
>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Generating...
    </>
  ) : (
    'Generate Image'
  )}
</Button>
```

### ResultsPanel Component

Container for displaying generation status and results.

**Props:**

```typescript
interface ResultsPanelProps {
  isLoading: boolean;
  generatedImageUrl: string | null;
  error: string | null;
}
```

**States:**

1. **Idle**: Empty state with placeholder message
2. **Loading**: Spinner + "Generating your image..." + time estimate
3. **Success**: Generated image + download button
4. **Error**: AlertDestructive with error message

**Framer Motion Transitions:**

```typescript
<AnimatePresence mode="wait">
  {isLoading && (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LoadingState />
    </motion.div>
  )}
  {generatedImageUrl && (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <SuccessState imageUrl={generatedImageUrl} />
    </motion.div>
  )}
  {error && (
    <motion.div
      key="error"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ErrorState message={error} />
    </motion.div>
  )}
</AnimatePresence>
```

## Data Models

### TypeScript Interfaces

```typescript
// API Request
interface GenerateImageRequest {
  user_prompt: string;
  preset_name: string;
  reference_image_base64?: string;
}

// API Response
interface GenerateImageResponse {
  success: boolean;
  final_image_url?: string;
  error?: string;
}

// Style Preset
interface StylePreset {
  value: string;
  label: string;
  description?: string;
}

// Form State
interface FormState {
  userPrompt: string;
  selectedPreset: string | null;
  referenceImage: string | null;
}

// Validation Errors
interface ValidationErrors {
  userPrompt?: string;
  selectedPreset?: string;
  referenceImage?: string;
}

// Application State
interface AppState extends FormState {
  isLoading: boolean;
  generatedImageUrl: string | null;
  error: string | null;
}
```

## Error Handling

### Validation Errors

**Client-side validation:**

1. Product description: minimum 3 characters, maximum 500 characters
2. Style preset: required selection
3. Reference image: valid file type (PNG, JPEG, JPG)

**Display:**

- Inline errors below inputs using Alert component
- Prevent form submission when invalid
- Clear errors on user input

### API Errors

**Error types:**

1. Network errors (fetch failures)
2. Server errors (500 status codes)
3. Validation errors (400 status codes)
4. Timeout errors (generation takes too long)

**Handling:**

```typescript
try {
  const response = await generateImage(payload);
  if (response.success) {
    setGeneratedImageUrl(response.final_image_url);
  } else {
    setError(response.error || 'Generation failed');
  }
} catch (error) {
  if (error instanceof TypeError) {
    setError('Network error. Please check your connection.');
  } else {
    setError('An unexpected error occurred. Please try again.');
  }
} finally {
  setIsLoading(false);
}
```

## Testing Strategy

### Unit Tests

**Tools:** Vitest + React Testing Library

**Coverage:**

1. Component rendering and props
2. Form validation logic
3. API client functions
4. Custom hooks behavior
5. Utility functions

**Example:**

```typescript
describe('ProductDescriptionCard', () => {
  it('should display character count', () => {
    render(<ProductDescriptionCard value="test" onChange={jest.fn()} />);
    expect(screen.getByText('4 / 500')).toBeInTheDocument();
  });

  it('should show error for short input', () => {
    render(<ProductDescriptionCard value="ab" onChange={jest.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent('minimum 3 characters');
  });
});
```

### Integration Tests

**Coverage:**

1. Complete user flow from input to generation
2. State transitions between idle, loading, success, error
3. Form submission and API integration
4. Error recovery flows

### Accessibility Tests

**Tools:** axe-core + jest-axe

**Coverage:**

1. ARIA labels and roles
2. Keyboard navigation
3. Focus management
4. Color contrast
5. Screen reader announcements

### Visual Regression Tests

**Tools:** Playwright or Chromatic

**Coverage:**

1. Component visual states
2. Responsive layouts
3. Animation frames
4. Theme consistency

## Animation Specifications

### Framer Motion Variants

```typescript
const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.4, ease: 'easeOut' } 
  }
};

const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.3, ease: 'easeOut' } 
  }
};
```

### Animation Guidelines

1. **Duration**: 300-600ms for most transitions
2. **Easing**: Use 'easeOut' for entrances, 'easeIn' for exits
3. **Stagger**: 50-100ms delay between sequential animations
4. **Respect Motion Preferences**: Check `prefers-reduced-motion` media query

## Styling Guidelines

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // shadcn/ui default theme colors
      },
      spacing: {
        // Use default Tailwind spacing scale
      },
      animation: {
        // Custom animations if needed
      }
    }
  }
}
```

### Design Tokens

**Spacing:**

- Container padding: `p-6` (24px) on desktop, `p-4` (16px) on mobile
- Card gap: `gap-6` (24px)
- Element gap: `gap-4` (16px)

**Typography:**

- Headings: `text-2xl font-bold` (24px)
- Body: `text-base` (16px)
- Small: `text-sm` (14px)
- Muted: `text-muted-foreground`

**Borders:**

- Radius: `rounded-lg` (8px) for cards
- Radius: `rounded-md` (6px) for inputs

## Performance Optimization

### Code Splitting

```typescript
// Lazy load heavy components
const ResultsPanel = lazy(() => import('./components/ResultsPanel'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <ResultsPanel />
</Suspense>
```

### Image Optimization

1. Use `loading="lazy"` for generated images
2. Implement progressive image loading
3. Compress uploaded reference images before base64 encoding

### Bundle Optimization

1. Tree-shake unused shadcn/ui components
2. Use Vite's code splitting
3. Minimize third-party dependencies
4. Use production builds for deployment

## Accessibility Implementation

### Keyboard Navigation

**Tab Order:**

1. Product description textarea
2. Style preset radio buttons (arrow keys to navigate)
3. Reference image dropzone
4. Generate button
5. Download button (when visible)

### Screen Reader Support

**ARIA Live Regions:**

- Character counter: `aria-live="polite"`
- Validation errors: `aria-live="assertive"`
- Loading status: `aria-live="polite"`
- Success/error messages: `aria-live="assertive"`

**ARIA Labels:**

- All form inputs have descriptive labels
- Buttons have clear action labels
- Images have meaningful alt text

### Focus Management

1. Focus textarea on page load
2. Focus download button when image loads
3. Trap focus in modal dialogs (if any)
4. Visible focus indicators on all interactive elements

## Deployment Considerations

### Build Process

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

```
VITE_API_BASE_URL=http://localhost:5000
```

### Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile browsers: iOS Safari 14+, Chrome Android 90+

## Migration from Current Implementation

The new Elegant Flow UI will coexist with the current implementation. Users can choose which version to use. Key differences:

| Aspect | Current UI | Elegant Flow UI |
|--------|-----------|-----------------|
| Language | JavaScript | TypeScript |
| Styling | Custom CSS | Tailwind + shadcn/ui |
| Components | Custom | shadcn/ui library |
| Animations | CSS transitions | Framer Motion |
| Layout | Basic responsive | Advanced responsive |
| Type Safety | None | Full TypeScript |

The API integration remains the same, ensuring backend compatibility.
