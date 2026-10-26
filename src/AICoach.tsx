import {
  coachingContext,
  type ClimbProject,
  type AttemptOutcome,
} from "./coaching";
import {
  loadClimbs,
  saveClimb,
  recordClimbAttempt,
  removeClimb,
} from "./coachingStorage";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Picker from "expo-image-picker";
import * as FS from "expo-file-system/legacy";
import Storage from "expo-sqlite/kv-store";
import { media } from "./media";
import {
  analyze,
  defaults,
  validateProfile,
  type AIEntry,
  type AIKeyProfile,
  type Provider,
  type AIAttachment,
} from "./ai";
import {
  addAIEntry,
  updateAIEntry,
  deleteAIEntry,
  loadAIEntries,
  loadAIProfiles,
  saveAIProfile,
  deleteAIProfile,
  readAIKey,
  retainAttachment,
  attachmentData,
} from "./aiStorage";
import { C } from "./theme";
import type { Language } from "./i18n";
import type { Session } from "./domain";
export function AICoach({
  l,
  session,
  onBusy,
  pain = false,
  startInSettings = false,
}: {
  l: Language;
  session?: Session;
  pain?: boolean;
  startInSettings?: boolean;
  onBusy: (busy: boolean) => void;
}) {
  const zh = l !== "en",
    copy = (a: string, b: string) => (zh ? a : b);
  const [profiles, setProfiles] = useState<AIKeyProfile[]>([]),
    [selected, setSelected] = useState(""),
    [entries, setEntries] = useState<AIEntry[]>([]),
    [loading, setLoading] = useState(true),
    [settings, setSettings] = useState(startInSettings),
    [scene, setScene] = useState<"route" | "attempt">(
      session ? "attempt" : "route",
    ),
    [question, setQuestion] = useState(
      session
        ? `${session.duration} min · ${session.grade} · ${session.style}\nAttempts: ${session.attempts}, sends: ${session.sends}, effort: ${session.effort}/5, pain: ${session.pain}\n${session.notes}`
        : "",
    ),
    [attachment, setAttachment] = useState<AIAttachment>(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [detail, setDetail] = useState<string>();
  const [composing, setComposing] = useState(false),
    [showEvidence, setShowEvidence] = useState(false),
    [notice, setNotice] = useState("");
  const [choosing, setChoosing] = useState(false),
    [reusePhoto, setReusePhoto] = useState(true);
  const [climbs, setClimbs] = useState<ClimbProject[]>([]),
    [climbId, setClimbId] = useState(""),
    [climbName, setClimbName] = useState(""),
    [goal, setGoal] = useState(""),
    [attemptNote, setAttemptNote] = useState(""),
    [intent, setIntent] = useState<"next" | "review">("next"),
    [showContext, setShowContext] = useState(false),
    [legacy, setLegacy] = useState(false);
  const project = climbs.find((p) => p.id === climbId);
  const related = entries.filter((e) => e.climbId === climbId);
  const inheritedPhoto = related.find((e) =>
    e.attachment?.mime.startsWith("image/"),
  )?.attachment;
  const outgoingMedia = attachment || (reusePhoto ? inheritedPhoto : undefined);
  const context = project
    ? coachingContext(project, entries, intent === "review")
    : "";
  const selectClimb = (id: string) => {
    setClimbId(id);
    setAttemptNote("");
    setComposing(false);
    setNotice("");
    setChoosing(false);
    setReusePhoto(true);
    setDetail(undefined);
    setLegacy(false);
    setQuestion("");
    setAttachment(undefined);
    setIntent("next");
    void Storage.setItem("ascent.climb.active", id).catch(fail);
  };
  const lock = useRef(false);
  const [provider, setProvider] = useState<Provider>("qwen"),
    [name, setName] = useState(""),
    [secret, setSecret] = useState(""),
    [baseURL, setBaseURL] = useState(defaults.qwen.baseURL),
    [model, setModel] = useState(defaults.qwen.model),
    [editing, setEditing] = useState<string>();
  const refresh = async () => {
    const [p, e, id, projects] = await Promise.all([
      loadAIProfiles(),
      loadAIEntries(),
      Storage.getItem("ascent.ai.active"),
      loadClimbs(),
    ]);
    setClimbs(projects);
    setProfiles(p);
    setEntries(e);
    setSelected(p.some((v) => v.id === id) ? id! : p[0]?.id || "");
  };
  useEffect(() => {
    refresh()
      .then(async () => {
        const id = await Storage.getItem("ascent.climb.active");
        if (id) setClimbId(id);
      })
      .catch(() =>
        setError(
          copy(
            "无法读取 AI 存档，请重试。",
            "Could not load AI history. Retry.",
          ),
        ),
      )
      .finally(() => setLoading(false));
  }, []);
  const action = (
    label: string,
    fn: () => void,
    active = false,
    disabled = false,
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy, selected: active }}
      disabled={disabled || busy}
      onPress={fn}
      style={[
        s.button,
        active && s.active,
        (disabled || busy) && { opacity: 0.5 },
      ]}
    >
      <Text style={[s.text, active && { color: C.bg }]}>{label}</Text>
    </Pressable>
  );
  const field = (
    label: string,
    value: string,
    change: (s: string) => void,
    password = false,
  ) => (
    <View style={{ gap: 6 }}>
      <Text style={s.muted}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={change}
        editable={!busy}
        secureTextEntry={password}
        autoCapitalize="none"
        autoCorrect={false}
        style={s.input}
      />
    </View>
  );
  const fail = () =>
    setError(
      copy(
        "操作失败。内容仍保留；请检查网络、密钥、额度及模型权限后重试。",
        "Operation failed. Your content is kept. Check network, key, quota and model access, then retry.",
      ),
    );
  const pick = async (camera: boolean) => {
    try {
      if (camera) {
        const permission = await Picker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError(
            copy(
              "需要相机权限；也可以从手机选择。",
              "Camera permission is required; you can choose from your phone instead.",
            ),
          );
          return;
        }
      }
      const result = camera
        ? await Picker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.7,
          })
        : await Picker.launchImageLibraryAsync({
            mediaTypes: ["images", "videos"],
            quality: 0.7,
            videoMaxDuration: 30,
          });
      if (result.canceled) return;
      const a = result.assets[0];
      const mime =
        a.mimeType || (a.type === "video" ? "video/mp4" : "image/jpeg");
      if (
        !["image/jpeg", "image/png", "image/webp", "video/mp4"].includes(mime)
      )
        throw new Error("format");
      const info = await FS.getInfoAsync(a.uri);
      if (!info.exists || info.isDirectory || info.size > 12 * 1024 * 1024) {
        setError(
          copy(
            "请选择 12 MB 以内的图片或短 MP4 视频。",
            "Choose an image or short MP4 video under 12 MB.",
          ),
        );
        return;
      }
      setAttachment({
        uri: a.uri,
        mime,
        name: a.fileName || copy("攀岩媒体", "Climbing media"),
      });
      setError("");
    } catch {
      setError(
        copy(
          "无法添加媒体。支持 JPG、PNG、WebP 和 MP4（最多 12 MB）。",
          "Could not add media. Supported: JPG, PNG, WebP, MP4 (12 MB max).",
        ),
      );
    }
  };
  const run = async (existing?: AIEntry) => {
    if (lock.current) return;
    const profile = profiles.find((p) => p.id === selected);
    if (!profile) {
      setSettings(true);
      return;
    }
    if (!existing && !project) return;
    if (
      (existing ? existing.attachment : outgoingMedia)?.mime.startsWith(
        "video/",
      ) &&
      profile.provider !== "qwen"
    ) {
      setError(
        copy(
          "视频分析请选择 Qwen；DeepSeek 可分析文字和图片。",
          "Choose Qwen for video; DeepSeek supports text and images.",
        ),
      );
      return;
    }
    lock.current = true;
    setBusy(true);
    onBusy(true);
    setError("");
    let entry: AIEntry | undefined;
    try {
      const key = await readAIKey(profile.id);
      if (!key) throw new Error("key");
      if (existing) {
        entry = {
          ...existing,
          provider: profile.provider,
          model: profile.model,
          status: "pending",
        };
        await updateAIEntry(entry);
      } else {
        const id =
          Date.now().toString(36) + Math.random().toString(36).slice(2);
        entry = {
          id,
          date: new Date().toISOString(),
          scene,
          question:
            question.trim() ||
            (intent === "review"
              ? copy(
                  "回顾今天这条线路的尝试，下一次应该关注什么？",
                  "Review today on this climb. What should I focus on next time?",
                )
              : copy(
                  "根据这条线路的尝试，给我下一次的一个实验。",
                  "Use this climb’s attempts to suggest one experiment for the next attempt.",
                )),
          climbId: project!.id,
          context:
            context +
            "\nCurrent pain/readiness report: " +
            (pain || session?.pain
              ? "pain reported; do not suggest another climbing attempt"
              : "no current pain flag") +
            (session
              ? "\nUser-selected training session: " + JSON.stringify(session)
              : ""),
          intent,
          provider: profile.provider,
          model: profile.model,
          status: "pending",
          sessionId: scene === "attempt" ? session?.id : undefined,
          attachment: outgoingMedia
            ? await retainAttachment(outgoingMedia, id)
            : undefined,
        };
        try {
          await addAIEntry(entry);
        } catch (error) {
          if (entry.attachment)
            await FS.deleteAsync(entry.attachment.uri, {
              idempotent: true,
            }).catch(() => {});
          entry = undefined;
          throw error;
        }
        setQuestion("");
        setAttachment(undefined);
      }
      setDetail(entry.id);
      await refresh();
      const answer = await analyze(
        entry,
        profile,
        key,
        entry.attachment ? await attachmentData(entry.attachment) : undefined,
        !zh,
      );
      await updateAIEntry({ ...entry, answer, status: "complete" });
      setComposing(false);
      await refresh();
    } catch {
      if (entry) {
        try {
          await updateAIEntry({ ...entry, status: "failed" });
          await refresh();
        } catch {}
      }
      fail();
    } finally {
      lock.current = false;
      setBusy(false);
      onBusy(false);
    }
  };
  const remove = (e: AIEntry) =>
    Alert.alert(
      copy("删除分析？", "Delete analysis?"),
      copy(
        "将删除手机上的提问、回复和附件副本；不会删除相册原件。",
        "Deletes the local question, answer and attachment copy. Originals in your gallery remain.",
      ),
      [
        { text: copy("取消", "Cancel"), style: "cancel" },
        {
          text: copy("删除", "Delete"),
          style: "destructive",
          onPress: () => {
            deleteAIEntry(e.id)
              .then(refresh)
              .then(() => setDetail(undefined))
              .catch(fail);
          },
        },
      ],
    );
  const localChange = async (fn: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    onBusy(true);
    setError("");
    try {
      await fn();
      await refresh();
    } catch {
      setError(
        copy(
          "本机保存失败，输入仍保留，请重试。",
          "Local save failed. Your input is kept; retry.",
        ),
      );
    } finally {
      lock.current = false;
      setBusy(false);
      onBusy(false);
    }
  };
  const feedbackAdvice =
    related.find(
      (e) =>
        e.id === detail && e.status === "complete" && e.intent !== "review",
    ) || related.find((e) => e.status === "complete" && e.intent !== "review");
  const recordOutcome = (outcome: AttemptOutcome) =>
    void localChange(async () => {
      if (!project) return;
      const advice = feedbackAdvice;
      await recordClimbAttempt(project.id, {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        date: new Date().toISOString(),
        outcome,
        note: attemptNote.trim(),
        adviceId: advice?.id,
        sessionId: session?.id,
      });
      setAttemptNote("");
      setNotice(
        copy(
          "已保存在本机。需要时再获取下一步。",
          "Saved on this phone. Ask for the next step when ready.",
        ),
      );
    });
  const labels: Record<AttemptOutcome, string> = {
    stuck: copy("卡在这里", "Stuck here"),
    helped: copy("有帮助", "Helped"),
    same: copy("没变化", "No change"),
    "not-tried": copy("还没试", "Not tried"),
    sent: copy("完成了", "Sent"),
    pain: copy("有疼痛，停止尝试", "Pain · stop"),
  };
  if (loading)
    return <Text style={s.text}>{copy("正在读取…", "Loading…")}</Text>;
  const current =
    entries.find((e) => e.id === detail) ||
    related.find((e) => e.status === "complete");
  return (
    <View style={{ gap: 14 }}>
      <Text style={s.muted}>
        {copy(
          "同一条线路，一次只试一个变化。记录尝试可离线完成；只有点击获取建议或回顾才发送下方可查看的线路上下文与媒体（可能收费，视频不分析声音）。",
          "One climb, one experiment at a time. Record outcomes offline. Only advice/review requests send the previewed climb context and media to your provider (charges may apply; no video audio).",
        )}
      </Text>
      {error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      {action(
        settings
          ? copy("返回分析", "Back to analysis")
          : copy(
              "教练设置 · 密钥与服务商",
              "Coach settings · keys & providers",
            ),
        () => setSettings(!settings),
      )}
      {settings ? (
        <>
          <Text style={s.heading}>{copy("已保存的密钥", "Saved keys")}</Text>
          {profiles.map((p) => (
            <View key={p.id} style={s.card}>
              {action(
                `${selected === p.id ? "✓ " : ""}${p.name} · ${p.provider}`,
                () => {
                  Storage.setItem("ascent.ai.active", p.id)
                    .then(() => setSelected(p.id))
                    .catch(fail);
                },
                selected === p.id,
              )}
              <Text style={s.muted}>
                {p.model} · {p.baseURL}
              </Text>
              {action(copy("替换此密钥 / 编辑", "Replace key / edit"), () => {
                setEditing(p.id);
                setName(p.name);
                setProvider(p.provider);
                setBaseURL(p.baseURL);
                setModel(p.model);
                setSecret("");
              })}
              {action(copy("移除密钥", "Remove key"), () => {
                Alert.alert(
                  copy("移除密钥？", "Remove key?"),
                  copy("历史分析会保留。", "Analysis history remains."),
                  [
                    { text: copy("取消", "Cancel") },
                    {
                      text: copy("移除", "Remove"),
                      style: "destructive",
                      onPress: () => {
                        deleteAIProfile(p.id).then(refresh).catch(fail);
                      },
                    },
                  ],
                );
              })}
            </View>
          ))}
          <Text style={s.heading}>
            {editing
              ? copy("替换密钥", "Replace key")
              : copy("添加密钥", "Add key")}
          </Text>
          <View style={s.row}>
            {(["qwen", "deepseek"] as Provider[]).map((p) => (
              <React.Fragment key={p}>
                {action(
                  p,
                  () => {
                    setProvider(p);
                    setBaseURL(defaults[p].baseURL);
                    setModel(defaults[p].model);
                  },
                  provider === p,
                )}
              </React.Fragment>
            ))}
          </View>
          {field(
            copy("名称（如“个人 Qwen”）", "Name (e.g. Personal Qwen)"),
            name,
            setName,
          )}
          {field("API key", secret, setSecret, true)}
          {field("HTTPS API base URL", baseURL, setBaseURL)}
          <Text style={s.muted}>
            {copy(
              "Qwen 地址须与密钥地域一致；支持官方 DashScope 或工作空间地址。",
              "Qwen endpoint must match your key region; official DashScope and workspace endpoints are supported.",
            )}
          </Text>
          {field(copy("模型", "Model"), model, setModel)}
          {action(
            copy("安全保存密钥", "Save key securely"),
            () => {
              if (lock.current) return;
              lock.current = true;
              setBusy(true);
              onBusy(true);
              const p = {
                id: editing || Date.now().toString(36),
                name: name.trim(),
                provider,
                baseURL: baseURL.trim().replace(/\/$/, ""),
                model: model.trim(),
              };
              Promise.resolve()
                .then(() => {
                  validateProfile(p);
                  if (!secret.trim()) throw new Error("key");
                  return saveAIProfile(p, secret.trim());
                })
                .then(() => Storage.setItem("ascent.ai.active", p.id))
                .then(refresh)
                .then(() => {
                  setEditing(undefined);
                  setSecret("");
                  setName("");
                  setSettings(false);
                })
                .catch(fail)
                .finally(() => {
                  lock.current = false;
                  setBusy(false);
                  onBusy(false);
                });
            },
            true,
            !name.trim() || !secret.trim(),
          )}
          {editing &&
            action(
              copy("取消编辑 / 添加新密钥", "Cancel edit / add new key"),
              () => {
                setEditing(undefined);
                setSecret("");
                setName("");
              },
            )}
        </>
      ) : (
        <>
          {project &&
            action(copy("切换 / 新建线路", "Switch / start a climb"), () =>
              setChoosing(!choosing),
            )}
          {(!project || choosing) && (
            <>
              {" "}
              <Text style={s.heading}>
                {copy("正在攀登的线路", "Climbs you’re working on")}
              </Text>
              {climbs.map((p) => (
                <React.Fragment key={p.id}>
                  {action(
                    p.name +
                      " · " +
                      p.attempts.length +
                      copy(" 条尝试/反馈", " attempts / feedback"),
                    () => selectClimb(p.id),
                    p.id === climbId,
                  )}
                </React.Fragment>
              ))}
              {!project && (
                <Text style={s.muted}>
                  {copy(
                    "给线路起个名字，照片、尝试和建议就不会散落在聊天里。请手动选择同一条线路，不会仅凭颜色自动匹配。",
                    "Name a climb to keep its media, attempts and advice together. Select the route yourself; colors alone never identify a climb.",
                  )}
                </Text>
              )}
              {field(
                copy(
                  "新线路名称（如 北墙红线 V3）",
                  "New climb name (e.g. North wall red V3)",
                ),
                climbName,
                setClimbName,
              )}
              {field(
                copy("想解决的动作 / 目标（选填）", "Move or goal (optional)"),
                goal,
                setGoal,
              )}
              {action(
                copy("建立线路手记", "Start climb notebook"),
                () =>
                  void localChange(async () => {
                    const id =
                      Date.now().toString(36) +
                      Math.random().toString(36).slice(2);
                    await saveClimb({
                      id,
                      name: climbName.trim(),
                      goal: goal.trim(),
                      createdAt: new Date().toISOString(),
                      attempts: [],
                    });
                    selectClimb(id);
                    setClimbName("");
                    setGoal("");
                  }),
                false,
                !climbName.trim(),
              )}
            </>
          )}
          {project && (
            <>
              <Text style={s.heading}>{project.name}</Text>
              <Text style={s.muted}>{project.goal}</Text>
              <View style={s.row}>
                {action(
                  copy("攀登中 · 下一次尝试", "During climbing · next attempt"),
                  () => {
                    setIntent("next");
                    setScene("attempt");
                  },
                  intent === "next",
                )}
                {action(
                  copy(
                    "结束后 · 今天的回顾",
                    "After climbing · today’s review",
                  ),
                  () => {
                    setIntent("review");
                    setScene("attempt");
                  },
                  intent === "review",
                )}
              </View>
              {current && (current.climbId === climbId || legacy) && (
                <View style={s.card}>
                  <Text style={s.heading}>
                    {current.intent === "review"
                      ? copy("今天的回顾", "Today’s review")
                      : copy(
                          "下一次，只关注这一件事",
                          "One focus for the next attempt",
                        )}
                  </Text>
                  <Text selectable style={s.text}>
                    {current.question}
                  </Text>
                  <Text selectable style={s.text}>
                    {current.answer ||
                      copy(
                        "尚未完成，可保留并重试。",
                        "Not completed. Kept locally; retry when ready.",
                      )}
                  </Text>
                  {current.attachment &&
                    action(
                      showEvidence
                        ? copy("收起媒体", "Hide media")
                        : copy(
                            "查看这次的照片 / 视频",
                            "View this entry’s media",
                          ),
                      () => setShowEvidence(!showEvidence),
                    )}
                  {current.attachment && showEvidence && (
                    <>
                      {current.attachment.mime.startsWith("image/") ? (
                        <Image
                          source={{ uri: current.attachment.uri }}
                          style={s.image}
                          resizeMode="contain"
                        />
                      ) : (
                        action(
                          copy("打开保存的视频", "Open saved video"),
                          () => {
                            FS.getContentUriAsync(current.attachment!.uri)
                              .then((uri) => {
                                if (!media) throw new Error("viewer");
                                return media.open(
                                  uri,
                                  current.attachment!.mime,
                                );
                              })
                              .catch(fail);
                          },
                        )
                      )}
                      <Text style={s.muted}>{current.attachment.name}</Text>
                    </>
                  )}
                  <Text style={s.muted}>
                    {current.provider} · {current.model} ·{" "}
                    {new Date(current.date).toLocaleString(l)}
                  </Text>
                  {current.status !== "complete" &&
                    action(
                      copy("用当前密钥重试", "Retry with active key"),
                      () => void run(current),
                    )}
                </View>
              )}
              <View style={s.card}>
                <Text style={s.heading}>
                  {copy("试完了？留下结果", "Tried it? Record what happened")}
                </Text>
                <Text style={s.muted}>
                  {copy(
                    "可以先离线记录卡住的位置，也可以反馈刚才试过的建议。不自动调用 AI，不发放 XP。",
                    "Record where you got stuck offline, or report on advice you tried. No automatic AI request or XP.",
                  )}
                </Text>
                {feedbackAdvice && (
                  <Text numberOfLines={2} style={s.muted}>
                    {copy("本次反馈关联建议：", "Feedback for advice: ")}
                    {feedbackAdvice.answer}
                  </Text>
                )}
                {field(
                  copy(
                    "发生了什么 / 动作纠正（选填）",
                    "What happened / correction (optional)",
                  ),
                  attemptNote,
                  setAttemptNote,
                )}
                <View style={s.row}>
                  {(Object.keys(labels) as AttemptOutcome[]).map((o) => (
                    <React.Fragment key={o}>
                      {action(
                        labels[o],
                        () => recordOutcome(o),
                        false,
                        (o === "helped" || o === "same" || o === "not-tried") &&
                          !feedbackAdvice,
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
              {notice && (
                <Text accessibilityRole="alert" style={s.muted}>
                  {notice}
                </Text>
              )}
              {current &&
                action(
                  composing
                    ? copy("收起补充", "Hide follow-up")
                    : copy(
                        "纠正建议 / 获取下一步",
                        "Correct advice / ask for next step",
                      ),
                  () => setComposing(!composing),
                )}
              {(!current || composing || intent === "review") && (
                <>
                  <Text style={s.muted}>
                    {copy(
                      "补充哪里卡住了，或纠正之前的建议。空着也可以，已有尝试会一起带入。",
                      "Describe a sticking point or correct earlier advice. You can leave this blank; the recorded attempts provide context.",
                    )}
                  </Text>
                  <TextInput
                    accessibilityLabel={copy(
                      "提问或尝试记录",
                      "Question or attempt notes",
                    )}
                    style={[
                      s.input,
                      { minHeight: 100, textAlignVertical: "top" },
                    ]}
                    multiline
                    maxLength={6000}
                    editable={!busy}
                    value={question}
                    onChangeText={setQuestion}
                    placeholder={
                      scene === "route"
                        ? copy(
                            "红色线路怎么完成？请建议脚点和动作顺序。",
                            "How can I finish the red route?",
                          )
                        : copy(
                            "记录这次尝试：哪里卡住了？想改进什么？",
                            "Describe your attempt and what you want to improve.",
                          )
                    }
                    placeholderTextColor={C.muted}
                  />
                  <View style={s.row}>
                    {action(copy("拍照", "Take photo"), () => void pick(true))}
                    {action(
                      copy("选择图片 / 视频", "Choose photo / video"),
                      () => void pick(false),
                    )}
                  </View>
                  {attachment && (
                    <View style={s.card}>
                      <Text style={s.text}>{attachment.name}</Text>
                      {attachment.mime.startsWith("image/") && (
                        <Image
                          source={{ uri: attachment.uri }}
                          style={s.image}
                          resizeMode="contain"
                        />
                      )}
                      {action(copy("移除附件", "Remove attachment"), () =>
                        setAttachment(undefined),
                      )}
                    </View>
                  )}
                  {!attachment && inheritedPhoto && (
                    <View style={s.card}>
                      <Text style={s.muted}>
                        {copy(
                          reusePhoto
                            ? "沿用这条线路的照片（可选择新媒体替换）"
                            : "旧照片不随本次请求发送",
                          reusePhoto
                            ? "Using this climb’s saved photo (choose new media to replace)"
                            : "Saved photo excluded from this request",
                        )}
                      </Text>
                      {action(
                        reusePhoto
                          ? copy("不发送旧照片", "Exclude saved photo")
                          : copy("沿用旧照片", "Include saved photo"),
                        () => setReusePhoto(!reusePhoto),
                      )}
                      <Image
                        source={{ uri: inheritedPhoto.uri }}
                        style={s.image}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                  {action(
                    showContext
                      ? copy("收起发送内容", "Hide request context")
                      : copy(
                          "查看将发送的线路上下文",
                          "Preview context to send",
                        ),
                    () => setShowContext(!showContext),
                  )}
                  {showContext && (
                    <Text selectable style={s.muted}>
                      {context}
                      {"\n"}
                      {copy("当前疼痛标记：", "Current pain flag: ")}
                      {String(pain || !!session?.pain)}
                      {session ? "\n" + JSON.stringify(session) : ""}
                      {"\n"}
                      {outgoingMedia?.name || copy("无媒体", "No media")}
                    </Text>
                  )}
                  {action(
                    busy
                      ? copy("分析中…", "Analyzing…")
                      : intent === "review"
                        ? copy("回顾今天的尝试", "Review today’s attempts")
                        : copy(
                            "给下一次一个实验",
                            "One experiment for next attempt",
                          ),
                    () => void run(),
                    true,
                    !project ||
                      (intent === "review" &&
                        !project.attempts.some(
                          (a) =>
                            new Date(a.date).toDateString() ===
                            new Date().toDateString(),
                        )),
                  )}
                  <Text style={s.muted}>
                    {copy(
                      "AI 建议可能出错，无法确认线路或保护安全。疼痛时停止相关动作。AI 分析不修改 XP 或能力属性。",
                      "AI advice may be wrong and cannot certify route or protection safety. Stop painful movements. Analysis does not change XP or attributes.",
                    )}
                  </Text>
                </>
              )}
              <Text style={s.heading}>
                {copy("这条线路的尝试与建议", "This climb’s attempts & advice")}
              </Text>
              {[...project.attempts].reverse().map((a) => (
                <View key={a.id} style={s.card}>
                  <Text style={s.text}>
                    {labels[a.outcome]} · {new Date(a.date).toLocaleString(l)}
                  </Text>
                  <Text style={s.text}>{a.note}</Text>
                  {a.adviceId && (
                    <Text style={s.muted}>
                      {copy("对应建议：", "Advice: ")}
                      {related.find((e) => e.id === a.adviceId)?.question ||
                        copy("建议已删除", "Advice deleted")}
                    </Text>
                  )}
                </View>
              ))}
              {related.map((e) => (
                <View key={e.id} style={s.card}>
                  {action(
                    (e.intent === "review"
                      ? copy("回顾", "Review")
                      : copy("建议", "Advice")) +
                      " · " +
                      e.question.slice(0, 55),
                    () => setDetail(e.id),
                  )}
                  {action(copy("删除这条建议", "Delete this advice"), () =>
                    remove(e),
                  )}
                  <Text style={s.muted}>
                    {new Date(e.date).toLocaleString(l)} · {e.status}
                  </Text>
                </View>
              ))}
              {action(
                copy("删除整条线路手记", "Delete this climb notebook"),
                () =>
                  Alert.alert(
                    copy("删除线路及其记录？", "Delete climb and its records?"),
                    copy(
                      "删除本机尝试、建议和附件，原训练记录不受影响。",
                      "Deletes local climb attempts, advice and attachments; training records remain.",
                    ),
                    [
                      { text: copy("取消", "Cancel") },
                      {
                        text: copy("删除", "Delete"),
                        style: "destructive",
                        onPress: () =>
                          void localChange(async () => {
                            for (const e of related) await deleteAIEntry(e.id);
                            await removeClimb(project.id);
                            setClimbId("");
                            setDetail(undefined);
                          }),
                      },
                    ],
                  ),
              )}
            </>
          )}
          {action(
            legacy
              ? copy("收起未归档的旧分析", "Hide earlier analyses")
              : copy("未归档的旧分析", "Earlier unfiled analyses"),
            () => setLegacy(!legacy),
          )}
          {legacy &&
            entries
              .filter((e) => !e.climbId)
              .map((e) => (
                <View key={e.id} style={s.card}>
                  <Text style={s.text}>{e.question}</Text>
                  <Text selectable style={s.text}>
                    {e.answer}
                  </Text>
                  {project &&
                    action(
                      copy("归入当前线路", "File under current climb"),
                      () =>
                        void localChange(() =>
                          updateAIEntry({ ...e, climbId: project.id }),
                        ),
                    )}
                  {action(copy("删除旧分析", "Delete earlier analysis"), () =>
                    remove(e),
                  )}
                </View>
              ))}
        </>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  button: {
    minHeight: 48,
    padding: 12,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.panel2,
  },
  active: { backgroundColor: C.gold },
  text: { fontSize: 15, lineHeight: 24, color: C.cream },
  muted: { fontSize: 13, lineHeight: 21, color: C.muted },
  heading: { fontSize: 20, lineHeight: 29, color: C.gold },
  input: {
    minHeight: 48,
    padding: 12,
    fontSize: 16,
    color: C.cream,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.bg,
  },
  card: {
    padding: 12,
    gap: 12,
    backgroundColor: C.panel,
    borderLeftWidth: 2,
    borderLeftColor: C.gold,
  },
  image: { width: "100%", height: 200 },
  error: { color: C.danger, fontSize: 15, lineHeight: 23 },
});
