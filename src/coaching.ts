import type { AIEntry } from "./ai";
export type AttemptOutcome =
  "helped" | "same" | "not-tried" | "sent" | "pain" | "stuck";
export type ClimbAttempt = {
  id: string;
  date: string;
  outcome: AttemptOutcome;
  note: string;
  adviceId?: string;
  sessionId?: string;
};
export type ClimbProject = {
  id: string;
  name: string;
  goal: string;
  createdAt: string;
  attempts: ClimbAttempt[];
};
export function coachingContext(
  project: ClimbProject,
  entries: AIEntry[],
  review = false,
  now = new Date(),
): string {
  const day = (date: string) => new Date(date).toDateString();
  const inScope = project.attempts.filter(
    (a) => !review || day(a.date) === day(now.toISOString()),
  );
  const attempts = inScope.slice(-12);
  const ids = new Set(attempts.map((a) => a.adviceId).filter(Boolean));
  const advice = entries
    .filter(
      (e) =>
        e.climbId === project.id &&
        e.status === "complete" &&
        (!review || ids.has(e.id)),
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-4);
  return JSON.stringify(
    {
      climb: project.name,
      goal: project.goal,
      scope: review ? "today on this climb" : "this climb, recent history",
      recordedAttempts: attempts,
      recordsInScope: inScope.length,
      recordsIncluded: attempts.length,
      truncated: inScope.length > attempts.length,
      previousAdvice: advice.map((e) => ({
        id: e.id,
        question: e.question.slice(0, 1000),
        answer: e.answer?.slice(0, 2000),
      })),
      limits:
        "Outcomes are user reports, not proof that advice caused improvement. Do not infer unrecorded attempts or compare unrelated routes.",
    },
    null,
    2,
  );
}
export function addAttempt(
  project: ClimbProject,
  attempt: ClimbAttempt,
): ClimbProject {
  return project.attempts.some((a) => a.id === attempt.id)
    ? project
    : { ...project, attempts: [...project.attempts, attempt] };
}

// Remove copied advice from later request snapshots when its source is deleted.
export function withoutAdvice(
  context: string | undefined,
  id: string,
): string | undefined {
  if (!context) return context;
  const marker = "\nCurrent pain/readiness report:";
  const at = context.indexOf(marker),
    body = at < 0 ? context : context.slice(0, at),
    suffix = at < 0 ? "" : context.slice(at);
  try {
    const parsed = JSON.parse(body);
    if (!Array.isArray(parsed.previousAdvice)) return context;
    parsed.previousAdvice = parsed.previousAdvice.filter(
      (e: { id: string }) => e.id !== id,
    );
    return JSON.stringify(parsed, null, 2) + suffix;
  } catch {
    return context;
  }
}
