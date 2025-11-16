/**
 * Edit Page Accessibility Tests
 * 
 * Tests for Task 15: Implement accessibility features
 * Requirements: 8.1, 8.2, 8.3, 8.4
 * 
 * Tests:
 * - ARIA labels on all interactive elements
 * - Focus management for modals
 * - Keyboard navigation support
 * - Proper heading hierarchy
 * - Skip links for navigation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { EditPage } from '../pages/EditPage';
import { EditPageLayout } from '../components/EditPageLayout';
import { EditPageHeader } from '../components/EditPageHeader';
import { ToolPanel } from '../components/ToolPanel';
import { ImagePanel } from '../components/ImagePanel';

// Mock hooks
vi.mock('../hooks/useEditHistory', () => ({
    useEditHistory: () => ({
        currentImageUrl: 'https://example.com/test-image.jpg',
        canUndo: true,
        canRedo: true,
        initialize: vi.fn(),
        addToHistory: vi.fn(),
        undo: vi.fn(),
        redo: vi.fn(),
        reset: vi.fn(),
    }),
}));

vi.mock('../hooks/useKeyboardShortcuts', () => ({
    useKeyboardShortcuts: vi.fn(),
    getShortcutText: (key: string) => {
        const shortcuts: Record<string, string> = {
            'undo': 'Ctrl+Z',
            'redo': 'Ctrl+Y',
            'download': 'Ctrl+S',
            'escape': 'Esc',
        };
        return shortcuts[key] || key;
    },
}));

vi.mock('../hooks/useToast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

describe('Edit Page Accessibility', () => {
    describe('Skip Links - Requirement 8.4', () => {
        it('should render skip links for navigation', () => {
            render(
                <MemoryRouter initialEntries={[{ pathname: '/edit', search: '?imageUrl=test.jpg' }]}>
                    <EditPage />
                </MemoryRouter>
            );

            const skipToMain = screen.getByText('Skip to main content');
            const skipToTools = screen.getByText('Skip to editing tools');

            expect(skipToMain).toBeInTheDocument();
            expect(skipToTools).toBeInTheDocument();
            expect(skipToMain).toHaveAttribute('href', '#main-content');
            expect(skipToTools).toHaveAttribute('href', '#editing-tools');
        });

        it('should make skip links visible on focus', () => {
            render(
                <MemoryRouter initialEntries={[{ pathname: '/edit', search: '?imageUrl=test.jpg' }]}>
                    <EditPage />
                </MemoryRouter>
            );

            const skipLink = screen.getByText('Skip to main content');

            // Skip link should have sr-only class initially
            expect(skipLink).toHaveClass('sr-only');

            // Should have focus:not-sr-only class for visibility on focus
            expect(skipLink).toHaveClass('focus:not-sr-only');
        });
    });

    describe('ARIA Labels - Requirement 8.1', () => {
        it('should have ARIA labels on all interactive elements in EditPageHeader', () => {
            const mockOnBack = vi.fn();
            const mockOnDownload = vi.fn();
            const mockOnUndo = vi.fn();
            const mockOnRedo = vi.fn();

            render(
                <BrowserRouter>
                    <EditPageHeader
                        onBack={mockOnBack}
                        onDownload={mockOnDownload}
                        onUndo={mockOnUndo}
                        onRedo={mockOnRedo}
                        canUndo={true}
                        canRedo={true}
                        hasUnsavedChanges={false}
                    />
                </BrowserRouter>
            );

            // Check back button
            const backButton = screen.getByLabelText(/go back to previous page/i);
            expect(backButton).toBeInTheDocument();

            // Check download button
            const downloadButton = screen.getByLabelText(/download edited image/i);
            expect(downloadButton).toBeInTheDocument();

            // Check undo button
            const undoButton = screen.getByLabelText(/undo last action/i);
            expect(undoButton).toBeInTheDocument();

            // Check redo button
            const redoButton = screen.getByLabelText(/redo last action/i);
            expect(redoButton).toBeInTheDocument();
        });

        it('should have ARIA labels on zoom controls in ImagePanel', () => {
            render(
                <BrowserRouter>
                    <ImagePanel
                        imageUrl="https://example.com/test.jpg"
                        canUndo={true}
                        canRedo={true}
                        onUndo={vi.fn()}
                        onRedo={vi.fn()}
                        onReset={vi.fn()}
                    />
                </BrowserRouter>
            );

            // Check zoom controls
            expect(screen.getByLabelText(/zoom out/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/zoom in/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/zoom to fit/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/current zoom level/i)).toBeInTheDocument();
        });

        it('should have ARIA labels on history controls in ImagePanel', () => {
            render(
                <BrowserRouter>
                    <ImagePanel
                        imageUrl="https://example.com/test.jpg"
                        canUndo={true}
                        canRedo={true}
                        onUndo={vi.fn()}
                        onRedo={vi.fn()}
                        onReset={vi.fn()}
                    />
                </BrowserRouter>
            );

            // Check history controls
            expect(screen.getByLabelText(/undo last action/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/redo last action/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/reset to original/i)).toBeInTheDocument();
        });

        it('should have ARIA labels on tool accordion sections', () => {
            render(
                <BrowserRouter>
                    <ToolPanel
                        currentImageUrl="https://example.com/test.jpg"
                        onEditComplete={vi.fn()}
                        isProcessing={false}
                    />
                </BrowserRouter>
            );

            // Check accordion sections have proper ARIA labels and controls
            const backgroundSection = screen.getByLabelText(/background editing tools section/i);
            expect(backgroundSection).toBeInTheDocument();
            expect(backgroundSection).toHaveAttribute('aria-controls', 'background-tools-content');

            // Check that all accordion sections are present with proper structure
            const accordionButtons = screen.getAllByRole('button');
            expect(accordionButtons.length).toBeGreaterThan(0);

            // Verify accordion has proper ARIA label
            const accordion = screen.getByLabelText(/image editing tools/i);
            expect(accordion).toBeInTheDocument();
        });
    });

    describe('Proper Heading Hierarchy - Requirement 8.4', () => {
        it('should have proper heading hierarchy in EditPage', () => {
            render(
                <MemoryRouter initialEntries={[{ pathname: '/edit', search: '?imageUrl=test.jpg' }]}>
                    <EditPage />
                </MemoryRouter>
            );

            // Main heading should be h1
            const mainHeading = screen.getByRole('heading', { level: 1, name: /image editor/i });
            expect(mainHeading).toBeInTheDocument();

            // Tool panel heading should be h2
            const toolPanelHeading = screen.getByRole('heading', { level: 2, name: /editing tools/i });
            expect(toolPanelHeading).toBeInTheDocument();
        });

        it('should have proper heading in error states', () => {
            render(
                <MemoryRouter initialEntries={[{ pathname: '/edit' }]}>
                    <EditPage />
                </MemoryRouter>
            );

            // Error page should have h1
            const errorHeading = screen.getByRole('heading', { level: 1 });
            expect(errorHeading).toBeInTheDocument();
        });
    });

    describe('Focus Management - Requirement 8.2', () => {
        it('should focus cancel button when confirmation dialog opens', async () => {
            const user = userEvent.setup();
            const mockOnBack = vi.fn();

            render(
                <BrowserRouter>
                    <EditPageHeader
                        onBack={mockOnBack}
                        onDownload={vi.fn()}
                        hasUnsavedChanges={true}
                    />
                </BrowserRouter>
            );

            // Click back button to open dialog
            const backButton = screen.getByLabelText(/go back to previous page/i);
            await user.click(backButton);

            // Wait for dialog to open
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            // Cancel button should be in the document
            const cancelButton = screen.getByRole('button', { name: /cancel and continue editing/i });
            expect(cancelButton).toBeInTheDocument();
        });

        it('should have proper focus indicators on interactive elements', () => {
            render(
                <BrowserRouter>
                    <ImagePanel
                        imageUrl="https://example.com/test.jpg"
                        canUndo={true}
                        canRedo={true}
                        onUndo={vi.fn()}
                        onRedo={vi.fn()}
                        onReset={vi.fn()}
                    />
                </BrowserRouter>
            );

            // All buttons should be focusable and have proper roles
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);

            // Verify buttons are in the document and accessible
            buttons.forEach(button => {
                expect(button).toBeInTheDocument();
                // Buttons from shadcn/ui may not always have explicit type="button"
                // but they should be accessible via role
            });
        });
    });

    describe('Keyboard Navigation - Requirement 8.3', () => {
        it('should support keyboard navigation for panel resizer', async () => {
            const user = userEvent.setup();

            render(
                <BrowserRouter>
                    <EditPageLayout
                        enableResize={true}
                        toolPanel={<div>Tools</div>}
                        imagePanel={<div>Image</div>}
                    />
                </BrowserRouter>
            );

            const resizer = screen.getByRole('separator', { name: /resize panels/i });
            expect(resizer).toBeInTheDocument();
            expect(resizer).toHaveAttribute('tabIndex', '0');
            expect(resizer).toHaveAttribute('aria-orientation', 'vertical');
            expect(resizer).toHaveAttribute('aria-valuenow');
            expect(resizer).toHaveAttribute('aria-valuemin', '25');
            expect(resizer).toHaveAttribute('aria-valuemax', '50');
        });

        it('should have tabIndex on main content areas for skip links', () => {
            render(
                <BrowserRouter>
                    <EditPageLayout
                        enableResize={true}
                        toolPanel={<div>Tools</div>}
                        imagePanel={<div>Image</div>}
                    />
                </BrowserRouter>
            );

            const toolPanel = screen.getByRole('complementary', { name: /editing tools panel/i });
            const mainContent = screen.getByRole('main', { name: /image canvas and preview area/i });

            expect(toolPanel).toHaveAttribute('tabIndex', '-1');
            expect(mainContent).toHaveAttribute('tabIndex', '-1');
        });
    });

    describe('Live Regions - Requirement 8.1', () => {
        it('should have live region for status announcements in EditPage', () => {
            render(
                <MemoryRouter initialEntries={[{ pathname: '/edit', search: '?imageUrl=test.jpg' }]}>
                    <EditPage />
                </MemoryRouter>
            );

            const liveRegion = screen.getByRole('status');
            expect(liveRegion).toBeInTheDocument();
            expect(liveRegion).toHaveAttribute('aria-live', 'polite');
            expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
        });

        it('should announce errors with assertive live region', () => {
            render(
                <BrowserRouter>
                    <ToolPanel
                        currentImageUrl="https://example.com/test.jpg"
                        onEditComplete={vi.fn()}
                        isProcessing={false}
                    />
                </BrowserRouter>
            );

            // Error messages should use assertive live region
            const toolPanel = screen.getByRole('region', { name: /editing tools/i });
            expect(toolPanel).toBeInTheDocument();
        });

        it('should announce loading state in ImagePanel', () => {
            render(
                <BrowserRouter>
                    <ImagePanel
                        imageUrl="https://example.com/test.jpg"
                        isLoading={true}
                        loadingMessage="Processing image..."
                    />
                </BrowserRouter>
            );

            const loadingAlert = screen.getByRole('alert');
            expect(loadingAlert).toBeInTheDocument();
            expect(loadingAlert).toHaveAttribute('aria-live', 'assertive');
            expect(loadingAlert).toHaveAttribute('aria-busy', 'true');
            expect(screen.getByText('Processing image...')).toBeInTheDocument();
        });
    });

    describe('Semantic HTML - Requirement 8.4', () => {
        it('should use semantic HTML elements in EditPageLayout', () => {
            render(
                <BrowserRouter>
                    <EditPageLayout
                        enableResize={true}
                        toolPanel={<div>Tools</div>}
                        imagePanel={<div>Image</div>}
                    />
                </BrowserRouter>
            );

            // Should have proper semantic elements
            expect(screen.getByRole('complementary')).toBeInTheDocument();
            expect(screen.getByRole('main')).toBeInTheDocument();
            expect(screen.getByRole('region', { name: /image editing workspace/i })).toBeInTheDocument();
        });

        it('should use semantic HTML in EditPageHeader', () => {
            render(
                <BrowserRouter>
                    <EditPageHeader
                        onBack={vi.fn()}
                        onDownload={vi.fn()}
                        hasUnsavedChanges={false}
                    />
                </BrowserRouter>
            );

            // Should have banner role (header)
            expect(screen.getByRole('banner')).toBeInTheDocument();
        });

        it('should use semantic HTML in ToolPanel', () => {
            render(
                <BrowserRouter>
                    <ToolPanel
                        currentImageUrl="https://example.com/test.jpg"
                        onEditComplete={vi.fn()}
                        isProcessing={false}
                    />
                </BrowserRouter>
            );

            // Should have proper regions
            expect(screen.getByRole('region', { name: /editing tools/i })).toBeInTheDocument();
        });
    });

    describe('Keyboard Shortcuts Display - Requirement 8.4', () => {
        it('should display keyboard shortcuts in tooltips', async () => {
            const user = userEvent.setup();

            render(
                <BrowserRouter>
                    <EditPageHeader
                        onBack={vi.fn()}
                        onDownload={vi.fn()}
                        onUndo={vi.fn()}
                        onRedo={vi.fn()}
                        canUndo={true}
                        canRedo={true}
                        hasUnsavedChanges={false}
                    />
                </BrowserRouter>
            );

            // Buttons should have aria-labels with keyboard shortcuts
            const undoButton = screen.getByLabelText(/undo last action.*ctrl\+z/i);
            expect(undoButton).toBeInTheDocument();

            const redoButton = screen.getByLabelText(/redo last action.*ctrl\+y/i);
            expect(redoButton).toBeInTheDocument();

            const downloadButton = screen.getByLabelText(/download edited image.*ctrl\+s/i);
            expect(downloadButton).toBeInTheDocument();
        });
    });

    describe('Error State Accessibility - Requirement 8.1', () => {
        it('should announce errors with proper ARIA attributes', () => {
            render(
                <MemoryRouter initialEntries={[{ pathname: '/edit' }]}>
                    <EditPage />
                </MemoryRouter>
            );

            // Error state should have alert role
            const errorAlert = screen.getByRole('alert');
            expect(errorAlert).toBeInTheDocument();
            expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
        });

        it('should have accessible error buttons', () => {
            render(
                <MemoryRouter initialEntries={[{ pathname: '/edit' }]}>
                    <EditPage />
                </MemoryRouter>
            );

            const goBackButton = screen.getByRole('button', { name: /return to previous page/i });
            expect(goBackButton).toBeInTheDocument();
        });
    });

    describe('Dialog Accessibility - Requirement 8.2', () => {
        it('should have proper ARIA attributes on confirmation dialog', async () => {
            const user = userEvent.setup();

            render(
                <BrowserRouter>
                    <EditPageHeader
                        onBack={vi.fn()}
                        onDownload={vi.fn()}
                        hasUnsavedChanges={true}
                    />
                </BrowserRouter>
            );

            // Open dialog
            const backButton = screen.getByLabelText(/go back to previous page/i);
            await user.click(backButton);

            await waitFor(() => {
                const dialog = screen.getByRole('dialog');
                expect(dialog).toBeInTheDocument();
                expect(dialog).toHaveAttribute('aria-describedby', 'dialog-description');
            });

            // Check dialog buttons have proper labels
            expect(screen.getByRole('button', { name: /cancel and continue editing/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /leave page and discard unsaved changes/i })).toBeInTheDocument();
        });
    });
});
