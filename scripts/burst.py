#!/usr/bin/env python3
"""Frame-Bursts einzelner Choreografien als Kontaktbogen (Sichtprüfung von Reveals und Übergängen).

Usage:
  python scripts/burst.py http://localhost:3001/ reports/build/burst --viewport 1440x900 \
      --time "hero:0:2400" --time "services:top('.stack-card',1)-vh*0.3:1800" \
      --scrub "kontakt:top('#kontakt')-vh:top('#kontakt'):6"

--time  name:startY-Ausdruck:Dauer_ms → springt zu Y (sofort), dann Screenshots alle ~120 ms (zeitgesteuerte Szene)
--scrub name:y0:y1:n → n Screenshots an gleichmässigen Scrollpositionen zwischen y0 und y1 (gescrubbter Übergang)
--gpu off → ohne GPU-Compositing
"""
import argparse, sys, time
from pathlib import Path
for s in (sys.stdout, sys.stderr): s.reconfigure(encoding="utf-8", errors="replace")
from playwright.sync_api import sync_playwright
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("url"); ap.add_argument("out")
ap.add_argument("--viewport", default="1440x900")
ap.add_argument("--time", action="append", default=[])
ap.add_argument("--scrub", action="append", default=[])
ap.add_argument("--gpu", choices=["on", "off"], default="on")
ap.add_argument("--reduced", action="store_true")
a = ap.parse_args()
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
W, H = map(int, a.viewport.split("x"))
HELPERS = "const vh = innerHeight; const top = (sel, i = 0) => { const el = document.querySelectorAll(sel)[i]; let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; };"

def sheet(frames, path, cols=4, scale=0.4):
    ims = [Image.open(f) for f in frames]
    w, h = int(ims[0].width * scale), int(ims[0].height * scale)
    rows = (len(ims) + cols - 1) // cols
    sh = Image.new("RGB", (cols * w, rows * h), "white")
    for i, im in enumerate(ims):
        sh.paste(im.resize((w, h)), ((i % cols) * w, (i // cols) * h))
    sh.save(path, quality=80)

args = ["--disable-gpu", "--disable-gpu-compositing"] if a.gpu == "off" else []
with sync_playwright() as p:
    b = p.chromium.launch(headless=False, args=args)
    for spec in a.time:
        name, expr, ms = spec.split(":"); ms = int(ms)
        ctx = b.new_context(viewport={"width": W, "height": H}, device_scale_factor=1, reduced_motion="reduce" if a.reduced else "no-preference")
        ctx.add_init_script("try{sessionStorage.setItem('motion','full')}catch(e){}")
        page = ctx.new_page(); page.bring_to_front()
        frames = []
        if expr.strip() == "0":
            page.goto(a.url, wait_until="commit")
            t0 = time.time()
            while (time.time() - t0) * 1000 < ms:
                f = out / f"{name}-{len(frames):02d}.png"; page.screenshot(path=str(f)); frames.append(f); time.sleep(0.05)
        else:
            page.goto(a.url, wait_until="networkidle"); time.sleep(2.8)
            y = page.evaluate(f"() => {{ {HELPERS} return Math.round({expr}); }}")
            page.evaluate(f"() => {{ if (window.lenis) window.lenis.scrollTo({y}, {{ immediate: true, force: true }}); else window.scrollTo(0, {y}); }}")
            t0 = time.time()
            while (time.time() - t0) * 1000 < ms:
                f = out / f"{name}-{len(frames):02d}.png"; page.screenshot(path=str(f)); frames.append(f); time.sleep(0.05)
        sheet(frames, out / f"{name}-sheet.jpg")
        print(f"[{name}] {len(frames)} Frames über {ms} ms → {name}-sheet.jpg")
        ctx.close()
    for spec in a.scrub:
        name, e0, e1, n = spec.split(":"); n = int(n)
        ctx = b.new_context(viewport={"width": W, "height": H}, device_scale_factor=1)
        ctx.add_init_script("try{sessionStorage.setItem('motion','full')}catch(e){}")
        page = ctx.new_page(); page.bring_to_front()
        page.goto(a.url, wait_until="networkidle"); time.sleep(2.8)
        y0, y1 = page.evaluate(f"() => {{ {HELPERS} return [Math.round({e0}), Math.round({e1})]; }}")
        frames = []
        for i in range(n):
            y = y0 + (y1 - y0) * i / (n - 1)
            page.evaluate(f"() => {{ if (window.lenis) window.lenis.scrollTo({y}, {{ immediate: true, force: true }}); else window.scrollTo(0, {y}); }}")
            time.sleep(1.0)
            f = out / f"{name}-{i:02d}-y{int(y)}.png"; page.screenshot(path=str(f)); frames.append(f)
        sheet(frames, out / f"{name}-sheet.jpg", cols=3, scale=0.45)
        print(f"[{name}] {n} Positionen {y0}→{y1} → {name}-sheet.jpg")
        ctx.close()
    b.close()
