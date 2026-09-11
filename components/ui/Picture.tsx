import { images, type ImageName } from "@/lib/images.generated";

type Props = {
  name: ImageName;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Vorab laden + dekodieren (kein fetchpriority high) — für Bilder, die per Wipe/Clip einfliegen und beim Reveal fertig sein müssen */
  eager?: boolean;
  className?: string;
  imgClassName?: string;
  style?: React.CSSProperties;
  /** object-position, z. B. "50% 30%" */
  position?: string;
  draggable?: boolean;
  /** data-parallax auf dem <img> (MotionScope: yPercent -8→8, scale 1.16) */
  parallax?: boolean;
};

/**
 * <picture> mit AVIF/WebP/JPEG-srcset aus dem Build-Manifest.
 * Reserviert die Fläche über width/height (CLS 0). Hero: priority → eager + fetchpriority high.
 */
export default function Picture({ name, alt, sizes, priority, eager = false, className, imgClassName, style, position, draggable = false, parallax = false }: Props) {
  const meta = images[name];
  const set = (ext: string) => meta.widths.map((w) => `/img/${name}-${w}.${ext} ${w}w`).join(", ");
  const largest = meta.widths[meta.widths.length - 1];
  return (
    <picture className={className} style={style}>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img
        src={`/img/${name}-${largest}.${meta.fallback}`}
        srcSet={set(meta.fallback)}
        sizes={sizes}
        width={meta.width}
        height={meta.height}
        alt={alt}
        loading={priority || eager ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        draggable={draggable}
        className={imgClassName}
        data-parallax={parallax ? "" : undefined}
        style={position ? { objectPosition: position } : undefined}
      />
    </picture>
  );
}
