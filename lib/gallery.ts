import gsap from "gsap";

/* WILLKOMMEN · interaktive Foto-Galerie.
   Portiert aus dem früheren Astro-Inline-Skript der PhotoGallery.
   Desktop: greif-/ziehbarer Fächer (GSAP-Spring). Touch: Snap-Scroller.
   Respektiert prefers-reduced-motion. initGallery() gibt Cleanup zurück. */
export function initGallery(): () => void {
  const section = document.querySelector<HTMLElement>("[data-pg]");
  if (!section) return () => {};
  const track = section.querySelector<HTMLElement>("[data-pg-track]");
  const cards = Array.from(
    section.querySelectorAll<HTMLElement>("[data-pg-card]")
  );
  if (!track || !cards.length) return () => {};
  const hint = section.querySelector<HTMLElement>(".pg-hint");

  let mm: ReturnType<typeof gsap.matchMedia> | null = null;

  const reveal = () => {
    track.classList.remove("pg-pending", "is-fan");
    cards.forEach((c) => (c.style.opacity = "1"));
  };

  try {
    mm = gsap.matchMedia();
    const n = cards.length;
    const center = (n - 1) / 2;

    const yOffsets = [30, 9, 44, 15, 40, 8, 28];
    const rots = [-3, 2.4, -1.8, 3, -2.6, 2, -3.4];
    const home = cards.map((_, i) => ({
      y: yOffsets[i % yOffsets.length],
      rot: rots[i % rots.length],
      z: 40 - Math.abs(i - center) * 6,
    }));

    mm.add("(min-width: 768px)", () => {
      try {
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        const homeX = new Array<number>(n).fill(0);
        const qx = cards.map((c) =>
          gsap.quickTo(c, "x", { duration: 0.18, ease: "power3.out" })
        );
        const qy = cards.map((c) =>
          gsap.quickTo(c, "y", { duration: 0.18, ease: "power3.out" })
        );

        const layout = () => {
          const rect = cards[0].getBoundingClientRect();
          const cardW = rect.width || 220;
          const cardH = rect.height || cardW * 1.25;
          const avail = Math.min(track.clientWidth, 1180);
          const step = Math.min(cardW * 0.78, (avail - cardW) / (n - 1));
          for (let i = 0; i < n; i++) homeX[i] = (i - center) * step;
          track.style.setProperty("--pg-stage-h", `${Math.round(cardH + 70)}px`);
        };

        track.classList.add("is-fan");
        cards.forEach((c, i) => {
          c.style.zIndex = String(home[i].z);
          gsap.set(c, { xPercent: -50, x: 0, y: 0, rotation: 0, opacity: 0 });
        });
        layout();
        track.classList.remove("pg-pending");
        if (!reduce && hint) hint.style.display = "block";

        const placeInstant = () =>
          cards.forEach((c, i) =>
            gsap.set(c, {
              x: homeX[i],
              y: home[i].y,
              rotation: home[i].rot,
              opacity: 1,
            })
          );

        let entered = false;
        const enter = () => {
          if (entered) return;
          entered = true;
          gsap.to(cards, {
            x: (i: number) => homeX[i],
            y: (i: number) => home[i].y,
            rotation: (i: number) => home[i].rot,
            opacity: 1,
            duration: 1.1,
            ease: "back.out(1.3)",
            stagger: { each: 0.1, from: "center" },
          });
        };

        let io: IntersectionObserver | null = null;
        if (reduce) {
          placeInstant();
          entered = true;
        } else {
          io = new IntersectionObserver(
            (entries) => {
              entries.forEach((e) => {
                if (e.isIntersecting) {
                  enter();
                  io?.disconnect();
                }
              });
            },
            { threshold: 0.3 }
          );
          io.observe(track);
        }

        const canHover = window.matchMedia("(hover: hover)").matches;
        const cleanups: Array<() => void> = [];
        cards.forEach((card, i) => {
          let dragging = false;
          let sx = 0;
          let sy = 0;
          let pid = -1;

          const settle = (extra: gsap.TweenVars = {}) =>
            gsap.to(card, {
              x: homeX[i],
              y: home[i].y,
              rotation: home[i].rot,
              scale: 1,
              ease: "elastic.out(0.65, 0.5)",
              duration: 0.9,
              overwrite: "auto",
              onComplete: () => (card.style.zIndex = String(home[i].z)),
              ...extra,
            });

          const onEnter = () => {
            if (dragging || !entered) return;
            gsap.to(card, {
              scale: 1.1,
              y: home[i].y - 16,
              rotation: home[i].rot * 0.4,
              duration: 0.5,
              ease: "power3.out",
              zIndex: 999,
              overwrite: "auto",
            });
          };
          const onLeave = () => {
            if (dragging) return;
            settle({ ease: "power3.out", duration: 0.6 });
          };
          const onDown = (e: PointerEvent) => {
            if (!entered) return;
            dragging = true;
            pid = e.pointerId;
            try {
              card.setPointerCapture(pid);
            } catch {}
            sx = e.clientX;
            sy = e.clientY;
            gsap.killTweensOf(card);
            gsap.set(card, { zIndex: 999 });
            gsap.to(card, {
              scale: 1.12,
              rotation: home[i].rot * 0.3,
              duration: 0.3,
              ease: "power2.out",
            });
            card.classList.add("is-grabbing");
          };
          const onMove = (e: PointerEvent) => {
            if (!dragging) return;
            qx[i](homeX[i] + (e.clientX - sx));
            qy[i](home[i].y + (e.clientY - sy));
          };
          const onUp = () => {
            if (!dragging) return;
            dragging = false;
            card.classList.remove("is-grabbing");
            try {
              card.releasePointerCapture(pid);
            } catch {}
            settle();
          };

          // Alle Pointer-Handler arbeiten ohne preventDefault (Drag laeuft ueber
          // GSAP-Transforms) -> passive, damit sie das Scrollen nie blockieren.
          if (canHover) {
            card.addEventListener("pointerenter", onEnter, { passive: true });
            card.addEventListener("pointerleave", onLeave, { passive: true });
          }
          card.addEventListener("pointerdown", onDown, { passive: true });
          card.addEventListener("pointermove", onMove, { passive: true });
          card.addEventListener("pointerup", onUp, { passive: true });
          card.addEventListener("pointercancel", onUp, { passive: true });

          cleanups.push(() => {
            card.removeEventListener("pointerenter", onEnter);
            card.removeEventListener("pointerleave", onLeave);
            card.removeEventListener("pointerdown", onDown);
            card.removeEventListener("pointermove", onMove);
            card.removeEventListener("pointerup", onUp);
            card.removeEventListener("pointercancel", onUp);
          });
        });

        const onResize = () => {
          layout();
          if (entered) cards.forEach((c, i) => gsap.set(c, { x: homeX[i] }));
        };
        window.addEventListener("resize", onResize, { passive: true });

        return () => {
          io?.disconnect();
          window.removeEventListener("resize", onResize);
          cleanups.forEach((fn) => fn());
          track.classList.remove("is-fan");
          track.style.removeProperty("--pg-stage-h");
          if (hint) hint.style.display = "";
          gsap.set(cards, { clearProps: "all" });
          cards.forEach((c) => (c.style.zIndex = ""));
        };
      } catch (err) {
        console.error("[schoch-cosmetic] gallery fan:", err);
        reveal();
        return () => {};
      }
    });

    mm.add("(max-width: 767.98px)", () => {
      reveal();
      if (hint) hint.style.display = "";
      return () => {};
    });
  } catch (err) {
    console.error("[schoch-cosmetic] gallery init:", err);
    reveal();
  }

  return () => mm?.revert();
}
