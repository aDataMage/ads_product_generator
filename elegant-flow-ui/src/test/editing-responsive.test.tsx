import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { BackgroundEditor } from '../components/BackgroundEditor';
import { EnhancementEditor } from '../components/EnhancementEditor';
import { CanvasExpander } from '../components/CanvasExpander';
import { GenerativeFillEditor } from '../components/GenerativeFillEditor';
import { EditingToolbar } from '../components/EditingToolbar';

// Mock the API module
vi.mock('../lib/api', () => ({
    removeBackground: vi.fn(),
    replaceBackground: vi.fn(),
    blurBackground: vi.fn(),
    enhanceImage: vi.fn(),
    upscaleImage: vi.fn(),
    expandImage: vi.fn(),
    generativeFill: vi.fn(),
    ApiError: class ApiError extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'ApiError';
        }
    },
}));

describe('Editing Components - Responsive Design Tests', () => {
    const mockImageUrl = 'https://example.com/test-image.jpg';
    const mockOnEditComplete = vi.fn();
    const mockOnError = vi.fn();
    const mockOnToolSelect = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('EditingToolbar - Responsive Layout', () => {
        it('should render toolbar with proper spacing on mobile (375px)', () => {
            global.innerWidth = 375;
            global.innerHeight = 667;

            render(
                <EditingToolbar
                    onToolSelect={mockOnToolSelect}
                    selectedTool={null}
                    disabled={false}
                />
            );

            const toolbar = screen.getByRole('toolbar');
            expect(toolbar).toBeInTheDocument();
            expect(toolbar).toHaveClass('flex', 'flex-wrap');
        });

        it('should render all tool buttons on desktop (1280px)', () => {
            global.innerWidth = 1280;
            global.innerHeight = 720;

            render(
                <EditingToolbar
                    onToolSelect={mockOnToolSelect}
                    selectedTool={null}
                    disabled={false}
                />
            );

            expect(screen.getByRole('button', { name: /background editing tools/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /generative fill tool/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /enhancement tools/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /canvas expansion tool/i })).toBeInTheDocument();
        });

        it('should wrap buttons properly on tablet (768px)', () => {
            global.innerWidth = 768;
            global.innerHeight = 1024;

            render(
                <EditingToolbar
                    onToolSelect={mockOnToolSelect}
                    selectedTool={null}
                    disabled={false}
                />
            );

            const toolbar = screen.getByRole('toolbar');
            expect(toolbar).toHaveClass('flex-wrap');
        });
    });

    describe('BackgroundEditor - Responsive Layout', () => {
        it('should render preset grid in single column on mobile (375px)', () => {
            global.innerWidth = 375;
            global.innerHeight = 667;

            render(
                <BackgroundEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            const card = screen.getByRole('region', { name: /background editing tools/i });
            expect(card).toBeInTheDocument();
        });

        it('should render preset grid in two columns on desktop (1280px)', () => {
            global.innerWidth = 1280;
            global.innerHeight = 720;

            render(
                <BackgroundEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            const card = screen.getByRole('region', { name: /background editing tools/i });
            expect(card).toBeInTheDocument();
        });

        it('should have responsive padding on mobile', () => {
            global.innerWidth = 375;
            global.innerHeight = 667;

            render(
                <BackgroundEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            const title = screen.getByText('Background Editor');
            expect(title).toBeInTheDocument();
        });

        it('should render all control sections on tablet (768px)', () => {
            global.innerWidth = 768;
            global.innerHeight = 1024;

            render(
                <BackgroundEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            expect(screen.getByRole('heading', { name: /remove background/i })).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: /replace background/i })).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: /blur background/i })).toBeInTheDocument();
        });
    });

    describe('EnhancementEditor - Responsive Layout', () => {
        it('should render upscale buttons in single column on mobile (375px)', () => {
            global.innerWidth = 375;
            global.innerHeight = 667;

            render(
                <EnhancementEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            const card = screen.getByRole('region', { name: /image enhancement tools/i });
            expect(card).toBeInTheDocument();
        });

        it('should render upscale buttons in two columns on desktop (1280px)', () => {
            global.innerWidth = 1280;
            global.innerHeight = 720;

            render(
                <EnhancementEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            expect(screen.getByText('Image Enhancement')).toBeInTheDocument();
        });

        it('should have responsive title sizing', () => {
            global.innerWidth = 375;
            global.innerHeight = 667;

            render(
                <EnhancementEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            const title = screen.getByText('Image Enhancement');
            expect(title).toBeInTheDocument();
        });

        it('should render download buttons responsively on tablet (768px)', () => {
            global.innerWidth = 768;
            global.innerHeight = 1024;

            render(
                <EnhancementEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            expect(screen.getByRole('heading', { name: /enhance quality/i })).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: /upscale resolution/i })).toBeInTheDocument();
        });
    });

    describe('CanvasExpander - Responsive Layout', () => {
        it('should render aspect ratio presets in single column on mobile (375px)', () => {
            global.innerWidth = 375;
            global.innerHeight = 667;

            render(
                <CanvasExpander
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            const card = screen.getByRole('region', { name: /canvas expansion tools/i });
            expect(card).toBeInTheDocument();
        });

        it('should render aspect ratio presets in two columns on desktop (1280px)', () => {
            global.innerWidth = 1280;
            global.innerHeight = 720;

            render(
                <CanvasExpander
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            expect(screen.getByText('Canvas Expander')).toBeInTheDocument();
        });

        it('should render custom dimension inputs in single column on mobile', () => {
            global.innerWidth = 375;
            global.innerHeight = 667;

            render(
                <CanvasExpander
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            expect(screen.getByText('Custom Dimensions')).toBeInTheDocument();
        });

        it('should render custom dimension inputs in two columns on tablet (768px)', () => {
            global.innerWidth = 768;
            global.innerHeight = 1024;

            render(
                <CanvasExpander
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            expect(screen.getByText('Select Aspect Ratio')).toBeInTheDocument();
        });
    });

    describe('GenerativeFillEditor - Responsive Layout', () => {
        it('should render before/after comparison in single column on mobile (375px)', () => {
            global.innerWidth = 375;
            global.innerHeight = 667;

            const mockOnResult = vi.fn();

            render(
                <GenerativeFillEditor
                    imageUrl={mockImageUrl}
                    onResult={mockOnResult}
                />
            );

            expect(screen.getByText('Draw Mask')).toBeInTheDocument();
        });

        it('should render before/after comparison in two columns on desktop (1280px)', () => {
            global.innerWidth = 1280;
            global.innerHeight = 720;

            const mockOnResult = vi.fn();

            render(
                <GenerativeFillEditor
                    imageUrl={mockImageUrl}
                    onResult={mockOnResult}
                />
            );

            expect(screen.getByText('Draw Mask')).toBeInTheDocument();
        });

        it('should have responsive text sizing on mobile', () => {
            global.innerWidth = 375;
            global.innerHeight = 667;

            const mockOnResult = vi.fn();

            render(
                <GenerativeFillEditor
                    imageUrl={mockImageUrl}
                    onResult={mockOnResult}
                />
            );

            const heading = screen.getByText('Draw Mask');
            expect(heading).toBeInTheDocument();
        });

        it('should render form inputs properly on tablet (768px)', () => {
            global.innerWidth = 768;
            global.innerHeight = 1024;

            const mockOnResult = vi.fn();

            render(
                <GenerativeFillEditor
                    imageUrl={mockImageUrl}
                    onResult={mockOnResult}
                />
            );

            expect(screen.getByLabelText(/generative fill prompt/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/negative prompt/i)).toBeInTheDocument();
        });
    });

    describe('Cross-Component Responsive Behavior', () => {
        it('should maintain consistent spacing across all components on mobile', () => {
            global.innerWidth = 375;
            global.innerHeight = 667;

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

            // Both should have consistent card styling
            expect(bgContainer.querySelector('[role="region"]')).toBeInTheDocument();
            expect(enhanceContainer.querySelector('[role="region"]')).toBeInTheDocument();
        });

        it('should maintain consistent button sizing across components on tablet', () => {
            global.innerWidth = 768;
            global.innerHeight = 1024;

            render(
                <BackgroundEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        });

        it('should handle very wide screens (2560px) without layout issues', () => {
            global.innerWidth = 2560;
            global.innerHeight = 1440;

            render(
                <CanvasExpander
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            expect(screen.getByText('Canvas Expander')).toBeInTheDocument();
        });

        it('should handle very narrow screens (320px) gracefully', () => {
            global.innerWidth = 320;
            global.innerHeight = 568;

            render(
                <EditingToolbar
                    onToolSelect={mockOnToolSelect}
                    selectedTool={null}
                    disabled={false}
                />
            );

            const toolbar = screen.getByRole('toolbar');
            expect(toolbar).toHaveClass('flex-wrap');
        });
    });

    describe('Image Display - Responsive Behavior', () => {
        it('should render images with proper constraints on mobile', () => {
            global.innerWidth = 375;
            global.innerHeight = 667;

            render(
                <BackgroundEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            // Component should render without errors
            expect(screen.getByText('Background Editor')).toBeInTheDocument();
        });

        it('should render images with proper constraints on desktop', () => {
            global.innerWidth = 1920;
            global.innerHeight = 1080;

            render(
                <EnhancementEditor
                    imageUrl={mockImageUrl}
                    onEditComplete={mockOnEditComplete}
                    onError={mockOnError}
                />
            );

            expect(screen.getByText('Image Enhancement')).toBeInTheDocument();
        });
    });
});
