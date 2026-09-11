/* Sichtbare Markierung für Platzhalter-Inhalte — nur im Dev-Build gerendert; data-placeholder bleibt immer im Markup */
export default function PlaceholderTag({ label = "Platzhalter: Inhalt folgt" }: { label?: string }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <span className="pointer-events-none absolute right-3 top-3 z-[2] rounded-full border border-dashed border-orange px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-orange">
      {label}
    </span>
  );
}
