# Design Document: Pro Mode - Structured Prompt Builder

## Overview

The Pro Mode feature introduces a professional "cockpit-style" interface that empowers advanced users to construct detailed structured prompts with full, granular control over every aspect of image generation. This is a "single, elegant flow" that provides direct control over the Bria API.

**Critical Design Philosophy**: Pro Mode provides a "Direct Line" to Bria by completely bypassing the Gemini translation layer. Users build the structured prompt through an elegant form interface, and the backend converts it to a JSON string using `json.dumps()` and sends it directly to Bria with a seed value.

This feature consists of two main components:

1. **Frontend ("Control Panel")**: A React-based form interface built with shadcn/ui and Tailwind CSS
2. **Backend ("Direct Line")**: A new Flask API endpoint at `/api/generate/pro` that bypasses Gemini entirely

## Architecture

### High-Level Flow

```
User Input (Pro Mode Form)
    ↓
React State (Structured JSON Object)
    ↓
Generate Seed: Math.floor(Math.random() * 1000000)
    ↓
POST /api/generate/pro
    {structured_prompt: {...}, seed: 12345}
    ↓
Flask Backend (Validation)
    ↓
json.dumps(structured_prompt) → JSON String
    ↓
Bria API (Direct Call - NO GEMINI)
    {prompt: "JSON_STRING", seed: 12345}
    ↓
Poll for Result
    ↓
Return Image URL to Frontend
```

### Key Architectural Decisions

1. **Single-Page Form Design**: All controls are contained in one scrollable page with accordion sections for organization, creating a "cockpit-style" professional interface
2. **State-Driven JSON Construction**: The form maintains a live structured_prompt JSON object in React state that mirrors the final API payload
3. **Separate API Endpoint**: `/api/generate/pro` is independent from `/api/generate` to keep workflows isolated and maintainable
4. **Bypass Gemini Layer (CRITICAL)**: Pro Mode completely skips the Gemini translation step. The backend receives the structured_prompt, converts it to a JSON string using `json.dumps()`, and sends it directly to Bria
5. **Dynamic Object Management**: The Object Builder uses array state management to allow unlimited object definitions
6. **Seed-Based Generation**: Frontend generates a random seed (e.g., `Math.floor(Math.random() * 1000000)`) and includes it in the API payload

## Components and Interfaces

### Frontend Components ("Control Panel")

#### 1. ProModeForm Component (Main Container)

**Location**: `elegant-flow-ui/src/components/ProModeForm.tsx`

**Responsibilities**:

- Manage complete structured_prompt state object
- Orchestrate all child components (accordion sections)
- Handle form submission and API communication
- Generate random seed on submission
- Display loading states and results

**State Structure**:

```typescript
interface StructuredPrompt {
  short_description: string;
  background_setting: string;
  style_medium: string;
  artistic_style: string;
  context: string;
  lighting: {
    conditions: string;
    direction: string;
    shadows: string;
  };
  aesthetics: {
    composition: string;
    color_scheme: string;
    mood_atmosphere: string;
  };
  photographic_characteristics: {
    camera_angle: string;
    lens_focal_length: string;
    depth_of_field: string;
    focus: string;
  };
  objects: ObjectDefinition[];
}

interface ObjectDefinition {
  id: string; // UUID for React key management (client-side only)
  description: string;
  location: string;
  relationship: string;
  relative_size: string;
  shape_and_color: string;
  texture: string;
  appearance_details: string;
}

interface ProModeState {
  structuredPrompt: StructuredPrompt;
  isLoading: boolean;
  generatedImageUrl: string | null;
  error: string | null;
}
```

**Key Methods**:

- `handleFieldChange(path: string, value: string)`: Update nested state properties
- `handleAddObject()`: Add new object to objects array with UUID
- `handleRemoveObject(id: string)`: Remove object from array
- `handleObjectFieldChange(id: string, field: string, value: string)`: Update specific object property
- `handleGenerate()`: Generate seed, submit to API, handle response

**Submission Logic**:

```typescript
const handleGenerate = async () => {
  // Generate random seed
  const seed = Math.floor(Math.random() * 1000000);
  
  // Remove client-side 'id' field from objects before sending
  const objectsForApi = structuredPrompt.objects.map(({ id, ...rest }) => rest);
  
  // Prepare payload
  const payload = {
    structured_prompt: {
      ...structuredPrompt,
      objects: objectsForApi
    },
    seed
  };
  
  // Send to /api/generate/pro
  const response = await generateProMode(payload);
  // Handle response...
};
```

