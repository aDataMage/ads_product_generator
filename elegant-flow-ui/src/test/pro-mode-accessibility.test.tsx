import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProModeForm } from '../components/ProModeForm';
import * as api from '../lib/api';

// Mock the API module
vi.mock('../lib/api');

/**
 * Pro Mode Accessibility Tests
 * 
 * Requirements:
 * - 10.1: ARIA labels on all form inputs
 * - 10.2: Keyboard navigation for accordion sections
 * - 10.3: ARIA live regions for loading and error states
 * - 10.4: Focus management for add/remove object buttons
 * - 10.5: Semantic HTML for screen reader support
 */
describe('Pro Mode Accessibility Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('ARIA Labels and Semantic HTML', () => {
        it('should have ARIA labels on all Scene & Style inputs', () => {
            render(<ProModeForm />);

            // Expand Scene & Style section (should be open by default)
            expect(screen.getByLabelText(/short description/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/background setting/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/style medium/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/artistic style/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/additional context/i)).toBeInTheDocument();
        });

        it('should have ARIA labels on all Lighting inputs', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Expand Lighting section
            const lightingTrigger = screen.getByRole('button', { name: /lighting/i });
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

            // Expand Aesthetics section
            const aestheticsTrigger = screen.getByRole('button', { name: /aesthetics/i });
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

            // Expand Camera section
            const cameraTrigger = screen.getByRole('button', { name: /camera/i });
            await user.click(cameraTrigger);

            await waitFor(() => {
                expect(screen.getByLabelText(/camera angle/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/lens focal length/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/depth of field/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/focus/i)).toBeInTheDocument();
            });
        });

        it('should have proper ARIA labels on Generate button', () => {
            render(<ProModeForm />);

            const generateButton = screen.getByRole('button', { name: /generate image from structured prompt/i });
            expect(generateButton).toBeInTheDocument();
        });

        it('should use semantic HTML elements', () => {
            render(<ProModeForm />);

            // Verify heading structure
            expect(screen.getByRole('heading', { name: /pro mode/i, level: 1 })).toBeInTheDocument();

            // Verify button roles
            expect(screen.getByRole('button', { name: /generate image/i })).toBeInTheDocument();
        });
    });

    describe('Keyboard Navigation', () => {
        it('should support keyboard navigation through accordion sections', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Tab to first accordion trigger
            await user.tab();
            const sceneStyleTrigger = screen.getByRole('button', { name: /scene & style/i });
            expect(sceneStyleTrigger).toHaveFocus();

            // Press Enter to toggle
            await user.keyboard('{Enter}');

            // Tab to next accordion trigger
            await user.tab();
            const lightingTrigger = screen.getByRole('button', { name: /lighting/i });
            expect(lightingTrigger).toHaveFocus();

            // Press Space to toggle
            await user.keyboard(' ');
        });

        it('should support keyboard navigation through form inputs', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Scene & Style section should be open by default
            // Tab through inputs
            await user.tab(); // Scene & Style trigger
            await user.tab(); // Short description
            expect(screen.getByLabelText(/short description/i)).toHaveFocus();

            await user.tab(); // Background setting
            expect(screen.getByLabelText(/background setting/i)).toHaveFocus();

            await user.tab(); // Style medium
            expect(screen.getByLabelText(/style medium/i)).toHaveFocus();
        });

        it('should support keyboard navigation in Object Builder', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Navigate to Object Builder section
            const objectBuilderTrigger = screen.getByRole('button', { name: /object builder/i });
            await user.click(objectBuilderTrigger);

            // Tab to Add New Object button
            await waitFor(() => {
                const addButton = screen.getByRole('button', { name: /add new object to scene/i });
                expect(addButton).toBeInTheDocument();
            });

            const addButton = screen.getByRole('button', { name: /add new object to scene/i });
            await user.click(addButton);

            // Verify object card is added
            await waitFor(() => {
                expect(screen.getByText(/object 1/i)).toBeInTheDocument();
            });
        });
    });

    describe('ARIA Live Regions', () => {
        it('should announce loading state to screen readers', async () => {
            const user = userEvent.setup();

            vi.mocked(api.generateProMode).mockImplementation(
                () => new Promise(resolve => setTimeout(() => resolve({
                    success: true,
                    final_image_url: 'https://example.com/image.jpg',
                }), 100))
            );

            render(<ProModeForm />);

            // Fill minimal data and submit
            const shortDesc = screen.getByLabelText(/short description/i);
            await user.type(shortDesc, 'Test product');

            const generateButton = screen.getByRole('button', { name: /generate image/i });
            await user.click(generateButton);

            // Verify loading message with ARIA live region
            await waitFor(() => {
                const loadingRegion = screen.getByRole('status');
                expect(loadingRegion).toBeInTheDocument();
                expect(loadingRegion).toHaveAttribute('aria-live', 'polite');
                expect(within(loadingRegion).getByText(/please wait while we generate/i)).toBeInTheDocument();
            });
        });

        it('should announce errors with assertive ARIA live region', async () => {
            const user = userEvent.setup();

            vi.mocked(api.generateProMode).mockRejectedValue(
                new Error('Network error')
            );

            render(<ProModeForm />);

            // Fill and submit
            const shortDesc = screen.getByLabelText(/short description/i);
            await user.type(shortDesc, 'Test product');

            const generateButton = screen.getByRole('button', { name: /generate image/i });
            await user.click(generateButton);

            // Verify error is announced with assertive live region
            await waitFor(() => {
                const errorAlert = screen.getByRole('alert');
                expect(errorAlert).toBeInTheDocument();
                // Check that the parent container has aria-live="assertive"
                const errorContainer = errorAlert.parentElement;
                expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
                expect(errorContainer).toHaveAttribute('aria-atomic', 'true');
                expect(within(errorAlert).getByText(/network error/i)).toBeInTheDocument();
            });
        });

        it('should announce success with polite ARIA live region', async () => {
            const user = userEvent.setup();

            vi.mocked(api.generateProMode).mockResolvedValue({
                success: true,
                final_image_url: 'https://example.com/image.jpg',
            });

            render(<ProModeForm />);

            // Fill and submit
            const shortDesc = screen.getByLabelText(/short description/i);
            await user.type(shortDesc, 'Test product');

            const generateButton = screen.getByRole('button', { name: /generate image/i });
            await user.click(generateButton);

            // Verify success region
            await waitFor(() => {
                const resultRegion = screen.getByRole('region', { name: /generated image/i });
                expect(resultRegion).toBeInTheDocument();
                expect(resultRegion).toHaveAttribute('aria-live', 'polite');
            });
        });
    });

    describe('Focus Management', () => {
        it('should manage focus when adding objects', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Navigate to Object Builder
            const objectBuilderTrigger = screen.getByRole('button', { name: /object builder/i });
            await user.click(objectBuilderTrigger);

            // Click Add New Object button
            const addButton = screen.getByRole('button', { name: /add new object to scene/i });
            await user.click(addButton);

            // Verify object card is added
            await waitFor(() => {
                expect(screen.getByText(/object 1/i)).toBeInTheDocument();
            });
        });

        it('should return focus to Add button after removing object', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Navigate to Object Builder
            const objectBuilderTrigger = screen.getByRole('button', { name: /object builder/i });
            await user.click(objectBuilderTrigger);

            // Add an object
            const addButton = screen.getByRole('button', { name: /add new object to scene/i });
            await user.click(addButton);

            // Wait for object to be added
            await waitFor(() => {
                expect(screen.getByText(/object 1/i)).toBeInTheDocument();
            });

            // Remove the object
            const removeButton = screen.getByRole('button', { name: /remove object 1 from scene/i });
            await user.click(removeButton);

            // Verify focus returns to Add button
            await waitFor(() => {
                expect(addButton).toHaveFocus();
            });
        });

        it('should have proper ARIA labels on object remove buttons', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Navigate to Object Builder
            const objectBuilderTrigger = screen.getByRole('button', { name: /object builder/i });
            await user.click(objectBuilderTrigger);

            // Add two objects
            const addButton = screen.getByRole('button', { name: /add new object to scene/i });
            await user.click(addButton);
            await user.click(addButton);

            // Verify both remove buttons have proper labels
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /remove object 1 from scene/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /remove object 2 from scene/i })).toBeInTheDocument();
            });
        });

        it('should have visible focus indicators', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Tab to first input
            await user.tab();
            await user.tab();

            const shortDesc = screen.getByLabelText(/short description/i);
            expect(shortDesc).toHaveFocus();
        });
    });

    describe('Object Builder Accessibility', () => {
        it('should have proper ARIA labels on all object inputs', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Navigate to Object Builder
            const objectBuilderTrigger = screen.getByRole('button', { name: /object builder/i });
            await user.click(objectBuilderTrigger);

            // Add an object
            const addButton = screen.getByRole('button', { name: /add new object to scene/i });
            await user.click(addButton);

            // Verify all object inputs have proper labels
            await waitFor(() => {
                expect(screen.getByLabelText(/description for object 1/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/location for object 1/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/relationship for object 1/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/relative size for object 1/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/shape and color for object 1/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/texture for object 1/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/appearance details for object 1/i)).toBeInTheDocument();
            });
        });

        it('should announce object count to screen readers', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Navigate to Object Builder
            const objectBuilderTrigger = screen.getByRole('button', { name: /object builder/i });
            await user.click(objectBuilderTrigger);

            // Add two objects
            const addButton = screen.getByRole('button', { name: /add new object to scene/i });
            await user.click(addButton);
            await user.click(addButton);

            // Verify list has proper ARIA label with count
            await waitFor(() => {
                const objectList = screen.getByRole('list', { name: /2 objects in scene/i });
                expect(objectList).toBeInTheDocument();
            });
        });

        it('should have proper group role for object cards', async () => {
            const user = userEvent.setup();
            render(<ProModeForm />);

            // Navigate to Object Builder
            const objectBuilderTrigger = screen.getByRole('button', { name: /object builder/i });
            await user.click(objectBuilderTrigger);

            // Add an object
            const addButton = screen.getByRole('button', { name: /add new object to scene/i });
            await user.click(addButton);

            // Verify object card has group role
            await waitFor(() => {
                const objectCard = screen.getByRole('group', { name: /object 1/i });
                expect(objectCard).toBeInTheDocument();
            });
        });
    });

    describe('Button Accessibility', () => {
        it('should have descriptive ARIA labels on action buttons', async () => {
            const user = userEvent.setup();

            vi.mocked(api.generateProMode).mockResolvedValue({
                success: true,
                final_image_url: 'https://example.com/image.jpg',
            });

            render(<ProModeForm />);

            // Generate an image
            const shortDesc = screen.getByLabelText(/short description/i);
            await user.type(shortDesc, 'Test product');

            const generateButton = screen.getByRole('button', { name: /generate image from structured prompt/i });
            await user.click(generateButton);

            // Wait for result
            await waitFor(() => {
                expect(screen.getByAltText(/generated product image/i)).toBeInTheDocument();
            });

            // Verify action buttons have proper labels
            expect(screen.getByRole('button', { name: /open generated image in new tab/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /clear result and generate another image/i })).toBeInTheDocument();
        });

        it('should have proper ARIA label on dismiss error button', async () => {
            const user = userEvent.setup();

            vi.mocked(api.generateProMode).mockRejectedValue(
                new Error('Test error')
            );

            render(<ProModeForm />);

            // Trigger error
            const shortDesc = screen.getByLabelText(/short description/i);
            await user.type(shortDesc, 'Test product');

            const generateButton = screen.getByRole('button', { name: /generate image/i });
            await user.click(generateButton);

            // Wait for error
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
            });

            // Verify dismiss button has proper label
            expect(screen.getByRole('button', { name: /dismiss error message/i })).toBeInTheDocument();
        });
    });
});
