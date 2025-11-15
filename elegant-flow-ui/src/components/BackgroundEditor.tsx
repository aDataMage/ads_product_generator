/**
 * BackgroundEditor Component
 * 
 * Provides tools for background manipulation:
 * - Remove background
 * - Replace background with custom prompts or solid colors
 * - Blur background with adjustable strength
 * 
 * Requirements: Task 2.1 - Background Editor Component
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
    Loader2,
    CheckCircle2,
    AlertCircle,
    Square,
    Layers,
    Trees,
    Waves,
    Building2,
    Sparkles,
    Shapes,
    Grid,
    Circle,
    type LucideIcon
} from "lucide-react";
import { removeBackground, replaceBackground, blurBackground, ApiError } from "../lib/api";
import {
    BACKGROUND_CATEGORIES,
    BACKGROUND_CATEGORY_NAMES,
    getPresetsByCategory,
    type BackgroundPreset
} from "../constants/backgroundPresets";

interface BackgroundEditorProps {
    /** URL of the image to edit */
    imageUrl: string;
    /** Callback when editing operation completes */
    onEditComplete: (editedImageUrl: string) => void;
    /** Callback when editing operation fails */
    onError: (error: string) => void;
}

type OperationType = 'remove' | 'replace' | 'blur' | null;

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

/**
 * Map icon names to Lucide icon components
 */
const ICON_MAP: Record<string, LucideIcon> = {
    Square,
    Layers,
    Trees,
    Waves,
    Building2,
    Sparkles,
    Shapes,
    Grid,
    Circle
};

/**
 * Get icon component by name
 */
function getIconComponent(iconName?: string): LucideIcon | null {
    if (!iconName || !ICON_MAP[iconName]) {
        return null;
    }
    return ICON_MAP[iconName];
}

/**
 * BackgroundEditor component
 * 
 * Allows users to manipulate image backgrounds through various operations
 */
