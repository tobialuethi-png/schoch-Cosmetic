import { site, contact, nav, footer } from "@/lib/site";
import Logo from "@/components/ui/Logo";
import { TransitionLink } from "@/components/motion/Transition";

/* Footer-Reveal (ever): liegt hinter dem Inhalt (sticky bottom), wird beim Hochschieben der letzten Karte freigelegt.
   Keine Dummy-Links, keine Wortmarke; Fusszeile = «Schoch Cosmetic · Jahr» links, Design-Credit rechts. */
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer bg-cocoa text-cream">
      <div className="shell pt-20 md:pt-24">
        <div className="grid gap-12 md:grid-cols-12" data-reveal-group>
          <div className="md:col-span-5">
            <Logo className="h-14 w-auto" tone="cream" />
            <p className="t-body mt-6 max-w-sm text-cream/75">{footer.claim}</p>
          </div>
          <div className="md:col-span-4">
            <p className="t-eyebrow text-orange">Kontakt</p>
            <address className="t-body mt-4 space-y-1.5 not-italic text-cream/85">
              <p className="font-serif text-2xl text-cream">{site.founder}</p>
              <p>{contact.street}<br />{contact.zip} {contact.city}</p>
              <p><a href={contact.phoneHref} className="underline decoration-cream/30 underline-offset-4 hover:decoration-cream">{contact.phoneDisplay}</a></p>
              <p><a href={`mailto:${contact.email}`} className="underline decoration-cream/30 underline-offset-4 hover:decoration-cream">{contact.email}</a></p>
            </address>
          </div>
          <div className="md:col-span-3">
            <p className="t-eyebrow text-orange">Navigation</p>
            <ul className="t-body mt-4 space-y-1.5 text-cream/85">
              {nav.map((n) => (
                <li key={n.href}><TransitionLink href={n.href} className="hover:text-cream">{n.label}</TransitionLink></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-cream/15 pb-[max(28px,env(safe-area-inset-bottom))] pt-6 t-small text-cream/60 md:flex-row md:items-center md:justify-between md:pb-10">
          <p>{site.name} · {year}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <TransitionLink href="/impressum/" className="underline decoration-cream/30 underline-offset-4 hover:text-cream hover:decoration-cream">Impressum</TransitionLink>
            <p>{footer.credit}</p>
          </div>
        </div>
      </div>
      {/* Platz für die mobile Bottom-Bar */}
      <div className="h-16 md:hidden" aria-hidden="true" />
    </footer>
  );
}
