# On-device AI climbing advice

## User flows

- Camp → AI route advice: take a photo or choose one and ask about a route/color.
- Journal → AI attempt review: record text, add a photo or short MP4. Each saved
  session also has an analysis action that pre-fills duration, grade, style,
  attempts, sends, effort, pain and notes. This is a snapshot; later session edits
  do not rewrite the analysis. Deleting a session does not delete AI history.
- Both flows persist the question, media copy, provider/model, date, status and
  response locally, independently of progression. History is readable offline.
  It is not auto-expired or capped. Delete analysis removes the local question,
  answer and owned media copy; gallery originals remain.

## Keys, endpoints and sending

Add named Qwen/DeepSeek profiles in **API keys & providers**; tap a saved profile
to switch. Keys can be replaced or removed. Removal leaves history intact. Keys
are stored with expo-secure-store (Android Keystore backed); SQLite contains only
profile names, provider/model/endpoint metadata and the active profile ID.
Keys never enter the coaching prompt, history or logs. Do not paste keys in chat.

Only explicit Send/Retry sends content directly from the phone to the selected
provider via HTTPS. No project server, public media URL, or automatic analysis is
used. Provider usage charges and provider-side retention policies apply. Local
deletion does not claim to delete provider-side copies. There is no cloud sync.
App uninstall/device loss removes local history; this is not a backup system.

Official endpoints only; Qwen endpoint must match the key's region/workspace.
Default: China DashScope, `qwen3-vl-plus`. DeepSeek: `deepseek-flash`. Model field
is editable for account availability. Unknown or unauthorized models return an
error; media is never silently dropped or rerouted to another provider.

## Media support

| Provider | Text | Photo | MP4 video |
| --- | --- | --- | --- |
| Qwen vision model | yes | yes | yes, visual content only |
| DeepSeek Flash | yes | yes | no; choose Qwen |

Sources verified 2026-10-26:
- https://www.alibabacloud.com/help/en/model-studio/vision
- https://api-docs.deepseek.com/guides/vision/

Input supports JPEG, PNG, WebP and MP4 up to 12 MiB (one attachment per analysis).
Images and videos are copied from temporary picker URIs into the app's document
directory when the question is saved, before network submission. Video audio is
not analyzed. Saved video opens through Android's media viewer. Camera permission
is requested only when taking a photo; imported clips do not require recording
audio. The picker plugin disables microphone permission.

## Failure and persistence rules

Questions are saved before network requests. An in-flight guard prevents repeated
submissions. A 90-second timeout leaves the saved question/media available for
manual retry. There are no automatic paid retries. Interrupted pending entries
can be retried after restarting; retries update the same history entry using the
currently selected key/provider. History mutations are serialized and responses
only update existing entries, so deletion cannot resurrect a question. Deleting
analysis removes its owned media before the history row; deletion failures remain
visible/retryable. Original training data, rewards and language settings remain
unchanged. Advice does not award XP or infer physical capability scores.

## Validation

- `npm run check`: TypeScript plus all 11 tests pass, including official-endpoint
  restrictions, image/video request shapes, unsupported provider rejection,
  response parsing, auth/empty-response errors, and existing reward regressions.
- `npx expo install --check`: SDK-compatible versions.
- 360×800 browser interaction: add Qwen profile; send route question; persist the
  returned simulated answer; verify the ordinary profile index has no key value;
  reload and reopen question/answer; switch to DeepSeek; retain a failed request;
  retry without duplicate history; delete and reject late-response resurrection;
  remove a key while retaining history. Screenshot: `evidence/ai-route-web-preview.png`.
  Browser native storage, SecureStore, media and provider responses are substitutes.
- No live provider credentials were supplied. Real-provider inference, billing,
  native camera/media/Keystore, video payload acceptance and Android persistence
  through process death still need device validation. Do not interpret simulated
  responses as evidence of actual model quality.

## Android delivery

Release build succeeded on application source `012fd85`:
https://github.com/FanFront/rockClimbingHero/actions/runs/40290337449

ARM64 APK artifact:
https://github.com/FanFront/rockClimbingHero/actions/runs/40290337449/artifacts/12636682112

Later commits only add documentation/browser screenshots. Both the question form
and saved answer are pictured (`ai-route-web-preview.png`,
`ai-answer-web-preview.png`); responses in these browser previews are simulated.
Successful compilation does not replace the live-provider and Android device
checks listed above. GitHub artifact download requires repository access and is
subject to repository retention settings.
