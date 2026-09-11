"use client";
import type Lenis from "lenis";

/* Singleton-Zugriff auf die Lenis-Instanz (Menü-Stop, Anker-Scroll, Route-Reset) */
let instance: Lenis | null = null;
export const setLenis = (l: Lenis | null) => { instance = l; };
export const getLenis = () => instance;

export function scrollToTarget(target: string | number | HTMLElement, opts: { immediate?: boolean; offset?: number } = {}) {
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 76;
  const offset = opts.offset ?? -(navH + 16);
  // Ziel immer selbst als Zahl berechnen (Lenis addiert Element-Offsets sonst doppelt)
  let top: number;
  if (typeof target === "number") top = target;
  else {
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    top = el.getBoundingClientRect().top + window.scrollY + offset;
  }
  top = Math.max(0, Math.round(top));
  const l = instance;
  if (l) {
    if (l.isStopped) l.start(); // gestopptes Lenis (Menü offen) ignoriert scrollTo
    l.scrollTo(top, { immediate: opts.immediate, duration: opts.immediate ? 0 : 1.2, force: true });
    return;
  }
  window.scrollTo({ top, behavior: opts.immediate ? "auto" : "smooth" });
}
