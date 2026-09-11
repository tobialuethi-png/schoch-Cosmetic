# Modul: WebGL / Canvas / 3D

Trigger: WebGL, Three.js/React Three Fiber, Canvas-Szenen, Shader-Effekte, 3D-Objekte, GLB/GLTF, Partikel-Felder, prozedurale Systeme, Bild-Distortion-Effekte, Flüssigkeits- oder Noise-Hintergründe.

## Analyse-Zusätze (Phase 1)

- Beobachten und protokollieren: Canvas-Platzierung (Fullscreen / in Section / hinter Text), Verhalten bei Scroll (Kamera, Objektbewegung, Fade), bei Maus (Parallax, Distortion, Cursor-Reaktion), bei Resize, Tonalität (Farben, Licht, Kontrast), Framing der Kamera, Geschwindigkeit, Loop vs. einmalig, Lade- und Fallback-Verhalten, Zusammenspiel mit HTML-Text.
- `reference.json → libs.canvas` liefert Anzahl und Größe der Canvas-Elemente und ob ein WebGL-Kontext erkannt wurde; `libs.three_global` und `script_name_hits` geben Hinweise auf die Technik. Alles Weitere ist Beobachtung — nicht zugängliche Details bleiben `Unknown`.
- Im Audit als eigene Zeilen: Trigger, Timing, Scroll-Kopplung, Opacity und Transforms des Canvas, Interaktionszustände, Verhalten mobil (oft reduziert oder statisch).

## Originalität

Shader, Szenen-Code, Modelle, Texturen, HDRIs und Post-Processing-Setups der Referenz werden nicht übernommen und nicht gelesen. Neu gebaut werden: eigene Szene mit eigenen oder lizenzierten Modellen und Texturen, eigene Shader, gleiche Wirkung — Kamera-Verhalten, Bewegungstempo, Interaktionslogik, Tonalität.

## Blend-Plan-Zusätze

- Ein WebGL-Moment zählt als Signature-Moment (maximal 1–2 pro Seite). Begründen, welchem Inhalt er dient.
- Machbarkeit klären, bevor er eingeplant wird: Assets vorhanden? Umfang (Partikel-Feld, Distortion-Shader, Produktszene)? Lite-Mode-Fallback (statisches Bild + CSS-Motion) definieren — die Seite muss ohne die Szene vollständig sein.
- Stack: Three.js (bei React: R3F) nur über dieses Modul; kein zusätzliches Framework ohne Bedarf.

## Build-Zusätze

- `animation-performance` gilt: DPR-Deckel, Render-Pause außerhalb des Viewports, Resize-Debounce, kein Render-Loop bei `prefers-reduced-motion`, Canvas-Größe an den Container gekoppelt.
- Szene in eigenem Layer nach Layer-Doktrin; HTML-Text bleibt HTML.
- Fortschrittsanzeige oder Preloader nur, wenn die Ladezeit ihn erfordert; dann terminaler Zustand garantiert (Timeout-Fallback).

## Validierungs-Zusätze

- Szene rendert, bewegt sich, reagiert (Scroll/Maus), resized korrekt, liegt richtig geschichtet und erreicht den terminalen Zustand (kein hängender Loader).
- FPS-Sample in der Section; Lite-Mode-Pfad getestet (Software-Rendering simulieren oder Flag setzen).
- Ein statisches Bild ist nie «gleichwertig» zu einer interaktiven Szene — fehlt sie im Scope, ist es ein `Fidelity Gap` oder eine freigegebene Approximation.
