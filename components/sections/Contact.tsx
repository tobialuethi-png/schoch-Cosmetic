"use client";
import { useState, type FormEvent } from "react";
import { contact, whatsappHref } from "@/lib/site";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone, Check } from "@/components/ui/Icons";
import LuxButton from "@/components/ui/LuxButton";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Section 11 — Kontakt & Besuch (chic #9), ein Bildschirm: Headline in Section-Grösse über die volle Breite,
 * darunter Adresse, Telefon, WhatsApp, E-Mail und Route-Button links, Formular-Card rechts. Einzelpraxis: Ich-Form, keine Team-Formulierungen.
 * Formular: web3forms per fetch; ohne JS greift der mailto-Fallback im action-Attribut.
 * Keine Social-/Review-Links (Kundenvorgabe). Conversion-Strecke → ruhig (Übergang «cover»).
 */
export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent("Anfrage über schoch-cosmetic.ch")}`;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("_gotcha")) return; // Honeypot
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: data, headers: { Accept: "application/json" } });
      const json = await res.json();
      if (json.success) { setStatus("sent"); form.reset(); } else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="kontakt" data-deck="bloom" className="bg-apricot" aria-labelledby="contact-title">
      <div className="deck-inner section bg-[var(--tone)]" style={{ "--tone": "var(--color-cream)" } as React.CSSProperties}>
        <div className="deck-wash" aria-hidden="true" />
        <div className="shell">
          <header className="grid gap-6 md:grid-cols-12 md:items-end md:gap-10">
            <div className="md:col-span-8">
              <h2 id="contact-title" className="t-h2" data-reveal-text>Persönlich in <em>Neukirch-Egnach.</em></h2>
            </div>
            <p className="t-lead max-w-[440px] text-umber md:col-span-4 md:pb-2" data-reveal>Rufen Sie an, schreiben Sie per WhatsApp oder nutzen Sie das Formular. Ich melde mich persönlich bei Ihnen.</p>
          </header>

          <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-12 md:gap-12 lg:gap-16">
            <div className="md:col-span-5">
              <dl className="space-y-6 t-body" data-reveal-group>
                <div className="flex gap-4">
                  <MapPin className="mt-1.5 shrink-0 text-orange-ink" />
                  <div>
                    <dt className="t-eyebrow text-umber">Adresse</dt>
                    <dd className="mt-1">{contact.street}, {contact.zip} {contact.city}</dd>
                    <dd className="mt-2"><a href={contact.mapsUrl} target="_blank" rel="noopener" className="link-arrow">Route öffnen <ArrowUpRight /></a></dd>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Phone className="mt-1.5 shrink-0 text-orange-ink" />
                  <div>
                    <dt className="t-eyebrow text-umber">Telefon</dt>
                    <dd className="mt-1"><a href={contact.phoneHref} className="t-h3 tnum">{contact.phoneDisplay}</a></dd>
                  </div>
                </div>
                <div className="flex gap-4">
                  <MessageCircle className="mt-1.5 shrink-0 text-orange-ink" />
                  <div>
                    <dt className="t-eyebrow text-umber">WhatsApp</dt>
                    <dd className="mt-1"><a href={whatsappHref} target="_blank" rel="noopener" className="link-arrow">Nachricht schreiben <ArrowUpRight /></a></dd>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Mail className="mt-1.5 shrink-0 text-orange-ink" />
                  <div>
                    <dt className="t-eyebrow text-umber">E-Mail</dt>
                    <dd className="mt-1"><a href={`mailto:${contact.email}`} className="underline decoration-ink/30 underline-offset-4">{contact.email}</a></dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="md:col-span-7">
              <form
                action={mailto}
                method="post"
                encType="text/plain"
                onSubmit={onSubmit}
                className="card grid gap-5 p-6 sm:grid-cols-2 md:p-10"
                data-reveal
                noValidate={false}
              >
                <input type="hidden" name="access_key" value={contact.web3formsKey} />
                <input type="hidden" name="subject" value="Neue Anfrage über schoch-cosmetic.ch" />
                <input type="hidden" name="from_name" value="Schoch Cosmetic Kontaktformular" />
                <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

                <div className="field">
                  <label htmlFor="f-name">Name</label>
                  <input id="f-name" name="name" type="text" required autoComplete="name" placeholder="Vor- und Nachname" />
                </div>
                <div className="field">
                  <label htmlFor="f-phone">Telefon</label>
                  <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="079 …" />
                </div>
                <div className="field sm:col-span-2">
                  <label htmlFor="f-email">E-Mail</label>
                  <input id="f-email" name="email" type="email" required inputMode="email" autoComplete="email" placeholder="name@beispiel.ch" />
                </div>
                <div className="field sm:col-span-2">
                  <label htmlFor="f-msg">Nachricht</label>
                  <textarea id="f-msg" name="message" rows={5} required placeholder="Welche Behandlung interessiert Sie?" />
                </div>
                <label className="flex items-start gap-3 sm:col-span-2">
                  <input type="checkbox" name="datenschutz" required className="mt-1 h-4 w-4 shrink-0" />
                  <span className="t-small text-umber">Ich bin einverstanden, dass meine Angaben zur Bearbeitung meiner Anfrage verwendet werden. Die Daten werden nicht an Dritte weitergegeben. <a href="/impressum/#datenschutz" className="underline underline-offset-4 hover:text-ink">Datenschutzhinweise</a>.</span>
                </label>
                <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                  <LuxButton type="submit" disabled={status === "sending"} aria-busy={status === "sending"}>
                    {status === "sending" ? "Wird gesendet …" : "Anfrage senden"}
                  </LuxButton>
                  <p className="t-small text-umber" role="status" aria-live="polite">
                    {status === "sent" && <span className="inline-flex items-center gap-2 text-ink"><Check className="text-orange-ink" /> Danke, Ihre Anfrage ist angekommen.</span>}
                    {status === "error" && <span>Senden fehlgeschlagen. <a href={mailto} className="underline underline-offset-4">Per E-Mail schreiben</a>.</span>}
                    {status === "idle" && <span>Antwort in der Regel innert weniger Stunden.</span>}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
