/* Ein Icon-Set, eine Strichstärke (1.5) — Lucide-Pfade inline, kein Runtime-Import nötig */
type P = { className?: string; size?: number };
const base = (size = 20) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export const ArrowRight = ({ className, size = 16 }: P) => (
  <svg {...base(size)} className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const ArrowUpRight = ({ className, size = 16 }: P) => (
  <svg {...base(size)} className={className}><path d="M7 17 17 7M8 7h9v9" /></svg>
);
export const Phone = ({ className, size = 20 }: P) => (
  <svg {...base(size)} className={className}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2z" /></svg>
);
export const MessageCircle = ({ className, size = 20 }: P) => (
  <svg {...base(size)} className={className}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
);
export const Mail = ({ className, size = 20 }: P) => (
  <svg {...base(size)} className={className}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);
export const MapPin = ({ className, size = 20 }: P) => (
  <svg {...base(size)} className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
export const X = ({ className, size = 22 }: P) => (
  <svg {...base(size)} className={className}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
export const Check = ({ className, size = 16 }: P) => (
  <svg {...base(size)} className={className}><path d="M20 6 9 17l-5-5" /></svg>
);
