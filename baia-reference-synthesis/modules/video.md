# Modul: Video und Bildsequenzen

Trigger: Video-Dateien, Provider- oder CDN-Video, Hintergrundvideo, scroll-gekoppeltes Video oder Bildsequenz (Canvas-Scrollytelling), Video-Masken, Poster, videogetriebene Motion-Grafik.

## Analyse-Zusätze (Phase 1)

- Beobachten: Platzierung, Aspect-Ratio und Beschnitt (object-fit), Maske oder Form, Autoplay / Mute / Loop / Controls, Poster-Verhalten, Scroll-Kopplung (Scrub-Video oder Bildsequenz — erkennbar an ruckfreiem Vor- und Zurückspulen beim Scrollen), Lade-Verhalten, Verhalten mobil (oft Poster statt Video), Overlays und Text darüber.
- `reference.json → per_viewport.<vp>.sections[*].counts.video` und `.canvas` geben Hinweise; Dauer und Timing über Frames `(est.)`.

## Originalität

Videos, Bildsequenzen und Poster der Referenz werden nie übernommen. Quellen: Kunden-Material, selbst produziert oder gerendert, lizenzierter Stock. Für Bildsequenzen eigene Render-Frames (Blender, Spline, KeyShot) oder eigenes Footage.

## Blend-Plan-Zusätze

- Festlegen, was der Inhalt des Videos für den Kunden ist. Ohne passendes Material wird das Muster vereinfacht (z. B. Bildsequenz → Layer-Parallax mit Cutouts) und als Anpassung dokumentiert — nie ein Poster als «Video-Ersatz» verkaufen.
- Bildsequenzen sind Signature-Momente; Frame-Anzahl, Auflösung und Budget im Plan (Rezepte in `signature-animations`, Budgets in `animation-performance`).

## Build-Zusätze

- Autoplay nur `muted` + `playsinline`; `preload="metadata"`, Poster gesetzt; Video außerhalb des Viewports pausieren; mobil Poster oder kleinere Rendition.
- Scrub-Video: kurzes Keyframe-Intervall (transkodieren), sonst Bildsequenz mit Canvas; Frames vorladen, Zeichnen im `requestAnimationFrame`, keine Layout-Kopplung.

## Validierungs-Zusätze

- Video ist vorhanden, bewegt sich, sitzt richtig (Beschnitt, Maske, Responsive), Autoplay / Loop / Mute stimmen, Scroll-Kopplung ruckelfrei (FPS-Sample), mobiles Verhalten wie geplant.
- Poster-only oder eingefrorenes Video im Scope = `Fidelity Gap`.
