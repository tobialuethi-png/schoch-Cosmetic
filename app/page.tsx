import Hero from "@/components/sections/Hero";
import Statement from "@/components/sections/Statement";
import Services from "@/components/sections/Services";
import Pricing from "@/components/sections/Pricing";
import Technology from "@/components/sections/Technology";
import About from "@/components/sections/About";
import Faq from "@/components/sections/Faq";
import Contact from "@/components/sections/Contact";

/**
 * Übergangs-Dramaturgie (jede Section ein Bildschirm; Tonfläche aussen = Fläche der vorherigen Section):
 *  Hero → Statement      Fixed Hero Cover (Inhalt gleitet über den fixierten Hero)
 *  Statement → Leistungen Sticky-Stack (Karten bleiben stehen, die nächste deckt sie ab — chic)
 *  Leistungen → Preise   Bloom (Creme-Ellipse wächst über die letzte Karte — houston/chic-Formsprache)
 *  Preise → Technologie  nahtlos (beide Creme) — ein Lichtfaden wächst unter der Preisliste hervor und führt durch die Argumente
 *  Technologie → Über mich Mündung (der Faden weitet sich zur Cocoa-Fläche, die zur Über-mich-Fläche wird)
 *  Über mich → FAQ       Füllung von rechts (Apricot wächst aus der rechten Kante über die Cocoa-Fläche)
 *  FAQ → Kontakt         Füllung von oben (Creme senkt sich aus der Oberkante)
 *  Eine Formsprache (weiche Ellipse / Blatt), abwechselnde Richtung — nichts schiebt, kippt oder fliegt.
 *  Kontakt → Footer      Footer-Reveal (Footer liegt dahinter, wird freigelegt — ever). Der Beratungs-Block (CtaBlock) steht nur noch auf /behandlungsplan.
 */
export default function HomePage() {
  return (
    <>
      {/* LCP-Kandidat: Hero-Bild vorladen (React hebt <link> in den <head>); srcset/sizes identisch zu <Picture> im Hero */}
      <link
        rel="preload"
        as="image"
        type="image/avif"
        fetchPriority="high"
        imageSrcSet="/img/Hero2x-480.avif 480w, /img/Hero2x-768.avif 768w, /img/Hero2x-1200.avif 1200w"
        imageSizes="(min-width: 1280px) 520px, (min-width: 768px) 46vw, 92vw"
      />
      <Hero />
      {/* Inhalt schiebt sich über den fixierten Hero (Fixed Hero Cover) */}
      <div className="relative z-[1]">
        {/* Sticky-Stack: Statement + Leistungs-Karten. Der Stack ist unten um einen Bildschirm verlängert,
            damit die letzte Karte stehen bleibt, während die Preise (negativer Rand) sie überdecken. */}
        <div className="relative z-0 md:pb-[100svh]">
          <Statement />
          <Services />
        </div>
        <div className="relative z-[5] md:-mt-[100svh]">
          <Pricing />
          <Technology />
          <About />
          <Faq />
          <Contact />
        </div>
      </div>
    </>
  );
}
