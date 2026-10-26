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

## Morning valley experience (2026-10-26)

The user selected **morning rock valley**. Three lightweight runtime scene
variants share `CampScene` and the real `CampHome` controls:

| Direction | Mood | Readability | Cost |
| --- | --- | --- | --- |
| Morning valley (selected) | Clear air, pale granite, quiet anticipation | Dark UI frames bright scenery; no text on busy terrain | One shared scene, morning sky palette |
| Warm dusk camp | Intimate, lantern-led return | Warm focal point, dark silhouettes | Shared geometry and alternate sky |
| Night expedition | Still, solitary, moonlit | Highest scenery/UI contrast, less landscape detail | Shared geometry and alternate sky |

Current-screen audit: many chest-shaped hotspots and three same-sized NPCs
compete with the explorer and fire; small floating labels clutter the landscape.
XP, readiness and commissions dominate the framing. The journal asks for counts
before offering reflection. The previous reward sheet opens before SQLite confirms
persistence. These are specific composition and interaction problems, beyond color.

The new first screen uses one landscape, one main action, and one journal memory.
Legacy companions, collection and stories remain under a labeled secondary entry.
Scene: 180×190 integer grid, rear ridge / pine valley / foreground camp layers.
Explorer: 16×30 including shadow, located beside the fire at ground level. Props
use the same grid. UI is native text and controls outside the artwork. Avoid emoji
for assets. The lantern and fire are the only warm highlights against morning
stone and pine. Fire opacity changes over 1.7–2.1 seconds; no strobe or large
continuous movement. Reduced motion disables the loop. Important controls have
48dp minimum targets. Chinese body copy uses system sans, 15–16sp and generous
line height; letter spacing is reserved for short location labels.

Sound starts muted (explicitly enabled in Settings), mixes rather than ducks
personal music, and pauses on background or leaving camp. Completion uses a
save cue, one success haptic, then a short arrival cadence. Preferences persist
separately from profile data. OS reduced-motion preference is always respected.
