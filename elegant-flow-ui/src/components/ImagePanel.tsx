/**
 * ImagePanel Component
 * 
 * Display and interact with the image being edited
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.2, 7.3, 7.4
 * 
 * Features:
 * - Image display with zoom and pan capabilities
 * - Zoom controls (fit, 100%, 200%, zoom in/out)
 * - Pan/drag functionality for zoomed images
 * - Image metadata display (dimensions, file size)
 * - Loading overlay with progress indicator
 * - Undo/redo controls
 * - Image comparison slider
 */

import { useState, useRef, useEffect, useImperativeHandle, useCallback, useMemo } from 'react';
import {
    ZoomIn,
    ZoomOut,
    Maximize2,
    RotateCcw,
    Undo2,
    Redo2,
    Info,
    Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ImageComparisonSlider } from '@/components/ImageComparisonSlider';
import { cn } from '@/lib/utils';
import { rafDebounce } from '@/lib/debounce';
import { performanceMonitor } from '@/lib/performanceMonitor';

/**
 * ImagePanel Props
 * Requirement 3.1, 3.2, 3.3, 3.4, 3.5
 */
export interface ImagePanelProps {
    /** Current image URL to display */
    imageUrl: string;
    /** Original image URL for comparison (reserved for future comparison feature) */
    originalImageUrl?: string;
    /** Whether undo is available */
    canUndo?: boolean;
    /** Whether redo is available */
    canRedo?: boolean;
    /** Undo handler */
    onUndo?: () => void;
    /** Redo handler */
    onRedo?: () => void;
    /** Reset handler */
    onReset?: () => void;
    /** Loading state */
    isLoading?: boolean;
    /** Loading message */
    loadingMessage?: string;
    /** Callback when image fails to load - Requirements 4.4, 7.1 */
    onImageLoadError?: () => void;
    /** Retry key to force image reload - Requirements 4.4, 7.1 */
    retryKey?: number;
    /** Optional: Custom class name */
    className?: string;
    /** Optional: Ref to expose zoom methods for keyboard shortcuts */
    zoomControlsRef?: React.RefObject<ImagePanelZoomControls | null>;
}

/**
 * Zoom controls interface for imperative access
 * Used for keyboard shortcuts
 */
export interface ImagePanelZoomControls {
    zoomIn: () => void;
    zoomOut: () => void;
    zoomFit: () => void;
    zoomReset: () => void;
}

/**
 * Zoom levels for the image
 */
const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];

/**
 * ImagePanel Component
 * 
 * Requirement 3.1: Display image canvas on right side
 * Requirement 3.2: Display current image with zoom and pan capabilities
 * Requirement 3.3: Update in real-time when editing operations complete
 * Requirement 3.4: Maintain aspect ratio while fitting within available space
 * Requirement 3.5: Include undo/redo controls and history tracking
 */
