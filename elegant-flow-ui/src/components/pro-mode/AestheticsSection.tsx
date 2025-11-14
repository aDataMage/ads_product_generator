import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/**
 * Props interface for AestheticsSection component
 * Requirement 4.1: Aesthetics accordion section with three input fields
 * Requirement 8.1: Display inline validation errors
 */
interface AestheticsSectionProps {
    values: {
        composition: string;
        color_scheme: string;
        mood_atmosphere: string;
    };
    onChange: (field: string, value: string) => void;
    errors?: {
        composition?: string;
        color_scheme?: string;
        mood_atmosphere?: string;
    };
}

/**
 * AestheticsSection Component
 * 
 * Requirements:
 * - 4.1: Provide an "Aesthetics" accordion section containing three input fields
 * - 4.2: Include text inputs for composition, color_scheme, and mood_atmosphere
 * - 4.3: Update aesthetics object when user enters data
 * - 8.1: Display inline validation error messages
 */
export function AestheticsSection({ values, onChange, errors = {} }: AestheticsSectionProps) {
    const handleChange = (field: string) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        onChange(field, e.target.value);
    };

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Composition - Requirement 4.2: Text input */}
            <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="aesthetics_composition" className="text-sm sm:text-base">
                    Composition <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="aesthetics_composition"
                    type="text"
                    value={values.composition}
                    onChange={handleChange("composition")}
                    placeholder="e.g., 'Rule of thirds', 'Centered', 'Asymmetric balance'"
                    aria-label="Composition style"
                    className={`text-sm sm:text-base min-h-[44px] ${errors.composition ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.composition}
                    aria-describedby={errors.composition ? "aesthetics_composition-error" : undefined}
                />
                {errors.composition && (
                    <p id="aesthetics_composition-error" className="text-sm text-destructive" role="alert">
                        {errors.composition}
                    </p>
                )}
            </div>

            {/* Color Scheme - Requirement 4.2: Text input */}
            <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="aesthetics_color_scheme" className="text-sm sm:text-base">
                    Color Scheme <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="aesthetics_color_scheme"
                    type="text"
                    value={values.color_scheme}
                    onChange={handleChange("color_scheme")}
                    placeholder="e.g., 'Monochromatic', 'Warm tones', 'Cool blues and whites'"
                    aria-label="Color scheme"
                    className={`text-sm sm:text-base min-h-[44px] ${errors.color_scheme ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.color_scheme}
                    aria-describedby={errors.color_scheme ? "aesthetics_color_scheme-error" : undefined}
                />
                {errors.color_scheme && (
                    <p id="aesthetics_color_scheme-error" className="text-sm text-destructive" role="alert">
                        {errors.color_scheme}
                    </p>
                )}
            </div>

            {/* Mood & Atmosphere - Requirement 4.2: Text input */}
            <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="aesthetics_mood_atmosphere" className="text-sm sm:text-base">
                    Mood & Atmosphere <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="aesthetics_mood_atmosphere"
                    type="text"
                    value={values.mood_atmosphere}
                    onChange={handleChange("mood_atmosphere")}
                    placeholder="e.g., 'Professional and clean', 'Warm and inviting', 'Dramatic and bold'"
                    aria-label="Mood and atmosphere"
                    className={`text-sm sm:text-base min-h-[44px] ${errors.mood_atmosphere ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.mood_atmosphere}
                    aria-describedby={errors.mood_atmosphere ? "aesthetics_mood_atmosphere-error" : undefined}
                />
                {errors.mood_atmosphere && (
                    <p id="aesthetics_mood_atmosphere-error" className="text-sm text-destructive" role="alert">
                        {errors.mood_atmosphere}
                    </p>
                )}
            </div>
        </div>
    );
}
