/**
 * useImageEditor Hook
 * 
 * Manages image editing state including history, undo/redo, and persistence
 * Requirements: Task 6.2 - Editing State Management
 */

import { useState, useCallback, useEffect } from 'react';
import { saveToStorage, loadFromStorage } from '@/lib/storage';

const STORAGE_KEY = 'elegant-flow-image-editor-state';

/**
 * Edit operation type
 */
export type EditOperationType =
    | 'remove-bg'
    | 'replace-bg'
    | 'blur-bg'
    | 'gen-fill'
    | 'expand'
    | 'enhance'
    | 'upscale';

/**
 * Edit operation interface
 */
export interface EditOperation {
    type: EditOperationType;
    params: Record<string, any>;
    resultUrl: string;
    timestamp: number;
}

/**
 * Image editor state interface
 */
export interface ImageEditorState {
    originalImageUrl: string | null;
    currentImageUrl: string | null;
    editHistory: EditOperation[];
    currentEditIndex: number;
}

/**
 * useImageEditor hook return type
 */
export interface UseImageEditorReturn {
    // State
    originalImageUrl: string | null;
    currentImageUrl: string | null;
    editHistory: EditOperation[];
    currentEditIndex: number;
    canUndo: boolean;
    canRedo: boolean;

    // Actions
    setOriginalImage: (url: string) => void;
    addEdit: (operation: EditOperation) => void;
    undo: () => void;
    redo: () => void;
    resetToOriginal: () => void;
    clearHistory: () => void;
}

/**
 * Custom hook for managing image editing state
 * 
 * Features:
 * - Tracks original and current image URLs
 * - Maintains edit history with undo/redo support
 * - Persists state to localStorage
 * - Provides helper functions for state management
 */
export function useImageEditor(): UseImageEditorReturn {
    // Initialize state from localStorage or defaults
    const [state, setState] = useState<ImageEditorState>(() => {
        const saved = loadFromStorage<ImageEditorState>(STORAGE_KEY);
        return saved || {
            originalImageUrl: null,
            currentImageUrl: null,
            editHistory: [],
            currentEditIndex: -1,
        };
    });

    // Persist state to localStorage whenever it changes
    useEffect(() => {
        if (state.originalImageUrl) {
            saveToStorage(STORAGE_KEY, state);
        }
    }, [state]);

    /**
     * Set the original image URL
     * This resets the editing state
     */
    const setOriginalImage = useCallback((url: string) => {
        setState({
            originalImageUrl: url,
            currentImageUrl: url,
            editHistory: [],
            currentEditIndex: -1,
        });
    }, []);

    /**
     * Add a new edit operation to history
     * This clears any redo history after the current position
     */
    const addEdit = useCallback((operation: EditOperation) => {
        setState((prev) => {
            // Remove any operations after current index (clear redo history)
            const newHistory = prev.editHistory.slice(0, prev.currentEditIndex + 1);

            // Add new operation
            newHistory.push(operation);

            return {
                ...prev,
                currentImageUrl: operation.resultUrl,
                editHistory: newHistory,
                currentEditIndex: newHistory.length - 1,
            };
        });
    }, []);

    /**
     * Undo the last edit operation
     */
    const undo = useCallback(() => {
        setState((prev) => {
            if (prev.currentEditIndex < 0) {
                return prev; // Nothing to undo
            }

            const newIndex = prev.currentEditIndex - 1;
            const newCurrentUrl = newIndex >= 0
                ? prev.editHistory[newIndex].resultUrl
                : prev.originalImageUrl;

            return {
                ...prev,
                currentImageUrl: newCurrentUrl,
                currentEditIndex: newIndex,
            };
        });
    }, []);

    /**
     * Redo the next edit operation
     */
    const redo = useCallback(() => {
        setState((prev) => {
            if (prev.currentEditIndex >= prev.editHistory.length - 1) {
                return prev; // Nothing to redo
            }

            const newIndex = prev.currentEditIndex + 1;
            const newCurrentUrl = prev.editHistory[newIndex].resultUrl;

            return {
                ...prev,
                currentImageUrl: newCurrentUrl,
                currentEditIndex: newIndex,
            };
        });
    }, []);

    /**
     * Reset to the original image
     * Clears all edit history
     */
    const resetToOriginal = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currentImageUrl: prev.originalImageUrl,
            editHistory: [],
            currentEditIndex: -1,
        }));
    }, []);

    /**
     * Clear all history and reset state
     */
    const clearHistory = useCallback(() => {
        setState({
            originalImageUrl: null,
            currentImageUrl: null,
            editHistory: [],
            currentEditIndex: -1,
        });
    }, []);

    // Compute derived state
    const canUndo = state.currentEditIndex >= 0;
    const canRedo = state.currentEditIndex < state.editHistory.length - 1;

    return {
        // State
        originalImageUrl: state.originalImageUrl,
        currentImageUrl: state.currentImageUrl,
        editHistory: state.editHistory,
        currentEditIndex: state.currentEditIndex,
        canUndo,
        canRedo,

        // Actions
        setOriginalImage,
        addEdit,
        undo,
        redo,
        resetToOriginal,
        clearHistory,
    };
}
