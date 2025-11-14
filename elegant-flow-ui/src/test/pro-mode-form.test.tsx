import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProModeForm } from '@/components/ProModeForm';
import * as api from '@/lib/api';

/**
 * Unit tests for ProModeForm component
 * Requirements: 1.4, 7.1, 7.2, 7.3
 * 
 * Tests cover:
 * - State initialization
 * - Nested state updates
 * - Seed generation
 * - Payload construction
 * - API call integration
 */

// Mock the API module
vi.mock('@/lib/api', () => ({
    generateProMode: vi.fn(),
    ApiError: class ApiError extends Error {
        constructor(message: string, public statusCode?: number) {
            super(message);
            this.name = 'ApiError';
        }
    },
}));

describe('ProModeForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with empty structured prompt state', () => {
        render(<ProModeForm />);

        // Check that all accordion sections are present
        expect(screen.getByText(/scene & style/i)).toBeInTheDocument();
        expect(screen.getByText(/lighting/i)).toBeInTheDocument();
        expect(screen.getByText(/aesthetics/i)).toBeInTheDocument();
        expect(screen.getByText(/camera/i)).toBeInTheDocument();
        expect(screen.getByText(/object builder/i)).toBeInTheDocument();

        // Check that generate button is present
        expect(screen.getByRole('button', { name: /generate image/i })).toBeInTheDocument();
    });

    it('updates top-level string fields correctly', async () => {
        const user = userEvent.setup();
        render(<ProModeForm />);

        // Open Scene & Style section (should be open by default)
        const shortDescInput = screen.getByLabelText(/short description/i);
        await user.type(shortDescInput, 'Test description');

        expect(shortDescInput).toHaveValue('Test description');
    });

    it('updates nested lighting object correctly', async () => {
        const user = userEvent.setup();
        render(<ProModeForm />);

        // Open Lighting section
        const lightingTrigger = screen.getByRole('button', { name: /lighting/i });
        await user.click(lightingTrigger);

        // Update lighting conditions
        const conditionsInput = screen.getByLabelText(/lighting conditions/i);
        await user.type(conditionsInput, 'Soft studio lighting');

        expect(conditionsInput).toHaveValue('Soft studio lighting');
    });

    it('updates nested aesthetics object correctly', async () => {
        const user = userEvent.setup();
        render(<ProModeForm />);

        // Open Aesthetics section
        const aestheticsTrigger = screen.getByRole('button', { name: /aesthetics/i });
        await user.click(aestheticsTrigger);

        // Update composition
        const compositionInput = screen.getByLabelText(/composition/i);
        await user.type(compositionInput, 'Rule of thirds');

        expect(compositionInput).toHaveValue('Rule of thirds');
    });

    it('updates nested camera object correctly', async () => {
        const user = userEvent.setup();
        render(<ProModeForm />);

        // Open Camera section
        const cameraTrigger = screen.getByRole('button', { name: /camera/i });
        await user.click(cameraTrigger);

        // Update camera angle
        const cameraAngleInput = screen.getByLabelText(/camera angle/i);
        await user.type(cameraAngleInput, 'Eye level');

        expect(cameraAngleInput).toHaveValue('Eye level');
    });

    it('adds new object to objects array', async () => {
        const user = userEvent.setup();
        render(<ProModeForm />);

        // Open Object Builder section
        const objectBuilderTrigger = screen.getByRole('button', { name: /object builder/i });
        await user.click(objectBuilderTrigger);

        // Initially should show empty state
        expect(screen.getByText(/no objects added yet/i)).toBeInTheDocument();

        // Click Add New Object button
        const addButton = screen.getByRole('button', { name: /add new object/i });
        await user.click(addButton);

        // Should now show Object 1
        expect(screen.getByText('Object 1')).toBeInTheDocument();
        expect(screen.queryByText(/no objects added yet/i)).not.toBeInTheDocument();
    });

    it('removes object from objects array', async () => {
        const user = userEvent.setup();
        render(<ProModeForm />);

        // Open Object Builder section
        const objectBuilderTrigger = screen.getByRole('button', { name: /object builder/i });
        await user.click(objectBuilderTrigger);

        // Add an object
        const addButton = screen.getByRole('button', { name: /add new object/i });
        await user.click(addButton);

        expect(screen.getByText('Object 1')).toBeInTheDocument();

        // Remove the object
        const removeButton = screen.getByRole('button', { name: /remove object 1/i });
        await user.click(removeButton);

        // Should show empty state again
        await waitFor(() => {
            expect(screen.queryByText('Object 1')).not.toBeInTheDocument();
            expect(screen.getByText(/no objects added yet/i)).toBeInTheDocument();
        });
    });

    it('updates object field correctly', async () => {
        const user = userEvent.setup();
        render(<ProModeForm />);

        // Open Object Builder section
        const objectBuilderTrigger = screen.getByRole('button', { name: /object builder/i });
        await user.click(objectBuilderTrigger);

        // Add an object
        const addButton = screen.getByRole('button', { name: /add new object/i });
        await user.click(addButton);

        // Update object description
        const descriptionInput = screen.getByLabelText(/description for object 1/i);
        await user.type(descriptionInput, 'A sleek smartphone');

        expect(descriptionInput).toHaveValue('A sleek smartphone');
    });

    it('shows validation errors when required fields are empty', async () => {
        const user = userEvent.setup();
        render(<ProModeForm />);

        // Try to generate without filling required fields
        const generateButton = screen.getByRole('button', { name: /generate image/i });
        await user.click(generateButton);

        // Should show validation error message
        await waitFor(() => {
            expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
        });
    });

    it('constructs payload correctly and calls API', async () => {
        const user = userEvent.setup();
        const mockGenerateProMode = vi.mocked(api.generateProMode);
        mockGenerateProMode.mockResolvedValue({
            success: true,
            final_image_url: 'https://example.com/image.jpg',
        });

        render(<ProModeForm />);

        // Fill in all required fields
        // Scene & Style
        await user.type(screen.getByLabelText(/short description/i), 'Test description');
        await user.type(screen.getByLabelText(/background setting/i), 'Test background');
        await user.type(screen.getByLabelText(/style medium/i), 'Photography');
        await user.type(screen.getByLabelText(/artistic style/i), 'Minimalist');
        await user.type(screen.getByLabelText(/additional context/i), 'Test context');

        // Lighting
        const lightingTrigger = screen.getByRole('button', { name: /lighting/i });
        await user.click(lightingTrigger);
        await user.type(screen.getByLabelText(/lighting conditions/i), 'Soft lighting');
        await user.type(screen.getByLabelText(/lighting direction/i), 'Front');
        await user.type(screen.getByLabelText(/shadows/i), 'Soft shadows');

        // Aesthetics
        const aestheticsTrigger = screen.getByRole('button', { name: /aesthetics/i });
        await user.click(aestheticsTrigger);
        await user.type(screen.getByLabelText(/composition/i), 'Centered');
        await user.type(screen.getByLabelText(/color scheme/i), 'Monochrome');
        await user.type(screen.getByLabelText(/mood.*atmosphere/i), 'Professional');

        // Camera
        const cameraTrigger = screen.getByRole('button', { name: /camera/i });
        await user.click(cameraTrigger);
        await user.type(screen.getByLabelText(/camera angle/i), 'Eye level');
        await user.type(screen.getByLabelText(/lens focal length/i), '50mm');
        await user.type(screen.getByLabelText(/depth of field/i), 'Shallow');
        await user.type(screen.getByLabelText(/^focus$/i), 'Sharp');

        // Generate
        const generateButton = screen.getByRole('button', { name: /generate image/i });
        await user.click(generateButton);

        // Wait for API call
        await waitFor(() => {
            expect(mockGenerateProMode).toHaveBeenCalledTimes(1);
        });

        // Verify payload structure
        const callArgs = mockGenerateProMode.mock.calls[0][0];
        expect(callArgs).toHaveProperty('structured_prompt');
        expect(callArgs).toHaveProperty('seed');
        expect(typeof callArgs.seed).toBe('number');
        expect(callArgs.structured_prompt.short_description).toBe('Test description');
        expect(callArgs.structured_prompt.lighting.conditions).toBe('Soft lighting');
        expect(callArgs.structured_prompt.aesthetics.composition).toBe('Centered');
        expect(callArgs.structured_prompt.photographic_characteristics.camera_angle).toBe('Eye level');
    });

    it('generates random seed on each submission', async () => {
        const user = userEvent.setup();
        const mockGenerateProMode = vi.mocked(api.generateProMode);
        mockGenerateProMode.mockResolvedValue({
            success: true,
            final_image_url: 'https://example.com/image.jpg',
        });

        render(<ProModeForm />);

        // Fill in all required fields (minimal)
        await user.type(screen.getByLabelText(/short description/i), 'Test');
        await user.type(screen.getByLabelText(/background setting/i), 'Test');
        await user.type(screen.getByLabelText(/style medium/i), 'Test');
        await user.type(screen.getByLabelText(/artistic style/i), 'Test');
        await user.type(screen.getByLabelText(/additional context/i), 'Test');

        const lightingTrigger = screen.getByRole('button', { name: /lighting/i });
        await user.click(lightingTrigger);
        await user.type(screen.getByLabelText(/lighting conditions/i), 'Test');
        await user.type(screen.getByLabelText(/lighting direction/i), 'Test');
        await user.type(screen.getByLabelText(/shadows/i), 'Test');

        const aestheticsTrigger = screen.getByRole('button', { name: /aesthetics/i });
        await user.click(aestheticsTrigger);
        await user.type(screen.getByLabelText(/composition/i), 'Test');
        await user.type(screen.getByLabelText(/color scheme/i), 'Test');
        await user.type(screen.getByLabelText(/mood.*atmosphere/i), 'Test');

        const cameraTrigger = screen.getByRole('button', { name: /camera/i });
        await user.click(cameraTrigger);
        await user.type(screen.getByLabelText(/camera angle/i), 'Test');
        await user.type(screen.getByLabelText(/lens focal length/i), 'Test');
        await user.type(screen.getByLabelText(/depth of field/i), 'Test');
        await user.type(screen.getByLabelText(/^focus$/i), 'Test');

        // Generate first time
        const generateButton = screen.getByRole('button', { name: /generate image/i });
        await user.click(generateButton);

        await waitFor(() => {
            expect(mockGenerateProMode).toHaveBeenCalledTimes(1);
        });

        const firstSeed = mockGenerateProMode.mock.calls[0][0].seed;

        // Clear the result and generate again
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /generate another/i })).toBeInTheDocument();
        });

        const generateAnotherButton = screen.getByRole('button', { name: /generate another/i });
        await user.click(generateAnotherButton);

        // Generate second time
        await user.click(generateButton);

        await waitFor(() => {
            expect(mockGenerateProMode).toHaveBeenCalledTimes(2);
        });

        const secondSeed = mockGenerateProMode.mock.calls[1][0].seed;

        // Seeds should be different (with very high probability)
        expect(firstSeed).not.toBe(secondSeed);
    });

    it('removes client-side id field from objects before API call', async () => {
        const user = userEvent.setup();
        const mockGenerateProMode = vi.mocked(api.generateProMode);
        mockGenerateProMode.mockResolvedValue({
            success: true,
            final_image_url: 'https://example.com/image.jpg',
        });

        render(<ProModeForm />);

        // Fill in all required fields
        await user.type(screen.getByLabelText(/short description/i), 'Test');
        await user.type(screen.getByLabelText(/background setting/i), 'Test');
        await user.type(screen.getByLabelText(/style medium/i), 'Test');
        await user.type(screen.getByLabelText(/artistic style/i), 'Test');
        await user.type(screen.getByLabelText(/additional context/i), 'Test');

        const lightingTrigger = screen.getByRole('button', { name: /lighting/i });
        await user.click(lightingTrigger);
        await user.type(screen.getByLabelText(/lighting conditions/i), 'Test');
        await user.type(screen.getByLabelText(/lighting direction/i), 'Test');
        await user.type(screen.getByLabelText(/shadows/i), 'Test');

        const aestheticsTrigger = screen.getByRole('button', { name: /aesthetics/i });
        await user.click(aestheticsTrigger);
        await user.type(screen.getByLabelText(/composition/i), 'Test');
        await user.type(screen.getByLabelText(/color scheme/i), 'Test');
        await user.type(screen.getByLabelText(/mood.*atmosphere/i), 'Test');

        const cameraTrigger = screen.getByRole('button', { name: /camera/i });
        await user.click(cameraTrigger);
        await user.type(screen.getByLabelText(/camera angle/i), 'Test');
        await user.type(screen.getByLabelText(/lens focal length/i), 'Test');
        await user.type(screen.getByLabelText(/depth of field/i), 'Test');
        await user.type(screen.getByLabelText(/^focus$/i), 'Test');

        // Add an object
        const objectBuilderTrigger = screen.getByRole('button', { name: /object builder/i });
        await user.click(objectBuilderTrigger);
        const addButton = screen.getByRole('button', { name: /add new object/i });
        await user.click(addButton);

        // Fill object fields
        await user.type(screen.getByLabelText(/description for object 1/i), 'Test object');
        await user.type(screen.getByLabelText(/location for object 1/i), 'Center');
        await user.type(screen.getByLabelText(/relationship for object 1/i), 'Resting');
        await user.type(screen.getByLabelText(/relative size for object 1/i), 'Medium');
        await user.type(screen.getByLabelText(/shape and color for object 1/i), 'Round');
        await user.type(screen.getByLabelText(/texture for object 1/i), 'Smooth');
        await user.type(screen.getByLabelText(/appearance details for object 1/i), 'Shiny');

        // Generate
        const generateButton = screen.getByRole('button', { name: /generate image/i });
        await user.click(generateButton);

        await waitFor(() => {
            expect(mockGenerateProMode).toHaveBeenCalledTimes(1);
        });

        // Verify that objects in payload don't have 'id' field
        const callArgs = mockGenerateProMode.mock.calls[0][0];
        expect(callArgs.structured_prompt.objects).toHaveLength(1);
        expect(callArgs.structured_prompt.objects[0]).not.toHaveProperty('id');
        expect(callArgs.structured_prompt.objects[0].description).toBe('Test object');
    });

    it('displays loading state during API call', async () => {
        const user = userEvent.setup();
        const mockGenerateProMode = vi.mocked(api.generateProMode);

        // Create a promise that we can control
        let resolvePromise: (value: any) => void;
        const promise = new Promise((resolve) => {
            resolvePromise = resolve;
        });
        mockGenerateProMode.mockReturnValue(promise as any);

        render(<ProModeForm />);

        // Fill in all required fields (minimal)
        await user.type(screen.getByLabelText(/short description/i), 'Test');
        await user.type(screen.getByLabelText(/background setting/i), 'Test');
        await user.type(screen.getByLabelText(/style medium/i), 'Test');
        await user.type(screen.getByLabelText(/artistic style/i), 'Test');
        await user.type(screen.getByLabelText(/additional context/i), 'Test');

        const lightingTrigger = screen.getByRole('button', { name: /lighting/i });
        await user.click(lightingTrigger);
        await user.type(screen.getByLabelText(/lighting conditions/i), 'Test');
        await user.type(screen.getByLabelText(/lighting direction/i), 'Test');
        await user.type(screen.getByLabelText(/shadows/i), 'Test');

        const aestheticsTrigger = screen.getByRole('button', { name: /aesthetics/i });
        await user.click(aestheticsTrigger);
        await user.type(screen.getByLabelText(/composition/i), 'Test');
        await user.type(screen.getByLabelText(/color scheme/i), 'Test');
        await user.type(screen.getByLabelText(/mood.*atmosphere/i), 'Test');

        const cameraTrigger = screen.getByRole('button', { name: /camera/i });
        await user.click(cameraTrigger);
        await user.type(screen.getByLabelText(/camera angle/i), 'Test');
        await user.type(screen.getByLabelText(/lens focal length/i), 'Test');
        await user.type(screen.getByLabelText(/depth of field/i), 'Test');
        await user.type(screen.getByLabelText(/^focus$/i), 'Test');

        // Generate
        const generateButton = screen.getByRole('button', { name: /generate image/i });
        await user.click(generateButton);

        // Should show loading state
        await waitFor(() => {
            expect(screen.getByText(/generating/i)).toBeInTheDocument();
            expect(screen.getByText(/please wait/i)).toBeInTheDocument();
        });

        // Button should be disabled
        expect(generateButton).toBeDisabled();

        // Resolve the promise
        resolvePromise!({
            success: true,
            final_image_url: 'https://example.com/image.jpg',
        });

        // Loading state should disappear
        await waitFor(() => {
            expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
        });
    });

    it('displays generated image on success', async () => {
        const user = userEvent.setup();
        const mockGenerateProMode = vi.mocked(api.generateProMode);
        mockGenerateProMode.mockResolvedValue({
            success: true,
            final_image_url: 'https://example.com/test-image.jpg',
        });

        render(<ProModeForm />);

        // Fill in all required fields (minimal)
        await user.type(screen.getByLabelText(/short description/i), 'Test');
        await user.type(screen.getByLabelText(/background setting/i), 'Test');
        await user.type(screen.getByLabelText(/style medium/i), 'Test');
        await user.type(screen.getByLabelText(/artistic style/i), 'Test');
        await user.type(screen.getByLabelText(/additional context/i), 'Test');

        const lightingTrigger = screen.getByRole('button', { name: /lighting/i });
        await user.click(lightingTrigger);
        await user.type(screen.getByLabelText(/lighting conditions/i), 'Test');
        await user.type(screen.getByLabelText(/lighting direction/i), 'Test');
        await user.type(screen.getByLabelText(/shadows/i), 'Test');

        const aestheticsTrigger = screen.getByRole('button', { name: /aesthetics/i });
        await user.click(aestheticsTrigger);
        await user.type(screen.getByLabelText(/composition/i), 'Test');
        await user.type(screen.getByLabelText(/color scheme/i), 'Test');
        await user.type(screen.getByLabelText(/mood.*atmosphere/i), 'Test');

        const cameraTrigger = screen.getByRole('button', { name: /camera/i });
        await user.click(cameraTrigger);
        await user.type(screen.getByLabelText(/camera angle/i), 'Test');
        await user.type(screen.getByLabelText(/lens focal length/i), 'Test');
        await user.type(screen.getByLabelText(/depth of field/i), 'Test');
        await user.type(screen.getByLabelText(/^focus$/i), 'Test');

        // Generate
        const generateButton = screen.getByRole('button', { name: /generate image/i });
        await user.click(generateButton);

        // Should display generated image
        await waitFor(() => {
            const image = screen.getByAltText(/generated product image/i);
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', 'https://example.com/test-image.jpg');
        });
    });

    it('displays error message on API failure', async () => {
        const user = userEvent.setup();
        const mockGenerateProMode = vi.mocked(api.generateProMode);
        mockGenerateProMode.mockRejectedValue(new api.ApiError('Test error message', 500));

        render(<ProModeForm />);

        // Fill in all required fields (minimal)
        await user.type(screen.getByLabelText(/short description/i), 'Test');
        await user.type(screen.getByLabelText(/background setting/i), 'Test');
        await user.type(screen.getByLabelText(/style medium/i), 'Test');
        await user.type(screen.getByLabelText(/artistic style/i), 'Test');
        await user.type(screen.getByLabelText(/additional context/i), 'Test');

        const lightingTrigger = screen.getByRole('button', { name: /lighting/i });
        await user.click(lightingTrigger);
        await user.type(screen.getByLabelText(/lighting conditions/i), 'Test');
        await user.type(screen.getByLabelText(/lighting direction/i), 'Test');
        await user.type(screen.getByLabelText(/shadows/i), 'Test');

        const aestheticsTrigger = screen.getByRole('button', { name: /aesthetics/i });
        await user.click(aestheticsTrigger);
        await user.type(screen.getByLabelText(/composition/i), 'Test');
        await user.type(screen.getByLabelText(/color scheme/i), 'Test');
        await user.type(screen.getByLabelText(/mood.*atmosphere/i), 'Test');

        const cameraTrigger = screen.getByRole('button', { name: /camera/i });
        await user.click(cameraTrigger);
        await user.type(screen.getByLabelText(/camera angle/i), 'Test');
        await user.type(screen.getByLabelText(/lens focal length/i), 'Test');
        await user.type(screen.getByLabelText(/depth of field/i), 'Test');
        await user.type(screen.getByLabelText(/^focus$/i), 'Test');

        // Generate
        const generateButton = screen.getByRole('button', { name: /generate image/i });
        await user.click(generateButton);

        // Should display error message
        await waitFor(() => {
            expect(screen.getByText(/server error occurred/i)).toBeInTheDocument();
        });
    });
});
