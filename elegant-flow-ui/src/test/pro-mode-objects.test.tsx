import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ObjectCard } from '@/components/pro-mode/ObjectCard';
import { ObjectBuilderSection } from '@/components/pro-mode/ObjectBuilderSection';
import type { ObjectDefinition } from '@/lib/types';

/**
 * Unit tests for Pro Mode object management components
 * Requirements: 6.3, 6.4, 6.7, 6.8
 * 
 * Tests cover:
 * - ObjectCard field changes and removal
 * - ObjectBuilderSection add/remove object functionality
 * - Object array state management
 */

describe('ObjectCard', () => {
    const mockOnChange = vi.fn();
    const mockOnRemove = vi.fn();

    const mockObject: ObjectDefinition = {
        id: 'test-id-123',
        description: 'A sleek smartphone',
        location: 'Center of frame',
        relationship: 'Resting on surface',
        relative_size: 'Medium',
        shape_and_color: 'Rectangular, black',
        texture: 'Smooth glass',
        appearance_details: 'Reflective screen',
    };

    it('renders object card with correct title', () => {
        render(
            <ObjectCard
                object={mockObject}
                index={0}
                onChange={mockOnChange}
                onRemove={mockOnRemove}
            />
        );

        expect(screen.getByText('Object 1')).toBeInTheDocument();
    });

    it('renders all eight input fields', () => {
        render(
            <ObjectCard
                object={mockObject}
                index={0}
                onChange={mockOnChange}
                onRemove={mockOnRemove}
            />
        );

        expect(screen.getByLabelText(/description for object 1/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/location for object 1/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/relationship for object 1/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/relative size for object 1/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/shape and color for object 1/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/texture for object 1/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/appearance details for object 1/i)).toBeInTheDocument();
    });

    it('displays current object values in inputs', () => {
        render(
            <ObjectCard
                object={mockObject}
                index={0}
                onChange={mockOnChange}
                onRemove={mockOnRemove}
            />
        );

        expect(screen.getByLabelText(/description for object 1/i)).toHaveValue('A sleek smartphone');
        expect(screen.getByLabelText(/location for object 1/i)).toHaveValue('Center of frame');
        expect(screen.getByLabelText(/relationship for object 1/i)).toHaveValue('Resting on surface');
        expect(screen.getByLabelText(/relative size for object 1/i)).toHaveValue('Medium');
        expect(screen.getByLabelText(/shape and color for object 1/i)).toHaveValue('Rectangular, black');
        expect(screen.getByLabelText(/texture for object 1/i)).toHaveValue('Smooth glass');
        expect(screen.getByLabelText(/appearance details for object 1/i)).toHaveValue('Reflective screen');
    });

    it('calls onChange when description is updated', async () => {
        const user = userEvent.setup();
        const emptyObject = { ...mockObject, description: '' };

        render(
            <ObjectCard
                object={emptyObject}
                index={0}
                onChange={mockOnChange}
                onRemove={mockOnRemove}
            />
        );

        const input = screen.getByLabelText(/description for object 1/i);
        await user.type(input, 'New description');

        expect(mockOnChange).toHaveBeenCalledWith('description', expect.any(String));
    });

    it('calls onChange when location is updated', async () => {
        const user = userEvent.setup();
        const emptyObject = { ...mockObject, location: '' };

        render(
            <ObjectCard
                object={emptyObject}
                index={0}
                onChange={mockOnChange}
                onRemove={mockOnRemove}
            />
        );

        const input = screen.getByLabelText(/location for object 1/i);
        await user.type(input, 'Left side');

        expect(mockOnChange).toHaveBeenCalledWith('location', expect.any(String));
    });

    it('calls onChange when relationship is updated', async () => {
        const user = userEvent.setup();
        const emptyObject = { ...mockObject, relationship: '' };

        render(
            <ObjectCard
                object={emptyObject}
                index={0}
                onChange={mockOnChange}
                onRemove={mockOnRemove}
            />
        );

        const input = screen.getByLabelText(/relationship for object 1/i);
        await user.type(input, 'Floating');

        expect(mockOnChange).toHaveBeenCalledWith('relationship', expect.any(String));
    });

    it('calls onChange when relative_size is updated', async () => {
        const user = userEvent.setup();
        const emptyObject = { ...mockObject, relative_size: '' };

        render(
            <ObjectCard
                object={emptyObject}
                index={0}
                onChange={mockOnChange}
                onRemove={mockOnRemove}
            />
        );

        const input = screen.getByLabelText(/relative size for object 1/i);
        await user.type(input, 'Large');

        expect(mockOnChange).toHaveBeenCalledWith('relative_size', expect.any(String));
    });

    it('calls onChange when shape_and_color is updated', async () => {
        const user = userEvent.setup();
        const emptyObject = { ...mockObject, shape_and_color: '' };

        render(
            <ObjectCard
                object={emptyObject}
                index={0}
                onChange={mockOnChange}
                onRemove={mockOnRemove}
            />
        );

        const input = screen.getByLabelText(/shape and color for object 1/i);
        await user.type(input, 'Round, red');

        expect(mockOnChange).toHaveBeenCalledWith('shape_and_color', expect.any(String));
    });

    it('calls onChange when texture is updated', async () => {
        const user = userEvent.setup();
        const emptyObject = { ...mockObject, texture: '' };

        render(
            <ObjectCard
                object={emptyObject}
                index={0}
                onChange={mockOnChange}
                onRemove={mockOnRemove}
            />
        );

        const input = screen.getByLabelText(/texture for object 1/i);
        await user.type(input, 'Rough');

        expect(mockOnChange).toHaveBeenCalledWith('texture', expect.any(String));
    });

    it('calls onChange when appearance_details is updated', async () => {
        const user = userEvent.setup();
        const emptyObject = { ...mockObject, appearance_details: '' };

        render(
            <ObjectCard
                object={emptyObject}
                index={0}
                onChange={mockOnChange}
                onRemove={mockOnRemove}
            />
        );

        const input = screen.getByLabelText(/appearance details for object 1/i);
        await user.type(input, 'Shiny surface');

        expect(mockOnChange).toHaveBeenCalledWith('appearance_details', expect.any(String));
    });

    it('calls onRemove when remove button is clicked', async () => {
        const user = userEvent.setup();

        render(
            <ObjectCard
                object={mockObject}
                index={0}
                onChange={mockOnChange}
                onRemove={mockOnRemove}
            />
        );

        const removeButton = screen.getByRole('button', { name: /remove object 1/i });
        await user.click(removeButton);

        expect(mockOnRemove).toHaveBeenCalledTimes(1);
    });

    it('renders with correct index in title', () => {
        render(
            <ObjectCard
                object={mockObject}
                index={2}
                onChange={mockOnChange}
                onRemove={mockOnRemove}
            />
        );

        expect(screen.getByText('Object 3')).toBeInTheDocument();
    });
});

