import { useEffect, useState } from "react";
import {
  CANVAS_H,
  CANVAS_W,
  getCanvasContainScale,
  getViewportSize,
} from "./canvasScale.js";
import { LunaCanvasScaleContext } from "./LunaCanvasScaleContext.jsx";
import "./LunaSidebar.css";

/**
 * Host-owned 2560×1440 “contain” scale: viewport-fit + artboard-slot + scaled artboard.
 * No overlay backdrop — close the drawer from the rail (or control `expanded` on `LunaSidebar`).
 *
 * @param {object} props
 * @param {import("react").ReactNode} props.children — place `LunaSidebar` inside `.mUiHp_`
 */
export function LunaScaledArtboard({ children }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const { width, height } = getViewportSize();
      setScale(getCanvasContainScale(width, height));
    };
    update();
    window.addEventListener("resize", update);
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", update);
    }
    return () => {
      window.removeEventListener("resize", update);
      if (vv) {
        vv.removeEventListener("resize", update);
      }
    };
  }, []);

  const scaledH = CANVAS_H * scale;

  return (
    <LunaCanvasScaleContext.Provider value={scale}>
      <div className="viewport-fit">
        <div className="artboard-slot" style={{ height: scaledH }}>
          <div
            className="artboard"
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: CANVAS_W,
              height: CANVAS_H,
              transform: `scale(${scale})`,
              transformOrigin: "top right",
            }}
          >
            <div className="page-frame VYqscx">
              <div className="page-row n1I9fl">
                <div className="mUiHp_">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LunaCanvasScaleContext.Provider>
  );
}
