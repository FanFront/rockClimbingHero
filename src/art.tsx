import React from "react";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Polygon,
  Circle,
  G,
  Line,
} from "react-native-svg";

type VistaProps = { height?: number; mode?: "camp" | "trail" };
const trees = [16, 35, 54, 294, 317, 343].map((x, i) => ({
  x,
  y: i % 2 ? 132 : 151,
  s: i % 3 === 0 ? 1.2 : 0.9,
}));
export function MountainVista({ height = 330, mode = "camp" }: VistaProps) {
  return (
    <Svg
      height={height}
      width="100%"
      viewBox="0 0 360 330"
      preserveAspectRatio="xMidYMid meet"
    >
      <Rect width="360" height="330" fill="#102E43" />
      {Array.from({ length: 36 }, (_, i) => (
        <Rect
          key={i}
          x={(i * 67 + 13) % 350}
          y={(i * 29 + 9) % 125}
          width={i % 4 === 0 ? 3 : 2}
          height={i % 4 === 0 ? 3 : 2}
          fill={i % 3 === 0 ? "#F7D99A" : "#7EA6B5"}
        />
      ))}
      <Rect x="270" y="28" width="24" height="28" fill="#F4D8A0" />
      <Rect x="266" y="34" width="32" height="16" fill="#F4D8A0" />
      <Rect x="280" y="28" width="14" height="19" fill="#102E43" />
      <Path
        d="M0 167 H15 V147 H33 V123 H45 V108 H57 V90 H69 V69 H81 V90 H93 V108 H109 V128 H129 V111 H141 V89 H153 V69 H165 V47 H177 V69 H189 V89 H201 V115 H225 V98 H237 V76 H249 V64 H261 V86 H273 V108 H297 V122 H321 V145 H345 V156 H360 V330 H0Z"
        fill="#34596D"
      />
      <Path
        d="M57 90 H69 V69 H81 V90 H93 V108 H81 V98 H69 V108 H57Z M141 89 H153 V69 H165 V47 H177 V69 H189 V89 H177 V79 H165 V69 H159 V89Z M237 86 H249 V64 H261 V86 H273 V98 H261 V90 H249 V98 H237Z"
        fill="#B4CCCB"
      />
      <Path
        d="M0 182 H25 V163 H47 V151 H69 V170 H98 V154 H120 V133 H142 V154 H164 V173 H191 V159 H212 V142 H234 V161 H256 V181 H279 V163 H301 V149 H323 V173 H345 V186 H360 V330 H0Z"
        fill="#244C5D"
      />
      <Path
        d="M174 189 H218 V203 H203 V221 H217 V237 H237 V257 H221 V278 H238 V330 H155 V294 H180 V274 H167 V252 H183 V233 H171 V213 H184 V201 H174Z"
        fill="#397786"
      />
      {[196, 213, 238, 261].map((y, i) => (
        <Rect
          key={y}
          x={183 + (i % 2) * 12}
          y={y}
          width={17 + i * 3}
          height="3"
          fill="#659DA2"
        />
      ))}
      {Array.from({ length: 18 }, (_, i) => {
        const x = i < 9 ? i * 19 : 246 + (i - 9) * 15,
          y = 151 + (i % 4) * 18;
        return (
          <G key={i} transform={`translate(${x} ${y})`}>
            <Rect x="-2" y="10" width="5" height="53" fill="#3D4A3C" />
            <Path
              d="M-3 0 H4 V10 H10 V20 H16 V29 H11 V33 H21 V42 H-20 V33 H-10 V29 H-15 V20 H-9 V10 H-3Z"
              fill={i % 2 ? "#0B303B" : "#123F44"}
            />
            <Rect x="-7" y="19" width="5" height="3" fill="#28615C" />
          </G>
        );
      })}
      <Path
        d="M0 275 H37 V267 H74 V277 H113 V271 H153 V284 H199 V276 H245 V264 H288 V272 H326 V260 H360 V330 H0Z"
        fill="#112E34"
      />
      <Path
        d="M0 304 H58 V299 H108 V306 H167 V300 H216 V309 H270 V300 H313 V305 H360 V330 H0Z"
        fill="#1A3C3F"
      />
      {mode === "camp" ? (
        <>
          <Path
            d="M20 253 H28 V241 H36 V229 H44 V217 H52 V205 H60 V193 H68 V205 H76 V217 H84 V229 H92 V241 H100 V253Z"
            fill="#D9A75F"
          />
          <Path
            d="M60 193 H68 V205 H76 V217 H84 V229 H92 V241 H100 V253 H60Z"
            fill="#92744D"
          />
          <Path
            d="M46 253 V241 H50 V229 H56 V217 H62 V229 H68 V241 H72 V253Z"
            fill="#152E37"
          />
          <Rect x="12" y="253" width="94" height="5" fill="#63503A" />
          <Rect x="104" y="232" width="4" height="46" fill="#A88656" />
          <Rect x="99" y="229" width="24" height="4" fill="#A88656" />
          <Rect x="116" y="236" width="11" height="16" fill="#F8CA75" />
          <Rect x="120" y="239" width="3" height="9" fill="#FFF1BB" />
          <Rect x="92" y="286" width="52" height="4" fill="#805139" />
          <Rect x="99" y="290" width="39" height="4" fill="#A27349" />
          <Path
            d="M101 285 V273 H107 V263 H113 V251 H119 V264 H125 V272 H131 V285Z"
            fill="#E88143"
          />
          <Path
            d="M109 286 V275 H115 V269 H121 V278 H125 V286Z"
            fill="#FBE19A"
          />
          {[0, 1, 2].map((i) => (
            <Rect
              key={i}
              x={109 + i * 9}
              y={241 - i * 13}
              width="3"
              height="3"
              fill="#F5BE6B"
            />
          ))}
        </>
      ) : (
        <Path
          d="M15 294 H43 V281 H72 V266 H104"
          stroke="#E9B56D"
          strokeWidth="4"
          strokeDasharray="5 7"
          fill="none"
        />
      )}
      <G transform="translate(161 220)">
        <Rect x="8" y="0" width="23" height="7" fill="#E8B865" />
        <Rect x="4" y="7" width="31" height="5" fill="#F9D28A" />
        <Rect x="10" y="12" width="20" height="17" fill="#D8A17B" />
        <Rect x="24" y="16" width="3" height="3" fill="#20303A" />
        <Rect x="7" y="30" width="28" height="35" fill="#5E9391" />
        <Rect x="6" y="29" width="29" height="7" fill="#E9AF57" />
        <Rect x="-3" y="34" width="11" height="32" fill="#28565F" />
        <Rect x="31" y="37" width="8" height="25" fill="#D8A17B" />
        <Rect x="8" y="65" width="11" height="25" fill="#47626A" />
        <Rect x="24" y="65" width="11" height="25" fill="#3C545F" />
        <Rect x="5" y="88" width="16" height="6" fill="#D89B59" />
        <Rect x="23" y="88" width="16" height="6" fill="#D89B59" />
        <Rect x="26" y="56" width="12" height="11" fill="#A45F42" />
      </G>
      {Array.from({ length: 16 }, (_, i) => (
        <Rect
          key={i}
          x={(i * 53) % 355}
          y={315 + (i % 3) * 5}
          width="5"
          height="2"
          fill={i % 2 ? "#34615A" : "#426F62"}
        />
      ))}
    </Svg>
  );
}

