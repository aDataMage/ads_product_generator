/**
 * ToolPanel Component
 * 
 * Container for all editing tools with accordion organization
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 * 
 * Features:
 * - Scrollable container with fixed header
 * - Accordion sections for each tool category
 * - Disabled state when processing
 * - Keyboard navigation support
 */

import { useState } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from './ui/accordion';
import { BackgroundEditor } from './BackgroundEditor';
import { GenerativeFillEditor } from './GenerativeFillEditor';
import { EnhancementEditor } from './EnhancementEditor';
import { CanvasExpander } from './CanvasExpander';
import { Layers, Sparkles, Wand2, Maximize2 } from 'lucide-react';

interface ToolPanelProps {
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
 * ToolPanel component
 * 
 * Provides organized access to all image editing tools
 * Requirement 2.1: Display tool panel on left side
 * Requirement 2.2: Contain all editing tools in scrollable layout
 * Requirement 2.3: Include all editing tools
 * Requirement 2.4: Display tools in accordion sections
 * Requirement 2.5: Remain fixed during scrolling
 */
export function ToolPanel({
    currentImageUrl,
    onEditComplete,
    onEditStart,
    onEditError,
    isProcessing,
}: ToolPanelProps) {
    const [error, setError] = useState<string>('');

    /**
     * Handle edit start from any tool
     * Requirement 7.1, 7.2, 7.3, 7.4: Notify parent when operation starts
     */
    const handleEditStartInternal = (operationType: string) => {
        // Clear any previous errors
        setError('');

        // Notify parent that operation is starting
        if (onEditStart) {
            onEditStart(operationType);
        }
    };

    /**
     * Handle edit completion from BackgroundEditor and EnhancementEditor
     * These components pass 3 parameters: (url, operationType, params)
     * Requirements 2.3, 3.2, 3.3: Connect tools and update ImagePanel
     */
    const handleEditCompleteWithType = (
        editedImageUrl: string,
        operationType: string,
        _params: Record<string, any>
    ) => {
        // Clear any previous errors
        setError('');

        // Pass to parent with operation name
        onEditComplete(editedImageUrl, operationType);
    };

    /**
     * Handle edit completion from CanvasExpander
     * This component passes 2 parameters: (url, params)
     * Requirements 2.3, 3.2, 3.3: Connect tools and update ImagePanel
     */
    const handleCanvasExpandComplete = (
        editedImageUrl: string,
        _params: Record<string, any>
    ) => {
        // Clear any previous errors
        setError('');

        // Pass to parent with operation name
        onEditComplete(editedImageUrl, 'expand-canvas');
    };

    /**
     * Handle edit completion from GenerativeFillEditor
     * This component passes 2 parameters: (url, refinedPrompt)
     * Requirements 2.3, 3.2, 3.3: Connect tools and update ImagePanel
     */
    const handleGenerativeFillComplete = (
        resultUrl: string,
        _refinedPrompt?: string
    ) => {
        // Clear any previous errors
        setError('');

        // Pass to parent with operation name
        onEditComplete(resultUrl, 'generative-fill');
    };

    /**
     * Handle errors from any tool
     * Requirements 4.4, 7.1, 7.2: Handle edit operation failures
     */
    const handleError = (errorMessage: string, operationType?: string) => {
        setError(errorMessage);
        console.error('Tool error:', errorMessage);

        // Notify parent about the error
        if (onEditError && operationType) {
            onEditError(operationType, errorMessage);
        }
    };

    return (
        <div
            className="h-full flex flex-col bg-muted/30"
        >
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
                    // Enable smooth scrolling on mobile
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
                    >
                        {/* Background Tools Section */}
                        <AccordionItem
                            value="background"
                            className="border border-border rounded-lg bg-background overflow-hidden"
                        >
                            <AccordionTrigger
                                className="px-3 sm:px-4 hover:no-underline hover:bg-muted/50 transition-colors"
                                disabled={isProcessing}
                                aria-label="Background editing tools section. Click to expand or collapse."
                                aria-controls="background-tools-content"
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
                            <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4" id="background-tools-content">
                                <BackgroundEditor
                                    imageUrl={currentImageUrl}
                                    onEditComplete={handleEditCompleteWithType}
                                    onEditStart={handleEditStartInternal}
                                    onError={handleError}
                                />
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
                                aria-label="Generative fill tool section. Click to expand or collapse."
                                aria-controls="generative-fill-content"
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
                            <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4" id="generative-fill-content">
                                <GenerativeFillEditor
                                    imageUrl={currentImageUrl}
                                    onResult={handleGenerativeFillComplete}
                                    onEditStart={handleEditStartInternal}
                                />
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
                                aria-label="Image enhancement tools section. Click to expand or collapse."
                                aria-controls="enhancement-content"
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
                            <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4" id="enhancement-content">
                                <EnhancementEditor
                                    imageUrl={currentImageUrl}
                                    onEditComplete={handleEditCompleteWithType}
                                    onEditStart={handleEditStartInternal}
                                    onError={handleError}
                                />
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
                                aria-label="Canvas expansion tool section. Click to expand or collapse."
                                aria-controls="canvas-expander-content"
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
                            <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4" id="canvas-expander-content">
                                <CanvasExpander
                                    imageUrl={currentImageUrl}
                                    onEditComplete={handleCanvasExpandComplete}
                                    onEditStart={handleEditStartInternal}
                                    onError={handleError}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    );
}
