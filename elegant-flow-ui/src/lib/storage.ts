/**
 * Local Storage utilities for persisting form state
 * Allows users to switch between modes without losing their work
 */

const STORAGE_KEYS = {
    STANDARD_MODE: 'elegant-flow-standard-mode-state',
    PRO_MODE: 'elegant-flow-pro-mode-state',
} as const;

/**
 * Save state to localStorage
 */
export function saveToStorage<T>(key: string, data: T): void {
    try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

/**
 * Load state from localStorage
 */
export function loadFromStorage<T>(key: string): T | null {
    try {
        const serialized = localStorage.getItem(key);
        if (serialized === null) {
            return null;
        }
        return JSON.parse(serialized) as T;
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return null;
    }
}

/**
 * Clear state from localStorage
 */
export function clearStorage(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Failed to clear localStorage:', error);
    }
}

/**
 * Standard Mode state interface
 */
export interface StandardModeState {
    userPrompt: string;
    presetName: string | null;
    referenceImageBase64: string | null;
    referenceImagePreview: string | null;
}

/**
 * Pro Mode state interface
 */
export interface ProModeState {
    structuredPrompt: any;
    photographyMode: string | null;
    currentStep: number;
}

/**
 * Save Standard Mode state
 */
export function saveStandardModeState(state: StandardModeState): void {
    saveToStorage(STORAGE_KEYS.STANDARD_MODE, state);
}

/**
 * Load Standard Mode state
 */
export function loadStandardModeState(): StandardModeState | null {
    return loadFromStorage<StandardModeState>(STORAGE_KEYS.STANDARD_MODE);
}

/**
 * Clear Standard Mode state
 */
export function clearStandardModeState(): void {
    clearStorage(STORAGE_KEYS.STANDARD_MODE);
}

/**
 * Save Pro Mode state
 */
export function saveProModeState(state: ProModeState): void {
    saveToStorage(STORAGE_KEYS.PRO_MODE, state);
}

/**
 * Load Pro Mode state
 */
export function loadProModeState(): ProModeState | null {
    return loadFromStorage<ProModeState>(STORAGE_KEYS.PRO_MODE);
}

/**
 * Clear Pro Mode state
 */
export function clearProModeState(): void {
    clearStorage(STORAGE_KEYS.PRO_MODE);
}

/**
 * Clear all stored state
 */
export function clearAllState(): void {
    clearStandardModeState();
    clearProModeState();
}
