import type { AppData, Session } from './domain';
import { localDay } from './expedition';
import type { Language } from './i18n';
export type Pair = [string, string];
export const say = (l: Language, text: Pair) => text[l === 'en' ? 1 : 0];
export type Npc = 'oren' | 'mira' | 'moss';
export type Encounter = { day: string; source: string; event: number; choice?: number; frozen?: boolean };
export type World = { encounters: Encounter[]; equipped?: number; placed: number[]; visited: string[] };
export const world = (p: AppData): World => p.world || { encounters: [], placed: [], visited: ['camp'] };
export const ITEMS: {name: Pair; kind: 'decor'|'outfit'|'clue'; color: string}[] = [
 {name:['萤火灯笼','Firefly lantern'],kind:'decor',color:'#ffd381'},
 {name:['旧地图','Old map'],kind:'clue',color:'#dfb77b'},
 {name:['青苔靠垫','Moss cushion'],kind:'decor',color:'#74c99b'},
 {name:['星纹粉袋','Star chalk bag'],kind:'outfit',color:'#e0b5ef'},
 {name:['铜指南针','Brass compass'],kind:'clue',color:'#f3bc65'},
 {name:['风铃','Wind chime'],kind:'decor',color:'#8fd8de'},
 {name:['侦察员披肩','Scout cape'],kind:'outfit',color:'#66d5ba'},
 {name:['松果摆件','Pinecone carving'],kind:'decor',color:'#ba8c69'},
 {name:['回声石','Echo stone'],kind:'clue',color:'#9cb9d9'},
 {name:['晨光徽章','Dawn badge'],kind:'outfit',color:'#ffe39c'},
 {name:['蘑菇小凳','Mushroom stool'],kind:'decor',color:'#df927a'},
 {name:['山脊旗帜','Ridge pennant'],kind:'decor',color:'#99cadf'},
];
type Event = { title: Pair; text: Pair; npc: Npc; item: number; mode?: 'rest'|'practice'; requires?: 'trust'|'map'|'item'|'quest'; choices: [Pair, Pair, Pair] };
export const EVENTS: Event[] = [
 {title:['迷路的萤火','Lost fireflies'],text:['苔苔捧着一团微光：它们找不到今晚的家。','Moss cups a little light. The fireflies need a home tonight.'],npc:'moss',item:0,choices:[['编一盏灯','Weave a lantern'],['陪它们回林间','Guide them home'],['画下它们的路','Sketch their path']]},
 {title:['火边的地图','Map by the fire'],text:['奥伦展开缺了一角的地图，空白处传来溪水声。','Oren unfolds a torn map. The blank corner seems to murmur.'],npc:'oren',item:1,choices:[['拼好地图','Patch the map'],['听老向导讲述','Listen to Oren'],['标记溪流','Mark the stream']]},
 {title:['柔软的空位','A soft landing'],text:['苔苔给休息的旅人留了一小块青苔。','Moss saves a soft patch for a resting traveler.'],npc:'moss',item:2,mode:'rest',choices:[['缝成靠垫','Sew a cushion'],['一起静坐','Sit together'],['找一处安静角落','Find a quiet corner']]},
 {title:['星星漏出来了','Spilled stars'],text:['米拉的粉袋破了，粉尘在火光里像星星。','Mira’s torn chalk bag spills stars into the firelight.'],npc:'mira',item:3,mode:'practice',choices:[['补上星纹','Stitch a star'],['分享今日观察','Share an observation'],['寻找掉落的碎片','Follow the sparkling trail']]},
 {title:['指针的方向','The needle turns'],text:['奥伦的指南针总指向一段被遗忘的小径。','Oren’s compass points toward a forgotten path.'],npc:'oren',item:4,requires:'map',choices:[['修好指南针','Mend the compass'],['询问往事','Ask about the past'],['记下小径','Chart the path']]},
 {title:['风的来信','A letter on the wind'],text:['帐篷绳结轻响，苔苔说是风在敲门。','Tent ropes hum. Moss says the wind is knocking.'],npc:'moss',item:5,choices:[['挂起风铃','Make a chime'],['听完风的故事','Listen to the wind'],['寻找风口','Mark the breeze']]},
 {title:['侦察员的针线','Scout stitches'],text:['米拉把旧披肩铺开：每一道补丁都是一次复盘。','Mira spreads a cape. Every patch remembers a lesson.'],npc:'mira',item:6,requires:'trust',choices:[['缝上自己的补丁','Add your patch'],['交流一个难点','Discuss a puzzle'],['标记观察点','Mark a lookout']]},
 {title:['松鼠的交换','Squirrel trade'],text:['一只松鼠坚持用雕刻松果换你听它讲完。','A squirrel offers a carved cone if you hear it out.'],npc:'moss',item:7,choices:[['收下松果','Keep the carving'],['耐心听完','Listen patiently'],['画下它的树洞','Map its hollow']]},
 {title:['回声不着急','An unhurried echo'],text:['岩壁把今天的脚步慢慢送回来，奥伦笑了。','The crag slowly returns today’s footsteps. Oren smiles.'],npc:'oren',item:8,mode:'practice',choices:[['收藏回声石','Keep an echo stone'],['与奥伦听回声','Listen with Oren'],['标出回声岩壁','Mark Echo crag']]},
 {title:['清晨的徽章','Dawn emblem'],text:['委托便笺背面，米拉画了一枚小小太阳。','On the back of a completed commission, Mira draws a sun.'],npc:'mira',item:9,requires:'quest',choices:[['制成徽章','Make a badge'],['向伙伴道谢','Thank your companion'],['记录新路标','Record a trail mark']]},
 {title:['蘑菇议会','Mushroom council'],text:['苔苔宣布今天议题：坐下来也能发现世界。','Moss announces today’s agenda: discover the world while seated.'],npc:'moss',item:10,mode:'rest',choices:[['做一张小凳','Build a stool'],['参加茶会','Join the tea'],['画下蘑菇圈','Sketch the ring']]},
 {title:['山脊的颜色','Colors of the ridge'],text:['远处山脊露出金边，奥伦递来一片布。','Gold traces the ridge. Oren hands you a scrap of cloth.'],npc:'oren',item:11,requires:'map',choices:[['缝一面旗','Sew a pennant'],['请教山的名字','Ask the mountain’s name'],['记下山脊','Chart the ridge']]},
 {title:['雨夜守火','Rainy fire watch'],text:['雨落在帐篷上。今晚的冒险是守住一盏温暖。','Rain taps the tent. Tonight’s adventure is keeping a little warmth.'],npc:'moss',item:0,mode:'rest',choices:[['修理灯罩','Repair a lantern'],['陪苔苔守火','Keep Moss company'],['标记避雨处','Mark a shelter']]},
 {title:['错开的脚印','Crossed footprints'],text:['米拉发现两串脚印：原来同一处有不同走法。','Mira finds two trails of footprints: two ways through one place.'],npc:'mira',item:4,mode:'practice',choices:[['留下纪念罗盘','Keep a compass'],['分享自己的走法','Share your approach'],['补充路线图','Add to the map']]},
 {title:['失而复得','Found again'],text:['旧物中夹着一封没送出的信。奥伦认出了笔迹。','An unsent letter hides among your keepsakes. Oren knows the writing.'],npc:'oren',item:1,requires:'item',choices:[['保存信与地图','Keep the letter and map'],['把信读给奥伦','Read it to Oren'],['寻找信里的地点','Chart its destination']]},
 {title:['披肩下的秘密','Under the cape'],text:['米拉承认自己也会犹豫，然后把火拨亮了一点。','Mira admits she hesitates too, then stirs the fire a little brighter.'],npc:'mira',item:6,requires:'trust',choices:[['交换披肩补丁','Trade a cape patch'],['说说自己的心情','Share how you feel'],['约定一个看景处','Mark a place to watch the sky']]},
 {title:['月光种子','Moon seeds'],text:['苔苔说种子不需要催促，就像休息中的你。','Moss says seeds need no rushing, just like you at rest.'],npc:'moss',item:7,mode:'rest',choices:[['收藏种子雕刻','Keep a seed carving'],['陪种子等一会儿','Wait with the seeds'],['标记小花圃','Mark a garden']]},
 {title:['归途的灯','Homeward light'],text:['你认出了路标。营地的灯正在等你回来。','You recognize the trail mark. Camp lights await your return.'],npc:'oren',item:5,requires:'map',choices:[['带回一串风铃','Bring home a chime'],['向奥伦报平安','Greet Oren'],['补全归途','Complete the homeward map']]},
];
export const owned = (p: AppData) => [...new Set(world(p).encounters.filter(e=>e.choice === 0 && !e.frozen).map(e=>EVENTS[e.event].item))];
export const trust = (p: AppData, npc: Npc) => world(p).encounters.filter(e=>e.choice !== undefined && !e.frozen && EVENTS[e.event].npc === npc).reduce((n,e)=>n+(e.choice===1?2:1),0);
function hash(s: string) { let h=2166136261; for(const c of s) h=Math.imul(h^c.charCodeAt(0),16777619); return h>>>0; }
export function beginAdventure(p: AppData, s: Session, now = new Date()): AppData {
 const w=world(p), day=localDay(s.date);
 // A permanent daily receipt survives editing and deletion. No backfill draws.
 if(day!==localDay(now) || w.encounters.some(e=>e.day===day)) return p;
 const resting=s.pain || s.activity==='recovery' || s.activity==='mobility';
 const candidates=EVENTS.map((e,i)=>({e,i})).filter(({e})=>(!e.mode || e.mode===(resting?'rest':'practice')) && (!e.requires || (e.requires==='trust'?trust(p,e.npc)>=2:e.requires==='item'?owned(p).length>0:e.requires==='quest'?!!p.questLedger?.length:w.visited.length>1)));
 const weighted=candidates.flatMap(c=>Array.from({length:w.encounters.some(e=>e.event===c.i)?1:4},()=>c));
 const event=weighted[hash(p.createdAt+day)%weighted.length].i;
 return {...p,world:{...w,encounters:[...w.encounters,{day,source:s.id,event}]}};
}
export function chooseAdventure(p: AppData, day: string, choice: number): AppData {
 const w=world(p), e=w.encounters.find(e=>e.day===day);
 if(!e || e.choice!==undefined || e.frozen || ![0,1,2].includes(choice)) return p;
 return {...p,world:{...w,visited:choice===2?[...new Set([...w.visited,'trail-'+e.event])]:w.visited,encounters:w.encounters.map(v=>v===e?{...v,choice}:v)}};
}
export function reconcileWorld(p: AppData): AppData {
 if(!p.world) return p;
 // Narrative is retained; missing sources freeze their collectible and trust rewards forever.
 return {...p,world:{...p.world,encounters:p.world.encounters.map(e=>!p.sessions.some(s=>s.id===e.source)?{...e,frozen:true}:e)}};
}
export const NPCS: {id:Npc; name:Pair; color:string; lines:Pair[]}[] = [
 {id:'oren',name:['奥伦 · 老向导','Oren · Guide'],color:'#d5ac78',lines:[['山会等你。先坐下烤烤火。','The mountain will wait. Warm yourself first.'],['我曾把迷路当失败，现在把它叫发现。','I once called getting lost failure. Now I call it discovery.'],['那张旧地图是我年轻时画的。','I drew that old map when I was young.'],['有次我选择折返，才看见山谷的灯。','Once I turned back, and found the valley lights.'],['如今地图留白的地方，交给你慢慢写。','The blank spaces are yours to fill, in your own time.']]},
 {id:'mira',name:['米拉 · 侦察员','Mira · Scout'],color:'#68d4b5',lines:[['嘘，脚步轻一点，听见了吗？','Quiet feet. Hear that?'],['今天没解开的动作，也值得画下来。','A move you have not solved is still worth sketching.'],['我的披肩补丁？全是走错的路。','My cape patches? Every one is a wrong turn.'],['原来你也会犹豫。那我们慢慢看。','You hesitate too? Let’s take our time looking.'],['下回看景时，给我留个位置。','Save me a place next time you watch the view.']]},
 {id:'moss',name:['苔苔 · 森林精灵','Moss · Forest spirit'],color:'#a3ce86',lines:[['今天可以什么都不追赶。','You do not have to chase anything today.'],['蘑菇长得慢，但从没迟到。','Mushrooms grow slowly. They are never late.'],['这里的第一盏灯，是给疲倦的人点的。','Our first lamp was lit for someone tired.'],['你坐过的地方，青苔变软了一点。','The moss is softer where you have been sitting.'],['你回来就好，故事明天也在。','Welcome home. The stories will be here tomorrow.']]},
];
