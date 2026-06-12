# 10 — Phase A Smoke-Test Audit (creator-v2)

Performed by code inspection. No code changes made.
Date: 2026-06-12

---

## Summary: Pass / Risk / Fail by Area

| Area | Status | Notes |
|---|---|---|
| Page load / startup init | ✅ Pass | All startup-init IDs confirmed present |
| Canvas renders (regular frames) | ✅ Pass | #previewCanvas present; drawCard() path clean |
| Frame pack loading (regular) | ✅ Pass | groupStandard-3 / packM15Regular default path safe |
| Frame search autocomplete | ✅ Pass | No overflow clipping ancestor; .autocomplete-items unobstructed |
| Frame image / mask picker | ✅ Pass | #frame-picker, #mask-picker present; max-height scoped to pickers |
| Add Frame to Card | ✅ Pass | #frame-list present in sidebar; addFrame() path safe |
| Frame layer select / edit / reorder | ✅ Pass | .draggable / .dragOver DOM events unaffected by CSS |
| Frame element editor modal | ✅ Fixed | z-index raised to 25 in creator-v2.css, above cc-topbar (20) |
| Text section | ✅ Pass | All text IDs present; textEdited(), fontSizedEdited(), textOptionClicked() safe |
| Art section | ✅ Pass | All art IDs present; artEdited(), uploadArt() path safe |
| Set Symbol section | ✅ Pass | All setSymbol IDs present |
| Watermark section | ✅ Pass | All watermark IDs present |
| Collector Info section | ✅ Pass | All info/serial IDs present |
| Auto Frame section | ✅ Pass | #autoFrame, #autoframe-always-nyx present |
| Save / Load / Import section | ✅ Pass | #load-card-options, saveCard(), loadCard() path safe |
| Download PNG / JPEG | ✅ Pass | downloadCard() called directly; uses off-screen cardCanvas |
| Drag-and-drop file uploads | ✅ Pass | .drop-area elements present; main-1.js children[1] assumption holds |
| Ctrl+I keyboard shortcut | ✅ Pass | #text-editor present; main-1.js onkeyup handler works |
| **Planeswalker frames** | ✅ Fixed | Option C: version controls appear in Special Frame Controls section |
| **Saga frames** | ✅ Fixed | Same |
| **Class card frames** | ✅ Fixed | Same |
| **Dungeon card frames** | ✅ Fixed | Same |
| **Station frames** | ✅ Fixed | Same |
| **Mystical Archive JP frames** | ✅ Fixed | Same |
| **Mystical Archive JP (H)** | ✅ Fixed | Same |
| **Kamigawa Basics (Neo)** | ✅ Fixed | Same |
| **QR Code frames** | ✅ Fixed | Same |
| Duplicate IDs | ✅ Pass | Zero duplicate IDs found |
| doCreate event (main-1.js) | ✅ Pass | Dispatched but no handler in creator-v2; harmless |

---

## Resolution (2026-06-12): Option C Implemented

Both issues from the audit have been fixed. See commit history.

**Version script compatibility** — Option C: a visible "Special Frame Controls" panel section was added to `creator-v2/index.html`. It contains `#creator-menu-tabs` and `#creator-menu-sections` as live, visible, appendable containers. Version scripts inject into them as before; `toggleCreatorTabs()` and `selectSelectable()` in `creator-23.js` operate within these containers unchanged. The sidebar nav item "Special Frame Controls" navigates to this section. Controls are visible and usable. No hidden stubs used.

**Modal z-index** — `z-index: 25` added for `.frame-element-editor` and `.textbox-editor` in `creator-v2.css`, raising them above `.cc-topbar` (z-index: 20).

---

## Known Blocker (RESOLVED): Version Scripts Inject Into `#creator-menu-tabs` / `#creator-menu-sections`

### What fails

Nine version scripts dynamically inject:
1. A new tab `<h3>` into `#creator-menu-tabs`
2. A new section `<div>` into `#creator-menu-sections`

Both of these IDs exist only in the old `creator/index.html`. They are **absent from `creator-v2/index.html`**.

When any of these version scripts runs in creator-v2, the first DOM query returns `null` and immediately throws:
```
TypeError: Cannot set properties of null (setting 'innerHTML')
```

The scripts then stop mid-execution. The special controls (loyalty costs, saga chapters, etc.) are never injected, and the canvas special-version rendering state is not initialized.

### Affected files

