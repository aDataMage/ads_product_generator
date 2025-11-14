import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/**
 * Props interface for CameraSection component
 * Requirement 5.1: Camera accordion section with four input fields
 * Requirement 8.1: Display inline validation errors
 */
interface CameraSectionProps {
    values: {
        camera_angle: string;
        lens_focal_length: string;
        depth_of_field: string;
        focus: string;
    };
    onChange: (field: string, value: string) => void;
    errors?: {
        camera_angle?: string;
        lens_focal_length?: string;
        depth_of_field?: string;
        focus?: string;
    };
}

/**
 * CameraSection Component
 * 
 * Requirements:
 * - 5.1: Provide a "Camera" accordion section containing four input fields
 * - 5.2: Include text inputs for camera_angle, lens_focal_length, depth_of_field, and focus
 * - 5.3: Update photographic_characteristics object when user enters data
 * - 8.1: Display inline validation error messages
 */
export function CameraSection({ values, onChange, errors = {} }: CameraSectionProps) {
    const handleChange = (field: string) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        onChange(field, e.target.value);
    };

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Camera Angle - Requirement 5.2: Text input */}
            <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="camera_angle" className="text-sm sm:text-base">
                    Camera Angle <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="camera_angle"
                    type="text"
                    value={values.camera_angle}
                    onChange={handleChange("camera_angle")}
                    placeholder="e.g., 'Eye level', 'Low angle', 'Bird's eye view', '45-degree angle'"
                    aria-label="Camera angle"
                    className={`text-sm sm:text-base min-h-[44px] ${errors.camera_angle ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.camera_angle}
                    aria-describedby={errors.camera_angle ? "camera_angle-error" : undefined}
                />
                {errors.camera_angle && (
                    <p id="camera_angle-error" className="text-sm text-destructive" role="alert">
                        {errors.camera_angle}
                    </p>
                )}
            </div>

            {/* Lens Focal Length - Requirement 5.2: Text input */}
            <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="lens_focal_length" className="text-sm sm:text-base">
                    Lens Focal Length <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="lens_focal_length"
                    type="text"
                    value={values.lens_focal_length}
                    onChange={handleChange("lens_focal_length")}
                    placeholder="e.g., '50mm', '85mm macro', 'Wide angle 24mm'"
                    aria-label="Lens focal length"
                    className={`text-sm sm:text-base min-h-[44px] ${errors.lens_focal_length ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.lens_focal_length}
                    aria-describedby={errors.lens_focal_length ? "lens_focal_length-error" : undefined}
                />
                {errors.lens_focal_length && (
                    <p id="lens_focal_length-error" className="text-sm text-destructive" role="alert">
                        {errors.lens_focal_length}
                    </p>
                )}
            </div>

            {/* Depth of Field - Requirement 5.2: Text input */}
            <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="depth_of_field" className="text-sm sm:text-base">
                    Depth of Field <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="depth_of_field"
                    type="text"
                    value={values.depth_of_field}
                    onChange={handleChange("depth_of_field")}
                    placeholder="e.g., 'Shallow (f/1.8)', 'Deep (f/16)', 'Medium (f/5.6)'"
                    aria-label="Depth of field"
                    className={`text-sm sm:text-base min-h-[44px] ${errors.depth_of_field ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.depth_of_field}
                    aria-describedby={errors.depth_of_field ? "depth_of_field-error" : undefined}
                />
                {errors.depth_of_field && (
                    <p id="depth_of_field-error" className="text-sm text-destructive" role="alert">
                        {errors.depth_of_field}
                    </p>
                )}
            </div>

            {/* Focus - Requirement 5.2: Text input */}
            <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="focus" className="text-sm sm:text-base">
                    Focus <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="focus"
                    type="text"
                    value={values.focus}
                    onChange={handleChange("focus")}
                    placeholder="e.g., 'Sharp focus on product', 'Soft focus background', 'Tack sharp'"
                    aria-label="Focus"
                    className={`text-sm sm:text-base min-h-[44px] ${errors.focus ? 'border-destructive' : ''}`}
                    aria-invalid={!!errors.focus}
                    aria-describedby={errors.focus ? "focus-error" : undefined}
                />
                {errors.focus && (
                    <p id="focus-error" className="text-sm text-destructive" role="alert">
                        {errors.focus}
                    </p>
                )}
            </div>
        </div>
    );
}
