/**
 * EditingToolbar Component Tests
 * 
 * Tests for the editing toolbar component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditingToolbar, type EditingTool } from '@/components/EditingToolbar';

describe('EditingToolbar', () => {
    const mockOnToolSelect = vi.fn();

    it('renders all tool buttons', () => {
        render(
            <EditingToolbar
                onToolSelect={mockOnToolSelect}
                selectedTool={null}
            />
        );

        // Check for main buttons
        expect(screen.getByRole('button', { name: /background editing tools/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /generative fill tool/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /enhancement tools/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /canvas expansion tool/i })).toBeInTheDocument();
    });

    it('calls onToolSelect when generative fill is clicked', async () => {
        const user = userEvent.setup();
        render(
            <EditingToolbar
                onToolSelect={mockOnToolSelect}
                selectedTool={null}
            />
        );

        const genFillButton = screen.getByRole('button', { name: /generative fill tool/i });
        await user.click(genFillButton);

        expect(mockOnToolSelect).toHaveBeenCalledWith('generative-fill');
    });

    it('calls onToolSelect when expand is clicked', async () => {
        const user = userEvent.setup();
        render(
            <EditingToolbar
                onToolSelect={mockOnToolSelect}
                selectedTool={null}
            />
        );

        const expandButton = screen.getByRole('button', { name: /canvas expansion tool/i });
        await user.click(expandButton);

        expect(mockOnToolSelect).toHaveBeenCalledWith('expand');
    });

    it('opens background dropdown menu', async () => {
        const user = userEvent.setup();
        render(
            <EditingToolbar
                onToolSelect={mockOnToolSelect}
                selectedTool={null}
            />
        );

        const backgroundButton = screen.getByRole('button', { name: /background editing tools/i });
        await user.click(backgroundButton);

        // Check for dropdown menu items
        expect(screen.getByRole('menuitem', { name: /remove background/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /replace background/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /blur background/i })).toBeInTheDocument();
    });

    it('opens enhance dropdown menu', async () => {
        const user = userEvent.setup();
        render(
            <EditingToolbar
                onToolSelect={mockOnToolSelect}
                selectedTool={null}
            />
        );

        const enhanceButton = screen.getByRole('button', { name: /enhancement tools/i });
        await user.click(enhanceButton);

        // Check for dropdown menu items
        expect(screen.getByRole('menuitem', { name: /enhance quality/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /upscale resolution/i })).toBeInTheDocument();
    });

    it('highlights selected tool', () => {
        render(
            <EditingToolbar
                onToolSelect={mockOnToolSelect}
                selectedTool="generative-fill"
            />
        );

        const genFillButton = screen.getByRole('button', { name: /generative fill tool/i });
        expect(genFillButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('disables all buttons when disabled prop is true', () => {
        render(
            <EditingToolbar
                onToolSelect={mockOnToolSelect}
                selectedTool={null}
                disabled={true}
            />
        );

        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
            expect(button).toBeDisabled();
        });
    });

    it('has proper ARIA attributes', () => {
        render(
            <EditingToolbar
                onToolSelect={mockOnToolSelect}
                selectedTool={null}
            />
        );

        const toolbar = screen.getByRole('toolbar', { name: /image editing tools/i });
        expect(toolbar).toBeInTheDocument();
    });
});
