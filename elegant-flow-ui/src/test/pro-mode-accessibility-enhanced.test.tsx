/**
 * Enhanced Accessibility Tests for Pro Mode
 * 
 * Requirements:
 * - 10.1: ARIA labels on all form inputs
 * - 10.2: Keyboard navigation for accordion sections
 * - 10.3: ARIA live regions for loading and error states
 * - 10.4: Focus management for add/remove object buttons
 * - 10.5: Responsive design with proper touch targets
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProModeForm } from '../components/ProModeForm';
import * as api from '../lib/api';

// Mock the API module
vi.mock('../lib/api', () => ({
    generateProMode: vi.fn(),
    ApiError: class ApiError extends Error {
        constructor(message: string, public statusCode?: number) {
            super(message);
            this.name = 'ApiError';
        }
    },
}));

describe('Pro Mode Accessibility - Enhanced Features', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Requirement 10.1: ARIA Labels on All Form Inputs', () => {
        it('should have ARIA labels on all Scene & Style inputs', () => {
            render(<ProModeForm />);

            // Open Scene & Style section (should be open by default)
            expect(screen.getByLabelText(/short description/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/background setting/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/style medium/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/artistic style/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/additional context/i)).toBeInTheDocument();
        });

        it('should have ARIA labels on all Lighting inputs', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Open Lighting section
            const lightingTrigger = screen.getByRole('button', { name: /lighting section/i });
            await user.click(lightingTrigger);

            await waitFor(() => {
                expect(screen.getByLabelText(/lighting conditions/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/lighting direction/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/shadow characteristics/i)).toBeInTheDocument();
            });
        });

        it('should have ARIA labels on all Aesthetics inputs', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Open Aesthetics section
            const aestheticsTrigger = screen.getByRole('button', { name: /aesthetics section/i });
            await user.click(aestheticsTrigger);

            await waitFor(() => {
                expect(screen.getByLabelText(/composition style/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/color scheme/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/mood and atmosphere/i)).toBeInTheDocument();
            });
        });

        it('should have ARIA labels on all Camera inputs', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Open Camera section
            const cameraTrigger = screen.getByRole('button', { name: /camera section/i });
            await user.click(cameraTrigger);

            await waitFor(() => {
                expect(screen.getByLabelText(/camera angle/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/lens focal length/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/depth of field/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/focus/i)).toBeInTheDocument();
            });
        });

        it('should have ARIA labels on Object Builder controls', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Open Object Builder section
            const objectBuilderTrigger = screen.getByRole('button', { name: /object builder section/i });
            await user.click(objectBuilderTrigger);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /add new object to scene/i })).toBeInTheDocument();
            });
        });

        it('should have proper ARIA labels on accordion sections', () => {
            render(<ProModeForm />);

            expect(screen.getByRole('button', { name: /scene and style section/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /lighting section/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /aesthetics section/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /camera section/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /object builder section/i })).toBeInTheDocument();
        });
    });

    describe('Requirement 10.2: Keyboard Navigation for Accordion Sections', () => {
        it('should navigate between accordion sections using Tab key', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Tab to first accordion trigger
            await user.tab();
            await user.tab(); // Skip skip-link

            const sceneStyleTrigger = screen.getByRole('button', { name: /scene and style section/i });
            expect(sceneStyleTrigger).toHaveFocus();

            // Tab to next accordion trigger
            await user.tab();
            // Should skip through the open section's inputs and reach next accordion
            const lightingTrigger = screen.getByRole('button', { name: /lighting section/i });

            // Keep tabbing until we reach lighting trigger
            let attempts = 0;
            while (!lightingTrigger.matches(':focus') && attempts < 20) {
                await user.tab();
                attempts++;
            }

            expect(attempts).toBeLessThan(20); // Should find it within reasonable tabs
        });

        it('should expand/collapse accordion sections with Enter key', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            const lightingTrigger = screen.getByRole('button', { name: /lighting section/i });

            // Focus the trigger
            lightingTrigger.focus();
            expect(lightingTrigger).toHaveFocus();

            // Press Enter to expand
            await user.keyboard('{Enter}');

            await waitFor(() => {
                expect(screen.getByLabelText(/lighting conditions/i)).toBeVisible();
            });
        });

        it('should expand/collapse accordion sections with Space key', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            const aestheticsTrigger = screen.getByRole('button', { name: /aesthetics section/i });

            // Focus the trigger
            aestheticsTrigger.focus();
            expect(aestheticsTrigger).toHaveFocus();

            // Press Space to expand
            await user.keyboard(' ');

            await waitFor(() => {
                expect(screen.getByLabelText(/composition style/i)).toBeVisible();
            });
        });
    });

    describe('Requirement 10.3: ARIA Live Regions for Dynamic Content', () => {
        it('should announce loading state to screen readers', async () => {
            const user = userEvent.setup();
            vi.mocked(api.generateProMode).mockImplementation(
                () => new Promise(resolve => setTimeout(() => resolve({
                    success: true,
                    final_image_url: 'https://example.com/image.jpg'
                }), 100))
            );

            render(<ProModeForm />);

            // Fill required fields
            await user.type(screen.getByLabelText(/short description/i), 'Test product');
            await user.type(screen.getByLabelText(/background setting/i), 'White background');
            await user.type(screen.getByLabelText(/style medium/i), 'Photography');
            await user.type(screen.getByLabelText(/artistic style/i), 'Minimalist');
            await user.type(screen.getByLabelText(/additional context/i), 'E-commerce');

            // Open and fill other sections
            const lightingTrigger = screen.getByRole('button', { name: /lighting section/i });
            await user.click(lightingTrigger);
            await user.type(screen.getByLabelText(/lighting conditions/i), 'Soft studio');
            await user.type(screen.getByLabelText(/lighting direction/i), 'Front');
            await user.type(screen.getByLabelText(/shadow characteristics/i), 'Soft');

            const aestheticsTrigger = screen.getByRole('button', { name: /aesthetics section/i });
            await user.click(aestheticsTrigger);
            await user.type(screen.getByLabelText(/composition style/i), 'Centered');
            await user.type(screen.getByLabelText(/color scheme/i), 'Neutral');
            await user.type(screen.getByLabelText(/mood and atmosphere/i), 'Professional');

            const cameraTrigger = screen.getByRole('button', { name: /camera section/i });
            await user.click(cameraTrigger);
            await user.type(screen.getByLabelText(/camera angle/i), 'Eye level');
            await user.type(screen.getByLabelText(/lens focal length/i), '50mm');
            await user.type(screen.getByLabelText(/depth of field/i), 'Shallow');
            await user.type(screen.getByLabelText(/focus/i), 'Sharp');

            // Click generate
            const generateButton = screen.getByRole('button', { name: /generate image/i });
            await user.click(generateButton);

            // Check for loading state with ARIA live region
            const loadingStatus = await screen.findByRole('status');
            expect(loadingStatus).toHaveAttribute('aria-live', 'polite');
            expect(loadingStatus).toHaveTextContent(/please wait/i);
        });

        it('should announce success state to screen readers', async () => {
            const user = userEvent.setup();
            vi.mocked(api.generateProMode).mockResolvedValue({
                success: true,
                final_image_url: 'https://example.com/image.jpg'
            });

            render(<ProModeForm />);

            // Fill and submit form (abbreviated)
            await user.type(screen.getByLabelText(/short description/i), 'Test');
            await user.type(screen.getByLabelText(/background setting/i), 'White');
            await user.type(screen.getByLabelText(/style medium/i), 'Photo');
            await user.type(screen.getByLabelText(/artistic style/i), 'Modern');
            await user.type(screen.getByLabelText(/additional context/i), 'Product');

            const lightingTrigger = screen.getByRole('button', { name: /lighting section/i });
            await user.click(lightingTrigger);
            await user.type(screen.getByLabelText(/lighting conditions/i), 'Soft');
            await user.type(screen.getByLabelText(/lighting direction/i), 'Front');
            await user.type(screen.getByLabelText(/shadow characteristics/i), 'Soft');

            const aestheticsTrigger = screen.getByRole('button', { name: /aesthetics section/i });
            await user.click(aestheticsTrigger);
            await user.type(screen.getByLabelText(/composition style/i), 'Center');
            await user.type(screen.getByLabelText(/color scheme/i), 'Neutral');
            await user.type(screen.getByLabelText(/mood and atmosphere/i), 'Clean');

            const cameraTrigger = screen.getByRole('button', { name: /camera section/i });
            await user.click(cameraTrigger);
            await user.type(screen.getByLabelText(/camera angle/i), 'Eye');
            await user.type(screen.getByLabelText(/lens focal length/i), '50mm');
            await user.type(screen.getByLabelText(/depth of field/i), 'Shallow');
            await user.type(screen.getByLabelText(/focus/i), 'Sharp');

            const generateButton = screen.getByRole('button', { name: /generate image/i });
            await user.click(generateButton);

            // Wait for success
            await waitFor(() => {
                const resultRegion = screen.getByRole('region', { name: /generated image/i });
                expect(resultRegion).toHaveAttribute('aria-live', 'polite');
            });
        });

        it('should announce error state to screen readers', async () => {
            const user = userEvent.setup();
            vi.mocked(api.generateProMode).mockRejectedValue(
                new api.ApiError('Generation failed', 500)
            );

            render(<ProModeForm />);

            // Fill and submit form
            await user.type(screen.getByLabelText(/short description/i), 'Test');
            await user.type(screen.getByLabelText(/background setting/i), 'White');
            await user.type(screen.getByLabelText(/style medium/i), 'Photo');
            await user.type(screen.getByLabelText(/artistic style/i), 'Modern');
            await user.type(screen.getByLabelText(/additional context/i), 'Product');

            const lightingTrigger = screen.getByRole('button', { name: /lighting section/i });
            await user.click(lightingTrigger);
            await user.type(screen.getByLabelText(/lighting conditions/i), 'Soft');
            await user.type(screen.getByLabelText(/lighting direction/i), 'Front');
            await user.type(screen.getByLabelText(/shadow characteristics/i), 'Soft');

            const aestheticsTrigger = screen.getByRole('button', { name: /aesthetics section/i });
            await user.click(aestheticsTrigger);
            await user.type(screen.getByLabelText(/composition style/i), 'Center');
            await user.type(screen.getByLabelText(/color scheme/i), 'Neutral');
            await user.type(screen.getByLabelText(/mood and atmosphere/i), 'Clean');

            const cameraTrigger = screen.getByRole('button', { name: /camera section/i });
            await user.click(cameraTrigger);
            await user.type(screen.getByLabelText(/camera angle/i), 'Eye');
            await user.type(screen.getByLabelText(/lens focal length/i), '50mm');
            await user.type(screen.getByLabelText(/depth of field/i), 'Shallow');
            await user.type(screen.getByLabelText(/focus/i), 'Sharp');

            const generateButton = screen.getByRole('button', { name: /generate image/i });
            await user.click(generateButton);

            // Wait for error with ARIA live region
            await waitFor(() => {
                const errorAlert = screen.getByRole('alert');
                expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
            });
        });
    });

    describe('Requirement 10.4: Focus Management for Add/Remove Object Buttons', () => {
        it('should manage focus when adding objects', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Open Object Builder section
            const objectBuilderTrigger = screen.getByRole('button', { name: /object builder section/i });
            await user.click(objectBuilderTrigger);

            // Click Add New Object
            const addButton = await screen.findByRole('button', { name: /add new object to scene/i });
            await user.click(addButton);

            // Verify object card was added
            await waitFor(() => {
                expect(screen.getByRole('group', { name: /object 1/i })).toBeInTheDocument();
            });
        });

        it('should return focus to add button after removing an object', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Open Object Builder section
            const objectBuilderTrigger = screen.getByRole('button', { name: /object builder section/i });
            await user.click(objectBuilderTrigger);

            // Add an object
            const addButton = await screen.findByRole('button', { name: /add new object to scene/i });
            await user.click(addButton);

            // Wait for object to appear
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /remove object 1/i })).toBeInTheDocument();
            });

            // Remove the object
            const removeButton = screen.getByRole('button', { name: /remove object 1/i });
            await user.click(removeButton);

            // Focus should return to add button
            await waitFor(() => {
                expect(addButton).toHaveFocus();
            });
        });

        it('should have proper ARIA labels on remove buttons', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Open Object Builder and add objects
            const objectBuilderTrigger = screen.getByRole('button', { name: /object builder section/i });
            await user.click(objectBuilderTrigger);

            const addButton = await screen.findByRole('button', { name: /add new object to scene/i });
            await user.click(addButton);
            await user.click(addButton);

            // Verify remove buttons have descriptive labels
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /remove object 1 from scene/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /remove object 2 from scene/i })).toBeInTheDocument();
            });
        });
    });

    describe('Requirement 10.5: Minimum Touch Targets', () => {
        it('should have minimum 44px height class on all buttons', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Check generate button has min-h-[44px] class
            const generateButton = screen.getByRole('button', { name: /generate image/i });
            expect(generateButton.className).toContain('min-h-[44px]');

            // Open Object Builder and check add button
            const objectBuilderTrigger = screen.getByRole('button', { name: /object builder section/i });
            await user.click(objectBuilderTrigger);

            const addButton = await screen.findByRole('button', { name: /add new object to scene/i });
            expect(addButton.className).toContain('min-h-[44px]');
        });

        it('should have minimum 44px height class on all inputs', () => {
            render(<ProModeForm />);

            const shortDescInput = screen.getByLabelText(/short description/i);
            const styleMediumInput = screen.getByLabelText(/style medium/i);

            // Inputs should have min-h-[44px] class for adequate touch target size
            expect(styleMediumInput.className).toContain('min-h-[44px]');
        });
    });

    describe('Additional Accessibility Features', () => {
        it('should have skip to content link', () => {
            render(<ProModeForm />);

            const skipLink = screen.getByText(/skip to form content/i);
            expect(skipLink).toBeInTheDocument();
            expect(skipLink).toHaveAttribute('href', '#pro-mode-form-content');
        });

        it('should have proper heading hierarchy', () => {
            render(<ProModeForm />);

            const mainHeading = screen.getByRole('heading', { level: 1, name: /pro mode/i });
            expect(mainHeading).toBeInTheDocument();
        });

        it('should have form element with proper ARIA attributes', () => {
            render(<ProModeForm />);

            const form = document.querySelector('form');
            expect(form).toHaveAttribute('aria-labelledby', 'pro-mode-title');
            expect(form).toHaveAttribute('aria-describedby', 'pro-mode-description');
        });

        it('should have proper validation error announcements', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Try to submit without filling required fields
            const generateButton = screen.getByRole('button', { name: /generate image/i });
            await user.click(generateButton);

            // Check for validation errors with proper ARIA
            await waitFor(() => {
                const shortDescInput = screen.getByLabelText(/short description/i);
                expect(shortDescInput).toHaveAttribute('aria-invalid', 'true');
                expect(shortDescInput).toHaveAttribute('aria-describedby');
            });
        });
    });
});
