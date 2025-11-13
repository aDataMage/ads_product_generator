/**
 * ResultsPanel Component
 * 
 * Container for displaying generation status and results
 * Requirements: 2.2, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 10.2, 13.4
 */

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, AlertCircle } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useEffect, useRef } from "react";
import { getAnimationDuration } from "@/lib/utils";

interface ResultsPanelProps {
    /** Whether image generation is in progress */
    isLoading: boolean;
    /** URL of the generated image */
    generatedImageUrl: string | null;
    /** Error message if generation failed */
    error: string | null;
}

/**
 * ResultsPanel component
 * 
 * Requirement 2.2: Two-column layout with Setup Panel and Results Panel
 * Requirement 15.2: Lazy-loaded component for performance optimization
 * 
 * States:
 * 1. Idle: Empty state with placeholder message
 * 2. Loading: Spinner + "Generating your image..." + time estimate
 * 3. Success: Generated image + download button
 * 4. Error: AlertDestructive with error message
 */
function ResultsPanel({
    isLoading,
    generatedImageUrl,
    error,
}: ResultsPanelProps) {
    return (
        // Requirement 12.3: Maintain usability on screens as small as 375px wide
        // Requirement 12.5: Adjust spacing appropriately for each breakpoint
        <div
            className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]"
            role="region"
            aria-label="Results panel"
            aria-live={isLoading ? "polite" : undefined}
            aria-busy={isLoading ? "true" : undefined}
        >
            {/* Requirement 10.1: Wrap ResultsPanel states in Framer Motion AnimatePresence */}
            {/* Requirement 10.3: Configure fade transitions between states */}
            <AnimatePresence mode="wait">
                {/* Idle state - no generation in progress, no results, no errors */}
                {/* Requirement 2.2: Display placeholder when no generation has occurred */}
                {!isLoading && !generatedImageUrl && !error && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: getAnimationDuration(0.3), ease: "easeOut" }}
                        className="w-full"
                    >
                        <Card className="w-full">
                            {/* Requirement 12.5: Adjust spacing and typography for each breakpoint */}
                            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
                                <div className="space-y-2">
                                    <p className="text-base sm:text-lg font-medium text-muted-foreground">
                                        Your generated image will appear here
                                    </p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Fill in the details and click Generate to start
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Loading state - generation in progress */}
                {/* Requirements 7.2, 7.3, 7.4, 7.5, 10.2, 13.4 */}
                {/* Requirement 10.4: Set appropriate animation durations (300-600ms) */}
                {isLoading && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: getAnimationDuration(0.3), ease: "easeOut" }}
                        className="w-full"
                    >
                        <Card className="w-full">
                            {/* Requirement 12.5: Adjust spacing and typography for each breakpoint */}
                            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center space-y-4 sm:space-y-6 px-4">
                                {/* Requirement 7.2: Display Loader component */}
                                <Loader2
                                    className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary"
                                    aria-hidden="true"
                                />

                                {/* Requirement 7.3: Display "Generating your image..." text */}
                                <div className="space-y-2">
                                    <p className="text-base sm:text-lg font-medium">
                                        Generating your image...
                                    </p>

                                    {/* Requirement 7.4: Display estimated wait time message */}
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        This usually takes 30-60 seconds
                                    </p>
                                </div>

                                {/* Requirement 13.4: ARIA live region for status updates */}
                                <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
                                    Image generation in progress. This usually takes 30 to 60 seconds. Please wait.
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Success state - image generated successfully */}
                {/* Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 13.3 */}
                {generatedImageUrl && (
                    <SuccessState key="success" imageUrl={generatedImageUrl} />
                )}

                {/* Error state - generation failed */}
                {/* Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 13.4 */}
                {error && (
                    <ErrorState key="error" message={error} />
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * SuccessState component
 * 
 * Displays the generated image with download functionality
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 13.3
 */
function SuccessState({ imageUrl }: { imageUrl: string }) {
    const downloadButtonRef = useRef<HTMLButtonElement>(null);

    // Requirement 13.3: Implement focus management (focus download button on load)
    useEffect(() => {
        if (downloadButtonRef.current) {
            downloadButtonRef.current.focus();
        }
    }, []);

    // Requirement 8.4: Implement download functionality with timestamped filename
    const handleDownload = () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `generated-image-${timestamp}.jpg`;

        // Create a temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        // Requirement 8.2: Add Framer Motion fade-in and scale animation
        // Requirement 10.4: Set appropriate animation durations (300-600ms)
        // Requirement 10.5: Use proper easing functions and respect reduced motion
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: getAnimationDuration(0.4), ease: 'easeOut' }}
            className="w-full"
        >
            <Card className="w-full">
                {/* Requirement 12.5: Adjust spacing for each breakpoint */}
                <CardContent className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-4 sm:space-y-6 px-4">
                    {/* Requirement 8.1: Display generated image with proper sizing */}
                    {/* Requirement 8.5: Add ARIA labels for image */}
                    {/* Requirement 12.3: Maintain usability on screens as small as 375px wide */}
                    <div className="w-full max-w-2xl">
                        {/* Requirement 15.2: Optimize image loading with lazy attribute */}
                        <img
                            src={imageUrl}
                            alt="Generated product image"
                            className="w-full h-auto rounded-lg shadow-lg"
                            loading="lazy"
                        />
                        {/* Requirement 13.4: ARIA live region for success announcement */}
                        <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
                            Image generation complete. Your generated image is now displayed.
                        </div>
                    </div>

                    {/* Requirement 8.3: Add download button with shadcn/ui Button */}
                    {/* Requirement 8.5: Add ARIA labels for button */}
                    {/* Requirement 12.5: Adjust button size for mobile */}
                    <Button
                        ref={downloadButtonRef}
                        onClick={handleDownload}
                        size="lg"
                        className="gap-2 w-full sm:w-auto"
                        aria-label="Download generated image"
                    >
                        <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                        Download Image
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}

/**
 * ErrorState component
 * 
 * Displays error message when generation fails
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 13.4
 */
function ErrorState({ message }: { message: string }) {
    return (
        // Requirement 9.3: Add Framer Motion fade-in animation
        // Requirement 10.4: Set appropriate animation durations (300-600ms)
        // Requirement 10.5: Use proper easing functions and respect reduced motion
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: getAnimationDuration(0.3), ease: 'easeOut' }}
            className="w-full"
        >
            <Card className="w-full">
                {/* Requirement 12.5: Adjust spacing for each breakpoint */}
                <CardContent className="py-6 sm:py-8 px-4">
                    {/* Requirement 9.1: Display error using shadcn/ui AlertDestructive */}
                    {/* Requirement 9.2: Show specific error message from API */}
                    {/* Requirement 13.4: Add ARIA live region for error announcement */}
                    <Alert
                        variant="destructive"
                        aria-live="assertive"
                        aria-atomic="true"
                    >
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-sm sm:text-base">Generation Failed</AlertTitle>
                        <AlertDescription className="text-xs sm:text-sm">
                            {message}
                        </AlertDescription>
                    </Alert>

                    {/* Additional helper text */}
                    <div className="mt-4 text-center">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Please check your inputs and try again.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Default export for lazy loading
export default ResultsPanel;
