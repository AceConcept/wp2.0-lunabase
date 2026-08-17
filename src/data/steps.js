/** Luna Base flow — 3 iframe routes: editor, extensions, Python Environments detail. */

export const FLOW_STEP_IDS = ['1', '2', '3']

export const WAYPOINT_TITLE = 'Luna Base'

const STEP_COPY = [
  {
    onScreen: [
      'The iframe is the Luna code editor. Explorer, tabs, and the agent chat sit in one workbench, scaled to the stage.',
      'This is the origin of the install flow. The left aside is how you leave the editor without closing the file.',
    ],
    movingForward:
      'Select the third aside tab in the iframe — Extensions — to open the installed list.',
  },
  {
    onScreen: [
      'Extensions lists what is already installed. Python Environments is the update this run is meant to fetch.',
      'The panel is the catalog inside Luna, not a separate app. Picking a row opens its detail without leaving the editor chrome.',
    ],
    movingForward:
      'Select Python Environments to open the detail drawer and continue.',
  },
  {
    onScreen: [
      'The Python Environments detail is open on top of the list. Copy, version, and Download live in this drawer.',
      'Download installs the update and should raise the confirmation pop-up that ends the flow.',
    ],
    movingForward:
      'Click Download in the iframe to finish, or step back to the list if you need another extension.',
  },
]

export const STEP_TITLES = ['Code Editor Origin', 'Extensions Page', 'Python Environs']

export const STEP_DESCRIPTIONS = STEP_COPY.map((copy) => copy.onScreen[0])

/** Parent shell hashes (`#1` … `#3`). */
export const POLAR_SYS_HASH = Object.fromEntries(FLOW_STEP_IDS.map((id) => [id, `#${id}`]))

/** Luna Next.js routes inside the iframe. */
export const STAGE_EMBED_ROUTE = {
  1: '/',
  2: '/extensions',
  3: '/extensions?extDetail=python-environments',
}

export const SLOT_STEP_TITLES = ['Code Editor Origin', 'Extensions Page', 'Python Environs']

export const SLOT_STEP_DESCRIPTIONS = [
  'Guided flow from the code editor toward installing a new extension update.',
  'Installed extensions list. Select Python Environments to proceed.',
  'Python Environments detail. Click Download to install and complete the flow.',
]

/** iframe target — luna-basev2 production embed. */
export const STAGE_EMBED_ORIGIN = 'https://luna-code-editor.guildconcept.workers.dev'

export const STAGE_PLACEHOLDER_IMAGE = '/stage/0106.73d441.jpg'
export const STAGE_PREVIEW_IMAGES = [
  STAGE_PLACEHOLDER_IMAGE,
  '/stage/HP0_KKgbMAELkUu.jpeg',
]

const STEP_IMAGE_FILES = {
  1: 'Node-StepOne.png',
  2: 'Node-steptwo.png',
}

const SWATCHES = ['#e8e4f0', '#cab6e0', '#dcd4ec']

function stepImagePath(n) {
  const file = STEP_IMAGE_FILES[n] ?? STEP_IMAGE_FILES[1]
  const base = `/step_imgs/${encodeURIComponent(file)}`
  const v =
    typeof __STEP_IMG_VER__ !== 'undefined' && __STEP_IMG_VER__ ? __STEP_IMG_VER__ : ''
  return v ? `${base}?v=${encodeURIComponent(v)}` : base
}

export function getStageEmbedOrigin() {
  const envOrigin = import.meta.env.VITE_STAGE_EMBED_ORIGIN
  if (typeof envOrigin === 'string' && envOrigin.trim()) {
    return envOrigin.trim().replace(/\/$/, '')
  }
  return STAGE_EMBED_ORIGIN
}

export function stageEmbedUrlForStep(id) {
  const base = getStageEmbedOrigin().replace(/\/$/, '')
  const route = STAGE_EMBED_ROUTE[id] ?? '/'
  return `${base}${route}`
}

export function polarFlowIdFromHash(hash) {
  const segment = String(hash || '')
    .replace(/^#/, '')
    .replace(/^\//, '')
    .trim()
  return FLOW_STEP_IDS.includes(segment) ? segment : '1'
}

const STEP_MARK_ICONS = {
  1: '/Icons/steps-info/step-1-icon.svg',
  2: '/Icons/steps-info/step-2-icon.svg',
  3: '/Icons/steps-info/step-3-icn.svg',
}

export function stepMarkIconForStep(id) {
  return STEP_MARK_ICONS[id] ?? STEP_MARK_ICONS[1]
}

export const FLOW_STEPS = FLOW_STEP_IDS.map((id, i) => ({
  id,
  title: STEP_TITLES[i],
  body: STEP_DESCRIPTIONS[i],
  onScreen: STEP_COPY[i].onScreen,
  movingForward: STEP_COPY[i].movingForward,
  navLabel: STEP_TITLES[i],
  navClass: `step-${id}`,
  iframeHash: POLAR_SYS_HASH[id],
  iframeTitle: SLOT_STEP_TITLES[i],
  iframeDescription: SLOT_STEP_DESCRIPTIONS[i],
}))

export const FLOW_SIDEBAR_ITEMS = FLOW_STEPS.map((step, i) => {
  const n = i + 1
  const imageUrl = stepImagePath(n)
  return {
    id: step.id,
    label: step.title,
    step: step.title,
    title: step.title,
    description: step.body,
    previewDescription: '-',
    swatch: SWATCHES[i] ?? SWATCHES[0],
    thumbUrl: imageUrl,
    heroImageUrl: imageUrl,
  }
})
