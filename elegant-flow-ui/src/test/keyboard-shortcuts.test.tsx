/**
 * Keyboard Shortcuts Tests
 * 
 * Tests for keyboard shortcut functionality in image editing
 * Requirements: Task 6.3 - Add keyboard shortcuts (Ctrl+Z for undo, etc.)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, getShortcutText } from '@/hooks/useKeyboardShortcuts';

describe('useKeyboardShortcuts Hook', () => {
    let handlers: {
        onUndo: () => void;
        onRedo: () => void;
        onReset: () => void;
        onDownload: () => void;
        onEscape: () => void;
    };

    beforeEach(() => {
        handlers = {
            onUndo: vi.fn(),
            onRedo: vi.fn(),
            onReset: vi.fn(),
            onDownload: vi.fn(),
            onEscape: vi.fn(),
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should call onUndo when Ctrl+Z is pressed', () => {
        renderHook(() => useKeyboardShortcuts({
            enabled: true,
            ...handlers,
        }));

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            bubbles: true,
        });

        window.dispatchEvent(event);

        expect(handlers.onUndo).toHaveBeenCalledTimes(1);
    });

    it('should call onRedo when Ctrl+Y is pressed (Windows/Linux)', () => {
        // Mock non-Mac platform
        Object.defineProperty(navigator, 'platform', {
            value: 'Win32',
            writable: true,
            configurable: true,
        });

        renderHook(() => useKeyboardShortcuts({
            enabled: true,
            ...handlers,
        }));

        const event = new KeyboardEvent('keydown', {
            key: 'y',
            ctrlKey: true,
            bubbles: true,
        });

        window.dispatchEvent(event);

        expect(handlers.onRedo).toHaveBeenCalledTimes(1);
    });

    it('should call onRedo when Ctrl+Shift+Z is pressed', () => {
        renderHook(() => useKeyboardShortcuts({
            enabled: true,
            ...handlers,
        }));

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            shiftKey: true,
            bubbles: true,
        });

        window.dispatchEvent(event);

        expect(handlers.onRedo).toHaveBeenCalledTimes(1);
    });

    it('should call onReset when Ctrl+R is pressed', () => {
        renderHook(() => useKeyboardShortcuts({
            enabled: true,
            ...handlers,
        }));

        const event = new KeyboardEvent('keydown', {
            key: 'r',
            ctrlKey: true,
            bubbles: true,
        });

        window.dispatchEvent(event);

        expect(handlers.onReset).toHaveBeenCalledTimes(1);
    });

    it('should call onDownload when Ctrl+S is pressed', () => {
        renderHook(() => useKeyboardShortcuts({
            enabled: true,
            ...handlers,
        }));

        const event = new KeyboardEvent('keydown', {
            key: 's',
            ctrlKey: true,
            bubbles: true,
        });

        window.dispatchEvent(event);

        expect(handlers.onDownload).toHaveBeenCalledTimes(1);
    });

    it('should call onEscape when Escape is pressed', () => {
        renderHook(() => useKeyboardShortcuts({
            enabled: true,
            ...handlers,
        }));

        const event = new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
        });

        window.dispatchEvent(event);

        expect(handlers.onEscape).toHaveBeenCalledTimes(1);
    });

    it('should not call handlers when disabled', () => {
        renderHook(() => useKeyboardShortcuts({
            enabled: false,
            ...handlers,
        }));

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            bubbles: true,
        });

        window.dispatchEvent(event);

        expect(handlers.onUndo).not.toHaveBeenCalled();
    });

    it('should not call handlers when typing in input field', () => {
        const input = document.createElement('input');
        document.body.appendChild(input);

        renderHook(() => useKeyboardShortcuts({
            enabled: true,
            ...handlers,
        }));

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            bubbles: true,
        });

        Object.defineProperty(event, 'target', {
            value: input,
            writable: false,
        });

        window.dispatchEvent(event);

        expect(handlers.onUndo).not.toHaveBeenCalled();

        document.body.removeChild(input);
    });

    it('should call onEscape even when typing in input field', () => {
        const input = document.createElement('input');
        document.body.appendChild(input);

        renderHook(() => useKeyboardShortcuts({
            enabled: true,
            ...handlers,
        }));

        const event = new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
        });

        Object.defineProperty(event, 'target', {
            value: input,
            writable: false,
        });

        window.dispatchEvent(event);

        expect(handlers.onEscape).toHaveBeenCalledTimes(1);

        document.body.removeChild(input);
    });

    it('should not call handler if handler is undefined', () => {
        renderHook(() => useKeyboardShortcuts({
            enabled: true,
            onUndo: undefined,
        }));

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            bubbles: true,
        });

        // Should not throw error
        expect(() => window.dispatchEvent(event)).not.toThrow();
    });
});

describe('getShortcutText', () => {
    it('should return correct text for undo shortcut', () => {
        const text = getShortcutText('undo');
        expect(text).toMatch(/Z$/);
    });

    it('should return correct text for redo shortcut', () => {
        const text = getShortcutText('redo');
        expect(text).toBeTruthy();
    });

    it('should return correct text for reset shortcut', () => {
        const text = getShortcutText('reset');
        expect(text).toMatch(/R$/);
    });

    it('should return correct text for download shortcut', () => {
        const text = getShortcutText('download');
        expect(text).toMatch(/S$/);
    });

    it('should return correct text for escape shortcut', () => {
        const text = getShortcutText('escape');
        expect(text).toBe('Esc');
    });
});

describe('Keyboard Shortcuts Integration', () => {
    it('should prevent default browser behavior for Ctrl+S', () => {
        const handlers = {
            onDownload: vi.fn(),
        };

        renderHook(() => useKeyboardShortcuts({
            enabled: true,
            ...handlers,
        }));

        const event = new KeyboardEvent('keydown', {
            key: 's',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
        });

        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

        window.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(handlers.onDownload).toHaveBeenCalled();
    });

    it('should prevent default browser behavior for Ctrl+R', () => {
        const handlers = {
            onReset: vi.fn(),
        };

        renderHook(() => useKeyboardShortcuts({
            enabled: true,
            ...handlers,
        }));

        const event = new KeyboardEvent('keydown', {
            key: 'r',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
        });

        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

        window.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(handlers.onReset).toHaveBeenCalled();
    });
});
