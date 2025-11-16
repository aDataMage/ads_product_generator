/**
 * EnhancementEditor Component
 * 
 * Provides tools for image enhancement:
 * - Enhance image quality (brightness, contrast, sharpness)
 * - Upscale resolution (2x, 4x)
 * 
 * Requirements: Task 4.1 - Enhancement Controls
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
import { Loader2, CheckCircle2, AlertCircle, Sparkles, Maximize2, Info, ArrowLeftRight, Download } from "lucide-react";
import { enhanceImage, upscaleImage, ApiError } from "../lib/api";
import { ImageComparisonSlider } from "./ImageComparisonSlider";

interface EnhancementEditorProps {
    /** URL of the image to edit */
    imageUrl: string;
    /** Callback when editing operation completes */
    onEditComplete: (editedImageUrl: string, operationType: 'enhance' | 'upscale', params: Record<string, any>) => void;
    /** Callback when editing operation starts */
    onEditStart?: (operationType: string) => void;
    /** Callback when editing operation fails */
    onError: (error: string) => void;
}

type OperationType = 'enhance' | 'upscale-2x' | 'upscale-4x' | null;

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

interface FileSizeInfo {
    bytes: number;
    formatted: string;
}

/**
 * Format bytes to human-readable file size
 */
function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
}

/**
 * Check if file size is considered large (> 5MB)
 */
function isLargeFile(bytes: number): boolean {
    return bytes > 5 * 1024 * 1024; // 5MB threshold
}

/**
 * EnhancementEditor component
 * 
 * Allows users to enhance image quality
 */
