import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SceneStyleSection } from "./pro-mode/SceneStyleSection";
import { LightingSection } from "./pro-mode/LightingSection";
import { AestheticsSection } from "./pro-mode/AestheticsSection";
import { CameraSection } from "./pro-mode/CameraSection";
import { ObjectBuilderSection } from "./pro-mode/ObjectBuilderSection";
import { PhotographyModeSection } from "./pro-mode/PhotographyModeSection";
import { ImageAnalyzer } from "./pro-mode/ImageAnalyzer";
import { generateProMode, ApiError } from "@/lib/api";
import type { StructuredPrompt, ObjectDefinition } from "@/lib/types";
import { getModeById } from "@/constants/photographyModes";
import { saveProModeState, loadProModeState } from "@/lib/storage";
import "../styles/pro-mode-accessibility.css";

/**
 * Validation errors interface for tracking field-level errors
 * Requirement 8.1: Inline validation error messages for empty fields
 */
interface ValidationErrors {
    short_description?: string;
    background_setting?: string;
    style_medium?: string;
    artistic_style?: string;
    context?: string;
    lighting?: {
        conditions?: string;
        direction?: string;
        shadows?: string;
    };
    aesthetics?: {
        composition?: string;
        color_scheme?: string;
        mood_atmosphere?: string;
    };
    photographic_characteristics?: {
        camera_angle?: string;
        lens_focal_length?: string;
        depth_of_field?: string;
        focus?: string;
    };
}

/**
 * ProModeForm Component
 * 
 * Main container component for Pro Mode - Structured Prompt Builder
 * Uses a wizard-style tab navigation with Next/Previous buttons
 * 
 * Requirements:
 * - 1.1: Provide granular control over image generation parameters
 * - 1.2: Organize controls into logical sections
 * - 1.3: Support progressive disclosure through wizard steps
 * - 1.4: Maintain state across all form fields
 * - 1.5: Generate images using structured prompts
 */
