import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { SITE_PATHS, lastModified } from "@/lib/lastmod";

/* Sitemap aus dem Build: lastmod = letzter Commit der jeweiligen Seitenquellen (lib/lastmod.ts).
   Kein priority/changefreq — Google ignoriert beide. */
/* Statischer Export: die Route wird beim Build einmal ausgewertet */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return SITE_PATHS.map((path) => ({ url: `${site.domain}${path}`, lastModified: lastModified(path) }));
}
