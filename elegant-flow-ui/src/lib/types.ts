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

/**
 * Pro Mode Types
 * Requirements 1.1, 1.4, 7.1: Pro Mode structured prompt interfaces
 */

/**
 * Lighting configuration for Pro Mode
 * Requirement 3.1, 3.2, 3.3: Lighting parameters
 */
export interface LightingConfig {
    conditions: string;
    direction: string;
    shadows: string;
}

/**
 * Aesthetics configuration for Pro Mode
 * Requirement 4.1, 4.2, 4.3: Aesthetic parameters
 */
export interface AestheticsConfig {
    composition: string;
    color_scheme: string;
    mood_atmosphere: string;
}

/**
 * Camera/Photographic characteristics configuration for Pro Mode
 * Requirement 5.1, 5.2, 5.3: Camera parameters
 */
export interface CameraConfig {
    camera_angle: string;
    lens_focal_length: string;
    depth_of_field: string;
    focus: string;
}

/**
 * Object definition for Pro Mode Object Builder
 * Requirement 6.1, 6.5, 6.6, 6.7: Object properties
 */
export interface ObjectDefinition {
    id: string; // Client-side only (UUID for React key management), not sent to API
    description: string;
    location: string;
    relationship: string;
    relative_size: string;
    shape_and_color: string;
    texture: string;
    appearance_details: string;
}

/**
 * Complete structured prompt for Pro Mode
 * Requirement 1.1, 1.4: Structured prompt with all sections
 */
export interface StructuredPrompt {
    short_description: string;
    background_setting: string;
    style_medium: string;
    artistic_style: string;
    context: string;
    lighting: LightingConfig;
    aesthetics: AestheticsConfig;
    photographic_characteristics: CameraConfig;
    objects: ObjectDefinition[];
}

/**
 * Pro Mode API Request interface
 * Requirement 7.1, 7.2, 7.3, 7.4: Pro Mode generation request
 * Note: The 'id' field is removed from objects before sending to API
 */
export interface ProModeGenerateRequest {
    structured_prompt: Omit<StructuredPrompt, 'objects'> & {
        objects: Omit<ObjectDefinition, 'id'>[];
    };
    seed: number;
}

/**
 * Pro Mode API Response interface
 * Requirement 7.8, 7.9, 8.1, 8.2: Pro Mode generation response
 */
export interface ProModeGenerateResponse {
    success: boolean;
    final_image_url?: string;
    error?: string;
}

/**
 * Image Editing Types
 * Requirements: Task 2.1 - Background Editor Component API integration
 */

/**
 * Remove Background API Request
 */
export interface RemoveBackgroundRequest {
    image: string; // URL or base64
}

/**
 * Remove Background API Response
 */
export interface RemoveBackgroundResponse {
    success: boolean;
    result_url?: string;
    original_url?: string;
    error?: string;
}

/**
 * Replace Background API Request
 */
export interface ReplaceBackgroundRequest {
    image: string; // URL or base64
    background_prompt?: string;
    background_color?: string;
}

/**
 * Replace Background API Response
 */
export interface ReplaceBackgroundResponse {
    success: boolean;
    result_url?: string;
    error?: string;
}

/**
 * Blur Background API Request
 */
export interface BlurBackgroundRequest {
    image: string; // URL or base64
    blur_strength: number; // 0-100
}

/**
 * Blur Background API Response
 */
export interface BlurBackgroundResponse {
    success: boolean;
    result_url?: string;
    error?: string;
}

/**
 * Generative Fill API Request
 */
export interface GenerativeFillRequest {
    image: string; // URL or base64
    mask: string; // URL or base64 mask
    prompt: string;
    negative_prompt?: string;
    version?: number; // 1 or 2, default: 2
}

/**
 * Generative Fill API Response
 */
export interface GenerativeFillResponse {
    success: boolean;
    result_url?: string;
    refined_prompt?: string; // Only in version 2
    error?: string;
}

/**
 * Enhance Image API Request
 */
export interface EnhanceImageRequest {
    image: string; // URL or base64
}

/**
 * Enhance Image API Response
 */
export interface EnhanceImageResponse {
    success: boolean;
    result_url?: string;
    file_size_bytes?: number;
    error?: string;
}

/**
 * Upscale Image API Request
 */
export interface UpscaleImageRequest {
    image: string; // URL or base64
    scale_factor: number; // 2 or 4
}

/**
 * Upscale Image API Response
 */
export interface UpscaleImageResponse {
    success: boolean;
    result_url?: string;
    file_size_bytes?: number;
    error?: string;
}

/**
 * Expand Image API Request
 */
export interface ExpandImageRequest {
    image: string; // URL or base64
    target_width: number;
    target_height: number;
    prompt?: string; // Optional prompt for expansion context
}

/**
 * Expand Image API Response
 */
export interface ExpandImageResponse {
    success: boolean;
    result_url?: string;
    error?: string;
}

/**
 * Edit History Types
 * Requirements: Task 6.2 - Editing State Management
 */

/**
 * Edit operation type
 */
export type EditOperationType =
    | 'remove-bg'
    | 'replace-bg'
    | 'blur-bg'
    | 'gen-fill'
    | 'expand'
    | 'enhance'
    | 'upscale';

/**
 * Edit operation interface
 */
export interface EditOperation {
    type: EditOperationType;
    params: Record<string, any>;
    resultUrl: string;
    timestamp: number;
}
