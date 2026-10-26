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
  Text as SvgText,
} from "react-native-svg";

type VistaProps = { height?: number; mode?: "camp" | "trail" };
const trees = [16, 35, 54, 294, 317, 343].map((x, i) => ({
  x,
  y: i % 2 ? 132 : 151,
  s: i % 3 === 0 ? 1.2 : 0.9,
}));
export function MountainVista({ height = 230, mode = "camp" }: VistaProps) {
  return (
    <Svg
      height={height}
      width="100%"
      viewBox="0 0 360 210"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <LinearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor="#0C314A" />
          <Stop offset=".52" stopColor="#234C60" />
          <Stop offset=".78" stopColor="#285867" />
          <Stop offset="1" stopColor="#45747A" />
        </LinearGradient>
        <LinearGradient id="lake" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0" stopColor="#649AA2" />
          <Stop offset="1" stopColor="#174051" />
        </LinearGradient>
      </Defs>
      <Rect width="360" height="210" fill="url(#sky)" />
      {[
        [14, 24],
        [35, 18],
        [98, 33],
        [120, 10],
        [208, 21],
        [272, 17],
        [337, 32],
      ].map(([x, y], i) => (
        <Rect
          key={"star" + i}
          x={x}
          y={y}
          width="2"
          height="2"
          fill="#F9D89C"
          opacity=".8"
        />
      ))}
      <Circle cx="255" cy="86" r="22" fill="#F8D8A0" opacity=".18" />
      <Circle cx="255" cy="86" r="14" fill="#FFD68A" />
      <Path
        d="M0 119 L24 104 L35 110 L77 54 L103 90 L119 72 L153 108 L182 68 L208 100 L241 52 L277 100 L303 80 L360 115 V210 H0Z"
        fill="#456478"
      />
      <Path
        d="M53 88 L77 54 L101 86 L85 78 L77 64 L68 80Z M161 94 L182 68 L201 91 L188 86 L182 76 L176 88Z M222 82 L241 52 L268 91 L251 82 L242 64 L233 79Z"
        fill="#C7D5D1"
      />
      <Path
        d="M0 139 L39 126 L65 139 L119 88 L167 137 L216 102 L258 131 L311 99 L360 133 V210 H0Z"
        fill="#2B5565"
      />
      <Path
        d="M0 153 L31 142 L45 148 L92 115 L118 143 L155 135 L178 147 L233 111 L278 154 L314 132 L360 149 V210 H0Z"
        fill="#1B4455"
      />
      <Path
        d="M128 167 Q191 145 245 167 L277 210 H106 Z"
        fill="url(#lake)"
        opacity=".85"
      />
      {[
        [165, 168, 38],
        [201, 181, 26],
        [145, 193, 43],
      ].map(([x, y, w], i) => (
        <Rect
          key={"river" + i}
          x={x}
          y={y}
          width={w}
          height="2"
          fill="#A3BABA"
          opacity=".4"
        />
      ))}
      <Path
        d="M0 162 L17 147 L37 160 L55 137 L76 155 L89 148 L112 168 L129 163 L124 210 H0Z M263 180 L278 154 L302 168 L324 139 L345 153 L360 147 V210 H250Z"
        fill="#0A303C"
      />
      {trees.map((t, i) => (
        <G
          key={i}
          transform={"translate(" + t.x + " " + t.y + ") scale(" + t.s + ")"}
        >
          <Rect x="-2" y="12" width="4" height="30" fill="#493A30" />
          <Polygon
            points="0,-10 -13,15 -7,15 -17,26 17,26 7,15 13,15"
            fill={i % 2 ? "#071F2A" : "#0F3641"}
          />
          <Rect x="-5" y="7" width="3" height="2" fill="#245B56" opacity=".8" />
        </G>
      ))}
      <Path
        d="M0 189 L48 181 L88 194 L124 186 L174 199 L207 192 L257 199 L299 179 L360 188 V210 H0Z"
        fill="#0C2029"
      />
      <Path
        d="M0 201 L37 193 L67 202 L95 192 L122 203 H360 V210 H0Z"
        fill="#203D44"
      />
      {mode === "camp" ? (
        <>
          <Rect x="240" y="141" width="5" height="48" fill="#80624B" />
          <Rect x="286" y="141" width="5" height="48" fill="#80624B" />
          <Rect x="234" y="136" width="63" height="34" fill="#B18B5C" />
          <Rect x="238" y="140" width="55" height="26" fill="#493C35" />
          <Rect x="244" y="144" width="15" height="16" fill="#E5C690" />
          <Rect x="267" y="144" width="18" height="13" fill="#C1B28B" />
          <Rect x="111" y="188" width="48" height="5" fill="#7A5034" />
          <Rect x="117" y="192" width="40" height="5" fill="#B47A45" />
          <Path
            d="M115 187V176H121V165H127V155H132V169H140V177H147V187Z"
            fill="#D96D37"
          />
          <Path d="M123 188V177H128V170H133V180H140V188Z" fill="#FFD788" />
          <Rect x="120" y="145" width="3" height="4" fill="#F5BE6B" />
          <Rect x="138" y="155" width="2" height="3" fill="#F5BE6B" />

          <Path d="M18 171 L54 123 L91 174Z" fill="#C89A65" />
          <Path d="M54 123 L54 173 L89 174Z" fill="#6E6955" />
          <Path d="M45 173 L56 145 L68 173Z" fill="#142A35" />
          <Rect x="8" y="171" width="83" height="3" fill="#4F4739" />
          <Rect x="95" y="166" width="3" height="32" fill="#B08155" />
          <Rect x="86" y="163" width="26" height="4" fill="#B08155" />
          <Rect x="103" y="171" width="8" height="11" fill="#F9C575" />
          <Rect x="101" y="170" width="12" height="2" fill="#715339" />
          <Path d="M74 185 L79 175 L83 186 L88 177 L91 188 Z" fill="#ED994F" />
          <Rect x="80" y="183" width="9" height="6" fill="#F9CD72" />
        </>
      ) : (
        <>
          <Path
            d="M15 180 L72 166 L124 183"
            stroke="#C99A5D"
            strokeWidth="3"
            fill="none"
            strokeDasharray="6,5"
          />
          <Circle cx="73" cy="167" r="5" fill="#D5AC6B" />
          <Circle cx="73" cy="167" r="2" fill="#2A4651" />
        </>
      )}
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
export function HeroSprite({
  height = 205,
  gold = false,
}: {
  height?: number;
  gold?: boolean;
}) {
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
          fill={
            gold && ["#D2C8B6", "#FCEDCF", "#E4D8BF"].includes(r.c)
              ? "#F5BE6B"
              : r.c
          }
        />
      ))}
      <Rect x="48" y="72" width="5" height="43" fill="#F4D9A9" opacity=".65" />
      <Rect x="69" y="120" width="5" height="32" fill="#77867A" />
      <Rect x="92" y="100" width="3" height="19" fill="#F4C57B" />
      <Rect x="100" y="111" width="5" height="5" fill="#F4C57B" />
      <Rect x="26" y="128" width="13" height="12" rx="1" fill="#A9533F" />
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
  const aliases: Record<string, string> = {
    PWR: "pick",
    TEC: "boot",
    END: "heart",
    MOB: "mobility",
    MND: "compass",
    "quiet-feet": "boot",
    flagging: "flag",
    "hip-control": "hip",
    "route-reading": "map",
    "grip-control": "grip",
    pacing: "pace",
    "high-steps": "steps",
    projecting: "project",
  };
  patterns.mobility = [
    [4, 4, 6, 6],
    [13, 9, 6, 6],
    [21, 3, 6, 6],
    [11, 16, 5, 11],
    [19, 15, 8, 5],
    [3, 25, 11, 4],
  ];
  patterns.flag = [
    [12, 3, 5, 8],
    [9, 12, 11, 8],
    [3, 20, 12, 4],
    [19, 20, 10, 4],
    [13, 24, 5, 6],
  ];
  patterns.hip = [
    [12, 2, 7, 7],
    [6, 10, 20, 5],
    [11, 15, 8, 7],
    [4, 23, 11, 5],
    [20, 20, 6, 10],
  ];
  patterns.map = [
    [2, 5, 8, 23],
    [12, 2, 8, 23],
    [22, 5, 8, 23],
    [5, 10, 3, 3],
    [15, 16, 3, 3],
    [25, 12, 3, 3],
  ];
  patterns.grip = [
    [6, 9, 4, 14],
    [12, 4, 4, 19],
    [18, 6, 4, 17],
    [24, 11, 4, 14],
    [9, 24, 17, 5],
  ];
  patterns.pace = [
    [12, 2, 8, 4],
    [7, 7, 18, 4],
    [4, 12, 24, 13],
    [8, 25, 16, 4],
    [14, 11, 4, 11],
  ];
  patterns.steps = [
    [2, 24, 9, 5],
    [10, 17, 9, 5],
    [18, 10, 9, 5],
    [25, 3, 5, 5],
  ];
  patterns.project = [
    [3, 3, 10, 10],
    [19, 3, 10, 10],
    [3, 19, 10, 10],
    [19, 19, 10, 10],
    [13, 14, 6, 4],
  ];
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {(patterns[aliases[name] || name] || patterns.mountain).map((p, i) => (
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
export function PixelMap({ height = 118 }: { height?: number }) {
  return (
    <Svg
      height={height}
      width="100%"
      viewBox="0 0 330 124"
      preserveAspectRatio="xMidYMid meet"
    >
      <Rect width="330" height="124" fill="#173C47" />
      <Path
        d="M0 71 L35 23 L65 65 L112 18 L160 70 L192 28 L230 68 L280 19 L330 55 V124 H0Z"
        fill="#345D5D"
      />
      <Path
        d="M0 82 L57 48 L83 81 L131 42 L180 84 L241 43 L294 81 L330 52 V124 H0Z"
        fill="#244C50"
      />
      <Path
        d="M0 100 L54 78 L99 105 L160 76 L212 99 L279 70 L330 100 V124 H0Z"
        fill="#1B4848"
      />
      <Path
        d="M20 109 L62 82 L100 95 L146 62 L195 88 L243 47 L283 63"
        fill="none"
        stroke="#F0B96A"
        strokeWidth="3"
        strokeDasharray="5 6"
      />
      {[
        [20, 109],
        [62, 82],
        [100, 95],
        [146, 62],
        [195, 88],
        [243, 47],
        [283, 63],
      ].map(([x, y], i) => (
        <G key={i}>
          <Circle
            cx={x}
            cy={y}
            r={i === 6 ? 9 : 6}
            fill={i === 6 ? "#F3B66D" : "#1A353F"}
            stroke="#EFC385"
            strokeWidth="2"
          />
          {i === 6 ? (
            <Rect x={x - 3} y={y - 3} width="6" height="6" fill="#FFF2D2" />
          ) : null}
        </G>
      ))}
    </Svg>
  );
}

export function ExpeditionMap({
  height = 420,
  unlocked = 0,
  onNode,
}: {
  height?: number;
  unlocked?: number;
  onNode: (index: number) => void;
}) {
  const nodes = [
    [62, 332],
    [230, 274],
    [94, 204],
    [241, 131],
    [171, 53],
  ];
  return (
    <Svg
      height={height}
      width="100%"
      viewBox="0 0 330 380"
      preserveAspectRatio="xMidYMid meet"
    >
      <Rect width="330" height="380" fill="#102D3A" />
      <Path
        d="M0 130H20V110H45V80H65V110H90V130H115V95H140V64H160V30H180V64H202V100H220V71H240V92H260V123H300V150H330V380H0Z"
        fill="#345B6B"
      />
      <Path
        d="M143 63H159V31H180V64H194V76H178V66H164V81H148Z"
        fill="#B5D6CF"
      />
      <Path
        d="M0 201H27V174H50V156H75V186H105V204H135V164H164V142H186V172H213V192H242V166H269V183H306V210H330V380H0Z"
        fill="#204B57"
      />
      <Path
        d="M180 380V351H151V322H174V295H157V267H177V244H167V218H185V200"
        fill="none"
        stroke="#347B88"
        strokeWidth="16"
      />
      {Array.from({ length: 22 }, (_, i) => {
        const x = (i * 67 + 17) % 310,
          y = 145 + ((i * 43) % 210);
        return (
          <G key={i}>
            <Rect x={x + 5} y={y} width="3" height="20" fill="#102A32" />
            <Path
              d={`M${x} ${y + 13}h14l-3 -5h2l-6 -12l-6 12h2Z`}
              fill="#0B353C"
            />
          </G>
        );
      })}
      <Path
        d="M62 332L230 274L94 204L241 131L171 53"
        fill="none"
        stroke="#54737A"
        strokeWidth="4"
        strokeDasharray="5 7"
      />
      {nodes.map(([x, y], i) => (
        <G
          key={i}
          onPress={() => onNode(i)}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`${i + 1}`}
        >
          <Rect
            x={x - 25}
            y={y - 25}
            width="50"
            height="50"
            fill="#102D3A"
            fillOpacity=".01"
          />
          <Rect
            x={x - 16}
            y={y - 16}
            width="32"
            height="32"
            fill={i <= unlocked ? "#F5BE6B" : "#234452"}
            stroke={i === unlocked ? "#FFF0CB" : "#739395"}
            strokeWidth="3"
          />
          <Rect
            x={x - 11}
            y={y - 11}
            width="22"
            height="22"
            fill={i <= unlocked ? "#795631" : "#17303C"}
          />
          <SvgText
            x={x}
            y={y + 5}
            textAnchor="middle"
            fill={i <= unlocked ? "#FFF0CB" : "#9CB2B5"}
            fontSize="15"
            fontWeight="bold"
          >
            {i + 1}
          </SvgText>
          {i === unlocked && (
            <Path d={`M${x - 5} ${y - 31}h10l-5 7Z`} fill="#68D4B5" />
          )}
        </G>
      ))}
    </Svg>
  );
}
