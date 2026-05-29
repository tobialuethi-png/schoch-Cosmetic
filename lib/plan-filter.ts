/* Zonen-Filter des Behandlungsplans (Progressive Enhancement:
   ohne JS sind alle Zonen sichtbar). Portiert aus dem Astro-Skript. */
export function initPlanFilter(): () => void {
  const root = document.querySelector<HTMLElement>("[data-planfilter]");
  if (!root) return () => {};
  const tabs = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-filter]")
  );
  const zones = Array.from(
    document.querySelectorAll<HTMLElement>("[data-zone]")
  );
  if (!tabs.length) return () => {};

  const apply = (val: string) => {
    tabs.forEach((t) => {
      const active = t.dataset.filter === val;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-pressed", active ? "true" : "false");
    });
    zones.forEach((z) => {
      z.hidden = !(val === "all" || z.dataset.zone === val);
    });
  };

  const handlers: Array<[HTMLButtonElement, () => void]> = [];
  tabs.forEach((t) => {
    const handler = () => apply(t.dataset.filter || "all");
    t.addEventListener("click", handler);
    handlers.push([t, handler]);
  });

  return () => handlers.forEach(([t, h]) => t.removeEventListener("click", h));
}
