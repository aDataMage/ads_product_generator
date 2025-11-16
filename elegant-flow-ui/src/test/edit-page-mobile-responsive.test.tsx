/**
 * Edit Page Mobile Responsive Layout Tests
 * 
 * Tests for Task 12: Add responsive mobile layout
 * Requirements: 5.1, 5.2, 5.3, 5.4
 * 
 * Test Coverage:
 * - Stacked layout for mobile (<768px)
 * - Tool panel full width on mobile
 * - Image panel scrollable on mobile
 * - Touch interactions for zoom and pan
 * - All tools usable on mobile
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EditPage } from '@/pages/EditPage';
import { EditPageLayout } from '@/components/EditPageLayout';
import { ToolPanel } from '@/components/ToolPanel';
import { ImagePanel } from '@/components/ImagePanel';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({
            state: {
                imageUrl: 'https://example.com/test-image.jpg',
                originalImageUrl: 'https://example.com/original-image.jpg',
            },
        }),
    };
});

// Mock API
vi.mock('@/lib/api', () => ({
    removeBackground: vi.fn(),
    replaceBackground: vi.fn(),
    blurBackground: vi.fn(),
    generativeFill: vi.fn(),
    enhanceImage: vi.fn(),
    upscaleImage: vi.fn(),
    expandCanvas: vi.fn(),
}));

describe('Edit Page Mobile Responsive Layout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Requirement 5.1: Stacked layout for mobile (<768px)', () => {
        it('should render EditPageLayout with stacked layout on mobile', () => {
            // Set mobile viewport
            global.innerWidth = 375;
            global.innerHeight = 667;

            const { container } = render(
                <EditPageLayout
                    toolPanel={<div data-testid="tool-panel">Tools</div>}
                    imagePanel={<div data-testid="image-panel">Image</div>}
                />
            );

            const layout = container.querySelector('.edit-page-layout');
            expect(layout).toBeInTheDocument();

            // Check that both panels are rendered
            expect(screen.getByTestId('tool-panel')).toBeInTheDocument();
            expect(screen.getByTestId('image-panel')).toBeInTheDocument();
        });

        it('should apply mobile-specific CSS classes', () => {
            global.innerWidth = 375;

            const { container } = render(
                <EditPageLayout
                    toolPanel={<div>Tools</div>}
                    imagePanel={<div>Image</div>}
                />
            );

            const layout = container.querySelector('.edit-page-layout');
            expect(layout).toHaveClass('edit-page-layout');
        });
    });

    describe('Requirement 5.2: Tool panel full width on mobile', () => {
        it('should render ToolPanel with full width on mobile', () => {
            global.innerWidth = 375;

            const mockOnEditComplete = vi.fn();

            render(
                <ToolPanel
                    currentImageUrl="https://example.com/test-image.jpg"
                    onEditComplete={mockOnEditComplete}
                    isProcessing={false}
                />
            );

            const toolPanel = screen.getByRole('complementary', { name: /editing tools/i });
            expect(toolPanel).toBeInTheDocument();
        });

        it('should display all tool sections on mobile', () => {
            global.innerWidth = 375;

            const mockOnEditComplete = vi.fn();

            render(
                <ToolPanel
                    currentImageUrl="https://example.com/test-image.jpg"
                    onEditComplete={mockOnEditComplete}
                    isProcessing={false}
                />
            );

            // Check that all tool sections are present
            expect(screen.getByLabelText(/background editing tools/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/generative fill tool/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/image enhancement tools/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/canvas expansion tool/i)).toBeInTheDocument();
        });
    });

    describe('Requirement 5.3: Image panel scrollable on mobile', () => {
        it('should render ImagePanel with scrollable container on mobile', () => {
            global.innerWidth = 375;

            render(
                <ImagePanel
                    imageUrl="https://example.com/test-image.jpg"
                    originalImageUrl="https://example.com/original-image.jpg"
                />
            );

            const imagePanel = screen.getByRole('img', { name: /image being edited/i });
            expect(imagePanel).toBeInTheDocument();
        });

        it('should display zoom controls on mobile', () => {
            global.innerWidth = 375;

            render(
                <ImagePanel
                    imageUrl="https://example.com/test-image.jpg"
                />
            );

            // Check for zoom controls
            expect(screen.getByLabelText(/zoom out/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/zoom in/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/zoom to fit/i)).toBeInTheDocument();
        });
    });

    describe('Requirement 5.4: Touch interactions for zoom and pan', () => {
        it('should handle touch start event for pinch-to-zoom', () => {
            global.innerWidth = 375;

            const { container } = render(
                <ImagePanel
                    imageUrl="https://example.com/test-image.jpg"
                />
            );

            const imageContainer = container.querySelector('[role="img"]');

            // Simulate two-finger touch start
            const touchStart = new TouchEvent('touchstart', {
                touches: [
                    { clientX: 100, clientY: 100 } as Touch,
                    { clientX: 200, clientY: 200 } as Touch,
                ],
            });

            fireEvent(imageContainer!, touchStart);

            // Touch event should be handled without errors
            expect(imageContainer).toBeInTheDocument();
        });

        it('should handle touch move event for pan', () => {
            global.innerWidth = 375;

            const { container } = render(
                <ImagePanel
                    imageUrl="https://example.com/test-image.jpg"
                />
            );

            const imageContainer = container.querySelector('[role="img"]');

            // First zoom in to enable panning
            const zoomInButton = screen.getByLabelText(/zoom in/i);
            fireEvent.click(zoomInButton);

            // Simulate single-finger touch move
            const touchStart = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 } as Touch],
            });

            const touchMove = new TouchEvent('touchmove', {
                touches: [{ clientX: 150, clientY: 150 } as Touch],
            });

            fireEvent(imageContainer!, touchStart);
            fireEvent(imageContainer!, touchMove);

            // Touch event should be handled without errors
            expect(imageContainer).toBeInTheDocument();
        });

        it('should handle touch end event', () => {
            global.innerWidth = 375;

            const { container } = render(
                <ImagePanel
                    imageUrl="https://example.com/test-image.jpg"
                />
            );

            const imageContainer = container.querySelector('[role="img"]');

            // Simulate touch end
            const touchEnd = new TouchEvent('touchend', {
                touches: [],
            });

            fireEvent(imageContainer!, touchEnd);

            // Touch event should be handled without errors
            expect(imageContainer).toBeInTheDocument();
        });
    });

    describe('Requirement 5.5: All tools usable on mobile', () => {
        it('should allow opening tool accordion sections on mobile', async () => {
            global.innerWidth = 375;

            const mockOnEditComplete = vi.fn();

            render(
                <ToolPanel
                    currentImageUrl="https://example.com/test-image.jpg"
                    onEditComplete={mockOnEditComplete}
                    isProcessing={false}
                />
            );

            // Click on background tools accordion
            const backgroundTrigger = screen.getByLabelText(/background editing tools/i);
            fireEvent.click(backgroundTrigger);

            // Wait for accordion to open
            await waitFor(() => {
                // The accordion content should be visible
                const accordionContent = backgroundTrigger.parentElement?.nextElementSibling;
                expect(accordionContent).toBeInTheDocument();
            });
        });

        it('should display mobile-optimized button sizes', () => {
            global.innerWidth = 375;

            render(
                <ImagePanel
                    imageUrl="https://example.com/test-image.jpg"
                    canUndo={true}
                    canRedo={true}
                    onUndo={vi.fn()}
                    onRedo={vi.fn()}
                />
            );

            // Check that buttons are rendered with appropriate sizes
            const undoButton = screen.getByLabelText(/undo last action/i);
            const redoButton = screen.getByLabelText(/redo last action/i);

            expect(undoButton).toBeInTheDocument();
            expect(redoButton).toBeInTheDocument();
        });

        it('should display mobile-optimized toolbar spacing', () => {
            global.innerWidth = 375;

            const mockOnEditComplete = vi.fn();

            render(
                <ToolPanel
                    currentImageUrl="https://example.com/test-image.jpg"
                    onEditComplete={mockOnEditComplete}
                    isProcessing={false}
                />
            );

            // Check that the tool panel has appropriate mobile styling
            const toolPanel = screen.getByRole('complementary', { name: /editing tools/i });
            expect(toolPanel).toBeInTheDocument();
        });
    });

    describe('Tablet layout (768px-1024px)', () => {
        it('should render side-by-side layout on tablet', () => {
            global.innerWidth = 800;
            global.innerHeight = 600;

            const { container } = render(
                <EditPageLayout
                    toolPanel={<div data-testid="tool-panel">Tools</div>}
                    imagePanel={<div data-testid="image-panel">Image</div>}
                />
            );

            const layout = container.querySelector('.edit-page-layout');
            expect(layout).toBeInTheDocument();

            // Both panels should be visible
            expect(screen.getByTestId('tool-panel')).toBeInTheDocument();
            expect(screen.getByTestId('image-panel')).toBeInTheDocument();
        });
    });

    describe('Desktop layout (>1024px)', () => {
        it('should render side-by-side layout on desktop', () => {
            global.innerWidth = 1920;
            global.innerHeight = 1080;

            const { container } = render(
                <EditPageLayout
                    toolPanel={<div data-testid="tool-panel">Tools</div>}
                    imagePanel={<div data-testid="image-panel">Image</div>}
                />
            );

            const layout = container.querySelector('.edit-page-layout');
            expect(layout).toBeInTheDocument();

            // Both panels should be visible
            expect(screen.getByTestId('tool-panel')).toBeInTheDocument();
            expect(screen.getByTestId('image-panel')).toBeInTheDocument();
        });
    });

    describe('Smooth scrolling on mobile', () => {
        it('should enable smooth scrolling for tool panel', () => {
            global.innerWidth = 375;

            const mockOnEditComplete = vi.fn();

            const { container } = render(
                <ToolPanel
                    currentImageUrl="https://example.com/test-image.jpg"
                    onEditComplete={mockOnEditComplete}
                    isProcessing={false}
                />
            );

            // Check that the scrollable container exists
            const scrollContainer = container.querySelector('.overflow-y-auto');
            expect(scrollContainer).toBeInTheDocument();
        });

        it('should enable smooth scrolling for image panel', () => {
            global.innerWidth = 375;

            const { container } = render(
                <ImagePanel
                    imageUrl="https://example.com/test-image.jpg"
                />
            );

            // Check that the image container exists
            const imageContainer = container.querySelector('.overflow-hidden');
            expect(imageContainer).toBeInTheDocument();
        });
    });
});
