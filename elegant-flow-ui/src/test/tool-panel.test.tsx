/**
 * ToolPanel Component Tests
 * 
 * Tests for the ToolPanel component
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ToolPanel } from '@/components/ToolPanel';

// Mock child components
vi.mock('@/components/BackgroundEditor', () => ({
    BackgroundEditor: ({ onEditComplete, onEditStart }: any) => (
        <div data-testid="background-editor">
            <button onClick={() => {
                onEditStart('remove-bg');
                onEditComplete('http://example.com/edited.jpg', 'remove-bg', {});
            }}>
                Remove Background
            </button>
        </div>
    ),
}));

vi.mock('@/components/GenerativeFillEditor', () => ({
    GenerativeFillEditor: ({ onResult, onEditStart }: any) => (
        <div data-testid="generative-fill-editor">
            <button onClick={() => {
                onEditStart('generative-fill');
                onResult('http://example.com/filled.jpg', 'test prompt');
            }}>
                Generate Fill
            </button>
        </div>
    ),
}));

vi.mock('@/components/EnhancementEditor', () => ({
    EnhancementEditor: ({ onEditComplete, onEditStart }: any) => (
        <div data-testid="enhancement-editor">
            <button onClick={() => {
                onEditStart('enhance');
                onEditComplete('http://example.com/enhanced.jpg', 'enhance', {});
            }}>
                Enhance
            </button>
        </div>
    ),
}));

vi.mock('@/components/CanvasExpander', () => ({
    CanvasExpander: ({ onEditComplete, onEditStart }: any) => (
        <div data-testid="canvas-expander">
            <button onClick={() => {
                onEditStart('expand-canvas');
                onEditComplete('http://example.com/expanded.jpg', {});
            }}>
                Expand Canvas
            </button>
        </div>
    ),
}));

describe('ToolPanel', () => {
    const mockImageUrl = 'http://example.com/test-image.jpg';
    const mockOnEditComplete = vi.fn();
    const mockOnEditStart = vi.fn();
    const mockOnEditError = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render tool panel with header', () => {
            render(
                <ToolPanel
                    currentImageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    isProcessing={false}
                />
            );

            expect(screen.getByText('Editing Tools')).toBeInTheDocument();
            expect(screen.getByText('Select a tool below to edit your image')).toBeInTheDocument();
        });

        it('should render all tool sections', () => {
            render(
                <ToolPanel
                    currentImageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    isProcessing={false}
                />
            );

            expect(screen.getByText('Background Tools')).toBeInTheDocument();
            expect(screen.getByText('Generative Fill')).toBeInTheDocument();
            expect(screen.getByText('Enhancement')).toBeInTheDocument();
            expect(screen.getByText('Canvas Expander')).toBeInTheDocument();
        });

        it('should have proper ARIA labels', () => {
            render(
                <ToolPanel
                    currentImageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    isProcessing={false}
                />
            );

            const region = screen.getByRole('region');
            expect(region).toHaveAttribute('aria-labelledby', 'tool-panel-heading');
            expect(region).toHaveAttribute('aria-describedby', 'tool-panel-description');
        });
    });

    describe('Tool Interactions', () => {
        it('should handle background editor completion', async () => {
            const user = userEvent.setup();

            render(
                <ToolPanel
                    currentImageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onEditStart={mockOnEditStart}
                    isProcessing={false}
                />
            );

            // Expand background tools section
            const backgroundTrigger = screen.getByRole('button', { name: /Background editing tools/i });
            await user.click(backgroundTrigger);

            // Click remove background
            const removeButton = await screen.findByText('Remove Background');
            await user.click(removeButton);

            expect(mockOnEditStart).toHaveBeenCalledWith('remove-bg');
            expect(mockOnEditComplete).toHaveBeenCalledWith('http://example.com/edited.jpg', 'remove-bg');
        });

        it('should handle generative fill completion', async () => {
            const user = userEvent.setup();

            render(
                <ToolPanel
                    currentImageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onEditStart={mockOnEditStart}
                    isProcessing={false}
                />
            );

            // Expand generative fill section
            const fillTrigger = screen.getByRole('button', { name: /Generative fill tool/i });
            await user.click(fillTrigger);

            // Click generate fill
            const fillButton = await screen.findByText('Generate Fill');
            await user.click(fillButton);

            expect(mockOnEditStart).toHaveBeenCalledWith('generative-fill');
            expect(mockOnEditComplete).toHaveBeenCalledWith('http://example.com/filled.jpg', 'generative-fill');
        });

        it('should handle enhancement completion', async () => {
            const user = userEvent.setup();

            render(
                <ToolPanel
                    currentImageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onEditStart={mockOnEditStart}
                    isProcessing={false}
                />
            );

            // Expand enhancement section
            const enhanceTrigger = screen.getByRole('button', { name: /Image enhancement tools/i });
            await user.click(enhanceTrigger);

            // Click enhance
            const enhanceButton = await screen.findByText('Enhance');
            await user.click(enhanceButton);

            expect(mockOnEditStart).toHaveBeenCalledWith('enhance');
            expect(mockOnEditComplete).toHaveBeenCalledWith('http://example.com/enhanced.jpg', 'enhance');
        });

        it('should handle canvas expander completion', async () => {
            const user = userEvent.setup();

            render(
                <ToolPanel
                    currentImageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onEditStart={mockOnEditStart}
                    isProcessing={false}
                />
            );

            // Expand canvas expander section
            const expandTrigger = screen.getByRole('button', { name: /Canvas expansion tool/i });
            await user.click(expandTrigger);

            // Click expand canvas
            const expandButton = await screen.findByText('Expand Canvas');
            await user.click(expandButton);

            expect(mockOnEditStart).toHaveBeenCalledWith('expand-canvas');
            expect(mockOnEditComplete).toHaveBeenCalledWith('http://example.com/expanded.jpg', 'expand-canvas');
        });
    });

    describe('Processing State', () => {
        it('should show processing indicator when isProcessing is true', () => {
            render(
                <ToolPanel
                    currentImageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    isProcessing={true}
                />
            );

            expect(screen.getByText('Processing... Please wait.')).toBeInTheDocument();
        });

        it('should disable accordion when processing', () => {
            render(
                <ToolPanel
                    currentImageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    isProcessing={true}
                />
            );

            const backgroundTrigger = screen.getByRole('button', { name: /Background editing tools/i });
            expect(backgroundTrigger).toBeDisabled();
        });

        it('should not show processing indicator when isProcessing is false', () => {
            render(
                <ToolPanel
                    currentImageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    isProcessing={false}
                />
            );

            expect(screen.queryByText('Processing... Please wait.')).not.toBeInTheDocument();
        });
    });

    describe('Accordion Behavior', () => {
        it('should expand and collapse tool sections', async () => {
            const user = userEvent.setup();

            render(
                <ToolPanel
                    currentImageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    isProcessing={false}
                />
            );

            // Initially, tool content should not be visible
            expect(screen.queryByTestId('background-editor')).not.toBeInTheDocument();

            // Click to expand
            const backgroundTrigger = screen.getByRole('button', { name: /Background editing tools/i });
            await user.click(backgroundTrigger);

            // Tool content should now be visible
            await waitFor(() => {
                expect(screen.getByTestId('background-editor')).toBeInTheDocument();
            });

            // Click to collapse
            await user.click(backgroundTrigger);

            // Tool content should be hidden again
            await waitFor(() => {
                expect(screen.queryByTestId('background-editor')).not.toBeInTheDocument();
            });
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA attributes for accordion', () => {
            render(
                <ToolPanel
                    currentImageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    isProcessing={false}
                />
            );

            const backgroundTrigger = screen.getByRole('button', { name: /Background editing tools/i });
            expect(backgroundTrigger).toHaveAttribute('aria-controls', 'background-tools-content');
        });

        it('should announce processing state to screen readers', () => {
            render(
                <ToolPanel
                    currentImageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    isProcessing={true}
                />
            );

            const processingStatus = screen.getByRole('status');
            expect(processingStatus).toHaveAttribute('aria-live', 'polite');
            expect(processingStatus).toHaveTextContent('Processing... Please wait.');
        });
    });
});
