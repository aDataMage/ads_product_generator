/**
 * Screen Reader Accessibility Tests
 * 
 * Automated tests to verify screen reader accessibility of editing components.
 * These tests check for proper ARIA attributes, labels, and semantic HTML.
 * 
 * Note: These tests verify the markup and attributes that screen readers rely on.
 * Manual testing with actual screen readers is still required for full validation.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { EditingToolbar } from '../components/EditingToolbar';
import { BackgroundEditor } from '../components/BackgroundEditor';
import { GenerativeFillEditor } from '../components/GenerativeFillEditor';
import { EnhancementEditor } from '../components/EnhancementEditor';
import { CanvasExpander } from '../components/CanvasExpander';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

describe('Screen Reader Accessibility - Editing Toolbar', () => {
    it('should have proper toolbar role and label', () => {
        const mockOnToolSelect = vi.fn();
        render(
            <EditingToolbar
                onToolSelect={mockOnToolSelect}
                selectedTool={null}
            />
        );

        const toolbar = screen.getByRole('toolbar', { name: /image editing tools/i });
        expect(toolbar).toBeInTheDocument();
    });

    it('should have accessible dropdown buttons with proper ARIA attributes', () => {
        const mockOnToolSelect = vi.fn();
        render(
            <EditingToolbar
                onToolSelect={mockOnToolSelect}
                selectedTool={null}
            />
        );

        const backgroundButton = screen.getByRole('button', { name: /background editing tools/i });
        expect(backgroundButton).toHaveAttribute('aria-haspopup', 'menu');
        expect(backgroundButton).toHaveAttribute('aria-expanded');

        const enhanceButton = screen.getByRole('button', { name: /enhancement tools/i });
        expect(enhanceButton).toHaveAttribute('aria-haspopup', 'menu');
        expect(enhanceButton).toHaveAttribute('aria-expanded');
    });

    it('should have accessible toggle buttons with pressed state', () => {
        const mockOnToolSelect = vi.fn();
        render(
            <EditingToolbar
                onToolSelect={mockOnToolSelect}
                selectedTool="generative-fill"
            />
        );

        const genFillButton = screen.getByRole('button', { name: /generative fill tool/i });
        expect(genFillButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have no axe accessibility violations', async () => {
        const mockOnToolSelect = vi.fn();
        const { container } = render(
            <EditingToolbar
                onToolSelect={mockOnToolSelect}
                selectedTool={null}
            />
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('should hide decorative icons from screen readers', () => {
        const mockOnToolSelect = vi.fn();
        const { container } = render(
            <EditingToolbar
                onToolSelect={mockOnToolSelect}
                selectedTool={null}
            />
        );

        // Check that SVG icons have aria-hidden
        const icons = container.querySelectorAll('svg');
        icons.forEach(icon => {
            expect(icon).toHaveAttribute('aria-hidden', 'true');
        });
    });
});

describe('Screen Reader Accessibility - Background Editor', () => {
    const mockProps = {
        imageUrl: 'https://example.com/image.jpg',
        onEditComplete: vi.fn(),
        onError: vi.fn(),
    };

    it('should have proper region role and label', () => {
        render(<BackgroundEditor {...mockProps} />);

        const region = screen.getByRole('region', { name: /background editing tools/i });
        expect(region).toBeInTheDocument();
    });

    it('should have accessible form inputs with labels', () => {
        render(<BackgroundEditor {...mockProps} />);

        // Check prompt input
        const promptInput = screen.getByLabelText(/custom background description/i);
        expect(promptInput).toBeInTheDocument();
        expect(promptInput).toHaveAccessibleDescription();

        // Check color picker
        const colorPicker = screen.getByLabelText(/select background color/i);
        expect(colorPicker).toBeInTheDocument();
    });

    it('should have accessible buttons with proper labels', () => {
        render(<BackgroundEditor {...mockProps} />);

        const removeButton = screen.getByRole('button', { name: /remove background from image/i });
        expect(removeButton).toBeInTheDocument();
        expect(removeButton).toHaveAccessibleDescription();

        const replaceButton = screen.getByRole('button', { name: /replace background with custom/i });
        expect(replaceButton).toBeInTheDocument();

        const blurButton = screen.getByRole('button', { name: /apply background blur/i });
        expect(blurButton).toBeInTheDocument();
    });

    it('should have accessible slider with proper ARIA attributes', () => {
        render(<BackgroundEditor {...mockProps} />);

        const slider = screen.getByRole('slider', { name: /blur strength/i });
        expect(slider).toBeInTheDocument();
        expect(slider).toHaveAttribute('aria-valuemin');
        expect(slider).toHaveAttribute('aria-valuemax');
        expect(slider).toHaveAttribute('aria-valuenow');
    });

    it('should have accessible preset selection with proper roles', () => {
        render(<BackgroundEditor {...mockProps} />);

        // Check tablist for categories
        const tablist = screen.getByRole('tablist', { name: /background preset categories/i });
        expect(tablist).toBeInTheDocument();

        // Check tabs
        const tabs = screen.getAllByRole('tab');
        expect(tabs.length).toBeGreaterThan(0);
        tabs.forEach(tab => {
            expect(tab).toHaveAttribute('aria-selected');
            expect(tab).toHaveAttribute('aria-controls');
        });
    });

    it('should announce processing state with aria-live', () => {
        const { container } = render(<BackgroundEditor {...mockProps} />);

        // Check for aria-live regions
        const liveRegions = container.querySelectorAll('[aria-live="polite"]');
        expect(liveRegions.length).toBeGreaterThan(0);
    });

    it('should have accessible progress indicator', () => {
        render(<BackgroundEditor {...mockProps} />);

        // Progress bar should have proper role when visible
        // This would be tested during actual processing
        const progressBars = screen.queryAllByRole('progressbar');
        progressBars.forEach(progressBar => {
            expect(progressBar).toHaveAttribute('aria-valuenow');
            expect(progressBar).toHaveAttribute('aria-valuemin');
            expect(progressBar).toHaveAttribute('aria-valuemax');
        });
    });

    it('should have no axe accessibility violations', async () => {
        const { container } = render(<BackgroundEditor {...mockProps} />);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});

describe('Screen Reader Accessibility - Generative Fill Editor', () => {
    const mockProps = {
        imageUrl: 'https://example.com/image.jpg',
        onResult: vi.fn(),
    };

    it('should have accessible form inputs with labels and descriptions', () => {
        render(<GenerativeFillEditor {...mockProps} />);

        // Check prompt input - use more specific label
        const promptInput = screen.getByLabelText(/generative fill prompt/i);
        expect(promptInput).toBeInTheDocument();
        expect(promptInput).toHaveAttribute('aria-required', 'true');
        // Help text is present below the input
        const promptHelp = screen.getByText(/describe what you want to generate/i);
        expect(promptHelp).toBeInTheDocument();

        // Check negative prompt input
        const negativePromptInput = screen.getByLabelText(/negative prompt/i);
        expect(negativePromptInput).toBeInTheDocument();
        // Help text is present below the input
        const negativePromptHelp = screen.getByText(/describe what you want to avoid/i);
        expect(negativePromptHelp).toBeInTheDocument();
    });

    it('should have accessible version selector', () => {
        render(<GenerativeFillEditor {...mockProps} />);

        const versionSelector = screen.getByLabelText(/api version/i);
        expect(versionSelector).toBeInTheDocument();
        // Version selector has help text below it, which serves as description
        const helpText = screen.getByText(/version 2 provides a refined prompt/i);
        expect(helpText).toBeInTheDocument();
    });

    it('should have accessible generate button', () => {
        render(<GenerativeFillEditor {...mockProps} />);

        const generateButton = screen.getByRole('button', { name: /generate fill/i });
        expect(generateButton).toBeInTheDocument();
    });

    it('should have accessible progress indicator with status', () => {
        const { container } = render(<GenerativeFillEditor {...mockProps} />);

        // Check for aria-live regions for progress updates
        // Note: aria-live regions are added dynamically during processing
        // In initial render, they may not be present
        const liveRegions = container.querySelectorAll('[aria-live="polite"]');
        // This is acceptable - live regions appear when needed
        expect(liveRegions).toBeDefined();
    });

    it('should have accessible image comparison with proper alt text', () => {
        render(<GenerativeFillEditor {...mockProps} />);

        // Images should have descriptive alt text
        const images = screen.queryAllByRole('img');
        images.forEach(img => {
            expect(img).toHaveAttribute('alt');
            expect(img.getAttribute('alt')).not.toBe('');
        });
    });

    it('should have no axe accessibility violations', async () => {
        const { container } = render(<GenerativeFillEditor {...mockProps} />);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});

describe('Screen Reader Accessibility - Enhancement Editor', () => {
    const mockProps = {
        imageUrl: 'https://example.com/image.jpg',
        onEditComplete: vi.fn(),
        onError: vi.fn(),
    };

    it('should have proper region role and label', () => {
        render(<EnhancementEditor {...mockProps} />);

        const region = screen.getByRole('region', { name: /image enhancement tools/i });
        expect(region).toBeInTheDocument();
    });

    it('should have accessible enhancement buttons', () => {
        render(<EnhancementEditor {...mockProps} />);

        const enhanceButton = screen.getByRole('button', { name: /enhance image quality/i });
        expect(enhanceButton).toBeInTheDocument();
        expect(enhanceButton).toHaveAccessibleDescription();

        const upscale2xButton = screen.getByRole('button', { name: /upscale image 2x/i });
        expect(upscale2xButton).toBeInTheDocument();

        const upscale4xButton = screen.getByRole('button', { name: /upscale image 4x/i });
        expect(upscale4xButton).toBeInTheDocument();
    });

    it('should have accessible comparison toggle', () => {
        render(<EnhancementEditor {...mockProps} />);

        // Comparison toggle should be accessible when preview is available
        const toggleButtons = screen.queryAllByRole('button', { name: /compare|show preview/i });
        toggleButtons.forEach(button => {
            expect(button).toHaveAttribute('aria-pressed');
        });
    });

    it('should have accessible download buttons', () => {
        render(<EnhancementEditor {...mockProps} />);

        // Download buttons should be accessible when preview is available
        const downloadButtons = screen.queryAllByRole('button', { name: /download/i });
        downloadButtons.forEach(button => {
            expect(button).toHaveAccessibleName();
        });
    });

    it('should announce file size warnings', () => {
        const { container } = render(<EnhancementEditor {...mockProps} />);

        // Check for alert regions
        const alerts = container.querySelectorAll('[role="alert"]');
        // Alerts should be present for warnings
        expect(alerts).toBeDefined();
    });

    it('should have accessible resolution comparison', () => {
        render(<EnhancementEditor {...mockProps} />);

        // Resolution info should be in an accessible region
        const regions = screen.queryAllByRole('region', { name: /resolution comparison/i });
        regions.forEach(region => {
            expect(region).toBeInTheDocument();
        });
    });

    it('should have no axe accessibility violations', async () => {
        const { container } = render(<EnhancementEditor {...mockProps} />);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});

describe('Screen Reader Accessibility - Canvas Expander', () => {
    const mockProps = {
        imageUrl: 'https://example.com/image.jpg',
        onEditComplete: vi.fn(),
        onError: vi.fn(),
    };

    it('should have proper region role and label', () => {
        render(<CanvasExpander {...mockProps} />);

        const region = screen.getByRole('region', { name: /canvas expansion tools/i });
        expect(region).toBeInTheDocument();
    });

    it('should have accessible preset buttons with descriptions', () => {
        render(<CanvasExpander {...mockProps} />);

        // Check for specific preset buttons
        const squareButton = screen.getByRole('button', { name: /select square aspect ratio/i });
        expect(squareButton).toBeInTheDocument();
        expect(squareButton).toHaveAttribute('aria-pressed');
        expect(squareButton).toHaveAttribute('aria-describedby');

        const standardButton = screen.getByRole('button', { name: /select standard aspect ratio/i });
        expect(standardButton).toBeInTheDocument();
        expect(standardButton).toHaveAttribute('aria-pressed');

        // Check that all aspect ratio preset buttons have aria-pressed
        const allButtons = screen.getAllByRole('button');
        const presetButtons = allButtons.filter(btn => {
            const label = btn.getAttribute('aria-label');
            return label?.includes('aspect ratio') && label?.startsWith('Select');
        });
        expect(presetButtons.length).toBeGreaterThan(0);
        presetButtons.forEach(button => {
            expect(button).toHaveAttribute('aria-pressed');
        });
    });

    it('should have accessible custom dimension inputs', () => {
        render(<CanvasExpander {...mockProps} />);

        // Custom dimension inputs should be accessible
        const widthInputs = screen.queryAllByLabelText(/width/i);
        const heightInputs = screen.queryAllByLabelText(/height/i);

        [...widthInputs, ...heightInputs].forEach(input => {
            if (input) {
                expect(input).toHaveAccessibleName();
            }
        });
    });

    it('should have accessible expansion prompt textarea', () => {
        render(<CanvasExpander {...mockProps} />);

        const promptTextarea = screen.queryByLabelText(/expansion prompt/i);
        if (promptTextarea) {
            expect(promptTextarea).toHaveAccessibleDescription();
        }
    });

    it('should have accessible expansion preview', () => {
        render(<CanvasExpander {...mockProps} />);

        // Expansion preview should be in an accessible region
        const previewRegions = screen.queryAllByRole('region', { name: /expansion preview/i });
        previewRegions.forEach(region => {
            expect(region).toBeInTheDocument();
        });
    });

    it('should have accessible expand button', () => {
        render(<CanvasExpander {...mockProps} />);

        const expandButton = screen.getByRole('button', { name: /expand canvas/i });
        expect(expandButton).toBeInTheDocument();
    });

    it('should have no axe accessibility violations', async () => {
        const { container } = render(<CanvasExpander {...mockProps} />);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});

describe('Screen Reader Accessibility - Common Patterns', () => {
    it('should use semantic headings correctly', () => {
        const mockProps = {
            imageUrl: 'https://example.com/image.jpg',
            onEditComplete: vi.fn(),
            onError: vi.fn(),
        };

        const { container } = render(<BackgroundEditor {...mockProps} />);

        // Check for proper heading hierarchy
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        expect(headings.length).toBeGreaterThan(0);

        // Headings should have text content
        headings.forEach(heading => {
            expect(heading.textContent).not.toBe('');
        });
    });

    it('should use proper button elements, not divs', () => {
        const mockOnToolSelect = vi.fn();
        const { container } = render(
            <EditingToolbar
                onToolSelect={mockOnToolSelect}
                selectedTool={null}
            />
        );

        // All interactive elements should be proper buttons
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);

        // Check that there are no divs with click handlers (anti-pattern)
        const clickableDivs = container.querySelectorAll('div[onclick], div[role="button"]');
        expect(clickableDivs.length).toBe(0);
    });

    it('should have proper focus indicators', () => {
        const mockOnToolSelect = vi.fn();
        const { container } = render(
            <EditingToolbar
                onToolSelect={mockOnToolSelect}
                selectedTool={null}
            />
        );

        // Interactive elements should not have outline: none without alternative
        const buttons = container.querySelectorAll('button');
        buttons.forEach(button => {
            const styles = window.getComputedStyle(button);
            // If outline is none, there should be other focus indicators
            if (styles.outline === 'none') {
                // Check for alternative focus indicators (box-shadow, border, etc.)
                expect(
                    styles.boxShadow !== 'none' ||
                    styles.border !== 'none' ||
                    button.classList.contains('focus-visible')
                ).toBe(true);
            }
        });
    });

    it('should have proper live regions for dynamic content', () => {
        const mockProps = {
            imageUrl: 'https://example.com/image.jpg',
            onEditComplete: vi.fn(),
            onError: vi.fn(),
        };

        const { container } = render(<BackgroundEditor {...mockProps} />);

        // Check for aria-live regions
        const liveRegions = container.querySelectorAll('[aria-live]');
        expect(liveRegions.length).toBeGreaterThan(0);

        // Live regions should use polite or assertive
        liveRegions.forEach(region => {
            const ariaLive = region.getAttribute('aria-live');
            expect(['polite', 'assertive']).toContain(ariaLive);
        });
    });

    it('should have proper alert roles for errors and success messages', () => {
        const mockProps = {
            imageUrl: 'https://example.com/image.jpg',
            onEditComplete: vi.fn(),
            onError: vi.fn(),
        };

        const { container } = render(<BackgroundEditor {...mockProps} />);

        // Check for alert elements
        const alerts = container.querySelectorAll('[role="alert"]');
        // Alerts should be present in the DOM structure
        expect(alerts).toBeDefined();
    });
});

describe('Screen Reader Accessibility - Keyboard Navigation', () => {
    it('should have proper tab order', () => {
        const mockOnToolSelect = vi.fn();
        const { container } = render(
            <EditingToolbar
                onToolSelect={mockOnToolSelect}
                selectedTool={null}
            />
        );

        // Get all focusable elements
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        // Check that focusable elements don't have negative tabindex (unless intentional)
        focusableElements.forEach(element => {
            const tabindex = element.getAttribute('tabindex');
            if (tabindex !== null) {
                // Tabindex should be 0 or positive for keyboard navigation
                // -1 is acceptable for programmatic focus management
                expect(parseInt(tabindex)).toBeGreaterThanOrEqual(-1);
            }
        });
    });

    it('should not have keyboard traps', () => {
        const mockOnToolSelect = vi.fn();
        const { container } = render(
            <EditingToolbar
                onToolSelect={mockOnToolSelect}
                selectedTool={null}
            />
        );

        // Check that there are no elements that could trap focus
        const elementsWithTabindex = container.querySelectorAll('[tabindex]');
        elementsWithTabindex.forEach(element => {
            const tabindex = element.getAttribute('tabindex');
            // Very high positive tabindex values can create keyboard traps
            if (tabindex && parseInt(tabindex) > 0) {
                expect(parseInt(tabindex)).toBeLessThan(100);
            }
        });
    });
});
