/**
 * ResultsPanel Component
 * 
 * Container for displaying generation status and results
 * Requirements: 2.2, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 10.2, 13.4
 * Task 6.1: Integrate all editor components
 */

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, AlertCircle, Edit, X, Undo2, Redo2, RotateCcw, Eye } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAnimationDuration } from "@/lib/utils";
import { BackgroundEditor } from "./BackgroundEditor";
import { GenerativeFillEditor } from "./GenerativeFillEditor";
import { EnhancementEditor } from "./EnhancementEditor";
import { CanvasExpander } from "./CanvasExpander";
import { useImageEditor, type EditOperation, type EditOperationType } from "@/hooks/useImageEditor";
import { useToast } from "@/hooks/useToast";
import { useKeyboardShortcuts, getShortcutText } from "@/hooks/useKeyboardShortcuts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ResultsPanelProps {
    /** Whether image generation is in progress */
    isLoading: boolean;
    /** URL of the generated image */
    generatedImageUrl: string | null;
    /** Error message if generation failed */
    error: string | null;
    /** Callback when Edit Image button is clicked */
    onEditImage?: () => void;
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
    onEditImage,
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
                    <SuccessState key="success" imageUrl={generatedImageUrl} onEditImage={onEditImage} />
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
 * Displays the generated image with download functionality and editing tools
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 13.3
 * Task 6.1: Integrate all editor components
 * Task 6.2: Editing State Management with history tracking
 */
