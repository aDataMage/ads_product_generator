# Canvas Expander - Aspect Ratio Calculations

## Overview

This document describes the aspect ratio calculation logic implemented in the CanvasExpander component for intelligent canvas expansion.

## Implementation

### Core Functions

#### 1. `calculateTargetDimensions(preset: AspectRatioPreset): ImageDimensions | null`

Calculates the target canvas dimensions needed to achieve a specific aspect ratio while preserving the original image.

**Algorithm:**

1. Compare original aspect ratio with target aspect ratio
2. If original is narrower (more portrait), expand width
3. If original is wider (more landscape), expand height
4. If already at target ratio (within 0.1% tolerance), return original dimensions

**Example:**

- Original: 800×1200 (portrait, 2:3 ratio)
- Target: 1:1 (square)
- Result: 1200×1200 (expands width to match height)

#### 2. `calculateAspectRatio(dimensions: ImageDimensions): number`

Returns the aspect ratio as a decimal number (width / height).

**Example:**

- 1920×1080 → 1.777... (16:9)
- 1024×1024 → 1.0 (1:1)

#### 3. `formatAspectRatio(dimensions: ImageDimensions): string`

Formats aspect ratio as a human-readable string using greatest common divisor (GCD).

**Examples:**

- 1920×1080 → "16:9"
- 1024×1024 → "1:1"
- 1600×1200 → "4:3"
- Complex ratios → "1.78:1" (decimal notation)

#### 4. `isValidExpansion(original: ImageDimensions, target: ImageDimensions): boolean`

Validates that target dimensions are larger than original in at least one direction.

**Validation Rules:**

- Target width ≥ original width OR target height ≥ original height
- Prevents shrinking operations

### Enhanced Validation

The `validateCustomDimensions()` function now includes:

1. **Basic validation:**
   - Values are valid numbers
   - Values are positive
   - Values don't exceed 10,000 pixels

2. **Expansion validation:**
   - Uses `isValidExpansion()` to ensure proper expansion
   - At least one dimension must increase

3. **Aspect ratio warning:**
   - Logs warning if aspect ratio changes dramatically (>2x difference)
   - Helps catch unintentional distortion

## UI Enhancements

### Preset Buttons

Each aspect ratio preset button now shows:

- **Icon** representing the aspect ratio shape
- **Ratio label** (e.g., "16:9")
- **Name and description**
- **Target dimensions** preview (e.g., "→ 1920 × 1080")
- **"Current" indicator** if image is already at that ratio
- **Disabled state** for current aspect ratio

### Dimension Information Panel

Displays comprehensive dimension information:

**Original:**

- Dimensions: 1200 × 900 px
- Aspect Ratio: 4:3

**Target:**

- Dimensions: 1600 × 900 px
- Aspect Ratio: 16:9
- Expansion: Width Only

### Visual Preview

The expansion preview shows:

- Original image area (centered)
- Highlighted expansion areas
- Dimension labels
- Helpful explanation of how expansion works

## Supported Aspect Ratios

### Presets

1. **1:1 (Square)**
   - Perfect for social media posts
   - Instagram, Facebook, profile pictures

2. **4:3 (Standard)**
   - Classic photo format
   - Traditional displays

3. **16:9 (Widescreen)**
   - HD video and displays
   - YouTube, presentations

4. **9:16 (Portrait)**
   - Mobile stories and reels
   - Instagram Stories, TikTok

### Custom Dimensions

Users can also enter any custom width and height:

- Range: 1 to 10,000 pixels
- Must expand in at least one direction
- Aspect ratio is calculated and displayed

## Edge Cases Handled

1. **Already at target ratio:**
   - Preset button is disabled
   - Shows "(Current)" indicator
   - Prevents unnecessary API calls

2. **Aspect ratio tolerance:**
   - 0.1% tolerance for floating-point comparison
   - Prevents false negatives due to rounding

3. **Minimum dimensions:**
   - Ensures all dimensions are at least 1 pixel
   - Rounds to nearest integer

4. **Large aspect ratio changes:**
   - Warns in console for dramatic changes
   - Still allows the operation (user choice)

5. **Invalid inputs:**
   - Clear error messages
   - Client-side validation before API call

## Testing

Comprehensive test suite covers:

- Aspect ratio formatting
- Target dimension calculations
- All preset aspect ratios
- Edge cases (small dimensions, already at ratio)
- Validation logic

**Test file:** `src/test/canvas-expander-aspect-ratio.test.tsx`

**Test results:** 15 tests, all passing

## Usage Example

```typescript
// User selects 16:9 preset for a 1200×900 image (4:3)
const original = { width: 1200, height: 900 };
const preset = { width: 16, height: 9 };

// Calculate target dimensions
const target = calculateTargetDimensions(preset);
// Result: { width: 1600, height: 900 }

// Format aspect ratios
formatAspectRatio(original); // "4:3"
formatAspectRatio(target);   // "16:9"

// Validate expansion
isValidExpansion(original, target); // true (width increased)
```

## Benefits

1. **Intelligent expansion:** Only expands necessary dimensions
2. **User-friendly:** Clear visual feedback and dimension info
3. **Prevents errors:** Validates before API calls
4. **Flexible:** Supports both presets and custom dimensions
5. **Accessible:** Proper ARIA labels and disabled states
6. **Well-tested:** Comprehensive test coverage

## Future Enhancements

Potential improvements:

- More preset aspect ratios (21:9, 2:3, etc.)
- Aspect ratio lock for custom dimensions
- Preset favorites/recent
- Batch expansion for multiple images
- Aspect ratio detection from uploaded images
