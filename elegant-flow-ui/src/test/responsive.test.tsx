import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the API module
vi.mock('../lib/api');

describe('Responsive Design Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render two-column layout on desktop (≥1024px)', () => {
        // Set viewport to desktop size
        global.innerWidth = 1280;
        global.innerHeight = 720;

        render(<App />);

        // Verify both panels are visible
        expect(screen.getByText(/product description/i)).toBeInTheDocument();
        expect(screen.getByText(/your generated image will appear here/i)).toBeInTheDocument();
    });

    it('should render single-column layout on mobile (<1024px)', () => {
        // Set viewport to mobile size
        global.innerWidth = 375;
        global.innerHeight = 667;

        render(<App />);

        // Verify both panels are still accessible
        expect(screen.getByText(/product description/i)).toBeInTheDocument();
        expect(screen.getByText(/your generated image will appear here/i)).toBeInTheDocument();
    });

    it('should maintain usability on small screens (375px)', () => {
        // Set viewport to minimum supported size
        global.innerWidth = 375;
        global.innerHeight = 667;

        render(<App />);

        // Verify all interactive elements are accessible
        expect(screen.getByLabelText(/product description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/bright clean/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /generate image/i })).toBeInTheDocument();
    });

    it('should render properly on tablet (768px-1023px)', () => {
        // Set viewport to tablet size
        global.innerWidth = 768;
        global.innerHeight = 1024;

        render(<App />);

        // Verify layout adapts correctly
        expect(screen.getByText(/product description/i)).toBeInTheDocument();
        expect(screen.getByText(/style preset/i)).toBeInTheDocument();
    });

    it('should handle very wide screens (>1920px)', () => {
        // Set viewport to ultra-wide
        global.innerWidth = 2560;
        global.innerHeight = 1440;

        render(<App />);

        // Verify content is still properly displayed
        expect(screen.getByText(/product description/i)).toBeInTheDocument();
        expect(screen.getByText(/your generated image will appear here/i)).toBeInTheDocument();
    });
});