function SuccessState({ imageUrl, onEditImage }: { imageUrl: string; onEditImage?: () => void }) {
    const navigate = useNavigate();
    const location = useLocation();
    const downloadButtonRef = useRef<HTMLButtonElement>(null);
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [selectedTool, setSelectedTool] = useState<string>("");
    const [editError, setEditError] = useState<string | null>(null);
    const [showingOriginal, setShowingOriginal] = useState(false);

    // Task 6.2: Use image editor hook for history tracking
    const {
        originalImageUrl,
        currentImageUrl,
        editHistory,
        canUndo,
        canRedo,
        setOriginalImage,
        addEdit,
        undo,
        redo,
        resetToOriginal,
    } = useImageEditor();

    // Task 6.3: Use toast hook for notifications
    const { toast } = useToast();

    // Initialize original image when imageUrl changes
    useEffect(() => {
        if (imageUrl && imageUrl !== originalImageUrl) {
            setOriginalImage(imageUrl);
        }
    }, [imageUrl, originalImageUrl, setOriginalImage]);

    // Requirement 13.3: Implement focus management (focus download button on load)
    useEffect(() => {
        if (downloadButtonRef.current && !isEditingMode) {
            downloadButtonRef.current.focus();
        }
    }, [isEditingMode]);

    // Requirement 8.4: Implement download functionality with timestamped filename
    const handleDownload = () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `generated-image-${timestamp}.jpg`;

        // Create a temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = currentImageUrl || imageUrl;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success toast
        toast({
            variant: 'success',
            title: 'Download started',
            description: editHistory.length > 0 ? 'Downloading edited image' : 'Downloading generated image',
        });
    };

    // Download original image
    const handleDownloadOriginal = () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `original-image-${timestamp}.jpg`;

        const link = document.createElement('a');
        link.href = originalImageUrl || imageUrl;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success toast
        toast({
            variant: 'success',
            title: 'Download started',
            description: 'Downloading original image',
        });
    };

    // Handle entering edit mode
    const handleEnterEditMode = () => {
        setIsEditingMode(true);
        setEditError(null);
        if (onEditImage) {
            onEditImage();
        }
    };

    // Handle exiting edit mode
    const handleExitEditMode = () => {
        setIsEditingMode(false);
        setSelectedTool("");
        setEditError(null);
    };

    // Handle tool selection
    const handleToolSelect = (tool: string) => {
        setSelectedTool(tool);
        setEditError(null);
    };

    // Handle edit completion - add to history
    const handleEditComplete = (editedImageUrl: string, operationType: EditOperationType, params: Record<string, any> = {}) => {
        const operation: EditOperation = {
            type: operationType,
            params,
            resultUrl: editedImageUrl,
            timestamp: Date.now(),
        };

        addEdit(operation);
        setEditError(null);

        // Show success toast
        const operationNames: Record<EditOperationType, string> = {
            'remove-bg': 'Background removed',
            'replace-bg': 'Background replaced',
            'blur-bg': 'Background blurred',
            'gen-fill': 'Generative fill applied',
            'expand': 'Canvas expanded',
            'enhance': 'Image enhanced',
            'upscale': 'Image upscaled',
        };

        toast({
            variant: 'success',
            title: 'Edit successful',
            description: operationNames[operationType] || 'Edit applied successfully',
        });

        // Keep editing mode active so user can continue editing
    };

    // Handle edit error
    const handleEditError = (error: string) => {
        setEditError(error);

        // Show error toast
        toast({
            variant: 'destructive',
            title: 'Edit failed',
            description: error,
        });
    };

    // Handle undo
    const handleUndo = () => {
        undo();
        setEditError(null);

        toast({
            variant: 'default',
            title: 'Edit undone',
            description: 'Previous edit has been undone',
        });
    };

    // Handle redo
    const handleRedo = () => {
        redo();
        setEditError(null);

        toast({
            variant: 'default',
            title: 'Edit redone',
            description: 'Edit has been reapplied',
        });
    };

    // Handle reset to original
    const handleResetToOriginal = () => {
        resetToOriginal();
        setEditError(null);

        toast({
            variant: 'default',
            title: 'Reset to original',
            description: 'All edits have been removed',
        });
    };

    // Handle toggle between original and current image
    const handleToggleOriginal = () => {
        setShowingOriginal(!showingOriginal);
    };

    // Determine which image URL to display
    const displayImageUrl = showingOriginal ? (originalImageUrl || imageUrl) : (currentImageUrl || imageUrl);

    // Check if there are edits to show toggle
    const hasEdits = editHistory.length > 0;

    // Task 6.3: Setup keyboard shortcuts for editing operations
    useKeyboardShortcuts({
        enabled: isEditingMode,
        onUndo: canUndo ? handleUndo : undefined,
        onRedo: canRedo ? handleRedo : undefined,
        onReset: editHistory.length > 0 ? handleResetToOriginal : undefined,
        onDownload: handleDownload,
        onEscape: isEditingMode ? handleExitEditMode : undefined,
    });

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
                        <div className="relative">
                            {/* Requirement 15.2: Optimize image loading with lazy attribute */}
                            <img
                                src={displayImageUrl}
                                alt={showingOriginal ? "Original product image" : "Generated product image"}
                                className="w-full h-auto rounded-lg shadow-lg"
                                loading="lazy"
                            />

                            {/* Task 6.1: Toggle button to show original vs current */}
                            {hasEdits && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleToggleOriginal}
                                    className="absolute top-4 right-4 gap-2 shadow-lg transition-smooth"
                                    aria-label={showingOriginal ? "Show edited image" : "Show original image"}
                                    aria-pressed={showingOriginal}
                                >
                                    <Eye className="h-4 w-4" />
                                    {showingOriginal ? "Show Edited" : "Show Original"}
                                </Button>
                            )}
                        </div>

                        {/* Requirement 13.4: ARIA live region for success announcement */}
                        <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
                            Image generation complete. Your generated image is now displayed.
                        </div>

                        {/* Show edit history indicator and current view */}
                        {isEditingMode && hasEdits && (
                            <div className="mt-2 text-xs text-muted-foreground text-center space-y-1">
                                <div>
                                    {editHistory.length} edit{editHistory.length !== 1 ? 's' : ''} applied
                                </div>
                                {showingOriginal && (
                                    <div className="text-amber-600 dark:text-amber-400 font-medium">
                                        Viewing original image
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Editing Toolbar - Task 6.1, 6.2 */}
                    {isEditingMode && (
                        <div className="w-full max-w-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Edit Image</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleExitEditMode}
                                    aria-label="Close editing mode"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Task 6.2: Undo/Redo Controls with Task 6.3: Keyboard Shortcuts */}
                            <TooltipProvider>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleUndo}
                                                disabled={!canUndo}
                                                aria-label={`Undo last edit (${getShortcutText('undo')})`}
                                                className="gap-2"
                                            >
                                                <Undo2 className="h-4 w-4" />
                                                Undo
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Undo last edit ({getShortcutText('undo')})</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRedo}
                                                disabled={!canRedo}
                                                aria-label={`Redo last undone edit (${getShortcutText('redo')})`}
                                                className="gap-2"
                                            >
                                                <Redo2 className="h-4 w-4" />
                                                Redo
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Redo last undone edit ({getShortcutText('redo')})</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleResetToOriginal}
                                                disabled={editHistory.length === 0}
                                                aria-label={`Reset to original image (${getShortcutText('reset')})`}
                                                className="gap-2"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                                Reset to Original
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Reset to original image ({getShortcutText('reset')})</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </TooltipProvider>

                            {/* Error Display */}
                            {editError && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Editing Error</AlertTitle>
                                    <AlertDescription>{editError}</AlertDescription>
                                </Alert>
                            )}

                            {/* Accordion Navigation for Editing Tools */}
                            <Accordion
                                type="single"
                                collapsible
                                className="w-full transition-smooth"
                                value={selectedTool}
                                onValueChange={handleToolSelect}
                            >
                                {/* Background Editing Section */}
                                <AccordionItem value="background" className="border rounded-lg px-4 mb-2 transition-smooth">
                                    <AccordionTrigger
                                        className="hover:no-underline transition-smooth"
                                        aria-label="Background editing tools"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-semibold">Background Editing</span>
                                            <span className="text-xs text-muted-foreground">
                                                Remove, Replace, or Blur
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <BackgroundEditor
                                            imageUrl={currentImageUrl || imageUrl}
                                            onEditComplete={(url, type, params) => handleEditComplete(url, type, params)}
                                            onError={handleEditError}
                                        />
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Generative Fill Section */}
                                <AccordionItem value="generative-fill" className="border rounded-lg px-4 mb-2 transition-smooth">
                                    <AccordionTrigger
                                        className="hover:no-underline transition-smooth"
                                        aria-label="Generative fill tool"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-semibold">Generative Fill</span>
                                            <span className="text-xs text-muted-foreground">
                                                Add or modify content with AI
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <GenerativeFillEditor
                                            imageUrl={currentImageUrl || imageUrl}
                                            onResult={(url) => handleEditComplete(url, 'gen-fill', {})}
                                            className="w-full"
                                        />
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Enhancement Section */}
                                <AccordionItem value="enhance" className="border rounded-lg px-4 mb-2 transition-smooth">
                                    <AccordionTrigger
                                        className="hover:no-underline transition-smooth"
                                        aria-label="Image enhancement tools"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-semibold">Enhancement</span>
                                            <span className="text-xs text-muted-foreground">
                                                Improve quality and resolution
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <EnhancementEditor
                                            imageUrl={currentImageUrl || imageUrl}
                                            onEditComplete={(url, type, params) => handleEditComplete(url, type, params)}
                                            onError={handleEditError}
                                        />
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Canvas Expansion Section */}
                                <AccordionItem value="expand" className="border rounded-lg px-4 mb-2 transition-smooth">
                                    <AccordionTrigger
                                        className="hover:no-underline transition-smooth"
                                        aria-label="Canvas expansion tool"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-semibold">Canvas Expansion</span>
                                            <span className="text-xs text-muted-foreground">
                                                Change aspect ratio and expand canvas
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <CanvasExpander
                                            imageUrl={currentImageUrl || imageUrl}
                                            onEditComplete={(url, params) => handleEditComplete(url, 'expand', params)}
                                            onError={handleEditError}
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    )}

                    {/* Action buttons */}
                    <TooltipProvider>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            {/* Edit Image button - Navigate to dedicated edit page */}
                            {/* Requirement 1.1: Display Edit button to navigate to /edit route */}
                            {!isEditingMode && (
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        const imageToEdit = currentImageUrl || imageUrl;
                                        const originalImage = originalImageUrl || imageUrl;

                                        console.log('=== EDIT BUTTON CLICKED ===');
                                        console.log('Image URL:', imageToEdit);
                                        console.log('Original URL:', originalImage);
                                        console.log('From route:', location.pathname);
                                        console.log('Navigate function:', typeof navigate);

                                        // Show alert for debugging
                                        alert(`Edit button clicked! Navigating to /edit with image: ${imageToEdit}`);

                                        // Requirement 1.2, 1.3: Navigate to /edit with image URL state
                                        navigate('/edit', {
                                            state: {
                                                imageUrl: imageToEdit,
                                                originalImageUrl: originalImage,
                                                fromRoute: location.pathname,
                                            }
                                        });

                                        console.log('Navigate called successfully');
                                    }}
                                    size="lg"
                                    className="gap-2 w-full sm:w-auto transition-smooth"
                                    aria-label="Edit image in dedicated editor"
                                >
                                    <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Edit Image
                                </Button>
                            )}

                            {/* Task 6.2: Download buttons for original and edited versions */}
                            {editHistory.length > 0 ? (
                                <>
                                    <Button
                                        onClick={handleDownloadOriginal}
                                        size="lg"
                                        variant="outline"
                                        className="gap-2 w-full sm:w-auto"
                                        aria-label="Download original image"
                                    >
                                        <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Download Original
                                    </Button>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                ref={downloadButtonRef}
                                                onClick={handleDownload}
                                                size="lg"
                                                className="gap-2 w-full sm:w-auto"
                                                aria-label={`Download edited image (${getShortcutText('download')})`}
                                            >
                                                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                                                Download Edited
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Download edited image ({getShortcutText('download')})</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </>
                            ) : (
                                /* Requirement 8.3: Add download button with shadcn/ui Button */
                                /* Requirement 8.5: Add ARIA labels for button */
                                /* Requirement 12.5: Adjust button size for mobile */
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            ref={downloadButtonRef}
                                            onClick={handleDownload}
                                            size="lg"
                                            className="gap-2 w-full sm:w-auto"
                                            aria-label={`Download generated image (${getShortcutText('download')})`}
                                        >
                                            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                                            Download Image
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Download image ({getShortcutText('download')})</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </TooltipProvider>
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
