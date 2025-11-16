# Screen Reader Accessibility Testing Guide

## Overview

This document provides a comprehensive guide for testing the image editing features with screen readers to ensure full accessibility compliance. The editing features include Background Editor, Generative Fill Editor, Enhancement Editor, and Canvas Expander.

## Testing Environment

### Recommended Screen Readers

- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca

### Browser Compatibility

Test with at least two of the following:

- Chrome/Edge (Chromium-based)
- Firefox
- Safari (macOS only)

## Pre-Test Setup

1. **Start the application**:

   ```bash
   cd elegant-flow-ui
   npm run dev
   ```

2. **Enable screen reader**:
   - **Windows (NVDA)**: Ctrl + Alt + N
   - **macOS (VoiceOver)**: Cmd + F5
   - **Linux (Orca)**: Super + Alt + S

3. **Navigate to the application**: Open <http://localhost:5173> in your browser

4. **Generate a test image**: Complete the standard generation flow to have an image available for editing

## Test Scenarios

### 1. Editing Toolbar Navigation

**Objective**: Verify that the editing toolbar is fully navigable and announces all tools correctly.

#### Test Steps

1. **Navigate to the editing toolbar**:
   - Use Tab key to reach the toolbar
   - Verify announcement: "Image editing tools, toolbar"

2. **Test Background dropdown**:
   - Tab to "Background" button
   - Verify announcement: "Background editing tools, button, has popup menu"
   - Press Enter or Space to open menu
   - Verify announcement: "menu"
   - Use Arrow keys to navigate menu items
   - Verify each item announces: "Remove Background, menu item", "Replace Background, menu item", "Blur Background, menu item"
   - Press Escape to close menu

3. **Test Generative Fill button**:
   - Tab to "Generative Fill" button
   - Verify announcement: "Generative fill tool, button, not pressed"
   - Press Enter to activate
   - Verify announcement changes to "pressed"

4. **Test Enhance dropdown**:
   - Tab to "Enhance" button
   - Verify announcement: "Enhancement tools, button, has popup menu"
   - Open and navigate menu
   - Verify items: "Enhance Quality, menu item", "Upscale Resolution, menu item"

5. **Test Expand button**:
   - Tab to "Expand" button
   - Verify announcement: "Canvas expansion tool, button, not pressed"

**Expected Results**:

- ✅ All buttons are keyboard accessible
- ✅ All buttons announce their purpose
- ✅ Dropdown menus announce "has popup" state
- ✅ Menu items are navigable with arrow keys
- ✅ Toggle buttons announce pressed/not pressed state

---

### 2. Background Editor - Remove Background

**Objective**: Test the remove background feature for screen reader accessibility.

#### Test Steps

1. **Navigate to Background Editor**:
   - Select "Remove Background" from toolbar
   - Verify region announcement: "Background editing tools, region"

2. **Test Remove Background button**:
   - Tab to "Remove Background" button
   - Verify announcement: "Remove background from image, button"
   - Verify tooltip content is announced
   - Press Enter to execute

3. **Monitor processing state**:
   - Verify announcement: "Processing remove operation, status"
   - Verify progress updates are announced: "Analyzing image... 10 percent complete"
   - Verify status messages change: "Removing background... 50 percent complete"

4. **Verify completion feedback**:
   - Verify success announcement: "Success, Background removed successfully!, alert"
   - Verify preview region is announced: "Image preview, region"
   - Tab to preview image
   - Verify alt text: "Edited image preview showing remove background operation"

**Expected Results**:

- ✅ All controls are properly labeled
- ✅ Processing status is announced with aria-live
- ✅ Progress percentage is announced
- ✅ Success/error messages are announced
- ✅ Preview images have descriptive alt text

---

### 3. Background Editor - Replace Background

**Objective**: Test the replace background feature including presets and custom inputs.

#### Test Steps

1. **Test preset category tabs**:
   - Navigate to preset categories
   - Verify announcement: "Background preset categories, tablist"
   - Tab through category buttons
   - Verify each announces: "Studio, tab, selected" or "not selected"
   - Press Enter to switch categories

2. **Test preset selection**:
   - Navigate to preset grid
   - Verify announcement: "Studio presets, tabpanel"
   - Tab through preset buttons
   - Verify announcement: "Select White Studio preset, button, not pressed"
   - Press Enter to select
   - Verify announcement changes to "pressed"

