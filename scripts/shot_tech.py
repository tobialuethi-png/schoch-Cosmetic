"""Technologie-Szene: Screenshots an Anteilen der gepinnten Strecke. Usage: python scripts/shot_tech.py URL OUT [WxH]"""
import sys, time, json
from pathlib import Path
for s in (sys.stdout, sys.stderr): s.reconfigure(encoding="utf-8", errors="replace")
from playwright.sync_api import sync_playwright
url, out = sys.argv[1], Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
vp = sys.argv[3] if len(sys.argv) > 3 else "1440x900"
w, h = map(int, vp.split("x"))
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, locale="de-CH")
    ctx.add_init_script("try{sessionStorage.setItem('motion','full')}catch(e){}")
    page = ctx.new_page(); errs = []
    page.on("console", lambda m: errs.append(m.text) if m.type in ("error", "warning") else None)
    page.goto(url, wait_until="networkidle", timeout=60000); time.sleep(2)
    info = page.evaluate("""() => { const st = ScrollTrigger.getAll().find(s => s.trigger && s.trigger.id === 'technologie' && s.pin); const el = document.getElementById('technologie'); return st ? {start: st.start, end: st.end, pinned: el.classList.contains('is-pinned')} : {start: el.getBoundingClientRect().top + scrollY, end: null, pinned: el.classList.contains('is-pinned')} }""")
    print(vp, info)
    if info["end"]:
        fr = [float(x) for x in sys.argv[4].split(",")] if len(sys.argv) > 4 else [0.0, 0.12, 0.3, 0.5, 0.7, 0.9]
        for k, f in enumerate(fr):
            y = info["start"] + (info["end"] - info["start"]) * f
            page.evaluate(f"window.scrollTo(0,{y})"); time.sleep(1.6)
            page.screenshot(path=str(out / f"{vp}-p{int(f*100):02d}.png"))
    else:
        y0 = info["start"] - 40
        for k in range(4):
            page.evaluate(f"window.scrollTo(0,{y0 + k*h*0.85})"); time.sleep(1.2)
            page.screenshot(path=str(out / f"{vp}-s{k}.png"))
    print("console:", errs[:8])
    b.close()
