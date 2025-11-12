# Requirements Document

## Introduction

This document defines the requirements for a Backend API Server that exposes the existing 2-stage AI product image generation workflow (Gemini -> Bria) through a RESTful HTTP API. The server will enable web applications, particularly a React frontend, to generate styled product images by making HTTP requests.

## Glossary

- **API Server**: The Flask-based HTTP server that exposes image generation functionality
- **Generation Workflow**: The existing 2-call chain (Gemini translator -> Bria image engine)
- **React App**: The frontend web application running at <http://localhost:3000>
- **Preset**: A JSON configuration file defining style parameters for product photography
- **Reference Image**: An optional base64-encoded product image for image-to-image transformation

## Requirements

### Requirement 1

**User Story:** As a frontend developer, I want to send HTTP POST requests to generate product images, so that I can integrate the image generation workflow into web applications.

#### Acceptance Criteria

1. THE API Server SHALL expose a POST endpoint at the path "/api/generate"
2. THE API Server SHALL accept JSON request bodies with Content-Type "application/json"
3. THE API Server SHALL validate that the request body contains a "user_prompt" field of type string
4. THE API Server SHALL validate that the request body contains a "preset_name" field of type string
5. THE API Server SHALL accept an optional "reference_image_base64" field of type string in the request body

### Requirement 2

**User Story:** As a React application developer, I want the API server to allow cross-origin requests from my development environment, so that I can call the API from my frontend without CORS errors.

#### Acceptance Criteria

1. THE API Server SHALL enable CORS (Cross-Origin Resource Sharing) for all endpoints
2. THE API Server SHALL accept requests originating from "<http://localhost:3000>"
3. THE API Server SHALL include appropriate CORS headers in all HTTP responses
4. THE API Server SHALL handle preflight OPTIONS requests for CORS compliance

### Requirement 3

**User Story:** As a system integrator, I want the API endpoint to execute the existing Gemini-Bria workflow, so that I can reuse the proven image generation logic without code duplication.

#### Acceptance Criteria

1. WHEN the "/api/generate" endpoint receives a valid request, THE API Server SHALL invoke the Generation Workflow with the provided parameters
2. THE API Server SHALL pass the "user_prompt" value to the Generation Workflow
3. THE API Server SHALL pass the "preset_name" value to the Generation Workflow
4. IF "reference_image_base64" is provided, THEN THE API Server SHALL decode the base64 string and pass the image data to the Generation Workflow
5. THE API Server SHALL wait for the Generation Workflow to complete before sending a response

### Requirement 4

**User Story:** As a frontend developer, I want to receive structured JSON responses indicating success or failure, so that I can handle results appropriately in my application.

#### Acceptance Criteria

1. WHEN the Generation Workflow completes successfully, THE API Server SHALL return an HTTP 200 status code
2. WHEN the Generation Workflow completes successfully, THE API Server SHALL return a JSON response containing a "final_image_url" field with the Bria-generated image URL
3. IF the Generation Workflow fails, THEN THE API Server SHALL return an appropriate HTTP error status code (400 for client errors, 500 for server errors)
4. IF the Generation Workflow fails, THEN THE API Server SHALL return a JSON response containing an "error" field with a descriptive error message
5. THE API Server SHALL set the Content-Type header to "application/json" for all responses

### Requirement 5

**User Story:** As a system administrator, I want the API server to validate incoming requests, so that invalid data is rejected before processing begins.

#### Acceptance Criteria

1. IF the request body is missing the "user_prompt" field, THEN THE API Server SHALL return HTTP 400 with an error message
2. IF the request body is missing the "preset_name" field, THEN THE API Server SHALL return HTTP 400 with an error message
3. IF the "preset_name" does not correspond to an existing preset file, THEN THE API Server SHALL return HTTP 400 with an error message
4. IF the request body is not valid JSON, THEN THE API Server SHALL return HTTP 400 with an error message
5. THE API Server SHALL validate request data before invoking the Generation Workflow

### Requirement 6

**User Story:** As a developer, I want the API server to be built with Flask, so that it integrates well with the existing Python codebase and ecosystem.

#### Acceptance Criteria

1. THE API Server SHALL be implemented using the Flask web framework
2. THE API Server SHALL use Flask-CORS extension for CORS functionality
3. THE API Server SHALL be runnable as a standalone Python application
4. THE API Server SHALL listen on a configurable host and port (default: localhost:5000)
5. THE API Server SHALL log incoming requests and responses for debugging purposes
