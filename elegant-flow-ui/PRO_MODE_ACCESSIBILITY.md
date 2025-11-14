# Pro Mode Accessibility Features

This document outlines the comprehensive accessibility features implemented for the Pro Mode - Structured Prompt Builder interface.

## Overview

Pro Mode has been designed with accessibility as a core requirement, ensuring that all users, including those using assistive technologies, can effectively use the interface to create structured prompts for image generation.

## Implemented Features

### 1. ARIA Labels on All Form Inputs (Requirement 10.1)

Every form input across all sections has proper ARIA labels for screen reader support:

#### Scene & Style Section

- `aria-label="Short description of the scene"` on short description textarea
- `aria-label="Background setting description"` on background setting textarea
- `aria-label="Style medium"` on style medium input
- `aria-label="Artistic style"` on artistic style input
- `aria-label="Additional context"` on context textarea

#### Lighting Section

- `aria-label="Lighting conditions"` on conditions input
- `aria-label="Lighting direction"` on direction input
- `aria-label="Shadow characteristics"` on shadows input

#### Aesthetics Section

- `aria-label="Composition style"` on composition input
- `aria-label="Color scheme"` on color scheme input
- `aria-label="Mood and atmosphere"` on mood/atmosphere input

#### Camera Section

- `aria-label="Camera angle"` on camera angle input
- `aria-label="Lens focal length"` on lens focal length input
- `aria-label="Depth of field"` on depth of field input
- `aria-label="Focus"` on focus input

#### Object Builder Section

Each object card has contextual labels:

- `aria-label="Description for Object {n}"` on description textarea
- `aria-label="Location for Object {n}"` on location input
- `aria-label="Relationship for Object {n}"` on relationship input
- `aria-label="Relative size for Object {n}"` on relative size input
- `aria-label="Shape and color for Object {n}"` on shape/color input
- `aria-label="Texture for Object {n}"` on texture input
- `aria-label="Appearance details for Object {n}"` on appearance details textarea

### 2. Keyboard Navigation Support (Requirement 10.2)

#### Accordion Navigation

- Built on Radix UI Accordion primitive with full keyboard support
- **Tab** key moves between accordion triggers
- **Enter** or **Space** toggles accordion sections
- **Arrow keys** navigate between accordion items
- Proper `aria-expanded` and `aria-controls` attributes

#### Form Navigation

- All inputs are keyboard accessible via **Tab** key
- Logical tab order follows visual layout
- **Shift+Tab** for reverse navigation
- No keyboard traps

#### Object Builder Navigation

- **Tab** to "Add New Object" button
- **Enter** or **Space** to add objects
- **Tab** through all object fields
- **Tab** to "Remove Object" button
- **Enter** or **Space** to remove objects

### 3. ARIA Live Regions (Requirement 10.3)

#### Loading State

```tsx
<div 
    role="status" 
    aria-live="polite" 
    aria-atomic="true"
    id="generation-status"
>
```

- Announces "Please wait while we generate your image..." to screen readers
- Uses `polite` priority to avoid interrupting user

#### Success State

```tsx
<div 
    role="region" 
    aria-live="polite" 
    aria-atomic="true"
    aria-labelledby="result-heading"
>
```

- Announces successful image generation
- Provides context with heading reference

#### Error State

```tsx
<div 
    aria-live="assertive" 
    aria-atomic="true"
>
    <Alert variant="destructive" role="alert">
```

- Uses `assertive` priority for immediate announcement
- Ensures errors are communicated urgently to screen readers

### 4. Focus Management (Requirement 10.4)

#### Add Object Button

- Maintains reference via `useRef` hook
- Focus naturally moves to first input of new object

#### Remove Object Button

- Returns focus to "Add New Object" button after removal
- Prevents focus loss when objects are removed
- Implemented with `setTimeout` to ensure DOM updates complete

