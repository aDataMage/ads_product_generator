# 🎯 Quick Test Card - Edit Page Layout

## ⚡ 5-Minute Quick Test

### 1. Open Edit Page

```
http://localhost:5175/edit?imageUrl=https://via.placeholder.com/800x600
```

### 2. Test These 5 Things

#### ✓ Desktop (1920px)

- [ ] Split panels visible (40/60)
- [ ] All toolbar buttons visible
- [ ] Can drag divider to resize

#### ✓ Mobile (375px)

- [ ] Panels stack vertically
- [ ] All toolbar buttons accessible
- [ ] Both panels scroll

#### ✓ Tiny Mobile (320px)

- [ ] Toolbar doesn't overflow
- [ ] All buttons still work
- [ ] Text doesn't wrap badly

#### ✓ Zoom & Pan

- [ ] Zoom in/out works
- [ ] Can drag image when zoomed
- [ ] Cursor changes to grab

#### ✓ Edit Tools

- [ ] Open each accordion
- [ ] All controls visible
- [ ] No overflow issues

---

## 🚨 Top 3 Critical Checks

### 1. Toolbar at 320px

**Resize to 320px → Check ImagePanel toolbar**

- Can you see all 9 buttons?
- Can you click Compare and Info buttons?
- Is there horizontal scroll or wrapping?

### 2. Tool Panel Scroll

**Open all accordions → Check scrolling**

- Does tool panel scroll smoothly?
- Is scrollbar visible?
- Can you reach all controls?

### 3. Divider on Touch

**Use touch device → Try resizing**

- Can you grab the 1px divider?
- Does it respond to touch?
- Is touch target adequate?

---

## 📱 Breakpoint Quick Test

| Width | Layout | Check |
|-------|--------|-------|
| 1920px | Split 40/60 | ✓ All features visible |
| 1024px | Split 40/60 | ✓ No wrapping |
| 768px | Split 35/65 | ✓ Touch targets OK |
| 480px | Stacked | ✓ Both panels scroll |
| 375px | Stacked | ✓ Toolbar accessible |
| 320px | Stacked | ✓ No overflow |

---

## ⌨️ Keyboard Quick Test

Press these keys:

- `Ctrl+Z` → Undo works?
- `Ctrl+Y` → Redo works?
- `Ctrl+0` → Zoom fit works?
- `Ctrl++` → Zoom in works?
- `Ctrl+-` → Zoom out works?
- `Tab` → Focus moves logically?

---

## 🎨 Visual Quick Check

Look for these issues:

- [ ] Buttons overlapping
- [ ] Text cut off
- [ ] Horizontal scrollbar
- [ ] Content overflow
- [ ] Misaligned elements
- [ ] Invisible borders
- [ ] Wrong colors
- [ ] Broken icons

---

## ✅ Pass/Fail Criteria

### PASS if

- ✓ All buttons accessible at all sizes
- ✓ No horizontal overflow
- ✓ Smooth scrolling
- ✓ All features work
- ✓ No visual glitches

### FAIL if

- ✗ Buttons inaccessible on mobile
- ✗ Content cut off
- ✗ Layout breaks at any size
- ✗ Features don't work
- ✗ Major visual issues

---

## 📊 Quick Score

Rate each area 1-5:

- Header: ___/5
- Split Layout: ___/5
- Tool Panel: ___/5
- Image Panel: ___/5
- Responsive: ___/5
- **Total: ___/25**

**20-25:** Excellent, ready to ship  
**15-19:** Good, minor fixes needed  
**10-14:** Fair, major fixes needed  
**<10:** Poor, needs rework

---

## 🔗 Full Documentation

For comprehensive testing:

1. `EDIT_PAGE_TEST_SUMMARY.md` - Start here
2. `CRITICAL_LAYOUT_ISSUES.md` - Top 10 issues
3. `VISUAL_TEST_CHECKLIST.md` - Complete checklist
4. `CSS_INSPECTION_GUIDE.md` - DevTools guide
5. `manual-edit-test.html` - Interactive testing

---

## 🚀 Start Testing Now

1. Dev server running? ✓ (<http://localhost:5175>)
2. Open manual-edit-test.html ✓
3. Click test links
4. Follow this card
5. Document issues
6. Done! 🎉
