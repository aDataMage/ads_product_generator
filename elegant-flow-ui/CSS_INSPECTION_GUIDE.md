# CSS Inspection Guide for /edit Page Layout Issues

## 🔍 How to Use Browser DevTools

### Open DevTools

- **Chrome/Edge:** F12 or Ctrl+Shift+I
- **Firefox:** F12 or Ctrl+Shift+I
- **Safari:** Cmd+Option+I (Mac)

### Useful DevTools Features

1. **Elements Panel:** Inspect HTML structure and CSS
2. **Device Toolbar:** Test responsive breakpoints (Ctrl+Shift+M)
3. **Console:** Check for JavaScript errors
4. **Performance:** Monitor frame rate and jank
5. **Lighthouse:** Run accessibility audit

---

## 🎯 Critical CSS Properties to Inspect

### 1. Header Layout (EditPageHeader)

**Selector:** `.edit-page-header` or header element

**Check These Properties:**

```css
height: 64px;                    /* Should be fixed */
display: flex;                   /* Should use flexbox */
justify-content: space-between;  /* Buttons spread out */
align-items: center;             /* Vertical centering */
padding: 0.75rem 1rem;          /* Adequate spacing */
gap: 0.5rem;                    /* Space between buttons */
```

**Common Issues:**

- Height not fixed → Header size changes
- No gap → Buttons touch each other
- No flex → Buttons don't align

**How to Check:**

1. Right-click header → Inspect
2. Look at Computed tab
3. Verify height is exactly 64px
4. Check if display is flex

---

### 2. Split Panel Layout (EditPageLayout)

**Selector:** `.edit-page-layout`

**Check These Properties:**

```css
display: grid;                           /* Must be grid */
grid-template-columns: 40% 60%;         /* Desktop split */
height: calc(100vh - 64px);             /* Full height minus header */
gap: 0;                                 /* No gap (divider handles it) */
```

**At Tablet (768-1024px):**

```css
grid-template-columns: 35% 65%;         /* Adjusted split */
```

**At Mobile (<768px):**

```css
grid-template-columns: 1fr;             /* Single column */
grid-template-rows: auto 1fr;           /* Stacked */
```

**Common Issues:**

- Not using grid → Panels don't split properly
- Wrong height calculation → Vertical scrollbar appears
- Gap not 0 → Extra space between panels

**How to Check:**

1. Inspect `.edit-page-layout`
2. Check Computed → display should be "grid"
3. Check grid-template-columns value
4. Resize window and watch it change at breakpoints

---

### 3. Tool Panel Scrolling (ToolPanel)

**Selector:** `.tool-panel` or tool panel container

**Check These Properties:**

```css
overflow-y: auto;                       /* Vertical scroll */
overflow-x: hidden;                     /* No horizontal scroll */
height: 100%;                           /* Fill parent */
-webkit-overflow-scrolling: touch;      /* Smooth mobile scroll */
```

**Common Issues:**

- overflow-y: visible → Content overflows without scroll
- No height → Panel doesn't scroll
- overflow-x: auto → Horizontal scrollbar appears

**How to Check:**

1. Inspect tool panel
2. Check Computed → overflow-y should be "auto"
3. Open all accordions
4. Verify scrollbar appears if content exceeds height

---

### 4. Image Panel Toolbar (ImagePanel)

**Selector:** Toolbar div in ImagePanel

**Check These Properties:**

```css
display: flex;                          /* Flexbox layout */
justify-content: space-between;         /* Spread button groups */
align-items: center;                    /* Vertical centering */
gap: 0.5rem;                           /* Space between buttons */
padding: 0.75rem;                      /* Adequate padding */
flex-wrap: nowrap;                     /* Don't wrap (or wrap on mobile) */
```

**At Mobile (<640px):**

```css
overflow-x: auto;                       /* Allow horizontal scroll */
flex-wrap: nowrap;                     /* Keep buttons in row */
```

OR

```css
flex-wrap: wrap;                       /* Wrap to multiple rows */
gap: 0.25rem;                          /* Reduce gap */
```

**Common Issues:**

- flex-wrap: wrap on desktop → Buttons wrap unnecessarily
- No overflow-x on mobile → Buttons overflow invisibly
- Too much gap → Buttons don't fit

**How to Check:**

1. Inspect toolbar
2. Resize to 320px width
3. Check if all buttons are accessible
4. Look for overflow-x: auto or flex-wrap: wrap

---

