"use client";
import type Lenis from "lenis";
import { staticTop } from "./dom";

/* Singleton-Zugriff auf die Lenis-Instanz (Menü-Stop, Anker-Scroll, Route-Reset) */
let instance: Lenis | null = null;
export const setLenis = (l: Lenis | null) => { instance = l; };
export const getLenis = () => instance;

export const navHeight = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 76;

export type ScrollOpts = {
  immediate?: boolean;
  /** Versatz in px zur Oberkante des Ziels. Default −(Nav-Höhe + 16): Inhalt unter der Leiste (Sprungmarken im Text).
   *  0 für Bildschirm-Sections (Nav, CTAs): sie bringen ihren Nav-Abstand selbst mit, Sticky-Karten stehen exakt,
   *  Deck-Übergänge (bloom) sind an der Oberkante abgeschlossen. */
  offset?: number;
};

function resolve(target: string | HTMLElement): HTMLElement | null {
  if (typeof target !== "string") return target;
  if (target.startsWith("#")) return document.getElementById(decodeURIComponent(target.slice(1)));
  return document.querySelector<HTMLElement>(target);
}

/** Ziel-Y im Dokument: Ruhelage des Elements (Sticky-Versatz herausgerechnet, lib/dom.ts) + Versatz, auf den Scrollbereich begrenzt */
export function targetY(target: string | number | HTMLElement, offset?: number): number | null {
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  if (typeof target === "number") return Math.max(0, Math.min(max, Math.round(target)));
  const el = resolve(target);
  if (!el) return null;
  const off = offset ?? -(navHeight() + 16);
  return Math.max(0, Math.min(max, Math.round(staticTop(el) + off)));
}

export function scrollToTarget(target: string | number | HTMLElement, opts: ScrollOpts = {}) {
  const top = targetY(target, opts.offset);
  if (top == null) return;
  const l = instance;
  if (l) {
    // Lenis misst seine Grenzen (limit) asynchron per ResizeObserver: direkt nach einem Routenwechsel gilt noch die alte
    // Seitenhöhe und scrollTo würde das Ziel darauf kappen → vor dem Sprung synchron neu messen
    l.resize();
    // Gestopptes Lenis (Menü offen, Vorhang): der Sofort-Sprung läuft mit force auch gestoppt; ein animierter Scroll startet Lenis wieder
    if (l.isStopped && !opts.immediate) l.start();
    l.scrollTo(top, { immediate: opts.immediate, duration: opts.immediate ? 0 : 1.2, force: true });
    return;
  }
  window.scrollTo({ top, behavior: opts.immediate ? "auto" : "smooth" });
}
