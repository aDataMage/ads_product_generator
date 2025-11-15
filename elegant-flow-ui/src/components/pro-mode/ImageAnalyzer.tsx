import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { analyzeImage, ApiError } from "@/lib/api";
import type { StructuredPrompt } from "@/lib/types";

interface ImageAnalyzerProps {
    onAnalysisComplete: (structuredPrompt: StructuredPrompt) => void;
}

/**
 * ImageAnalyzer Component
 * 
 * Allows users to upload an image and get back a structured prompt
 * that auto-fills the Pro Mode form.
 */
export function ImageAnalyzer({ onAnalysisComplete }: ImageAnalyzerProps) {
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file (JPEG, PNG, etc.)');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Image file is too large. Please select an image under 10MB.');
            return;
        }

        setError(null);
        setIsAnalyzing(true);

        try {
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Convert to base64 for API
            const base64 = await fileToBase64(file);

            // Remove data URL prefix
            const base64Data = base64.split(',')[1];

            // Call API to analyze image
            const result = await analyzeImage(base64Data);

            if (result.success && result.structured_prompt) {
                // Add empty id fields to objects for client-side tracking
                const promptWithIds = {
                    ...result.structured_prompt,
                    objects: result.structured_prompt.objects.map((obj: any) => ({
                        ...obj,
                        id: crypto.randomUUID()
                    }))
                };

                onAnalysisComplete(promptWithIds);
            } else {
                setError(result.error || 'Failed to analyze image');
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred while analyzing the image.');
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Image Analysis
                </CardTitle>
                <CardDescription>
                    Upload a product image to automatically generate a structured prompt
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isAnalyzing}
                />

                {previewUrl && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                        <img
                            src={previewUrl}
                            alt="Uploaded image preview"
                            className="w-full h-full object-contain bg-muted"
                        />
                    </div>
                )}

                <Button
                    onClick={handleButtonClick}
                    disabled={isAnalyzing}
                    className="w-full min-h-[44px]"
                    variant={previewUrl ? "outline" : "default"}
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing Image...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            {previewUrl ? 'Upload Different Image' : 'Upload Image to Analyze'}
                        </>
                    )}
                </Button>

                {isAnalyzing && (
                    <Alert>
                        <AlertDescription className="text-sm">
                            Analyzing your image with AI... This may take up to 30 seconds.
                        </AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription className="text-sm">
                            <strong>Error:</strong> {error}
                        </AlertDescription>
                    </Alert>
                )}

                <p className="text-xs text-muted-foreground">
                    Supported formats: JPEG, PNG, WebP. Maximum file size: 10MB.
                    The AI will analyze the image and populate all form fields automatically.
                </p>
            </CardContent>
        </Card>
    );
}
