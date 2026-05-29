import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Geteilte Seitenlogik: Smooth-Scroll, Navigation, Scroll-Reveals,    */
/* Kennzahlen, Text-Reveal, Spektralbalken, Parallax, Lightbox, Form.  */
/* Portiert aus dem früheren Astro-Skript (main.ts). initSite() läuft   */
/* in einem React-Effect und gibt eine Cleanup-Funktion zurück.        */
/* ------------------------------------------------------------------ */
export function initSite(): () => void {
  // ScrollTrigger.config: Mobile-URL-Leisten-Resize ignorieren (Hero-Pin).
  ScrollTrigger.config({ ignoreMobileResize: true });

  const root = document.documentElement;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const cleanups: Array<() => void> = [];
  let lenis: Lenis | null = null;
  let tickerFn: ((time: number) => void) | null = null;

  function revealAll() {
    root.classList.remove("anim");
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }

  /* ---------------------------------------------------------------- */
  /* Smooth Scroll (Lenis) + ScrollTrigger-Sync                        */
  /* ---------------------------------------------------------------- */
  function initSmoothScroll() {
    if (reduceMotion) return;
    lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    tickerFn = (time) => lenis?.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(target: string) {
    const el = document.querySelector(target);
    if (!el) return;

    const rect = (el as HTMLElement).getBoundingClientRect();
    const elTop = window.scrollY + rect.top;
    const elHeight = rect.height;
    const vh = window.innerHeight;

    const fits = elHeight + 80 < vh;
    const targetY = Math.max(
      0,
      fits ? elTop - (vh - elHeight) / 2 : elTop - vh * 0.12
    );

    if (lenis) {
      lenis.scrollTo(targetY, { duration: 1.2 });
    } else {
      window.scrollTo({
        top: targetY,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Navigation: Mobile-Menü, Anchor-Scroll                            */
  /* ---------------------------------------------------------------- */
  function initNav() {
    const menu = document.querySelector<HTMLElement>("[data-mobile-menu]");
    const toggle = document.querySelector<HTMLButtonElement>(
      "[data-menu-toggle]"
    );
    const top = document.querySelector<HTMLElement>("[data-burger-top]");
    const mid = document.querySelector<HTMLElement>("[data-burger-mid]");
    const bot = document.querySelector<HTMLElement>("[data-burger-bot]");
    let open = false;

    function setMenu(state: boolean) {
      if (!menu || !toggle) return;
      open = state;
      menu.classList.toggle("hidden", !open);
      menu.classList.toggle("flex", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute(
        "aria-label",
        open ? "Menü schliessen" : "Menü öffnen"
      );
      document.body.style.overflow = open ? "hidden" : "";
      lenis?.[open ? "stop" : "start"]();
      if (top && mid && bot) {
        gsap.to(top, { rotate: open ? 45 : 0, y: open ? 6 : 0, width: 24, duration: 0.3 });
        gsap.to(mid, { opacity: open ? 0 : 1, duration: 0.2 });
        gsap.to(bot, { rotate: open ? -45 : 0, y: open ? -6 : 0, width: 24, duration: 0.3 });
      }
      if (open && !reduceMotion) {
        gsap.fromTo(
          "[data-mobile-link]",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.07, duration: 0.5, ease: "power3.out", delay: 0.05 }
        );
      }
    }

    const onToggle = () => setMenu(!open);
    toggle?.addEventListener("click", onToggle);

    const anchorHandlers: Array<[HTMLAnchorElement, (e: Event) => void]> = [];
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
      const handler = (e: Event) => {
        const href = a.getAttribute("href");
        if (!href || href === "#") return;
        e.preventDefault();
        if (open) setMenu(false);
        scrollToTarget(href);
      };
      a.addEventListener("click", handler);
      anchorHandlers.push([a, handler]);
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setMenu(false);
    };
    window.addEventListener("keydown", onKey);

    cleanups.push(() => {
      toggle?.removeEventListener("click", onToggle);
      anchorHandlers.forEach(([a, h]) => a.removeEventListener("click", h));
      window.removeEventListener("keydown", onKey);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Animationen (GSAP + ScrollTrigger)                                */
  /* ---------------------------------------------------------------- */
  function initAnimations() {
    if (reduceMotion) {
      revealAll();
      return;
    }

    const heroMM = gsap.matchMedia();
    heroMM.add("(prefers-reduced-motion: no-preference)", () => {
      const xhero = document.querySelector<HTMLElement>("[data-xhero]");
      const pin = document.querySelector<HTMLElement>("[data-xhero-pin]");
      if (!xhero || !pin) return;

      xhero.classList.add("is-interactive");

      const st = ScrollTrigger.create({
        trigger: xhero,
        start: "top top",
        end: "+=165%",
        pin,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: 10,
        onUpdate: (self) => {
          const p = Math.min(self.progress / 0.68, 1);
          xhero.style.setProperty("--p", p.toFixed(4));
          xhero.classList.toggle("is-expanded", p > 0.95);
        },
      });

      return () => {
        xhero.classList.remove("is-interactive", "is-expanded");
        xhero.style.removeProperty("--p");
        st.kill();
      };
    });
    cleanups.push(() => heroMM.revert());

    const reveals = gsap.utils.toArray<HTMLElement>(
      "[data-reveal]:not(#top [data-reveal]):not([data-stat]):not([data-stagger-item])"
    );
    reveals.forEach((el) => {
      const dir = el.getAttribute("data-reveal") || "up";
      const from: gsap.TweenVars = { autoAlpha: 0 };
      if (dir === "left") from.x = -80;
      else if (dir === "right") from.x = 80;
      else if (dir === "zoom") {
        from.y = 52;
        from.scale = 0.9;
      } else if (dir !== "fade") {
        from.y = 64;
      }
      gsap.fromTo(el, from, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: 1.05,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
        onComplete: () => {
          el.style.willChange = "auto";
        },
      });
    });

    gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
      const items = Array.from(
        group.querySelectorAll<HTMLElement>("[data-stagger-item]")
      );
      if (!items.length) return;
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 56 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: group, start: "top 82%" },
          onComplete: () => items.forEach((i) => (i.style.willChange = "auto")),
        }
      );
    });

    const statItems = gsap.utils.toArray<HTMLElement>("[data-stats] [data-stat]");
    const statValues = gsap.utils.toArray<HTMLElement>("[data-stats] dt");
    if (statItems.length) {
      gsap.fromTo(
        statItems,
        { opacity: 0, y: 38, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          stagger: 0.2,
          ease: "back.out(1.5)",
          scrollTrigger: { trigger: "[data-stats]", start: "top 82%", once: true },
        }
      );

      const currentYear = new Date().getFullYear();
      const countUp = (el: HTMLElement, delay: number) => {
        const finalText = (el.textContent || "").trim();
        const groups = finalText.match(/\d+/g);
        if (!groups) return;
        const nums = groups.map((n) => parseInt(n, 10));
        const isYear = /^\d{4}$/.test(finalText);
        const render = (p: number) => {
          if (isYear) {
            el.textContent = String(
              Math.round(currentYear + (nums[0] - currentYear) * p)
            );
          } else {
            let i = 0;
            el.textContent = finalText.replace(/\d+/g, () =>
              String(Math.round(nums[i++] * p))
            );
          }
        };
        render(0);
        const obj = { p: 0 };
        gsap.to(obj, {
          p: 1,
          duration: isYear ? 3.2 : 2.4,
          delay,
          ease: "power2.out",
          onUpdate: () => render(obj.p),
          onComplete: () => {
            el.textContent = finalText;
          },
        });
      };

      ScrollTrigger.create({
        trigger: "[data-stats]",
        start: "top 82%",
        once: true,
        onEnter: () => statValues.forEach((el, i) => countUp(el, i * 0.2)),
      });
    }

    if (!reduceMotion) {
      document
        .querySelectorAll<HTMLElement>("[data-text-reveal]")
        .forEach((rootEl) => {
          const paragraphs = Array.from(
            rootEl.querySelectorAll<HTMLElement>("p")
          );
          type Group = { spans: HTMLSpanElement[]; color: string };
          const groups: Group[] = [];

          paragraphs.forEach((p) => {
            const originalColor = getComputedStyle(p).color;
            const text = (p.textContent || "").trim();
            if (!text) return;

            p.textContent = "";
            const tokens = text.match(/\S|\s+/g) || [];
            const spans: HTMLSpanElement[] = [];
            tokens.forEach((tok) => {
              if (/^\s+$/.test(tok)) {
                p.appendChild(document.createTextNode(tok));
              } else {
                const span = document.createElement("span");
                span.textContent = tok;
                p.appendChild(span);
                spans.push(span);
              }
            });
            if (spans.length) groups.push({ spans, color: originalColor });
          });

          if (!groups.length) return;

          const allSpans = groups.flatMap((g) => g.spans);
          gsap.set(allSpans, { color: "rgba(170, 155, 135, 0.42)" });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rootEl,
              start: "top 90%",
              end: "bottom 60%",
              scrub: 1.6,
            },
          });

          let cursor = 0;
          groups.forEach((g) => {
            tl.to(
              g.spans,
              {
                color: g.color,
                ease: "none",
                stagger: { each: 0.04, from: "start" },
              },
              cursor
            );
            cursor += 0.04 * g.spans.length;
          });
        });
    }

    const bars = gsap.utils.toArray<HTMLElement>("[data-bar]");
    if (bars.length) {
      bars.forEach((bar) => {
        const target = bar.style.width || "100%";
        gsap.fromTo(
          bar,
          { width: "0%" },
          {
            width: target,
            duration: 1.4,
            ease: "power3.out",
            scrollTrigger: { trigger: "[data-spectrum]", start: "top 80%" },
          }
        );
      });
    }

    gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
      gsap.fromTo(
        el,
        { yPercent: -5, scale: 1.16 },
        {
          yPercent: 5,
          scale: 1.16,
          ease: "none",
          scrollTrigger: {
            trigger: el.closest("figure") || el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    ScrollTrigger.refresh();

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad, { once: true });
    cleanups.push(() => window.removeEventListener("load", onLoad));
  }

  /* ---------------------------------------------------------------- */
  /* Lightbox                                                          */
  /* ---------------------------------------------------------------- */
  function initLightbox() {
    const box = document.querySelector<HTMLElement>("[data-lightbox]");
    if (!box) return;
    const img = box.querySelector<HTMLImageElement>("[data-lightbox-img]");
    const cap = box.querySelector<HTMLElement>("[data-lightbox-caption]");
    const close = box.querySelector<HTMLElement>("[data-lightbox-close]");

    function show(src: string, alt: string) {
      if (!img) return;
      img.src = src;
      img.alt = alt;
      if (cap) cap.textContent = alt;
      box!.classList.remove("hidden");
      box!.classList.add("flex");
      document.body.style.overflow = "hidden";
      lenis?.stop();
      (close as HTMLElement)?.focus();
    }
    function hide() {
      box!.classList.add("hidden");
      box!.classList.remove("flex");
      document.body.style.overflow = "";
      lenis?.start();
    }

    const zoomHandlers: Array<[HTMLElement, () => void]> = [];
    document.querySelectorAll<HTMLElement>("[data-zoom]").forEach((btn) => {
      const handler = () => {
        const im = btn.querySelector("img");
        if (!im) return;
        show(im.currentSrc || im.src, im.alt);
      };
      btn.addEventListener("click", handler);
      zoomHandlers.push([btn, handler]);
    });

    const onCloseClick = () => hide();
    close?.addEventListener("click", onCloseClick);
    const onBoxClick = (e: MouseEvent) => {
      if (e.target === box) hide();
    };
    box.addEventListener("click", onBoxClick);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !box.classList.contains("hidden")) hide();
    };
    window.addEventListener("keydown", onKey);

    cleanups.push(() => {
      zoomHandlers.forEach(([b, h]) => b.removeEventListener("click", h));
      close?.removeEventListener("click", onCloseClick);
      box.removeEventListener("click", onBoxClick);
      window.removeEventListener("keydown", onKey);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Kontaktformular: Mailto-Fallback                                  */
  /* ---------------------------------------------------------------- */
  function initForm() {
    const form = document.querySelector<HTMLFormElement>("[data-contact-form]");
    if (!form) return;
    const status = form.querySelector<HTMLElement>("[data-form-status]");

    const onSubmit = (e: SubmitEvent) => {
      const usesPlaceholder = form.action.includes("your-form-id");
      if (!usesPlaceholder) return;

      e.preventDefault();
      const data = new FormData(form);
      if (data.get("_gotcha")) return;
      const to = form.dataset.mailto || "";
      const name = String(data.get("name") || "");
      const subject = `Anfrage von ${name} – Schoch Cosmetic`;
      const body = [
        `Name: ${name}`,
        `Telefon: ${data.get("telefon") || "-"}`,
        `E-Mail: ${data.get("email") || "-"}`,
        "",
        String(data.get("nachricht") || ""),
      ].join("\n");
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      if (status) {
        status.textContent =
          "Ihr E-Mail-Programm öffnet sich – oder rufen Sie mich direkt an.";
        status.classList.remove("hidden");
      }
    };

    form.addEventListener("submit", onSubmit);
    cleanups.push(() => form.removeEventListener("submit", onSubmit));
  }

  /* ---------------------------------------------------------------- */
  /* Init                                                              */
  /* ---------------------------------------------------------------- */
  try {
    initSmoothScroll();
    initNav();
    initAnimations();
    initLightbox();
    initForm();
    (window as unknown as { __schochReady?: boolean }).__schochReady = true;
  } catch (err) {
    console.error("[schoch-cosmetic] init error:", err);
    (window as unknown as { __schochReady?: boolean }).__schochReady = true;
    revealAll();
  }

  /* Cleanup für React-Effect (Unmount / Navigation) */
  return () => {
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
    ScrollTrigger.getAll().forEach((t) => t.kill());
    if (tickerFn) gsap.ticker.remove(tickerFn);
    lenis?.destroy();
    lenis = null;
    document.body.style.overflow = "";
  };
}
