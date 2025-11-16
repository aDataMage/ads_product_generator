/**
 * EditPage Component
 * 
 * Dedicated image editing page with split-panel layout
 * Requirements: 1.1, 1.2, 1.3, 1.4
 * 
 * Features:
 * - URL parameter handling for imageUrl
 * - Navigation state management
 * - Edit history tracking
 * - Undo/redo functionality
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditPageLayout } from '@/components/EditPageLayout';
import { EditPageHeader } from '@/components/EditPageHeader';
import { LazyToolPanel } from '@/components/LazyToolPanel';
import { ImagePanel, type ImagePanelZoomControls } from '@/components/ImagePanel';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { useEditHistory, type EditOperation } from '@/hooks/useEditHistory';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useToast } from '@/hooks/useToast';
import { imageCache } from '@/lib/imageCache';
import { performanceMonitor } from '@/lib/performanceMonitor';
import '@/styles/edit-page-layout.css';

/**
 * Navigation state interface
 * Requirement 1.3: Pass image URL as state
 */
interface EditPageNavigationState {
    imageUrl?: string;
    originalImageUrl?: string;
    fromRoute?: string;
}

/**
 * EditPage component
 * 
 * Main container for the editing interface
 * Requirement 1.1, 1.2: Navigate to /edit route with image URL
 */
