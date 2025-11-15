/**
 * ImageComparisonSlider Component
 * 
 * A split-view slider for comparing two images (before/after)
 * Requirements: Task 4.2 - Quality Comparison View
 */

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface ImageComparisonSliderProps {
    /** URL of the original/before image */
    beforeImage: string;
    /** URL of the enhanced/after image */
    afterImage: string;
    /** Alt text for the before image */
    beforeAlt?: string;
    /** Alt text for the after image */
    afterAlt?: string;
    /** Initial slider position (0-100) */
    initialPosition?: number;
    /** Additional CSS classes */
    className?: string;
}

/**
 * ImageComparisonSlider component
 * 
 * Displays two images with a draggable slider to compare them side-by-side
 */
export function ImageComparisonSlider({
    beforeImage,
    afterImage,
    beforeAlt = "Original image",
    afterAlt = "Enhanced image",
    initialPosition = 50,
    className,
}: ImageComparisonSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // Handle mouse/touch move
    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = (x / rect.width) * 100;

        // Clamp between 0 and 100
        const clampedPercentage = Math.max(0, Math.min(100, percentage));
        setSliderPosition(clampedPercentage);
    };

    // Mouse event handlers
    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        handleMove(e.clientX);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch event handlers
    const handleTouchStart = () => {
        setIsDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging || !e.touches[0]) return;
        handleMove(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Click on container to move slider
    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === containerRef.current || (e.target as HTMLElement).closest('.comparison-image')) {
            handleMove(e.clientX);
        }
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setSliderPosition(prev => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            setSliderPosition(prev => Math.min(100, prev + 1));
        } else if (e.key === 'Home') {
            e.preventDefault();
            setSliderPosition(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            setSliderPosition(100);
        }
    };

    // Zoom controls
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.5, 3)); // Max 3x zoom
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => {
            const newZoom = Math.max(prev - 0.5, 1); // Min 1x zoom
            if (newZoom === 1) {
                // Reset pan when zooming out to 1x
                setPanPosition({ x: 0, y: 0 });
            }
            return newZoom;
        });
    };

    const handleResetZoom = () => {
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
    };

    // Pan handlers for zoomed images
    const handlePanStart = (clientX: number, clientY: number) => {
        if (zoomLevel > 1) {
            setIsPanning(true);
            setPanStart({ x: clientX - panPosition.x, y: clientY - panPosition.y });
        }
    };

    const handlePanMove = (clientX: number, clientY: number) => {
        if (isPanning && zoomLevel > 1 && imageContainerRef.current) {
            const newX = clientX - panStart.x;
            const newY = clientY - panStart.y;

            // Calculate max pan distance based on zoom level
            const rect = imageContainerRef.current.getBoundingClientRect();
            const maxPanX = (rect.width * (zoomLevel - 1)) / 2;
            const maxPanY = (rect.height * (zoomLevel - 1)) / 2;

            // Clamp pan position
            const clampedX = Math.max(-maxPanX, Math.min(maxPanX, newX));
            const clampedY = Math.max(-maxPanY, Math.min(maxPanY, newY));

            setPanPosition({ x: clampedX, y: clampedY });
        }
    };

    const handlePanEnd = () => {
        setIsPanning(false);
    };

    // Mouse pan handlers
    const handleImageMouseDown = (e: React.MouseEvent) => {
        if (zoomLevel > 1) {
            e.preventDefault();
            handlePanStart(e.clientX, e.clientY);
        }
    };

    const handleImageMouseMove = (e: MouseEvent) => {
        if (isPanning) {
            handlePanMove(e.clientX, e.clientY);
        }
    };

    const handleImageMouseUp = () => {
        handlePanEnd();
    };

    // Touch pan handlers
    const handleImageTouchStart = (e: React.TouchEvent) => {
        if (zoomLevel > 1 && e.touches[0]) {
            e.preventDefault();
            handlePanStart(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    const handleImageTouchMove = (e: TouchEvent) => {
        if (isPanning && e.touches[0]) {
            handlePanMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    const handleImageTouchEnd = () => {
        handlePanEnd();
    };

    // Add/remove event listeners for slider dragging
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleTouchEnd);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [isDragging]);

    // Add/remove event listeners for panning
    useEffect(() => {
        if (isPanning) {
            document.addEventListener('mousemove', handleImageMouseMove);
            document.addEventListener('mouseup', handleImageMouseUp);
            document.addEventListener('touchmove', handleImageTouchMove);
            document.addEventListener('touchend', handleImageTouchEnd);

            return () => {
                document.removeEventListener('mousemove', handleImageMouseMove);
                document.removeEventListener('mouseup', handleImageMouseUp);
                document.removeEventListener('touchmove', handleImageTouchMove);
                document.removeEventListener('touchend', handleImageTouchEnd);
            };
        }
    }, [isPanning, panStart, panPosition]);

    return (
        <div className={cn("relative w-full", className)}>
            {/* Zoom Controls */}
            <div className="absolute top-2 left-2 z-20 flex gap-1 bg-black/70 rounded-lg p-1">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20 hover:text-white disabled:opacity-50"
                    aria-label="Zoom in"
                    title="Zoom in"
                >
                    <ZoomIn className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 1}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20 hover:text-white disabled:opacity-50"
                    aria-label="Zoom out"
                    title="Zoom out"
                >
                    <ZoomOut className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleResetZoom}
                    disabled={zoomLevel === 1}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20 hover:text-white disabled:opacity-50"
                    aria-label="Reset zoom"
                    title="Reset zoom"
                >
                    <Maximize2 className="h-4 w-4" aria-hidden="true" />
                </Button>
                <div className="flex items-center px-2 text-white text-xs font-medium">
                    {Math.round(zoomLevel * 100)}%
                </div>
            </div>

            <div
                ref={containerRef}
                className={cn(
                    "relative w-full overflow-hidden rounded-lg select-none",
                    "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                    zoomLevel > 1 && "cursor-move"
                )}
                onClick={handleContainerClick}
                role="group"
                aria-label="Image comparison slider"
            >
                <div
                    ref={imageContainerRef}
                    className="relative w-full"
                    style={{
                        transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                        transformOrigin: 'center center',
                        transition: isPanning ? 'none' : 'transform 0.2s ease-out'
                    }}
                    onMouseDown={handleImageMouseDown}
                    onTouchStart={handleImageTouchStart}
                >
                    {/* After image (full width, underneath) */}
                    <div className="relative w-full">
                        <img
                            src={afterImage}
                            alt={afterAlt}
                            className="comparison-image w-full h-auto block"
                            draggable={false}
                        />
                    </div>

                    {/* Before image (clipped by slider position) */}
                    <div
                        className="absolute top-0 left-0 w-full h-full overflow-hidden"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                        <img
                            src={beforeImage}
                            alt={beforeAlt}
                            className="comparison-image w-full h-auto block"
                            draggable={false}
                        />
                    </div>
                </div>

                {/* Slider line and handle */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                    style={{ left: `${sliderPosition}%` }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    role="slider"
                    aria-label="Comparison slider"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(sliderPosition)}
                    aria-valuetext={`${Math.round(sliderPosition)}% of after image visible`}
                >
                    {/* Slider handle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-ew-resize">
                        {/* Left arrow */}
                        <svg
                            className="w-3 h-3 text-gray-700 absolute left-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {/* Right arrow */}
                        <svg
                            className="w-3 h-3 text-gray-700 absolute right-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>

                {/* Labels */}
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium pointer-events-none z-10">
                    Before
                </div>
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium pointer-events-none z-10">
                    After
                </div>
            </div>

            {/* Zoom hint */}
            {zoomLevel > 1 && (
                <div className="mt-2 text-xs text-muted-foreground text-center">
                    Click and drag to pan • Zoom: {Math.round(zoomLevel * 100)}%
                </div>
            )}
        </div>
    );
}

export default ImageComparisonSlider;
