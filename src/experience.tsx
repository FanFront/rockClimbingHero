import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  AppState,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Storage from "expo-sqlite/kv-store";
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import * as Haptics from "expo-haptics";
import { C, UI } from "./theme";
import { CampScene, type CampDirection } from "./CampScene";
import { t, type Language } from "./i18n";
import type { Session } from "./domain";
const sources = {
  camp: require("../assets/audio/camp.wav"),
  confirm: require("../assets/audio/confirm.wav"),
  saved: require("../assets/audio/saved.wav"),
  arrival: require("../assets/audio/arrival.wav"),
};
type Cue = "confirm" | "saved" | "arrival";
export function useExperience(inCamp: boolean) {
  const [muted, setMuted] = useState(true),
    [reduce, setReduce] = useState(false),
    [systemReduce, setSystemReduce] = useState(false),
    [ready, setReady] = useState(false),
    [active, setActive] = useState(AppState.currentState === "active");
  const [players, setPlayers] = useState<
    Partial<Record<keyof typeof sources, AudioPlayer>>
  >({});
  const activeRef = useRef(active);
  activeRef.current = active;
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    Promise.all([
      Storage.getItem("ascent.experience"),
      AccessibilityInfo.isReduceMotionEnabled(),
    ])
      .then(([raw, r]) => {
        if (!alive) return;
        try {
          const pref = raw ? JSON.parse(raw) : {};
          setMuted(pref.muted !== false);
          setReduce(pref.reduce === true);
        } catch {}
        setSystemReduce(r);
        setReady(true);
      })
      .catch(() => {
        if (alive) {
          setReady(true);
          setError(true);
        }
      });
    const motion = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setSystemReduce,
    );
    const state = AppState.addEventListener("change", (s) =>
      setActive(s === "active"),
    );
    return () => {
      alive = false;
      motion.remove();
      state.remove();
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    Storage.setItem("ascent.experience", JSON.stringify({ muted, reduce }))
      .then(() => setError(false))
      .catch(() => setError(true));
  }, [ready, muted, reduce]);
  useEffect(() => {
    let alive = true;
    let created: Partial<Record<keyof typeof sources, AudioPlayer>> = {};
    setAudioModeAsync({
      playsInSilentMode: false,
      shouldPlayInBackground: false,
      interruptionMode: "mixWithOthers",
    })
      .then(() => {
        if (!alive) return;
        for (const key of Object.keys(sources) as (keyof typeof sources)[])
          created[key] = createAudioPlayer(sources[key]);
        created.camp!.loop = true;
        created.camp!.volume = 0.23;
        setPlayers(created);
      })
      .catch(() => setError(true));
    return () => {
      alive = false;
      for (const player of Object.values(created)) player?.remove();
    };
  }, []);
  useEffect(() => {
    const camp = players.camp;
    if (!camp) return;
    if (ready && active && inCamp && !muted) camp.play();
    else camp.pause();
    if (!active || muted)
      for (const key of ["confirm", "saved", "arrival"] as Cue[])
        players[key]?.pause();
  }, [players, active, inCamp, muted, ready]);
  const cue = (name: Cue) => {
    if (!active) return;
    if (!muted) {
      const p = players[name];
      if (p)
        void p
          .seekTo(0)
          .then(() => {
            if (activeRef.current && !mutedRef.current) p.play();
          })
          .catch(() => {});
    }
    if (name === "saved")
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
    else if (name === "confirm") void Haptics.selectionAsync().catch(() => {});
  };
  return {
    muted,
    setMuted,
    reduce: reduce || systemReduce,
    manualReduce: reduce,
    setReduce,
    cue,
    error,
  };
}
export function CampHome({
  name,
  l,
  count,
  latest,
  record,
  recall,
  reduced,
  direction = "morning",
}: {
  direction?: CampDirection;
  name: string;
  l: Language;
  count: number;
  latest?: Session;
  record: () => void;
  recall: () => void;
  reduced: boolean;
}) {
  const zh = l !== "en";
  return (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={e.eyebrow}>
          {direction === "morning"
            ? zh
              ? "松风岩谷 / 清晨"
              : "PINE VALLEY / MORNING"
            : direction === "dusk"
              ? zh
                ? "松火营地 / 暮色"
                : "PINEFIRE / DUSK"
              : zh
                ? "星夜远征 / 夜色"
                : "STAR TRAIL / NIGHT"}
        </Text>
        <Text style={e.title}>{zh ? `早安，${name}` : `Morning, ${name}`}</Text>
        <Text style={e.copy}>
          {zh
            ? "山还在那里。每一次攀登，都值得留下。"
            : "The mountains remain. Every climb deserves a memory."}
        </Text>
      </View>
      <CampScene
        panorama
        direction={direction}
        reduced={reduced}
        marked={!!latest}
      />
      <Pressable
        accessibilityRole="button"
        onPress={record}
        style={({ pressed }) => [
          e.primary,
          pressed && { opacity: 0.8, transform: [{ translateY: 2 }] },
        ]}
      >
        <Text style={e.primaryText}>
          {zh ? "记录攀岩  →" : "Record a climb  →"}
        </Text>
        <Text style={e.darkCopy}>
          {zh ? "带回今天的一小段山野" : "Bring a little of today back to camp"}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={!latest}
        onPress={recall}
        style={e.memory}
      >
        <Text style={e.eyebrow}>
          {zh ? "旅程手记" : "TRAIL JOURNAL"} ·{" "}
          {count.toString().padStart(2, "0")}
        </Text>
        <Text style={e.heading}>
          {latest
            ? `${t(l, latest.activity)} · ${latest.duration} ${zh ? "分钟" : "min"}`
            : zh
              ? "第一页，留给今天"
              : "The first page awaits"}
        </Text>
        <Text style={e.copy} numberOfLines={2}>
          {latest
            ? latest.notes ||
              (zh ? "今天的努力，营地记得。" : "Camp remembers today’s effort.")
            : zh
              ? "完成一次记录，在这里留下你的回忆。"
              : "Save a session to leave a memory here."}
        </Text>
        {latest && (
          <Text style={e.link}>
            {new Date(latest.date).toLocaleDateString(l)} ·{" "}
            {zh ? "翻开这次回忆 →" : "Open this memory →"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
export function Completion({
  session,
  reward,
  l,
  reduced,
  home,
  recall,
  cue,
}: {
  session: Session;
  reward: string;
  l: Language;
  reduced: boolean;
  home: () => void;
  recall: () => void;
  cue: (name: Cue) => void;
}) {
  const [arrived, setArrived] = useState(reduced);
  useEffect(() => {
    if (reduced || arrived) return;
    const timer = setTimeout(() => {
      setArrived(true);
      cue("arrival");
    }, 650);
    return () => clearTimeout(timer);
  }, [reduced, arrived]);
  return (
    <View style={{ gap: 16 }}>
      <View style={{ height: 112, overflow: "hidden" }}>
        <View style={{ position: "absolute", bottom: 0, width: "100%" }}>
          <CampScene direction="morning" reduced={reduced || arrived} marked />
        </View>
      </View>
      <Text style={e.title}>
        {l === "en" ? "A page worth keeping" : "这一程，值得记住"}
      </Text>
      <Text style={e.heading}>
        {t(l, session.activity)} · {session.duration}{" "}
        {l === "en" ? "min" : "分钟"}
        {session.grade ? ` · ${session.grade}` : ""}
      </Text>
      {!!session.notes && <Text style={e.copy}>{session.notes}</Text>}
      <Text style={e.eyebrow}>
        {l === "en"
          ? "ACTUAL REWARD · SESSION & SETTLED COMMISSIONS"
          : "实际结算 · 本次记录与已完成委托"}
      </Text>
      <Text style={e.heading}>{reward}</Text>
      <Text style={e.copy}>
        {l === "en"
          ? "Your journal page is saved in camp."
          : "手记已存入营地。下次回来，还能翻开这一页。"}
      </Text>
      {!arrived && !reduced && (
        <Pressable
          accessibilityRole="button"
          style={e.secondary}
          onPress={() => setArrived(true)}
        >
          <Text style={e.copy}>
            {l === "en" ? "Skip animation" : "跳过动画"}
          </Text>
        </Pressable>
      )}
      <Pressable accessibilityRole="button" style={e.primary} onPress={home}>
        <Text style={e.primaryText}>
          {l === "en" ? "Return to camp" : "返回营地"}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        style={e.secondary}
        onPress={recall}
      >
        <Text style={e.link}>
          {l === "en" ? "View this session" : "查看本次记录"}
        </Text>
      </Pressable>
    </View>
  );
}
const e = StyleSheet.create({
  eyebrow: { fontSize: 12, letterSpacing: 1.5, color: C.gold, lineHeight: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: C.cream, lineHeight: 40 },
  heading: { fontSize: 19, color: C.cream, fontWeight: "600", lineHeight: 29 },
  copy: { fontSize: 15, color: C.muted, lineHeight: 24 },
  darkCopy: { fontSize: 13, color: "#35483f", lineHeight: 22 },
  primary: {
    backgroundColor: C.gold,
    padding: 16,
    minHeight: 64,
    borderRadius: 14,
  },
  primaryText: { fontSize: 19, fontWeight: "bold", color: "#1b302f" },
  secondary: {
    minHeight: 50,
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    backgroundColor: C.panel2,
  },
  memory: {
    padding: 18,
    gap: 8,
    backgroundColor: C.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
  },
  link: { fontSize: 15, color: C.gold, lineHeight: 24 },
});