3. **Test custom prompt input**:
   - Tab to "Custom Background Description" input
   - Verify announcement: "Enter custom background description, edit text"
   - Verify help text is announced: "Describe your own background or select a preset above"
   - Type a custom prompt
   - Verify input is read back

4. **Test color picker**:
   - Tab to color picker
   - Verify announcement: "Select background color, color picker"
   - Change color
   - Verify new color value is announced: "#FF0000"

5. **Test Replace Background button**:
   - Tab to button
   - Press Enter to execute
   - Monitor processing and completion as in Test 2

**Expected Results**:

- ✅ Tab navigation works correctly
- ✅ Preset categories use proper tab role
- ✅ Preset buttons announce selection state
- ✅ Form inputs have proper labels
- ✅ Help text is associated with inputs
- ✅ Color picker value changes are announced

---

### 4. Background Editor - Blur Background

**Objective**: Test the blur background slider control.

#### Test Steps

1. **Navigate to blur slider**:
   - Tab to "Blur Strength" slider
   - Verify announcement: "Blur strength, slider, 50"

2. **Test slider interaction**:
   - Use Arrow keys to adjust value
   - Verify value changes are announced: "51", "52", etc.
   - Use Home key to go to minimum (0)
   - Use End key to go to maximum (100)
   - Verify range limits are respected

3. **Test Blur Background button**:
   - Tab to button
   - Press Enter to execute
   - Monitor processing and completion

**Expected Results**:

- ✅ Slider has proper role and label
- ✅ Current value is announced
- ✅ Value changes are announced
- ✅ Keyboard controls work (arrows, home, end)

---

### 5. Generative Fill Editor

**Objective**: Test the generative fill feature including mask drawing and prompts.

#### Test Steps

1. **Navigate to Generative Fill Editor**:
   - Select "Generative Fill" from toolbar
   - Verify heading announcement: "Draw Mask, heading level 3"

2. **Test Mask Drawing Canvas**:
   - Tab to canvas controls
   - Verify brush size slider: "Brush size, slider, 20"
   - Test brush size adjustment with arrow keys
   - Tab to "Clear" button
   - Verify announcement: "Clear mask, button"
   - Tab to "Undo" button
   - Verify announcement: "Undo last stroke, button"

3. **Test prompt inputs**:
   - Tab to "Prompt" input
   - Verify announcement: "Generative fill prompt, edit text, required"
   - Verify help text: "Describe what you want to generate in the masked area"
   - Tab to "Negative Prompt" input
   - Verify announcement: "Negative prompt, edit text"
   - Verify help text: "Describe what you want to avoid"

4. **Test version selector**:
   - Tab to version dropdown
   - Verify announcement: "API version selector, combo box"
   - Use arrow keys to change selection
   - Verify options are announced

5. **Test Generate button**:
   - Tab to "Generate Fill" button
   - Verify announcement: "Generate fill, button"
   - Verify disabled state if mask or prompt missing
   - Press Enter to execute
   - Monitor processing with progress updates

6. **Test refined prompt display**:
   - After completion, verify refined prompt alert
   - Verify announcement: "Refined Prompt, alert"

7. **Test before/after comparison**:
   - Navigate to comparison section
   - Verify both images have descriptive alt text
   - Verify "Before" and "After" labels are announced

**Expected Results**:

- ✅ Canvas controls are keyboard accessible
- ✅ All form inputs have proper labels and help text
- ✅ Required fields are marked as required
- ✅ Version selector is navigable
- ✅ Processing status is announced
- ✅ Results are properly labeled

---

### 6. Enhancement Editor

**Objective**: Test image enhancement and upscaling features.

#### Test Steps

1. **Navigate to Enhancement Editor**:
   - Select "Enhance" from toolbar
   - Verify region announcement: "Image enhancement tools, region"

2. **Test Enhance Quality button**:
   - Tab to button
   - Verify announcement: "Enhance image quality, button"
   - Verify help text is announced
   - Press Enter to execute
   - Monitor processing

3. **Test Upscale buttons**:
   - Tab to "Upscale 2x" button
   - Verify announcement: "Upscale image 2x, button"
   - Tab to "Upscale 4x" button
   - Verify announcement: "Upscale image 4x, button"
   - Press Enter on one to execute

4. **Test file size warning**:
   - Verify warning alert is announced
   - Verify announcement: "Upscaling increases file size significantly, alert"

