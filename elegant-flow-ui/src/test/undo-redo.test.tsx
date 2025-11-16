/**
 * Undo/Redo Functionality Tests
 * 
 * Tests for the useImageEditor hook's undo/redo logic
 * Task 6.2: Editing State Management - Undo/Redo Logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImageEditor, type EditOperation } from '@/hooks/useImageEditor';

describe('useImageEditor - Undo/Redo Logic', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    it('should initialize with no undo/redo capability', () => {
        const { result } = renderHook(() => useImageEditor());

        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
        expect(result.current.editHistory).toEqual([]);
        expect(result.current.currentEditIndex).toBe(-1);
    });

    it('should enable undo after adding an edit', () => {
        const { result } = renderHook(() => useImageEditor());

        // Set original image
        act(() => {
            result.current.setOriginalImage('https://example.com/original.jpg');
        });

        // Add an edit
        const edit: EditOperation = {
            type: 'remove-bg',
            params: {},
            resultUrl: 'https://example.com/edited1.jpg',
            timestamp: Date.now(),
        };

        act(() => {
            result.current.addEdit(edit);
        });

        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(false);
        expect(result.current.editHistory).toHaveLength(1);
        expect(result.current.currentEditIndex).toBe(0);
        expect(result.current.currentImageUrl).toBe('https://example.com/edited1.jpg');
    });

    it('should undo to original image', () => {
        const { result } = renderHook(() => useImageEditor());

        // Set original image
        act(() => {
            result.current.setOriginalImage('https://example.com/original.jpg');
        });

        // Add an edit
        const edit: EditOperation = {
            type: 'remove-bg',
            params: {},
            resultUrl: 'https://example.com/edited1.jpg',
            timestamp: Date.now(),
        };

        act(() => {
            result.current.addEdit(edit);
        });

        // Undo
        act(() => {
            result.current.undo();
        });

        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(true);
        expect(result.current.currentImageUrl).toBe('https://example.com/original.jpg');
        expect(result.current.currentEditIndex).toBe(-1);
    });

    it('should redo after undo', () => {
        const { result } = renderHook(() => useImageEditor());

        // Set original image
        act(() => {
            result.current.setOriginalImage('https://example.com/original.jpg');
        });

        // Add an edit
        const edit: EditOperation = {
            type: 'remove-bg',
            params: {},
            resultUrl: 'https://example.com/edited1.jpg',
            timestamp: Date.now(),
        };

        act(() => {
            result.current.addEdit(edit);
        });

        // Undo
        act(() => {
            result.current.undo();
        });

        // Redo
        act(() => {
            result.current.redo();
        });

        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(false);
        expect(result.current.currentImageUrl).toBe('https://example.com/edited1.jpg');
        expect(result.current.currentEditIndex).toBe(0);
    });

    it('should handle multiple edits with undo/redo', () => {
        const { result } = renderHook(() => useImageEditor());

        // Set original image
        act(() => {
            result.current.setOriginalImage('https://example.com/original.jpg');
        });

        // Add first edit
        act(() => {
            result.current.addEdit({
                type: 'remove-bg',
                params: {},
                resultUrl: 'https://example.com/edited1.jpg',
                timestamp: Date.now(),
            });
        });

        // Add second edit
        act(() => {
            result.current.addEdit({
                type: 'enhance',
                params: {},
                resultUrl: 'https://example.com/edited2.jpg',
                timestamp: Date.now(),
            });
        });

        // Add third edit
        act(() => {
            result.current.addEdit({
                type: 'upscale',
                params: { scale_factor: 2 },
                resultUrl: 'https://example.com/edited3.jpg',
                timestamp: Date.now(),
            });
        });

        expect(result.current.editHistory).toHaveLength(3);
        expect(result.current.currentEditIndex).toBe(2);
        expect(result.current.currentImageUrl).toBe('https://example.com/edited3.jpg');

        // Undo once
        act(() => {
            result.current.undo();
        });

        expect(result.current.currentEditIndex).toBe(1);
        expect(result.current.currentImageUrl).toBe('https://example.com/edited2.jpg');

        // Undo again
        act(() => {
            result.current.undo();
        });

        expect(result.current.currentEditIndex).toBe(0);
        expect(result.current.currentImageUrl).toBe('https://example.com/edited1.jpg');

        // Redo
        act(() => {
            result.current.redo();
        });

        expect(result.current.currentEditIndex).toBe(1);
        expect(result.current.currentImageUrl).toBe('https://example.com/edited2.jpg');
    });

    it('should clear redo history when adding new edit after undo', () => {
        const { result } = renderHook(() => useImageEditor());

        // Set original image
        act(() => {
            result.current.setOriginalImage('https://example.com/original.jpg');
        });

        // Add first edit
        act(() => {
            result.current.addEdit({
                type: 'remove-bg',
                params: {},
                resultUrl: 'https://example.com/edited1.jpg',
                timestamp: Date.now(),
            });
        });

        // Add second edit
        act(() => {
            result.current.addEdit({
                type: 'enhance',
                params: {},
                resultUrl: 'https://example.com/edited2.jpg',
                timestamp: Date.now(),
            });
        });

        // Undo
        act(() => {
            result.current.undo();
        });

        expect(result.current.canRedo).toBe(true);

        // Add new edit (should clear redo history)
        act(() => {
            result.current.addEdit({
                type: 'blur-bg',
                params: { blur_strength: 50 },
                resultUrl: 'https://example.com/edited3.jpg',
                timestamp: Date.now(),
            });
        });

        expect(result.current.canRedo).toBe(false);
        expect(result.current.editHistory).toHaveLength(2);
        expect(result.current.editHistory[1].type).toBe('blur-bg');
    });

    it('should reset to original and clear history', () => {
        const { result } = renderHook(() => useImageEditor());

        // Set original image
        act(() => {
            result.current.setOriginalImage('https://example.com/original.jpg');
        });

        // Add edits
        act(() => {
            result.current.addEdit({
                type: 'remove-bg',
                params: {},
                resultUrl: 'https://example.com/edited1.jpg',
                timestamp: Date.now(),
            });
        });

        act(() => {
            result.current.addEdit({
                type: 'enhance',
                params: {},
                resultUrl: 'https://example.com/edited2.jpg',
                timestamp: Date.now(),
            });
        });

        // Reset to original
        act(() => {
            result.current.resetToOriginal();
        });

        expect(result.current.currentImageUrl).toBe('https://example.com/original.jpg');
        expect(result.current.editHistory).toHaveLength(0);
        expect(result.current.currentEditIndex).toBe(-1);
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
    });

    it('should not undo when at the beginning', () => {
        const { result } = renderHook(() => useImageEditor());

        // Set original image
        act(() => {
            result.current.setOriginalImage('https://example.com/original.jpg');
        });

        const initialUrl = result.current.currentImageUrl;

        // Try to undo (should have no effect)
        act(() => {
            result.current.undo();
        });

        expect(result.current.currentImageUrl).toBe(initialUrl);
        expect(result.current.canUndo).toBe(false);
    });

    it('should not redo when at the end', () => {
        const { result } = renderHook(() => useImageEditor());

        // Set original image
        act(() => {
            result.current.setOriginalImage('https://example.com/original.jpg');
        });

        // Add an edit
        act(() => {
            result.current.addEdit({
                type: 'remove-bg',
                params: {},
                resultUrl: 'https://example.com/edited1.jpg',
                timestamp: Date.now(),
            });
        });

        const currentUrl = result.current.currentImageUrl;

        // Try to redo (should have no effect)
        act(() => {
            result.current.redo();
        });

        expect(result.current.currentImageUrl).toBe(currentUrl);
        expect(result.current.canRedo).toBe(false);
    });

    it('should persist state to localStorage', () => {
        const { result } = renderHook(() => useImageEditor());

        // Set original image
        act(() => {
            result.current.setOriginalImage('https://example.com/original.jpg');
        });

        // Add an edit
        act(() => {
            result.current.addEdit({
                type: 'remove-bg',
                params: {},
                resultUrl: 'https://example.com/edited1.jpg',
                timestamp: Date.now(),
            });
        });

        // Verify localStorage has the data
        const stored = localStorage.getItem('elegant-flow-image-editor-state');
        expect(stored).toBeTruthy();

        const parsed = JSON.parse(stored!);
        expect(parsed.originalImageUrl).toBe('https://example.com/original.jpg');
        expect(parsed.currentImageUrl).toBe('https://example.com/edited1.jpg');
        expect(parsed.editHistory).toHaveLength(1);
    });

    it('should restore state from localStorage', () => {
        // Set up localStorage with existing state
        const existingState = {
            originalImageUrl: 'https://example.com/original.jpg',
            currentImageUrl: 'https://example.com/edited1.jpg',
            editHistory: [
                {
                    type: 'remove-bg',
                    params: {},
                    resultUrl: 'https://example.com/edited1.jpg',
                    timestamp: Date.now(),
                },
            ],
            currentEditIndex: 0,
        };

        localStorage.setItem('elegant-flow-image-editor-state', JSON.stringify(existingState));

        // Create new hook instance
        const { result } = renderHook(() => useImageEditor());

        // Verify state was restored
        expect(result.current.originalImageUrl).toBe('https://example.com/original.jpg');
        expect(result.current.currentImageUrl).toBe('https://example.com/edited1.jpg');
        expect(result.current.editHistory).toHaveLength(1);
        expect(result.current.currentEditIndex).toBe(0);
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(false);
    });
});
