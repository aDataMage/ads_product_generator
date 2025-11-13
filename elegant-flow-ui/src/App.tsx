/**
 * Main App Component
 * 
 * Root component orchestrating the entire application state and layout
 * Requirements: 2.1, 2.2, 2.4, 6.3, 6.4, 6.5, 7.1
 * 
 * Accessibility Features (Requirement 13):
 * - 13.1: Semantic HTML - Uses <header>, <main>, <section>, <form> elements
 * - 13.2: ARIA labels on all interactive elements
 * - 13.3: Full keyboard navigation with skip-to-main link
 * - 13.4: ARIA live regions for dynamic content announcements
 * - 13.5: Focus indicators on all interactive elements (via CSS)
 * - Respects prefers-reduced-motion for animations
 * - WCAG 2.1 AA color contrast compliance via shadcn/ui theme
 */

import { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { SetupPanel } from './components/SetupPanel';
import type { ValidationErrors } from './components/SetupPanel';
import { generateImage, ApiError } from './lib/api';
import type { AppState } from './lib/types';
import { getAnimationDuration } from './lib/utils';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from './components/ui/card';

// Requirement 15.2: Lazy-load ResultsPanel for optimal bundle sizes
// Requirement 15.3: Use code splitting for optimal bundle sizes
const ResultsPanel = lazy(() => import('./components/ResultsPanel'));

/**
 * ResultsPanelFallback component
 * 
 * Loading fallback for lazy-loaded ResultsPanel
 * Requirement 15.2: Add Suspense boundaries with loading fallbacks
 */
function ResultsPanelFallback() {
  return (
    <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center space-y-4 px-4">
          <Loader2
            className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary"
            aria-hidden="true"
          />
          <p className="text-base sm:text-lg font-medium text-muted-foreground">
            Loading...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * App component
 * 
 * Requirement 2.1: Display all functionality within a single view
 * Requirement 2.2: Use a two-column layout with Setup Panel and Results Panel
 * Requirement 2.4: Maintain state without page reloads during the generation workflow
 */
function App() {
  // Requirement 2.4: State management without page reloads
  const [state, setState] = useState<AppState>({
    userPrompt: '',
    selectedPreset: null,
    referenceImage: null,
    isLoading: false,
    generatedImageUrl: null,
    error: null,
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Event handler: Product description change
  const handlePromptChange = (value: string) => {
    setState(prev => ({ ...prev, userPrompt: value }));
    // Clear validation error when user types
    if (validationErrors.userPrompt) {
      setValidationErrors(prev => ({ ...prev, userPrompt: undefined }));
    }
  };

  // Event handler: Style preset selection
  const handlePresetChange = (value: string) => {
    setState(prev => ({ ...prev, selectedPreset: value }));
    // Clear validation error when user selects
    if (validationErrors.selectedPreset) {
      setValidationErrors(prev => ({ ...prev, selectedPreset: undefined }));
    }
  };

  // Event handler: Reference image upload/removal
  const handleImageUpload = (base64: string | null) => {
    setState(prev => ({ ...prev, referenceImage: base64 }));
    // Clear validation error when user uploads
    if (validationErrors.referenceImage) {
      setValidationErrors(prev => ({ ...prev, referenceImage: undefined }));
    }
  };

  // Requirement 6.3: Form validation logic
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    // Validate product description (minimum 3 characters)
    if (state.userPrompt.length < 3) {
      errors.userPrompt = 'Product description must be at least 3 characters';
      isValid = false;
    }

    // Validate style preset selection (required)
    if (!state.selectedPreset) {
      errors.selectedPreset = 'Please select a style preset';
      isValid = false;
    }

    // Requirement 6.4: Display error messages
    setValidationErrors(errors);
    return isValid;
  };

  // Requirement 6.5: API call orchestration
  // Requirement 7.1: Handle loading, success, and error states
  const handleGenerate = async () => {
    // Requirement 6.3: Validate all inputs before submission
    if (!validateForm()) {
      return;
    }

    // Clear previous results and errors
    setState(prev => ({
      ...prev,
      isLoading: true,
      generatedImageUrl: null,
      error: null,
    }));

    try {
      // Requirement 14.2: Include user_prompt, preset_name, and optional reference_image_base64
      const response = await generateImage({
        user_prompt: state.userPrompt,
        preset_name: state.selectedPreset!,
        reference_image_base64: state.referenceImage || undefined,
      });

      // Requirement 14.3: Handle API responses with success and final_image_url
      if (response.success && response.final_image_url) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          generatedImageUrl: response.final_image_url!,
          error: null,
        }));
      } else {
        // API returned success: false
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Image generation failed. Please try again.',
        }));
      }
    } catch (error) {
      // Requirement 14.4: Handle network failures with user-friendly messages
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error instanceof TypeError) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  return (
    // Requirement 2.1: Single view with all functionality
    // Requirement 13.1: Use semantic HTML elements for all content
    <>
      {/* Requirement 13.3: Implement keyboard navigation support - skip link */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <div className="min-h-screen bg-background text-foreground">
        {/* Main container with padding */}
        {/* Requirement 12.4: Use Tailwind CSS responsive utilities for all breakpoints */}
        {/* Requirement 12.5: Adjust font sizes and spacing appropriately for each breakpoint */}
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10 max-w-7xl">
          {/* Header with Framer Motion animation for initial load */}
          {/* Requirement 13.1: Semantic HTML - using <header> element */}
          {/* Requirement 10.5: Respect prefers-reduced-motion */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: getAnimationDuration(0.4), ease: 'easeOut' }}
            className="mb-6 sm:mb-8 lg:mb-10 text-center"
          >
            {/* Requirement 12.5: Adjust font sizes for each breakpoint */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Elegant Flow UI</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Generate professional product images with AI
            </p>
          </motion.header>

          {/* Requirement 2.2: Two-column layout for desktop, single-column for mobile */}
          {/* Requirement 2.3: Stack panels vertically when viewport width < 768px */}
          {/* Requirement 12.1: Display two-column layout when viewport width ≥ 1024px */}
          {/* Requirement 12.2: Display single-column layout when viewport width < 1024px */}
          {/* Requirement 12.3: Maintain usability on screens as small as 375px wide */}
          {/* Requirement 13.1: Semantic HTML - using <main> element */}
          {/* Requirement 10.5: Respect prefers-reduced-motion */}
          <motion.main
            id="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: getAnimationDuration(0.5), delay: getAnimationDuration(0.2), ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8"
          >
            {/* Left Panel: Setup Panel */}
            {/* Requirement 13.2: ARIA labels for all interactive elements */}
            <section className="w-full" aria-labelledby="setup-heading">
              <h2 id="setup-heading" className="sr-only">Image Generation Setup</h2>
              <SetupPanel
                userPrompt={state.userPrompt}
                selectedPreset={state.selectedPreset}
                referenceImage={state.referenceImage}
                isLoading={state.isLoading}
                validationErrors={validationErrors}
                onPromptChange={handlePromptChange}
                onPresetChange={handlePresetChange}
                onImageUpload={handleImageUpload}
                onGenerate={handleGenerate}
              />
            </section>

            {/* Right Panel: Results Panel */}
            {/* Requirement 13.2: ARIA labels for all interactive elements */}
            {/* Requirement 15.2: Add Suspense boundaries with loading fallbacks */}
            <section className="w-full" aria-labelledby="results-heading">
              <h2 id="results-heading" className="sr-only">Generation Results</h2>
              <Suspense fallback={<ResultsPanelFallback />}>
                <ResultsPanel
                  isLoading={state.isLoading}
                  generatedImageUrl={state.generatedImageUrl}
                  error={state.error}
                />
              </Suspense>
            </section>
          </motion.main>
        </div>
      </div>
    </>
  );
}

export default App;
