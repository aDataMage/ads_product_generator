import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * Props interface for SceneStyleSection component
 * Requirement 2.1: Scene & Style accordion section with five input fields
 * Requirement 8.1: Display inline validation errors
 */
interface SceneStyleSectionProps {
    values: {
        short_description: string;
        background_setting: string;
        style_medium: string;
        artistic_style: string;
        context: string;
    };
    onChange: (field: string, value: string) => void;
    errors?: {
        short_description?: string;
        background_setting?: string;
        style_medium?: string;
        artistic_style?: string;
        context?: string;
    };
}

/**
 * SceneStyleSection Component
 * 
 * Requirements:
 * - 2.1: Provide a "Scene & Style" accordion section containing five input fields
 * - 2.2: Include textarea inputs for short_description and background_setting
 * - 2.5: Update structured_prompt state when user enters data
 * - 8.1: Display inline validation error messages
 */
export function SceneStyleSection({ values, onChange, errors = {} }: SceneStyleSectionProps) {
    const handleChange = (field: string) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        onChange(field, e.target.value);
    };

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Short Description - Requirement 2.2: Textarea with minimum 50 characters capacity */}
            <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="short_description" className="text-sm sm:text-base">
                    Short Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                    id="short_description"
                    value={values.short_description}
                    onChange={handleChange("short_description")}
                    placeholder="Brief description of the scene (e.g., 'A modern smartphone on a minimalist desk')"
                    rows={3}
                    className={`resize-none text-sm sm:text-base ${errors.short_description ? 'border-destructive' : ''}`}
                    aria-label="Short description of the scene"
                    aria-invalid={!!errors.short_description}
                    aria-describedby={errors.short_description ? "short_description-error" : undefined}
                />
                {errors.short_description && (
                    <p id="short_description-error" className="text-sm text-destructive" role="alert">
                        {errors.short_description}
                    </p>
                )}
            </div>

            {/* Background Setting - Requirement 2.2: Textarea with minimum 100 characters capacity */}
            <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="background_setting" className="text-sm sm:text-base">
                    Background Setting <span className="text-destructive">*</span>
                </Label>
                <Textarea
                    id="background_setting"
                    value={values.background_setting}
                    onChange={handleChange("background_setting")}
                    placeholder="Detailed background description (e.g., 'Clean white studio background with subtle gradient')"
                    rows={3}
                    className={`resize-none text-sm sm:text-base ${errors.background_setting ? 'border-destructive' : ''}`}
                    aria-label="Background setting description"
                    aria-invalid={!!errors.background_setting}
                    aria-describedby={errors.background_setting ? "background_setting-error" : undefined}
                />
                {errors.background_setting && (
                    <p id="background_setting-error" className="text-sm text-destructive" role="alert">
                        {errors.background_setting}
                    </p>
                )}
            </div>

            {/* Style Medium - Requirement 2.2: Text input */}
            <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="style_medium" className="text-sm sm:text-base">
                    Style Medium <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="style_medium"
                    type="text"
                    value={values.style_medium}
                    onChange={handleChange("style_medium")}
                    placeholder="e.g., 'Photography', 'Digital Art', '3D Render'"
                    aria-label="Style medium"
                    className={`text-sm sm:text-base min-h-[44px] ${errors.style_medium ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.style_medium}
                    aria-describedby={errors.style_medium ? "style_medium-error" : undefined}
                />
                {errors.style_medium && (
                    <p id="style_medium-error" className="text-sm text-destructive" role="alert">
                        {errors.style_medium}
                    </p>
                )}
            </div>

            {/* Artistic Style - Requirement 2.2: Text input */}
            <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="artistic_style" className="text-sm sm:text-base">
                    Artistic Style <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="artistic_style"
                    type="text"
                    value={values.artistic_style}
                    onChange={handleChange("artistic_style")}
                    placeholder="e.g., 'Minimalist', 'Luxury', 'Editorial'"
                    aria-label="Artistic style"
                    className={`text-sm sm:text-base min-h-[44px] ${errors.artistic_style ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.artistic_style}
                    aria-describedby={errors.artistic_style ? "artistic_style-error" : undefined}
                />
                {errors.artistic_style && (
                    <p id="artistic_style-error" className="text-sm text-destructive" role="alert">
                        {errors.artistic_style}
                    </p>
                )}
            </div>

            {/* Context - Requirement 2.2: Textarea */}
            <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="context" className="text-sm sm:text-base">
                    Context <span className="text-destructive">*</span>
                </Label>
                <Textarea
                    id="context"
                    value={values.context}
                    onChange={handleChange("context")}
                    placeholder="Additional context or mood (e.g., 'Professional product photography for e-commerce')"
                    rows={2}
                    className={`resize-none text-sm sm:text-base ${errors.context ? 'border-destructive' : ''}`}
                    aria-label="Additional context"
                    aria-invalid={!!errors.context}
                    aria-describedby={errors.context ? "context-error" : undefined}
                />
                {errors.context && (
                    <p id="context-error" className="text-sm text-destructive" role="alert">
                        {errors.context}
                    </p>
                )}
            </div>
        </div>
    );
}
