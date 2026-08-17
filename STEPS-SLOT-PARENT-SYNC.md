# steps-project-slot → waypoint parent sync

Instructions for updating your **separate** [steps-project-slot](https://github.com/AceConcept/steps-project-slot) repo so the iframe and the waypoint shell stay in sync both ways.

**Waypoint (this repo) is already done.** You only need to change **steps-project-slot**, then redeploy to Vercel.

---

## Why this is needed

- **Waypoint → iframe:** Navbar/sidebar changes the iframe URL (`https://steps-project-slot.vercel.app#1` … `#6`). Already works if your slot app uses hash routes `#1`–`#6`.
- **Iframe → waypoint:** When the user clicks prev/next **inside** the iframe, the shell must update (navbar highlight, sidebar, left story, parent URL). The browser blocks the parent from reading inside a cross-origin iframe, so the slot app must **`postMessage` to `window.parent`**.

---

## Message protocol (must match exactly)

| Direction | `type` | Payload | Purpose |
|-----------|--------|---------|---------|
| iframe → parent | `atencium-step-changed` | `{ step: 1..6 }` | User changed step inside iframe |
| parent → iframe (optional) | `atencium-set-step` | `{ step: 1..6 }` | Parent forces a step |
| parent → iframe (optional) | `atencium-request-step` | none | Parent asks for current step (polling) |

Waypoint listens on:

- Origin: `https://steps-project-slot.vercel.app` (see `src/store/stageEmbedConfig.ts`)
- Type: `atencium-step-changed`

Hash format on both apps: **`#1` … `#6`** (not `#/1`).

---

## Files to add in steps-project-slot

### 1. Create `src/parentBridge.ts`

```ts
/** iframe → waypoint shell */
export const PARENT_STEP_CHANGED = 'atencium-step-changed' as const

/** shell → iframe (optional) */
export const PARENT_SET_STEP = 'atencium-set-step' as const

/** shell polls current step (optional) */
export const PARENT_REQUEST_STEP = 'atencium-request-step' as const

export function notifyParentStep(step: number) {
  if (window.parent === window) return
  window.parent.postMessage({ type: PARENT_STEP_CHANGED, step }, '*')
}
```

### 2. Create `src/useParentBridge.ts`

```ts
import { useEffect, useRef } from 'react'
import { STEP_COUNT } from './steps'
import {
  notifyParentStep,
  PARENT_REQUEST_STEP,
  PARENT_SET_STEP,
} from './parentBridge'

type SetStepFn = (
  updater: number | ((n: number) => number),
  options?: { replaceHash?: boolean },
) => void

/** Listen for messages from the waypoint shell (when embedded in an iframe). */
export function useParentBridge(step: number, setStep: SetStepFn) {
  const stepRef = useRef(step)
  stepRef.current = step

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return

      const data = event.data as { type?: string; step?: number } | null
      if (!data?.type) return

      if (data.type === PARENT_SET_STEP) {
        const n = Number(data.step)
        if (Number.isFinite(n) && n >= 1 && n <= STEP_COUNT) {
          setStep(n, { replaceHash: true })
        }
        return
      }

      if (data.type === PARENT_REQUEST_STEP) {
        notifyParentStep(stepRef.current)
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [setStep])
}
```

### 3. Update `src/App.tsx`

**Imports** — add:

```ts
import { notifyParentStep } from './parentBridge'
import { useParentBridge } from './useParentBridge'
```

**Inside `useStepSynced` (or wherever `setStep` updates the step):**

Whenever the step number actually changes, call:

```ts
notifyParentStep(clamped)
```

Example (inside your `setStepInternal` callback, after you know `clamped !== prev`):

```ts
setHashForStep(clamped, options?.replaceHash ?? false)
notifyParentStep(clamped)
return clamped
```

**Inside your `hashchange` handler:**

When the hash changes and you update state, also call:

```ts
notifyParentStep(fromHash)
```

**In `App` component**, after `useStepSynced()`:

```ts
const [step, setStep] = useStepSynced()
useParentBridge(step, setStep)
```

---

## Reference: full `useStepSynced` pattern

If your `App.tsx` uses hash helpers like `stepFromHash` / `setHashForStep`, the sync hook should look like this:

```ts
function useStepSynced() {
  const [step, setStepInternal] = useState(() => {
    const initial = readInitialStep()
    if (!window.location.hash) {
      setHashForStep(initial, true)
    }
    return initial
  })

  const setStep = useCallback(
    (updater: number | ((n: number) => number), options?: { replaceHash?: boolean }) => {
      setStepInternal((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        const clamped = Math.min(STEP_COUNT, Math.max(1, next))
        if (clamped === prev) return prev
        try {
          sessionStorage.setItem('atencium-step', String(clamped))
        } catch {
          /* ignore */
        }
        setHashForStep(clamped, options?.replaceHash ?? false)
        notifyParentStep(clamped)
        return clamped
      })
    },
    [],
  )

  useEffect(() => {
    const onHashChange = () => {
      const fromHash = stepFromHash()
      if (fromHash == null) return
      setStepInternal((prev) => {
        if (prev === fromHash) return prev
        try {
          sessionStorage.setItem('atencium-step', String(fromHash))
        } catch {
          /* ignore */
        }
        notifyParentStep(fromHash)
        return fromHash
      })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return [step, setStep] as const
}
```

Adjust names (`STORAGE_KEY`, imports) to match your project.

---

## Deploy

1. In **steps-project-slot**:
   ```bash
   npm run build
   ```
2. Deploy to Vercel (push to GitHub if Vercel is connected).
3. Confirm the live app loads a **new** JS asset (filename in `index.html` may change after deploy).

---

## Verify

### On Vercel (slot app alone)

Open [https://steps-project-slot.vercel.app#1](https://steps-project-slot.vercel.app#1), click prev/next — URL hash should change (`#2`, `#3`, …).

### With waypoint (local)

1. **steps-project-slot** does not need to run locally if you deployed to Vercel.
2. In **waypoint**:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173`
4. **Navbar → iframe:** Click Step Two — iframe should show STEP 2.
5. **iframe → shell:** Click prev/next inside iframe — navbar tab and sidebar should update to match.

### Quick check that deploy worked

In browser DevTools on the waypoint page → Network, the iframe should load `steps-project-slot.vercel.app`. After you click inside the iframe, you should **not** need to redeploy waypoint — only the slot app.

Optional: in DevTools Console on the waypoint page, you won’t see the postMessage, but you should see the navbar/sidebar step change when clicking inside the iframe.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Navbar changes iframe, but iframe clicks don’t update shell | Slot deploy doesn’t include `parentBridge` yet, or old Vercel cache — redeploy and hard-refresh |
| Wrong step shown | Hash must be `#1`–`#6` on both apps (not `#/1`) |
| Works on Vercel slot alone but not in iframe | Test embedded on waypoint; `notifyParentStep` only runs when `window.parent !== window` |
| Infinite loop | Only call `notifyParentStep` when step **changes** (`clamped !== prev`) |

---

## Waypoint side (already implemented)

No changes needed in waypoint for this feature. Relevant files:

- `src/store/stageEmbedConfig.ts` — iframe URL + `#1`…`#6`
- `src/store/stageEmbedBridge.ts` — message types
- `src/App.tsx` — listens for `atencium-step-changed`
- `src/store/flowStore.ts` — `syncStepFromEmbed()` updates shell without reloading iframe unnecessarily

---

## Questions

If your `App.tsx` structure differs (e.g. React Router instead of hash), keep the same **message type** and **step number 1–6**; only the hook that calls `notifyParentStep` moves to wherever the active step changes.
