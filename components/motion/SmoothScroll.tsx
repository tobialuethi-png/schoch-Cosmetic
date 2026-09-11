"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { initQuality, onLite, onSmoothOff, getMode, getSmooth, prefersReducedMotion } from "@/lib/quality";
import { setLenis, scrollToTarget } from "@/lib/lenis";
import { scroll } from "@/lib/motion";

/**
 * Lenis + ScrollTrigger: ein Ticker, eine Wahrheit (gsap-motion §III.6).
 * Kein Lenis unter reduced-motion / Lite-Mode; Anker-Links laufen über Lenis.
 */
export default function SmoothScroll() {
  useEffect(() => {
    initQuality();
    if (getMode() === "lite" || prefersReducedMotion() || !getSmooth()) return;

    // Anker-Links: mit Lenis über lenis.scrollTo, ohne Lenis über window.scrollTo (scrollToTarget rechnet den Nav-Versatz selbst)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !url.hash || url.pathname !== location.pathname) return;
      const el = document.querySelector<HTMLElement>(url.hash);
      if (!el) return;
      e.preventDefault();
      history.pushState(null, "", url.hash);
      scrollToTarget(el);
    };
    document.addEventListener("click", onClick);
    document.fonts.ready.then(() => ScrollTrigger.refresh());

    // Touch-Geräte (Gesetz 10): natives Scrollen läuft im Compositor-Thread und bleibt auch bei belegtem Hauptthread flüssig.
    // Lenis glättet dort ohnehin nicht (syncTouch aus) und brächte nur Ticker-Last pro Frame → gar nicht erst starten.
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      return () => document.removeEventListener("click", onClick);
    }

    const lenis = new Lenis({ lerp: scroll.lenis.lerp, duration: scroll.lenis.duration, smoothWheel: true, syncTouch: false });
    setLenis(lenis);
    (window as unknown as { lenis?: Lenis }).lenis = lenis; // für Mess-Harness (compare_sections.py)
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const teardown = () => { lenis.destroy(); setLenis(null); gsap.ticker.remove(tick); (window as unknown as { lenis?: Lenis }).lenis = undefined; };
    onLite(teardown);
    onSmoothOff(teardown); // FPS-Wächter: natives Scrollen, Choreografie bleibt

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);
  return null;
}
