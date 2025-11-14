# Pro Mode Developer Guide

## Overview

This guide provides technical documentation for developers working with or extending the Pro Mode feature. Pro Mode is a sophisticated form-based interface that allows users to construct structured prompts with granular control over image generation parameters.

## Architecture

### High-Level Design

Pro Mode follows a "Direct Line" architecture that bypasses the Gemini translation layer used in Standard Mode:

```
User Input (Pro Mode Form)
    ↓
React State (Structured JSON Object)
    ↓
Generate Random Seed
    ↓
POST /api/generate/pro
    ↓
Flask Backend (Validation)
    ↓
json.dumps(structured_prompt) → JSON String
    ↓
Bria API (Direct Call)
    ↓
Poll for Result
    ↓
Return Image URL
```

### Key Architectural Principles

1. **State-Driven Design**: The entire form maintains a single `StructuredPrompt` object in React state
2. **Separation of Concerns**: Frontend handles UI/UX, backend handles validation and API orchestration
3. **Direct API Access**: Bypasses Gemini translation for precise control
4. **Component Composition**: Modular section components for maintainability
5. **Type Safety**: Full TypeScript typing throughout the frontend

## API Specification

### Endpoint

```
POST /api/generate/pro
```

### Request Format

```typescript
{
  structured_prompt: {
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
    objects: Array<{
      description: string;
      location: string;
      relationship: string;
      relative_size: string;
      shape_and_color: string;
      texture: string;
      appearance_details: string;
    }>;
  };
  seed: number;
}
```

### Response Format

**Success (200):**

```typescript
{
  success: true;
  final_image_url: string;
}
```

**Error (400/500):**

```typescript
{
  success: false;
  error: string;
}
```

### Validation Rules

The backend validates:

1. **Presence**: All required fields must be present
2. **Type**: Fields must match expected types (string, object, array)
3. **Non-Empty**: String fields must not be empty or whitespace-only
4. **Structure**: Nested objects must have all required sub-fields
5. **Array Items**: Each object in the `objects` array must have all required fields

### Error Codes

- `400 Bad Request`: Validation failure, malformed JSON, missing fields
- `500 Internal Server Error`: Bria API failure, unexpected server error
- `408 Request Timeout`: Request exceeded 120-second timeout

## Frontend Architecture

### Component Hierarchy

```
ProModeForm (Main Container)
├── Accordion
│   ├── SceneStyleSection
│   ├── LightingSection
│   ├── AestheticsSection
│   ├── CameraSection
│   └── ObjectBuilderSection
│       └── ObjectCard (multiple instances)
├── GenerateButton
└── ResultsDisplay
```

### Type Definitions

**Location:** `elegant-flow-ui/src/lib/types.ts`

```typescript
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
  id: string; // Client-side only (UUID), removed before API call
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
    objects: Omit<ObjectDefinition, 'id'>[];
  };
  seed: number;
}

export interface ProModeGenerateResponse {
  success: boolean;
  final_image_url?: string;
  error?: string;
}
```

### State Management

The `ProModeForm` component manages all state using React's `useState` hook:

```typescript
const [structuredPrompt, setStructuredPrompt] = useState<StructuredPrompt>({
  short_description: '',
  background_setting: '',
  style_medium: '',
  artistic_style: '',
  context: '',
  lighting: {
    conditions: '',
    direction: '',
    shadows: '',
  },
  aesthetics: {
    composition: '',
    color_scheme: '',
    mood_atmosphere: '',
  },
  photographic_characteristics: {
    camera_angle: '',
    lens_focal_length: '',
    depth_of_field: '',
    focus: '',
  },
  objects: [],
});

const [isLoading, setIsLoading] = useState(false);
const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
```

### State Update Patterns

**Top-Level Fields:**

```typescript
const handleFieldChange = (field: keyof StructuredPrompt, value: string) => {
  setStructuredPrompt(prev => ({
    ...prev,
    [field]: value,
  }));
};
```

**Nested Objects:**

```typescript
const handleLightingChange = (field: keyof LightingConfig, value: string) => {
  setStructuredPrompt(prev => ({
    ...prev,
    lighting: {
      ...prev.lighting,
      [field]: value,
    },
  }));
};
```

**Array Management:**

