import { contact } from "@/lib/site";

const details = [
  {
    label: "Adresse",
    value: `${contact.street}<br>${contact.zip} ${contact.city}`,
    href: contact.mapsUrl,
    cta: "Route planen",
  },
  {
    label: "Telefon",
    value: contact.phoneDisplay,
    href: contact.phoneHref,
    cta: "Jetzt anrufen",
  },
  {
    label: "E-Mail",
    value: contact.email,
    href: `mailto:${contact.email}`,
    cta: "E-Mail schreiben",
  },
];

export default function Contact() {
  return (
    <section id="kontakt" className="relative overflow-hidden scroll-mt-24 py-16 md:py-32">
      <div className="aura right-10 top-0 h-96 w-96 bg-gold/8" aria-hidden="true" />

      <div className="shell relative">
        <div className="mb-14 max-w-3xl">
          <h2 style={{ fontSize: "var(--text-h2)" }} data-reveal="up">
            Besuchen Sie mich.
          </h2>
          <p className="mt-6 text-sand" style={{ fontSize: "var(--text-lead)" }} data-reveal="up">
            Terminvereinbarung ganz einfach: telefonisch oder per WhatsApp unter{" "}
            <a href={contact.phoneHref} className="link-underline text-cream">
              {contact.phoneDisplay}
            </a>
            . Ich freue mich auf Ihren Anruf.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5" data-stagger>
            {details.map((d) => (
              <a
                key={d.label}
                href={d.href}
                target={d.label === "Adresse" ? "_blank" : undefined}
                rel={d.label === "Adresse" ? "noopener noreferrer" : undefined}
                className="card-luxe group flex items-center justify-between gap-4 p-6 transition-[border-color,transform] duration-400 hover:-translate-y-0.5 hover:border-gold/40"
                data-reveal="up"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-gold-strong">{d.label}</p>
                  <p className="mt-1.5 text-cream" dangerouslySetInnerHTML={{ __html: d.value }} />
                </div>
                <span className="flex items-center gap-2 text-xs text-mist transition-colors group-hover:text-cream">
                  {d.cta}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            ))}

            <a
              href={contact.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card-luxe group relative block h-56 overflow-hidden transition-[border-color,transform] duration-400 hover:-translate-y-0.5 hover:border-gold/40"
              data-reveal="up"
              aria-label="Standort Oberzelgstrasse 7B, Neukirch-Egnach in Google Maps öffnen"
            >
              <iframe
                src="https://www.google.com/maps?q=Oberzelgstrasse+7b+9315+Neukirch-Egnach&z=15&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Standort Schoch Cosmetic auf Google Maps"
                aria-hidden="true"
                tabIndex={-1}
                className="pointer-events-none absolute inset-0 h-full w-full border-0 transition-transform duration-500 group-hover:scale-[1.03]"
                style={{ filter: "saturate(0.82) contrast(1.04) brightness(1.02)" }}
              />
              <span
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{ background: "radial-gradient(120% 90% at 50% 0%, transparent 40%, rgba(20,14,8,0.18) 100%)" }}
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-night/95 via-night/70 to-transparent px-5 py-3.5">
                <span className="text-sm text-cream">Oberzelgstrasse 7B · Neukirch-Egnach</span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-mist transition-colors group-hover:text-cream">
                  In Google Maps öffnen
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </a>
          </div>

          <div className="card-luxe p-8 md:p-10 lg:col-span-7" data-reveal="up">
            <h3 className="mb-2 text-cream" style={{ fontSize: "var(--text-h3)" }}>
              Nachricht senden
            </h3>
            <p className="mb-7 text-sm text-mist">
              Schreiben Sie mir Ihr Anliegen. Ich melde mich zeitnah bei Ihnen.
            </p>

            <form
              className="grid gap-5 sm:grid-cols-2"
              action="https://api.web3forms.com/submit"
              method="POST"
              data-contact-form
              data-mailto={contact.email}
            >
              {/* Web3Forms: Access-Key hier eintragen (von web3forms.com).
                  Solange der Platzhalter steht, faellt das Formular sicher auf
                  einen mailto-Fallback zurueck – sobald der echte Key da ist,
                  wird direkt per AJAX gesendet (ohne Weiterleitung). */}
              <input type="hidden" name="access_key" value="3e7b4dfa-3d95-4ac9-8840-b0e123f84df5" />
              <input type="hidden" name="subject" value="Neue Anfrage über schoch-cosmetic.ch" />
              <input type="hidden" name="from_name" value="Schoch Cosmetic – Kontaktformular" />
              {/* Spam-Honeypots (fuer Menschen unsichtbar) */}
              <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <input type="checkbox" name="botcheck" tabIndex={-1} className="hidden" aria-hidden="true" style={{ display: "none" }} />

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-sand">
                  Name <span className="text-gold-strong" aria-hidden="true">*</span>
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  autoComplete="name"
                  className="w-full rounded-xl border border-line bg-night px-4 py-3 text-cream outline-none transition-colors duration-300 placeholder:text-mist focus:border-gold focus:bg-espresso"
                  placeholder="Ihr Name"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-sand">Telefon</span>
                <input
                  type="tel"
                  name="telefon"
                  autoComplete="tel"
                  className="w-full rounded-xl border border-line bg-night px-4 py-3 text-cream outline-none transition-colors duration-300 placeholder:text-mist focus:border-gold focus:bg-espresso"
                  placeholder="079 …"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-sand">
                  E-Mail <span className="text-gold-strong" aria-hidden="true">*</span>
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-line bg-night px-4 py-3 text-cream outline-none transition-colors duration-300 placeholder:text-mist focus:border-gold focus:bg-espresso"
                  placeholder="name@beispiel.ch"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-sand">
                  Nachricht <span className="text-gold-strong" aria-hidden="true">*</span>
                </span>
                <textarea
                  name="nachricht"
                  rows={4}
                  required
                  className="w-full resize-y rounded-xl border border-line bg-night px-4 py-3 text-cream outline-none transition-colors duration-300 placeholder:text-mist focus:border-gold focus:bg-espresso"
                  placeholder="Worauf freuen Sie sich? Welche Behandlung interessiert Sie?"
                />
              </label>

              <label className="flex items-start gap-3 sm:col-span-2">
                <input type="checkbox" name="datenschutz" required className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-gold)]" />
                <span className="text-xs leading-relaxed text-mist">
                  Ich bin damit einverstanden, dass meine Angaben zur Bearbeitung
                  meiner Anfrage verwendet werden.
                </span>
              </label>

              <div className="sm:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button type="submit" className="btn btn-ghost w-full sm:w-auto">
                  Nachricht absenden
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <p className="text-xs text-mist">
                  <span className="text-gold-strong" aria-hidden="true">*</span> Pflichtfeld
                </p>
              </div>
              <p
                className="hidden rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-strong sm:col-span-2"
                data-form-status
                role="status"
                aria-live="polite"
              />
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
