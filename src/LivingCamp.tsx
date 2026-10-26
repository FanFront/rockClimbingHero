import React, {useEffect, useRef, useState} from 'react';
import {Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Rect, Path, G} from 'react-native-svg';
import type {AppData} from './domain';
import type {Language} from './i18n';
import {C} from './theme';
import {EVENTS, ITEMS, NPCS, chooseAdventure, owned, say, trust, world} from './living';
function Sprite({color, size=64, item=false}:{color:string;size?:number;item?:boolean}) {
 return <Svg width={size} height={size} viewBox="0 0 24 24"><Rect x="3" y="21" width="18" height="2" fill="#071c24"/>{item?<><Path d="M6 5H18V8H21V19H18V21H6V19H3V8H6Z" fill={color}/><Rect x="6" y="9" width="12" height="2" fill="#fff2bb"/><Rect x="10" y="14" width="4" height="4" fill="#24444d"/></>:<><Rect x="7" y="3" width="10" height="8" fill="#edc798"/><Path d="M5 6V3H8V1H16V3H19V6Z" fill={color}/><Rect x="9" y="7" width="2" height="2" fill="#122d39"/><Rect x="15" y="7" width="2" height="2" fill="#122d39"/><Path d="M6 11H18V13H20V19H16V17H8V19H4V13H6Z" fill={color}/><Rect x="7" y="18" width="4" height="4" fill="#51727b"/><Rect x="14" y="18" width="4" height="4" fill="#51727b"/><Rect x="8" y="13" width="2" height="3" fill="#f5dfa5"/></>}</Svg>;
}
export function LivingCamp({p,l,save,navigate,record}:{p:AppData;l:Language;save:(p:AppData)=>void;navigate:(tab:'quests'|'map'|'hero')=>void;record:()=>void}) {
 const [panel,setPanel]=useState<string|null>(null);
 const pulse=useRef(new Animated.Value(0)).current;
 useEffect(()=>{const a=Animated.loop(Animated.sequence([Animated.timing(pulse,{toValue:1,duration:1000,useNativeDriver:true}),Animated.timing(pulse,{toValue:0,duration:1000,useNativeDriver:true})]));a.start();return()=>a.stop();},[pulse]);
 const w=world(p), inventory=owned(p), pending=w.encounters.find(e=>e.choice===undefined&&!e.frozen);
 const copy=(zh:string,en:string)=>l==='en'?en:zh;
 const action=(label:string,fn:()=>void)=><Pressable accessibilityRole="button" onPress={fn} style={s.button}><Text style={s.text}>{label}</Text></Pressable>;
 const object=(id:string,label:string,left:number,top:number,child:React.ReactNode,fn:()=>void)=><Pressable key={id} accessibilityRole="button" accessibilityLabel={label} onPress={fn} style={[s.object,{left:`${left}%`,top:`${top}%`}]}>{child}<Text style={s.label}>{label}</Text></Pressable>;
 return <>
 <View style={s.scene}>
 <Svg width="100%" height="100%" viewBox="0 0 360 420" preserveAspectRatio="none">
 <Rect width="360" height="420" fill="#153c4a"/>
 {Array.from({length:24},(_,i)=><Rect key={i} x={(i*71+11)%354} y={(i*31)%120} width="2" height="2" fill={i%3?'#81aaa8':'#ffdc9d'}/>)}
 <Path d="M0 170H25V140H45V120H65V90H80V110H100V140H120V120H140V80H155V50H170V80H185V110H210V140H230V110H250V85H270V120H290V150H320V130H340V160H360V290H0Z" fill="#416b76"/>
 <Path d="M140 80H155V50H170V80H180V96H168V82H155V96H140Z" fill="#b6d4c7"/>
 <Path d="M0 219H40V205H100V222H140V210H220V220H280V201H330V217H360V420H0Z" fill="#214c49"/>
 <Path d="M180 200H200V235H218V270H205V305H230V350H250V420H150V370H168V335H160V300H180V260H171Z" fill="#48665a"/>
 {Array.from({length:12},(_,i)=><G key={i} x={i<6?i*21:255+(i-6)*22} y={125+(i%3)*19}><Rect x="-2" y="35" width="5" height="70" fill="#4f5442"/><Path d="M0 0H5V12H12V24H18V36H24V49H-20V36H-14V24H-8V12H0Z" fill={i%2?'#123b3b':'#1a4541'}/><Rect x="-7" y="30" width="10" height="3" fill="#326b57"/></G>)}
 <Path d="M15 281H23V265H31V249H39V233H47V217H55V201H63V217H71V233H79V249H87V265H95V281Z" fill="#d6a76a"/><Path d="M55 201H63V217H71V233H79V249H87V265H95V281H55Z" fill="#916e4d"/><Path d="M43 281V257H49V241H55V281Z" fill="#21363a"/>
 <Rect x="269" y="212" width="6" height="60" fill="#99764c"/><Path d="M249 215H290V234H249Z" fill="#c7a86d"/>
 {Array.from({length:35},(_,i)=><Rect key={i} x={(i*47+13)%356} y={285+(i*31)%130} width={i%2?4:7} height="3" fill={i%3?'#35614e':'#7a9160'}/>)}
 <Rect x="153" y="323" width="49" height="5" fill="#966e47"/><Rect x="163" y="330" width="37" height="4" fill="#4b3c32"/>
 </Svg>
 <Text style={s.caption}>{copy('松火营地 · 暮色','PINEFIRE · DUSK')}</Text>
 {object('tent',copy('背包','Pack'),2,47,<Sprite color="#d6a76a" item/>,()=>setPanel('pack'))}
 {object('board',copy('委托板','Board'),72,40,<Sprite color="#c79e69" item/>,()=>navigate('quests'))}
 {object('map',copy(`路标 · ${w.visited.length}`,`Trail · ${w.visited.length}`),74,70,<Sprite color="#89bdb9" item/>,()=>{save({...p,world:{...w,visited:[...new Set([...w.visited,'grove'])]}});navigate('map');})}
 {NPCS.map((npc,i)=>object(npc.id,say(l,npc.name).split(' · ')[0],[12,65,29][i],[68,57,39][i],<Sprite color={npc.color}/>,()=>setPanel(npc.id)))}
 {object('hero',p.name,42,65,<Animated.View style={{transform:[{translateY:pulse.interpolate({inputRange:[0,1],outputRange:[0,-3]})}]}}><Sprite color={w.equipped!==undefined&&inventory.includes(w.equipped)?ITEMS[w.equipped].color:'#79b6cc'}/></Animated.View>,()=>navigate('hero'))}
 {object('fire',copy('篝火 · 记录','Fire · Log'),40,47,<Animated.View style={{opacity:pulse.interpolate({inputRange:[0,1],outputRange:[0.65,1]})}}><Svg width={64} height={64} viewBox="0 0 32 32"><Path d="M6 28V17H10V12H14V3H18V10H22V16H26V28Z" fill="#e58f4f"/><Path d="M11 28V19H15V13H19V21H22V28Z" fill="#ffe2a0"/></Svg></Animated.View>,record)}
 {w.placed.filter(i=>inventory.includes(i)).slice(0,5).map((i,n)=><View key={i} pointerEvents="none" style={{position:'absolute',left:`${4+n*16}%`,bottom:4}}><Sprite color={ITEMS[i].color} item size={32}/></View>)}
 </View>
 {pending&&action(copy('✦ 冒险战报 · 有故事等你选择','✦ Adventure · A choice awaits'),()=>setPanel('event'))}
 {action(copy('收藏与旅途手记','Collection & expedition journal'),()=>setPanel('pack'))}
 {panel&&<Modal transparent animationType="fade" onRequestClose={()=>setPanel(null)}><SafeAreaView style={s.scrim}><View style={s.sheet}><ScrollView contentContainerStyle={{gap:14,padding:18}}>
 {action(copy('关闭 · 返回营地','Close · Return to camp'),()=>setPanel(null))}
 {panel==='event'&&pending&&<><Sprite color={NPCS.find(n=>n.id===EVENTS[pending.event].npc)!.color} size={100}/><Text style={s.title}>{say(l,EVENTS[pending.event].title)}</Text><Text style={s.text}>{say(l,EVENTS[pending.event].text)}</Text>{EVENTS[pending.event].choices.map((c,i)=><View key={i}>{action(say(l,c),()=>{save(chooseAdventure(p,pending.day,i));setPanel('result-'+pending.day);})}<Text style={s.muted}>{i===0?copy('收藏：','Collect: ')+say(l,ITEMS[EVENTS[pending.event].item].name):i===1?copy('伙伴信任 +2 · 推进故事','Trust +2 · Advance their story'):copy('揭示地图标记 · 伙伴信任 +1','Reveal a map mark · Trust +1')}</Text></View>)}<Text style={s.muted}>{copy('每天一次冒险，训练和恢复共享。可以稍后选择。','One adventure per day, shared by training and rest. Choose later if you like.')}</Text></>}
 {panel.startsWith('result-')&&<><Sprite item color="#f5be6b" size={96}/><Text style={s.title}>{copy('营地记住了你的选择','Camp remembers your choice')}</Text><Text style={s.text}>{copy('收藏可在背包装备或摆放；新路标与伙伴故事已经留下。','Equip or place collectibles in your pack. Trail marks and companion stories are saved.')}</Text>{action(copy('打开背包','Open pack'),()=>setPanel('pack'))}</>}
 {NPCS.filter(n=>n.id===panel).map(n=><View key={n.id} style={{gap:16}}><Sprite color={n.color} size={112}/><Text style={s.title}>{say(l,n.name)}</Text><Text style={s.muted}>{copy('信任','Trust')} {trust(p,n.id)} · {Math.min(5,1+Math.floor(trust(p,n.id)/2))}/5</Text><Text style={s.text}>{say(l,n.lines[Math.min(4,Math.floor(trust(p,n.id)/2))])}</Text><Text style={s.muted}>{copy('一起经历事件会解锁下一段故事；无需连续训练。','Shared adventures unlock more of their story. No training streak required.')}</Text>{action(copy('今天也坐一会儿','Stay by the fire'),()=>setPanel('daily-'+n.id))}</View>)}
 {panel.startsWith('daily-')&&<Text style={s.text}>{copy('火光轻轻晃动。伙伴为你留了一个位置，休息也是今天的冒险。','Firelight dances. Your companion saves you a seat. Rest is an adventure too.')}</Text>}
 {panel==='pack'&&<><Text style={s.title}>{copy('收藏册','Collection')} · {inventory.length}/{ITEMS.length}</Text><Text style={s.muted}>{copy('纯外观与故事收藏，不改变身体能力。','Cosmetics and stories only; no physical ability bonuses.')}</Text><View style={s.grid}>{ITEMS.map((item,i)=><View key={i} style={[s.card,{opacity:inventory.includes(i)?1:0.4}]}><Sprite color={inventory.includes(i)?item.color:'#456069'} item/><Text style={s.text}>{say(l,item.name)}</Text>{inventory.includes(i)?<><Text style={s.muted}>{copy('来自：','From: ')+say(l,EVENTS[w.encounters.find(e=>e.choice===0&&!e.frozen&&EVENTS[e.event].item===i)!.event].title)}</Text>{item.kind!=='clue'&&action(item.kind==='decor'?(w.placed.includes(i)?copy('收起','Store'):copy('摆放','Place')):(w.equipped===i?copy('卸下','Unequip'):copy('装备','Equip')),()=>save({...p,world:item.kind==='decor'?{...w,placed:w.placed.includes(i)?w.placed.filter(v=>v!==i):[...w.placed,i]}:{...w,equipped:w.equipped===i?undefined:i}}))}</>:<Text style={s.muted}>{copy('等待发现','Undiscovered')}</Text>}</View>)}</View><Text style={s.title}>{copy('旅途手记','Expedition journal')}</Text>{[...w.encounters].reverse().map(e=><View key={e.day} style={s.card}><Text style={s.text}>{e.day} · {say(l,EVENTS[e.event].title)}</Text><Text style={s.muted}>{e.choice===undefined?copy('等待选择','Awaiting choice'):say(l,EVENTS[e.event].choices[e.choice])}{e.frozen?' · '+copy('来源删除：故事保留，收藏与信任已冻结','Source deleted: story kept, rewards frozen'):''}</Text>{e.choice===undefined&&!e.frozen&&action(copy('继续故事','Continue'),()=>setPanel('event'))}</View>)}<Text style={s.muted}>{copy('删除来源记录会永久冻结对应收藏与信任，保留故事和当日结算凭据；更正不重抽，补记不发放冒险。','Deleting a source permanently freezes its collectible and trust, keeping the story and daily receipt. Edits never reroll; backdated logs grant no adventure.')}</Text></>}
 </ScrollView></View></SafeAreaView></Modal>}
 </>;
}
const s=StyleSheet.create({scene:{height:440,backgroundColor:'#153c4a',borderWidth:2,borderColor:C.line,overflow:'hidden'},caption:{position:'absolute',top:14,left:14,color:'#f7dfa5',fontSize:13,letterSpacing:2},object:{position:'absolute',minWidth:48,minHeight:48,alignItems:'center'},label:{fontSize:11,color:C.cream,backgroundColor:'#102a35dd',padding:3},button:{backgroundColor:C.panel2,borderWidth:1,borderColor:C.line,padding:12,minHeight:48,justifyContent:'center'},text:{color:C.cream,fontSize:15,lineHeight:23},muted:{color:C.muted,fontSize:12,lineHeight:19},title:{color:C.gold,fontSize:22,fontWeight:'bold'},scrim:{flex:1,backgroundColor:'#000b',justifyContent:'center',padding:12},sheet:{maxHeight:'94%',backgroundColor:C.bg,borderColor:C.line,borderWidth:2},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},card:{padding:10,backgroundColor:C.panel,flexGrow:1,flexBasis:'44%',gap:8}});
