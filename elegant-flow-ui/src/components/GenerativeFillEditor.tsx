import React, { useState, useEffect } from 'react';
import { MaskDrawingCanvas } from './MaskDrawingCanvas';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './ui/tooltip';
import { Loader2, Sparkles, ArrowLeftRight } from 'lucide-react';
import { generativeFill } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface GenerativeFillEditorProps {
    imageUrl: string;
    onResult: (resultUrl: string, refinedPrompt?: string) => void;
    onEditStart?: (operationType: string) => void;
    className?: string;
}

export const GenerativeFillEditor: React.FC<GenerativeFillEditorProps> = ({
    imageUrl,
    onResult,
    onEditStart,
    className = '',
}) => {
    const [maskBase64, setMaskBase64] = useState<string>('');
    const [prompt, setPrompt] = useState<string>('');
    const [negativePrompt, setNegativePrompt] = useState<string>('');
    const [version, setVersion] = useState<number>(2);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refinedPrompt, setRefinedPrompt] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [progressMessage, setProgressMessage] = useState<string>('');

    const handleMaskChange = (mask: string) => {
        setMaskBase64(mask);
    };

    // Progress simulation effect
    useEffect(() => {
        if (!isGenerating) {
            setProgress(0);
            setProgressMessage('');
            return;
        }

        // Simulate progress with realistic stages
        const stages = [
            { progress: 10, message: 'Preparing mask and image...', delay: 500 },
            { progress: 25, message: 'Sending request to AI...', delay: 2000 },
            { progress: 40, message: 'Processing generative fill...', delay: 5000 },
            { progress: 60, message: 'Generating content...', delay: 10000 },
            { progress: 75, message: 'Refining details...', delay: 15000 },
            { progress: 90, message: 'Finalizing image...', delay: 20000 },
        ];

        const timers: ReturnType<typeof setTimeout>[] = [];

        stages.forEach((stage) => {
            const timer = setTimeout(() => {
                setProgress(stage.progress);
                setProgressMessage(stage.message);
            }, stage.delay);
            timers.push(timer);
        });

        return () => {
            timers.forEach(timer => clearTimeout(timer));
        };
    }, [isGenerating]);

    const handleGenerate = async () => {
        // Validate inputs
        if (!maskBase64) {
            setError('Please draw a mask on the image first');
            return;
        }

        if (!prompt.trim()) {
            setError('Please enter a prompt describing what to generate');
            return;
        }

        setError(null);

        // Notify parent that operation is starting
        if (onEditStart) {
            onEditStart('generative-fill');
        }

        setIsGenerating(true);
        setRefinedPrompt(null);
        setProgress(0);
        setProgressMessage('Starting generation...');

        try {
            const result = await generativeFill({
                image: imageUrl,
                mask: maskBase64,
                prompt: prompt.trim(),
                negative_prompt: negativePrompt.trim() || undefined,
                version: version,
            });

            if (result.success && result.result_url) {
                setProgress(100);
                setProgressMessage('Complete!');
                setRefinedPrompt(result.refined_prompt || null);
                setResultUrl(result.result_url);
                onResult(result.result_url, result.refined_prompt);
            } else {
                setError(result.error || 'Generative fill failed');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <TooltipProvider>
            <div className={`flex flex-col gap-4 sm:gap-6 px-2 sm:px-0 transition-smooth ${className}`}>
                {/* Skeleton Loading State - Shows when generating */}
                {isGenerating && !resultUrl && (
                    <div className="space-y-4 fade-in" role="region" aria-label="Loading result">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="w-full aspect-video rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                )}

                {/* Mask Drawing Canvas */}
                {!isGenerating && (
                    <div className="transition-smooth">
                        <h3 className="text-base sm:text-lg font-semibold mb-2">Draw Mask</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                            Draw on the image to mark the areas you want to fill with generated content.
                        </p>
                        <MaskDrawingCanvas
                            imageUrl={imageUrl}
                            onMaskChange={handleMaskChange}
                        />
                    </div>
                )}

                {/* Prompt Inputs */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="gen-fill-prompt" className="block text-sm font-medium mb-2">
                            Prompt *
                        </label>
                        <Input
                            id="gen-fill-prompt"
                            type="text"
                            placeholder="e.g., add flowers around the product"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isGenerating}
                            aria-label="Generative fill prompt"
                            aria-required="true"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Describe what you want to generate in the masked area
                        </p>
                    </div>

                    <div>
                        <label htmlFor="gen-fill-negative-prompt" className="block text-sm font-medium mb-2">
                            Negative Prompt (Optional)
                        </label>
                        <Input
                            id="gen-fill-negative-prompt"
                            type="text"
                            placeholder="e.g., blurry, distorted, low quality"
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                            disabled={isGenerating}
                            aria-label="Negative prompt"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Describe what you want to avoid in the generation
                        </p>
                    </div>

                    <div>
                        <label htmlFor="gen-fill-version" className="block text-sm font-medium mb-2">
                            API Version
                        </label>
                        <select
                            id="gen-fill-version"
                            value={version}
                            onChange={(e) => setVersion(Number(e.target.value))}
                            disabled={isGenerating}
                            className="w-full px-3 py-2 border rounded-md bg-background"
                            aria-label="API version selector"
                        >
                            <option value={1}>Version 1</option>
                            <option value={2}>Version 2 (with refined prompt)</option>
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">
                            Version 2 provides a refined prompt showing how the AI interpreted your request
                        </p>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <Alert variant="destructive" className="fade-in">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Refined Prompt Display */}
                {refinedPrompt && (
                    <Alert className="fade-in">
                        <Sparkles className="h-4 w-4" />
                        <AlertTitle>Refined Prompt</AlertTitle>
                        <AlertDescription>{refinedPrompt}</AlertDescription>
                    </Alert>
                )}

                {/* Generate Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || !maskBase64 || !prompt.trim()}
                            size="lg"
                            className="w-full"
                            aria-label="Generate fill"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5 mr-2" />
                                    Generate Fill
                                </>
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Fill masked areas with AI-generated content based on your prompt</p>
                    </TooltipContent>
                </Tooltip>

                {/* Loading State with Progress */}
                {isGenerating && (
                    <div className="space-y-3 fade-in" role="status" aria-live="polite">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">
                                    {progressMessage}
                                </span>
                                <span className="text-muted-foreground font-mono">
                                    {progress}%
                                </span>
                            </div>
                            <Progress
                                value={progress}
                                className="h-2"
                                aria-label={`Generation progress: ${progress}%`}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            This usually takes 30-60 seconds. Please wait...
                        </p>
                    </div>
                )}

                {/* Before/After Comparison */}
                {resultUrl && (
                    <div className="space-y-4 fade-in">
                        <div className="flex items-center justify-center gap-2 text-sm font-medium">
                            <ArrowLeftRight className="h-4 w-4" />
                            <span>Before & After Comparison</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 transition-smooth">
                            {/* Before Image */}
                            <div className="space-y-2 transition-smooth">
                                <p className="text-sm font-medium text-center">Before</p>
                                <div className="relative rounded-lg overflow-hidden border-2 border-muted transition-smooth">
                                    <img
                                        src={imageUrl}
                                        alt="Original image before generative fill"
                                        className="w-full h-auto transition-opacity"
                                    />
                                </div>
                            </div>

                            {/* After Image */}
                            <div className="space-y-2 transition-smooth">
                                <p className="text-sm font-medium text-center">After</p>
                                <div className="relative rounded-lg overflow-hidden border-2 border-primary transition-smooth">
                                    <img
                                        src={resultUrl}
                                        alt="Image after generative fill"
                                        className="w-full h-auto transition-opacity"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
};
