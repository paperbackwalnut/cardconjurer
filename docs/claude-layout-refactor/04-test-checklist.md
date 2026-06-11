# 04 — Manual Test Checklist

Run this checklist after each phase of changes. Check against a known-good baseline (unmodified upstream) if possible.

---

## 0. Baseline Setup

- [ ] App loads without errors (check browser console)
- [ ] All existing saved cards are still listed in Import/Save → Load dropdown
- [ ] No console errors on page load in the creator

---

## 1. Card Creation

- [ ] Select a Frame Group (e.g. "Regular") — frame pack list populates
- [ ] Select a Frame Pack (e.g. "Regular") — frame images appear in picker
- [ ] Click "Load Frame Version" — no error, canvas updates
- [ ] "Auto load" checkbox works — loading a pack auto-loads the version
- [ ] Frame search ("Search Frames...") returns relevant results and loads on selection
- [ ] Selecting a frame image in the picker highlights it correctly
- [ ] Selecting a mask in the picker highlights it correctly
- [ ] "Add Frame to Card" button adds the frame — frame appears in layer list and on canvas
- [ ] "Add Frame to Card (Right Half)" applies mask correctly
- [ ] Frame layer list shows the added frame
- [ ] Dragging to reorder frames in layer list reorders them on canvas
- [ ] Clicking a frame layer entry opens the frame-element-editor popup
- [ ] Frame editor popup: changing X/Y/Width/Height/Opacity updates the canvas
- [ ] Frame editor popup closes via the X button
- [ ] Custom frame image upload (file input) works — image appears in picker
- [ ] Custom frame image via URL works

---

## 2. Text Editing

- [ ] Navigate to Text tab — text area buttons appear (Name, Mana Cost, etc. per loaded frame)
- [ ] Click a text area button — text editor textarea activates
- [ ] Type text in textarea — canvas updates (live or on input)
- [ ] Italic button wraps selected text in `{i}...{/i}`
- [ ] Bold button wraps selected text in `{bold}...{/bold}`
- [ ] Mana symbol codes (e.g. `{w}`, `{2}`) render correctly on canvas
- [ ] "Edit Bounds" button opens the textbox-editor popup
- [ ] Textbox popup: changing X/Y/Width/Height repositions the textbox on canvas
- [ ] Textbox popup closes via X button
- [ ] Font size input changes text size on canvas
- [ ] "Hide reminder text" checkbox hides/shows reminder text
- [ ] "Auto-italicize reminder text" checkbox works
- [ ] "Add Nickname textbox" button adds a textbox

---

## 3. Art

- [ ] Navigate to Art tab
- [ ] File upload (drag & drop or browse) loads art onto card canvas
- [ ] URL input loads art from URL
- [ ] "Paste from clipboard" loads art from clipboard image
- [ ] Card name search (Scryfall) populates the art index dropdown
- [ ] Art index dropdown changes which art is loaded
- [ ] Artist name input updates artist credit on canvas
- [ ] X/Y/Scale/Rotate inputs update art position on canvas
- [ ] Click-and-drag on canvas moves art
- [ ] Shift+drag scales art
- [ ] Ctrl+drag rotates art
- [ ] "Auto Fit Art" button fits art to frame
- [ ] "Autofit when setting art" checkbox works
- [ ] Grayscale checkbox makes art grayscale on canvas
- [ ] "Remove Art" button clears art from canvas

---

## 4. Set Symbol

- [ ] Navigate to Set Symbol tab
- [ ] Set code + rarity inputs fetch a set symbol (e.g. "MH3" + "R")
- [ ] Source dropdown (CardConjurer / Gatherer / Hexproof) changes symbol source
- [ ] File upload adds a custom set symbol
- [ ] URL input loads set symbol from URL
- [ ] X/Y/Scale inputs reposition the set symbol
- [ ] "Reset Set Symbol" resets position
- [ ] "Remove Set Symbol" clears the symbol
- [ ] "Lock set symbol code" checkbox persists set symbol between reloads

---

## 5. Watermark

- [ ] Navigate to Watermark tab
- [ ] Lore-based watermark dropdown loads a watermark image
- [ ] Set code text input loads a set watermark
- [ ] File upload adds a custom watermark
- [ ] URL input loads watermark from URL
- [ ] Left/right color dropdowns tint the watermark
- [ ] Manual color pickers tint the watermark
- [ ] Opacity slider adjusts watermark opacity
- [ ] X/Y/Scale inputs reposition the watermark
- [ ] "Reset Watermark" resets position
- [ ] "Remove Watermark" clears the watermark

---

## 6. Collector Info

- [ ] Navigate to Collector tab
- [ ] Number, Rarity, Note, Set, Language, Artist, Year inputs all update collector info on canvas
- [ ] "Enable imports" checkbox enables Scryfall auto-fill of collector info
- [ ] "Use new collector info style" checkbox changes style on canvas
- [ ] "Show collector info" checkbox shows/hides collector text
- [ ] Serial number fields (number + total) render serial number on canvas
- [ ] Serial number position (X/Y/Scale) inputs work
- [ ] "Reset Serial Number Placement" button works
- [ ] "Toggle Star/Dot" button changes the dot/star symbol
- [ ] "Save as Default" saves current collector info to localStorage
- [ ] "Clear Saved Defaults" removes saved defaults

---

## 7. Save / Load