### 5. Resizable Divider (EditPageLayout)

**Selector:** `.divider`

**Check These Properties:**

```css
width: 1px;                            /* Thin line */
cursor: col-resize;                    /* Resize cursor */
background: hsl(var(--border));        /* Visible color */
position: relative;                    /* For pseudo-element */
```

**Pseudo-element for touch target:**

```css
.divider::before {
  content: '';
  position: absolute;
  left: -22px;                         /* Expand touch area */
  right: -22px;                        /* Expand touch area */
  top: 0;
  bottom: 0;
  background: transparent;
}
```

**Common Issues:**

- No pseudo-element → Too thin to grab on touch
- cursor not col-resize → No visual feedback
- width > 1px → Takes up too much space

**How to Check:**

1. Inspect divider
2. Check width (should be 1px)
3. Check for ::before pseudo-element
4. Hover and verify cursor changes

---

### 6. Image Display (ImagePanel)

**Selector:** Image element in ImagePanel

**Check These Properties:**

```css
max-width: 100%;                       /* Don't exceed container */
max-height: 100%;                      /* Don't exceed container */
object-fit: contain;                   /* Maintain aspect ratio */
transform: scale(...) translate(...);  /* Zoom and pan */
transition: transform 200ms;           /* Smooth zoom */
```

**Common Issues:**

- No max-width/height → Image overflows
- object-fit: cover → Image is cropped
- No transform → Zoom doesn't work

**How to Check:**

1. Inspect image element
2. Check Computed → max-width and max-height
3. Zoom in and watch transform value change
4. Verify aspect ratio is maintained

---

### 7. Accordion Sections (ToolPanel)

**Selector:** `.accordion-item` or accordion elements

**Check These Properties:**

```css
border: 1px solid hsl(var(--border)); /* Visible border */
border-radius: 0.5rem;                /* Rounded corners */
overflow: hidden;                     /* Clip content */
margin-bottom: 0.75rem;               /* Space between items */
```

**Accordion Content:**

```css
max-height: 0;                        /* Collapsed state */
overflow: hidden;                     /* Hide overflow */
transition: max-height 300ms;         /* Smooth animation */
```

**Common Issues:**

- No overflow: hidden → Content visible when collapsed
- No transition → Abrupt open/close
- No max-height → Animation doesn't work

**How to Check:**

1. Inspect accordion item
2. Toggle open/close
3. Watch max-height change in Styles panel
4. Verify smooth animation

---

### 8. Loading Overlay (EditPage)

**Selector:** Loading overlay div

**Check These Properties:**

```css
position: absolute;                    /* Overlay positioning */
inset: 0;                             /* Cover entire parent */
z-index: 10;                          /* Above other content */
background: rgba(0, 0, 0, 0.8);       /* Semi-transparent */
backdrop-filter: blur(4px);           /* Blur background */
display: flex;                        /* Center content */
align-items: center;                  /* Vertical center */
justify-content: center;              /* Horizontal center */
```

**Common Issues:**

- z-index too low → Covered by other elements
- No inset: 0 → Doesn't cover entire area
- No backdrop-filter → Background not blurred

**How to Check:**

1. Trigger loading state
2. Inspect overlay
3. Check z-index value
4. Verify it covers entire image panel

---

### 9. Comparison Slider (ImageComparisonSlider)

**Selector:** `.comparison-slider` or slider container

**Check These Properties:**

```css
position: relative;                    /* For absolute children */
width: 100%;                          /* Full width */
height: auto;                         /* Auto height */
overflow: hidden;                     /* Clip images */
```

**Slider Handle:**

```css
position: absolute;                    /* Overlay positioning */
top: 0;
bottom: 0;
width: 4px;                           /* Visible handle */
cursor: ew-resize;                    /* Resize cursor */
z-index: 2;                           /* Above images */
```

**Common Issues:**

- No overflow: hidden → Images extend beyond container
- Handle width too small → Hard to grab
- No cursor change → No visual feedback

**How to Check:**

1. Enable comparison view
2. Inspect slider handle
3. Check width (should be 4px or more)
4. Try dragging on touch device

---

### 10. Metadata Overlay (ImagePanel)

**Selector:** Metadata overlay div

**Check These Properties:**

```css
position: absolute;                    /* Overlay positioning */
bottom: 1rem;                         /* From bottom */
left: 1rem;                           /* From left */
background: rgba(255, 255, 255, 0.95); /* Semi-transparent */
backdrop-filter: blur(8px);           /* Blur background */
padding: 0.75rem;                     /* Internal spacing */
border-radius: 0.5rem;                /* Rounded corners */
z-index: 1;                           /* Above image */
```