```typescript
const handleAddObject = () => {
  const newObject: ObjectDefinition = {
    id: crypto.randomUUID(),
    description: '',
    location: '',
    relationship: '',
    relative_size: '',
    shape_and_color: '',
    texture: '',
    appearance_details: '',
  };
  
  setStructuredPrompt(prev => ({
    ...prev,
    objects: [...prev.objects, newObject],
  }));
};

const handleRemoveObject = (id: string) => {
  setStructuredPrompt(prev => ({
    ...prev,
    objects: prev.objects.filter(obj => obj.id !== id),
  }));
};

const handleObjectFieldChange = (
  id: string,
  field: keyof Omit<ObjectDefinition, 'id'>,
  value: string
) => {
  setStructuredPrompt(prev => ({
    ...prev,
    objects: prev.objects.map(obj =>
      obj.id === id ? { ...obj, [field]: value } : obj
    ),
  }));
};
```

### Form Submission

```typescript
const handleGenerate = async () => {
  setIsLoading(true);
  setError(null);
  setGeneratedImageUrl(null);

  try {
    // Generate random seed
    const seed = Math.floor(Math.random() * 1000000);

    // Remove client-side 'id' field from objects
    const objectsForApi = structuredPrompt.objects.map(({ id, ...rest }) => rest);

    // Prepare payload
    const payload: ProModeGenerateRequest = {
      structured_prompt: {
        ...structuredPrompt,
        objects: objectsForApi,
      },
      seed,
    };

    // Call API
    const response = await generateProMode(payload);

    if (response.success && response.final_image_url) {
      setGeneratedImageUrl(response.final_image_url);
    } else {
      setError(response.error || 'Image generation failed');
    }
  } catch (err) {
    if (err instanceof ApiError) {
      setError(err.message);
    } else {
      setError('An unexpected error occurred');
    }
  } finally {
    setIsLoading(false);
  }
};
```

### API Client

**Location:** `elegant-flow-ui/src/lib/api.ts`

