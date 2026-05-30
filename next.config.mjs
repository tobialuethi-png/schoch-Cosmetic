/** @type {import('next').NextConfig} */
const nextConfig = {
  // Statischer Export – erzeugt rein statische Dateien.
  // Läuft ohne Node-Server, ideal für Cloudflare Pages u. ä.
  output: "export",
  // Erzeugt pro Route einen Ordner mit index.html (z. B. /behandlungsplan/index.html)
  // statt einer flachen .html-Datei. Noetig, damit klassische Static-Hosts
  // (Hostinger/Apache/LiteSpeed) die saubere URL /behandlungsplan/ ausliefern,
  // statt 503/404 zu werfen.
  trailingSlash: true,
  images: {
    // Beim statischen Export gibt es keine Image-Optimization-Runtime →
    // Bilder werden unverändert ausgeliefert (Dimensionen kommen aus dem Import).
    // ZWINGEND nötig, sonst bricht `next build` mit next/image ab.
    unoptimized: true,
  },
};

export default nextConfig;
