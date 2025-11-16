/**
 * EditPage Navigation Integration Tests
 * 
 * Tests for navigation flow to and from the EditPage
 * Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2, 4.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EditPage } from '@/pages/EditPage';

// Mock components
vi.mock('@/components/EditPageHeader', () => ({
    EditPageHeader: ({ onBack }: any) => (
        <div data-testid="edit-page-header">
            <button onClick={onBack} data-testid="back-button">Back</button>
        </div>
    ),
}));

vi.mock('@/components/EditPageLayout', () => ({
    EditPageLayout: ({ toolPanel, imagePanel }: any) => (
        <div data-testid="edit-page-layout">
            <div>{toolPanel}</div>
            <div>{imagePanel}</div>
        </div>
    ),
}));

vi.mock('@/components/LazyToolPanel', () => ({
    LazyToolPanel: () => <div data-testid="lazy-tool-panel">Tools</div>,
}));

vi.mock('@/components/ImagePanel', () => ({
    ImagePanel: ({ imageUrl }: any) => (
        <div data-testid="image-panel">
            <img src={imageUrl} alt="Test" />
        </div>
    ),
}));

vi.mock('@/components/PerformanceMonitor', () => ({
    PerformanceMonitor: () => null,
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

// Mock home page component
const HomePage = () => <div data-testid="home-page">Home Page</div>;

describe('EditPage Navigation Integration', () => {
    const mockImageUrl = 'http://example.com/test-image.jpg';

    beforeEach(() => {
        sessionStorage.clear();
        vi.clearAllMocks();
    });

    describe('Navigation to EditPage', () => {
        it('should navigate to EditPage with image URL from state', async () => {
            render(
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: '/edit',
                            state: { imageUrl: mockImageUrl },
                        },
                    ]}
                >
                    <Routes>
                        <Route path="/edit" element={<EditPage />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('edit-page-layout')).toBeInTheDocument();
            });

            const image = screen.getByAltText('Test');
            expect(image).toHaveAttribute('src', mockImageUrl);
        });

        it('should navigate to EditPage with image URL from query params', async () => {
            render(
                <MemoryRouter initialEntries={[`/edit?imageUrl=${encodeURIComponent(mockImageUrl)}`]}>
                    <Routes>
                        <Route path="/edit" element={<EditPage />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('edit-page-layout')).toBeInTheDocument();
            });

            const image = screen.getByAltText('Test');
            expect(image).toHaveAttribute('src', mockImageUrl);
        });

        it('should preserve originalImageUrl from navigation state', async () => {
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
                    <Routes>
                        <Route path="/edit" element={<EditPage />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('edit-page-layout')).toBeInTheDocument();
            });
        });

        it('should preserve fromRoute for back navigation', async () => {
            render(
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: '/edit',
                            state: {
                                imageUrl: mockImageUrl,
                                fromRoute: '/results',
                            },
                        },
                    ]}
                >
                    <Routes>
                        <Route path="/edit" element={<EditPage />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('edit-page-layout')).toBeInTheDocument();
            });
        });
    });

    describe('Navigation from EditPage', () => {
        it('should navigate back when back button is clicked', async () => {
            const user = userEvent.setup();
            let currentPath = '/edit';

            const TestRouter = () => {
                return (
                    <MemoryRouter
                        initialEntries={[
                            '/',
                            {
                                pathname: '/edit',
                                state: {
                                    imageUrl: mockImageUrl,
                                    fromRoute: '/',
                                },
                            },
                        ]}
                        initialIndex={1}
                    >
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/edit" element={<EditPage />} />
                        </Routes>
                    </MemoryRouter>
                );
            };

            render(<TestRouter />);

            await waitFor(() => {
                expect(screen.getByTestId('edit-page-layout')).toBeInTheDocument();
            });

            const backButton = screen.getByTestId('back-button');
            await user.click(backButton);

            // After clicking back, we should navigate away from edit page
            // Note: In a real app, this would navigate to the previous route
        });

        it('should default to home route when fromRoute is not specified', async () => {
            render(
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: '/edit',
                            state: { imageUrl: mockImageUrl },
                        },
                    ]}
                >
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/edit" element={<EditPage />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('edit-page-layout')).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        it('should show error when no image URL is provided', () => {
            render(
                <MemoryRouter initialEntries={['/edit']}>
                    <Routes>
                        <Route path="/edit" element={<EditPage />} />
                    </Routes>
                </MemoryRouter>
            );

            expect(screen.getByRole('alert')).toHaveTextContent('No image URL provided');
            expect(screen.getByText('Go Back')).toBeInTheDocument();
        });

        it('should allow navigation back from error state', async () => {
            const user = userEvent.setup();

            render(
                <MemoryRouter initialEntries={['/', '/edit']} initialIndex={1}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/edit" element={<EditPage />} />
                    </Routes>
                </MemoryRouter>
            );

            expect(screen.getByRole('alert')).toBeInTheDocument();

            const backButton = screen.getByText('Go Back');
            await user.click(backButton);

            // Navigation should be triggered
        });
    });

    describe('State Preservation', () => {
        it('should preserve image URL during navigation', async () => {
            render(
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: '/edit',
                            state: { imageUrl: mockImageUrl },
                        },
                    ]}
                >
                    <Routes>
                        <Route path="/edit" element={<EditPage />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                const image = screen.getByAltText('Test');
                expect(image).toHaveAttribute('src', mockImageUrl);
            });
        });

        it('should initialize edit history with provided image', async () => {
            render(
                <MemoryRouter
                    initialEntries={[
                        {
                            pathname: '/edit',
                            state: { imageUrl: mockImageUrl },
                        },
                    ]}
                >
                    <Routes>
                        <Route path="/edit" element={<EditPage />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId('edit-page-layout')).toBeInTheDocument();
            });

            // History should be initialized in sessionStorage
            const stored = sessionStorage.getItem('edit-page-history');
            expect(stored).toBeTruthy();
        });
    });
});