const cells: { x: number; y: number; w: number; h: number; c: string }[] = [
  { x: 47, y: 17, w: 37, h: 7, c: "#302923" },
  { x: 40, y: 23, w: 52, h: 9, c: "#342A26" },
  { x: 45, y: 32, w: 44, h: 8, c: "#392923" },
  { x: 49, y: 34, w: 34, h: 25, c: "#DBA985" },
  { x: 80, y: 39, w: 7, h: 12, c: "#BD7F60" },
  { x: 43, y: 42, w: 7, h: 9, c: "#C88E6B" },
  { x: 56, y: 37, w: 6, h: 4, c: "#382C28" },
  { x: 77, y: 37, w: 5, h: 4, c: "#382C28" },
  { x: 63, y: 50, w: 12, h: 3, c: "#9E6553" },
  { x: 41, y: 58, w: 48, h: 11, c: "#E4D8BF" },
  { x: 35, y: 67, w: 58, h: 51, c: "#D2C8B6" },
  { x: 40, y: 68, w: 49, h: 9, c: "#FCEDCF" },
  { x: 33, y: 77, w: 8, h: 35, c: "#8D8F85" },
  { x: 90, y: 77, w: 11, h: 34, c: "#7B9A8C" },
  { x: 48, y: 79, w: 5, h: 37, c: "#5A6F70" },
  { x: 33, y: 110, w: 62, h: 10, c: "#3A4847" },
  { x: 38, y: 119, w: 26, h: 44, c: "#52645F" },
  { x: 67, y: 119, w: 25, h: 44, c: "#405756" },
  { x: 38, y: 151, w: 18, h: 16, c: "#384645" },
  { x: 69, y: 151, w: 17, h: 16, c: "#344A4B" },
  { x: 35, y: 164, w: 30, h: 10, c: "#B57A4E" },
  { x: 68, y: 164, w: 28, h: 10, c: "#B57A4E" },
  { x: 37, y: 170, w: 33, h: 7, c: "#21292D" },
  { x: 67, y: 170, w: 34, h: 7, c: "#21292D" },
  { x: 18, y: 78, w: 18, h: 42, c: "#21464B" },
  { x: 15, y: 91, w: 6, h: 29, c: "#19323B" },
  { x: 19, y: 74, w: 14, h: 8, c: "#567A70" },
  { x: 22, y: 90, w: 11, h: 5, c: "#C28F55" },
  { x: 26, y: 119, w: 12, h: 17, c: "#B66841" },
  { x: 28, y: 121, w: 8, h: 2, c: "#E4B36D" },
  { x: 92, y: 78, w: 9, h: 32, c: "#D5A081" },
  { x: 96, y: 108, w: 8, h: 14, c: "#C38A70" },
  { x: 91, y: 114, w: 19, h: 10, c: "#394645" },
  { x: 39, y: 117, w: 54, h: 6, c: "#735A43" },
  { x: 49, y: 10, w: 8, h: 10, c: "#302923" },
  { x: 75, y: 12, w: 8, h: 10, c: "#302923" },
];
export function HeroSprite({ height = 205 }: { height?: number }) {
  return (
    <Svg
      viewBox="0 0 132 190"
      height={height}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      <Rect x="20" y="178" width="90" height="4" fill="#112832" opacity=".5" />
      {cells.map((r, i) => (
        <Rect
          key={i}
          x={r.x + 4}
          y={r.y + 3}
          width={r.w}
          height={r.h}
          fill={r.c}
        />
      ))}
      <Rect x="48" y="72" width="5" height="43" fill="#F4D9A9" opacity=".65" />
      <Rect x="69" y="120" width="5" height="32" fill="#77867A" />
      <Rect x="92" y="100" width="3" height="19" fill="#F4C57B" />
      <Rect x="100" y="111" width="5" height="5" fill="#F4C57B" />
      <Rect x="26" y="128" width="13" height="12" fill="#A9533F" />
      <Rect x="47" y="15" width="45" height="13" fill="#D5A65C" />
      <Rect x="43" y="27" width="52" height="7" fill="#F3CB7D" />
      <Rect x="51" y="17" width="8" height="9" fill="#FFE4A6" />
      <Rect x="45" y="62" width="45" height="8" fill="#D99C50" />
      <Rect x="75" y="68" width="9" height="24" fill="#F2C877" />
      <Path
        d="M23 85 H35 V117 H23Z M25 89 H32 V113 H25Z"
        fill="#BD995C"
        fillRule="evenodd"
      />
      <Rect x="99" y="80" width="4" height="56" fill="#8DB2AC" />
      <Rect x="94" y="79" width="18" height="5" fill="#E3D2A8" />
    </Svg>
  );
}
export function PixelGlyph({
  name = "mountain",
  size = 30,
  color = "#F5BE6B",
}: {
  name?: string;
  size?: number;
  color?: string;
}) {
  const patterns: Record<string, number[][]> = {
    PWR: [
      [6, 3, 7, 9],
      [18, 3, 7, 9],
      [3, 10, 26, 8],
      [9, 18, 14, 10],
    ],
    TEC: [
      [4, 5, 7, 10],
      [13, 12, 12, 6],
      [3, 20, 25, 6],
    ],
    END: [
      [3, 10, 5, 12],
      [9, 6, 5, 20],
      [15, 3, 5, 26],
      [21, 8, 5, 16],
    ],
    MOB: [
      [13, 2, 6, 6],
      [8, 10, 16, 5],
      [4, 15, 7, 12],
      [20, 15, 7, 12],
    ],
    MND: [
      [12, 2, 8, 6],
      [7, 9, 18, 12],
      [11, 23, 10, 5],
      [2, 12, 3, 6],
      [27, 12, 3, 6],
    ],
    hero: [
      [12, 2, 8, 8],
      [8, 12, 16, 10],
      [7, 24, 7, 6],
      [18, 24, 7, 6],
    ],
    lock: [
      [9, 4, 14, 4],
      [6, 8, 4, 8],
      [22, 8, 4, 8],
      [4, 15, 24, 14],
      [14, 20, 4, 6],
    ],
    "quiet-feet": [
      [5, 3, 8, 12],
      [13, 13, 12, 6],
      [3, 22, 25, 5],
      [25, 3, 3, 5],
    ],
    flagging: [
      [13, 3, 6, 6],
      [12, 10, 7, 10],
      [2, 21, 14, 5],
      [17, 20, 13, 5],
    ],
    "hip-control": [
      [12, 2, 7, 6],
      [7, 10, 15, 5],
      [13, 15, 10, 5],
      [4, 22, 10, 6],
      [23, 20, 5, 9],
    ],
    "route-reading": [
      [3, 3, 4, 25],
      [7, 4, 20, 4],
      [10, 11, 14, 4],
      [10, 19, 9, 4],
      [25, 23, 4, 5],
    ],
    "grip-control": [
      [5, 8, 4, 12],
      [11, 3, 4, 17],
      [17, 5, 4, 15],
      [23, 8, 4, 15],
      [9, 20, 15, 8],
    ],
    pacing: [
      [3, 21, 5, 7],
      [10, 16, 5, 12],
      [17, 10, 5, 18],
      [24, 3, 5, 25],
    ],
    "high-steps": [
      [2, 24, 9, 5],
      [11, 17, 9, 5],
      [20, 10, 10, 5],
      [23, 2, 5, 6],
    ],
    projecting: [
      [3, 3, 7, 7],
      [21, 3, 7, 7],
      [12, 13, 8, 7],
      [3, 23, 7, 7],
      [21, 23, 7, 7],
      [9, 7, 14, 3],
      [14, 8, 3, 18],
    ],
    mountain: [
      [8, 4, 4, 3],
      [6, 7, 4, 3],
      [4, 10, 4, 3],
      [11, 10, 4, 3],
      [2, 13, 4, 3],
      [14, 13, 4, 3],
      [17, 7, 4, 3],
      [20, 10, 4, 3],
      [23, 13, 4, 3],
      [2, 17, 28, 3],
    ],
    boot: [
      [5, 3, 10, 5],
      [4, 8, 10, 9],
      [12, 13, 12, 5],
      [3, 18, 23, 5],
      [2, 23, 27, 4],
    ],
    star: [
      [14, 2, 4, 8],
      [7, 11, 18, 4],
      [11, 15, 11, 5],
      [14, 20, 4, 10],
      [3, 13, 5, 3],
      [25, 13, 5, 3],
    ],
    compass: [
      [13, 3, 6, 6],
      [7, 9, 18, 14],
      [11, 7, 10, 20],
      [13, 12, 6, 6],
      [13, 25, 6, 5],
    ],
    journal: [
      [5, 4, 22, 26],
      [8, 7, 16, 4],
      [8, 14, 16, 3],
      [8, 20, 12, 3],
      [2, 5, 2, 25],
    ],
    pick: [
      [7, 3, 22, 5],
      [14, 6, 5, 24],
      [8, 22, 17, 4],
      [6, 26, 5, 4],
    ],
    fire: [
      [14, 3, 5, 9],
      [8, 12, 16, 9],
      [4, 21, 24, 7],
      [10, 24, 11, 6],
    ],
    heart: [
      [5, 7, 8, 6],
      [19, 7, 8, 6],
      [3, 12, 27, 8],
      [8, 20, 19, 5],
      [13, 25, 9, 4],
    ],
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {(patterns[name] || patterns.mountain).map((p, i) => (
        <Rect
          key={i}
          x={p[0]}
          y={p[1]}
          width={p[2]}
          height={p[3]}
          fill={color}
        />
      ))}
    </Svg>
  );
}
export function PixelMap({
  height = 330,
  unlocked = 1,
  onNode,
}: {
  height?: number;
  unlocked?: number;
  onNode?: (i: number) => void;
}) {
  const nodes = [
    [51, 279],
    [141, 240],
    [86, 188],
    [204, 155],
    [159, 97],
    [267, 44],
  ];
  return (
    <Svg
      height={height}
      width="100%"
      viewBox="0 0 330 330"
      preserveAspectRatio="xMidYMid meet"
    >
      <Rect width="330" height="330" fill="#10333F" />
      {Array.from({ length: 28 }, (_, i) => (
        <G key={i} transform={`translate(${(i * 71) % 320} ${(i * 43) % 300})`}>
          <Rect x="0" y="8" width="4" height="15" fill="#366057" />
          <Path d="M2 0 L-8 14 H12Z" fill="#215249" />
        </G>
      ))}
      <Path
        d="M174 330 L191 280 L165 240 L179 205 L145 174 L164 128 L144 89 L166 0"
        stroke="#377B8B"
        strokeWidth="15"
        fill="none"
      />
      <Path
        d="M223 99 L267 8 L320 102Z M22 152 L66 67 L114 152Z"
        fill="#456878"
      />
      <Path
        d="M250 43 L267 8 L286 44 L273 38 L266 24 L258 40Z M49 101 L66 67 L84 100 L69 88Z"
        fill="#AFC6C0"
      />
      <Path
        d="M51 279 L141 240 L86 188 L204 155 L159 97 L267 44"
        fill="none"
        stroke="#6B8276"
        strokeWidth="4"
        strokeDasharray="5 6"
      />
      {nodes.map(([x, y], i) => (
        <G
          key={i}
          onPress={() => onNode?.(i)}
          accessible
          accessibilityRole="button"
          accessibilityLabel={String(i + 1)}
        >
          <Rect
            x={x - 22}
            y={y - 22}
            width="44"
            height="44"
            fill="#10333F"
            fillOpacity="0.01"
          />
          <Rect
            x={x - 13}
            y={y - 13}
            width="26"
            height="26"
            fill={i < unlocked ? "#F5BE6B" : "#264652"}
            stroke={i === unlocked - 1 ? "#FFF2CA" : "#688B87"}
            strokeWidth="3"
          />
          {i < unlocked ? (
            <Path
              d={`M${x - 7} ${y + 4} L${x} ${y - 6} L${x + 7} ${y + 4}Z`}
              fill="#17333B"
            />
          ) : (
            <>
              <Rect x={x - 5} y={y - 2} width="10" height="9" fill="#82989A" />
              <Path
                d={`M${x - 3} ${y - 2} V${y - 7} H${x + 3} V${y - 2}`}
                stroke="#82989A"
                strokeWidth="2"
                fill="none"
              />
            </>
          )}
        </G>
      ))}
      <Rect x="11" y="305" width="308" height="3" fill="#2A535A" />
    </Svg>
  );
}
