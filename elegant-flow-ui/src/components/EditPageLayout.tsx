/**
 * EditPageLayout Component
 * 
 * Split-panel layout for the edit page with responsive breakpoints
 * Requirements: 2.1, 2.2, 2.3, 5.1, 5.2
 * 
 * Features:
 * - CSS Grid split-panel layout (40% / 60% on desktop)
 * - Responsive breakpoints (desktop, tablet, mobile)
 * - Optional panel resizing capability
 * - Styled panel divider and backgrounds
 */

import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Layers, Image as ImageIcon } from 'lucide-react';

/**
 * EditPageLayout Props
 * Requirement 2.1: Display tool panel and image canvas in split layout
 */
interface EditPageLayoutProps {
    /** Left panel content (editing tools) */
    toolPanel: ReactNode;
    /** Right panel content (image canvas) */
    imagePanel: ReactNode;
    /** Optional: Enable panel resizing */
    enableResize?: boolean;
    /** Optional: Custom class name */
    className?: string;
}

/**
 * EditPageLayout Component
 * 
 * Manages the split-panel layout with responsive behavior
 * Requirement 2.1: Tool panel on left (30-40%), image canvas on right (60-70%)
 * Requirement 5.1, 5.2: Responsive layout for different screen sizes
 */
export function EditPageLayout({
    toolPanel,
    imagePanel,
    enableResize = false,
    className,
}: EditPageLayoutProps) {
    // State for panel resizing
    const [toolPanelWidth, setToolPanelWidth] = useState(40); // Default 40%
    const [isResizing, setIsResizing] = useState(false);
    const layoutRef = useRef<HTMLDivElement>(null);

    /**
     * Handle mouse down on divider to start resizing
     */
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!enableResize) return;
        e.preventDefault();
        setIsResizing(true);
    };

    /**
     * Handle mouse move during resizing
     */
    useEffect(() => {
        if (!enableResize || !isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!layoutRef.current) return;

            const layoutRect = layoutRef.current.getBoundingClientRect();
            const newWidth = ((e.clientX - layoutRect.left) / layoutRect.width) * 100;

            // Constrain width between 25% and 50%
            const constrainedWidth = Math.min(Math.max(newWidth, 25), 50);
            setToolPanelWidth(constrainedWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, enableResize]);

    return (
        <>
            {/* Desktop/Tablet Layout - Side by side (>520px) */}
            <div
                ref={layoutRef}
                className={cn(
                    'edit-page-layout',
                    isResizing && 'select-none',
                    className
                )}
                style={{
                    // Requirement 2.1: CSS Grid split-panel layout
                    display: 'grid',
                    // Requirement 5.1: Responsive breakpoints
                    gridTemplateColumns: enableResize
                        ? `${toolPanelWidth}% 1px ${100 - toolPanelWidth - 0.1}%`
                        : undefined,
                    height: 'calc(100vh - 64px)', // Subtract header height
                    gap: 0,
                }}
                role="region"
                aria-label="Image editing workspace"
            >
                {/* Tool Panel - Left side */}
                {/* Requirement 2.1: Tool panel occupying 30-40% of viewport width */}
                <aside
                    id="editing-tools"
                    className="tool-panel bg-muted/30 overflow-y-auto"
                    role="complementary"
                    aria-label="Editing tools panel"
                    tabIndex={-1}
                >
                    {toolPanel}
                </aside>

                {/* Resizable Divider */}
                {/* Requirement 2.3: Panel resizing capability (optional) */}
                {enableResize && (
                    <div
                        className={cn(
                            'divider bg-border hover:bg-primary/20 transition-colors cursor-col-resize',
                            isResizing && 'bg-primary/30'
                        )}
                        onMouseDown={handleMouseDown}
                        role="separator"
                        aria-label="Resize panels. Use arrow keys to adjust width."
                        aria-orientation="vertical"
                        aria-valuenow={Math.round(toolPanelWidth)}
                        aria-valuemin={25}
                        aria-valuemax={50}
                        aria-valuetext={`Tool panel width: ${Math.round(toolPanelWidth)}%`}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            // Keyboard support for resizing - Requirement 8.3
                            if (e.key === 'ArrowLeft') {
                                e.preventDefault();
                                const newWidth = Math.max(toolPanelWidth - 2, 25);
                                setToolPanelWidth(newWidth);
                                // Announce change to screen readers
                                e.currentTarget.setAttribute('aria-valuetext', `Tool panel width: ${Math.round(newWidth)}%`);
                            } else if (e.key === 'ArrowRight') {
                                e.preventDefault();
                                const newWidth = Math.min(toolPanelWidth + 2, 50);
                                setToolPanelWidth(newWidth);
                                // Announce change to screen readers
                                e.currentTarget.setAttribute('aria-valuetext', `Tool panel width: ${Math.round(newWidth)}%`);
                            }
                        }}
                    />
                )}

                {/* Image Panel - Right side */}
                {/* Requirement 2.1: Image canvas occupying 60-70% of viewport width */}
                <main
                    id="main-content"
                    className="image-panel bg-background overflow-hidden"
                    role="main"
                    aria-label="Image canvas and preview area"
                    tabIndex={-1}
                >
                    {imagePanel}
                </main>
            </div>

            {/* Mobile Layout - Tabs (<=520px) */}
            <div className="mobile-tabs-layout flex flex-col h-[calc(100vh-64px)]">
                <Tabs defaultValue="image" className="flex flex-col h-full">
                    {/* Image takes most of the space */}
                    <TabsContent value="image" className="flex-1 m-0 overflow-hidden">
                        <div className="h-full bg-background">
                            {imagePanel}
                        </div>
                    </TabsContent>

                    <TabsContent value="tools" className="flex-1 m-0 overflow-hidden">
                        <div className="h-full bg-muted/30 overflow-y-auto">
                            {toolPanel}
                        </div>
                    </TabsContent>

                    {/* Tabs at the bottom */}
                    <TabsList className="w-full rounded-none border-t h-14 bg-background">
                        <TabsTrigger value="image" className="flex-1 gap-2">
                            <ImageIcon className="h-4 w-4" />
                            <span>Image</span>
                        </TabsTrigger>
                        <TabsTrigger value="tools" className="flex-1 gap-2">
                            <Layers className="h-4 w-4" />
                            <span>Tools</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </>
    );
}
