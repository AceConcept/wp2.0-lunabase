import { createContext, useContext } from "react";

/** 1 when `LunaSidebar` is not wrapped in `LunaScaledArtboard`. */
export const LunaCanvasScaleContext = createContext(1);

export function useLunaCanvasScale() {
  return useContext(LunaCanvasScaleContext);
}
