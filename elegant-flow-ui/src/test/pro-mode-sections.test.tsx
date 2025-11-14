import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SceneStyleSection } from '@/components/pro-mode/SceneStyleSection';
import { LightingSection } from '@/components/pro-mode/LightingSection';
import { AestheticsSection } from '@/components/pro-mode/AestheticsSection';
import { CameraSection } from '@/components/pro-mode/CameraSection';

/**
 * Unit tests for Pro Mode section components
 * Requirements: 2.5, 3.3, 4.3, 5.3
 * 
 * Tests cover:
 * - SceneStyleSection input changes and state updates
 * - LightingSection nested object updates
 * - AestheticsSection nested object updates
 * - CameraSection nested object updates
 */

describe('SceneStyleSection', () => {
    const mockOnChange = vi.fn();
    const defaultValues = {
        short_description: '',
        background_setting: '',
        style_medium: '',
        artistic_style: '',
        context: '',
    };

    it('renders all five input fields', () => {
        render(<SceneStyleSection values={defaultValues} onChange={mockOnChange} />);

        expect(screen.getByLabelText(/short description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/background setting/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/style medium/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/artistic style/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^additional context$/i)).toBeInTheDocument();
    });

    it('displays current values in inputs', () => {
        const values = {
            short_description: 'A modern smartphone',
            background_setting: 'White studio background',
            style_medium: 'Photography',
            artistic_style: 'Minimalist',
            context: 'Product photography',
        };

        render(<SceneStyleSection values={values} onChange={mockOnChange} />);

        expect(screen.getByLabelText(/short description/i)).toHaveValue('A modern smartphone');
        expect(screen.getByLabelText(/background setting/i)).toHaveValue('White studio background');
        expect(screen.getByLabelText(/style medium/i)).toHaveValue('Photography');
        expect(screen.getByLabelText(/artistic style/i)).toHaveValue('Minimalist');
        expect(screen.getByLabelText(/^additional context$/i)).toHaveValue('Product photography');
    });

    it('calls onChange when short_description is updated', async () => {
        const user = userEvent.setup();
        render(<SceneStyleSection values={defaultValues} onChange={mockOnChange} />);

        const input = screen.getByLabelText(/short description/i);
        await user.type(input, 'Test description');

        expect(mockOnChange).toHaveBeenCalledWith('short_description', expect.any(String));
    });

    it('calls onChange when background_setting is updated', async () => {
        const user = userEvent.setup();
        render(<SceneStyleSection values={defaultValues} onChange={mockOnChange} />);

        const input = screen.getByLabelText(/background setting/i);
        await user.type(input, 'Test background');

        expect(mockOnChange).toHaveBeenCalledWith('background_setting', expect.any(String));
    });

    it('calls onChange when style_medium is updated', async () => {
        const user = userEvent.setup();
        render(<SceneStyleSection values={defaultValues} onChange={mockOnChange} />);

        const input = screen.getByLabelText(/style medium/i);
        await user.type(input, 'Digital Art');

        expect(mockOnChange).toHaveBeenCalledWith('style_medium', expect.any(String));
    });

    it('calls onChange when artistic_style is updated', async () => {
        const user = userEvent.setup();
        render(<SceneStyleSection values={defaultValues} onChange={mockOnChange} />);

        const input = screen.getByLabelText(/artistic style/i);
        await user.type(input, 'Modern');

        expect(mockOnChange).toHaveBeenCalledWith('artistic_style', expect.any(String));
    });

    it('calls onChange when context is updated', async () => {
        const user = userEvent.setup();
        render(<SceneStyleSection values={defaultValues} onChange={mockOnChange} />);

        const input = screen.getByLabelText(/^additional context$/i);
        await user.type(input, 'E-commerce');

        expect(mockOnChange).toHaveBeenCalledWith('context', expect.any(String));
    });

    it('displays validation errors when provided', () => {
        const errors = {
            short_description: 'Short description is required',
            background_setting: 'Background setting is required',
        };

        render(<SceneStyleSection values={defaultValues} onChange={mockOnChange} errors={errors} />);

        expect(screen.getByText('Short description is required')).toBeInTheDocument();
        expect(screen.getByText('Background setting is required')).toBeInTheDocument();
    });
});

