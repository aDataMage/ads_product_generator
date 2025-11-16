/**
 * Tests for Original vs Current Image Toggle
 * Task 6.1: Show current vs original image toggle
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultsPanel from '@/components/ResultsPanel';

// Mock the useImageEditor hook
vi.mock('@/hooks/useImageEditor', () => ({
    useImageEditor: () => ({
        originalImageUrl: 'https://example.com/original.jpg',
        currentImageUrl: 'https://example.com/edited.jpg',
        editHistory: [
            {
                type: 'remove-bg',
                params: {},
                resultUrl: 'https://example.com/edited.jpg',
                timestamp: Date.now(),
            },
        ],
        canUndo: true,
        canRedo: false,
        setOriginalImage: vi.fn(),
        addEdit: vi.fn(),
        undo: vi.fn(),
        redo: vi.fn(),
        resetToOriginal: vi.fn(),
    }),
}));

describe('Original vs Current Image Toggle', () => {
    it('should show toggle button when edits exist', () => {
        render(
            <ResultsPanel
                isLoading={false}
                generatedImageUrl="https://example.com/original.jpg"
                error={null}
            />
        );

        // Toggle button should be visible
        const toggleButton = screen.getByRole('button', { name: /show original/i });
        expect(toggleButton).toBeInTheDocument();
    });

    it('should toggle between original and edited image', async () => {
        const user = userEvent.setup();

        render(
            <ResultsPanel
                isLoading={false}
                generatedImageUrl="https://example.com/original.jpg"
                error={null}
            />
        );

        // Initially showing edited image
        const image = screen.getByAltText(/generated product image/i);
        expect(image).toHaveAttribute('src', 'https://example.com/edited.jpg');

        // Click toggle to show original
        const toggleButton = screen.getByRole('button', { name: /show original/i });
        await user.click(toggleButton);

        // Should now show original image
        await waitFor(() => {
            const originalImage = screen.getByAltText(/original product image/i);
            expect(originalImage).toHaveAttribute('src', 'https://example.com/original.jpg');
        });

        // Button text should change
        expect(screen.getByRole('button', { name: /show edited/i })).toBeInTheDocument();
    });

    it('should show indicator when viewing original', async () => {
        const user = userEvent.setup();

        render(
            <ResultsPanel
                isLoading={false}
                generatedImageUrl="https://example.com/original.jpg"
                error={null}
            />
        );

        // Enter edit mode first
        const editButton = screen.getByRole('button', { name: /edit generated image/i });
        await user.click(editButton);

        // Click toggle to show original
        const toggleButton = screen.getByRole('button', { name: /show original/i });
        await user.click(toggleButton);

        // Should show "Viewing original image" indicator
        await waitFor(() => {
            expect(screen.getByText(/viewing original image/i)).toBeInTheDocument();
        });
    });

    it('should have proper ARIA attributes', () => {
        render(
            <ResultsPanel
                isLoading={false}
                generatedImageUrl="https://example.com/original.jpg"
                error={null}
            />
        );

        const toggleButton = screen.getByRole('button', { name: /show original/i });

        // Should have aria-pressed attribute
        expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should update aria-pressed when toggled', async () => {
        const user = userEvent.setup();

        render(
            <ResultsPanel
                isLoading={false}
                generatedImageUrl="https://example.com/original.jpg"
                error={null}
            />
        );

        const toggleButton = screen.getByRole('button', { name: /show original/i });

        // Initially not pressed
        expect(toggleButton).toHaveAttribute('aria-pressed', 'false');

        // Click to toggle
        await user.click(toggleButton);

        // Should now be pressed
        await waitFor(() => {
            const updatedButton = screen.getByRole('button', { name: /show edited/i });
            expect(updatedButton).toHaveAttribute('aria-pressed', 'true');
        });
    });
});
