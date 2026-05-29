/* Globales Lightbox-Overlay. Wird per [data-zoom] aus site-init gesteuert. */
export default function Lightbox() {
  return (
    <div
      className="fixed inset-0 z-[150] hidden items-center justify-center bg-ink/95 p-6 backdrop-blur-md"
      data-lightbox
      role="dialog"
      aria-modal="true"
      aria-label="Bildansicht"
    >
      <button
        type="button"
        className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full border border-line text-cream transition-colors hover:border-gold hover:text-gold-strong"
        data-lightbox-close
        aria-label="Schliessen"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <figure className="max-h-[88vh] max-w-5xl">
        {/* src/alt werden beim Öffnen per site-init gesetzt (data-lightbox-img). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          className="max-h-[80vh] w-auto rounded-xl border border-line object-contain"
          data-lightbox-img
        />
        <figcaption className="mt-4 text-center text-sm text-sand" data-lightbox-caption />
      </figure>
    </div>
  );
}
