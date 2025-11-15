/**
 * CanvasExpander Component - Usage Example
 * 
 * This file demonstrates how to use the CanvasExpander component
 * and shows examples of aspect ratio calculations.
 */

import { CanvasExpander } from './CanvasExpander';

/**
 * Example: Basic usage with a generated image
 */
export function BasicCanvasExpanderExample() {
    const handleEditComplete = (editedImageUrl: string) => {
        console.log('Canvas expanded successfully:', editedImageUrl);
        // Handle the edited image (e.g., display it, save it, etc.)
    };

    const handleError = (error: string) => {
        console.error('Canvas expansion failed:', error);
        // Handle the error (e.g., show error message to user)
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Canvas Expander Example</h1>

            <CanvasExpander
                imageUrl="https://example.com/product-image.jpg"
                onEditComplete={handleEditComplete}
                onError={handleError}
            />
        </div>
    );
}

/**
 * Example: Aspect ratio calculation scenarios
 */
export const AspectRatioExamples = {
    /**
     * Scenario 1: Portrait to Square (1:1)
     * Original: 800×1200 (portrait, 2:3 ratio)
     * Target: 1:1 (square)
     * Result: 1200×1200 (expands width to match height)
     */
    portraitToSquare: {
        original: { width: 800, height: 1200 },
        target: { width: 1200, height: 1200 },
        expansion: 'width',
        description: 'Expands width to create a square canvas'
    },

    /**
     * Scenario 2: Landscape to Portrait (9:16)
     * Original: 1920×1080 (landscape, 16:9 ratio)
     * Target: 9:16 (portrait)
     * Result: 1920×3413 (expands height significantly)
     */
    landscapeToPortrait: {
        original: { width: 1920, height: 1080 },
        target: { width: 1920, height: 3413 },
        expansion: 'height',
        description: 'Expands height to create a portrait canvas'
    },

    /**
     * Scenario 3: Standard to Widescreen (4:3 to 16:9)
     * Original: 1200×900 (4:3 ratio)
     * Target: 16:9
     * Result: 1600×900 (expands width)
     */
    standardToWidescreen: {
        original: { width: 1200, height: 900 },
        target: { width: 1600, height: 900 },
        expansion: 'width',
        description: 'Expands width to create a widescreen canvas'
    },

    /**
     * Scenario 4: Square to Widescreen (1:1 to 16:9)
     * Original: 1000×1000 (square)
     * Target: 16:9
     * Result: 1778×1000 (expands width)
     */
    squareToWidescreen: {
        original: { width: 1000, height: 1000 },
        target: { width: 1778, height: 1000 },
        expansion: 'width',
        description: 'Expands width to create a widescreen canvas'
    },

    /**
     * Scenario 5: Already at target ratio
     * Original: 1920×1080 (16:9)
     * Target: 16:9
     * Result: 1920×1080 (no expansion needed)
     */
    alreadyAtRatio: {
        original: { width: 1920, height: 1080 },
        target: { width: 1920, height: 1080 },
        expansion: 'none',
        description: 'No expansion needed - already at target ratio'
    }
};

/**
 * Example: Custom dimension validation scenarios
 */
export const ValidationExamples = {
    /**
     * Valid: Expands width
     */
    validWidthExpansion: {
        original: { width: 1000, height: 800 },
        custom: { width: 1500, height: 800 },
        valid: true,
        reason: 'Width increased'
    },

    /**
     * Valid: Expands height
     */
    validHeightExpansion: {
        original: { width: 1000, height: 800 },
        custom: { width: 1000, height: 1200 },
        valid: true,
        reason: 'Height increased'
    },

    /**
     * Valid: Expands both dimensions
     */
    validBothExpansion: {
        original: { width: 1000, height: 800 },
        custom: { width: 1500, height: 1200 },
        valid: true,
        reason: 'Both dimensions increased'
    },

    /**
     * Invalid: Shrinks both dimensions
     */
    invalidShrink: {
        original: { width: 1000, height: 800 },
        custom: { width: 800, height: 600 },
        valid: false,
        reason: 'Both dimensions decreased - not an expansion'
    },

    /**
     * Invalid: Exceeds maximum
     */
    invalidTooLarge: {
        original: { width: 1000, height: 800 },
        custom: { width: 15000, height: 800 },
        valid: false,
        reason: 'Width exceeds maximum of 10,000 pixels'
    },

    /**
     * Invalid: Zero or negative
     */
    invalidNegative: {
        original: { width: 1000, height: 800 },
        custom: { width: -100, height: 800 },
        valid: false,
        reason: 'Dimensions must be positive'
    }
};

/**
 * Example: Aspect ratio formatting
 */
export const AspectRatioFormatExamples = {
    common: [
        { dimensions: { width: 1920, height: 1080 }, formatted: '16:9' },
        { dimensions: { width: 1024, height: 1024 }, formatted: '1:1' },
        { dimensions: { width: 1600, height: 1200 }, formatted: '4:3' },
        { dimensions: { width: 1080, height: 1920 }, formatted: '9:16' },
        { dimensions: { width: 2560, height: 1440 }, formatted: '16:9' },
        { dimensions: { width: 3840, height: 2160 }, formatted: '16:9' }
    ],
    complex: [
        { dimensions: { width: 1234, height: 567 }, formatted: '2.18:1' },
        { dimensions: { width: 1366, height: 768 }, formatted: '683:384' }
    ]
};

export default BasicCanvasExpanderExample;
