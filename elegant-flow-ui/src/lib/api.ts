/**
 * API client module for image generation
 * Requirements 14.1, 14.2, 14.3, 14.4
 */

import type {
    GenerateImageRequest,
    GenerateImageResponse,
    ProModeGenerateRequest,
    ProModeGenerateResponse,
    RemoveBackgroundRequest,
    RemoveBackgroundResponse,
    ReplaceBackgroundRequest,
    ReplaceBackgroundResponse,
    BlurBackgroundRequest,
    BlurBackgroundResponse,
    GenerativeFillRequest,
    GenerativeFillResponse,
    EnhanceImageRequest,
    EnhanceImageResponse,
    UpscaleImageRequest,
    UpscaleImageResponse,
    ExpandImageRequest,
    ExpandImageResponse
} from './types';

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
 * Generate image using Pro Mode (structured prompt)
 * Bypasses Gemini translation layer and sends structured prompt directly to Bria
 * 
 * Requirement 7.3: Send POST request to /api/generate/pro endpoint
 * Requirement 7.4: Include structured_prompt and seed in request payload
 * Requirement 8.1: Handle loading states during API call
 * Requirement 8.2: Display error messages for failed generations
 * 
 * @param request - The Pro Mode generation request payload
 * @returns Promise resolving to the API response
 * @throws ApiError for network failures, timeouts, or API errors
 */