```typescript
export async function generateProMode(
  request: ProModeGenerateRequest
): Promise<ProModeGenerateResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

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

## Backend Implementation

### Flask Endpoint

**Location:** `api_server.py`

```python
@app.route('/api/generate/pro', methods=['POST'])
def generate_pro_mode():
    """
    Pro Mode endpoint - Direct Line to Bria (bypasses Gemini).
    
    Accepts structured prompts and sends them directly to Bria API
    as JSON strings without translation.
    """
    request_id = id(request)
    
    try:
        # Parse request
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "Invalid JSON"}), 400
        
        # Validate structure
        is_valid, error_msg = validate_pro_mode_request(data)
        if not is_valid:
            return jsonify({"success": False, "error": error_msg}), 400
        
        structured_prompt = data['structured_prompt']
        seed = data['seed']
        
        app.logger.info(f"[Request {request_id}] Pro Mode generation with seed {seed}")
        
        # Convert to JSON string (Direct Line to Bria)
        prompt_json_string = json.dumps(structured_prompt)
        
        app.logger.info(
            f"[Request {request_id}] Structured prompt: {len(prompt_json_string)} chars"
        )
        
        # Call Bria directly
        result = call_bria_with_structured_prompt(prompt_json_string, seed)
        
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
        app.logger.error(
            f"[Request {request_id}] Pro Mode error: {str(e)}", 
            exc_info=True
        )
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500
```

### Validation Function

**Location:** `api_server.py`

```python
def validate_pro_mode_request(data: dict) -> tuple[bool, str]:
    """
    Validate Pro Mode request payload structure.
    
    Args:
        data: Request JSON data
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Check top-level structure
    if 'structured_prompt' not in data:
        return False, "Missing field: structured_prompt"
    
    if 'seed' not in data or not isinstance(data['seed'], int):
        return False, "Missing or invalid field: seed (must be integer)"
    
    sp = data['structured_prompt']
    
    if not isinstance(sp, dict):
        return False, "structured_prompt must be an object"
    
    # Validate top-level string fields
    required_fields = [
        'short_description', 'background_setting', 'style_medium',
        'artistic_style', 'context'
    ]
    for field in required_fields:
        if field not in sp or not isinstance(sp[field], str) or not sp[field].strip():
            return False, f"Missing or invalid field: {field}"
    
    # Validate lighting object
    if 'lighting' not in sp or not isinstance(sp['lighting'], dict):
        return False, "Missing or invalid field: lighting"
    
    lighting_fields = ['conditions', 'direction', 'shadows']
    for field in lighting_fields:
        if field not in sp['lighting'] or not isinstance(sp['lighting'][field], str):
            return False, f"Missing or invalid field: lighting.{field}"
    
    # Validate aesthetics object
    if 'aesthetics' not in sp or not isinstance(sp['aesthetics'], dict):
        return False, "Missing or invalid field: aesthetics"
    
    aesthetics_fields = ['composition', 'color_scheme', 'mood_atmosphere']
    for field in aesthetics_fields:
        if field not in sp['aesthetics'] or not isinstance(sp['aesthetics'][field], str):
            return False, f"Missing or invalid field: aesthetics.{field}"
    
    # Validate photographic_characteristics object
    if 'photographic_characteristics' not in sp or not isinstance(
        sp['photographic_characteristics'], dict
    ):
        return False, "Missing or invalid field: photographic_characteristics"
    
    camera_fields = ['camera_angle', 'lens_focal_length', 'depth_of_field', 'focus']
    for field in camera_fields:
        if field not in sp['photographic_characteristics'] or not isinstance(
            sp['photographic_characteristics'][field], str
        ):
            return False, f"Missing or invalid field: photographic_characteristics.{field}"
    
    # Validate objects array
    if 'objects' not in sp or not isinstance(sp['objects'], list):
        return False, "Missing or invalid field: objects (must be array)"
    
    # Validate each object
    object_fields = [
        'description', 'location', 'relationship', 'relative_size',
        'shape_and_color', 'texture', 'appearance_details'
    ]
    for i, obj in enumerate(sp['objects']):
        if not isinstance(obj, dict):
            return False, f"Object at index {i} must be an object"
        for field in object_fields:
            if field not in obj or not isinstance(obj[field], str):
                return False, f"Missing or invalid field in object {i}: {field}"
    
    return True, ""
```

### Bria API Caller

**Location:** `workflow.py`

```python
def call_bria_with_structured_prompt(prompt_json_string: str, seed: int) -> dict:
    """
    Call Bria API directly with structured prompt JSON string.
    
    This is the Pro Mode "Direct Line" - bypasses Gemini translation.
    
    Args:
        prompt_json_string: Structured prompt as JSON string (from json.dumps())
        seed: Random seed for generation consistency
        
    Returns:
        dict with 'image_url' on success
        
    Raises:
        Exception: If Bria API call fails
    """
    try:
        logger.info("Pro Mode: Calling Bria API directly (bypassing Gemini)")
        logger.debug(f"Prompt JSON length: {len(prompt_json_string)} characters")
        logger.debug(f"Seed: {seed}")
        
        # Build Bria payload
        payload = {
            "prompt": prompt_json_string,
            "seed": seed
        }
        
        # Submit to Bria
        logger.info("Submitting Pro Mode job to Bria API")
        response = requests.post(
            BRIA_API_ENDPOINT,
            json=payload,
            headers=BRIA_HEADERS,
            timeout=30
        )
        
        if response.status_code != 202:
            error_detail = response.text[:200] if response.text else "No details"
            logger.error(
                f"Bria API rejected request: {response.status_code} - {error_detail}"
            )
            raise Exception(f"Bria API failed with status {response.status_code}")
        
        response_data = response.json()
        request_id = response_data.get('request_id', 'unknown')
        status_url = response_data.get('status_url')
        
        if not status_url:
            logger.error("Bria API response missing status_url")
            raise Exception("Bria API response missing status_url")
        
        logger.info(f"Pro Mode: Bria job accepted. Request ID: {request_id}")
        
        # Poll for result
        result = poll_for_result(status_url)
        
        if not result:
            logger.error("Pro Mode: Bria job returned no result")
            raise Exception("Bria job failed to generate image")
        
        image_url = result.get('image_url')
        if not image_url:
            logger.error("Pro Mode: Result missing image_url")
            raise Exception("Result missing image_url")
        
        logger.info(f"Pro Mode: Successfully generated image: {image_url}")
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

## Extending Pro Mode

### Adding New Fields

To add a new field to the structured prompt:

1. **Update TypeScript Types** (`elegant-flow-ui/src/lib/types.ts`):

```typescript
export interface StructuredPrompt {
  // ... existing fields
  new_field: string;
}
```

2. **Update Initial State** (`ProModeForm.tsx`):

```typescript
const [structuredPrompt, setStructuredPrompt] = useState<StructuredPrompt>({
  // ... existing fields
  new_field: '',
});
```

3. **Add UI Component** (create or update section component):

```typescript
<Input
  id="new_field"
  value={values.new_field}
  onChange={(e) => onChange('new_field', e.target.value)}
  aria-label="New Field"
/>
```

4. **Update Backend Validation** (`api_server.py`):

```python
required_fields = [
    # ... existing fields
    'new_field'
]
```

### Adding New Nested Objects

To add a new nested configuration object:

1. **Define Interface** (`types.ts`):

```typescript
export interface NewConfig {
  field1: string;
  field2: string;
}
```

2. **Add to StructuredPrompt**:

```typescript
export interface StructuredPrompt {
  // ... existing fields
  new_config: NewConfig;
}
```

3. **Create Section Component** (`NewConfigSection.tsx`):

```typescript
interface NewConfigSectionProps {
  values: NewConfig;
  onChange: (field: keyof NewConfig, value: string) => void;
}

export function NewConfigSection({ values, onChange }: NewConfigSectionProps) {
  return (
    <div className="space-y-4">
      <Input
        value={values.field1}
        onChange={(e) => onChange('field1', e.target.value)}
      />
      {/* ... more fields */}
    </div>
  );
}
```

4. **Add State Handler** (`ProModeForm.tsx`):

```typescript
const handleNewConfigChange = (field: keyof NewConfig, value: string) => {
  setStructuredPrompt(prev => ({
    ...prev,
    new_config: {
      ...prev.new_config,
      [field]: value,
    },
  }));
};
```

5. **Add to Accordion**:

```typescript
<AccordionItem value="new-config">
  <AccordionTrigger>New Configuration</AccordionTrigger>
  <AccordionContent>
    <NewConfigSection
      values={structuredPrompt.new_config}
      onChange={handleNewConfigChange}
    />
  </AccordionContent>
</AccordionItem>
```

6. **Update Backend Validation**:

```python
if 'new_config' not in sp or not isinstance(sp['new_config'], dict):
    return False, "Missing or invalid field: new_config"

new_config_fields = ['field1', 'field2']
for field in new_config_fields:
    if field not in sp['new_config'] or not isinstance(sp['new_config'][field], str):
        return False, f"Missing or invalid field: new_config.{field}"
```

### Customizing Object Fields

To modify the ObjectDefinition structure:

1. **Update Interface** (`types.ts`):

```typescript
export interface ObjectDefinition {
  id: string;
  // ... existing fields
  new_object_field: string;
}
```

2. **Update ObjectCard Component** (`ObjectCard.tsx`):

```typescript
<Input
  value={object.new_object_field}
  onChange={(e) => onChange('new_object_field', e.target.value)}
  aria-label="New Object Field"
/>
```

3. **Update Add Object Handler** (`ProModeForm.tsx`):

```typescript
const handleAddObject = () => {
  const newObject: ObjectDefinition = {
    // ... existing fields
    new_object_field: '',
  };
  // ... rest of handler
};
```

4. **Update Backend Validation**:

```python
object_fields = [
    # ... existing fields
    'new_object_field'
]
```

## Testing

### Unit Tests

Test individual components:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { SceneStyleSection } from './SceneStyleSection';

describe('SceneStyleSection', () => {
  it('updates short_description on input change', () => {
    const mockOnChange = jest.fn();
    const values = {
      short_description: '',
      // ... other fields
    };
    
    render(<SceneStyleSection values={values} onChange={mockOnChange} />);
    
    const input = screen.getByLabelText('Short Description');
    fireEvent.change(input, { target: { value: 'Test description' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('short_description', 'Test description');
  });
});
```

### Integration Tests

Test the complete workflow:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProModeForm } from './ProModeForm';
import * as api from '../lib/api';

jest.mock('../lib/api');

describe('ProModeForm Integration', () => {
  it('generates image with complete form data', async () => {
    const mockGenerateProMode = jest.spyOn(api, 'generateProMode')
      .mockResolvedValue({
        success: true,
        final_image_url: 'https://example.com/image.jpg',
      });
    
    render(<ProModeForm />);
    
    // Fill form fields
    fireEvent.change(screen.getByLabelText('Short Description'), {
      target: { value: 'Test product' },
    });
    // ... fill other required fields
    
    // Submit
    fireEvent.click(screen.getByText('Generate Image'));
    
    await waitFor(() => {
      expect(mockGenerateProMode).toHaveBeenCalled();
    });
    
    // Verify payload structure
    const payload = mockGenerateProMode.mock.calls[0][0];
    expect(payload).toHaveProperty('structured_prompt');
    expect(payload).toHaveProperty('seed');
    expect(typeof payload.seed).toBe('number');
  });
});
```

### Backend Tests

Test the API endpoint:

```python
import pytest
from api_server import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_pro_mode_endpoint_success(client, mocker):
    # Mock Bria API call
    mocker.patch('workflow.call_bria_with_structured_prompt', return_value={
        'image_url': 'https://example.com/image.jpg'
    })
    
    payload = {
        'structured_prompt': {
            'short_description': 'Test',
            'background_setting': 'Test',
            'style_medium': 'Test',
            'artistic_style': 'Test',
            'context': 'Test',
            'lighting': {
                'conditions': 'Test',
                'direction': 'Test',
                'shadows': 'Test',
            },
            'aesthetics': {
                'composition': 'Test',
                'color_scheme': 'Test',
                'mood_atmosphere': 'Test',
            },
            'photographic_characteristics': {
                'camera_angle': 'Test',
                'lens_focal_length': 'Test',
                'depth_of_field': 'Test',
                'focus': 'Test',
            },
            'objects': [],
        },
        'seed': 12345,
    }
    
    response = client.post('/api/generate/pro', json=payload)
    
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert 'final_image_url' in data

def test_pro_mode_validation_error(client):
    payload = {
        'structured_prompt': {},  # Invalid: missing fields
        'seed': 12345,
    }
    
    response = client.post('/api/generate/pro', json=payload)
    
    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False
    assert 'error' in data
```

## Performance Considerations

### Frontend Optimization

1. **Lazy Loading**: Pro Mode components are lazy-loaded to reduce initial bundle size
2. **Debouncing**: Consider debouncing input changes for performance with large forms
3. **Memoization**: Use `React.memo()` for section components to prevent unnecessary re-renders

### Backend Optimization

1. **Request Validation**: Fast-fail validation prevents unnecessary API calls
2. **Logging**: Structured logging for debugging without performance impact
3. **Timeout Handling**: Appropriate timeouts prevent hanging requests

## Security Considerations

1. **Input Validation**: All inputs validated on backend before processing
2. **CORS**: Restricted to known origins
3. **API Keys**: Never exposed to frontend
4. **Error Messages**: No sensitive information in error responses
5. **Rate Limiting**: Consider implementing rate limiting for production

## Deployment

### Environment Variables

```bash
# Backend
GOOGLE_API_KEY=your_gemini_key  # Not used in Pro Mode, but required for Standard Mode
BRIA_API_KEY=your_bria_key

# Frontend
VITE_API_BASE_URL=http://localhost:5000  # Development
VITE_API_BASE_URL=https://api.production.com  # Production
```

### Build Process

```bash
# Frontend
cd elegant-flow-ui
npm run build

# Backend
# No build step required for Flask
python api_server.py
```

### Production Checklist

- [ ] Environment variables configured
- [ ] CORS origins updated for production domain
- [ ] Error logging configured
- [ ] Rate limiting implemented
- [ ] SSL/TLS certificates configured
- [ ] API timeout values tuned
- [ ] Frontend build optimized
- [ ] Accessibility audit passed
- [ ] Security audit completed

## Troubleshooting

### Common Issues

**Issue: Objects not updating correctly**

- Check that `id` field is being used as React key
- Verify `handleObjectFieldChange` is mapping correctly
- Ensure immutable state updates

**Issue: Validation errors on valid data**

- Check for whitespace-only strings
- Verify nested object structure matches schema
- Ensure all required fields are present

**Issue: Timeout errors**

- Increase timeout values if needed
- Check Bria API status
- Verify network connectivity

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## Support

For questions or issues:

- Review this documentation
- Check the User Guide for usage examples
- Review the requirements and design documents in `.kiro/specs/pro-mode-structured-prompt/`
