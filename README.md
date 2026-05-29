# Schoch Cosmetic – One-Pager

Hochwertiger, animierter One-Pager für **Schoch Cosmetic** (permanente Haarentfernung & Hautästhetik mit MPL4-Technologie, Andrea Schoch, Neukirch-Egnach).

**Stack:** Next.js 15 (App Router, `output: "export"`) · React 19 · Tailwind CSS 4 · GSAP + ScrollTrigger · Lenis (Smooth Scroll) · selbst-gehostete Schriften (Cormorant + Hanken Grotesk). Statischer Export – optimiert für **Cloudflare Pages**.

---

## Entwicklung

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # erzeugt out/ (statischer Export)
```

## Deployment auf Cloudflare Pages

1. Repository mit Cloudflare Pages verbinden (oder `out/` per Wrangler hochladen).
2. Build-Einstellungen:
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
3. Die Datei [`public/_redirects`](public/_redirects) leitet die alten Wix-Pfade automatisch auf die neuen One-Pager-Anker um (z. B. `/angebot-preise` → `/#preise`).

> Custom Domain `www.schoch-cosmetic.ch` in Cloudflare Pages hinterlegen. Die `site.domain`-URL in [`lib/site.ts`](lib/site.ts) ist die Basis für Canonical, OG und JSON-LD (gesetzt via `metadataBase` in [`app/layout.tsx`](app/layout.tsx)).

---

## Inhalte pflegen

Fast alle Texte, Preise und Kontaktdaten liegen zentral in **[`lib/site.ts`](lib/site.ts)**:

| Was | Konstante |
|-----|-----------|
| Kontakt, Telefon, WhatsApp, Adresse | `contact` |
| Navigationspunkte | `nav` |
| Kennzahlen (Technologie) | `stats` |
| MPL4-Vorteile | `mplFeatures` |
| Behandlungs-Kategorien | `treatments` |
| Sommer-Angebot | `offer` |
| Preistabellen | `priceGroups` |
| Qualifikationen | `credentials` |
| Ergebnis-Versprechen | `outcomes` |

Längere Fliesstexte (Über mich, Technologie) stehen direkt in den jeweiligen Komponenten unter `components/`.

### Kontaktformular aktivieren

Das Formular nutzt aktuell einen **Mailto-Fallback** (öffnet das E-Mail-Programm). Für echten Versand ein kostenloses [Formspree](https://formspree.io)-Formular anlegen und in
[`components/Contact.tsx`](components/Contact.tsx) das `action`-Attribut ersetzen:

```html
<form action="https://formspree.io/f/DEINE-ID" ...>
```

---

## Bilder

Verwendete echte Fotos liegen in `assets/photos/` und werden über `next/image` (statischer Import → korrekte Bildmasse gegen Layout-Shift, Lazy Loading) eingebunden. Beim statischen Export ist die Image-Optimization-Runtime deaktiviert (`images.unoptimized` in [`next.config.mjs`](next.config.mjs)), die Bilder werden also unverändert ausgeliefert.

Neue/eigene Fotos einfach in `assets/photos/` ablegen und in der jeweiligen Komponente importieren.

Die alten, veralteten Wix-Werbebanner wurden bewusst **nicht** übernommen.

---

## Technische Highlights

- **Performance:** statisch vorgerenderte Seiten (`output: "export"`), zero render-blocking; Bilder via `next/image` mit korrekten Massen.
- **Accessibility:** Skip-Link, Fokus-Stile, `aria`-Attribute, vollständige `prefers-reduced-motion`-Unterstützung (Animationen & Smooth-Scroll werden dann deaktiviert).
- **SEO:** genau ein `<h1>`, saubere Heading-Hierarchie, Meta/OG/Twitter, `JSON-LD` (HealthAndBeautyBusiness + Service), `sitemap.xml`, `robots.txt`.
- **Robustheit:** Inhalte werden auch ohne JavaScript bzw. bei Skriptfehlern garantiert sichtbar (Failsafe-Timeout).

---

© Schoch Cosmetic · Andrea Schoch · Neukirch-Egnach