describe('LightingSection', () => {
    const mockOnChange = vi.fn();
    const defaultValues = {
        conditions: '',
        direction: '',
        shadows: '',
    };

    it('renders all three lighting input fields', () => {
        render(<LightingSection values={defaultValues} onChange={mockOnChange} />);

        expect(screen.getByLabelText(/lighting conditions/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/lighting direction/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/shadows/i)).toBeInTheDocument();
    });

    it('displays current lighting values in inputs', () => {
        const values = {
            conditions: 'Soft studio lighting',
            direction: 'Front lighting',
            shadows: 'Soft shadows',
        };

        render(<LightingSection values={values} onChange={mockOnChange} />);

        expect(screen.getByLabelText(/lighting conditions/i)).toHaveValue('Soft studio lighting');
        expect(screen.getByLabelText(/lighting direction/i)).toHaveValue('Front lighting');
        expect(screen.getByLabelText(/shadows/i)).toHaveValue('Soft shadows');
    });

    it('calls onChange when conditions is updated', async () => {
        const user = userEvent.setup();
        render(<LightingSection values={defaultValues} onChange={mockOnChange} />);

        const input = screen.getByLabelText(/lighting conditions/i);
        await user.type(input, 'Natural daylight');

        expect(mockOnChange).toHaveBeenCalledWith('conditions', expect.any(String));
    });

    it('calls onChange when direction is updated', async () => {
        const user = userEvent.setup();
        render(<LightingSection values={defaultValues} onChange={mockOnChange} />);

        const input = screen.getByLabelText(/lighting direction/i);
        await user.type(input, 'Side lighting');

        expect(mockOnChange).toHaveBeenCalledWith('direction', expect.any(String));
    });

    it('calls onChange when shadows is updated', async () => {
        const user = userEvent.setup();
        render(<LightingSection values={defaultValues} onChange={mockOnChange} />);

        const input = screen.getByLabelText(/shadows/i);
        await user.type(input, 'Hard shadows');

        expect(mockOnChange).toHaveBeenCalledWith('shadows', expect.any(String));
    });

    it('displays validation errors when provided', () => {
        const errors = {
            conditions: 'Lighting conditions are required',
            direction: 'Lighting direction is required',
        };

        render(<LightingSection values={defaultValues} onChange={mockOnChange} errors={errors} />);

        expect(screen.getByText('Lighting conditions are required')).toBeInTheDocument();
        expect(screen.getByText('Lighting direction is required')).toBeInTheDocument();
    });
});

describe('AestheticsSection', () => {
    const mockOnChange = vi.fn();
    const defaultValues = {
        composition: '',
        color_scheme: '',
        mood_atmosphere: '',
    };

    it('renders all three aesthetics input fields', () => {
        render(<AestheticsSection values={defaultValues} onChange={mockOnChange} />);

        expect(screen.getByLabelText(/composition/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/color scheme/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/mood.*atmosphere/i)).toBeInTheDocument();
    });

    it('displays current aesthetics values in inputs', () => {
        const values = {
            composition: 'Rule of thirds',
            color_scheme: 'Monochromatic',
            mood_atmosphere: 'Professional and clean',
        };

        render(<AestheticsSection values={values} onChange={mockOnChange} />);

        expect(screen.getByLabelText(/composition/i)).toHaveValue('Rule of thirds');
        expect(screen.getByLabelText(/color scheme/i)).toHaveValue('Monochromatic');
        expect(screen.getByLabelText(/mood.*atmosphere/i)).toHaveValue('Professional and clean');
    });

    it('calls onChange when composition is updated', async () => {
        const user = userEvent.setup();
        render(<AestheticsSection values={defaultValues} onChange={mockOnChange} />);

        const input = screen.getByLabelText(/composition/i);
        await user.type(input, 'Centered');

        expect(mockOnChange).toHaveBeenCalledWith('composition', expect.any(String));
    });

    it('calls onChange when color_scheme is updated', async () => {
        const user = userEvent.setup();
        render(<AestheticsSection values={defaultValues} onChange={mockOnChange} />);

        const input = screen.getByLabelText(/color scheme/i);
        await user.type(input, 'Warm tones');

        expect(mockOnChange).toHaveBeenCalledWith('color_scheme', expect.any(String));
    });

    it('calls onChange when mood_atmosphere is updated', async () => {
        const user = userEvent.setup();
        render(<AestheticsSection values={defaultValues} onChange={mockOnChange} />);

        const input = screen.getByLabelText(/mood.*atmosphere/i);
        await user.type(input, 'Dramatic');

        expect(mockOnChange).toHaveBeenCalledWith('mood_atmosphere', expect.any(String));
    });

    it('displays validation errors when provided', () => {
        const errors = {
            composition: 'Composition is required',
            mood_atmosphere: 'Mood/atmosphere is required',
        };

        render(<AestheticsSection values={defaultValues} onChange={mockOnChange} errors={errors} />);

        expect(screen.getByText('Composition is required')).toBeInTheDocument();
        expect(screen.getByText('Mood/atmosphere is required')).toBeInTheDocument();
    });
});

