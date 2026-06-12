# 07 — New Creator UI: Feasibility Audit

## 1. Engine / Core Logic vs UI / Presentation

### Pure engine — no DOM interaction (safe to ignore during UI rebuild)

| Code | What it does |
|---|---|
| `drawCard()` | Composites art + frames + text + watermark onto `cardCanvas`; copies to `previewCanvas` |
| `drawFrames()` | Renders `card.frames[]` array onto `frameCanvas` using canvas 2D API |
| `drawText()` / `drawTextBuffer()` | Text layout and rendering engine — very complex, ~1400 lines |
| `writeText()` | Low-level text character drawing, mana symbols, ruby annotations |
| `downloadCard()` | Reads `cardCanvas.toDataURL()` — no DOM except the canvas |
| `sizeCanvas()` | Creates/resizes off-screen canvases |
| `scaleX/Y/Width/Height()` | Coordinate scaling helpers — pure math |
| `hsl()` | Canvas pixel-level HSL adjustment |
| `resetCardIrregularities()` | Resets `card` object dimensions |
| `getCardName()` | Reads `card.text` — no DOM |
| `drawNewGuidelines()` | Draws overlay onto `guidelinesCanvas` |
| `bulkDownloadZip()` | Reads `card` state, uses jszip — no DOM except notification |
| All `data/scripts/versions/*/` | Frame-version rendering scripts — load image lists, call `loadTextOptions()` |

The canvas `id='previewCanvas'` is the **only** DOM element the rendering pipeline touches directly. Everything else renders to off-screen canvases that are composited into `cardCanvas`, which is then drawn into `previewCanvas`.

### Engine functions that also mutate the DOM (tightly coupled)

These are the coupling hotspots. Each reads from or writes to specific hardcoded `#id` inputs:

| Function | DOM it touches | Direction |
|---|---|---|
| `loadCard()` | ~30 input `#id`s (see §4) | Writes saved values back into inputs |
| `addFrame()` | `#frame-list` | Appends a draggable row |
| `loadFramePacks()` | `#selectFramePack` | Populates options |
| `loadFramePack()` | `#frame-picker`, `#mask-picker` | Renders image grid |
| `loadTextOptions()` | `#text-options` | Renders text-area selector buttons |
| `frameElementClicked()` | `#frame-element-editor` and all `#frame-editor-*` inputs | Opens popup, sets values |
| `textboxEditor()` | `#textbox-editor` and all `#textbox-editor-*` inputs | Opens popup, sets values |
| `artEdited()` | reads `#art-x`, `#art-y`, `#art-zoom`, `#art-rotate` | Reads input values |
| `setSymbolEdited()` | reads `#setSymbol-x/y/zoom` | Reads input values |
| `watermarkEdited()` | reads `#watermark-x/y/zoom/opacity` | Reads input values |
| `bottomInfoEdited()` | reads `#info-number/rarity/set/language/note/year/artist` | Reads input values |
| `textEdited()` | reads `#text-editor` | Reads textarea value |
| `fontSizedEdited()` | reads `#text-editor-font-size` | Reads input value |
| `textOptionClicked()` | reads/writes `#text-editor`, `#text-editor-font-size` | Sync on selection |
| `loadAvailableCards()` | `#load-card-options` | Populates select dropdown |
| `deleteCard()` | reads `#load-card-options` | Reads selected value |
| `setAutoFrame()` | reads `#autoFrame` | Reads dropdown value |
| `autoLoadFrameVersion()` | reads `#autoLoadFrameVersion` | Reads checkbox |
| `lockSetSymbolCode()` | reads `#lockSetSymbolCode` | Reads checkbox |
| Various init code | reads `#lockSetSymbolURL`, `#info-year`, `#enableCollectorInfo`, etc. | Startup init |

`main-1.js` also runs once at page load and:
- Wires drag-and-drop onto every `.drop-area` element (must exist in DOM at load time)
- Binds URL inputs for enter-key fire
- Defines `notify()`, `uploadFiles()`, `toggleCollapse()`, `bindInputs()`

---

## 2. What Is Only UI / Presentation

These are safe to replace wholesale. They have no rendering side effects:

- The overall page layout (`.creator-grid`, tab system, sidebar/panel structure)
- `.creator-menu-tabs` and `toggleCreatorTabs()` — tab switching is pure UI navigation
- The HTML wrappers around every control (`.readable-background` sections, headings, description text)
- The `.creator-topbar` added in Phase 1
- The collapsible sections (`toggleCollapse()`)
- Tutorial tab content
- The "how are cards saved?" explainer text
- The `moreOptions` collapsed sections

