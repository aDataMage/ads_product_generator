# Visual Testing Checklist for /edit Page

## 🎯 Quick Reference Guide

Print this or keep it open while testing the edit page.

---

## DESKTOP VIEW (>1024px)

### Header (Top Bar)

- [ ] Back button visible and aligned left
- [ ] Download button visible
- [ ] Undo button visible (disabled when no history)
- [ ] Redo button visible (disabled when no redo)
- [ ] All buttons have proper spacing
- [ ] Tooltips appear on hover
- [ ] Height is 64px

### Split Panel Layout

- [ ] Tool panel is 40% width
- [ ] Image panel is 60% width
- [ ] Divider is visible (1px line)
- [ ] Divider changes color on hover
- [ ] Can drag divider to resize
- [ ] Panels don't overlap
- [ ] Total height is viewport - 64px
- [ ] No horizontal scrollbar

### Tool Panel (Left Side)

- [ ] "Editing Tools" header visible
- [ ] All 4 accordion sections visible:
  - [ ] Background Tools (Layers icon)
  - [ ] Generative Fill (Sparkles icon)
  - [ ] Enhancement (Wand icon)
  - [ ] Canvas Expander (Maximize icon)
- [ ] Icons are properly colored
- [ ] Text doesn't wrap awkwardly
- [ ] Panel scrolls when content exceeds height
- [ ] Scrollbar is styled

### Image Panel (Right Side)

- [ ] Toolbar at top with all buttons:
  - [ ] Undo, Redo, Reset (left group)
  - [ ] Zoom Out, Zoom %, Zoom In, Fit (center group)
  - [ ] Compare, Info (right group)
- [ ] Image displays centered
- [ ] Image maintains aspect ratio
- [ ] Zoom controls work
- [ ] Pan works when zoomed
- [ ] Cursor changes to grab/grabbing

---

## TABLET VIEW (768px-1024px)

### Layout Changes

- [ ] Tool panel is 35% width
- [ ] Image panel is 65% width
- [ ] All features still accessible
- [ ] Buttons don't overlap
- [ ] Text remains readable

### Touch Interactions

- [ ] Can tap all buttons
- [ ] Divider is grabbable
- [ ] Pinch-to-zoom works
- [ ] Pan works with touch

---

## MOBILE VIEW (<768px)

### Layout Changes

- [ ] Panels stack vertically
- [ ] Tool panel is on top
- [ ] Image panel is below
- [ ] Tool panel max-height is 50vh
- [ ] Image panel min-height is 50vh
- [ ] Both panels scroll independently
- [ ] Divider is hidden

### Header

- [ ] All buttons still visible
- [ ] Buttons don't wrap
- [ ] Touch targets are adequate (44x44px)

### Tool Panel

- [ ] Full width
- [ ] Scrolls smoothly
- [ ] Accordions work
- [ ] All controls accessible

### Image Panel

- [ ] Full width
- [ ] Toolbar buttons visible
- [ ] May need horizontal scroll
- [ ] Touch gestures work

---

## SMALL MOBILE (<480px)

### Critical Checks

- [ ] Tool panel max-height is 40vh
- [ ] Image panel min-height is 60vh
- [ ] All buttons accessible
- [ ] No horizontal overflow
- [ ] Text doesn't overflow
- [ ] Icons are visible

---

## FEATURE TESTING

### Background Tools Accordion

When opened:

- [ ] Remove Background button visible
- [ ] Replace Background section visible
- [ ] Background preset cards display
- [ ] Blur Background section visible
- [ ] Intensity slider works
- [ ] No overflow

### Generative Fill Accordion

When opened:

- [ ] Canvas displays
- [ ] Brush size slider visible
- [ ] Prompt input visible
- [ ] Generate button visible
- [ ] Clear mask button visible
- [ ] Canvas is interactive
- [ ] No overflow

### Enhancement Accordion

When opened:

- [ ] Enhance Quality button visible
- [ ] Upscale section visible
- [ ] Scale factor selector visible
- [ ] All controls accessible
- [ ] No overflow

### Canvas Expander Accordion

When opened:

- [ ] Aspect ratio dropdown visible
- [ ] Preset options display
- [ ] Custom dimensions inputs visible
- [ ] Expand button visible
- [ ] All controls accessible
- [ ] No overflow

---

## INTERACTION TESTING

### Zoom Controls

