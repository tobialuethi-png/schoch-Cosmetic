#!/usr/bin/env node
/**
 * Build-Zeit-Bildoptimierung für den statischen Export (Cloudflare Pages).
 * Quelle: assets/photos/* + assets/logo-schoch-cosmetic.png
 * Ziel:   public/img/<name>-<w>.{avif,webp,jpg|png} + lib/images.generated.ts (Manifest) + .image-cache.json (Build-Cache)
 * Kein Upscaling: Breiten > Quellbreite werden übersprungen, die Quellbreite wird ergänzt —
 * Ausnahme PRESETS.upscaleTo (Lanczos3 + Nachschärfen) für Quellen, die kleiner sind als ihre Darstellung (Retina).
 * Voll-opake PNGs (Alpha überall 255) werden als JPEG behandelt (kein 1.4-MB-PNG-Fallback).
 * PRESETS.widths ergänzt die Standard-Breiten um kleinere Stufen (Logo: 96/192 für ein 46–71 px breites Bild).
 * DERIVED: zusätzliche Ausschnitte aus einer Quelle mit eigenen Breiten (quadratisches Thumbnail für das runde Hero-Bild).
 * Idempotent: bereits vorhandene Varianten (gleiche mtime-Signatur) werden nicht neu gerechnet.
 */
