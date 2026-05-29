import Image from "next/image";
import heroPhoto from "@/assets/photos/Hero2x.jpg";

/*
  HERO · Scroll-Expand
  Beim Scrollen wächst das gerahmte Bild auf nahezu volle Fläche, der Slogan
  „Schmerzlos. / Harmlos. Haarlos." gleitet auseinander und die CTAs blenden
  über dem Bild ein. Gesteuert über die CSS-Variable --p (0→1) aus site-init.
  Ohne JS / bei reduzierter Bewegung bleibt ein ruhiger, vollständiger Hero.
*/
export default function Hero() {
  return (
    <section id="top" className="xhero" data-xhero aria-labelledby="hero-title">
      <div className="xhero__pin" data-xhero-pin>
        <div className="xhero__bg" data-xhero-bg aria-hidden="true">
          <Image
            src={heroPhoto}
            alt=""
            sizes="100vw"
            priority
            className="xhero__bg-img"
          />
          <div className="xhero__veil" />
        </div>

        <figure className="xhero__media" data-xhero-media>
          <Image
            src={heroPhoto}
            alt="Entspannte Kundin mit Schutzbrille auf der Behandlungsliege, während Andrea Schoch mit dem MPL4-Gerät eine sanfte Haarentfernung an der Achsel durchführt"
            sizes="(min-width: 1024px) 94vw, 84vw"
            priority
            className="xhero__media-img"
          />
          <span className="xhero__media-tint" aria-hidden="true" />
        </figure>

        <div className="xhero__titles">
          <h1 className="xhero__title" id="hero-title">
            <span className="xhero__word xhero__word--l" data-xhero-word="l">
              Schmerzlos.
            </span>
            <span className="xhero__word xhero__word--r" data-xhero-word="r">
              Harmlos. <span className="xhero__accent">Haarlos.</span>
            </span>
          </h1>
        </div>

        <div className="xhero__reveal" data-xhero-reveal>
          <div className="xhero__actions">
            <a className="btn xhero__cta" href="#kontakt">
              Probebehandlung anfragen
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a className="btn xhero__cta xhero__cta--ghost" href="#technologie">
              So funktioniert MPL4
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
