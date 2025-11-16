/**
 * Performance Monitoring Utility
 * 
 * Monitors and logs performance metrics for the Edit Page
 * Requirements: 3.2, 3.3, 5.1, 5.2 - Add performance monitoring
 */

interface PerformanceMetric {
    name: string;
    duration: number;
    timestamp: number;
    metadata?: Record<string, any>;
}

class PerformanceMonitor {
    private metrics: PerformanceMetric[] = [];
    private maxMetrics: number = 100;
    private marks: Map<string, number> = new Map();

    /**
     * Start measuring a performance metric
     */
    start(name: string): void {
        this.marks.set(name, performance.now());
    }

    /**
     * End measuring a performance metric and record it
     */
    end(name: string, metadata?: Record<string, any>): number | null {
        const startTime = this.marks.get(name);
        if (!startTime) {
            console.warn(`Performance mark "${name}" not found`);
            return null;
        }

        const duration = performance.now() - startTime;
        this.marks.delete(name);

        // Record metric
        this.record({
            name,
            duration,
            timestamp: Date.now(),
            metadata,
        });

        return duration;
    }

    /**
     * Record a performance metric
     */
    private record(metric: PerformanceMetric): void {
        this.metrics.push(metric);

        // Keep only the most recent metrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics.shift();
        }

        // Log in development
        if (import.meta.env.DEV) {
            console.log(
                `[Performance] ${metric.name}: ${metric.duration.toFixed(2)}ms`,
                metric.metadata || ''
            );
        }
    }

    /**
     * Measure a function execution time
     */
    async measure<T>(
        name: string,
        fn: () => T | Promise<T>,
        metadata?: Record<string, any>
    ): Promise<T> {
        this.start(name);
        try {
            const result = await fn();
            this.end(name, metadata);
            return result;
        } catch (error) {
            this.end(name, { ...metadata, error: true });
            throw error;
        }
    }

    /**
     * Get all recorded metrics
     */
    getMetrics(): PerformanceMetric[] {
        return [...this.metrics];
    }

    /**
     * Get metrics by name
     */
    getMetricsByName(name: string): PerformanceMetric[] {
        return this.metrics.filter(m => m.name === name);
    }

    /**
     * Get average duration for a metric
     */
    getAverageDuration(name: string): number {
        const metrics = this.getMetricsByName(name);
        if (metrics.length === 0) return 0;

        const total = metrics.reduce((sum, m) => sum + m.duration, 0);
        return total / metrics.length;
    }

    /**
     * Get performance summary
     */
    getSummary(): Record<string, { count: number; avg: number; min: number; max: number }> {
        const summary: Record<string, { count: number; avg: number; min: number; max: number }> = {};

        for (const metric of this.metrics) {
            if (!summary[metric.name]) {
                summary[metric.name] = {
                    count: 0,
                    avg: 0,
                    min: Infinity,
                    max: -Infinity,
                };
            }

            const s = summary[metric.name];
            s.count++;
            s.min = Math.min(s.min, metric.duration);
            s.max = Math.max(s.max, metric.duration);
        }

        // Calculate averages
        for (const name in summary) {
            const metrics = this.getMetricsByName(name);
            const total = metrics.reduce((sum, m) => sum + m.duration, 0);
            summary[name].avg = total / metrics.length;
        }

        return summary;
    }

    /**
     * Clear all metrics
     */
    clear(): void {
        this.metrics = [];
        this.marks.clear();
    }

    /**
     * Log performance summary to console
     */
    logSummary(): void {
        const summary = this.getSummary();
        console.table(summary);
    }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export hook for React components
export function usePerformanceMonitor() {
    return performanceMonitor;
}
