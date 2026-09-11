"use client";
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode, type MouseEvent } from "react";
import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getMode, prefersReducedMotion } from "@/lib/quality";
import { getLenis, scrollToTarget } from "@/lib/lenis";
import { dur, ease } from "@/lib/motion";

/**
 * Eine Transition für die ganze Seite (multi-route): Creme-Curtain
 * Cover (0.5 s) → Navigate → Reveal (0.5 s). Next App Router hat keine Exit-Phase,
 * deshalb eigener Overlay-Provider (gsap-motion §III.7).
 */
const Ctx = createContext<(href: string) => void>(() => {});
export const useTransition = () => useContext(Ctx);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const overlay = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<string | null>(null);
  const covered = useRef(false);

  const instant = () => getMode() === "lite" || prefersReducedMotion();

  const navigate = useCallback((href: string) => {
    const url = new URL(href, location.href);
    if (url.pathname === location.pathname) {
      if (url.hash) { history.pushState(null, "", url.hash); scrollToTarget(url.hash); }
      return;
    }
    pending.current = url.hash || null;
    if (instant() || !overlay.current) { router.push(href); return; }
    covered.current = true;
    getLenis()?.stop();
    gsap.timeline()
      .set(overlay.current, { yPercent: 100, autoAlpha: 1 })
      .to(overlay.current, { yPercent: 0, duration: dur.ui, ease: ease.reveal })
      .add(() => router.push(href));
  }, [router]);

  // Nach dem Routenwechsel: Scroll-Reset, Trigger neu, Vorhang hebt sich
  useEffect(() => {
    const hash = pending.current;
    pending.current = null;
    ScrollTrigger.refresh();
    if (!covered.current) return;
    covered.current = false;
    const l = getLenis();
    scrollToTarget(hash ?? 0, { immediate: true });
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      gsap.timeline()
        .to(overlay.current, { yPercent: -100, duration: dur.ui, ease: ease.reveal, delay: 0.05 })
        .set(overlay.current, { autoAlpha: 0, yPercent: 100 })
        .add(() => { l?.start(); if (hash) scrollToTarget(hash); }, 0.1);
    });
  }, [pathname]);

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
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (!h.startsWith("/")) return;
        e.preventDefault();
        navigate(h);
      }}
    >
      {children}
    </Link>
  );
}
