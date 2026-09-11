/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages: statischer Export, Bilder werden zur Build-Zeit optimiert (scripts/optimize-images.mjs)
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
