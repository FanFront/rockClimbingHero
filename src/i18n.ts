import {
  ATTRIBUTE_LABELS,
  QUESTIONS,
  SKILLS,
  type Attribute,
  type SkillId,
  type Quest,
} from "./domain";
export type Language = "zh-CN" | "en";
const copy = {
  camp: ["营地", "Camp"],
  quests: ["任务", "Quests"],
  hero: ["角色", "Hero"],
  map: ["地图", "Map"],
  journal: ["记录", "Journal"],
  settings: ["设置", "Settings"],
  close: ["关闭", "Close"],
  next: ["下一题", "Next"],
  back: ["上一步", "Back"],
  create: ["启程", "Begin"],
  save: ["保存", "Save"],
  cancel: ["取消", "Cancel"],
  name: ["探险者名字", "Explorer name"],
  assessment: ["初始评估", "Assessment"],
  reassess: ["重新评估", "Reassess"],
  confidence: ["1 不熟悉 · 5 很有把握", "1 unsure · 5 confident"],
  disclaimer: [
    "属性来自自评，XP 是游戏奖励，不代表身体能力。",
    "Attributes are self-reported. XP is a game reward, not physical ability.",
  ],
  fresh: ["精力充沛", "Fresh"],
  normal: ["状态正常", "Normal"],
  tired: ["需要休息", "Tired"],
  pain: ["疼痛不适", "Pain"],
  safety: [
    "避免加重不适，持续疼痛请寻求专业评估。休息不会扣分。",
    "Avoid aggravating symptoms. Seek professional assessment for persistent pain. Rest has no penalty.",
  ],
  today: ["今日主任务", "Today’s quest"],
  alternatives: ["备选路线", "Other routes"],
  log: ["快速记录", "Quick log"],
  recordActual: ["记录已完成的活动", "Record completed activity"],
  minutes: ["时长（分钟）", "Minutes"],
  attempts: ["尝试次数", "Attempts"],
  sends: ["完攀次数", "Sends"],
  grade: ["抱石难度", "V grade"],
  more: ["更多参数", "More options"],
  notes: ["观察与备注", "Notes"],
  effort: ["主观用力", "Perceived effort"],
  skill: ["练习技能", "Practice skill"],
  none: ["无", "None"],
  painCheck: ["活动中有疼痛", "Pain during activity"],
  submit: ["保存记录", "Save session"],
  history: ["历史记录", "History"],
  empty: [
    "尚无记录，旅程从这里开始。",
    "No records yet. Your journey starts here.",
  ],
  delete: ["删除", "Delete"],
  deletePrompt: [
    "删除后重新计算 XP 和技能天数。",
    "XP and practice days will be recalculated.",
  ],
  attributes: ["属性", "Attributes"],
  skills: ["技能", "Skills"],
  outfit: ["装扮", "Outfit"],
  badges: ["成就", "Badges"],
  attest: ["自我证明", "Self-attestation"],
  attestHelp: [
    "练习满三个不同日期后，写下至少 10 字的自我证明；非教练认证。",
    "After three distinct practice days, describe your demonstration in at least 10 characters. Not coach-certified.",
  ],
  attested: ["已自我证明", "Self-attested"],
  practice: ["练习天数", "Practice days"],
  outfitText: ["松林行者 · 初始装束", "Pine explorer · Starter outfit"],
  earned: ["已解锁", "Unlocked"],
  locked: ["未解锁", "Locked"],
  days: ["记录天数", "Logged days"],
  sessions: ["训练记录", "Sessions"],
  best: ["最佳完攀", "Best send"],
  assessmentHistory: ["评估历史", "Assessment history"],
  reward: ["记录奖励", "Recorded reward"],
  levelUp: ["等级提升", "Level up"],
  nodeUnlock: ["新地点解锁", "New location unlocked"],
  saved: ["记录已保存", "Session saved"],
  storageError: [
    "无法读取本地存档，请重试。",
    "Unable to read local save. Please retry.",
  ],
  saveError: [
    "保存失败，当前更改尚未持久化，请重试。",
    "Save failed. Changes are not persisted. Please retry.",
  ],
  retry: ["重试", "Retry"],
  invalid: ["请检查输入", "Check input"],
  durationError: ["时长需为 5–240 分钟。", "Enter 5–240 minutes."],
  attemptError: [
    "尝试与完攀需为非负整数，完攀不能超过尝试。",
    "Use nonnegative whole counts; sends cannot exceed attempts.",
  ],
  gradeError: ["难度填写 V0–V99，或留空。", "Use V0–V99 or leave blank."],
  bouldering: ["抱石", "Bouldering"],
  strength: ["力量", "Strength"],
  mobility: ["灵活", "Mobility"],
  recovery: ["恢复", "Recovery"],
  Slab: ["斜板", "Slab"],
  Vertical: ["直壁", "Vertical"],
  Overhang: ["仰角", "Overhang"],
  Mixed: ["混合", "Mixed"],
  style: ["岩壁类型", "Wall style"],
  routeInfo: [
    "按真实无痛训练天数探索；恢复记录也会留在旅程里。",
    "Explore through real pain-free training days; recovery remains in your journal.",
  ],
  startLog: ["完成后记录", "Log when completed"],
  loading: ["正在打开营地…", "Opening camp…"],
  rest: ["休息也是旅程", "Rest is part of the journey"],
  proofSaved: ["自我证明已保存", "Self-attestation saved"],
  details: ["详情", "Details"],
  language: ["语言", "Language"],
  noXP: ["疼痛记录不奖励训练 XP。", "Pain entries earn no training XP."],
  assessInfo: [
    "五题自评，随时可以重评。无需极限测试。",
    "Five self-ratings. Reassess anytime. No maximum testing needed.",
  ],
  assessDone: ["保存评估", "Save assessment"],
  trail: ["探险路线", "Expedition trail"],
  campName: ["松火营地", "Pinefire camp"],
  node0: ["松火营地", "Pinefire camp"],
  node1: ["静足林径", "Quietfoot grove"],
  node2: ["回声岩壁", "Echo crag"],
  node3: ["云海垭口", "Cloud pass"],
  node4: ["星光山脊", "Starlight ridge"],
  node5: ["曙光之巅", "Dawn summit"],
  required: ["所需训练天数", "Training days required"],
  badge0: ["初次启程", "First steps"],
  badge1: ["三日足迹", "Three-day trail"],
  badge2: ["技能探索者", "Skill explorer"],
  badge3: ["自省旅人", "Reflective explorer"],
  badge4: ["登峰学徒", "Summit apprentice"],
} satisfies Record<string, [string, string]>;
export type CopyKey = keyof typeof copy;
export const t = (l: Language, k: CopyKey) => copy[k][l === "zh-CN" ? 0 : 1];
const attrs = ["力量", "技巧", "耐力", "灵活", "心态"];
export const attr = (l: Language, a: Attribute) =>
  l === "en"
    ? ATTRIBUTE_LABELS[a]
    : attrs[["PWR", "TEC", "END", "MOB", "MND"].indexOf(a)];
