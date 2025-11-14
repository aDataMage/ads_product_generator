import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { SceneStyleSection } from "./pro-mode/SceneStyleSection";
import { LightingSection } from "./pro-mode/LightingSection";
import { AestheticsSection } from "./pro-mode/AestheticsSection";
import { CameraSection } from "./pro-mode/CameraSection";
import { ObjectBuilderSection } from "./pro-mode/ObjectBuilderSection";
import { generateProMode, ApiError } from "@/lib/api";
import type { StructuredPrompt, ObjectDefinition } from "@/lib/types";
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
 * 
 * Requirements:
 * - 1.1: Display single-page form with collapsible accordion sections
 * - 1.2: Organize form inputs into five distinct sections
 * - 1.3: Use shadcn/ui components and Tailwind CSS styling
 * - 1.4: Maintain all form data in React state as structured JSON object
 * - 1.5: Display primary "Generate Image" button at bottom
 */
export function ProModeForm() {
    /**
     * Requirement 1.4: Initialize StructuredPrompt state with empty values
     * This state mirrors the final API payload structure
     */
    const [structuredPrompt, setStructuredPrompt] = useState<StructuredPrompt>({
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
    });

    /**
     * Requirement 1.5, 8.1: Initialize loading, result, error, and validation state
     */
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [lastPayload, setLastPayload] = useState<any>(null); // Store last payload for retry
    const [retryCount, setRetryCount] = useState(0);

    /**
     * Requirement 8.1: Validate structured prompt fields
     * Returns validation errors object
     */
    const validateForm = (): ValidationErrors => {
        const errors: ValidationErrors = {};

        // Validate top-level fields
        if (!structuredPrompt.short_description.trim()) {
            errors.short_description = "Short description is required";
        }
        if (!structuredPrompt.background_setting.trim()) {
            errors.background_setting = "Background setting is required";
        }
        if (!structuredPrompt.style_medium.trim()) {
            errors.style_medium = "Style medium is required";
        }
        if (!structuredPrompt.artistic_style.trim()) {
            errors.artistic_style = "Artistic style is required";
        }
        if (!structuredPrompt.context.trim()) {
            errors.context = "Context is required";
        }

        // Validate lighting fields
        const lightingErrors: any = {};
        if (!structuredPrompt.lighting.conditions.trim()) {
            lightingErrors.conditions = "Lighting conditions are required";
        }
        if (!structuredPrompt.lighting.direction.trim()) {
            lightingErrors.direction = "Lighting direction is required";
        }
        if (!structuredPrompt.lighting.shadows.trim()) {
            lightingErrors.shadows = "Shadow description is required";
        }
        if (Object.keys(lightingErrors).length > 0) {
            errors.lighting = lightingErrors;
        }

        // Validate aesthetics fields
        const aestheticsErrors: any = {};
        if (!structuredPrompt.aesthetics.composition.trim()) {
            aestheticsErrors.composition = "Composition is required";
        }
        if (!structuredPrompt.aesthetics.color_scheme.trim()) {
            aestheticsErrors.color_scheme = "Color scheme is required";
        }
        if (!structuredPrompt.aesthetics.mood_atmosphere.trim()) {
            aestheticsErrors.mood_atmosphere = "Mood/atmosphere is required";
        }
        if (Object.keys(aestheticsErrors).length > 0) {
            errors.aesthetics = aestheticsErrors;
        }

        // Validate camera fields
        const cameraErrors: any = {};
        if (!structuredPrompt.photographic_characteristics.camera_angle.trim()) {
            cameraErrors.camera_angle = "Camera angle is required";
        }
        if (!structuredPrompt.photographic_characteristics.lens_focal_length.trim()) {
            cameraErrors.lens_focal_length = "Lens focal length is required";
        }
        if (!structuredPrompt.photographic_characteristics.depth_of_field.trim()) {
            cameraErrors.depth_of_field = "Depth of field is required";
        }
        if (!structuredPrompt.photographic_characteristics.focus.trim()) {
            cameraErrors.focus = "Focus is required";
        }
        if (Object.keys(cameraErrors).length > 0) {
            errors.photographic_characteristics = cameraErrors;
        }

        return errors;
    };

    /**
     * Requirement 1.4, 8.1: Handle top-level string field changes
     * Updates Scene & Style section fields and clears validation errors
     */
    const handleFieldChange = (field: string, value: string) => {
        setStructuredPrompt((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear validation error for this field
        if (validationErrors[field as keyof ValidationErrors]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field as keyof ValidationErrors];
                return newErrors;
            });
        }
    };

    /**
     * Requirement 1.4, 8.1: Handle lighting nested object changes
     * Updates Lighting section fields and clears validation errors
     */
    const handleLightingChange = (field: string, value: string) => {
        setStructuredPrompt((prev) => ({
            ...prev,
            lighting: {
                ...prev.lighting,
                [field]: value,
            },
        }));

        // Clear validation error for this field
        if (validationErrors.lighting?.[field as keyof typeof validationErrors.lighting]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                if (newErrors.lighting) {
                    const newLightingErrors = { ...newErrors.lighting };
                    delete newLightingErrors[field as keyof typeof newLightingErrors];
                    if (Object.keys(newLightingErrors).length === 0) {
                        delete newErrors.lighting;
                    } else {
                        newErrors.lighting = newLightingErrors;
                    }
                }
                return newErrors;
            });
        }
    };

    /**
     * Requirement 1.4, 8.1: Handle aesthetics nested object changes
     * Updates Aesthetics section fields and clears validation errors
     */
    const handleAestheticsChange = (field: string, value: string) => {
        setStructuredPrompt((prev) => ({
            ...prev,
            aesthetics: {
                ...prev.aesthetics,
                [field]: value,
            },
        }));

        // Clear validation error for this field
        if (validationErrors.aesthetics?.[field as keyof typeof validationErrors.aesthetics]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                if (newErrors.aesthetics) {
                    const newAestheticsErrors = { ...newErrors.aesthetics };
                    delete newAestheticsErrors[field as keyof typeof newAestheticsErrors];
                    if (Object.keys(newAestheticsErrors).length === 0) {
                        delete newErrors.aesthetics;
                    } else {
                        newErrors.aesthetics = newAestheticsErrors;
                    }
                }
                return newErrors;
            });
        }
    };

    /**
     * Requirement 1.4, 8.1: Handle camera/photographic_characteristics nested object changes
     * Updates Camera section fields and clears validation errors
     */
    const handleCameraChange = (field: string, value: string) => {
        setStructuredPrompt((prev) => ({
            ...prev,
            photographic_characteristics: {
                ...prev.photographic_characteristics,
                [field]: value,
            },
        }));

        // Clear validation error for this field
        if (validationErrors.photographic_characteristics?.[field as keyof typeof validationErrors.photographic_characteristics]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                if (newErrors.photographic_characteristics) {
                    const newCameraErrors = { ...newErrors.photographic_characteristics };
                    delete newCameraErrors[field as keyof typeof newCameraErrors];
                    if (Object.keys(newCameraErrors).length === 0) {
                        delete newErrors.photographic_characteristics;
                    } else {
                        newErrors.photographic_characteristics = newCameraErrors;
                    }
                }
                return newErrors;
            });
        }
    };

    /**
     * Requirement 6.3: Handle adding new object to objects array
     * Generates UUID for client-side React key management
     */
    const handleAddObject = () => {
        const newObject: ObjectDefinition = {
            id: crypto.randomUUID(), // Generate UUID for React key
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

    /**
     * Requirement 6.4, 6.7: Handle removing object from objects array
     */
    const handleRemoveObject = (id: string) => {
        setStructuredPrompt((prev) => ({
            ...prev,
            objects: prev.objects.filter((obj) => obj.id !== id),
        }));
    };

    /**
     * Requirement 6.7: Handle updating specific object property
     */
    const handleObjectFieldChange = (id: string, field: string, value: string) => {
        setStructuredPrompt((prev) => ({
            ...prev,
            objects: prev.objects.map((obj) =>
                obj.id === id ? { ...obj, [field]: value } : obj
            ),
        }));
    };

    /**
     * Requirement 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4: Handle form submission and image generation
     * 
     * This function:
     * - Validates all required fields
     * - Generates a random seed
     * - Removes client-side 'id' field from objects
     * - Constructs payload with structured_prompt and seed
     * - Calls generateProMode API function
     * - Handles loading, success, and error states with user-friendly messages
     */
    const handleGenerate = async () => {
        try {
            // Requirement 8.1: Validate form before submission
            const errors = validateForm();
            if (Object.keys(errors).length > 0) {
                setValidationErrors(errors);
                setError("Please fill in all required fields before generating.");
                return;
            }

            // Clear previous results, errors, and validation errors
            setError(null);
            setGeneratedImageUrl(null);
            setValidationErrors({});

            // Requirement 7.2: Generate random seed
            const seed = Math.floor(Math.random() * 1000000);

            // Requirement 7.3: Remove client-side 'id' field from objects before API call
            const objectsForApi = structuredPrompt.objects.map(({ id, ...rest }) => rest);

            // Requirement 7.4: Construct payload with structured_prompt and seed
            const payload = {
                structured_prompt: {
                    ...structuredPrompt,
                    objects: objectsForApi,
                },
                seed,
            };

            // Store payload for retry functionality
            setLastPayload(payload);

            // Requirement 7.5, 7.6: Set loading state and call API
            setIsLoading(true);
            const response = await generateProMode(payload);

            // Requirement 7.7, 7.8: Handle success response
            if (response.success && response.final_image_url) {
                setGeneratedImageUrl(response.final_image_url);
                setRetryCount(0); // Reset retry count on success
            } else {
                setError(response.error || "Image generation failed");
            }
        } catch (err) {
            // Requirement 8.2, 8.3: Handle error response with user-friendly messages
            if (err instanceof ApiError) {
                // Handle specific API errors
                if (err.statusCode === 408) {
                    // Timeout error
                    setError(
                        "Request timed out. The generation is taking longer than expected. " +
                        "Please try again or simplify your prompt."
                    );
                } else if (err.statusCode === 400) {
                    // Validation error from backend
                    setError(`Validation error: ${err.message}`);
                } else if (err.statusCode === 500) {
                    // Server error
                    setError(
                        "Server error occurred. The image generation service may be temporarily unavailable. " +
                        "Please try again in a few moments."
                    );
                } else if (err.message.includes("Network error")) {
                    // Network error
                    setError(
                        "Network error. Please check your internet connection and try again. " +
                        "If the problem persists, the server may be unreachable."
                    );
                } else {
                    // Generic API error
                    setError(err.message);
                }
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            // Always clear loading state
            setIsLoading(false);
        }
    };

    /**
     * Requirement 8.4: Retry functionality for failed generations
     * Reuses the last payload to retry the generation
     */
    const handleRetry = async () => {
        if (!lastPayload) {
            setError("No previous request to retry. Please generate a new image.");
            return;
        }

        try {
            // Clear previous errors
            setError(null);
            setGeneratedImageUrl(null);

            // Increment retry count
            setRetryCount((prev) => prev + 1);

            // Requirement 7.5, 7.6: Set loading state and call API
            setIsLoading(true);
            const response = await generateProMode(lastPayload);

            // Requirement 7.7, 7.8: Handle success response
            if (response.success && response.final_image_url) {
                setGeneratedImageUrl(response.final_image_url);
                setRetryCount(0); // Reset retry count on success
            } else {
                setError(response.error || "Image generation failed");
            }
        } catch (err) {
            // Requirement 8.2, 8.3: Handle error response with user-friendly messages
            if (err instanceof ApiError) {
                if (err.statusCode === 408) {
                    setError(
                        "Request timed out again. The generation is taking longer than expected. " +
                        "Please try again later or simplify your prompt."
                    );
                } else if (err.message.includes("Network error")) {
                    setError(
                        "Network error. Please check your internet connection and try again."
                    );
                } else {
                    setError(err.message);
                }
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred during retry. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Accordion layout will be implemented in subtask 9.4
    // Generate button and results display will be implemented in subtask 9.5

    return (
        <div className="container mx-auto py-4 px-4 sm:py-6 md:py-8 pro-mode-form">
            {/* Requirement 10.2: Skip to content link for keyboard navigation */}
            <a href="#pro-mode-form-content" className="skip-to-content">
                Skip to form content
            </a>

            <div className="max-w-4xl mx-auto">
                {/* Requirement 10.1: Main heading with proper semantic structure */}
                <header role="banner" className="mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2" id="pro-mode-title">Pro Mode</h1>
                    <p className="text-sm sm:text-base text-muted-foreground" id="pro-mode-description">
                        Build structured prompts with granular control over every aspect of image generation
                    </p>
                </header>

                {/* Requirement 1.1, 1.2, 1.3: Accordion layout with five sections */}
                {/* Requirement 10.2: Keyboard navigation support for accordion sections */}
                {/* Requirement 10.1: Proper ARIA labeling for form sections */}
                <form
                    id="pro-mode-form-content"
                    onSubmit={(e) => { e.preventDefault(); handleGenerate(); }}
                    aria-labelledby="pro-mode-title"
                    aria-describedby="pro-mode-description"
                >
                    <Accordion
                        type="single"
                        collapsible
                        defaultValue="scene-style"
                        className="w-full space-y-3 sm:space-y-4"
                        aria-labelledby="pro-mode-title"
                        role="region"
                        aria-label="Pro Mode form sections"
                    >
                        {/* Requirement 1.2: Scene & Style Section (default open) */}
                        {/* Requirement 10.1: ARIA labels for accordion sections */}
                        <AccordionItem value="scene-style" className="border rounded-lg px-4 sm:px-6">
                            <AccordionTrigger
                                className="text-base sm:text-lg font-semibold py-4"
                                aria-label="Scene and Style section"
                                aria-controls="scene-style-content"
                            >
                                Scene & Style
                            </AccordionTrigger>
                            <AccordionContent id="scene-style-content" role="region" aria-label="Scene and Style form fields">
                                <SceneStyleSection
                                    values={{
                                        short_description: structuredPrompt.short_description,
                                        background_setting: structuredPrompt.background_setting,
                                        style_medium: structuredPrompt.style_medium,
                                        artistic_style: structuredPrompt.artistic_style,
                                        context: structuredPrompt.context,
                                    }}
                                    onChange={handleFieldChange}
                                    errors={{
                                        short_description: validationErrors.short_description,
                                        background_setting: validationErrors.background_setting,
                                        style_medium: validationErrors.style_medium,
                                        artistic_style: validationErrors.artistic_style,
                                        context: validationErrors.context,
                                    }}
                                />
                            </AccordionContent>
                        </AccordionItem>

                        {/* Requirement 1.2: Lighting Section */}
                        {/* Requirement 10.1: ARIA labels for accordion sections */}
                        <AccordionItem value="lighting" className="border rounded-lg px-4 sm:px-6">
                            <AccordionTrigger
                                className="text-base sm:text-lg font-semibold py-4"
                                aria-label="Lighting section"
                                aria-controls="lighting-content"
                            >
                                Lighting
                            </AccordionTrigger>
                            <AccordionContent id="lighting-content" role="region" aria-label="Lighting form fields">
                                <LightingSection
                                    values={structuredPrompt.lighting}
                                    onChange={handleLightingChange}
                                    errors={validationErrors.lighting}
                                />
                            </AccordionContent>
                        </AccordionItem>

                        {/* Requirement 1.2: Aesthetics Section */}
                        {/* Requirement 10.1: ARIA labels for accordion sections */}
                        <AccordionItem value="aesthetics" className="border rounded-lg px-4 sm:px-6">
                            <AccordionTrigger
                                className="text-base sm:text-lg font-semibold py-4"
                                aria-label="Aesthetics section"
                                aria-controls="aesthetics-content"
                            >
                                Aesthetics
                            </AccordionTrigger>
                            <AccordionContent id="aesthetics-content" role="region" aria-label="Aesthetics form fields">
                                <AestheticsSection
                                    values={structuredPrompt.aesthetics}
                                    onChange={handleAestheticsChange}
                                    errors={validationErrors.aesthetics}
                                />
                            </AccordionContent>
                        </AccordionItem>

                        {/* Requirement 1.2: Camera Section */}
                        {/* Requirement 10.1: ARIA labels for accordion sections */}
                        <AccordionItem value="camera" className="border rounded-lg px-4 sm:px-6">
                            <AccordionTrigger
                                className="text-base sm:text-lg font-semibold py-4"
                                aria-label="Camera section"
                                aria-controls="camera-content"
                            >
                                Camera
                            </AccordionTrigger>
                            <AccordionContent id="camera-content" role="region" aria-label="Camera form fields">
                                <CameraSection
                                    values={structuredPrompt.photographic_characteristics}
                                    onChange={handleCameraChange}
                                    errors={validationErrors.photographic_characteristics}
                                />
                            </AccordionContent>
                        </AccordionItem>

                        {/* Requirement 1.2: Object Builder Section */}
                        {/* Requirement 10.1: ARIA labels for accordion sections */}
                        <AccordionItem value="object-builder" className="border rounded-lg px-4 sm:px-6">
                            <AccordionTrigger
                                className="text-base sm:text-lg font-semibold py-4"
                                aria-label="Object Builder section"
                                aria-controls="object-builder-content"
                            >
                                Object Builder
                            </AccordionTrigger>
                            <AccordionContent id="object-builder-content" role="region" aria-label="Object Builder form fields">
                                <ObjectBuilderSection
                                    objects={structuredPrompt.objects}
                                    onAddObject={handleAddObject}
                                    onRemoveObject={handleRemoveObject}
                                    onObjectChange={handleObjectFieldChange}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* Requirement 1.5, 7.1: Generate Image button */}
                    {/* Requirement 10.3: Visible focus indicators for keyboard navigation */}
                    {/* Requirement 10.5: Minimum 44px touch targets on mobile */}
                    <div className="mt-6 sm:mt-8 flex justify-center">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            size="lg"
                            className="w-full sm:w-auto sm:min-w-[200px] min-h-[44px]"
                            aria-label="Generate image from structured prompt"
                            aria-describedby={isLoading ? "generation-status" : undefined}
                        >
                            {isLoading ? (
                                <>
                                    <span className="mr-2">Generating...</span>
                                    <span className="animate-spin" aria-hidden="true">⏳</span>
                                </>
                            ) : (
                                "Generate Image"
                            )}
                        </Button>
                    </div>
                </form>

                {/* Requirement 8.1, 8.2, 10.3: Loading state display with ARIA live region */}
                {isLoading && (
                    <div
                        className="mt-4 sm:mt-6 text-center px-4"
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        id="generation-status"
                    >
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Please wait while we generate your image. This may take up to 2 minutes...
                        </p>
                    </div>
                )}

                {/* Requirement 8.3, 8.4, 10.3: Success - Display generated image with ARIA live region */}
                {generatedImageUrl && !isLoading && (
                    <div
                        className="mt-6 sm:mt-8 space-y-4"
                        role="region"
                        aria-live="polite"
                        aria-atomic="true"
                        aria-labelledby="result-heading"
                    >
                        <h2 className="text-xl sm:text-2xl font-semibold text-center" id="result-heading">
                            Generated Image
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
                                }}
                                aria-label="Clear result and generate another image"
                                className="min-h-[44px]"
                            >
                                Generate Another
                            </Button>
                        </div>
                    </div>
                )}

                {/* Requirement 8.5, 10.3: Error display with ARIA live region and retry functionality */}
                {error && !isLoading && (
                    <div
                        className="mt-6 sm:mt-8"
                        aria-live="assertive"
                        aria-atomic="true"
                    >
                        <Alert variant="destructive">
                            <AlertDescription className="text-sm sm:text-base">
                                <strong>Error:</strong> {error}
                            </AlertDescription>
                        </Alert>
                        <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                            {/* Requirement 8.4: Retry functionality for failed generations */}
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
        </div>
    );
}
