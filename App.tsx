import {
  Action,
  Segmented,
  PageHeading,
  SectionHeading,
  EmptyState,
  SettingRow,
  ReducedMotionContext,
} from "./src/UI";
import { AICoach } from "./src/AICoach";
import { CampHome, Completion, useExperience } from "./src/experience";
import { LivingCamp } from "./src/LivingCamp";
import { beginAdventure, reconcileWorld } from "./src/living";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { MountainVista, HeroSprite, PixelGlyph, PixelMap } from "./src/art";
import { Board, Gallery } from "./src/ExpeditionUI";
import {
  ensureCommissions,
  settle,
  growth,
  templateOf,
  type Commission,
} from "./src/expedition";
import { C, UI } from "./src/theme";
import {
  ATTRIBUTES,
  ATTRIBUTE_COLORS,
  SKILLS,
  DEFAULT_RATINGS,
  createProfile,
  latestRatings,
  heroLevel,
  levelBounds,
  totalXP,
  skillProgress,
  bestGrade,
  logSession,
  deleteSession,
  reassess,
  recommendedQuest,
  ratingScore,
  sessionXP,
  type AppData,
  type Ratings,
  type Session,
  type Activity,
  type SkillId,
  type Readiness,
  type ClimbStyle,
  type Quest,
} from "./src/domain";
import {
  loadProfile,
  saveProfile,
  loadLanguage,
  saveLanguage,
} from "./src/storage";
import {
  t,
  attr,
  question,
  skillText,
  questText,
  type Language,
  type CopyKey,
} from "./src/i18n";
type Tab = "camp" | "quests" | "hero" | "map" | "journal";
const tabs: Tab[] = ["camp", "quests", "hero", "map", "journal"];
const icons = ["fire", "compass", "hero", "mountain", "journal"];
const thresholds = [0, 1, 3, 7, 14, 30];
const trailDays = (p: AppData) =>
  new Set(
    p.sessions
      .filter((s) => !s.pain && s.activity !== "recovery")
      .map((s) => s.date.slice(0, 10)),
  ).size;
const nodeCount = (p: AppData) =>
  thresholds.filter((n) => trailDays(p) >= n).length;
const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
function Button({
  label,
  onPress,
  active = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <Action
      label={label}
      onPress={onPress}
      selected={active}
      disabled={disabled}
      tone="choice"
    />
  );
}

