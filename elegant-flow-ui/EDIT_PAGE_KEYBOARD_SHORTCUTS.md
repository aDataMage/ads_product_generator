# Edit Page Keyboard Shortcuts Reference

## Quick Reference Card

### Essential Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+Z` | Undo | Revert to previous edit state |
| `Ctrl+Y` | Redo | Restore next edit state |
| `Ctrl+S` | Download | Save current image to device |
| `Escape` | Cancel | Close dialogs or cancel operations |

### Zoom & View

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+0` | Zoom to Fit | Fit entire image in viewport |
| `Ctrl++` | Zoom In | Increase zoom level |
| `Ctrl+=` | Zoom In | Increase zoom level (alternative) |
| `Ctrl+-` | Zoom Out | Decrease zoom level |
| `C` | Compare | Toggle original/edited comparison |

### Navigation

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Tab` | Next Element | Move focus to next interactive element |
| `Shift+Tab` | Previous Element | Move focus to previous element |
| `Enter` | Activate | Activate focused button or control |
| `Space` | Toggle | Toggle accordion sections or checkboxes |
| `Arrow Keys` | Navigate | Navigate within tool sections |

## Detailed Shortcuts

### History Management

#### Undo (Ctrl+Z)

**Action:** Reverts to the previous image state in the edit history

**Behavior:**

- Moves back one step in the history
- Disabled when at the beginning of history
- Works across all edit operations
- Maximum 20 steps back

**Use Cases:**

- Undo an unwanted edit
- Compare different edit states
- Recover from mistakes
- Experiment with different options

**Example Workflow:**

```
1. Remove background (Ctrl+Z available)
2. Replace background (Ctrl+Z available)
3. Press Ctrl+Z → Back to removed background
4. Press Ctrl+Z → Back to original image
```

#### Redo (Ctrl+Y)

**Action:** Restores the next image state in the edit history

**Behavior:**

- Moves forward one step in the history
- Disabled when at the end of history
- Only available after undo
- Cleared when new edit is made

**Use Cases:**

- Restore an undone edit
- Navigate forward through history
- Compare edit states
- Recover accidentally undone changes

**Alternative:** `Ctrl+Shift+Z` (works on some systems)

#### Reset

**Action:** Return to the original image, clearing all edits

**Shortcut:** No keyboard shortcut (use Reset button)

**Behavior:**

- Clears entire edit history
- Returns to the original uploaded image
- Requires confirmation
- Cannot be undone

### Zoom Controls

#### Zoom to Fit (Ctrl+0)

**Action:** Automatically zoom to fit the entire image in the viewport

**Behavior:**

- Calculates optimal zoom level
- Centers the image
- Resets pan position
- Works in both normal and comparison mode

**Use Cases:**

- Get overview of entire image
- Reset after zooming in
- Compare overall composition
- Prepare for new edit operation

#### Zoom In (Ctrl++ or Ctrl+=)

**Action:** Increase zoom level to the next preset

**Behavior:**

- Steps through zoom levels: 0.25x, 0.5x, 0.75x, 1x, 1.5x, 2x, 3x, 4x
- Maintains center point
- Enables pan/drag when zoomed beyond fit
- Maximum zoom: 4x (400%)

**Use Cases:**

- Inspect fine details
- Precise mask drawing
- Quality verification
- Detail editing

#### Zoom Out (Ctrl+-)

**Action:** Decrease zoom level to the previous preset

**Behavior:**

- Steps down through zoom levels
- Maintains center point
- Disables pan when at fit level
- Minimum zoom: 0.25x (25%)

**Use Cases:**

- Get broader view
- Navigate to different area
- Reduce zoom after detail work
- Return to overview

### Image Comparison

#### Toggle Compare (C)

**Action:** Switch between normal view and side-by-side comparison

**Behavior:**

- Shows original (left) and edited (right) images
- Draggable slider to compare areas
- Maintains zoom and pan settings
- Works with all zoom levels

**Use Cases:**

- Verify edit improvements
- Compare before/after
- Check specific areas
- Quality assurance

**Exit:** Press `C` again or click Compare button

### File Operations

#### Download (Ctrl+S)

**Action:** Download the current image to your device

**Behavior:**

- Downloads current image state
- Filename: `edited-image-YYYY-MM-DD-HHmmss.jpg`
- Preserves image quality
- Saves to default downloads folder

**Use Cases:**

- Save final edited image
- Create backup at key stages
- Export for use in other applications
- Archive different versions

**Note:** Browser may prompt for download location depending on settings