export async function generateProMode(
    request: ProModeGenerateRequest
): Promise<ProModeGenerateResponse> {
    // Create an AbortController for timeout handling (120 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        // Requirement 7.3: Send POST request to /api/generate/pro endpoint
        const response = await fetch(`${API_BASE_URL}/api/generate/pro`, {
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
        const data: ProModeGenerateResponse = await response.json();

        // Handle non-2xx HTTP status codes
        if (!response.ok) {
            throw new ApiError(
                data.error || `HTTP error ${response.status}: ${response.statusText}`,
                response.status
            );
        }

        // Requirement 8.2: Handle API responses with success field
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

        // Requirement 8.2: Handle network failures with user-friendly messages
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
            // Timeout error (120 seconds)
            throw new ApiError(
                'Request timed out. Pro Mode generation is taking longer than expected. Please try again.',
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
 * Analyze an image and generate a structured prompt
 * 
 * @param imageBase64 - Base64-encoded image string
 * @returns Promise resolving to the structured prompt
 * @throws ApiError for network failures, timeouts, or API errors
 */
export async function analyzeImage(imageBase64: string): Promise<{
    success: boolean;
    structured_prompt?: any;
    error?: string;
}> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds for image analysis

    try {
        const response = await fetch(`${API_BASE_URL}/api/analyze-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image_base64: imageBase64 }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.error || `HTTP error ${response.status}: ${response.statusText}`,
                response.status
            );
        }

        if (!data.success) {
            throw new ApiError(
                data.error || 'Image analysis failed',
                response.status
            );
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof TypeError) {
            throw new ApiError(
                'Network error. Please check your internet connection and try again.',
                undefined,
                error
            );
        }

        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiError(
                'Request timed out. Image analysis is taking longer than expected. Please try again.',
                408,
                error
            );
        }

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

/**
 * Image Editing API Functions
 * Requirements: Task 2.1 - Background Editor Component API integration
 */

/**
 * Remove background from an image
 * 
 * @param request - The remove background request payload
 * @returns Promise resolving to the API response
 * @throws ApiError for network failures, timeouts, or API errors
 */
export async function removeBackground(
    request: RemoveBackgroundRequest
): Promise<RemoveBackgroundResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(`${API_BASE_URL}/api/edit/remove-background`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data: RemoveBackgroundResponse = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.error || `HTTP error ${response.status}: ${response.statusText}`,
                response.status
            );
        }

        if (!data.success) {
            throw new ApiError(
                data.error || 'Background removal failed',
                response.status
            );
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof TypeError) {
            throw new ApiError(
                'Network error. Please check your internet connection and try again.',
                undefined,
                error
            );
        }

        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiError(
                'Request timed out. Background removal is taking longer than expected. Please try again.',
                408,
                error
            );
        }

        throw new ApiError(
            'An unexpected error occurred. Please try again.',
            undefined,
            error
        );
    }
}

/**
 * Replace background of an image
 * 
 * @param request - The replace background request payload
 * @returns Promise resolving to the API response
 * @throws ApiError for network failures, timeouts, or API errors
 */
export async function replaceBackground(
    request: ReplaceBackgroundRequest
): Promise<ReplaceBackgroundResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(`${API_BASE_URL}/api/edit/replace-background`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data: ReplaceBackgroundResponse = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.error || `HTTP error ${response.status}: ${response.statusText}`,
                response.status
            );
        }

        if (!data.success) {
            throw new ApiError(
                data.error || 'Background replacement failed',
                response.status
            );
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof TypeError) {
            throw new ApiError(
                'Network error. Please check your internet connection and try again.',
                undefined,
                error
            );
        }

        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiError(
                'Request timed out. Background replacement is taking longer than expected. Please try again.',
                408,
                error
            );
        }

        throw new ApiError(
            'An unexpected error occurred. Please try again.',
            undefined,
            error
        );
    }
}

/**
 * Blur background of an image
 * 
 * @param request - The blur background request payload
 * @returns Promise resolving to the API response
 * @throws ApiError for network failures, timeouts, or API errors
 */
export async function blurBackground(
    request: BlurBackgroundRequest
): Promise<BlurBackgroundResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(`${API_BASE_URL}/api/edit/blur-background`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data: BlurBackgroundResponse = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.error || `HTTP error ${response.status}: ${response.statusText}`,
                response.status
            );
        }

        if (!data.success) {
            throw new ApiError(
                data.error || 'Background blur failed',
                response.status
            );
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof TypeError) {
            throw new ApiError(
                'Network error. Please check your internet connection and try again.',
                undefined,
                error
            );
        }

        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiError(
                'Request timed out. Background blur is taking longer than expected. Please try again.',
                408,
                error
            );
        }

        throw new ApiError(
            'An unexpected error occurred. Please try again.',
            undefined,
            error
        );
    }
}

/**
 * Generative fill for masked regions of an image
 * 
 * @param request - The generative fill request payload
 * @returns Promise resolving to the API response
 * @throws ApiError for network failures, timeouts, or API errors
 */
export async function generativeFill(
    request: GenerativeFillRequest
): Promise<GenerativeFillResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(`${API_BASE_URL}/api/edit/generative-fill`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data: GenerativeFillResponse = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.error || `HTTP error ${response.status}: ${response.statusText}`,
                response.status
            );
        }

        if (!data.success) {
            throw new ApiError(
                data.error || 'Generative fill failed',
                response.status
            );
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof TypeError) {
            throw new ApiError(
                'Network error. Please check your internet connection and try again.',
                undefined,
                error
            );
        }

        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiError(
                'Request timed out. Generative fill is taking longer than expected. Please try again.',
                408,
                error
            );
        }

        throw new ApiError(
            'An unexpected error occurred. Please try again.',
            undefined,
            error
        );
    }
}

/**
 * Enhance image quality
 * 
 * @param request - The enhance image request payload
 * @returns Promise resolving to the API response
 * @throws ApiError for network failures, timeouts, or API errors
 */
export async function enhanceImage(
    request: EnhanceImageRequest
): Promise<EnhanceImageResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(`${API_BASE_URL}/api/edit/enhance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data: EnhanceImageResponse = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.error || `HTTP error ${response.status}: ${response.statusText}`,
                response.status
            );
        }

        if (!data.success) {
            throw new ApiError(
                data.error || 'Image enhancement failed',
                response.status
            );
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof TypeError) {
            throw new ApiError(
                'Network error. Please check your internet connection and try again.',
                undefined,
                error
            );
        }

        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiError(
                'Request timed out. Image enhancement is taking longer than expected. Please try again.',
                408,
                error
            );
        }

        throw new ApiError(
            'An unexpected error occurred. Please try again.',
            undefined,
            error
        );
    }
}

/**
 * Upscale image resolution
 * 
 * @param request - The upscale image request payload
 * @returns Promise resolving to the API response
 * @throws ApiError for network failures, timeouts, or API errors
 */
export async function upscaleImage(
    request: UpscaleImageRequest
): Promise<UpscaleImageResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(`${API_BASE_URL}/api/edit/upscale`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data: UpscaleImageResponse = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.error || `HTTP error ${response.status}: ${response.statusText}`,
                response.status
            );
        }

        if (!data.success) {
            throw new ApiError(
                data.error || 'Image upscaling failed',
                response.status
            );
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof TypeError) {
            throw new ApiError(
                'Network error. Please check your internet connection and try again.',
                undefined,
                error
            );
        }

        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiError(
                'Request timed out. Image upscaling is taking longer than expected. Please try again.',
                408,
                error
            );
        }

        throw new ApiError(
            'An unexpected error occurred. Please try again.',
            undefined,
            error
        );
    }
}

/**
 * Expand image canvas to new dimensions
 * 
 * @param request - The expand image request payload
 * @returns Promise resolving to the API response
 * @throws ApiError for network failures, timeouts, or API errors
 */
export async function expandImage(
    request: ExpandImageRequest
): Promise<ExpandImageResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(`${API_BASE_URL}/api/edit/expand`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data: ExpandImageResponse = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.error || `HTTP error ${response.status}: ${response.statusText}`,
                response.status
            );
        }

        if (!data.success) {
            throw new ApiError(
                data.error || 'Canvas expansion failed',
                response.status
            );
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof TypeError) {
            throw new ApiError(
                'Network error. Please check your internet connection and try again.',
                undefined,
                error
            );
        }

        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiError(
                'Request timed out. Canvas expansion is taking longer than expected. Please try again.',
                408,
                error
            );
        }

        throw new ApiError(
            'An unexpected error occurred. Please try again.',
            undefined,
            error
        );
    }
}
