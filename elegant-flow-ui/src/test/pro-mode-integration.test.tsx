import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProModeForm } from '../components/ProModeForm';
import * as api from '../lib/api';

// Mock the API module
vi.mock('../lib/api');

/**
 * Integration Tests for Pro Mode Workflow
 * 
 * Requirements tested:
 * - 7.1: Complete form fill and submission flow
 * - 7.8: Successful image generation display
 * - 7.9: Error handling and display
 * - 8.4: Object add/remove/edit workflow
 * - 8.5: User feedback and error messages
 */
describe('Pro Mode Integration Tests - Complete User Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    /**
     * Requirement 7.1, 7.8: Test complete form fill and submission flow
     * with successful image generation display
     */
    it('should complete full Pro Mode form fill and successful generation', async () => {
        const user = userEvent.setup();

        // Mock successful API response
        vi.mocked(api.generateProMode).mockResolvedValue({
            success: true,
            final_image_url: 'https://example.com/pro-mode-image.jpg',
        });

        render(<ProModeForm />);

        // Verify initial state
        expect(screen.getByText(/Pro Mode/i)).toBeInTheDocument();
        expect(screen.getByText(/Build structured prompts/i)).toBeInTheDocument();

        // Fill Scene & Style section (should be open by default)
        const shortDescInput = screen.getByLabelText(/Short Description/i);
        await user.type(shortDescInput, 'A premium smartphone with sleek design');

        const backgroundInput = screen.getByLabelText(/Background Setting/i);
        await user.type(backgroundInput, 'Clean white studio background with soft gradient');

        const styleMediumInput = screen.getByLabelText(/Style Medium/i);
        await user.type(styleMediumInput, 'Professional product photography');

        const artisticStyleInput = screen.getByLabelText(/Artistic Style/i);
        await user.type(artisticStyleInput, 'Modern minimalist');

        const contextInput = screen.getByLabelText(/Context/i);
        await user.type(contextInput, 'E-commerce product showcase');

        // Open and fill Lighting section
        const lightingTrigger = screen.getByRole('button', { name: /Lighting/i });
        await user.click(lightingTrigger);

        const conditionsInput = screen.getByLabelText(/Conditions/i);
        await user.type(conditionsInput, 'Soft studio lighting');

        const directionInput = screen.getByLabelText(/Direction/i);
        await user.type(directionInput, 'Front and top');

        const shadowsInput = screen.getByLabelText(/Shadows/i);
        await user.type(shadowsInput, 'Minimal soft shadows');

        // Open and fill Aesthetics section
        const aestheticsTrigger = screen.getByRole('button', { name: /Aesthetics/i });
        await user.click(aestheticsTrigger);

        const compositionInput = screen.getByLabelText(/Composition/i);
        await user.type(compositionInput, 'Centered with rule of thirds');

        const colorSchemeInput = screen.getByLabelText(/Color Scheme/i);
        await user.type(colorSchemeInput, 'Cool tones with white balance');

        const moodInput = screen.getByLabelText(/Mood/i);
        await user.type(moodInput, 'Professional and clean');

        // Open and fill Camera section
        const cameraTrigger = screen.getByRole('button', { name: /Camera/i });
        await user.click(cameraTrigger);

        const cameraAngleInput = screen.getByLabelText(/Camera Angle/i);
        await user.type(cameraAngleInput, 'Eye level, slightly elevated');

        const lensInput = screen.getByLabelText(/Lens Focal Length/i);
        await user.type(lensInput, '85mm');

        const dofInput = screen.getByLabelText(/Depth of Field/i);
        await user.type(dofInput, 'Shallow, f/2.8');

        const focusInput = screen.getByLabelText(/Focus/i);
        await user.type(focusInput, 'Sharp focus on product');

        // Verify Generate button is enabled
        const generateButton = screen.getByRole('button', { name: /Generate Image/i });
        expect(generateButton).toBeEnabled();

        // Click Generate button
        await user.click(generateButton);

        // Verify loading state
        await waitFor(() => {
            expect(screen.getByText(/Generating.../i)).toBeInTheDocument();
        });

        // Verify success state
        await waitFor(() => {
            expect(screen.getByText(/Generated Image/i)).toBeInTheDocument();
            expect(screen.getByAltText(/Generated product image/i)).toBeInTheDocument();
        });

        // Verify API was called with correct structured prompt
        expect(api.generateProMode).toHaveBeenCalledWith(
            expect.objectContaining({
                structured_prompt: expect.objectContaining({
                    short_description: 'A premium smartphone with sleek design',
                    background_setting: 'Clean white studio background with soft gradient',
                    style_medium: 'Professional product photography',
                    artistic_style: 'Modern minimalist',
                    context: 'E-commerce product showcase',
                    lighting: expect.objectContaining({
                        conditions: 'Soft studio lighting',
                        direction: 'Front and top',
                        shadows: 'Minimal soft shadows',
                    }),
                    aesthetics: expect.objectContaining({
                        composition: 'Centered with rule of thirds',
                        color_scheme: 'Cool tones with white balance',
                        mood_atmosphere: 'Professional and clean',
                    }),
                    photographic_characteristics: expect.objectContaining({
                        camera_angle: 'Eye level, slightly elevated',
                        lens_focal_length: '85mm',
                        depth_of_field: 'Shallow, f/2.8',
                        focus: 'Sharp focus on product',
                    }),
                    objects: [],
                }),
                seed: expect.any(Number),
            })
        );
    });

    /**
     * Requirement 8.4: Test object add/remove/edit workflow
     */
    it('should handle object add, edit, and remove workflow', async () => {
        const user = userEvent.setup();

        vi.mocked(api.generateProMode).mockResolvedValue({
            success: true,
            final_image_url: 'https://example.com/image-with-objects.jpg',
        });

        render(<ProModeForm />);

        // Fill required fields first
        await user.type(screen.getByLabelText(/Short Description/i), 'Product scene');
        await user.type(screen.getByLabelText(/Background Setting/i), 'White background');
        await user.type(screen.getByLabelText(/Style Medium/i), 'Photography');
        await user.type(screen.getByLabelText(/Artistic Style/i), 'Modern');
        await user.type(screen.getByLabelText(/Context/i), 'Product shot');

        // Fill lighting
        await user.click(screen.getByRole('button', { name: /Lighting/i }));
        await user.type(screen.getByLabelText(/Conditions/i), 'Soft light');
        await user.type(screen.getByLabelText(/Direction/i), 'Top');
        await user.type(screen.getByLabelText(/Shadows/i), 'Minimal');

        // Fill aesthetics
        await user.click(screen.getByRole('button', { name: /Aesthetics/i }));
        await user.type(screen.getByLabelText(/Composition/i), 'Centered');
        await user.type(screen.getByLabelText(/Color Scheme/i), 'Neutral');
        await user.type(screen.getByLabelText(/Mood/i), 'Clean');

        // Fill camera
        await user.click(screen.getByRole('button', { name: /Camera/i }));
        await user.type(screen.getByLabelText(/Camera Angle/i), 'Eye level');
        await user.type(screen.getByLabelText(/Lens Focal Length/i), '50mm');
        await user.type(screen.getByLabelText(/Depth of Field/i), 'f/4');
        await user.type(screen.getByLabelText(/Focus/i), 'Sharp');

        // Open Object Builder section
        const objectBuilderTrigger = screen.getByRole('button', { name: /Object Builder/i });
        await user.click(objectBuilderTrigger);

        // Add first object
        const addObjectButton = screen.getByRole('button', { name: /Add New Object/i });
        await user.click(addObjectButton);

        // Verify object card appears
        await waitFor(() => {
            expect(screen.getByText(/Object 1/i)).toBeInTheDocument();
        });

        // Fill first object fields
        const descriptionInputs = screen.getAllByLabelText(/Description/i);
        await user.type(descriptionInputs[0], 'Smartphone device');

        const locationInputs = screen.getAllByLabelText(/Location/i);
        await user.type(locationInputs[0], 'Center of frame');

        const relationshipInputs = screen.getAllByLabelText(/Relationship/i);
        await user.type(relationshipInputs[0], 'Main subject');

        const sizeInputs = screen.getAllByLabelText(/Relative Size/i);
        await user.type(sizeInputs[0], 'Large, fills 60% of frame');

        const shapeInputs = screen.getAllByLabelText(/Shape and Color/i);
        await user.type(shapeInputs[0], 'Rectangular, black');

        const textureInputs = screen.getAllByLabelText(/Texture/i);
        await user.type(textureInputs[0], 'Glossy glass and metal');

        const appearanceInputs = screen.getAllByLabelText(/Appearance Details/i);
        await user.type(appearanceInputs[0], 'Premium finish with reflections');

        // Add second object
        await user.click(addObjectButton);

        await waitFor(() => {
            expect(screen.getByText(/Object 2/i)).toBeInTheDocument();
        });

        // Fill second object
        await user.type(descriptionInputs[1], 'Charging cable');
        await user.type(locationInputs[1], 'Bottom right');
        await user.type(relationshipInputs[1], 'Accessory');
        await user.type(sizeInputs[1], 'Small');
        await user.type(shapeInputs[1], 'Coiled, white');
        await user.type(textureInputs[1], 'Smooth plastic');
        await user.type(appearanceInputs[1], 'Clean white cable');

        // Remove first object
        const removeButtons = screen.getAllByRole('button', { name: /Remove Object/i });
        await user.click(removeButtons[0]);

        // Verify first object is removed
        await waitFor(() => {
            expect(screen.queryByText(/Smartphone device/i)).not.toBeInTheDocument();
        });

        // Verify second object is still present
        expect(screen.getByText(/Charging cable/i)).toBeInTheDocument();

        // Generate with remaining object
        const generateButton = screen.getByRole('button', { name: /Generate Image/i });
        await user.click(generateButton);

        // Verify API was called with one object
        await waitFor(() => {
            expect(api.generateProMode).toHaveBeenCalledWith(
                expect.objectContaining({
                    structured_prompt: expect.objectContaining({
                        objects: expect.arrayContaining([
                            expect.objectContaining({
                                description: 'Charging cable',
                                location: 'Bottom right',
                            }),
                        ]),
                    }),
                })
            );
        });

        // Verify objects array has exactly one object
        const callArgs = vi.mocked(api.generateProMode).mock.calls[0][0];
        expect(callArgs.structured_prompt.objects).toHaveLength(1);
    });

    /**
     * Requirement 7.9, 8.5: Test error handling and display
     */
    it('should handle API errors gracefully with user-friendly messages', async () => {
        const user = userEvent.setup();

        // Mock API error
        vi.mocked(api.generateProMode).mockRejectedValue(
            new api.ApiError('Network error. Please check your connection.', 0)
        );

        render(<ProModeForm />);

        // Fill all required fields
        await user.type(screen.getByLabelText(/Short Description/i), 'Test product');
        await user.type(screen.getByLabelText(/Background Setting/i), 'White bg');
        await user.type(screen.getByLabelText(/Style Medium/i), 'Photo');
        await user.type(screen.getByLabelText(/Artistic Style/i), 'Modern');
        await user.type(screen.getByLabelText(/Context/i), 'Product');

        await user.click(screen.getByRole('button', { name: /Lighting/i }));
        await user.type(screen.getByLabelText(/Conditions/i), 'Soft');
        await user.type(screen.getByLabelText(/Direction/i), 'Top');
        await user.type(screen.getByLabelText(/Shadows/i), 'Minimal');

        await user.click(screen.getByRole('button', { name: /Aesthetics/i }));
        await user.type(screen.getByLabelText(/Composition/i), 'Center');
        await user.type(screen.getByLabelText(/Color Scheme/i), 'Neutral');
        await user.type(screen.getByLabelText(/Mood/i), 'Clean');

        await user.click(screen.getByRole('button', { name: /Camera/i }));
        await user.type(screen.getByLabelText(/Camera Angle/i), 'Eye');
        await user.type(screen.getByLabelText(/Lens Focal Length/i), '50mm');
        await user.type(screen.getByLabelText(/Depth of Field/i), 'f/4');
        await user.type(screen.getByLabelText(/Focus/i), 'Sharp');

        // Generate
        const generateButton = screen.getByRole('button', { name: /Generate Image/i });
        await user.click(generateButton);

        // Verify error state
        await waitFor(() => {
            expect(screen.getByText(/Network error/i)).toBeInTheDocument();
        });

        // Verify retry button appears
        expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();

        // Verify form is re-enabled
        expect(generateButton).toBeEnabled();
    });

    /**
     * Requirement 8.5: Test validation error messages
     */
    it('should display validation errors for empty required fields', async () => {
        const user = userEvent.setup();

        render(<ProModeForm />);

        // Try to generate without filling form
        const generateButton = screen.getByRole('button', { name: /Generate Image/i });
        await user.click(generateButton);

        // Verify validation error message
        await waitFor(() => {
            expect(screen.getByText(/Please fill in all required fields/i)).toBeInTheDocument();
        });

        // Verify no API call was made
        expect(api.generateProMode).not.toHaveBeenCalled();
    });

    /**
     * Requirement 8.4: Test retry functionality
     */
    it('should allow retrying failed generation', async () => {
        const user = userEvent.setup();

        // First attempt fails
        vi.mocked(api.generateProMode).mockRejectedValueOnce(
            new api.ApiError('Server error occurred', 500)
        );

        // Second attempt succeeds
        vi.mocked(api.generateProMode).mockResolvedValueOnce({
            success: true,
            final_image_url: 'https://example.com/retry-success.jpg',
        });

        render(<ProModeForm />);

        // Fill required fields
        await user.type(screen.getByLabelText(/Short Description/i), 'Test');
        await user.type(screen.getByLabelText(/Background Setting/i), 'White');
        await user.type(screen.getByLabelText(/Style Medium/i), 'Photo');
        await user.type(screen.getByLabelText(/Artistic Style/i), 'Modern');
        await user.type(screen.getByLabelText(/Context/i), 'Product');

        await user.click(screen.getByRole('button', { name: /Lighting/i }));
        await user.type(screen.getByLabelText(/Conditions/i), 'Soft');
        await user.type(screen.getByLabelText(/Direction/i), 'Top');
        await user.type(screen.getByLabelText(/Shadows/i), 'Minimal');

        await user.click(screen.getByRole('button', { name: /Aesthetics/i }));
        await user.type(screen.getByLabelText(/Composition/i), 'Center');
        await user.type(screen.getByLabelText(/Color Scheme/i), 'Neutral');
        await user.type(screen.getByLabelText(/Mood/i), 'Clean');

        await user.click(screen.getByRole('button', { name: /Camera/i }));
        await user.type(screen.getByLabelText(/Camera Angle/i), 'Eye');
        await user.type(screen.getByLabelText(/Lens Focal Length/i), '50mm');
        await user.type(screen.getByLabelText(/Depth of Field/i), 'f/4');
        await user.type(screen.getByLabelText(/Focus/i), 'Sharp');

        // First generation attempt
        const generateButton = screen.getByRole('button', { name: /Generate Image/i });
        await user.click(generateButton);

        // Wait for error
        await waitFor(() => {
            expect(screen.getByText(/Server error occurred/i)).toBeInTheDocument();
        });

        // Click retry
        const retryButton = screen.getByRole('button', { name: /Retry/i });
        await user.click(retryButton);

        // Verify success after retry
        await waitFor(() => {
            expect(screen.getByText(/Generated Image/i)).toBeInTheDocument();
        });

        // Verify API was called twice
        expect(api.generateProMode).toHaveBeenCalledTimes(2);
    });

    /**
     * Requirement 7.1: Test form disabling during generation
     */
    it('should disable form inputs during generation', async () => {
        const user = userEvent.setup();

        // Mock slow API response
        vi.mocked(api.generateProMode).mockImplementation(
            () => new Promise(resolve => setTimeout(() => resolve({
                success: true,
                final_image_url: 'https://example.com/image.jpg',
            }), 100))
        );

        render(<ProModeForm />);

        // Fill required fields
        const shortDescInput = screen.getByLabelText(/Short Description/i);
        await user.type(shortDescInput, 'Test');
        await user.type(screen.getByLabelText(/Background Setting/i), 'White');
        await user.type(screen.getByLabelText(/Style Medium/i), 'Photo');
        await user.type(screen.getByLabelText(/Artistic Style/i), 'Modern');
        await user.type(screen.getByLabelText(/Context/i), 'Product');

        await user.click(screen.getByRole('button', { name: /Lighting/i }));
        await user.type(screen.getByLabelText(/Conditions/i), 'Soft');
        await user.type(screen.getByLabelText(/Direction/i), 'Top');
        await user.type(screen.getByLabelText(/Shadows/i), 'Minimal');

        await user.click(screen.getByRole('button', { name: /Aesthetics/i }));
        await user.type(screen.getByLabelText(/Composition/i), 'Center');
        await user.type(screen.getByLabelText(/Color Scheme/i), 'Neutral');
        await user.type(screen.getByLabelText(/Mood/i), 'Clean');

        await user.click(screen.getByRole('button', { name: /Camera/i }));
        await user.type(screen.getByLabelText(/Camera Angle/i), 'Eye');
        await user.type(screen.getByLabelText(/Lens Focal Length/i), '50mm');
        await user.type(screen.getByLabelText(/Depth of Field/i), 'f/4');
        await user.type(screen.getByLabelText(/Focus/i), 'Sharp');

        const generateButton = screen.getByRole('button', { name: /Generate Image/i });
        await user.click(generateButton);

        // Verify button is disabled during loading
        await waitFor(() => {
            expect(generateButton).toBeDisabled();
        });

        // Wait for completion
        await waitFor(() => {
            expect(screen.getByText(/Generated Image/i)).toBeInTheDocument();
        });

        // Verify button is re-enabled
        expect(generateButton).toBeEnabled();
    });

    /**
     * Requirement 7.1: Test seed generation
     */
    it('should generate random seed for each generation', async () => {
        const user = userEvent.setup();

        vi.mocked(api.generateProMode).mockResolvedValue({
            success: true,
            final_image_url: 'https://example.com/image.jpg',
        });

        render(<ProModeForm />);

        // Fill required fields
        await user.type(screen.getByLabelText(/Short Description/i), 'Test');
        await user.type(screen.getByLabelText(/Background Setting/i), 'White');
        await user.type(screen.getByLabelText(/Style Medium/i), 'Photo');
        await user.type(screen.getByLabelText(/Artistic Style/i), 'Modern');
        await user.type(screen.getByLabelText(/Context/i), 'Product');

        await user.click(screen.getByRole('button', { name: /Lighting/i }));
        await user.type(screen.getByLabelText(/Conditions/i), 'Soft');
        await user.type(screen.getByLabelText(/Direction/i), 'Top');
        await user.type(screen.getByLabelText(/Shadows/i), 'Minimal');

        await user.click(screen.getByRole('button', { name: /Aesthetics/i }));
        await user.type(screen.getByLabelText(/Composition/i), 'Center');
        await user.type(screen.getByLabelText(/Color Scheme/i), 'Neutral');
        await user.type(screen.getByLabelText(/Mood/i), 'Clean');

        await user.click(screen.getByRole('button', { name: /Camera/i }));
        await user.type(screen.getByLabelText(/Camera Angle/i), 'Eye');
        await user.type(screen.getByLabelText(/Lens Focal Length/i), '50mm');
        await user.type(screen.getByLabelText(/Depth of Field/i), 'f/4');
        await user.type(screen.getByLabelText(/Focus/i), 'Sharp');

        const generateButton = screen.getByRole('button', { name: /Generate Image/i });
        await user.click(generateButton);

        await waitFor(() => {
            expect(api.generateProMode).toHaveBeenCalled();
        });

        // Verify seed is a number between 0 and 999999
        const callArgs = vi.mocked(api.generateProMode).mock.calls[0][0];
        expect(callArgs.seed).toBeGreaterThanOrEqual(0);
        expect(callArgs.seed).toBeLessThan(1000000);
        expect(Number.isInteger(callArgs.seed)).toBe(true);
    });
});
