#!/usr/bin/env python3
"""Render-Kosten pro Übergang (Chrome-Trace, ohne/mit GPU-Compositing).

Usage:
  python scripts/perf_ranges.py "http://localhost:3001/?motion=full" reports/perf/ranges-baseline --gpu off [--headed] [--speed 2000]

Pro Bereich (Hero-Cover, Stack, Blooms, Lichtfaden, Footer-Reveal): Frames, Composite-Zeit pro Frame (Software-Renderer),
Quads pro Frame, Paints (Anzahl / ms), Raster-Tasks (Anzahl / ms), Hauptthread pro Frame, längster Task.
Nur relativ vergleichen (Baseline vs. Nachher, gleiches Gerät).
"""
import argparse, json, sys, time
from pathlib import Path
for s in (sys.stdout, sys.stderr): s.reconfigure(encoding="utf-8", errors="replace")
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("url"); ap.add_argument("out")
ap.add_argument("--gpu", choices=["on", "off"], default="off")
ap.add_argument("--headed", action="store_true")
ap.add_argument("--viewport", default="1440x900")
ap.add_argument("--speed", type=int, default=2000, help="px/s")
ap.add_argument("--step", type=int, default=80)
ap.add_argument("--only", default="", help="Komma-Liste von Bereichsnamen")
a = ap.parse_args()
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
W, H = map(int, a.viewport.split("x"))
CATS = ["devtools.timeline", "disabled-by-default-devtools.timeline", "disabled-by-default-devtools.timeline.frame", "toplevel", "cc", "viz", "blink"]

# Bereiche: (Name, Anker-Ausdruck für Start, Anker für Ende) — in vh-Offsets relativ zu Dokumentpositionen (JS-Ausdrücke)
RANGES = [
    ("hero-cover",     "0",                          "vh*1.1"),
    ("stack-1-2",      "top('.stack-card',1)-vh",    "top('.stack-card',1)+vh*0.2"),
    ("stack-2-3",      "top('.stack-card',2)-vh",    "top('.stack-card',2)+vh*0.2"),
    ("preise-bloom",   "top('#preise')-vh",          "top('#preise')+vh*0.3"),
    ("preise-list",    "top('#preise')+vh*0.3",      "top('#technologie')-vh*0.5"),
    ("tech-thread",    "top('#technologie')-vh*0.5", "top('#ueber-mich')"),
    ("about",          "top('#ueber-mich')",         "top('#faq')-vh"),
    ("faq-bloom-r",    "top('#faq')-vh",             "top('#faq')+vh*0.3"),
    ("kontakt-bloom",  "top('#kontakt')-vh",         "top('#kontakt')+vh*0.3"),
    ("footer-reveal",  "top('#kontakt')+vh*0.3",     "max"),
]
HELPERS = """
const vh = innerHeight; const max = document.documentElement.scrollHeight - innerHeight;
const top = (sel, i = 0) => { const el = document.querySelectorAll(sel)[i]; let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; };
"""

def summarize(raw):
    data = json.loads(raw); evs = data.get("traceEvents", data) if isinstance(data, dict) else data
    tot, cnt, mx = {}, {}, {}
    for e in evs:
        if e.get("ph") != "X" or "dur" not in e: continue
        n = e.get("name", ""); tot[n] = tot.get(n, 0) + e["dur"]; cnt[n] = cnt.get(n, 0) + 1; mx[n] = max(mx.get(n, 0), e["dur"])
    frames = cnt.get("Display::DrawAndSwap", 0) or cnt.get("DirectRenderer::DrawFrame", 0) or 1
    g = lambda n: tot.get(n, 0) / 1000
    return {
        "frames": frames,
        "composite_ms_per_frame": round(g("Display::DrawAndSwap") / frames, 2),
        "quads_per_frame": round(cnt.get("SoftwareRenderer::DoDrawQuad", 0) / frames, 1),
        "paint_n": cnt.get("Paint", 0), "paint_ms": round(g("Paint"), 1),
        "raster_n": cnt.get("RasterTask", 0), "raster_ms": round(g("RasterTask"), 1),
        "layout_n": cnt.get("Layout", 0), "layout_ms": round(g("Layout"), 1),
        "main_ms_per_frame": round(g("ProxyMain::BeginMainFrame") / frames, 2),
        "js_ms": round(g("FunctionCall"), 1),
        "decode_ms": round(g("ImageDecodeTask") + g("DecodeImage"), 1),
        "longest_task_ms": round(max(mx.get("RunTask", 0), mx.get("ThreadControllerImpl::RunTask", 0)) / 1000, 1),
    }

args = ["--disable-gpu", "--disable-gpu-compositing", "--disable-accelerated-2d-canvas", "--disable-features=Vulkan"] if a.gpu == "off" else []
report = {"url": a.url, "gpu": a.gpu, "headed": a.headed, "viewport": a.viewport, "speed": a.speed, "ranges": {}}
only = set(x for x in a.only.split(",") if x)
with sync_playwright() as p:
    b = p.chromium.launch(headless=not a.headed, args=args)
    ctx = b.new_context(viewport={"width": W, "height": H}, device_scale_factor=1, locale="de-CH")
    page = ctx.new_page(); page.bring_to_front()
    page.goto(a.url, wait_until="networkidle", timeout=60000)
    time.sleep(2.8)
    mode = page.evaluate("document.documentElement.className")
    print(f"gpu={a.gpu} headed={a.headed} html.class='{mode}' lenis={page.evaluate('!!window.lenis')}")
    page.mouse.move(W // 2, H // 2)
    for name, s_expr, e_expr in RANGES:
        if only and name not in only: continue
        y0, y1 = page.evaluate(f"() => {{ {HELPERS} return [Math.round({s_expr}), Math.round({e_expr})]; }}")
        y0 = max(0, y0); y1 = max(y0 + 50, y1)
        page.evaluate(f"() => {{ if (window.lenis) window.lenis.scrollTo({y0}, {{ immediate: true, force: true }}); else window.scrollTo(0, {y0}); }}")
        time.sleep(0.9)
        b.start_tracing(page=page, categories=CATS, path=str(out / f"trace-{name}-{a.gpu}.json"))
        t0 = time.time()
        dist = y1 - y0; delay = a.step / a.speed; n = max(1, int(dist / a.step))
        for _ in range(n):
            page.mouse.wheel(0, a.step); time.sleep(delay)
        time.sleep(0.6)
        raw = b.stop_tracing()
        res = summarize(raw); res.update({"y0": y0, "y1": y1, "wall_ms": round(1000 * (time.time() - t0))})
        report["ranges"][name] = res
        print(f"  {name:<14} y {y0:>6}-{y1:<6} frames={res['frames']:<4} composite/frame={res['composite_ms_per_frame']:<6} quads/frame={res['quads_per_frame']:<6} paint n={res['paint_n']:<4} {res['paint_ms']:<6}ms raster n={res['raster_n']:<5} {res['raster_ms']:<7}ms main/frame={res['main_ms_per_frame']:<5} js={res['js_ms']:<6} layout={res['layout_ms']:<5} longest={res['longest_task_ms']}")
    ctx.close(); b.close()
(out / f"ranges-gpu-{a.gpu}{'-headed' if a.headed else ''}.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
