import type { Metadata } from "next";
import { site } from "@/lib/site";

/* Gemeinsame OpenGraph-Basis (Bild, Locale, Site-Name) */
const openGraphBase = {
  type: "website",
  locale: "de_CH",
  siteName: site.name,
  images: [{ url: "/og.png", width: 1200, height: 630 }],
} satisfies Metadata["openGraph"];

/**
 * Metadaten einer Route. Next ersetzt verschachtelte Objekte (openGraph, twitter) pro Segment komplett statt sie
 * feldweise zu mischen — eine Unterseite, die nur title/description setzt, erbte darum og:url, og:title und
 * og:description der Startseite. Deshalb wird hier pro Route der ganze Block aufgebaut; Pfade sind relativ und
 * werden über metadataBase (Root-Layout) zur absoluten www-URL.
 */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: "/" | `/${string}/` }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...openGraphBase, url: path, title, description },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}