describe('ObjectBuilderSection', () => {
    const mockOnAddObject = vi.fn();
    const mockOnRemoveObject = vi.fn();
    const mockOnObjectChange = vi.fn();

    it('renders "Add New Object" button', () => {
        render(
            <ObjectBuilderSection
                objects={[]}
                onAddObject={mockOnAddObject}
                onRemoveObject={mockOnRemoveObject}
                onObjectChange={mockOnObjectChange}
            />
        );

        expect(screen.getByRole('button', { name: /add new object/i })).toBeInTheDocument();
    });

    it('displays empty state message when no objects', () => {
        render(
            <ObjectBuilderSection
                objects={[]}
                onAddObject={mockOnAddObject}
                onRemoveObject={mockOnRemoveObject}
                onObjectChange={mockOnObjectChange}
            />
        );

        expect(screen.getByText(/no objects added yet/i)).toBeInTheDocument();
    });

    it('calls onAddObject when "Add New Object" button is clicked', async () => {
        const user = userEvent.setup();

        render(
            <ObjectBuilderSection
                objects={[]}
                onAddObject={mockOnAddObject}
                onRemoveObject={mockOnRemoveObject}
                onObjectChange={mockOnObjectChange}
            />
        );

        const addButton = screen.getByRole('button', { name: /add new object/i });
        await user.click(addButton);

        expect(mockOnAddObject).toHaveBeenCalledTimes(1);
    });

    it('renders ObjectCard components for each object in array', () => {
        const objects: ObjectDefinition[] = [
            {
                id: 'obj-1',
                description: 'First object description',
                location: '',
                relationship: '',
                relative_size: '',
                shape_and_color: '',
                texture: '',
                appearance_details: '',
            },
            {
                id: 'obj-2',
                description: 'Second object description',
                location: '',
                relationship: '',
                relative_size: '',
                shape_and_color: '',
                texture: '',
                appearance_details: '',
            },
        ];

        render(
            <ObjectBuilderSection
                objects={objects}
                onAddObject={mockOnAddObject}
                onRemoveObject={mockOnRemoveObject}
                onObjectChange={mockOnObjectChange}
            />
        );

        // Check for the card titles (not descriptions)
        expect(screen.getByRole('group', { name: /object 1/i })).toBeInTheDocument();
        expect(screen.getByRole('group', { name: /object 2/i })).toBeInTheDocument();
    });

    it('does not display empty state when objects exist', () => {
        const objects: ObjectDefinition[] = [
            {
                id: 'obj-1',
                description: 'Test object',
                location: '',
                relationship: '',
                relative_size: '',
                shape_and_color: '',
                texture: '',
                appearance_details: '',
            },
        ];

        render(
            <ObjectBuilderSection
                objects={objects}
                onAddObject={mockOnAddObject}
                onRemoveObject={mockOnRemoveObject}
                onObjectChange={mockOnObjectChange}
            />
        );

        expect(screen.queryByText(/no objects added yet/i)).not.toBeInTheDocument();
    });

    it('calls onRemoveObject with correct id when object is removed', async () => {
        const user = userEvent.setup();
        const objects: ObjectDefinition[] = [
            {
                id: 'obj-to-remove',
                description: 'Test object',
                location: '',
                relationship: '',
                relative_size: '',
                shape_and_color: '',
                texture: '',
                appearance_details: '',
            },
        ];

        render(
            <ObjectBuilderSection
                objects={objects}
                onAddObject={mockOnAddObject}
                onRemoveObject={mockOnRemoveObject}
                onObjectChange={mockOnObjectChange}
            />
        );

        const removeButton = screen.getByRole('button', { name: /remove object 1/i });
        await user.click(removeButton);

        expect(mockOnRemoveObject).toHaveBeenCalledWith('obj-to-remove');
    });

    it('calls onObjectChange with correct parameters when object field is updated', async () => {
        const user = userEvent.setup();
        const objects: ObjectDefinition[] = [
            {
                id: 'obj-1',
                description: '',
                location: '',
                relationship: '',
                relative_size: '',
                shape_and_color: '',
                texture: '',
                appearance_details: '',
            },
        ];

        render(
            <ObjectBuilderSection
                objects={objects}
                onAddObject={mockOnAddObject}
                onRemoveObject={mockOnRemoveObject}
                onObjectChange={mockOnObjectChange}
            />
        );

        const descriptionInput = screen.getByLabelText(/description for object 1/i);
        await user.type(descriptionInput, 'Test');

        expect(mockOnObjectChange).toHaveBeenCalledWith('obj-1', 'description', expect.any(String));
    });

    it('renders multiple objects with correct indices', () => {
        const objects: ObjectDefinition[] = [
            {
                id: 'obj-1',
                description: 'First',
                location: '',
                relationship: '',
                relative_size: '',
                shape_and_color: '',
                texture: '',
                appearance_details: '',
            },
            {
                id: 'obj-2',
                description: 'Second',
                location: '',
                relationship: '',
                relative_size: '',
                shape_and_color: '',
                texture: '',
                appearance_details: '',
            },
            {
                id: 'obj-3',
                description: 'Third',
                location: '',
                relationship: '',
                relative_size: '',
                shape_and_color: '',
                texture: '',
                appearance_details: '',
            },
        ];

        render(
            <ObjectBuilderSection
                objects={objects}
                onAddObject={mockOnAddObject}
                onRemoveObject={mockOnRemoveObject}
                onObjectChange={mockOnObjectChange}
            />
        );

        expect(screen.getByText('Object 1')).toBeInTheDocument();
        expect(screen.getByText('Object 2')).toBeInTheDocument();
        expect(screen.getByText('Object 3')).toBeInTheDocument();
    });
});
