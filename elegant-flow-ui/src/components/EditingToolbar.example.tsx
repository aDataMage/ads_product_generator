/**
 * EditingToolbar Example Usage
 * 
 * This file demonstrates how to use the EditingToolbar component
 * with the various editing tool components.
 */

import { useState } from 'react';
import { EditingToolbar, type EditingTool } from './EditingToolbar';
import { BackgroundEditor } from './BackgroundEditor';
import { GenerativeFillEditor } from './GenerativeFillEditor';
import { EnhancementEditor } from './EnhancementEditor';
import { CanvasExpander } from './CanvasExpander';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface EditingToolbarExampleProps {
    /** URL of the image to edit */
    imageUrl: string;
    /** Callback when editing is complete */
    onEditComplete: (editedImageUrl: string) => void;
}

/**
 * Example component showing how to integrate EditingToolbar
 * with all editing tool components
 */
export function EditingToolbarExample({
    imageUrl,
    onEditComplete,
}: EditingToolbarExampleProps) {
    const [selectedTool, setSelectedTool] = useState<EditingTool>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
    const [error, setError] = useState<string | null>(null);

    // Handle tool selection
    const handleToolSelect = (tool: EditingTool) => {
        // Toggle tool if clicking the same one
        if (selectedTool === tool) {
            setSelectedTool(null);
        } else {
            setSelectedTool(tool);
            setError(null);
        }
    };

    // Handle edit completion
    const handleEditComplete = (editedImageUrl: string) => {
        setCurrentImageUrl(editedImageUrl);
        onEditComplete(editedImageUrl);
        // Optionally close the tool after completion
        // setSelectedTool(null);
    };

    // Handle errors
    const handleError = (errorMessage: string) => {
        setError(errorMessage);
    };

    // Close the editing panel
    const handleClose = () => {
        setSelectedTool(null);
        setError(null);
    };

    return (
        <div className="space-y-4">
            {/* Image Display */}
            <Card>
                <CardContent className="p-4">
                    <img
                        src={currentImageUrl}
                        alt="Image being edited"
                        className="w-full h-auto rounded-lg"
                    />
                </CardContent>
            </Card>

            {/* Editing Toolbar */}
            <EditingToolbar
                onToolSelect={handleToolSelect}
                selectedTool={selectedTool}
                disabled={false}
            />

            {/* Editing Tool Panel */}
            {selectedTool && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>
                            {selectedTool === 'background-remove' && 'Remove Background'}
                            {selectedTool === 'background-replace' && 'Replace Background'}
                            {selectedTool === 'background-blur' && 'Blur Background'}
                            {selectedTool === 'generative-fill' && 'Generative Fill'}
                            {selectedTool === 'enhance' && 'Enhance Quality'}
                            {selectedTool === 'upscale' && 'Upscale Resolution'}
                            {selectedTool === 'expand' && 'Expand Canvas'}
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            aria-label="Close editing tool"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {/* Background Tools */}
                        {(selectedTool === 'background-remove' ||
                            selectedTool === 'background-replace' ||
                            selectedTool === 'background-blur') && (
                                <BackgroundEditor
                                    imageUrl={currentImageUrl}
                                    onEditComplete={handleEditComplete}
                                    onError={handleError}
                                />
                            )}

                        {/* Generative Fill */}
                        {selectedTool === 'generative-fill' && (
                            <GenerativeFillEditor
                                imageUrl={currentImageUrl}
                                onResult={handleEditComplete}
                            />
                        )}

                        {/* Enhancement Tools */}
                        {(selectedTool === 'enhance' || selectedTool === 'upscale') && (
                            <EnhancementEditor
                                imageUrl={currentImageUrl}
                                onEditComplete={handleEditComplete}
                                onError={handleError}
                            />
                        )}

                        {/* Canvas Expansion */}
                        {selectedTool === 'expand' && (
                            <CanvasExpander
                                imageUrl={currentImageUrl}
                                onEditComplete={handleEditComplete}
                                onError={handleError}
                            />
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

/**
 * Simpler example showing minimal integration
 */
export function SimpleEditingToolbarExample() {
    const [selectedTool, setSelectedTool] = useState<EditingTool>(null);

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Select an Editing Tool</h2>

            <EditingToolbar
                onToolSelect={setSelectedTool}
                selectedTool={selectedTool}
            />

            {selectedTool && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                        Selected tool: <strong>{selectedTool}</strong>
                    </p>
                </div>
            )}
        </div>
    );
}

export default EditingToolbarExample;
