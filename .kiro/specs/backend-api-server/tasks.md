# Implementation Plan

- [x] 1. Refactor existing workflow into reusable module

  - Extract the generation workflow logic from `generate_image.py` into a new `workflow.py` module
  - Create `run_generation_workflow()` function that accepts user_prompt, preset_name, and optional reference_image_base64
  - Refactor helper functions (encode_image, clean_json_response, poll_for_result) to work with base64 strings instead of file paths
  - Ensure the workflow function returns a structured dict with success/error information
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Create Flask API server with CORS support

  - [x] 2.1 Set up Flask application structure

    - Create `api_server.py` with Flask app initialization
    - Add Flask and Flask-CORS to project dependencies in `pyproject.toml`
    - Configure CORS to allow requests from <http://localhost:3000>
    - Set up basic Flask configuration (debug mode, port, host)
    - _Requirements: 6.1, 6.2, 6.4, 2.1, 2.2_
  
  - [x] 2.2 Implement request validation logic

    - Create `validate_request()` function to check for required fields
    - Validate user_prompt and preset_name are present and non-empty
    - Validate preset_name corresponds to an existing file in presets/ directory
    - Handle JSON parsing errors gracefully
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3. Implement /api/generate endpoint

  - [x] 3.1 Create POST route handler

    - Define Flask route for POST /api/generate
    - Parse incoming JSON request body
    - Call validation function and return 400 errors for invalid requests
    - Extract user_prompt, preset_name, and optional reference_image_base64 from request
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 3.2 Integrate workflow execution

    - Call `run_generation_workflow()` with extracted parameters
    - Handle workflow execution and wait for completion
    - Catch and handle exceptions from workflow execution
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 3.3 Implement response formatting

    - Return JSON response with final_image_url on success (HTTP 200)
    - Return JSON response with error message on failure (HTTP 400/500)
    - Set Content-Type header to application/json
    - Include appropriate CORS headers in response
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 2.3, 2.4_

- [x] 4. Add error handling and logging

  - Implement try-catch blocks for all error scenarios
  - Add Flask logging for incoming requests
  - Log workflow execution stages (Gemini call, Bria call)
  - Log errors with descriptive messages
  - Ensure API keys are never logged
  - _Requirements: 6.5_

- [x] 5. Create server entry point

  - Add `if __name__ == '__main__'` block to run Flask app
  - Configure Flask to run on localhost:5000 by default
  - Add command-line argument support for host and port configuration
  - _Requirements: 6.3, 6.4_

- [ ]* 6. Write integration tests
  - [ ]* 6.1 Create test file for API endpoints
    - Set up Flask test client
    - Create fixtures for test data (sample prompts, presets)
    - Mock external API calls (Gemini, Bria)
    - _Requirements: All_
  
  - [ ]* 6.2 Test successful generation scenarios
    - Test POST /api/generate with valid text-only request
    - Test POST /api/generate with valid request including reference image
    - Verify response structure and status codes
    - _Requirements: 1.1, 1.2, 3.1, 4.1, 4.2_
  
  - [ ]* 6.3 Test error scenarios
    - Test missing user_prompt field
    - Test missing preset_name field
    - Test invalid preset_name
    - Test invalid JSON body
    - Test workflow failures (mock API errors)
    - Verify error response structure and status codes
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 4.3, 4.4_
  
  - [ ]* 6.4 Test CORS functionality
    - Test OPTIONS preflight request
    - Verify CORS headers in responses
    - Test requests from allowed origin
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 7. Update project documentation

  - Add API server section to README.md with usage instructions
  - Document API endpoint specifications (request/response formats)
  - Add example curl commands for testing
  - Document required environment variables
  - Update steering rules to include Flask API server information
  - _Requirements: 6.3, 6.4_
