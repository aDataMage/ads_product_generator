/**
 * SetupPanel Component
 * 
 * Container component for all input controls in the left panel
 * Requirements: 2.2, 6.3, 6.4, 7.1
 */

import { ProductDescriptionCard, MIN_CHARACTERS } from "./ProductDescriptionCard";
import { StylePresetCard } from "./StylePresetCard";
import { ReferenceImageCard } from "./ReferenceImageCard";
import { GenerateButton } from "./GenerateButton";

export interface ValidationErrors {
    userPrompt?: string;
    selectedPreset?: string;
    referenceImage?: string;
}

interface SetupPanelProps {
    /** Current product description text */
    userPrompt: string;
    /** Currently selected style preset */
    selectedPreset: string | null;
    /** Base64 encoded reference image */
    referenceImage: string | null;
    /** Whether image generation is in progress */
    isLoading: boolean;
    /** Validation errors for form fields */
    validationErrors: ValidationErrors;
    /** Handler for product description changes */
    onPromptChange: (value: string) => void;
    /** Handler for style preset selection */
    onPresetChange: (value: string) => void;
    /** Handler for reference image upload/removal */
    onImageUpload: (base64: string | null) => void;
    /** Handler for generate button click */
    onGenerate: () => void;
}

/**
 * SetupPanel component
 * 
 * Requirement 2.2: Two-column layout with Setup Panel and Results Panel
 * Requirement 6.3: Validate all inputs before submission
 * Requirement 6.4: Display error messages using shadcn/ui Alert components
 * Requirement 7.1: Transition Setup Panel to disabled state during generation
 */
export function SetupPanel({
    userPrompt,
    selectedPreset,
    referenceImage,
    isLoading,
    validationErrors,
    onPromptChange,
    onPresetChange,
    onImageUpload,
    onGenerate,
}: SetupPanelProps) {
    // Form validation logic
    // Requirement 6.3: Validate all inputs before submission
    const isFormValid =
        userPrompt.length >= MIN_CHARACTERS &&
        selectedPreset !== null;

    return (
        // Requirement 12.5: Adjust spacing appropriately for each breakpoint
        // Requirement 13.1: Semantic HTML - using <form> element
        <form
            className="space-y-4 sm:space-y-6"
            onSubmit={(e) => {
                e.preventDefault();
                onGenerate();
            }}
            aria-label="Image generation form"
        >
            {/* Product Description Input */}
            <ProductDescriptionCard
                value={userPrompt}
                onChange={onPromptChange}
                isLoading={isLoading}
                error={validationErrors.userPrompt}
            />

            {/* Style Preset Selection */}
            <StylePresetCard
                value={selectedPreset}
                onChange={onPresetChange}
                isLoading={isLoading}
                error={validationErrors.selectedPreset}
            />

            {/* Reference Image Upload (Optional) */}
            <ReferenceImageCard
                value={referenceImage}
                onChange={onImageUpload}
                isLoading={isLoading}
                error={validationErrors.referenceImage}
            />

            {/* Generate Button */}
            <GenerateButton
                isFormValid={isFormValid}
                isLoading={isLoading}
                onGenerate={onGenerate}
            />

            {/* Requirement 13.4: ARIA live region for form status */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
                {!isFormValid && userPrompt.length > 0 && !selectedPreset &&
                    "Please select a style preset to continue"}
                {!isFormValid && userPrompt.length < MIN_CHARACTERS &&
                    "Please enter at least 3 characters in the product description"}
            </div>
        </form>
    );
}
