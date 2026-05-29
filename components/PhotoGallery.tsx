import Image from "next/image";
import foto1 from "@/assets/photos/foto1.jpg";
import foto2 from "@/assets/photos/foto2.jpg";
import foto3 from "@/assets/photos/foto3.jpg";
import foto4 from "@/assets/photos/foto4.jpg";
import foto5 from "@/assets/photos/foto5.jpg";
import foto7 from "@/assets/photos/foto7.jpg";
import foto8 from "@/assets/photos/foto8.jpg";
import erstesBild from "@/assets/photos/erstesBild.jpg";
import bild11 from "@/assets/photos/bild11.png";

// Echte Einblicke aus dem Studio – bewusst durchmischte Reihenfolge.
// Reihenfolge = Fächer-Position (links → rechts); die Mitte liegt zuoberst.
const photos = [
  { src: foto3, alt: "Sanfte Lichtimpuls-Behandlung im Studio Neukirch-Egnach" },
  { src: bild11, alt: "Einblick in die MPL4-Behandlung bei Schoch Cosmetic" },
  { src: foto7, alt: "Präzise Haarentfernung Schritt für Schritt" },
  { src: erstesBild, alt: "Einblick in die MPL4-Behandlung bei Schoch Cosmetic" },
  { src: foto1, alt: "MPL4-Behandlung im Gesicht bei Schoch Cosmetic" },
  { src: foto5, alt: "MPL4-Multipulslicht-Anwendung im Gesicht" },
  { src: foto8, alt: "Einblick in eine MPL4-Sitzung bei Andrea Schoch" },
  { src: foto2, alt: "Permanente Haarentfernung mit MPL4-Technologie" },
  { src: foto4, alt: "Professionelle Hautpflege bei Schoch Cosmetic" },
];

/*
  WILLKOMMEN · interaktive Foto-Galerie. Auf dem Desktop fächern sich die Fotos
  greif- und ziehbar auf (GSAP, siehe lib/gallery). Auf Touch/kleinen Viewports
  ein Snap-Scroller. Respektiert prefers-reduced-motion.
*/
export default function PhotoGallery() {
  return (
    <section
      id="galerie"
      className="relative scroll-mt-24 py-16 md:py-28"
      aria-labelledby="pg-heading"
      data-pg
    >
      <div className="shell relative">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="pg-heading" style={{ fontSize: "var(--text-h2)" }} data-reveal="up">
            Einblicke
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sand" style={{ fontSize: "var(--text-lead)" }} data-reveal="up">
            Echte Momente aus meinem Studio in Neukirch-Egnach. MPL4-Behandlungen,
            gepflegte Haut und eine Atmosphäre, in der Sie sich rundum wohlfühlen.
          </p>
        </div>

        <div
          className="pg-track pg-pending mt-10 md:mt-14"
          data-pg-track
          role="group"
          aria-label="Fotos aus dem Studio – auf dem Desktop verschiebbar"
        >
          {photos.map((p, i) => (
            <figure
              className="pg-card"
              style={{ "--i": i } as React.CSSProperties}
              data-pg-card
              key={i}
            >
              <Image
                src={p.src}
                alt={p.alt}
                sizes="(min-width:768px) 19vw, 74vw"
                className="pg-img"
                draggable={false}
              />
            </figure>
          ))}
        </div>

        <p className="pg-hint mt-8 text-center text-xs uppercase tracking-[0.22em] text-mist" aria-hidden="true">
          ↔ &nbsp;Fotos greifen &amp; verschieben
        </p>
        <div className="mt-9 flex justify-center" data-reveal="up">
          <a href="#kontakt" className="btn btn-ghost">
            Termin vereinbaren
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
