"use client";
/* Dokument-Positionen, robust gegen Sticky-Versatz und Transforms.
   Gemessen (Chromium, 2026-09): offsetTop UND getBoundingClientRect enthalten den Sticky-Versatz. Eine stehende
   Sticky-Karte (oder eine, die vom Container-Ende geschoben wird) meldet ihre Bildschirmlage, nicht ihre Ruhelage.
   Für Scroll-Ziele, Parallax-Grenzen und Sichtbarkeits-Schwellen zählt aber die Ruhelage. */

/** Sticky-Elemente in der Vorfahrenkette (inkl. el) für einen synchronen Messvorgang neutralisieren, kein Frame dazwischen */
function withoutSticky<T>(el: HTMLElement, measure: () => T): T {
  const restore: Array<[HTMLElement, string]> = [];
  for (let n: HTMLElement | null = el; n && n !== document.body; n = n.parentElement) {
    if (getComputedStyle(n).position === "sticky") { restore.push([n, n.style.position]); n.style.position = "static"; }
  }
  try { return measure(); }
  finally { for (const [n, p] of restore) n.style.position = p; }
}

/** Dokument-Y der Ruhelage (Oberkante Border-Box): ohne Sticky-Versatz, ohne Transforms (offsetTop-Kette) */
export function staticTop(el: HTMLElement): number {
  return withoutSticky(el, () => {
    let t = 0;
    for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) t += n.offsetTop;
    return t;
  });
}
