# Dark Mode Support

## Overview

The application now includes full dark mode support with a theme toggle that allows users to switch between light, dark, and system preference modes.

## Features

- **Three Theme Options:**
  - Light Mode: Bright, clean interface
  - Dark Mode: Dark background with light text
  - System: Automatically follows the user's operating system preference

- **Persistent Preferences:** Theme selection is saved to localStorage and persists across sessions

- **Smooth Transitions:** Theme changes are applied smoothly with CSS transitions

- **Accessible:** Full keyboard navigation and screen reader support

## Implementation

### Components

#### ThemeToggle Component

Located at `src/components/ThemeToggle.tsx`, this component provides a dropdown menu with theme options.

```tsx
import { ThemeToggle } from './components/ThemeToggle';

// Use in your layout
<ThemeToggle />
```

#### useTheme Hook

Located at `src/hooks/useTheme.ts`, this hook manages theme state and applies the selected theme.

```tsx
import { useTheme } from './hooks/useTheme';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme('dark')}>
      Switch to Dark Mode
    </button>
  );
}
```

### CSS Implementation

The dark mode uses class-based theme switching with Tailwind CSS:

- Light theme: Default styles
- Dark theme: Applied when `.dark` class is on the root element
- System preference: Falls back to `prefers-color-scheme` media query

### Color Variables

All colors are defined using CSS custom properties in `src/index.css`:

```css
/* Light mode (default) */
--color-background: oklch(100% 0 0);
--color-foreground: oklch(9% 0.024 285.82);

/* Dark mode */
.dark {
  --color-background: oklch(9% 0.024 285.82);
  --color-foreground: oklch(98% 0.008 285.82);
}
```

## Usage

### For Users

1. Click the theme toggle button in the header (sun/moon icon)
2. Select your preferred theme:
   - **Light**: Always use light mode
   - **Dark**: Always use dark mode
   - **System**: Follow your device's theme setting

Your preference is automatically saved and will be remembered on your next visit.

### For Developers

#### Adding Dark Mode Styles

Use Tailwind's `dark:` prefix for dark mode specific styles:

```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content
</div>
```

#### Using CSS Variables

Reference the theme variables in your styles:

```css
.my-component {
  background-color: var(--color-background);
  color: var(--color-foreground);
}
```

#### Testing Dark Mode

Run the dark mode tests:

```bash
npm test src/test/dark-mode.test.tsx
```

## Accessibility

- Theme toggle button has proper ARIA labels
- Keyboard navigation fully supported
- Screen reader announcements for theme changes
- High contrast maintained in both themes
- Respects `prefers-reduced-motion` for animations

## Browser Support

Dark mode works in all modern browsers that support:

- CSS custom properties
- `prefers-color-scheme` media query
- localStorage API

## Technical Details

### State Management

Theme state is managed using React hooks and localStorage:

1. On mount, check localStorage for saved preference
2. If no preference, default to 'system'
3. Apply theme class to document root
4. Listen for system preference changes when in system mode
5. Save preference changes to localStorage

### Performance

- Theme changes are instant with no page reload
- CSS variables enable efficient theme switching
- localStorage prevents flash of wrong theme on page load

## Future Enhancements

Potential improvements for future versions:

- Custom theme colors
- High contrast mode
- Multiple dark theme variants
- Theme preview before applying
- Scheduled theme switching (e.g., dark mode at night)
