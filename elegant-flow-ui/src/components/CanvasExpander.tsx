/**
 * CanvasExpander Component
 * 
 * Provides tools for canvas expansion:
 * - Aspect ratio preset buttons (1:1, 4:3, 16:9, 9:16)
 * - Custom dimension inputs
 * - Visual preview of expansion
 * - Optional prompt for expansion context
 * 
 * Requirements: Task 5.1 - Canvas Expander Component
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
import { Loader2, CheckCircle2, AlertCircle, Maximize2, Square, RectangleHorizontal, Smartphone } from "lucide-react";
import { ApiError, expandImage } from "../lib/api";

interface CanvasExpanderProps {
    /** URL of the image to edit */
    imageUrl: string;
    /** Callback when editing operation completes */
    onEditComplete: (editedImageUrl: string, params: Record<string, any>) => void;
    /** Callback when editing operation starts */
    onEditStart?: (operationType: string) => void;
    /** Callback when editing operation fails */
    onError: (error: string) => void;
}

type OperationType = 'expand' | null;

interface ProcessingState {
    isProcessing: boolean;
    operation: OperationType;
    progress: number;
    statusMessage: string;
}

interface FeedbackState {
    type: 'success' | 'error' | null;
    message: string;
    operation: OperationType;
}

interface ImageDimensions {
    width: number;
    height: number;
}

interface AspectRatioPreset {
    id: string;
    name: string;
    ratio: string;
    width: number;
    height: number;
    icon: typeof Square;
    description: string;
}

/**
 * Aspect ratio presets for common use cases
 */
const ASPECT_RATIO_PRESETS: AspectRatioPreset[] = [
    {
        id: '1:1',
        name: 'Square',
        ratio: '1:1',
        width: 1,
        height: 1,
        icon: Square,
        description: 'Perfect for social media posts'
    },
    {
        id: '4:3',
        name: 'Standard',
        ratio: '4:3',
        width: 4,
        height: 3,
        icon: RectangleHorizontal,
        description: 'Classic photo format'
    },
    {
        id: '16:9',
        name: 'Widescreen',
        ratio: '16:9',
        width: 16,
        height: 9,
        icon: RectangleHorizontal,
        description: 'HD video and displays'
    },
    {
        id: '9:16',
        name: 'Portrait',
        ratio: '9:16',
        width: 9,
        height: 16,
        icon: Smartphone,
        description: 'Mobile stories and reels'
    }
];

/**
 * CanvasExpander component
 * 
 * Allows users to expand image canvas to different aspect ratios
 */
