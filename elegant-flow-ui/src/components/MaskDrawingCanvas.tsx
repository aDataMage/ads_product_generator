import React, { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Eraser, Paintbrush, RotateCcw, Undo, Redo } from 'lucide-react';

interface MaskDrawingCanvasProps {
    imageUrl: string;
    onMaskChange: (maskBase64: string) => void;
    className?: string;
}

type Tool = 'brush' | 'eraser';

interface HistoryState {
    imageData: ImageData;
}

export const MaskDrawingCanvas: React.FC<MaskDrawingCanvasProps> = ({
    imageUrl,
    onMaskChange,
    className = '',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<Tool>('brush');
    const [brushSize, setBrushSize] = useState(20);
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    // Load image and initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            // CRITICAL: Set canvas size to exactly match image dimensions
            // This ensures the mask aspect ratio matches the image aspect ratio
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image as background at exact dimensions
            ctx.drawImage(img, 0, 0, img.width, img.height);

            // Initialize with transparent overlay for mask
            ctx.globalCompositeOperation = 'source-over';

            imageRef.current = img;

            // Save initial state
            saveToHistory();
        };
        img.src = imageUrl;
    }, [imageUrl]);

    // Keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+Z or Cmd+Z for undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            }
            // Ctrl+Y or Cmd+Y or Ctrl+Shift+Z for redo
            else if (
                ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
            ) {
                e.preventDefault();
                handleRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [historyIndex, history]);

    // Save current canvas state to history
    const saveToHistory = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Remove any future history if we're not at the end
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ imageData });

        // Limit history to 50 states
        if (newHistory.length > 50) {
            newHistory.shift();
        } else {
            setHistoryIndex(historyIndex + 1);
        }

        setHistory(newHistory);
    };

    // Undo functionality
    const handleUndo = () => {
        if (historyIndex <= 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const newIndex = historyIndex - 1;
        ctx.putImageData(history[newIndex].imageData, 0, 0);
        setHistoryIndex(newIndex);
        updateMask();
    };

    // Redo functionality
    const handleRedo = () => {
        if (historyIndex >= history.length - 1) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const newIndex = historyIndex + 1;
        ctx.putImageData(history[newIndex].imageData, 0, 0);
        setHistoryIndex(newIndex);
        updateMask();
    };

    // Clear/reset canvas
    const handleClear = () => {
        const canvas = canvasRef.current;
        if (!canvas || !imageRef.current) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Redraw original image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageRef.current, 0, 0);

        saveToHistory();
        updateMask();
    };

    // Get drawing coordinates
    const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if ('touches' in e) {
            // Use the first touch point only (ignore multi-touch)
            const touch = e.touches[0] || e.changedTouches[0];
            if (!touch) return { x: 0, y: 0 };

            return {
                x: (touch.clientX - rect.left) * scaleX,
                y: (touch.clientY - rect.top) * scaleY,
            };
        } else {
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY,
            };
        }
    };

    // Start drawing
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        setIsDrawing(true);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoordinates(e);

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    // Update cursor position for custom cursor indicator
    const updateCursorPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        setCursorPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    // Hide cursor when leaving canvas
    const hideCursor = () => {
        setCursorPosition(null);
    };

    // Draw on canvas
    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoordinates(e);

        // Update cursor position for mouse events
        if ('clientX' in e) {
            updateCursorPosition(e);
        }

        if (tool === 'brush') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'; // Semi-transparent red for mask
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        } else {
            ctx.globalCompositeOperation = 'destination-out';
        }

        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.lineTo(x, y);
        ctx.stroke();

        // Draw a circle at the point for smoother lines
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    // Stop drawing
    const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (e) {
            e.preventDefault();
        }
        if (isDrawing) {
            setIsDrawing(false);
            saveToHistory();
            updateMask();
        }
    };

    // Convert canvas to base64 mask
    const updateMask = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const img = imageRef.current;
        if (!img) return;

        // Verify canvas dimensions match image dimensions
        if (canvas.width !== img.width || canvas.height !== img.height) {
            console.warn('Canvas dimensions do not match image dimensions. Resizing canvas.');
            canvas.width = img.width;
            canvas.height = img.height;
        }

        // Create a new canvas for the mask only (without the background image)
        // CRITICAL: Use exact same dimensions as the drawing canvas to maintain aspect ratio
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const maskCtx = maskCanvas.getContext('2d');
        if (!maskCtx) return;

        // Get the current canvas data
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Extract image data at full canvas resolution to preserve aspect ratio
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Create mask: white where drawn (red areas), black elsewhere
        for (let i = 0; i < data.length; i += 4) {
            const red = data[i];
            const alpha = data[i + 3];

            // If there's red color with some alpha, it's part of the mask
            if (red > 100 && alpha > 100) {
                data[i] = 255;     // R
                data[i + 1] = 255; // G
                data[i + 2] = 255; // B
                data[i + 3] = 255; // A
            } else {
                data[i] = 0;       // R
                data[i + 1] = 0;   // G
                data[i + 2] = 0;   // B
                data[i + 3] = 255; // A
            }
        }

        maskCtx.putImageData(imageData, 0, 0);
        const maskBase64 = maskCanvas.toDataURL('image/png');

        // Verify mask dimensions match image aspect ratio
        const imageAspectRatio = img.width / img.height;
        const maskAspectRatio = maskCanvas.width / maskCanvas.height;

        if (Math.abs(imageAspectRatio - maskAspectRatio) > 0.01) {
            console.error('Mask aspect ratio does not match image aspect ratio!');
        }

        onMaskChange(maskBase64);
    };

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-muted rounded-lg">
                {/* Tool Selection */}
                <div className="flex gap-2">
                    <Button
                        variant={tool === 'brush' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTool('brush')}
                        aria-label="Brush tool"
                        title="Brush tool"
                    >
                        <Paintbrush className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={tool === 'eraser' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTool('eraser')}
                        aria-label="Eraser tool"
                        title="Eraser tool"
                    >
                        <Eraser className="h-4 w-4" />
                    </Button>
                </div>

                {/* Brush Size */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label htmlFor="brush-size" className="text-xs sm:text-sm font-medium">
                        Size:
                    </label>
                    <input
                        id="brush-size"
                        type="range"
                        min="5"
                        max="100"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="flex-1 sm:w-32"
                        aria-label="Brush size"
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground w-8">{brushSize}</span>
                </div>

                {/* History Controls */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                        aria-label="Undo"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1}
                        aria-label="Redo"
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>

                {/* Clear Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    aria-label="Clear mask"
                    title="Clear all and reset"
                >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                </Button>
            </div>

            {/* Canvas */}
            <div className="relative border rounded-lg overflow-hidden bg-checkered">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={(e) => {
                        updateCursorPosition(e);
                        draw(e);
                    }}
                    onMouseUp={stopDrawing}
                    onMouseLeave={(e) => {
                        hideCursor();
                        stopDrawing(e);
                    }}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    onTouchCancel={stopDrawing}
                    className="max-w-full h-auto"
                    style={{
                        cursor: 'none', // Hide default cursor to show custom cursor
                        touchAction: 'none',
                        // Ensure aspect ratio is preserved when displayed
                        aspectRatio: 'auto',
                        // Prevent text selection on mobile
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                        // Prevent callout on iOS
                        WebkitTouchCallout: 'none',
                    }}
                />
                {/* Custom cursor indicator */}
                {cursorPosition && (
                    <div
                        className="pointer-events-none absolute rounded-full border-2 transition-opacity"
                        style={{
                            left: cursorPosition.x,
                            top: cursorPosition.y,
                            width: brushSize,
                            height: brushSize,
                            transform: 'translate(-50%, -50%)',
                            borderColor: tool === 'brush' ? 'rgba(255, 0, 0, 0.8)' : 'rgba(59, 130, 246, 0.8)',
                            backgroundColor: tool === 'brush' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        }}
                        aria-hidden="true"
                    />
                )}
            </div>

            {/* Instructions */}
            <p className="text-sm text-muted-foreground">
                Draw on the image to create a mask. Red areas indicate the masked region that will be filled.
            </p>
        </div>
    );
};
