import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import * as api from '../lib/api';

// Mock the API module
vi.mock('../lib/api');

describe('Accessibility Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should support full keyboard navigation', async () => {
        const user = userEvent.setup();
        render(<App />);

        // Tab through all interactive elements
        await user.tab();
        expect(screen.getByLabelText(/product description/i)).toHaveFocus();

        // Continue tabbing to presets
        await user.tab();
        expect(screen.getByLabelText(/bright clean/i)).toHaveFocus();

        // Tab to file input
        for (let i = 0; i < 10; i++) {
            await user.tab();
        }
        expect(screen.getByLabelText(/upload reference image/i)).toHaveFocus();
    });

    it('should have proper ARIA labels on all interactive elements', () => {
        render(<App />);

        // Verify ARIA labels
        expect(screen.getByLabelText(/product description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/bright clean/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/upload reference image/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /generate image/i })).toBeInTheDocument();
    });

    it('should announce loading state to screen readers', async () => {
        const user = userEvent.setup();

        vi.mocked(api.generateImage).mockImplementation(
            () => new Promise(resolve => setTimeout(() => resolve({
                success: true,
                final_image_url: 'https://example.com/image.jpg',
            }), 100))
        );

        render(<App />);

        // Fill and submit
        const textarea = screen.getByLabelText(/product description/i);
        await user.type(textarea, 'Test product');

        const presetRadio = screen.getByLabelText(/bright clean/i);
        await user.click(presetRadio);

        const generateButton = screen.getByRole('button', { name: /generate image/i });
        await user.click(generateButton);

        // Verify loading message is announced
        await waitFor(() => {
            const loadingText = screen.getByText(/generating your image/i);
            expect(loadingText).toBeInTheDocument();
        });
    });

    it('should announce errors to screen readers', async () => {
        const user = userEvent.setup();

        vi.mocked(api.generateImage).mockRejectedValue(
            new Error('Network error')
        );

        render(<App />);

        // Fill and submit
        const textarea = screen.getByLabelText(/product description/i);
        await user.type(textarea, 'Test product');

        const presetRadio = screen.getByLabelText(/bright clean/i);
        await user.click(presetRadio);

        const generateButton = screen.getByRole('button', { name: /generate image/i });
        await user.click(generateButton);

        // Verify error is announced
        await waitFor(() => {
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText(/network error/i)).toBeInTheDocument();
        });
    });

    it('should have semantic HTML structure', () => {
        render(<App />);

        // Verify semantic elements
        expect(screen.getByRole('button', { name: /generate image/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /product description/i })).toBeInTheDocument();
    });

    it('should have visible focus indicators', async () => {
        const user = userEvent.setup();
        render(<App />);

        // Tab to textarea
        await user.tab();
        const textarea = screen.getByLabelText(/product description/i);
        expect(textarea).toHaveFocus();
    });

    it('should manage focus when image loads', async () => {
        const user = userEvent.setup();

        vi.mocked(api.generateImage).mockResolvedValue({
            success: true,
            final_image_url: 'https://example.com/image.jpg',
        });

        render(<App />);

        // Fill and submit
        const textarea = screen.getByLabelText(/product description/i);
        await user.type(textarea, 'Test product');

        const presetRadio = screen.getByLabelText(/bright clean/i);
        await user.click(presetRadio);

        const generateButton = screen.getByRole('button', { name: /generate image/i });
        await user.click(generateButton);

        // Wait for success
        await waitFor(() => {
            expect(screen.getByAltText(/generated product image/i)).toBeInTheDocument();
        });

        // Verify download button is focusable
        const downloadButton = screen.getByRole('button', { name: /download image/i });
        expect(downloadButton).toBeInTheDocument();
    });

    it('should provide meaningful alt text for images', async () => {
        const user = userEvent.setup();

        vi.mocked(api.generateImage).mockResolvedValue({
            success: true,
            final_image_url: 'https://example.com/image.jpg',
        });

        render(<App />);

        // Generate image
        const textarea = screen.getByLabelText(/product description/i);
        await user.type(textarea, 'Test product');

        const presetRadio = screen.getByLabelText(/bright clean/i);
        await user.click(presetRadio);

        const generateButton = screen.getByRole('button', { name: /generate image/i });
        await user.click(generateButton);

        // Verify alt text
        await waitFor(() => {
            const image = screen.getByAltText(/generated product image/i);
            expect(image).toBeInTheDocument();
        });
    });
});
