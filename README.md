# Rock Climbing Hero · ASCENT

**Android-only, offline-first pixel-art climbing coach RPG.**

Rock Climbing Hero turns real bouldering, training, and recovery reflections into
an expedition journal. Create your explorer, answer a five-question assessment,
record sessions, grow your skill tree, and compare progress over time.

## What works today
- Original pixel-aligned mountain art, hero sprite, map and UI icons (SVG).
- Android portrait app: interactive pixel Camp, Quests, Hero, Map and quick Journal.
- Simplified Chinese by default; persistent English switch in Settings.
- Five-step assessment, character tabs, skill detail sheets and short quest instructions.
- Map locations unlock from distinct pain-free training days; XP/skill/level feedback uses actual logs.
- Character creator with self-assessment and repeat assessments.
- Five RPG attributes: PWR / TEC / END / MOB / MND.
- Skill tree with distinct practice-day tracking and self-attested demonstrations.
- Bouldering sends/attempts, V-grade logs, exercise and recovery journaling.
- Adventure XP with per-session caps, levels and deletion-safe recalculation.
- Personalized daily practice based on the weakest self-assessed attribute.
- Offline SQLite-backed persistent storage, no account required.
- Readiness/pain gate and intentionally conservative recovery recommendations.
- GitHub Actions validation workflow and optional manual Android APK build.

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

### Android 原媒体与随机委托

`npm run android` 会生成并运行包含 `modules/trail-media` 的 Android 构建（Expo Go 不含此原生模块）。线路图鉴通过系统 `ACTION_OPEN_DOCUMENT` 多选图片/视频，持久化读取授权，只存 `content://` 引用；点击打开由系统查看器播放，引用失效可解除并重选。

日/周委托按本地日历生成并写入原有 schema 1 存档的可选字段；接取后的真实记录自动结算。成长为游戏数值，自评保持独立。奖励账本可从来源重新核算，删除或更正记录会撤回奖励。新训练每天最多 120 会话 XP，旧记录 XP 保留；委托奖励受固定周期任务数量限制。首次添加独立线路后，该会话的线路任务与最佳完攀以独立线路为准，请补齐真实线路。