---

## 3. JS Functions / State Objects That Must Be Preserved

### The `card` object (in-memory state)

The entire `card` object must be kept exactly as-is. Its schema is written to localStorage. Key fields:

```
card.frames[]         — array of frame objects with image data
card.text{}           — keyed text objects with text/position/size
card.artSource        — art image URL/data
card.artX/Y/Zoom/Rotate
card.setSymbolSource, setSymbolX/Y/Zoom
card.watermarkSource, watermarkX/Y/Zoom/Opacity
card.watermarkLeft/Right
card.infoNumber/Rarity/Set/Language/Note/Year/Artist
card.version          — loaded version string
card.manaSymbols[]    — array of mana symbol script paths
card.onload           — script path to run on load
card.width/height/marginX/marginY
card.noCorners
card.serialNumber/Total/X/Y/Scale
```

**Do not change any property names** — they are serialized directly to localStorage.

### Functions that must continue to work unchanged

All of `creator-23.js` must run without modification. Specifically:
- `drawCard()`, `downloadCard()`, `saveCard()`, `loadCard()`
- `drawFrames()`, `drawText()`, `addFrame()`, `removeFrame()`
- `loadFramePacks()`, `loadFramePack()`, `loadTextOptions()`
- All `*Edited()` functions — these are the live-update callbacks on inputs

---

## 4. HTML Elements / IDs Required by Existing JS

These **must exist in the DOM** in the new creator shell. Their position can change; their `id` cannot.

### Canvas (engine entry point)
- `#previewCanvas` — the visible card canvas (engine draws to this at end of render)

### Dynamic content containers (engine populates these)
- `#frame-list` — draggable frame layer list (`addFrame()` prepends here)
- `#frame-picker` — frame image grid (`loadFramePack()` builds this)
- `#mask-picker` — mask image grid (same)
- `#text-options` — text-area selector buttons (`loadTextOptions()` builds this)
- `#load-card-options` — saved-card dropdown (`loadAvailableCards()` populates this)
- `#selectFramePack` — frame pack dropdown (`loadFramePacks()` populates this)
- `#selectedPreview` — "(Selected: X, Y)" text label

### Frame/version control
- `#selectFrameGroup` — frame group selector (onchange calls `loadScript`)
- `#loadFrameVersion` — "Load Frame Version" button
- `#autoLoadFrameVersion` — auto-load checkbox
- `#autoframe-always-nyx` — nyx enchantment checkbox
- `#autoFrame` — auto-frame dropdown

### Modal popups (must be in DOM; position: fixed so location doesn't matter)
- `#frame-element-editor` — frame image editor popup
- `#frame-editor-x/y/width/height/opacity/erase/alpha`
- `#frame-editor-color-overlay-check`, `#frame-editor-color-overlay`
- `#frame-editor-hsl-hue/hue-slider/saturation/saturation-slider/lightness/lightness-slider`
- `#frame-editor-masks`
- `#textbox-editor` — textbox bounds popup
- `#textbox-editor-x/y/width/height`

### Text tab
- `#text-editor` — main text textarea
- `#text-editor-font-size`
- `#hide-reminder-text`, `#italicize-reminder-text`

### Art tab
- `#art-x`, `#art-y`, `#art-zoom`, `#art-rotate`
- `#art-name`, `#art-index`, `#art-artist`
- `#art-update-autofit`
- `#grayscale-art`, `#drag-target-setSymbol`
- `#show-guidelines` (and `#show-guidelines-2` — must both exist for `bindInputs()`)

### Set Symbol tab
- `#setSymbol-x`, `#setSymbol-y`, `#setSymbol-zoom`
- `#set-symbol-code`, `#set-symbol-rarity`, `#set-symbol-source`
- `#lockSetSymbolCode`, `#lockSetSymbolURL`

### Watermark tab
- `#watermark-x`, `#watermark-y`, `#watermark-zoom`, `#watermark-opacity`
- `#watermark-left`, `#watermark-right`

### Collector tab
- `#info-number`, `#info-rarity`, `#info-note`, `#info-set`, `#info-language`, `#info-artist`, `#info-year`
- `#serial-number`, `#serial-total`, `#serial-x`, `#serial-y`, `#serial-scale`
- `#enableCollectorInfo`, `#enableImportCollectorInfo`, `#enableNewCollectorStyle`

