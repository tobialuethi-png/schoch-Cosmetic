"use client";

import { useEffect } from "react";
import { initSite } from "@/lib/site-init";
import { initPriceCarousel } from "@/lib/carousel";
import { initGallery } from "@/lib/gallery";

/* Bündelt die clientseitige Logik der Startseite und räumt beim
   Unmount / bei Navigation wieder auf. Rendert nichts. */
export default function HomeEffects() {
  useEffect(() => {
    const teardownSite = initSite();
    const teardownCarousel = initPriceCarousel();
    const teardownGallery = initGallery();
    return () => {
      teardownGallery();
      teardownCarousel();
      teardownSite();
    };
  }, []);

  return null;
}
