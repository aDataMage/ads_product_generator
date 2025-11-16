/**
 * Standard Mode Component
 * 
 * Redesigned professional interface with centered layout
 * - Generated image displayed at top
 * - Main input centered below
 * - Preset buttons in a clean grid
 * - Refine image functionality
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { generateImage, ApiError } from '../lib/api';
import { getAnimationDuration } from '../lib/utils';
import { saveStandardModeState, loadStandardModeState } from '../lib/storage';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Sparkles, RefreshCw, Download, Upload, X, Palette, Edit } from 'lucide-react';
import { STYLE_PRESETS } from '../constants/presets';
import { useImageEditor } from '../hooks/useImageEditor';
import { useToast } from '../hooks/useToast';

interface StandardModeState {
    userPrompt: string;
    selectedPreset: string | null;
    referenceImage: string | null;
    isLoading: boolean;
    generatedImageUrl: string | null;
    error: string | null;
    isRefining: boolean;
    isPresetDialogOpen: boolean;
}

export function StandardMode() {
    const [state, setState] = useState<StandardModeState>(() => {
        // Load saved state from localStorage on mount
        const saved = loadStandardModeState();
        return {
            userPrompt: saved?.userPrompt || '',
            selectedPreset: saved?.presetName || null,
            referenceImage: saved?.referenceImagePreview || null,
            isLoading: false,
            generatedImageUrl: null,
            error: null,
            isRefining: false,
            isPresetDialogOpen: false,
        };
    });

    // Image editor hook for history tracking
    const {
        setOriginalImage,
    } = useImageEditor();

    // Toast hook for notifications
    const { toast } = useToast();

    // Initialize original image when generatedImageUrl changes
    useEffect(() => {
        if (state.generatedImageUrl) {
            setOriginalImage(state.generatedImageUrl);
        }
    }, [state.generatedImageUrl, setOriginalImage]);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        saveStandardModeState({
            userPrompt: state.userPrompt,
            presetName: state.selectedPreset,
            referenceImageBase64: state.referenceImage ? state.referenceImage.split(',')[1] : null,
            referenceImagePreview: state.referenceImage,
        });
    }, [state.userPrompt, state.selectedPreset, state.referenceImage]);

    const handlePromptChange = (value: string) => {
        setState(prev => ({ ...prev, userPrompt: value }));
    };

    const handlePresetSelect = (presetId: string) => {
        setState(prev => ({ ...prev, selectedPreset: presetId, isPresetDialogOpen: false }));
    };

    const getSelectedPresetLabel = () => {
        const preset = STYLE_PRESETS.find(p => p.value === state.selectedPreset);
        return preset ? preset.label : 'Select a preset';
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setState(prev => ({ ...prev, referenceImage: base64 }));
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveReference = () => {
        setState(prev => ({ ...prev, referenceImage: null }));
    };

    const handleGenerate = async (isRefine: boolean = false) => {
        if (!state.userPrompt.trim() || state.userPrompt.length < 3) {
            setState(prev => ({ ...prev, error: 'Please enter at least 3 characters' }));
            return;
        }

        if (!state.selectedPreset) {
            setState(prev => ({ ...prev, error: 'Please select a style preset' }));
            return;
        }

        setState(prev => ({
            ...prev,
            isLoading: true,
            isRefining: isRefine,
            error: null,
        }));

        try {
            const response = await generateImage({
                user_prompt: state.userPrompt,
                preset_name: state.selectedPreset,
                reference_image_base64: state.referenceImage || undefined,
            });

            if (response.success && response.final_image_url) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    isRefining: false,
                    generatedImageUrl: response.final_image_url!,
                    error: null,
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    isRefining: false,
                    error: response.error || 'Image generation failed. Please try again.',
                }));
            }
        } catch (error) {
            let errorMessage = 'An unexpected error occurred. Please try again.';
            if (error instanceof ApiError) {
                errorMessage = error.message;
            }

            setState(prev => ({
                ...prev,
                isLoading: false,
                isRefining: false,
                error: errorMessage,
            }));
        }
    };

    const handleDownload = () => {
        const imageUrl = state.generatedImageUrl;
        if (!imageUrl) return;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `generated-image-${timestamp}.jpg`;

        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            variant: 'success',
            title: 'Download started',
            description: 'Downloading generated image',
        });
    };

    const navigate = useNavigate();
    const location = useLocation();



    // Navigate to dedicated edit page
    // Requirement 1.1, 1.2, 1.3: Navigate to /edit with image URL
    const handleNavigateToEdit = () => {
        if (!state.generatedImageUrl) {
            toast({
                title: 'No image to edit',
                description: 'Please generate an image first.',
                variant: 'destructive',
            });
            return;
        }

        console.log('=== NAVIGATING TO EDIT PAGE ===');
        console.log('Image URL:', state.generatedImageUrl);
        console.log('Original URL:', state.generatedImageUrl);

        navigate('/edit', {
            state: {
                imageUrl: state.generatedImageUrl,
                originalImageUrl: state.generatedImageUrl,
                fromRoute: location.pathname,
            }
        });
    };




    const canGenerate = state.userPrompt.length >= 3 && state.selectedPreset && !state.isLoading;

    return (
        <motion.main
            id="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: getAnimationDuration(0.5), ease: 'easeOut' }}
            className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
        >
            <div className="space-y-8">
                {/* Generated Image Section */}
                {state.generatedImageUrl && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: getAnimationDuration(0.5) }}
                        className="w-full space-y-6"
                    >
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="relative group">
                                    <img
                                        src={state.generatedImageUrl || ''}
                                        alt="Generated product image"
                                        className="w-full h-auto"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            onClick={handleDownload}
                                            className="gap-2"
                                        >
                                            <Download className="h-5 w-5" />
                                            Download
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            onClick={() => handleGenerate(true)}
                                            disabled={state.isLoading}
                                            className="gap-2"
                                        >
                                            <RefreshCw className="h-5 w-5" />
                                            Refine
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            onClick={handleNavigateToEdit}
                                            className="gap-2"
                                        >
                                            <Edit className="h-5 w-5" />
                                            Edit Image
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                    </motion.div>
                )}

                {/* Main Input Section */}
                <div className="w-full max-w-3xl mx-auto space-y-6">
                    {/* Product Description */}
                    <div className="space-y-3">
                        <Label htmlFor="product-description" className="text-lg font-semibold">
                            Describe Your Product
                        </Label>
                        <Textarea
                            id="product-description"
                            placeholder="e.g., A sleek smartphone with a metallic finish on a minimalist desk..."
                            value={state.userPrompt}
                            onChange={(e) => handlePromptChange(e.target.value)}
                            className="min-h-[120px] text-base resize-none"
                            disabled={state.isLoading}
                        />
                        <p className="text-sm text-muted-foreground">
                            {state.userPrompt.length} / 500 characters
                        </p>
                    </div>

                    {/* Reference Image Upload */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">
                            Reference Image (Optional)
                        </Label>
                        {state.referenceImage ? (
                            <div className="relative inline-block">
                                <img
                                    src={state.referenceImage}
                                    alt="Reference"
                                    className="h-32 w-auto rounded-lg border"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                    onClick={handleRemoveReference}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="file"
                                    id="reference-upload"
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={state.isLoading}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => document.getElementById('reference-upload')?.click()}
                                    disabled={state.isLoading}
                                    className="gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    Upload Reference Image
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Style Preset Selector */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">
                            Style Preset
                        </Label>
                        <Dialog open={state.isPresetDialogOpen} onOpenChange={(open: boolean) => setState(prev => ({ ...prev, isPresetDialogOpen: open }))}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    disabled={state.isLoading}
                                    className="w-full justify-between h-auto py-3 px-4"
                                >
                                    <span className="flex items-center gap-2">
                                        <Palette className="h-4 w-4" />
                                        {getSelectedPresetLabel()}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {state.selectedPreset ? 'Change' : 'Choose'}
                                    </span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Choose a Style Preset</DialogTitle>
                                    <DialogDescription>
                                        Select a style preset to define the look and feel of your generated image
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                    {STYLE_PRESETS.map((preset) => (
                                        <Button
                                            key={preset.value}
                                            variant={state.selectedPreset === preset.value ? "default" : "outline"}
                                            onClick={() => handlePresetSelect(preset.value)}
                                            className="h-auto py-4 px-4 flex flex-col items-start gap-2 text-left"
                                        >
                                            <span className="font-semibold text-base">{preset.label}</span>
                                            <span className="text-xs opacity-80 text-left">
                                                {preset.description}
                                            </span>
                                        </Button>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Error Display */}
                    {state.error && (
                        <Alert variant="destructive">
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Generate Button */}
                    <div className="flex justify-center pt-4">
                        <Button
                            size="lg"
                            onClick={() => handleGenerate(false)}
                            disabled={!canGenerate}
                            className="gap-2 px-8 py-6 text-lg"
                        >
                            {state.isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    {state.isRefining ? 'Refining...' : 'Generating...'}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    Generate Image
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Loading Message */}
                    {state.isLoading && (
                        <p className="text-center text-sm text-muted-foreground">
                            This may take up to 2 minutes. Please wait...
                        </p>
                    )}
                </div>
            </div>
        </motion.main>
    );
}
