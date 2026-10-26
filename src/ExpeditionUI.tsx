import { Action, Segmented, SectionHeading, EmptyState } from "./UI";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
} from "react-native";
import type { AppData, ClimbStyle, Readiness } from "./domain";
import {
  settle,
  templateOf,
  commissionProgress,
  story,
  rewardLabel,
  type Commission,
  type Route,
  type MediaRef,
} from "./expedition";
import { PixelGlyph } from "./art";
import { attr, t, type Language } from "./i18n";
import { C, UI } from "./theme";
import { media } from "./media";
const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const trUnit = (en: boolean) => (en ? "sends" : "完攀");
function B({
  text,
  press,
  active = false,
  primary = false,
  danger = false,
}: {
  text: string;
  press: () => void;
  active?: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <Action
      label={text}
      onPress={press}
      selected={active}
      tone={danger ? "danger" : primary ? "primary" : "choice"}
    />
  );
}

export function Board({
  p,
  l,
  readiness,
  save,
  train,
}: {
  p: AppData;
  l: Language;
  readiness: Readiness;
  save: (p: AppData) => void;
  train: (q: Commission) => void;
}) {
  const [section, setSection] = useState("day"),
    [selected, setSelected] = useState<string | null>(null),
    [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  const en = l === "en";
  const title = (zh: string, enText: string) => (en ? enText : zh);
  const trainingDays = new Set(
    p.sessions
      .filter(
        (s) =>
          s.activity !== "recovery" && Date.parse(s.date) > now - 3 * 86400000,
      )
      .map((s) => new Date(s.date).toDateString()),
  ).size;
  const blocked =
    trainingDays >= 3 ||
    readiness === "pain" ||
    readiness === "tired" ||
    p.sessions.some((s) => s.pain && Date.parse(s.date) > now - 3 * 86400000);
  const all = p.commissions || [];
  const visible = all.filter((q) =>
    section === "done"
      ? Date.parse(q.end) <= now || p.questLedger?.some((r) => r.id === q.id)
      : q.period === section && Date.parse(q.end) > now,
  );
  const card = (q: Commission, detail = false) => {
    const temp = templateOf(q),
      progress = commissionProgress(p, q);
    const done = !!p.questLedger?.some((r) => r.id === q.id),
      expired = Date.parse(q.end) <= now;
    const safe = !(blocked && temp.activity !== "recovery");
    const hours = Math.max(0, Math.ceil((Date.parse(q.end) - now) / 3600000));
    return (
      <View style={s.panel} key={q.id}>
        <View style={s.row}>
          <PixelGlyph
            name={
              temp.skill || (temp.activity === "recovery" ? "fire" : "compass")
            }
            size={40}
          />
          <View style={{ flex: 1 }}>
            <Text style={s.muted}>
              {q.period === "week"
                ? title("周常委托", "Weekly commission")
                : q.id ===
                    all.find((x) => x.period === "day" && x.start === q.start)
                      ?.id
                  ? title("今日主线", "Daily main quest")
                  : title("可选委托", "Optional commission")}
            </Text>
            <Text style={s.title}>{temp.title[en ? 1 : 0]}</Text>
            <Text style={s.muted}>
              {done
                ? title("已结算", "Settled")
                : expired
                  ? title("已过期", "Expired")
                  : title(`剩余 ${hours} 小时`, ` ${hours}h left`)}
            </Text>
          </View>
        </View>
        <Text style={s.text}>
          {temp.goal[en ? 1 : 0]}
          {temp.route ? ` · V0–V${q.maxGrade}` : ""} · {progress.value}/
          {q.target} {temp.route ? trUnit(en) : en ? "min" : "分钟"}
        </Text>
        <View style={s.track}>
          <View
            style={{
              height: 6,
              width: `${(progress.value / q.target) * 100}%`,
              backgroundColor: C.gold,
            }}
          />
        </View>
        <Text style={s.gold}>{rewardLabel(q, (a) => attr(l, a))}</Text>
        {detail && (
          <>
            <Text style={s.text}>{story(q, en)}</Text>
            <Text style={s.muted}>
              {title(
                "接取后真实记录自动结算。删除或更正记录会重新核算奖励；恢复无惩罚。",
                "Real records after acceptance settle automatically. Corrections recalculate rewards. Rest has no penalty.",
              )}
            </Text>
            {!safe && <Text style={s.muted}>{t(l, "safety")}</Text>}
            {!expired && !done && safe && (
              <B
                primary
                text={
                  q.acceptedAt
                    ? title("去记录", "Record activity")
                    : title("接取委托", "Accept commission")
                }
                press={() => {
                  if (!q.acceptedAt)
                    save(
                      settle({
                        ...p,
                        commissions: all.map((x) =>
                          x.id === q.id
                            ? { ...x, acceptedAt: new Date().toISOString() }
                            : x,
                        ),
                      }),
                    );
                  else train(q);
                }}
              />
            )}
          </>
        )}
      </View>
    );
  };
  const q = all.find((q) => q.id === selected);
  return (
    <>
      <Segmented
        value={section}
        options={[
          { id: "day", label: title("今日", "Today") },
          { id: "week", label: title("本周", "Week") },
          { id: "done", label: title("已结束", "History") },
        ]}
        onChange={(id) => {
          setSection(id);
          setSelected(null);
        }}
      />
      {q ? (
        <>
          <B
            text={title("返回悬赏板", "Back to board")}
            press={() => setSelected(null)}
          />
          {card(q, true)}
        </>
      ) : (
        visible.map((q) => (
          <Pressable
            accessibilityRole="button"
            key={q.id}
            onPress={() => setSelected(q.id)}
          >
            {card(q)}
          </Pressable>
        ))
      )}
      {!visible.length && (
        <EmptyState
          title={title("这里暂时没有委托", "No commissions here yet")}
          description={title(
            "看看其他分类，或者把今天留给休息。",
            "Explore another category, or take today at your own pace.",
          )}
        />
      )}
    </>
  );
}
function MediaTile({
  value,
  l,
  remove,
}: {
  value: MediaRef;
  l: Language;
  remove: () => void;
}) {
  const [ok, setOK] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    media
      ?.available(value.uri)
      .then((v) => {
        if (live) setOK(v);
      })
      .catch(() => {
        if (live) setOK(false);
      });
    return () => {
      live = false;
    };
  }, [value.uri]);
  return (
    <View style={s.panel}>
      {ok && value.type.startsWith("image/") && (
        <Image
          source={{ uri: value.uri }}
          style={{ width: "100%", height: 150 }}
          resizeMode="contain"
          onError={() => setOK(false)}
        />
      )}
      <Text style={s.muted}>{value.name}</Text>
      {ok === false && (
        <Text style={s.text}>
          {l === "en"
            ? "Media unavailable. Remove and select again."
            : "媒体不可用，请移除后重新选择。"}
        </Text>
      )}
      <View style={s.row}>
        <B
          text={l === "en" ? "Open / play" : "打开 / 播放"}
          press={() => {
            media?.open(value.uri, value.type).catch(() => {
              setOK(false);
              Alert.alert(
                l === "en"
                  ? "Media unavailable. Select again."
                  : "媒体不可用，请重新选择。",
              );
            });
          }}
        />
        <B text={l === "en" ? "Unlink" : "解除关联"} press={remove} />
      </View>
    </View>
  );
}
export function Gallery({
  p,
  l,
  save,
}: {
  p: AppData;
  l: Language;
  save: (p: AppData) => void;
}) {
  const [editing, setEditing] = useState<Route | null>(null),
    [filter, setFilter] = useState("recent");
  const en = l === "en";
  const tr = (zh: string, eng: string) => (en ? eng : zh);
  const routes = [...(p.routes || [])]
    .filter(
      (r) =>
        !["Slab", "Vertical", "Overhang", "Mixed"].includes(filter) ||
        r.style === filter,
    )
    .sort((a, b) =>
      filter === "grade"
        ? Number(b.grade.slice(1)) - Number(a.grade.slice(1))
        : b.date.localeCompare(a.date),
    );
  const input = (
    label: string,
    value: string,
    change: (v: string) => void,
    numeric = false,
  ) => (
    <View>
      <Text style={s.muted}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        style={s.input}
        value={value}
        onChangeText={change}
        keyboardType={numeric ? "number-pad" : "default"}
      />
    </View>
  );
  const create = (id: string) => {
    const session = p.sessions.find((s) => s.id === id)!;
    setEditing({
      id: uid(),
      sessionId: id,
      name: "",
      area: "",
      grade: session.grade,
      style: session.style,
      sends: 0,
      attempts: 1,
      date: session.date,
      notes: "",
      media: [],
    });
  };
  if (editing) {
    const r = editing;
    const update = (patch: Partial<Route>) => setEditing({ ...r, ...patch });
    return (
      <>
        <SectionHeading
          title={tr("线路档案", "Route record")}
          note={tr(
            "把这条线路的细节整理在一起。",
            "Keep this climb’s details together.",
          )}
        />
        {input(tr("名称 / 编号", "Name / number"), r.name, (v) =>
          update({ name: v }),
        )}
        {input(tr("岩馆 / 区域", "Gym / area"), r.area, (v) =>
          update({ area: v }),
        )}
        {input(t(l, "grade"), r.grade, (v) =>
          update({ grade: v.toUpperCase() }),
        )}
        <View style={s.wrap}>
          {(["Slab", "Vertical", "Overhang", "Mixed"] as ClimbStyle[]).map(
            (v) => (
              <B
                key={v}
                text={t(l, v)}
                active={r.style === v}
                press={() => update({ style: v })}
              />
            ),
          )}
        </View>
        <SectionHeading title={tr("这次的尝试", "This attempt")} />
        {input(
          t(l, "attempts"),
          String(r.attempts),
          (v) => update({ attempts: Number(v) }),
          true,
        )}
        <View style={s.row}>
          <B
            active={r.sends > 0}
            text={tr("完攀", "Sent")}
            press={() => update({ sends: 1 })}
          />
          <B
            active={!r.sends}
            text={tr("未完攀", "Not sent")}
            press={() => update({ sends: 0 })}
          />
        </View>
        <Text style={s.muted}>
          {new Date(r.date).toLocaleString(l)} ·{" "}
          {tr("时间沿用训练会话", "Time from session")}
        </Text>
        <SectionHeading
          title={tr("记住你的解法", "Keep your beta")}
          note={tr(
            "感想和媒体均为可选，不阻塞保存。",
            "Notes and media are optional.",
          )}
        />
        {input(tr("感想 / 个人 beta", "Notes / beta"), r.notes, (v) =>
          update({ notes: v }),
        )}
        {r.media.map((m, i) => (
          <MediaTile
            key={m.uri}
            value={m}
            l={l}
            remove={() => update({ media: r.media.filter((_, j) => j !== i) })}
          />
        ))}
        <B
          text={tr("关联照片 / 视频", "Link photos / videos")}
          press={async () => {
            if (!media)
              return Alert.alert(
                tr(
                  "需要 Android 自定义构建，Expo Go 不含媒体模块。",
                  "Requires an Android build; media module is unavailable in Expo Go.",
                ),
              );
            try {
              const refs = await media.pick();
              update({
                media: [...r.media, ...refs].filter(
                  (m, i, a) => a.findIndex((v) => v.uri === m.uri) === i,
                ),
              });
            } catch {
              Alert.alert(
                tr(
                  "无法保留媒体权限，请重新选择系统文档。",
                  "Cannot retain access. Select a system document again.",
                ),
              );
            }
          }}
        />
        <Text style={s.muted}>
          {tr(
            "添加线路后，该场训练的完攀任务与最佳难度以独立线路为准，请补齐真实线路。",
            "After adding routes, send commissions and best grade use route records for this session. Enter all actual routes.",
          )}
        </Text>
        <Text style={s.muted}>
          {tr(
            "仅保存原文件引用，不复制、不上传；无照片也可保存。",
            "Original references only. No copy or upload. Photos are optional.",
          )}
        </Text>
        <B
          primary
          text={t(l, "save")}
          press={() => {
            if (
              !/^V\d{1,2}$/i.test(r.grade) ||
              !Number.isInteger(r.attempts) ||
              r.attempts < 1 ||
              r.attempts < r.sends
            )
              return Alert.alert(
                t(l, "invalid"),
                t(l, "gradeError") + " " + t(l, "attemptError"),
              );
            save(
              settle({
                ...p,
                detailedRouteSessions: [
                  ...new Set([...(p.detailedRouteSessions || []), r.sessionId]),
                ],
                routes: [
                  { ...r },
                  ...(p.routes || []).filter((x) => x.id !== r.id),
                ],
              }),
            );
            setEditing(null);
          }}
        />
        <B text={t(l, "cancel")} press={() => setEditing(null)} />
        {p.routes?.some((x) => x.id === r.id) && (
          <B
            danger
            text={t(l, "delete")}
            press={() =>
              Alert.alert(t(l, "delete"), t(l, "deletePrompt"), [
                { text: t(l, "cancel"), style: "cancel" },
                {
                  text: t(l, "delete"),
                  style: "destructive",
                  onPress: () => {
                    save(
                      settle({
                        ...p,
                        routes: p.routes!.filter((x) => x.id !== r.id),
                      }),
                    );
                    setEditing(null);
                  },
                },
              ])
            }
          />
        )}
      </>
    );
  }
  return (
    <>
      <SectionHeading
        title={tr("线路收藏", "Route collection")}
        note={tr(
          `${routes.length} 条线路 · 点开继续整理`,
          `${routes.length} routes · open one to revisit`,
        )}
      />
      {!routes.length && (
        <EmptyState
          title={tr("为第一条线路留个位置", "Make room for your first route")}
          description={tr(
            "从下方的抱石训练中选择一次，添加名称、难度和自己的解法。",
            "Choose a bouldering session below, then add its grade and your beta.",
          )}
        />
      )}
      <View style={s.wrap}>
        {[
          ["recent", "最近", "Recent"],
          ["grade", "难度", "Grade"],
          ...(["Slab", "Vertical", "Overhang", "Mixed"] as const).map((v) => [
            v,
            t(l, v),
            t(l, v),
          ]),
        ].map(([id, zh, eng]) => (
          <B
            key={id}
            active={filter === id}
            text={tr(zh, eng)}
            press={() => setFilter(id)}
          />
        ))}
      </View>
      {routes.map((r) => (
        <Pressable
          accessibilityRole="button"
          key={r.id}
          style={({ pressed }) => [
            s.panel,
            pressed && { backgroundColor: C.panel2 },
          ]}
          onPress={() => setEditing({ ...r, media: [...r.media] })}
        >
          <View style={s.row}>
            <PixelGlyph name={r.sends ? "mountain" : "pick"} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={s.title}>
                {r.name || r.grade} · {t(l, r.style)}
              </Text>
              <Text style={s.muted}>
                {r.area} · {new Date(r.date).toLocaleDateString(l)}
              </Text>
              <Text style={s.gold}>
                {r.grade} ·{" "}
                {r.sends ? tr("已完攀", "Sent") : tr("尝试中", "Attempted")} ·{" "}
                {r.media.length} {tr("媒体", "media")}
              </Text>
            </View>
          </View>
        </Pressable>
      ))}
      {!routes.length && <Text style={s.muted}>{t(l, "empty")}</Text>}
      <Text style={s.title}>{tr("从训练创建线路", "Add from a session")}</Text>
      {p.sessions
        .filter((s) => s.activity === "bouldering")

        .map((v) => (
          <B
            key={v.id}
            text={`${new Date(v.date).toLocaleString(l)} · ${v.grade || "—"} ＋`}
            press={() => create(v.id)}
          />
        ))}
      {!p.sessions.some((s) => s.activity === "bouldering") && (
        <Text style={s.muted}>
          {tr(
            "先保存一次抱石训练，再添加多条线路。",
            "Save a bouldering session first, then add its routes.",
          )}
        </Text>
      )}
    </>
  );
}
const s = StyleSheet.create({
  panel: { ...UI.panel },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  title: { ...UI.title, fontSize: 19, lineHeight: 28 },
  text: { ...UI.body },
  muted: { ...UI.muted },
  gold: { color: C.gold, fontSize: 12, lineHeight: 20 },
  button: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: C.line,
    padding: 10,
    backgroundColor: C.panel2,
    justifyContent: "center",
  },
  input: { ...UI.input, marginTop: 6 },
  track: { height: 6, backgroundColor: C.line },
});
