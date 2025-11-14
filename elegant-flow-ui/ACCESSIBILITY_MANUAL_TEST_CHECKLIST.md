# Pro Mode Accessibility Manual Testing Checklist

This checklist provides step-by-step instructions for manually testing the accessibility features of Pro Mode. Use this checklist to verify accessibility compliance beyond automated testing.

## Prerequisites

- [ ] Pro Mode application running locally
- [ ] Screen reader software installed (NVDA, JAWS, or VoiceOver)
- [ ] Modern web browser (Chrome, Firefox, Safari, or Edge)
- [ ] Keyboard available for testing

## 1. Automated Testing (Already Completed)

✅ **Status:** PASSED  
✅ **Tests:** 34/34 passing  
✅ **Tool:** axe-core + Vitest

Run automated tests:

```bash
cd elegant-flow-ui
npx vitest run src/test/accessibility-audit.test.tsx
```

## 2. Keyboard Navigation Testing

### 2.1 Basic Tab Navigation

- [ ] Open Pro Mode page
- [ ] Press Tab key repeatedly
- [ ] Verify focus moves through elements in logical order:
  1. Scene & Style accordion trigger
  2. Short Description textarea (Scene & Style is open by default)
  3. Background Setting textarea
  4. Style Medium input
  5. Artistic Style input
  6. Context textarea
  7. Lighting accordion trigger
  8. Aesthetics accordion trigger
  9. Camera accordion trigger
  10. Object Builder accordion trigger
  11. Generate Image button

**Expected:** Focus moves in logical order, no elements skipped

### 2.2 Reverse Tab Navigation

- [ ] Navigate to Generate Image button
- [ ] Press Shift+Tab repeatedly
- [ ] Verify focus moves backward through all elements

**Expected:** Reverse navigation works correctly

### 2.3 Accordion Keyboard Control

- [ ] Tab to Lighting accordion trigger
- [ ] Press Enter or Space
- [ ] Verify accordion expands
- [ ] Press Enter or Space again
- [ ] Verify accordion collapses

**Expected:** Accordion responds to Enter and Space keys

### 2.4 Form Field Navigation

- [ ] Expand Scene & Style section (open by default)
- [ ] Tab through all input fields
- [ ] Type text in each field
- [ ] Verify text entry works correctly

**Expected:** All fields accept keyboard input

### 2.5 Object Builder Keyboard Control

- [ ] Tab to Object Builder accordion trigger
- [ ] Press Enter to expand
- [ ] Tab to "Add New Object" button
- [ ] Press Enter or Space
- [ ] Verify new object card appears
- [ ] Tab through object fields
- [ ] Tab to "Remove Object" button
- [ ] Press Enter or Space
- [ ] Verify object is removed

**Expected:** Object management works via keyboard

### 2.6 No Keyboard Traps

- [ ] Navigate through entire form using Tab
- [ ] Verify you can always move forward
- [ ] Navigate backward using Shift+Tab
- [ ] Verify you can always move backward
- [ ] Verify no elements trap focus

**Expected:** No keyboard traps anywhere in the interface

## 3. Screen Reader Testing (NVDA - Windows)

### 3.1 Setup NVDA

- [ ] Download and install NVDA from <https://www.nvaccess.org/>
- [ ] Launch NVDA (Ctrl+Alt+N)
- [ ] Open Pro Mode in browser
- [ ] Ensure NVDA is reading page content

### 3.2 Page Structure

- [ ] Navigate to Pro Mode page
- [ ] Press H to jump between headings
- [ ] Verify NVDA announces:
  - "Pro Mode, heading level 1"
  - "Generated Image, heading level 2" (when image is generated)

**Expected:** Headings properly announced with correct levels

### 3.3 Form Field Labels

- [ ] Tab to Short Description field
- [ ] Verify NVDA announces: "Short Description, required, edit, multi-line"
- [ ] Tab to Style Medium field
- [ ] Verify NVDA announces: "Style Medium, required, edit"
- [ ] Tab through all fields in all sections
- [ ] Verify each field has a clear label announcement

**Expected:** All fields announced with labels and required status

### 3.4 Accordion Sections

- [ ] Tab to Lighting accordion trigger
- [ ] Verify NVDA announces: "Lighting, button, collapsed"
- [ ] Press Enter to expand
- [ ] Verify NVDA announces: "Lighting, button, expanded"

**Expected:** Accordion state changes announced

### 3.5 Object Builder

