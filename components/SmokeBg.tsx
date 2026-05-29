"use client";

import { useEffect, useRef } from "react";
import { initSmokeBackground } from "@/lib/smoke-bg";

/* Dezenter, goldener Smoke-Hintergrund (WebGL, rein dekorativ). */
export default function SmokeBg() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current) initSmokeBackground(ref.current, { color: "#c9a24a" });
  }, []);

  return <canvas ref={ref} className="smoke-bg" aria-hidden="true" />;
}