const questions = [
  "你能在稍陡岩壁上控制身体吗？",
  "你能准确落脚，减少调整吗？",
  "你能在训练中保持动作质量吗？",
  "你能平衡地踏上较高脚点吗？",
  "你能预读路线并调整动作吗？",
];
export const question = (l: Language, i: number) =>
  l === "en" ? QUESTIONS[i].question : questions[i];
const skillCopy = [
  ["静音落脚", "在轻松线路上准确落脚，减少调整。"],
  ["侧旗平衡", "用空闲腿帮助身体保持平衡。"],
  ["髋部控制", "在简单地形探索转髋与身体张力。"],
  ["路线预读", "先预想手脚顺序，再比较实际动作。"],
  ["握力控制", "在舒服的岩点上练习适度放松。"],
  ["节奏管理", "轻松攀爬，安排充分休息。"],
  ["高脚踏点", "在舒适范围内练习有控制的高脚。"],
  ["难点拆解", "记录一个难点和下一次想尝试的改变。"],
];
export const skillText = (l: Language, id: SkillId, detail = false) => {
  const i = SKILLS.findIndex((s) => s.id === id);
  return l === "en"
    ? detail
      ? SKILLS[i].practice
      : SKILLS[i].title
    : skillCopy[i][detail ? 1 : 0];
};
const questCopy: Record<string, [string, string[]]> = {
  power: [
    "稳健之力",
    ["逐步热身。", "在舒适地形控制动作。", "记录一次握力观察。"],
  ],
  feet: [
    "无声足迹",
    ["逐步热身。", "在简单线路练习安静落脚。", "记录一个落脚改进。"],
  ],
  tempo: [
    "寻找节奏",
    ["从轻松地形开始。", "每次尝试之间充分休息。", "动作变形时停止。"],
  ],
  balance: [
    "向上平衡",
    ["温和热身。", "在舒适范围活动髋踝。", "记录一个活动度观察。"],
  ],
  map: [
    "岩壁密码",
    ["在简单线路热身。", "尝试前预读手脚顺序。", "对比预想与实际动作。"],
  ],
  recovery: [
    "回到篝火",
    [
      "感受当前身体状况。",
      "选择休息或不加重不适的轻柔活动。",
      "记录精力和睡眠。",
    ],
  ],
};
export const questText = (l: Language, q: Quest) =>
  l === "en"
    ? { title: q.title, steps: q.steps }
    : { title: questCopy[q.id][0], steps: questCopy[q.id][1] };
