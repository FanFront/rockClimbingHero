# ASCENT — Pixel Art Direction

## Artistic pillars
- **Mountain adventure, not combat**: climbing is an expedition, not a boss battle.
- **Cinematic pixel scenery**: snowy ridges, granite cliffs, pine forests, quiet lakes,
  lantern-lit camps and warm sunrise, all with readable pixel-aligned silhouettes.
- **Calm RPG UI**: deep blue-green panels, brass/gold accents, simple carved frames,
  progression bars and explorer badges.
- **Legible on small screens**: scenery is atmospheric; all input controls and
  paragraphs must remain high contrast and comfortably tappable.

## Palette
- Midnight: `#0A1720`
- Navy panel: `#102A35`
- Ridge teal: `#16333F`
- Explorer gold: `#F5BE6B`
- Cream text: `#F7E7C8`
- Mountain mint: `#68D4B5`
- Lake blue: `#6CAFDA`

## Asset decisions
- Original, project-owned scalable art uses a pixel-aligned `react-native-svg` scene:
  `MountainVista`, `HeroSprite`, `PixelGlyph`, and `PixelMap`.
- These are actual runtime assets, not screenshots presented as functionality.
- Story illustrations and pixel-art mockups are references, not 1:1 UI exports.
  Never embed text-only screenshots as interactive app controls.
- Next asset pass: draw a cohesive sprite sheet at a constrained pixel grid
  (e.g. 48×64 characters, 16×16 icons, 320×180 scenes) and scale with nearest
  neighbor. Prepare light/dark variants and art attribution.

## Art backlog
1. 4 customizable protagonist silhouettes and clothing layers.
2. 16 movement mastery icons and 10 expedition achievements.
3. Three panorama locations representing progress, not session intensity.
4. Quest stamps, journaling parchment details, micro animation frames.
5. Android adaptive launcher icon and splash assets from original pixel design.
