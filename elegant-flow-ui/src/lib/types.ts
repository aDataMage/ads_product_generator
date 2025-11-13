/**
 * TypeScript interfaces and types for the Elegant Flow UI
 * Requirement 14.5: Use TypeScript interfaces for all API request and response types
 */

/**
 * API Request interface for image generation
 * Requirement 14.2: Include user_prompt, preset_name, and optional reference_image_base64
 */
export interface GenerateImageRequest {
    user_prompt: string;
    preset_name: string;
    reference_image_base64?: string;
}

/**
 * API Response interface for image generation
 * Requirement 14.3: Handle API responses with success and final_image_url or error fields
 */
export interface GenerateImageResponse {
    success: boolean;
    final_image_url?: string;
    error?: string;
}

/**
 * Style Preset interface
 * Requirement 4.3: Display all 10 available style presets with clear labels
 */
export interface StylePreset {
    value: string;
    label: string;
    description?: string;
}

/**
 * Form State interface
 * Tracks user input values for the generation form
 */
export interface FormState {
    userPrompt: string;
    selectedPreset: string | null;
    referenceImage: string | null; // base64 encoded image
}

/**
 * Validation Errors interface
 * Tracks validation errors for each form field
 * Requirements 3.4, 4.4, 5.2: Display validation errors for inputs
 */
export interface ValidationErrors {
    userPrompt?: string;
    selectedPreset?: string;
    referenceImage?: string;
}

/**
 * Application State interface
 * Complete state for the entire application
 * Requirements 2.4, 6.3, 7.1: Maintain state without page reloads
 */
export interface AppState extends FormState {
    isLoading: boolean;
    generatedImageUrl: string | null;
    error: string | null;
}
