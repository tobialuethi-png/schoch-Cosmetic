---
description: "Referenzgetriebenen Build starten (BAIA Reference Synthesis) — Referenz-URLs und Kontext als Argumente"
argument-hint: "<ref-url-1> <ref-url-2> [ref-url-3] -- <Kunde, Scope, Tonalität, Modus>"
---

Nutze den Skill `baia-reference-synthesis` und arbeite die Phasen 0–5 vollständig ab.

Referenzen und Kontext: $ARGUMENTS

Regeln für diesen Lauf:

- Weniger als zwei Referenz-URLs → zuerst nach der zweiten fragen, nichts öffnen.
- Phase 0 vollständig erfassen (Projektkontext, Scope-Klasse, Viewports, Stack, Interaktions-Scope, Freigabe-Modus). Fehlendes in **einer** gebündelten Rückfrage klären.
- Phase 1 pro Referenz mit `scripts/capture_reference.py` (alle deklarierten Viewports, `--hover 12`), danach **alle** Screenshots ansehen. Vorlagen aus dem Skill nach `reports/` kopieren; nie im Skill-Ordner schreiben. Keine Craft-Skills in Phase 0 und 1.
- Phase 2: Blend-Plan füllen, Kohärenz-Check und Originalitäts-Checkliste abhaken, dann Gate: Kurzfassung senden und auf Freigabe warten (außer «Auto» wurde angegeben — dann Annahmen protokollieren).
- Phase 3 nur nach Freigabe: Fundament zuerst, dann Section für Section mit Selbstcheck gegen die Zielwerte; `originality-log.md` mitführen. Skills: `gsap-master`, `signature-animations`, `animation-performance`, ein Taste-Skill.
- Phase 4 mit `scripts/compare_sections.py`, jedes Side-by-side ansehen, `validation-report.md` füllen, Ehrlichkeitsregeln einhalten (Fidelity Gap ist kein Pass).
- Delivery im Antwortformat des Skills, mit Originalitäts-Nachweis.
