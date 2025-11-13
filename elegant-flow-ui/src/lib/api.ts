/**
 * API client module for image generation
 * Requirements 14.1, 14.2, 14.3, 14.4
 */

import type { GenerateImageRequest, GenerateImageResponse } from './types';

/**
 * API configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_ENDPOINT = '/api/generate';
const REQUEST_TIMEOUT = 120000; // 120 seconds (2 minutes) for image generation

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    statusCode?: number;
    originalError?: unknown;

    constructor(
        message: string,
        statusCode?: number,
        originalError?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.originalError = originalError;
    }
}

/**
 * Generate a product image using the backend API
 * 
 * Requirement 14.1: Send POST requests to the /api/generate endpoint
 * Requirement 14.2: Include user_prompt, preset_name, and optional reference_image_base64
 * Requirement 14.3: Handle API responses with success and final_image_url or error fields
 * Requirement 14.4: Implement proper error handling for network failures
 * 
 * @param request - The image generation request payload
 * @returns Promise resolving to the API response
 * @throws ApiError for network failures, timeouts, or API errors
 */
export async function generateImage(
    request: GenerateImageRequest
): Promise<GenerateImageResponse> {
    // Create an AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        // Requirement 14.1: Send POST request to /api/generate endpoint
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            signal: controller.signal,
        });

        // Clear the timeout since request completed
        clearTimeout(timeoutId);

        // Parse the JSON response
        const data: GenerateImageResponse = await response.json();

        // Handle non-2xx HTTP status codes
        if (!response.ok) {
            throw new ApiError(
                data.error || `HTTP error ${response.status}: ${response.statusText}`,
                response.status
            );
        }

        // Requirement 14.3: Handle API responses with success field
        if (!data.success) {
            throw new ApiError(
                data.error || 'Image generation failed',
                response.status
            );
        }

        return data;
    } catch (error) {
        // Clear timeout in case of error
        clearTimeout(timeoutId);

        // Requirement 14.4: Handle network failures with user-friendly messages
        if (error instanceof ApiError) {
            // Re-throw ApiError instances
            throw error;
        }

        if (error instanceof TypeError) {
            // Network error (e.g., no internet connection, CORS issue)
            throw new ApiError(
                'Network error. Please check your internet connection and try again.',
                undefined,
                error
            );
        }

        if (error instanceof Error && error.name === 'AbortError') {
            // Timeout error
            throw new ApiError(
                'Request timed out. Image generation is taking longer than expected. Please try again.',
                408,
                error
            );
        }

        // Unknown error
        throw new ApiError(
            'An unexpected error occurred. Please try again.',
            undefined,
            error
        );
    }
}

/**
 * Check if the API server is reachable
 * Useful for health checks or connection testing
 * 
 * @returns Promise resolving to true if server is reachable, false otherwise
 */
export async function checkApiHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000), // 5 second timeout for health check
        });
        return response.ok;
    } catch {
        return false;
    }
}
