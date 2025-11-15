# Image Editing Features - Design

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ResultsPanel (Enhanced)                               │ │
│  │  - Display generated image                             │ │
│  │  - Show editing toolbar                                │ │
│  │  - Preview edited results                              │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ImageEditor Component                                 │ │
│  │  - BackgroundEditor                                    │ │
│  │  - GenerativeFillEditor                                │ │
│  │  - EnhancementEditor                                   │ │
│  │  - CanvasExpander                                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Flask API Server                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  New Endpoints:                                        │ │
│  │  POST /api/edit/remove-background                      │ │
│  │  POST /api/edit/replace-background                     │ │
│  │  POST /api/edit/blur-background                        │ │
│  │  POST /api/edit/generative-fill                        │ │
│  │  POST /api/edit/expand                                 │ │
│  │  POST /api/edit/enhance                                │ │
│  │  POST /api/edit/upscale                                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  image_editor.py Module                      │
│  - remove_background()                                       │
│  - replace_background()                                      │
│  - blur_background()                                         │
│  - generative_fill()                                         │
│  - expand_image()                                            │
│  - enhance_image()                                           │
│  - increase_resolution()                                     │
│  - poll_status() (shared utility)                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Bria Image Editing API                    │
│  /v2/image/edit/* endpoints                                  │
└─────────────────────────────────────────────────────────────┘
```

## Backend Design

### Module: `image_editor.py`

```python
# Core editing functions
def remove_background(image_url_or_base64: str, sync: bool = False) -> dict
def replace_background(image_url_or_base64: str, background_prompt: str, sync: bool = False) -> dict
def blur_background(image_url_or_base64: str, blur_strength: int, sync: bool = False) -> dict
def generative_fill(image_url_or_base64: str, mask: str, prompt: str, 
                    negative_prompt: str = None, version: int = 2, sync: bool = False) -> dict
def expand_image(image_url_or_base64: str, target_width: int, target_height: int, 
                 prompt: str = None, sync: bool = False) -> dict
def enhance_image(image_url_or_base64: str, sync: bool = False) -> dict
def increase_resolution(image_url_or_base64: str, scale_factor: int = 2, sync: bool = False) -> dict

# Shared utilities
def poll_status(status_url: str, timeout: int = 60) -> dict
def download_result(image_url: str, output_path: str) -> str
```

### API Endpoints

#### 1. Remove Background

```
POST /api/edit/remove-background
Body: {
  "image": "url_or_base64",
  "preserve_alpha": true
}
Response: {
  "success": true,
  "result_url": "https://...",
  "original_url": "https://..."
}
```

#### 2. Replace Background

```
POST /api/edit/replace-background
Body: {
  "image": "url_or_base64",
  "background_prompt": "white studio background with soft shadows",
  "background_color": "#FFFFFF" (optional)
}
Response: {
  "success": true,
  "result_url": "https://..."
}
```

#### 3. Blur Background

```
POST /api/edit/blur-background
Body: {
  "image": "url_or_base64",
  "blur_strength": 50
}
Response: {
  "success": true,
  "result_url": "https://..."
}
```

#### 4. Generative Fill

```
POST /api/edit/generative-fill
Body: {
  "image": "url_or_base64",
  "mask": "url_or_base64",
  "prompt": "add flowers around the product",
  "negative_prompt": "blurry, distorted",
  "version": 2
}
Response: {
  "success": true,
  "result_url": "https://...",
  "refined_prompt": "..."
}
```

#### 5. Expand Canvas

```
POST /api/edit/expand
Body: {
  "image": "url_or_base64",
  "target_width": 1920,
  "target_height": 1080,
  "prompt": "continue the background naturally"
}
Response: {
  "success": true,
  "result_url": "https://..."
}
```

#### 6. Enhance Image

```
POST /api/edit/enhance
Body: {
  "image": "url_or_base64"
}
Response: {
  "success": true,
  "result_url": "https://..."
}
```

#### 7. Upscale Resolution

```
POST /api/edit/upscale
Body: {
  "image": "url_or_base64",
  "scale_factor": 2
}
Response: {
  "success": true,
  "result_url": "https://..."
}
```

## Frontend Design

### Component Structure

```
ResultsPanel (Enhanced)
├── ImageDisplay
│   └── EditingToolbar (overlay)
└── ImageEditor (modal/panel)
    ├── BackgroundEditor
    │   ├── RemoveBackgroundButton
    │   ├── ReplaceBackgroundForm
    │   └── BlurBackgroundSlider
    ├── GenerativeFillEditor
    │   ├── MaskDrawingCanvas
    │   ├── PromptInput
    │   └── NegativePromptInput
    ├── EnhancementEditor
    │   ├── EnhanceButton
    │   └── UpscaleSelector
    └── CanvasExpander
        ├── AspectRatioPresets
        └── CustomDimensionsInput
```

### UI/UX Flow

1. **Initial State**: User generates image, sees result in ResultsPanel
2. **Edit Mode**: Click "Edit Image" button to reveal editing toolbar
3. **Tool Selection**: Choose editing tool from toolbar/menu
4. **Parameter Input**: Configure tool-specific parameters
5. **Preview**: See loading state, then preview edited result
6. **Actions**: Download, apply more edits, or revert to original

### Editing Toolbar Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Background ▼] [Generative Fill] [Enhance ▼] [Expand] │
└─────────────────────────────────────────────────────────┘
```

**Background Dropdown:**

- Remove Background
- Replace Background
- Blur Background

**Enhance Dropdown:**

- Enhance Quality
- Upscale 2x
- Upscale 4x

### State Management

```typescript
interface EditingState {
  originalImage: string;
  currentImage: string;
  editHistory: EditOperation[];
  currentEditIndex: number;
  isEditing: boolean;
  editingTool: EditingTool | null;
}

interface EditOperation {
  type: 'remove-bg' | 'replace-bg' | 'blur-bg' | 'gen-fill' | 'expand' | 'enhance' | 'upscale';
  params: Record<string, any>;
  resultUrl: string;
  timestamp: number;
}
```

## Data Flow

### Editing Operation Flow

1. User selects editing tool
2. Frontend collects parameters
3. POST request to Flask API endpoint
4. Backend calls Bria API (async by default)
5. Backend polls status endpoint
6. Backend returns result URL
7. Frontend displays edited image
8. User can download or continue editing

### Error Handling

- Network errors: Retry with exponential backoff
- API errors: Display user-friendly message
- Timeout: Show progress indicator, allow cancellation
- Invalid parameters: Client-side validation before submission

## Performance Considerations

- Use async processing for all operations (default)
- Implement request queuing for multiple edits
- Cache edited images in browser
- Lazy load editing tools
- Optimize image transfers (use URLs when possible)
- Show progress indicators for long operations

## Accessibility

- Keyboard navigation for all editing tools
- Screen reader announcements for editing operations
- High contrast mode support
- Focus management in editing modals
- Alt text for all images and icons

## Security

- Validate all image inputs (format, size)
- Sanitize user prompts
- Rate limiting on editing endpoints
- CORS configuration for frontend
- Secure API key handling
