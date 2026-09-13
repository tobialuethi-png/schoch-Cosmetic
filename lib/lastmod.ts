import { execFileSync } from "node:child_process";

/**
 * Echtes lastmod pro Route (Sitemap, WebPage.dateModified).
 *  1. Vollständige git-Historie vorhanden (lokaler Build): Datum des letzten Commits, der die Quelldateien der Seite
 *     berührt hat; sind diese Quellen gerade geändert und noch nicht committet, der Build-Zeitpunkt.
 *  2. Sonst (Hosting-Build aus einem Shallow Clone, Export ohne .git, git nicht installiert): die manuell gepflegten
 *     Daten in UPDATED. Ein Shallow Clone liefert für jede Datei dasselbe HEAD-Datum und wird darum nicht benutzt.
 * UPDATED bei jeder inhaltlichen Änderung einer Seite nachführen — der Hosting-Build kennt keine Historie und
 * nimmt diese Werte. Nur aus Server-Code importieren (child_process).
 */
const SOURCES = {
  "/": ["app/page.tsx", "components/sections", "lib/site.ts"],
  "/behandlungsplan/": ["app/behandlungsplan", "components/plan", "lib/site.ts"],
  "/impressum/": ["app/impressum", "lib/site.ts"],
} as const;

export type SitePath = keyof typeof SOURCES;
export const SITE_PATHS = Object.keys(SOURCES) as SitePath[];

/* Manuell gepflegte Fallback-Daten (ISO-Datum) — letzte inhaltliche Änderung je Seite */
const UPDATED: Record<SitePath, string> = {
  "/": "2026-09-13", // Titel/Description (Content-Audit), Leistungs-Liste ohne Nummern
  "/behandlungsplan/": "2026-09-13", // Titel/Description (Content-Audit), Trenner in der Meta-Zeile
  "/impressum/": "2026-09-13", // Titel/Description (Content-Audit)
};

const cache = new Map<SitePath, string>();
const git = (args: string[]) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

/* Commit-Datum aus vollständiger Historie; null, wenn git fehlt, der Clone shallow ist oder kein Commit gefunden wird */
function fromGit(path: SitePath): string | null {
  try {
    if (git(["rev-parse", "--is-shallow-repository"]) !== "false") return null;
    const sources = [...SOURCES[path]];
    if (git(["status", "--porcelain", "--", ...sources])) return new Date().toISOString();
    return git(["log", "-1", "--format=%cI", "--", ...sources]) || null;
  } catch {
    return null;
  }
}

export function lastModified(path: SitePath): string {
  const hit = cache.get(path);
  if (hit) return hit;
  const iso = fromGit(path) ?? UPDATED[path];
  cache.set(path, iso);
  return iso;
}
