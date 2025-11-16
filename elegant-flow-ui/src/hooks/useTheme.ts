/**
 * useTheme Hook
 * 
 * Manages theme state (light, dark, system) with localStorage persistence
 * Task 6.3: Add dark mode support
 */

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        // Get theme from localStorage or default to system
        const stored = localStorage.getItem('theme') as Theme | null;
        return stored || 'system';
    });

    useEffect(() => {
        const root = document.documentElement;

        // Remove existing theme classes
        root.classList.remove('light', 'dark');

        // Determine the actual theme to apply
        let effectiveTheme: 'light' | 'dark';

        if (theme === 'system') {
            // Use system preference
            effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            effectiveTheme = theme;
        }

        // Apply theme class
        root.classList.add(effectiveTheme);

        // Store preference
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Listen for system theme changes when in system mode
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(mediaQuery.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return { theme, setTheme };
}
