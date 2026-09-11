import { ctaBlock, contact } from "@/lib/site";
import LuxButton from "@/components/ui/LuxButton";

/* Section 12 — Full-Bleed Color Block (lagence #10) als Schluss-Bildschirm: Orange-Fläche, Ink-Text (4.86:1),
   Headline in grösster Stufe, Telefonnummer riesig (clinique7-Prinzip) — der einzige farbige Block vor dem Footer */
export default function CtaBlock({ outerClassName = "bg-cream" }: { outerClassName?: string }) {
  return (
    <section data-deck="bloom-b" className={outerClassName} aria-labelledby="cta-title">
      <div className="deck-inner section bg-[var(--tone)] text-ink" style={{ "--tone": "var(--color-orange)" } as React.CSSProperties}>
        <div className="deck-wash" aria-hidden="true" />
        <div className="shell text-center">
          <p className="t-eyebrow" data-reveal>Beratung</p>
          <h2 id="cta-title" className="t-title mx-auto mt-6 max-w-[1100px]" data-reveal-text>{ctaBlock.title}</h2>
          <p className="t-lead mx-auto mt-8 max-w-[620px] text-ink/75" data-reveal>{ctaBlock.text}</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4" data-reveal>
            <LuxButton href={ctaBlock.primary.href} tone="cream">{ctaBlock.primary.label}</LuxButton>
          </div>
          <div className="mt-14 border-t border-ink/15 pt-10 md:mt-16" data-reveal>
            <p className="t-eyebrow text-ink/70">Oder direkt anrufen</p>
            <a href={contact.phoneHref} className="t-giant tnum mt-4 block whitespace-nowrap transition-opacity duration-150 hover:opacity-80">{contact.phoneDisplay}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
