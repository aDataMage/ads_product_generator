/**
 * LazyToolPanel Component
 * 
 * Lazy-loaded version of ToolPanel with code splitting
 * Requirements: Performance optimization - Lazy load tool components
 */

import { lazy, Suspense, useState } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from './ui/accordion';
import { Layers, Sparkles, Wand2, Maximize2, Loader2 } from 'lucide-react';

// Lazy load tool components
const BackgroundEditor = lazy(() =>
    import('./BackgroundEditor').then(module => ({ default: module.BackgroundEditor }))
);
const GenerativeFillEditor = lazy(() =>
    import('./GenerativeFillEditor').then(module => ({ default: module.GenerativeFillEditor }))
);
const EnhancementEditor = lazy(() =>
    import('./EnhancementEditor').then(module => ({ default: module.EnhancementEditor }))
);
const CanvasExpander = lazy(() =>
    import('./CanvasExpander').then(module => ({ default: module.CanvasExpander }))
);

interface LazyToolPanelProps {
    /** URL of the current image being edited */
    currentImageUrl: string;
    /** Callback when an edit operation completes */
    onEditComplete: (newImageUrl: string, operation: string) => void;
    /** Callback when an edit operation starts */
    onEditStart?: (operation: string) => void;
    /** Callback when an edit operation fails */
    onEditError?: (operation: string, errorMessage?: string) => void;
    /** Whether any tool is currently processing */
    isProcessing: boolean;
}

/**
 * Loading fallback component for lazy-loaded tools
 */
function ToolLoadingFallback() {
    return (
        <div className="flex items-center justify-center py-8" role="status" aria-live="polite">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            <span className="ml-2 text-sm text-muted-foreground">Loading tool...</span>
        </div>
    );
}

/**
 * LazyToolPanel component with code splitting
 * Loads tool components only when their accordion section is opened
 */