function RewardArt({ reduced = false }: { reduced?: boolean }) {
  const scale = useRef(new Animated.Value(reduced ? 1 : 0.6)).current;
  useEffect(() => {
    if (reduced) {
      scale.setValue(1);
      return;
    }
    const animation = Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    });
    animation.start();
    return () => animation.stop();
  }, [scale, reduced]);
  return (
    <Animated.View style={{ alignItems: "center", transform: [{ scale }] }}>
      <PixelGlyph name="star" size={72} />
    </Animated.View>
  );
}
function Meter({
  value,
  max = 100,
  color = C.gold,
}: {
  value: number;
  max?: number;
  color?: string;
}) {
  return (
    <View style={s.track}>
      <View
        style={{
          height: 7,
          width: `${Math.min(100, Math.max(0, (value / Math.max(1, max)) * 100))}%`,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
function Sheet({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  const reduced = React.useContext(ReducedMotionContext);
  return (
    <Modal
      visible
      transparent
      animationType={reduced ? "none" : "fade"}
      onRequestClose={close}
    >
      <SafeAreaView style={s.scrim}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={s.sheet}
        >
          <View style={s.sheetHeader}>
            <Text accessibilityRole="header" style={[s.title, { flex: 1 }]}>
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={title + " · " + "Close / 关闭"}
              onPress={close}
              style={s.close}
            >
              <Text style={s.title}>×</Text>
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.stack}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
function Assessment({
  p,
  l,
  save,
  cancel,
}: {
  p: AppData | null;
  l: Language;
  save: (name: string, r: Ratings) => void;
  cancel: () => void;
}) {
  const [name, setName] = useState(p?.name || "");
  const [ratings, setRatings] = useState({
    ...(p ? latestRatings(p) : DEFAULT_RATINGS),
  });
  const [index, setIndex] = useState(p ? 0 : -1);
  const a = ATTRIBUTES[Math.max(0, index)];
  if (index === -1)
    return (
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.stack}
      >
        <MountainVista height={210} />
        <PageHeading
          eyebrow="WELCOME TO ASCENT"
          title={l === "en" ? "Every climb, a story" : "每一次攀登，都有故事"}
          subtitle={
            l === "en"
              ? "A quiet camp for your climbs. Record a moment, explore your next move, and keep what you learn."
              : "为你的攀登留一处营地。记下感受，尝试新的解法，也记住走过的路。"
          }
        />
        <Text style={s.muted}>{t(l, "name")}</Text>
        <TextInput
          accessibilityLabel={t(l, "name")}
          style={s.input}
          value={name}
          onChangeText={setName}
          maxLength={28}
          placeholder={l === "en" ? "What should we call you?" : "怎么称呼你？"}
          placeholderTextColor={C.muted}
        />
        <Action
          tone="primary"
          label={l === "en" ? "Enter camp" : "进入营地"}
          onPress={() =>
            save(
              name.trim() || (l === "en" ? "Explorer" : "探险者"),
              DEFAULT_RATINGS,
            )
          }
        />
        <Action
          tone="quiet"
          label={
            l === "en" ? "Personalize my explorer first" : "先做个简单自评"
          }
          onPress={() => setIndex(0)}
        />
        <Text style={s.muted}>
          {l === "en"
            ? "No account needed. Self-assessment is optional and can be changed later."
            : "无需账号。自评可以稍后完成，随时都能调整。"}
        </Text>
      </ScrollView>
    );
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={s.stack}
    >
      <MountainVista height={150} />
      <PageHeading
        eyebrow="ASCENT / EXPLORER"
        title={
          l === "en"
            ? p
              ? "Check in with yourself"
              : "Your journey starts here"
            : p
              ? "重新认识自己的状态"
              : "从这里，开始你的旅程"
        }
        subtitle={
          l === "en"
            ? "A quiet place for your climbs, attempts and memories."
            : "记录攀登，尝试新动作，把每一程留在营地。"
        }
      />
      <Meter value={index + 1} max={5} />
      <Text style={s.title}>
        {t(l, p ? "reassess" : "assessment")} · {index + 1}/5
      </Text>
      {index === 0 && !p && (
        <TextInput
          accessibilityLabel={t(l, "name")}
          placeholder={t(l, "name")}
          placeholderTextColor={C.muted}
          style={s.input}
          value={name}
          onChangeText={setName}
          maxLength={28}
        />
      )}
      <Text style={s.muted}>{t(l, "assessInfo")}</Text>
      <View style={s.panel}>
        <PixelGlyph name={a} size={52} />
        <Text style={s.title}>{attr(l, a)}</Text>
        <Text style={s.body}>{question(l, index)}</Text>
        <Segmented
          value={String(ratings[a])}
          options={[1, 2, 3, 4, 5].map((n) => ({
            id: String(n),
            label: String(n),
          }))}
          onChange={(v) => setRatings({ ...ratings, [a]: Number(v) })}
        />
        <Text style={s.muted}>{t(l, "confidence")}</Text>
      </View>
      <Action
        tone="primary"
        label={t(l, index === 4 ? (p ? "assessDone" : "create") : "next")}
        onPress={() =>
          index < 4
            ? setIndex(index + 1)
            : save(
                name.trim() || (l === "zh-CN" ? "探险者" : "Explorer"),
                ratings,
              )
        }
      />
      {!p && (
        <Button
          label={
            l === "en" ? "Enter camp · assess later" : "先进入营地 · 稍后自评"
          }
          onPress={() =>
            save(
              name.trim() || (l === "en" ? "Explorer" : "探险者"),
              DEFAULT_RATINGS,
            )
          }
        />
      )}
      {index > 0 && (
        <Button label={t(l, "back")} onPress={() => setIndex(index - 1)} />
      )}{" "}
      {!!p && <Button label={t(l, "cancel")} onPress={cancel} />}
      <Text style={s.muted}>{t(l, "disclaimer")}</Text>
    </ScrollView>
  );
}
type JournalProps = {
  l: Language;
  p: AppData;
  initial: {
    activity: Activity;
    skill: SkillId | null;
    style?: ClimbStyle;
    minutes?: number;
  };
  onSave: (v: Session) => Promise<void>;
  onIssue: (issue: string | null) => void;
  focusId?: string;
  onDelete: (id: string) => void;
  onAnalyze: (session?: Session) => void;
  readiness: Readiness;
};
const Journal = React.forwardRef<{ submit: () => void }, JournalProps>(
  function Journal(
    {
      l,
      p,
      initial,
      onSave,
      onIssue,
      onDelete,
      readiness,
      focusId,
      onAnalyze,
    }: JournalProps,
    ref,
  ) {
    useEffect(() => {
      onIssue(null);
    }, []);
    const [validation, setValidation] = useState<CopyKey | null>(null);
    const [saving, setSaving] = useState(false);
    const savingRef = useRef(false);
    const draftId = useRef(uid());
    const [saveFailure, setSaveFailure] = useState(false);
    const [editing, setEditing] = useState<Session | null>(null);
    const [activity, setActivity] = useState(initial.activity),
      [minutes, setMinutes] = useState(String(initial.minutes || 30)),
      [attempts, setAttempts] = useState("0"),
      [sends, setSends] = useState("0"),
      [grade, setGrade] = useState(""),
      [more, setMore] = useState(false),
      [history, setHistory] = useState(!!focusId),
      [notes, setNotes] = useState(""),
      [pain, setPain] = useState(readiness === "pain"),
      [skill, setSkill] = useState(initial.skill),
      [effort, setEffort] = useState(3),
      [style, setStyle] = useState<ClimbStyle>(initial.style || "Vertical");
    const field = (
      key: CopyKey,
      value: string,
      change: (v: string) => void,
      numeric = true,
    ) => (
      <View
        style={{
          flex: key === "attempts" || key === "sends" ? 1 : undefined,
          minWidth: 100,
        }}
      >
        <Text style={s.muted}>{t(l, key)}</Text>
        <TextInput
          accessibilityLabel={t(l, key)}
          style={[s.input, key === "notes" && { minHeight: 96 }]}
          value={value}
          onChangeText={change}
          multiline={key === "notes"}
          textAlignVertical={key === "notes" ? "top" : "center"}
          keyboardType={numeric ? "number-pad" : "default"}
        />
      </View>
    );
    const submit = async () => {
      if (savingRef.current) return;
      const duration = Number(minutes),
        a = Number(attempts),
        b = Number(sends);
      let error: CopyKey | null = null;
      if (!Number.isFinite(duration) || duration < 5 || duration > 240)
        error = "durationError";
      else if (
        activity === "bouldering" &&
        (!Number.isInteger(a) ||
          !Number.isInteger(b) ||
          a < 0 ||
          b < 0 ||
          b > a)
      )
        error = "attemptError";
      else if (
        activity === "bouldering" &&
        grade.trim() &&
        !/^V\d{1,2}$/i.test(grade.trim())
      )
        error = "gradeError";
      setValidation(error);
      onIssue(error ? t(l, error) : null);
      if (error) return;
      savingRef.current = true;
      setSaving(true);
      setSaveFailure(false);
      try {
        await onSave({
          id: editing?.id || draftId.current,
          date: editing?.date || new Date().toISOString(),
          activity,
          duration,
          attempts: activity === "bouldering" ? a : 0,
          sends: activity === "bouldering" ? b : 0,
          grade: activity === "bouldering" ? grade.toUpperCase().trim() : "",
          style,
          skill: activity === "recovery" ? null : skill,
          effort,
          notes: notes.trim(),
          pain,
        });
        setNotes("");
        setEditing(null);
        draftId.current = uid();
      } catch {
        setSaveFailure(true);
        onIssue(t(l, "saveError"));
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    };
    React.useImperativeHandle(ref, () => ({ submit }));
    return (
      <>
        <View style={s.row}>
          <Text style={[s.title, { flex: 1 }]}>
            {l === "en" ? "Activity" : "活动类型"}
          </Text>
          <Button label={t(l, "history")} onPress={() => setHistory(true)} />
        </View>
        {editing && (
          <Text style={s.muted}>
            {l === "en" ? "Correcting a saved session" : "正在更正已有记录"}
          </Text>
        )}
        <Segmented
          options={(
            ["bouldering", "strength", "mobility", "recovery"] as Activity[]
          ).map((a) => ({ id: a, label: t(l, a) }))}
          value={activity}
          onChange={(a) => setActivity(a as Activity)}
        />
        <View style={s.panel}>
          {field("minutes", minutes, setMinutes)}
          <Segmented
            value={minutes}
            options={[15, 30, 60, 90].map((n) => ({
              id: String(n),
              label: `${n} min`,
            }))}
            onChange={setMinutes}
          />
          {activity === "bouldering" && more && (
            <>
              <View style={s.row}>
                {field("attempts", attempts, setAttempts)}
                {field("sends", sends, setSends)}
              </View>
              {field("grade", grade, setGrade, false)}
            </>
          )}
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: pain }}
            onPress={() => setPain(!pain)}
            style={s.button}
          >
            <Text style={s.body}>
              {pain ? "✓  " : "○  "} {t(l, "painCheck")}
            </Text>
          </Pressable>
          {(pain || readiness === "pain") && (
            <Text style={s.warning}>
              {t(l, "safety")} {t(l, "noXP")}
            </Text>
          )}
          {field("notes", notes, setNotes, false)}
          <Button
            label={t(l, "more") + (more ? " −" : " +")}
            onPress={() => setMore(!more)}
          />
          {more && (
            <>
              <Text style={s.muted}>{t(l, "effort")}</Text>
              <View style={s.wrap}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Button
                    key={n}
                    label={String(n)}
                    active={effort === n}
                    onPress={() => setEffort(n)}
                  />
                ))}
              </View>
              {activity === "bouldering" && (
                <View style={s.wrap}>
                  {(
                    ["Slab", "Vertical", "Overhang", "Mixed"] as ClimbStyle[]
                  ).map((v) => (
                    <Button
                      key={v}
                      label={t(l, v)}
                      active={style === v}
                      onPress={() => setStyle(v)}
                    />
                  ))}
                </View>
              )}
              {activity !== "recovery" && (
                <>
                  <Text style={s.muted}>{t(l, "skill")}</Text>
                  <View style={s.wrap}>
                    <Button
                      label={t(l, "none")}
                      active={!skill}
                      onPress={() => setSkill(null)}
                    />
                    {SKILLS.map((v) => (
                      <Button
                        key={v.id}
                        label={skillText(l, v.id)}
                        active={skill === v.id}
                        onPress={() => setSkill(v.id)}
                      />
                    ))}
                  </View>
                </>
              )}
            </>
          )}
          {validation && (
            <Text accessibilityRole="alert" style={s.warning}>
              {t(l, validation)}
            </Text>
          )}
          {saveFailure && (
            <Text accessibilityRole="alert" style={s.warning}>
              {t(l, "saveError")} ·{" "}
              {l === "en"
                ? "Your input is kept. Try again."
                : "输入已保留，请重试。"}
            </Text>
          )}
        </View>
        <Button
          label={
            l === "en"
              ? "Climb notebook · attempts & next steps"
              : "线路手记 · 尝试与下一步"
          }
          onPress={() => onAnalyze()}
        />
        {history && (
          <Sheet title={t(l, "history")} close={() => setHistory(false)}>
            {!p.sessions.length && (
              <EmptyState
                title={
                  l === "en"
                    ? "Your first memory awaits"
                    : "第一份回忆，还在等你"
                }
                description={
                  l === "en"
                    ? "Save a session and come back here to revisit or edit it."
                    : "保存一次攀登，就能在这里回看和更正。"
                }
              />
            )}
            {[...p.sessions]
              .sort((a, b) =>
                a.id === focusId
                  ? -1
                  : b.id === focusId
                    ? 1
                    : b.date.localeCompare(a.date),
              )
              .map((v) => (
                <View style={s.panel} key={v.id}>
                  <Text style={s.body}>
                    {t(l, v.activity)} · {v.duration} min · +{sessionXP(v)} XP
                  </Text>
                  <Text style={s.muted}>
                    {new Date(v.date).toLocaleDateString(l)} · {v.grade} ·{" "}
                    {v.sends}/{v.attempts}
                    {v.skill ? " · " + skillText(l, v.skill) : ""}
                    {v.pain ? " · " + t(l, "pain") : ""}
                  </Text>
                  {!!v.notes && <Text style={s.body}>{v.notes}</Text>}
                  <Button
                    label={
                      l === "en"
                        ? "Continue from this attempt"
                        : "从本次尝试继续"
                    }
                    onPress={() => {
                      setHistory(false);
                      onAnalyze(v);
                    }}
                  />
                  <Button
                    label={l === "en" ? "Edit" : "更正"}
                    onPress={() => {
                      setEditing(v);
                      setActivity(v.activity);
                      setMinutes(String(v.duration));
                      setAttempts(String(v.attempts));
                      setSends(String(v.sends));
                      setGrade(v.grade);
                      setNotes(v.notes);
                      setPain(v.pain);
                      setSkill(v.skill);
                      setEffort(v.effort);
                      setStyle(v.style);
                      setHistory(false);
                    }}
                  />
                  <Action
                    tone="danger"
                    label={t(l, "delete")}
                    onPress={() =>
                      Alert.alert(t(l, "delete"), t(l, "deletePrompt"), [
                        { text: t(l, "cancel"), style: "cancel" },
                        {
                          text: t(l, "delete"),
                          style: "destructive",
                          onPress: () => onDelete(v.id),
                        },
                      ])
                    }
                  />
                </View>
              ))}
          </Sheet>
        )}
      </>
    );
  },
);
function Hero({
  l,
  p,
  reassess: openAssessment,
  attest,
}: {
  l: Language;
  p: AppData;
  reassess: () => void;
  attest: (id: SkillId, note: string) => void;
}) {
  const [section, setSection] = useState<CopyKey>("attributes"),
    [selected, setSelected] = useState<SkillId | null>(null),
    [note, setNote] = useState("");
  const xp = totalXP(p),
    lv = heroLevel(xp),
    b = levelBounds(lv);
  const badges = [
    p.sessions.length > 0,
    trailDays(p) >= 3,
    SKILLS.some((v) => skillProgress(p, v.id).days >= 3),
    p.assessments.length > 1,
    lv >= 2,
  ];
  return (
    <>
      <View style={[s.panel, s.row]}>
        <View style={{ width: "48%" }}>
          <HeroSprite height={180} />
        </View>
        <View style={{ flex: 1, gap: 12 }}>
          <Text style={s.title}>{p.name}</Text>
          <Text style={s.level}>Lv.{lv}</Text>
          <Meter value={xp - b.from} max={b.to - b.from} />
          <Text style={s.muted}>{xp} XP</Text>
        </View>
      </View>
      <Segmented
        value={section}
        options={(
          ["attributes", "skills", "outfit", "badges"] as CopyKey[]
        ).map((k) => ({ id: k, label: t(l, k) }))}
        onChange={(v) => setSection(v as CopyKey)}
      />
      {section === "attributes" && (
        <View style={s.panel}>
          {ATTRIBUTES.map((a) => (
            <View key={a} style={{ gap: 10, paddingVertical: 10 }}>
              <View style={s.row}>
                <PixelGlyph name={a} size={24} color={ATTRIBUTE_COLORS[a]} />
                <Text style={[s.body, { flex: 1 }]}>{attr(l, a)}</Text>
                <Text style={s.gold}>
                  +{growth(p, a).points} · {growth(p, a).progress}/100
                </Text>
              </View>
              <Meter
                value={growth(p, a).progress}
                color={ATTRIBUTE_COLORS[a]}
              />
            </View>
          ))}
          <Text style={s.gold}>
            {l === "en"
              ? "Game growth · 100 progress = 1 point"
              : "游戏成长 · 每 100 进度升 1 点"}
          </Text>
          <Text style={s.muted}>
            {ATTRIBUTES.map(
              (a) => `${attr(l, a)} ${ratingScore(latestRatings(p)[a])}`,
            ).join(" · ")}{" "}
            · {l === "en" ? "Self-rating" : "自评"}
          </Text>
          <Button label={t(l, "reassess")} onPress={openAssessment} />
          <Text style={s.muted}>{t(l, "disclaimer")}</Text>
        </View>
      )}
      {section === "skills" && (
        <View style={s.wrap}>
          {SKILLS.map((v) => (
            <Pressable
              accessibilityRole="button"
              key={v.id}
              style={s.skill}
              onPress={() => {
                setSelected(v.id);
                setNote("");
              }}
            >
              <PixelGlyph name={v.id} size={34} />
              <Text style={s.body}>{skillText(l, v.id)}</Text>
              <Meter value={skillProgress(p, v.id).days} max={3} />
            </Pressable>
          ))}
        </View>
      )}
      {section === "outfit" && (
        <View style={s.panel}>
          <View style={{ alignItems: "center" }}>
            <HeroSprite height={200} />
          </View>
          <SectionHeading
            title={t(l, "outfitText")}
            note={
              l === "en"
                ? "Your starting look. Keepsakes and appearance items live in the camp collection."
                : "这是启程时的装束。旅途带回的收藏与外观，在营地背包里整理。"
            }
          />
          <Text style={s.muted}>{t(l, "earned")}</Text>
        </View>
      )}
      {section === "badges" && (
        <View style={s.wrap}>
          {badges.map((earned, i) => (
            <View key={i} style={[s.skill, { opacity: earned ? 1 : 0.5 }]}>
              <PixelGlyph name="star" size={36} />
              <Text style={s.body}>{t(l, `badge${i}` as CopyKey)}</Text>
              <Text style={s.muted}>{t(l, earned ? "earned" : "locked")}</Text>
            </View>
          ))}
        </View>
      )}
      {selected && (
        <Sheet title={skillText(l, selected)} close={() => setSelected(null)}>
          <Text style={s.body}>{skillText(l, selected, true)}</Text>
          <Text style={s.muted}>
            {t(l, "practice")} · {skillProgress(p, selected).days}/3
          </Text>
          <Text style={s.muted}>{t(l, "attestHelp")}</Text>
          {skillProgress(p, selected).attested ? (
            <Text style={s.gold}>{t(l, "attested")}</Text>
          ) : (
            <>
              <TextInput
                accessibilityLabel={t(l, "attest")}
                style={s.input}
                placeholder={t(l, "attest")}
                placeholderTextColor={C.muted}
                multiline
                maxLength={500}
                value={note}
                onChangeText={setNote}
              />
              <Button
                disabled={
                  skillProgress(p, selected).days < 3 || note.trim().length < 10
                }
                label={t(l, "attest")}
                onPress={() => attest(selected, note.trim())}
              />
            </>
          )}
        </Sheet>
      )}
    </>
  );
}
export default function App() {
  const [p, setP] = useState<AppData | null>(null),
    [l, setL] = useState<Language>("zh-CN"),
    [loaded, setLoaded] = useState(false),
    [loadError, setLoadError] = useState(false),
    [saveError, setSaveError] = useState(false),
    [tab, setTab] = useState<Tab>("camp"),
    [readiness, setReadiness] = useState<Readiness>("normal"),
    [assessment, setAssessment] = useState(false),
    [settings, setSettings] = useState(false),
    [quest, setQuest] = useState<Quest | null>(null),
    [node, setNode] = useState<number | null>(null),
    [history, setHistory] = useState(false),
    [feedback, setFeedback] = useState<string | null>(null),
    [initial, setInitial] = useState<{
      activity: Activity;
      skill: SkillId | null;
      style?: ClimbStyle;
      minutes?: number;
    }>({ activity: "bouldering", skill: null }),
    [formKey, setFormKey] = useState(0);
  const [focusId, setFocusId] = useState<string | undefined>();
  const [completion, setCompletion] = useState<{
    session: Session;
    reward: string;
  } | null>(null);
  const [legacyCamp, setLegacyCamp] = useState(false);
  const experience = useExperience(
    tab === "camp" && !completion && loaded && !!p,
  );
  const [savingSession, setSavingSession] = useState(false);
  const savingSessionRef = useRef(false);
  const [aiOpen, setAIOpen] = useState(false);
  const [aiSettings, setAISettings] = useState(false);
  const [aiSession, setAISession] = useState<Session>();
  const aiBusy = useRef(false);
  const queue = useRef(Promise.resolve());
  const { height } = useWindowDimensions();
  const [gallery, setGallery] = useState(false);
  const [journalIssue, setJournalIssue] = useState<string | null>(null);
  const journalRef = useRef<{ submit: () => void }>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const shown = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true),
    );
    const hidden = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false),
    );
    return () => {
      shown.remove();
      hidden.remove();
    };
  }, []);
  const profileRef = useRef(p);
  profileRef.current = p;
  const readinessRef = useRef(readiness);
  readinessRef.current = readiness;
  useEffect(() => {
    const timer = setInterval(() => {
      if (savingSessionRef.current) return;
      const current = profileRef.current;
      if (current) {
        const next = ensureCommissions(current, readinessRef.current);
        if (next !== current) persist(next);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, []);
  const load = () => {
    setLoadError(false);
    Promise.all([loadProfile(), loadLanguage()])
      .then(([profile, language]) => {
        const migrated = profile
          ? reconcileWorld(
              settle(ensureCommissions(profile, profile.readiness || "normal")),
            )
          : null;
        setP(migrated);
        if (migrated)
          queue.current = queue.current
            .catch(() => {})
            .then(() => saveProfile(migrated))
            .catch(() => setSaveError(true));
        setL(language);
        if (profile?.readiness) setReadiness(profile.readiness);
        setLoaded(true);
      })
      .catch(() => setLoadError(true));
  };
  useEffect(load, []);
  const persist = (value: AppData) => {
    const next = reconcileWorld(settle(ensureCommissions(value, readiness)));
    profileRef.current = next;
    setP(next);
    queue.current = queue.current
      .catch(() => {})
      .then(() => saveProfile(next))
      .then(() => setSaveError(false))
      .catch(() => setSaveError(true));
  };
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (savingSessionRef.current) return true;
      if (tab !== "camp") {
        setTab("camp");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [tab]);
  const openLog = (
    activity: Activity,
    skill: SkillId | null,
    style?: ClimbStyle,
    minutes?: number,
  ) => {
    setFocusId(undefined);
    experience.cue("confirm");
    setInitial({ activity, skill, style, minutes });
    setFormKey((k) => k + 1);
    setQuest(null);
    setTab("journal");
  };
  const save = async (v: Session) => {
    if (!p) throw new Error("Profile unavailable");
    const next = logSession(
        { ...p, sessions: p.sessions.filter((s) => s.id !== v.id) },
        v,
      ),
      reward = totalXP(next) - totalXP(p);
    let message = `${reward >= 0 ? "+" : ""}${reward} XP`;
    if (v.skill) {
      const before = skillProgress(p, v.skill).days,
        after = skillProgress(next, v.skill).days;
      if (after > before)
        message += `\n${skillText(l, v.skill)} · ${before} → ${after}`;
    }
    if (heroLevel(totalXP(next)) > heroLevel(totalXP(p)))
      message += "\n" + t(l, "levelUp") + ` · Lv.${heroLevel(totalXP(next))}`;
    if (nodeCount(next) > nodeCount(p)) message += "\n" + t(l, "nodeUnlock");
    for (const a of ATTRIBUTES) {
      const before = growth(p, a),
        after = growth(next, a);
      const diff =
        (after.points - before.points) * 100 + after.progress - before.progress;
      if (diff) message += `\n${attr(l, a)} ${diff > 0 ? "+" : ""}${diff}/100`;
    }
    const completed = (next.questLedger || []).filter(
      (r) => !p.questLedger?.some((old) => old.id === r.id),
    );
    if (completed.length)
      message +=
        "\n" +
        (l === "en" ? "Commissions settled" : "委托已结算") +
        ` ×${completed.length}`;
    if (v.pain) message += "\n" + t(l, "noXP");
    const saved = reconcileWorld(
      settle(
        ensureCommissions(
          p.sessions.some((s) => s.id === v.id)
            ? next
            : beginAdventure(next, v),
          readiness,
        ),
      ),
    );
    const pending = queue.current
      .catch(() => {})
      .then(() => saveProfile(saved));
    queue.current = pending.catch(() => {});
    savingSessionRef.current = true;
    setSavingSession(true);
    try {
      await pending;
    } finally {
      savingSessionRef.current = false;
      setSavingSession(false);
    }
    profileRef.current = saved;
    setP(saved);
    setSaveError(false);
    Keyboard.dismiss();
    experience.cue("saved");
    setCompletion({ session: v, reward: message });
    setTab("camp");
  };
  const q = p ? recommendedQuest(p, readiness) : null;
  const xp = p ? totalXP(p) : 0,
    lv = heroLevel(xp),
    bounds = levelBounds(lv);
  return (
    <ReducedMotionContext.Provider value={experience.reduce}>
      <SafeAreaProvider>
        <SafeAreaView style={s.screen}>
          <KeyboardAvoidingView
            pointerEvents={savingSession ? "none" : "auto"}
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />
            {!loaded ? (
              <View style={s.center}>
                <PixelGlyph name="fire" size={70} />
                <Text style={s.body}>
                  {t(l, loadError ? "storageError" : "loading")}
                </Text>
                {loadError && <Button label={t(l, "retry")} onPress={load} />}
              </View>
            ) : (
              <>
                <View style={s.top}>
                  <View style={s.row}>
                    <PixelGlyph name="mountain" size={22} />
                    <Text style={s.brand}>ASCENT</Text>
                  </View>
                  <Button
                    label={l === "zh-CN" ? "设置" : "Settings"}
                    onPress={() => setSettings(true)}
                  />
                </View>
                {saveError && (
                  <View style={s.panel}>
                    <Text style={s.warning}>{t(l, "saveError")}</Text>
                    <Button
                      label={t(l, "retry")}
                      onPress={() => p && persist(p)}
                    />
                  </View>
                )}
                {!p || assessment ? (
                  <Assessment
                    l={l}
                    p={p}
                    cancel={() => setAssessment(false)}
                    save={(name, r) => {
                      persist(
                        p
                          ? reassess(p, r, new Date().toISOString())
                          : createProfile(name, r),
                      );
                      setAssessment(false);
                      setTab(p ? "hero" : "camp");
                    }}
                  />
                ) : (
                  <>
                    <ScrollView
                      key={tab}
                      keyboardShouldPersistTaps="handled"
                      contentContainerStyle={s.stack}
                    >
                      {tab !== "camp" && (
                        <PageHeading
                          eyebrow={
                            tab === "journal"
                              ? "YOUR CLIMB / YOUR STORY"
                              : tab === "hero"
                                ? "THE EXPLORER"
                                : tab === "map"
                                  ? "THE LONG WAY HOME"
                                  : "AT YOUR OWN PACE"
                          }
                          title={
                            l === "en"
                              ? {
                                  journal: "Keep the moment",
                                  hero: "Your explorer",
                                  map: "The journey",
                                  quests: "Choose your path",
                                }[tab]
                              : {
                                  journal: "留住这一程",
                                  hero: "你的探险者",
                                  map: "旅途与足迹",
                                  quests: "按自己的节奏出发",
                                }[tab]
                          }
                          subtitle={
                            l === "en"
                              ? {
                                  journal: "A few details, a lasting memory.",
                                  hero: "Game progress and your own reflections.",
                                  map: "Places discovered and climbs worth remembering.",
                                  quests:
                                    "Optional adventures. Rest is always welcome.",
                                }[tab]
                              : {
                                  journal:
                                    "轻轻记下，把今天的感受留给未来的自己。",
                                  hero: "看看旅程的积累，也听听自己的感受。",
                                  map: "走过的地方，与值得回看的每条线路。",
                                  quests: "委托只是邀请，休息也有自己的位置。",
                                }[tab]
                          }
                        />
                      )}
                      {tab === "camp" && (
                        <>
                          <CampHome
                            name={p.name}
                            l={l}
                            count={p.sessions.length}
                            latest={
                              [...p.sessions].sort((a, b) =>
                                b.date.localeCompare(a.date),
                              )[0]
                            }
                            reduced={experience.reduce}
                            record={() =>
                              openLog(
                                readiness === "pain" || readiness === "tired"
                                  ? "recovery"
                                  : "bouldering",
                                null,
                              )
                            }
                            recall={() => {
                              const recent = [...p.sessions].sort((a, b) =>
                                b.date.localeCompare(a.date),
                              )[0];
                              setFocusId(recent?.id);
                              setFormKey((k) => k + 1);
                              setTab("journal");
                            }}
                          />
                          <Button
                            label={
                              l === "en"
                                ? "Continue climbing · route notebook"
                                : "继续攀登 · 线路手记"
                            }
                            onPress={() => {
                              setAISettings(false);
                              setAISession(undefined);
                              setAIOpen(true);
                            }}
                          />
                          <Button
                            label={
                              l === "en"
                                ? "Camp companions & collection"
                                : "营地伙伴与旧日收藏"
                            }
                            onPress={() => setLegacyCamp(true)}
                          />
                          <SectionHeading
                            title={
                              l === "en"
                                ? "How are you feeling?"
                                : "今天的身体感觉如何？"
                            }
                            note={
                              l === "en"
                                ? "Your choice helps keep training suggestions appropriate."
                                : "告诉自己现在的状态，让今天的安排更合适。"
                            }
                          />
                          <View style={s.wrap}>
                            {(
                              [
                                "fresh",
                                "normal",
                                "tired",
                                "pain",
                              ] as Readiness[]
                            ).map((r) => (
                              <Button
                                key={r}
                                label={t(l, r)}
                                active={readiness === r}
                                onPress={() => {
                                  setReadiness(r);
                                  persist({ ...p, readiness: r });
                                }}
                              />
                            ))}
                          </View>
                          {readiness === "pain" && (
                            <Text style={s.warning}>{t(l, "safety")}</Text>
                          )}
                        </>
                      )}
                      {tab === "quests" && (
                        <Board
                          p={p}
                          l={l}
                          readiness={readiness}
                          save={persist}
                          train={(commission: Commission) => {
                            const temp = templateOf(commission);
                            openLog(
                              temp.activity,
                              temp.skill || null,
                              temp.style,
                              temp.route ? 30 : Math.min(60, commission.target),
                            );
                          }}
                        />
                      )}
                      {tab === "hero" && (
                        <Hero
                          l={l}
                          p={p}
                          reassess={() => setAssessment(true)}
                          attest={(id, note) => {
                            if (
                              skillProgress(p, id).days < 3 ||
                              p.demonstrations.some((d) => d.skill === id)
                            )
                              return;
                            persist({
                              ...p,
                              demonstrations: [
                                {
                                  id: uid(),
                                  date: new Date().toISOString(),
                                  skill: id,
                                  note,
                                  kind: "self-attested",
                                },
                                ...p.demonstrations,
                              ],
                            });
                            setFeedback(t(l, "proofSaved"));
                          }}
                        />
                      )}
                      {tab === "map" && (
                        <>
                          <Segmented
                            value={gallery ? "routes" : "trail"}
                            onChange={(v) => setGallery(v === "routes")}
                            options={[
                              {
                                id: "trail",
                                label: l === "en" ? "Journey map" : "旅途地图",
                              },
                              {
                                id: "routes",
                                label:
                                  l === "en" ? "Route collection" : "线路图鉴",
                              },
                            ]}
                          />
                          {gallery ? (
                            <Gallery
                              p={p}
                              l={l}
                              save={(next) => {
                                const delta = totalXP(next) - totalXP(p);
                                persist(next);
                                if (delta !== 0)
                                  setFeedback(
                                    `${delta > 0 ? "+" : ""}${delta} XP` +
                                      ATTRIBUTES.map((a) => {
                                        const before = growth(p, a),
                                          after = growth(next, a);
                                        const n =
                                          (after.points - before.points) * 100 +
                                          after.progress -
                                          before.progress;
                                        return n
                                          ? `\n${attr(l, a)} ${n > 0 ? "+" : ""}${n}/100`
                                          : "";
                                      }).join(""),
                                  );
                              }}
                            />
                          ) : (
                            <>
                              <Text style={s.title}>{t(l, "trail")}</Text>
                              <PixelMap
                                height={Math.min(300, height * 0.38)}
                                unlocked={nodeCount(p)}
                                onNode={setNode}
                              />
                              <Text style={s.muted}>{t(l, "routeInfo")}</Text>
                              <View style={s.row}>
                                <Text style={s.gold}>
                                  {t(l, "days")} · {trailDays(p)}
                                </Text>
                                <Text style={s.gold}>
                                  {t(l, "best")} · {bestGrade(p)}
                                </Text>
                              </View>
                              <Button
                                label={
                                  t(l, "assessmentHistory") +
                                  ` · ${p.assessments.length}`
                                }
                                onPress={() => setHistory(true)}
                              />
                              {thresholds.map((n, i) => (
                                <Pressable
                                  accessibilityRole="button"
                                  style={s.nodeRow}
                                  key={n}
                                  onPress={() => setNode(i)}
                                >
                                  <PixelGlyph
                                    name={trailDays(p) >= n ? "star" : "lock"}
                                    size={24}
                                  />
                                  <Text style={[s.body, { flex: 1 }]}>
                                    {t(l, `node${i}` as CopyKey)}
                                  </Text>
                                  <Text style={s.muted}>
                                    {trailDays(p) >= n
                                      ? "◆"
                                      : `${trailDays(p)}/${n}`}
                                  </Text>
                                </Pressable>
                              ))}
                            </>
                          )}
                        </>
                      )}
                      {tab === "journal" && (
                        <Journal
                          ref={journalRef}
                          onIssue={setJournalIssue}
                          key={formKey}
                          focusId={focusId}
                          l={l}
                          p={p}
                          initial={initial}
                          readiness={readiness}
                          onAnalyze={(v) => {
                            setAISettings(false);
                            setAISession(v);
                            setAIOpen(true);
                          }}
                          onSave={save}
                          onDelete={(id) => persist(deleteSession(p, id))}
                        />
                      )}
                      {tab === "journal" && (
                        <Button
                          label={
                            l === "en" ? "Add / view routes" : "添加 / 查看线路"
                          }
                          onPress={() => {
                            setGallery(true);
                            setTab("map");
                          }}
                        />
                      )}
                    </ScrollView>
                    {tab === "journal" && (
                      <View style={s.saveBar}>
                        {journalIssue && (
                          <Text accessibilityRole="alert" style={s.warning}>
                            {journalIssue}
                          </Text>
                        )}
                        <Action
                          tone="primary"
                          disabled={savingSession}
                          label={
                            savingSession
                              ? l === "en"
                                ? "Saving…"
                                : "正在保存…"
                              : t(l, "submit")
                          }
                          onPress={() => journalRef.current?.submit()}
                        />
                      </View>
                    )}
                    {!keyboardVisible && (
                      <View style={s.nav}>
                        {tabs.map((v, i) => (
                          <Pressable
                            key={v}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: tab === v }}
                            aria-selected={tab === v}
                            onPress={() => setTab(v)}
                            style={[
                              s.navItem,
                              tab === v && { backgroundColor: C.panel2 },
                            ]}
                          >
                            <View
                              style={v === "journal" ? s.recordIcon : undefined}
                            >
                              <PixelGlyph
                                name={icons[i]}
                                size={24}
                                color={tab === v ? C.gold : C.muted}
                              />
                            </View>
                            <Text
                              style={{
                                color: tab === v ? C.gold : C.muted,
                                fontSize: 12,
                              }}
                            >
                              {t(l, v)}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </>
                )}
                {aiOpen && (
                  <Sheet
                    title={l === "en" ? "Climb notebook" : "线路手记"}
                    close={() => {
                      if (!aiBusy.current) setAIOpen(false);
                    }}
                  >
                    <AICoach
                      l={l}
                      startInSettings={aiSettings}
                      pain={readiness === "pain"}
                      session={aiSession}
                      onBusy={(v) => {
                        aiBusy.current = v;
                      }}
                    />
                  </Sheet>
                )}
                {settings && (
                  <Sheet
                    title={t(l, "settings")}
                    close={() => setSettings(false)}
                  >
                    <PageHeading
                      title={
                        l === "en"
                          ? "Make camp your own"
                          : "按你的习惯，安顿营地"
                      }
                      subtitle={
                        l === "en"
                          ? "Sound, comfort and the language you prefer."
                          : "声音、动效和语言，都由你决定。"
                      }
                    />
                    <SectionHeading
                      title={l === "en" ? "Experience" : "体验偏好"}
                    />
                    <View style={[s.panel, { padding: 0, overflow: "hidden" }]}>
                      <SettingRow
                        label={l === "en" ? "Camp sound" : "营地声音"}
                        value={
                          experience.muted
                            ? l === "en"
                              ? "Muted"
                              : "静音"
                            : l === "en"
                              ? "On"
                              : "开启"
                        }
                        onPress={() => experience.setMuted(!experience.muted)}
                      />
                      <SettingRow
                        label={l === "en" ? "Reduce motion" : "减少动效"}
                        value={
                          experience.reduce
                            ? l === "en"
                              ? "On"
                              : "开启"
                            : l === "en"
                              ? "Off"
                              : "关闭"
                        }
                        onPress={() =>
                          experience.setReduce(!experience.manualReduce)
                        }
                      />
                    </View>
                    {experience.error && (
                      <Text style={s.warning}>
                        {l === "en"
                          ? "Preference storage or audio is unavailable."
                          : "偏好存储或声音暂不可用。"}
                      </Text>
                    )}
                    <SectionHeading title={t(l, "language")} />
                    <Segmented
                      value={l}
                      options={[
                        { id: "zh-CN", label: "简体中文" },
                        { id: "en", label: "English" },
                      ]}
                      onChange={(v) => {
                        const language = v as Language;
                        setL(language);
                        queue.current = queue.current
                          .catch(() => {})
                          .then(() => saveLanguage(language))
                          .catch(() => Alert.alert(t(language, "saveError")));
                      }}
                    />
                    <SectionHeading
                      title={l === "en" ? "Climbing coach" : "攀登教练"}
                      note={
                        l === "en"
                          ? "Choose the provider used by your climb notebooks."
                          : "选择线路手记使用的服务商，管理自己的密钥。"
                      }
                    />
                    <SettingRow
                      label={
                        l === "en"
                          ? "Providers & API keys"
                          : "服务商与 API 密钥"
                      }
                      value={l === "en" ? "Manage" : "管理"}
                      onPress={() => {
                        setSettings(false);
                        setAISettings(true);
                        setAISession(undefined);
                        setAIOpen(true);
                      }}
                    />
                    <Text style={s.muted}>{t(l, "disclaimer")}</Text>
                  </Sheet>
                )}
                {quest && (
                  <Sheet
                    title={questText(l, quest).title}
                    close={() => setQuest(null)}
                  >
                    <Text style={s.gold}>
                      {quest.minutes} min · {t(l, quest.activity)}
                    </Text>
                    {questText(l, quest).steps.map((v, i) => (
                      <Text key={i} style={s.body}>
                        {i + 1}. {v}
                      </Text>
                    ))}
                    <Text style={s.muted}>{t(l, "recordActual")}</Text>
                    {(readiness === "pain" || readiness === "tired") && (
                      <Text style={s.warning}>{t(l, "safety")}</Text>
                    )}
                    <Button
                      active
                      label={t(l, "startLog")}
                      onPress={() => openLog(quest.activity, quest.skill)}
                    />
                  </Sheet>
                )}
                {node !== null && p && (
                  <Sheet
                    title={t(l, `node${node}` as CopyKey)}
                    close={() => setNode(null)}
                  >
                    <Text style={s.gold}>
                      {t(
                        l,
                        trailDays(p) >= thresholds[node] ? "earned" : "locked",
                      )}
                    </Text>
                    <Text style={s.body}>
                      {t(l, "required")} · {trailDays(p)}/{thresholds[node]}
                    </Text>
                    <Text style={s.muted}>{t(l, "routeInfo")}</Text>
                  </Sheet>
                )}
                {history && p && (
                  <Sheet
                    title={t(l, "assessmentHistory")}
                    close={() => setHistory(false)}
                  >
                    {p.assessments.map((v, i) => (
                      <View key={v.id + "-" + i} style={s.panel}>
                        <Text style={s.body}>
                          {new Date(v.date).toLocaleString(l)}
                        </Text>
                        {ATTRIBUTES.map((a) => (
                          <Text style={s.muted} key={a}>
                            {attr(l, a)} · {ratingScore(v.ratings[a])}
                          </Text>
                        ))}
                      </View>
                    ))}
                  </Sheet>
                )}
                {legacyCamp && p && (
                  <Sheet
                    title={l === "en" ? "Camp companions" : "营地伙伴"}
                    close={() => setLegacyCamp(false)}
                  >
                    <LivingCamp
                      reduced={experience.reduce}
                      p={p}
                      l={l}
                      save={persist}
                      navigate={(v) => {
                        setLegacyCamp(false);
                        setTab(v);
                      }}
                      record={() => {
                        setLegacyCamp(false);
                        openLog("bouldering", null);
                      }}
                    />
                  </Sheet>
                )}
                {completion && (
                  <Sheet
                    title={l === "en" ? "Journey saved" : "旅程已保存"}
                    close={() => setCompletion(null)}
                  >
                    <Completion
                      session={completion.session}
                      reward={completion.reward}
                      l={l}
                      reduced={experience.reduce}
                      cue={experience.cue}
                      home={() => setCompletion(null)}
                      recall={() => {
                        setFocusId(completion.session.id);
                        setCompletion(null);
                        setFormKey((k) => k + 1);
                        setTab("journal");
                      }}
                    />
                  </Sheet>
                )}
                {feedback && (
                  <Sheet title={t(l, "reward")} close={() => setFeedback(null)}>
                    <RewardArt reduced={experience.reduce} />
                    <Text style={s.level}>{feedback}</Text>
                    <Text style={s.muted}>{t(l, "disclaimer")}</Text>
                    <Button
                      active
                      label={t(l, "close")}
                      onPress={() => setFeedback(null)}
                    />
                  </Sheet>
                )}
              </>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </ReducedMotionContext.Provider>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  saveBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: C.line,
    backgroundColor: C.bg,
  },
  top: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0,
    borderColor: C.line,
  },
  brand: { color: C.cream, fontWeight: "700", fontSize: 16, letterSpacing: 3 },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: C.line,
  },
  recordIcon: { backgroundColor: C.panel2, borderRadius: 10, padding: 3 },
  stack: { padding: 20, gap: 18, paddingBottom: 32 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  panel: { ...UI.panel },
  title: { ...UI.title, flexShrink: 1 },
  body: { ...UI.body },
  muted: { ...UI.muted },
  gold: { color: C.gold, fontSize: 13, fontWeight: "700" },
  warning: { color: C.danger, lineHeight: 20, fontSize: 13 },
  button: {
    minHeight: 48,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.panel2,
    alignItems: "center",
    justifyContent: "center",
  },
  active: { backgroundColor: C.gold, borderColor: C.gold },
  buttonText: {
    color: C.cream,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  track: { height: 7, backgroundColor: C.line, overflow: "hidden" },
  input: { ...UI.input },
  scene: { borderWidth: 2, borderColor: C.line, overflow: "hidden" },
  sceneTitle: {
    position: "absolute",
    left: 14,
    top: 12,
    color: C.cream,
    fontSize: 17,
    fontWeight: "800",
  },
  hotspot: {
    position: "absolute",
    backgroundColor: "#09232FEE",
    padding: 8,
    borderWidth: 1,
    borderColor: C.gold,
    minHeight: 48,
    justifyContent: "center",
  },
  hotspotText: { color: C.gold, fontSize: 13, fontWeight: "800" },
  nav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: C.line,
    backgroundColor: C.bg,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 4,
  },
  navItem: {
    flex: 1,
    minHeight: 64,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 7,
  },
  scrim: {
    flex: 1,
    backgroundColor: "#000A",
    justifyContent: "flex-end",
    paddingTop: 20,
  },
  sheet: {
    height: "96%",
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  close: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    padding: 20,
  },
  skill: {
    width: "48%",
    borderRadius: 14,
    minHeight: 140,
    padding: 16,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.panel,
    gap: 8,
  },
  level: { color: C.gold, fontWeight: "900", fontSize: 25, lineHeight: 36 },
  nodeRow: {
    minHeight: 60,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: C.panel,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 8,
    borderBottomWidth: 1,
    borderColor: C.line,
  },
});
