# Requirements Document

## Introduction

The Pro Mode - Structured Prompt Builder feature provides advanced users with granular control over image generation by allowing them to directly construct structured prompts through an elegant, form-based interface. This feature bypasses the Gemini translation layer and sends fully-formed structured prompts directly to the Bria API, giving professional users complete control over every aspect of the generated image.

## Glossary

- **Pro Mode**: An advanced interface mode that provides granular control over image generation parameters
- **Structured Prompt**: A JSON object containing detailed specifications for image generation including scene, lighting, aesthetics, camera settings, and object definitions
- **Object Builder**: A dynamic form component that allows users to define multiple objects with detailed properties
- **Frontend Application**: The React-based user interface built with shadcn/ui and Tailwind CSS
- **Backend API**: The Flask server that processes Pro Mode requests and communicates with the Bria API
- **Bria API**: The external image generation service that creates images from structured prompts
- **Accordion Component**: A collapsible UI element from shadcn/ui that organizes form sections

## Requirements

### Requirement 1

**User Story:** As a professional user, I want to access a Pro Mode interface with granular controls, so that I can have complete control over every aspect of my generated product images.

#### Acceptance Criteria

1. WHEN the user navigates to Pro Mode, THE Frontend Application SHALL display a single-page form with collapsible accordion sections
2. THE Frontend Application SHALL organize form inputs into five distinct accordion sections: Scene & Style, Lighting, Aesthetics, Camera, and Object Builder
3. THE Frontend Application SHALL use shadcn/ui components and Tailwind CSS styling to create a clean, professional interface
4. THE Frontend Application SHALL maintain all form data in React state as a structured JSON object
5. THE Frontend Application SHALL display a primary "Generate Image" button at the bottom of the form

### Requirement 2

**User Story:** As a professional user, I want to define scene and style parameters, so that I can control the overall visual context of my generated image.

#### Acceptance Criteria

1. THE Frontend Application SHALL provide a "Scene & Style" accordion section containing five input fields
2. THE Frontend Application SHALL include a textarea input for short_description with minimum 50 characters capacity
3. THE Frontend Application SHALL include a textarea input for background_setting with minimum 100 characters capacity
4. THE Frontend Application SHALL include text inputs for style_medium, artistic_style, and context
5. WHEN the user enters data in any Scene & Style field, THE Frontend Application SHALL update the corresponding property in the structured_prompt state object

### Requirement 3

**User Story:** As a professional user, I want to specify lighting parameters, so that I can control how my product is illuminated in the generated image.

#### Acceptance Criteria

1. THE Frontend Application SHALL provide a "Lighting" accordion section containing three input fields
2. THE Frontend Application SHALL include text inputs for lighting.conditions, lighting.direction, and lighting.shadows
3. WHEN the user enters lighting data, THE Frontend Application SHALL update the lighting object within the structured_prompt state
4. THE Frontend Application SHALL organize lighting inputs as nested properties under a lighting object in the JSON structure

### Requirement 4

**User Story:** As a professional user, I want to define aesthetic parameters, so that I can control the artistic mood and visual composition of my generated image.

#### Acceptance Criteria

1. THE Frontend Application SHALL provide an "Aesthetics" accordion section containing four input fields
2. THE Frontend Application SHALL include text inputs for aesthetics.composition, aesthetics.color_scheme, and aesthetics.mood_atmosphere
3. WHEN the user enters aesthetic data, THE Frontend Application SHALL update the aesthetics object within the structured_prompt state
4. THE Frontend Application SHALL organize aesthetic inputs as nested properties under an aesthetics object in the JSON structure

### Requirement 5

**User Story:** As a professional user, I want to specify camera and photographic characteristics, so that I can control the technical aspects of how my product is photographed.

#### Acceptance Criteria

1. THE Frontend Application SHALL provide a "Camera" accordion section containing four input fields
2. THE Frontend Application SHALL include text inputs for photographic_characteristics.camera_angle, photographic_characteristics.lens_focal_length, photographic_characteristics.depth_of_field, and photographic_characteristics.focus
3. WHEN the user enters camera data, THE Frontend Application SHALL update the photographic_characteristics object within the structured_prompt state
4. THE Frontend Application SHALL organize camera inputs as nested properties under a photographic_characteristics object in the JSON structure

