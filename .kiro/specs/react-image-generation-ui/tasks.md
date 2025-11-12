# Implementation Plan

- [x] 1. Set up React project structure and dependencies

  - Initialize React project using Vite with React template
  - Install axios for HTTP requests
  - Create directory structure: src/components, src/services, src/styles
  - Configure project with necessary build settings
  - _Requirements: 8.1_

- [x] 2. Create API service module

  - [x] 2.1 Implement axios client configuration

    - Create src/services/api.js file
    - Configure axios instance with base URL (<http://localhost:5000>)
    - Set timeout to 120000ms (2 minutes) for long-running requests
    - Configure default headers with Content-Type: application/json
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [x] 2.2 Implement generateImage API method

    - Write generateImage function that accepts payload object
    - Construct POST request to /api/generate endpoint
    - Return response data on success
    - _Requirements: 4.4, 4.5_
  
  - [x] 2.3 Implement error handling utilities

    - Create error handler for network errors with user-friendly message
    - Create error handler for timeout errors with appropriate message
    - Create error handler for API errors that extracts error from response
    - Create fallback handler for unknown errors
    - _Requirements: 6.1, 6.3, 8.3_

- [x] 3. Create PresetSelector component

  - [x] 3.1 Implement preset data structure

    - Create constants file with PRESETS array
    - Map all 10 preset filenames to user-friendly labels
    - Include: bright_clean, luxury_reflection, minimalist_shadow, natural_warm, vibrant_pop, detail_macro, editorial_dark, flat_lay, hero_shot, lifestyle_context
    - _Requirements: 2.4, 2.5_
  
  - [x] 3.2 Build PresetSelector component UI

    - Create src/components/PresetSelector.jsx
    - Implement component with presets, selectedPreset, onChange, and disabled props
    - Render preset options as button group or dropdown
    - Apply visual styling to show selected state
    - Handle onChange callback when user selects preset
    - Disable all options when disabled prop is true
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 4. Create FileUploader component

  - [x] 4.1 Implement file selection and validation

    - Create src/components/FileUploader.jsx
    - Add file input with accept="image/png,image/jpeg,image/jpg"
    - Implement handleFileSelect to validate file type
    - Store fileName and previewURL in component state
    - _Requirements: 3.1, 3.3_
  
  - [x] 4.2 Implement base64 conversion

    - Write convertToBase64 function using FileReader API
    - Handle FileReader onload event to get base64 result
    - Handle FileReader onerror event
    - Call onImageUpload callback with base64 string
    - _Requirements: 3.2, 3.4_
  
  - [x] 4.3 Add preview and clear functionality

    - Display preview thumbnail or filename when image is uploaded
    - Add clear/remove button to reset uploaded image
    - Update parent component when image is cleared
    - _Requirements: 3.5_

- [x] 5. Create ResultDisplay component

  - [x] 5.1 Implement display states

    - Create src/components/ResultDisplay.jsx
    - Accept imageURL, errorMessage, and isLoading props
    - Render idle state (empty) when no props are set
    - Render loading spinner with "Generating your image..." message when isLoading is true
    - Render generated image when imageURL is provided
    - Render error message when errorMessage is provided
    - _Requirements: 5.2, 5.3, 6.2, 7.4_
  
  - [x] 5.2 Add download functionality

    - Create download button that appears when imageURL is available
    - Implement download handler that triggers image download
    - Set appropriate filename for downloaded image
    - _Requirements: 5.4_

- [x] 6. Create GenerationForm component

  - [x] 6.1 Set up component state and structure

    - Create src/components/GenerationForm.jsx
    - Initialize state: userPrompt, selectedPreset, referenceImage, isLoading, validationErrors
    - Accept onSuccess and onError callback props
    - _Requirements: 7.1_
  
  - [x] 6.2 Implement user prompt input

    - Add textarea for user prompt with maxLength of 500 characters
    - Implement handlePromptChange to update userPrompt state
    - Display character counter showing current/max characters
    - Disable input when isLoading is true
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.5_
  
  - [x] 6.3 Integrate PresetSelector component

    - Render PresetSelector with PRESETS data
    - Pass selectedPreset state and handlePresetChange handler
    - Pass disabled prop based on isLoading state
    - _Requirements: 2.1, 2.2, 2.3, 7.5_
  
  - [x] 6.4 Integrate FileUploader component

    - Render FileUploader component
    - Implement handleImageUpload to update referenceImage state
    - Pass disabled prop based on isLoading state
    - _Requirements: 3.1, 3.2, 3.4, 3.6, 7.5_
  
  - [x] 6.5 Implement form validation

    - Write validateForm function to check required fields
    - Validate userPrompt is not empty and at least 3 characters
    - Validate selectedPreset is not empty
    - Update validationErrors state with any errors
    - Display inline validation errors below fields
    - _Requirements: 4.2, 4.3_
  
  - [x] 6.6 Implement form submission

    - Add Generate button with onClick handler
    - Disable button when isLoading is true or form is invalid
    - Call validateForm before submission
    - Set isLoading to true when submission starts
    - Construct payload with user_prompt, preset_name, and reference_image (if present)
    - Call generateImage API method with payload
    - Handle success response by calling onSuccess with final_image_url
    - Handle error response by calling onError with error message
    - Set isLoading to false when request completes
    - Clear previous results before starting new request
    - _Requirements: 4.1, 4.4, 4.5, 4.6, 4.7, 5.1, 5.5, 6.1, 6.4, 6.5, 7.2, 7.3_

- [x] 7. Create App component and wire everything together

  - [x] 7.1 Set up App component state

    - Create src/App.jsx
    - Initialize state: finalImageURL and errorMessage
    - _Requirements: 5.1, 6.1_
  
  - [x] 7.2 Implement callback handlers

    - Write handleSuccess function to update finalImageURL and clear errorMessage
    - Write handleError function to update errorMessage and clear finalImageURL
    - _Requirements: 5.1, 5.5, 6.1, 6.5_
  
  - [x] 7.3 Render layout with components

    - Render GenerationForm with onSuccess and onError callbacks
    - Render ResultDisplay with finalImageURL, errorMessage, and isLoading props
    - Apply responsive layout styling (two-column for desktop, stacked for mobile)
    - _Requirements: All requirements integrated_

- [x] 8. Add styling and polish

  - [x] 8.1 Create component styles

    - Add CSS for GenerationForm layout and inputs
    - Add CSS for PresetSelector button group or dropdown
    - Add CSS for FileUploader with preview
    - Add CSS for ResultDisplay states (loading, success, error)
    - Add CSS for responsive layout
    - _Requirements: 1.4, 5.3, 7.4_
  
  - [x] 8.2 Implement loading spinner

    - Create or import loading spinner component
    - Style spinner with appropriate size and color
    - Add "Generating your image..." text
    - _Requirements: 4.6, 7.4_
  
  - [x] 8.3 Add accessibility features

    - Add ARIA labels to all form inputs
    - Ensure keyboard navigation works for all interactive elements
    - Add alt text for generated images
    - Implement focus management during loading states
    - _Requirements: Accessibility considerations from design_

- [ ]* 9. Create integration tests
  - Write test for complete generation flow (prompt → preset → generate → display image)
  - Write test for error handling flow (API error → display error → retry)
  - Write test for reference image flow (upload → convert → include in request → success)
  - _Requirements: All requirements validation_