#### 2. SceneStyleSection Component

**Location**: `elegant-flow-ui/src/components/pro-mode/SceneStyleSection.tsx`

**Props**:

```typescript
interface SceneStyleSectionProps {
  values: {
    short_description: string;
    background_setting: string;
    style_medium: string;
    artistic_style: string;
    context: string;
  };
  onChange: (field: string, value: string) => void;
}
```

**UI Elements** (shadcn/ui components):

- Textarea for `short_description` (min 3 rows)
- Textarea for `background_setting` (min 3 rows)
- Input for `style_medium`
- Input for `artistic_style`
- Textarea for `context` (min 2 rows)

#### 3. LightingSection Component

**Location**: `elegant-flow-ui/src/components/pro-mode/LightingSection.tsx`

**Props**:

```typescript
interface LightingSectionProps {
  values: {
    conditions: string;
    direction: string;
    shadows: string;
  };
  onChange: (field: string, value: string) => void;
}
```

**UI Elements**:

- Input for `lighting.conditions`
- Input for `lighting.direction`
- Input for `lighting.shadows`

#### 4. AestheticsSection Component

**Location**: `elegant-flow-ui/src/components/pro-mode/AestheticsSection.tsx`

**Props**:

```typescript
interface AestheticsSectionProps {
  values: {
    composition: string;
    color_scheme: string;
    mood_atmosphere: string;
  };
  onChange: (field: string, value: string) => void;
}
```

**UI Elements**:

- Input for `aesthetics.composition`
- Input for `aesthetics.color_scheme`
- Input for `aesthetics.mood_atmosphere`

#### 5. CameraSection Component

**Location**: `elegant-flow-ui/src/components/pro-mode/CameraSection.tsx`

**Props**:

```typescript
interface CameraSectionProps {
  values: {
    camera_angle: string;
    lens_focal_length: string;
    depth_of_field: string;
    focus: string;
  };
  onChange: (field: string, value: string) => void;
}
```

**UI Elements**:

- Input for `photographic_characteristics.camera_angle`
- Input for `photographic_characteristics.lens_focal_length`
- Input for `photographic_characteristics.depth_of_field`
- Input for `photographic_characteristics.focus`

#### 6. ObjectBuilderSection Component (The "OOP" Feature)

**Location**: `elegant-flow-ui/src/components/pro-mode/ObjectBuilderSection.tsx`

**Props**:

```typescript
interface ObjectBuilderSectionProps {
  objects: ObjectDefinition[];
  onAddObject: () => void;
  onRemoveObject: (id: string) => void;
  onObjectChange: (id: string, field: string, value: string) => void;
}
```

**UI Elements**:

- "Add New Object" Button (primary action, always visible)
- List of ObjectCard components (one per object in array)

#### 7. ObjectCard Component (The "Object Instance")

**Location**: `elegant-flow-ui/src/components/pro-mode/ObjectCard.tsx`

**Props**:

```typescript
interface ObjectCardProps {
  object: ObjectDefinition;
  index: number;
  onChange: (field: string, value: string) => void;
  onRemove: () => void;
}
```

**UI Elements** (shadcn/ui Card):

- Card header with "Object {index + 1}" title and "Remove Object" button
- Textarea for `description` (min 3 rows)
- Input for `location`
- Input for `relationship`
- Input for `relative_size`
- Input for `shape_and_color`
- Input for `texture`
- Textarea for `appearance_details` (min 2 rows)

### Backend Components ("Direct Line")

#### 1. New API Endpoint: `/api/generate/pro`

**Location**: `api_server.py`

**CRITICAL REQUIREMENT**: This endpoint MUST bypass the Gemini "Translator" (Call 1). It receives the structured_prompt JSON and seed directly from the React frontend, validates the payload, converts the structured_prompt to a JSON string using `json.dumps()`, and immediately makes one call to the Bria API.

**Request Format**:

