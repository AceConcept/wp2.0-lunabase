# Waypoint Steps — Artboard slot & Luna sidebar reference

This document maps how the **center “artboard” column** and the **right-hand Luna sidebar** fit together, which files implement them, and how this app wires them up.

---

## Architecture at a glance

The full-page shell is **`LunaChrome`** (`src/luna/LunaChrome.tsx` + `src/luna/lunaChrome.css`). **`LunaSidebar`** (`luna-sidebar/LunaSidebar.jsx`) is the overlay rail + drawer only.

1. **`.luna-root`** — Root wrapper; receives inline CSS variables (`--luna-scale`, `--luna-center-column-width`, footer height, sidebar shell width, etc.) from `useLayoutEffect`.
2. **`.luna-canvas-row`** — Horizontal band: **`[ .luna-space-left | .luna-center-column | .luna-space-right ]`** plus an **absolutely positioned** sidebar shell on the right.
3. **`.luna-center-column`** — Flex column between gutters: fixed **width** = scaled canvas footprint (`--luna-center-column-width`); does **not** apply `transform: scale` itself.
4. **`.luna-design-surface`** — Inside the center column: **design rem** size (`--canvas-w` × `--canvas-h`) + `transform: scale(var(--luna-scale))`.
5. **`.sidebar-shell`** — Collapsible rail + expandable drawer; docked on the row (scrim dims the canvas row when open).

Shell layout: **`lunaChrome.css`**; sidebar chrome: **`luna-sidebar/LunaSidebar.css`**; scaling helpers: **`luna-sidebar/canvasScale.js`**.

---

## Center column + design surface (`.luna-center-column` / `.luna-design-surface`)

### Role

- **`.luna-center-column`** — Layout box for the center flex **column** (between gutters). It does **not** apply `transform: scale` itself; **width** is **`--luna-center-column-width`** on `.luna-root` (px ≈ `CANVAS_W * scale`).
- **`.luna-design-surface`** — The **design rem** canvas (`--canvas-w` × `--canvas-h`) with **`transform: scale(var(--luna-scale))`** and `transform-origin: 0 0`.
- **Row min-height** tracks the scaled canvas height via **`--luna-canvas-row-min-h`**.

### DOM nesting (from `LunaChrome.tsx` + app children)

```
.luna-center-column
  └── .luna-design-surface
        └── .luna-stage            ← optional; app wraps step UI here
              └── .luna-stage-artboard
                    └── {children}
```

- **`.luna-stage`** — Fills the design surface, scrollable; **right padding** uses **`var(--sidebar-collapsed)`** so content clears the collapsed rail.
- **`.luna-stage-artboard`** — Inner “cinema” plate (2.19∶1 by default). App flow UI in **`src/App.css`** can scope under **`.luna-stage-artboard .flow`** when you add it.

### Stage content

- Passed as **`LunaChrome`** **children** (e.g. **`src/App.tsx`** wraps the steps screen in **`.luna-stage`** / **`.luna-stage-artboard`**).

### Related CSS variables (see `LunaSidebar.css` `:root` and `.luna-root`)

| Variable | Purpose |
|----------|---------|
| `--canvas-w`, `--canvas-h` | Design canvas size in **rem** (160×90 rem ≈ 2560×1440 px at 16px/rem) |
| `--luna-scale` | Set on `.luna-root` by `LunaChrome` from viewport |
| `--luna-center-column-width` | Pixel width of `.luna-center-column` (scaled canvas footprint) |
| `--luna-space-left-bg`, `--luna-space-right-bg` | Gutter colors |
| `--luna-stage-bg` | `.luna-stage` background |
| `--luna-stage-artboard-*` | Aspect ratio and max size of `.luna-stage-artboard` |

### `scaleMode` (`LunaSidebar` prop)

Controls how **`--luna-scale`** is computed from **`getViewportSize()`** (prefers `visualViewport`):

| Mode | Behavior |
|------|----------|
| `canvas-contain` (default) | Fit **main canvas** height `CANVAS_H` in the viewport (`getCanvasContainScale(w, h, CANVAS_H)`). Footer scrolls below. |
| `contain` | Fit **canvas + OTF footer** in one screen (`getTotalDesignHeightPx()`). |
| `height` | Scale by viewport height (`getCanvasHeightFitScale`). |
| `width` | Scale by viewport width (`getCanvasWidthFitScale`). |

---

## Sidebar (`.sidebar-shell` and children)

### Role

