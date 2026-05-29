const phrases = [
  "Permanente Haarentfernung",
  "Schmerzarm & schonend",
  "Seit 2003",
  "Fusspflege",
  "Für jede Hauttönung",
  "Neukirch-Egnach",
  "MPL4-Technologie",
];
// verdoppelt für nahtlose Endlosschleife
const loop = [...phrases, ...phrases];

export default function Marquee() {
  return (
    <section
      className="relative mt-4 overflow-hidden border-y border-line py-4 sm:mt-0"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-ink to-transparent sm:w-36" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-ink to-transparent sm:w-36" />

      <div className="flex w-max animate-marquee items-center">
        {loop.map((p, i) => (
          <span className="flex items-center" key={`${p}-${i}`}>
            <span className="whitespace-nowrap px-8 text-xs font-medium uppercase tracking-[0.22em] text-sand md:text-sm">
              {p}
            </span>
            <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-gold/50" />
          </span>
        ))}
      </div>
    </section>
  );
}