export function BackgroundEditor({
    imageUrl,
    onEditComplete,
    onError,
}: BackgroundEditorProps) {
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
    const [backgroundPrompt, setBackgroundPrompt] = useState("");
    const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
    const [blurStrength, setBlurStrength] = useState(50);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [selectedPreset, setSelectedPreset] = useState<BackgroundPreset | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<BackgroundPreset['category']>('studio');

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

    // Handle preset selection
    const handlePresetSelect = (preset: BackgroundPreset) => {
        setSelectedPreset(preset);

        // Apply preset values to form
        if (preset.prompt) {
            setBackgroundPrompt(preset.prompt);
        }
        if (preset.color) {
            setBackgroundColor(preset.color);
        }
    };

    // Handle remove background operation
    const handleRemoveBackground = async () => {
        // Clear previous feedback
        setFeedbackState({ type: null, message: '', operation: null });

        updateProcessingState({
            isProcessing: true,
            operation: 'remove',
            progress: 0,
            statusMessage: 'Analyzing image...'
        });

        const progressInterval = simulateProgress('remove');

        try {
            updateProcessingState({ statusMessage: 'Removing background...' });

            const result = await removeBackground({
                image: imageUrl
            });

            clearInterval(progressInterval);
            updateProcessingState({ progress: 100, statusMessage: 'Complete!' });

            if (result.success && result.result_url) {
                const resultUrl = result.result_url;

                // Update preview
                setPreviewImageUrl(resultUrl);

                // Show success feedback
                setFeedbackState({
                    type: 'success',
                    message: 'Background removed successfully!',
                    operation: 'remove'
                });

                setTimeout(() => onEditComplete(resultUrl), 500);
            } else {
                const errorMsg = result.error || "Failed to remove background";
                setFeedbackState({
                    type: 'error',
                    message: errorMsg,
                    operation: 'remove'
                });
                onError(errorMsg);
            }
        } catch (error) {
            clearInterval(progressInterval);
            const errorMsg = error instanceof ApiError
                ? error.message
                : (error instanceof Error ? error.message : "Failed to remove background");

            setFeedbackState({
                type: 'error',
                message: errorMsg,
                operation: 'remove'
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

    // Handle replace background operation
    const handleReplaceBackground = async () => {
        if (!backgroundPrompt.trim() && !backgroundColor) {
            const errorMsg = "Please enter a background description or select a color";
            setFeedbackState({
                type: 'error',
                message: errorMsg,
                operation: 'replace'
            });
            onError(errorMsg);
            return;
        }

        // Clear previous feedback
        setFeedbackState({ type: null, message: '', operation: null });

        updateProcessingState({
            isProcessing: true,
            operation: 'replace',
            progress: 0,
            statusMessage: 'Preparing replacement...'
        });

        const progressInterval = simulateProgress('replace');

        try {
            updateProcessingState({ statusMessage: 'Generating new background...' });

            const result = await replaceBackground({
                image: imageUrl,
                background_prompt: backgroundPrompt.trim() || undefined,
                background_color: backgroundColor || undefined
            });

            clearInterval(progressInterval);
            updateProcessingState({ progress: 100, statusMessage: 'Complete!' });

            if (result.success && result.result_url) {
                const resultUrl = result.result_url;

                // Update preview
                setPreviewImageUrl(resultUrl);

                // Show success feedback
                setFeedbackState({
                    type: 'success',
                    message: 'Background replaced successfully!',
                    operation: 'replace'
                });

                setTimeout(() => onEditComplete(resultUrl), 500);
            } else {
                const errorMsg = result.error || "Failed to replace background";
                setFeedbackState({
                    type: 'error',
                    message: errorMsg,
                    operation: 'replace'
                });
                onError(errorMsg);
            }
        } catch (error) {
            clearInterval(progressInterval);
            const errorMsg = error instanceof ApiError
                ? error.message
                : (error instanceof Error ? error.message : "Failed to replace background");

            setFeedbackState({
                type: 'error',
                message: errorMsg,
                operation: 'replace'
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

    // Handle blur background operation
    const handleBlurBackground = async () => {
        // Clear previous feedback
        setFeedbackState({ type: null, message: '', operation: null });

        updateProcessingState({
            isProcessing: true,
            operation: 'blur',
            progress: 0,
            statusMessage: 'Analyzing image...'
        });

        const progressInterval = simulateProgress('blur');

        try {
            updateProcessingState({ statusMessage: 'Applying blur effect...' });

            const result = await blurBackground({
                image: imageUrl,
                blur_strength: blurStrength
            });

            clearInterval(progressInterval);
            updateProcessingState({ progress: 100, statusMessage: 'Complete!' });

            if (result.success && result.result_url) {
                const resultUrl = result.result_url;

                // Update preview
                setPreviewImageUrl(resultUrl);

                // Show success feedback
                setFeedbackState({
                    type: 'success',
                    message: 'Background blur applied successfully!',
                    operation: 'blur'
                });

                setTimeout(() => onEditComplete(resultUrl), 500);
            } else {
                const errorMsg = result.error || "Failed to blur background";
                setFeedbackState({
                    type: 'error',
                    message: errorMsg,
                    operation: 'blur'
                });
                onError(errorMsg);
            }
        } catch (error) {
            clearInterval(progressInterval);
            const errorMsg = error instanceof ApiError
                ? error.message
                : (error instanceof Error ? error.message : "Failed to blur background");

            setFeedbackState({
                type: 'error',
                message: errorMsg,
                operation: 'blur'
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

    return (
        <Card className="w-full" role="region" aria-label="Background editing tools">
            <CardHeader>
                <CardTitle id="background-editor-title">Background Editor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6" aria-labelledby="background-editor-title">
                {/* Image Preview Section */}
                {previewImageUrl && (
                    <div className="space-y-2" role="region" aria-label="Image preview">
                        <h3 className="text-sm font-medium" id="preview-heading">Preview</h3>
                        <div className="relative w-full rounded-lg overflow-hidden border border-border bg-muted">
                            <img
                                src={previewImageUrl}
                                alt={`Edited image preview showing ${processingState.operation ? processingState.operation + ' background operation' : 'background editing result'}`}
                                className="w-full h-auto"
                                loading="lazy"
                                aria-describedby="preview-description"
                            />
                        </div>
                        <p id="preview-description" className="text-xs text-muted-foreground text-center">
                            Preview of your edited image
                        </p>
                    </div>
                )}

                {/* Success/Error Feedback - Shows after operation completes */}
                {feedbackState.type && (
                    <Alert
                        variant={feedbackState.type === 'error' ? 'destructive' : 'default'}
                        className={feedbackState.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}
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

                {/* Progress Indicator - Shows when any operation is processing */}
                {processingState.isProcessing && (
                    <div
                        className="space-y-2 p-4 bg-muted rounded-lg"
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

                {/* Remove Background Section */}
                <div className="space-y-2" role="group" aria-labelledby="remove-bg-heading">
                    <h3 className="text-sm font-medium" id="remove-bg-heading">Remove Background</h3>
                    <Button
                        onClick={handleRemoveBackground}
                        disabled={processingState.isProcessing}
                        className="w-full"
                        variant="outline"
                        aria-label="Remove background from image"
                        aria-describedby="remove-bg-description"
                        aria-busy={processingState.isProcessing && processingState.operation === 'remove'}
                    >
                        {processingState.isProcessing && processingState.operation === 'remove' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                Processing...
                            </>
                        ) : (
                            "Remove Background"
                        )}
                    </Button>
                    <p id="remove-bg-description" className="sr-only">
                        Removes the background from your image, creating a transparent background
                    </p>
                </div>

                {/* Replace Background Section */}
                <div className="space-y-2" role="group" aria-labelledby="replace-bg-heading">
                    <h3 className="text-sm font-medium" id="replace-bg-heading">Replace Background</h3>
                    <div className="space-y-3">
                        {/* Preset Category Tabs */}
                        <div>
                            <label className="text-xs text-muted-foreground block mb-2">
                                Choose a Preset Category
                            </label>
                            <div
                                className="flex gap-1 p-1 bg-muted rounded-lg"
                                role="tablist"
                                aria-label="Background preset categories"
                            >
                                {BACKGROUND_CATEGORIES.map((category) => (
                                    <button
                                        key={category}
                                        role="tab"
                                        aria-selected={selectedCategory === category}
                                        aria-controls={`${category}-presets`}
                                        id={`${category}-tab`}
                                        onClick={() => setSelectedCategory(category)}
                                        disabled={processingState.isProcessing}
                                        className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${selectedCategory === category
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {BACKGROUND_CATEGORY_NAMES[category]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preset Grid */}
                        <div
                            role="tabpanel"
                            id={`${selectedCategory}-presets`}
                            aria-labelledby={`${selectedCategory}-tab`}
                            className="space-y-2"
                        >
                            <label className="text-xs text-muted-foreground block">
                                Select a Preset
                            </label>
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                                {getPresetsByCategory(selectedCategory).map((preset) => {
                                    const IconComponent = getIconComponent(preset.icon);

                                    return (
                                        <button
                                            key={preset.id}
                                            onClick={() => handlePresetSelect(preset)}
                                            disabled={processingState.isProcessing}
                                            className={`p-3 text-left rounded-lg border-2 transition-all ${selectedPreset?.id === preset.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50 bg-background'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            aria-label={`Select ${preset.name} preset`}
                                            aria-pressed={selectedPreset?.id === preset.id}
                                        >
                                            <div className="space-y-1">
                                                {/* Visual indicator: color swatch or icon */}
                                                <div className="flex items-center justify-center w-full h-12 rounded border border-border mb-2">
                                                    {preset.color ? (
                                                        <div
                                                            className="w-full h-full rounded"
                                                            style={{ backgroundColor: preset.color }}
                                                            aria-hidden="true"
                                                        />
                                                    ) : IconComponent ? (
                                                        <IconComponent
                                                            className="w-6 h-6 text-muted-foreground"
                                                            aria-hidden="true"
                                                        />
                                                    ) : null}
                                                </div>
                                                <div className="text-xs font-medium">{preset.name}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-2">
                                                    {preset.description}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="background-prompt" className="text-xs text-muted-foreground block mb-1">
                                Custom Background Description {selectedPreset ? '(Override Preset)' : '(Optional)'}
                            </label>
                            <Input
                                id="background-prompt"
                                type="text"
                                placeholder={selectedPreset?.prompt || "e.g., white studio background with soft shadows"}
                                value={backgroundPrompt}
                                onChange={(e) => {
                                    setBackgroundPrompt(e.target.value);
                                }}
                                disabled={processingState.isProcessing}
                                aria-label="Enter custom background description"
                                aria-describedby="background-prompt-help"
                                aria-invalid={false}
                            />
                            <p id="background-prompt-help" className="text-xs text-muted-foreground mt-1">
                                {selectedPreset
                                    ? `Editing "${selectedPreset.name}" preset. Modify the prompt to customize it.`
                                    : 'Describe your own background or select a preset above'}
                            </p>
                        </div>

                        <div>
                            <label htmlFor="background-color" className="text-xs text-muted-foreground block mb-1">
                                Or choose a solid color
                            </label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    id="background-color"
                                    type="color"
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                    disabled={processingState.isProcessing}
                                    className="w-20 h-10 cursor-pointer"
                                    aria-label="Select background color"
                                    aria-describedby="background-color-value"
                                />
                                <span
                                    id="background-color-value"
                                    className="text-sm text-muted-foreground"
                                    aria-live="polite"
                                >
                                    {backgroundColor}
                                </span>
                            </div>
                        </div>

                        <Button
                            onClick={handleReplaceBackground}
                            disabled={processingState.isProcessing}
                            className="w-full"
                            aria-label="Replace background with custom description or color"
                            aria-describedby="replace-bg-description"
                            aria-busy={processingState.isProcessing && processingState.operation === 'replace'}
                        >
                            {processingState.isProcessing && processingState.operation === 'replace' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                    Processing...
                                </>
                            ) : (
                                "Replace Background"
                            )}
                        </Button>
                        <p id="replace-bg-description" className="sr-only">
                            Replaces the current background with either a custom generated background based on your description or a solid color
                        </p>
                    </div>
                </div>

                {/* Blur Background Section */}
                <div className="space-y-2" role="group" aria-labelledby="blur-bg-heading">
                    <h3 className="text-sm font-medium" id="blur-bg-heading">Blur Background</h3>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="blur-strength" className="text-xs text-muted-foreground block mb-2">
                                Blur Strength: <span aria-live="polite">{blurStrength}</span>
                            </label>
                            <input
                                id="blur-strength"
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={blurStrength}
                                onChange={(e) => setBlurStrength(Number(e.target.value))}
                                disabled={processingState.isProcessing}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                aria-label={`Adjust blur strength, current value ${blurStrength}`}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={blurStrength}
                                aria-valuetext={`${blurStrength} percent blur strength`}
                                aria-describedby="blur-strength-help"
                            />
                            <p id="blur-strength-help" className="sr-only">
                                Use arrow keys to adjust blur strength from 0 to 100. Higher values create stronger blur effects.
                            </p>
                        </div>

                        <Button
                            onClick={handleBlurBackground}
                            disabled={processingState.isProcessing}
                            className="w-full"
                            variant="outline"
                            aria-label={`Apply background blur with strength ${blurStrength}`}
                            aria-describedby="blur-bg-description"
                            aria-busy={processingState.isProcessing && processingState.operation === 'blur'}
                        >
                            {processingState.isProcessing && processingState.operation === 'blur' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                    Processing...
                                </>
                            ) : (
                                "Blur Background"
                            )}
                        </Button>
                        <p id="blur-bg-description" className="sr-only">
                            Applies a blur effect to the background while keeping the main subject in focus, creating depth of field
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default BackgroundEditor;
