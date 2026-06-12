# 09 — New Creator UI: Migration Plan

## Core Principle

At every phase, the original `creator/index.html` remains fully functional and unchanged. The new shell is opt-in. Users (and developers) can compare both at any time.

---

## Phase A — New Creator Shell (Structure Only)

**Goal:** Create `creator-v2/index.html` with the 3-column layout. Include `creator-23.js` unchanged. All required input IDs are present in the new HTML. The creator is fully functional from day one.

### What this phase delivers
- New 3-column layout (topbar, left sidebar, center canvas, right panel)
- All existing controls in their new logical positions
- Save/load/export working immediately (same functions, same IDs)
- Left sidebar frame layer list visible at all times
- Right panel shows active section controls
- Canvas sticky in the center column
- Old creator accessible at `/creator`, new one at `/creator-v2`

### Files touched
| File | Change |
|---|---|
| `creator-v2/index.html` | **New file** — new shell with all input IDs |
| `css/creator-v2.css` | **New file** — `cc-*` layout classes only |
| `js/creator-v2.js` | **New file** — `activateSection()`, sidebar nav logic (~30 lines) |

**Files NOT touched:**
- `creator-23.js` — zero changes
- `main-1.js` — zero changes
- `css/style-9.css` — zero changes (existing classes still apply to moved inputs)
- `creator/index.html` — zero changes
- All frame/version scripts — zero changes
- localStorage format — zero changes

### What must be tested
- Load a saved card → all inputs populate correctly
- Save a card → loads back correctly
- Download PNG and JPEG → output matches original creator
- Frame group/pack/version loading → picker populates, frames render
- Add frame to card → appears in `#frame-list` in left sidebar
- Drag to reorder frames → order changes in canvas
- Click frame in list → modal editor opens and works
- Text editing → live canvas update
- Art upload (file, URL, clipboard, Scryfall) → canvas updates
- Set symbol fetch → canvas updates
- Watermark → canvas updates
- Collector info → canvas updates
- Auto-frame → triggers and applies correctly
- Frame search autocomplete → shows results, doesn't clip
- Drop-area file upload → works on first page load
- Notification toasts → appear correctly
- Tutorial video → loads and plays

### What not to touch
- `creator-23.js`
- `data/scripts/versions/*`
- `js/frames/*`
- `creator/index.html`
- localStorage schema

### Rollback plan
Delete `creator-v2/`. Zero impact on anything else.

### Phase A implementation notes (2026-06-12)

**Files created:**
- `creator-v2/index.html` — full standalone HTML page (not HTMX fragment)
- `css/creator-v2.css` — cc-* layout classes, three-column grid, sticky canvas at ≥1200px
- `js/creator-v2.js` — `ccActivateSection(name)`, ~20 lines

**All 63 required IDs confirmed present** via automated check (zero missing).

**`#frame-list` moved to sidebar** — `addFrame()` and `loadCard()` still write to it by ID; DOM position doesn't matter to the engine.

