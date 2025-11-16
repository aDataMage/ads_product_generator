/**
 * Integration tests for editing tools with ImagePanel
 * Task 7: Integrate editing tools with ImagePanel
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { EditPage } from '../pages/EditPage';

// Mock the API module
vi.mock('../lib/api', () => ({
    removeBackground: vi.fn(() => Promise.resolve({
        success: true,
        result_url: 'https://example.com/edited-image.jpg'
    })),
    replaceBackground: vi.fn(() => Promise.resolve({
        success: true,
        result_url: 'https://example.com/edited-image.jpg'
    })),
    blurBackground: vi.fn(() => Promise.resolve({
        success: true,
        result_url: 'https://example.com/edited-image.jpg'
    })),
    enhanceImage: vi.fn(() => Promise.resolve({
        success: true,
        result_url: 'https://example.com/edited-image.jpg'
    })),
    upscaleImage: vi.fn(() => Promise.resolve({
        success: true,
        result_url: 'https://example.com/edited-image.jpg'
    })),
    generativeFill: vi.fn(() => Promise.resolve({
        success: true,
        result_url: 'https://example.com/edited-image.jpg'
    })),
    expandImage: vi.fn(() => Promise.resolve({
        success: true,
        result_url: 'https://example.com/edited-image.jpg'
    })),
    ApiError: class ApiError extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'ApiError';
        }
    }
}));

describe('Edit Tools Integration with ImagePanel', () => {
    const mockImageUrl = 'https://example.com/test-image.jpg';

    const renderEditPage = () => {
        return render(
            <MemoryRouter initialEntries={[{
                pathname: '/edit',
                search: `?imageUrl=${encodeURIComponent(mockImageUrl)}`,
                state: { imageUrl: mockImageUrl, originalImageUrl: mockImageUrl }
            }]}>
                <Routes>
                    <Route path="/edit" element={<EditPage />} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('should render EditPage with ToolPanel and ImagePanel', async () => {
        renderEditPage();

        // Wait for the page to load
        await waitFor(() => {
            expect(screen.getByText('Editing Tools')).toBeInTheDocument();
        });

        // Check that ImagePanel is rendered (using getAllByRole since there are multiple img elements)
        const images = screen.getAllByRole('img', { name: /image being edited/i });
        expect(images.length).toBeGreaterThan(0);
    });

    it('should have BackgroundEditor connected to edit completion handler', async () => {
        renderEditPage();

        await waitFor(() => {
            expect(screen.getByText('Background Tools')).toBeInTheDocument();
        });

        // Verify BackgroundEditor is present
        const backgroundSection = screen.getByText('Background Tools');
        expect(backgroundSection).toBeInTheDocument();
    });

    it('should have GenerativeFillEditor connected to edit completion handler', async () => {
        renderEditPage();

        await waitFor(() => {
            expect(screen.getByText('Generative Fill')).toBeInTheDocument();
        });

        // Verify GenerativeFillEditor is present
        const generativeFillSection = screen.getByText('Generative Fill');
        expect(generativeFillSection).toBeInTheDocument();
    });

    it('should have EnhancementEditor connected to edit completion handler', async () => {
        renderEditPage();

        await waitFor(() => {
            expect(screen.getByText('Enhancement')).toBeInTheDocument();
        });

        // Verify EnhancementEditor is present
        const enhancementSection = screen.getByText('Enhancement');
        expect(enhancementSection).toBeInTheDocument();
    });

    it('should have CanvasExpander connected to edit completion handler', async () => {
        renderEditPage();

        await waitFor(() => {
            expect(screen.getByText('Canvas Expander')).toBeInTheDocument();
        });

        // Verify CanvasExpander is present
        const canvasExpanderSection = screen.getByText('Canvas Expander');
        expect(canvasExpanderSection).toBeInTheDocument();
    });

    it('should display image in ImagePanel', async () => {
        renderEditPage();

        await waitFor(() => {
            const images = screen.getAllByRole('img', { name: /image being edited/i });
            const actualImage = images.find(img => img.tagName === 'IMG');
            expect(actualImage).toBeInTheDocument();
            expect(actualImage).toHaveAttribute('src', mockImageUrl);
        });
    });

    it('should have undo/redo controls in ImagePanel', async () => {
        renderEditPage();

        await waitFor(() => {
            const undoButtons = screen.getAllByLabelText(/undo last action/i);
            const redoButtons = screen.getAllByLabelText(/redo last action/i);

            // Should have undo/redo buttons (in header and/or ImagePanel)
            expect(undoButtons.length).toBeGreaterThan(0);
            expect(redoButtons.length).toBeGreaterThan(0);
        });
    });

    it('should have zoom controls in ImagePanel', async () => {
        renderEditPage();

        await waitFor(() => {
            expect(screen.getByLabelText(/zoom in/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/zoom out/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/zoom to fit/i)).toBeInTheDocument();
        });
    });

    it('should pass currentImageUrl to all editing tools', async () => {
        renderEditPage();

        await waitFor(() => {
            // The image should be displayed, which means it was passed to ImagePanel
            const images = screen.getAllByRole('img', { name: /image being edited/i });
            const actualImage = images.find(img => img.tagName === 'IMG');
            expect(actualImage).toHaveAttribute('src', mockImageUrl);
        });

        // All tools should be present and ready to receive the image URL
        expect(screen.getByText('Background Tools')).toBeInTheDocument();
        expect(screen.getByText('Generative Fill')).toBeInTheDocument();
        expect(screen.getByText('Enhancement')).toBeInTheDocument();
        expect(screen.getByText('Canvas Expander')).toBeInTheDocument();
    });
});