### Dialog & Modal Controls

#### Cancel/Close (Escape)

**Action:** Close open dialogs or cancel current operations

**Behavior:**

- Closes confirmation dialogs
- Cancels file selection dialogs
- Exits comparison mode
- Closes tooltips and popovers

**Use Cases:**

- Cancel unwanted actions
- Close dialogs quickly
- Exit modes without mouse
- Keyboard-only navigation

### Accessibility Shortcuts

#### Focus Navigation (Tab / Shift+Tab)

**Action:** Move keyboard focus between interactive elements

**Tab Order:**

1. Back button
2. Download button
3. Tool panel accordion sections
4. Tool controls within sections
5. Image panel toolbar buttons
6. Zoom controls

**Behavior:**

- Visible focus indicator
- Skips disabled elements
- Wraps around at end
- Respects ARIA roles

#### Activate Element (Enter)

**Action:** Activate the currently focused element

**Behavior:**

- Clicks focused button
- Submits focused form
- Toggles focused checkbox
- Opens focused accordion

**Use Cases:**

- Keyboard-only operation
- Accessibility compliance
- Faster workflow
- Screen reader users

#### Toggle Element (Space)

**Action:** Toggle the currently focused element

**Behavior:**

- Expands/collapses accordion sections
- Toggles checkboxes
- Activates toggle buttons
- Opens dropdown menus

**Use Cases:**

- Expand tool sections
- Toggle options
- Keyboard navigation
- Accessibility

#### Arrow Key Navigation

**Action:** Navigate within grouped elements

**Behavior:**

- Navigate between radio buttons
- Scroll through lists
- Move between tabs
- Navigate tool options

**Use Cases:**

- Select preset options
- Navigate tool settings
- Keyboard-only operation
- Faster selection

## Platform Differences

### Windows

All shortcuts use `Ctrl` key:

- `Ctrl+Z`: Undo
- `Ctrl+Y`: Redo
- `Ctrl+S`: Download
- `Ctrl+0`: Zoom to fit
- `Ctrl++`: Zoom in
- `Ctrl+-`: Zoom out

### macOS

Shortcuts use `Cmd` (⌘) key instead of `Ctrl`:

- `Cmd+Z`: Undo
- `Cmd+Shift+Z` or `Cmd+Y`: Redo
- `Cmd+S`: Download
- `Cmd+0`: Zoom to fit
- `Cmd++`: Zoom in
- `Cmd+-`: Zoom out

**Note:** The application automatically detects your platform and uses the appropriate modifier key.

### Linux

Uses `Ctrl` key like Windows:

- Same shortcuts as Windows
- Some desktop environments may intercept certain shortcuts
- Check your system settings if shortcuts don't work

## Customization

### Browser Conflicts

Some shortcuts may conflict with browser defaults:

**Ctrl+S (Download):**

- Browser default: Save page
- Our behavior: Download image
- We prevent default to download image instead

**Ctrl+0 (Zoom to Fit):**

- Browser default: Reset page zoom
- Our behavior: Zoom image to fit
- We prevent default when focus is on edit page

**Ctrl++/- (Zoom):**

- Browser default: Page zoom
- Our behavior: Image zoom
- We prevent default when focus is on image panel

### Disabling Shortcuts

To use browser defaults instead:

1. Click outside the edit page area
2. Browser shortcuts will work normally
3. Edit page shortcuts only work when focused

### Screen Reader Shortcuts

When using a screen reader:

- All shortcuts remain functional
- ARIA announcements for actions
- Status updates read aloud
- Focus changes announced

**NVDA/JAWS:**

- Shortcuts work in browse mode
- Switch to forms mode for tool interaction
- Use screen reader shortcuts for navigation

**VoiceOver:**

- Use VO+Space to activate buttons
- VO+Arrow keys for navigation
- Shortcuts work in Quick Nav mode

## Tips & Best Practices

### Efficient Workflow

1. **Use Ctrl+Z liberally** - Experiment knowing you can undo
2. **Zoom with keyboard** - Faster than clicking buttons
3. **Compare frequently** - Press C to verify improvements
4. **Save at key stages** - Ctrl+S to backup progress
5. **Navigate with Tab** - Faster than mouse for tool switching

### Keyboard-Only Editing

Complete workflow without mouse:

1. `Tab` to navigate to tool section
2. `Space` to expand accordion
3. `Tab` to tool controls
4. `Enter` to activate tool
5. `Ctrl+Z` to undo if needed
6. `C` to compare result
7. `Ctrl+S` to download

