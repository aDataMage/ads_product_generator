import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BackgroundEditor } from '../components/BackgroundEditor';

describe('BackgroundEditor Accessibility', () => {
    const mockProps = {
        imageUrl: 'https://example.com/test-image.jpg',
        onEditComplete: vi.fn(),
        onError: vi.fn(),
    };

    it('should have proper ARIA labels and roles', () => {
        render(<BackgroundEditor {...mockProps} />);

        // Check main region
        expect(screen.getByRole('region', { name: /background editing tools/i })).toBeInTheDocument();

        // Check section headings by role
        const headings = screen.getAllByRole('heading', { level: 3 });
        const headingTexts = headings.map(h => h.textContent);
        expect(headingTexts).toContain('Remove Background');
        expect(headingTexts).toContain('Replace Background');
        expect(headingTexts).toContain('Blur Background');
    });

    it('should have accessible form controls', () => {
        render(<BackgroundEditor {...mockProps} />);

        // Check labeled inputs
        expect(screen.getByLabelText(/enter background description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/select background color/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/adjust blur strength/i)).toBeInTheDocument();
    });

    it('should have accessible buttons with ARIA labels', () => {
        render(<BackgroundEditor {...mockProps} />);

        // Check buttons
        expect(screen.getByRole('button', { name: /remove background from image/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /replace background with custom description or color/i })).toBeInTheDocument();
    });

    it('should have proper ARIA attributes on range slider', () => {
        render(<BackgroundEditor {...mockProps} />);

        const slider = screen.getByLabelText(/adjust blur strength/i);
        expect(slider).toHaveAttribute('aria-valuemin', '0');
        expect(slider).toHaveAttribute('aria-valuemax', '100');
        expect(slider).toHaveAttribute('aria-valuenow', '50');
        expect(slider).toHaveAttribute('type', 'range');
    });

    it('should have screen reader only descriptions', () => {
        const { container } = render(<BackgroundEditor {...mockProps} />);

        // Check for sr-only elements with descriptions
        const srOnlyElements = container.querySelectorAll('.sr-only');
        expect(srOnlyElements.length).toBeGreaterThan(0);
    });

    it('should have proper heading hierarchy', () => {
        render(<BackgroundEditor {...mockProps} />);

        // Check for h3 headings (sections within the card)
        const headings = screen.getAllByRole('heading', { level: 3 });
        expect(headings.length).toBeGreaterThanOrEqual(3);
    });

    it('should have aria-describedby associations', () => {
        render(<BackgroundEditor {...mockProps} />);

        const promptInput = screen.getByLabelText(/enter background description/i);
        expect(promptInput).toHaveAttribute('aria-describedby');

        const colorInput = screen.getByLabelText(/select background color/i);
        expect(colorInput).toHaveAttribute('aria-describedby');
    });

    it('should mark loading icons as aria-hidden', () => {
        const { container } = render(<BackgroundEditor {...mockProps} />);

        // Loader icons should be decorative
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
            const loaderIcon = button.querySelector('svg');
            if (loaderIcon && button.textContent?.includes('Processing')) {
                expect(loaderIcon).toHaveAttribute('aria-hidden', 'true');
            }
        });
    });
});
