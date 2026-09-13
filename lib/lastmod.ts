import { execFileSync } from "node:child_process";

/**
 * Echtes lastmod pro Route (Sitemap, WebPage.dateModified): Datum des letzten Commits, der die Quelldateien der
 * Seite berührt hat — nicht der Build-Zeitpunkt. Sind die Quellen im Arbeitsverzeichnis gerade geändert und noch
 * nicht committet, gilt der Build-Zeitpunkt (der Inhalt ändert sich in diesem Moment). Ohne git: Build-Zeitpunkt.
 * Nur aus Server-Code importieren (child_process).
 */
const SOURCES = {
  "/": ["app/page.tsx", "components/sections", "lib/site.ts"],
  "/behandlungsplan/": ["app/behandlungsplan", "components/plan", "lib/site.ts"],
  "/impressum/": ["app/impressum", "lib/site.ts"],
} as const;

export type SitePath = keyof typeof SOURCES;
export const SITE_PATHS = Object.keys(SOURCES) as SitePath[];

const cache = new Map<SitePath, string>();
const git = (args: string[]) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

export function lastModified(path: SitePath): string {
  const hit = cache.get(path);
  if (hit) return hit;
  const sources = [...SOURCES[path]];
  let iso = "";
  try {
    const dirty = git(["status", "--porcelain", "--", ...sources]);
    iso = dirty ? "" : git(["log", "-1", "--format=%cI", "--", ...sources]);
  } catch {
    iso = "";
  }
  if (!iso) iso = new Date().toISOString();
  cache.set(path, iso);
  return iso;
}
