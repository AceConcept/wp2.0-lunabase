import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import defaultDrawerGraphic from "../assets/graphics/bg-image-3.png";
import { useLunaCanvasScale } from "./LunaCanvasScaleContext.jsx";
import "./LunaSidebar.css";

const PREVIEW_SCROLLBAR_MIN_THUMB_PX = 24;

const DEFAULT_INFO_TOOLTIP = "More Information";

function parseCssLengthToPx(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  if (s.endsWith("rem")) {
    const n = parseFloat(s);
    if (Number.isNaN(n)) return null;
    const rootPx =
      parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return n * rootPx;
  }
  const n = parseFloat(s);
  return Number.isNaN(n) ? null : n;
}

function getPreviewScrollbarTrackGeometry(list, gutter, strip) {
  const gutterRect = gutter.getBoundingClientRect();
  const gutterH = gutterRect.height;
  const listRect = list.getBoundingClientRect();

  let topPx = listRect.top;
  let bottomPx = listRect.bottom;

  if (strip) {
    const stripRect = strip.getBoundingClientRect();
    const chrome = strip.querySelector(".preview-strip__chrome");
    const chromeRect = chrome ? chrome.getBoundingClientRect() : stripRect;
    topPx = Math.max(chromeRect.bottom, listRect.top);
    bottomPx = Math.min(stripRect.bottom, listRect.bottom);
  }

  const listTop = topPx - gutterRect.top;
  const listBottom = bottomPx - gutterRect.top;
  const trackTop = Math.max(0, listTop);
  const trackBottom = Math.min(gutterH, listBottom);
  const trackHeight = Math.max(0, trackBottom - trackTop);
  return { trackTop, trackHeight, gutterH };
}

function readDrawerScrollbarHeightAdjustPx() {
  return (
    parseCssLengthToPx(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--drawer-scrollbar-track-height-adjust",
      ),
    ) ?? 0
  );
}

function readDrawerScrollbarThumbMinPx() {
  const v = parseCssLengthToPx(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--drawer-scrollbar-thumb-min-height",
    ),
  );
  return v != null && v >= 0 ? v : PREVIEW_SCROLLBAR_MIN_THUMB_PX;
}

function readDrawerScrollbarThumbHeightAdjustPx() {
  return (
    parseCssLengthToPx(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--drawer-scrollbar-thumb-height-adjust",
      ),
    ) ?? 0
  );
}

function computeDrawerScrollbarThumbHeight(clientHeight, scrollHeight, trackH) {
  const minPx = readDrawerScrollbarThumbMinPx();
  const addPx = readDrawerScrollbarThumbHeightAdjustPx();
  const proportional = (clientHeight / scrollHeight) * trackH;
  const rawThumb = Math.max(minPx, proportional + addPx);
  return Math.min(trackH, rawThumb);
}

function useSyncedPreviewScrollbar(
  previewListRef,
  gutterRef,
  panelInnerRef,
  previewStripRef,
  syncKey,
) {
  const layoutScale = useLunaCanvasScale();
  const toLayoutPx = layoutScale > 0 ? 1 / layoutScale : 1;

  const [state, setState] = useState({
    trackTop: 0,
    trackHeightBase: 0,
    thumbHeight: 0,
    thumbOffset: 0,
    hasOverflow: false,
  });

  const update = useCallback(() => {
    const list = previewListRef.current;
    const gutter = gutterRef.current;
    if (!list || !gutter) return;
    const strip = previewStripRef.current;
    let { trackTop, trackHeight: trackHeightBase } =
      getPreviewScrollbarTrackGeometry(list, gutter, strip);
    trackTop *= toLayoutPx;
    trackHeightBase *= toLayoutPx;
    const adjustPx = readDrawerScrollbarHeightAdjustPx();
    const trackH = Math.max(0, trackHeightBase + adjustPx);
    const { scrollHeight, clientHeight, scrollTop } = list;
    const scrollable = scrollHeight - clientHeight;
    if (scrollable <= 1 || trackH <= 1) {
      setState((prev) => ({
        ...prev,
        trackTop,
        trackHeightBase,
        thumbHeight: 0,
        thumbOffset: 0,
        hasOverflow: false,
      }));
      return;
    }
    const rawThumb = Math.max(
      PREVIEW_SCROLLBAR_MIN_THUMB_PX,
      (clientHeight / scrollHeight) * trackH,
    );
    const thumbHeight = Math.min(trackH, rawThumb);
    const maxOffset = Math.max(0, trackH - thumbHeight);
    const thumbOffset = Math.min(
      maxOffset,
      Math.max(0, (scrollTop / scrollable) * maxOffset),
    );
    setState({
      trackTop,
      trackHeightBase,
      thumbHeight,
      thumbOffset,
      hasOverflow: true,
    });
  }, [previewListRef, gutterRef, previewStripRef, toLayoutPx]);

  useLayoutEffect(() => {
    update();
  }, [update, syncKey]);

  useEffect(() => {
    const list = previewListRef.current;
    const gutter = gutterRef.current;
    const panel = panelInnerRef.current;
    if (!list || !gutter) return undefined;
    list.addEventListener("scroll", update, { passive: true });
    if (panel) panel.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(update);
    });
    ro.observe(list);
    ro.observe(gutter);
    const stackBody = list.closest(".sidebar-drawer-stack__body");
    if (stackBody) ro.observe(stackBody);
    if (panel) ro.observe(panel);
    const strip = previewStripRef.current;
    if (strip) ro.observe(strip);
    window.addEventListener("resize", update);
    return () => {
      list.removeEventListener("scroll", update);
      if (panel) panel.removeEventListener("scroll", update);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [update, previewListRef, gutterRef, panelInnerRef, previewStripRef, syncKey]);

  return state;
}

