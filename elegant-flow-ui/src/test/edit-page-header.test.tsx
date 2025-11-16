/**
 * EditPageHeader Component Tests
 * 
 * Tests for the EditPageHeader component
 * Requirements: 4.1, 4.2, 4.3, 6.1, 6.2
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditPageHeader } from '@/components/EditPageHeader';

describe('EditPageHeader', () => {
    it('renders header with title', () => {
        const mockOnBack = vi.fn();
        const mockOnDownload = vi.fn();

        render(
            <EditPageHeader
                onBack={mockOnBack}
                onDownload={mockOnDownload}
            />
        );

        expect(screen.getByText('Image Editor')).toBeInTheDocument();
    });

    it('calls onBack when back button is clicked without unsaved changes', () => {
        const mockOnBack = vi.fn();
        const mockOnDownload = vi.fn();

        render(
            <EditPageHeader
                onBack={mockOnBack}
                onDownload={mockOnDownload}
                hasUnsavedChanges={false}
            />
        );

        const backButton = screen.getByLabelText(/go back to previous page/i);
        fireEvent.click(backButton);

        expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('shows confirmation dialog when back button is clicked with unsaved changes', () => {
        const mockOnBack = vi.fn();
        const mockOnDownload = vi.fn();

        render(
            <EditPageHeader
                onBack={mockOnBack}
                onDownload={mockOnDownload}
                hasUnsavedChanges={true}
            />
        );

        const backButton = screen.getByLabelText(/go back to previous page/i);
        fireEvent.click(backButton);

        // Dialog should appear
        expect(screen.getByText('Unsaved Changes')).toBeInTheDocument();
        expect(mockOnBack).not.toHaveBeenCalled();
    });

    it('calls onDownload when download button is clicked', () => {
        const mockOnBack = vi.fn();
        const mockOnDownload = vi.fn();

        render(
            <EditPageHeader
                onBack={mockOnBack}
                onDownload={mockOnDownload}
            />
        );

        const downloadButton = screen.getByLabelText(/download edited image/i);
        fireEvent.click(downloadButton);

        expect(mockOnDownload).toHaveBeenCalledTimes(1);
    });

    it('renders undo/redo buttons when handlers are provided', () => {
        const mockOnBack = vi.fn();
        const mockOnDownload = vi.fn();
        const mockOnUndo = vi.fn();
        const mockOnRedo = vi.fn();

        render(
            <EditPageHeader
                onBack={mockOnBack}
                onDownload={mockOnDownload}
                onUndo={mockOnUndo}
                onRedo={mockOnRedo}
                canUndo={true}
                canRedo={true}
            />
        );

        expect(screen.getByLabelText(/undo last action/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/redo last action/i)).toBeInTheDocument();
    });

    it('disables undo button when canUndo is false', () => {
        const mockOnBack = vi.fn();
        const mockOnDownload = vi.fn();
        const mockOnUndo = vi.fn();

        render(
            <EditPageHeader
                onBack={mockOnBack}
                onDownload={mockOnDownload}
                onUndo={mockOnUndo}
                canUndo={false}
            />
        );

        const undoButton = screen.getByLabelText(/undo last action/i);
        expect(undoButton).toBeDisabled();
    });

    it('disables redo button when canRedo is false', () => {
        const mockOnBack = vi.fn();
        const mockOnDownload = vi.fn();
        const mockOnRedo = vi.fn();

        render(
            <EditPageHeader
                onBack={mockOnBack}
                onDownload={mockOnDownload}
                onRedo={mockOnRedo}
                canRedo={false}
            />
        );

        const redoButton = screen.getByLabelText(/redo last action/i);
        expect(redoButton).toBeDisabled();
    });
});
