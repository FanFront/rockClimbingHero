import React,{useEffect,useRef,useState} from 'react';
import {Alert,KeyboardAvoidingView,Pressable,ScrollView,StatusBar,StyleSheet,Text,TextInput,View} from 'react-native';
import {SafeAreaProvider,SafeAreaView} from 'react-native-safe-area-context';
import {MountainVista,HeroSprite,PixelGlyph,PixelMap} from './src/art';
import {C} from './src/theme';
import {
 ATTRIBUTES,ATTRIBUTE_LABELS,ATTRIBUTE_COLORS,QUESTIONS,DEFAULT_RATINGS,SKILLS,
 createProfile,latestRatings,heroLevel,levelBounds,totalXP,skillProgress,bestGrade,
 logSession,deleteSession,reassess,recommendedQuest,countTrainingDays,ratingScore,sessionXP,
 type Ratings,type Attribute,type Activity,type ClimbStyle,type SkillId,type Readiness,
 type AppData,type Session
} from './src/domain';
import {loadProfile,saveProfile} from './src/storage';

type Tab='camp'|'quests'|'hero'|'progress'|'journal';
const TABS:{id:Tab;label:string;symbol:string}[]=[
 {id:'camp',label:'CAMP',symbol:'fire'}, {id:'quests',label:'QUESTS',symbol:'compass'},
 {id:'hero',label:'HERO',symbol:'mountain'},{id:'progress',label:'STATS',symbol:'star'},
 {id:'journal',label:'JOURNAL',symbol:'journal'}
];
const STYLES:ClimbStyle[]=['Slab','Vertical','Overhang','Mixed'];
const ACTIVITIES:Activity[]=['bouldering','strength','mobility','recovery'];
const today=(s:string)=>new Date(s).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
function newId(){return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);}
function P({children,title,icon,action}:{children:React.ReactNode;title?:string;icon?:string;action?:React.ReactNode}){
 return <View style={styles.panel}>
   {title?<View style={styles.panelHeading}><View style={styles.headingRow}><PixelGlyph name={icon||'mountain'} size={21}/><Text style={styles.panelTitle}>{title}</Text></View>{action}</View>:null}
   {children}
 </View>;
}
function Button({label,onPress,secondary=false,disabled=false}:{label:string;onPress:()=>void;secondary?:boolean;disabled?:boolean}){
 return <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" style={[styles.button,secondary?styles.secondaryButton:null,disabled?{opacity:.4}:null]}>
  <Text style={[styles.buttonText,secondary?{color:C.gold}:null]}>{label}</Text>
 </Pressable>;
}
function Chip({label,active,onPress}:{label:string;active:boolean;onPress:()=>void}){
 return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.chip,active?styles.chipActive:null]}><Text style={[styles.chipText,active?{color:C.bg}:null]}>{label}</Text></Pressable>;
}
function Meter({value,max=100,color=C.gold}:{value:number;max?:number;color?:string}){
 return <View style={styles.meterTrack}><View style={{height:'100%',width:((Math.max(0,Math.min(1,value/Math.max(1,max)))*100)+'%') as `${number}%`,backgroundColor:color}}/></View>;
}
function Stat({code,rating}:{code:Attribute;rating:number}){
 const score=ratingScore(rating);
 return <View style={styles.statRow}><Text style={[styles.statCode,{color:ATTRIBUTE_COLORS[code]}]}>{code}</Text>
  <View style={{flex:1}}><View style={styles.rowBetween}><Text style={styles.statName}>{ATTRIBUTE_LABELS[code]}</Text><Text style={styles.statNumber}>{score}</Text></View><Meter value={score} color={ATTRIBUTE_COLORS[code]}/></View>
 </View>;
}
function SectionLabel({children}:{children:React.ReactNode}){return <Text style={styles.sectionLabel}>{children}</Text>;}
function Description({children}:{children:React.ReactNode}){return <Text style={styles.description}>{children}</Text>;}
function AssessmentScreen({initialName,initialRatings,repeat,onSave}:{initialName:string;initialRatings:Ratings;repeat:boolean;onSave:(name:string,ratings:Ratings)=>void}){
 const [name,setName]=useState(initialName);
 const [values,setValues]=useState<Ratings>({...initialRatings});
 return <ScrollView contentContainerStyle={styles.onboard} keyboardShouldPersistTaps="handled">
  <MountainVista height={204}/>
  <View style={styles.brandBlock}><Text style={styles.logo}>ASCENT</Text><Text style={styles.subtitle}>THE CLIMBER'S EXPEDITION RPG</Text></View>
  <Text style={styles.bigHeading}>{repeat?'REFLECT ON YOUR JOURNEY':'BEGIN YOUR EXPEDITION'}</Text>
  <Description>Five quick self-assessments initialize your RPG attributes. They represent confidence, not measured fitness or medical advice.</Description>
  {!repeat?<><SectionLabel>EXPLORER NAME</SectionLabel><TextInput value={name} onChangeText={setName} maxLength={28} placeholder="Your adventurer name" placeholderTextColor={C.muted} style={styles.input} autoCapitalize="words"/></>:null}
  {QUESTIONS.map((q,i)=><P key={q.attribute}>
   <Text style={styles.eyebrow}>{String(i+1).padStart(2,'0')} / 05 · {ATTRIBUTE_LABELS[q.attribute].toUpperCase()}</Text>
   <Text style={styles.question}>{q.question}</Text><Description>{q.help}</Description>
   <View style={[styles.chipRow,{marginTop:13}]}>
    {[1,2,3,4,5].map(v=><Chip key={v} label={String(v)} active={values[q.attribute]===v} onPress={()=>setValues({...values,[q.attribute]:v})}/>)}
   </View>
   <Text style={styles.micro}>1 = not confident · 5 = very confident</Text>
  </P>)}
  <Button label={repeat?'SAVE NEW ASSESSMENT':'CREATE EXPLORER →'} onPress={()=>onSave(name,values)}/>
  <Text style={[styles.micro,{textAlign:'center'}]}>Your assessment can change as you learn. No maximum-strength testing is required.</Text>
 </ScrollView>;
}
function Camp({data,readiness,setReadiness,go}:{data:AppData;readiness:Readiness;setReadiness:(r:Readiness)=>void;go:(t:Tab)=>void}){
 const xp=totalXP(data),lv=heroLevel(xp),bounds=levelBounds(lv);
 const quest=recommendedQuest(data,readiness);
 return <>
  <View style={styles.heroArtwork}><MountainVista height={245}/><View style={styles.heroCaption}><Text style={styles.eyebrow}>THE EXPEDITION CONTINUES</Text><Text style={styles.heroGreeting}>Every summit starts with a step.</Text></View></View>
  <P><View style={styles.rowBetween}><View><Text style={styles.eyebrow}>WELCOME TO CAMP</Text><Text style={styles.bigHeading}>{data.name}</Text><Text style={styles.muted}>Lv. {lv} · Trailblazer</Text></View><PixelGlyph size={52} name="mountain"/></View>
   <View style={{marginTop:12}}><Meter value={xp-bounds.from} max={bounds.to-bounds.from}/><Text style={[styles.micro,{textAlign:'right'}]}>{xp-bounds.from} / {bounds.to-bounds.from} XP to next level</Text></View>
  </P>
  <P title="READINESS CHECK" icon="heart">
   <Description>How do you feel today? This changes your suggestions, not your permanent character stats.</Description>
   <View style={styles.chipRow}>{([{id:'fresh',label:'Fresh'},{id:'normal',label:'Normal'},{id:'tired',label:'Tired'},{id:'pain',label:'Pain'}] as {id:Readiness;label:string}[]).map(x=><Chip key={x.id} label={x.label} active={readiness===x.id} onPress={()=>setReadiness(x.id)}/>)}</View>
   {readiness==='pain'?<Text style={styles.warning}>Pain or injury reported: avoid aggravating activity. The coach will suggest recovery reflection, not climbing intensity.</Text>:null}
  </P>
  <P title="TODAY'S QUEST" icon="compass">
   <View style={styles.featureLine}><PixelGlyph name={readiness==='pain'?'heart':'boot'} size={36}/><View style={{flex:1}}><Text style={styles.featureTitle}>{quest.title}</Text><Description>{quest.subtitle}</Description></View></View>
   <View style={styles.questFacts}><Text style={styles.fact}>{quest.minutes} MIN</Text><Text style={styles.fact}>{quest.activity.toUpperCase()}</Text><Text style={styles.fact}>{quest.reward.toUpperCase()}</Text></View>
   <Button label="VIEW EXPEDITION →" onPress={()=>go('quests')}/>
  </P>
  <P title="YOUR JOURNEY" icon="star">
   <View style={styles.triple}><View><Text style={styles.metric}>{data.sessions.length}</Text><Text style={styles.micro}>SESSIONS</Text></View><View><Text style={styles.metric}>{countTrainingDays(data)}</Text><Text style={styles.micro}>ACTIVE DAYS</Text></View><View><Text style={styles.metric}>{bestGrade(data)}</Text><Text style={styles.micro}>BEST V GRADE</Text></View></View>
   <PixelMap height={116}/><Text style={styles.micro}>A new route appears every time you learn something real.</Text>
  </P>
 </>;
}
function Quests({data,readiness,onLog}:{data:AppData;readiness:Readiness;onLog:(a:Activity,s:SkillId|null)=>void}){
 const quest=recommendedQuest(data,readiness);
 return <>
  <MountainVista height={192} mode="trail"/>
  <Text style={styles.bigHeading}>EXPEDITION BOARD</Text>
  <Description>Today's quest adapts to your most uncertain attribute. Quests guide practice; only a completed session log earns XP.</Description>
  <P title="RECOMMENDED ROUTE" icon="compass">
   <Text style={styles.eyebrow}>{quest.activity.toUpperCase()} · ABOUT {quest.minutes} MIN</Text>
   <Text style={styles.featureTitle}>{quest.title}</Text><Description>{quest.subtitle}</Description>
   <View style={{height:8}}/>
   {quest.steps.map((s,i)=><View style={styles.step} key={i}><Text style={styles.stepNumber}>{i+1}</Text><Text style={[styles.body,{flex:1}]}>{s}</Text></View>)}
   <Text style={styles.note}>REWARD: {quest.reward}. Record a real session to gain adventure XP.</Text>
   <Button label={readiness==='pain'?'OPEN RECOVERY JOURNAL →':'START & LOG TRAINING →'} onPress={()=>onLog(quest.activity,quest.skill)}/>
  </P>
  <P title="EXPEDITION CODE" icon="journal">
   <Text style={styles.body}>• XP rewards participation, not maximum intensity.</Text>
   <Text style={styles.body}>• Skills grow through recorded practice on separate days.</Text>
   <Text style={styles.body}>• Self-attested mastery stays clearly labeled.</Text>
   <Text style={styles.body}>• Rest and injury care are never penalized.</Text>
  </P>
 </>;
}
function Hero({data,onReassess,onAttest}:{data:AppData;onReassess:()=>void;onAttest:(skill:SkillId,note:string)=>void}){
 const xp=totalXP(data),lv=heroLevel(xp),bounds=levelBounds(lv);
 const ratings=latestRatings(data);
 const [selected,setSelected]=useState<SkillId>('quiet-feet');
 const [note,setNote]=useState('');
 const skill=SKILLS.find(s=>s.id===selected)!;
 const progress=skillProgress(data,selected);
 return <>
  <P title="EXPLORER PROFILE" icon="mountain">
   <View style={styles.profileRow}><View style={styles.spriteWrap}><HeroSprite height={216}/></View>
    <View style={{flex:1}}><Text style={styles.eyebrow}>MOUNTAIN SEEKER</Text><Text style={styles.featureTitle}>{data.name}</Text><Text style={styles.level}>LV. {lv}</Text><Text style={styles.muted}>EXPEDITIONER</Text>
     <View style={{marginTop:14}}><Meter value={xp-bounds.from} max={bounds.to-bounds.from}/><Text style={styles.micro}>{xp} TOTAL XP</Text></View>
     <Text style={[styles.micro,{marginTop:12}]}>“Higher places, stronger habits.”</Text>
    </View>
   </View>
  </P>
  <P title="ATTRIBUTES" icon="star" action={<Pressable onPress={onReassess}><Text style={styles.actionLink}>REASSESS →</Text></Pressable>}>
   <Text style={styles.micro}>CURRENT SELF-ASSESSMENT · 1–5 CONFIDENCE SCALE</Text>
   <View style={{height:6}}/>
   {ATTRIBUTES.map(a=><Stat key={a} code={a} rating={ratings[a]}/>)}
   <Text style={styles.micro}>Attributes cannot be raised with XP. Reassess to reflect your own perceived changes.</Text>
  </P>
  <P title="MASTERY TREE" icon="pick">
   <Description>Choose a climbing skill. Practice on separate days; then record your own demonstration when ready.</Description>
   <View style={styles.skillGrid}>{SKILLS.map(s=>{
     const p=skillProgress(data,s.id),active=selected===s.id;
     return <Pressable key={s.id} onPress={()=>setSelected(s.id)} style={[styles.skillCard,active?{borderColor:C.gold}:null]}>
       <PixelGlyph name={s.attribute==='TEC'?'boot':s.attribute==='MND'?'compass':s.attribute==='PWR'?'pick':s.attribute==='MOB'?'star':'heart'} size={24} color={active?C.gold:C.mint}/>
       <Text style={styles.skillName}>{s.title}</Text><Text style={styles.micro}>{p.rank}</Text>
       <Meter value={p.days} max={3} color={active?C.gold:C.mint}/>
     </Pressable>;
   })}</View>
   <View style={styles.skillDetail}><Text style={styles.featureTitle}>{skill.title}</Text><Description>{skill.description}</Description>
    <Text style={styles.micro}>{progress.days} / 3 DIFFERENT PRACTICE DAYS · {progress.rank.toUpperCase()}</Text>
    <Text style={styles.body}>{skill.practice}</Text>
    {progress.days>=3&&!progress.attested?<><SectionLabel>SELF-ATTESTED MASTERY</SectionLabel>
      <TextInput style={[styles.input,styles.textArea]} multiline value={note} onChangeText={setNote} placeholder="Describe what you demonstrated (at least 10 characters)" placeholderTextColor={C.muted}/>
      <Button disabled={note.trim().length<10} label="RECORD MY DEMONSTRATION" onPress={()=>{onAttest(selected,note.trim());setNote('');}}/>
     </>:progress.attested?<Text style={styles.good}>✓ Self-attested demonstration recorded. This is not an external certification.</Text>
      :<Text style={styles.note}>Log this skill on three different days to unlock a self-attestation entry.</Text>}
   </View>
  </P>
 </>;
}
function Progress({data,onReassess}:{data:AppData;onReassess:()=>void}){
 const xp=totalXP(data),last=data.assessments[0],first=data.assessments[data.assessments.length-1];
 const recentDays=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return d.toISOString().slice(0,10);});
 return <>
  <Text style={styles.bigHeading}>THE CHRONICLE</Text><Description>Progress is a story of consistent practice, real achievements and changing self-perception.</Description>
  <P title="EXPEDITION RECORD" icon="journal">
   <View style={styles.triple}><View><Text style={styles.metric}>{xp}</Text><Text style={styles.micro}>TOTAL XP</Text></View><View><Text style={styles.metric}>{data.sessions.length}</Text><Text style={styles.micro}>LOGGED SESSIONS</Text></View><View><Text style={styles.metric}>{bestGrade(data)}</Text><Text style={styles.micro}>BEST V SEND</Text></View></View>
  </P>
  <P title="THE LAST SEVEN DAYS" icon="mountain">
   <View style={styles.weekBars}>{recentDays.map((d,i)=>{const n=data.sessions.filter(s=>s.date.startsWith(d)).length;return <View key={d} style={styles.weekColumn}>
    <Text style={styles.micro}>{n||''}</Text><View style={styles.barHolder}><View style={{height:((n?Math.min(100,18+n*24):7)+'%') as `${number}%`,backgroundColor:n?C.gold:C.line,width:22}}/></View><Text style={styles.micro}>{'SMTWTFS'[new Date(d+'T12:00:00').getDay()]}</Text></View>;})}</View>
   <Text style={styles.micro}>Session counts, not workload or a training prescription.</Text>
  </P>
  <P title="ATTRIBUTE HISTORY" icon="star" action={<Pressable onPress={onReassess}><Text style={styles.actionLink}>NEW CHECK-IN →</Text></Pressable>}>
   <Text style={styles.micro}>FIRST ASSESSMENT → LATEST · SELF REPORTED</Text>
   {ATTRIBUTES.map(a=><View key={a} style={styles.comparisonRow}>
     <Text style={[styles.statCode,{color:ATTRIBUTE_COLORS[a]}]}>{a}</Text><Text style={[styles.body,{flex:1}]}>{ATTRIBUTE_LABELS[a]}</Text>
     <Text style={styles.statNumber}>{ratingScore(first.ratings[a])} → {ratingScore(last.ratings[a])}</Text>
   </View>)}
   <Text style={styles.micro}>You have completed {data.assessments.length} assessment(s). Scores are illustrative confidence ratings.</Text>
  </P>
  <P title="LATEST SESSIONS" icon="journal">
   {data.sessions.length===0?<Description>Your story begins with your first logged climb or workout.</Description>:data.sessions.slice(0,5).map(s=><View key={s.id} style={styles.historyRow}>
     <View style={{flex:1}}><Text style={styles.body}>{s.activity.toUpperCase()} · {s.duration} MIN</Text><Text style={styles.micro}>{today(s.date)} · {s.style} {s.sends>0?'· '+s.sends+' sends':''}</Text></View>
     <Text style={styles.good}>+{sessionXP(s)}*</Text>
    </View>)}
   <Text style={styles.micro}>Rewards are calculated from each saved log and capped per session.</Text>
  </P>
 </>;
}
function Journal({data,onSave,onDelete,initialActivity,initialSkill,readiness}:{data:AppData;onSave:(s:Session)=>void;onDelete:(id:string)=>void;initialActivity:Activity;initialSkill:SkillId|null;readiness:Readiness}){
 const [activity,setActivity]=useState<Activity>(initialActivity);
 const [minutes,setMinutes]=useState('45');
 const [effort,setEffort]=useState(3);
 const [attempts,setAttempts]=useState('5');
 const [sends,setSends]=useState('2');
 const [grade,setGrade]=useState('V2');
 const [style,setStyle]=useState<ClimbStyle>('Vertical');
 const [skill,setSkill]=useState<SkillId|null>(initialSkill);
 const [notes,setNotes]=useState('');
 const [pain,setPain]=useState(readiness==='pain');
 useEffect(()=>{setActivity(initialActivity);setSkill(initialSkill);},[initialActivity,initialSkill]);
 const submit=()=>{
  const duration=Number(minutes),attemptCount=Number(attempts),sendCount=Number(sends);
  if(!Number.isFinite(duration)||duration<5||duration>240)return Alert.alert('Check duration','Enter 5–240 minutes.');
  if(activity==='bouldering'&&(!Number.isInteger(attemptCount)||!Number.isInteger(sendCount)||attemptCount<0||sendCount<0||sendCount>attemptCount))
    return Alert.alert('Check attempts','Sends must be between 0 and the number of attempts.');
  if(activity==='bouldering'&&grade.trim()&&!/^V\d{1,2}$/i.test(grade.trim()))
    return Alert.alert('Check grade','Use an optional V grade such as V2, or leave it blank.');
  const entry:Session={id:newId(),date:new Date().toISOString(),activity,duration,effort,
   attempts:activity==='bouldering'?attemptCount:0,sends:activity==='bouldering'?sendCount:0,
   grade:activity==='bouldering'?grade.trim().toUpperCase():'',style,skill,
   notes:notes.trim().slice(0,500),pain};
  onSave(entry);
  setNotes('');setPain(false);
 };
 return <>
  <Text style={styles.bigHeading}>EXPEDITION JOURNAL</Text><Description>Log the climb you actually completed. Offline entries stay on this device.</Description>
  <P title="NEW ENTRY" icon="journal">
   <SectionLabel>ACTIVITY</SectionLabel><View style={styles.chipRow}>{ACTIVITIES.map(a=><Chip key={a} label={a.toUpperCase()} active={activity===a} onPress={()=>setActivity(a)}/>)}</View>
   <SectionLabel>DURATION · MINUTES</SectionLabel>
   <View style={styles.chipRow}>{['15','30','45','60','90'].map(m=><Chip key={m} label={m} active={minutes===m} onPress={()=>setMinutes(m)}/>)}</View>
   <TextInput style={[styles.input,{marginTop:9}]} keyboardType="number-pad" value={minutes} onChangeText={setMinutes} placeholder="Minutes" placeholderTextColor={C.muted}/>
   <SectionLabel>PERCEIVED EFFORT</SectionLabel><View style={styles.chipRow}>{[1,2,3,4,5].map(n=><Chip key={n} label={String(n)} active={effort===n} onPress={()=>setEffort(n)}/>)}</View>
   {activity==='bouldering'?<>
    <SectionLabel>CLIMB STYLE</SectionLabel><View style={styles.chipRow}>{STYLES.map(s=><Chip key={s} label={s} active={style===s} onPress={()=>setStyle(s)}/>)}</View>
    <View style={styles.twoColumns}><View style={{flex:1}}><SectionLabel>ATTEMPTS</SectionLabel><TextInput style={styles.input} value={attempts} onChangeText={setAttempts} keyboardType="number-pad"/></View><View style={{flex:1}}><SectionLabel>SENDS</SectionLabel><TextInput style={styles.input} value={sends} onChangeText={setSends} keyboardType="number-pad"/></View></View>
    <SectionLabel>BEST GRADE ATTEMPTED (OPTIONAL)</SectionLabel><TextInput style={styles.input} value={grade} onChangeText={setGrade} autoCapitalize="characters" maxLength={3}/>
    <Text style={styles.micro}>Best completed grade is calculated only from entries with sends above zero.</Text>
   </>:null}
   <SectionLabel>SKILL PRACTICED (OPTIONAL)</SectionLabel><View style={styles.chipRow}><Chip label="None" active={skill===null} onPress={()=>setSkill(null)}/>{SKILLS.map(s=><Chip key={s.id} label={s.title} active={skill===s.id} onPress={()=>setSkill(s.id)}/>)}</View>
   <SectionLabel>EXPEDITION NOTES</SectionLabel>
   <TextInput style={[styles.input,styles.textArea]} multiline value={notes} onChangeText={setNotes} placeholder="What worked? What will you try next?" placeholderTextColor={C.muted} maxLength={500}/>
   <Pressable onPress={()=>setPain(!pain)} style={styles.checkRow}><Text style={styles.checkBox}>{pain?'☑':'☐'}</Text><Text style={[styles.body,{flex:1}]}>I experienced pain or injury symptoms during this activity</Text></Pressable>
   {pain||readiness==='pain'?<Text style={styles.warning}>Avoid aggravating activity and consider professional assessment for persistent or concerning symptoms. Entries marked with pain earn 0 XP.</Text>:null}
   <Button label="SAVE SESSION + EARN XP" onPress={submit}/>
  </P>
  <P title="RECENT ENTRIES" icon="journal">
   {data.sessions.length===0?<Description>No entries yet. Record a real activity to start your chronicle.</Description>:data.sessions.slice(0,15).map(s=><View key={s.id} style={styles.historyRow}>
    <View style={{flex:1}}><Text style={styles.body}>{s.activity.toUpperCase()} · {s.duration} MIN</Text><Text style={styles.micro}>{today(s.date)} · {s.sends} sends · {s.grade||'No grade'} {s.pain?'· Pain reported':''}</Text></View>
    <Pressable onPress={()=>Alert.alert('Delete this entry?','XP and associated practice-day credit will be recalculated.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>onDelete(s.id)}])}><Text style={styles.delete}>DELETE</Text></Pressable>
   </View>)}
  </P>
 </>;
}
export default function App(){
 const [loaded,setLoaded]=useState(false);
 const [profile,setProfile]=useState<AppData|null>(null);
 const [tab,setTab]=useState<Tab>('camp');
 const [readiness,setReadiness]=useState<Readiness>('normal');
 const [assessmentMode,setAssessmentMode]=useState(false);
 const [initialActivity,setInitialActivity]=useState<Activity>('bouldering');
 const [initialSkill,setInitialSkill]=useState<SkillId|null>(null);
 const persist=useRef<Promise<void>>(Promise.resolve());
 useEffect(()=>{loadProfile().then(p=>setProfile(p)).catch(()=>Alert.alert('Storage unavailable','Unable to read local SQLite data.')).finally(()=>setLoaded(true));},[]);
 useEffect(()=>{if(!loaded||!profile)return;
   persist.current=persist.current.catch(()=>{}).then(()=>saveProfile(profile));
   persist.current.catch(()=>Alert.alert('Save failed','Changes could not be stored locally.'));
 },[profile,loaded]);
 const onAssessment=(name:string,ratings:Ratings)=>{
   if(profile){setProfile(reassess(profile,ratings,new Date().toISOString()));setAssessmentMode(false);setTab('hero');}
   else {setProfile(createProfile(name,ratings));setTab('camp');}
 };
 const onLog=(activity:Activity,skill:SkillId|null)=>{setInitialActivity(activity);setInitialSkill(skill);setTab('journal');};
 const saveLog=(s:Session)=>{if(!profile)return;setProfile(logSession(profile,s));Alert.alert('Expedition recorded','Your session is saved. Adventure XP and practice history have been updated.');};
 const attest=(skill:SkillId,note:string)=>{if(!profile||skillProgress(profile,skill).days<3)return;
    setProfile({...profile,demonstrations:[{id:newId(),date:new Date().toISOString(),skill,note,kind:'self-attested'},...profile.demonstrations]});
    Alert.alert('Reflection recorded','Your skill is now marked as self-attested, not coach-verified.');
 };
 if(!loaded)return <SafeAreaProvider><SafeAreaView style={styles.screen}><View style={styles.loading}><PixelGlyph size={72}/><Text style={styles.logo}>ASCENT</Text><Description>Opening expedition journal...</Description></View></SafeAreaView></SafeAreaProvider>;
 return <SafeAreaProvider><SafeAreaView style={styles.screen} edges={['top','bottom']}>
  <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
  {!profile||assessmentMode?<AssessmentScreen key={assessmentMode?'reassess':'first'} initialName={profile?.name||''} initialRatings={profile?latestRatings(profile):DEFAULT_RATINGS} repeat={!!profile} onSave={onAssessment}/>
  :<>
   <View style={styles.topbar}><View><Text style={styles.logoSmall}>▲ ASCENT</Text><Text style={styles.tagline}>EXPEDITION RPG CLIMBING COACH</Text></View><Pressable onPress={()=>setTab('hero')} style={styles.topBadge}><Text style={styles.topBadgeText}>LV {heroLevel(totalXP(profile))}</Text></Pressable></View>
   <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content} key={tab}>
    {tab==='camp'?<Camp data={profile} readiness={readiness} setReadiness={setReadiness} go={setTab}/>:null}
    {tab==='quests'?<Quests data={profile} readiness={readiness} onLog={onLog}/>:null}
    {tab==='hero'?<Hero data={profile} onReassess={()=>setAssessmentMode(true)} onAttest={attest}/>:null}
    {tab==='progress'?<Progress data={profile} onReassess={()=>setAssessmentMode(true)}/>:null}
    {tab==='journal'?<Journal data={profile} readiness={readiness} initialActivity={initialActivity} initialSkill={initialSkill} onSave={saveLog} onDelete={id=>setProfile(deleteSession(profile,id))}/>:null}
    <View style={{height:20}}/><Text style={styles.footer}>KEEP CLIMBING · KEEP LEARNING · REST WHEN NEEDED</Text>
   </ScrollView>
   <View style={styles.tabbar}>{TABS.map(item=><Pressable key={item.id} accessibilityRole="tab" accessibilityState={{selected:tab===item.id}} onPress={()=>setTab(item.id)} style={[styles.tab,tab===item.id?styles.tabSelected:null]}>
     <PixelGlyph name={item.symbol} size={22} color={tab===item.id?C.gold:C.muted}/><Text style={[styles.tabText,{color:tab===item.id?C.gold:C.muted}]}>{item.label}</Text>
   </Pressable>)}</View>
  </>}
 </SafeAreaView></SafeAreaProvider>;
}
const styles=StyleSheet.create({
 screen:{flex:1,backgroundColor:C.bg},loading:{flex:1,justifyContent:'center',alignItems:'center',gap:14},
 topbar:{minHeight:64,paddingHorizontal:20,paddingVertical:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomColor:C.line,borderBottomWidth:1},
 logo:{fontFamily:'monospace',fontSize:43,color:C.cream,fontWeight:'900',letterSpacing:6,textAlign:'center'},
 logoSmall:{fontFamily:'monospace',fontSize:23,color:C.gold,fontWeight:'900',letterSpacing:2},
 tagline:{fontSize:9,letterSpacing:1.5,color:C.muted,fontFamily:'monospace',marginTop:3},
 topBadge:{backgroundColor:C.panel2,borderColor:C.gold,borderWidth:1,paddingVertical:8,paddingHorizontal:12},
 topBadgeText:{color:C.gold,fontFamily:'monospace',fontWeight:'800'},
 content:{padding:14,paddingBottom:18,gap:13},
 onboard:{padding:14,gap:14,paddingBottom:30},
 brandBlock:{alignItems:'center',marginBottom:5},
 subtitle:{color:C.gold,fontSize:10,letterSpacing:2,fontFamily:'monospace'},
 panel:{borderWidth:2,borderColor:C.line,backgroundColor:C.panel,padding:14,gap:11},
 panelHeading:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderBottomColor:C.line,borderBottomWidth:1,paddingBottom:10,marginBottom:1},
 headingRow:{flexDirection:'row',alignItems:'center',gap:9},
 panelTitle:{fontFamily:'monospace',fontWeight:'800',fontSize:14,letterSpacing:1.4,color:C.cream},
 bigHeading:{fontSize:24,fontWeight:'900',letterSpacing:1.1,fontFamily:'monospace',color:C.cream},
 eyebrow:{fontFamily:'monospace',color:C.gold,fontSize:10,fontWeight:'700',letterSpacing:1.5},
 description:{color:C.muted,fontSize:13,lineHeight:20},
 body:{color:C.cream,fontSize:13,lineHeight:21},
 muted:{color:C.muted,fontSize:12},
 micro:{color:C.muted,fontSize:10,lineHeight:16,fontFamily:'monospace'},
 logoWrap:{padding:10},
 question:{color:C.cream,fontSize:16,fontWeight:'700',lineHeight:23},
 input:{backgroundColor:C.bg,borderColor:C.line,borderWidth:1,paddingHorizontal:12,paddingVertical:11,color:C.cream,fontSize:14,minHeight:46},
 textArea:{minHeight:89,textAlignVertical:'top'},
 button:{minHeight:50,backgroundColor:C.gold,alignItems:'center',justifyContent:'center',paddingHorizontal:12,borderBottomWidth:4,borderBottomColor:C.goldDim,marginTop:3},
 secondaryButton:{backgroundColor:C.panel2,borderWidth:1,borderColor:C.gold},
 buttonText:{fontFamily:'monospace',fontWeight:'900',color:C.bg,letterSpacing:.6,fontSize:14,textAlign:'center'},
 chipRow:{flexDirection:'row',flexWrap:'wrap',gap:7},
 chip:{minWidth:33,alignItems:'center',justifyContent:'center',paddingHorizontal:11,paddingVertical:10,borderWidth:1,borderColor:C.line,backgroundColor:C.panel2},
 chipActive:{backgroundColor:C.gold,borderColor:C.gold},
 chipText:{color:C.cream,fontFamily:'monospace',fontSize:11,fontWeight:'800'},
 sectionLabel:{color:C.gold,fontSize:11,fontWeight:'800',fontFamily:'monospace',letterSpacing:1.2,marginTop:6},
 meterTrack:{backgroundColor:'#294651',height:9,overflow:'hidden'},
 rowBetween:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:6},
 statRow:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:4},
 statCode:{width:40,fontSize:15,fontWeight:'900',fontFamily:'monospace'},
 statName:{fontSize:11,color:C.cream,marginBottom:6,fontFamily:'monospace'},
 statNumber:{fontSize:13,color:C.gold,fontFamily:'monospace',fontWeight:'800'},
 actionLink:{fontFamily:'monospace',fontSize:10,color:C.gold,fontWeight:'800'},
 heroArtwork:{borderColor:C.line,borderWidth:1,overflow:'hidden',position:'relative'},
 heroCaption:{position:'absolute',bottom:0,left:0,right:0,padding:14,backgroundColor:'rgba(7,22,30,0.7)'},
 heroGreeting:{fontFamily:'monospace',fontWeight:'900',fontSize:15,color:C.cream,marginTop:3},
 warning:{color:C.danger,fontSize:12,lineHeight:18,borderLeftWidth:3,borderLeftColor:C.danger,paddingLeft:10,marginTop:4},
 note:{color:C.gold,fontSize:11,lineHeight:18,fontFamily:'monospace'},
 good:{color:C.good,fontSize:11,lineHeight:17,fontFamily:'monospace'},
 featureLine:{flexDirection:'row',gap:13,alignItems:'center'},
 featureTitle:{fontSize:19,color:C.cream,fontFamily:'monospace',fontWeight:'900',marginBottom:4},
 questFacts:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',marginTop:5,gap:6},
 fact:{fontSize:10,color:C.gold,fontFamily:'monospace',fontWeight:'700'},
 triple:{flexDirection:'row',justifyContent:'space-around',gap:7,marginVertical:5},
 metric:{fontSize:22,fontFamily:'monospace',color:C.gold,fontWeight:'900'},
 step:{flexDirection:'row',gap:12,alignItems:'flex-start',paddingVertical:5},
 stepNumber:{fontSize:17,fontFamily:'monospace',color:C.gold,fontWeight:'900',width:25},
 profileRow:{flexDirection:'row',gap:7,alignItems:'center'},
 spriteWrap:{width:'43%',backgroundColor:C.bg,alignItems:'center',justifyContent:'center',minHeight:216,borderColor:C.line,borderWidth:1},
 level:{color:C.gold,fontSize:30,fontFamily:'monospace',fontWeight:'900',marginTop:7},
 skillGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:8},
 skillCard:{width:'48.5%',minHeight:113,borderWidth:1,borderColor:C.line,backgroundColor:C.panel2,padding:10,gap:5},
 skillName:{color:C.cream,fontWeight:'800',fontFamily:'monospace',fontSize:12},
 skillDetail:{padding:12,borderWidth:1,borderColor:C.goldDim,backgroundColor:C.bg,gap:10,marginTop:7},
 weekBars:{height:120,flexDirection:'row',justifyContent:'space-around',gap:8},
 weekColumn:{flex:1,alignItems:'center',justifyContent:'flex-end'},
 barHolder:{height:88,justifyContent:'flex-end'},
 comparisonRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:8,borderBottomColor:C.line,borderBottomWidth:1},
 historyRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:10,borderBottomColor:C.line,borderBottomWidth:1},
 delete:{color:C.danger,fontFamily:'monospace',fontWeight:'800',fontSize:10,padding:8},
 twoColumns:{flexDirection:'row',gap:10},
 checkRow:{flexDirection:'row',gap:10,paddingVertical:10,alignItems:'center'},
 checkBox:{fontSize:20,color:C.gold},
 footer:{fontSize:9,textAlign:'center',color:C.goldDim,letterSpacing:1.1,fontFamily:'monospace'},
 tabbar:{flexDirection:'row',backgroundColor:'#0D2430',borderTopColor:C.line,borderTopWidth:1,minHeight:68},
 tab:{flex:1,alignItems:'center',justifyContent:'center',gap:4,paddingVertical:8},
 tabSelected:{backgroundColor:'#153542',borderTopWidth:2,borderTopColor:C.gold},
 tabText:{fontFamily:'monospace',fontSize:9,fontWeight:'800',letterSpacing:.4}
});