import sharp from "sharp";
import { readdir, mkdir, stat, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIRS = [path.join(ROOT, "assets", "photos")];
const EXTRA = [path.join(ROOT, "assets", "logo-schoch-cosmetic.png"), path.join(ROOT, "assets", "logo-sc.png")]; // logo-sc: SC-Monogramm (Ausschnitt aus dem Original-Logo) als Masken-Quelle für .sc-mark
const OUT = path.join(ROOT, "public", "img");
const MANIFEST = path.join(ROOT, "lib", "images.generated.ts");
const CACHE = path.join(ROOT, ".image-cache.json"); // ausserhalb von public/: die Cache-Datei gehört nicht in den Export
const WIDTHS = [480, 768, 1200, 1600, 2400];
const QUALITY = { avif: 55, webp: 74, jpeg: 80 };
const MAX_SOURCE_W = 2400; // produkt.jpg ist 4934 px breit — nie grösser als nötig dekodieren
/** Pro-Bild-Ausnahmen: quality überschreibt QUALITY, upscaleTo erlaubt Vergrösserung bis zu dieser Breite (Lanczos3 + sharpen),
 *  widths fügt zusätzliche Stufen unterhalb der Quellbreite hinzu (die Quellbreite bleibt immer der grösste Kandidat). */
const PRESETS = {
  // Porträt Über-mich: Original nur 818×615 px, Darstellung bis ~600 px hoch auf Retina → 2× Lanczos + leichte Schärfung
  schochxy: { quality: { avif: 62, webp: 82, jpeg: 84 }, upscaleTo: 1636, sharpen: { sigma: 0.7, m1: 0.25, m2: 0.9 } },
  // Logo: 36–56 px hoch dargestellt (≈ 46–71 px breit). Als Dichte-Kandidaten eingebunden (1x = 96, 2x = 192, 3x = 458):
  // der Browser verkleinert so immer selbst um rund Faktor 2 statt eine fast 1:1 grosse Datei nochmals zu resampeln.
  "logo-schoch-cosmetic": { widths: [96, 192] },
};
/** Abgeleitete Bilder: Quelle + quadratischer Ausschnitt (x/y = Lage des Überhangs wie object-position) + exakte Breiten. */
const DERIVED = {
  // Rundes Kreisbild im Hero: 96 px mobil, 180–280 px ab md, jeweils bis 2× DPR. Ausschnitt = object-fit: cover mit
  // object-position 55% 45% im quadratischen Kreis — derselbe Bildausschnitt, nur ohne den unsichtbaren Überhang.
  "produkt-quadrat": { from: path.join(ROOT, "assets", "photos", "produkt.jpg"), square: { x: 0.55, y: 0.45 }, widths: [192, 384, 576] },
};

const slug = (file) => path.basename(file, path.extname(file)).replace(/[^a-z0-9-]/gi, "-");

async function main() {
  await mkdir(OUT, { recursive: true });
  const cache = existsSync(CACHE) ? JSON.parse(await readFile(CACHE, "utf8")) : {};
  const files = [];
  for (const d of SRC_DIRS) for (const f of await readdir(d)) if (/\.(jpe?g|png|webp)$/i.test(f)) files.push(path.join(d, f));
  files.push(...EXTRA.filter(existsSync));

  const jobs = files.map((file) => ({ file, name: slug(file), preset: PRESETS[slug(file)] ?? {}, derived: false }));
  for (const [name, cfg] of Object.entries(DERIVED)) if (existsSync(cfg.from)) jobs.push({ file: cfg.from, name, preset: cfg, derived: true });

  const manifest = {};
  for (const { file, name, preset, derived } of jobs) {
    const st = await stat(file);
    const sig = `${st.size}-${Math.round(st.mtimeMs)}`;
    const quality = { ...QUALITY, ...(preset.quality ?? {}) };
    const meta = await sharp(file).metadata();
    // Alpha nur, wenn sie irgendwo < 255 ist (opake PNG-Exporte sonst als 1.4-MB-PNG-Fallback)
    const hasAlpha = Boolean(meta.hasAlpha) && (await sharp(file).stats()).channels[3]?.min < 255;
    // Quadratischer Ausschnitt (DERIVED.square): Kante = kürzere Seite, Lage = Anteil des Überhangs (wie object-position)
    let crop = null;
    let effW = meta.width;
    let effH = meta.height;
    if (preset.square) {
      const side = Math.min(meta.width, meta.height);
      crop = { left: Math.round((meta.width - side) * preset.square.x), top: Math.round((meta.height - side) * preset.square.y), width: side, height: side };
      effW = effH = side;
    }
    let widths;
    let srcW;
    if (derived) {
      // Abgeleitete Bilder: genau die konfigurierten Breiten, die grösste wird zur Manifest-Breite
      widths = [...preset.widths].sort((a, b) => a - b);
      srcW = widths[widths.length - 1];
    } else {
      srcW = Math.max(Math.min(effW, MAX_SOURCE_W), preset.upscaleTo ?? 0);
      // Stufen knapp unter der Quellbreite (< 10 % Unterschied) sind Duplikate → weglassen
      const steps = [...WIDTHS, ...(preset.widths ?? [])];
      widths = [...new Set([...steps.filter((w) => w < srcW * 0.9), srcW])].sort((a, b) => a - b);
    }
    const srcH = Math.round(effH * (srcW / effW));
    const fallback = hasAlpha ? "png" : "jpg";
    manifest[name] = { width: srcW, height: srcH, widths, fallback, alpha: hasAlpha };
    const sigP = `${sig}-${JSON.stringify(preset)}`;

    if (cache[name] === sigP && widths.every((w) => existsSync(path.join(OUT, `${name}-${w}.avif`)))) {
      console.log(`= ${name} (cache)`);
      continue;
    }
    for (const w of widths) {
      const up = w > effW;
      let base = sharp(file).rotate();
      if (crop) base = base.extract(crop);
      if (!hasAlpha && meta.hasAlpha) base = base.flatten({ background: "#ffffff" });
      base = base.resize({ width: w, withoutEnlargement: !preset.upscaleTo, kernel: "lanczos3" });
      if (preset.sharpen && up) base = base.sharpen(preset.sharpen);
      await Promise.all([
        base.clone().avif({ quality: quality.avif, effort: 4 }).toFile(path.join(OUT, `${name}-${w}.avif`)),
        base.clone().webp({ quality: quality.webp }).toFile(path.join(OUT, `${name}-${w}.webp`)),
        hasAlpha
          ? base.clone().png({ compressionLevel: 9 }).toFile(path.join(OUT, `${name}-${w}.png`))
          : base.clone().jpeg({ quality: quality.jpeg, mozjpeg: true }).toFile(path.join(OUT, `${name}-${w}.jpg`)),
      ]);
    }
    cache[name] = sigP;
    console.log(`+ ${name} ${effW}×${effH}${crop ? " (Quadrat)" : ""} → ${widths.join("/")}`);
  }

  const ts = `/* AUTO-GENERIERT von scripts/optimize-images.mjs — nicht von Hand bearbeiten */
export type ImageMeta = { width: number; height: number; widths: number[]; fallback: "jpg" | "png"; alpha: boolean };
export const images = ${JSON.stringify(manifest, null, 2)} as const satisfies Record<string, ImageMeta>;
export type ImageName = keyof typeof images;
`;
  await writeFile(MANIFEST, ts, "utf8");
  await writeFile(CACHE, JSON.stringify(cache, null, 2), "utf8");
  console.log(`Manifest: ${Object.keys(manifest).length} Bilder → lib/images.generated.ts`);
}

main().catch((e) => { console.error(e); process.exit(1); });
