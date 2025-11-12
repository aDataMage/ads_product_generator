# Requirements Document

## Introduction

This document specifies the requirements for a React-based web application that provides a user interface for generating styled product images. The application will interact with a backend API server to orchestrate the two-stage AI workflow (Gemini prompt engineering + Bria image generation) and display results to users.

## Glossary

- **UI Application**: The React-based frontend web application
- **GenerationForm Component**: The main form component that collects user inputs
- **ResultDisplay Component**: The component that displays generated images or error messages
- **Backend API**: The HTTP REST API server running at <http://localhost:5000>
- **User Prompt**: A simple text description of the desired product image
- **Preset**: A predefined style configuration (e.g., "bright_clean", "luxury_reflection")
- **Reference Image**: An optional product image file uploaded by the user for image-to-image generation
- **Base64 String**: An encoded representation of the reference image for API transmission
- **Final Image URL**: The URL or data URI of the generated product image returned by the backend

## Requirements

### Requirement 1

**User Story:** As a user, I want to enter a text description of my desired product image, so that the system can generate an image matching my vision

#### Acceptance Criteria

1. THE UI Application SHALL provide a text input field for the user prompt
2. WHEN the user types into the text input field, THE UI Application SHALL update the user prompt state value
3. THE UI Application SHALL allow user prompts of at least 500 characters in length
4. THE UI Application SHALL display the current character count or provide visual feedback for the input field

### Requirement 2

**User Story:** As a user, I want to select from predefined style presets, so that I can apply professional photography styles to my generated images

#### Acceptance Criteria

1. THE UI Application SHALL display a preset selector component with all available preset options
2. THE UI Application SHALL support selection of exactly one preset at a time
3. WHEN the user selects a preset, THE UI Application SHALL update the selected preset state value
4. THE UI Application SHALL display preset names in a user-friendly format (e.g., "Bright Clean" instead of "preset_bright_clean.json")
5. THE UI Application SHALL provide at least 5 preset options to the user

### Requirement 3

**User Story:** As a user, I want to optionally upload a reference product image, so that the system can preserve my product's appearance while applying the selected style

#### Acceptance Criteria

1. THE UI Application SHALL provide a file upload component for the reference image
2. WHEN the user selects an image file, THE UI Application SHALL convert the image to a base64 string
3. THE UI Application SHALL accept common image formats including PNG, JPEG, and JPG
4. THE UI Application SHALL store the base64 string in the component state
5. THE UI Application SHALL display a preview or filename of the uploaded reference image
6. THE UI Application SHALL allow the user to proceed without uploading a reference image

### Requirement 4

**User Story:** As a user, I want to submit my inputs and trigger image generation, so that I can receive a styled product image

#### Acceptance Criteria

1. THE UI Application SHALL provide a "Generate" button in the GenerationForm Component
2. WHEN the user clicks the "Generate" button, THE UI Application SHALL validate that a user prompt is provided
3. WHEN the user clicks the "Generate" button, THE UI Application SHALL validate that a preset is selected
4. WHEN the "Generate" button is clicked with valid inputs, THE UI Application SHALL send an HTTP POST request to <http://localhost:5000/api/generate>
5. THE UI Application SHALL include user_prompt, preset_name, and reference_image (if provided) in the request payload
6. WHEN the request is in progress, THE UI Application SHALL display a loading spinner or indicator
7. WHEN the request is in progress, THE UI Application SHALL disable the "Generate" button to prevent duplicate submissions

### Requirement 5

**User Story:** As a user, I want to see the generated product image when generation succeeds, so that I can view and use the result

#### Acceptance Criteria

1. WHEN the backend API returns a successful response, THE UI Application SHALL extract the final image URL from the response
2. WHEN a final image URL is received, THE UI Application SHALL display the image in the ResultDisplay Component
3. THE UI Application SHALL render the image at an appropriate size for viewing
4. THE UI Application SHALL provide a way to download or save the generated image
5. WHEN a new generation request is submitted, THE UI Application SHALL clear the previous result before showing the loading state

### Requirement 6

**User Story:** As a user, I want to see clear error messages when generation fails, so that I can understand what went wrong and take corrective action

#### Acceptance Criteria

1. WHEN the backend API returns an error response, THE UI Application SHALL extract the error message from the response
2. WHEN an error occurs, THE UI Application SHALL display the error message in the ResultDisplay Component
3. THE UI Application SHALL distinguish between network errors and API errors in the displayed message
4. WHEN an error is displayed, THE UI Application SHALL allow the user to retry the generation
5. THE UI Application SHALL clear error messages when a new generation request is submitted

### Requirement 7

**User Story:** As a user, I want the application to manage loading states properly, so that I have clear feedback about the system's status

#### Acceptance Criteria

1. THE UI Application SHALL maintain an isLoading state variable in the GenerationForm Component
2. WHEN a generation request starts, THE UI Application SHALL set isLoading to true
3. WHEN a generation request completes (success or failure), THE UI Application SHALL set isLoading to false
4. WHILE isLoading is true, THE UI Application SHALL display a loading spinner or progress indicator
5. WHILE isLoading is true, THE UI Application SHALL disable all form inputs to prevent modifications during processing

### Requirement 8

**User Story:** As a developer, I want the application to use axios for HTTP requests, so that we have a robust and well-supported HTTP client

#### Acceptance Criteria

1. THE UI Application SHALL use the axios library for all HTTP requests to the backend API
2. THE UI Application SHALL configure axios with appropriate timeout values
3. THE UI Application SHALL handle axios errors and convert them to user-friendly messages
4. THE UI Application SHALL send requests with the correct Content-Type header for JSON payloads
