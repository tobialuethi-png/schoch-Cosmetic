/** @type {import('next').NextConfig} */
const nextConfig = {
  // Statischer Export – erzeugt rein statische Dateien (wie zuvor Astro static).
  // Läuft ohne Node-Server, ideal für Cloudflare Pages u. ä.
  output: "export",
  trailingSlash: false,
  images: {
    // Beim statischen Export gibt es keine Image-Optimization-Runtime →
    // Bilder werden unverändert ausgeliefert (Dimensionen kommen aus dem Import).
    unoptimized: true,
  },
};

export default nextConfig;