- [ ] Zoom In increases zoom
- [ ] Zoom Out decreases zoom
- [ ] Fit to Screen works
- [ ] Click zoom % resets to 100%
- [ ] Zoom level updates in display
- [ ] Image scales smoothly

### Pan Controls

- [ ] Can drag image when zoomed
- [ ] Cursor changes to grab
- [ ] Cursor changes to grabbing when dragging
- [ ] Pan is smooth (no jank)
- [ ] Works with mouse
- [ ] Works with touch

### Comparison View

- [ ] Compare button toggles view
- [ ] Slider appears
- [ ] Can drag slider
- [ ] Original shows on left
- [ ] Edited shows on right
- [ ] Slider handle is visible
- [ ] Works smoothly

### Metadata Overlay

- [ ] Info button toggles overlay
- [ ] Overlay appears bottom-left
- [ ] Shows dimensions
- [ ] Shows file size
- [ ] Shows zoom level
- [ ] Readable on all backgrounds
- [ ] Doesn't obscure controls

### Loading State

- [ ] Overlay covers entire panel
- [ ] Spinner is centered
- [ ] Message is visible
- [ ] Backdrop blur works
- [ ] Controls are disabled
- [ ] Can't interact with image

---

## KEYBOARD TESTING

### Shortcuts

- [ ] Ctrl+Z undoes
- [ ] Ctrl+Y redoes
- [ ] Ctrl+R resets
- [ ] Ctrl+S downloads
- [ ] Ctrl+0 fits to screen
- [ ] Ctrl++ zooms in
- [ ] Ctrl+- zooms out
- [ ] Escape goes back

### Navigation

- [ ] Tab moves focus logically
- [ ] Focus indicators visible
- [ ] Can reach all controls
- [ ] No focus trap
- [ ] Skip links work

---

## ACCESSIBILITY TESTING

### Screen Reader

- [ ] Skip links announced
- [ ] Buttons have labels
- [ ] Images have alt text
- [ ] Live regions announce changes
- [ ] Accordion states announced
- [ ] Loading states announced

### Visual

- [ ] Focus indicators visible
- [ ] Color contrast adequate
- [ ] Text is readable
- [ ] Icons are clear
- [ ] Hover states work

---

## ERROR TESTING

### No Image URL

- [ ] Error message displays
- [ ] Message is centered
- [ ] Icon is visible
- [ ] Go Back button works

### Image Load Failure

- [ ] Error message displays
- [ ] Retry button appears
- [ ] Retry button works
- [ ] Go Back button works

### API Failure

- [ ] Toast notification appears
- [ ] Error message is clear
- [ ] Can continue using app
- [ ] Layout doesn't break

---

## DARK MODE TESTING

Repeat all tests in dark mode:

- [ ] Colors have proper contrast
- [ ] Borders are visible
- [ ] Text is readable
- [ ] Icons are visible
- [ ] Hover states work
- [ ] Focus indicators visible
- [ ] Loading overlays work

---

## PERFORMANCE TESTING

### Smoothness

- [ ] Zoom is smooth (60fps)
- [ ] Pan is smooth (60fps)
- [ ] Accordion animations smooth
- [ ] No layout shift
- [ ] No jank during interactions

### Loading

- [ ] Images load quickly
- [ ] No flash of unstyled content
- [ ] Loading indicators appear immediately
- [ ] Transitions are smooth

---

## EDGE CASES

### Extreme Images

- [ ] Very wide image (21:9)
- [ ] Very tall image (9:21)
- [ ] Square image (1:1)
- [ ] Tiny image (100x100)
- [ ] Huge image (4000x4000)

### Long Content

- [ ] Long operation names
- [ ] Long error messages
- [ ] Many edit operations (history)
- [ ] All accordions open

### Rapid Interactions

- [ ] Rapid zoom in/out
- [ ] Rapid accordion open/close
- [ ] Rapid undo/redo
- [ ] Rapid panel resize

---

## BROWSER TESTING

Test in multiple browsers:

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## DEVICE TESTING

Test on real devices:

- [ ] Desktop (Windows/Mac)
- [ ] Tablet (iPad/Android)
- [ ] Mobile (iPhone/Android)

---

## SIGN-OFF

Testing completed by: _______________
Date: _______________
Issues found: _______________
Severity: _______________

All critical issues resolved: [ ] Yes [ ] No
Ready for production: [ ] Yes [ ] No
