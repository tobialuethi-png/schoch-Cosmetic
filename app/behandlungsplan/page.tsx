import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { pages } from "@/lib/site";
import { planJsonLd } from "@/lib/schema";
import JsonLd from "@/components/JsonLd";
import PlanView from "@/components/plan/PlanView";
import CtaBlock from "@/components/sections/CtaBlock";

export const metadata: Metadata = pageMetadata({ ...pages["/behandlungsplan/"], path: "/behandlungsplan/" });

/**
 * Route /behandlungsplan — zwei Bildschirme:
 *  1 Plan      stehende Spalte mit H1 + Zonen-Index (Scroll-Spy), rechts alle Zonen als editoriale Serif-Zeilen
 *  2 Beratung  orangener Schluss-Block wie auf der Startseite (Bloom über die Creme-Fläche)
 * «Warum mehrere Behandlungen?» auf Nutzerwunsch entfernt; der Kundentext bleibt in der FAQ der Startseite.
 */
export default function PlanPage() {
  return (
    <div className="relative z-[1]">
      <JsonLd data={planJsonLd} />
      <PlanView />
      <CtaBlock />
    </div>
  );
}
