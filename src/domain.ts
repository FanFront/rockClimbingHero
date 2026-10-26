import {
  questXP,
  settle,
  localDay,
  type Commission,
  type Ledger,
  type Route,
} from "./expedition";
export const ATTRIBUTES = ['PWR','TEC','END','MOB','MND'] as const;
export type Attribute = typeof ATTRIBUTES[number];
export type Ratings = Record<Attribute,number>;
export type Activity = 'bouldering'|'strength'|'mobility'|'recovery';
export type ClimbStyle = 'Slab'|'Vertical'|'Overhang'|'Mixed';
export type SkillId = 'quiet-feet'|'flagging'|'hip-control'|'route-reading'|'grip-control'|'pacing'|'high-steps'|'projecting';
export type Readiness = 'fresh'|'normal'|'tired'|'pain';

export type Assessment = {id:string; date:string; ratings:Ratings};
export type Session = {
  id:string; date:string; activity:Activity; duration:number; effort:number;
  attempts:number; sends:number; grade:string; style:ClimbStyle;
  skill:SkillId|null; notes:string; pain:boolean;
};
export type Demonstration = {id:string; date:string; skill:SkillId; note:string; kind:'self-attested'};
export type AppData = {
  schema: 1;
  world?: import("./living").World;
  name: string;
  createdAt: string;
  commissions?: Commission[];
  questLedger?: Ledger[];
  routes?: Route[];
  detailedRouteSessions?: string[];
  readiness?: Readiness;
  rewardCapFrom?: string;
  assessments: Assessment[];
  sessions: Session[];
  demonstrations: Demonstration[];
};
export const ATTRIBUTE_LABELS: Record<Attribute,string> = {
  PWR:'Power',TEC:'Technique',END:'Endurance',MOB:'Mobility',MND:'Mind'
};
export const ATTRIBUTE_COLORS: Record<Attribute,string> = {
  PWR:'#F5BE6B',TEC:'#6CAFDA',END:'#7ACD9B',MOB:'#C3A0DD',MND:'#F7E7C8'
};
export const SKILLS: {id:SkillId;title:string;attribute:Attribute;description:string;practice:string}[] = [
  {id:'quiet-feet',title:'Quiet Feet',attribute:'TEC',description:'Deliberate, accurate foothold placement.',practice:'On comfortable problems, place feet carefully and avoid unnecessary readjustments.'},
  {id:'flagging',title:'Flagging',attribute:'TEC',description:'Use a free leg to maintain balance.',practice:'Try controlled flagging on suitable easy problems.'},
  {id:'hip-control',title:'Hip Position',attribute:'TEC',description:'Keep body tension and use hip rotation.',practice:'Explore in/out hip positions on easy terrain.'},
  {id:'route-reading',title:'Route Reading',attribute:'MND',description:'Plan and adapt a sequence of moves.',practice:'Preview the sequence, then compare it with what really worked.'},
  {id:'grip-control',title:'Grip Control',attribute:'PWR',description:'Apply appropriate, relaxed grip force.',practice:'On comfortable holds, notice when you can relax grip rather than squeeze harder.'},
  {id:'pacing',title:'Pacing',attribute:'END',description:'Regulate effort and rest between climbs.',practice:'Practice easy intervals with intentional rests.'},
  {id:'high-steps',title:'High Steps',attribute:'MOB',description:'Use mobility while keeping body control.',practice:'Practice controlled high footholds below your maximum range.'},
  {id:'projecting',title:'Project Strategy',attribute:'MND',description:'Break a hard problem into learnable pieces.',practice:'Record one move, one failed attempt, and one change to try next.'},
];
export const QUESTIONS: {attribute:Attribute;question:string;help:string}[] = [
  {attribute:'PWR',question:'Can you control your body on moderately steep climbs?',help:'Think about controlled pulling and staying close to the wall.'},
  {attribute:'TEC',question:'Can you place your feet accurately without unnecessary readjustments?',help:'Think about footwork on familiar, comfortable problems.'},
  {attribute:'END',question:'Can you sustain good technique through a normal session?',help:'Consider effort, pacing and the rest you need.'},
  {attribute:'MOB',question:'Can you reach footholds while maintaining balance?',help:'Consider useful, controlled range rather than maximum stretching.'},
  {attribute:'MND',question:'Can you preview a climb and adapt your beta?',help:'Consider planning, confidence and learning from attempts.'}
];
export const DEFAULT_RATINGS:Ratings={PWR:3,TEC:3,END:3,MOB:3,MND:3};
export function clampRating(n:number):number {return Math.max(1,Math.min(5,Math.round(Number.isFinite(n)?n:3)));}
export function ratingScore(n:number):number {return 15+14*clampRating(n);}
export function createProfile(name:string, ratings:Ratings, date=new Date().toISOString()):AppData {
  const clean=Object.fromEntries(ATTRIBUTES.map(a=>[a,clampRating(ratings[a])])) as Ratings;
  return {schema:1,name:name.trim().slice(0,28)||'Explorer',createdAt:date,
    assessments:[{id:'a-'+Date.parse(date),date,ratings:clean}],sessions:[],demonstrations:[]};
}
export function latestRatings(data:AppData):Ratings {return data.assessments[0]?.ratings ?? DEFAULT_RATINGS;}
export function safeMinutes(n:number):number {return Math.max(5,Math.min(240,Math.round(Number.isFinite(n)?n:30)));}
export function sessionXP(s: Session): number {
  const duration = safeMinutes(s.duration);
  if (s.pain && s.activity !== "recovery") return 0; // Recording activity while in pain never yields training XP.
  if (s.activity === "recovery")
    return Math.min(12, 4 + Math.floor(duration / 15) * 2);
  const base = 10 + Math.floor(duration / 10) * 3;
  const sendsBonus =
    s.activity === "bouldering" ? Math.min(12, Math.max(0, s.sends) * 2) : 0;
  return Math.min(60, base + sendsBonus);
}
export function totalXP(data: AppData): number {
  const days = new Map<string, number>();
  let xp = 0;
  for (const s of [...data.sessions].sort((a, b) =>
    a.date.localeCompare(b.date),
  )) {
    const day = localDay(s.date);
    const used = days.get(day) || 0;
    const reward =
      data.rewardCapFrom && s.date >= data.rewardCapFrom
        ? Math.min(sessionXP(s), Math.max(0, 120 - used))
        : sessionXP(s);
    if (data.rewardCapFrom && s.date >= data.rewardCapFrom)
      days.set(day, used + reward);
    xp += reward;
  }
  return xp + questXP(data);
}
export function heroLevel(xp:number):number {return 1+Math.floor(Math.sqrt(Math.max(0,xp)/80));}
export function levelBounds(level:number):{from:number;to:number} {
  return {from:Math.pow(level-1,2)*80,to:Math.pow(level,2)*80};
}
export function bestGrade(data: AppData): string {
  const routeGrades = (data.routes || [])
    .filter(
      (r) =>
        r.sends > 0 &&
        data.sessions.some(
          (s) => s.id === r.sessionId && s.activity === "bouldering",
        ),
    )
    .map((r) => {
      const m = /^V(\d{1,2})$/i.exec(r.grade.trim());
      return m ? Number(m[1]) : -1;
    });
  const grades = data.sessions
    .filter(
      (s) =>
        s.activity === "bouldering" &&
        s.sends > 0 &&
        !data.detailedRouteSessions?.includes(s.id),
    )
    .map((s) => {
      const m = /^V(\d{1,2})$/i.exec(s.grade.trim());
      return m ? Number(m[1]) : -1;
    })
    .filter((n) => n >= 0);
  const all = [...grades, ...routeGrades].filter((n) => n >= 0);
  return all.length ? "V" + Math.max(...all) : "—";
}
export function skillProgress(data:AppData,id:SkillId):{days:number;attested:boolean;rank:'Unexplored'|'Exploring'|'Practicing'|'Self-attested'} {
  const days=new Set(data.sessions.filter(s=>s.skill===id&&!s.pain&&s.activity!=='recovery').map(s=>s.date.slice(0,10))).size;
  const attested=data.demonstrations.some(d=>d.skill===id);
  const rank=attested&&days>=3?'Self-attested':days>=3?'Practicing':days>0?'Exploring':'Unexplored';
  return {days,attested,rank};
}
export function logSession(data: AppData, s: Session): AppData {
  if (data.sessions.some((x) => x.id === s.id)) return data;
  return settle({
    ...data,
    sessions: [
      {
        ...s,
        skill: s.activity === "recovery" ? null : s.skill,
        duration: safeMinutes(s.duration),
        effort: clampRating(s.effort),
        attempts: Math.max(0, Math.floor(s.attempts)),
        sends: Math.max(
          0,
          Math.min(Math.floor(s.sends), Math.floor(s.attempts)),
        ),
      },
      ...data.sessions,
    ],
  });
}
export function deleteSession(data: AppData, id: string): AppData {
  return settle({
    ...data,
    sessions: data.sessions.filter((s) => s.id !== id),
    routes: (data.routes || []).filter((r) => r.sessionId !== id),
  });
}
export function reassess(data:AppData,ratings:Ratings,date:string):AppData {
  return {...data,assessments:[{id:'a-'+Date.parse(date),date,ratings:Object.fromEntries(ATTRIBUTES.map(a=>[a,clampRating(ratings[a])])) as Ratings},...data.assessments]};
}
export type Quest={id:string;title:string;subtitle:string;activity:Activity;minutes:number;skill:SkillId|null;steps:string[];reward:string};
const QUESTS:Record<string,Quest>={
  PWR:{id:'power',title:'Controlled Power',subtitle:'Practice smooth movement on suitable inclines.',activity:'bouldering',minutes:45,skill:'grip-control',steps:['Warm up progressively.','Choose comfortable terrain and focus on controlled movement.','Log what made gripping easier.'],reward:'Strength insight'},
  TEC:{id:'feet',title:'Silent Steps',subtitle:'A footwork expedition, one move at a time.',activity:'bouldering',minutes:45,skill:'quiet-feet',steps:['Warm up progressively.','Practice quiet foot placements on easy problems.','Log one footwork improvement.'],reward:'Technique insight'},
  END:{id:'tempo',title:'Find Your Rhythm',subtitle:'Explore pacing and longer, easy sequences.',activity:'bouldering',minutes:40,skill:'pacing',steps:['Start with easy terrain.','Rest purposefully between comfortable efforts.','Stop when technique degrades.'],reward:'Endurance insight'},
  MOB:{id:'balance',title:'Higher Ground',subtitle:'Explore controlled range and balance.',activity:'mobility',minutes:20,skill:'high-steps',steps:['Gentle general warm-up.','Explore comfortable hip and ankle movement.','Note one range-of-motion observation.'],reward:'Mobility insight'},
  MND:{id:'map',title:'Read the Route',subtitle:'Discover the next move before making it.',activity:'bouldering',minutes:40,skill:'route-reading',steps:['Warm up on easy boulders.','Preview handholds and footholds before each attempt.','Compare predicted and actual beta.'],reward:'Route-reading insight'}
};
export const RECOVERY_QUEST:Quest={id:'recovery',title:'Return to Camp',subtitle:'Recovery is part of the expedition.',activity:'recovery',minutes:15,skill:null,steps:['Check in with your current symptoms.','Choose comfortable rest or gentle non-aggravating movement.','Reflect on energy and sleep.'],reward:'Recovery journal'};
export function recommendedQuest(data:AppData,readiness:Readiness):Quest {
  if(readiness==='pain'||readiness==='tired')return RECOVERY_QUEST;
  const ratings=latestRatings(data);
  const weakest=[...ATTRIBUTES].sort((a,b)=>ratings[a]-ratings[b])[0];
  return QUESTS[weakest];
}
export function countTrainingDays(data:AppData):number{return new Set(data.sessions.map(s=>s.date.slice(0,10))).size;}
export function isProfile(value:unknown):value is AppData {
  if(!value||typeof value!=='object')return false;
  const v=value as Record<string,unknown>;
  return v.schema===1&&typeof v.name==='string'&&Array.isArray(v.sessions)&&Array.isArray(v.assessments)&&Array.isArray(v.demonstrations);
}
