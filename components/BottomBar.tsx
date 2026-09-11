import { contact, whatsappHref } from "@/lib/site";
import { Phone, MessageCircle } from "@/components/ui/Icons";

/* Mobile Sticky-Bottom-Bar (chic): Anrufen | WhatsApp — keine Dummy-Links */
export default function BottomBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[90] grid grid-cols-2 gap-2 border-t hairline bg-cream p-2 md:hidden"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      aria-label="Schnellkontakt"
    >
      <a href={contact.phoneHref} className="btn btn-ghost justify-center"><Phone size={16} /> Anrufen</a>
      <a href={whatsappHref} target="_blank" rel="noopener" className="btn btn-primary justify-center"><MessageCircle size={16} /> WhatsApp</a>
    </div>
  );
}