- [ ] Navigate to Object Builder section
- [ ] Tab to "Add New Object" button
- [ ] Verify NVDA announces: "Add new object to scene, button"
- [ ] Press Enter to add object
- [ ] Verify NVDA announces new object card
- [ ] Tab to "Remove Object" button
- [ ] Verify NVDA announces: "Remove Object 1 from scene, button"

**Expected:** Object management actions clearly announced

### 3.6 Dynamic Content (Loading State)

- [ ] Fill in all required fields
- [ ] Tab to Generate Image button
- [ ] Press Enter
- [ ] Verify NVDA announces: "Please wait while we generate your image..."

**Expected:** Loading status announced automatically

### 3.7 Dynamic Content (Error State)

- [ ] Click Generate without filling fields
- [ ] Verify NVDA announces: "Error: Please fill in all required fields..."

**Expected:** Error messages announced immediately

### 3.8 Dynamic Content (Success State)

- [ ] Complete a successful generation
- [ ] Verify NVDA announces: "Generated Image, region"
- [ ] Verify image alt text is announced

**Expected:** Success state and image announced

## 4. Screen Reader Testing (JAWS - Windows)

### 4.1 Setup JAWS

- [ ] Download JAWS trial from <https://www.freedomscientific.com/>
- [ ] Install and launch JAWS
- [ ] Open Pro Mode in browser

### 4.2 Repeat Tests from Section 3

- [ ] Perform all tests from Section 3 (NVDA) using JAWS
- [ ] Verify similar announcements and behavior
- [ ] Note any differences in announcement style

**Expected:** Similar experience to NVDA

## 5. Screen Reader Testing (VoiceOver - macOS)

### 5.1 Setup VoiceOver

- [ ] Press Cmd+F5 to enable VoiceOver
- [ ] Open Pro Mode in Safari or Chrome
- [ ] Use VO+A to read all content

### 5.2 Repeat Tests from Section 3

- [ ] Perform all tests from Section 3 using VoiceOver
- [ ] Use VO+Right Arrow to navigate
- [ ] Use VO+Space to activate buttons
- [ ] Verify announcements are clear

**Expected:** Similar experience to NVDA/JAWS

## 6. Color Contrast Testing

### 6.1 Manual Contrast Check

- [ ] Open Pro Mode page
- [ ] Take screenshots of all UI elements
- [ ] Use WebAIM Contrast Checker: <https://webaim.org/resources/contrastchecker/>
- [ ] Check contrast ratios:
  - [ ] Body text vs background (minimum 4.5:1)
  - [ ] Heading text vs background (minimum 4.5:1)
  - [ ] Button text vs button background (minimum 4.5:1)
  - [ ] Input borders vs background (minimum 3:1)
  - [ ] Focus indicators vs background (minimum 3:1)
  - [ ] Error text vs background (minimum 4.5:1)

**Expected:** All contrast ratios meet WCAG AA standards

### 6.2 Browser DevTools Contrast Check

- [ ] Open Chrome DevTools (F12)
- [ ] Go to Elements tab
- [ ] Inspect text elements
- [ ] Check "Contrast" section in Styles panel
- [ ] Verify green checkmarks for AA compliance

**Expected:** All text passes AA contrast requirements

## 7. Browser Zoom Testing

### 7.1 Zoom to 150%

- [ ] Open Pro Mode page
- [ ] Press Ctrl++ (or Cmd++ on Mac) to zoom to 150%
- [ ] Verify:
  - [ ] All text is readable
  - [ ] No horizontal scrolling required
  - [ ] Buttons remain clickable
  - [ ] Form fields remain usable
  - [ ] Layout doesn't break

**Expected:** Interface remains fully functional at 150% zoom

### 7.2 Zoom to 200%

- [ ] Continue zooming to 200%
- [ ] Verify:
  - [ ] All text is readable
  - [ ] No horizontal scrolling required (vertical OK)
  - [ ] Buttons remain clickable
  - [ ] Form fields remain usable
  - [ ] Layout adapts appropriately

**Expected:** Interface remains fully functional at 200% zoom

### 7.3 Zoom to 400%

- [ ] Continue zooming to 400%
- [ ] Verify:
  - [ ] Content remains accessible
  - [ ] Vertical scrolling works
  - [ ] No content is cut off
  - [ ] Interactive elements remain accessible

**Expected:** Content remains accessible even at extreme zoom

## 8. Mobile Touch Target Testing

### 8.1 Mobile Device Testing

- [ ] Open Pro Mode on mobile device or use browser DevTools mobile emulation
- [ ] Verify all buttons are at least 44x44 pixels
- [ ] Test tapping all interactive elements
- [ ] Verify no accidental taps on adjacent elements