5. **Test comparison toggle**:
   - After processing, tab to "Compare" button
   - Verify announcement: "Show comparison view, button, not pressed"
   - Press Enter to toggle
   - Verify announcement changes to "pressed"

6. **Test resolution comparison**:
   - Navigate to resolution info
   - Verify region announcement: "Resolution comparison, region"
   - Verify original and enhanced dimensions are announced

7. **Test download buttons**:
   - Tab to "Download Original" button
   - Verify announcement: "Download original image, button"
   - Tab to "Download Enhanced" button
   - Verify announcement: "Download enhanced image, button"

**Expected Results**:

- ✅ All buttons are properly labeled
- ✅ Warnings and alerts are announced
- ✅ Toggle button states are announced
- ✅ Comparison view is accessible
- ✅ Download options are clear

---

### 7. Canvas Expander

**Objective**: Test canvas expansion with aspect ratio presets and custom dimensions.

#### Test Steps

1. **Navigate to Canvas Expander**:
   - Select "Expand" from toolbar
   - Verify region announcement: "Canvas expansion tools, region"

2. **Test aspect ratio presets**:
   - Tab through preset buttons
   - Verify announcements: "Select Square 1:1 preset, button, not pressed"
   - Verify description is announced: "Perfect for social media posts"
   - Press Enter to select
   - Verify announcement changes to "pressed"

3. **Test expansion preview**:
   - After selecting preset, navigate to preview
   - Verify region announcement: "Expansion preview, region"
   - Verify visual preview is described
   - Verify dimension labels are announced

4. **Test custom dimensions toggle**:
   - Tab to "Custom Dimensions" button
   - Press Enter to activate
   - Verify custom input fields appear

5. **Test custom dimension inputs**:
   - Tab to "Width" input
   - Verify announcement: "Target width in pixels, edit text"
   - Enter a value
   - Tab to "Height" input
   - Verify announcement: "Target height in pixels, edit text"
   - Enter a value

6. **Test expansion prompt**:
   - Tab to "Expansion Prompt" textarea
   - Verify announcement: "Optional prompt for expansion context, edit text"
   - Verify help text is announced

7. **Test Expand button**:
   - Tab to "Expand Canvas" button
   - Verify announcement: "Expand canvas to selected dimensions, button"
   - Press Enter to execute
   - Monitor processing

8. **Test dimension comparison**:
   - After completion, verify dimension info is announced
   - Verify original and new dimensions are clear

**Expected Results**:

- ✅ Preset buttons announce selection state
- ✅ Preview region is properly labeled
- ✅ Custom inputs have proper labels
- ✅ Validation errors are announced
- ✅ Dimension information is accessible

---

### 8. Loading States and Skeletons

**Objective**: Verify that loading states are properly announced.

#### Test Steps

1. **Trigger any editing operation**:
   - Start an editing operation
   - Verify loading region announcement: "Loading preview, region"

2. **Test skeleton loading**:
   - Verify skeleton elements are hidden from screen reader
   - Verify only meaningful loading messages are announced

3. **Test progress indicators**:
   - Verify progress bar has proper role: "progressbar"
   - Verify current value is announced: "50 percent complete"
   - Verify status messages are announced via aria-live

**Expected Results**:

- ✅ Loading regions are properly labeled
- ✅ Skeleton elements don't clutter screen reader output
- ✅ Progress is announced clearly
- ✅ Status updates are timely

---

### 9. Error Handling

**Objective**: Test that errors are properly announced and accessible.

#### Test Steps

1. **Trigger validation error**:
   - Try to submit a form without required fields
   - Verify error announcement: "Error, Please enter a prompt, alert"

2. **Trigger API error**:
   - Simulate network error (disconnect internet)
   - Try an editing operation
   - Verify error announcement includes helpful message

3. **Test error recovery**:
   - Verify focus management after error
   - Verify user can retry operation

**Expected Results**:

- ✅ Errors are announced immediately
- ✅ Error messages are clear and actionable
- ✅ Focus is managed appropriately
- ✅ Users can recover from errors

---

### 10. Keyboard Shortcuts

**Objective**: Test keyboard shortcuts for editing operations.

#### Test Steps

1. **Test undo shortcut**:
   - Perform an editing operation
   - Press Ctrl+Z (Cmd+Z on Mac)
   - Verify undo action is announced

2. **Test redo shortcut**:
   - After undo, press Ctrl+Y (Cmd+Shift+Z on Mac)
   - Verify redo action is announced

