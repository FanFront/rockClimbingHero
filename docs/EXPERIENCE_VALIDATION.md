# Morning valley experience — delivery evidence

## Implemented scope

Selected direction: **morning rock valley**, requested by the user. Runtime
variants for dusk and night use the same scene geometry and native controls.
The selected camp introduces a clear recording action, one explorer/fire focal
point, and a journal memory derived from the latest real saved session. Existing
companions, collections, commissions, map, profile, assessments and route features
remain available. No profile schema or existing SQLite key was replaced.

Recording now offers duration and an optional note first; attempts, sends, grade,
effort, style and skills remain in expanded parameters. Pain protection remains.
New users can enter camp with baseline ratings and assess later. The submit action
has an immediate in-flight guard and a stable draft ID. It awaits SQLite before
showing completion, retains input on failure, and blocks navigation during the
write. Periodic commission maintenance pauses during that transaction.

Completion summarizes the saved session and the existing XP/commission result;
it does not grant its own rewards. A compact scene reaction, confirmation cue,
success haptic and short arrival cadence accompany the result. Returning or
opening the actual record is always available. Camp memories are derived from
sessions rather than a second collectible ledger, so edit/delete remain linked.

Offline WAV files are bundled. Audio starts muted; Settings can enable it and
persist both mute and reduced motion. OS reduced motion also disables camp
animation. A single owned player loops ambience only in camp; backgrounding
pauses all players, delayed cue starts recheck foreground/mute state, and unmount
removes players. Playback mixes with the user's music. No microphone permission
or background playback service is requested by the audio plugin.

## Verification performed

- `npm run check`: TypeScript and all 8 existing domain/expedition tests pass.
  These cover XP deletion, pain restrictions, recovery, settlement idempotence,
  corrections/revocations and detailed route reconciliation.
- `npx expo install --check`: dependencies match Expo SDK 57.
- Autolinking resolve: all native publications have a version after pinning
  `expo-asset` to SDK 57. The first Android build exposed an SDK 58 transitive
  asset dependency; the explicit dependency fixes that mismatch.
- Chromium at 360×800 rendered the actual React Native components using
  react-native-web. The full App was exercised with **substitutes for native
  SQLite, audio and haptics**. Checked: enter without completing assessment;
  failed save preserves note and writes no session; retry plus double-click
  creates exactly one session; reload retains the memory; recall opens the
  correct session. This is an interaction check, not native storage validation.

## Screenshots

All images in `evidence/` are **browser runtime previews, not Android captures**.
They are not embedded into the app as controls.

- `morning-web-preview.png`, `dusk-web-preview.png`, `night-web-preview.png`:
  three lightweight phone-proportioned candidates with real camp controls.
- `camp-web-runtime.png`: actual App after saving and reloading a session.
- `record-web-preview.png`: actual record form with optional reflection.
- `completion-web-preview.png`: actual completion modal after confirmed save.

## Still requires Android device validation

No Android SDK/emulator, `/dev/kvm`, or connected device is available in this
execution environment. No Android screenshots or motion-and-audio device recording
are claimed. The following remain unverified on a real device: small-screen font
rendering and touch, keyboard/insets, system back behavior, SQLite persistence
through process death, audio focus and system volume behavior, foreground/background
sound, haptic support and reduced-motion behavior. The browser test cannot establish
these properties. User enjoyment is also explicitly awaiting user feedback.

Device walkthrough: enable sound in Settings; record a real session with a note;
verify one completion, actual XP and a single haptic; return to camp and recall it;
force close/reopen; edit then delete the source and check the memory; switch language;
enable reduced motion; background/foreground repeatedly and verify one ambient
track with no background playback; repeat muted and while personal music plays.

## Successful Android build

- Release APK build completed successfully:
  https://github.com/FanFront/rockClimbingHero/actions/runs/40287577301
- Download artifact (contains the ARM64 release APK):
  https://github.com/FanFront/rockClimbingHero/actions/runs/40287577301/artifacts/12635390446
- Built application source: `17126da62c67ff4f8c26dd68beae257378ebba35`.
  Subsequent commits only add validation documentation and screenshots.
- PR automated validation passed on the documented source.

A successful compile is not device validation; the device checklist above remains
open. GitHub artifact downloads require repository access and expire according to
the repository's Actions artifact retention policy.
