/**
 * useEditHistory Hook Tests
 * 
 * Tests for edit history management with undo/redo functionality
 * Requirements: 3.5, 8.1, 8.2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEditHistory } from '@/hooks/useEditHistory';

describe('useEditHistory', () => {
    // Clear sessionStorage before each test
    beforeEach(() => {
        sessionStorage.clear();
    });

    // Clean up after each test
    afterEach(() => {
        sessionStorage.clear();
    });

    it('should initialize with empty state', () => {
        const { result } = renderHook(() => useEditHistory());

        expect(result.current.currentImageUrl).toBeNull();
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
        expect(result.current.historyLength).toBe(0);
        expect(result.current.currentIndex).toBe(-1);
    });

    it('should initialize history with an image URL', () => {
        const { result } = renderHook(() => useEditHistory());
        const testUrl = 'https://example.com/image.jpg';

        act(() => {
            result.current.initialize(testUrl);
        });

        expect(result.current.currentImageUrl).toBe(testUrl);
        expect(result.current.historyLength).toBe(1);
        expect(result.current.currentIndex).toBe(0);
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
    });

    it('should add edit operations to history', () => {
        const { result } = renderHook(() => useEditHistory());
        const initialUrl = 'https://example.com/image.jpg';
        const editedUrl = 'https://example.com/edited.jpg';

        act(() => {
            result.current.initialize(initialUrl);
        });

        act(() => {
            result.current.addToHistory(editedUrl, 'remove_background');
        });

        expect(result.current.currentImageUrl).toBe(editedUrl);
        expect(result.current.historyLength).toBe(2);
        expect(result.current.currentIndex).toBe(1);
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(false);
    });

    it('should support undo functionality', () => {
        const { result } = renderHook(() => useEditHistory());
        const initialUrl = 'https://example.com/image.jpg';
        const editedUrl = 'https://example.com/edited.jpg';

        act(() => {
            result.current.initialize(initialUrl);
            result.current.addToHistory(editedUrl, 'remove_background');
        });

        expect(result.current.currentImageUrl).toBe(editedUrl);

        act(() => {
            result.current.undo();
        });

        expect(result.current.currentImageUrl).toBe(initialUrl);
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(true);
    });

    it('should support redo functionality', () => {
        const { result } = renderHook(() => useEditHistory());
        const initialUrl = 'https://example.com/image.jpg';
        const editedUrl = 'https://example.com/edited.jpg';

        act(() => {
            result.current.initialize(initialUrl);
            result.current.addToHistory(editedUrl, 'remove_background');
            result.current.undo();
        });

        expect(result.current.currentImageUrl).toBe(initialUrl);

        act(() => {
            result.current.redo();
        });

        expect(result.current.currentImageUrl).toBe(editedUrl);
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(false);
    });

    it('should clear redo history when adding new edit after undo', () => {
        const { result } = renderHook(() => useEditHistory());
        const initialUrl = 'https://example.com/image.jpg';
        const editedUrl1 = 'https://example.com/edited1.jpg';
        const editedUrl2 = 'https://example.com/edited2.jpg';

        act(() => {
            result.current.initialize(initialUrl);
            result.current.addToHistory(editedUrl1, 'remove_background');
            result.current.undo();
        });

        expect(result.current.canRedo).toBe(true);

        act(() => {
            result.current.addToHistory(editedUrl2, 'enhance');
        });

        expect(result.current.currentImageUrl).toBe(editedUrl2);
        expect(result.current.historyLength).toBe(2);
        expect(result.current.canRedo).toBe(false);
    });

    it('should enforce max history size of 20 items', () => {
        const { result } = renderHook(() => useEditHistory());
        const initialUrl = 'https://example.com/image.jpg';

        act(() => {
            result.current.initialize(initialUrl);
        });

        // Add 25 edits
        act(() => {
            for (let i = 1; i <= 25; i++) {
                result.current.addToHistory(
                    `https://example.com/edited${i}.jpg`,
                    'enhance'
                );
            }
        });

        // Should only keep 20 items
        expect(result.current.historyLength).toBe(20);
    });

    it('should reset to first image in history', () => {
        const { result } = renderHook(() => useEditHistory());
        const initialUrl = 'https://example.com/image.jpg';
        const editedUrl = 'https://example.com/edited.jpg';

        act(() => {
            result.current.initialize(initialUrl);
            result.current.addToHistory(editedUrl, 'remove_background');
        });

        expect(result.current.currentImageUrl).toBe(editedUrl);

        act(() => {
            result.current.reset();
        });

        expect(result.current.currentImageUrl).toBe(initialUrl);
        expect(result.current.currentIndex).toBe(0);
    });

    it('should clear all history', () => {
        const { result } = renderHook(() => useEditHistory());
        const initialUrl = 'https://example.com/image.jpg';

        act(() => {
            result.current.initialize(initialUrl);
            result.current.addToHistory('https://example.com/edited.jpg', 'enhance');
        });

        expect(result.current.historyLength).toBe(2);

        act(() => {
            result.current.clearHistory();
        });

        expect(result.current.currentImageUrl).toBeNull();
        expect(result.current.historyLength).toBe(0);
        expect(result.current.currentIndex).toBe(-1);
    });

    it('should persist history to sessionStorage', () => {
        const { result } = renderHook(() => useEditHistory());
        const initialUrl = 'https://example.com/image.jpg';
        const editedUrl = 'https://example.com/edited.jpg';

        act(() => {
            result.current.initialize(initialUrl);
            result.current.addToHistory(editedUrl, 'remove_background');
        });

        // Check sessionStorage
        const stored = sessionStorage.getItem('edit-page-history');
        expect(stored).toBeTruthy();

        const parsed = JSON.parse(stored!);
        expect(parsed.items).toHaveLength(2);
        expect(parsed.currentIndex).toBe(1);
    });

    it('should restore history from sessionStorage', () => {
        const initialUrl = 'https://example.com/image.jpg';
        const editedUrl = 'https://example.com/edited.jpg';

        // Set up sessionStorage
        const historyState = {
            items: [
                {
                    imageUrl: initialUrl,
                    operation: 'remove_background',
                    timestamp: Date.now(),
                },
                {
                    imageUrl: editedUrl,
                    operation: 'enhance',
                    timestamp: Date.now(),
                },
            ],
            currentIndex: 1,
        };
        sessionStorage.setItem('edit-page-history', JSON.stringify(historyState));

        // Create new hook instance
        const { result } = renderHook(() => useEditHistory());

        expect(result.current.currentImageUrl).toBe(editedUrl);
        expect(result.current.historyLength).toBe(2);
        expect(result.current.currentIndex).toBe(1);
    });
});
