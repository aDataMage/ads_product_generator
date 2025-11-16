/**
 * Dark Mode Tests
 * 
 * Tests for theme toggle functionality
 * Task 6.3: Add dark mode support
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ThemeToggle } from '@/components/ThemeToggle';

describe('Dark Mode Support', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        // Reset document classes
        document.documentElement.classList.remove('light', 'dark');
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should render theme toggle button', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button', { name: /toggle theme/i });
        expect(button).toBeInTheDocument();
    });

    it('should open dropdown menu when clicked', async () => {
        const user = userEvent.setup();
        render(<ThemeToggle />);

        const button = screen.getByRole('button', { name: /toggle theme/i });
        await user.click(button);

        expect(screen.getByText('Light')).toBeInTheDocument();
        expect(screen.getByText('Dark')).toBeInTheDocument();
        expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('should apply light theme when selected', async () => {
        const user = userEvent.setup();
        render(<ThemeToggle />);

        const button = screen.getByRole('button', { name: /toggle theme/i });
        await user.click(button);

        const lightOption = screen.getByText('Light');
        await user.click(lightOption);

        expect(document.documentElement.classList.contains('light')).toBe(true);
        expect(localStorage.getItem('theme')).toBe('light');
    });

    it('should apply dark theme when selected', async () => {
        const user = userEvent.setup();
        render(<ThemeToggle />);

        const button = screen.getByRole('button', { name: /toggle theme/i });
        await user.click(button);

        const darkOption = screen.getByText('Dark');
        await user.click(darkOption);

        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('should persist theme preference to localStorage', async () => {
        const user = userEvent.setup();
        render(<ThemeToggle />);

        const button = screen.getByRole('button', { name: /toggle theme/i });
        await user.click(button);

        const darkOption = screen.getByText('Dark');
        await user.click(darkOption);

        expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('should load theme from localStorage on mount', () => {
        localStorage.setItem('theme', 'dark');
        render(<ThemeToggle />);

        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should default to system theme when no preference is stored', () => {
        render(<ThemeToggle />);
        expect(localStorage.getItem('theme')).toBe('system');
    });

    it('should have accessible ARIA labels', () => {
        render(<ThemeToggle />);
        const button = screen.getByRole('button', { name: /toggle theme/i });
        expect(button).toHaveAttribute('aria-label', 'Toggle theme');
    });

    it('should show sun icon in light mode', () => {
        localStorage.setItem('theme', 'light');
        render(<ThemeToggle />);

        const button = screen.getByRole('button', { name: /toggle theme/i });
        expect(button).toBeInTheDocument();
    });

    it('should show moon icon in dark mode', () => {
        localStorage.setItem('theme', 'dark');
        render(<ThemeToggle />);

        const button = screen.getByRole('button', { name: /toggle theme/i });
        expect(button).toBeInTheDocument();
    });
});
