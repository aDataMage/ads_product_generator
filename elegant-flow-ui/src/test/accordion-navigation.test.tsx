/**
 * Accordion Navigation Test
 * 
 * Tests the accordion-based navigation between editing tools in ResultsPanel
 * Task 6.1: Add tab/accordion navigation between tools
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultsPanel from '../components/ResultsPanel';

describe('Accordion Navigation in ResultsPanel', () => {
    const mockImageUrl = 'https://example.com/test-image.jpg';

    it('should display accordion sections when in editing mode', async () => {
        const user = userEvent.setup();

        render(
            <ResultsPanel
                isLoading={false}
                generatedImageUrl={mockImageUrl}
                error={null}
            />
        );

        // Click Edit Image button to enter editing mode
        const editButton = screen.getByRole('button', { name: /edit generated image/i });
        await user.click(editButton);

        // Wait for editing mode to activate
        await waitFor(() => {
            expect(screen.getByText('Edit Image')).toBeInTheDocument();
        });

        // Check that all accordion sections are present
        expect(screen.getByText('Background Editing')).toBeInTheDocument();
        expect(screen.getByText('Generative Fill')).toBeInTheDocument();
        expect(screen.getByText('Enhancement')).toBeInTheDocument();
        expect(screen.getByText('Canvas Expansion')).toBeInTheDocument();
    });

    it('should expand accordion section when clicked', async () => {
        const user = userEvent.setup();

        render(
            <ResultsPanel
                isLoading={false}
                generatedImageUrl={mockImageUrl}
                error={null}
            />
        );

        // Enter editing mode
        const editButton = screen.getByRole('button', { name: /edit generated image/i });
        await user.click(editButton);

        // Click on Background Editing accordion trigger
        const backgroundTrigger = screen.getByRole('button', { name: /background editing tools/i });
        await user.click(backgroundTrigger);

        // Check that Background Editor content is visible
        await waitFor(() => {
            expect(screen.getByText('Background Editor')).toBeInTheDocument();
        });
    });

    it('should collapse previous section when opening a new one', async () => {
        const user = userEvent.setup();

        render(
            <ResultsPanel
                isLoading={false}
                generatedImageUrl={mockImageUrl}
                error={null}
            />
        );

        // Enter editing mode
        const editButton = screen.getByRole('button', { name: /edit generated image/i });
        await user.click(editButton);

        // Open Background Editing
        const backgroundTrigger = screen.getByRole('button', { name: /background editing tools/i });
        await user.click(backgroundTrigger);

        await waitFor(() => {
            expect(screen.getByText('Background Editor')).toBeInTheDocument();
        });

        // Open Enhancement section
        const enhancementTrigger = screen.getByRole('button', { name: /image enhancement tools/i });
        await user.click(enhancementTrigger);

        // Background Editor should no longer be visible (collapsed)
        await waitFor(() => {
            expect(screen.queryByText('Background Editor')).not.toBeInTheDocument();
        });

        // Enhancement Editor should be visible
        expect(screen.getByText('Image Enhancement')).toBeInTheDocument();
    });

    it('should allow closing accordion section by clicking trigger again', async () => {
        const user = userEvent.setup();

        render(
            <ResultsPanel
                isLoading={false}
                generatedImageUrl={mockImageUrl}
                error={null}
            />
        );

        // Enter editing mode
        const editButton = screen.getByRole('button', { name: /edit generated image/i });
        await user.click(editButton);

        // Open Generative Fill
        const genFillTrigger = screen.getByRole('button', { name: /generative fill tool/i });
        await user.click(genFillTrigger);

        await waitFor(() => {
            expect(screen.getByText('Draw Mask')).toBeInTheDocument();
        });

        // Click again to close
        await user.click(genFillTrigger);

        // Content should be hidden
        await waitFor(() => {
            expect(screen.queryByText('Draw Mask')).not.toBeInTheDocument();
        });
    });

    it('should maintain accordion state when switching between sections', async () => {
        const user = userEvent.setup();

        render(
            <ResultsPanel
                isLoading={false}
                generatedImageUrl={mockImageUrl}
                error={null}
            />
        );

        // Enter editing mode
        const editButton = screen.getByRole('button', { name: /edit generated image/i });
        await user.click(editButton);

        // Open Canvas Expansion
        const expandTrigger = screen.getByRole('button', { name: /canvas expansion tool/i });
        await user.click(expandTrigger);

        await waitFor(() => {
            expect(screen.getByText('Canvas Expander')).toBeInTheDocument();
        });

        // Open Enhancement
        const enhancementTrigger = screen.getByRole('button', { name: /image enhancement tools/i });
        await user.click(enhancementTrigger);

        await waitFor(() => {
            expect(screen.getByText('Image Enhancement')).toBeInTheDocument();
        });

        // Canvas Expander should be collapsed
        expect(screen.queryByText('Canvas Expander')).not.toBeInTheDocument();
    });

    it('should have proper ARIA attributes for accessibility', async () => {
        const user = userEvent.setup();

        render(
            <ResultsPanel
                isLoading={false}
                generatedImageUrl={mockImageUrl}
                error={null}
            />
        );

        // Enter editing mode
        const editButton = screen.getByRole('button', { name: /edit generated image/i });
        await user.click(editButton);

        // Check accordion triggers have proper ARIA labels
        const backgroundTrigger = screen.getByRole('button', { name: /background editing tools/i });
        const genFillTrigger = screen.getByRole('button', { name: /generative fill tool/i });
        const enhancementTrigger = screen.getByRole('button', { name: /image enhancement tools/i });
        const expandTrigger = screen.getByRole('button', { name: /canvas expansion tool/i });

        expect(backgroundTrigger).toBeInTheDocument();
        expect(genFillTrigger).toBeInTheDocument();
        expect(enhancementTrigger).toBeInTheDocument();
        expect(expandTrigger).toBeInTheDocument();
    });

    it('should exit editing mode and close all accordions', async () => {
        const user = userEvent.setup();

        render(
            <ResultsPanel
                isLoading={false}
                generatedImageUrl={mockImageUrl}
                error={null}
            />
        );

        // Enter editing mode
        const editButton = screen.getByRole('button', { name: /edit generated image/i });
        await user.click(editButton);

        // Open an accordion section
        const backgroundTrigger = screen.getByRole('button', { name: /background editing tools/i });
        await user.click(backgroundTrigger);

        await waitFor(() => {
            expect(screen.getByText('Background Editor')).toBeInTheDocument();
        });

        // Exit editing mode
        const closeButton = screen.getByRole('button', { name: /close editing mode/i });
        await user.click(closeButton);

        // Editing UI should be hidden
        await waitFor(() => {
            expect(screen.queryByText('Edit Image')).not.toBeInTheDocument();
            expect(screen.queryByText('Background Editor')).not.toBeInTheDocument();
        });

        // Edit button should be visible again
        expect(screen.getByRole('button', { name: /edit generated image/i })).toBeInTheDocument();
    });
});