export function LazyToolPanel({
    currentImageUrl,
    onEditComplete,
    onEditStart,
    onEditError,
    isProcessing,
}: LazyToolPanelProps) {
    const [error, setError] = useState<string>('');
    const [loadedTools, setLoadedTools] = useState<Set<string>>(new Set());

    /**
     * Mark a tool as loaded when its accordion is opened
     */
    const handleAccordionChange = (value: string) => {
        if (value && !loadedTools.has(value)) {
            setLoadedTools(prev => new Set(prev).add(value));
        }
    };

    /**
     * Handle edit start from any tool
     */
    const handleEditStartInternal = (operationType: string) => {
        setError('');
        if (onEditStart) {
            onEditStart(operationType);
        }
    };

    /**
     * Handle edit completion from BackgroundEditor and EnhancementEditor
     */
    const handleEditCompleteWithType = (
        editedImageUrl: string,
        operationType: string,
        _params: Record<string, any>
    ) => {
        setError('');
        onEditComplete(editedImageUrl, operationType);
    };

    /**
     * Handle edit completion from CanvasExpander
     */
    const handleCanvasExpandComplete = (
        editedImageUrl: string,
        _params: Record<string, any>
    ) => {
        setError('');
        onEditComplete(editedImageUrl, 'expand-canvas');
    };

    /**
     * Handle edit completion from GenerativeFillEditor
     */
    const handleGenerativeFillComplete = (
        resultUrl: string,
        _refinedPrompt?: string
    ) => {
        setError('');
        onEditComplete(resultUrl, 'generative-fill');
    };

    /**
     * Handle errors from any tool
     */
    const handleError = (errorMessage: string, operationType?: string) => {
        setError(errorMessage);
        console.error('Tool error:', errorMessage);

        if (onEditError && operationType) {
            onEditError(operationType, errorMessage);
        }
    };

    return (
        <div className="h-full flex flex-col bg-muted/30">
            {/* Fixed Header */}
            <div className="flex-shrink-0 p-3 sm:p-4 md:p-6 border-b border-border bg-background/50 backdrop-blur-sm">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold" id="tool-panel-heading">
                    Editing Tools
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1" id="tool-panel-description">
                    Select a tool below to edit your image
                </p>
            </div>

            {/* Scrollable Tool Container */}
            <div
                className="flex-1 overflow-y-auto overflow-x-hidden"
                aria-labelledby="tool-panel-heading"
                aria-describedby="tool-panel-description"
                role="region"
                style={{
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                    {/* Global Error Display */}
                    {error && (
                        <div
                            className="p-2 sm:p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs sm:text-sm text-destructive"
                            role="alert"
                            aria-live="assertive"
                            aria-atomic="true"
                        >
                            <span className="font-semibold">Error: </span>
                            {error}
                        </div>
                    )}

                    {/* Processing Indicator */}
                    {isProcessing && (
                        <div
                            className="p-2 sm:p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs sm:text-sm text-primary"
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            Processing... Please wait.
                        </div>
                    )}

                    {/* Tool Accordion */}
                    <Accordion
                        type="single"
                        collapsible
                        className="w-full space-y-2 sm:space-y-3"
                        disabled={isProcessing}
                        aria-label="Image editing tools"
                        onValueChange={handleAccordionChange}
                    >
                        {/* Background Tools Section */}
                        <AccordionItem
                            value="background"
                            className="border border-border rounded-lg bg-background overflow-hidden"
                        >
                            <AccordionTrigger
                                className="px-3 sm:px-4 hover:no-underline hover:bg-muted/50 transition-colors"
                                disabled={isProcessing}
                            >
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" aria-hidden="true" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium text-sm sm:text-base">Background Tools</div>
                                        <div className="text-xs text-muted-foreground font-normal">
                                            Remove, replace, or blur backgrounds
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                                <Suspense fallback={<ToolLoadingFallback />}>
                                    <BackgroundEditor
                                        imageUrl={currentImageUrl}
                                        onEditComplete={handleEditCompleteWithType}
                                        onEditStart={handleEditStartInternal}
                                        onError={handleError}
                                    />
                                </Suspense>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Generative Fill Section */}
                        <AccordionItem
                            value="generative-fill"
                            className="border border-border rounded-lg bg-background overflow-hidden"
                        >
                            <AccordionTrigger
                                className="px-3 sm:px-4 hover:no-underline hover:bg-muted/50 transition-colors"
                                disabled={isProcessing}
                            >
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium text-sm sm:text-base">Generative Fill</div>
                                        <div className="text-xs text-muted-foreground font-normal">
                                            Fill masked areas with AI-generated content
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                                <Suspense fallback={<ToolLoadingFallback />}>
                                    <GenerativeFillEditor
                                        imageUrl={currentImageUrl}
                                        onResult={handleGenerativeFillComplete}
                                        onEditStart={handleEditStartInternal}
                                    />
                                </Suspense>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Enhancement Section */}
                        <AccordionItem
                            value="enhancement"
                            className="border border-border rounded-lg bg-background overflow-hidden"
                        >
                            <AccordionTrigger
                                className="px-3 sm:px-4 hover:no-underline hover:bg-muted/50 transition-colors"
                                disabled={isProcessing}
                            >
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <Wand2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium text-sm sm:text-base">Enhancement</div>
                                        <div className="text-xs text-muted-foreground font-normal">
                                            Improve quality and upscale resolution
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                                <Suspense fallback={<ToolLoadingFallback />}>
                                    <EnhancementEditor
                                        imageUrl={currentImageUrl}
                                        onEditComplete={handleEditCompleteWithType}
                                        onEditStart={handleEditStartInternal}
                                        onError={handleError}
                                    />
                                </Suspense>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Canvas Expander Section */}
                        <AccordionItem
                            value="canvas-expander"
                            className="border border-border rounded-lg bg-background overflow-hidden"
                        >
                            <AccordionTrigger
                                className="px-3 sm:px-4 hover:no-underline hover:bg-muted/50 transition-colors"
                                disabled={isProcessing}
                            >
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                        <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium text-sm sm:text-base">Canvas Expander</div>
                                        <div className="text-xs text-muted-foreground font-normal">
                                            Expand canvas to different aspect ratios
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                                <Suspense fallback={<ToolLoadingFallback />}>
                                    <CanvasExpander
                                        imageUrl={currentImageUrl}
                                        onEditComplete={handleCanvasExpandComplete}
                                        onEditStart={handleEditStartInternal}
                                        onError={handleError}
                                    />
                                </Suspense>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    );
}