**Expected:** All touch targets meet 44x44 pixel minimum

### 8.2 Touch Target Measurements

- [ ] Use browser DevTools to measure button dimensions
- [ ] Verify Generate Image button: min-height 44px
- [ ] Verify Add New Object button: min-height 44px
- [ ] Verify Remove Object buttons: min-height 44px
- [ ] Verify all input fields: min-height 44px

**Expected:** All interactive elements meet minimum size

## 9. Reduced Motion Testing

### 9.1 Enable Reduced Motion (Windows)

- [ ] Open Settings > Ease of Access > Display
- [ ] Enable "Show animations in Windows"
- [ ] Refresh Pro Mode page
- [ ] Verify animations are minimal or disabled

### 9.2 Enable Reduced Motion (macOS)

- [ ] Open System Preferences > Accessibility > Display
- [ ] Check "Reduce motion"
- [ ] Refresh Pro Mode page
- [ ] Verify animations are minimal or disabled

**Expected:** Animations respect user preference

## 10. Focus Indicator Testing

### 10.1 Visual Focus Indicators

- [ ] Tab through all interactive elements
- [ ] Verify each element shows a visible focus indicator
- [ ] Verify focus indicator has sufficient contrast
- [ ] Verify focus indicator is at least 2px thick

**Expected:** Clear focus indicators on all interactive elements

### 10.2 Focus Indicator Contrast

- [ ] Tab to each element
- [ ] Take screenshot of focus state
- [ ] Measure contrast of focus indicator vs background
- [ ] Verify minimum 3:1 contrast ratio

**Expected:** Focus indicators meet contrast requirements

## 11. Error Handling Accessibility

### 11.1 Validation Errors

- [ ] Click Generate without filling fields
- [ ] Verify error message appears
- [ ] Verify error message has role="alert"
- [ ] Verify screen reader announces error
- [ ] Verify invalid fields have aria-invalid="true"
- [ ] Verify error messages linked via aria-describedby

**Expected:** Errors properly communicated to all users

### 11.2 Network Errors

- [ ] Disconnect network
- [ ] Try to generate image
- [ ] Verify network error message appears
- [ ] Verify error is announced to screen readers
- [ ] Verify retry button is available

**Expected:** Network errors handled accessibly

## 12. Semantic HTML Testing

### 12.1 HTML Structure

- [ ] Open browser DevTools
- [ ] Inspect page structure
- [ ] Verify:
  - [ ] Buttons use `<button>` elements
  - [ ] Text inputs use `<input>` elements
  - [ ] Multi-line inputs use `<textarea>` elements
  - [ ] Headings use `<h1>`, `<h2>`, etc.
  - [ ] No divs with click handlers instead of buttons

**Expected:** Proper semantic HTML throughout

## 13. ARIA Attributes Testing

### 13.1 ARIA Labels

- [ ] Inspect all form fields
- [ ] Verify each has aria-label or associated <label>
- [ ] Verify object fields have contextual labels
- [ ] Verify buttons have descriptive aria-labels

**Expected:** All interactive elements properly labeled

### 13.2 ARIA Live Regions

- [ ] Inspect loading state element
- [ ] Verify aria-live="polite" attribute
- [ ] Inspect error state element
- [ ] Verify aria-live="assertive" attribute
- [ ] Inspect success state element
- [ ] Verify aria-live="polite" attribute

**Expected:** Dynamic content properly announced

## Testing Completion Checklist

- [ ] All automated tests passing (34/34)
- [ ] Keyboard navigation fully functional
- [ ] Screen reader testing completed (NVDA/JAWS/VoiceOver)
- [ ] Color contrast verified
- [ ] Browser zoom testing completed (150%, 200%, 400%)
- [ ] Mobile touch targets verified
- [ ] Reduced motion support verified
- [ ] Focus indicators visible and sufficient
- [ ] Error handling accessible
- [ ] Semantic HTML verified
- [ ] ARIA attributes verified

## Issues Found

Document any issues found during manual testing:

| Issue | Severity | Description | Status |
|-------|----------|-------------|--------|
| None  | -        | -           | -      |

## Sign-off

- **Tester Name:** ___________________
- **Date:** ___________________
- **Status:** ☐ PASSED ☐ FAILED ☐ NEEDS REVIEW
- **Notes:** ___________________

---

**Next Steps:**

1. Complete all checklist items
2. Document any issues found
3. Create tickets for any failures
4. Retest after fixes
5. Sign off when all tests pass
