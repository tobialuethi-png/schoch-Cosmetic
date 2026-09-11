#!/usr/bin/env node
/**
 * Build-Zeit-Bildoptimierung für den statischen Export (Cloudflare Pages).
 * Quelle: assets/photos/* + assets/logo-schoch-cosmetic.png
 * Ziel:   public/img/<name>-<w>.{avif,webp,jpg|png} + lib/images.generated.ts (Manifest)
 * Kein Upscaling: Breiten > Quellbreite werden übersprungen, die Quellbreite wird ergänzt —
 * Ausnahme PRESETS.upscaleTo (Lanczos3 + Nachschärfen) für Quellen, die kleiner sind als ihre Darstellung (Retina).
 * Voll-opake PNGs (Alpha überall 255) werden als JPEG behandelt (kein 1.4-MB-PNG-Fallback).
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
const CACHE = path.join(OUT, ".cache.json");
const WIDTHS = [480, 768, 1200, 1600, 2400];
const QUALITY = { avif: 55, webp: 74, jpeg: 80 };
const MAX_SOURCE_W = 2400; // produkt.jpg ist 4934 px breit — nie grösser als nötig dekodieren
/** Pro-Bild-Ausnahmen: quality überschreibt QUALITY, upscaleTo erlaubt Vergrösserung bis zu dieser Breite (Lanczos3 + sharpen). */
const PRESETS = {
  // Porträt Über-mich: Original nur 818×615 px, Darstellung bis ~600 px hoch auf Retina → 2× Lanczos + leichte Schärfung
  schochxy: { quality: { avif: 62, webp: 82, jpeg: 84 }, upscaleTo: 1636, sharpen: { sigma: 0.7, m1: 0.25, m2: 0.9 } },
};

const slug = (file) => path.basename(file, path.extname(file)).replace(/[^a-z0-9-]/gi, "-");

async function main() {
  await mkdir(OUT, { recursive: true });
  const cache = existsSync(CACHE) ? JSON.parse(await readFile(CACHE, "utf8")) : {};
  const files = [];
  for (const d of SRC_DIRS) for (const f of await readdir(d)) if (/\.(jpe?g|png|webp)$/i.test(f)) files.push(path.join(d, f));
  files.push(...EXTRA.filter(existsSync));

  const manifest = {};
  for (const file of files) {
    const name = slug(file);
    const st = await stat(file);
    const sig = `${st.size}-${Math.round(st.mtimeMs)}`;
    const preset = PRESETS[name] ?? {};
    const quality = { ...QUALITY, ...(preset.quality ?? {}) };
    const meta = await sharp(file).metadata();
    // Alpha nur, wenn sie irgendwo < 255 ist (opake PNG-Exporte sonst als 1.4-MB-PNG-Fallback)
    const hasAlpha = Boolean(meta.hasAlpha) && (await sharp(file).stats()).channels[3]?.min < 255;
    const maxW = Math.max(Math.min(meta.width, MAX_SOURCE_W), preset.upscaleTo ?? 0);
    const srcW = maxW;
    const srcH = Math.round(meta.height * (srcW / meta.width));
    // Stufen knapp unter der Quellbreite (< 10 % Unterschied) sind Duplikate → weglassen
    const widths = [...new Set([...WIDTHS.filter((w) => w < srcW * 0.9), srcW])].sort((a, b) => a - b);
    const fallback = hasAlpha ? "png" : "jpg";
    manifest[name] = { width: srcW, height: srcH, widths, fallback, alpha: hasAlpha };
    const sigP = `${sig}-${JSON.stringify(preset)}`;

    if (cache[name] === sigP && widths.every((w) => existsSync(path.join(OUT, `${name}-${w}.avif`)))) {
      console.log(`= ${name} (cache)`);
      continue;
    }
    for (const w of widths) {
      const up = w > meta.width;
      let base = sharp(file).rotate();
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
    console.log(`+ ${name} ${meta.width}×${meta.height} → ${widths.join("/")}`);
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
