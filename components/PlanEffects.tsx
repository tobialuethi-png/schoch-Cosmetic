"use client";

import { useEffect } from "react";
import { initSite } from "@/lib/site-init";
import { initPlanFilter } from "@/lib/plan-filter";

/* Clientseitige Logik der Behandlungsplan-Unterseite. Rendert nichts. */
export default function PlanEffects() {
  useEffect(() => {
    const teardownSite = initSite();
    const teardownFilter = initPlanFilter();
    return () => {
      teardownFilter();
      teardownSite();
    };
  }, []);

  return null;
}
