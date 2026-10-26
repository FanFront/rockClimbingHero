import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Alert,
  KeyboardAvoidingView,
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
import {
  MountainVista,
  HeroSprite,
  PixelGlyph,
  ExpeditionMap,
} from "./src/art";
import { C } from "./src/theme";
import {
  ATTRIBUTES,
  QUESTIONS,
  DEFAULT_RATINGS,
  SKILLS,
  createProfile,
  latestRatings,
  totalXP,
  heroLevel,
  levelBounds,
  skillProgress,
  countTrainingDays,
  logSession,
  deleteSession,
  reassess,
  recommendedQuest,
  sessionXP,
  ratingScore,
  type AppData,
  type Ratings,
  type Readiness,
  type Activity,
  type SkillId,
  type Session,
  type ClimbStyle,
} from "./src/domain";
import {
  loadProfile,
  saveProfile,
  loadPreferences,
  savePreferences,
  type Preferences,
} from "./src/storage";
import {
  translate,
  skillZh,
  skillPracticeZh,
  questionZh,
  questZh,
  places,
  type Language,
  type Word,
} from "./src/i18n";
const Locale = createContext<Language>("zh-CN");
function useT() {
  const l = useContext(Locale);
  return (k: Word) => translate(l, k);
}
function Copy({ id }: { id: Word }) {
  const t = useT();
  return <Text style={styles.body}>{t(id)}</Text>;
}
const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
type Tab = "camp" | "quests" | "hero" | "map" | "journal";
const tabs: Tab[] = ["camp", "quests", "hero", "map", "journal"];
const glyphs = ["fire", "compass", "mountain", "map", "journal"];
const nodeCount = (p: AppData) => Math.min(4, countTrainingDays(p));
function Button({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && { opacity: 0.4 }]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}
function Chip({
  label,
  onPress,
  active = false,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && { color: C.bg }]}>{label}</Text>
    </Pressable>
  );
}
function Panel({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <View style={styles.panel}>
      {title && <Text style={styles.panelTitle}>{title}</Text>}
      {children}
    </View>
  );
}
function Meter({ value, max }: { value: number; max: number }) {
  return (
    <View style={styles.meterTrack}>
      <View
        style={{
          height: 9,
          width: `${Math.min(100, (100 * value) / Math.max(1, max))}%`,
          backgroundColor: C.gold,
        }}
      />
    </View>
  );
}
function Field({
  label,
  value,
  onChangeText,
  numeric = false,
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  numeric?: boolean;
}) {
  return (
    <View style={{ flex: 1, gap: 5 }}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        keyboardType={numeric ? "number-pad" : "default"}
        style={styles.input}
        placeholderTextColor={C.muted}
      />
    </View>
  );
}
function Sheet({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  const t = useT();
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
          <View style={styles.topbar}>
            <Text style={styles.panelTitle}>{title}</Text>
            <Chip label={t("close")} onPress={onClose} />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
function Assessment({
  profile,
  onSave,
  onClose,
}: {
  profile: AppData | null;
  onSave: (name: string, r: Ratings) => void;
  onClose: () => void;
}) {
  const t = useT(),
    language = useContext(Locale);
  const [step, setStep] = useState(0),
    [name, setName] = useState(profile?.name || ""),
    [ratings, setRatings] = useState(
      profile ? latestRatings(profile) : { ...DEFAULT_RATINGS },
    );
  const q = QUESTIONS[step];
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.onboard}
    >
      <MountainVista height={180} />
      <Text style={styles.bigHeading}>{t(profile ? "reassess" : "intro")}</Text>
      <Meter value={step + 1} max={5} />
      {!profile && step === 0 && (
        <Field
          label={t("name")}
          value={name}
          onChangeText={(s) => setName(s.slice(0, 28))}
        />
      )}
      <Panel title={`${step + 1} / 5 · ${t(q.attribute)}`}>
        <PixelGlyph name={q.attribute} size={48} />
        <Text style={styles.question}>
          {language === "zh-CN" ? questionZh[step] : q.question}
        </Text>
        <Text style={styles.micro}>{t("confidence")}</Text>
        <View style={styles.chipRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Chip
              key={n}
              label={`${n}`}
              active={ratings[q.attribute] === n}
              onPress={() => setRatings({ ...ratings, [q.attribute]: n })}
            />
          ))}
        </View>
      </Panel>
      <Button
        label={t(step === 4 ? "create" : "next")}
        onPress={() =>
          step === 4
            ? onSave(
                name.trim() || (language === "zh-CN" ? "探险者" : "Explorer"),
                ratings,
              )
            : setStep(step + 1)
        }
      />
      {step > 0 && <Chip label={t("back")} onPress={() => setStep(step - 1)} />}{" "}
      {profile && <Chip label={t("leave")} onPress={onClose} />}
    </ScrollView>
  );
}
function Hero({
  data,
  prefs,
  setPrefs,
  onReassess,
  onAttest,
}: {
  data: AppData;
  prefs: Preferences;
  setPrefs: (p: Preferences) => void;
  onReassess: () => void;
  onAttest: (s: SkillId, n: string) => void;
}) {
  const t = useT(),
    lang = useContext(Locale),
    [section, setSection] = useState<Word>("attributes"),
    [selected, setSelected] = useState<SkillId | null>(null),
    [note, setNote] = useState(""),
    [showHistory, setShowHistory] = useState(false);
  const xp = totalXP(data),
    b = levelBounds(heroLevel(xp));
  const skill = SKILLS.find((s) => s.id === selected),
    p = selected ? skillProgress(data, selected) : null;
  return (
    <>
      <View style={styles.profileRow}>
        <View style={{ width: "47%" }}>
          <HeroSprite height={215} gold={prefs.outfit === "gold" && xp >= 80} />
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          <Text style={styles.featureTitle}>{data.name}</Text>
          <Text style={styles.level}>LV {heroLevel(xp)}</Text>
          <Meter value={xp - b.from} max={b.to - b.from} />
          <Text style={styles.micro}>{xp} XP</Text>
        </View>
      </View>
      <View style={styles.chipRow}>
        {(["attributes", "skills", "outfit", "badges"] as Word[]).map((s) => (
          <Chip
            key={s}
            label={t(s)}
            active={s === section}
            onPress={() => setSection(s)}
          />
        ))}
      </View>
      {section === "attributes" && (
        <Panel>
          {ATTRIBUTES.map((a) => (
            <View style={styles.statRow} key={a}>
              <PixelGlyph name={a} size={28} />
              <View style={{ flex: 1 }}>
                <Text style={styles.body}>
                  {t(a)} · {ratingScore(latestRatings(data)[a])}
                </Text>
                <Meter value={latestRatings(data)[a]} max={5} />
              </View>
            </View>
          ))}
          <Text style={styles.micro}>{t("xpNote")}</Text>
          <Chip label={t("reassess")} onPress={onReassess} />
          <Chip
            label={`${showHistory ? "−" : "+"} ${t("history")} · ${data.assessments.length}`}
            onPress={() => setShowHistory(!showHistory)}
          />
          {showHistory &&
            data.assessments.map((a) => (
              <Text style={styles.micro} key={a.id}>
                {new Date(a.date).toLocaleDateString(lang)} ·{" "}
                {ATTRIBUTES.map((k) => `${t(k)} ${a.ratings[k]}`).join(" / ")}
              </Text>
            ))}
        </Panel>
      )}
      {section === "skills" && (
        <View style={styles.skillGrid}>
          {SKILLS.map((s, i) => {
            const p = skillProgress(data, s.id);
            return (
              <Pressable
                accessibilityRole="button"
                key={s.id}
                onPress={() => {
                  setSelected(s.id);
                  setNote("");
                }}
                style={[styles.skillCard, { minHeight: 94 }]}
              >
                <PixelGlyph name={s.id} size={28} />
                <Text style={styles.skillName}>
                  {lang === "zh-CN" ? skillZh[i] : s.title}
                </Text>
                <Text style={styles.micro}>
                  {p.days}/3 ·{" "}
                  {t(
                    p.rank === "Self-attested"
                      ? "attested"
                      : p.days >= 3
                        ? "learned"
                        : p.days
                          ? "practicing"
                          : "unknown",
                  )}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {section === "outfit" && (
        <Panel>
          <Copy id="defaultOutfit" />
          <Chip
            label={t(prefs.outfit === "trail" ? "equipped" : "equip")}
            onPress={() => setPrefs({ ...prefs, outfit: "trail" })}
          />
          <Copy id="goldOutfit" />
          <Copy id="outfitHint" />
          <Button
            label={t(prefs.outfit === "gold" ? "equipped" : "equip")}
            disabled={xp < 80}
            onPress={() => setPrefs({ ...prefs, outfit: "gold" })}
          />
        </Panel>
      )}
      {section === "badges" && (
        <Panel>
          {(["first", "steady", "master"] as Word[]).map((k, i) => (
            <View style={styles.featureLine} key={k}>
              <PixelGlyph
                name="star"
                color={
                  (
                    i === 0
                      ? data.sessions.length > 0
                      : i === 1
                        ? countTrainingDays(data) >= 3
                        : data.demonstrations.some(
                            (d) =>
                              skillProgress(data, d.skill).rank ===
                              "Self-attested",
                          )
                  )
                    ? C.gold
                    : C.line
                }
              />
              <Copy id={k} />
            </View>
          ))}
        </Panel>
      )}
      {skill && p && (
        <Sheet
          title={
            lang === "zh-CN" ? skillZh[SKILLS.indexOf(skill)] : skill.title
          }
          onClose={() => setSelected(null)}
        >
          <PixelGlyph name={skill.id} size={64} />
          <Text style={styles.body}>
            {lang === "zh-CN"
              ? skillPracticeZh[SKILLS.indexOf(skill)]
              : skill.practice}
          </Text>
          <Text style={styles.note}>
            {t("days")} {p.days}/3
          </Text>
          {p.rank === "Self-attested" ? (
            <>
              <Copy id="attested" />
              {data.demonstrations
                .filter((d) => d.skill === skill.id)
                .map((d) => (
                  <Text style={styles.body} key={d.id}>
                    {d.note}
                  </Text>
                ))}
            </>
          ) : p.days >= 3 ? (
            <>
              <Copy id="attestHint" />
              <Field label={t("notes")} value={note} onChangeText={setNote} />
              <Button
                label={t("attest")}
                disabled={note.trim().length < 10}
                onPress={() => {
                  onAttest(skill.id, note.trim());
                  setSelected(null);
                }}
              />
            </>
          ) : (
            <Copy id="choose" />
          )}
        </Sheet>
      )}
    </>
  );
}
function Journal({
  data,
  readiness,
  initialActivity,
  initialSkill,
  onSave,
  onDelete,
}: {
  data: AppData;
  readiness: Readiness;
  initialActivity: Activity;
  initialSkill: SkillId | null;
  onSave: (s: Session) => void;
  onDelete: (id: string) => void;
}) {
  const t = useT(),
    lang = useContext(Locale),
    [activity, setActivity] = useState(initialActivity),
    [skill, setSkill] = useState(initialSkill),
    [duration, setDuration] = useState(
      initialActivity === "recovery" ? "15" : "45",
    ),
    [attempts, setAttempts] = useState("0"),
    [sends, setSends] = useState("0"),
    [grade, setGrade] = useState(""),
    [more, setMore] = useState(false),
    [history, setHistory] = useState(false),
    [pain, setPain] = useState(readiness === "pain"),
    [notes, setNotes] = useState(""),
    [effort, setEffort] = useState(3),
    [style, setStyle] = useState<ClimbStyle>("Vertical");
  const submit = () => {
    const d = Number(duration),
      a = Number(attempts),
      s = Number(sends);
    if (
      !duration.trim() ||
      !Number.isFinite(d) ||
      d < 5 ||
      d > 240 ||
      (activity === "bouldering" &&
        (!attempts.trim() ||
          !sends.trim() ||
          !Number.isInteger(a) ||
          !Number.isInteger(s) ||
          a < 0 ||
          s < 0 ||
          s > a ||
          (!!grade.trim() && !/^V\d{1,2}$/i.test(grade.trim()))))
    )
      return Alert.alert(t("error"), t("invalid"));
    onSave({
      id: id(),
      date: new Date().toISOString(),
      activity,
      duration: d,
      effort,
      attempts: activity === "bouldering" ? a : 0,
      sends: activity === "bouldering" ? s : 0,
      grade: activity === "bouldering" ? grade.trim().toUpperCase() : "",
      skill: activity === "recovery" ? null : skill,
      style,
      notes: notes.trim().slice(0, 500),
      pain,
    });
    setNotes("");
    setAttempts("0");
    setSends("0");
    setGrade("");
  };
  return (
    <>
      <View style={styles.chipRow}>
        <Chip
          label={t("log")}
          active={!history}
          onPress={() => setHistory(false)}
        />
        <Chip
          label={`${t("recent")} · ${data.sessions.length}`}
          active={history}
          onPress={() => setHistory(true)}
        />
      </View>
      {history ? (
        <Panel>
          {data.sessions.length === 0 ? (
            <Copy id="empty" />
          ) : (
            data.sessions.map((s) => (
              <View style={styles.historyRow} key={s.id}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.body}>
                    {t(s.activity)} · {s.duration} min · +{sessionXP(s)} XP
                  </Text>
                  <Text style={styles.micro}>
                    {new Date(s.date).toLocaleDateString(lang)} · {s.grade} ·{" "}
                    {t("sends")} {s.sends}
                    {s.pain ? ` · ${t("pain")}` : ""}
                  </Text>
                  {!!s.notes && <Text style={styles.micro}>{s.notes}</Text>}
                </View>
                <Chip
                  label={t("delete")}
                  onPress={() =>
                    Alert.alert(t("delete"), t("deleteHint"), [
                      { text: t("cancel"), style: "cancel" },
                      {
                        text: t("delete"),
                        style: "destructive",
                        onPress: () => onDelete(s.id),
                      },
                    ])
                  }
                />
              </View>
            ))
          )}
        </Panel>
      ) : (
        <Panel>
          <View style={styles.chipRow}>
            {(
              ["bouldering", "strength", "mobility", "recovery"] as Activity[]
            ).map((a) => (
              <Chip
                key={a}
                label={t(a)}
                active={activity === a}
                onPress={() => setActivity(a)}
              />
            ))}
          </View>
          <Field
            label={t("minutes")}
            value={duration}
            onChangeText={setDuration}
            numeric
          />
          {activity === "bouldering" && (
            <>
              <Field label={t("grade")} value={grade} onChangeText={setGrade} />
              <View style={styles.twoColumns}>
                <Field
                  label={t("attempts")}
                  value={attempts}
                  onChangeText={setAttempts}
                  numeric
                />
                <Field
                  label={t("sends")}
                  value={sends}
                  onChangeText={setSends}
                  numeric
                />
              </View>
            </>
          )}
          <Text style={styles.sectionLabel}>{t("choose")}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 7 }}
          >
            <Chip
              label={t("none")}
              active={!skill}
              onPress={() => setSkill(null)}
            />
            {SKILLS.map((s, i) => (
              <Chip
                key={s.id}
                label={lang === "zh-CN" ? skillZh[i] : s.title}
                active={skill === s.id}
                onPress={() => setSkill(s.id)}
              />
            ))}
          </ScrollView>
          <Chip
            label={`${pain ? "☑" : "☐"} ${t("painCheck")}`}
            onPress={() => setPain(!pain)}
          />
          {(pain || readiness === "pain") && (
            <Text style={styles.warning}>{t("safety")}</Text>
          )}
          <Button label={t("save")} onPress={submit} />
          <Chip
            label={`${more ? "−" : "+"} ${t("more")}`}
            onPress={() => setMore(!more)}
          />
          {more && (
            <>
              <Copy id="effort" />
              <View style={styles.chipRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Chip
                    key={n}
                    label={`${n}`}
                    active={effort === n}
                    onPress={() => setEffort(n)}
                  />
                ))}
              </View>
              <Copy id="style" />
              <View style={styles.chipRow}>
                {(
                  ["Slab", "Vertical", "Overhang", "Mixed"] as ClimbStyle[]
                ).map((s) => (
                  <Chip
                    key={s}
                    label={t(s)}
                    active={style === s}
                    onPress={() => setStyle(s)}
                  />
                ))}
              </View>
              <Field
                label={t("notes")}
                value={notes}
                onChangeText={(s) => setNotes(s.slice(0, 500))}
              />
            </>
          )}
        </Panel>
      )}
    </>
  );
}
export default function App() {
  const [prefs, setPrefsState] = useState<Preferences>({
    language: "zh-CN",
    outfit: "trail",
  });
  return (
    <SafeAreaProvider>
      <Locale.Provider value={prefs.language}>
        <Game prefs={prefs} setPrefsState={setPrefsState} />
      </Locale.Provider>
    </SafeAreaProvider>
  );
}
function Game({
  prefs,
  setPrefsState,
}: {
  prefs: Preferences;
  setPrefsState: (p: Preferences) => void;
}) {
  const t = useT(),
    lang = useContext(Locale),
    { height } = useWindowDimensions();
  const [loaded, setLoaded] = useState(false),
    [loadFailed, setLoadFailed] = useState(false),
    [saveFailed, setSaveFailed] = useState(false),
    [data, setData] = useState<AppData | null>(null),
    [tab, setTab] = useState<Tab>("camp"),
    [readiness, setReadiness] = useState<Readiness>("normal"),
    [assessment, setAssessment] = useState(false),
    [settings, setSettings] = useState(false),
    [detail, setDetail] = useState(false),
    [node, setNode] = useState<number | null>(null),
    [feedback, setFeedback] = useState<string | null>(null),
    [initialActivity, setInitialActivity] = useState<Activity>("bouldering"),
    [initialSkill, setInitialSkill] = useState<SkillId | null>(null),
    [logKey, setLogKey] = useState(0);
  const queue = useRef(Promise.resolve());
  const load = () => {
    setLoadFailed(false);
    Promise.all([loadProfile(), loadPreferences()])
      .then(([p, pref]) => {
        setData(p);
        setPrefsState(pref);
        setLoaded(true);
      })
      .catch(() => setLoadFailed(true));
  };
  useEffect(load, []);
  const persist = (p: AppData) => {
    queue.current = queue.current
      .catch(() => {})
      .then(() => saveProfile(p))
      .then(() => setSaveFailed(false))
      .catch(() => setSaveFailed(true));
  };
  const update = (p: AppData) => {
    setData(p);
    persist(p);
  };
  const setPrefs = (p: Preferences) => {
    setPrefsState(p);
    queue.current = queue.current
      .catch(() => {})
      .then(() => savePreferences(p))
      .catch(() => Alert.alert(t("error"), t("storageError")));
  };
  const openLog = (a: Activity = "bouldering", s: SkillId | null = null) => {
    setInitialActivity(a);
    setInitialSkill(s);
    setLogKey((k) => k + 1);
    setTab("journal");
  };
  const save = (s: Session) => {
    if (!data) return;
    const next = logSession(data, s),
      diff = totalXP(next) - totalXP(data);
    let message = `+${diff} XP`;
    if (heroLevel(totalXP(next)) > heroLevel(totalXP(data)))
      message += `\n${t("levelUp")} · LV ${heroLevel(totalXP(next))}`;
    if (nodeCount(next) > nodeCount(data)) message += `\n${t("nodeUp")}`;
    if (
      s.skill &&
      skillProgress(next, s.skill).days > skillProgress(data, s.skill).days
    )
      message += `\n${t("skillUp")} · ${skillProgress(next, s.skill).days}/3`;
    update(next);
    setFeedback(message);
  };
  const q = data ? recommendedQuest(data, readiness) : null;
  const questName = q ? (lang === "zh-CN" ? questZh[q.id][0] : q.title) : "";
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      {!loaded ? (
        <View style={styles.loading}>
          <PixelGlyph name="fire" size={64} />
          <Text style={styles.featureTitle}>
            {t(loadFailed ? "loadError" : "loading")}
          </Text>
          {loadFailed && <Button label={t("retry")} onPress={load} />}
        </View>
      ) : !data || assessment ? (
        <Assessment
          profile={data}
          onClose={() => setAssessment(false)}
          onSave={(name, r) => {
            update(
              data
                ? reassess(data, r, new Date().toISOString())
                : createProfile(name, r),
            );
            setAssessment(false);
            setTab(data ? "hero" : "camp");
          }}
        />
      ) : (
        <>
          <View style={styles.topbar}>
            <View>
              <Text style={styles.logoSmall}>▲ ASCENT</Text>
              <Text style={styles.tagline}>
                {t("intro")} · {data.name}
              </Text>
            </View>
            <Chip
              label={`⚙ ${t("settings")}`}
              onPress={() => setSettings(true)}
            />
          </View>
          {saveFailed && (
            <Button label={t("saveRetry")} onPress={() => persist(data)} />
          )}
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
            <ScrollView
              key={tab}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                styles.content,
                tab === "camp" && { gap: 8 },
              ]}
            >
              {tab === "camp" && (
                <>
                  <View style={styles.rowBetween}>
                    <Text style={styles.featureTitle}>
                      {t("camp")} · LV {heroLevel(totalXP(data))}
                    </Text>
                    <Text style={styles.note}>{totalXP(data)} XP</Text>
                  </View>
                  <Meter
                    value={
                      totalXP(data) - levelBounds(heroLevel(totalXP(data))).from
                    }
                    max={
                      levelBounds(heroLevel(totalXP(data))).to -
                      levelBounds(heroLevel(totalXP(data))).from
                    }
                  />
                  <View style={styles.heroArtwork}>
                    <MountainVista
                      height={Math.max(240, Math.min(400, height * 0.38))}
                    />
                    <View
                      style={{
                        position: "absolute",
                        bottom: 22,
                        left: "39%",
                        width: "27%",
                      }}
                    >
                      <HeroSprite
                        height={145}
                        gold={prefs.outfit === "gold" && totalXP(data) >= 80}
                      />
                    </View>
                    <View style={{ position: "absolute", left: 12, top: 20 }}>
                      <Chip
                        label={`◇ ${t("map")}`}
                        onPress={() => setTab("map")}
                      />
                    </View>
                    <View style={{ position: "absolute", right: 12, top: 80 }}>
                      <Chip
                        label={`▤ ${t("quests")}`}
                        onPress={() => setTab("quests")}
                      />
                    </View>
                    <View
                      style={{ position: "absolute", left: 10, bottom: 12 }}
                    >
                      <Chip label={t("hero")} onPress={() => setTab("hero")} />
                    </View>
                    <View
                      style={{ position: "absolute", right: 10, bottom: 12 }}
                    >
                      <Chip
                        label={t("log")}
                        onPress={() =>
                          openLog(
                            readiness === "pain" || readiness === "tired"
                              ? "recovery"
                              : "bouldering",
                          )
                        }
                      />
                    </View>
                  </View>
                  <View style={styles.chipRow}>
                    {(["fresh", "normal", "tired", "pain"] as Readiness[]).map(
                      (r) => (
                        <Chip
                          key={r}
                          label={t(r)}
                          active={readiness === r}
                          onPress={() => setReadiness(r)}
                        />
                      ),
                    )}
                  </View>
                  {readiness === "pain" && (
                    <Text style={styles.warning}>{t("safety")}</Text>
                  )}
                  <Pressable
                    accessibilityRole="button"
                    style={[styles.panel, { padding: 9, gap: 3 }]}
                    onPress={() => setTab("quests")}
                  >
                    <Text style={styles.eyebrow}>{t("today")}</Text>
                    <Text style={styles.featureTitle}>{questName} →</Text>
                  </Pressable>
                </>
              )}
              {tab === "quests" && q && (
                <>
                  <MountainVista
                    height={Math.min(250, height * 0.28)}
                    mode="trail"
                  />
                  <Panel title={t("today")}>
                    <PixelGlyph name={q.skill || "heart"} size={42} />
                    <Text style={styles.featureTitle}>{questName}</Text>
                    <Text style={styles.note}>
                      {q.minutes} min · {t(q.activity)}
                    </Text>
                    <Copy id="reward" />
                    <Chip
                      label={t("details")}
                      onPress={() => setDetail(true)}
                    />
                    <Button
                      label={t("start")}
                      onPress={() => openLog(q.activity, q.skill)}
                    />
                  </Panel>
                  {q.activity !== "recovery" && (
                    <Panel title={t("rest")}>
                      <Copy id="xpNote" />
                      <Button
                        label={t("rest")}
                        onPress={() => openLog("recovery")}
                      />
                    </Panel>
                  )}
                </>
              )}
              {tab === "hero" && (
                <Hero
                  data={data}
                  prefs={prefs}
                  setPrefs={setPrefs}
                  onReassess={() => setAssessment(true)}
                  onAttest={(skill, note) => {
                    if (skillProgress(data, skill).days < 3) return;
                    update({
                      ...data,
                      demonstrations: [
                        {
                          id: id(),
                          date: new Date().toISOString(),
                          skill,
                          note,
                          kind: "self-attested",
                        },
                        ...data.demonstrations,
                      ],
                    });
                  }}
                />
              )}
              {tab === "map" && (
                <>
                  <Text style={styles.bigHeading}>{t("map")}</Text>
                  <Text style={styles.micro}>{t("routeHint")}</Text>
                  <ExpeditionMap
                    height={Math.max(330, Math.min(500, height * 0.59))}
                    unlocked={nodeCount(data)}
                    onNode={setNode}
                  />
                  <Panel>
                    <Text style={styles.note}>
                      {t("days")} · {countTrainingDays(data)}
                    </Text>
                    <Text style={styles.body}>
                      {places[nodeCount(data)][lang === "zh-CN" ? 0 : 1]}
                    </Text>
                    <Copy id="xpNote" />
                  </Panel>
                </>
              )}
              {tab === "journal" && (
                <Journal
                  key={logKey}
                  data={data}
                  readiness={readiness}
                  initialActivity={initialActivity}
                  initialSkill={initialSkill}
                  onSave={save}
                  onDelete={(sid) => update(deleteSession(data, sid))}
                />
              )}
            </ScrollView>
          </KeyboardAvoidingView>
          <View style={styles.tabbar}>
            {tabs.map((item, i) => (
              <Pressable
                key={item}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === item }}
                onPress={() =>
                  item === "journal"
                    ? openLog(
                        readiness === "pain" || readiness === "tired"
                          ? "recovery"
                          : "bouldering",
                      )
                    : setTab(item)
                }
                style={[styles.tab, tab === item && styles.tabSelected]}
              >
                <PixelGlyph
                  name={glyphs[i]}
                  size={22}
                  color={tab === item ? C.gold : C.muted}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: tab === item ? C.gold : C.muted },
                  ]}
                >
                  {t(item)}
                </Text>
              </Pressable>
            ))}
          </View>
          {settings && (
            <Sheet title={t("settings")} onClose={() => setSettings(false)}>
              <View style={styles.chipRow}>
                <Chip
                  label="简体中文"
                  active={lang === "zh-CN"}
                  onPress={() => setPrefs({ ...prefs, language: "zh-CN" })}
                />
                <Chip
                  label="English"
                  active={lang === "en"}
                  onPress={() => setPrefs({ ...prefs, language: "en" })}
                />
              </View>
              <Copy id="xpNote" />
              <Copy id="safety" />
            </Sheet>
          )}
          {detail && q && (
            <Sheet title={questName} onClose={() => setDetail(false)}>
              {(lang === "zh-CN" ? questZh[q.id][1] : q.steps).map((s, i) => (
                <Text key={i} style={styles.body}>
                  {i + 1}. {s}
                </Text>
              ))}
              <Button
                label={t("start")}
                onPress={() => {
                  setDetail(false);
                  openLog(q.activity, q.skill);
                }}
              />
            </Sheet>
          )}
          {node !== null && (
            <Sheet
              title={places[node][lang === "zh-CN" ? 0 : 1]}
              onClose={() => setNode(null)}
            >
              <PixelGlyph
                name={node <= nodeCount(data) ? "compass" : "mountain"}
                size={80}
              />
              <Text style={styles.featureTitle}>
                {t(node <= nodeCount(data) ? "unlocked" : "locked")}
              </Text>
              <Text style={styles.body}>
                {t("days")} · {Math.min(countTrainingDays(data), node)}/{node}
              </Text>
              <Copy id="routeHint" />
              <Button
                label={t("log")}
                onPress={() => {
                  setNode(null);
                  openLog(
                    readiness === "pain" || readiness === "tired"
                      ? "recovery"
                      : "bouldering",
                  );
                }}
              />
            </Sheet>
          )}
          {feedback && (
            <Sheet title={t("saved")} onClose={() => setFeedback(null)}>
              <PixelGlyph name="star" size={84} />
              <Text style={styles.level}>{feedback}</Text>
              {saveFailed && <Copy id="storageError" />}
              <Copy id="xpNote" />
              <Button
                label={t("returnCamp")}
                onPress={() => {
                  setFeedback(null);
                  setTab("camp");
                }}
              />
            </Sheet>
          )}
        </>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", gap: 14 },
  topbar: {
    minHeight: 64,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: C.line,
    borderBottomWidth: 1,
  },
  logo: {
    fontSize: 43,
    color: C.cream,
    fontWeight: "900",
    letterSpacing: 6,
    textAlign: "center",
  },
  logoSmall: {
    fontSize: 23,
    color: C.gold,
    fontWeight: "900",
    letterSpacing: 2,
  },
  tagline: { fontSize: 9, letterSpacing: 1.5, color: C.muted, marginTop: 3 },
  content: { padding: 14, paddingBottom: 18, gap: 13 },
  onboard: { padding: 14, gap: 14, paddingBottom: 30 },
  panel: {
    borderWidth: 2,
    borderColor: C.line,
    backgroundColor: C.panel,
    padding: 14,
    gap: 11,
  },
  panelTitle: {
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 1.4,
    color: C.cream,
  },
  bigHeading: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1.1,
    color: C.cream,
  },
  eyebrow: {
    color: C.gold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  body: { color: C.cream, fontSize: 13, lineHeight: 21 },
  micro: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 16,
    fontFamily: "sans-serif",
  },
  question: { color: C.cream, fontSize: 16, fontWeight: "700", lineHeight: 23 },
  input: {
    backgroundColor: C.bg,
    borderColor: C.line,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: C.cream,
    fontSize: 14,
    minHeight: 46,
  },
  button: {
    minHeight: 50,
    backgroundColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 4,
    borderBottomColor: C.goldDim,
    marginTop: 3,
  },
  buttonText: {
    fontWeight: "900",
    color: C.bg,
    letterSpacing: 0.6,
    fontSize: 14,
    textAlign: "center",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: {
    minWidth: 33,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.panel2,
  },
  chipActive: { backgroundColor: C.gold, borderColor: C.gold },
  chipText: { color: C.cream, fontSize: 11, fontWeight: "800" },
  sectionLabel: {
    color: C.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 6,
  },
  meterTrack: { backgroundColor: "#294651", height: 9, overflow: "hidden" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  heroArtwork: {
    borderColor: C.line,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  warning: {
    color: C.danger,
    fontSize: 12,
    lineHeight: 18,
    borderLeftWidth: 3,
    borderLeftColor: C.danger,
    paddingLeft: 10,
    marginTop: 4,
  },
  note: {
    color: C.gold,
    fontSize: 11,
    lineHeight: 18,
    fontFamily: "sans-serif",
  },
  featureLine: { flexDirection: "row", gap: 13, alignItems: "center" },
  featureTitle: {
    fontSize: 19,
    color: C.cream,
    fontWeight: "900",
    marginBottom: 4,
  },
  profileRow: { flexDirection: "row", gap: 7, alignItems: "center" },
  level: { color: C.gold, fontSize: 30, fontWeight: "900", marginTop: 7 },
  skillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  skillCard: {
    width: "48.5%",
    minHeight: 113,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.panel2,
    padding: 10,
    gap: 5,
  },
  skillName: { color: C.cream, fontWeight: "800", fontSize: 12 },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomColor: C.line,
    borderBottomWidth: 1,
  },
  twoColumns: { flexDirection: "row", gap: 10 },
  tabbar: {
    flexDirection: "row",
    backgroundColor: "#0D2430",
    borderTopColor: C.line,
    borderTopWidth: 1,
    minHeight: 68,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
  },
  tabSelected: {
    backgroundColor: "#153542",
    borderTopWidth: 2,
    borderTopColor: C.gold,
  },
  tabText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.4 },
});
