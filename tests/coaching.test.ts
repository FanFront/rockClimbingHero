import test from "node:test";
import assert from "node:assert/strict";
import {
  addAttempt,
  coachingContext,
  withoutAdvice,
  type ClimbProject,
} from "../src/coaching";
import { requestBody, type AIEntry } from "../src/ai";
const p: ClimbProject = {
  id: "red-north",
  name: "North wall red V3",
  goal: "Reach after high step",
  createdAt: "2026-10-25T12:00:00Z",
  attempts: [
    {
      id: "yesterday",
      date: "2026-10-25T12:00:00Z",
      outcome: "stuck",
      note: "foot slipped",
    },
    {
      id: "today",
      date: "2026-10-26T12:00:00Z",
      outcome: "same",
      note: "higher foot did not help",
      adviceId: "cue",
    },
  ],
};
const e: AIEntry = {
  id: "cue",
  climbId: p.id,
  date: "2026-10-26T11:00:00Z",
  question: "next?",
  answer: "Try a higher foot",
  provider: "qwen",
  model: "qwen3-vl-plus",
  status: "complete",
  scene: "attempt",
};
test("continuation includes actual feedback and advice from only the selected climb", () => {
  const context = JSON.parse(
    coachingContext(p, [
      e,
      { ...e, id: "other", climbId: "blue", answer: "UNRELATED" },
    ]),
  );
  assert.equal(context.recordedAttempts[1].outcome, "same");
  assert.equal(context.previousAdvice[0].id, "cue");
  assert.ok(!JSON.stringify(context).includes("UNRELATED"));
});
test("today review excludes yesterday and exposes truncation rather than implying full history", () => {
  const context = JSON.parse(
    coachingContext(p, [e], true, new Date("2026-10-26T18:00:00Z")),
  );
  assert.deepEqual(
    context.recordedAttempts.map((a: any) => a.id),
    ["today"],
  );
  const long = {
    ...p,
    attempts: Array.from({ length: 20 }, (_, i) => ({
      ...p.attempts[1],
      id: String(i),
    })),
  };
  const limited = JSON.parse(coachingContext(long, [e]));
  assert.equal(limited.recordsIncluded, 12);
  assert.equal(limited.recordsInScope, 20);
  assert.equal(limited.truncated, true);
});
test("recording an outcome is idempotent and leaves the old project immutable", () => {
  const a = { ...p.attempts[0], id: "new" };
  const next = addAttempt(p, a);
  assert.equal(p.attempts.length, 2);
  assert.equal(next.attempts.length, 3);
  assert.equal(addAttempt(next, a), next);
});
test("next-attempt and review prompts carry a saved context snapshot and distinct task instructions", () => {
  const next = requestBody({
    ...e,
    intent: "next",
    context: coachingContext(p, [e]),
  });
  assert.match(JSON.stringify(next), /higher foot did not help/);
  assert.match(next.messages[0].content as string, /exactly one experiment/);
  const review = requestBody({
    ...e,
    intent: "review",
    context: coachingContext(p, [e], true),
  });
  assert.match(
    review.messages[0].content as string,
    /Review only the supplied records/,
  );
});

test("deleting advice removes copied source content from subsequent request snapshots", () => {
  const context =
    coachingContext(p, [e]) +
    "\nCurrent pain/readiness report: no current pain flag";
  const result = withoutAdvice(context, "cue")!;
  assert.ok(!result.includes("Try a higher foot"));
  assert.ok(result.includes("higher foot did not help"));
  assert.ok(result.endsWith("no current pain flag"));
});