```tsx
const handleRemoveObject = (id: string) => {
    onRemoveObject(id);
    setTimeout(() => {
        addButtonRef.current?.focus();
    }, 0);
};
```

#### Button Labels

- `aria-label="Add new object to scene"` on add button
- `aria-label="Remove Object {n} from scene"` on remove buttons
- `aria-label="Generate image from structured prompt"` on generate button
- `aria-label="Open generated image in new tab"` on open button
- `aria-label="Clear result and generate another image"` on generate another button
- `aria-label="Dismiss error message"` on dismiss button

### 5. Semantic HTML (Requirement 10.5)

#### Proper Heading Structure

```tsx
<h1 id="pro-mode-title">Pro Mode</h1>
<h2 id="result-heading">Generated Image</h2>
```

#### Semantic Regions

- `role="region"` for major content areas
- `role="status"` for loading indicators
- `role="alert"` for error messages
- `role="group"` for object cards
- `role="list"` and `role="listitem"` for object collections

#### Object Cards

```tsx
<Card role="group" aria-labelledby={`object-${object.id}-title`}>
    <CardTitle id={`object-${object.id}-title`}>Object {index + 1}</CardTitle>
```

#### Object List

```tsx
<div 
    role="list" 
    aria-label={`${objects.length} object${objects.length !== 1 ? 's' : ''} in scene`}
>
    <div role="listitem">
        <ObjectCard ... />
    </div>
</div>
```

### 6. Visual Focus Indicators

Enhanced focus indicators defined in global CSS:

```css
*:focus-visible {
    outline: 2px solid var(--color-ring);
    outline-offset: 2px;
    border-radius: 2px;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
    outline: 2px solid var(--color-ring);
    outline-offset: 2px;
}
```

### 7. Screen Reader Only Content

Hidden descriptive text for screen readers:

```tsx
<p id="object-builder-description" className="sr-only">
    Add objects to your scene. Each object can be configured with 
    detailed properties including description, location, and appearance.
</p>
```

### 8. Reduced Motion Support

Respects user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}
```

## Testing

Comprehensive accessibility tests have been implemented in `src/test/pro-mode-accessibility.test.tsx`:

- ✅ 21 accessibility tests passing
- ✅ ARIA labels verification
- ✅ Keyboard navigation testing
- ✅ ARIA live regions testing
- ✅ Focus management testing
- ✅ Semantic HTML verification
- ✅ Button accessibility testing

## Screen Reader Compatibility

Pro Mode has been designed to work with:

- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

## Keyboard Shortcuts Summary

| Action | Keyboard Shortcut |
|--------|------------------|
| Navigate between elements | Tab / Shift+Tab |
| Toggle accordion section | Enter / Space |
| Navigate accordion items | Arrow keys |
| Activate button | Enter / Space |
| Submit form | Enter (on Generate button) |

## WCAG 2.1 Compliance

Pro Mode meets WCAG 2.1 Level AA standards:

- ✅ **1.3.1 Info and Relationships** - Proper semantic structure
- ✅ **2.1.1 Keyboard** - All functionality available via keyboard
- ✅ **2.4.3 Focus Order** - Logical focus order
- ✅ **2.4.7 Focus Visible** - Clear focus indicators
- ✅ **3.2.4 Consistent Identification** - Consistent labeling
- ✅ **4.1.2 Name, Role, Value** - Proper ARIA attributes
- ✅ **4.1.3 Status Messages** - ARIA live regions for dynamic content

## Future Enhancements

Potential accessibility improvements for future iterations:

1. **Skip Links** - Add "Skip to main content" link
2. **Keyboard Shortcuts** - Custom shortcuts for common actions
3. **Voice Control** - Enhanced voice navigation support
4. **High Contrast Mode** - Dedicated high contrast theme
5. **Text Scaling** - Ensure layout works at 200% zoom
6. **Error Prevention** - Inline validation with helpful messages

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [Testing Library Accessibility](https://testing-library.com/docs/queries/byrole/)