```python
{
    "structured_prompt": {
        "short_description": str,
        "background_setting": str,
        "style_medium": str,
        "artistic_style": str,
        "context": str,
        "lighting": {
            "conditions": str,
            "direction": str,
            "shadows": str
        },
        "aesthetics": {
            "composition": str,
            "color_scheme": str,
            "mood_atmosphere": str
        },
        "photographic_characteristics": {
            "camera_angle": str,
            "lens_focal_length": str,
            "depth_of_field": str,
            "focus": str
        },
        "objects": [
            {
                "description": str,
                "location": str,
                "relationship": str,
                "relative_size": str,
                "shape_and_color": str,
                "texture": str,
                "appearance_details": str
            }
        ]
    },
    "seed": int
}
```

**Response Format**:

```python
# Success (200)
{
    "success": True,
    "final_image_url": "https://..."
}

# Error (400/500)
{
    "success": False,
    "error": "Error message"
}
```

**Validation Rules**:

1. `structured_prompt` must be a dict
2. All top-level string fields must be present and non-empty
3. Nested objects (`lighting`, `aesthetics`, `photographic_characteristics`) must be dicts with required fields
4. `objects` must be a list (can be empty)
5. Each object in `objects` array must have all required string fields
6. `seed` must be an integer

**Processing Flow** (CRITICAL):

```python
@app.route('/api/generate/pro', methods=['POST'])
def generate_pro_mode():
    """
    Pro Mode endpoint - Direct Line to Bria (NO GEMINI).
    
    This endpoint bypasses the Gemini translation layer entirely.
    """
    request_id = id(request)
    
    try:
        # 1. Parse and validate request JSON
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "Invalid JSON"}), 400
        
        # 2. Validate structured_prompt structure
        is_valid, error_msg = validate_pro_mode_request(data)
        if not is_valid:
            return jsonify({"success": False, "error": error_msg}), 400
        
        structured_prompt = data['structured_prompt']
        seed = data['seed']
        
        app.logger.info(f"[Request {request_id}] Pro Mode generation with seed {seed}")
        
        # 3. CRITICAL: Convert structured_prompt to JSON string
        # This is the "Direct Line" - we send the JSON as a string to Bria
        prompt_json_string = json.dumps(structured_prompt)
        
        app.logger.info(f"[Request {request_id}] Converted structured prompt to JSON string ({len(prompt_json_string)} chars)")
        
        # 4. Call Bria API directly (NO GEMINI - this is the key difference)
        result = call_bria_with_structured_prompt(prompt_json_string, seed)
        
        # 5. Return response
        if result and result.get('image_url'):
            app.logger.info(f"[Request {request_id}] Pro Mode generation successful")
            return jsonify({
                "success": True,
                "final_image_url": result['image_url']
            }), 200
        else:
            app.logger.error(f"[Request {request_id}] Pro Mode generation failed")
            return jsonify({
                "success": False,
                "error": "Image generation failed"
            }), 500
            
    except Exception as e:
        app.logger.error(f"[Request {request_id}] Pro Mode error: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500
```

#### 2. Pro Mode Bria Caller (CRITICAL COMPONENT)

**Location**: `workflow.py` (new function)

**Function**: `call_bria_with_structured_prompt(prompt_json_string: str, seed: int) -> dict`

**Purpose**: This is the "Direct Line" to Bria. It bypasses Gemini entirely and sends the structured prompt JSON string directly to Bria.

**CRITICAL Logic**:

```python
def call_bria_with_structured_prompt(prompt_json_string: str, seed: int) -> dict:
    """
    Call Bria API directly with structured prompt JSON string (bypassing Gemini).
    
    This is the Pro Mode "Direct Line" - no translation, no Gemini.
    The structured_prompt has already been converted to a JSON string by the endpoint.
    
    Args:
        prompt_json_string: The structured prompt as a JSON string (from json.dumps())
        seed: Random seed for generation consistency
    
    Returns:
        dict with 'image_url' on success
    
    Raises:
        Exception: If Bria API call fails
    """
    try:
        logger.info("Pro Mode: Calling Bria API directly (bypassing Gemini)")
        logger.debug(f"Prompt JSON string length: {len(prompt_json_string)} characters")
        logger.debug(f"Seed: {seed}")
        
        # Build the Bria payload
        # CRITICAL: The "prompt" field contains the JSON string
        payload = {
            "prompt": prompt_json_string,
            "seed": seed
        }
        
        # Submit job to Bria (same API call as standard mode)
        logger.info("Submitting Pro Mode job to Bria API")
        response = requests.post(
            BRIA_API_ENDPOINT,
            json=payload,
            headers=BRIA_HEADERS,
            timeout=30
        )
        
        # Check response status
        if response.status_code != 202:
            error_detail = response.text[:200] if response.text else "No error details"
            logger.error(
                f"Bria API rejected Pro Mode request with status {response.status_code}: {error_detail}"
            )
            raise Exception(
                f"Bria API request failed with status code {response.status_code}"
            )
        
        response_data = response.json()
        request_id = response_data.get('request_id', 'unknown')
        status_url = response_data.get('status_url')
        
        if not status_url:
            logger.error("Bria API response missing status_url")
            raise Exception("Bria API response missing status_url")
        
        logger.info(f"Pro Mode: Bria job accepted. Request ID: {request_id}")
        
        # Poll for result (reuse existing polling logic)
        result = poll_for_result(status_url)
        
        if not result:
            logger.error("Pro Mode: Bria job completed but returned no result")
            raise Exception("Bria job failed to generate a final image")
        
        image_url = result.get('image_url')
        if not image_url:
            logger.error("Pro Mode: Bria result missing image_url")
            raise Exception("Bria result missing image_url")
        
        logger.info(f"Pro Mode: Bria successfully generated image: {image_url}")
        return result
        
    except requests.exceptions.Timeout:
        logger.error("Pro Mode: Bria API request timed out")
        raise Exception("Bria API request timed out after 30 seconds")
    except requests.exceptions.RequestException as e:
        logger.error(f"Pro Mode: Bria API request error: {str(e)}", exc_info=True)
        raise Exception(f"Bria API request failed: {str(e)}")
    except Exception as e:
        logger.error(f"Pro Mode: Bria call failed: {str(e)}", exc_info=True)
        raise
```

#### 3. Validation Helper

**Location**: `api_server.py`

**Function**: `validate_pro_mode_request(data: dict) -> tuple[bool, str]`

```python = ['short_description', 'background_setting', 'style_medium',
                      'artistic_style', 'context']
    for field in required_fields:
        if field not in sp or not isinstance(sp[field], str) or not sp[field].strip():
            return False, f"Missing or invalid field: {field}"
    
    # Validate nested objects
    if 'lighting' not in sp or not isinstance(sp['lighting'], dict):
        return False, "Missing or invalid field: lighting"
    
    lighting_fields = ['conditions', 'direction', 'shadows']
    for field in lighting_fields:
        if field not in sp['lighting'] or not isinstance(sp['lighting'][field], str):
            return False, f"Missing or invalid field: lighting.{field}"
    
    if 'aesthetics' not in sp or not isinstance(sp['aesthetics'], dict):
        return False, "Missing or invalid field: aesthetics"
    
    aesthetics_fields = ['composition', 'color_scheme', 'mood_atmosphere']
    for field in aesthetics_fields:
        if field not in sp['aesthetics'] or not isinstance(sp['aesthetics'][field], str):
            return False, f"Missing or invalid field: aesthetics.{field}"
    
    if 'photographic_characteristics' not in sp or not isinstance(sp['photographic_characteristics'], dict):
        return False, "Missing or invalid field: photographic_characteristics"
    
    camera_fields = ['camera_angle', 'lens_focal_length', 'depth_of_field', 'focus']
    for field in camera_fields:
        if field not in sp['photographic_characteristics'] or not isinstance(sp['photographic_characteristics'][field], str):
            return False, f"Missing or invalid field: photographic_characteristics.{field}"
    
    # Validate objects array
    if 'objects' not in sp or not isinstance(sp['objects'], list):
        return False, "Missing or invalid field: objects (must be a list)"
    
    # Validate each object in array
    object_fields = ['description', 'location', 'relationship', 'relative_size', 
                    'shape_and_color', 'texture', 'appearance_details']
    for i, obj in enumerate(sp['objects']):
        if not isinstance(obj, dict):
            return False, f"Object at index {i} must be a dict"
        for field in object_fields:
            if field not in obj or not isinstance(obj[field], str):
                return False, f"Missing or invalid field in object {i}: {field}"
    
    return True, None
```

## Data Models

### TypeScript Types (Frontend)

**Location**: `elegant-flow-ui/src/lib/types.ts`

