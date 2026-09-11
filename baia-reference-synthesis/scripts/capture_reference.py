#!/usr/bin/env python3
"""
capture_reference.py — Beobachtung und Messung einer Referenzseite (BAIA Reference Synthesis).

Erfasst Screenshots und MESSWERTE. Speichert niemals HTML, CSS, JS, Bilder, Videos, Fonts
oder andere Assets der Referenz — ausschließlich Beobachtungen (Computed Styles, Geometrie,
Animations-Timings, Bibliotheks-Signale, Hover-Diffs).

Beispiele:
  python3 capture_reference.py https://example.com --slug ref-a --out reports/refs/ref-a
  python3 capture_reference.py https://example.com --slug ref-a --out reports/refs/ref-a \
      --viewports 1440x900,390x844 --hover 12 --click "button[aria-label='Menu']" --burst-at 0,2400 --headed

Output (im --out Ordner):
  reference.json                       Messwerte, Motion-Probe, Section-Inventar, Fonts, Breakpoints
  vp-<WxH>/step-NN-y<Y>-start.png      Screenshot direkt nach dem Scroll-Schritt
  vp-<WxH>/step-NN-y<Y>-settled.png    Screenshot nach dem Einschwingen
  vp-<WxH>/click-N.png                 Screenshot nach --click
  motion/vp-<WxH>/intro-fK-<ms>ms.png  Frame-Burst der Intro-Choreografie (erstes Viewport)
  motion/vp-<WxH>/burst-y<Y>-fK-<ms>ms.png   Frame-Bursts an --burst-at Positionen

Exit-Codes: 0 ok · 2 Navigation/Blockade (Challenge, Login, Fehler) · 3 Playwright fehlt
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

# Windows-Konsole: UTF-8 erzwingen, sonst UnicodeEncodeError bei Pfeilen/Umlauten
for s in (sys.stdout, sys.stderr): s.reconfigure(encoding="utf-8", errors="replace")

SCHEMA = "baia-reference-synthesis/reference-1.0"

# ----------------------------------------------------------------------------- JS-Snippets

JS_DESC = r"""
const __desc = (el) => {
  if (!el || !el.tagName) return null;
  const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.') : '';
  return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (cls ? '.' + cls : '');
};
"""

JS_PAGE_INFO = r"""
() => {
  """ + JS_DESC + r"""
  const q = (s) => Array.from(document.querySelectorAll(s));
  const scripts = q('script[src]').map(s => s.src);
  const libNames = ['gsap','scrolltrigger','lenis','three','framer','motion','locomotive','swiper','splitting','split-type','lottie','rive','spline','barba','swup','curtains','ogl','pixi','anime','matter','webflow','wix','squarespace'];
  const hits = {};
  for (const src of scripts) {
    const l = src.toLowerCase();
    for (const n of libNames) if (l.includes(n)) hits[n] = (hits[n] || 0) + 1;
  }
  const gen = document.querySelector('meta[name="generator"]');
  const canvases = q('canvas').map(c => {
    let gl = false; try { gl = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) {}
    const r = c.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), webgl: gl, desc: __desc(c) };
  });
  const html = document.documentElement;
  const globals = (window.gsap && window.gsap.core && typeof window.gsap.core.globals === 'function') ? window.gsap.core.globals() : {};
  let splitInline = 0;
  for (const h of q('h1, h2, h3')) {
    let n = 0;
    for (const s of h.querySelectorAll('span')) { if (getComputedStyle(s).display === 'inline-block') n++; }
    if (n > 10) splitInline++;
  }
  const bodyCursor = getComputedStyle(document.body).cursor;
  const cursorEl = q('[class*="cursor"], [id*="cursor"]').find(e => getComputedStyle(e).position === 'fixed');
  const fonts = [];
  try { document.fonts.forEach(f => fonts.push({ family: String(f.family).replace(/["']/g, ''), weight: f.weight, style: f.style, status: f.status })); } catch (e) {}
  const seen = new Set();
  const fontsUnique = fonts.filter(f => { const k = f.family + '|' + f.weight + '|' + f.style; if (seen.has(k)) return false; seen.add(k); return true; });
  return {
    title: document.title,
    lang: html.lang || null,
    generator: gen ? gen.content : null,
    script_src_hosts: Array.from(new Set(scripts.map(s => { try { return new URL(s).host; } catch (e) { return null; } }).filter(Boolean))),
    libs: {
      script_name_hits: hits,
      gsap_global: !!window.gsap,
      gsap_version: window.gsap ? (window.gsap.version || null) : null,
      scrolltrigger: !!(window.ScrollTrigger || globals.ScrollTrigger),
      lenis: !!(window.lenis || html.classList.contains('lenis') || document.querySelector('.lenis, [data-lenis-prevent]')),
      locomotive: !!document.querySelector('[data-scroll-container]'),
      three_global: !!window.THREE,
      canvas: canvases,
      text_splitting: { char_nodes: q('.char').length, word_nodes: q('.word').length, line_nodes: q('.line').length, headings_with_inline_block_spans: splitInline },
      video: q('video').length,
      iframes: q('iframe').map(i => { try { return new URL(i.src).host; } catch (e) { return (i.src || '').slice(0, 60); } }),
      lottie: !!(window.lottie || document.querySelector('lottie-player, dotlottie-player, [data-animation-path]')),
      rive: !!document.querySelector('canvas[data-rive], .rive-canvas'),
      swiper: !!document.querySelector('.swiper'),
      barba: !!document.querySelector('[data-barba]'),
      webflow: !!window.Webflow,
      framer_site: !!document.querySelector('[data-framer-name], #__framer-badge-container'),
      custom_cursor: bodyCursor === 'none' || !!cursorEl,
      custom_cursor_element: cursorEl ? __desc(cursorEl) : null
    },
    fonts: fontsUnique
  };
}
"""

JS_STYLESHEETS = r"""
() => {
  const vars = {}; const mq = {}; let sheets = 0, crossOrigin = 0, varCount = 0;
  const isRootSel = (sel) => (sel || '').split(',').map(s => s.trim()).some(s => s === ':root' || s === 'html' || s === 'body');
  const walk = (rules) => {
    for (const r of rules) {
      try {
        if (r.type === 1 && isRootSel(r.selectorText)) {
          for (const p of r.style) { if (p.startsWith('--') && varCount < 400) { vars[p] = r.style.getPropertyValue(p).trim(); varCount++; } }
        } else if (r.type === 4) {
          const c = r.conditionText || (r.media && r.media.mediaText) || '';
          mq[c] = (mq[c] || 0) + 1;
          if (r.cssRules) walk(r.cssRules);
        } else if (r.type === 12 && r.cssRules) {
          walk(r.cssRules);
        } else if (r.type === 3 && r.styleSheet) {
          try { walk(r.styleSheet.cssRules); } catch (e) { crossOrigin++; }
        }
      } catch (e) {}
    }
  };
  for (const s of document.styleSheets) { sheets++; try { walk(s.cssRules); } catch (e) { crossOrigin++; } }
  return { root_vars: vars, media_queries: mq, sheets, cross_origin_sheets: crossOrigin };
}
"""

JS_VIEWPORT_STATE = r"""
() => {
  """ + JS_DESC + r"""
  const html = document.documentElement, body = document.body;
  const cs = getComputedStyle(html), cb = getComputedStyle(body);
  const sh = Math.max(html.scrollHeight, body.scrollHeight);
  const cands = [];
  let n = 0;
  for (const e of document.querySelectorAll('body *')) {
    if (++n > 4000) break;
    const s = getComputedStyle(e);
    if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && e.scrollHeight > e.clientHeight + 50 && e.clientHeight > innerHeight * 0.6) {
      e.setAttribute('data-baia-scroller', String(cands.length));
      cands.push(__desc(e)); if (cands.length >= 3) break;
    }
  }
  const fixedFull = [];
  let m = 0;
  for (const e of document.querySelectorAll('body *')) {
    if (++m > 6000) break;
    const s = getComputedStyle(e);
    if (s.position !== 'fixed') continue;
    const r = e.getBoundingClientRect();
    if (r.width >= innerWidth * 0.8 && r.height >= innerHeight * 0.8 && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.05) fixedFull.push(__desc(e));
    if (fixedFull.length >= 3) break;
  }
  return {
    scroll_height: sh, inner_height: innerHeight, inner_width: innerWidth,
    html_overflow: cs.overflowY, body_overflow: cb.overflowY,
    lenis_class: html.classList.contains('lenis'),
    scroller_candidates: cands,
    fixed_fullscreen_elements: fixedFull
  };
}
"""

JS_SECTIONS = r"""
() => {
  """ + JS_DESC + r"""
  const vis = el => { const r = el.getBoundingClientRect(); return r.height > 120 && r.width > innerWidth * 0.3; };
  let root = document.querySelector('main') || document.body;
  let kids = Array.from(root.children).filter(vis);
  for (let depth = 0; depth < 4 && kids.length < 3; depth++) {
    const big = kids.length ? kids.slice().sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0] : null;
    if (!big) break;
    const inner = Array.from(big.children).filter(vis);
    if (inner.length < 2) break;
    root = big; kids = inner;
  }
  kids = Array.from(root.children).filter(vis);
  return { root: __desc(root), sections: kids.slice(0, 60).map((el, i) => {
    const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
    const h = el.querySelector('h1, h2, h3, h4');
    const first = el.firstElementChild; const fr = first ? first.getBoundingClientRect() : null;
    return {
      index: i + 1, desc: __desc(el), tag: el.tagName.toLowerCase(), id: el.id || null,
      classes: (typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 4).join(' ') : '').slice(0, 80),
      top: Math.round(r.top + scrollY), height: Math.round(r.height),
      heading: h ? (h.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80) : null,
      background: s.backgroundColor, color: s.color, position: s.position, overflow: s.overflow,
      padding: [s.paddingTop, s.paddingBottom],
      counts: {
        img: el.querySelectorAll('img, picture, svg').length, video: el.querySelectorAll('video').length,
        canvas: el.querySelectorAll('canvas').length, links: el.querySelectorAll('a, button').length,
        headings: el.querySelectorAll('h1, h2, h3').length, text_chars: (el.innerText || '').length
      },
      first_child: fr ? { desc: __desc(first), width: Math.round(fr.width), left: Math.round(fr.left) } : null
    };
  }) };
}
"""

JS_TYPOGRAPHY = r"""
() => {
  const sels = ['h1','h2','h3','h4','p','a','button','nav a','li','small','label','blockquote','[class*="eyebrow"], [class*="label"], [class*="kicker"], [class*="tag"]'];
  const out = [];
  for (const sel of sels) {
    let n = 0;
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) continue;
      const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none') continue;
      out.push({ selector: sel, text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
        font_family: s.fontFamily, font_size: s.fontSize, font_weight: s.fontWeight, line_height: s.lineHeight,
        letter_spacing: s.letterSpacing, text_transform: s.textTransform, color: s.color,
        width: Math.round(r.width), top: Math.round(r.top + scrollY) });
      if (++n >= 3) break;
    }
  }
  return out;
}
"""

JS_COLORS = r"""
() => {
  const count = {}; const grads = {}; let n = 0;
  const add = (v) => { if (!v || v === 'rgba(0, 0, 0, 0)' || v === 'transparent') return; count[v] = (count[v] || 0) + 1; };
  for (const el of document.querySelectorAll('body *')) {
    if (++n > 4000) break;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    const s = getComputedStyle(el);
    add(s.color); add(s.backgroundColor);
    if (s.borderTopStyle !== 'none' && s.borderTopWidth !== '0px') add(s.borderTopColor);
    if (s.backgroundImage && s.backgroundImage.includes('gradient')) { const k = s.backgroundImage.slice(0, 160); grads[k] = (grads[k] || 0) + 1; }
  }
  const sorted = (o, k) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, k).map(([value, uses]) => ({ value, uses }));
  return { colors: sorted(count, 40), gradients: sorted(grads, 10), sampled_elements: Math.min(n, 4000) };
}
"""

JS_WAAPI = r"""
() => {
  """ + JS_DESC + r"""
  let list = [];
  try { list = document.getAnimations(); } catch (e) { return { error: String(e), items: [] }; }
  const items = list.slice(0, 300).map(a => {
    let t = {}; try { t = a.effect && a.effect.getTiming ? a.effect.getTiming() : {}; } catch (e) {}
    let target = null; try { target = __desc(a.effect && a.effect.target); } catch (e) {}
    return { kind: a.constructor.name, name: a.animationName || a.transitionProperty || a.id || null, target,
      duration: t.duration, delay: t.delay, easing: t.easing, iterations: t.iterations, fill: t.fill, direction: t.direction,
      play_state: a.playState };
  });
  return { items, running: items.filter(i => i.play_state === 'running').length };
}
"""

JS_GSAP = r"""
() => {
  """ + JS_DESC + r"""
  const g = window.gsap; if (!g) return { available: false };
  const easeName = (e) => { if (!e) return null; if (typeof e === 'string') return e; if (typeof e === 'function') return e.name || 'function'; return String(e); };
  const simple = (v) => (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') ? v : (typeof v === 'function' ? 'fn' : (Array.isArray(v) ? '[array]' : (v && typeof v === 'object' ? '{obj}' : String(v))));
  const skip = new Set(['onComplete','onUpdate','onStart','onReverseComplete','onRepeat','ease','duration','delay','stagger','scrollTrigger','paused','repeat','yoyo','immediateRender','overwrite','data','id','callbackScope','onInterrupt','onCompleteParams','onUpdateParams','defaults']);
  const tweens = [];
  try {
    const kids = g.globalTimeline.getChildren(true, true, true).slice(0, 400);
    for (const tw of kids) {
      const vars = tw.vars || {}; const props = {};
      for (const k of Object.keys(vars)) { if (!skip.has(k)) props[k] = simple(vars[k]); }
      let targets = [], count = null;
      try { const t = tw.targets ? tw.targets() : []; count = t.length; targets = t.slice(0, 4).map(x => (x && x.tagName) ? __desc(x) : (typeof x === 'object' ? '[object]' : String(x))); } catch (e) {}
      tweens.push({ type: vars.scrollTrigger ? 'tween+scrollTrigger' : (typeof tw.getChildren === 'function' ? 'timeline' : 'tween'),
        targets, target_count: count, duration: tw.duration(), delay: tw.delay(), ease: easeName(vars.ease),
        stagger: simple(vars.stagger), repeat: (vars.repeat === undefined ? null : vars.repeat), yoyo: !!vars.yoyo,
        props, progress: +tw.progress().toFixed(3), active: tw.isActive(), id: vars.id || null });
    }
  } catch (e) { return { available: true, error: String(e), tweens: [], scrolltriggers: [] }; }
  let sts = [];
  try {
    const globals = (g.core && typeof g.core.globals === 'function') ? g.core.globals() : {};
    const ST = window.ScrollTrigger || globals.ScrollTrigger;
    if (ST && ST.getAll) sts = ST.getAll().slice(0, 300).map(st => {
      const v = st.vars || {};
      return { trigger: __desc(st.trigger), start: st.start, end: st.end, start_vars: simple(v.start), end_vars: simple(v.end),
        scrub: simple(v.scrub), pin: !!(st.pin || v.pin), snap: v.snap ? simple(v.snap) : null, toggle_actions: v.toggleActions || null,
        once: !!v.once, progress: +st.progress.toFixed(3),
        animation: st.animation ? { duration: st.animation.duration(), ease: easeName(st.animation.vars && st.animation.vars.ease) } : null,
        id: v.id || null };
    });
  } catch (e) { sts = [{ error: String(e) }]; }
  return { available: true, version: g.version || null, tweens, scrolltriggers: sts };
}
"""

JS_HOVER_TARGETS = r"""
(n) => {
  const els = Array.from(document.querySelectorAll('a[href], button, [role="button"]'));
  const seen = new Set(); const out = []; let k = 0;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || parseFloat(s.opacity) === 0) continue;
    const text = (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    const key = text + '|' + el.tagName;
    if (seen.has(key)) continue; seen.add(key);
    el.setAttribute('data-baia-hover', String(k));
    out.push({ id: k, tag: el.tagName.toLowerCase(), text, top: Math.round(r.top + scrollY), width: Math.round(r.width), height: Math.round(r.height) });
    if (++k >= n) break;
  }
  return out;
}
"""

JS_HOVER_SNAPSHOT = r"""
(id) => {
  const el = document.querySelector('[data-baia-hover="' + id + '"]'); if (!el) return null;
  const props = ['color','backgroundColor','borderColor','opacity','transform','boxShadow','textDecorationLine','letterSpacing','filter','clipPath','backgroundPosition','backgroundSize'];
  const snap = (e) => { const s = getComputedStyle(e); const o = {}; for (const p of props) o[p] = s[p]; return o; };
  const kids = Array.from(el.querySelectorAll('*')).slice(0, 6).map(snap);
  return { self: snap(el), children: kids };
}
"""

CONSENT_PATTERNS = [
    r"^alle akzeptieren$", r"^akzeptieren$", r"^accept all", r"^accept$", r"^i agree", r"^agree$", r"^got it",
    r"^ok$", r"^okay$", r"^allow all", r"^zustimmen", r"^einverstanden", r"^tout accepter", r"^accetta",
    r"^aceptar", r"^allow cookies", r"^accept cookies", r"^alle cookies akzeptieren",
]
BLOCK_TITLE_PATTERNS = [
    "just a moment", "attention required", "access denied", "verify you are human", "captcha",
    "403 forbidden", "404", "not found", "service unavailable", "cloudflare",
]
INTRO_OFFSETS_MS = [0, 150, 300, 500, 800, 1200, 1800, 2500]
BURST_OFFSETS_MS = [0, 80, 160, 240, 320, 480, 640, 800, 1000, 1300]


# ----------------------------------------------------------------------------- Helpers

def parse_viewports(text: str):
    out = []
    for part in text.split(","):
        part = part.strip().lower()
        if not part:
            continue
        m = re.match(r"^(\d+)x(\d+)$", part)
        if not m:
            raise SystemExit(f"Ungültiges Viewport-Format: {part} (erwartet z. B. 1440x900)")
        out.append((int(m.group(1)), int(m.group(2))))
    if not out:
        raise SystemExit("Mindestens ein Viewport nötig")
    return out


def file_hash(path: Path) -> str:
    return hashlib.sha1(path.read_bytes()).hexdigest()


def safe_eval(page, script, arg=None, default=None):
    try:
        return page.evaluate(script, arg) if arg is not None else page.evaluate(script)
    except Exception as exc:  # noqa: BLE001
        return {"error": str(exc)} if default is None else default


def extract_breakpoints(media_queries: dict):
    """Aus Media-Query-Texten die px/em/rem-Werte für width-Bedingungen ziehen."""
    found = {}
    for cond, uses in media_queries.items():
        for m in re.finditer(r"(min|max)-width\s*:\s*([\d.]+)(px|em|rem)", cond):
            key = f"{m.group(1)}-width {m.group(2)}{m.group(3)}"
            found[key] = found.get(key, 0) + uses
        for m in re.finditer(r"width\s*(<=|>=|<|>)\s*([\d.]+)(px|em|rem)", cond):
            key = f"width {m.group(1)} {m.group(2)}{m.group(3)}"
            found[key] = found.get(key, 0) + uses
    return sorted(({"query": k, "uses": v} for k, v in found.items()), key=lambda x: -x["uses"])


def detect_mechanism(state: dict) -> str:
    if not isinstance(state, dict) or "scroll_height" not in state:
        return "unknown"
    hidden = state.get("html_overflow") == "hidden" or state.get("body_overflow") == "hidden"
    if state["scroll_height"] > state["inner_height"] + 50 and not hidden:
        return "window_scroll"
    if state.get("scroller_candidates"):
        return "internal_container"
    if state["scroll_height"] <= state["inner_height"] + 50:
        return "wheel_virtual_scroll"
    return "window_scroll"


def try_dismiss_consent(page) -> dict:
    """Best-effort: Cookie-/Consent-Banner über Buttons mit typischen Texten schließen."""
    for pat in CONSENT_PATTERNS:
        try:
            loc = page.get_by_role("button", name=re.compile(pat, re.I))
            if loc.count() > 0 and loc.first.is_visible():
                loc.first.click(timeout=2000)
                page.wait_for_timeout(600)
                return {"dismissed": True, "pattern": pat}
        except Exception:  # noqa: BLE001
            continue
    return {"dismissed": False}


def dedupe_key(item: dict, fields):
    return "|".join(str(item.get(f)) for f in fields)


class Scroller:
    """Scrollt je nach erkannter Mechanik: window, Container oder Wheel-Events (Virtual Scroll)."""

    def __init__(self, page, mechanism: str, container_desc: str | None, vw: int, vh: int):
        self.page, self.mechanism, self.container_desc, self.vw, self.vh = page, mechanism, container_desc, vw, vh
        self.virtual_y = 0

    CONTAINER_SEL = '[data-baia-scroller="0"]'

    def to(self, y: int) -> int:
        p = self.page
        if self.mechanism == "internal_container" and self.container_desc:
            sel = self.CONTAINER_SEL
            safe_eval(p, "([sel, y]) => { const e = document.querySelector(sel); if (e) e.scrollTop = y; return e ? e.scrollTop : null; }", [sel, y])
            return int(safe_eval(p, "(sel) => { const e = document.querySelector(sel); return e ? e.scrollTop : 0; }", sel, 0) or 0)
        if self.mechanism == "wheel_virtual_scroll":
            delta = y - self.virtual_y
            p.mouse.move(self.vw // 2, self.vh // 2)
            steps = max(1, min(12, abs(delta) // 120))
            for _ in range(steps):
                p.mouse.wheel(0, delta / steps)
                p.wait_for_timeout(30)
            self.virtual_y = y
            return y
        safe_eval(p, "(y) => { if (window.lenis && typeof window.lenis.scrollTo === 'function') { try { window.lenis.scrollTo(y, { immediate: true, force: true }); } catch (e) {} } window.scrollTo(0, y); return window.scrollY; }", y)
        return int(safe_eval(p, "() => window.scrollY", default=0) or 0)

    def current_height(self) -> int:
        if self.mechanism == "internal_container" and self.container_desc:
            sel = self.CONTAINER_SEL
            return int(safe_eval(self.page, "(sel) => { const e = document.querySelector(sel); return e ? e.scrollHeight : 0; }", sel, 0) or 0)
        return int(safe_eval(self.page, "() => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)", default=0) or 0)


# ----------------------------------------------------------------------------- Main

def main() -> int:
    ap = argparse.ArgumentParser(description="Referenzseite beobachten und messen (keine Assets, kein Quelltext).")
    ap.add_argument("url")
    ap.add_argument("--slug", required=True, help="Kurzname der Referenz, z. B. ref-a")
    ap.add_argument("--out", required=True, help="Zielordner, z. B. reports/refs/ref-a")
    ap.add_argument("--viewports", default="1440x900,390x844")
    ap.add_argument("--scroll-step", type=float, default=0.8, help="Schrittweite als Anteil der Viewport-Höhe")
    ap.add_argument("--max-steps", type=int, default=40)
    ap.add_argument("--wait", type=int, default=1200, help="Einschwingzeit pro Schritt in ms")
    ap.add_argument("--hover", type=int, default=0, help="Anzahl Hover-Proben (nur Viewports ≥ 1024px breit)")
    ap.add_argument("--click", action="append", default=[], help="Selektor, der geklickt und danach fotografiert wird (mehrfach möglich)")
    ap.add_argument("--burst-at", default="", help="Scroll-Positionen (px, kommagetrennt) für Frame-Bursts, z. B. 0,2400")
    ap.add_argument("--intro-all", action="store_true", help="Intro-Burst für jedes Viewport statt nur das erste")
    ap.add_argument("--no-motion-probe", action="store_true")
    ap.add_argument("--headed", action="store_true", help="Sichtbarer Browser (realistischere Timings)")
    ap.add_argument("--timeout", type=int, default=45000)
    args = ap.parse_args()

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Playwright fehlt: python3 -m pip install playwright && python3 -m playwright install chromium", file=sys.stderr)
        return 3

    viewports = parse_viewports(args.viewports)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    (out / "motion").mkdir(exist_ok=True)
    burst_positions = [int(x) for x in args.burst_at.split(",") if x.strip()] if args.burst_at else []

    result = {
        "schema": SCHEMA,
        "slug": args.slug,
        "url": args.url,
        "captured_at": datetime.now(timezone.utc).isoformat(),
        "status": "ok",
        "emulation": "viewport-only (kein Touch/UA-Wechsel)",
        "headed": args.headed,
        "integrity": {"persisted_assets": False, "persisted_source": False,
                      "note": "Es werden nur Screenshots und Messwerte gespeichert."},
        "viewports": [f"{w}x{h}" for w, h in viewports],
        "page": {}, "libs": {}, "fonts": [], "root_vars": {}, "media_queries": {}, "breakpoints": [],
        "per_viewport": {}, "notes": [],
    }

    def finish(code: int) -> int:
        (out / "reference.json").write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[capture] reference.json → {out / 'reference.json'} (status: {result['status']})")
        return code

    with sync_playwright() as pw:
        try:
            browser = pw.chromium.launch(headless=not args.headed)
        except Exception as exc:  # noqa: BLE001
            print(f"Chromium konnte nicht gestartet werden: {exc}\nInstallieren mit: python3 -m playwright install chromium", file=sys.stderr)
            return 3
        context = browser.new_context(viewport={"width": viewports[0][0], "height": viewports[0][1]}, device_scale_factor=1)
        page = context.new_page()
        page.set_default_timeout(args.timeout)

        request_hosts = set()
        page.on("request", lambda req: request_hosts.add(urlparse(req.url).hostname or ""))

        # --- Erstes Laden: Status, Blockaden, Consent
        try:
            resp = page.goto(args.url, wait_until="domcontentloaded")
        except Exception as exc:  # noqa: BLE001
            result["status"] = "navigation_error"
            result["notes"].append(str(exc))
            browser.close()
            return finish(2)
        status = resp.status if resp else None
        page.wait_for_timeout(1500)
        title = (page.title() or "").lower()
        final_url = page.url
        result["page"].update({"initial_status": status, "final_url": final_url,
                               "redirected": urlparse(final_url).netloc != urlparse(args.url).netloc or final_url.rstrip("/") != args.url.rstrip("/")})
        if (status and status >= 400) or any(p in title for p in BLOCK_TITLE_PATTERNS):
            result["status"] = "blocked_or_error"
            result["notes"].append(f"HTTP {status}, Titel: {page.title()!r}")
            browser.close()
            return finish(2)
        if re.search(r"/(login|signin|sign-in|auth)\b", final_url, re.I) or safe_eval(page, "() => document.querySelectorAll('input[type=password]').length", default=0) >= 1:
            result["status"] = "blocked_by_login"
            browser.close()
            return finish(2)
        consent = try_dismiss_consent(page)
        result["page"]["consent"] = consent

        first_viewport = True
        for (vw, vh) in viewports:
            key = f"{vw}x{vh}"
            vp_dir = out / f"vp-{key}"
            vp_dir.mkdir(exist_ok=True)
            motion_dir = out / "motion" / f"vp-{key}"
            page.set_viewport_size({"width": vw, "height": vh})

            # Neu laden, damit Intro-Choreografie und Breakpoint-Layout sauber sind (Consent bleibt im Context)
            try:
                page.goto(final_url, wait_until="domcontentloaded")
            except Exception as exc:  # noqa: BLE001
                result["per_viewport"][key] = {"error": f"reload failed: {exc}"}
                continue
            t0 = time.monotonic()
            vp = {"viewport": [vw, vh], "steps": [], "intro_frames": [], "bursts": [], "hover": [], "clicks": [],
                  "motion": {"waapi": [], "gsap": {"tweens": [], "scrolltriggers": []}}}

            # --- Intro-Burst (Ladechoreografie)
            if first_viewport or args.intro_all:
                motion_dir.mkdir(parents=True, exist_ok=True)
                for k, ms in enumerate(INTRO_OFFSETS_MS):
                    target = t0 + ms / 1000
                    while time.monotonic() < target:
                        time.sleep(0.01)
                    fp = motion_dir / f"intro-f{k}-{ms}ms.png"
                    try:
                        page.screenshot(path=str(fp), full_page=False)
                        vp["intro_frames"].append(str(fp.relative_to(out)))
                    except Exception as exc:  # noqa: BLE001
                        vp.setdefault("errors", []).append(f"intro frame {ms}ms: {exc}")
                early_state = safe_eval(page, JS_VIEWPORT_STATE)
                vp["preloader_suspected"] = {"fixed_fullscreen_at_start": early_state.get("fixed_fullscreen_elements", []) if isinstance(early_state, dict) else []}
            try:
                page.wait_for_load_state("load", timeout=15000)
            except Exception:  # noqa: BLE001
                vp.setdefault("errors", []).append("load event timeout (weiter mit DOMContentLoaded)")
            page.wait_for_timeout(max(args.wait, 1500))

            # Consent könnte nach Reload erneut erscheinen (z. B. ohne Cookie) — nochmals versuchen
            if not consent.get("dismissed"):
                consent2 = try_dismiss_consent(page)
                if consent2.get("dismissed"):
                    vp["consent"] = consent2

            # --- Seitenweite Infos (einmal) + Viewport-Zustand
            if first_viewport:
                info = safe_eval(page, JS_PAGE_INFO)
                if isinstance(info, dict) and "error" not in info:
                    result["page"].update({k: info.get(k) for k in ("title", "lang", "generator", "script_src_hosts")})
                    result["libs"] = info.get("libs", {})
                    result["fonts"] = info.get("fonts", [])
                else:
                    result["notes"].append(f"page info: {info}")
                sheets = safe_eval(page, JS_STYLESHEETS)
                if isinstance(sheets, dict) and "error" not in sheets:
                    result["root_vars"] = sheets.get("root_vars", {})
                    result["media_queries"] = sheets.get("media_queries", {})
                    result["breakpoints"] = extract_breakpoints(result["media_queries"])
                    result["stylesheets"] = {"count": sheets.get("sheets"), "cross_origin_skipped": sheets.get("cross_origin_sheets")}
            state = safe_eval(page, JS_VIEWPORT_STATE)
            mechanism = detect_mechanism(state)
            vp["state"] = state
            vp["scroll_mechanism"] = mechanism
            if "preloader_suspected" in vp and isinstance(state, dict):
                vp["preloader_suspected"]["fixed_fullscreen_after_settle"] = state.get("fixed_fullscreen_elements", [])
            container = (state.get("scroller_candidates") or [None])[0] if isinstance(state, dict) else None
            scroller = Scroller(page, mechanism, container, vw, vh)
            vp["sections"] = safe_eval(page, JS_SECTIONS)
            vp["typography"] = safe_eval(page, JS_TYPOGRAPHY)
            if first_viewport:
                vp["colors"] = safe_eval(page, JS_COLORS)

            waapi_seen, tween_seen, st_seen = {}, {}, {}

            def probe_motion(step_label: str):
                if args.no_motion_probe:
                    return 0, 0
                running = 0
                w = safe_eval(page, JS_WAAPI)
                if isinstance(w, dict):
                    running = w.get("running", 0)
                    for it in w.get("items", []):
                        k = dedupe_key(it, ("target", "name", "duration", "easing", "delay"))
                        if k not in waapi_seen:
                            it["first_seen"] = step_label
                            it["seen"] = 1
                            waapi_seen[k] = it
                        else:
                            waapi_seen[k]["seen"] += 1
                g = safe_eval(page, JS_GSAP)
                active = 0
                if isinstance(g, dict) and g.get("available"):
                    vp["motion"]["gsap"]["available"] = True
                    vp["motion"]["gsap"]["version"] = g.get("version")
                    if g.get("error"):
                        vp["motion"]["gsap"]["error"] = g["error"]
                    for tw in g.get("tweens", []):
                        active += 1 if tw.get("active") else 0
                        k = dedupe_key(tw, ("targets", "duration", "ease", "stagger", "props"))
                        if k not in tween_seen:
                            tw["first_seen"] = step_label
                            tween_seen[k] = tw
                    for st in g.get("scrolltriggers", []):
                        k = dedupe_key(st, ("trigger", "start", "end"))
                        if k not in st_seen:
                            st["first_seen"] = step_label
                            st_seen[k] = st
                else:
                    vp["motion"]["gsap"]["available"] = False
                return running, active

            # --- Scroll-Schritte
            step_px = max(200, int(vh * args.scroll_step))
            last_hashes = []
            y = 0
            for i in range(args.max_steps):
                actual_y = scroller.to(y)
                start_fp = vp_dir / f"step-{i:02d}-y{y}-start.png"
                try:
                    page.screenshot(path=str(start_fp), full_page=False)
                except Exception as exc:  # noqa: BLE001
                    vp.setdefault("errors", []).append(f"step {i} start: {exc}")
                running, active = probe_motion(f"step-{i:02d}-start")
                page.wait_for_timeout(args.wait)
                settled_fp = vp_dir / f"step-{i:02d}-y{y}-settled.png"
                try:
                    page.screenshot(path=str(settled_fp), full_page=False)
                except Exception as exc:  # noqa: BLE001
                    vp.setdefault("errors", []).append(f"step {i} settled: {exc}")
                probe_motion(f"step-{i:02d}-settled")
                vp["steps"].append({"index": i, "requested_y": y, "actual_y": actual_y, "start": str(start_fp.relative_to(out)),
                                    "settled": str(settled_fp.relative_to(out)), "waapi_running_after_scroll": running,
                                    "gsap_active_after_scroll": active})
                # Ende erkennen: Dokumentende erreicht oder zwei identische Screenshots hintereinander
                doc_h = scroller.current_height()
                if settled_fp.exists():
                    h = file_hash(settled_fp)
                    last_hashes.append(h)
                    if len(last_hashes) >= 3 and last_hashes[-1] == last_hashes[-2] == last_hashes[-3]:
                        vp["end_reason"] = "identical screenshots"
                        break
                if mechanism != "wheel_virtual_scroll" and y + vh >= doc_h:
                    vp["end_reason"] = "document end"
                    break
                y += step_px
            else:
                vp["end_reason"] = "max steps"
            vp["document_height_final"] = scroller.current_height()

            # --- Gezielte Bursts
            for by in burst_positions:
                motion_dir.mkdir(parents=True, exist_ok=True)
                scroller.to(max(0, by - vh // 2))
                page.wait_for_timeout(800)
                frames = []
                scroller.to(by)
                tb = time.monotonic()
                for k, ms in enumerate(BURST_OFFSETS_MS):
                    target = tb + ms / 1000
                    while time.monotonic() < target:
                        time.sleep(0.005)
                    fp = motion_dir / f"burst-y{by}-f{k}-{ms}ms.png"
                    try:
                        page.screenshot(path=str(fp), full_page=False)
                        frames.append(str(fp.relative_to(out)))
                    except Exception as exc:  # noqa: BLE001
                        vp.setdefault("errors", []).append(f"burst {by} {ms}ms: {exc}")
                probe_motion(f"burst-y{by}")
                vp["bursts"].append({"y": by, "frames": frames})

            # --- Hover-Proben (nur Desktop-Breiten)
            if args.hover > 0 and vw >= 1024:
                scroller.to(0)
                page.wait_for_timeout(500)
                targets = safe_eval(page, JS_HOVER_TARGETS, args.hover, [])
                for t in (targets if isinstance(targets, list) else []):
                    sel = f'[data-baia-hover="{t["id"]}"]'
                    try:
                        page.locator(sel).first.scroll_into_view_if_needed(timeout=3000)
                        page.wait_for_timeout(400)
                        before = safe_eval(page, JS_HOVER_SNAPSHOT, t["id"])
                        page.hover(sel, timeout=3000)
                        page.wait_for_timeout(80)
                        during = safe_eval(page, JS_WAAPI)
                        page.wait_for_timeout(450)
                        after = safe_eval(page, JS_HOVER_SNAPSHOT, t["id"])
                        changed = {}
                        if isinstance(before, dict) and isinstance(after, dict):
                            for prop, val in before["self"].items():
                                if after["self"].get(prop) != val:
                                    changed[prop] = [val, after["self"].get(prop)]
                            kid_changes = []
                            for idx, (b, a) in enumerate(zip(before.get("children", []), after.get("children", []))):
                                diff = {p: [b[p], a[p]] for p in b if a.get(p) != b[p]}
                                if diff:
                                    kid_changes.append({"child": idx, "changed": diff})
                        else:
                            kid_changes = []
                        transitions = [it for it in (during.get("items", []) if isinstance(during, dict) else []) if it.get("play_state") == "running"][:12]
                        vp["hover"].append({**t, "changed": changed, "children_changed": kid_changes, "transitions_running": transitions})
                        page.mouse.move(0, 0)
                        page.wait_for_timeout(250)
                    except Exception as exc:  # noqa: BLE001
                        vp["hover"].append({**t, "error": str(exc)})

            # --- Klick-Proben (Menü, Modal …)
            for k, sel in enumerate(args.click):
                try:
                    scroller.to(0)
                    page.wait_for_timeout(400)
                    page.click(sel, timeout=4000)
                    page.wait_for_timeout(150)
                    early = safe_eval(page, JS_WAAPI)
                    page.wait_for_timeout(900)
                    fp = vp_dir / f"click-{k}.png"
                    page.screenshot(path=str(fp), full_page=False)
                    probe_motion(f"click-{k}")
                    vp["clicks"].append({"selector": sel, "screenshot": str(fp.relative_to(out)),
                                         "animations_running_after_click": [it for it in (early.get("items", []) if isinstance(early, dict) else []) if it.get("play_state") == "running"][:20]})
                    page.keyboard.press("Escape")
                    page.wait_for_timeout(500)
                except Exception as exc:  # noqa: BLE001
                    vp["clicks"].append({"selector": sel, "error": str(exc)})

            vp["motion"]["waapi"] = list(waapi_seen.values())
            vp["motion"]["gsap"]["tweens"] = list(tween_seen.values())
            vp["motion"]["gsap"]["scrolltriggers"] = list(st_seen.values())
            result["per_viewport"][key] = vp
            first_viewport = False
            print(f"[capture] {key}: {len(vp['steps'])} Schritte, Mechanik {mechanism}, "
                  f"{len(vp['motion']['waapi'])} WAAPI-Animationen, {len(vp['motion']['gsap']['tweens'])} GSAP-Tweens, "
                  f"{len(vp['motion']['gsap']['scrolltriggers'])} ScrollTrigger")

        result["request_hosts_observed"] = sorted(h for h in request_hosts if h)
        browser.close()

    if not result["page"].get("consent", {}).get("dismissed"):
        result["notes"].append("Consent-Banner nicht automatisch geschlossen (oder keines vorhanden) — Screenshots prüfen.")
    return finish(0)


if __name__ == "__main__":
    sys.exit(main())