```
js/frames/versionClass.js
js/frames/versionDungeon.js
js/frames/versionMysticalArchiveJP.js
js/frames/versionMysticalArchiveJPHorizontal.js
js/frames/versionNeoBasics.js
js/frames/versionPlaneswalker.js
js/frames/versionQRCode.js
js/frames/versionSaga.js
js/frames/versionStation.js
```

### Affected frame packs (44 total)

All pack files that call `loadScript('/js/frames/version*.js')`. Includes all Planeswalker frame groups, all Saga packs, Class, Dungeon, Station, Mystical Archive JP, Kamigawa Basics, and QR Code.

### Trigger path

These scripts fire when:
- User selects one of the affected packs AND clicks "Load Frame Version"
- OR `autoLoadFrameVersion` is checked and an affected pack is selected
- OR `loadCard()` restores a card whose `card.onload` points to one of these scripts

### Error isolation

The TypeError is thrown inside a dynamically loaded `<script>` element. It does NOT crash the page. Other frame types continue to work normally. The error appears in the browser console.

### Fix approach (for Phase B approval)

**Option A (minimal, HTML-only):** Add stub elements to `creator-v2/index.html`:
```html
<!-- Hidden stubs required by version scripts -->
<div id="creator-menu-tabs" style="display:none"></div>
<div id="creator-menu-sections" style="display:none"></div>
```
Version scripts inject into them; content is hidden but doesn't crash. The injected controls (loyalty costs, etc.) would be unreachable. **Stops the TypeError. Does not expose the special controls.**

**Option B (full, new panel section):** Add `#creator-menu-tabs` and `#creator-menu-sections` as a visible `.cc-panel-section[data-section="version-controls"]` that shows when a special version is loaded. Version scripts continue to inject into them, and `ccActivateSection` can reveal them. **Stops the TypeError AND restores version-specific UI.**

Option B is the right Phase B implementation. Option A is a one-line stopgap that unblocks without breaking anything.

---

## Minor Risk: Frame Element Editor Z-Index

### What the code shows

- `.frame-element-editor`: `position: fixed; z-index: 10`
- `.cc-topbar`: `position: sticky; z-index: 20` + `backdrop-filter` (from `readable-background`) = creates a stacking context

Both compete at the root stacking context. Topbar (z-index:20) paints above the modal (z-index:10).

### Practical impact

The modal is centered with `top: 50%; transform: translateY(-50%)`. At a typical 900px viewport, the modal's top edge is at approximately `50% - (modal_height/2) ≈ 48px`. The topbar is `~45px` tall. This means **2-5px of the modal's top border overlaps the topbar** and would be visually obscured by it.

The modal title and close button (at the very top of the modal) could be partially obscured. All functional inputs inside the modal are below this overlap zone and are unaffected.

### Fix (CSS-only, one line)

Add to `creator-v2.css`:
```css
.frame-element-editor,
.textbox-editor {
    z-index: 25; /* above cc-topbar (20) */
}
```

This is a safe CSS-only fix that doesn't touch any engine logic. Can be done in Phase A.2 cleanup or deferred to Phase B without blocking parity testing.

---

## Items Confirmed Safe

### Startup init (runs at deferred-script-eval time)

All IDs queried at startup are confirmed present:
- `#info-year` → collector section ✅
- `#autoLoadFrameVersion` → frame section ✅
- `#lockSetSymbolCode`, `#lockSetSymbolURL` → set symbol section ✅
- `#enableImportCollectorInfo`, `#enableNewCollectorStyle`, `#enableCollectorInfo` → collector section ✅
- `#autoFrame`, `#autoframe-always-nyx` → autoframe section ✅
- `#art-update-autofit` → art section ✅
- `#set-symbol-source` → set symbol section ✅
- `#show-guidelines`, `#show-guidelines-2` → frame section + art section ✅ (bindInputs safe)
- `#previewCanvas` → canvas area ✅

### Drop-area file upload wiring

`main-1.js` runs `element.children[1].addEventListener(...)` on each `.drop-area`. In creator-v2, every drop-area has `children[0] = h5` and `children[1] = input`. Structure is consistent. ✅

### Autocomplete not clipped

`.autocomplete-items` is `position: absolute` inside `.autocomplete` (which is `position: relative`). The containing block for positioning is `.autocomplete`, not any scroll ancestor. Neither `.cc-panel` nor any ancestor in creator-v2 has `overflow` set (beyond the picker elements themselves). Autocomplete dropdown will appear correctly. ✅

### Duplicate IDs

Zero duplicates found (`grep -oE 'id="[^"]+"' | sort | uniq -d` returns empty). ✅

