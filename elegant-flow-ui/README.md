# Elegant Flow UI

A modern, elegant product image generation interface built with React, TypeScript, Tailwind CSS, shadcn/ui, and Framer Motion.

## Features

- 🎨 Beautiful, minimalist design with smooth animations
- 📱 Fully responsive (desktop, tablet, mobile)
- ♿ WCAG 2.1 AA accessible
- 🚀 Optimized performance with code splitting
- 🎭 10 professional style presets
- 🖼️ Optional reference image support
- ⚡ Built with Vite for fast development

## Documentation

- **[Component API Documentation](./COMPONENTS.md)** - Detailed API docs for all components
- **[Deployment Guide](./DEPLOYMENT.md)** - Step-by-step deployment instructions
- **[Accessibility Documentation](./ACCESSIBILITY.md)** - Accessibility features and compliance
- **[Performance Documentation](./PERFORMANCE.md)** - Performance optimizations and metrics

## Technology Stack

- **React 18+** with TypeScript 5+
- **Tailwind CSS 3+** for styling
- **shadcn/ui** for accessible UI components
- **Framer Motion** for smooth animations
- **Vite 5+** for build tooling

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or pnpm
- Backend API server running (see root project README)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables (see [Environment Configuration](#environment-configuration) below)

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be output to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Environment Configuration

The application uses environment variables for configuration. These are managed through `.env` files and are type-safe with TypeScript.

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Base URL for the image generation API server | `http://localhost:5000` | Yes |

### Setup Instructions

1. **Copy the example environment file:**

```bash
cp .env.example .env
```

2. **Edit `.env` and configure the API base URL:**

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
```

3. **For production deployment**, set the appropriate API URL:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

### TypeScript Support

Environment variables are fully typed in `src/vite-env.d.ts`. This provides:

- Autocomplete in your IDE
- Type checking at compile time
- Documentation for each variable

### Usage in Code

Access environment variables using `import.meta.env`:

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

**Important Notes:**

- Only variables prefixed with `VITE_` are exposed to the client-side code
- Environment variables are embedded at build time (not runtime)
- Never commit `.env` files with sensitive data to version control
- Use `.env.example` to document required variables

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```text
elegant-flow-ui/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components (Button, Card, etc.)
│   │   ├── SetupPanel.tsx         # Left panel with input controls
│   │   ├── ResultsPanel.tsx       # Right panel with results
│   │   ├── ProductDescriptionCard.tsx  # Product description input
│   │   ├── StylePresetCard.tsx    # Style preset selector
│   │   ├── ReferenceImageCard.tsx # Image upload component
│   │   └── GenerateButton.tsx     # Generate action button
│   ├── lib/              # Utilities and API client
│   │   ├── api.ts        # API integration functions
│   │   ├── types.ts      # TypeScript interfaces
│   │   └── utils.ts      # Helper functions
│   ├── constants/        # Constants and presets
│   │   └── presets.ts    # Style preset definitions
│   ├── hooks/            # Custom React hooks
│   │   └── useFormValidation.ts  # Form validation hook
│   ├── test/             # Test files
│   │   ├── setup.ts      # Test configuration
│   │   ├── integration.test.tsx  # Integration tests
│   │   ├── accessibility.test.tsx # Accessibility tests
│   │   └── responsive.test.tsx   # Responsive design tests
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Entry point
│   ├── vite-env.d.ts     # Environment type definitions
│   └── index.css         # Global styles + Tailwind
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment template
├── components.json       # shadcn/ui configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── COMPONENTS.md         # Component API documentation
├── DEPLOYMENT.md         # Deployment guide
├── ACCESSIBILITY.md      # Accessibility documentation
└── PERFORMANCE.md        # Performance documentation
```

## Architecture

### Component Hierarchy

```text
App
├── SetupPanel
│   ├── ProductDescriptionCard
│   │   └── Textarea (shadcn/ui)
│   ├── StylePresetCard
│   │   └── RadioGroup (shadcn/ui)
│   ├── ReferenceImageCard
│   │   └── File dropzone
│   └── GenerateButton
│       └── Button (shadcn/ui)
└── ResultsPanel
    ├── Idle state (Card)
    ├── Loading state (Loader + Card)
    ├── Success state (Image + Download Button)
    └── Error state (Alert)
```

### State Management

The application uses React's built-in state management with the `useState` hook. State is managed at the `App` component level and passed down to child components via props.

**Main State:**

```typescript
const [userPrompt, setUserPrompt] = useState<string>("");
const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
const [referenceImage, setReferenceImage] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState<boolean>(false);
const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
```

### API Integration

The application communicates with the backend API through the `generateImage()` function in `src/lib/api.ts`.

**Request:**

```typescript
const response = await generateImage({
  user_prompt: "a smartphone on a white background",
  preset_name: "preset_bright_clean.json",
  reference_image_base64: "data:image/png;base64,..." // optional
});
```

**Response:**

```typescript
{
  success: true,
  final_image_url: "https://bria-api.com/images/abc123.jpg"
}
```

See [COMPONENTS.md](./COMPONENTS.md) for detailed API documentation.

## Usage Examples

### Basic Usage

1. Enter a product description (e.g., "a smartphone on a white background")
2. Select a style preset (e.g., "Bright Clean")
3. Optionally upload a reference image
4. Click "Generate Image"
5. Wait for generation (30-60 seconds)
6. Download the generated image

### With Reference Image

1. Upload a product image using drag-and-drop or file browser
2. Enter a description that complements the reference image
3. Select a style preset
4. Generate and download

### Style Presets

The application includes 10 professional style presets:

- **Bright Clean** - Clean white background, studio lighting
- **Luxury Reflection** - Luxury with reflective surfaces
- **Minimalist Shadow** - Minimalist with shadow play
- **Natural Warm** - Natural, warm lighting
- **Vibrant Pop** - Vibrant, colorful backgrounds
- **Detail Macro** - Close-up detail shots
- **Editorial Dark** - Dark, editorial style
- **Flat Lay** - Overhead flat lay composition
- **Hero Shot** - Dramatic hero product shots
- **Lifestyle Context** - Product in lifestyle context

## Testing

The application includes comprehensive tests for integration, accessibility, and responsive design.

### Run Tests

```bash
npm run test
```

### Test Coverage

- **Integration Tests** - Complete user workflows
- **Accessibility Tests** - WCAG 2.1 AA compliance
- **Responsive Tests** - Layout at different breakpoints

See test files in `src/test/` for details.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Contributing

### Development Workflow

1. **Create a feature branch:**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes and test:**

```bash
npm run dev        # Test in development
npm run type-check # Check TypeScript
npm run lint       # Check code quality
npm run test       # Run tests
```

3. **Build and preview:**

```bash
npm run build
npm run preview
```

4. **Commit and push:**

```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

### Code Style

- Use TypeScript for all new code
- Follow existing component patterns
- Add JSDoc comments for complex functions
- Use Tailwind CSS for styling (no custom CSS)
- Ensure accessibility (ARIA labels, keyboard navigation)
- Write tests for new features

### Adding New Components

1. Create component in `src/components/`
2. Use shadcn/ui components when possible
3. Add TypeScript interfaces for props
4. Include ARIA labels and semantic HTML
5. Make responsive with Tailwind breakpoints
6. Add Framer Motion animations if needed
7. Document in COMPONENTS.md

### Adding New Style Presets

1. Add preset definition to `src/constants/presets.ts`
2. Ensure backend has corresponding preset JSON file
3. Test with various product descriptions
4. Update documentation

## Browser Support

- **Chrome/Edge:** Last 2 versions
- **Firefox:** Last 2 versions
- **Safari:** Last 2 versions
- **Mobile:** iOS Safari 14+, Chrome Android 90+

## Performance

- **First Contentful Paint:** < 1.5 seconds
- **Time to Interactive:** < 3 seconds
- **Lighthouse Score:** > 90
- **Bundle Size:** < 200 KB (gzipped)

See [PERFORMANCE.md](./PERFORMANCE.md) for detailed metrics and optimizations.

## Accessibility

- **WCAG 2.1 Level AA** compliant
- Full keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Reduced motion support

See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for detailed accessibility features.

## Troubleshooting

### Common Issues

**Issue:** API requests fail

**Solution:** Check that `VITE_API_BASE_URL` is set correctly and the backend server is running.

---

**Issue:** Build fails with TypeScript errors

**Solution:** Run `npm run type-check` to see detailed errors. Fix type issues before building.

---

**Issue:** Styles not applying

**Solution:** Ensure Tailwind CSS is configured correctly and `index.css` imports Tailwind directives.

---

**Issue:** Environment variables not working

**Solution:** Ensure variables are prefixed with `VITE_` and restart the dev server after changes.

## License

See the main project LICENSE file for details.

## Support

For issues, questions, or contributions:

- Check existing documentation in this directory
- Review the main project README
- Check backend API documentation
- Verify environment configuration
