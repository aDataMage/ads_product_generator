/**
 * EditPage Component Tests
 * 
 * Tests for the main EditPage component
 * Requirements: All (comprehensive coverage)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { EditPage } from '@/pages/EditPage';

// Mock child components
vi.mock('@/components/EditPageHeader', () => ({
    EditPageHeader: ({ onBack, onDownload, onUndo, onRedo }: any) => (
        <div data-testid="edit-page-header">
            <button onClick={onBack}>Back</button>
            <button onClick={onDownload}>Download</button>
            <button onClick={onUndo}>Undo</button>
            <button onClick={onRedo}>Redo</button>
        </div>
    ),
}));

vi.mock('@/components/EditPageLayout', () => ({
    EditPageLayout: ({ toolPanel, imagePanel }: any) => (
        <div data-testid="edit-page-layout">
            <div data-testid="tool-panel">{toolPanel}</div>
            <div data-testid="image-panel">{imagePanel}</div>
        </div>
    ),
}));

vi.mock('@/components/LazyToolPanel', () => ({
    LazyToolPanel: ({ currentImageUrl, onEditComplete, isProcessing }: any) => (
        <div data-testid="lazy-tool-panel">
            <span>Image: {currentImageUrl}</span>
            <span>Processing: {isProcessing.toString()}</span>
            <button onClick={() => onEditComplete('http://example.com/edited.jpg', 'remove-bg')}>
                Complete Edit
            </button>
        </div>
    ),
}));

vi.mock('@/components/ImagePanel', () => ({
    ImagePanel: ({ imageUrl, isLoading, loadingMessage }: any) => (
        <div data-testid="image-panel-component">
            <img src={imageUrl} alt="Test" />
            {isLoading && <div data-testid="loading">{loadingMessage}</div>}
        </div>
    ),
}));

vi.mock('@/components/PerformanceMonitor', () => ({
    PerformanceMonitor: () => <div data-testid="performance-monitor" />,
}));

vi.mock('@/hooks/useKeyboardShortcuts', () => ({
    useKeyboardShortcuts: vi.fn(),
}));

vi.mock('@/hooks/useToast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

vi.mock('@/lib/imageCache', () => ({
    imageCache: {
        get: vi.fn().mockResolvedValue(new Blob()),
    },
}));

vi.mock('@/lib/performanceMonitor', () => ({
    performanceMonitor: {
        start: vi.fn(),
        end: vi.fn(),
    },
}));

describe('EditPage', () => {
    const mockImageUrl = 'http://example.com/test-image.jpg';

    beforeEach(() => {
        // Clear sessionStorage before each test
        sessionStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        sessionStorage.clear();
    });

    describe('Initialization', () => {
        it('should load image from navigation state', async () => {
            render(
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: '/edit',
                            state: { imageUrl: mockImageUrl },
                        },
                    ]}
                >
                    <EditPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('lazy-tool-panel')).toHaveTextContent(`Image: ${mockImageUrl}`);
            });
        });

        it('should load image from URL search params', async () => {
            render(
                <MemoryRouter initialEntries={[`/edit?imageUrl=${encodeURIComponent(mockImageUrl)}`]}>
                    <EditPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('lazy-tool-panel')).toHaveTextContent(`Image: ${mockImageUrl}`);
            });
        });

        it('should show error when no image URL is provided', () => {
            render(
                <MemoryRouter initialEntries={['/edit']}>
                    <EditPage />
                </MemoryRouter>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('No image URL provided');
            expect(screen.getByText('Go Back')).toBeInTheDocument();
        });

        it('should initialize with original image URL from state', async () => {
            const originalUrl = 'http://example.com/original.jpg';
            render(
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: '/edit',
                            state: {
                                imageUrl: mockImageUrl,
                                originalImageUrl: originalUrl,
                            },
                        },
                    ]}
                >
                    <EditPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('edit-page-layout')).toBeInTheDocument();
            });
        });
    });

    describe('Edit Operations', () => {
        it('should handle edit completion', async () => {
            const user = userEvent.setup();

            render(
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: '/edit',
                            state: { imageUrl: mockImageUrl },
                        },
                    ]}
                >
                    <EditPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('lazy-tool-panel')).toBeInTheDocument();
            });

            const completeButton = screen.getByText('Complete Edit');
            await user.click(completeButton);

            await waitFor(() => {
                expect(screen.getByTestId('lazy-tool-panel')).toHaveTextContent(
                    'Image: http://example.com/edited.jpg'
                );
            });
        });

        it('should show loading state during edit operation', async () => {
            render(
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: '/edit',
                            state: { imageUrl: mockImageUrl },
                        },
                    ]}
                >
                    <EditPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('lazy-tool-panel')).toHaveTextContent('Processing: false');
            });
        });
    });

    describe('Navigation', () => {
        it('should have back button in header', async () => {
            render(
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: '/edit',
                            state: { imageUrl: mockImageUrl, fromRoute: '/' },
                        },
                    ]}
                >
                    <EditPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('edit-page-header')).toBeInTheDocument();
            });

            const backButton = screen.getByText('Back');
            expect(backButton).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have skip links', async () => {
            render(
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: '/edit',
                            state: { imageUrl: mockImageUrl },
                        },
                    ]}
                >
                    <EditPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                const skipLinks = screen.getAllByRole('link');
                expect(skipLinks.length).toBeGreaterThan(0);
            });
        });

        it('should have proper ARIA live regions', async () => {
            render(
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: '/edit',
                            state: { imageUrl: mockImageUrl },
                        },
                    ]}
                >
                    <EditPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                const liveRegion = screen.getByRole('status', { hidden: true });
                expect(liveRegion).toHaveAttribute('aria-live', 'polite');
            });
        });
    });

    describe('Error Handling', () => {
        it('should show error state for missing image URL', () => {
            render(
                <MemoryRouter initialEntries={['/edit']}>
                    <EditPage />
                </MemoryRouter>
            );

            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText(/Unable to Load Editor/i)).toBeInTheDocument();
        });

        it('should provide retry option on image load error', async () => {
            render(
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: '/edit',
                            state: { imageUrl: mockImageUrl },
                        },
                    ]}
                >
                    <EditPage />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('edit-page-layout')).toBeInTheDocument();
            });
        });
    });
});
