/**
 * GenerateButton Component
 * 
 * Primary action button for initiating image generation
 * Requirements: 6.1, 6.2, 6.5, 13.2
 */

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GenerateButtonProps {
    /** Whether the form is currently valid and can be submitted */
    isFormValid: boolean;
    /** Whether image generation is in progress */
    isLoading: boolean;
    /** Click handler for form submission */
    onGenerate: () => void;
}

/**
 * GenerateButton component
 * 
 * Requirement 6.1: Display a shadcn/ui Button component labeled "Generate"
 * Requirement 6.2: Disable button when form is invalid or loading
 * Requirement 6.5: Initiate Generation Request on click
 * Requirement 13.2: Provide ARIA labels for all interactive elements
 */
export function GenerateButton({ isFormValid, isLoading, onGenerate }: GenerateButtonProps) {
    // Determine button disabled state
    // Requirement 6.2: Button disabled when form invalid OR loading
    const isDisabled = !isFormValid || isLoading;

    // Determine ARIA label based on state
    // Requirement 13.2: ARIA labels for button states
    const ariaLabel = isLoading
        ? "Generating image, please wait"
        : isDisabled
            ? "Generate button disabled - complete all required fields"
            : "Generate product image";

    return (
        // Requirement 12.3: Maintain usability on screens as small as 375px wide
        // Requirement 12.5: Adjust button size for mobile
        // Requirement 13.3: Support keyboard navigation - submit button
        <Button
            type="submit"
            onClick={(e) => {
                e.preventDefault();
                onGenerate();
            }}
            disabled={isDisabled}
            className="w-full text-sm sm:text-base"
            size="lg"
            aria-label={ariaLabel}
            aria-busy={isLoading}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Generating...
                </>
            ) : (
                'Generate Image'
            )}
        </Button>
    );
}
