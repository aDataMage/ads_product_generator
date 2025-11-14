# Implementation Plan: Pro Mode - Structured Prompt Builder

## Overview

This implementation plan breaks down the Pro Mode feature into discrete, manageable coding tasks. Each task builds incrementally on previous work, ensuring a systematic approach to implementing both the frontend "Control Panel" and backend "Direct Line" components.

## Task List

- [x] 1. Set up TypeScript types and interfaces for Pro Mode

  - Create TypeScript interfaces for StructuredPrompt, LightingConfig, AestheticsConfig, CameraConfig, and ObjectDefinition in `elegant-flow-ui/src/lib/types.ts`
  - Define ProModeGenerateRequest and ProModeGenerateResponse interfaces
  - Ensure all types match the backend API contract
  - _Requirements: 1.1, 1.4, 7.1_

- [x] 2. Implement Pro Mode API client function

  - Add `generateProMode()` function to `elegant-flow-ui/src/lib/api.ts`

  - Implement POST request to `/api/generate/pro` endpoint
  - Add timeout handling (120 seconds)
  - Implement error handling with ApiError class
  - _Requirements: 7.3, 7.4, 8.1, 8.2_

- [x] 3. Create SceneStyleSection component

  - [x] 3.1 Implement SceneStyleSection component structure

    - Create `elegant-flow-ui/src/components/pro-mode/SceneStyleSection.tsx`
    - Add props interface with values and onChange handler
    - Implement component layout with proper spacing
    - _Requirements: 2.1, 2.2, 2.5_
  
  - [x] 3.2 Add form inputs for Scene & Style fields

    - Add Textarea for short_description (min 3 rows)
    - Add Textarea for background_setting (min 3 rows)
    - Add Input for style_medium
    - Add Input for artistic_style
    - Add Textarea for context (min 2 rows)
    - Wire up onChange handlers for each field
    - _Requirements: 2.1, 2.2, 2.5_

- [x] 4. Create LightingSection component

  - [x] 4.1 Implement LightingSection component structure

    - Create `elegant-flow-ui/src/components/pro-mode/LightingSection.tsx`
    - Add props interface with nested lighting values
    - Implement component layout
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 4.2 Add form inputs for Lighting fields

    - Add Input for lighting.conditions
    - Add Input for lighting.direction
    - Add Input for lighting.shadows
    - Wire up onChange handlers
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 5. Create AestheticsSection component

  - [x] 5.1 Implement AestheticsSection component structure

    - Create `elegant-flow-ui/src/components/pro-mode/AestheticsSection.tsx`
    - Add props interface with nested aesthetics values
    - Implement component layout
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 5.2 Add form inputs for Aesthetics fields

    - Add Input for aesthetics.composition
    - Add Input for aesthetics.color_scheme
    - Add Input for aesthetics.mood_atmosphere
    - Wire up onChange handlers
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 6. Create CameraSection component

  - [x] 6.1 Implement CameraSection component structure

    - Create `elegant-flow-ui/src/components/pro-mode/CameraSection.tsx`
    - Add props interface with nested camera values

    - Implement component layout
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 6.2 Add form inputs for Camera fields

    - Add Input for photographic_characteristics.camera_angle
    - Add Input for photographic_characteristics.lens_focal_length
    - Add Input for photographic_characteristics.depth_of_field
    - Add Input for photographic_characteristics.focus
    - Wire up onChange handlers
    - _Requirements: 5.1, 5.2, 5.3_
-

- [-] 7. Create ObjectCard component

  - [x] 7.1 Implement ObjectCard component structure

    - Create `elegant-flow-ui/src/components/pro-mode/ObjectCard.tsx`
    - Add props interface with object, index, onChange, and onRemove
    - Implement Card layout with header and remove button
    - _Requirements: 6.1, 6.5, 6.6, 6.7_
  - [ ] 7.2 Add form inputs for Object fields

  - [ ] 7.2 Add form inputs for Object fields

    - Add Textarea for description (min 3 rows)
    - Add Input for location
    - Add Input for relationship
    - Add Input for relative_size
    - Add Input for shape_and_color
    - Add Input for texture
    - Add Textarea for appearance_details (min 2 rows)
    - Wire up onChange handlers for each field
    - Implement remove button functionality
    - _Requirements: 6.1, 6.5, 6.6, 6.7_
-

