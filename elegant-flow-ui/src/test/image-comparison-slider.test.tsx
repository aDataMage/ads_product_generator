/**
 * ImageComparisonSlider Component Tests
 * 
 * Tests for the split-view image comparison slider
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageComparisonSlider } from '../components/ImageComparisonSlider';

describe('ImageComparisonSlider', () => {
    const mockBeforeImage = 'https://example.com/before.jpg';
    const mockAfterImage = 'https://example.com/after.jpg';

    it('renders both images', () => {
        render(
            <ImageComparisonSlider
                beforeImage={mockBeforeImage}
                afterImage={mockAfterImage}
            />
        );

        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(2);
        expect(images[0]).toHaveAttribute('src', mockAfterImage);
        expect(images[1]).toHaveAttribute('src', mockBeforeImage);
    });

    it('renders with custom alt text', () => {
        render(
            <ImageComparisonSlider
                beforeImage={mockBeforeImage}
                afterImage={mockAfterImage}
                beforeAlt="Original product"
                afterAlt="Enhanced product"
            />
        );

        expect(screen.getByAltText('Original product')).toBeInTheDocument();
        expect(screen.getByAltText('Enhanced product')).toBeInTheDocument();
    });

    it('renders slider control with accessibility attributes', () => {
        render(
            <ImageComparisonSlider
                beforeImage={mockBeforeImage}
                afterImage={mockAfterImage}
            />
        );

        const slider = screen.getByRole('slider', { name: /comparison slider/i });
        expect(slider).toBeInTheDocument();
        expect(slider).toHaveAttribute('aria-valuemin', '0');
        expect(slider).toHaveAttribute('aria-valuemax', '100');
        expect(slider).toHaveAttribute('tabindex', '0');
    });

    it('starts at initial position', () => {
        render(
            <ImageComparisonSlider
                beforeImage={mockBeforeImage}
                afterImage={mockAfterImage}
                initialPosition={75}
            />
        );

        const slider = screen.getByRole('slider');
        expect(slider).toHaveAttribute('aria-valuenow', '75');
    });

    it('responds to keyboard navigation', () => {
        render(
            <ImageComparisonSlider
                beforeImage={mockBeforeImage}
                afterImage={mockAfterImage}
                initialPosition={50}
            />
        );

        const slider = screen.getByRole('slider');

        // Arrow right increases position
        fireEvent.keyDown(slider, { key: 'ArrowRight' });
        expect(slider).toHaveAttribute('aria-valuenow', '51');

        // Arrow left decreases position
        fireEvent.keyDown(slider, { key: 'ArrowLeft' });
        expect(slider).toHaveAttribute('aria-valuenow', '50');

        // Home goes to start
        fireEvent.keyDown(slider, { key: 'Home' });
        expect(slider).toHaveAttribute('aria-valuenow', '0');

        // End goes to end
        fireEvent.keyDown(slider, { key: 'End' });
        expect(slider).toHaveAttribute('aria-valuenow', '100');
    });

    it('renders before and after labels', () => {
        render(
            <ImageComparisonSlider
                beforeImage={mockBeforeImage}
                afterImage={mockAfterImage}
            />
        );

        expect(screen.getByText('Before')).toBeInTheDocument();
        expect(screen.getByText('After')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(
            <ImageComparisonSlider
                beforeImage={mockBeforeImage}
                afterImage={mockAfterImage}
                className="custom-class"
            />
        );

        const wrapper = container.querySelector('.custom-class');
        expect(wrapper).toBeInTheDocument();
    });

    it('has proper ARIA group label', () => {
        render(
            <ImageComparisonSlider
                beforeImage={mockBeforeImage}
                afterImage={mockAfterImage}
            />
        );

        const group = screen.getByRole('group', { name: /image comparison slider/i });
        expect(group).toBeInTheDocument();
    });

    describe('Zoom functionality', () => {
        it('renders zoom controls', () => {
            render(
                <ImageComparisonSlider
                    beforeImage={mockBeforeImage}
                    afterImage={mockAfterImage}
                />
            );

            expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
            expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
            expect(screen.getByLabelText('Reset zoom')).toBeInTheDocument();
        });

        it('displays initial zoom level as 100%', () => {
            render(
                <ImageComparisonSlider
                    beforeImage={mockBeforeImage}
                    afterImage={mockAfterImage}
                />
            );

            expect(screen.getByText('100%')).toBeInTheDocument();
        });

        it('zoom in button increases zoom level', () => {
            render(
                <ImageComparisonSlider
                    beforeImage={mockBeforeImage}
                    afterImage={mockAfterImage}
                />
            );

            const zoomInButton = screen.getByLabelText('Zoom in');
            fireEvent.click(zoomInButton);

            expect(screen.getByText('150%')).toBeInTheDocument();
        });

        it('zoom out button decreases zoom level', () => {
            render(
                <ImageComparisonSlider
                    beforeImage={mockBeforeImage}
                    afterImage={mockAfterImage}
                />
            );

            const zoomInButton = screen.getByLabelText('Zoom in');
            const zoomOutButton = screen.getByLabelText('Zoom out');

            // Zoom in first
            fireEvent.click(zoomInButton);
            expect(screen.getByText('150%')).toBeInTheDocument();

            // Then zoom out
            fireEvent.click(zoomOutButton);
            expect(screen.getByText('100%')).toBeInTheDocument();
        });

        it('reset zoom button returns to 100%', () => {
            render(
                <ImageComparisonSlider
                    beforeImage={mockBeforeImage}
                    afterImage={mockAfterImage}
                />
            );

            const zoomInButton = screen.getByLabelText('Zoom in');
            const resetButton = screen.getByLabelText('Reset zoom');

            // Zoom in multiple times
            fireEvent.click(zoomInButton);
            fireEvent.click(zoomInButton);
            expect(screen.getByText('200%')).toBeInTheDocument();

            // Reset zoom
            fireEvent.click(resetButton);
            expect(screen.getByText('100%')).toBeInTheDocument();
        });

        it('zoom in button is disabled at maximum zoom (300%)', () => {
            render(
                <ImageComparisonSlider
                    beforeImage={mockBeforeImage}
                    afterImage={mockAfterImage}
                />
            );

            const zoomInButton = screen.getByLabelText('Zoom in');

            // Zoom in to maximum (6 clicks: 100% -> 150% -> 200% -> 250% -> 300%)
            fireEvent.click(zoomInButton);
            fireEvent.click(zoomInButton);
            fireEvent.click(zoomInButton);
            fireEvent.click(zoomInButton);

            expect(screen.getByText('300%')).toBeInTheDocument();
            expect(zoomInButton).toBeDisabled();
        });

        it('zoom out button is disabled at minimum zoom (100%)', () => {
            render(
                <ImageComparisonSlider
                    beforeImage={mockBeforeImage}
                    afterImage={mockAfterImage}
                />
            );

            const zoomOutButton = screen.getByLabelText('Zoom out');
            expect(zoomOutButton).toBeDisabled();
        });

        it('reset button is disabled at 100% zoom', () => {
            render(
                <ImageComparisonSlider
                    beforeImage={mockBeforeImage}
                    afterImage={mockAfterImage}
                />
            );

            const resetButton = screen.getByLabelText('Reset zoom');
            expect(resetButton).toBeDisabled();
        });

        it('shows pan hint when zoomed in', () => {
            render(
                <ImageComparisonSlider
                    beforeImage={mockBeforeImage}
                    afterImage={mockAfterImage}
                />
            );

            // Initially no hint
            expect(screen.queryByText(/Click and drag to pan/)).not.toBeInTheDocument();

            // Zoom in
            const zoomInButton = screen.getByLabelText('Zoom in');
            fireEvent.click(zoomInButton);

            // Hint should appear
            expect(screen.getByText(/Click and drag to pan/)).toBeInTheDocument();
            expect(screen.getByText(/Zoom: 150%/)).toBeInTheDocument();
        });
    });
});
