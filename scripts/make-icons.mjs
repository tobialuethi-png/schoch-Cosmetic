#!/usr/bin/env node
/**
 * Icons aus public/favicon.svg (Monogramm, Orange auf transparent) erzeugen — einmalig bei Änderung des SVG, Ergebnis wird committet:
 *   public/favicon.ico          16/32/48 px, transparent (PNG-kodierte Einträge)
 *   public/apple-touch-icon.png 180 px, Creme-Grund (#fbf7f1), Monogramm zentriert mit Rand
 *   public/icon-192.png / icon-512.png  Creme-Grund, für manifest.webmanifest
 * Usage: node scripts/make-icons.mjs
 */
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const SVG = await readFile(path.join(PUBLIC, "favicon.svg"));
const VIEWBOX = Number(SVG.toString().match(/viewBox="0 0 (\d+)/)?.[1] ?? 196);
const CREAM = "#fbf7f1";
const INSET = 0.66; // Anteil der Kantenlänge für das Monogramm auf farbigem Grund (Rand rundum ≈ 17 %)

/* Monogramm in `size` px rendern; mit background: auf Creme-Fläche zentriert (Monogramm INSET × size gross) */
async function render(size, background = null) {
  const inner = background ? Math.round(size * INSET) : size;
  const glyph = await sharp(SVG, { density: (72 * inner) / VIEWBOX }).resize(inner, inner).png().toBuffer();
  if (!background) return glyph;
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: glyph, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/* ICO-Container: ICONDIR (6 B) + n × ICONDIRENTRY (16 B) + PNG-Daten */
function ico(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(entries.length, 4);
  let offset = 6 + 16 * entries.length;
  const dir = entries.map(({ size, png }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size < 256 ? size : 0, 0); e.writeUInt8(size < 256 ? size : 0, 1);
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
    e.writeUInt32LE(png.length, 8); e.writeUInt32LE(offset, 12);
    offset += png.length;
    return e;
  });
  return Buffer.concat([header, ...dir, ...entries.map((e) => e.png)]);
}

const icoSizes = [16, 32, 48];
const icoEntries = [];
for (const size of icoSizes) icoEntries.push({ size, png: await sharp(await render(size)).png({ compressionLevel: 9 }).toBuffer() });
await writeFile(path.join(PUBLIC, "favicon.ico"), ico(icoEntries));
await writeFile(path.join(PUBLIC, "apple-touch-icon.png"), await render(180, CREAM));
await writeFile(path.join(PUBLIC, "icon-192.png"), await render(192, CREAM));
await writeFile(path.join(PUBLIC, "icon-512.png"), await render(512, CREAM));
console.log(`favicon.ico (${icoSizes.join("/")}), apple-touch-icon.png 180, icon-192.png, icon-512.png → public/`);
