"use client";
/* Einmalige Registrierung aller GSAP-Plugins (Client-Modul) */
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { registerEases } from "./motion";
import { initQuality } from "./quality";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase);
  registerEases();
  ScrollTrigger.config({ ignoreMobileResize: true });
  // Lite-Mode-Entscheidung VOR jedem Komponenten-Effekt (Software-Renderer, reduced-motion, Data-Saver)
  initQuality();
  // Mess-Harness (compare_sections.py liest Tweens/ScrollTrigger über window.gsap)
  (window as unknown as { gsap?: typeof gsap; ScrollTrigger?: typeof ScrollTrigger }).gsap = gsap;
  (window as unknown as { ScrollTrigger?: typeof ScrollTrigger }).ScrollTrigger = ScrollTrigger;
}

export { gsap, useGSAP, ScrollTrigger, SplitText };
