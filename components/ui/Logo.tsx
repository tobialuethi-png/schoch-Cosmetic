import { images } from "@/lib/images.generated";

/**
 * Kunden-Logo (transparent). AVIF/WebP mit PNG-Fallback aus dem Build-Manifest.
 * Über dem Hero wird die Creme-Variante per statischem CSS-Filter aus derselben Datei erzeugt (keine Animation).
 */
export default function Logo({ className, tone = "orange" }: { className?: string; tone?: "orange" | "cream" }) {
  const meta = images["logo-schoch-cosmetic"];
  const w = meta.widths[meta.widths.length - 1];
  const src = (ext: string) => `/img/logo-schoch-cosmetic-${w}.${ext}`;
  const style = tone === "cream" ? { filter: "brightness(0) invert(0.97) sepia(0.15)" } : undefined;
  return (
    <picture className={`block ${className ?? ""}`} style={style}>
      <source type="image/avif" srcSet={src("avif")} />
      <source type="image/webp" srcSet={src("webp")} />
      <img src={src("png")} width={meta.width} height={meta.height} alt="Schoch Cosmetic" className="h-full w-auto" draggable={false} decoding="async" />
    </picture>
  );
}
