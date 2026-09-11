#!/usr/bin/env python3
"""Lokale Build-Screenshots (Phase 3 Selbstcheck): Viewport-Shots nach Scroll-Schritten + Konsolenfehler.
Usage: python scripts/shot.py http://localhost:3000/ reports/build/home --viewports 1440x900,390x844 [--steps N] [--full]
"""
import argparse, json, sys, time
from pathlib import Path
for s in (sys.stdout, sys.stderr): s.reconfigure(encoding="utf-8", errors="replace")
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("url"); ap.add_argument("out")
ap.add_argument("--viewports", default="1440x900,390x844")
ap.add_argument("--steps", type=int, default=0, help="0 = automatisch bis Dokumentende")
ap.add_argument("--full", action="store_true", help="zusätzlich Full-Page-Screenshot")
ap.add_argument("--wait", type=int, default=1400)
ap.add_argument("--click", action="append", default=[])
a = ap.parse_args()
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
report = {"url": a.url, "viewports": {}}
with sync_playwright() as p:
    b = p.chromium.launch()
    for vp in a.viewports.split(","):
        w, h = map(int, vp.split("x"))
        ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, locale="de-CH")
        # Headless meldet SwiftShader → Lite-Mode; für den Motion-Selbstcheck vollen Pfad erzwingen
        ctx.add_init_script("try{sessionStorage.setItem('motion','full')}catch(e){}")
        page = ctx.new_page()
        errors, failed = [], []
        page.on("console", lambda m: errors.append(m.text) if m.type in ("error", "warning") else None)
        page.on("requestfailed", lambda r: failed.append(r.url))
        page.goto(a.url, wait_until="networkidle", timeout=60000)
        time.sleep(2.0)
        d = out / f"vp-{vp}"; d.mkdir(exist_ok=True)
        page.screenshot(path=str(d / "step-00-y0.png"))
        H = page.evaluate("document.documentElement.scrollHeight")
        steps = a.steps or 60
        y = 0
        for i in range(1, steps + 1):
            # Höhe pro Schritt neu messen (content-visibility: auto wächst beim Scrollen)
            H = page.evaluate("document.documentElement.scrollHeight")
            y = min(int(i * h * 0.8), max(0, H - h))
            page.evaluate(f"window.scrollTo(0,{y})")
            time.sleep(a.wait / 1000)
            page.screenshot(path=str(d / f"step-{i:02d}-y{y}.png"))
            H = page.evaluate("document.documentElement.scrollHeight")
            if y >= H - h - 2: break
        steps = i
        for k, sel in enumerate(a.click):
            try:
                try:
                    page.click(sel, timeout=4000)
                except Exception as first:
                    errors.append(f"click {sel} (retry force): {str(first)[:300]}")
                    page.click(sel, timeout=4000, force=True)
                time.sleep(1.2)
                page.screenshot(path=str(d / f"click-{k}.png"))
            except Exception as e:
                errors.append(f"click {sel}: {str(e)[:400]}")
        if a.full:
            page.evaluate("window.scrollTo(0,0)"); time.sleep(0.5)
            page.screenshot(path=str(d / "full.png"), full_page=True)
        hosts = sorted({r.split('/')[2] for r in failed if '://' in r})
        report["viewports"][vp] = {"height": H, "steps": steps, "console": errors[:30], "failed_requests": failed[:30], "failed_hosts": hosts}
        print(f"[{vp}] H={H} steps={steps} console={len(errors)} failed={len(failed)}")
        for e in errors[:10]: print("   !", e[:200])
        ctx.close()
    b.close()
(out / "shot.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
