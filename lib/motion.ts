/* ============================================================
   Motion-Tokens — aus reports/blend-plan.md (Unified System)
   Eine Easing-Familie (out / reveal / micro), eine Duration-Skala.
   ============================================================ */
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

let registered = false;
export function registerEases() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(CustomEase);
  // Eintritte (chic A1–A5): cubic-bezier(0.22, 1, 0.36, 1)
  CustomEase.create("out", "0.22, 1, 0.36, 1");
  // Bild-Wipes (lagence B3, power3.out): cubic-bezier(0.215, 0.61, 0.355, 1)
  CustomEase.create("reveal", "0.215, 0.61, 0.355, 1");
  // Micro (chic A6–A9): cubic-bezier(0.4, 0, 0.2, 1)
  CustomEase.create("micro", "0.4, 0, 0.2, 1");
  registered = true;
}

export const ease = { out: "out", reveal: "reveal", micro: "micro", none: "none" } as const;

/* Sekunden (GSAP) */
export const dur = {
  micro: 0.15,
  microSlow: 0.3,
  ui: 0.5,
  text: 0.7,        // chic-Cluster 700 ms
  image: 1.2,       // lagence-Cluster 1.4 s, 15 % gestrafft
  heroTotal: 1.6,
} as const;

export const stagger = {
  lines: 0.08,
  items: 0.1,
  images: 0.18,
} as const;

export const scroll = {
  start: "top 88%",
  lenis: { lerp: 0.1, duration: 1.2 },
} as const;

/* Reveal-Distanzen (px) */
export const dist = { text: 40, textMobile: 24, imageX: 40 } as const;
