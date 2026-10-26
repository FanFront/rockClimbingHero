import type {
  AppData,
  Attribute,
  Activity,
  SkillId,
  ClimbStyle,
} from "./domain";
export type MediaRef = { uri: string; type: string; name: string };
export type Route = {
  id: string;
  sessionId: string;
  name: string;
  area: string;
  grade: string;
  style: ClimbStyle;
  sends: number;
  attempts: number;
  date: string;
  notes: string;
  media: MediaRef[];
};
type Reward = { xp: number; growth: Partial<Record<Attribute, number>> };
type Template = {
  id: string;
  title: [string, string];
  goal: [string, string];
  activity: Activity;
  skill?: SkillId;
  style?: ClimbStyle;
  route?: boolean;
  target: number;
  reward: Reward;
};
export const TEMPLATES: Template[] = [
  {
    id: "feet",
    title: ["无声足迹", "Silent steps"],
    goal: ["练习静音落脚 15 分钟", "Practice quiet feet for 15 minutes"],
    activity: "bouldering",
    skill: "quiet-feet",
    target: 15,
    reward: { xp: 25, growth: { TEC: 12 } },
  },
  {
    id: "flag",
    title: ["林间平衡", "Forest balance"],
    goal: ["练习侧旗 15 分钟", "Practice flagging for 15 minutes"],
    activity: "bouldering",
    skill: "flagging",
    target: 15,
    reward: { xp: 25, growth: { TEC: 12 } },
  },
  {
    id: "hips",
    title: ["转身过隘", "Turn through the pass"],
    goal: ["练习转髋 15 分钟", "Practice hip control for 15 minutes"],
    activity: "bouldering",
    skill: "hip-control",
    target: 15,
    reward: { xp: 25, growth: { TEC: 10, MOB: 4 } },
  },
  {
    id: "read",
    title: ["岩壁密码", "Crag cipher"],
    goal: ["练习路线预读 15 分钟", "Practice route reading for 15 minutes"],
    activity: "bouldering",
    skill: "route-reading",
    target: 15,
    reward: { xp: 25, growth: { MND: 12 } },
  },
  {
    id: "project",
    title: ["拆解迷局", "Unravel the puzzle"],
    goal: ["练习难点拆解 15 分钟", "Practice projecting for 15 minutes"],
    activity: "bouldering",
    skill: "projecting",
    target: 15,
    reward: { xp: 25, growth: { MND: 10, TEC: 4 } },
  },
  {
    id: "slab",
    title: ["斜坡信使", "Slab messenger"],
    goal: ["完攀舒适难度斜板线路", "Send comfortable slab routes"],
    activity: "bouldering",
    route: true,
    style: "Slab",
    target: 1,
    reward: { xp: 30, growth: { TEC: 12, MND: 4 } },
  },
  {
    id: "wall",
    title: ["直壁巡游", "Vertical patrol"],
    goal: ["完攀舒适难度直壁线路", "Send comfortable vertical routes"],
    activity: "bouldering",
    route: true,
    style: "Vertical",
    target: 1,
    reward: { xp: 30, growth: { END: 10, TEC: 6 } },
  },
  {
    id: "overhang",
    title: ["岩棚探路", "Roof scout"],
    goal: ["完攀舒适难度仰角线路", "Send comfortable overhang routes"],
    activity: "bouldering",
    route: true,
    style: "Overhang",
    target: 1,
    reward: { xp: 30, growth: { PWR: 10, TEC: 6 } },
  },
  {
    id: "strength",
    title: ["稳固行囊", "Steady pack"],
    goal: [
      "舒适力量训练 15 分钟",
      "Comfortable strength practice for 15 minutes",
    ],
    activity: "strength",
    target: 15,
    reward: { xp: 25, growth: { PWR: 12 } },
  },
  {
    id: "stretch",
    title: ["松林舒展", "Pine stretch"],
    goal: ["温和灵活性练习 10 分钟", "Gentle mobility for 10 minutes"],
    activity: "mobility",
    target: 10,
    reward: { xp: 18, growth: { MOB: 8 } },
  },
  {
    id: "rest",
    title: ["篝火守望", "Fire watch"],
    goal: [
      "记录休息或不加重症状的恢复 5 分钟",
      "Record 5 minutes of rest or non-aggravating recovery",
    ],
    activity: "recovery",
    target: 5,
    reward: { xp: 8, growth: {} },
  },
];
export type Commission = {
  id: string;
  template: string;
  period: "day" | "week";
  start: string;
  end: string;
  acceptedAt?: string;
  target: number;
  maxGrade: number;
  story: number;
  reward: Reward;
};
export type Ledger = {
  id: string;
  xp: number;
  growth: Partial<Record<Attribute, number>>;
  sources: string[];
};
export function localDay(date: Date | string = new Date()): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function boundary(date: Date, days: number) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
function seed(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
export const templateOf = (q: Commission) =>
  TEMPLATES.find((t) => t.id === q.template)!;
export function ensureCommissions(
  p: AppData,
  readiness: string,
  now = new Date(),
): AppData {
  const quests = [...(p.commissions || [])];
  let changed = false;
  const week = new Date(now);
  week.setDate(week.getDate() - ((week.getDay() + 6) % 7));
  const recent = p.sessions.filter(
    (s) => new Date(s.date).getTime() > now.getTime() - 3 * 86400000,
  );
  const safe =
    readiness === "pain" ||
    readiness === "tired" ||
    recent.some((s) => s.pain) ||
    new Set(
      recent
        .filter((s) => s.activity !== "recovery")
        .map((s) => localDay(s.date)),
    ).size >= 3;
  const completedGrades = p.sessions
    .filter(
      (s) => !s.pain && s.sends > 0 && !p.detailedRouteSessions?.includes(s.id),
    )
    .map((s) => /^V(\d{1,2})$/i.exec(s.grade)?.[1])
    .filter(Boolean)
    .map(Number);
  const routeGrades = (p.routes || [])
    .filter(
      (r) => r.sends > 0 && !p.sessions.find((s) => s.id === r.sessionId)?.pain,
    )
    .map((r) => /^V(\d{1,2})$/i.exec(r.grade)?.[1])
    .filter(Boolean)
    .map(Number);
  const maxGrade = Math.max(
    0,
    Math.max(0, ...completedGrades, ...routeGrades) - 1,
  );
  for (const period of ["day", "week"] as const) {
    const anchor = period === "day" ? now : week;
    const key = `${period}-${localDay(anchor)}`;
    if (quests.some((q) => q.id.startsWith(key + ":"))) continue;
    const previous = quests
      .filter((q) => q.period === period)
      .slice(-4)
      .map((q) => q.template);
    const hash = seed(key + p.createdAt);
    const pool = TEMPLATES.filter(
      (t) => t.activity !== "recovery" && (!safe || t.activity === "mobility"),
    );
    const lastStyle = p.routes?.find((r) => r.sends > 0)?.style;
    pool.sort(
      (a, b) =>
        Number(
          previous.includes(a.id) || (!!a.style && a.style === lastStyle),
        ) -
          Number(
            previous.includes(b.id) || (!!b.style && b.style === lastStyle),
          ) || seed(key + a.id + hash) - seed(key + b.id + hash),
    );
    // Always offer rest; no streak or penalty is tied to taking a training commission.
    const chosen = [
      ...pool.slice(0, period === "day" ? 3 : 2),
      TEMPLATES[TEMPLATES.length - 1],
    ];
    chosen.forEach((t, i) =>
      quests.push({
        id: `${key}:${t.id}`,
        template: t.id,
        period,
        start: boundary(anchor, 0),
        end: boundary(anchor, period === "day" ? 1 : 7),
        target: t.target * (period === "week" ? 3 : 1),
        maxGrade,
        story: (hash + i) % 3,
        reward:
          period === "week"
            ? {
                xp: t.activity === "recovery" ? 16 : 70,
                growth: Object.fromEntries(
                  Object.entries(t.reward.growth).map(([a, n]) => [a, n! * 2]),
                ),
              }
            : t.reward,
      }),
    );
    changed = true;
  }
  return changed
    ? {
        ...p,
        rewardCapFrom: p.rewardCapFrom || now.toISOString(),
        commissions: quests,
      }
    : p;
}
export function commissionProgress(
  p: AppData,
  q: Commission,
): { value: number; sources: string[] } {
  if (!q.acceptedAt) return { value: 0, sources: [] };
  const t = templateOf(q);
  const start = Math.max(Date.parse(q.start), Date.parse(q.acceptedAt));
  const sessions = p.sessions.filter(
    (s) =>
      (!s.pain || s.activity === "recovery") &&
      Date.parse(s.date) >= start &&
      s.date < q.end &&
      s.activity === t.activity &&
      (!t.skill || s.skill === t.skill),
  );
  const sources: string[] = [];
  let value = 0;
  if (t.route) {
    for (const s of sessions) {
      const routes = (p.routes || []).filter((r) => r.sessionId === s.id);
      if (routes.length || p.detailedRouteSessions?.includes(s.id)) {
        for (const r of routes) {
          const g = /^V(\d{1,2})$/i.exec(r.grade);
          if (
            r.sends > 0 &&
            r.style === t.style &&
            g &&
            Number(g[1]) <= q.maxGrade &&
            Date.parse(r.date) >= start &&
            r.date < q.end
          ) {
            value += r.sends;
            sources.push("route:" + r.id);
          }
        }
      } else {
        const g = /^V(\d{1,2})$/i.exec(s.grade);
        if (
          s.sends > 0 &&
          s.style === t.style &&
          g &&
          Number(g[1]) <= q.maxGrade
        ) {
          value += s.sends;
          sources.push("session:" + s.id);
        }
      }
    }
  } else {
    const days = new Map<string, number>();
    for (const s of sessions) {
      const day = localDay(s.date);
      const remaining = Math.max(0, 60 - (days.get(day) || 0));
      const n = Math.min(remaining, s.duration);
      if (n > 0) {
        value += n;
        days.set(day, (days.get(day) || 0) + n);
        sources.push("session:" + s.id);
      }
    }
  }
  return { value: Math.min(q.target, value), sources };
}
export function settle(p: AppData): AppData {
  const ledger: Ledger[] = [];
  for (const q of p.commissions || []) {
    const progress = commissionProgress(p, q);
    if (progress.value < q.target) continue;
    ledger.push({ id: q.id, ...q.reward, sources: progress.sources });
  }
  return { ...p, questLedger: ledger };
}
export function questXP(p: AppData) {
  return (p.questLedger || []).reduce((n, r) => n + r.xp, 0);
}
export function growth(p: AppData, a: Attribute) {
  const n = (p.questLedger || []).reduce(
    (sum, r) => sum + (r.growth[a] || 0),
    0,
  );
  return { points: Math.floor(n / 100), progress: n % 100 };
}
export function story(q: Commission, en: boolean) {
  const n = seed(q.id);
  const actor = (
    en
      ? ["The old guide", "A forest scout", "The camp keeper"]
      : ["老向导", "松林巡山人", "营地守望者"]
  )[n % 3];
  const location = (
    en
      ? ["at Pinefire camp", "by Echo crag", "near the forest trail"]
      : ["在松火营地", "在回声岩壁旁", "在林间小径边"]
  )[Math.floor(n / 3) % 3];
  return en
    ? `${actor} ${location} left a note: “${templateOf(q).title[1]}”. Explore at your own pace.`
    : `${actor}${location}留下便笺：「${templateOf(q).title[0]}」。按自己的节奏出发。`;
}
export function rewardLabel(q: Commission, label: (a: Attribute) => string) {
  return (
    `+${q.reward.xp} XP` +
    Object.entries(q.reward.growth)
      .map(([a, n]) => ` · ${label(a as Attribute)} +${n}/100`)
      .join("")
  );
}
