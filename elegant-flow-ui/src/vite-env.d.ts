/// <reference types="vite/client" />

/**
 * TypeScript type definitions for Vite environment variables
 * Requirement 14.1: Add TypeScript types for import.meta.env
 */

interface ImportMetaEnv {
    /**
     * Base URL for the image generation API server
     * @default 'http://localhost:5000'
     * @example 'http://localhost:5000'
     * @example 'https://api.example.com'
     */
    readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
