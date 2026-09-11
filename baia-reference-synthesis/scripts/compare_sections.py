#!/usr/bin/env python3
"""
compare_sections.py — Build vs. Referenz (BAIA Reference Synthesis).

Öffnet den lokalen Build und die zugeordneten Referenzstellen in denselben Viewports und erzeugt
pro Section: Screenshot Build, Screenshot Referenz, Side-by-side-Bild (Pillow, optional),
Motion-Werte im Build (WAAPI + GSAP/ScrollTrigger, auf die Section begrenzt), FPS-Sample beim
Scroll durch die Section. Zusätzlich: Konsolenfehler, fehlgeschlagene Requests, alle Request-Hosts
des Builds und ein Originalitäts-Netzcheck (keine Requests an Referenz-Hosts).

Speichert nichts von der Referenz außer Screenshots.

compare-pairs.json:
{
  "local_base": "http://localhost:3000",
  "reference_hosts": ["ref-a.example", "ref-b.example"],
  "pairs": [
    { "label": "01-hero",
      "local": { "path": "/", "selector": "#hero" },
      "reference": { "url": "https://ref-a.example/", "selector": "main > section:nth-of-type(1)" } },
    { "label": "02-features",
      "local": { "path": "/", "selector": "#features" },
      "reference": { "url": "https://ref-b.example/", "section_index": 3 } },
    { "label": "03-cases",
      "local": { "path": "/", "selector": "#cases" },
      "reference": { "url": "https://ref-b.example/", "scroll_y": { "1440x900": 3200, "390x844": 5400 } } },
    { "label": "04-footer",
      "local": { "path": "/", "selector": "footer" },
      "reference": { "screenshot": { "1440x900": "reports/refs/ref-a/vp-1440x900/step-08-y5760-settled.png",
                                     "390x844": "reports/refs/ref-a/vp-390x844/step-14-y9450-settled.png" } } }
  ]
}

"reference" akzeptiert: url + selector | url + section_index (Section-Inventar wie in capture_reference.py) |
url + scroll_y (Zahl oder Objekt pro Viewport) | screenshot (Pfad oder Objekt pro Viewport, relativ zum Arbeitsverzeichnis).

Beispiel:
  python3 compare_sections.py --pairs reports/compare-pairs.json --out reports/compare --viewports 1440x900,390x844

Exit-Codes: 0 ok · 2 lokaler Build nicht erreichbar · 3 Paare unvollständig · 4 Requests an Referenz-Hosts · 5 Playwright fehlt
Hinweis: FPS-Werte aus dem Headless-Browser sind nur relativ vergleichbar — für belastbare Zahlen --headed nutzen.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

# Windows-Konsole: UTF-8 erzwingen, sonst UnicodeEncodeError bei Pfeilen/Umlauten
for s in (sys.stdout, sys.stderr): s.reconfigure(encoding="utf-8", errors="replace")

SCHEMA = "baia-reference-synthesis/compare-1.0"

JS_DESC = r"""
const __desc = (el) => {
  if (!el || !el.tagName) return null;
  const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.') : '';
  return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (cls ? '.' + cls : '');
};
"""

JS_SCROLL_TO_SELECTOR = r"""
(sel) => {
  const el = document.querySelector(sel);
  if (!el) return { found: false };
  const y = el.getBoundingClientRect().top + window.scrollY;
  if (window.lenis && typeof window.lenis.scrollTo === 'function') { try { window.lenis.scrollTo(y, { immediate: true, force: true }); } catch (e) {} }
  window.scrollTo(0, y);
  return { found: true, y: Math.round(y) };
}
"""

JS_SCROLL_TO_Y = r"""
(y) => {
  if (window.lenis && typeof window.lenis.scrollTo === 'function') { try { window.lenis.scrollTo(y, { immediate: true, force: true }); } catch (e) {} }
  window.scrollTo(0, y);
  return window.scrollY;
}
"""

JS_SECTION_BY_INDEX = r"""
(index) => {
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
  const el = kids[index - 1];
  if (!el) return { found: false, available: kids.length };
  const y = el.getBoundingClientRect().top + window.scrollY;
  if (window.lenis && typeof window.lenis.scrollTo === 'function') { try { window.lenis.scrollTo(y, { immediate: true, force: true }); } catch (e) {} }
  window.scrollTo(0, y);
  return { found: true, y: Math.round(y), available: kids.length };
}
"""

JS_MOTION_IN_SECTION = r"""
(sel) => {
  """ + JS_DESC + r"""
  const root = sel ? document.querySelector(sel) : document.body;
  if (!root) return { error: 'selector not found: ' + sel };
  const inside = (el) => { try { return !!el && root.contains(el); } catch (e) { return false; } };
  const easeName = (e) => { if (!e) return null; if (typeof e === 'string') return e; if (typeof e === 'function') return e.name || 'function'; return String(e); };
  const skip = new Set(['onComplete','onUpdate','onStart','onReverseComplete','onRepeat','ease','duration','delay','stagger','scrollTrigger','paused','repeat','yoyo','immediateRender','overwrite','data','id','callbackScope','onInterrupt','defaults']);
  const waapi = [];
  try {
    for (const a of document.getAnimations()) {
      const t = a.effect && a.effect.target; if (!inside(t)) continue;
      let tm = {}; try { tm = a.effect.getTiming(); } catch (e) {}
      waapi.push({ kind: a.constructor.name, name: a.animationName || a.transitionProperty || null, target: __desc(t),
        duration: tm.duration, delay: tm.delay, easing: tm.easing, iterations: tm.iterations, play_state: a.playState });
      if (waapi.length >= 100) break;
    }
  } catch (e) {}
  const gs = { available: !!window.gsap, tweens: [], scrolltriggers: [] };
  if (window.gsap) {
    try {
      for (const tw of window.gsap.globalTimeline.getChildren(true, true, true)) {
        let tg = []; try { tg = tw.targets ? tw.targets() : []; } catch (e) {}
        if (!tg.some(inside)) continue;
        const v = tw.vars || {};
        gs.tweens.push({ targets: tg.slice(0, 3).map(__desc), count: tg.length, duration: tw.duration(), delay: tw.delay(),
          ease: easeName(v.ease), stagger: (typeof v.stagger === 'object') ? '{obj}' : (v.stagger === undefined ? null : v.stagger),
          props: Object.keys(v).filter(k => !skip.has(k)), scroll_trigger: !!v.scrollTrigger });
        if (gs.tweens.length >= 150) break;
      }
    } catch (e) { gs.error = String(e); }
    try {
      const globals = (window.gsap.core && typeof window.gsap.core.globals === 'function') ? window.gsap.core.globals() : {};
      const ST = window.ScrollTrigger || globals.ScrollTrigger;
      if (ST && ST.getAll) for (const st of ST.getAll()) {
        if (!inside(st.trigger)) continue;
        const v = st.vars || {};
        gs.scrolltriggers.push({ trigger: __desc(st.trigger), start: st.start, end: st.end,
          start_vars: (typeof v.start === 'string' || typeof v.start === 'number') ? v.start : null,
          end_vars: (typeof v.end === 'string' || typeof v.end === 'number') ? v.end : null,
          scrub: (v.scrub === undefined ? null : v.scrub), pin: !!(st.pin || v.pin), snap: v.snap ? 'yes' : null,
          toggle_actions: v.toggleActions || null, once: !!v.once,
          animation: st.animation ? { duration: st.animation.duration(), ease: easeName(st.animation.vars && st.animation.vars.ease) } : null });
      }
    } catch (e) { gs.st_error = String(e); }
  }
  const r = root.getBoundingClientRect();
  const fonts = [];
  try { document.fonts.forEach(f => fonts.push(String(f.family).replace(/["']/g, '') + ' ' + f.weight + ' ' + f.style + ' (' + f.status + ')')); } catch (e) {}
  return { rect: { top: Math.round(r.top + scrollY), height: Math.round(r.height), width: Math.round(r.width) },
    waapi, gsap: gs, fonts: Array.from(new Set(fonts)) };
}
"""

JS_FPS_START = r"""
() => {
  window.__baiaFps = { t: [], raf: 0, last: performance.now(), run: true };
  const f = window.__baiaFps;
  const loop = (now) => { if (!f.run) return; f.t.push(now - f.last); f.last = now; f.raf = requestAnimationFrame(loop); };
  f.raf = requestAnimationFrame(loop);
  return true;
}
"""

JS_FPS_STOP = r"""
() => {
  const f = window.__baiaFps; if (!f) return null;
  f.run = false; cancelAnimationFrame(f.raf);
  const t = f.t.slice(1);
  if (!t.length) return { frames: 0 };
  const sorted = t.slice().sort((a, b) => a - b);
  const sum = t.reduce((a, b) => a + b, 0);
  return { frames: t.length, duration_ms: Math.round(sum), avg_fps: +(1000 / (sum / t.length)).toFixed(1),
    p95_ms: +sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))].toFixed(1),
    max_ms: +sorted[sorted.length - 1].toFixed(1), long_frames_over_50ms: t.filter(x => x > 50).length };
}
"""

CONSENT_PATTERNS = [
    r"^alle akzeptieren$", r"^akzeptieren$", r"^accept all", r"^accept$", r"^i agree", r"^agree$", r"^got it",
    r"^ok$", r"^okay$", r"^allow all", r"^zustimmen", r"^einverstanden", r"^tout accepter", r"^accetta",
    r"^aceptar", r"^allow cookies", r"^accept cookies", r"^alle cookies akzeptieren",
]


# ----------------------------------------------------------------------------- Helpers

def parse_viewports(text: str):
    out = []
    for part in text.split(","):
        part = part.strip().lower()
        if not part:
            continue
        m = re.match(r"^(\d+)x(\d+)$", part)
        if not m:
            raise SystemExit(f"Ungültiges Viewport-Format: {part}")
        out.append((int(m.group(1)), int(m.group(2))))
    if not out:
        raise SystemExit("Mindestens ein Viewport nötig")
    return out


def safe_eval(page, script, arg=None, default=None):
    try:
        return page.evaluate(script, arg) if arg is not None else page.evaluate(script)
    except Exception as exc:  # noqa: BLE001
        return {"error": str(exc)} if default is None else default


def per_viewport_value(value, vp_key: str):
    """Ein Wert kann direkt oder als Objekt pro Viewport angegeben sein."""
    if isinstance(value, dict):
        return value.get(vp_key)
    return value


def try_dismiss_consent(page) -> bool:
    for pat in CONSENT_PATTERNS:
        try:
            loc = page.get_by_role("button", name=re.compile(pat, re.I))
            if loc.count() > 0 and loc.first.is_visible():
                loc.first.click(timeout=2000)
                page.wait_for_timeout(500)
                return True
        except Exception:  # noqa: BLE001
            continue
    return False


def host_matches(host: str, ref_hosts) -> bool:
    host = (host or "").lower()
    for h in ref_hosts:
        h = h.lower().strip()
        if not h:
            continue
        if host == h or host.endswith("." + h):
            return True
    return False


def compose_side_by_side(ref_png: Path, local_png: Path, out_png: Path, label: str, vp_key: str) -> bool:
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        return False
    try:
        a = Image.open(ref_png).convert("RGB")
        b = Image.open(local_png).convert("RGB")
    except Exception:  # noqa: BLE001
        return False
    pad, header = 24, 44
    h = max(a.height, b.height)
    canvas = Image.new("RGB", (a.width + b.width + pad * 3, h + header + pad), (238, 238, 236))
    d = ImageDraw.Draw(canvas)
    d.text((pad, 14), f"REFERENZ  |  {label}  |  {vp_key}", fill=(20, 20, 20))
    d.text((pad * 2 + a.width, 14), f"BUILD  |  {label}  |  {vp_key}", fill=(20, 20, 20))
    canvas.paste(a, (pad, header))
    canvas.paste(b, (pad * 2 + a.width, header))
    canvas.save(out_png)
    return True


def write_contact_sheet(out: Path, viewports, pairs_result: list):
    rows = []
    for pr in pairs_result:
        for vp_key in [f"{w}x{h}" for w, h in viewports]:
            r = pr["per_viewport"].get(vp_key, {})
            fps = r.get("fps") or {}
            rows.append(
                f"<section><h2>{pr['label']} — {vp_key} <small>{r.get('status', '')}</small></h2>"
                f"<div class='row'><figure><figcaption>Referenz</figcaption>"
                + (f"<img src='{r['reference_png']}'>" if r.get("reference_png") else "<p>—</p>")
                + "</figure><figure><figcaption>Build</figcaption>"
                + (f"<img src='{r['local_png']}'>" if r.get("local_png") else "<p>—</p>")
                + f"</figure></div><p class='meta'>FPS avg {fps.get('avg_fps', '—')} · p95 {fps.get('p95_ms', '—')} ms · "
                f"lange Frames {fps.get('long_frames_over_50ms', '—')} · "
                f"WAAPI {len((r.get('motion') or {}).get('waapi', []))} · GSAP-Tweens {len(((r.get('motion') or {}).get('gsap') or {}).get('tweens', []))} · "
                f"ScrollTrigger {len(((r.get('motion') or {}).get('gsap') or {}).get('scrolltriggers', []))}</p></section>"
            )
    html = (
        "<!doctype html><meta charset='utf-8'><title>Compare — BAIA Reference Synthesis</title>"
        "<style>body{font:14px/1.5 system-ui,sans-serif;margin:24px;background:#f4f4f2;color:#111}"
        "section{margin-bottom:40px}h2{font-size:16px;margin:0 0 8px}small{color:#777;font-weight:400;margin-left:8px}"
        ".row{display:grid;grid-template-columns:1fr 1fr;gap:16px}figure{margin:0}figcaption{font-size:12px;color:#666;margin-bottom:4px}"
        "img{width:100%;height:auto;border:1px solid #ddd;background:#fff}.meta{color:#555;font-size:12px}</style>"
        "<h1>Build vs. Referenz</h1>" + "".join(rows)
    )
    (out / "compare.html").write_text(html, encoding="utf-8")


# ----------------------------------------------------------------------------- Main

def main() -> int:
    ap = argparse.ArgumentParser(description="Lokalen Build gegen Referenzstellen vergleichen.")
    ap.add_argument("--pairs", required=True, help="Pfad zu compare-pairs.json")
    ap.add_argument("--out", required=True, help="Zielordner, z. B. reports/compare")
    ap.add_argument("--viewports", default="1440x900,390x844")
    ap.add_argument("--wait", type=int, default=1200, help="Einschwingzeit nach dem Scroll in ms")
    ap.add_argument("--fps-ms", type=int, default=1600, help="Dauer des FPS-Samples pro Section in ms (0 = aus)")
    ap.add_argument("--headed", action="store_true", help="Sichtbarer Browser (belastbare FPS-Werte)")
    ap.add_argument("--timeout", type=int, default=45000)
    args = ap.parse_args()

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Playwright fehlt: python3 -m pip install playwright && python3 -m playwright install chromium", file=sys.stderr)
        return 5

    pairs_path = Path(args.pairs)
    cfg = json.loads(pairs_path.read_text(encoding="utf-8"))
    local_base = (cfg.get("local_base") or "http://localhost:3000").rstrip("/")
    reference_hosts = cfg.get("reference_hosts") or []
    pairs = cfg.get("pairs") or []
    if not pairs:
        print("compare-pairs.json enthält keine pairs", file=sys.stderr)
        return 3
    viewports = parse_viewports(args.viewports)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    result = {
        "schema": SCHEMA,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "local_base": local_base,
        "headed": args.headed,
        "viewports": [f"{w}x{h}" for w, h in viewports],
        "pairs": [],
        "console_errors": [],
        "failed_requests": [],
        "request_hosts": [],
        "fonts_loaded_local": [],
        "originality": {"reference_hosts": reference_hosts, "reference_host_requests": [], "pass": None},
        "notes": ["FPS aus Headless-Browser sind relativ; für absolute Werte --headed nutzen."] if not args.headed else [],
    }
    incomplete = 0

    console_errors, failed_requests, request_hosts, ref_host_requests = [], [], set(), []

    with sync_playwright() as pw:
        try:
            browser = pw.chromium.launch(headless=not args.headed)
        except Exception as exc:  # noqa: BLE001
            print(f"Chromium konnte nicht gestartet werden: {exc}\nInstallieren mit: python3 -m playwright install chromium", file=sys.stderr)
            return 5
        context = browser.new_context(viewport={"width": viewports[0][0], "height": viewports[0][1]}, device_scale_factor=1)
        local_page = context.new_page()
        ref_page = context.new_page()
        local_page.set_default_timeout(args.timeout)
        ref_page.set_default_timeout(args.timeout)

        current = {"local_path": None, "vp": None, "ref_url": None}

        def on_console(msg):
            if msg.type in ("error", "warning"):
                console_errors.append({"type": msg.type, "text": msg.text[:300], "path": current["local_path"], "viewport": current["vp"]})

        def on_pageerror(err):
            console_errors.append({"type": "pageerror", "text": str(err)[:300], "path": current["local_path"], "viewport": current["vp"]})

        def on_request(req):
            host = urlparse(req.url).hostname or ""
            request_hosts.add(host)
            if host_matches(host, reference_hosts):
                ref_host_requests.append({"url": req.url[:200], "path": current["local_path"], "viewport": current["vp"]})

        def on_requestfailed(req):
            failed_requests.append({"url": req.url[:200], "failure": str(req.failure), "path": current["local_path"], "viewport": current["vp"]})

        def on_response(res):
            if res.status >= 400:
                failed_requests.append({"url": res.url[:200], "status": res.status, "path": current["local_path"], "viewport": current["vp"]})

        local_page.on("console", on_console)
        local_page.on("pageerror", on_pageerror)
        local_page.on("request", on_request)
        local_page.on("requestfailed", on_requestfailed)
        local_page.on("response", on_response)

        pairs_result = [{"label": p.get("label", f"pair-{i + 1}"), "per_viewport": {}} for i, p in enumerate(pairs)]

        for (vw, vh) in viewports:
            vp_key = f"{vw}x{vh}"
            current["vp"] = vp_key
            vp_dir = out / vp_key
            vp_dir.mkdir(exist_ok=True)
            local_page.set_viewport_size({"width": vw, "height": vh})
            ref_page.set_viewport_size({"width": vw, "height": vh})
            current["local_path"] = None
            current["ref_url"] = None

            for i, pair in enumerate(pairs):
                label = pairs_result[i]["label"]
                safe_label = re.sub(r"[^a-zA-Z0-9_-]+", "-", label).strip("-") or f"pair-{i + 1}"
                pr = {"status": "ok", "notes": []}
                local = pair.get("local") or {}
                ref = pair.get("reference") or {}

                # --- Lokaler Build
                path = local.get("path") or "/"
                if current["local_path"] != path:
                    try:
                        resp = local_page.goto(local_base + path, wait_until="domcontentloaded")
                        if resp is not None and resp.status >= 400:
                            pr["status"] = "local_error"
                            pr["notes"].append(f"HTTP {resp.status} für {path}")
                    except Exception as exc:  # noqa: BLE001
                        print(f"[compare] Lokaler Build nicht erreichbar: {local_base}{path} — {exc}", file=sys.stderr)
                        browser.close()
                        return 2
                    current["local_path"] = path
                    try:
                        local_page.wait_for_load_state("load", timeout=15000)
                    except Exception:  # noqa: BLE001
                        pr["notes"].append("load event timeout")
                    local_page.wait_for_timeout(max(args.wait, 1500))

                sel = local.get("selector")
                if sel:
                    found = safe_eval(local_page, JS_SCROLL_TO_SELECTOR, sel)
                    if not (isinstance(found, dict) and found.get("found")):
                        pr["status"] = "local_selector_missing"
                        pr["notes"].append(f"Selektor nicht gefunden: {sel}")
                else:
                    safe_eval(local_page, JS_SCROLL_TO_Y, int(local.get("scroll_y") or 0))
                local_page.wait_for_timeout(args.wait)
                local_png = vp_dir / f"{safe_label}-build.png"
                try:
                    local_page.screenshot(path=str(local_png), full_page=False)
                    pr["local_png"] = str(local_png.relative_to(out))
                except Exception as exc:  # noqa: BLE001
                    pr["notes"].append(f"Build-Screenshot fehlgeschlagen: {exc}")
                motion = safe_eval(local_page, JS_MOTION_IN_SECTION, sel or "body")
                pr["motion"] = motion if isinstance(motion, dict) else {"error": str(motion)}
                if isinstance(motion, dict) and motion.get("fonts"):
                    for f in motion["fonts"]:
                        if f not in result["fonts_loaded_local"]:
                            result["fonts_loaded_local"].append(f)

                # FPS-Sample: Wheel-Scroll durch die Section, rAF-Zähler misst Frame-Zeiten
                if args.fps_ms > 0 and isinstance(motion, dict) and motion.get("rect"):
                    rect = motion["rect"]
                    try:
                        safe_eval(local_page, JS_SCROLL_TO_Y, max(0, rect["top"] - vh))
                        local_page.wait_for_timeout(300)
                        local_page.mouse.move(vw // 2, vh // 2)
                        total = rect["height"] + vh
                        steps = max(8, min(60, args.fps_ms // 25))
                        safe_eval(local_page, JS_FPS_START)
                        for _ in range(steps):
                            local_page.mouse.wheel(0, total / steps)
                            local_page.wait_for_timeout(max(10, args.fps_ms // steps))
                        pr["fps"] = safe_eval(local_page, JS_FPS_STOP)
                    except Exception as exc:  # noqa: BLE001
                        pr["fps"] = {"error": str(exc)}
                    if sel:
                        safe_eval(local_page, JS_SCROLL_TO_SELECTOR, sel)
                        local_page.wait_for_timeout(300)

                # --- Referenz
                ref_png = vp_dir / f"{safe_label}-reference.png"
                shot = per_viewport_value(ref.get("screenshot"), vp_key)
                if shot:
                    src = Path(shot)
                    if src.exists():
                        shutil.copyfile(src, ref_png)
                        pr["reference_png"] = str(ref_png.relative_to(out))
                        pr["reference_source"] = str(src)
                    else:
                        pr["notes"].append(f"Referenz-Screenshot fehlt: {src}")
                elif ref.get("url"):
                    url = ref["url"]
                    try:
                        if current["ref_url"] != url:
                            ref_page.goto(url, wait_until="domcontentloaded")
                            try:
                                ref_page.wait_for_load_state("load", timeout=15000)
                            except Exception:  # noqa: BLE001
                                pass
                            ref_page.wait_for_timeout(max(args.wait, 1500))
                            try_dismiss_consent(ref_page)
                            current["ref_url"] = url
                        else:
                            ref_page.wait_for_timeout(200)
                        pos = None
                        if ref.get("selector"):
                            pos = safe_eval(ref_page, JS_SCROLL_TO_SELECTOR, ref["selector"])
                        elif ref.get("section_index"):
                            pos = safe_eval(ref_page, JS_SECTION_BY_INDEX, int(ref["section_index"]))
                        else:
                            y = per_viewport_value(ref.get("scroll_y"), vp_key)
                            pos = {"found": True, "y": safe_eval(ref_page, JS_SCROLL_TO_Y, int(y or 0), 0)}
                        if not (isinstance(pos, dict) and pos.get("found")):
                            pr["notes"].append(f"Referenzstelle nicht gefunden: {pos}")
                        ref_page.wait_for_timeout(args.wait)
                        ref_page.screenshot(path=str(ref_png), full_page=False)
                        pr["reference_png"] = str(ref_png.relative_to(out))
                        pr["reference_position"] = pos
                    except Exception as exc:  # noqa: BLE001
                        pr["notes"].append(f"Referenz-Screenshot fehlgeschlagen: {exc}")
                else:
                    pr["notes"].append("Keine Referenz angegeben (url oder screenshot)")

                if pr.get("local_png") and pr.get("reference_png"):
                    sbs = vp_dir / f"{safe_label}-side-by-side.png"
                    if compose_side_by_side(ref_png, local_png, sbs, label, vp_key):
                        pr["side_by_side_png"] = str(sbs.relative_to(out))
                    else:
                        pr["notes"].append("Side-by-side nicht erzeugt (Pillow fehlt oder Bildfehler) — beide PNGs einzeln ansehen")
                else:
                    incomplete += 1
                    if pr["status"] == "ok":
                        pr["status"] = "incomplete"

                pairs_result[i]["per_viewport"][vp_key] = pr
                print(f"[compare] {label} @ {vp_key}: {pr['status']}" + (f" — {'; '.join(pr['notes'])}" if pr["notes"] else ""))

        browser.close()

    result["pairs"] = pairs_result
    result["console_errors"] = console_errors
    result["failed_requests"] = failed_requests
    result["request_hosts"] = sorted(h for h in request_hosts if h)
    result["originality"]["reference_host_requests"] = ref_host_requests
    result["originality"]["pass"] = (len(ref_host_requests) == 0) if reference_hosts else None
    if not reference_hosts:
        result["notes"].append("reference_hosts leer — Originalitäts-Netzcheck nicht möglich")

    (out / "compare.json").write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    write_contact_sheet(out, viewports, pairs_result)
    print(f"[compare] compare.json + compare.html → {out} | Paare unvollständig: {incomplete} | "
          f"Konsolenfehler: {len(console_errors)} | Requests an Referenz-Hosts: {len(ref_host_requests)}")

    if ref_host_requests:
        return 4
    if incomplete:
        return 3
    return 0


if __name__ == "__main__":
    sys.exit(main())