export function CanvasExpander({
    imageUrl,
    onEditComplete,
    onEditStart,
    onError,
}: CanvasExpanderProps) {
    const [processingState, setProcessingState] = useState<ProcessingState>({
        isProcessing: false,
        operation: null,
        progress: 0,
        statusMessage: ''
    });
    const [feedbackState, setFeedbackState] = useState<FeedbackState>({
        type: null,
        message: '',
        operation: null
    });
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions | null>(null);
    const [selectedPreset, setSelectedPreset] = useState<AspectRatioPreset | null>(null);
    const [customWidth, setCustomWidth] = useState<string>('');
    const [customHeight, setCustomHeight] = useState<string>('');
    const [useCustomDimensions, setUseCustomDimensions] = useState<boolean>(false);
    const [expansionPrompt, setExpansionPrompt] = useState<string>('');

    // Load original image dimensions
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            setOriginalDimensions({
                width: img.naturalWidth,
                height: img.naturalHeight
            });
        };
        img.src = imageUrl;
    }, [imageUrl]);

    // Helper to update processing state
    const updateProcessingState = (updates: Partial<ProcessingState>) => {
        setProcessingState(prev => ({ ...prev, ...updates }));
    };

    // Simulate progress updates for better UX
    const simulateProgress = (_operation: OperationType): ReturnType<typeof setInterval> => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) {
                progress = 90;
                clearInterval(interval);
            }
            updateProcessingState({ progress });
        }, 500);
        return interval;
    };

    /**
     * Calculate target dimensions based on aspect ratio preset
     * 
     * This function determines the new canvas dimensions needed to achieve
     * the target aspect ratio while preserving the original image.
     * 
     * Algorithm:
     * 1. Compare original aspect ratio with target aspect ratio
     * 2. If original is narrower (more portrait), expand width
     * 3. If original is wider (more landscape), expand height
     * 4. If already at target ratio, return original dimensions
     * 
     * @param preset - The aspect ratio preset to apply
     * @returns Target dimensions or null if original dimensions not loaded
     */
    const calculateTargetDimensions = (preset: AspectRatioPreset): ImageDimensions | null => {
        if (!originalDimensions) return null;

        const originalAspect = originalDimensions.width / originalDimensions.height;
        const targetAspect = preset.width / preset.height;

        // Tolerance for aspect ratio comparison (0.1% difference)
        const ASPECT_RATIO_TOLERANCE = 0.001;

        // Check if already at target aspect ratio (within tolerance)
        if (Math.abs(originalAspect - targetAspect) < ASPECT_RATIO_TOLERANCE) {
            return originalDimensions;
        }

        let targetWidth = originalDimensions.width;
        let targetHeight = originalDimensions.height;

        // If original is narrower than target (more portrait), expand width
        if (originalAspect < targetAspect) {
            targetWidth = Math.round(originalDimensions.height * targetAspect);
        }
        // If original is wider than target (more landscape), expand height
        else {
            targetHeight = Math.round(originalDimensions.width / targetAspect);
        }

        // Ensure dimensions are positive integers
        targetWidth = Math.max(1, Math.round(targetWidth));
        targetHeight = Math.max(1, Math.round(targetHeight));

        return {
            width: targetWidth,
            height: targetHeight
        };
    };

    /**
     * Calculate the aspect ratio of given dimensions
     * 
     * @param dimensions - Width and height
     * @returns Aspect ratio as a decimal number
     */
    const calculateAspectRatio = (dimensions: ImageDimensions): number => {
        return dimensions.width / dimensions.height;
    };

    /**
     * Format aspect ratio as a readable string (e.g., "16:9")
     * 
     * @param dimensions - Width and height
     * @returns Formatted aspect ratio string
     */
    const formatAspectRatio = (dimensions: ImageDimensions): string => {
        const gcd = (a: number, b: number): number => {
            return b === 0 ? a : gcd(b, a % b);
        };

        const divisor = gcd(dimensions.width, dimensions.height);
        const ratioWidth = dimensions.width / divisor;
        const ratioHeight = dimensions.height / divisor;

        // If the ratio is too complex, show decimal
        if (ratioWidth > 100 || ratioHeight > 100) {
            return `${(dimensions.width / dimensions.height).toFixed(2)}:1`;
        }

        return `${ratioWidth}:${ratioHeight}`;
    };

    /**
     * Validate that target dimensions are larger than original in at least one direction
     * 
     * @param original - Original image dimensions
     * @param target - Target dimensions
     * @returns True if expansion is valid
     */
    const isValidExpansion = (original: ImageDimensions, target: ImageDimensions): boolean => {
        return target.width >= original.width || target.height >= original.height;
    };

    // Handle aspect ratio preset selection
    const handlePresetSelect = (preset: AspectRatioPreset) => {
        setSelectedPreset(preset);
        setUseCustomDimensions(false);
        setCustomWidth('');
        setCustomHeight('');
    };

    // Handle custom dimension toggle
    const handleCustomDimensionsToggle = () => {
        setUseCustomDimensions(true);
        setSelectedPreset(null);
        // Pre-fill with original dimensions if available
        if (originalDimensions) {
            setCustomWidth(originalDimensions.width.toString());
            setCustomHeight(originalDimensions.height.toString());
        }
    };

    /**
     * Validate custom dimensions input
     * 
     * Checks:
     * - Values are valid numbers
     * - Values are positive
     * - Values don't exceed maximum
     * - At least one dimension is larger than original
     * 
     * @returns Validation result with error message if invalid
     */
    const validateCustomDimensions = (): { valid: boolean; error?: string } => {
        const width = parseInt(customWidth);
        const height = parseInt(customHeight);

        if (isNaN(width) || isNaN(height)) {
            return { valid: false, error: "Please enter valid numbers for width and height" };
        }

        if (width <= 0 || height <= 0) {
            return { valid: false, error: "Width and height must be greater than 0" };
        }

        if (width > 10000 || height > 10000) {
            return { valid: false, error: "Maximum dimension is 10000 pixels" };
        }

        if (originalDimensions) {
            const targetDims: ImageDimensions = { width, height };

            if (!isValidExpansion(originalDimensions, targetDims)) {
                return {
                    valid: false,
                    error: "Target dimensions must be larger than original in at least one direction"
                };
            }

            // Check if aspect ratio is significantly different (might be unintentional)
            const originalAspect = calculateAspectRatio(originalDimensions);
            const targetAspect = calculateAspectRatio(targetDims);
            const aspectDifference = Math.abs(originalAspect - targetAspect);

            // Warn if aspect ratio changes dramatically (more than 2x difference)
            if (aspectDifference > originalAspect) {
                // This is just a warning, not an error - still allow it
                console.warn('Large aspect ratio change detected:', {
                    original: formatAspectRatio(originalDimensions),
                    target: formatAspectRatio(targetDims)
                });
            }
        }

        return { valid: true };
    };

    // Handle expand operation
    const handleExpand = async () => {
        let targetDimensions: ImageDimensions | null = null;

        // Determine target dimensions based on mode
        if (useCustomDimensions) {
            const validation = validateCustomDimensions();
            if (!validation.valid) {
                const errorMsg = validation.error || "Invalid custom dimensions";
                setFeedbackState({
                    type: 'error',
                    message: errorMsg,
                    operation: 'expand'
                });
                onError(errorMsg);
                return;
            }

            targetDimensions = {
                width: parseInt(customWidth),
                height: parseInt(customHeight)
            };
        } else {
            if (!selectedPreset) {
                const errorMsg = "Please select an aspect ratio preset or enter custom dimensions";
                setFeedbackState({
                    type: 'error',
                    message: errorMsg,
                    operation: 'expand'
                });
                onError(errorMsg);
                return;
            }

            targetDimensions = calculateTargetDimensions(selectedPreset);
            if (!targetDimensions) {
                const errorMsg = "Unable to calculate target dimensions";
                setFeedbackState({
                    type: 'error',
                    message: errorMsg,
                    operation: 'expand'
                });
                onError(errorMsg);
                return;
            }
        }

        // Check if expansion is needed
        if (originalDimensions &&
            targetDimensions.width === originalDimensions.width &&
            targetDimensions.height === originalDimensions.height) {
            const errorMsg = "Image is already at the selected aspect ratio";
            setFeedbackState({
                type: 'error',
                message: errorMsg,
                operation: 'expand'
            });
            onError(errorMsg);
            return;
        }

        // Clear previous feedback
        setFeedbackState({ type: null, message: '', operation: null });

        // Notify parent that operation is starting
        if (onEditStart) {
            onEditStart('expand-canvas');
        }

        updateProcessingState({
            isProcessing: true,
            operation: 'expand',
            progress: 0,
            statusMessage: 'Preparing to expand canvas...'
        });

        const progressInterval = simulateProgress('expand');

        try {
            updateProcessingState({ statusMessage: 'Expanding canvas...' });

            // Call the expand image API
            const result = await expandImage({
                image: imageUrl,
                target_width: targetDimensions.width,
                target_height: targetDimensions.height,
                prompt: expansionPrompt || undefined
            });

            clearInterval(progressInterval);
            updateProcessingState({ progress: 100, statusMessage: 'Complete!' });

            if (result.success && result.result_url) {
                const resultUrl = result.result_url;

                // Update preview
                setPreviewImageUrl(resultUrl);

                // Show success feedback
                const successMessage = useCustomDimensions
                    ? `Canvas expanded to ${targetDimensions.width}×${targetDimensions.height} successfully!`
                    : `Canvas expanded to ${selectedPreset?.ratio} successfully!`;
                setFeedbackState({
                    type: 'success',
                    message: successMessage,
                    operation: 'expand'
                });

                setTimeout(() => onEditComplete(resultUrl, {
                    target_width: targetDimensions.width,
                    target_height: targetDimensions.height,
                    prompt: expansionPrompt
                }), 500);
            } else {
                const errorMsg = result.error || "Failed to expand canvas";
                setFeedbackState({
                    type: 'error',
                    message: errorMsg,
                    operation: 'expand'
                });
                onError(errorMsg);
            }
        } catch (error) {
            clearInterval(progressInterval);
            const errorMsg = error instanceof ApiError
                ? error.message
                : (error instanceof Error ? error.message : "Failed to expand canvas");

            setFeedbackState({
                type: 'error',
                message: errorMsg,
                operation: 'expand'
            });
            onError(errorMsg);
        } finally {
            setTimeout(() => {
                updateProcessingState({
                    isProcessing: false,
                    operation: null,
                    progress: 0,
                    statusMessage: ''
                });
            }, 500);
        }
    };

    // Get target dimensions for display
    const targetDimensions = useCustomDimensions
        ? (customWidth && customHeight ? { width: parseInt(customWidth), height: parseInt(customHeight) } : null)
        : (selectedPreset ? calculateTargetDimensions(selectedPreset) : null);

    return (
        <TooltipProvider>
            <Card className="w-full transition-smooth" role="region" aria-label="Canvas expansion tools">
                <CardHeader className="px-4 sm:px-6">
                    <CardTitle id="canvas-expander-title" className="text-lg sm:text-xl">Canvas Expander</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 transition-smooth" aria-labelledby="canvas-expander-title">
                    {/* Skeleton Loading State - Shows when processing */}
                    {processingState.isProcessing && !previewImageUrl && (
                        <div className="space-y-4 fade-in" role="region" aria-label="Loading preview">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="w-full aspect-video rounded-lg" />
                            <Skeleton className="h-3 w-48 mx-auto" />
                            <div className="space-y-2">
                                <Skeleton className="h-32 rounded-lg" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    )}

                    {/* Image Preview Section */}
                    {previewImageUrl && (
                        <div className="space-y-2 fade-in" role="region" aria-label="Image preview">
                            <h3 className="text-sm font-medium" id="preview-heading">Preview</h3>
                            <div className="relative w-full rounded-lg overflow-hidden border border-border bg-muted transition-smooth">
                                <img
                                    src={previewImageUrl}
                                    alt="Expanded canvas preview"
                                    className="w-full h-auto transition-opacity"
                                    loading="lazy"
                                    aria-describedby="preview-description"
                                />
                            </div>
                            <p id="preview-description" className="text-xs text-muted-foreground text-center">
                                Preview of your expanded canvas
                            </p>
                        </div>
                    )}

                    {/* Visual Expansion Preview */}
                    {!previewImageUrl && originalDimensions && targetDimensions && (
                        <div className="space-y-2 fade-in" role="region" aria-label="Expansion preview">
                            <h3 className="text-sm font-medium" id="expansion-preview-heading">Expansion Preview</h3>
                            <p className="text-xs text-muted-foreground">
                                Visual representation of how your canvas will be expanded
                            </p>
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-dashed border-primary bg-muted p-4 transition-smooth">
                                <div className="relative w-full h-full flex items-center justify-center">
                                    {/* Calculate scale to fit preview */}
                                    <div
                                        className="relative"
                                        style={{
                                            width: '100%',
                                            maxWidth: '400px',
                                            aspectRatio: `${targetDimensions.width} / ${targetDimensions.height}`
                                        }}
                                    >
                                        {/* Target canvas outline */}
                                        <div
                                            className="absolute inset-0 border-2 border-primary rounded bg-primary/5"
                                            aria-label="New canvas size outline"
                                        >
                                            {/* Original image area */}
                                            <div
                                                className="absolute bg-background border-2 border-foreground/20 rounded shadow-lg flex items-center justify-center"
                                                style={{
                                                    width: `${(originalDimensions.width / targetDimensions.width) * 100}%`,
                                                    height: `${(originalDimensions.height / targetDimensions.height) * 100}%`,
                                                    left: '50%',
                                                    top: '50%',
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                                aria-label="Original image area"
                                            >
                                                <div className="text-center p-2">
                                                    <div className="text-xs font-medium text-foreground">Original Image</div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {originalDimensions.width} × {originalDimensions.height}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expansion areas indicators */}
                                            {/* Top expansion */}
                                            {targetDimensions.height > originalDimensions.height && (
                                                <>
                                                    <div
                                                        className="absolute left-0 right-0 bg-primary/10 border-b border-primary/30"
                                                        style={{
                                                            top: 0,
                                                            height: `${((targetDimensions.height - originalDimensions.height) / 2 / targetDimensions.height) * 100}%`
                                                        }}
                                                        aria-label="Top expansion area"
                                                    >
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-xs text-primary font-medium bg-background/80 px-2 py-1 rounded">
                                                                Generated
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {/* Bottom expansion */}
                                                    <div
                                                        className="absolute left-0 right-0 bg-primary/10 border-t border-primary/30"
                                                        style={{
                                                            bottom: 0,
                                                            height: `${((targetDimensions.height - originalDimensions.height) / 2 / targetDimensions.height) * 100}%`
                                                        }}
                                                        aria-label="Bottom expansion area"
                                                    >
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-xs text-primary font-medium bg-background/80 px-2 py-1 rounded">
                                                                Generated
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Left expansion */}
                                            {targetDimensions.width > originalDimensions.width && (
                                                <>
                                                    <div
                                                        className="absolute top-0 bottom-0 bg-primary/10 border-r border-primary/30"
                                                        style={{
                                                            left: 0,
                                                            width: `${((targetDimensions.width - originalDimensions.width) / 2 / targetDimensions.width) * 100}%`
                                                        }}
                                                        aria-label="Left expansion area"
                                                    >
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-xs text-primary font-medium bg-background/80 px-2 py-1 rounded -rotate-90">
                                                                Generated
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {/* Right expansion */}
                                                    <div
                                                        className="absolute top-0 bottom-0 bg-primary/10 border-l border-primary/30"
                                                        style={{
                                                            right: 0,
                                                            width: `${((targetDimensions.width - originalDimensions.width) / 2 / targetDimensions.width) * 100}%`
                                                        }}
                                                        aria-label="Right expansion area"
                                                    >
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-xs text-primary font-medium bg-background/80 px-2 py-1 rounded rotate-90">
                                                                Generated
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Dimension labels */}
                                        <div className="absolute -top-6 left-0 right-0 text-center">
                                            <span className="text-xs font-medium text-primary bg-background px-2 py-1 rounded border border-primary">
                                                {targetDimensions.width}px
                                            </span>
                                        </div>
                                        <div className="absolute -right-12 top-0 bottom-0 flex items-center">
                                            <span className="text-xs font-medium text-primary bg-background px-2 py-1 rounded border border-primary -rotate-90">
                                                {targetDimensions.height}px
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex-shrink-0 mt-0.5">
                                    <svg
                                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="text-xs text-blue-800 dark:text-blue-200">
                                    <p className="font-medium mb-1">How expansion works:</p>
                                    <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                                        <li>Your original image stays centered</li>
                                        <li>Highlighted areas will be AI-generated to match the context</li>
                                        <li>The expansion maintains natural continuity with your image</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Aspect Ratio Info */}
                            <div className="p-3 bg-muted rounded-lg space-y-2" role="region" aria-label="Aspect ratio information">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Original Aspect Ratio:</span>
                                    <span className="font-mono text-foreground">
                                        {formatAspectRatio(originalDimensions)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Target Aspect Ratio:</span>
                                    <span className="font-mono text-primary font-medium">
                                        {formatAspectRatio(targetDimensions)}
                                    </span>
                                </div>
                            </div>

                            {/* Expand Confirmation Button */}
                            <Button
                                onClick={handleExpand}
                                disabled={processingState.isProcessing}
                                className="w-full"
                                size="lg"
                                aria-label="Confirm and expand canvas"
                                aria-busy={processingState.isProcessing}
                            >
                                {processingState.isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                        Expanding Canvas...
                                    </>
                                ) : (
                                    <>
                                        <Maximize2 className="mr-2 h-4 w-4" aria-hidden="true" />
                                        Expand to {useCustomDimensions
                                            ? `${targetDimensions.width}×${targetDimensions.height}`
                                            : selectedPreset?.ratio}
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Success/Error Feedback */}
                    {feedbackState.type && (
                        <Alert
                            variant={feedbackState.type === 'error' ? 'destructive' : 'default'}
                            className={`fade-in ${feedbackState.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}`}
                            role="alert"
                            aria-live="polite"
                        >
                            {feedbackState.type === 'success' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                                <AlertCircle className="h-4 w-4" />
                            )}
                            <AlertTitle className={feedbackState.type === 'success' ? 'text-green-800 dark:text-green-200' : ''}>
                                {feedbackState.type === 'success' ? 'Success' : 'Error'}
                            </AlertTitle>
                            <AlertDescription className={feedbackState.type === 'success' ? 'text-green-700 dark:text-green-300' : ''}>
                                {feedbackState.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Progress Indicator */}
                    {processingState.isProcessing && (
                        <div
                            className="space-y-2 p-4 bg-muted rounded-lg fade-in"
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                            aria-label="Processing expand operation"
                        >
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium" id="progress-status">{processingState.statusMessage}</span>
                                <span className="text-muted-foreground" aria-label={`${Math.round(processingState.progress)} percent complete`}>
                                    {Math.round(processingState.progress)}%
                                </span>
                            </div>
                            <div className="w-full bg-background rounded-full h-2 overflow-hidden" aria-hidden="true">
                                <div
                                    className="bg-primary h-full transition-all duration-300 ease-out"
                                    style={{ width: `${processingState.progress}%` }}
                                />
                            </div>
                            <div
                                role="progressbar"
                                aria-valuenow={Math.round(processingState.progress)}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-labelledby="progress-status"
                                className="sr-only"
                            >
                                {Math.round(processingState.progress)}% complete
                            </div>
                        </div>
                    )}

                    {/* Aspect Ratio Presets Section */}
                    <div className="space-y-3" role="group" aria-labelledby="aspect-ratio-heading">
                        <h3 className="text-sm font-medium" id="aspect-ratio-heading">Select Aspect Ratio</h3>
                        <p className="text-xs text-muted-foreground">
                            Choose a preset to expand your canvas to a different aspect ratio
                        </p>

                        {/* Preset Buttons Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ASPECT_RATIO_PRESETS.map((preset) => {
                                const IconComponent = preset.icon;
                                const isSelected = selectedPreset?.id === preset.id;
                                const targetDims = originalDimensions ? calculateTargetDimensions(preset) : null;
                                const isAlreadyAtRatio = !!(targetDims && originalDimensions &&
                                    targetDims.width === originalDimensions.width &&
                                    targetDims.height === originalDimensions.height);

                                return (
                                    <button
                                        key={preset.id}
                                        onClick={() => handlePresetSelect(preset)}
                                        disabled={processingState.isProcessing || isAlreadyAtRatio}
                                        className={`p-4 text-left rounded-lg border-2 transition-smooth transition-scale ${isAlreadyAtRatio
                                            ? 'border-border bg-muted opacity-60 cursor-not-allowed'
                                            : isSelected
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50 bg-background'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        aria-label={`Select ${preset.name} aspect ratio (${preset.ratio})${isAlreadyAtRatio ? ' - Already at this ratio' : ''}`}
                                        aria-pressed={isSelected}
                                        aria-describedby={`preset-${preset.id}-description`}
                                        aria-disabled={isAlreadyAtRatio || undefined}
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <IconComponent
                                                    className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
                                                    aria-hidden="true"
                                                />
                                                <span className={`text-xs font-mono ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    {preset.ratio}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium flex items-center gap-2">
                                                    {preset.name}
                                                    {isAlreadyAtRatio && (
                                                        <span className="text-xs text-muted-foreground font-normal">
                                                            (Current)
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    id={`preset-${preset.id}-description`}
                                                    className="text-xs text-muted-foreground mt-1"
                                                >
                                                    {isAlreadyAtRatio
                                                        ? 'Image is already at this aspect ratio'
                                                        : preset.description}
                                                </div>
                                                {targetDims && !isAlreadyAtRatio && (
                                                    <div className="text-xs text-primary mt-1 font-mono">
                                                        → {targetDims.width} × {targetDims.height}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom Dimensions Section */}
                    <div className="space-y-3" role="group" aria-labelledby="custom-dimensions-heading">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium" id="custom-dimensions-heading">Custom Dimensions</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCustomDimensionsToggle}
                                disabled={processingState.isProcessing}
                                className={useCustomDimensions ? 'border-primary' : ''}
                                aria-label="Use custom dimensions"
                                aria-pressed={useCustomDimensions}
                            >
                                {useCustomDimensions ? 'Using Custom' : 'Use Custom'}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Enter specific width and height in pixels
                        </p>

                        {/* Custom Dimension Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label htmlFor="custom-width" className="text-xs font-medium text-muted-foreground">
                                    Width (px)
                                </label>
                                <Input
                                    id="custom-width"
                                    type="number"
                                    min="1"
                                    max="10000"
                                    value={customWidth}
                                    onChange={(e) => setCustomWidth(e.target.value)}
                                    disabled={processingState.isProcessing || !useCustomDimensions}
                                    placeholder={originalDimensions ? originalDimensions.width.toString() : "1024"}
                                    className={useCustomDimensions ? 'border-primary/50' : ''}
                                    aria-label="Custom width in pixels"
                                    aria-describedby="width-hint"
                                />
                                <p id="width-hint" className="text-xs text-muted-foreground">
                                    {originalDimensions ? `Original: ${originalDimensions.width}px` : 'Enter width'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="custom-height" className="text-xs font-medium text-muted-foreground">
                                    Height (px)
                                </label>
                                <Input
                                    id="custom-height"
                                    type="number"
                                    min="1"
                                    max="10000"
                                    value={customHeight}
                                    onChange={(e) => setCustomHeight(e.target.value)}
                                    disabled={processingState.isProcessing || !useCustomDimensions}
                                    placeholder={originalDimensions ? originalDimensions.height.toString() : "1024"}
                                    className={useCustomDimensions ? 'border-primary/50' : ''}
                                    aria-label="Custom height in pixels"
                                    aria-describedby="height-hint"
                                />
                                <p id="height-hint" className="text-xs text-muted-foreground">
                                    {originalDimensions ? `Original: ${originalDimensions.height}px` : 'Enter height'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Optional Expansion Prompt Section */}
                    <div className="space-y-3" role="group" aria-labelledby="expansion-prompt-heading">
                        <h3 className="text-sm font-medium" id="expansion-prompt-heading">
                            Expansion Context (Optional)
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Provide a prompt to guide how the expanded areas should be filled. Leave empty for automatic context-aware expansion.
                        </p>
                        <Textarea
                            id="expansion-prompt"
                            value={expansionPrompt}
                            onChange={(e) => setExpansionPrompt(e.target.value)}
                            disabled={processingState.isProcessing}
                            placeholder="e.g., continue the background naturally, add more wooden table surface, extend the white studio background"
                            className="min-h-[80px] resize-none"
                            aria-label="Optional prompt for expansion context"
                            aria-describedby="expansion-prompt-hint"
                            maxLength={500}
                        />
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <div className="flex-shrink-0 mt-0.5">
                                <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <p id="expansion-prompt-hint">
                                <strong>Tip:</strong> Describe what should appear in the expanded areas. For example, "continue the wooden table surface" or "extend the white studio background with soft shadows".
                            </p>
                        </div>
                        {expansionPrompt && (
                            <div className="text-xs text-muted-foreground text-right">
                                {expansionPrompt.length} / 500 characters
                            </div>
                        )}
                    </div>

                    {/* Dimension Information */}
                    {originalDimensions && (
                        <div className="p-3 bg-muted rounded-lg space-y-2" role="region" aria-label="Dimension information">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Original:</span>
                                    <span className="font-medium">
                                        {originalDimensions.width} × {originalDimensions.height} px
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Aspect Ratio:</span>
                                    <span className="font-mono text-muted-foreground">
                                        {formatAspectRatio(originalDimensions)}
                                    </span>
                                </div>
                            </div>
                            {targetDimensions && (
                                <div className="space-y-1 border-t border-border pt-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Target:</span>
                                        <span className="font-medium text-primary">
                                            {targetDimensions.width} × {targetDimensions.height} px
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Aspect Ratio:</span>
                                        <span className="font-mono text-primary">
                                            {formatAspectRatio(targetDimensions)}
                                        </span>
                                    </div>
                                    {originalDimensions && (
                                        <div className="flex items-center justify-between text-xs pt-1">
                                            <span className="text-muted-foreground">Expansion:</span>
                                            <span className="font-medium text-muted-foreground">
                                                {targetDimensions.width > originalDimensions.width &&
                                                    targetDimensions.height > originalDimensions.height
                                                    ? 'Width & Height'
                                                    : targetDimensions.width > originalDimensions.width
                                                        ? 'Width Only'
                                                        : 'Height Only'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Expand Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={handleExpand}
                                disabled={processingState.isProcessing || (!selectedPreset && !useCustomDimensions)}
                                className="w-full"
                                aria-label={useCustomDimensions ? "Expand canvas to custom dimensions" : "Expand canvas to selected aspect ratio"}
                                aria-describedby="expand-button-description"
                                aria-busy={processingState.isProcessing}
                            >
                                {processingState.isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Maximize2 className="mr-2 h-4 w-4" aria-hidden="true" />
                                        Expand Canvas
                                    </>
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>AI-generated expansion to fill new canvas areas</p>
                        </TooltipContent>
                    </Tooltip>
                    <p id="expand-button-description" className="sr-only">
                        {useCustomDimensions
                            ? "Expands the canvas to the custom dimensions you specified"
                            : "Expands the canvas to the selected aspect ratio, intelligently filling new areas"}
                    </p>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}

export default CanvasExpander;