3. **Test escape key**:
   - Open a dropdown menu
   - Press Escape
   - Verify menu closes and focus returns

**Expected Results**:

- ✅ Keyboard shortcuts work as expected
- ✅ Actions are announced
- ✅ Focus management is correct

---

## Common Issues to Check

### Focus Management

- [ ] Focus is visible at all times
- [ ] Focus order is logical
- [ ] Focus is trapped in modals/dialogs
- [ ] Focus returns to trigger element after closing menus

### ARIA Attributes

- [ ] All interactive elements have accessible names
- [ ] Buttons have proper roles
- [ ] Form inputs have associated labels
- [ ] Live regions announce updates
- [ ] Hidden content is properly hidden (aria-hidden)

### Semantic HTML

- [ ] Headings are used correctly (h1, h2, h3)
- [ ] Landmarks are used (main, nav, region)
- [ ] Lists are marked up as lists
- [ ] Buttons are buttons, not divs

### Dynamic Content

- [ ] Loading states are announced
- [ ] Success/error messages are announced
- [ ] Progress updates are announced
- [ ] Content changes are announced

### Images

- [ ] All images have alt text
- [ ] Alt text is descriptive
- [ ] Decorative images have empty alt=""
- [ ] Icons have aria-hidden="true"

---

## Testing Checklist

Use this checklist to track your testing progress:

### Editing Toolbar

- [ ] Toolbar is announced as toolbar
- [ ] All buttons are keyboard accessible
- [ ] Dropdown menus work with keyboard
- [ ] Toggle states are announced
- [ ] Tooltips are accessible

### Background Editor

- [ ] Remove background is accessible
- [ ] Replace background form is accessible
- [ ] Preset selection works with keyboard
- [ ] Color picker is accessible
- [ ] Blur slider is accessible
- [ ] Processing states are announced
- [ ] Results are properly labeled

### Generative Fill Editor

- [ ] Canvas controls are accessible
- [ ] Prompt inputs have proper labels
- [ ] Version selector is accessible
- [ ] Generate button states are correct
- [ ] Results and refined prompts are announced
- [ ] Before/after comparison is accessible

### Enhancement Editor

- [ ] Enhance button is accessible
- [ ] Upscale buttons are accessible
- [ ] File size warnings are announced
- [ ] Comparison toggle works
- [ ] Resolution info is accessible
- [ ] Download buttons are clear

### Canvas Expander

- [ ] Preset buttons are accessible
- [ ] Expansion preview is described
- [ ] Custom dimension inputs work
- [ ] Validation errors are announced
- [ ] Dimension comparison is accessible

### General

- [ ] All forms are accessible
- [ ] All buttons are accessible
- [ ] All images have alt text
- [ ] Loading states are announced
- [ ] Errors are announced
- [ ] Success messages are announced
- [ ] Keyboard shortcuts work
- [ ] Focus management is correct

---

## Reporting Issues

When you find an accessibility issue, document it with:

1. **Component**: Which editing component has the issue
2. **Issue**: What is not working correctly
3. **Expected**: What should happen
4. **Actual**: What actually happens
5. **Screen Reader**: Which screen reader you're using
6. **Browser**: Which browser you're using
7. **Steps**: How to reproduce the issue

### Example Issue Report

```
Component: Background Editor - Replace Background
Issue: Color picker value changes are not announced
Expected: When changing color, screen reader should announce new color value
Actual: No announcement when color changes
Screen Reader: NVDA 2023.1
Browser: Chrome 120
Steps:
1. Navigate to Background Editor
2. Tab to color picker
3. Change color using color picker
4. No announcement of new value
```

---

## Success Criteria

The editing features pass screen reader testing if:

1. ✅ All interactive elements are keyboard accessible
2. ✅ All elements have proper accessible names
3. ✅ All form inputs have associated labels
4. ✅ All dynamic content changes are announced
5. ✅ All images have descriptive alt text
6. ✅ All loading states are announced
7. ✅ All errors are announced clearly
8. ✅ Focus management is correct throughout
9. ✅ Keyboard shortcuts work as expected
10. ✅ No critical WCAG 2.1 Level AA violations

---

## Additional Resources

- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

## Notes

- Testing should be performed by someone familiar with screen reader usage
- Test with multiple screen readers if possible
- Test with keyboard only (no mouse) first
- Document all issues found
- Retest after fixes are implemented