```typescript
// Pro Mode specific types
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

export interface LightingConfig {
  conditions: string;
  direction: string;
  shadows: string;
}

export interface AestheticsConfig {
  composition: string;
  color_scheme: string;
  mood_atmosphere: string;
}

export interface CameraConfig {
  camera_angle: string;
  lens_focal_length: string;
  depth_of_field: string;
  focus: string;
}

export interface ObjectDefinition {
  id: string; // Client-side only (UUID), not sent to API
  description: string;
  location: string;
  relationship: string;
  relative_size: string;
  shape_and_color: string;
  texture: string;
  appearance_details: string;
}

export interface ProModeGenerateRequest {
  structured_prompt: Omit<StructuredPrompt, 'objects'> & {
    objects: Omit<ObjectDefinition, 'id'>[]; // Remove 'id' before sending
  };
  seed: number;
}

export interface ProModeGenerateResponse {
  success: boolean;
  final_image_url?: string;
  error?: string;
}
```

### API Client Function

**Location**: `elegant-flow-ui/src/lib/api.ts`

```typescript
/**
 * Generate image using Pro Mode (structured prompt)
 * Bypasses Gemini translation layer
 */
export async function generateProMode(
  request: ProModeGenerateRequest
): Promise<ProModeGenerateResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/generate/pro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data: ProModeGenerateResponse = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || `HTTP error ${response.status}`,
        response.status
      );
    }

    if (!data.success) {
      throw new ApiError(data.error || 'Image generation failed', response.status);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof TypeError) {
      throw new ApiError('Network error. Please check your connection.');
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408);
    }
    
    throw new ApiError('An unexpected error occurred.');
  }
}
```

## Error Handling

### Frontend Error Scenarios

1. **Validation Errors**: Empty required fields → Display inline error messages
2. **Network Errors**: Connection failure → "Network error. Please check your connection."
3. **API Errors**:
   - 400 Bad Request → Display specific validation error from backend
   - 500 Server Error → "Server error occurred. Please try again."

### Backend Error Scenarios

1. **Request Validation**: Missing/invalid fields → 400 with specific error message
2. **Bria API Errors**: Connection/timeout/generation failure → 500 with error message
3. **Unexpected Errors**: Catch-all → 500 with "Internal server error occurred"

## UI/UX Design Patterns

### Visual Hierarchy

1. **Accordion Organization**: Sections collapsed by default except "Scene & Style"
2. **Form Layout**: Labels above inputs, consistent spacing, full-width inputs
3. **Object Cards**: Distinct visual separation, numbered headers, remove button in top-right

### Interaction Patterns

1. **Real-time State Updates**: Changes immediately reflected in state
2. **Object Management**: "Add New Object" button always visible, remove button per object
3. **Form Submission**: Single "Generate Image" button at bottom, disabled during loading

### Responsive Design

1. **Desktop (≥1024px)**: Two-column layout (Form | Results)
2. **Tablet (768px-1023px)**: Single-column layout
3. **Mobile (<768px)**: Single-column, larger touch targets

## Testing Strategy

### Frontend Testing

- Component unit tests for all sections
- State management tests for nested updates
- Object array manipulation tests
- Form submission flow integration tests

### Backend Testing

- Request validation tests
- Pro Mode endpoint integration tests
- Bria API call tests
- Error handling tests

## Security Considerations

1. **Input Validation**: Backend validates all fields before processing
2. **API Security**: CORS restricted to known origins, API keys never exposed
3. **Error Messages**: No sensitive information in error messages

## Deployment Checklist

- [ ] Frontend components implemented and tested
- [ ] Backend `/api/generate/pro` endpoint implemented
- [ ] Validation logic tested
- [ ] Bria API integration tested
- [ ] Error handling verified
- [ ] Accessibility audit passed
- [ ] Responsive design tested
- [ ] Cross-browser testing completed
            {photographic_characteristics.depth_of_field}, {photographic_characteristics.focus}

    Objects:
  - {object.description}, located at {object.location}, {object.relationship},
      {object.relative_size}, {object.shape_and_color}, {object.texture}, {object.appearance_details}
    """

```

## Data Models

### TypeScript Types (Frontend)

**Location**: `elegant-flow-ui/src/lib/types.ts`

```typescript
// Pro Mode specific types
export interface StructuredPrompt {
  short_description: string;
  background_setting: string;
  s
