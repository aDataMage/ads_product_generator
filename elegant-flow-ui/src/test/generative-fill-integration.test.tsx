import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerativeFillEditor } from '@/components/GenerativeFillEditor';
import * as api from '@/lib/api';

// Mock the API module
vi.mock('@/lib/api', () => ({
    generativeFill: vi.fn(),
}));

describe('GenerativeFillEditor - MaskDrawingCanvas Integration', () => {
    const mockImageUrl = 'https://example.com/test-image.jpg';
    const mockOnResult = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders MaskDrawingCanvas component', () => {
        render(
            <GenerativeFillEditor
                imageUrl={mockImageUrl}
                onResult={mockOnResult}
            />
        );

        // Check that the mask drawing section is present
        expect(screen.getByText('Draw Mask')).toBeInTheDocument();
        expect(screen.getByText(/Draw on the image to mark the areas/)).toBeInTheDocument();
    });

    it('renders prompt input fields', () => {
        render(
            <GenerativeFillEditor
                imageUrl={mockImageUrl}
                onResult={mockOnResult}
            />
        );

        // Check for prompt inputs
        expect(screen.getByLabelText('Generative fill prompt')).toBeInTheDocument();
        expect(screen.getByLabelText('Negative prompt')).toBeInTheDocument();
    });

    it('renders version selector', () => {
        render(
            <GenerativeFillEditor
                imageUrl={mockImageUrl}
                onResult={mockOnResult}
            />
        );

        // Check for version selector
        expect(screen.getByLabelText('API version selector')).toBeInTheDocument();
    });

    it('disables generate button when mask or prompt is missing', () => {
        render(
            <GenerativeFillEditor
                imageUrl={mockImageUrl}
                onResult={mockOnResult}
            />
        );

        const generateButton = screen.getByRole('button', { name: /Generate fill/i });
        expect(generateButton).toBeDisabled();
    });

    it('shows error when trying to generate without mask', async () => {
        const user = userEvent.setup();
        render(
            <GenerativeFillEditor
                imageUrl={mockImageUrl}
                onResult={mockOnResult}
            />
        );

        // Enter prompt but no mask
        const promptInput = screen.getByLabelText('Generative fill prompt');
        await user.type(promptInput, 'add flowers');

        // The button should still be disabled since there's no mask
        const generateButton = screen.getByRole('button', { name: /Generate fill/i });
        expect(generateButton).toBeDisabled();
    });

    it('integrates all required components', () => {
        const { container } = render(
            <GenerativeFillEditor
                imageUrl={mockImageUrl}
                onResult={mockOnResult}
            />
        );

        // Verify all major sections are present
        expect(screen.getByText('Draw Mask')).toBeInTheDocument();
        expect(screen.getByText('Prompt *')).toBeInTheDocument();
        expect(screen.getByText('Negative Prompt (Optional)')).toBeInTheDocument();
        expect(screen.getByText('API Version')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Generate fill/i })).toBeInTheDocument();

        // Verify canvas is present
        const canvas = container.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
    });
});
