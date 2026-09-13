/* JSON-LD einer Route, als Server Component im statischen HTML (Google liest Structured Data an jeder Stelle des Dokuments).
   «<» wird escaped, damit kein Textinhalt ein </script> bilden kann. */
export default function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
