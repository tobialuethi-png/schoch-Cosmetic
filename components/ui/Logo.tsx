import { images } from "@/lib/images.generated";

/**
 * Kunden-Logo (transparent). AVIF/WebP mit PNG-Fallback aus dem Build-Manifest (scripts/optimize-images.mjs PRESETS:
 * 96/192 + Original 458). srcset mit Dichte-Deskriptoren (96 → 1x, 192 → 2x, 458 → 3x): das Logo ist 46–71 px breit,
 * der Browser bekommt so bei jeder Dichte einen rund doppelt so grossen Kandidaten und verkleinert einmal sauber selbst —
 * ein fast 1:1 grosser Kandidat (96 px für 92 Gerätepixel) würde durch das zweite Resampling sichtbar weich.
 * aspect-ratio explizit auf das Original (458:362): die kleinen Stufen haben gerundete Höhen (192×152 statt 151.7),
 * mit `w-auto` würde die Box sonst um Bruchteile eines Pixels schmaler und das ganze Logo subpixelweise verschoben.
 * Über dem Hero wird die Creme-Variante per statischem CSS-Filter aus derselben Datei erzeugt (keine Animation).
 */
export default function Logo({ className, tone = "orange" }: { className?: string; tone?: "orange" | "cream" }) {
  const meta = images["logo-schoch-cosmetic"];
  const set = (ext: string) => meta.widths.map((w, i) => `/img/logo-schoch-cosmetic-${w}.${ext} ${i + 1}x`).join(", ");
  const largest = meta.widths[meta.widths.length - 1];
  const style = tone === "cream" ? { filter: "brightness(0) invert(0.97) sepia(0.15)" } : undefined;
  return (
    <picture className={`block ${className ?? ""}`} style={style}>
      <source type="image/avif" srcSet={set("avif")} />
      <source type="image/webp" srcSet={set("webp")} />
      <img
        src={`/img/logo-schoch-cosmetic-${largest}.png`}
        srcSet={set("png")}
        width={meta.width}
        height={meta.height}
        alt="Schoch Cosmetic"
        className="h-full w-auto"
        style={{ aspectRatio: `${meta.width} / ${meta.height}` }}
        draggable={false}
        decoding="async"
      />
    </picture>
  );
}
