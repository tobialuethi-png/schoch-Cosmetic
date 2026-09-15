/* Motion-Qualität (animation-performance §6, angepasst):
   - «lite»  nur bei prefers-reduced-motion: alles sofort sichtbar, kein Lenis, keine Scroll-Effekte.
   - Software-Rendering (Grafikbeschleunigung im Browser aus) bekommt die IDENTISCHE Choreografie. Die Seite ist
     dafür composite-only gebaut (nur transform/opacity, will-change nur während der Übergänge, verdeckte Ebenen
     ausgeblendet) — der CPU-Pfad wird nicht abgeschaltet, sondern billig gemacht. html.cpu markiert ihn (CSS-Hooks, Support).
   - FPS-Wächter: fällt die Framerate nach dem Intro nachhaltig unter 40 fps, wird NUR das Smooth-Scrolling (Lenis)
     abgeschaltet — natives Scrollen läuft im Compositor-Thread und bleibt auch bei belegtem Hauptthread flüssig.
     Reveals, Übergänge, Parallax und Lichtfaden bleiben. */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Mode = "full" | "lite";
let mode: Mode = "full";
let smooth = true;
let cpu = false;
const subs = new Set<() => void>();
const liteTeardowns: Array<() => void> = [];
const smoothTeardowns: Array<() => void> = [];
let booted = false;

export const getMode = () => mode;
export const getSmooth = () => smooth;
export const subscribe = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn); }; };
/** Abschaltungen für den Lite-Mode (reduced motion) */
export const onLite = (fn: () => void) => { liteTeardowns.push(fn); };
/** Abschaltungen, wenn der FPS-Wächter das Smooth-Scrolling beendet (Lenis destroy) */
export const onSmoothOff = (fn: () => void) => { smoothTeardowns.push(fn); };

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function enableLiteMode(reason: string) {
  if (mode === "lite") return;
  mode = "lite";
  document.documentElement.classList.add("lite");
  liteTeardowns.forEach((fn) => { try { fn(); } catch {} });
  ScrollTrigger.killAll();
  subs.forEach((fn) => fn());
  console.info("[motion] Lite-Mode aktiv:", reason);
}

export function disableSmoothScroll(reason: string) {
  if (!smooth) return;
  smooth = false;
  document.documentElement.classList.add("native-scroll");
  smoothTeardowns.forEach((fn) => { try { fn(); } catch {} });
  ScrollTrigger.refresh();
  console.info("[motion] Smooth-Scrolling aus (natives Scrollen):", reason);
}

export function isSoftwareRenderer(): boolean {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return true;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const r = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    return /swiftshader|software|llvmpipe|basic render/i.test(r);
  } catch {
    return true;
  }
}

/* FPS-Wächter: startet erst nach dem Intro (Hydration + Hero-Timeline erzeugen naturgemäss lange Frames),
   wertet Tab-Wechsel nicht als Lag und verlangt ~1.5 s durchgehend < 40 fps. */
function startFpsWatchdog() {
  const armAt = performance.now() + 4000;
  let last = performance.now();
  let slow = 0;
  const tick = () => {
    const now = performance.now();
    const dt = now - last;
    last = now;
    if (now < armAt || dt > 250) return;
    if (1000 / dt < 40) slow++; else slow = Math.max(0, slow - 2);
    if (slow > 90) { disableSmoothScroll("FPS dauerhaft < 40"); gsap.ticker.remove(tick); }
  };
  gsap.ticker.add(tick);
}

export function initQuality() {
  if (booted || typeof window === "undefined") return;
  booted = true;
  if (prefersReducedMotion()) { enableLiteMode("prefers-reduced-motion"); return; }
  cpu = isSoftwareRenderer();
  if (cpu) { document.documentElement.classList.add("cpu"); console.info("[motion] Software-Rendering erkannt — volle Choreografie, composite-only"); }
  // Test-Harness: ?motion=full bzw. sessionStorage.motion = "full" → kein Wächter (deterministische Messungen)
  try {
    if (location.search.includes("motion=full")) sessionStorage.setItem("motion", "full");
    if (sessionStorage.getItem("motion") === "full") return;
  } catch {}
  // Touch-Geräte scrollen nativ (kein Lenis, SmoothScroll.tsx): der Wächter hätte nichts abzuschalten und hielte nur den GSAP-Ticker dauerhaft wach
  if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;
  startFpsWatchdog();
}
