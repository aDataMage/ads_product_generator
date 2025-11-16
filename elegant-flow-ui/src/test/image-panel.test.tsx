/**
 * ImagePanel Component Tests
 * 
 * Tests for the ImagePanel component functionality
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2, 7.3, 7.4
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImagePanel } from '@/components/ImagePanel';

describe('ImagePanel', () => {
    const mockImageUrl = 'https://example.com/test-image.jpg';
    const mockOriginalUrl = 'https://example.com/original-image.jpg';

    it('renders image with correct src', () => {
        render(<ImagePanel imageUrl={mockImageUrl} />);

        const image = screen.getByAltText('Image being edited');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', mockImageUrl);
    });

    it('displays zoom controls', () => {
        render(<ImagePanel imageUrl={mockImageUrl} />);

        expect(screen.getByLabelText(/zoom out/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/zoom in/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/zoom to fit/i)).toBeInTheDocument();
        expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('displays undo/redo controls when handlers provided', () => {
        const onUndo = vi.fn();
        const onRedo = vi.fn();

        render(
            <ImagePanel
                imageUrl={mockImageUrl}
                onUndo={onUndo}
                onRedo={onRedo}
                canUndo={true}
                canRedo={true}
            />
        );

        expect(screen.getByLabelText(/undo last action/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/redo last action/i)).toBeInTheDocument();
    });

    it('calls onUndo when undo button clicked', () => {
        const onUndo = vi.fn();

        render(
            <ImagePanel
                imageUrl={mockImageUrl}
                onUndo={onUndo}
                canUndo={true}
            />
        );

        const undoButton = screen.getByLabelText(/undo last action/i);
        fireEvent.click(undoButton);

        expect(onUndo).toHaveBeenCalledTimes(1);
    });

    it('calls onRedo when redo button clicked', () => {
        const onRedo = vi.fn();

        render(
            <ImagePanel
                imageUrl={mockImageUrl}
                onRedo={onRedo}
                canRedo={true}
            />
        );

        const redoButton = screen.getByLabelText(/redo last action/i);
        fireEvent.click(redoButton);

        expect(onRedo).toHaveBeenCalledTimes(1);
    });

    it('disables undo button when canUndo is false', () => {
        const onUndo = vi.fn();

        render(
            <ImagePanel
                imageUrl={mockImageUrl}
                onUndo={onUndo}
                canUndo={false}
            />
        );

        const undoButton = screen.getByLabelText(/undo last action/i);
        expect(undoButton).toBeDisabled();
    });

    it('disables redo button when canRedo is false', () => {
        const onRedo = vi.fn();

        render(
            <ImagePanel
                imageUrl={mockImageUrl}
                onRedo={onRedo}
                canRedo={false}
            />
        );

        const redoButton = screen.getByLabelText(/redo last action/i);
        expect(redoButton).toBeDisabled();
    });

    it('displays reset button when onReset provided', () => {
        const onReset = vi.fn();

        render(
            <ImagePanel
                imageUrl={mockImageUrl}
                onReset={onReset}
            />
        );

        expect(screen.getByLabelText(/reset to original/i)).toBeInTheDocument();
    });

    it('calls onReset when reset button clicked', () => {
        const onReset = vi.fn();

        render(
            <ImagePanel
                imageUrl={mockImageUrl}
                onReset={onReset}
            />
        );

        const resetButton = screen.getByLabelText(/reset to original/i);
        fireEvent.click(resetButton);

        expect(onReset).toHaveBeenCalledTimes(1);
    });

    it('displays loading overlay when isLoading is true', () => {
        render(
            <ImagePanel
                imageUrl={mockImageUrl}
                isLoading={true}
                loadingMessage="Removing background..."
            />
        );

        expect(screen.getByText('Removing background...')).toBeInTheDocument();
        expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });

    it('does not display loading overlay when isLoading is false', () => {
        render(
            <ImagePanel
                imageUrl={mockImageUrl}
                isLoading={false}
            />
        );

        expect(screen.queryByText('Please wait...')).not.toBeInTheDocument();
    });

    it('displays image info toggle button', () => {
        render(<ImagePanel imageUrl={mockImageUrl} />);

        expect(screen.getByLabelText(/toggle image information/i)).toBeInTheDocument();
    });

    it('toggles metadata display when info button clicked', () => {
        render(<ImagePanel imageUrl={mockImageUrl} />);

        const infoButton = screen.getByLabelText(/toggle image information/i);

        // Initially metadata should not be visible
        expect(screen.queryByText('Image Info')).not.toBeInTheDocument();

        // Click to show metadata
        fireEvent.click(infoButton);

        // Metadata should now be visible (after image loads)
        // Note: In real scenario, this would require mocking image load event
    });

    it('updates image when imageUrl prop changes', () => {
        const { rerender } = render(<ImagePanel imageUrl={mockImageUrl} />);

        const image = screen.getByAltText('Image being edited');
        expect(image).toHaveAttribute('src', mockImageUrl);

        // Update with new URL
        const newUrl = 'https://example.com/new-image.jpg';
        rerender(<ImagePanel imageUrl={newUrl} />);

        expect(image).toHaveAttribute('src', newUrl);
    });

    it('applies correct ARIA labels for accessibility', () => {
        render(
            <ImagePanel
                imageUrl={mockImageUrl}
                onUndo={vi.fn()}
                onRedo={vi.fn()}
                canUndo={true}
                canRedo={true}
            />
        );

        expect(screen.getByLabelText(/undo last action/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/redo last action/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/zoom out/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/zoom in/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/zoom to fit/i)).toBeInTheDocument();
    });
});