export function ImagePanel({
    imageUrl,
    originalImageUrl,
    canUndo = false,
    canRedo = false,
    onUndo,
    onRedo,
    onReset,
    isLoading = false,
    loadingMessage = 'Processing...',
    onImageLoadError,
    retryKey = 0,
    className,
    zoomControlsRef,
}: ImagePanelProps) {
    // Zoom and pan state
    const [zoom, setZoom] = useState<number>(1);
    const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Image metadata state
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
    const [imageFileSize, setImageFileSize] = useState<number | null>(null);
    const [showMetadata, setShowMetadata] = useState(false);

    // Comparison mode state - Requirement 3.2, 3.3: Show original vs edited image
    const [showComparison, setShowComparison] = useState(false);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Touch interaction state for mobile
    const [touchStartDistance, setTouchStartDistance] = useState<number | null>(null);
    const [initialZoom, setInitialZoom] = useState<number>(1);

    /**
     * Load image metadata when image URL changes
     * Requirement 3.4: Display image metadata (dimensions, file size)
     * Performance: Monitor image load time
     */
    useEffect(() => {
        if (!imageUrl) return;

        performanceMonitor.start('image-load');

        const img = new Image();
        img.onload = () => {
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
            performanceMonitor.end('image-load', {
                width: img.naturalWidth,
                height: img.naturalHeight,
            });
        };
        img.onerror = () => {
            performanceMonitor.end('image-load', { error: true });
        };
        img.src = imageUrl;

        // Fetch file size
        fetch(imageUrl, { method: 'HEAD' })
            .then(response => {
                const contentLength = response.headers.get('content-length');
                if (contentLength) {
                    setImageFileSize(parseInt(contentLength, 10));
                }
            })
            .catch(() => {
                // Silently fail - file size is optional
            });
    }, [imageUrl]);

    /**
     * Reset pan position when zoom changes
     */
    useEffect(() => {
        if (zoom === 1) {
            setPanPosition({ x: 0, y: 0 });
        }
    }, [zoom]);

    /**
     * Calculate zoom to fit image in viewport
     * Requirement 3.4: Maintain aspect ratio while fitting within available space
     */
    const calculateFitZoom = (): number => {
        if (!containerRef.current || !imageRef.current) return 1;

        const containerRect = containerRef.current.getBoundingClientRect();
        const imageRect = imageRef.current.getBoundingClientRect();

        const scaleX = containerRect.width / imageRect.width;
        const scaleY = containerRect.height / imageRect.height;

        return Math.min(scaleX, scaleY, 1);
    };

    /**
     * Handle zoom controls
     * Requirement 3.2: Add zoom controls (fit, 100%, 200%, zoom in/out)
     */
    const handleZoomIn = () => {
        const currentIndex = ZOOM_LEVELS.findIndex(level => level >= zoom);
        const nextIndex = Math.min(currentIndex + 1, ZOOM_LEVELS.length - 1);
        setZoom(ZOOM_LEVELS[nextIndex]);
    };

    const handleZoomOut = () => {
        const currentIndex = ZOOM_LEVELS.findIndex(level => level >= zoom);
        const prevIndex = Math.max(currentIndex - 1, 0);
        setZoom(ZOOM_LEVELS[prevIndex]);
    };

    const handleZoomFit = () => {
        const fitZoom = calculateFitZoom();
        setZoom(fitZoom);
    };

    const handleZoomReset = () => {
        setZoom(1);
        setPanPosition({ x: 0, y: 0 });
    };

    /**
     * Expose zoom controls for keyboard shortcuts
     * Requirement 8.1, 8.2, 8.3, 8.4: Support keyboard shortcuts
     */
    useImperativeHandle(zoomControlsRef, () => ({
        zoomIn: handleZoomIn,
        zoomOut: handleZoomOut,
        zoomFit: handleZoomFit,
        zoomReset: handleZoomReset,
    }));

    /**
     * Handle mouse down for panning
     * Requirement 3.2: Implement pan/drag functionality for zoomed images
     */
    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom <= 1) return;

        setIsDragging(true);
        setDragStart({
            x: e.clientX - panPosition.x,
            y: e.clientY - panPosition.y,
        });
    };

    /**
     * Debounced pan position update for smooth performance
     * Requirements 5.1, 5.2: Debounce zoom and pan operations
     */
    const debouncedSetPanPosition = useMemo(
        () => rafDebounce((position: { x: number; y: number }) => {
            setPanPosition(position);
        }),
        []
    );

    /**
     * Handle mouse move for panning
     * Performance: Use debounced updates for smooth panning
     */
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || zoom <= 1) return;

        debouncedSetPanPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    }, [isDragging, zoom, dragStart, debouncedSetPanPosition]);

    /**
     * Handle mouse up to stop panning
     */
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    /**
     * Handle mouse leave to stop panning
     */
    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    /**
     * Calculate distance between two touch points
     * Used for pinch-to-zoom gesture
     */
    const getTouchDistance = (touches: React.TouchList): number => {
        const touch1 = touches[0];
        const touch2 = touches[1];
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    /**
     * Handle touch start for pinch-to-zoom and pan
     * Requirement 5.4: Test touch interactions for zoom and pan
     */
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            // Two-finger pinch gesture
            e.preventDefault();
            const distance = getTouchDistance(e.touches);
            setTouchStartDistance(distance);
            setInitialZoom(zoom);
        } else if (e.touches.length === 1 && zoom > 1) {
            // Single-finger pan gesture (only when zoomed)
            const touch = e.touches[0];
            setIsDragging(true);
            setDragStart({
                x: touch.clientX - panPosition.x,
                y: touch.clientY - panPosition.y,
            });
        }
    };

    /**
     * Handle touch move for pinch-to-zoom and pan
     * Requirement 5.4: Test touch interactions for zoom and pan
     * Performance: Use debounced updates for smooth touch interactions
     */
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2 && touchStartDistance !== null) {
            // Two-finger pinch gesture
            e.preventDefault();
            const currentDistance = getTouchDistance(e.touches);
            const scale = currentDistance / touchStartDistance;
            const newZoom = Math.max(
                ZOOM_LEVELS[0],
                Math.min(initialZoom * scale, ZOOM_LEVELS[ZOOM_LEVELS.length - 1])
            );
            setZoom(newZoom);
        } else if (e.touches.length === 1 && isDragging && zoom > 1) {
            // Single-finger pan gesture
            const touch = e.touches[0];
            debouncedSetPanPosition({
                x: touch.clientX - dragStart.x,
                y: touch.clientY - dragStart.y,
            });
        }
    }, [touchStartDistance, initialZoom, isDragging, zoom, dragStart, debouncedSetPanPosition]);

    /**
     * Handle touch end to stop gestures
     * Requirement 5.4: Test touch interactions for zoom and pan
     */
    const handleTouchEnd = () => {
        setTouchStartDistance(null);
        setIsDragging(false);
    };

    /**
     * Format file size for display
     */
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <TooltipProvider>
            <div className={cn('relative w-full h-full flex flex-col', className)} role="region" aria-label="Image editing canvas">
                {/* Toolbar */}
                {/* Requirement 3.5: Include undo/redo controls */}
                <div className="flex items-center justify-between gap-1 sm:gap-2 p-2 sm:p-3 border-b bg-card/50 overflow-x-auto" role="toolbar" aria-label="Image editing controls" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {/* Left: History controls */}
                    <div className="flex items-center gap-0.5 sm:gap-1" role="group" aria-label="History controls">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onUndo}
                                    disabled={!canUndo}
                                    aria-label="Undo last action (Ctrl+Z)"
                                    className="h-8 w-8 sm:h-9 sm:w-9"
                                >
                                    <Undo2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Undo (Ctrl+Z)</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onRedo}
                                    disabled={!canRedo}
                                    aria-label="Redo last action (Ctrl+Y)"
                                    className="h-8 w-8 sm:h-9 sm:w-9"
                                >
                                    <Redo2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Redo (Ctrl+Y)</p>
                            </TooltipContent>
                        </Tooltip>

                        {onReset && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onReset}
                                        aria-label="Reset to original"
                                        className="h-8 w-8 sm:h-9 sm:w-9"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Reset to Original</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>

                    {/* Center: Zoom controls */}
                    {/* Requirement 3.2: Add zoom controls (fit, 100%, 200%, zoom in/out) */}
                    <div className="flex items-center gap-0.5 sm:gap-1" role="group" aria-label="Zoom controls">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleZoomOut}
                                    disabled={zoom <= ZOOM_LEVELS[0]}
                                    aria-label="Zoom out (Ctrl+-)"
                                    className="h-8 w-8 sm:h-9 sm:w-9"
                                >
                                    <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Zoom Out (Ctrl+-)</p>
                            </TooltipContent>
                        </Tooltip>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleZoomReset}
                            className="min-w-[50px] sm:min-w-[60px] text-xs h-8 sm:h-9"
                            aria-label="Current zoom level, click to reset to 100%"
                        >
                            {Math.round(zoom * 100)}%
                        </Button>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleZoomIn}
                                    disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
                                    aria-label="Zoom in (Ctrl++)"
                                    className="h-8 w-8 sm:h-9 sm:w-9"
                                >
                                    <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Zoom In (Ctrl++)</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleZoomFit}
                                    aria-label="Zoom to fit (Ctrl+0)"
                                    className="h-8 w-8 sm:h-9 sm:w-9"
                                >
                                    <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Fit to Screen (Ctrl+0)</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Right: Comparison and Metadata toggles */}
                    {/* Requirement 3.4: Display image metadata (dimensions, file size) */}
                    <div className="flex items-center gap-0.5 sm:gap-1" role="group" aria-label="View options">
                        {/* Comparison toggle - Requirement 3.2, 3.3: Add "Compare" toggle button */}
                        {originalImageUrl && originalImageUrl !== imageUrl && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={showComparison ? "default" : "ghost"}
                                        size="icon"
                                        onClick={() => setShowComparison(!showComparison)}
                                        aria-label="Toggle comparison view"
                                        aria-pressed={showComparison}
                                        className="h-8 w-8 sm:h-9 sm:w-9"
                                    >
                                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Compare Original</p>
                                </TooltipContent>
                            </Tooltip>
                        )}

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowMetadata(!showMetadata)}
                                    aria-label="Toggle image information"
                                    className="h-8 w-8 sm:h-9 sm:w-9"
                                >
                                    <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Image Info</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Image Container */}
                {/* Requirement 3.1: Display image canvas */}
                {/* Requirement 3.2: Display current image with zoom and pan capabilities */}
                <div
                    ref={containerRef}
                    className={cn(
                        'flex-1 overflow-hidden bg-muted/20 relative',
                        !showComparison && zoom > 1 && 'cursor-grab',
                        !showComparison && isDragging && 'cursor-grabbing'
                    )}
                    onMouseDown={!showComparison ? handleMouseDown : undefined}
                    onMouseMove={!showComparison ? handleMouseMove : undefined}
                    onMouseUp={!showComparison ? handleMouseUp : undefined}
                    onMouseLeave={!showComparison ? handleMouseLeave : undefined}
                    onTouchStart={!showComparison ? handleTouchStart : undefined}
                    onTouchMove={!showComparison ? handleTouchMove : undefined}
                    onTouchEnd={!showComparison ? handleTouchEnd : undefined}
                    role="region"
                    aria-label={showComparison ? "Image comparison view" : `Image preview at ${Math.round(zoom * 100)}% zoom`}
                    aria-live="polite"
                    tabIndex={0}
                >
                    {/* Comparison View - Requirement 3.2, 3.3: Show original vs edited image side-by-side */}
                    {showComparison && originalImageUrl ? (
                        <div className="w-full h-full flex items-center justify-center p-4">
                            <div className="max-w-full max-h-full">
                                <ImageComparisonSlider
                                    beforeImage={originalImageUrl}
                                    afterImage={imageUrl}
                                    beforeAlt="Original image"
                                    afterAlt="Edited image"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center p-4">
                            {/* Requirement 3.3: Update in real-time when editing operations complete */}
                            <img
                                key={`${imageUrl}-${retryKey}`}
                                ref={imageRef}
                                src={imageUrl}
                                alt="Image being edited"
                                className={cn(
                                    'max-w-full max-h-full object-contain transition-transform',
                                    isDragging && 'transition-none'
                                )}
                                style={{
                                    transform: `scale(${zoom}) translate(${panPosition.x / zoom}px, ${panPosition.y / zoom}px)`,
                                }}
                                draggable={false}
                                onError={() => {
                                    // Requirements 4.4, 7.1: Handle image load failure
                                    console.error('Failed to load image:', imageUrl);
                                    if (onImageLoadError) {
                                        onImageLoadError();
                                    }
                                }}
                            />
                        </div>
                    )}

                    {/* Metadata Overlay */}
                    {/* Requirement 3.4: Display image metadata (dimensions, file size) */}
                    {showMetadata && imageDimensions && (
                        <div
                            className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-2 sm:p-3 shadow-lg text-xs sm:text-sm max-w-[calc(100%-1rem)] sm:max-w-none z-10"
                            role="status"
                            aria-label="Image information"
                        >
                            <div className="space-y-1">
                                <div className="font-medium text-foreground">Image Info</div>
                                <div className="text-muted-foreground">
                                    <div>Dimensions: {imageDimensions.width} × {imageDimensions.height}px</div>
                                    {imageFileSize && (
                                        <div>File Size: {formatFileSize(imageFileSize)}</div>
                                    )}
                                    <div>Zoom: {Math.round(zoom * 100)}%</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading Overlay */}
                {/* Requirement 7.1: Display loading overlay on image canvas */}
                {/* Requirement 7.2: Show progress indicator or spinner during processing */}
                {/* Requirement 7.3: Disable editing controls while operation is in progress */}
                {/* Requirement 7.4: Display operation name being performed */}
                {isLoading && (
                    <div
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10"
                        role="alert"
                        aria-live="assertive"
                        aria-busy="true"
                    >
                        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-lg text-center border max-w-[90%] sm:max-w-none">
                            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-3 sm:mb-4" aria-hidden="true"></div>
                            <p className="text-base sm:text-lg font-medium">{loadingMessage}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-2">Please wait...</p>
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}