- [x] 8. Create ObjectBuilderSection component

  - [x] 8.1 Implement ObjectBuilderSection component structure

    - Create `elegant-flow-ui/src/components/pro-mode/ObjectBuilderSection.tsx`
    - Add props interface with objects array and handlers
    - Implement layout with "Add New Object" button
    - _Requirements: 6.1, 6.2, 6.3, 6.8_
  
  - [x] 8.2 Implement object list rendering and management

    - Render ObjectCard components for each object in array
    - Implement "Add New Object" button with UUID generation
    - Wire up onAddObject, onRemoveObject, and onObjectChange handlers
    - Ensure proper React keys using object IDs
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.8_

- [ ] 9. Create ProModeForm main container component

  - [x] 9.1 Implement ProModeForm component structure and state

    - Create `elegant-flow-ui/src/components/ProModeForm.tsx`
    - Initialize StructuredPrompt state with empty values
    - Initialize isLoading, generatedImageUrl, and error state
    - Set up state management for nested objects
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 9.2 Implement state update handlers

    - Create handleFieldChange for top-level string fields
    - Create handleLightingChange for lighting nested object
    - Create handleAestheticsChange for aesthetics nested object
    - Create handleCameraChange for photographic_characteristics nested object
    - Create handleAddObject with UUID generation
    - Create handleRemoveObject for array manipulation
    - Create handleObjectFieldChange for updating specific object properties
    - _Requirements: 1.4, 6.3, 6.4, 6.7_
  
  - [x] 9.3 Implement form submission logic

    - Create handleGenerate function
    - Generate random seed using Math.floor(Math.random() * 1000000)
    - Remove client-side 'id' field from objects before API call
    - Construct payload with structured_prompt and seed
    - Call generateProMode API function
    - Handle loading state during API call
    - Handle success response and update generatedImageUrl
    - Handle error response and update error state
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_
  
  - [x] 9.4 Implement accordion layout with all sections

    - Add shadcn/ui Accordion component
    - Create accordion items for Scene & Style, Lighting, Aesthetics, Camera, and Object Builder
    - Render SceneStyleSection in first accordion item
    - Render LightingSection in second accordion item
    - Render AestheticsSection in third accordion item
    - Render CameraSection in fourth accordion item
    - Render ObjectBuilderSection in fifth accordion item
    - Set "Scene & Style" as default open section
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 9.5 Add Generate button and results display

    - Add "Generate Image" button at bottom of form
    - Disable button during loading state
    - Display loading spinner and message during generation
    - Display generated image when successful
    - Display error message when generation fails
    - _Requirements: 1.5, 7.1, 8.1, 8.2, 8.3, 8.4, 8.5_
- [ ] 10. Implement backend validation helper function

- [ ] 10. Implement backend validation helper function

  - Create validate_pro_mode_request() function in `api_server.py`
  - Validate presence of structured_prompt and seed fields
  - Validate all top-level string fields (short_description, background_setting, etc.)
  - Validate nested lighting object and its fields
  - Validate nested aesthetics object and its fields
  - Validate nested photographic_characteristics object and its fields
  - Validate objects array structure
  - Validate each object in objects array has all required fields
  - Return tuple of (is_valid, error_message)
  - _Requirements: 7.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 11. Implement Pro Mode Bria caller function in workflow module

  - Create call_bria_with_structured_prompt() function in `workflow.py`
  - Accept prompt_json_string and seed as parameters
  - Build Bria API payload with prompt as JSON string and seed
  - Make POST request to Bria API endpoint
  - Handle 202 response and extract status_url
  - Call existing poll_for_result() function to wait for completion
  - Extract and return image_url from result

  - Implement error handling for timeouts and API failures
  - Add comprehensive logging for Pro Mode workflow
  - _Requirements: 7.6, 9.6, 9.9_
-

- [x] 12. Implement /api/generate/pro endpoint in Flask server

  - [x] 12.1 Create new route handler in api_server.py

    - Add @app.route('/api/generate/pro', methods=['POST']) decorator
    - Implement generate_pro_mode() function
    - Parse incoming JSON request body
    - _Requirements: 9.1, 9.2_
  
  - [x] 12.2 Add request validation and processing

    - Call validate_pro_mode_request() to validate payload
    - Return 400 error if validation fails
    - Extract structured_prompt and seed from request
    - Convert structured_prompt to JSON string using json.dumps()
    - Log Pro Mode request details
    - _Requirements: 7.5, 9.3, 9.4, 9.5_
  
  - [x] 12.3 Implement Bria API call and response handling

    - Handle successful generation and return 200 with image_url

d seed
    - Handle successful generation and return 200 with image_url
    - Handle Bria API failures and return 500 with error message
    - Implement comprehensive error handling for unexpected errors
    - Add request ID logging for debugging

    - _Requirements: 7.6, 7.7, 7.8, 7.9, 9.6, 9.9_