### Import/Save tab
- `#import-name`, `#import-index`, `#import-language`, `#importAllPrints`
- `#rounded-corners`

### Special-case / dynamic
- `#planeswalker-cost-N`, `#planeswalker-height-N` — created by planeswalker version scripts
- `#station-*` — created by station version scripts
- `.drop-area` elements — must exist **at page load time** for `main-1.js` to wire drag events
- `.notification-container` — used by `notify()`
- `.video > iframe` — tutorial video
- `.frameSearch` / `.autocomplete` — frame search input with autocomplete

### UI-only IDs (safe to replace with new nav logic)
- `#creator-menu-sections` — used only by `toggleCreatorTabs()`, which is a UI function
- `#creator-menu-frame/text/art/setSymbol/watermark/bottomInfo/import/tutorial` — tab content containers

---

## 5. What Can Be Safely Replaced

- The overall HTML layout structure (wrapper divs, column/grid structure)
- Tab navigation (`toggleCreatorTabs()` and the `.creator-menu-tabs` strip)
- The visual grouping/heading text for each section
- The `.creator-menu` wrapper div and everything outside the required IDs
- The global header (if desired for the editor page specifically)
- The `.creator-topbar` from Phase 1 (can be redesigned)
- The hamburger menu (can be replaced with a different nav)
- All `<h5 class='input-description'>` labels (can be reworded/redesigned)
- The collapsible "More options" sections (logic in `main-1.js`, easily kept)

---

## 6. Worst Coupling Points

**Rank 1 — `loadCard()` writes directly to ~30 inputs**
This function restores a saved card by writing into DOM inputs one by one. If any input ID is missing, it silently fails or throws. This is the single most fragile function for a UI rebuild. All ~30 input IDs must be present in the new HTML.

**Rank 2 — Engine startup init code (runs at script load time)**
At the bottom of `creator-23.js`, several initialization blocks run immediately:
```js
document.querySelector('#info-year').value = card.infoYear;
document.querySelector('#lockSetSymbolURL').checked = ...
bindInputs('#show-guidelines', '#show-guidelines-2', true);
loadScript('/js/frames/groupStandard-3.js');
loadAvailableCards();
initDraggableArt();
```
These run when the `<script src='creator-23.js'>` tag evaluates. All referenced IDs must exist **before** this script runs — i.e., they must be in the HTML above the script tag, or the script must be `defer`ed (which it currently is not in the creator page).

**Rank 3 — `#frame-list` is both engine state and visual layer list**
`addFrame()` simultaneously adds to `card.frames[]` AND creates DOM elements in `#frame-list`. The DOM order of `#frame-list` children is the authoritative frame order (used by `removeFrame()` and drag-to-reorder). This tight coupling means `#frame-list` must be the actual visible layer list in the new UI.

**Rank 4 — `.drop-area` wired by `main-1.js` at page load**
`main-1.js` queries all `.drop-area` elements once at `DOMContentLoaded`. If the new creator page is loaded dynamically (HTMX), this wiring won't happen. Workaround: either load the new creator page directly (not via HTMX), or call the wiring function again after HTMX loads the content.

**Rank 5 — Version scripts call `loadTextOptions()` directly**
Every version script (e.g., `data/scripts/versions/m15/regular.js`) calls `loadTextOptions()` which writes into `#text-options`. This is fine as long as `#text-options` exists in the new HTML.

---

## 7. Can a New UI Shell Be Built Incrementally?

**Yes — via parallel file strategy.** The new shell can live at `creator-v2/index.html` while the original `creator/index.html` remains untouched. The approach:

1. Create `creator-v2/index.html` with the new 3-column layout
2. Include `creator-23.js` and `main-1.js` unchanged
3. Place all required input IDs in the new layout (right panel, left panel — wherever appropriate)
4. Keep modal popups (`#frame-element-editor`, `#textbox-editor`) as-is (position: fixed, DOM location doesn't matter)
5. Add a link to the new creator in the nav (opt-in testing)
6. The old `creator/index.html` remains fully functional at all times

The new shell works from day one because it's the same engine with different furniture. Parity testing is straightforward: the same card should render identically in both.

**The key insight:** because the engine reads from DOM inputs at runtime (not at startup except for init), rearranging those inputs into a new layout requires zero JS changes. The engine doesn't care whether `#art-x` is in a left sidebar or a right panel — it just reads `.value` when `artEdited()` is called.