### Requirement 6

**User Story:** As a professional user, I want to dynamically add and configure multiple objects in my scene, so that I can build complex product compositions with precise control over each element.

#### Acceptance Criteria

1. THE Frontend Application SHALL provide an "Object Builder" accordion section with dynamic object management capabilities
2. THE Frontend Application SHALL display an "Add New Object" button that creates a new object card when clicked
3. WHEN the user clicks "Add New Object", THE Frontend Application SHALL add a new object entry to the objects array in the structured_prompt state
4. THE Frontend Application SHALL render each object as a shadcn/ui Card component containing eight input fields
5. THE Frontend Application SHALL include inputs for description (textarea), location, relationship, relative_size, shape_and_color, texture, and appearance_details (textarea) for each object
6. THE Frontend Application SHALL provide a "Remove Object" button on each object card
7. WHEN the user clicks "Remove Object", THE Frontend Application SHALL remove that object from the objects array in state
8. THE Frontend Application SHALL maintain the objects array as a property within the structured_prompt state object

### Requirement 7

**User Story:** As a professional user, I want to generate images using my structured prompt, so that I can see my precisely-defined vision rendered as a product image.

#### Acceptance Criteria

1. WHEN the user clicks the "Generate Image" button, THE Frontend Application SHALL collect all form data from all accordion sections
2. THE Frontend Application SHALL construct a complete structured_prompt JSON object including all top-level properties, nested objects, and the dynamic objects array
3. THE Frontend Application SHALL generate a random seed value and include it in the request payload
4. THE Frontend Application SHALL send a POST request to the /api/generate/pro endpoint with the structured_prompt and seed
5. WHEN the Backend API receives the request, THE Backend API SHALL validate the structured_prompt JSON structure
6. THE Backend API SHALL bypass the Gemini translation layer and send the structured_prompt directly to the Bria API
7. THE Backend API SHALL poll the Bria API for generation completion with timeout handling
8. WHEN the image generation completes, THE Backend API SHALL return a JSON response containing the final image_url
9. IF the generation fails, THE Backend API SHALL return a JSON response with success: false and an error message
10. THE Frontend Application SHALL display the generated image or error message to the user

### Requirement 8

**User Story:** As a professional user, I want clear visual feedback during image generation, so that I understand the system status and can wait appropriately for results.

#### Acceptance Criteria

1. WHEN the user clicks "Generate Image", THE Frontend Application SHALL disable the button and display a loading state
2. THE Frontend Application SHALL display a progress indicator while waiting for the Backend API response
3. WHEN the Backend API returns a response, THE Frontend Application SHALL re-enable the "Generate Image" button
4. IF the generation succeeds, THE Frontend Application SHALL display the generated image with the returned image_url
5. IF the generation fails, THE Frontend Application SHALL display the error message in a user-friendly format

### Requirement 9

**User Story:** As a developer, I want the Pro Mode endpoint to be separate from the standard generation endpoint, so that the two workflows remain independent and maintainable.

#### Acceptance Criteria

1. THE Backend API SHALL implement a new POST endpoint at /api/generate/pro
2. THE Backend API SHALL accept JSON payloads containing structured_prompt and seed properties
3. THE Backend API SHALL not invoke the Gemini API for prompt translation in the Pro Mode workflow
4. THE Backend API SHALL use the existing Bria API integration functions for image generation
5. THE Backend API SHALL implement CORS headers to allow requests from the Frontend Application origin
6. THE Backend API SHALL return JSON responses with consistent structure matching the standard /api/generate endpoint format

### Requirement 10

**User Story:** As a professional user, I want the Pro Mode interface to be accessible and responsive, so that I can use it effectively on different devices and with assistive technologies.

#### Acceptance Criteria

1. THE Frontend Application SHALL implement proper ARIA labels and roles for all form inputs and interactive elements
2. THE Frontend Application SHALL support keyboard navigation through all form fields and accordion sections
3. THE Frontend Application SHALL provide visible focus indicators for keyboard navigation
4. THE Frontend Application SHALL use semantic HTML elements for proper screen reader support
5. THE Frontend Application SHALL implement responsive design that adapts to tablet and desktop screen sizes
