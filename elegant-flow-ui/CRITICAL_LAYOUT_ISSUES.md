# Critical Layout Issues to Test on /edit Page

## 🚨 HIGH PRIORITY ISSUES

### 1. **ImagePanel Toolbar Button Overflow** (Mobile)

**Location:** `src/components/ImagePanel.tsx` - Toolbar section  
**Issue:** 9+ buttons in toolbar may wrap or overflow on screens <640px  
**Test:** Resize to 320px width  
**Expected:** Buttons should remain accessible, possibly with horizontal scroll or responsive sizing  
**Current Risk:** Buttons may overlap or become inaccessible

### 2. **Tool Panel Accordion Content Overflow** (Short Screens)

**Location:** `src/components/ToolPanel.tsx` - All accordion sections  
**Issue:** GenerativeFillEditor with canvas + controls may overflow  
**Test:** Set viewport height to 600px and open all accordions  
**Expected:** Tool panel should scroll smoothly  
**Current Risk:** Content may be cut off or cause layout shift

### 3. **Resizable Divider Touch Target** (Tablet/Mobile)

**Location:** `src/components/EditPageLayout.tsx` - Divider element  
**Issue:** 1px divider may be too thin to grab on touch devices  
**Test:** Try resizing panels on iPad or touch-enabled device  
**Expected:** Divider should have adequate touch target (44x44px)  
**Current Risk:** Users can't resize panels on touch devices

---

## ⚠️ MEDIUM PRIORITY ISSUES

### 4. **Comparison Slider Usability** (Mobile)

**Location:** `src/components/ImageComparisonSlider.tsx`  
**Issue:** Slider handle may be hard to drag on touch devices  
**Test:** Enable comparison view on mobile and try dragging  
**Expected:** Smooth dragging with adequate touch target  
**Current Risk:** Poor UX on mobile devices

### 5. **Metadata Overlay Positioning** (Mobile + Zoomed)

**Location:** `src/components/ImagePanel.tsx` - Metadata overlay  
**Issue:** Fixed bottom-left position may overlap zoom controls  
**Test:** Enable metadata on mobile with zoomed image  
**Expected:** Overlay should not obscure controls  
**Current Risk:** Controls become inaccessible

### 6. **Loading Message Text Wrapping**

**Location:** `src/pages/EditPage.tsx` - Loading overlay  
**Issue:** Long messages like "Generating fill content..." may wrap awkwardly  
**Test:** Trigger all edit operations on narrow screens  
**Expected:** Messages should wrap gracefully or truncate  
**Current Risk:** Broken layout in loading state

### 7. **Accordion Animation Performance**

**Location:** `src/components/ToolPanel.tsx` - Accordion sections  
**Issue:** Multiple accordions animating simultaneously may cause jank  
**Test:** Rapidly open/close different accordion sections  
**Expected:** Smooth 60fps animations  
**Current Risk:** Laggy UI, poor UX

---

## 📋 LOWER PRIORITY ISSUES

### 8. **Extreme Aspect Ratio Images**

**Location:** `src/components/ImagePanel.tsx` - Image display  
**Issue:** Very wide (21:9) or very tall (9:21) images may not fit properly  
**Test:** Load images with extreme aspect ratios  
**Expected:** Images should fit within viewport with proper scaling  
**Current Risk:** Images may overflow or be too small

### 9. **Pinch-to-Zoom Browser Conflict** (Mobile)

**Location:** `src/components/ImagePanel.tsx` - Touch handlers  
**Issue:** Custom pinch-to-zoom may conflict with browser zoom  
**Test:** Try pinch gesture on mobile browser  
**Expected:** Only app zoom should trigger, not browser zoom  
**Current Risk:** Confusing double-zoom behavior

### 10. **Z-Index Stacking Issues**

**Location:** `src/pages/EditPage.tsx` - Loading overlay  
**Issue:** Loading overlay (z-10) may be covered by other elements  
**Test:** Trigger loading state and check if fully visible  
**Expected:** Loading overlay should be on top of everything  
**Current Risk:** Loading state not visible to user

---

## 🧪 TESTING PROCEDURE

### Quick Test (5 minutes)

1. Open `http://localhost:5175/edit?imageUrl=<test-image>`
2. Resize browser to 320px width → Check toolbar
3. Resize browser to 600px height → Check tool panel scroll
4. Try resizing panels with mouse → Check divider
5. Open all accordions → Check for overflow

### Comprehensive Test (20 minutes)

1. Open `elegant-flow-ui/manual-edit-test.html` in browser
2. Follow all test links and checklists
3. Test each breakpoint: Desktop, Tablet, Mobile, Small Mobile
4. Test all keyboard shortcuts
5. Test all editing tools
6. Document any issues found

### Automated Test

```bash
cd elegant-flow-ui
npm test -- --grep "edit-page"
```

---

## 🔧 QUICK FIXES

If you find these issues, here are suggested fixes:

### Fix #1: Toolbar Overflow

```css
/* In ImagePanel toolbar */
.toolbar {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
@media (max-width: 640px) {
  .toolbar button {
    min-width: 36px;
    padding: 0.5rem;
  }
}
```

### Fix #3: Divider Touch Target

```css
/* In edit-page-layout.css */
.divider::before {
  content: '';
  position: absolute;
  left: -22px;
  right: -22px;
  top: 0;
  bottom: 0;
  cursor: col-resize;
}
```

### Fix #5: Metadata Overlay

```css
/* In ImagePanel */
@media (max-width: 768px) {
  .metadata-overlay {
    bottom: 60px; /* Above toolbar */
  }
}
```

---

## 📊 ISSUE TRACKING

Use this template to report issues:

```markdown
## Issue: [Brief Description]

**Component:** [Component name]
**Severity:** Critical / Major / Minor
**Screen Size:** [Width x Height]
**Browser:** [Chrome/Firefox/Safari]
**Device:** [Desktop/Tablet/Mobile]

### Description
[What's wrong]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Screenshot
[Attach screenshot]

### Suggested Fix
[Potential solution]
```

---

## ✅ SIGN-OFF CHECKLIST

Before marking testing complete:

- [ ] All 10 critical issues tested
- [ ] All responsive breakpoints tested
- [ ] All keyboard shortcuts tested
- [ ] All editing tools tested
- [ ] Dark mode tested
- [ ] Accessibility tested (keyboard nav, screen reader)
- [ ] Performance tested (no jank, smooth animations)
- [ ] Error states tested
- [ ] Issues documented with screenshots
- [ ] Fixes prioritized by severity