**`#show-guidelines-2`** included in Art section (bound to `#show-guidelines` in Frame section by `creator-23.js`'s `bindInputs()`).

**Independent panel scroll deferred** — `.cc-panel` has no `overflow-y: auto` in Phase A. Autocomplete clipping issue prevents it (same as Phase 1.1 finding). Deferred to Phase B.

**Standalone page** — served at `/creator-v2/` directly, not via HTMX. Eliminates `main-1.js` `.drop-area` wiring issue.

**`creator-23.js`, `creator/index.html`, `css/style-9.css`** — confirmed zero changes (git diff empty).

### Risk: 🟢 LOW
The only risk is that an input ID is missed or a required DOM element is absent at script-load time. This produces a console error and broken functionality for that specific feature — easily caught by the test checklist. The original creator is unaffected.

---

## Phase B — Move Controls + Improve Navigation

**Goal:** Refine the new shell based on testing. Improve the sidebar navigation UX. Tighten up the right panel layout. Does not yet change any logic.

### What this phase delivers
- Sidebar sections clearly grouped (Frames, Content, Metadata, Project)
- Frame Pack section: search bar prominent at top, group/pack selects below
- Text section: text-area buttons displayed as a vertical list with current-field highlight
- Art section: position inputs cleaned up (x/y/scale together, remove art option grouped)
- Right panel sections with better visual grouping (not just copy-pasted blocks)
- Responsive breakpoints tuned

### Files touched
| File | Change |
|---|---|
| `creator-v2/index.html` | HTML restructuring within existing panel sections |
| `css/creator-v2.css` | Additional layout styles |

**Files NOT touched:** `creator-23.js`, any existing JS, original creator.

### What must be tested
Full Phase A checklist, plus:
- Right panel doesn't clip any dropdown or popup
- All responsive breakpoints work at 768px, 1024px, 1440px
- Drag-and-drop file upload still works after HTML restructure

### Risk: 🟢 LOW
Only HTML/CSS changes within the new file. Original creator untouched.

### Rollback plan
Revert `creator-v2/index.html` and `creator-v2.css` to Phase A state.

---

## Phase C — Selected-Section / Layer Behavior

**Goal:** Make the editor feel reactive — clicking a layer or section updates the right panel contextually.

### What this phase delivers
- Clicking a frame layer in `#frame-list` activates a "Frame Properties" view in the right panel (shows the same frame-editor controls inline, not just in a modal popup)
- Clicking a text option in `#text-options` activates the text panel and highlights which field is active
- The active section in the sidebar is visually indicated
- Frame editor popup still works as fallback (unchanged)

### What requires new JS
A small `creator-v2.js` addition: intercept layer clicks and panel state. This **wraps** existing behavior (e.g., calls `frameElementClicked()` and also updates panel state). Does not replace or edit `creator-23.js`.

```js
// Example pattern — wraps without replacing
const originalFrameElementClicked = frameElementClicked;
frameElementClicked = function(event) {
    originalFrameElementClicked(event);
    activateSection('frame-properties');
}
```

### Files touched
| File | Change |
|---|---|
| `creator-v2/index.html` | Add frame-properties panel section |
| `css/creator-v2.css` | Active states, panel transitions |
| `js/creator-v2.js` | Intercept layer/text click, update panel |

### What must be tested
- Frame modal popup still opens when clicking a frame (existing behavior preserved)
- Frame properties panel shows correct values
- Switching sections via sidebar works correctly
- No double-firing of event handlers

### Risk: 🟡 MEDIUM
Wrapping existing functions is safe but must be tested for double-fire and for edge cases (e.g., rapid clicking, touch events).

### Rollback plan
Remove the intercept code from `creator-v2.js`. Panel falls back to Phase B behavior.

---

## Phase D — Workflow Improvements

**Goal:** Features that improve the card-making workflow. Each is independent and opt-in.

### Candidates
| Feature | New data? | Risk |
|---|---|---|
| Recent frame packs (last 5 used) | New localStorage key | 🟢 Low |
| Favorite frames (starred) | New localStorage key | 🟢 Low |
| Duplicate current card | Calls `saveCard()` with modified name | 🟢 Low |
| New card (reset) | Calls `resetCardIrregularities()` + clears inputs | 🟡 Medium |
| Card name shown in topbar (live) | Read `card.text.title.text` on draw | 🟢 Low |
| Undo (limited, canvas snapshot) | New state stack | 🔴 High |

### Files touched
| File | Change |
|---|---|
| `js/creator-v2.js` | New workflow functions |
| `creator-v2/index.html` | New UI elements for the features |
| `css/creator-v2.css` | Styles |

**Files NOT touched:** `creator-23.js`.

### What not to touch
- The `card` object schema (new localStorage keys are separate from card data)
- `downloadCard()`, `saveCard()`, `loadCard()` internals

### Risk: 🟢–🟡 LOW to MEDIUM per feature
Implement one at a time. Each is independently revertable.

---

## Phase E — Retire the Old Creator

**Goal:** Once the new creator has confirmed parity with the old one, retire `creator/index.html`.

### Preconditions before Phase E can start
- [ ] All items in `04-test-checklist.md` pass on `creator-v2`
- [ ] At least 2 weeks of parallel use without regressions
- [ ] Confirmed: downloaded PNGs from new and old creator are pixel-identical for the same card
- [ ] Confirmed: cards saved in new creator load correctly in old creator and vice versa
- [ ] Confirmed: all frame packs (or a representative sample) work correctly

### What Phase E does
1. Move `creator-v2/index.html` → `creator/index.html` (overwrite)
2. Move `css/creator-v2.css` → `css/creator-v2.css` (keep path to avoid breaking other refs)
3. Update nav links
4. Keep `creator/index.html.bak` or a git tag for rollback

### Files touched
| File | Change |
|---|---|
| `creator/index.html` | Replaced with creator-v2 version |
| Navigation links | Updated to not mention v2 |

### Risk: 🟡 MEDIUM
Mitigated by the precondition checklist. Rollback is a git revert.

---

## Phase Comparison Table

| Phase | What changes | JS changes | Risk | Rollback |
|---|---|---|---|---|
| **A** | New HTML shell + CSS + tiny nav JS | New file only, zero edits to existing | 🟢 Low | Delete creator-v2/ |
| **B** | Refine layout, better grouping | None | 🟢 Low | Git revert |
| **C** | Selected-section reactivity | Additive wrapper in new file | 🟡 Medium | Remove wrapper code |
| **D** | Workflow features (one at a time) | Additive, new file only | 🟢–🟡 per feature | Remove feature code |
| **E** | Retire old creator | None | 🟡 Medium | Git revert |

---

## Critical Invariants (Must Hold at Every Phase)

1. `creator-23.js` is never modified
2. `data/scripts/versions/*` is never modified
3. `js/frames/*` is never modified
4. `localStorage` card format is never changed
5. `creator/index.html` is untouched until Phase E and only after explicit approval
6. Downloaded card PNGs are pixel-identical between old and new creator for the same card state

---

## Open Questions (Resolve Before Phase A)

1. **HTMX vs direct navigation:** Should `creator-v2` be loaded via HTMX (like the current creator) or as a direct page? HTMX complicates `main-1.js`'s `drop-area` wiring and `creator-23.js`'s init code. Recommendation: serve `creator-v2` as a direct page first, not HTMX-loaded. If HTMX is needed, `htmx:afterSwap` event can re-run wiring.

2. **Autocomplete in the new layout:** Confirm whether putting the frame search in the sidebar (not inside `.cc-panel`) fully resolves the `overflow-y: auto` clipping issue, or whether `frameSearch.js` needs a `position: fixed` change.

3. **`#show-guidelines-2` duplication:** The engine binds `#show-guidelines` and `#show-guidelines-2` together at startup. The new HTML needs both. Simplest solution: include both in new HTML, hide one with `display: none`. Confirm this is acceptable before Phase A.