export function EnhancementEditor({
    imageUrl,
    onEditComplete,
    onEditStart,
    onError,
}: EnhancementEditorProps) {
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
    const [upscaledDimensions, setUpscaledDimensions] = useState<ImageDimensions | null>(null);
    const [fileSize, setFileSize] = useState<FileSizeInfo | null>(null);
    const [showComparison, setShowComparison] = useState<boolean>(false);

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

    // Handle enhance quality operation
    const handleEnhanceQuality = async () => {
        // Clear previous feedback
        setFeedbackState({ type: null, message: '', operation: null });

        // Notify parent that operation is starting
        if (onEditStart) {
            onEditStart('enhance');
        }

        updateProcessingState({
            isProcessing: true,
            operation: 'enhance',
            progress: 0,
            statusMessage: 'Analyzing image...'
        });

        const progressInterval = simulateProgress('enhance');

        try {
            updateProcessingState({ statusMessage: 'Enhancing image quality...' });

            const result = await enhanceImage({
                image: imageUrl
            });

            clearInterval(progressInterval);
            updateProcessingState({ progress: 100, statusMessage: 'Complete!' });

            if (result.success && result.result_url) {
                const resultUrl = result.result_url;

                // Update preview
                setPreviewImageUrl(resultUrl);

                // Update file size if available
                if (result.file_size_bytes) {
                    setFileSize({
                        bytes: result.file_size_bytes,
                        formatted: formatFileSize(result.file_size_bytes)
                    });
                }

                // Show success feedback
                setFeedbackState({
                    type: 'success',
                    message: 'Image quality enhanced successfully!',
                    operation: 'enhance'
                });

                setTimeout(() => onEditComplete(resultUrl, 'enhance', {}), 500);
            } else {
                const errorMsg = result.error || "Failed to enhance image quality";
                setFeedbackState({
                    type: 'error',
                    message: errorMsg,
                    operation: 'enhance'
                });
                onError(errorMsg);
            }
        } catch (error) {
            clearInterval(progressInterval);
            const errorMsg = error instanceof ApiError
                ? error.message
                : (error instanceof Error ? error.message : "Failed to enhance image quality");

            setFeedbackState({
                type: 'error',
                message: errorMsg,
                operation: 'enhance'
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

    // Handle upscale resolution operation
    const handleUpscale = async (scaleFactor: 2 | 4) => {
        // Clear previous feedback
        setFeedbackState({ type: null, message: '', operation: null });

        const operation: OperationType = scaleFactor === 2 ? 'upscale-2x' : 'upscale-4x';

        // Notify parent that operation is starting
        if (onEditStart) {
            onEditStart('upscale');
        }

        updateProcessingState({
            isProcessing: true,
            operation,
            progress: 0,
            statusMessage: 'Preparing to upscale...'
        });

        const progressInterval = simulateProgress(operation);

        try {
            updateProcessingState({ statusMessage: `Upscaling image ${scaleFactor}x...` });

            const result = await upscaleImage({
                image: imageUrl,
                scale_factor: scaleFactor
            });

            clearInterval(progressInterval);
            updateProcessingState({ progress: 100, statusMessage: 'Complete!' });

            if (result.success && result.result_url) {
                const resultUrl = result.result_url;

                // Calculate new dimensions
                if (originalDimensions) {
                    const newDimensions = {
                        width: originalDimensions.width * scaleFactor,
                        height: originalDimensions.height * scaleFactor
                    };
                    setUpscaledDimensions(newDimensions);
                }

                // Update preview
                setPreviewImageUrl(resultUrl);

                // Update file size if available
                if (result.file_size_bytes) {
                    setFileSize({
                        bytes: result.file_size_bytes,
                        formatted: formatFileSize(result.file_size_bytes)
                    });
                }

                // Show success feedback with file size warning if large
                let successMessage = `Image upscaled ${scaleFactor}x successfully!`;
                if (result.file_size_bytes && isLargeFile(result.file_size_bytes)) {
                    successMessage += ` Note: Large file size (${formatFileSize(result.file_size_bytes)}) - download may take longer.`;
                }

                setFeedbackState({
                    type: 'success',
                    message: successMessage,
                    operation
                });

                setTimeout(() => onEditComplete(resultUrl, 'upscale', { scale_factor: scaleFactor }), 500);
            } else {
                const errorMsg = result.error || `Failed to upscale image ${scaleFactor}x`;
                setFeedbackState({
                    type: 'error',
                    message: errorMsg,
                    operation
                });
                onError(errorMsg);
            }
        } catch (error) {
            clearInterval(progressInterval);
            const errorMsg = error instanceof ApiError
                ? error.message
                : (error instanceof Error ? error.message : `Failed to upscale image ${scaleFactor}x`);

            setFeedbackState({
                type: 'error',
                message: errorMsg,
                operation
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

    // Handle download for original image
    const handleDownloadOriginal = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `original-image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Handle download for enhanced image
    const handleDownloadEnhanced = () => {
        if (!previewImageUrl) return;

        const link = document.createElement('a');
        link.href = previewImageUrl;
        link.download = `enhanced-image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <TooltipProvider>
            <Card className="w-full transition-smooth" role="region" aria-label="Image enhancement tools">
                <CardHeader className="px-4 sm:px-6">
                    <CardTitle id="enhancement-editor-title" className="text-lg sm:text-xl">Image Enhancement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 transition-smooth" aria-labelledby="enhancement-editor-title">
                    {/* Skeleton Loading State - Shows when processing */}
                    {processingState.isProcessing && !previewImageUrl && (
                        <div className="space-y-4 fade-in" role="region" aria-label="Loading preview">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-9 w-28" />
                            </div>
                            <Skeleton className="w-full aspect-video rounded-lg" />
                            <div className="grid grid-cols-2 gap-3">
                                <Skeleton className="h-20 rounded-lg" />
                                <Skeleton className="h-20 rounded-lg" />
                            </div>
                        </div>
                    )}

                    {/* Image Preview Section */}
                    {previewImageUrl && (
                        <div className="space-y-2 fade-in" role="region" aria-label="Image preview">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium transition-smooth" id="preview-heading">
                                    {showComparison ? 'Comparison' : 'Preview'}
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowComparison(!showComparison)}
                                    aria-label={showComparison ? "Show preview only" : "Show comparison view"}
                                    aria-pressed={showComparison}
                                    className="transition-smooth"
                                >
                                    <ArrowLeftRight className="mr-2 h-4 w-4" aria-hidden="true" />
                                    {showComparison ? 'Show Preview' : 'Compare'}
                                </Button>
                            </div>

                            {showComparison ? (
                                <div className="space-y-2">
                                    <ImageComparisonSlider
                                        beforeImage={imageUrl}
                                        afterImage={previewImageUrl}
                                        beforeAlt="Original image"
                                        afterAlt="Enhanced image"
                                        initialPosition={50}
                                    />
                                    <p className="text-xs text-muted-foreground text-center">
                                        Drag the slider to compare original vs enhanced
                                    </p>

                                    {/* Resolution info for comparison view */}
                                    {originalDimensions && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-3 bg-muted rounded-lg" role="region" aria-label="Resolution comparison">
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-muted-foreground">Original</p>
                                                <p className="text-sm font-semibold">
                                                    {originalDimensions.width} × {originalDimensions.height} px
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-muted-foreground">Enhanced</p>
                                                <p className="text-sm font-semibold text-primary">
                                                    {upscaledDimensions
                                                        ? `${upscaledDimensions.width} × ${upscaledDimensions.height} px`
                                                        : `${originalDimensions.width} × ${originalDimensions.height} px`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Download buttons for both versions */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3" role="group" aria-label="Download options">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDownloadOriginal}
                                            className="w-full"
                                            aria-label="Download original image"
                                        >
                                            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                                            Download Original
                                        </Button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={handleDownloadEnhanced}
                                            className="w-full"
                                            aria-label="Download enhanced image"
                                        >
                                            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                                            Download Enhanced
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="relative w-full rounded-lg overflow-hidden border border-border bg-muted">
                                        <img
                                            src={previewImageUrl}
                                            alt="Enhanced image preview"
                                            className="w-full h-auto"
                                            loading="lazy"
                                            aria-describedby="preview-description"
                                        />
                                    </div>
                                    <p id="preview-description" className="text-xs text-muted-foreground text-center">
                                        Preview of your enhanced image
                                    </p>
                                </>
                            )}
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
                            aria-label={`Processing ${processingState.operation} operation`}
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

                    {/* Enhance Quality Section */}
                    <div className="space-y-2" role="group" aria-labelledby="enhance-quality-heading">
                        <h3 className="text-sm font-medium" id="enhance-quality-heading">Enhance Quality</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                            Automatically improve brightness, contrast, and sharpness
                        </p>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handleEnhanceQuality}
                                    disabled={processingState.isProcessing}
                                    className="w-full"
                                    aria-label="Enhance image quality"
                                    aria-describedby="enhance-quality-description"
                                    aria-busy={processingState.isProcessing && processingState.operation === 'enhance'}
                                >
                                    {processingState.isProcessing && processingState.operation === 'enhance' ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                                            Enhance Quality
                                        </>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Automatically improve brightness, contrast, and sharpness</p>
                            </TooltipContent>
                        </Tooltip>
                        <p id="enhance-quality-description" className="sr-only">
                            Automatically enhances image quality by improving brightness, contrast, and sharpness
                        </p>
                    </div>

                    {/* Upscale Resolution Section */}
                    <div className="space-y-2" role="group" aria-labelledby="upscale-heading">
                        <h3 className="text-sm font-medium" id="upscale-heading">Upscale Resolution</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                            Increase image resolution for higher quality output
                        </p>

                        {/* File Size Warning */}
                        <Alert className="mb-3 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <AlertDescription className="text-xs text-blue-800 dark:text-blue-200">
                                Upscaling increases file size significantly. 4x upscaling can result in very large files that may take longer to download.
                            </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => handleUpscale(2)}
                                        disabled={processingState.isProcessing}
                                        variant="outline"
                                        className="w-full"
                                        aria-label="Upscale image 2x"
                                        aria-describedby="upscale-2x-description"
                                        aria-busy={processingState.isProcessing && processingState.operation === 'upscale-2x'}
                                    >
                                        {processingState.isProcessing && processingState.operation === 'upscale-2x' ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Maximize2 className="mr-2 h-4 w-4" aria-hidden="true" />
                                                Upscale 2x
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Double the image resolution for higher quality</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => handleUpscale(4)}
                                        disabled={processingState.isProcessing}
                                        variant="outline"
                                        className="w-full"
                                        aria-label="Upscale image 4x"
                                        aria-describedby="upscale-4x-description"
                                        aria-busy={processingState.isProcessing && processingState.operation === 'upscale-4x'}
                                    >
                                        {processingState.isProcessing && processingState.operation === 'upscale-4x' ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Maximize2 className="mr-2 h-4 w-4" aria-hidden="true" />
                                                Upscale 4x
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Quadruple the image resolution for print quality</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <p id="upscale-2x-description" className="sr-only">
                            Doubles the image resolution (2x scale factor)
                        </p>
                        <p id="upscale-4x-description" className="sr-only">
                            Quadruples the image resolution (4x scale factor)
                        </p>

                        {/* Dimension and File Size Information */}
                        {(originalDimensions || fileSize) && (
                            <div className="mt-4 p-3 bg-muted rounded-lg space-y-2" role="region" aria-label="Image information">
                                {originalDimensions && (
                                    <>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Original:</span>
                                            <span className="font-medium">
                                                {originalDimensions.width} × {originalDimensions.height} px
                                            </span>
                                        </div>
                                        {upscaledDimensions && (
                                            <div className="flex items-center justify-between text-sm border-t border-border pt-2">
                                                <span className="text-muted-foreground">Upscaled:</span>
                                                <span className="font-medium text-primary">
                                                    {upscaledDimensions.width} × {upscaledDimensions.height} px
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}
                                {fileSize && (
                                    <div className={`flex items-center justify-between text-sm ${originalDimensions ? 'border-t border-border pt-2' : ''}`}>
                                        <span className="text-muted-foreground">File Size:</span>
                                        <span className={`font-medium ${isLargeFile(fileSize.bytes) ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                                            {fileSize.formatted}
                                            {isLargeFile(fileSize.bytes) && (
                                                <span className="ml-1 text-xs" title="Large file - download may take longer">
                                                    ⚠️
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}

export default EnhancementEditor;
