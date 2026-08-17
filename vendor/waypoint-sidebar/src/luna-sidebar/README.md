# Luna sidebar (export bundle)

Copy this entire folder into your React app (e.g. `src/components/luna-sidebar/`), then:

```jsx
import { LunaSidebar, DEFAULT_SLIDER_ITEMS } from "./luna-sidebar";

<LunaSidebar items={myItems} />
```

Import `LunaSidebar.css` is already pulled in by `LunaSidebar.jsx`. Your host app should still provide document shell styles (full-height `html` / `body` / root) like this demo’s `App.css`.

## `items` shape

Each entry:

| Field | Type | Role |
|--------|------|------|
| `id` | string | Stable key; must be unique |
| `label` | string | Short name (a11y / strip) |
| `step` | string | Intro “step” line |
| `title` | string | Main heading + thumb title |
| `description` | string | Body copy |
| `swatch` | string | CSS color for hero + preview thumb |

## Props

| Prop | Default | Description |
|------|---------|-------------|
| `items` | (required) | Array as above |
| `defaultExpanded` | `false` | Drawer open on first paint |
| `initialActiveId` | first item | Initial selection |
| `graphicSrc` | bundled `bg-image-3.png` | Optional URL overriding the expanded drawer background |
| `railLabel` | `"LUNA STATE MANAGER"` | Vertical rail text |
| `onActiveItemChange` | — | `(id) => void` when selection changes |
| `onExpandedChange` | — | `(open: boolean) => void` when drawer toggles |

## Canvas scale

`canvasScale.js` exports `CANVAS_W`, `CANVAS_H`, and helpers. Keep `DESIGN_REM_H` in sync with `--canvas-h` in `LunaSidebar.css` (`:root`).
