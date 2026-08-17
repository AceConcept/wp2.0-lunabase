# Luna sidebar (in-repo)

The sidebar is **vendored in this repository** at `vendor/waypoint-sidebar/`. It is not synced from another GitHub repo.

## Edit the sidebar

1. Change files under `vendor/waypoint-sidebar/` (main UI: `src/luna-sidebar/`).
2. From the project root, run `npm install` so `node_modules/waypoint-sidebar` picks up changes.
3. Commit `vendor/waypoint-sidebar` with your app changes.

## Imports

The app imports from the local package name `waypoint-sidebar` (see `package.json` → `file:./vendor/waypoint-sidebar`).

Example:

```ts
import { LunaSidebar } from 'waypoint-sidebar/src/luna-sidebar/index.js'
```

## Do not use

- Git submodules for the sidebar
- `git remote add upstream` → `waypoint-sidebar`
- `git merge upstream/main` at the repo root

Those workflows applied to an older split-repo setup and are not used here.
