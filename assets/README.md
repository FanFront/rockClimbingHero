# Runtime assets and license

All new assets in this change are original project contributions, licensed under
CC0-1.0 (public domain dedication). No reference-game assets are included.

- `src/CampScene.tsx`: original pixel-grid valley, explorer, tent, lantern and journal.
  180 × 190 scene grid; integer-aligned rectilinear silhouettes, a single consistent
  world scale. Drawn as runtime SVG, never an image of interactive UI.
- `audio/camp.wav`: original synthesized low wind; 12-second soft-edged loop.
- `audio/confirm.wav`: original short pitched confirmation.
- `audio/saved.wav`: original three-note save acknowledgement.
- `audio/arrival.wav`: original four-note completion cadence.

Audio generation source: `scripts/generate_audio.py` (Python standard library,
fixed random seed, mono PCM 22,050 Hz). All files ship in the offline JS bundle.
System sans-serif is used for readable Chinese; no redistributed font files.
