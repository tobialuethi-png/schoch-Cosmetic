"use client";
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode, type MouseEvent } from "react";
import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getMode, prefersReducedMotion } from "@/lib/quality";
import { getLenis, scrollToTarget } from "@/lib/lenis";
import { dur, ease } from "@/lib/motion";

/**
 * Eine Transition für die ganze Seite (multi-route): Creme-Curtain Cover (0.5 s) → Navigate → Reveal (0.5 s).
 * Next App Router hat keine Exit-Phase, deshalb eigener Overlay-Provider (gsap-motion §III.7).
 *
 * Anker (Nav, CTAs, Footer): Ziel ist immer eine Bildschirm-Section → Oberkante exakt an die Viewport-Oberkante
 * (offset 0). Die Section bringt ihren Nav-Abstand selbst mit, Sticky-Karten (Leistungen) stehen dann genau,
 * Deck-Übergänge (Preise, FAQ, Kontakt) sind an der Oberkante abgeschlossen. Mit dem früheren Nav-Versatz landete
 * man 92 px davor: halb gebloomte Fläche, halb eingeblendeter Inhalt, Sticky-Karte hinter der falschen Karte.
 *  · gleiche Route: nur scrollen (kein Vorhang); ohne Anker (Logo) nach oben
 *  · andere Route: Vorhang zu → Route OHNE Hash pushen (Next würde sonst per scrollIntoView selbst springen)
 *    → Ziel unter dem Vorhang setzen, Hash in die URL schreiben → Vorhang auf
 *  · Erstaufruf mit Hash (Reload, geteilter Link): der Browser landet mit scroll-padding zu hoch → auf die Section setzen
 */
const norm = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
const Ctx = createContext<(href: string) => void>(() => {});
export const useTransition = () => useContext(Ctx);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const overlay = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<string | null>(null);
  const covered = useRef(false);
  const guard = useRef<ReturnType<typeof setTimeout> | null>(null);

  const instant = () => getMode() === "lite" || prefersReducedMotion();

  // Vorhang heben: Ziel sofort setzen (noch verdeckt), Trigger neu messen, dann Reveal und Lenis wieder frei
  const lift = useCallback((hash: string | null) => {
    if (guard.current) { clearTimeout(guard.current); guard.current = null; }
    if (!covered.current) return;
    covered.current = false;
    scrollToTarget(hash ?? 0, { immediate: true, offset: 0 });
    if (hash) history.replaceState(null, "", hash);
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      gsap.timeline()
        .to(overlay.current, { yPercent: -100, duration: dur.ui, ease: ease.reveal, delay: 0.05 })
        .set(overlay.current, { autoAlpha: 0, yPercent: 100 })
        .add(() => getLenis()?.start(), 0.1);
    });
  }, []);

  const navigate = useCallback((href: string) => {
    const url = new URL(href, location.href);
    if (norm(url.pathname) === norm(location.pathname)) {
      if (url.hash) { history.pushState(null, "", url.hash); scrollToTarget(url.hash, { offset: 0 }); }
      else { history.replaceState(null, "", url.pathname + url.search); scrollToTarget(0); }
      return;
    }
    pending.current = url.hash || null;
    if (instant() || !overlay.current) { router.push(href); return; }
    covered.current = true;
    getLenis()?.stop();
    gsap.timeline()
      .set(overlay.current, { yPercent: 100, autoAlpha: 1 })
      .to(overlay.current, { yPercent: 0, duration: dur.ui, ease: ease.reveal })
      .add(() => router.push(url.pathname + url.search, { scroll: false }));
    // Sicherheitsnetz: bleibt der Routenwechsel aus (Fehler, Abbruch), hebt sich der Vorhang trotzdem
    guard.current = setTimeout(() => lift(pending.current), 4000);
  }, [router, lift]);

  useEffect(() => {
    const hash = pending.current;
    pending.current = null;
    if (covered.current) { lift(hash); return; }
    ScrollTrigger.refresh();
    // Browser-eigene Hash-Navigation (Adresszeile, Zurück/Vor): der Browser springt per scrollIntoView an die aktuelle
    // Bildschirmlage des Ziels — bei einer stehenden oder geschobenen Sticky-Karte ist das die falsche Stelle → sofort
    // auf die Ruhelage (Section-Oberkante) korrigieren. Eigene Klicks laufen über pushState und lösen kein hashchange aus.
    const onHash = () => { if (location.hash) scrollToTarget(location.hash, { immediate: true, offset: 0 }); };
    window.addEventListener("hashchange", onHash);
    // Erstaufruf mit Hash: auf die Section-Oberkante setzen — nochmals nach «load», falls der Browser dann erneut springt
    const h = location.hash;
    const snap = () => { if (h) scrollToTarget(h, { immediate: true, offset: 0 }); };
    if (h && !instant()) {
      snap();
      if (document.readyState !== "complete") window.addEventListener("load", snap, { once: true });
    }
    return () => { window.removeEventListener("hashchange", onHash); window.removeEventListener("load", snap); };
  }, [pathname, lift]);

  return (
    <Ctx.Provider value={navigate}>
      {children}
      <div ref={overlay} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[120] bg-cream" style={{ transform: "translateY(100%)", visibility: "hidden" }} />
    </Ctx.Provider>
  );
}

type TLinkProps = LinkProps & { children: ReactNode; className?: string; onClick?: (e: MouseEvent<HTMLAnchorElement>) => void; "aria-label"?: string };
export function TransitionLink({ href, onClick, children, ...rest }: TLinkProps) {
  const navigate = useTransition();
  const h = typeof href === "string" ? href : href.pathname ?? "/";
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (!h.startsWith("/")) return;
        e.preventDefault();
        navigate(h);
      }}
    >
      {children}
    </Link>
  );
}