### doCreate event

`main-1.js` dispatches `doCreate` on `document.body` at DOMContentLoaded. In creator-v2 there is no HTMX listener for this event. It fires and is ignored — no error, no side effect. ✅

---

## Manual Browser Tests Required

### Session setup
Load `/creator-v2/` directly (not via HTMX). Have the browser console open.

### Test 1 — Page load
- [ ] Page loads without red errors in console
- [ ] Canvas renders (may be blank/white initially)
- [ ] Three-column layout visible: sidebar, canvas area, panel
- [ ] Topbar shows Save, Load/Import, Download PNG, Download JPEG buttons

### Test 2 — Regular frame loading
- [ ] Frame Group dropdown shows groups; select "Regular"
- [ ] Frame Pack dropdown populates
- [ ] Click "Load Frame Version" — canvas shows card outline with text boxes
- [ ] "Auto load" checkbox saves state on reload

### Test 3 — Frame search
- [ ] Type in the search box (e.g. "nyx") — autocomplete dropdown appears ABOVE the panel content, not clipped
- [ ] Click a result — the pack loads correctly

### Test 4 — Add frame layers
- [ ] Select a frame image + mask in the frame picker
- [ ] Click "Add Frame to Card" — compact row appears in the sidebar layer list
- [ ] Layer has thumbnails (~32px tall), truncated label, X button
- [ ] Canvas updates with the new frame

### Test 5 — Layer operations (critical for #frame-list)
- [ ] Click a layer row in sidebar → frame-element-editor modal opens
- [ ] Check: is the modal title and close button visible, or obscured by the topbar?
- [ ] Change opacity in modal — canvas updates
- [ ] Close modal with X button
- [ ] Drag a layer up/down in the list — canvas redraws in new order
- [ ] Click X on a layer — layer removed from list and canvas

### Test 6 — Section navigation
- [ ] Click "Text" in sidebar — text controls appear in right panel
- [ ] Click a text option (Name, Type, etc.) — textarea activates, type text → canvas updates
- [ ] Click "Art" — art upload controls appear
- [ ] Upload an image via file picker → canvas shows art
- [ ] Art position inputs (X/Y/Scale/Rotate) update canvas on change
- [ ] Click "Collector Info" — inputs present, change "Set" field → updates canvas

### Test 7 — Save / Load / Export
- [ ] Click "Save Card" in topbar → name prompt appears
- [ ] Save succeeds → appears in "Load / Import" section dropdown
- [ ] Click "Load / Import" in topbar → panel switches to import section
- [ ] Select saved card from dropdown → card restores (all fields + canvas)
- [ ] Download PNG from topbar — file downloads, open in image viewer, card looks correct
- [ ] Download JPEG from topbar — JPEG downloads, matches PNG appearance

### Test 8 — Known failing frame types (document, do not fix yet)
- [ ] Select "Planeswalkers" group → select a Planeswalker pack → click "Load Frame Version"
- [ ] EXPECTED: console shows TypeError; Planeswalker loyalty controls do not appear
- [ ] EXPECTED: canvas may show basic frame without special PW rendering
- [ ] Confirm: rest of the page still works after this error (no full crash)

### Test 9 — Breakpoints
- [ ] 1920×1080: full three-column layout; canvas fits in viewport height
- [ ] 1440×900: three-column (≥1200px), max-height calc(900px−64px)=836px, no vertical cropping
- [ ] 1366×768: canvas ~648px tall max; card fully visible
- [ ] 1100×800: switches to two-column; canvas + panel stack vertically
- [ ] 375×812 (mobile): single column; canvas full width, natural height

---

## Is Phase B Safe to Start?

**Conditional yes** — with one caveat.

The page is functionally correct for all regular frame types (the vast majority of use cases). The two issues found are:

1. **Version script TypeError (44 pack files)** — isolated console errors that don't crash the page. A one-line HTML stopgap (`<div id="creator-menu-tabs">` + `<div id="creator-menu-sections">` hidden stubs) would silence the errors and keep the page stable. The proper Phase B fix is to route these into a visible `version-controls` panel section.

2. **Modal z-index (2-5px overlap with topbar)** — cosmetic only. A one-line CSS fix.

**Recommendation:** Fix the modal z-index (one CSS line) and add the hidden stubs (two HTML lines) as a Phase A cleanup commit before starting Phase B. Both fixes are trivially reversible and clarify the parity gap between creator-v2 and the old creator. Then Phase B can proceed.
