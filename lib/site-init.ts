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
  // Mobile (Touch): KEIN Lenis, KEIN gepinnter Scroll-Scrub-Hero. Pinning +
  // Scrub desynchronisieren mit nativem Touch-Scrolling und ruckeln. Auf Mobile
  // scrollt die Seite rein nativ -> garantiert fluessig.
  const isMobile = window.matchMedia("(max-width: 1023px)").matches;

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
    if (reduceMotion || isMobile) return;
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

    // Sektion möglichst vollständig & vertikal zentriert zeigen. Da die
    // Sektionen grosszügiges py-Padding haben, wird bei höheren Sektionen in
    // dieses Padding hineingescrollt, sodass auch der untere Teil sichtbar wird.
    // Schutz-Klammer: nie über den Inhaltsbeginn hinaus scrollen, damit die
    // Überschrift auch bei sehr hohen Sektionen sichtbar bleibt.
    const padTop = parseFloat(getComputedStyle(el as HTMLElement).paddingTop) || 0;
    const centeredY = elTop - (vh - elHeight) / 2;
    const maxIntoSection = elTop + Math.max(0, padTop - 24);
    const targetY = Math.max(0, Math.min(centeredY, maxIntoSection));

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

    // Gepinnter Scroll-Expand-Hero mit JS-Pin NUR auf Desktop. Auf Mobile macht
    // das Pinning natives position: sticky (siehe CSS) – kein JS-Pin, kein Jank.
    const heroMM = gsap.matchMedia();
    heroMM.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
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

    // Mobile-Hero: Pinning macht CSS position:sticky. Moderne Browser treiben
    // den Expand komplett per CSS Scroll-driven Animations (Compositor, kein JS
    // pro Frame). Nur Browser OHNE diese Unterstuetzung bekommen hier einen
    // leichten --p-Transform-Scrub – ebenfalls ohne JS-Pin, daher fluessig.
    if (isMobile) {
      const supportsSDA =
        typeof CSS !== "undefined" &&
        typeof CSS.supports === "function" &&
        CSS.supports("animation-timeline: view()");
      const xheroEl = document.querySelector<HTMLElement>("[data-xhero]");
      if (!supportsSDA && xheroEl) {
        const stMobile = ScrollTrigger.create({
          trigger: xheroEl,
          start: "top top",
          end: "+=120%",
          scrub: 0.25,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = Math.min(self.progress / 0.7, 1);
            xheroEl.style.setProperty("--p", p.toFixed(4));
            xheroEl.classList.toggle("is-expanded", p > 0.9);
          },
        });
        cleanups.push(() => stMobile.kill());
      }
    }

    // Kennzahlen-Count-up (in beiden Pfaden genutzt).
    const currentYear = new Date().getFullYear();
    const countUp = (el: HTMLElement, delay: number) => {
      const finalText = (el.textContent || "").trim();
      const grp = finalText.match(/\d+/g);
      if (!grp) return;
      const nums = grp.map((n) => parseInt(n, 10));
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

    const statValues = gsap.utils.toArray<HTMLElement>("[data-stats] dt");

    // Mobile: Einblendungen laufen als CSS-Transition (Compositor), ausgeloest
    // per IntersectionObserver (feuert einmal, setzt .is-inview). KEIN GSAP-
    // Tween/ScrollTrigger pro Element -> keine JS-Arbeit pro Frame beim
    // Scrollen -> kein Jank. Desktop: wie gehabt per GSAP-ScrollTrigger.
    if (isMobile) {
      initMobileReveals(countUp, statValues);
    } else {
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
          onStart: () => {
            el.style.willChange = "transform, opacity";
          },
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
            onStart: () =>
              items.forEach((i) => (i.style.willChange = "transform, opacity")),
            onComplete: () => items.forEach((i) => (i.style.willChange = "auto")),
          }
        );
      });

      const statItems = gsap.utils.toArray<HTMLElement>("[data-stats] [data-stat]");
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

        ScrollTrigger.create({
          trigger: "[data-stats]",
          start: "top 82%",
          once: true,
          onEnter: () => statValues.forEach((el, i) => countUp(el, i * 0.2)),
        });
      }
    }

    // Wort-fuer-Wort Farb-Reveal nur auf Desktop: animiert pro Frame die
    // `color` vieler Spans (Repaint, nicht GPU-beschleunigt) und ruckelt auf
    // Mobile. Dort uebernimmt der Absatz-Fly-in (data-reveal) das Reveal.
    if (!isMobile) {
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

    // Spektrum-Balken: Desktop per GSAP (width). Mobile uebernimmt der
    // IntersectionObserver + CSS (transform: scaleX -> Compositor).
    if (!isMobile) {
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
    }

    // Parallax-Scrub nur auf Desktop. Auf Mobile bleibt das Bild statisch
    // leicht gezoomt (scale(1.16) via CSS) – kein pro-Frame-Transform.
    if (!isMobile) {
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
    }

    ScrollTrigger.refresh();

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad, { once: true });
    cleanups.push(() => window.removeEventListener("load", onLoad));

    // ---- Mobile-Reveals: IntersectionObserver + CSS-Transition ----
    // Eine Klasse pro Element (einmalig), die eigentliche Bewegung macht CSS
    // auf dem Compositor (siehe globals.css). Funktions-Deklaration -> wird
    // gehoisted, daher oben im isMobile-Zweig bereits aufrufbar.
    function initMobileReveals(
      runCountUp: (el: HTMLElement, delay: number) => void,
      statValues: HTMLElement[]
    ) {
      const opts: IntersectionObserverInit = {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12,
      };
      const observers: IntersectionObserver[] = [];
      const reveal = (el: Element) => el.classList.add("is-inview");

      // Einzel-Reveals
      const single = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          reveal(e.target);
          obs.unobserve(e.target);
        });
      }, opts);
      document
        .querySelectorAll<HTMLElement>(
          "[data-reveal]:not(#top [data-reveal]):not([data-stat]):not([data-stagger-item])"
        )
        .forEach((el) => single.observe(el));
      observers.push(single);

      // Stagger-Gruppen (gestaffelte transition-delay)
      const group = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          Array.from(
            (e.target as HTMLElement).querySelectorAll<HTMLElement>(
              "[data-stagger-item]"
            )
          ).forEach((it, i) => {
            it.style.transitionDelay = `${(i * 0.08).toFixed(2)}s`;
            reveal(it);
          });
          obs.unobserve(e.target);
        });
      }, opts);
      document
        .querySelectorAll<HTMLElement>("[data-stagger]")
        .forEach((g) => group.observe(g));
      observers.push(group);

      // Kennzahlen: gestaffeltes Reveal + Count-up
      const statsRoot = document.querySelector<HTMLElement>("[data-stats]");
      if (statsRoot) {
        const items = Array.from(
          statsRoot.querySelectorAll<HTMLElement>("[data-stat]")
        );
        const stats = new IntersectionObserver((entries, obs) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            items.forEach((it, i) => {
              it.style.transitionDelay = `${(i * 0.12).toFixed(2)}s`;
              reveal(it);
            });
            statValues.forEach((el, i) => runCountUp(el, i * 0.2));
            obs.unobserve(e.target);
          });
        }, opts);
        stats.observe(statsRoot);
        observers.push(stats);
      }

      // Spektrum-Balken (CSS transform: scaleX)
      const bar = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          reveal(e.target);
          obs.unobserve(e.target);
        });
      }, opts);
      document
        .querySelectorAll<HTMLElement>("[data-bar]")
        .forEach((b) => bar.observe(b));
      observers.push(bar);

      cleanups.push(() => observers.forEach((o) => o.disconnect()));
    }
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
    const submitBtn = form.querySelector<HTMLButtonElement>(
      'button[type="submit"]'
    );

    // Statusmeldung im Formular (kein Redirect). ok=true -> Gold-Styling
    // (Default-Klassen), ok=false -> dezent rotes Inline-Styling.
    const setStatus = (msg: string, ok: boolean) => {
      if (!status) return;
      status.textContent = msg;
      status.classList.remove("hidden");
      status.style.cssText = ok
        ? ""
        : "color:#f3b4a6;border-color:rgba(214,92,70,0.45);background:rgba(214,92,70,0.12)";
    };

    // Fallback, falls noch kein Web3Forms-Key hinterlegt ist: oeffnet das
    // Mailprogramm, damit das Formular nie funktionslos ist.
    const sendViaMailto = (data: FormData) => {
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
    };

    const onSubmit = async (e: SubmitEvent) => {
      // preventDefault erst NACH der Browser-Pflichtfeld-Validierung: das
      // submit-Event feuert nur, wenn alle required-Felder gueltig sind.
      e.preventDefault();
      const data = new FormData(form);
      if (data.get("_gotcha")) return; // Honeypot

      const accessKey = String(data.get("access_key") || "");
      if (!accessKey || accessKey.includes("YOUR_WEB3FORMS")) {
        sendViaMailto(data);
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      setStatus("Wird gesendet …", true);

      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data,
        });
        const json = await res.json().catch(() => ({ success: false }));
        if (res.ok && json.success) {
          form.reset();
          setStatus(
            "Vielen Dank! Ihre Nachricht wurde gesendet – ich melde mich zeitnah bei Ihnen.",
            true
          );
        } else {
          setStatus(
            "Das hat leider nicht geklappt. Bitte versuchen Sie es erneut oder rufen Sie mich direkt an.",
            false
          );
        }
      } catch {
        setStatus(
          "Senden fehlgeschlagen – bitte Internetverbindung prüfen oder mich direkt anrufen.",
          false
        );
      } finally {
        if (submitBtn) submitBtn.disabled = false;
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
