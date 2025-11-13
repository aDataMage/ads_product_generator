/**
 * Utility functions for the Elegant Flow UI
 * 
 * This module provides helper functions for:
 * - Class name merging (Tailwind CSS)
 * - Animation duration calculation
 * - Accessibility preferences
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS class names with proper conflict resolution
 * 
 * Uses clsx for conditional classes and tailwind-merge to resolve conflicts.
 * This ensures that later classes override earlier ones correctly.
 * 
 * @param inputs - Class names, objects, or arrays to merge
 * @returns Merged class name string
 * 
 * @example
 * cn("px-2 py-1", condition && "px-4") // "py-1 px-4" if condition is true
 * cn("text-red-500", { "text-blue-500": isBlue }) // "text-blue-500" if isBlue
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Check if user prefers reduced motion
 * Requirement 10.5: Respect prefers-reduced-motion for accessibility
 */
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation duration based on user preference
 * Returns minimal duration if user prefers reduced motion
 */
export function getAnimationDuration(normalDuration: number): number {
    return prefersReducedMotion() ? 0.01 : normalDuration;
}
