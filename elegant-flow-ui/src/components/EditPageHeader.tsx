/**
 * EditPageHeader Component
 * 
 * Top navigation and action buttons for the edit page
 * Requirements: 4.1, 4.2, 4.3, 6.1, 6.2
 * 
 * Features:
 * - Back button with confirmation dialog for unsaved changes
 * - Page title display
 * - Download button functionality
 * - Undo/Redo controls
 * - Styled to match application theme
 */

import { useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getShortcutText } from '@/hooks/useKeyboardShortcuts';

/**
 * EditPageHeader Props
 * Requirement 4.1, 4.2, 4.3, 6.1, 6.2
 */
export interface EditPageHeaderProps {
    /** Handler for back navigation */
    onBack: () => void;
    /** Handler for download action */
    onDownload: () => void;
    /** Whether there are unsaved changes (triggers confirmation dialog) */
    hasUnsavedChanges?: boolean;
    /** Optional: Custom class name */
    className?: string;
    /** Optional: Undo handler */
    onUndo?: () => void;
    /** Optional: Redo handler */
    onRedo?: () => void;
    /** Optional: Can undo state */
    canUndo?: boolean;
    /** Optional: Can redo state */
    canRedo?: boolean;
}

/**
 * EditPageHeader Component
 * 
 * Requirement 4.1: Display back button in header
 * Requirement 4.2: Navigate to previous page on back click
 * Requirement 4.3: Display confirmation dialog if unsaved changes exist
 * Requirement 6.1: Display download button in header
 * Requirement 6.2: Download current image on click
 */
export function EditPageHeader({
    onBack,
    onDownload,
    hasUnsavedChanges = false,
    className,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
}: EditPageHeaderProps) {
    // State for confirmation dialog
    // Requirement 4.3: Show confirmation dialog if unsaved changes exist
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    /**
     * Handle back button click
     * Requirement 4.2: Navigate back to previous page
     * Requirement 4.3: Show confirmation if unsaved changes exist
     */
    const handleBackClick = () => {
        if (hasUnsavedChanges) {
            setShowConfirmDialog(true);
        } else {
            onBack();
        }
    };

    /**
     * Confirm navigation with unsaved changes
     */
    const handleConfirmBack = () => {
        setShowConfirmDialog(false);
        onBack();
    };

    /**
     * Cancel navigation
     */
    const handleCancelBack = () => {
        setShowConfirmDialog(false);
    };

    return (
        <TooltipProvider>
            {/* Header */}
            {/* Requirement 4.1: Header with back button, title, and action buttons */}
            <header
                className={cn(
                    'border-b bg-card',
                    className
                )}
                role="banner"
            >
                <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
                    {/* Left section: Back button and title */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        {/* Requirement 4.1: Back button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleBackClick}
                                    aria-label="Go back to previous page (Esc)"
                                    className="shrink-0 h-8 sm:h-9"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline ml-1">Back</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Back ({getShortcutText('escape')})</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Page title */}
                        <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate">
                            Image Editor
                        </h1>
                    </div>

                    {/* Right section: Action buttons */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {/* Undo/Redo buttons (optional) */}
                        {onUndo && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onUndo}
                                        disabled={!canUndo}
                                        aria-label={`Undo last action (${getShortcutText('undo')})`}
                                        className="hidden sm:inline-flex"
                                    >
                                        Undo
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Undo ({getShortcutText('undo')})</p>
                                </TooltipContent>
                            </Tooltip>
                        )}

                        {onRedo && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onRedo}
                                        disabled={!canRedo}
                                        aria-label={`Redo last action (${getShortcutText('redo')})`}
                                        className="hidden sm:inline-flex"
                                    >
                                        Redo
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Redo ({getShortcutText('redo')})</p>
                                </TooltipContent>
                            </Tooltip>
                        )}

                        {/* Requirement 6.1: Download button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={onDownload}
                                    aria-label={`Download edited image (${getShortcutText('download')})`}
                                    className="h-8 sm:h-9"
                                >
                                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline ml-1">Download</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Download ({getShortcutText('download')})</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </header>

            {/* Confirmation Dialog */}
            {/* Requirement 4.3: Display confirmation dialog if unsaved changes exist */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent
                    aria-describedby="dialog-description"
                    onOpenAutoFocus={(e) => {
                        // Focus management - Requirement 8.2: Focus on cancel button by default
                        e.preventDefault();
                        const target = e.currentTarget;
                        if (target && 'querySelector' in target) {
                            const cancelButton = (target as HTMLElement).querySelector('[data-cancel-button]') as HTMLElement;
                            cancelButton?.focus();
                        }
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>Unsaved Changes</DialogTitle>
                        <DialogDescription id="dialog-description">
                            You have unsaved changes. Are you sure you want to leave? Your
                            changes will be lost.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCancelBack}
                            data-cancel-button
                            aria-label="Cancel and continue editing"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmBack}
                            aria-label="Leave page and discard unsaved changes"
                        >
                            Leave Without Saving
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
