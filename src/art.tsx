import React from 'react';
import Svg, {Defs,LinearGradient,Stop,Rect,Path,Polygon,Circle,G,Line} from 'react-native-svg';

type VistaProps={height?:number;mode?:'camp'|'trail';};
const trees=[16,35,54,294,317,343].map((x,i)=>({x,y:i%2?132:151,s:i%3===0?1.2:0.9}));
export function MountainVista({height=230,mode='camp'}:VistaProps){
 return <Svg height={height} width="100%" viewBox="0 0 360 210" preserveAspectRatio="xMidYMid slice">
  <Defs>
   <LinearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%"><Stop offset="0" stopColor="#0C314A"/><Stop offset=".52" stopColor="#4B6477"/><Stop offset=".78" stopColor="#DA9265"/><Stop offset="1" stopColor="#F3BE79"/></LinearGradient>
   <LinearGradient id="lake" x1="0%" y1="0%" x2="0%" y2="100%"><Stop offset="0" stopColor="#649AA2"/><Stop offset="1" stopColor="#174051"/></LinearGradient>
  </Defs>
  <Rect width="360" height="210" fill="url(#sky)"/>
  {[[14,24],[35,18],[98,33],[120,10],[208,21],[272,17],[337,32]].map(([x,y],i)=><Rect key={'star'+i} x={x} y={y} width="2" height="2" fill="#F9D89C" opacity=".8"/>)}
  <Circle cx="255" cy="86" r="22" fill="#F8D8A0" opacity=".18"/><Circle cx="255" cy="86" r="14" fill="#FFD68A"/>
  <Path d="M0 119 L24 104 L35 110 L77 54 L103 90 L119 72 L153 108 L182 68 L208 100 L241 52 L277 100 L303 80 L360 115 V210 H0Z" fill="#456478"/>
  <Path d="M53 88 L77 54 L101 86 L85 78 L77 64 L68 80Z M161 94 L182 68 L201 91 L188 86 L182 76 L176 88Z M222 82 L241 52 L268 91 L251 82 L242 64 L233 79Z" fill="#C7D5D1"/>
  <Path d="M0 139 L39 126 L65 139 L119 88 L167 137 L216 102 L258 131 L311 99 L360 133 V210 H0Z" fill="#2B5565"/>
  <Path d="M0 153 L31 142 L45 148 L92 115 L118 143 L155 135 L178 147 L233 111 L278 154 L314 132 L360 149 V210 H0Z" fill="#1B4455"/>
  <Path d="M128 167 Q191 145 245 167 L277 210 H106 Z" fill="url(#lake)" opacity=".85"/>
  {[[165,168,38],[201,181,26],[145,193,43]].map(([x,y,w],i)=><Rect key={'river'+i} x={x} y={y} width={w} height="2" fill="#A3BABA" opacity=".4"/>)}
  <Path d="M0 162 L17 147 L37 160 L55 137 L76 155 L89 148 L112 168 L129 163 L124 210 H0Z M263 180 L278 154 L302 168 L324 139 L345 153 L360 147 V210 H250Z" fill="#0A303C"/>
  {trees.map((t,i)=><G key={i} transform={'translate('+t.x+' '+t.y+') scale('+t.s+')'}>
    <Rect x="-2" y="12" width="4" height="30" fill="#493A30"/>
    <Polygon points="0,-10 -13,15 -7,15 -17,26 17,26 7,15 13,15" fill={i%2?'#071F2A':'#0F3641'}/>
    <Rect x="-5" y="7" width="3" height="2" fill="#245B56" opacity=".8"/>
  </G>)}
  <Path d="M0 189 L48 181 L88 194 L124 186 L174 199 L207 192 L257 199 L299 179 L360 188 V210 H0Z" fill="#0C2029"/>
  <Path d="M0 201 L37 193 L67 202 L95 192 L122 203 H360 V210 H0Z" fill="#203D44"/>
  {mode==='camp'? <>
    <Path d="M18 171 L54 123 L91 174Z" fill="#C89A65"/><Path d="M54 123 L54 173 L89 174Z" fill="#6E6955"/><Path d="M45 173 L56 145 L68 173Z" fill="#142A35"/>
    <Rect x="8" y="171" width="83" height="3" fill="#4F4739"/>
    <Rect x="95" y="166" width="3" height="32" fill="#B08155"/><Rect x="86" y="163" width="26" height="4" fill="#B08155"/>
    <Rect x="103" y="171" width="8" height="11" fill="#F9C575"/><Rect x="101" y="170" width="12" height="2" fill="#715339"/>
    <Path d="M74 185 L79 175 L83 186 L88 177 L91 188 Z" fill="#ED994F"/><Rect x="80" y="183" width="9" height="6" fill="#F9CD72"/>
  </>:<>
    <Path d="M15 180 L72 166 L124 183" stroke="#C99A5D" strokeWidth="3" fill="none" strokeDasharray="6,5"/>
    <Circle cx="73" cy="167" r="5" fill="#D5AC6B"/><Circle cx="73" cy="167" r="2" fill="#2A4651"/>
  </>}
  <G transform="translate(160 128)">
    <Rect x="13" y="0" width="12" height="6" fill="#392E2A"/><Rect x="10" y="6" width="18" height="12" fill="#DBA47D"/>
    <Rect x="7" y="18" width="25" height="35" fill="#A7A49A"/><Rect x="9" y="22" width="19" height="5" fill="#D7C5A4"/>
    <Rect x="1" y="24" width="9" height="28" fill="#30504F"/><Rect x="29" y="25" width="8" height="28" fill="#CAA17A"/>
    <Rect x="6" y="52" width="11" height="25" fill="#384A4A"/><Rect x="20" y="52" width="11" height="25" fill="#384A4A"/>
    <Rect x="5" y="76" width="14" height="5" fill="#D28C51"/><Rect x="20" y="76" width="14" height="5" fill="#D28C51"/>
    <Rect x="0" y="18" width="9" height="34" fill="#294F52"/><Rect x="-4" y="28" width="6" height="20" fill="#16323C"/>
    <Rect x="27" y="38" width="10" height="13" fill="#AB5E3F"/>
  </G>
 </Svg>;
}

