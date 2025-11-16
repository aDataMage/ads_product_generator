/**
 * PerformanceMonitor Component
 * 
 * Optional development component to display performance metrics
 * Requirements: 3.2, 3.3, 5.1, 5.2 - Add performance monitoring
 */

import { useState, useEffect } from 'react';
import { Activity, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { performanceMonitor } from '@/lib/performanceMonitor';
import { imageCache } from '@/lib/imageCache';

interface PerformanceMonitorProps {
    /** Whether to show the monitor by default */
    defaultOpen?: boolean;
}

/**
 * PerformanceMonitor component
 * Displays real-time performance metrics for debugging and optimization
 */
export function PerformanceMonitor({ defaultOpen = false }: PerformanceMonitorProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [metrics, setMetrics] = useState<Record<string, any>>({});
    const [cacheStats, setCacheStats] = useState<{ size: number; count: number; maxSize: number }>({
        size: 0,
        count: 0,
        maxSize: 0,
    });

    // Update metrics periodically
    useEffect(() => {
        if (!isOpen) return;

        const updateMetrics = () => {
            const summary = performanceMonitor.getSummary();
            setMetrics(summary);
            setCacheStats(imageCache.getStats());
        };

        // Initial update
        updateMetrics();

        // Update every 2 seconds
        const interval = setInterval(updateMetrics, 2000);

        return () => clearInterval(interval);
    }, [isOpen]);

    // Only show in development mode
    if (import.meta.env.PROD) {
        return null;
    }

    if (!isOpen) {
        return (
            <Button
                variant="outline"
                size="icon"
                className="fixed bottom-20 right-4 z-40 shadow-lg opacity-50 hover:opacity-100 transition-opacity"
                onClick={() => setIsOpen(true)}
                aria-label="Open performance monitor"
                title="Performance Monitor (Dev Only)"
            >
                <Activity className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <div className="fixed bottom-20 right-4 z-40 bg-card border border-border rounded-lg shadow-xl p-4 max-w-md max-h-96 overflow-auto backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <h3 className="font-semibold text-sm">Performance Monitor</h3>
                    <span className="text-xs text-muted-foreground">(Dev)</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close performance monitor"
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>

            {/* Cache Stats */}
            <div className="mb-4">
                <h4 className="text-xs font-medium mb-2">Image Cache</h4>
                <div className="text-xs space-y-1 text-muted-foreground">
                    <div>Images: {cacheStats.count}</div>
                    <div>
                        Size: {(cacheStats.size / (1024 * 1024)).toFixed(2)} MB / {(cacheStats.maxSize / (1024 * 1024)).toFixed(0)} MB
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${(cacheStats.size / cacheStats.maxSize) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div>
                <h4 className="text-xs font-medium mb-2">Performance Metrics</h4>
                {Object.keys(metrics).length === 0 ? (
                    <div className="text-xs text-muted-foreground">No metrics recorded yet</div>
                ) : (
                    <div className="space-y-2">
                        {Object.entries(metrics).map(([name, stats]) => (
                            <div key={name} className="text-xs">
                                <div className="font-medium">{name}</div>
                                <div className="text-muted-foreground space-y-0.5 ml-2">
                                    <div>Count: {stats.count}</div>
                                    <div>Avg: {stats.avg.toFixed(2)}ms</div>
                                    <div>Min: {stats.min.toFixed(2)}ms</div>
                                    <div>Max: {stats.max.toFixed(2)}ms</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                        performanceMonitor.clear();
                        setMetrics({});
                    }}
                >
                    Clear Metrics
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                        imageCache.clear();
                        setCacheStats({ size: 0, count: 0, maxSize: cacheStats.maxSize });
                    }}
                >
                    Clear Cache
                </Button>
            </div>
        </div>
    );
}