- [ ] "Save Card" button opens a name prompt and saves the card
- [ ] Saved card appears in the load dropdown
- [ ] Loading a saved card (via dropdown) restores all card state and redraws correctly
- [ ] "Delete Card" removes the selected card from the list
- [ ] "Download Cards File" downloads a `.cardconjurer` file
- [ ] Uploading a previously downloaded `.cardconjurer` file restores saved cards
- [ ] "Download All Images" (bulk zip) works without errors
- [ ] "Delete All" clears all saved cards (with confirmation)
- [ ] Import by card name populates text fields from Scryfall data
- [ ] "Paste card" (paste full text) imports a card's text
- [ ] Import language dropdown affects imported card text

---

## 8. Export / Render

- [ ] "Download your card" button downloads a PNG — file opens, card looks correct
- [ ] "Click here to download as JPEG" downloads a JPEG — file opens, card looks correct
- [ ] "Click here for an alternative download" opens a new tab with the card image
- [ ] Downloaded PNG dimensions are 2010×2814 (or expected resolution)
- [ ] Downloaded card has rounded corners when "Rounded Corners" is checked
- [ ] Downloaded card does NOT show guidelines even if guidelines are visible in editor
- [ ] Canvas and downloaded PNG match visually

---

## 9. Display Options

- [ ] "Rounded Corners" checkbox affects download (not preview)
- [ ] "Guidelines" checkbox shows/hides art/text/watermark/set-symbol guides on preview
- [ ] "Transparencies" checkbox shows/hides transparency visualization on preview
- [ ] "Auto load" (frame auto-load) checkbox state persists

---

## 10. Auto-Frame

- [ ] AutoFrame dropdown (below all tabs) — selecting "Regular" auto-applies M15 frame based on card type
- [ ] AutoFrame disabled option turns off auto-frame
- [ ] "Use Nyx frame for all Enchantments" checkbox works with AutoFrame

---

## 11. Phase 1 Layout Changes — Specific Tests

### Top action bar
- [ ] "Quick actions:" bar is visible above the card creator grid
- [ ] Bar appears immediately when the creator page loads (not inside any tab)
- [ ] **Save Card** button in topbar opens the save-name prompt (same as Import/Save tab → Save Card)
- [ ] **Download PNG** button in topbar downloads a PNG (same output as the bottom Download button)
- [ ] **Download JPEG** button in topbar downloads a JPEG (same output as bottom JPEG link)
- [ ] All three topbar buttons are visually consistent with the site style (dark background, themed font)
- [ ] Topbar buttons do NOT stretch to full width (each sizes to its label)
- [ ] Topbar wraps gracefully on medium-width screens rather than overflowing
- [ ] Original Save / Download buttons in their tabs still work (not removed, not broken)

### Sticky canvas (desktop ≥ 1250px only)
- [ ] On a wide desktop screen, scroll down through the Frame tab — canvas remains visible and pinned
- [ ] Canvas sticks at ~1rem from the top of the viewport, not behind the header
- [ ] Canvas does NOT jitter or jump as the menu scrolls
- [ ] Canvas does NOT overlay any other content
- [ ] On a narrow screen (< 1250px, e.g. 900px wide), canvas scrolls normally with the page (no sticky)
- [ ] On mobile, canvas is at top in single-column layout and behaves normally

### Independent menu scroll (desktop ≥ 1250px only)
- [ ] The menu/control panel has a scrollbar when its content exceeds the viewport height
- [ ] Scrolling the menu panel does NOT scroll the whole page (menu has its own scroll context)
- [ ] On narrow screen (< 1250px), no max-height constraint — all content visible via normal page scroll
- [ ] Frame tab: all sections accessible by scrolling within the menu
- [ ] Text tab: fully accessible
- [ ] Art tab: fully accessible
- [ ] Set Symbol tab: fully accessible
- [ ] Watermark tab: fully accessible
- [ ] Collector tab: fully accessible
- [ ] Import/Save tab: fully accessible
- [ ] Tutorial tab: video iframe loads and plays
- [ ] AutoFrame dropdown (below tabs) still visible after scrolling menu to bottom
- [ ] Original Download buttons (below AutoFrame) still visible and reachable at bottom of menu

### Popup modals (must not be clipped by menu scroll)
- [ ] Frame element editor popup opens centered on screen (not clipped inside the menu scroll box)
- [ ] Textbox bounds editor popup opens centered on screen
- [ ] Both popups are above all other content (z-index correct)

## 12. Layout / UX Regressions (Phase 1 specific)

- [ ] On wide screen (≥ 1250px): canvas is visible while scrolling the menu panel
- [ ] On wide screen: canvas does not shift or jump when scrolling
- [ ] Top action bar (if added) is visible and buttons call the correct functions
- [ ] Top action bar does not cover card content or cause overflow
- [ ] On narrow screen (< 1250px): layout degrades gracefully to single column
- [ ] On mobile: canvas appears above menu, not obscured by top bar
- [ ] Frame element editor popup still appears centered and usable
- [ ] Textbox editor popup still appears centered and usable
- [ ] Hamburger menu still opens/closes correctly
- [ ] All existing tab content is still reachable via tab clicks

---

## 12. Theme / Accessibility

- [ ] Switching theme (via `/theme` page) applies correctly to the creator page
- [ ] Light mode, dark mode both render the new layout correctly
- [ ] No horizontal scroll introduced on any screen size
- [ ] Keyboard navigation still works for inputs and buttons

---

## 13. Existing Project Compatibility

- [ ] Load a card saved before the refactor — card loads and renders correctly
- [ ] Save the loaded card — re-save works, no data loss
- [ ] Cards saved during the refactor load correctly if the app is reverted
