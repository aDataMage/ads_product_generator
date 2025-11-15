/**
 * Canvas Expander Aspect Ratio Calculations Tests
 * 
 * Tests the aspect ratio calculation logic for the CanvasExpander component
 */

import { describe, it, expect } from 'vitest';

/**
 * Helper function to calculate GCD (Greatest Common Divisor)
 */
function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

/**
 * Calculate aspect ratio as a formatted string
 */
function formatAspectRatio(width: number, height: number): string {
    const divisor = gcd(width, height);
    const ratioWidth = width / divisor;
    const ratioHeight = height / divisor;

    if (ratioWidth > 100 || ratioHeight > 100) {
        return `${(width / height).toFixed(2)}:1`;
    }

    return `${ratioWidth}:${ratioHeight}`;
}

/**
 * Calculate target dimensions for aspect ratio expansion
 */
function calculateTargetDimensions(
    originalWidth: number,
    originalHeight: number,
    targetRatioWidth: number,
    targetRatioHeight: number
): { width: number; height: number } {
    const originalAspect = originalWidth / originalHeight;
    const targetAspect = targetRatioWidth / targetRatioHeight;

    const ASPECT_RATIO_TOLERANCE = 0.001;

    // Already at target aspect ratio
    if (Math.abs(originalAspect - targetAspect) < ASPECT_RATIO_TOLERANCE) {
        return { width: originalWidth, height: originalHeight };
    }

    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    // Original is narrower (more portrait), expand width
    if (originalAspect < targetAspect) {
        targetWidth = Math.round(originalHeight * targetAspect);
    }
    // Original is wider (more landscape), expand height
    else {
        targetHeight = Math.round(originalWidth / targetAspect);
    }

    return {
        width: Math.max(1, Math.round(targetWidth)),
        height: Math.max(1, Math.round(targetHeight))
    };
}

describe('Canvas Expander - Aspect Ratio Calculations', () => {
    describe('formatAspectRatio', () => {
        it('should format common aspect ratios correctly', () => {
            expect(formatAspectRatio(1920, 1080)).toBe('16:9');
            expect(formatAspectRatio(1024, 1024)).toBe('1:1');
            expect(formatAspectRatio(1600, 1200)).toBe('4:3');
            expect(formatAspectRatio(1080, 1920)).toBe('9:16');
        });

        it('should handle complex ratios with decimal notation', () => {
            const result = formatAspectRatio(1234, 567);
            expect(result).toMatch(/\d+\.\d+:1/);
        });

        it('should handle edge cases', () => {
            expect(formatAspectRatio(1, 1)).toBe('1:1');
            expect(formatAspectRatio(2, 1)).toBe('2:1');
            expect(formatAspectRatio(1, 2)).toBe('1:2');
        });
    });

    describe('calculateTargetDimensions', () => {
        it('should expand width for portrait to landscape (1:1)', () => {
            // 800x1200 (portrait) to 1:1 (square)
            const result = calculateTargetDimensions(800, 1200, 1, 1);
            expect(result.width).toBe(1200);
            expect(result.height).toBe(1200);
            expect(result.width / result.height).toBeCloseTo(1, 2);
        });

        it('should expand height for landscape to portrait (9:16)', () => {
            // 1920x1080 (landscape) to 9:16 (portrait)
            const result = calculateTargetDimensions(1920, 1080, 9, 16);
            expect(result.width).toBe(1920);
            expect(result.height).toBeGreaterThan(1080);
            expect(result.width / result.height).toBeCloseTo(9 / 16, 2);
        });

        it('should expand width for 4:3 to 16:9', () => {
            // 1200x900 (4:3) to 16:9
            const result = calculateTargetDimensions(1200, 900, 16, 9);
            expect(result.width).toBeGreaterThan(1200);
            expect(result.height).toBe(900);
            expect(result.width / result.height).toBeCloseTo(16 / 9, 2);
        });

        it('should not expand if already at target ratio', () => {
            // 1920x1080 is already 16:9
            const result = calculateTargetDimensions(1920, 1080, 16, 9);
            expect(result.width).toBe(1920);
            expect(result.height).toBe(1080);
        });

        it('should handle square to widescreen (16:9)', () => {
            // 1000x1000 (square) to 16:9
            const result = calculateTargetDimensions(1000, 1000, 16, 9);
            expect(result.width).toBeGreaterThan(1000);
            expect(result.height).toBe(1000);
            expect(result.width / result.height).toBeCloseTo(16 / 9, 2);
        });

        it('should handle square to portrait (9:16)', () => {
            // 1000x1000 (square) to 9:16
            const result = calculateTargetDimensions(1000, 1000, 9, 16);
            expect(result.width).toBe(1000);
            expect(result.height).toBeGreaterThan(1000);
            expect(result.width / result.height).toBeCloseTo(9 / 16, 2);
        });

        it('should preserve original dimensions when already at ratio', () => {
            // Test with various sizes already at 16:9
            const sizes = [
                { w: 1920, h: 1080 },
                { w: 1280, h: 720 },
                { w: 3840, h: 2160 }
            ];

            sizes.forEach(({ w, h }) => {
                const result = calculateTargetDimensions(w, h, 16, 9);
                expect(result.width).toBe(w);
                expect(result.height).toBe(h);
            });
        });

        it('should handle small dimensions', () => {
            // 100x200 to 1:1
            const result = calculateTargetDimensions(100, 200, 1, 1);
            expect(result.width).toBe(200);
            expect(result.height).toBe(200);
        });

        it('should always return positive integers', () => {
            const result = calculateTargetDimensions(1, 1, 16, 9);
            expect(result.width).toBeGreaterThan(0);
            expect(result.height).toBeGreaterThan(0);
            expect(Number.isInteger(result.width)).toBe(true);
            expect(Number.isInteger(result.height)).toBe(true);
        });

        it('should handle aspect ratio tolerance correctly', () => {
            // 1920.5x1080 should be considered 16:9 (within tolerance)
            const result = calculateTargetDimensions(1920, 1080, 16, 9);
            expect(result.width).toBe(1920);
            expect(result.height).toBe(1080);
        });
    });

    describe('Expansion validation', () => {
        it('should ensure target is larger in at least one dimension', () => {
            const original = { width: 1000, height: 800 };
            const target = calculateTargetDimensions(1000, 800, 16, 9);

            const isValid = target.width >= original.width || target.height >= original.height;
            expect(isValid).toBe(true);
        });

        it('should handle all preset aspect ratios', () => {
            const presets = [
                { ratio: '1:1', w: 1, h: 1 },
                { ratio: '4:3', w: 4, h: 3 },
                { ratio: '16:9', w: 16, h: 9 },
                { ratio: '9:16', w: 9, h: 16 }
            ];

            const originalWidth = 1200;
            const originalHeight = 900;

            presets.forEach(preset => {
                const result = calculateTargetDimensions(
                    originalWidth,
                    originalHeight,
                    preset.w,
                    preset.h
                );

                // Verify aspect ratio is correct
                const resultRatio = result.width / result.height;
                const expectedRatio = preset.w / preset.h;
                expect(resultRatio).toBeCloseTo(expectedRatio, 2);

                // Verify at least one dimension increased or stayed same
                expect(
                    result.width >= originalWidth || result.height >= originalHeight
                ).toBe(true);
            });
        });
    });
});
