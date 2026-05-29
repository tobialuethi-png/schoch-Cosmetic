"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { nav, contact } from "@/lib/site";
import logoSchoch from "@/assets/logo-schoch-cosmetic.png";

/*
  Header: nicht fixiert (scrollt mit dem Inhalt weg). Helle Glas-Bar mit feiner
  Unterkante (`is-scrolled` permanent gesetzt). Anker-Links bleiben auf der
  Startseite In-Page-Anker; auf Unterseiten wird "/" vorangestellt.
*/
export default function Nav() {
  const path = (usePathname() || "/").replace(/\/+$/, "");
  const onHome = path === "";
  const homeHref = onHome ? "#top" : "/";
  const navHref = (h: string) => {
    if (h.startsWith("/")) return h;
    return onHome ? h : `/${h}`;
  };

  return (
    <>
      <header
        id="siteheader"
        className="absolute inset-x-0 top-0 z-[100] is-scrolled"
        data-header
      >
        <div className="shell flex items-center justify-between gap-6 py-5">
          <a
            href={homeHref}
            className="group flex items-center"
            aria-label="Schoch Cosmetic – zur Startseite"
            data-wordmark
          >
            <Image
              src={logoSchoch}
              alt="Schoch Cosmetic"
              sizes="(min-width: 1024px) 300px, 200px"
              priority
              className="logo-mark block h-20 w-auto sm:h-24 lg:h-28 transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </a>

          <nav
            className="hidden items-center gap-6 lg:flex xl:gap-7 2xl:gap-9"
            aria-label="Hauptnavigation"
          >
            {nav.map((item) => (
              <a
                key={item.href}
                href={navHref(item.href)}
                className="link-underline text-sm font-medium tracking-wide text-sand transition-colors duration-300 hover:text-cream"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={contact.phoneHref}
              className="btn btn-ghost hidden text-sm sm:inline-flex"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .58 3.6 1 1 0 0 1-.24 1Z"
                  fill="currentColor"
                />
              </svg>
              Termin
            </a>

            <button
              type="button"
              className="relative z-[120] grid h-11 w-11 place-items-center rounded-full border border-cream/30 bg-cream/[0.04] text-cream lg:hidden"
              aria-label="Menü öffnen"
              aria-expanded="false"
              aria-controls="mobile-menu"
              data-menu-toggle
            >
              <span className="sr-only">Menü</span>
              <span className="flex flex-col items-end gap-[5px]" data-burger>
                <span className="block h-px w-6 bg-cream transition-all duration-300" data-burger-top />
                <span className="block h-px w-4 bg-cream transition-all duration-300" data-burger-mid />
                <span className="block h-px w-6 bg-cream transition-all duration-300" data-burger-bot />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className="fixed inset-0 z-[110] hidden flex-col overflow-hidden bg-ink/97 backdrop-blur-xl lg:hidden"
        data-mobile-menu
      >
        <div className="aura -right-20 top-10 h-72 w-72 bg-gold/15" />
        <nav
          className="shell flex h-full flex-col justify-center gap-2"
          aria-label="Mobile Navigation"
        >
          {nav.map((item, i) => (
            <a
              key={item.href}
              href={navHref(item.href)}
              className="group flex items-baseline gap-4 border-b border-line/60 py-4"
              data-mobile-link
            >
              <span className="font-sans text-xs text-gold-strong/80">0{i + 1}</span>
              <span className="font-display text-4xl text-cream transition-colors duration-300 group-hover:text-gold-strong">
                {item.label}
              </span>
            </a>
          ))}
          <a href={contact.phoneHref} className="btn btn-ghost mt-8 self-start">
            {contact.phoneDisplay}
          </a>
        </nav>
      </div>
    </>
  );
}
