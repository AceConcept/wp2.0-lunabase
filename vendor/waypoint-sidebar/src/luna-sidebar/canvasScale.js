/**
 * Canvas scaling — keep DESIGN_REM_H in sync with `--canvas-h` in LunaSidebar.css :root.
 * Design token: 1rem = 16 at default root → CANVAS_W/H = DESIGN_REM_* × DESIGN_ROOT_PX.
 */

export const DESIGN_REM_W = 160;
/** Must match `--canvas-h` in LunaSidebar.css (rem). 1440÷16 = 90rem. */
export const DESIGN_REM_H = 90;
export const DESIGN_ROOT_PX = 16;

export const CANVAS_W = DESIGN_REM_W * DESIGN_ROOT_PX;
export const CANVAS_H = DESIGN_REM_H * DESIGN_ROOT_PX;

/** Must match `--sidebar-collapsed` / `--sidebar-expanded` in LunaSidebar.css (`:root`). */
/** 98px @ 16px/rem — must match `--sidebar-collapsed` in LunaSidebar.css */
export const SIDEBAR_COLLAPSED_REM = 6.125;
export const SIDEBAR_EXPANDED_REM = 49.3125;

/** Must match `--page-row-otf-footer-h` in LunaSidebar.css (`:root`). */
export const OTF_FOOTER_DESIGN_REM = 48;

/** Collapsed vs expanded shell width in design px (before `--luna-scale`). */
export function getSidebarShellDesignWidthPx(expanded) {
  return (
    (expanded ? SIDEBAR_EXPANDED_REM : SIDEBAR_COLLAPSED_REM) * DESIGN_ROOT_PX
  );
}

/** Design-pixel height of the OTF footer band (below main canvas). */
export function getOtfFooterDesignHeightPx() {
  return OTF_FOOTER_DESIGN_REM * DESIGN_ROOT_PX;
}

export function getViewportSize() {
  if (typeof window === "undefined") {
    return { width: CANVAS_W, height: CANVAS_H };
  }
  const vv = window.visualViewport;
  if (vv) {
    return { width: vv.width, height: vv.height };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

/** “Contain” scale: fit full CANVAS_W×CANVAS_H design inside the viewport (may letterbox). */
export function getCanvasContainScale(width, height) {
  const sx = width / CANVAS_W;
  const sy = height / CANVAS_H;
  return Math.min(sx, sy);
}

/**
 * “Cover” / fill-viewport scale: at least one axis fills the viewport; the other may scroll.
 * When the window is short, width uses sx so the band spans edge-to-edge instead of shrinking with min().
 */
export function getCanvasFillViewportScale(width, height) {
  const sx = width / CANVAS_W;
  const sy = height / CANVAS_H;
  return Math.max(sx, sy);
}

/**
 * Contain scale for Luna shell: scaled canvas + scaled OTF footer band fit in viewport height
 * (avoids layout that assumes canvas fills 100vh while footer sits below the fold).
 */
export function getLunaShellContainScale(width, height) {
  const fh = getOtfFooterDesignHeightPx();
  const sx = width / CANVAS_W;
  const sy = height / (CANVAS_H + fh);
  return Math.min(sx, sy);
}
