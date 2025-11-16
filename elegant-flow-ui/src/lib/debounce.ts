/**
 * Debounce Utility
 * 
 * Debounces function calls to optimize performance
 * Requirements: 5.1, 5.2 - Optimize zoom and pan operations
 */

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function debounced(...args: Parameters<T>) {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func(...args);
            timeoutId = null;
        }, wait);
    };
}

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds.
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastRan: number = 0;

    return function throttled(...args: Parameters<T>) {
        const now = Date.now();

        if (!lastRan) {
            func(...args);
            lastRan = now;
        } else {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                if (now - lastRan >= wait) {
                    func(...args);
                    lastRan = now;
                }
            }, wait - (now - lastRan));
        }
    };
}

/**
 * Request animation frame based debounce for smooth animations
 */
export function rafDebounce<T extends (...args: any[]) => any>(
    func: T
): (...args: Parameters<T>) => void {
    let rafId: number | null = null;

    return function rafDebounced(...args: Parameters<T>) {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
        }

        rafId = requestAnimationFrame(() => {
            func(...args);
            rafId = null;
        });
    };
}
