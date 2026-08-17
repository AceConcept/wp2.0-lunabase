import fs from 'fs'

let s = fs.readFileSync('vendor/waypoint-sidebar/src/luna-sidebar/LunaSidebar.css', 'utf8')
s = s.replace(/@import url\([^)]+\);\s*/, '')

const reps = [
  ['.sidebar-shell.UxzaHe.luna-sidebar-dock', '.wp-sidebar'],
  ['.sidebar-shell.UxzaHe.m2T_PB', '.wp-sidebar.is-expanded'],
  ['.sidebar-shell.UxzaHe', '.wp-sidebar'],
  ['.sidebar-host.Bf7PXJ', '.wp-sidebar__host'],
  ['.sidebar-drawer.m2T_PB', '.wp-sidebar__drawer.is-open'],
  ['.sidebar-drawer', '.wp-sidebar__drawer'],
  ['.sidebar-panel-inner.Q1PD1g.m2T_PB', '.wp-sidebar__panel.is-open'],
  ['.sidebar-panel-inner.Q1PD1g', '.wp-sidebar__panel'],
  ['.sidebar-panel-content', '.wp-sidebar__panel-content'],
  ['.sidebar-drawer-stack__body', '.wp-sidebar__stack-body'],
  ['.sidebar-drawer-stack', '.wp-sidebar__stack'],
  ['.sidebar-drawer-rule-gutter', '.wp-sidebar__rule-gutter'],
  ['.sidebar-drawer-rule-line', '.wp-sidebar__rule-line'],
  ['.sidebar-drawer-rule-scrollbar__thumb', '.wp-sidebar__scroll-thumb'],
  ['.sidebar-drawer-rule-scrollbar', '.wp-sidebar__scroll-track'],
  ['.sidebar-rail', '.wp-sidebar__rail'],
  ['.rail-label', '.wp-sidebar__rail-label'],
  ['.rail-dot', '.wp-sidebar__rail-dot'],
  ['.intro-section', '.wp-sidebar__intro'],
  ['.intro-hero__plate--indexed', '.wp-sidebar__hero-plate--indexed'],
  ['.intro-hero__plate--image', '.wp-sidebar__hero-plate--image'],
  ['.intro-hero__plate', '.wp-sidebar__hero-plate'],
  ['.intro-hero__image', '.wp-sidebar__hero-image'],
  ['.intro-hero__index', '.wp-sidebar__hero-index'],
  ['.intro-hero', '.wp-sidebar__hero'],
  ['.intro-copy', '.wp-sidebar__copy'],
  ['.intro-title', '.wp-sidebar__title'],
  ['.intro-description', '.wp-sidebar__description'],
  ['.intro-actions', '.wp-sidebar__actions'],
  ['.start-btn', '.wp-sidebar__start'],
  ['.intro-info-btn__icon', '.wp-sidebar__info-icon'],
  ['.intro-info-btn', '.wp-sidebar__info'],
  ['.preview-strip__chrome-line--right', '.wp-sidebar__preview-chrome-line--right'],
  ['.preview-strip__chrome-line', '.wp-sidebar__preview-chrome-line'],
  ['.preview-strip__chrome', '.wp-sidebar__preview-chrome'],
  ['.preview-strip', '.wp-sidebar__preview'],
  ['.preview-list__steps', '.wp-sidebar__preview-steps'],
  ['.preview-list', '.wp-sidebar__preview-list'],
  ['.preview-card__step-label', '.wp-sidebar__card-step'],
  ['.preview-card__desc', '.wp-sidebar__card-desc'],
  ['.preview-card__body', '.wp-sidebar__card-body'],
  ['.preview-card__media', '.wp-sidebar__card-media'],
  ['.preview-thumb__image', '.wp-sidebar__thumb-image'],
  ['.preview-thumb__index', '.wp-sidebar__thumb-index'],
  ['.preview-thumb--fill', '.wp-sidebar__thumb'],
  ['.preview-thumb--has-image', '.wp-sidebar__thumb--image'],
  ['.preview-thumb', '.wp-sidebar__thumb'],
  ['.preview-card', '.wp-sidebar__card'],
]

for (const [from, to] of reps) {
  s = s.split(from).join(to)
}

s = s.replace(
  'font-family: "Figtree", sans-serif;',
  'font-family: Inter, system-ui, sans-serif;',
)

const header = `/*
  App-owned Waypoint sidebar styles (ported from vendor LunaSidebar.css).
  Uses Inter only — no Figtree @import.
*/

`
fs.writeFileSync('src/luna/waypointSidebar.css', header + s)
console.log('wrote src/luna/waypointSidebar.css')
