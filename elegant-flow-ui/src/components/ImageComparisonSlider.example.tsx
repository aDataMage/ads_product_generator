/**
 * ImageComparisonSlider Usage Example
 * 
 * This file demonstrates how to use the ImageComparisonSlider component
 * for comparing original vs enhanced images.
 */

import { ImageComparisonSlider } from './ImageComparisonSlider';

/**
 * Basic usage example
 */
export function BasicExample() {
    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Image Comparison</h2>
            <ImageComparisonSlider
                beforeImage="https://example.com/original.jpg"
                afterImage="https://example.com/enhanced.jpg"
                beforeAlt="Original image"
                afterAlt="Enhanced image"
            />
        </div>
    );
}

/**
 * Example with custom initial position
 */
export function CustomPositionExample() {
    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Custom Initial Position</h2>
            <ImageComparisonSlider
                beforeImage="https://example.com/original.jpg"
                afterImage="https://example.com/enhanced.jpg"
                initialPosition={75} // Start with 75% of after image visible
            />
        </div>
    );
}

/**
 * Example integrated with EnhancementEditor
 * This shows how to use the comparison slider after an enhancement operation
 */
export function EnhancementComparisonExample() {
    const originalImageUrl = "https://example.com/original.jpg";
    const enhancedImageUrl = "https://example.com/enhanced.jpg";

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Compare Quality</h3>
            <p className="text-sm text-muted-foreground">
                Drag the slider to compare the original and enhanced versions
            </p>

            <ImageComparisonSlider
                beforeImage={originalImageUrl}
                afterImage={enhancedImageUrl}
                beforeAlt="Original product image"
                afterAlt="Enhanced product image"
                className="shadow-lg"
            />

            <div className="flex gap-2 justify-center">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
                    Download Original
                </button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
                    Download Enhanced
                </button>
            </div>
        </div>
    );
}

/**
 * Example with resolution information
 */
export function WithResolutionInfoExample() {
    const originalDimensions = { width: 1024, height: 768 };
    const enhancedDimensions = { width: 2048, height: 1536 };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted rounded">
                    <div className="font-medium mb-1">Original</div>
                    <div className="text-muted-foreground">
                        {originalDimensions.width} × {originalDimensions.height} px
                    </div>
                </div>
                <div className="p-3 bg-muted rounded">
                    <div className="font-medium mb-1">Enhanced</div>
                    <div className="text-primary">
                        {enhancedDimensions.width} × {enhancedDimensions.height} px
                    </div>
                </div>
            </div>

            <ImageComparisonSlider
                beforeImage="https://example.com/original.jpg"
                afterImage="https://example.com/enhanced.jpg"
            />
        </div>
    );
}

/**
 * Keyboard navigation instructions
 */
export function KeyboardNavigationExample() {
    return (
        <div className="space-y-4">
            <ImageComparisonSlider
                beforeImage="https://example.com/original.jpg"
                afterImage="https://example.com/enhanced.jpg"
            />

            <div className="p-4 bg-muted rounded text-sm">
                <h4 className="font-semibold mb-2">Keyboard Controls:</h4>
                <ul className="space-y-1 text-muted-foreground">
                    <li>• <kbd className="px-2 py-1 bg-background rounded">←</kbd> Move slider left</li>
                    <li>• <kbd className="px-2 py-1 bg-background rounded">→</kbd> Move slider right</li>
                    <li>• <kbd className="px-2 py-1 bg-background rounded">Home</kbd> Jump to start (show all before)</li>
                    <li>• <kbd className="px-2 py-1 bg-background rounded">End</kbd> Jump to end (show all after)</li>
                </ul>
            </div>
        </div>
    );
}