### Learning Shortcuts

**Start with these 5:**

1. `Ctrl+Z` - Undo (most important)
2. `Ctrl+0` - Zoom to fit (very useful)
3. `Ctrl+S` - Download (essential)
4. `C` - Compare (helpful)
5. `Escape` - Cancel (convenient)

**Then add:**

6. `Ctrl+Y` - Redo
7. `Ctrl++` - Zoom in
8. `Ctrl+-` - Zoom out
9. `Tab` - Navigate
10. `Enter` - Activate

### Productivity Tips

**Undo/Redo:**

- Hold `Ctrl+Z` to quickly step back through history
- Use `Ctrl+Y` to step forward
- Compare states to find the best version

**Zoom:**

- `Ctrl+0` to reset view
- `Ctrl++` multiple times for detail work
- `Ctrl+-` to zoom out quickly

**Comparison:**

- Press `C` before and after each edit
- Use zoom shortcuts while comparing
- Press `C` again to continue editing

**Download:**

- `Ctrl+S` at key stages
- Create multiple versions
- Name files descriptively in browser prompt

## Troubleshooting

### Shortcuts Not Working

**Problem:** Keyboard shortcuts don't respond

**Solutions:**

1. Click on the edit page to focus it
2. Check if a dialog is open (press Escape)
3. Ensure you're not typing in a text field
4. Try refreshing the page
5. Check browser console for errors

### Wrong Action Triggered

**Problem:** Shortcut does something unexpected

**Solutions:**

1. Check if browser extension is intercepting
2. Verify you're using correct modifier key (Ctrl/Cmd)
3. Ensure focus is on edit page
4. Check for browser shortcut conflicts
5. Try in incognito mode

### Shortcuts Disabled

**Problem:** Some shortcuts are grayed out

**Solutions:**

1. **Undo disabled:** No history to undo
2. **Redo disabled:** At end of history or no redo available
3. **Download disabled:** Operation in progress
4. **Zoom disabled:** Image not loaded

This is expected behavior, not a bug.

## Accessibility Notes

### WCAG Compliance

All keyboard shortcuts meet WCAG 2.1 Level AA requirements:

- **2.1.1 Keyboard:** All functionality available via keyboard
- **2.1.2 No Keyboard Trap:** Focus can move away from all elements
- **2.1.4 Character Key Shortcuts:** Shortcuts use modifier keys
- **2.4.7 Focus Visible:** Clear focus indicators

### Screen Reader Announcements

Shortcuts trigger appropriate announcements:

- **Undo:** "Undone [operation name]"
- **Redo:** "Redone [operation name]"
- **Zoom:** "Zoomed to [level]"
- **Compare:** "Comparison mode [on/off]"
- **Download:** "Downloading image"

### Reduced Motion

Respects `prefers-reduced-motion`:

- Animations disabled or reduced
- Instant transitions
- Shortcuts work identically
- No motion-based feedback

## Quick Reference Printable Card

```
╔════════════════════════════════════════════════════╗
║         EDIT PAGE KEYBOARD SHORTCUTS               ║
╠════════════════════════════════════════════════════╣
║  ESSENTIAL                                         ║
║  Ctrl+Z ........... Undo                          ║
║  Ctrl+Y ........... Redo                          ║
║  Ctrl+S ........... Download                      ║
║  Escape ........... Cancel/Close                  ║
╠════════════════════════════════════════════════════╣
║  ZOOM & VIEW                                       ║
║  Ctrl+0 ........... Zoom to Fit                   ║
║  Ctrl++ ........... Zoom In                       ║
║  Ctrl+- ........... Zoom Out                      ║
║  C ................ Toggle Compare                ║
╠════════════════════════════════════════════════════╣
║  NAVIGATION                                        ║
║  Tab .............. Next Element                  ║
║  Shift+Tab ........ Previous Element              ║
║  Enter ............ Activate                      ║
║  Space ............ Toggle                        ║
║  Arrow Keys ....... Navigate                      ║
╚════════════════════════════════════════════════════╝

Mac users: Replace Ctrl with Cmd (⌘)
```

## Additional Resources

- **User Guide:** See `EDIT_PAGE_USER_GUIDE.md` for detailed feature documentation
- **Accessibility:** See `EDIT_PAGE_ACCESSIBILITY.md` for accessibility features
- **Components:** See `COMPONENTS.md` for technical API documentation
- **Performance:** See `EDIT_PAGE_PERFORMANCE.md` for optimization tips