export function EditPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Edit history management - Requirements 3.5, 8.1, 8.2
    const {
        currentImageUrl,
        canUndo,
        canRedo,
        initialize,
        addToHistory,
        undo,
        redo,
        reset,
    } = useEditHistory();

    // State management - Requirement 1.4: Implement navigation state management
    const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [imageLoadError, setImageLoadError] = useState<boolean>(false);
    const [retryCount, setRetryCount] = useState<number>(0);

    // Toast notifications - Requirements 4.4, 7.1, 7.2: Error handling with toast
    const { toast } = useToast();

    // Ref for zoom controls - Requirements 8.1, 8.2, 8.3, 8.4: Keyboard shortcuts
    const zoomControlsRef = useRef<ImagePanelZoomControls>(null);

    /**
     * Load image from URL parameters or navigation state
     * Requirement 1.3: Set up URL parameter handling for imageUrl
     * Performance: Preload images into cache
     */
    useEffect(() => {
        performanceMonitor.start('edit-page-init');

        // Try to get image URL from navigation state first
        const state = location.state as EditPageNavigationState;
        const imageUrlFromState = state?.imageUrl;
        const originalUrlFromState = state?.originalImageUrl;

        // Fallback to URL search params
        const imageUrlFromParams = searchParams.get('imageUrl');

        const imageUrl = imageUrlFromState || imageUrlFromParams;

        if (!imageUrl) {
            setError('No image URL provided. Please select an image to edit.');
            performanceMonitor.end('edit-page-init', { error: true });
            return;
        }

        // Set original image URL
        setOriginalImageUrl(originalUrlFromState || imageUrl);

        // Initialize history with the first image
        initialize(imageUrl);

        // Preload image into cache for faster loading
        imageCache.get(imageUrl).catch(err => {
            console.error('Failed to preload image:', err);
        });

        performanceMonitor.end('edit-page-init');
    }, [location.state, searchParams, initialize]);

    /**
     * Handle back navigation
     * Requirement 1.4: Navigate back to previous page
     */
    const handleBack = () => {
        const state = location.state as EditPageNavigationState;
        const fromRoute = state?.fromRoute || '/';
        navigate(fromRoute);
    };

    /**
     * Handle edit completion
     * Adds new image to history and updates loading state
     * Requirements 2.3, 3.2, 3.3: Connect tools and update ImagePanel
     * Performance: Preload new image into cache
     */
    const handleEditComplete = (newImageUrl: string, operation: string) => {
        performanceMonitor.end(`edit-operation-${operation}`);

        // Add to history with operation type
        addToHistory(newImageUrl, operation as EditOperation);

        // Preload new image into cache
        imageCache.get(newImageUrl).catch(err => {
            console.error('Failed to cache edited image:', err);
        });

        // Clear loading state
        setIsLoading(false);
        setLoadingMessage('');

        // Show success toast - Requirement 7.2: Display completion notification
        toast({
            title: 'Edit complete',
            description: `${getOperationDisplayName(operation)} completed successfully.`,
            variant: 'success',
        });
    };

    /**
     * Handle edit failure
     * Shows error toast and reverts loading state
     * Requirements 4.4, 7.1, 7.2: Handle edit operation failures with toast
     */
    const handleEditError = (operation: string, errorMessage?: string) => {
        // Clear loading state
        setIsLoading(false);
        setLoadingMessage('');

        // Show error toast
        toast({
            title: 'Edit failed',
            description: errorMessage || `Failed to ${getOperationDisplayName(operation).toLowerCase()}. Please try again.`,
            variant: 'destructive',
        });
    };

    /**
     * Handle edit start
     * Sets loading state when an operation begins
     * Requirements 7.1, 7.2, 7.3, 7.4: Display loading overlay
     * Performance: Start monitoring operation
     */
    const handleEditStart = (operation: string) => {
        performanceMonitor.start(`edit-operation-${operation}`);
        setIsLoading(true);
        setLoadingMessage(getLoadingMessage(operation));
    };

    /**
     * Get user-friendly loading message for operation
     */
    const getLoadingMessage = (operation: string): string => {
        const messages: Record<string, string> = {
            'remove-bg': 'Removing background...',
            'replace-bg': 'Replacing background...',
            'blur-bg': 'Applying blur effect...',
            'generative-fill': 'Generating fill content...',
            'enhance': 'Enhancing image quality...',
            'upscale': 'Upscaling resolution...',
            'expand-canvas': 'Expanding canvas...',
        };
        return messages[operation] || 'Processing...';
    };

    /**
     * Get user-friendly operation display name
     */
    const getOperationDisplayName = (operation: string): string => {
        const names: Record<string, string> = {
            'remove-bg': 'Remove background',
            'replace-bg': 'Replace background',
            'blur-bg': 'Blur background',
            'generative-fill': 'Generative fill',
            'enhance': 'Enhance image',
            'upscale': 'Upscale image',
            'expand-canvas': 'Expand canvas',
        };
        return names[operation] || 'Edit';
    };

    /**
     * Handle reset to original
     */
    const handleReset = () => {
        reset();
    };

    /**
     * Handle undo operation
     * Requirements 8.1, 8.2: Undo/redo functionality
     */
    const handleUndo = () => {
        undo();
    };

    /**
     * Handle redo operation
     * Requirements 8.1, 8.2: Undo/redo functionality
     */
    const handleRedo = () => {
        redo();
    };

    /**
     * Handle download
     * Requirements 6.1, 6.2, 6.3, 6.4: Download current image with descriptive filename
     */
    const handleDownload = async () => {
        if (!currentImageUrl) {
            toast({
                title: 'Download failed',
                description: 'No image to download.',
                variant: 'destructive',
            });
            return;
        }

        try {
            // Fetch the image
            const response = await fetch(currentImageUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch image');
            }
            const blob = await response.blob();

            // Determine file extension from content type or URL
            // Requirement 6.4: Support downloading in original image format
            let extension = 'jpg'; // Default fallback
            const contentType = response.headers.get('content-type');

            if (contentType) {
                // Extract extension from MIME type
                if (contentType.includes('png')) extension = 'png';
                else if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = 'jpg';
                else if (contentType.includes('webp')) extension = 'webp';
                else if (contentType.includes('gif')) extension = 'gif';
            } else {
                // Try to extract from URL
                const urlExtension = currentImageUrl.split('.').pop()?.toLowerCase();
                if (urlExtension && ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(urlExtension)) {
                    extension = urlExtension === 'jpeg' ? 'jpg' : urlExtension;
                }
            }

            // Create download link with descriptive filename
            // Requirement 6.3: Use descriptive filename including timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `edited-image-${timestamp}.${extension}`;

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Show success toast
            toast({
                title: 'Download complete',
                description: 'Image downloaded successfully.',
                variant: 'success',
            });
        } catch (error) {
            console.error('Download failed:', error);
            toast({
                title: 'Download failed',
                description: 'Unable to download image. Please try again.',
                variant: 'destructive',
            });
        }
    };

    /**
     * Handle image load error
     * Requirements 4.4, 7.1: Handle image load failure with retry
     */
    const handleImageLoadError = () => {
        setImageLoadError(true);
    };

    /**
     * Handle retry image load
     * Requirements 4.4, 7.1: Retry failed image load
     */
    const handleRetryImageLoad = () => {
        setImageLoadError(false);
        setRetryCount(prev => prev + 1);

        // Show retry toast
        toast({
            title: 'Retrying',
            description: 'Attempting to reload image...',
        });
    };

    /**
     * Setup keyboard shortcuts
     * Requirements 8.1, 8.2, 8.3, 8.4: Implement keyboard shortcuts
     */
    useKeyboardShortcuts({
        enabled: !isLoading, // Disable shortcuts during loading
        onUndo: canUndo ? handleUndo : undefined,
        onRedo: canRedo ? handleRedo : undefined,
        onReset: canUndo ? handleReset : undefined,
        onDownload: currentImageUrl ? handleDownload : undefined,
        onZoomFit: () => zoomControlsRef.current?.zoomFit(),
        onZoomIn: () => zoomControlsRef.current?.zoomIn(),
        onZoomOut: () => zoomControlsRef.current?.zoomOut(),
        onEscape: () => {
            // Close any open dialogs or return to previous page
            // For now, just navigate back
            if (!canUndo) {
                handleBack();
            }
        },
    });

    // Error state - Requirement 4.4: Handle missing image URL error
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background" role="main">
                <div className="text-center max-w-md" role="alert" aria-live="assertive">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" aria-hidden="true" />
                    <h1 className="text-2xl font-semibold mb-2">Unable to Load Editor</h1>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Button onClick={handleBack} aria-label="Return to previous page">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    // Image load error state - Requirements 4.4, 7.1: Handle image load failure with retry
    if (imageLoadError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background" role="main">
                <div className="text-center max-w-md" role="alert" aria-live="assertive">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" aria-hidden="true" />
                    <h1 className="text-2xl font-semibold mb-2">Failed to Load Image</h1>
                    <p className="text-muted-foreground mb-6">
                        The image could not be loaded. This might be due to a network issue or an invalid image URL.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={handleRetryImageLoad} className="gap-2" aria-label="Retry loading image">
                            <RefreshCw className="h-4 w-4" aria-hidden="true" />
                            Retry
                        </Button>
                        <Button onClick={handleBack} variant="outline" aria-label="Return to previous page">
                            Go Back
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (!currentImageUrl) {
        return (
            <div className="min-h-screen flex items-center justify-center" role="main">
                <div className="text-center" role="status" aria-live="polite">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" aria-hidden="true"></div>
                    <p className="text-muted-foreground">Loading editor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Skip Links for Accessibility - Requirement 8.4 */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
                Skip to main content
            </a>
            <a
                href="#editing-tools"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-40 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
                Skip to editing tools
            </a>

            {/* Header */}
            <EditPageHeader
                onBack={handleBack}
                onDownload={handleDownload}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo}
                canRedo={canRedo}
                hasUnsavedChanges={canUndo}
            />

            {/* Main content - EditPageLayout with split-panel */}
            <EditPageLayout
                enableResize={true}
                toolPanel={
                    <LazyToolPanel
                        currentImageUrl={currentImageUrl || ''}
                        onEditComplete={handleEditComplete}
                        onEditStart={handleEditStart}
                        onEditError={handleEditError}
                        isProcessing={isLoading}
                    />
                }
                imagePanel={
                    <ImagePanel
                        imageUrl={currentImageUrl || ''}
                        originalImageUrl={originalImageUrl}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        onReset={handleReset}
                        isLoading={isLoading}
                        loadingMessage={loadingMessage}
                        onImageLoadError={handleImageLoadError}
                        retryKey={retryCount}
                        zoomControlsRef={zoomControlsRef}
                    />
                }
            />

            {/* Live region for screen reader announcements */}
            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {isLoading && loadingMessage}
                {!isLoading && canUndo && 'Edit operation completed'}
            </div>

            {/* Performance Monitor (development only) */}
            <PerformanceMonitor />
        </div>
    );
}
