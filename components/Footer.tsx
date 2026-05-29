"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { contact, site } from "@/lib/site";
import logoSchoch from "@/assets/logo-schoch-cosmetic.png";

export default function Footer() {
  const year = new Date().getFullYear();
  const path = (usePathname() || "/").replace(/\/+$/, "");
  const onHome = path === "";
  const homeHref = onHome ? "#top" : "/";

  return (
    <footer className="relative border-t border-line bg-night">
      <div className="shell py-16 md:py-20">
        <a
          href={homeHref}
          className="mb-14 flex justify-center md:mb-20"
          aria-label="Zur Startseite"
        >
          <Image
            src={logoSchoch}
            alt="Schoch Cosmetic"
            sizes="(min-width:1024px) 320px, (min-width:768px) 260px, 200px"
            className="h-40 w-auto md:h-56 lg:h-64"
          />
        </a>

        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="max-w-sm text-sm leading-relaxed text-sand">
              Permanente Haarentfernung &amp; Fusspflege mit der einzigartigen
              MPL4-Lichttechnologie. Persönlich, schonend und nachhaltig.
            </p>
          </div>

          <div className="md:col-span-5">
            <p className="mb-4 text-xs uppercase tracking-[0.22em] text-gold-strong">
              Kontakt
            </p>
            <address className="space-y-2.5 text-sm not-italic text-sand">
              <p className="font-display text-lg text-cream">{site.founder}</p>
              <p>
                {contact.street}
                <br />
                {contact.zip} {contact.city}
              </p>
              <p>
                <a href={contact.phoneHref} className="link-underline hover:text-cream">
                  {contact.phoneDisplay}
                </a>
              </p>
              <p>
                <a href={`mailto:${contact.email}`} className="link-underline hover:text-cream">
                  {contact.email}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="rule-gold my-12" />

        <div className="flex flex-col gap-4 text-xs text-mist md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.legalName} · Inhaberin: {site.founder} · {contact.zip}{" "}
            {contact.city}
          </p>
        </div>
      </div>
    </footer>
  );
}