-

- [x] 13. Add CORS configuration for Pro Mode endpoint

  - Verify CORS middleware includes /api/generate/pro endpoint
  - Test preflight OPTIONS requests
  - Ensure CORS headers are present in responses
  - _Requirements: 9.5_
- [ ] 14. Integrate Pro Mode into main application

- [ ] 14. Integrate Pro Mode into main application

  - [x] 14.1 Add Pro Mode route to application

    - Add route configuration for /pro-mode path
    - Lazy load ProModeForm component for code splitting
    - Add navigation link to Pro Mode from main app
    - _Requirements: 1.1_
  
  - [x] 14.2 Add Pro Mode navigation and UI integration

    - Add "Pro Mode" button or link in main app header

    - Implement navigation between standard mode and Pro Mode

  - Ensure consistent styling with existing app
  - _Requirements: 1.1_
- [x] 15. Implement accessibility features for Pro Mode

- [ ] 15. Implement accessibility features for Pro Mode

  - Add ARIA labels to all form inputs

  - Implement keyboard navigation for accordion sections

  - Add ARIA live regions for loading and error states
  - Ensure focus management for add/remove object buttons
  - _Rdqurremenes:n10.1, 10.2, 10.3, 10.4,n10.5_
r dynamic content
  - Test with keyboard-only navigation
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
-

- [x] 16. Implement responsive design for Pro Mode

  - Apply Tailwind responsive utilities for all breakpoints
  - Test two-column layout on desktop (≥1024px)
  - Test single-column layout on tablet (768px-1023px)
  - Test single-column layout on mobile (<768px)
  - Ensure touch targets are minimum 44px on mobile
  - Verify accordion sections work well on small screens
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
-

- [x] 17. Add comprehensive error handling and user feedback

  - Implement inline validation error messages for empty fields
  - Add network error handling with user-friendly messages
  - Display API error messages from backend
  - Add retry functionality for failed generations
  - Implement timeout handling with clear messaging
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
-

- [x] 18. Create unit tests for Pro Mode components

  - [x] 18.1 Write tests for section components

    - Test SceneStyleSection input changes and state updates
    - Test LightingSection nested object updates
    - Test AestheticsSection nested object upd
ates
    - Test CameraSection nested object updates
    - _Requirements: 2.5, 3.3, 4.3, 5.3_
  
  - [x] 18.2 Write tests for object management components

    - Test ObjectCard field changes and removal
    - Test ObjectBuilderSection add/remove object functionality
    - Test object array state management
    - _Requirements: 6.3, 6.4, 6.7, 6.8_

  - [x] 18.3 Write tests for ProModeForm

    - Test state initialization
    - Test nested state updates
    - Test seed generation
    - Test payload construction
    - Test API call integration

    - _Requirements: 1.4, 7.1, 7.2, 7.3_
- [x] 19. Create integration tests for Pro Mode workflow

- [ ] 19. Create integration tests for Pro Mode workflow

  - [x] 19.1 Write frontend integration tests

    - Test complete form fill and submission flow
    - Test successful image generation display
    - Test error handling and display
    - Test object add/remove/edit workflow
    - _Requirements: 7.1, 7.8, 7.9, 8.4, 8.5_
  
  - [x] 19.2 Write backend integration tests

    - Test /api/generate/pro endpoint with valid payload
    - Test validation error responses
    - Test Bria API integration
    - Test error handling for API failures
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 20. Perform accessibility audit and testing

  - Run automated accessibility tests (axe, WAVE)
  - Test with screen readers (NVDA, JAWS, VoiceOver)
  - Verify keyboard navigation works throughout
  - Check color contrast ratios
  - Test with browser zoom at 200%
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
-

- [x] 21. Create documentation for Pro Mode

  - [x] 21.1 Write user documentation

    - Document Pro Mode interface and controls
    - Provide examples of structured prompts
    - Explain each section and field purpose
    - Add tips for effective prompt construction
  
  - [x] 21.2 Write developer documentation

    - Document API endpoint specification
    - Explain structured prompt JSON format
    - Document component architecture
    - Add code examples for extending Pro Mode

## Notes

- All tasks are required for comprehensive Pro Mode implementation
- Each task should be completed and tested before moving to the next
- The implementation follows a bottom-up approach: types → API client → components → integration
- Backend tasks (10-13) can be developed in parallel with frontend tasks (3-9)
- Accessibility (15) and responsive design (16) should be implemented alongside component development
