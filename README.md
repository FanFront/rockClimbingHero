# Rock Climbing Hero · ASCENT

**Android-only, offline-first pixel-art climbing coach RPG.**

Rock Climbing Hero turns real bouldering, training, and recovery reflections into
an expedition journal. Create your explorer, answer a five-question assessment,
record sessions, grow your skill tree, and compare progress over time.

## What works today
- Original pixel-aligned mountain art, hero sprite, map and UI icons (SVG).
- Android app with five screens: 营地 / 任务 / 角色 / 地图 / 记录 (Camp, Quests, Hero, Map, Journal).
- Character creator with self-assessment and repeat assessments.
- Five RPG attributes: PWR / TEC / END / MOB / MND.
- Skill tree with distinct practice-day tracking and self-attested demonstrations.
- Bouldering sends/attempts, V-grade logs, exercise and recovery journaling.
- Adventure XP with per-session caps, levels and deletion-safe recalculation.
- Personalized daily practice based on the weakest self-assessed attribute.
- Offline SQLite-backed persistent storage, no account required.
- Readiness/pain gate and intentionally conservative recovery recommendations.
- GitHub Actions validation workflow and optional manual Android APK build.

## Expedition UI iteration (2026-10-26)

- Default Simplified Chinese, with a persistent English setting.
- Interactive night camp, five-step assessment, hero tabs, original SVG skill icons,
  and a map unlocked by distinct logged days (including recovery).
- Quick logs show calculated XP, level, skill-day and route changes; optional fields
  and history are collapsed. Pain protections and schema-1 profiles are retained.
- Preferences are stored separately from existing profiles; no save migration is required.
- Verified: TypeScript, 5 existing domain tests, Android Metro/Hermes export.
- Not verified here: APK compilation, emulator/device launch, visual clipping and
  the full create → log → restart persistence walkthrough (no Android SDK/adb).

## Run on Android

Prerequisites: Node.js 22+, npm, Android emulator or physical Android phone.

```bash
npm install
npm run check
npx expo start --android
```

If using a device, Expo Go must support this Expo SDK version, or build a
development/release APK. See [Expo](https://docs.expo.dev/get-started/start-developing/).

## Build installable APK with GitHub Actions (no iOS)

Open **Actions → Build Android APK → Run workflow** and, when the job succeeds,
download the `rock-climbing-hero-android-apk` artifact. You can install its APK
on an Android phone after allowing installation from that source.

The release APK workflow compiles with the standard local Gradle signing
configuration. **This is for personal testing, not production Play Store release.**
For long-term updateable distribution, set up secure production signing and version
management. The workflow must pass before an artifact can be considered tested.

Optionally, you can use EAS with `eas build --platform android --profile preview`,
which requires an Expo account and EAS project configuration.

## Verification
```bash
npm run typecheck
npm test
npx expo install --check
```

## Development architecture

| Location | Purpose |
|---|---|
| `App.tsx` | Android screens and navigation |
| `src/domain.ts` | Pure XP, assessment, skill, quest and records logic |
| `src/storage.ts` | Persist the profile in local SQLite KV storage |
| `src/art.tsx` | Original pixel-art SVG assets |
| `src/theme.ts` | Expedition palette |
| `tests/` | Pure progression and safety rules |
| `docs/PRODUCT.md` | Scope, progression and product constraints |
| `docs/ART_DIRECTION.md` | Pixel-art identity and next sprite pass |

## Safety and limitations

XP is a game reward, not a measurement of strength, injury risk, or climbing
capability. Initial attributes reflect **self-reported confidence**.
Attestation is expressly *self-attested*, not certified by a coach.
The app makes no medical diagnoses. Consult a qualified clinician for
persistent pain or injury concerns.

MVP limitations: local-only data, V grades rather than universal gym-grade
mapping, no gym catalog, no automatic video coaching, no account sync/export yet.
Do not uninstall without a backup once export is implemented.

See [product specification](docs/PRODUCT.md) and
[pixel-art direction](docs/ART_DIRECTION.md).