const cells: {x:number;y:number;w:number;h:number;c:string}[]=[
 {x:47,y:17,w:37,h:7,c:'#302923'},{x:40,y:23,w:52,h:9,c:'#342A26'},{x:45,y:32,w:44,h:8,c:'#392923'},
 {x:49,y:34,w:34,h:25,c:'#DBA985'},{x:80,y:39,w:7,h:12,c:'#BD7F60'},{x:43,y:42,w:7,h:9,c:'#C88E6B'},
 {x:56,y:37,w:6,h:4,c:'#382C28'},{x:77,y:37,w:5,h:4,c:'#382C28'},{x:63,y:50,w:12,h:3,c:'#9E6553'},
 {x:41,y:58,w:48,h:11,c:'#E4D8BF'},{x:35,y:67,w:58,h:51,c:'#D2C8B6'},
 {x:40,y:68,w:49,h:9,c:'#FCEDCF'},{x:33,y:77,w:8,h:35,c:'#8D8F85'},
 {x:90,y:77,w:11,h:34,c:'#7B9A8C'},{x:48,y:79,w:5,h:37,c:'#5A6F70'},
 {x:33,y:110,w:62,h:10,c:'#3A4847'},{x:38,y:119,w:26,h:44,c:'#52645F'},{x:67,y:119,w:25,h:44,c:'#405756'},
 {x:38,y:151,w:18,h:16,c:'#384645'},{x:69,y:151,w:17,h:16,c:'#344A4B'},
 {x:35,y:164,w:30,h:10,c:'#B57A4E'},{x:68,y:164,w:28,h:10,c:'#B57A4E'},
 {x:37,y:170,w:33,h:7,c:'#21292D'},{x:67,y:170,w:34,h:7,c:'#21292D'},
 {x:18,y:78,w:18,h:42,c:'#21464B'},{x:15,y:91,w:6,h:29,c:'#19323B'},
 {x:19,y:74,w:14,h:8,c:'#567A70'},{x:22,y:90,w:11,h:5,c:'#C28F55'},
 {x:26,y:119,w:12,h:17,c:'#B66841'},{x:28,y:121,w:8,h:2,c:'#E4B36D'},
 {x:92,y:78,w:9,h:32,c:'#D5A081'},{x:96,y:108,w:8,h:14,c:'#C38A70'},
 {x:91,y:114,w:19,h:10,c:'#394645'},{x:39,y:117,w:54,h:6,c:'#735A43'},
 {x:49,y:10,w:8,h:10,c:'#302923'},{x:75,y:12,w:8,h:10,c:'#302923'},
];
export function HeroSprite({height=205}: {height?:number}){
 return <Svg viewBox="0 0 132 190" height={height} width="100%" preserveAspectRatio="xMidYMid meet">
  <Rect x="20" y="178" width="90" height="4" fill="#112832" opacity=".5"/>
  {cells.map((r,i)=><Rect key={i} x={r.x+4} y={r.y+3} width={r.w} height={r.h} fill={r.c}/>)}
  <Rect x="48" y="72" width="5" height="43" fill="#F4D9A9" opacity=".65"/>
  <Rect x="69" y="120" width="5" height="32" fill="#77867A"/>
  <Rect x="92" y="100" width="3" height="19" fill="#F4C57B"/>
  <Rect x="100" y="111" width="5" height="5" fill="#F4C57B"/>
  <Rect x="26" y="128" width="13" height="12" rx="1" fill="#A9533F"/>
 </Svg>;
}
export function PixelGlyph({name='mountain',size=30,color='#F5BE6B'}:{name?:string;size?:number;color?:string}){
 const patterns:Record<string,number[][]>={
  mountain:[[8,4,4,3],[6,7,4,3],[4,10,4,3],[11,10,4,3],[2,13,4,3],[14,13,4,3],[17,7,4,3],[20,10,4,3],[23,13,4,3],[2,17,28,3]],
  boot:[[5,3,10,5],[4,8,10,9],[12,13,12,5],[3,18,23,5],[2,23,27,4]],
  star:[[14,2,4,8],[7,11,18,4],[11,15,11,5],[14,20,4,10],[3,13,5,3],[25,13,5,3]],
  compass:[[13,3,6,6],[7,9,18,14],[11,7,10,20],[13,12,6,6],[13,25,6,5]],
  journal:[[5,4,22,26],[8,7,16,4],[8,14,16,3],[8,20,12,3],[2,5,2,25]],
  pick:[[7,3,22,5],[14,6,5,24],[8,22,17,4],[6,26,5,4]],
  fire:[[14,3,5,9],[8,12,16,9],[4,21,24,7],[10,24,11,6]],
  heart:[[5,7,8,6],[19,7,8,6],[3,12,27,8],[8,20,19,5],[13,25,9,4]],
 };
 return <Svg width={size} height={size} viewBox="0 0 32 32">
  {(patterns[name]||patterns.mountain).map((p,i)=><Rect key={i} x={p[0]} y={p[1]} width={p[2]} height={p[3]} fill={color}/>)}
 </Svg>;
}
export function PixelMap({height=118}:{height?:number}){
 return <Svg height={height} width="100%" viewBox="0 0 330 124" preserveAspectRatio="xMidYMid meet">
  <Rect width="330" height="124" fill="#173C47"/>
  <Path d="M0 71 L35 23 L65 65 L112 18 L160 70 L192 28 L230 68 L280 19 L330 55 V124 H0Z" fill="#345D5D"/>
  <Path d="M0 82 L57 48 L83 81 L131 42 L180 84 L241 43 L294 81 L330 52 V124 H0Z" fill="#244C50"/>
  <Path d="M0 100 L54 78 L99 105 L160 76 L212 99 L279 70 L330 100 V124 H0Z" fill="#1B4848"/>
  <Path d="M20 109 L62 82 L100 95 L146 62 L195 88 L243 47 L283 63" fill="none" stroke="#F0B96A" strokeWidth="3" strokeDasharray="5 6"/>
  {[[20,109],[62,82],[100,95],[146,62],[195,88],[243,47],[283,63]].map(([x,y],i)=><G key={i}>
   <Circle cx={x} cy={y} r={i===6?9:6} fill={i===6?'#F3B66D':'#1A353F'} stroke="#EFC385" strokeWidth="2"/>
   {i===6?<Rect x={x-3} y={y-3} width="6" height="6" fill="#FFF2D2"/>:null}
  </G>)}
 </Svg>;
}
