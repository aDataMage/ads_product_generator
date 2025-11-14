import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ObjectDefinition } from "@/lib/types";

/**
 * Props interface for ObjectCard component
 * Requirements 6.1, 6.5, 6.6, 6.7: Object card with all fields and remove functionality
 */
interface ObjectCardProps {
    object: ObjectDefinition;
    index: number;
    onChange: (field: string, value: string) => void;
    onRemove: () => void;
}

/**
 * ObjectCard Component
 * 
 * Requirements:
 * - 6.1: Render each object as a shadcn/ui Card component
 * - 6.5: Include inputs for all object properties
 * - 6.6: Provide a "Remove Object" button on each card
 * - 6.7: Handle object removal from the objects array
 */
export function ObjectCard({ object, index, onChange, onRemove }: ObjectCardProps) {
    const handleChange = (field: string) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        onChange(field, e.target.value);
    };

    return (
        <Card
            className="relative"
            role="group"
            aria-labelledby={`object-${object.id}-title`}
            aria-describedby={`object-${object.id}-description`}
        >
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-3 sm:pb-4">
                <div>
                    <CardTitle className="text-base sm:text-lg" id={`object-${object.id}-title`}>
                        Object {index + 1}
                    </CardTitle>
                    <p id={`object-${object.id}-description`} className="sr-only">
                        Configure properties for object {index + 1} including description, location, and appearance details
                    </p>
                </div>
                {/* Requirement 10.4: Focus management for remove button */}
                {/* Requirement 10.5: Minimum 44px touch target on mobile */}
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={onRemove}
                    aria-label={`Remove Object ${index + 1} from scene`}
                    className="min-h-[44px] w-full sm:w-auto"
                >
                    Remove Object
                </Button>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
                {/* Description - Requirement 6.5: Textarea with min 3 rows */}
                <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor={`object-${object.id}-description`} className="text-sm sm:text-base">
                        Description
                    </Label>
                    <Textarea
                        id={`object-${object.id}-description`}
                        value={object.description}
                        onChange={handleChange("description")}
                        placeholder="Detailed description of the object (e.g., 'A sleek silver smartphone with rounded edges')"
                        rows={3}
                        className="resize-none text-sm sm:text-base"
                        aria-label={`Description for Object ${index + 1}`}
                    />
                </div>

                {/* Location - Requirement 6.5: Text input */}
                <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor={`object-${object.id}-location`} className="text-sm sm:text-base">
                        Location
                    </Label>
                    <Input
                        id={`object-${object.id}-location`}
                        type="text"
                        value={object.location}
                        onChange={handleChange("location")}
                        placeholder="e.g., 'Center of frame', 'Left foreground', 'Background right'"
                        aria-label={`Location for Object ${index + 1}`}
                        className="text-sm sm:text-base min-h-[44px]"
                    />
                </div>

                {/* Relationship - Requirement 6.5: Text input */}
                <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor={`object-${object.id}-relationship`} className="text-sm sm:text-base">
                        Relationship
                    </Label>
                    <Input
                        id={`object-${object.id}-relationship`}
                        type="text"
                        value={object.relationship}
                        onChange={handleChange("relationship")}
                        placeholder="e.g., 'Resting on surface', 'Floating above', 'Leaning against'"
                        aria-label={`Relationship for Object ${index + 1}`}
                        className="text-sm sm:text-base min-h-[44px]"
                    />
                </div>

                {/* Relative Size - Requirement 6.5: Text input */}
                <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor={`object-${object.id}-relative_size`} className="text-sm sm:text-base">
                        Relative Size
                    </Label>
                    <Input
                        id={`object-${object.id}-relative_size`}
                        type="text"
                        value={object.relative_size}
                        onChange={handleChange("relative_size")}
                        placeholder="e.g., 'Medium', 'Large focal point', 'Small accent'"
                        aria-label={`Relative size for Object ${index + 1}`}
                        className="text-sm sm:text-base min-h-[44px]"
                    />
                </div>

                {/* Shape and Color - Requirement 6.5: Text input */}
                <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor={`object-${object.id}-shape_and_color`} className="text-sm sm:text-base">
                        Shape and Color
                    </Label>
                    <Input
                        id={`object-${object.id}-shape_and_color`}
                        type="text"
                        value={object.shape_and_color}
                        onChange={handleChange("shape_and_color")}
                        placeholder="e.g., 'Rectangular, matte black', 'Cylindrical, metallic silver'"
                        aria-label={`Shape and color for Object ${index + 1}`}
                        className="text-sm sm:text-base min-h-[44px]"
                    />
                </div>

                {/* Texture - Requirement 6.5: Text input */}
                <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor={`object-${object.id}-texture`} className="text-sm sm:text-base">
                        Texture
                    </Label>
                    <Input
                        id={`object-${object.id}-texture`}
                        type="text"
                        value={object.texture}
                        onChange={handleChange("texture")}
                        placeholder="e.g., 'Smooth glass', 'Brushed metal', 'Soft fabric'"
                        aria-label={`Texture for Object ${index + 1}`}
                        className="text-sm sm:text-base min-h-[44px]"
                    />
                </div>

                {/* Appearance Details - Requirement 6.5: Textarea with min 2 rows */}
                <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor={`object-${object.id}-appearance_details`} className="text-sm sm:text-base">
                        Appearance Details
                    </Label>
                    <Textarea
                        id={`object-${object.id}-appearance_details`}
                        value={object.appearance_details}
                        onChange={handleChange("appearance_details")}
                        placeholder="Additional visual details (e.g., 'Reflective screen, subtle branding on back')"
                        rows={2}
                        className="resize-none text-sm sm:text-base"
                        aria-label={`Appearance details for Object ${index + 1}`}
                    />
                </div>
            </CardContent>
        </Card>
    );
}