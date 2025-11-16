/**
 * Image Caching Utility
 * 
 * Implements an in-memory image cache with LRU eviction policy
 * Requirements: 3.2, 3.3 - Optimize image loading performance
 */

interface CacheEntry {
    blob: Blob;
    url: string;
    timestamp: number;
    size: number;
}

class ImageCache {
    private cache: Map<string, CacheEntry> = new Map();
    private maxSize: number = 50 * 1024 * 1024; // 50MB max cache size
    private currentSize: number = 0;

    /**
     * Get an image from cache or fetch it
     */
    async get(imageUrl: string): Promise<string> {
        // Check if image is in cache
        const cached = this.cache.get(imageUrl);
        if (cached) {
            // Update timestamp for LRU
            cached.timestamp = Date.now();
            return cached.url;
        }

        // Fetch and cache the image
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            // Add to cache
            this.set(imageUrl, blob, objectUrl);

            return objectUrl;
        } catch (error) {
            console.error('Image cache fetch error:', error);
            // Return original URL as fallback
            return imageUrl;
        }
    }

    /**
     * Add an image to the cache
     */
    private set(key: string, blob: Blob, url: string): void {
        const size = blob.size;

        // Evict old entries if needed
        while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
            this.evictOldest();
        }

        // Add new entry
        this.cache.set(key, {
            blob,
            url,
            timestamp: Date.now(),
            size,
        });
        this.currentSize += size;
    }

    /**
     * Evict the oldest (least recently used) entry
     */
    private evictOldest(): void {
        let oldestKey: string | null = null;
        let oldestTime = Infinity;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            const entry = this.cache.get(oldestKey);
            if (entry) {
                // Revoke object URL to free memory
                URL.revokeObjectURL(entry.url);
                this.currentSize -= entry.size;
                this.cache.delete(oldestKey);
            }
        }
    }

    /**
     * Preload images into cache
     */
    async preload(imageUrls: string[]): Promise<void> {
        const promises = imageUrls.map(url => this.get(url).catch(() => url));
        await Promise.all(promises);
    }

    /**
     * Clear the entire cache
     */
    clear(): void {
        // Revoke all object URLs
        for (const entry of this.cache.values()) {
            URL.revokeObjectURL(entry.url);
        }
        this.cache.clear();
        this.currentSize = 0;
    }

    /**
     * Get cache statistics
     */
    getStats(): { size: number; count: number; maxSize: number } {
        return {
            size: this.currentSize,
            count: this.cache.size,
            maxSize: this.maxSize,
        };
    }
}

// Export singleton instance
export const imageCache = new ImageCache();
