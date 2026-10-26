# ASCENT — Expedition RPG Climbing Coach

## Vision
An offline-first Android climbing journal and coach that turns repeatable real-world
progress into an adventurous pixel-art RPG. Users create an explorer with an initial
five-question self-assessment, train in real life, record sessions, and review growth.

## Progression contract
- **Adventure XP** is earned from completed, recorded activities; it is capped per log.
- **Attribute ratings** are periodic self-reported confidence scores (1–5). They do
  not automatically increase when earning XP.
- **Skill mastery** begins with real practice logged on distinct calendar days.
  After 3 days, a skill can be marked *self-attested* with a written demonstration.
  This is never advertised as third-party-verified technical mastery.
- **Personal records** reflect actual logged successes (e.g. best V grade only when
  sends > 0). No grade is inferred from mere attempts.
- **Readiness** is an ephemeral check-in, not a permanent character attribute.
- Recovery is encouraged and small amounts of adventure XP may be earned for
  appropriate recorded rest/reflection. Pain-associated sessions give no XP and
  do not increase skill progress.

## MVP Screens
1. **Camp**: expedition artwork, level, XP, readiness and daily training focus.
2. **Quests**: rules-based quest generated from the lowest self-assessed attribute.
3. **Hero**: explorer art, XP meter, attributes, skill cards, self-attestation.
4. **Stats**: weekly history, grade record, attribute re-assessment differences.
5. **Journal**: bouldering and other exercise logging with offline SQLite storage.

## Follow-on milestones
- User-controlled data export and import; protected migration versions.
- Full evidence event ledger and undoable assessment and attestation history.
- Photo/video clips and comparisons without unsafe automatic motion diagnoses.
- Repeatable skill demonstrations written with professional coach review.
- Physiologically informed training recommendations validated by qualified experts.
- Optional sync and backup; privacy-first by default.
- Pixel art character customization, seasonal scenes and unique equipment cosmetics.

## Coaching safety
This is NOT medical advice or diagnostic software. Never infer safe loading from a
gamified meter. Prevent the coach from prescribing escalating stress when pain is
reported. Training plans are suggestions and should be adapted to the user.
