/**
 * Edit Button Navigation Test
 * 
 * Specific test for the Edit Image button navigation functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { ResultsPanel } from '@/components/ResultsPanel';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/' };

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => mockLocation,
    };
});

describe('Edit Button Navigation', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
        console.log = vi.fn(); // Mock console.log to capture logs
    });

    it('should render Edit Image button when image is generated', () => {
        render(
            <BrowserRouter>
                <ResultsPanel
                    isLoading={false}
                    generatedImageUrl="https://example.com/image.jpg"
                    error={null}
                />
            </BrowserRouter>
        );

        const editButton = screen.getByRole('button', { name: /edit image/i });
        expect(editButton).toBeInTheDocument();
        expect(editButton).not.toBeDisabled();
    });

    it('should call navigate when Edit Image button is clicked', async () => {
        render(
            <BrowserRouter>
                <ResultsPanel
                    isLoading={false}
                    generatedImageUrl="https://example.com/image.jpg"
                    error={null}
                />
            </BrowserRouter>
        );

        const editButton = screen.getByRole('button', { name: /edit image/i });

        // Click the button
        fireEvent.click(editButton);

        // Wait for navigate to be called
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/edit', {
                state: {
                    imageUrl: 'https://example.com/image.jpg',
                    originalImageUrl: 'https://example.com/image.jpg',
                    fromRoute: '/',
                }
            });
        });
    });

    it('should log debug information when button is clicked', async () => {
        const consoleSpy = vi.spyOn(console, 'log');

        render(
            <BrowserRouter>
                <ResultsPanel
                    isLoading={false}
                    generatedImageUrl="https://example.com/test-image.jpg"
                    error={null}
                />
            </BrowserRouter>
        );

        const editButton = screen.getByRole('button', { name: /edit image/i });
        fireEvent.click(editButton);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Edit button clicked');
            expect(consoleSpy).toHaveBeenCalledWith('Image URL:', 'https://example.com/test-image.jpg');
        });
    });

    it('should not render Edit button when loading', () => {
        render(
            <BrowserRouter>
                <ResultsPanel
                    isLoading={true}
                    generatedImageUrl={null}
                    error={null}
                />
            </BrowserRouter>
        );

        const editButton = screen.queryByRole('button', { name: /edit image/i });
        expect(editButton).not.toBeInTheDocument();
    });

    it('should not render Edit button when there is an error', () => {
        render(
            <BrowserRouter>
                <ResultsPanel
                    isLoading={false}
                    generatedImageUrl={null}
                    error="Generation failed"
                />
            </BrowserRouter>
        );

        const editButton = screen.queryByRole('button', { name: /edit image/i });
        expect(editButton).not.toBeInTheDocument();
    });
});