describe('CameraSection', () => {
    const mockOnChange = vi.fn();
    const defaultValues = {
        camera_angle: '',
        lens_focal_length: '',
        depth_of_field: '',
        focus: '',
    };

    it('renders all four camera input fields', () => {
        render(<CameraSection values={defaultValues} onChange={mockOnChange} />);

        expect(screen.getByLabelText(/camera angle/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/lens focal length/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/depth of field/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^focus$/i)).toBeInTheDocument();
    });

    it('displays current camera values in inputs', () => {
        const values = {
            camera_angle: 'Eye level',
            lens_focal_length: '50mm',
            depth_of_field: 'Shallow (f/1.8)',
            focus: 'Sharp focus on product',
        };

        render(<CameraSection values={values} onChange={mockOnChange} />);

        expect(screen.getByLabelText(/camera angle/i)).toHaveValue('Eye level');
        expect(screen.getByLabelText(/lens focal length/i)).toHaveValue('50mm');
        expect(screen.getByLabelText(/depth of field/i)).toHaveValue('Shallow (f/1.8)');
        expect(screen.getByLabelText(/^focus$/i)).toHaveValue('Sharp focus on product');
    });

    it('calls onChange when camera_angle is updated', async () => {
        const user = userEvent.setup();
        render(<CameraSection values={defaultValues} onChange={mockOnChange} />);

        const input = screen.getByLabelText(/camera angle/i);
        await user.type(input, 'Low angle');

        expect(mockOnChange).toHaveBeenCalledWith('camera_angle', expect.any(String));
    });

    it('calls onChange when lens_focal_length is updated', async () => {
        const user = userEvent.setup();
        render(<CameraSection values={defaultValues} onChange={mockOnChange} />);

        const input = screen.getByLabelText(/lens focal length/i);
        await user.type(input, '85mm');

        expect(mockOnChange).toHaveBeenCalledWith('lens_focal_length', expect.any(String));
    });

    it('calls onChange when depth_of_field is updated', async () => {
        const user = userEvent.setup();
        render(<CameraSection values={defaultValues} onChange={mockOnChange} />);

        const input = screen.getByLabelText(/depth of field/i);
        await user.type(input, 'Deep');

        expect(mockOnChange).toHaveBeenCalledWith('depth_of_field', expect.any(String));
    });

    it('calls onChange when focus is updated', async () => {
        const user = userEvent.setup();
        render(<CameraSection values={defaultValues} onChange={mockOnChange} />);

        const input = screen.getByLabelText(/^focus$/i);
        await user.type(input, 'Soft focus');

        expect(mockOnChange).toHaveBeenCalledWith('focus', expect.any(String));
    });

    it('displays validation errors when provided', () => {
        const errors = {
            camera_angle: 'Camera angle is required',
            focus: 'Focus is required',
        };

        render(<CameraSection values={defaultValues} onChange={mockOnChange} errors={errors} />);

        expect(screen.getByText('Camera angle is required')).toBeInTheDocument();
        expect(screen.getByText('Focus is required')).toBeInTheDocument();
    });
});
