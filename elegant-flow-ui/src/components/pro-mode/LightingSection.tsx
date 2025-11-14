import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/**
 * Props interface for LightingSection component
 * Requirement 3.1: Lighting accordion section with three input fields
 * Requirement 8.1: Display inline validation errors
 */
interface LightingSectionProps {
    values: {
        conditions: string;
        direction: string;
        shadows: string;
    };
    onChange: (field: string, value: string) => void;
    errors?: {
        conditions?: string;
        direction?: string;
        shadows?: string;
    };
}

/**
 * LightingSection Component
 * 
 * Requirements:
 * - 3.1: Provide a "Lighting" accordion section containing three input fields
 * - 3.2: Include text inputs for lighting.conditions, lighting.direction, and lighting.shadows
 * - 3.3: Update lighting object when user enters data
 * - 8.1: Display inline validation error messages
 */
export function LightingSection({ values, onChange, errors = {} }: LightingSectionProps) {
    const handleChange = (field: string) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        onChange(field, e.target.value);
    };

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Lighting Conditions - Requirement 3.2: Text input */}
            <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="lighting_conditions" className="text-sm sm:text-base">
                    Lighting Conditions <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="lighting_conditions"
                    type="text"
                    value={values.conditions}
                    onChange={handleChange("conditions")}
                    placeholder="e.g., 'Soft studio lighting', 'Natural daylight', 'Dramatic side lighting'"
                    aria-label="Lighting conditions"
                    className={`text-sm sm:text-base min-h-[44px] ${errors.conditions ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.conditions}
                    aria-describedby={errors.conditions ? "lighting_conditions-error" : undefined}
                />
                {errors.conditions && (
                    <p id="lighting_conditions-error" className="text-sm text-destructive" role="alert">
                        {errors.conditions}
                    </p>
                )}
            </div>

            {/* Lighting Direction - Requirement 3.2: Text input */}
            <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="lighting_direction" className="text-sm sm:text-base">
                    Lighting Direction <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="lighting_direction"
                    type="text"
                    value={values.direction}
                    onChange={handleChange("direction")}
                    placeholder="e.g., 'Front lighting', 'Backlit', '45-degree angle from left'"
                    aria-label="Lighting direction"
                    className={`text-sm sm:text-base min-h-[44px] ${errors.direction ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.direction}
                    aria-describedby={errors.direction ? "lighting_direction-error" : undefined}
                />
                {errors.direction && (
                    <p id="lighting_direction-error" className="text-sm text-destructive" role="alert">
                        {errors.direction}
                    </p>
                )}
            </div>

            {/* Shadows - Requirement 3.2: Text input */}
            <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="lighting_shadows" className="text-sm sm:text-base">
                    Shadows <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="lighting_shadows"
                    type="text"
                    value={values.shadows}
                    onChange={handleChange("shadows")}
                    placeholder="e.g., 'Soft shadows', 'No shadows', 'Hard dramatic shadows'"
                    aria-label="Shadow characteristics"
                    className={`text-sm sm:text-base min-h-[44px] ${errors.shadows ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.shadows}
                    aria-describedby={errors.shadows ? "lighting_shadows-error" : undefined}
                />
                {errors.shadows && (
                    <p id="lighting_shadows-error" className="text-sm text-destructive" role="alert">
                        {errors.shadows}
                    </p>
                )}
            </div>
        </div>
    );
}
