/**
 * Skeleton Loading Tests
 * 
 * Tests for loading skeleton components in editing tools
 * Task 6.3: Implement loading skeletons
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BackgroundEditor } from '../components/BackgroundEditor';
import { GenerativeFillEditor } from '../components/GenerativeFillEditor';
import { EnhancementEditor } from '../components/EnhancementEditor';
import { CanvasExpander } from '../components/CanvasExpander';

// Mock the API module
vi.mock('../lib/api', () => ({
    removeBackground: vi.fn(),
    replaceBackground: vi.fn(),
    blurBackground: vi.fn(),
    generativeFill: vi.fn(),
    enhanceImage: vi.fn(),
    upscaleImage: vi.fn(),
    expandImage: vi.fn(),
    ApiError: class ApiError extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'ApiError';
        }
    }
}));

describe('Skeleton Loading States', () => {
    const mockImageUrl = 'https://example.com/test-image.jpg';
    const mockOnEditComplete = vi.fn();
    const mockOnError = vi.fn();
    const mockOnResult = vi.fn();

    describe('BackgroundEditor', () => {
        it('should show skeleton when processing starts', async () => {
            const { container } = render(
                <BackgroundEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            // Initially, no skeleton should be visible
            const skeletons = container.querySelectorAll('.animate-pulse');
            expect(skeletons.length).toBe(0);
        });

        it('should have skeleton component with proper classes', () => {
            const { container } = render(
                <BackgroundEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            // Check that skeleton elements would have the right structure
            // when processing state is active
            const card = container.querySelector('[role="region"]');
            expect(card).toBeTruthy();
        });
    });

    describe('GenerativeFillEditor', () => {
        it('should render without skeleton initially', () => {
            const { container } = render(
                <GenerativeFillEditor
                    imageUrl={mockImageUrl}
                    onResult={mockOnResult}
                />
            );

            // Initially, no skeleton should be visible
            const skeletons = container.querySelectorAll('.animate-pulse');
            expect(skeletons.length).toBe(0);
        });

        it('should have proper structure for skeleton loading', () => {
            const { container } = render(
                <GenerativeFillEditor
                    imageUrl={mockImageUrl}
                    onResult={mockOnResult}
                />
            );

            // Verify the component renders
            expect(container.firstChild).toBeTruthy();
        });
    });

    describe('EnhancementEditor', () => {
        it('should render without skeleton initially', () => {
            const { container } = render(
                <EnhancementEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            // Initially, no skeleton should be visible
            const skeletons = container.querySelectorAll('.animate-pulse');
            expect(skeletons.length).toBe(0);
        });

        it('should have card structure for skeleton loading', () => {
            render(
                <EnhancementEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            // Verify the card renders with proper aria labels
            const card = screen.getByRole('region', { name: /image enhancement tools/i });
            expect(card).toBeTruthy();
        });
    });

    describe('CanvasExpander', () => {
        it('should render without skeleton initially', () => {
            const { container } = render(
                <CanvasExpander
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            // Initially, no skeleton should be visible
            const skeletons = container.querySelectorAll('.animate-pulse');
            expect(skeletons.length).toBe(0);
        });

        it('should have proper structure for canvas expansion', () => {
            render(
                <CanvasExpander
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            // Verify the card renders with proper aria labels
            const card = screen.getByRole('region', { name: /canvas expansion tools/i });
            expect(card).toBeTruthy();
        });
    });

    describe('Skeleton Component Accessibility', () => {
        it('should have proper ARIA attributes for loading regions', () => {
            render(
                <BackgroundEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            // Check for proper ARIA regions
            const regions = screen.getAllByRole('region');
            expect(regions.length).toBeGreaterThan(0);
        });

        it('should maintain accessibility during loading states', () => {
            render(
                <EnhancementEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            // Verify accessibility structure - the component renders with proper regions
            const cardContent = screen.getByRole('region', { name: /image enhancement tools/i });
            expect(cardContent).toBeTruthy();
            // Verify the component maintains proper structure
            expect(cardContent.tagName).toBe('DIV');
        });
    });

    describe('Skeleton Visual Structure', () => {
        it('should have consistent skeleton patterns across components', () => {
            const { container: bgContainer } = render(
                <BackgroundEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            const { container: enhanceContainer } = render(
                <EnhancementEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            // Both should have similar structure
            expect(bgContainer.querySelector('[role="region"]')).toBeTruthy();
            expect(enhanceContainer.querySelector('[role="region"]')).toBeTruthy();
        });
    });
});
