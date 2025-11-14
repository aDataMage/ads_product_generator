import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ObjectCard } from "./ObjectCard";
import type { ObjectDefinition } from "@/lib/types";

/**
 * Props interface for ObjectBuilderSection component
 * Requirements 6.1, 6.2, 6.3, 6.8: Object builder with dynamic management
 */
interface ObjectBuilderSectionProps {
    objects: ObjectDefinition[];
    onAddObject: () => void;
    onRemoveObject: (id: string) => void;
    onObjectChange: (id: string, field: string, value: string) => void;
}

/**
 * ObjectBuilderSection Component
 * 
 * Requirements:
 * - 6.1: Provide an "Object Builder" accordion section with dynamic object management
 * - 6.2: Display an "Add New Object" button that creates a new object card
 * - 6.3: Add new object entry to the objects array when button is clicked
 * - 6.4: Render each object as a Card component with proper React keys
 * - 6.8: Maintain the objects array as a property within structured_prompt state
 * - 10.4: Ensure focus management for add/remove object buttons
 */
export function ObjectBuilderSection({
    objects,
    onAddObject,
    onRemoveObject,
    onObjectChange,
}: ObjectBuilderSectionProps) {
    // Requirement 10.4: Focus management - track add button for focus restoration
    const addButtonRef = useRef<HTMLButtonElement>(null);

    const handleAddObject = () => {
        onAddObject();
        // Focus will naturally move to the new object's first input
    };

    const handleRemoveObject = (id: string) => {
        onRemoveObject(id);
        // Requirement 10.4: Return focus to add button after removing an object
        setTimeout(() => {
            addButtonRef.current?.focus();
        }, 0);
    };

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Requirement 6.2: "Add New Object" button always visible */}
            {/* Requirement 10.4: Focus management with ref */}
            {/* Requirement 10.5: Minimum 44px touch target on mobile */}
            <div className="flex justify-start">
                <Button
                    ref={addButtonRef}
                    type="button"
                    onClick={handleAddObject}
                    variant="default"
                    size="default"
                    aria-label="Add new object to scene"
                    aria-describedby="object-builder-description"
                    className="min-h-[44px] w-full sm:w-auto"
                >
                    Add New Object
                </Button>
            </div>

            {/* Requirement 10.1: ARIA description for screen readers */}
            <p id="object-builder-description" className="sr-only">
                Add objects to your scene. Each object can be configured with detailed properties including description, location, and appearance.
            </p>

            {/* Requirement 6.4: Render ObjectCard components with proper React keys */}
            {/* Requirement 10.1, 10.4: Accessible list with proper ARIA labels */}
            {objects.length > 0 && (
                <div
                    className="space-y-3 sm:space-y-4"
                    role="list"
                    aria-label={`${objects.length} object${objects.length !== 1 ? 's' : ''} in scene`}
                >
                    {objects.map((object, index) => (
                        <div key={object.id} role="listitem">
                            <ObjectCard
                                object={object}
                                index={index}
                                onChange={(field, value) => onObjectChange(object.id, field, value)}
                                onRemove={() => handleRemoveObject(object.id)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state message when no objects */}
            {objects.length === 0 && (
                <div
                    className="text-center py-6 sm:py-8 text-muted-foreground"
                    role="status"
                    aria-live="polite"
                >
                    <p className="text-sm sm:text-base">No objects added yet. Click "Add New Object" to start building your scene.</p>
                </div>
            )}
        </div>
    );
}
