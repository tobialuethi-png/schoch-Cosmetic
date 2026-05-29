/** @type {import('next').NextConfig} */
const nextConfig = {
  // Statischer Export – erzeugt rein statische Dateien.
  // Läuft ohne Node-Server, ideal für Cloudflare Pages u. ä.
  output: "export",
  trailingSlash: false,
  images: {
    // Beim statischen Export gibt es keine Image-Optimization-Runtime →
    // Bilder werden unverändert ausgeliefert (Dimensionen kommen aus dem Import).
    // ZWINGEND nötig, sonst bricht `next build` mit next/image ab.
    unoptimized: true,
  },
};

export default nextConfig;
