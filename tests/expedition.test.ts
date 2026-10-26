import test from "node:test";
import assert from "node:assert/strict";
import {
  createProfile,
  DEFAULT_RATINGS,
  logSession,
  deleteSession,
  totalXP,
  type Session,
} from "../src/domain";
import {
  ensureCommissions,
  settle,
  commissionProgress,
  growth,
  type Commission,
} from "../src/expedition";
const now = new Date(2026, 9, 26, 10);
const profile = () =>
  ensureCommissions(
    createProfile("旅人", DEFAULT_RATINGS, now.toISOString()),
    "normal",
    now,
  );
const session = (id: string): Session => ({
  id,
  date: new Date(2026, 9, 26, 11).toISOString(),
  activity: "bouldering",
  duration: 20,
  effort: 2,
  attempts: 2,
  sends: 1,
  grade: "V0",
  style: "Slab",
  skill: "quiet-feet",
  notes: "",
  pain: false,
});
const quest: Commission = {
  id: "day-feet",
  template: "feet",
  period: "day",
  start: new Date(2026, 9, 26).toISOString(),
  end: new Date(2026, 9, 27).toISOString(),
  acceptedAt: now.toISOString(),
  target: 15,
  maxGrade: 0,
  story: 0,
  reward: { xp: 25, growth: { TEC: 112 } },
};
test("local daily/weekly commissions survive serialization and regeneration", () => {
  const p = profile();
  assert.equal(p.commissions?.length, 7);
  assert.deepEqual(
    ensureCommissions(JSON.parse(JSON.stringify(p)), "normal", now).commissions,
    p.commissions,
  );
  assert.equal(
    new Date(p.commissions!.find((q) => q.period === "week")!.start).getDay(),
    1,
  );
});
test("settlement is idempotent; growth carries; deletion and correction revoke rewards", () => {
  const p = { ...profile(), commissions: [quest] };
  const saved = logSession(p, session("s1"));
  assert.equal(saved.questLedger?.length, 1);
  assert.deepEqual(growth(saved, "TEC"), { points: 1, progress: 12 });
  const reboot = settle(JSON.parse(JSON.stringify(saved)));
  assert.equal(totalXP(reboot), totalXP(saved));
  assert.equal(totalXP(logSession(saved, session("s1"))), totalXP(saved));
  const corrected = settle({
    ...saved,
    sessions: [{ ...session("s1"), pain: true }],
  });
  assert.equal(corrected.questLedger?.length, 0);
  assert.equal(totalXP(corrected), 0);
  const removed = deleteSession(saved, "s1");
  assert.equal(removed.questLedger?.length, 0);
  assert.deepEqual(growth(removed, "TEC"), { points: 0, progress: 0 });
});
test("route attempts do not settle sends; detailed route deletion never resurrects aggregates", () => {
  const q = { ...quest, template: "slab", target: 1 };
  let p = {
    ...profile(),
    commissions: [q],
    sessions: [session("s")],
    detailedRouteSessions: ["s"],
  };
  const route = {
    id: "r",
    sessionId: "s",
    name: "",
    area: "",
    grade: "V0",
    style: "Slab" as const,
    sends: 0,
    attempts: 1,
    date: session("s").date,
    notes: "",
    media: [],
  };
  assert.equal(commissionProgress({ ...p, routes: [route] }, q).value, 0);
  assert.equal(
    commissionProgress({ ...p, routes: [{ ...route, sends: 1 }] }, q).value,
    1,
  );
  assert.equal(commissionProgress({ ...p, routes: [] }, q).value, 0);
  assert.equal(
    commissionProgress(
      { ...p, routes: [{ ...route, sends: 1, grade: "V1" }] },
      q,
    ).value,
    0,
  );
});