export function ProModeForm() {
    // Load saved state from localStorage on mount
    const savedState = loadProModeState();

    // Requirement 1.4: State management for structured prompt
    const [structuredPrompt, setStructuredPrompt] = useState<StructuredPrompt>(
        savedState?.structuredPrompt || {
            short_description: "",
            background_setting: "",
            style_medium: "",
            artistic_style: "",
            context: "",
            lighting: {
                conditions: "",
                direction: "",
                shadows: "",
            },
            aesthetics: {
                composition: "",
                color_scheme: "",
                mood_atmosphere: "",
            },
            photographic_characteristics: {
                camera_angle: "",
                lens_focal_length: "",
                depth_of_field: "",
                focus: "",
            },
            objects: [],
        }
    );

    // Photography mode state
    const [photographyMode, setPhotographyMode] = useState<string | null>(
        savedState?.photographyMode || null
    );

    // Wizard navigation state
    const [currentStep, setCurrentStep] = useState(savedState?.currentStep || 0);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        saveProModeState({
            structuredPrompt,
            photographyMode,
            currentStep,
        });
    }, [structuredPrompt, photographyMode, currentStep]);

    // Generation state
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [lastPayload, setLastPayload] = useState<any>(null);
    const [retryCount, setRetryCount] = useState(0);

    // Handler for image analysis completion
    const handleImageAnalysis = (analyzedPrompt: StructuredPrompt) => {
        setStructuredPrompt(analyzedPrompt);
        // Move to next step after analysis
        setCurrentStep(1);
    };

    // Define wizard steps
    const steps = [
        {
            id: "analyze",
            title: "Image Analysis",
            description: "Upload an image to auto-generate prompt (optional)",
        },
        {
            id: "scene",
            title: "Scene & Style",
            description: "Define the overall scene and artistic direction",
        },
        {
            id: "photography",
            title: "Photography Mode",
            description: "Select professional photography style (optional)",
        },
        {
            id: "lighting",
            title: "Lighting",
            description: "Configure lighting conditions and shadows",
        },
        {
            id: "aesthetics",
            title: "Aesthetics",
            description: "Set composition, colors, and mood",
        },
        {
            id: "camera",
            title: "Camera",
            description: "Define camera angle, lens, and focus",
        },
        {
            id: "objects",
            title: "Objects",
            description: "Add and configure objects in the scene",
        },
        {
            id: "review",
            title: "Review & Generate",
            description: "Review your settings and generate the image",
        },
    ];

    // Requirement 1.4: State update handlers for top-level fields
    const handleFieldChange = (field: keyof StructuredPrompt, value: string) => {
        setStructuredPrompt((prev) => ({
            ...prev,
            [field]: value,
        }));
        // Clear validation error for this field
        setValidationErrors((prev) => ({
            ...prev,
            [field]: undefined,
        }));
    };

    // Requirement 1.4: State update handler for lighting nested object
    const handleLightingChange = (field: keyof StructuredPrompt["lighting"], value: string) => {
        setStructuredPrompt((prev) => ({
            ...prev,
            lighting: {
                ...prev.lighting,
                [field]: value,
            },
        }));
        setValidationErrors((prev) => ({
            ...prev,
            lighting: {
                ...prev.lighting,
                [field]: undefined,
            },
        }));
    };

    // Requirement 1.4: State update handler for aesthetics nested object
    const handleAestheticsChange = (field: keyof StructuredPrompt["aesthetics"], value: string) => {
        setStructuredPrompt((prev) => ({
            ...prev,
            aesthetics: {
                ...prev.aesthetics,
                [field]: value,
            },
        }));
        setValidationErrors((prev) => ({
            ...prev,
            aesthetics: {
                ...prev.aesthetics,
                [field]: undefined,
            },
        }));
    };

    // Requirement 1.4: State update handler for camera nested object
    const handleCameraChange = (
        field: keyof StructuredPrompt["photographic_characteristics"],
        value: string
    ) => {
        setStructuredPrompt((prev) => ({
            ...prev,
            photographic_characteristics: {
                ...prev.photographic_characteristics,
                [field]: value,
            },
        }));
        setValidationErrors((prev) => ({
            ...prev,
            photographic_characteristics: {
                ...prev.photographic_characteristics,
                [field]: undefined,
            },
        }));
    };

    // Requirement 6.3: Add new object with UUID
    const handleAddObject = () => {
        const newObject: ObjectDefinition = {
            id: crypto.randomUUID(),
            description: "",
            location: "",
            relationship: "",
            relative_size: "",
            shape_and_color: "",
            texture: "",
            appearance_details: "",
        };
        setStructuredPrompt((prev) => ({
            ...prev,
            objects: [...prev.objects, newObject],
        }));
    };

    // Requirement 6.4: Remove object from array
    const handleRemoveObject = (id: string) => {
        setStructuredPrompt((prev) => ({
            ...prev,
            objects: prev.objects.filter((obj) => obj.id !== id),
        }));
    };

    // Requirement 6.7: Update specific object field
    const handleObjectFieldChange = (
        id: string,
        field: keyof ObjectDefinition,
        value: string
    ) => {
        setStructuredPrompt((prev) => ({
            ...prev,
            objects: prev.objects.map((obj) =>
                obj.id === id ? { ...obj, [field]: value } : obj
            ),
        }));
    };

    // Requirement 8.1: Client-side validation
    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};
        let isValid = true;

        // Validate top-level fields
        if (!structuredPrompt.short_description.trim()) {
            errors.short_description = "Short description is required";
            isValid = false;
        }
        if (!structuredPrompt.background_setting.trim()) {
            errors.background_setting = "Background setting is required";
            isValid = false;
        }

        // Validate lighting
        if (!structuredPrompt.lighting.conditions.trim()) {
            errors.lighting = { ...errors.lighting, conditions: "Lighting conditions are required" };
            isValid = false;
        }

        // Validate aesthetics
        if (!structuredPrompt.aesthetics.composition.trim()) {
            errors.aesthetics = { ...errors.aesthetics, composition: "Composition is required" };
            isValid = false;
        }

        // Validate camera
        if (!structuredPrompt.photographic_characteristics.camera_angle.trim()) {
            errors.photographic_characteristics = {
                ...errors.photographic_characteristics,
                camera_angle: "Camera angle is required",
            };
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    // Requirement 7.3: Form submission handler
    const handleGenerate = async () => {
        // Validate form
        if (!validateForm()) {
            setError("Please fill in all required fields before generating.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImageUrl(null);

        try {
            // Requirement 7.2: Generate random seed
            const seed = Math.floor(Math.random() * 1000000);

            // Requirement 7.6: Remove client-side 'id' field from objects
            const cleanedObjects = structuredPrompt.objects.map(({ id, ...rest }) => rest);

            // Add photography mode to context if selected
            let enhancedContext = structuredPrompt.context || '';
            if (photographyMode && photographyMode !== 'none') {
                const mode = getModeById(photographyMode);
                if (mode) {
                    // Add separator if context already has content
                    const separator = enhancedContext.trim() ? '\n\n' : '';
                    enhancedContext = `${enhancedContext}${separator}Photography Style: ${mode.promptAddition}`;
                }
            }

            const payload = {
                structured_prompt: {
                    ...structuredPrompt,
                    context: enhancedContext,
                    objects: cleanedObjects,
                },
                seed,
            };

            setLastPayload(payload);

            // Requirement 7.3: Call Pro Mode API
            const result = await generateProMode(payload);

            // Requirement 7.8: Handle success
            if (result.final_image_url) {
                setGeneratedImageUrl(result.final_image_url);
                setRetryCount(0);
            } else {
                setError("Image generation succeeded but no image URL was returned.");
            }
        } catch (err) {
            // Requirement 8.2: Handle errors
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Requirement 8.4: Retry functionality
    const handleRetry = async () => {
        if (!lastPayload) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImageUrl(null);
        setRetryCount((prev) => prev + 1);

        try {
            const result = await generateProMode(lastPayload);
            if (result.final_image_url) {
                setGeneratedImageUrl(result.final_image_url);
            } else {
                setError("Image generation succeeded but no image URL was returned.");
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Navigation handlers
    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleStepClick = (stepIndex: number) => {
        setCurrentStep(stepIndex);
    };

    // Render current step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <ImageAnalyzer onAnalysisComplete={handleImageAnalysis} />
                );
            case 1:
                return (
                    <SceneStyleSection
                        values={{
                            short_description: structuredPrompt.short_description,
                            background_setting: structuredPrompt.background_setting,
                            style_medium: structuredPrompt.style_medium,
                            artistic_style: structuredPrompt.artistic_style,
                            context: structuredPrompt.context,
                        }}
                        onChange={(field, value) => handleFieldChange(field as keyof StructuredPrompt, value)}
                        errors={{
                            short_description: validationErrors.short_description,
                            background_setting: validationErrors.background_setting,
                        }}
                    />
                );
            case 2:
                return (
                    <PhotographyModeSection
                        selectedMode={photographyMode}
                        onChange={setPhotographyMode}
                    />
                );
            case 3:
                return (
                    <LightingSection
                        values={structuredPrompt.lighting}
                        onChange={(field, value) => handleLightingChange(field as keyof StructuredPrompt["lighting"], value)}
                        errors={validationErrors.lighting}
                    />
                );
            case 4:
                return (
                    <AestheticsSection
                        values={structuredPrompt.aesthetics}
                        onChange={(field, value) => handleAestheticsChange(field as keyof StructuredPrompt["aesthetics"], value)}
                        errors={validationErrors.aesthetics}
                    />
                );
            case 5:
                return (
                    <CameraSection
                        values={structuredPrompt.photographic_characteristics}
                        onChange={(field, value) => handleCameraChange(field as keyof StructuredPrompt["photographic_characteristics"], value)}
                        errors={validationErrors.photographic_characteristics}
                    />
                );
            case 6:
                return (
                    <ObjectBuilderSection
                        objects={structuredPrompt.objects}
                        onAddObject={handleAddObject}
                        onRemoveObject={handleRemoveObject}
                        onObjectChange={(id, field, value) => handleObjectFieldChange(id, field as keyof ObjectDefinition, value)}
                    />
                );
            case 7:
                return (
                    <div className="space-y-6">
                        <div className="prose prose-sm max-w-none">
                            <h3 className="text-lg font-semibold mb-4">Review Your Configuration</h3>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <strong>Scene:</strong> {structuredPrompt.short_description || "Not set"}
                                </div>
                                <div>
                                    <strong>Background:</strong> {structuredPrompt.background_setting || "Not set"}
                                </div>
                                <div>
                                    <strong>Lighting:</strong> {structuredPrompt.lighting.conditions || "Not set"}
                                </div>
                                <div>
                                    <strong>Composition:</strong> {structuredPrompt.aesthetics.composition || "Not set"}
                                </div>
                                <div>
                                    <strong>Camera Angle:</strong>{" "}
                                    {structuredPrompt.photographic_characteristics.camera_angle || "Not set"}
                                </div>
                                <div>
                                    <strong>Objects:</strong> {structuredPrompt.objects.length} object(s) defined
                                </div>
                                {photographyMode && photographyMode !== 'none' && (
                                    <div className="pt-2 border-t">
                                        <strong>Photography Mode:</strong> {getModeById(photographyMode)?.name || 'None'}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {getModeById(photographyMode)?.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full min-h-[44px]"
                            size="lg"
                            aria-label="Generate image with structured prompt"
                        >
                            {isLoading ? "Generating..." : "Generate Image"}
                        </Button>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="text-center" aria-live="polite" aria-atomic="true">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                                <p className="text-sm text-muted-foreground">
                                    Generating your image... This may take up to 2 minutes.
                                </p>
                            </div>
                        )}

                        {/* Success Display */}
                        {generatedImageUrl && !isLoading && (
                            <div className="space-y-4" aria-live="polite" aria-atomic="true">
                                <h2 className="text-xl font-semibold text-center">
                                    Your Generated Image
                                </h2>
                                <div className="border rounded-lg overflow-hidden bg-muted">
                                    <img
                                        src={generatedImageUrl}
                                        alt="Generated product image based on your structured prompt"
                                        className="w-full h-auto"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => window.open(generatedImageUrl, "_blank")}
                                        aria-label="Open generated image in new tab"
                                        className="min-h-[44px]"
                                    >
                                        Open in New Tab
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setGeneratedImageUrl(null);
                                            setError(null);
                                            setCurrentStep(0);
                                        }}
                                        aria-label="Clear result and generate another image"
                                        className="min-h-[44px]"
                                    >
                                        Generate Another
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && !isLoading && (
                            <div aria-live="assertive" aria-atomic="true">
                                <Alert variant="destructive">
                                    <AlertDescription className="text-sm sm:text-base">
                                        <strong>Error:</strong> {error}
                                    </AlertDescription>
                                </Alert>
                                <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                    {lastPayload && !error.includes("fill in all required fields") && (
                                        <Button
                                            variant="default"
                                            onClick={handleRetry}
                                            aria-label="Retry image generation"
                                            className="min-h-[44px]"
                                        >
                                            {retryCount > 0 ? `Retry (Attempt ${retryCount + 1})` : "Retry"}
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setError(null);
                                            setValidationErrors({});
                                        }}
                                        aria-label="Dismiss error message"
                                        className="min-h-[44px]"
                                    >
                                        Dismiss
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl sm:text-3xl">Pro Mode - Structured Prompt Builder</CardTitle>
                    <CardDescription>
                        Create detailed product images with granular control over every aspect
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Step Indicator */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            {steps.map((step, index) => (
                                <button
                                    key={step.id}
                                    onClick={() => handleStepClick(index)}
                                    className={`flex-1 text-center transition-all ${index === currentStep
                                        ? "text-primary font-semibold"
                                        : index < currentStep
                                            ? "text-muted-foreground hover:text-foreground cursor-pointer"
                                            : "text-muted-foreground/50"
                                        }`}
                                    aria-label={`Go to step ${index + 1}: ${step.title}`}
                                    aria-current={index === currentStep ? "step" : undefined}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${index === currentStep
                                                ? "bg-primary text-primary-foreground"
                                                : index < currentStep
                                                    ? "bg-primary/20 text-primary"
                                                    : "bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            {index + 1}
                                        </div>
                                        <span className="text-xs hidden sm:block">{step.title}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
                                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Current Step Title and Description */}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">{steps[currentStep].title}</h2>
                        <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
                    </div>

                    {/* Step Content */}
                    <div className="min-h-[400px] mb-8">{renderStepContent()}</div>

                    {/* Navigation Buttons */}
                    {currentStep < 7 && (
                        <div className="flex justify-between gap-4">
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentStep === 0}
                                className="min-h-[44px]"
                                aria-label="Go to previous step"
                            >
                                Previous
                            </Button>
                            <Button
                                onClick={handleNext}
                                className="min-h-[44px]"
                                aria-label="Go to next step"
                            >
                                {currentStep === steps.length - 2 ? "Review & Generate" : currentStep === 0 ? "Skip to Manual Entry" : "Next"}
                            </Button>
                        </div>
                    )}

                    {currentStep === 7 && (
                        <div className="flex justify-start">
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                className="min-h-[44px]"
                                aria-label="Go to previous step"
                            >
                                Previous
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
