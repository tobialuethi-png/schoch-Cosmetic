/* Verschiebbares Preis-Karussell · Progressive Enhancement.
   Portiert aus dem früheren Astro-Inline-Skript der Preisliste.
   • Touch: natives Snap-Scrollen (CSS).
   • Maus: greifen & ziehen mit Schwung, danach Snappen auf eine Karte.
   • Pfeil-Buttons + Fortschrittsbalken + fokussierbarer Track.
   Iteriert über ALLE [data-pcar]-Wurzeln (Haarentfernung + Fusspflege). */
export function initPriceCarousel(): () => void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const teardowns: Array<() => void> = [];

  document.querySelectorAll<HTMLElement>("[data-pcar]").forEach((root) => {
    const track = root.querySelector<HTMLElement>("[data-pcar-track]");
    if (!track) return;
    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-pcar-card]")
    );
    if (!cards.length) return;
    const prevBtn = root.querySelector<HTMLButtonElement>("[data-pcar-prev]");
    const nextBtn = root.querySelector<HTMLButtonElement>("[data-pcar-next]");
    const bar = root.querySelector<HTMLElement>("[data-pcar-bar]");
    const barWrap = bar?.parentElement ?? null;

    const maxScroll = () => track.scrollWidth - track.clientWidth;
    const clampX = (x: number) => Math.max(0, Math.min(maxScroll(), x));
    const padLeft = () =>
      parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;

    const update = () => {
      const max = maxScroll();
      root.classList.toggle("is-static", max <= 4);
      if (bar && barWrap) {
        const ratio = Math.max(
          0.1,
          Math.min(1, track.clientWidth / track.scrollWidth)
        );
        bar.style.width = `${ratio * 100}%`;
        const room = Math.max(0, barWrap.clientWidth - bar.clientWidth);
        const p = max > 0 ? track.scrollLeft / max : 0;
        bar.style.transform = `translateX(${room * p}px)`;
      }
      if (prevBtn) prevBtn.disabled = track.scrollLeft <= 2;
      if (nextBtn) nextBtn.disabled = track.scrollLeft >= max - 2;
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });

    const nearestIndex = (scrollLeft: number) => {
      const target = scrollLeft + padLeft();
      let best = 0;
      let bestD = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft - target);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return best;
    };

    const scrollToCard = (i: number) => {
      const idx = Math.max(0, Math.min(cards.length - 1, i));
      track.scrollTo({
        left: clampX(cards[idx].offsetLeft - padLeft()),
        behavior: reduce ? "auto" : "smooth",
      });
    };

    const perView = () => {
      const cw = cards[0].offsetWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
      return Math.max(1, Math.round(track.clientWidth / (cw + gap)));
    };
    const onPrev = () =>
      scrollToCard(nearestIndex(track.scrollLeft) - perView());
    const onNext = () =>
      scrollToCard(nearestIndex(track.scrollLeft) + perView());
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);

    if (fine) {
      let down = false;
      let moved = 0;
      let startX = 0;
      let startLeft = 0;
      let lastX = 0;
      let lastT = 0;
      let vel = 0;
      let raf = 0;

      const stopMomentum = () => {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      };
      const snap = () => scrollToCard(nearestIndex(track.scrollLeft));

      const onDown = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        down = true;
        moved = 0;
        startX = e.clientX;
        startLeft = track.scrollLeft;
        lastX = e.clientX;
        lastT = e.timeStamp;
        vel = 0;
        stopMomentum();
        track.classList.add("is-grabbing");
        try {
          track.setPointerCapture(e.pointerId);
        } catch {}
      };
      const onMove = (e: PointerEvent) => {
        if (!down) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > moved) moved = Math.abs(dx);
        track.scrollLeft = startLeft - dx;
        const dt = e.timeStamp - lastT;
        if (dt > 0) vel = (e.clientX - lastX) / dt;
        lastX = e.clientX;
        lastT = e.timeStamp;
      };
      const onUp = (e: PointerEvent) => {
        if (!down) return;
        down = false;
        track.classList.remove("is-grabbing");
        try {
          track.releasePointerCapture(e.pointerId);
        } catch {}
        if (reduce || Math.abs(vel) < 0.05) {
          snap();
          return;
        }
        let v = vel * 16;
        const friction = 0.94;
        const step = () => {
          v *= friction;
          const next = track.scrollLeft - v;
          const max = maxScroll();
          if (next <= 0 || next >= max) {
            track.scrollLeft = Math.max(0, Math.min(max, next));
            raf = 0;
            snap();
            return;
          }
          track.scrollLeft = next;
          if (Math.abs(v) > 0.3) {
            raf = requestAnimationFrame(step);
          } else {
            raf = 0;
            snap();
          }
        };
        raf = requestAnimationFrame(step);
      };
      const onDrag = (e: Event) => e.preventDefault();
      const onClickCapture = (e: MouseEvent) => {
        if (moved > 6) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      track.addEventListener("pointerdown", onDown);
      track.addEventListener("pointermove", onMove);
      track.addEventListener("pointerup", onUp);
      track.addEventListener("pointercancel", onUp);
      track.addEventListener("dragstart", onDrag);
      track.addEventListener("click", onClickCapture, true);

      teardowns.push(() => {
        stopMomentum();
        track.removeEventListener("pointerdown", onDown);
        track.removeEventListener("pointermove", onMove);
        track.removeEventListener("pointerup", onUp);
        track.removeEventListener("pointercancel", onUp);
        track.removeEventListener("dragstart", onDrag);
        track.removeEventListener("click", onClickCapture, true);
      });
    }

    update();
    const onResize = () => update();
    window.addEventListener("resize", onResize, { passive: true });
    const onLoad = () => update();
    window.addEventListener("load", onLoad, { once: true });
    document.fonts?.ready.then(update).catch(() => {});

    teardowns.push(() => {
      track.removeEventListener("scroll", onScroll);
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onLoad);
    });
  });

  return () => teardowns.forEach((fn) => fn());
}
