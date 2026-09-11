#!/usr/bin/env python3
"""Frame-Zeit-Messung beim Durchscrollen — mit und ohne GPU-Compositing (animation-performance §7).

Usage:
  python scripts/perf.py http://localhost:3001/ reports/perf/baseline --gpu off [--headed] [--viewport 1440x900] [--speed 2500]

--gpu off  startet Chromium mit --disable-gpu --disable-gpu-compositing (entspricht «Grafikbeschleunigung aus»)
--gpu on   normaler Start
Ergebnis: JSON + Konsolen-Tabelle: Frames gesamt, Anteil > 20 ms / > 34 ms / > 50 ms, Long Tasks, pro Section.
Relativ vergleichen (Baseline vs. Nachher auf demselben Gerät) — absolute Werte sind gerätespezifisch.
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
ap.add_argument("--speed", type=int, default=2500, help="px/s Scrollgeschwindigkeit")
ap.add_argument("--step", type=int, default=100, help="px pro Wheel-Event")
ap.add_argument("--runs", type=int, default=1)
ap.add_argument("--label", default="")
ap.add_argument("--trace", action="store_true", help="Chrome-Trace aufzeichnen und Render-Kosten (Paint/Raster/Layout/Composite) summieren")
ap.add_argument("--throttle", type=float, default=1.0, help="CDP CPU-Drossel (Hauptthread), z. B. 4")
ap.add_argument("--cores", type=int, default=0, help="Chromium auf N Kerne pinnen (Windows, Prozess-Affinität) — drosselt auch Raster/Compositor")
a = ap.parse_args()
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
W, H = map(int, a.viewport.split("x"))

SAMPLER = """
(() => {
  window.__perf = { frames: [], long: [], t0: performance.now() };
  let last = performance.now();
  function tick(t) { const dt = t - last; last = t; window.__perf.frames.push([Math.round(t), +dt.toFixed(2), Math.round(scrollY)]); requestAnimationFrame(tick); }
  requestAnimationFrame(tick);
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__perf.long.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true }); } catch (e) {}
})();
"""

TRACE_CATS = ["devtools.timeline", "disabled-by-default-devtools.timeline", "disabled-by-default-devtools.timeline.frame", "toplevel", "cc", "viz", "blink", "v8.execute", "disabled-by-default-cc.debug"]
KEYS = ["Paint", "RasterTask", "Layout", "UpdateLayoutTree", "PrePaint", "UpdateLayerTree", "CompositeLayers", "FunctionCall", "Animation", "ImageDecodeTask", "DecodeImage", "Draw", "DrawFrame", "LayerTreeHostImpl::PrepareToDraw", "SoftwareRenderer::DrawFrame", "SkiaRenderer::DrawFrame", "DirectRenderer::DrawFrame", "Display::DrawAndSwap", "TileManager::ScheduleTasks", "Commit", "ProxyMain::BeginMainFrame::commit", "ThreadProxy::ScheduledActionDraw", "HitTest", "ParseHTML", "EvaluateScript", "MinorGC", "MajorGC", "V8.GC"]

def trace_summary(raw):
    try:
        data = json.loads(raw)
    except Exception:
        return {}
    evs = data.get("traceEvents", data) if isinstance(data, dict) else data
    tot, cnt, mx = {}, {}, {}
    t0 = min((e["ts"] for e in evs if "ts" in e), default=0); t1 = max((e["ts"] for e in evs if "ts" in e), default=0)
    for e in evs:
        if e.get("ph") != "X" or "dur" not in e: continue
        n = e.get("name", "")
        tot[n] = tot.get(n, 0) + e["dur"]; cnt[n] = cnt.get(n, 0) + 1; mx[n] = max(mx.get(n, 0), e["dur"])
    span = (t1 - t0) / 1000
    top = sorted(tot.items(), key=lambda kv: -kv[1])[:24]
    out = {"span_ms": round(span), "by_name": {n: {"ms": round(v / 1000, 1), "n": cnt[n], "max_ms": round(mx[n] / 1000, 2)} for n, v in top}}
    for k in KEYS:
        if k in tot and k not in out["by_name"]: out["by_name"][k] = {"ms": round(tot[k] / 1000, 1), "n": cnt[k], "max_ms": round(mx[k] / 1000, 2)}
    return out

def print_trace(tag, ts):
    if not ts: print(f"  [trace {tag}] leer"); return
    print(f"  [trace {tag}] span={ts['span_ms']}ms")
    for n, v in ts["by_name"].items():
        print(f"     {n:<42} {v['ms']:>9.1f} ms  n={v['n']:<6} max={v['max_ms']}")

def pct(v, q):
    if not v: return 0
    s = sorted(v); i = min(len(s) - 1, int(round(q * (len(s) - 1)))); return s[i]

def summarize(frames, long, sections, t_start, t_end):
    fr = [f for f in frames if t_start <= f[0] <= t_end]
    dts = [f[1] for f in fr]
    n = len(dts) or 1
    res = {
        "frames": len(dts), "mean_ms": round(sum(dts) / n, 2), "p50": pct(dts, .5), "p95": pct(dts, .95), "max": max(dts) if dts else 0,
        "over20_pct": round(100 * sum(d > 20 for d in dts) / n, 1), "over34_pct": round(100 * sum(d > 34 for d in dts) / n, 1), "over50_pct": round(100 * sum(d > 50 for d in dts) / n, 1),
        "long_tasks": len([l for l in long if t_start <= l[0] <= t_end]), "long_ms": sum(l[1] for l in long if t_start <= l[0] <= t_end),
        "sections": {},
    }
    # Section-Zuordnung über scrollY (Viewport-Oberkante)
    for i, (name, top) in enumerate(sections):
        nxt = sections[i + 1][1] if i + 1 < len(sections) else 1e12
        sd = [f[1] for f in fr if top - H * 0.6 <= f[2] < nxt - H * 0.6]
        if not sd: continue
        m = len(sd)
        res["sections"][name] = {"frames": m, "mean_ms": round(sum(sd) / m, 2), "over20_pct": round(100 * sum(d > 20 for d in sd) / m, 1), "over34_pct": round(100 * sum(d > 34 for d in sd) / m, 1), "max": max(sd)}
    return res

args = ["--disable-gpu", "--disable-gpu-compositing", "--disable-accelerated-2d-canvas", "--disable-features=Vulkan"] if a.gpu == "off" else []
report = {"url": a.url, "throttle": a.throttle, "cores": a.cores, "gpu": a.gpu, "headed": a.headed, "viewport": a.viewport, "speed": a.speed, "label": a.label, "runs": []}
with sync_playwright() as p:
    b = p.chromium.launch(headless=not a.headed, args=args)
    if a.cores:
        import subprocess
        mask = (1 << a.cores) - 1
        ps = f"Get-Process chrome -ErrorAction SilentlyContinue | Where-Object {{ $_.Path -like '*ms-playwright*' }} | ForEach-Object {{ $_.ProcessorAffinity = {mask} }}"
        subprocess.run(["powershell", "-NoProfile", "-Command", ps], check=False)
    for run in range(a.runs):
        ctx = b.new_context(viewport={"width": W, "height": H}, device_scale_factor=1, locale="de-CH")
        ctx.add_init_script(SAMPLER)
        page = ctx.new_page()
        page.bring_to_front()
        if a.cores:
            import subprocess
            mask = (1 << a.cores) - 1
            ps = f"Get-Process chrome -ErrorAction SilentlyContinue | Where-Object {{ $_.Path -like '*ms-playwright*' }} | ForEach-Object {{ $_.ProcessorAffinity = {mask}; $_.Id }}"
            r = subprocess.run(["powershell", "-NoProfile", "-Command", ps], check=False, capture_output=True, text=True)
            print(f"  affinity mask {mask} auf {len(r.stdout.split())} Chromium-Prozesse gesetzt")
        if a.throttle > 1:
            cdp = ctx.new_cdp_session(page)
            cdp.send("Emulation.setCPUThrottlingRate", {"rate": a.throttle})
        if a.trace: b.start_tracing(page=page, categories=TRACE_CATS, path=str(out / f"trace-intro-{a.gpu}.json"))
        page.goto(a.url, wait_until="networkidle", timeout=60000)
        t_load = page.evaluate("performance.now()")
        time.sleep(2.6)  # Hero-Intro abwarten
        t_intro_end = page.evaluate("performance.now()")
        tr_intro = trace_summary(b.stop_tracing()) if a.trace else {}
        info = page.evaluate("""() => ({
          mode: document.documentElement.classList.contains('lite') ? 'lite' : (document.documentElement.classList.contains('cpu') ? 'cpu' : 'full'),
          lenis: !!window.lenis,
          renderer: (() => { try { const gl = document.createElement('canvas').getContext('webgl'); const e = gl && gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : (gl ? gl.getParameter(gl.RENDERER) : 'none'); } catch (x) { return 'err'; } })(),
          H: document.documentElement.scrollHeight,
          sections: [...document.querySelectorAll('main section[id], main section[aria-labelledby], footer')].map(s => [s.id || s.getAttribute('aria-labelledby') || s.tagName.toLowerCase(), Math.round(s.getBoundingClientRect().top + scrollY)]).filter((s, i, arr) => i === 0 || s[1] > arr[i-1][1]),
        })""")
        page.mouse.move(W // 2, H // 2)
        if a.trace: b.start_tracing(page=page, categories=TRACE_CATS, path=str(out / f"trace-scroll-{a.gpu}.json"))
        t_start = page.evaluate("performance.now()")
        # Wheel-Scroll in konstantem Tempo bis zum Dokumentende
        delay = a.step / a.speed
        y = 0
        last_change = time.time()
        while True:
            page.mouse.wheel(0, a.step)
            time.sleep(delay)
            ny = page.evaluate("Math.round(scrollY)")
            Hn = page.evaluate("document.documentElement.scrollHeight")
            if ny != y: last_change = time.time()
            y = ny
            if y >= Hn - H - 2 or time.time() - last_change > 2.0: break
        time.sleep(1.2)
        t_end = page.evaluate("performance.now()")
        tr_scroll = trace_summary(b.stop_tracing()) if a.trace else {}
        data = page.evaluate("window.__perf")
        res = summarize(data["frames"], data["long"], info["sections"], t_start, t_end)
        intro = summarize(data["frames"], data["long"], [], t_load, t_intro_end); intro.pop("sections", None)
        res["intro"] = intro
        if a.trace: res["trace_intro"] = tr_intro; res["trace_scroll"] = tr_scroll
        res.update({"run": run, "mode": info["mode"], "lenis": info["lenis"], "renderer": info["renderer"], "docHeight": info["H"], "scroll_ms": round(t_end - t_start)})
        report["runs"].append(res)
        print(f"[{a.label or a.out}] gpu={a.gpu} headed={a.headed} mode={info['mode']} lenis={info['lenis']} renderer={info['renderer'][:60]}")
        print(f"  intro: frames={intro['frames']} mean={intro['mean_ms']}ms p95={intro['p95']} max={intro['max']} >20ms={intro['over20_pct']}% >34ms={intro['over34_pct']}% longtasks={intro['long_tasks']} ({intro['long_ms']}ms)")
        print(f"  frames={res['frames']} mean={res['mean_ms']}ms p50={res['p50']} p95={res['p95']} max={res['max']} >20ms={res['over20_pct']}% >34ms={res['over34_pct']}% >50ms={res['over50_pct']}% longtasks={res['long_tasks']} ({res['long_ms']}ms)")
        if a.trace: print_trace("intro", tr_intro); print_trace("scroll", tr_scroll)
        for name, s in res["sections"].items():
            print(f"    {name:<16} n={s['frames']:<4} mean={s['mean_ms']:<6} >20={s['over20_pct']:<5}% >34={s['over34_pct']:<5}% max={s['max']}")
        ctx.close()
    b.close()
(out / f"perf-gpu-{a.gpu}{'-headed' if a.headed else ''}-t{a.throttle:g}-c{a.cores}.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
