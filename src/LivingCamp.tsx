import { CampScene } from "./CampScene";
import { SectionHeading } from "./UI";
import { Action } from "./UI";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Rect, Path } from "react-native-svg";
import type { AppData } from "./domain";
import type { Language } from "./i18n";
import { C, UI } from "./theme";
import {
  EVENTS,
  ITEMS,
  NPCS,
  chooseAdventure,
  owned,
  say,
  trust,
  world,
} from "./living";
function Sprite({
  color,
  size = 64,
  item = false,
}: {
  color: string;
  size?: number;
  item?: boolean;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3" y="21" width="18" height="2" fill="#071c24" />
      {item ? (
        <>
          <Path d="M6 5H18V8H21V19H18V21H6V19H3V8H6Z" fill={color} />
          <Rect x="6" y="9" width="12" height="2" fill="#fff2bb" />
          <Rect x="10" y="14" width="4" height="4" fill="#24444d" />
        </>
      ) : (
        <>
          <Rect x="7" y="3" width="10" height="8" fill="#edc798" />
          <Path d="M5 6V3H8V1H16V3H19V6Z" fill={color} />
          <Rect x="9" y="7" width="2" height="2" fill="#122d39" />
          <Rect x="15" y="7" width="2" height="2" fill="#122d39" />
          <Path d="M6 11H18V13H20V19H16V17H8V19H4V13H6Z" fill={color} />
          <Rect x="7" y="18" width="4" height="4" fill="#51727b" />
          <Rect x="14" y="18" width="4" height="4" fill="#51727b" />
          <Rect x="8" y="13" width="2" height="3" fill="#f5dfa5" />
        </>
      )}
    </Svg>
  );
}
export function LivingCamp({
  p,
  l,
  save,
  navigate,
  record,
  reduced = false,
}: {
  reduced?: boolean;
  p: AppData;
  l: Language;
  save: (p: AppData) => void;
  navigate: (tab: "quests" | "map" | "hero") => void;
  record: () => void;
}) {
  const [panel, setPanel] = useState<string | null>(null);
  const w = world(p),
    inventory = owned(p),
    pending = w.encounters.find((e) => e.choice === undefined && !e.frozen);
  const copy = (zh: string, en: string) => (l === "en" ? en : zh);
  const action = (label: string, fn: () => void) => (
    <Action label={label} onPress={fn} />
  );
  return (
    <>
      <CampScene
        direction="morning"
        panorama
        reduced={reduced}
        marked={!!p.sessions.length}
      />
      <SectionHeading
        title={copy("总有人为你留个位置", "There’s a place for you here")}
        note={copy(
          "和伙伴聊聊，看看一路带回的收藏。",
          "Catch up with companions and the keepsakes you brought home.",
        )}
      />
      {NPCS.map((npc) => (
        <Pressable
          key={npc.id}
          accessibilityRole="button"
          onPress={() => setPanel(npc.id)}
          style={({ pressed }) => [s.companion, pressed && { opacity: 0.75 }]}
        >
          <Sprite color={npc.color} size={56} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.text}>{say(l, npc.name)}</Text>
            <Text style={s.muted}>
              {copy("坐下来聊聊 · 信任 ", "Sit and talk · Trust ")}
              {trust(p, npc.id)}
            </Text>
          </View>
          <Text style={s.muted}>›</Text>
        </Pressable>
      ))}
      {action(copy("背包与旅途收藏", "Pack & keepsakes"), () =>
        setPanel("pack"),
      )}
      <SectionHeading title={copy("营地里的其他去处", "Around camp")} />
      {action(
        copy("委托板 · 按自己的节奏", "Commission board · your own pace"),
        () => navigate("quests"),
      )}
      {action(
        copy("路标 · 看看走过的路", "Trail signs · revisit the journey"),
        () => {
          save({
            ...p,
            world: { ...w, visited: [...new Set([...w.visited, "grove"])] },
          });
          navigate("map");
        },
      )}
      {action(copy("探险者 · 装扮与成长", "Explorer · outfit & growth"), () =>
        navigate("hero"),
      )}
      {action(copy("回到今天的攀登记录", "Record today’s climbing"), record)}
      {!!w.placed.filter((i) => inventory.includes(i)).length && (
        <>
          <SectionHeading
            title={copy("留在营地的小物", "Little details in camp")}
          />
          <View style={s.grid}>
            {w.placed
              .filter((i) => inventory.includes(i))
              .map((i) => (
                <View key={i} style={s.card}>
                  <Sprite color={ITEMS[i].color} item size={40} />
                  <Text style={s.text}>{say(l, ITEMS[i].name)}</Text>
                </View>
              ))}
          </View>
        </>
      )}
      {pending &&
        action(
          copy("✦ 冒险战报 · 有故事等你选择", "✦ Adventure · A choice awaits"),
          () => setPanel("event"),
        )}
      {action(copy("收藏与旅途手记", "Collection & expedition journal"), () =>
        setPanel("pack"),
      )}
      {panel && (
        <Modal
          transparent
          animationType={reduced ? "none" : "fade"}
          onRequestClose={() => setPanel(null)}
        >
          <SafeAreaView style={s.scrim}>
            <View style={s.sheet}>
              <ScrollView contentContainerStyle={{ gap: 14, padding: 18 }}>
                {action(copy("关闭 · 返回营地", "Close · Return to camp"), () =>
                  setPanel(null),
                )}
                {panel === "event" && pending && (
                  <>
                    <Sprite
                      color={
                        NPCS.find((n) => n.id === EVENTS[pending.event].npc)!
                          .color
                      }
                      size={100}
                    />
                    <Text style={s.title}>
                      {say(l, EVENTS[pending.event].title)}
                    </Text>
                    <Text style={s.text}>
                      {say(l, EVENTS[pending.event].text)}
                    </Text>
                    {EVENTS[pending.event].choices.map((c, i) => (
                      <View key={i}>
                        {action(say(l, c), () => {
                          save(chooseAdventure(p, pending.day, i));
                          setPanel("result-" + pending.day);
                        })}
                        <Text style={s.muted}>
                          {i === 0
                            ? copy("收藏：", "Collect: ") +
                              say(l, ITEMS[EVENTS[pending.event].item].name)
                            : i === 1
                              ? copy(
                                  "伙伴信任 +2 · 推进故事",
                                  "Trust +2 · Advance their story",
                                )
                              : copy(
                                  "揭示地图标记 · 伙伴信任 +1",
                                  "Reveal a map mark · Trust +1",
                                )}
                        </Text>
                      </View>
                    ))}
                    <Text style={s.muted}>
                      {copy(
                        "每天一次冒险，训练和恢复共享。可以稍后选择。",
                        "One adventure per day, shared by training and rest. Choose later if you like.",
                      )}
                    </Text>
                  </>
                )}
                {panel.startsWith("result-") && (
                  <>
                    <Sprite item color="#f5be6b" size={96} />
                    <Text style={s.title}>
                      {copy("营地记住了你的选择", "Camp remembers your choice")}
                    </Text>
                    <Text style={s.text}>
                      {copy(
                        "收藏可在背包装备或摆放；新路标与伙伴故事已经留下。",
                        "Equip or place collectibles in your pack. Trail marks and companion stories are saved.",
                      )}
                    </Text>
                    {action(copy("打开背包", "Open pack"), () =>
                      setPanel("pack"),
                    )}
                  </>
                )}
                {NPCS.filter((n) => n.id === panel).map((n) => (
                  <View key={n.id} style={{ gap: 16 }}>
                    <Sprite color={n.color} size={112} />
                    <Text style={s.title}>{say(l, n.name)}</Text>
                    <Text style={s.muted}>
                      {copy("信任", "Trust")} {trust(p, n.id)} ·{" "}
                      {Math.min(5, 1 + Math.floor(trust(p, n.id) / 2))}/5
                    </Text>
                    <Text style={s.text}>
                      {say(
                        l,
                        n.lines[Math.min(4, Math.floor(trust(p, n.id) / 2))],
                      )}
                    </Text>
                    <Text style={s.muted}>
                      {copy(
                        "一起经历事件会解锁下一段故事；无需连续训练。",
                        "Shared adventures unlock more of their story. No training streak required.",
                      )}
                    </Text>
                    {action(copy("今天也坐一会儿", "Stay by the fire"), () =>
                      setPanel("daily-" + n.id),
                    )}
                  </View>
                ))}
                {panel.startsWith("daily-") && (
                  <Text style={s.text}>
                    {copy(
                      "火光轻轻晃动。伙伴为你留了一个位置，休息也是今天的冒险。",
                      "Firelight dances. Your companion saves you a seat. Rest is an adventure too.",
                    )}
                  </Text>
                )}
                {panel === "pack" && (
                  <>
                    <Text style={s.title}>
                      {copy("收藏册", "Collection")} · {inventory.length}/
                      {ITEMS.length}
                    </Text>
                    <Text style={s.muted}>
                      {copy(
                        "纯外观与故事收藏，不改变身体能力。",
                        "Cosmetics and stories only; no physical ability bonuses.",
                      )}
                    </Text>
                    <View style={s.grid}>
                      {ITEMS.map((item, i) => (
                        <View
                          key={i}
                          style={[
                            s.card,
                            { opacity: inventory.includes(i) ? 1 : 0.4 },
                          ]}
                        >
                          <Sprite
                            color={
                              inventory.includes(i) ? item.color : "#456069"
                            }
                            item
                          />
                          <Text style={s.text}>{say(l, item.name)}</Text>
                          {inventory.includes(i) ? (
                            <>
                              <Text style={s.muted}>
                                {copy("来自：", "From: ") +
                                  say(
                                    l,
                                    EVENTS[
                                      w.encounters.find(
                                        (e) =>
                                          e.choice === 0 &&
                                          !e.frozen &&
                                          EVENTS[e.event].item === i,
                                      )!.event
                                    ].title,
                                  )}
                              </Text>
                              {item.kind !== "clue" &&
                                action(
                                  item.kind === "decor"
                                    ? w.placed.includes(i)
                                      ? copy("收起", "Store")
                                      : copy("摆放", "Place")
                                    : w.equipped === i
                                      ? copy("卸下", "Unequip")
                                      : copy("装备", "Equip"),
                                  () =>
                                    save({
                                      ...p,
                                      world:
                                        item.kind === "decor"
                                          ? {
                                              ...w,
                                              placed: w.placed.includes(i)
                                                ? w.placed.filter(
                                                    (v) => v !== i,
                                                  )
                                                : [...w.placed, i],
                                            }
                                          : {
                                              ...w,
                                              equipped:
                                                w.equipped === i
                                                  ? undefined
                                                  : i,
                                            },
                                    }),
                                )}
                            </>
                          ) : (
                            <Text style={s.muted}>
                              {copy("等待发现", "Undiscovered")}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                    <Text style={s.title}>
                      {copy("旅途手记", "Expedition journal")}
                    </Text>
                    {[...w.encounters].reverse().map((e) => (
                      <View key={e.day} style={s.card}>
                        <Text style={s.text}>
                          {e.day} · {say(l, EVENTS[e.event].title)}
                        </Text>
                        <Text style={s.muted}>
                          {e.choice === undefined
                            ? copy("等待选择", "Awaiting choice")
                            : say(l, EVENTS[e.event].choices[e.choice])}
                          {e.frozen
                            ? " · " +
                              copy(
                                "来源删除：故事保留，收藏与信任已冻结",
                                "Source deleted: story kept, rewards frozen",
                              )
                            : ""}
                        </Text>
                        {e.choice === undefined &&
                          !e.frozen &&
                          action(copy("继续故事", "Continue"), () =>
                            setPanel("event"),
                          )}
                      </View>
                    ))}
                    <Text style={s.muted}>
                      {copy(
                        "删除来源记录会永久冻结对应收藏与信任，保留故事和当日结算凭据；更正不重抽，补记不发放冒险。",
                        "Deleting a source permanently freezes its collectible and trust, keeping the story and daily receipt. Edits never reroll; backdated logs grant no adventure.",
                      )}
                    </Text>
                  </>
                )}
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </>
  );
}
const s = StyleSheet.create({
  companion: {
    ...UI.panel,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  scene: {
    height: 440,
    backgroundColor: "#153c4a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    overflow: "hidden",
  },
  caption: {
    position: "absolute",
    top: 14,
    left: 14,
    color: "#f7dfa5",
    fontSize: 13,
    letterSpacing: 2,
  },
  object: {
    position: "absolute",
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    color: C.cream,
    backgroundColor: "#102a35dd",
    padding: 3,
  },
  button: {
    backgroundColor: C.panel2,
    borderWidth: 1,
    borderColor: C.line,
    padding: 12,
    minHeight: 48,
    justifyContent: "center",
  },
  text: { ...UI.body },
  muted: { ...UI.muted },
  title: { color: C.gold, fontSize: 22, fontWeight: "bold" },
  scrim: {
    flex: 1,
    backgroundColor: "#000b",
    justifyContent: "flex-end",
    paddingTop: 20,
  },
  sheet: {
    height: "96%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    backgroundColor: C.bg,
    borderColor: C.line,
    borderWidth: 0,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: C.panel,
    flexGrow: 1,
    flexBasis: "44%",
    gap: 8,
  },
});
