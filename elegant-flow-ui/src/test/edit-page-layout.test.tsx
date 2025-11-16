/**
 * EditPageLayout Component Tests
 * 
 * Tests for the split-panel layout component
 * Requirements: 2.1, 2.2, 2.3, 5.1, 5.2
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EditPageLayout } from '@/components/EditPageLayout';

describe('EditPageLayout', () => {
    const mockToolPanel = <div data-testid="tool-panel">Tool Panel Content</div>;
    const mockImagePanel = <div data-testid="image-panel">Image Panel Content</div>;

    it('renders tool panel and image panel', () => {
        render(
            <EditPageLayout
                toolPanel={mockToolPanel}
                imagePanel={mockImagePanel}
            />
        );

        expect(screen.getByTestId('tool-panel')).toBeInTheDocument();
        expect(screen.getByTestId('image-panel')).toBeInTheDocument();
    });

    it('renders with proper ARIA labels', () => {
        render(
            <EditPageLayout
                toolPanel={mockToolPanel}
                imagePanel={mockImagePanel}
            />
        );

        expect(screen.getByRole('complementary', { name: 'Editing tools' })).toBeInTheDocument();
        expect(screen.getByRole('main', { name: 'Image canvas' })).toBeInTheDocument();
    });

    it('renders divider when resize is enabled', () => {
        render(
            <EditPageLayout
                toolPanel={mockToolPanel}
                imagePanel={mockImagePanel}
                enableResize={true}
            />
        );

        const divider = screen.getByRole('separator', { name: 'Resize panels' });
        expect(divider).toBeInTheDocument();
    });

    it('does not render divider when resize is disabled', () => {
        render(
            <EditPageLayout
                toolPanel={mockToolPanel}
                imagePanel={mockImagePanel}
                enableResize={false}
            />
        );

        const divider = screen.queryByRole('separator', { name: 'Resize panels' });
        expect(divider).not.toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
        const { container } = render(
            <EditPageLayout
                toolPanel={mockToolPanel}
                imagePanel={mockImagePanel}
                className="custom-class"
            />
        );

        const layout = container.querySelector('.edit-page-layout');
        expect(layout).toHaveClass('custom-class');
    });
});
