import type { Metadata } from "next";
import { impressum, type ImpressumRow } from "@/lib/site";
import PlaceholderTag from "@/components/ui/PlaceholderTag";

export const metadata: Metadata = {
  title: "Impressum | Schoch Cosmetic",
  description: "Impressum von Schoch Cosmetic, Andrea Schoch, Neukirch-Egnach: Kontaktadresse, Haftungsausschluss, Urheberrechte und Datenschutz.",
  alternates: { canonical: "/impressum/" },
  robots: { index: true, follow: true },
};

/* Angabe-Zeile (Kontaktadresse): Label als ruhige Kapitälchen links, Wert in Serif rechts; Platzhalter mit data-placeholder */
function Row({ r }: { r: ImpressumRow }) {
  const value = r.href
    ? <a href={r.href} className="underline decoration-ink/25 underline-offset-[6px] transition-colors duration-150 hover:decoration-ink">{r.value}</a>
    : r.value;
  return (
    <div className="relative grid gap-1 border-b hairline py-4 last:border-b-0 md:grid-cols-[180px_1fr] md:gap-8 md:py-5" data-placeholder={r.placeholder || undefined}>
      {/* Dev-Markierung: mobil als eigene Zeile über dem Label, ab md oben rechts in der Zeile */}
      {r.placeholder && (
        <>
          <span className="relative block h-9 md:hidden"><PlaceholderTag label="Platzhalter: vom Kunden" /></span>
          <span className="hidden md:contents"><PlaceholderTag label="Platzhalter: vom Kunden" /></span>
        </>
      )}
      <dt className="t-sub text-umber">{r.label}</dt>
      <dd className={`font-serif text-[clamp(20px,1.05rem+0.6vw,28px)] leading-[1.2] tracking-[-0.01em] ${r.placeholder ? "text-umber" : ""}`}>{value}</dd>
    </div>
  );
}

/**
 * Route /impressum — ein Bildschirm in der Dramaturgie des Behandlungsplans:
 * stehende Spalte (H1, Lead, Stand) links, rechts die Abschnitte als editoriale Serif-Titel mit Haarlinien.
 * Kein CTA-Block: die Seite endet ruhig und gibt den Footer-Reveal frei.
 */
export default function ImpressumPage() {
  return (
    <div className="relative z-[1]">
      <section className="bg-cream" aria-labelledby="impressum-title">
        <div className="shell pt-[calc(var(--nav-h)+var(--section-y)*0.5)] pb-[var(--section-y)] md:grid md:grid-cols-12 md:gap-10 md:py-0 lg:gap-16">
          {/* Stehende Spalte */}
          <header data-reveal-scope className="md:sticky md:top-0 md:col-span-5 md:flex md:h-[100svh] md:flex-col md:justify-center md:self-start md:pt-[var(--nav-h)]">
            <h1 id="impressum-title" className="t-h2" data-reveal-text>
              {impressum.title}<em className="text-orange">.</em>
            </h1>
            <p className="t-lead mt-8 max-w-[420px] text-umber" data-reveal>{impressum.lead}</p>

            <p className="t-small mt-12 text-umber/80" data-reveal>Stand: {impressum.updated}</p>
          </header>

          {/* Abschnitte */}
          <div className="mt-16 md:col-span-7 md:mt-0 md:py-[calc(var(--nav-h)+var(--section-y)*0.6)]">
            {impressum.sections.map((s, i) => (
              <article
                key={s.id}
                id={s.id}
                className={`scroll-mt-[calc(var(--nav-h)+32px)] ${i > 0 ? "mt-16 border-t hairline pt-14 md:mt-24 md:pt-20" : ""}`}
                aria-labelledby={`${s.id}-title`}
                data-reveal-scope
              >
                <h2 id={`${s.id}-title`} className="t-h3" data-reveal>{s.title}</h2>

                {"rows" in s ? (
                  <dl className="mt-8">
                    {s.rows.map((r) => <Row key={r.label} r={r} />)}
                  </dl>
                ) : (
                  <div className="prose mt-6 max-w-[62ch] space-y-5" data-reveal>
                    {s.paragraphs.map((p) => (
                      <p key={p} className="t-body text-ink/85">{p}</p>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