function normalizeActiveId(items, preferredId) {
  if (!items?.length) return null;
  if (preferredId != null && items.some((i) => i.id === preferredId)) {
    return preferredId;
  }
  return items[0].id;
}

const PreviewStrip = forwardRef(function PreviewStrip(
  { cards, activePreviewId, onSelect, stripRef },
  ref,
) {
  return (
    <div className="preview-strip" ref={stripRef}>
      <div className="preview-strip__chrome" aria-hidden="true">
        <span className="preview-strip__chrome-line preview-strip__chrome-line--left" />
        <span className="preview-strip__chrome-line preview-strip__chrome-line--right" />
      </div>
      <div className="preview-list" ref={ref}>
        <div className="preview-list__steps">
          {cards.map((card, index) => (
            <button
              key={card.id}
              type="button"
              className={`preview-card ${card.id === activePreviewId ? "is-active" : ""}`}
              aria-label={`${card.step}: ${card.title}`}
              aria-pressed={card.id === activePreviewId}
              onClick={() => onSelect(card.id)}
            >
              <span className="preview-card__media">
                {card.thumbUrl ? (
                  <span
                    className="preview-thumb preview-thumb--fill preview-thumb--has-image"
                    aria-hidden
                  >
                    <img
                      src={card.thumbUrl}
                      alt=""
                      className="preview-thumb__image"
                      draggable={false}
                    />
                  </span>
                ) : (
                  <span className="preview-thumb preview-thumb--fill" aria-hidden>
                    <span className="preview-thumb__index">{index + 1}</span>
                  </span>
                )}
              </span>
              <span className="preview-card__body">
                <span className="preview-card__step-label">{card.step}</span>
                <span className="preview-card__desc">
                  {card.previewDescription ?? card.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

PreviewStrip.displayName = "PreviewStrip";

const InfoIcon = () => (
  <svg
    className="intro-info-btn__icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

function IntroSection({
  title,
  description,
  stepNumber,
  heroImageUrl,
  onStart,
  onInfo,
  infoHref,
  infoOpenInNewTab = true,
  infoTooltip,
}) {
  const trimmedHref =
    typeof infoHref === "string" ? infoHref.trim() : "";
  const isInfoLink = trimmedHref.length > 0;
  return (
    <div className="intro-section">
      <div className="intro-hero" aria-hidden="true">
        <div
          className={
            heroImageUrl
              ? "intro-hero__plate intro-hero__plate--image"
              : "intro-hero__plate intro-hero__plate--indexed"
          }
        >
          {heroImageUrl ? (
            <img
              src={heroImageUrl}
              alt=""
              className="intro-hero__image"
              draggable={false}
            />
          ) : (
            <span className="intro-hero__index">{stepNumber}</span>
          )}
        </div>
      </div>
      <div className="intro-copy">
        <h2 className="intro-title">{title}</h2>
        <p className="intro-description">{description}</p>
        <div className="intro-actions" data-luna-sidebar-part="intro-actions">
          <button className="start-btn" type="button" onClick={onStart}>
            Start
          </button>
          {isInfoLink ? (
            <a
              className="intro-info-btn"
              href={trimmedHref}
              target={infoOpenInNewTab ? "_blank" : undefined}
              rel={infoOpenInNewTab ? "noopener noreferrer" : undefined}
              data-luna-sidebar-part="intro-info-btn"
              title={infoTooltip}
              aria-label={
                infoOpenInNewTab
                  ? `${infoTooltip} (opens in new tab)`
                  : infoTooltip
              }
              onClick={() => onInfo?.()}
            >
              <InfoIcon />
            </a>
          ) : onInfo ? (
            <button
              type="button"
              className="intro-info-btn"
              data-luna-sidebar-part="intro-info-btn"
              title={infoTooltip}
              aria-label={infoTooltip}
              onClick={() => onInfo?.()}
            >
              <InfoIcon />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * @param {object} props
 * @param {Array<{ id: string, label: string, step: string, title: string, description: string, swatch: string, thumbUrl?: string, heroImageUrl?: string }>} props.items
 * @param {boolean} [props.defaultExpanded]
 * @param {string} [props.initialActiveId]
 * @param {string} [props.graphicSrc] — optional URL overriding the drawer background image (default: bg-image-3)
 * @param {boolean} [props.expanded] — controlled drawer; omit for uncontrolled (uses defaultExpanded)
 * @param {string} [props.railLabel]
 * @param {(id: string) => void} [props.onActiveItemChange] — fired when user clicks **Start** (not on preview strip taps)
 * @param {() => void} [props.onInfo] — optional; fired when user activates the info control
 * @param {string} [props.infoHref] — if set, info control is a link to this URL; otherwise a plain button
 * @param {boolean} [props.infoOpenInNewTab] — when `infoHref` is set, open in a new tab (default: true)
 * @param {string} [props.infoTooltip] — native tooltip + aria for the info button (default: “More Information”)
 * @param {(open: boolean) => void} [props.onExpandedChange]
 */
export function LunaSidebar({
  items,
  defaultExpanded = false,
  initialActiveId,
  graphicSrc,
  expanded: expandedProp,
  railLabel = "LUNA STATE MANAGER",
  onActiveItemChange,
  onInfo,
  infoHref,
  infoOpenInNewTab = true,
  infoTooltip = DEFAULT_INFO_TOOLTIP,
  onExpandedChange,
}) {
  const [expandedInner, setExpandedInner] = useState(defaultExpanded);
  const expanded =
    expandedProp !== undefined ? expandedProp : expandedInner;

  const [activePreviewId, setActivePreviewIdState] = useState(() =>
    normalizeActiveId(items, initialActiveId),
  );

  useEffect(() => {
    setActivePreviewIdState((prev) => normalizeActiveId(items, prev));
  }, [items]);

  useEffect(() => {
    if (initialActiveId === undefined) return;
    setActivePreviewIdState(normalizeActiveId(items, initialActiveId));
  }, [initialActiveId, items]);

  const setExpanded = (next) => {
    if (expandedProp === undefined) setExpandedInner(next);
    onExpandedChange?.(next);
  };

  const selectPreview = (id) => {
    setActivePreviewIdState(id);
  };

  const handleStart = () => {
    onActiveItemChange?.(activePreviewId);
  };

  if (!items?.length) {
    console.warn("LunaSidebar: `items` must be a non-empty array.");
    return null;
  }

  const activePreview =
    items.find((item) => item.id === activePreviewId) ?? items[0];
  const activeStepNumber =
    Math.max(0, items.findIndex((item) => item.id === activePreviewId)) + 1;
  const layoutScale = useLunaCanvasScale();
  const previewListRef = useRef(null);
  const previewStripRef = useRef(null);
  const ruleGutterRef = useRef(null);
  const panelInnerRef = useRef(null);
  const scrollbarSyncKey = `${expanded}-${items.length}-${activePreviewId}-${layoutScale}`;
  const scrollState = useSyncedPreviewScrollbar(
    previewListRef,
    ruleGutterRef,
    panelInnerRef,
    previewStripRef,
    scrollbarSyncKey,
  );

  const handleRuleTrackPointerDown = useCallback((e) => {
    if (e.target.closest(".sidebar-drawer-rule-scrollbar__thumb")) return;
    const list = previewListRef.current;
    if (!list) return;
    const scrollable = list.scrollHeight - list.clientHeight;
    if (scrollable <= 0) return;
    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const ratio = Math.max(0, Math.min(1, y / rect.height));
    list.scrollTop = ratio * scrollable;
  }, []);

  const handleRuleThumbPointerDown = useCallback((e) => {
    const list = previewListRef.current;
    const gutter = ruleGutterRef.current;
    const strip = previewStripRef.current;
    if (!list || !gutter) return;
    e.preventDefault();
    e.stopPropagation();
    const scrollable = list.scrollHeight - list.clientHeight;
    if (scrollable <= 0) return;
    let { trackHeight: trackHeightBase } = getPreviewScrollbarTrackGeometry(
      list,
      gutter,
      strip,
    );
    const inv = layoutScale > 0 ? 1 / layoutScale : 1;
    trackHeightBase *= inv;
    const trackHeight = Math.max(
      0,
      trackHeightBase + readDrawerScrollbarHeightAdjustPx(),
    );
    if (trackHeight <= 1) return;
    const thumbHeight = computeDrawerScrollbarThumbHeight(
      list.clientHeight,
      list.scrollHeight,
      trackHeight,
    );
    const maxOffset = Math.max(1, trackHeight - thumbHeight);
    const scrollPerPx = scrollable / maxOffset;
    const startY = e.clientY;
    const startScroll = list.scrollTop;

    const onMove = (ev) => {
      const dy = (ev.clientY - startY) * inv;
      list.scrollTop = Math.max(
        0,
        Math.min(scrollable, startScroll + dy * scrollPerPx),
      );
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }, [layoutScale]);

  const drawerGraphicUrl = graphicSrc || defaultDrawerGraphic;
  const drawerBgStyle = {
    backgroundImage: `url(${drawerGraphicUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "top center",
    backgroundRepeat: "no-repeat",
  };

  return (
    <div
      className={`sidebar-shell UxzaHe luna-sidebar-dock ${expanded ? "m2T_PB" : ""}`}
    >
      <div className="sidebar-host Bf7PXJ">
        <section
          className={`sidebar-drawer ${expanded ? "m2T_PB" : ""}`}
          style={drawerBgStyle}
          aria-hidden={!expanded}
        >
          <div
            ref={panelInnerRef}
            className={`sidebar-panel-inner Q1PD1g ${expanded ? "m2T_PB" : ""}`}
          >
            <div className="sidebar-panel-content">
              <div className="sidebar-drawer-stack">
                <div className="sidebar-drawer-stack__body">
                  <IntroSection
                    title={activePreview.title}
                    description={activePreview.description}
                    stepNumber={activeStepNumber}
                    heroImageUrl={activePreview.heroImageUrl}
                    onStart={handleStart}
                    onInfo={onInfo}
                    infoHref={infoHref}
                    infoOpenInNewTab={infoOpenInNewTab}
                    infoTooltip={infoTooltip}
                  />
                  <PreviewStrip
                    ref={previewListRef}
                    stripRef={previewStripRef}
                    cards={items}
                    activePreviewId={activePreviewId}
                    onSelect={selectPreview}
                  />
                </div>
                <div
                  ref={ruleGutterRef}
                  className="sidebar-drawer-rule-gutter"
                  aria-hidden="true"
                >
                  <div className="sidebar-drawer-rule-line" />
                  <div
                    className="sidebar-drawer-rule-scrollbar"
                    style={{
                      top: scrollState.trackTop,
                      ["--drawer-scrollbar-track-base-h"]: `${scrollState.trackHeightBase}px`,
                    }}
                    onPointerDown={handleRuleTrackPointerDown}
                  >
                    {scrollState.hasOverflow ? (
                      <div
                        className="sidebar-drawer-rule-scrollbar__thumb"
                        style={{
                          height: scrollState.thumbHeight,
                          transform: `translateY(${scrollState.thumbOffset}px)`,
                        }}
                        onPointerDown={handleRuleThumbPointerDown}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <button
          className="sidebar-rail"
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label="Toggle sidebar"
        >
          <span className="rail-dot" />
          <span className="rail-label">{railLabel}</span>
          <span className="rail-dot" />
        </button>
      </div>
    </div>
  );
}
