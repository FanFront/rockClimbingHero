import test from 'node:test';
import assert from 'node:assert/strict';
import {createProfile,logSession,deleteSession,totalXP,heroLevel,skillProgress,bestGrade,recommendedQuest,reassess,DEFAULT_RATINGS, type Session} from '../src/domain';
const date='2026-10-26T10:00:00.000Z';
const entry=(id:string,day:number):Session=>({id,date:'2026-10-'+String(day).padStart(2,'0')+'T10:00:00.000Z',activity:'bouldering',duration:50,effort:3,attempts:5,sends:2,grade:'V3',style:'Slab',skill:'quiet-feet',notes:'',pain:false});
test('XP comes from logged sessions, and deleting a session removes XP',()=>{
  const empty=createProfile('Alex',DEFAULT_RATINGS,date);
  const one=logSession(empty,entry('s1',20));
  assert.ok(totalXP(one)>0);
  assert.equal(totalXP(deleteSession(one,'s1')),0);
  assert.equal(totalXP(logSession(one,entry('s1',20))),totalXP(one));
});
test('real accomplishment is recorded independently from character levels',()=>{
  let data=createProfile('Alex',DEFAULT_RATINGS,date);
  for(let i=20;i<23;i++)data=logSession(data,entry('s'+i,i));
  assert.equal(skillProgress(data,'quiet-feet').rank,'Practicing');
  assert.equal(bestGrade(data),'V3');
  data={...data,demonstrations:[{id:'e1',date,skill:'quiet-feet',note:'I controlled foot placement on two easier boulders',kind:'self-attested'}]};
  assert.equal(skillProgress(data,'quiet-feet').rank,'Self-attested');
  assert.ok(heroLevel(totalXP(data))>=1);
});
test('reporting pain disables training XP and chooses recovery',()=>{
  const profile=createProfile('Alex',DEFAULT_RATINGS,date);
  assert.equal(recommendedQuest(profile,'pain').id,'recovery');
  assert.equal(totalXP(logSession(profile,{...entry('s1',20),pain:true})),0);
});
test('reassessment saves history without fabricating skill evidence',()=>{
  const old=createProfile('Alex',DEFAULT_RATINGS,date);
  const next=reassess(old,{PWR:5,TEC:4,END:3,MOB:2,MND:3},'2026-11-26T10:00:00.000Z');
  assert.equal(next.assessments.length,2);
  assert.equal(next.assessments[0].ratings.PWR,5);
  assert.equal(skillProgress(next,'quiet-feet').rank,'Unexplored');
});

test('recovery logs do not advance climbing skill evidence',()=>{
 const profile=createProfile('Alex',DEFAULT_RATINGS,date);
 const entry={...entry('rest',20),activity:'recovery' as const,skill:'quiet-feet' as const};
 const after=logSession(profile,entry);
 assert.equal(skillProgress(after,'quiet-feet').days,0);
 assert.equal(after.sessions[0].skill,null);
});
