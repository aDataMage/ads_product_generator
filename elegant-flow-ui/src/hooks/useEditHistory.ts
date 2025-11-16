/**
 * useEditHistory Hook
 * 
 * Manages edit history for the dedicated edit page with undo/redo functionality
 * Requirements: 3.5, 8.1, 8.2
 * 
 * Performance optimizations:
 * - Stores only image URLs (not full image data) to minimize memory usage
 * - Limits history size to prevent memory bloat
 * - Uses sessionStorage for persistence without consuming too much memory
 */

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'edit-page-history';
const MAX_HISTORY_SIZE = 20;

/**
 * Edit operation types
 */
export type EditOperation =
    | 'remove_background'
    | 'replace_background'
    | 'blur_background'
    | 'generative_fill'
    | 'enhance'
    | 'upscale'
    | 'expand_canvas';

/**
 * Edit history item interface
 */
export interface EditHistoryItem {
    imageUrl: string;
    operation: EditOperation;
    timestamp: number;
    metadata?: {
        operationParams?: any;
        fileSize?: number;
        dimensions?: { width: number; height: number };
    };
}

/**
 * Edit history state interface
 */
export interface EditHistoryState {
    items: EditHistoryItem[];
    currentIndex: number;
}

/**
 * useEditHistory hook return type
 */
export interface UseEditHistoryReturn {
    // Current state
    currentImageUrl: string | null;
    canUndo: boolean;
    canRedo: boolean;
    historyLength: number;
    currentIndex: number;

    // Actions
    initialize: (imageUrl: string) => void;
    addToHistory: (imageUrl: string, operation: EditOperation, metadata?: EditHistoryItem['metadata']) => void;
    undo: () => string | null;
    redo: () => string | null;
    reset: () => void;
    clearHistory: () => void;
}

/**
 * Custom hook for managing edit history with undo/redo support
 * 
 * Features:
 * - Maintains history of up to 20 edit operations
 * - Supports undo/redo functionality
 * - Persists history to sessionStorage
 * - Automatically manages history size limit
 */
export function useEditHistory(): UseEditHistoryReturn {
    // Initialize state from sessionStorage or defaults
    const [history, setHistory] = useState<EditHistoryState>(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved) as EditHistoryState;
            }
        } catch (error) {
            console.error('Failed to load edit history from sessionStorage:', error);
        }
        return {
            items: [],
            currentIndex: -1,
        };
    });

    // Persist history to sessionStorage whenever it changes
    // Performance: Only store essential data to minimize storage usage
    useEffect(() => {
        try {
            // Create a lightweight version of history for storage
            const lightweightHistory = {
                items: history.items.map(item => ({
                    imageUrl: item.imageUrl,
                    operation: item.operation,
                    timestamp: item.timestamp,
                    // Omit metadata to save space
                })),
                currentIndex: history.currentIndex,
            };
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lightweightHistory));
        } catch (error) {
            console.error('Failed to save edit history to sessionStorage:', error);
            // If storage is full, try clearing old data
            try {
                sessionStorage.removeItem(STORAGE_KEY);
                console.log('Cleared edit history due to storage error');
            } catch (clearError) {
                console.error('Failed to clear storage:', clearError);
            }
        }
    }, [history]);

    /**
     * Initialize history with the starting image
     */
    const initialize = useCallback((imageUrl: string) => {
        const initialItem: EditHistoryItem = {
            imageUrl,
            operation: 'remove_background', // Placeholder for initial state
            timestamp: Date.now(),
        };

        setHistory({
            items: [initialItem],
            currentIndex: 0,
        });
    }, []);

    /**
     * Add a new edit operation to history
     * Clears any redo history after the current position
     * Enforces max history size limit
     */
    const addToHistory = useCallback((
        imageUrl: string,
        operation: EditOperation,
        metadata?: EditHistoryItem['metadata']
    ) => {
        setHistory((prev) => {
            // Remove any items after current index (clear redo history)
            const newItems = prev.items.slice(0, prev.currentIndex + 1);

            // Create new history item
            const newItem: EditHistoryItem = {
                imageUrl,
                operation,
                timestamp: Date.now(),
                metadata,
            };

            // Add new item
            newItems.push(newItem);

            // Enforce max history size by removing oldest items
            const trimmedItems = newItems.length > MAX_HISTORY_SIZE
                ? newItems.slice(newItems.length - MAX_HISTORY_SIZE)
                : newItems;

            return {
                items: trimmedItems,
                currentIndex: trimmedItems.length - 1,
            };
        });
    }, []);

    /**
     * Undo the last edit operation
     * Returns the previous image URL or null if can't undo
     */
    const undo = useCallback((): string | null => {
        let result: string | null = null;

        setHistory((prev) => {
            if (prev.currentIndex <= 0) {
                return prev; // Can't undo
            }

            const newIndex = prev.currentIndex - 1;
            const previousItem = prev.items[newIndex];
            result = previousItem.imageUrl;

            return {
                ...prev,
                currentIndex: newIndex,
            };
        });

        return result;
    }, []);

    /**
     * Redo the next edit operation
     * Returns the next image URL or null if can't redo
     */
    const redo = useCallback((): string | null => {
        let result: string | null = null;

        setHistory((prev) => {
            if (prev.currentIndex >= prev.items.length - 1) {
                return prev; // Can't redo
            }

            const newIndex = prev.currentIndex + 1;
            const nextItem = prev.items[newIndex];
            result = nextItem.imageUrl;

            return {
                ...prev,
                currentIndex: newIndex,
            };
        });

        return result;
    }, []);

    /**
     * Reset to the first image in history
     */
    const reset = useCallback(() => {
        setHistory((prev) => {
            if (prev.items.length === 0) {
                return prev;
            }

            return {
                ...prev,
                currentIndex: 0,
            };
        });
    }, []);

    /**
     * Clear all history
     */
    const clearHistory = useCallback(() => {
        setHistory({
            items: [],
            currentIndex: -1,
        });
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear edit history from sessionStorage:', error);
        }
    }, []);

    // Compute derived state
    const currentImageUrl = history.currentIndex >= 0 && history.items[history.currentIndex]
        ? history.items[history.currentIndex].imageUrl
        : null;
    const canUndo = history.currentIndex > 0;
    const canRedo = history.currentIndex < history.items.length - 1;

    return {
        // Current state
        currentImageUrl,
        canUndo,
        canRedo,
        historyLength: history.items.length,
        currentIndex: history.currentIndex,

        // Actions
        initialize,
        addToHistory,
        undo,
        redo,
        reset,
        clearHistory,
    };
}
