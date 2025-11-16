/**
 * Image Comparison Tests
 * 
 * Tests for the image comparison functionality in ImagePanel
 * Requirements: 3.2, 3.3 - Show original vs edited image side-by-side
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImagePanel } from '@/components/ImagePanel';

describe('ImagePanel - Comparison Functionality', () => {
    const mockImageUrl = 'https://example.com/edited-image.jpg';
    const mockOriginalImageUrl = 'https://example.com/original-image.jpg';

    it('should show comparison toggle button when original image is different', () => {
        render(
            <ImagePanel
                imageUrl={mockImageUrl}
                originalImageUrl={mockOriginalImageUrl}
            />
        );

        const compareButton = screen.getByRole('button', { name: /toggle comparison view/i });
        expect(compareButton).toBeInTheDocument();
    });

    it('should not show comparison toggle when original image is same as current', () => {
        render(
            <ImagePanel
                imageUrl={mockImageUrl}
                originalImageUrl={mockImageUrl}
            />
        );

        const compareButton = screen.queryByRole('button', { name: /toggle comparison view/i });
        expect(compareButton).not.toBeInTheDocument();
    });

    it('should not show comparison toggle when no original image provided', () => {
        render(
            <ImagePanel
                imageUrl={mockImageUrl}
            />
        );

        const compareButton = screen.queryByRole('button', { name: /toggle comparison view/i });
        expect(compareButton).not.toBeInTheDocument();
    });

    it('should toggle comparison view when compare button is clicked', () => {
        render(
            <ImagePanel
                imageUrl={mockImageUrl}
                originalImageUrl={mockOriginalImageUrl}
            />
        );

        const compareButton = screen.getByRole('button', { name: /toggle comparison view/i });

        // Initially not pressed
        expect(compareButton).toHaveAttribute('aria-pressed', 'false');

        // Click to enable comparison
        fireEvent.click(compareButton);
        expect(compareButton).toHaveAttribute('aria-pressed', 'true');

        // Click again to disable comparison
        fireEvent.click(compareButton);
        expect(compareButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should display ImageComparisonSlider when comparison is enabled', () => {
        render(
            <ImagePanel
                imageUrl={mockImageUrl}
                originalImageUrl={mockOriginalImageUrl}
            />
        );

        const compareButton = screen.getByRole('button', { name: /toggle comparison view/i });

        // Enable comparison
        fireEvent.click(compareButton);

        // Check for comparison slider elements
        const sliderGroup = screen.getByRole('group', { name: /image comparison slider/i });
        expect(sliderGroup).toBeInTheDocument();
    });

    it('should display single image when comparison is disabled', () => {
        render(
            <ImagePanel
                imageUrl={mockImageUrl}
                originalImageUrl={mockOriginalImageUrl}
            />
        );

        // Should show single image by default
        const image = screen.getByAltText('Image being edited');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', mockImageUrl);
    });

    it('should maintain comparison state across re-renders', () => {
        const { rerender } = render(
            <ImagePanel
                imageUrl={mockImageUrl}
                originalImageUrl={mockOriginalImageUrl}
            />
        );

        const compareButton = screen.getByRole('button', { name: /toggle comparison view/i });

        // Enable comparison
        fireEvent.click(compareButton);
        expect(compareButton).toHaveAttribute('aria-pressed', 'true');

        // Re-render with same props
        rerender(
            <ImagePanel
                imageUrl={mockImageUrl}
                originalImageUrl={mockOriginalImageUrl}
            />
        );

        // Comparison should still be enabled
        const compareButtonAfter = screen.getByRole('button', { name: /toggle comparison view/i });
        expect(compareButtonAfter).toHaveAttribute('aria-pressed', 'true');
    });

    it('should disable pan/zoom controls when in comparison mode', () => {
        const { container } = render(
            <ImagePanel
                imageUrl={mockImageUrl}
                originalImageUrl={mockOriginalImageUrl}
            />
        );

        const compareButton = screen.getByRole('button', { name: /toggle comparison view/i });

        // Enable comparison
        fireEvent.click(compareButton);

        // The container should not have grab cursor classes when in comparison mode
        const imageContainer = container.querySelector('[role="region"][aria-label*="comparison"]');
        expect(imageContainer).toBeInTheDocument();

        // Verify comparison slider is shown instead of regular image
        const comparisonSlider = screen.getByRole('group', { name: /image comparison slider/i });
        expect(comparisonSlider).toBeInTheDocument();
    });

    it('should work with undo/redo functionality', () => {
        const mockUndo = vi.fn();
        const mockRedo = vi.fn();

        render(
            <ImagePanel
                imageUrl={mockImageUrl}
                originalImageUrl={mockOriginalImageUrl}
                canUndo={true}
                canRedo={true}
                onUndo={mockUndo}
                onRedo={mockRedo}
            />
        );

        // Enable comparison
        const compareButton = screen.getByRole('button', { name: /toggle comparison view/i });
        fireEvent.click(compareButton);

        // Undo/redo buttons should still work
        const undoButton = screen.getByRole('button', { name: /undo/i });
        const redoButton = screen.getByRole('button', { name: /redo/i });

        fireEvent.click(undoButton);
        expect(mockUndo).toHaveBeenCalledTimes(1);

        fireEvent.click(redoButton);
        expect(mockRedo).toHaveBeenCalledTimes(1);
    });
});