- **Collapsed**: narrow **rail** only (`--sidebar-collapsed`, same as `--sidebar-rail-w` in practice for width).
- **Expanded** (class **`m2T_PB`** on shell, drawer, panel): drawer grows to **`--sidebar-expanded` minus rail**; **`--luna-sidebar-bg`** (GRAPHIC or `graphicSrc`) covers shell + drawer.

### Main regions (markup in `LunaSidebar.jsx`)

| Element | Class names | Role |
|---------|-------------|------|
| Row overlay (when expanded) | `.luna-canvas-row-scrim` | Full-row dim; click closes drawer |
| Shell | `.sidebar-shell.UxzaHe.luna-sidebar-dock` + `m2T_PB` when open | Positioned absolute right; width animates collapsed ↔ expanded |
| Host | `.sidebar-host.Bf7PXJ` | Flex row: drawer + rail |
| Drawer | `.sidebar-drawer` + `m2T_PB` | Intro + preview strip |
| Panel | `.sidebar-panel-inner.Q1PD1g` | Inner padding/scroll |
| Content | `.sidebar-panel-content` → `.sidebar-drawer-stack` | **IntroSection** + **PreviewStrip** |
| Rail | `.sidebar-rail` | Toggle button; shows **`railLabel`** (e.g. `"FLOW"` in this app) |

Legacy OTF-style class names (**`UxzaHe`**, **`Q1PD1g`**, **`Bf7PXJ`**) are kept for CSS compatibility; see comments in `LunaSidebar.css`.

### Z-order (documented in CSS)

- `.luna-canvas-row`: stacking context for row
- `.luna-design-surface`: `z-index: 40`
- `.luna-canvas-row-scrim`: `z-index: 35`
- `.sidebar-shell` (dock): `z-index: 45`

### Sidebar data: `items` prop

Each item: `{ id, label, step, title, description, swatch }`.  
**This app** defines them in **`src/flowSidebarItems.ts`**; `id` values align with **`FlowStepId`** in **`src/store/flowStore.ts`** for Zustand sync.

### Callbacks

- **`onActiveItemChange(id)`** — Fires when the preview strip or internal selection changes.
- **`onExpandedChange(open)`** — Fires when the rail toggles the drawer.

---

## File index

| File | Responsibility |
|------|----------------|
| `luna-sidebar/LunaSidebar.jsx` | Layout DOM, scale observer, stage slot, sidebar drawer/rail, `PreviewStrip`, `IntroSection` |
| `luna-sidebar/LunaSidebar.css` | All layout/visual rules: artboard slot, stage, sidebar shell, preview strip, rail |
| `luna-sidebar/canvasScale.js` | `CANVAS_W` / `CANVAS_H`, scale helpers, sidebar shell design widths in px; **must stay in sync** with `--canvas-h` / sidebar rem vars in CSS |
| `luna-sidebar/index.js` | Re-exports `LunaSidebar` and `canvasScale` helpers |
| `luna-sidebar/defaultItems.js` | Demo items (not used when app passes its own `items`) |
| `luna-sidebar/README.md` | Short integration notes for copying the bundle |
| `src/App.tsx` | Mounts `LunaSidebar` with `FLOW_SIDEBAR_ITEMS`, `activeItemId`, `onActiveItemChange`, `railLabel` |
| `src/flowSidebarItems.ts` | Sidebar card copy + ids for the flow |
| `src/store/flowStore.ts` | Zustand flow step state (`goToStepById`, etc.) |
| `src/App.css` | Styles for **`.luna-stage-artboard .flow`** (ready when center content is added) |
| `vite.config.ts` | `@assets` → `src/assets` (used for `GRAPHIC.png` in `LunaSidebar.jsx`) |

---

## Keeping design tokens consistent

- **`canvasScale.js`**: `DESIGN_REM_H` must match **`--canvas-h`** in `LunaSidebar.css`.
- **`OTF_FOOTER_DESIGN_REM`** ↔ **`--page-row-otf-footer-h`**.
- **`SIDEBAR_COLLAPSED_REM` / `SIDEBAR_EXPANDED_REM`** ↔ **`--sidebar-collapsed`** / **`--sidebar-expanded`**.

If these drift, scaling and sidebar width calculations will disagree with the CSS rem layout.

---

## Quick integration notes for the center panel

To render the flow in the artboard, pass React nodes into **`LunaSidebar`** as **`children`** (or `stageContent`), e.g. a component that reads **`useFlowStep()`** / **`useFlowStore`** and uses the same **`.flow`** markup expected by **`App.css`**. Until then, the artboard area remains visually empty while the sidebar and footer region still layout and scale.
