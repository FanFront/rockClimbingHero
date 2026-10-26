# Climb notebooks: one experiment, a result, then a better next question

## Product intent

During-climbing support comes first. The notebook earns its place through a
persistent, user-confirmed climb identity, fast offline outcome recording and
context that carries into the next request. A generic photo question alone is
not the product advantage. After climbing, the same records support a review of
today on that climb. This is not a cross-route training diagnosis or a claim of
superior model intelligence.

## Actual flow

1. Camp → Continue climbing / route notebook. Choose an existing climb or name a
   new one and an optional movement goal. Route identity is manual; the app never
   assumes two red routes are the same. The active notebook survives restart.
2. Record “Stuck here” and an optional observation without internet or a key.
   Add a route photo or attempt video when requesting help.
3. Ask for one next experiment. The provider receives a previewable snapshot of
   this climb’s goal, recent attempts, previous advice, reported outcomes and any
   explicitly selected training session. Current pain flags are included.
4. The saved suggestion appears before the request form. Record Helped / No
   change / Not tried / Sent / Pain with an optional note. Feedback displays the
   advice it references. These are user reports, not measured improvement or XP.
5. Open a follow-up to correct the interpretation or ask for the next experiment.
   Prior advice and outcomes are included so the model can revise its suggestion.
6. After climbing, select Today’s review. It includes only today’s attempt and
   feedback records on this climb, and advice referenced by those records. The
   prompt asks for evidence-based reflection and one future focus, not more load.

The model is asked for a brief observation, exactly one tentative experiment and
an observable check afterward. Ambiguous holds should trigger a clarification.
Pain reports should trigger stopping painful movement rather than another climb.
These are prompt requirements, not a guarantee of model compliance or safety.

## Context and ownership

Context is limited to the last 12 attempt/feedback records and 4 relevant advice
entries. Preview metadata reports included/total counts and whether truncated.
The full local notebook is not truncated or auto-expired. Today's review uses the
phone's local day; it does not imply a complete session summary beyond the selected
climb and included records. “Not tried” is feedback, not a performed attempt.

The latest image on the selected climb can be carried forward; the user can
exclude it or replace it. Each sent entry owns its media copy. Original images
in the gallery remain untouched. Video audio is not analyzed. New requests save
a context snapshot before submission. Retry uses the same snapshot and history
entry rather than silently changing its evidence. There are no automatic paid
calls after recording outcomes.

Deleting one advice entry removes its media and its automatically copied advice
from later request snapshots. User-authored observations and other generated
responses remain their own records. Deleting the whole notebook removes its
attempts, advice and owned media. Original training sessions, XP and profile data
remain unchanged. Deleting a training session does not delete notebook snapshots.
Old standalone analyses remain under Earlier unfiled analyses and can be manually
filed under the selected climb or deleted. Existing key profiles remain available.

## Providers and keys

Named Qwen/DeepSeek profiles can be added, switched, replaced and removed in
Settings → Climbing coach, or the notebook's secondary Coach settings entry.
SecureStore holds secrets using Android Keystore; SQLite holds only profile
metadata and the active profile ID. Removing a key preserves notebooks/history.
Only explicit advice/review/retry sends selected content directly to official
HTTPS provider endpoints. There is no project relay or public media hosting.
Provider usage charges and retention policies apply; local deletion does not
claim to delete provider-side copies. App uninstall/device loss removes local
history; notebooks are not a backup service.

- Qwen (`qwen3-vl-plus` default): text, photos and MP4 visual analysis.
- DeepSeek (`deepseek-flash` default): text and photos. Video requests clearly
  require Qwen; media is never silently dropped.
- Qwen endpoint must match the account's region/workspace; model is editable for
  account availability. JPEG, PNG, WebP and MP4 are limited to 12 MiB per request,
  one attachment. Camera permission is requested on demand; no microphone access.
- Request timeout is 90 seconds. Failed/interrupted entries remain for manual
  retry. Local history and outcome recording remain usable offline.

Provider sources verified 2026-10-26:
https://www.alibabacloud.com/help/en/model-studio/vision
https://api-docs.deepseek.com/guides/vision/

## Verification and limits

- `npm run check`: TypeScript and all 16 tests pass, including context isolation,
  feedback continuity, local-day review scope, truncation reporting, idempotent
  outcomes and deletion of copied advice context, plus existing progression/API
  checks. Final presentation changes also passed TypeScript.
- Browser at 360×800: create notebook; record an offline sticking point before
  any API call; get a simulated cue; report No change and a route correction;
  verify the next payload includes the cue and feedback, excludes unfiled old
  analysis; request today's review; reload and find the notebook, outcomes and
  earlier analyses. Screenshot: `evidence/climb-next-step-web-preview.png`.
- Browser native storage, secure keys, media and provider responses were
  substituted. The displayed alternative cue is scripted demonstration data,
  not proof that a live model followed the correction.
- Real-provider quality, native camera/video/Keystore, touch and keyboard behavior,
  and Android persistence through process death still require device validation.
  No Android screenshot or device recording is claimed.

Acceptance should focus on whether users can record a result quickly, understand
what to try, correct the assistant without re-explaining the climb, and find a
useful review afterward. User preference and live advice quality remain open.

## Installable version

Android release build succeeded on app source `f043233`:
https://github.com/FanFront/rockClimbingHero/actions/runs/40294722865

ARM64 APK download:
https://github.com/FanFront/rockClimbingHero/actions/runs/40294722865/artifacts/12637833998

Later commits change only documentation/screenshots. Artifact downloads require
repository access and follow GitHub retention limits. Device validation and live
provider evaluation remain outstanding as described above.
