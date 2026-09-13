#!/usr/bin/env node
/**
 * Postbuild für den statischen Export (Hostinger).
 * Next.js legt Segment-Prefetch-Dateien in Ordnern mit Punkt im Namen ab, z. B.
 *   out/behandlungsplan/__next.behandlungsplan/__PAGE__.txt
 * Hostingers Deploy lässt solche Ordner weg (Dateien mit Punkten kommen an).
 * Dieses Skript kopiert jede Datei aus einem __next.<name>/-Ordner zusätzlich flach in den
 * Elternordner: <Ordnername>.<Pfad-in-Ordner mit "." statt "/">, z. B.
 *   out/behandlungsplan/__next.behandlungsplan.__PAGE__.txt
 * Das ist exakt der Pfad, den der Next-Client anfragt. Die Ordner bleiben bestehen (lokales serve).
 * Idempotent: erneuter Lauf überschreibt nur die flachen Kopien.
 */
import { copyFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");
const PREFIX = "__next.";

if (!existsSync(OUT)) {
  console.error(`flatten-segments: ${path.relative(ROOT, OUT)}/ fehlt — zuerst "next build" ausführen.`);
  process.exit(1);
}

/** Alle Ordner unterhalb von dir, deren Name mit PREFIX beginnt (rekursiv). */
async function findSegmentDirs(dir, found = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith(PREFIX)) found.push(full);
    await findSegmentDirs(full, found);
  }
  return found;
}

/** Alle Dateien unterhalb von dir (rekursiv), als Pfade relativ zu dir. */
async function listFiles(dir, rel = "", found = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) await listFiles(path.join(dir, entry.name), relPath, found);
    else if (entry.isFile()) found.push(relPath);
  }
  return found;
}

const segmentDirs = await findSegmentDirs(OUT);
// Tiefste Ordner zuerst: verschachtelte __next.*-Ordner sind so bereits flach, bevor der äussere kopiert wird.
segmentDirs.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);

let copied = 0;
for (const dir of segmentDirs) {
  const parent = path.dirname(dir);
  const dirName = path.basename(dir);
  for (const rel of await listFiles(dir)) {
    const flatName = `${dirName}.${rel.split("/").join(".")}`;
    await copyFile(path.join(dir, rel), path.join(parent, flatName));
    copied++;
    console.log(`  ${path.relative(OUT, path.join(parent, flatName)).split(path.sep).join("/")}`);
  }
}

console.log(`flatten-segments: ${copied} Datei(en) aus ${segmentDirs.length} Ordner(n) flach kopiert.`);
