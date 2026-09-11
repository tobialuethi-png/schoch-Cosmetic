"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { nav, contact, whatsappHref, site } from "@/lib/site";
import { TransitionLink } from "@/components/motion/Transition";
import { ArrowRight, Phone, X } from "@/components/ui/Icons";
import { dur, ease, stagger } from "@/lib/motion";
import Logo from "@/components/ui/Logo";
import LuxButton from "@/components/ui/LuxButton";

/**
 * Sticky Nav mit einem Pill-CTA (chic) — transparent über dem hellen Hero (Ink-Farben),
 * ab 80 px Scroll Creme mit Hairline. Menü: Vollbild-Overlay in Creme (lagence-Muster, helle Variante).
 */
export default function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(!onHome);
  const overlay = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!onHome) { setScrolled(true); return; }
    const st = ScrollTrigger.create({ start: 80, onUpdate: (self) => setScrolled(self.scroll() > 80) });
    setScrolled(window.scrollY > 80);
    return () => st.kill();
  }, [onHome]);

  const { contextSafe } = useGSAP(() => {
    gsap.set(overlay.current, { autoAlpha: 0 });
  }, { scope: header });

  const openMenu = contextSafe(() => {
    setOpen(true);
    getLenis()?.stop();
    document.documentElement.classList.add("scroll-lock");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("lite");
    const tl = gsap.timeline();
    tl.to(overlay.current, { autoAlpha: 1, duration: reduce ? 0.01 : dur.ui, ease: ease.out });
    if (!reduce) {
      tl.fromTo(".menu-item", { yPercent: 110 }, { yPercent: 0, duration: dur.text, ease: ease.out, stagger: stagger.lines }, "-=0.3")
        .fromTo(".menu-meta", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: dur.text, ease: ease.out, stagger: 0.06 }, "-=0.4");
    }
    requestAnimationFrame(() => closeBtn.current?.focus());
  });

  const closeMenu = contextSafe(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("lite");
    gsap.to(overlay.current, { autoAlpha: 0, duration: reduce ? 0.01 : dur.microSlow, ease: ease.micro, onComplete: () => {
      setOpen(false);
      getLenis()?.start();
      document.documentElement.classList.remove("scroll-lock");
    } });
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeMenu(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeMenu]);


  return (
    <header ref={header} className="fixed inset-x-0 top-0 z-[100]" data-scrolled={scrolled} data-open={open}>
      <div
        className="transition-[background-color,box-shadow] duration-300"
        style={{
          backgroundColor: scrolled && !open ? "var(--color-cream)" : "transparent",
          boxShadow: scrolled && !open ? "inset 0 -1px 0 color-mix(in oklab, var(--color-ink) 10%, transparent)" : "none",
        }}
      >
        <div className="shell flex items-center justify-between" style={{ height: "var(--nav-h)", color: "var(--color-ink)" }}>
          <TransitionLink href="/" aria-label={`${site.name}, Startseite`} className="relative z-[2] flex items-center">
            <Logo className="h-9 w-auto md:h-10" tone="orange" />
          </TransitionLink>

          <nav aria-label="Hauptnavigation" className="hidden lg:flex items-center gap-8">
            {nav.map((n) => (
              <TransitionLink key={n.href} href={n.href} className="t-small font-medium tracking-[0.02em] opacity-90 transition-opacity duration-150 hover:opacity-100">
                {n.label}
              </TransitionLink>
            ))}
          </nav>

          <div className="relative z-[2] flex items-center gap-3">
            <TransitionLink href="/#kontakt" className="btn btn-ghost hidden md:inline-flex">
              Termin anfragen <ArrowRight />
            </TransitionLink>
            <button
              type="button"
              onClick={open ? closeMenu : openMenu}
              ref={closeBtn}
              aria-expanded={open}
              aria-controls="site-menu"
              className="lg:hidden inline-flex h-11 items-center gap-2 rounded-full px-4 t-sub"
              style={{ boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--color-ink) 22%, transparent)" }}
            >
              {open ? <X size={18} /> : null}
              {open ? "Schliessen" : "Menü"}
            </button>
          </div>
        </div>
      </div>

      {/* Overlay-Menü */}
      <div
        ref={overlay}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menü"
        className="overscroll-contain fixed inset-0 z-[1] bg-cream text-ink"
        style={{ visibility: "hidden", opacity: 0 }}
        inert={!open || undefined}
      >
        <div className="shell flex h-full flex-col justify-between pb-8" style={{ paddingTop: "calc(var(--nav-h) + 24px)" }}>
          <nav aria-label="Menü" className="mt-6 flex flex-col gap-1">
            {nav.map((n) => (
              <div key={n.href} className="overflow-hidden border-b hairline">
                <TransitionLink href={n.href} onClick={() => closeMenu()} className="menu-item block py-4 font-serif text-[clamp(36px,9vw,56px)] leading-[1.05] tracking-[-0.02em]">
                  {n.label}
                </TransitionLink>
              </div>
            ))}
          </nav>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="menu-meta">
              <p className="t-eyebrow text-orange-ink">Kontakt</p>
              <a href={contact.phoneHref} className="mt-3 flex items-center gap-2 text-lg"><Phone size={18} /> {contact.phoneDisplay}</a>
              <a href={`mailto:${contact.email}`} className="mt-1 block text-umber">{contact.email}</a>
            </div>
            <div className="menu-meta flex flex-wrap gap-3 sm:justify-end sm:self-end">
              <a href={whatsappHref} className="btn btn-ghost" target="_blank" rel="noopener">WhatsApp</a>
              <LuxButton href="/#kontakt" onClick={() => closeMenu()}>Termin anfragen</LuxButton>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
