/**
 * useKeyboardShortcuts Hook
 * 
 * Manages keyboard shortcuts for image editing operations
 * Requirements: Task 6.3 - Add keyboard shortcuts (Ctrl+Z for undo, etc.)
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcutHandlers {
    /** Handler for undo operation (Ctrl+Z / Cmd+Z) */
    onUndo?: () => void;
    /** Handler for redo operation (Ctrl+Y / Cmd+Shift+Z / Ctrl+Shift+Z) */
    onRedo?: () => void;
    /** Handler for reset operation (Ctrl+R / Cmd+R) */
    onReset?: () => void;
    /** Handler for download operation (Ctrl+S / Cmd+S) */
    onDownload?: () => void;
    /** Handler for escape key (close modals, exit edit mode) */
    onEscape?: () => void;
    /** Handler for zoom fit (Ctrl+0 / Cmd+0) */
    onZoomFit?: () => void;
    /** Handler for zoom in (Ctrl++ / Cmd++) */
    onZoomIn?: () => void;
    /** Handler for zoom out (Ctrl+- / Cmd+-) */
    onZoomOut?: () => void;
}

export interface UseKeyboardShortcutsOptions extends KeyboardShortcutHandlers {
    /** Whether keyboard shortcuts are enabled */
    enabled?: boolean;
}

/**
 * Custom hook for managing keyboard shortcuts
 * 
 * Supports:
 * - Ctrl+Z / Cmd+Z: Undo
 * - Ctrl+Y / Cmd+Shift+Z / Ctrl+Shift+Z: Redo
 * - Ctrl+R / Cmd+R: Reset to original
 * - Ctrl+S / Cmd+S: Download image
 * - Ctrl+0 / Cmd+0: Zoom to fit
 * - Ctrl++ / Cmd++: Zoom in
 * - Ctrl+- / Cmd+-: Zoom out
 * - Escape: Close/exit
 * 
 * @param options - Configuration options and handlers
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
    const {
        enabled = true,
        onUndo,
        onRedo,
        onReset,
        onDownload,
        onEscape,
        onZoomFit,
        onZoomIn,
        onZoomOut,
    } = options;

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Don't trigger shortcuts if user is typing in an input/textarea
        const target = event.target as HTMLElement;
        const isInputField = target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable;

        // Allow Escape even in input fields
        if (event.key === 'Escape' && onEscape) {
            event.preventDefault();
            onEscape();
            return;
        }

        // Skip other shortcuts if in input field
        if (isInputField) {
            return;
        }

        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

        // Undo: Ctrl+Z / Cmd+Z
        if (ctrlKey && event.key === 'z' && !event.shiftKey && onUndo) {
            event.preventDefault();
            onUndo();
            return;
        }

        // Redo: Ctrl+Y / Cmd+Shift+Z / Ctrl+Shift+Z
        if (onRedo) {
            // Windows/Linux: Ctrl+Y
            if (ctrlKey && event.key === 'y' && !isMac) {
                event.preventDefault();
                onRedo();
                return;
            }
            // Mac: Cmd+Shift+Z or Windows/Linux: Ctrl+Shift+Z
            if (ctrlKey && event.shiftKey && event.key === 'z') {
                event.preventDefault();
                onRedo();
                return;
            }
        }

        // Reset: Ctrl+R / Cmd+R (prevent default browser reload)
        if (ctrlKey && event.key === 'r' && onReset) {
            event.preventDefault();
            onReset();
            return;
        }

        // Download: Ctrl+S / Cmd+S (prevent default browser save)
        if (ctrlKey && event.key === 's' && onDownload) {
            event.preventDefault();
            onDownload();
            return;
        }

        // Zoom to fit: Ctrl+0 / Cmd+0
        if (ctrlKey && event.key === '0' && onZoomFit) {
            event.preventDefault();
            onZoomFit();
            return;
        }

        // Zoom in: Ctrl++ / Cmd++ (also handle Ctrl+= since + requires Shift)
        if (ctrlKey && (event.key === '+' || event.key === '=') && onZoomIn) {
            event.preventDefault();
            onZoomIn();
            return;
        }

        // Zoom out: Ctrl+- / Cmd+-
        if (ctrlKey && event.key === '-' && onZoomOut) {
            event.preventDefault();
            onZoomOut();
            return;
        }
    }, [onUndo, onRedo, onReset, onDownload, onEscape, onZoomFit, onZoomIn, onZoomOut]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        // Add event listener
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [enabled, handleKeyDown]);
}

/**
 * Get keyboard shortcut display text based on platform
 * 
 * @param shortcut - The shortcut type
 * @returns Display text for the shortcut
 */
export function getShortcutText(shortcut: 'undo' | 'redo' | 'reset' | 'download' | 'escape' | 'zoomFit' | 'zoomIn' | 'zoomOut'): string {
    const isMac = typeof navigator !== 'undefined' &&
        navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const mod = isMac ? '⌘' : 'Ctrl';

    const shortcuts = {
        undo: `${mod}+Z`,
        redo: isMac ? `${mod}+Shift+Z` : `${mod}+Y`,
        reset: `${mod}+R`,
        download: `${mod}+S`,
        escape: 'Esc',
        zoomFit: `${mod}+0`,
        zoomIn: `${mod}++`,
        zoomOut: `${mod}+-`,
    };

    return shortcuts[shortcut];
}
