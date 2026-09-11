# Modul: Audio

Trigger: Hintergrundmusik, Ambient, UI-Sounds (Hover / Click / Menü), scroll-gekoppeltes Audio, audio-reaktive Visuals, Web Audio API, Mute- und Volume-Controls.

## Analyse-Zusätze (Phase 1)

- Beobachten: Wann startet Audio (Autoplay-Sperre → erst nach Interaktion?), Mute-Control (Position, Zustand, Animation), welche Interaktionen Sounds auslösen, Synchronisation mit Motion, Verhalten mobil.
- Sound-Dateien der Referenz werden nicht heruntergeladen; Charakter beschreiben (kurz/lang, Klangfarbe, Lautstärke-Verhältnis).

## Originalität

Eigene oder lizenzierte Sounds (Sound-Design, Stock mit Lizenz). Kein Audio der Referenz.

## Blend-Plan-Zusätze

- Audio nur, wenn es der Rolle der Referenz und dem Kundeninhalt dient. Standard: aus, Opt-in über sichtbaren Control; nie Autoplay mit Ton.
- UI-Sounds: maximal ein kleines Set, konsistente Lautstärke, Sound-Tokens neben den Motion-Tokens.

## Build-Zusätze

- AudioContext erst nach User-Geste erzeugen; Zustand für die Session merken; Mute-Control barrierefrei; `prefers-reduced-motion` schaltet auch Audio-Reaktivität ab.

## Validierungs-Zusätze

- Start nur nach Interaktion, Mute/Unmute funktioniert, Sounds treffen die Trigger, keine Konsolenfehler durch AudioContext-Sperre, mobil geprüft. Nicht ausgelöste Zustände explizit nennen.