**At Mobile (<768px):**

```css
bottom: 4rem;                         /* Above toolbar */
max-width: calc(100% - 2rem);         /* Don't overflow */
```

**Common Issues:**

- Fixed bottom position → Overlaps toolbar on mobile
- No max-width → Overflows on narrow screens
- z-index too low → Hidden behind image

**How to Check:**

1. Enable metadata overlay
2. Resize to mobile
3. Check if it overlaps toolbar
4. Verify it's readable on all backgrounds

---

## 🐛 Common Layout Bug Patterns

### Pattern 1: Overflow Issues

**Symptoms:** Horizontal scrollbar, content cut off  
**Check:** overflow-x, overflow-y, max-width, width  
**Fix:** Add overflow: hidden or overflow: auto

### Pattern 2: Flexbox Not Working

**Symptoms:** Items not aligned, gaps wrong  
**Check:** display: flex, flex-direction, gap, justify-content  
**Fix:** Ensure parent has display: flex

### Pattern 3: Grid Not Working

**Symptoms:** Panels not splitting, wrong proportions  
**Check:** display: grid, grid-template-columns, grid-template-rows  
**Fix:** Ensure parent has display: grid

### Pattern 4: Z-Index Issues

**Symptoms:** Elements covered by others  
**Check:** z-index, position (must be relative/absolute/fixed)  
**Fix:** Increase z-index or add position

### Pattern 5: Height Not Working

**Symptoms:** Element doesn't fill space  
**Check:** height, parent height, display  
**Fix:** Ensure parent has defined height

### Pattern 6: Responsive Not Working

**Symptoms:** Layout doesn't change at breakpoints  
**Check:** @media queries, viewport meta tag  
**Fix:** Add/fix media queries

---

## 📱 Responsive Breakpoint Testing

### Test Each Breakpoint

**Desktop (1920px)**

```bash
# In DevTools Device Toolbar
Width: 1920px
Height: 1080px
```

**Laptop (1366px)**

```bash
Width: 1366px
Height: 768px
```

**Tablet (768px)**

```bash
Width: 768px
Height: 1024px
```

**Mobile (375px)**

```bash
Width: 375px
Height: 667px
```

**Small Mobile (320px)**

```bash
Width: 320px
Height: 568px
```

### At Each Breakpoint, Check

1. Layout structure (grid columns)
2. Button sizes and spacing
3. Text readability
4. Image display
5. Scrolling behavior
6. Touch targets (44x44px minimum)

---

## 🎨 Color Contrast Testing

### Check These Combinations

**Light Mode:**

- Text on background: 4.5:1 minimum
- Button text on button: 4.5:1 minimum
- Icon on background: 3:1 minimum

**Dark Mode:**

- Same ratios as light mode
- Borders must be visible

### How to Check

1. Use DevTools Color Picker
2. Click contrast ratio indicator
3. Verify it meets WCAG AA standards

---

## ⚡ Performance Testing

### Check Frame Rate

1. Open DevTools → Performance tab
2. Start recording
3. Zoom in/out rapidly
4. Stop recording
5. Check FPS (should be 60fps)

### Check for Jank

1. Look for red bars in Performance timeline
2. Check for long tasks (>50ms)
3. Verify smooth animations

### Common Performance Issues

- Too many DOM elements
- Expensive CSS (backdrop-filter, box-shadow)
- No debouncing on scroll/resize
- Large images not optimized

---

## 📋 Quick Inspection Checklist

For each component:

- [ ] Display property correct (flex/grid/block)
- [ ] Width/height values correct
- [ ] Overflow behavior correct
- [ ] Z-index stacking correct
- [ ] Responsive breakpoints work
- [ ] Colors have adequate contrast
- [ ] Animations are smooth (60fps)
- [ ] Touch targets adequate (44x44px)
- [ ] No horizontal scrollbar
- [ ] No layout shift

---

## 🔧 DevTools Shortcuts

- **Inspect Element:** Ctrl+Shift+C
- **Toggle Device Toolbar:** Ctrl+Shift+M
- **Refresh:** Ctrl+R
- **Hard Refresh:** Ctrl+Shift+R
- **Screenshot:** Ctrl+Shift+P → "screenshot"
- **Accessibility Tree:** Elements → Accessibility tab
