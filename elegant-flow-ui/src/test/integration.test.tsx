import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import * as api from '../lib/api';

// Mock the API module
vi.mock('../lib/api');

describe('Integration Tests - Complete User Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should complete full user flow from input to successful generation', async () => {
        const user = userEvent.setup();

        // Mock successful API response
        vi.mocked(api.generateImage).mockResolvedValue({
            success: true,
            final_image_url: 'https://example.com/generated-image.jpg',
        });

        render(<App />);

        // Verify initial idle state
        expect(screen.getByText(/your generated image will appear here/i)).toBeInTheDocument();

        // Fill in product description
        const textarea = screen.getByLabelText(/product description/i);
        await user.type(textarea, 'A sleek smartphone on a white background');

        // Verify character counter updates
        expect(screen.getByText(/42 \/ 500/i)).toBeInTheDocument();

        // Select a style preset
        const presetRadio = screen.getByLabelText(/bright clean/i);
        await user.click(presetRadio);

        // Verify Generate button is enabled
        const generateButton = screen.getByRole('button', { name: /generate image/i });
        expect(generateButton).toBeEnabled();

        // Click Generate button
        await user.click(generateButton);

        // Verify loading state
        await waitFor(() => {
            expect(screen.getByText(/generating your image/i)).toBeInTheDocument();
        });

        // Verify success state
        await waitFor(() => {
            expect(screen.getByAltText(/generated product image/i)).toBeInTheDocument();
        });

        // Verify download button appears
        const downloadButton = screen.getByRole('button', { name: /download image/i });
        expect(downloadButton).toBeInTheDocument();

        // Verify API was called with correct parameters
        expect(api.generateImage).toHaveBeenCalledWith({
            user_prompt: 'A sleek smartphone on a white background',
            preset_name: 'preset_bright_clean.json',
        });
    });

    it('should handle form validation errors', async () => {
        const user = userEvent.setup();
        render(<App />);

        // Try to generate without filling form
        const generateButton = screen.getByRole('button', { name: /generate image/i });
        expect(generateButton).toBeDisabled();

        // Enter too short description
        const textarea = screen.getByLabelText(/product description/i);
        await user.type(textarea, 'ab');

        // Verify validation error
        await waitFor(() => {
            expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
        });

        // Button should still be disabled
        expect(generateButton).toBeDisabled();

        // Fix description
        await user.clear(textarea);
        await user.type(textarea, 'Valid product description');

        // Select preset
        const presetRadio = screen.getByLabelText(/bright clean/i);
        await user.click(presetRadio);

        // Now button should be enabled
        expect(generateButton).toBeEnabled();
    });

    it('should handle API errors gracefully', async () => {
        const user = userEvent.setup();

        // Mock API error
        vi.mocked(api.generateImage).mockRejectedValue(
            new Error('Network error. Please check your connection.')
        );

        render(<App />);

        // Fill form
        const textarea = screen.getByLabelText(/product description/i);
        await user.type(textarea, 'Test product description');

        const presetRadio = screen.getByLabelText(/bright clean/i);
        await user.click(presetRadio);

        // Generate
        const generateButton = screen.getByRole('button', { name: /generate image/i });
        await user.click(generateButton);

        // Verify error state
        await waitFor(() => {
            expect(screen.getByText(/network error/i)).toBeInTheDocument();
        });

        // Verify form is re-enabled for retry
        expect(generateButton).toBeEnabled();
        expect(textarea).toBeEnabled();
    });

    it('should handle reference image upload', async () => {
        const user = userEvent.setup();

        vi.mocked(api.generateImage).mockResolvedValue({
            success: true,
            final_image_url: 'https://example.com/generated-image.jpg',
        });

        render(<App />);

        // Create a mock file
        const file = new File(['dummy content'], 'test-image.png', { type: 'image/png' });

        // Upload file
        const fileInput = screen.getByLabelText(/upload reference image/i);
        await user.upload(fileInput, file);

        // Verify preview appears
        await waitFor(() => {
            expect(screen.getByText(/test-image\.png/i)).toBeInTheDocument();
        });

        // Fill rest of form
        const textarea = screen.getByLabelText(/product description/i);
        await user.type(textarea, 'Product with reference');

        const presetRadio = screen.getByLabelText(/bright clean/i);
        await user.click(presetRadio);

        // Generate
        const generateButton = screen.getByRole('button', { name: /generate image/i });
        await user.click(generateButton);

        // Verify API was called with reference image
        await waitFor(() => {
            expect(api.generateImage).toHaveBeenCalledWith(
                expect.objectContaining({
                    user_prompt: 'Product with reference',
                    preset_name: 'preset_bright_clean.json',
                    reference_image_base64: expect.stringContaining('data:image/png;base64,'),
                })
            );
        });
    });

    it('should allow removing uploaded reference image', async () => {
        const user = userEvent.setup();
        render(<App />);

        // Upload file
        const file = new File(['dummy content'], 'test-image.png', { type: 'image/png' });
        const fileInput = screen.getByLabelText(/upload reference image/i);
        await user.upload(fileInput, file);

        // Verify preview appears
        await waitFor(() => {
            expect(screen.getByText(/test-image\.png/i)).toBeInTheDocument();
        });

        // Remove image
        const removeButton = screen.getByRole('button', { name: /remove/i });
        await user.click(removeButton);

        // Verify preview is gone
        expect(screen.queryByText(/test-image\.png/i)).not.toBeInTheDocument();
    });

    it('should validate file types for reference image', async () => {
        const user = userEvent.setup();
        render(<App />);

        // Try to upload invalid file type
        const invalidFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
        const fileInput = screen.getByLabelText(/upload reference image/i);

        await user.upload(fileInput, invalidFile);

        // Verify error message
        await waitFor(() => {
            expect(screen.getByText(/please upload a png, jpeg, or jpg file/i)).toBeInTheDocument();
        });
    });

    it('should transition between all states correctly', async () => {
        const user = userEvent.setup();

        // First attempt - success
        vi.mocked(api.generateImage).mockResolvedValueOnce({
            success: true,
            final_image_url: 'https://example.com/image1.jpg',
        });

        render(<App />);

        // Idle state
        expect(screen.getByText(/your generated image will appear here/i)).toBeInTheDocument();

        // Fill and submit
        const textarea = screen.getByLabelText(/product description/i);
        await user.type(textarea, 'First generation');

        const presetRadio = screen.getByLabelText(/bright clean/i);
        await user.click(presetRadio);

        const generateButton = screen.getByRole('button', { name: /generate image/i });
        await user.click(generateButton);

        // Loading state
        await waitFor(() => {
            expect(screen.getByText(/generating your image/i)).toBeInTheDocument();
        });

        // Success state
        await waitFor(() => {
            expect(screen.getByAltText(/generated product image/i)).toBeInTheDocument();
        });

        // Modify and generate again - error
        vi.mocked(api.generateImage).mockRejectedValueOnce(
            new Error('Generation failed')
        );

        await user.clear(textarea);
        await user.type(textarea, 'Second generation');
        await user.click(generateButton);

        // Error state
        await waitFor(() => {
            expect(screen.getByText(/generation failed/i)).toBeInTheDocument();
        });

        // Try again - success
        vi.mocked(api.generateImage).mockResolvedValueOnce({
            success: true,
            final_image_url: 'https://example.com/image2.jpg',
        });

        await user.click(generateButton);

        // Back to success state
        await waitFor(() => {
            expect(screen.getByAltText(/generated product image/i)).toBeInTheDocument();
        });
    });

    it('should disable form during generation', async () => {
        const user = userEvent.setup();

        // Mock slow API response
        vi.mocked(api.generateImage).mockImplementation(
            () => new Promise(resolve => setTimeout(() => resolve({
                success: true,
                final_image_url: 'https://example.com/image.jpg',
            }), 100))
        );

        render(<App />);

        // Fill form
        const textarea = screen.getByLabelText(/product description/i);
        await user.type(textarea, 'Test product');

        const presetRadio = screen.getByLabelText(/bright clean/i);
        await user.click(presetRadio);

        const generateButton = screen.getByRole('button', { name: /generate image/i });
        await user.click(generateButton);

        // Verify all inputs are disabled during loading
        await waitFor(() => {
            expect(textarea).toBeDisabled();
            expect(presetRadio).toBeDisabled();
            expect(generateButton).toBeDisabled();
        });

        // Wait for completion
        await waitFor(() => {
            expect(screen.getByAltText(/generated product image/i)).toBeInTheDocument();
        });

        // Verify inputs are re-enabled
        expect(textarea).toBeEnabled();
        expect(presetRadio).toBeEnabled();
        expect(generateButton).toBeEnabled();
    });

    it('should update character counter in real-time', async () => {
        const user = userEvent.setup();
        render(<App />);

        const textarea = screen.getByLabelText(/product description/i);

        // Initial state
        expect(screen.getByText(/0 \/ 500/i)).toBeInTheDocument();

        // Type some text
        await user.type(textarea, 'Hello');
        expect(screen.getByText(/5 \/ 500/i)).toBeInTheDocument();

        // Type more
        await user.type(textarea, ' World');
        expect(screen.getByText(/11 \/ 500/i)).toBeInTheDocument();

        // Clear
        await user.clear(textarea);
        expect(screen.getByText(/0 \/ 500/i)).toBeInTheDocument();
    });

    it('should test all 10 style presets are available', () => {
        render(<App />);

        // Verify all presets are rendered
        const expectedPresets = [
            'Bright Clean',
            'Luxury Reflection',
            'Minimalist Shadow',
            'Natural Warm',
            'Vibrant Pop',
            'Detail Macro',
            'Editorial Dark',
            'Flat Lay',
            'Hero Shot',
            'Lifestyle Context',
        ];

        expectedPresets.forEach(preset => {
            expect(screen.getByLabelText(preset)).toBeInTheDocument();
        });
    });

    it('should handle download button click', async () => {
        const user = userEvent.setup();

        vi.mocked(api.generateImage).mockResolvedValue({
            success: true,
            final_image_url: 'https://example.com/generated-image.jpg',
        });

        render(<App />);

        // Fill and generate
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

        // Mock download functionality
        const createElementSpy = vi.spyOn(document, 'createElement');
        const downloadButton = screen.getByRole('button', { name: /download image/i });

        await user.click(downloadButton);

        // Verify download link was created
        expect(createElementSpy).toHaveBeenCalledWith('a');
    });
});
