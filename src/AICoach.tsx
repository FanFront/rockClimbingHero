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
}: {
  l: Language;
  session?: Session;
  onBusy: (busy: boolean) => void;
}) {
  const zh = l !== "en",
    copy = (a: string, b: string) => (zh ? a : b);
  const [profiles, setProfiles] = useState<AIKeyProfile[]>([]),
    [selected, setSelected] = useState(""),
    [entries, setEntries] = useState<AIEntry[]>([]),
    [loading, setLoading] = useState(true),
    [settings, setSettings] = useState(false),
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
  const lock = useRef(false);
  const [provider, setProvider] = useState<Provider>("qwen"),
    [name, setName] = useState(""),
    [secret, setSecret] = useState(""),
    [baseURL, setBaseURL] = useState(defaults.qwen.baseURL),
    [model, setModel] = useState(defaults.qwen.model),
    [editing, setEditing] = useState<string>();
  const refresh = async () => {
    const [p, e, id] = await Promise.all([
      loadAIProfiles(),
      loadAIEntries(),
      Storage.getItem("ascent.ai.active"),
    ]);
    setProfiles(p);
    setEntries(e);
    setSelected(p.some((v) => v.id === id) ? id! : p[0]?.id || "");
  };
  useEffect(() => {
    refresh()
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
            mediaTypes: scene === "route" ? ["images"] : ["images", "videos"],
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
    if (!existing && !question.trim() && !attachment) return;
    if (
      (existing?.attachment || attachment)?.mime.startsWith("video/") &&
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
          question: question.trim(),
          provider: profile.provider,
          model: profile.model,
          status: "pending",
          sessionId: scene === "attempt" ? session?.id : undefined,
          attachment: attachment
            ? await retainAttachment(attachment, id)
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
  if (loading)
    return <Text style={s.text}>{copy("正在读取…", "Loading…")}</Text>;
  const current = entries.find((e) => e.id === detail);
  return (
    <View style={{ gap: 14 }}>
      <Text style={s.muted}>
        {copy(
          "提问和建议保存在本机，直到你删除。仅点击“发送分析”才将所选文字和媒体发送给当前服务商（可能收费）。视频不分析声音。",
          "Questions and advice stay on this phone until deleted. Send analysis uploads the selected text and media to your provider (charges may apply). Video audio is not analyzed.",
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
          : copy("API 密钥与服务商", "API keys & providers"),
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
          <Text style={s.heading}>
            {copy("当前服务商", "Active provider")}:{" "}
            {profiles.find((p) => p.id === selected)?.name ||
              copy("请先添加密钥", "Add a key first")}
          </Text>
          <View style={s.row}>
            {action(
              copy("线路求助", "Route advice"),
              () => {
                setScene("route");
                setAttachment(undefined);
              },
              scene === "route",
            )}
            {action(
              copy("尝试复盘", "Attempt review"),
              () => setScene("attempt"),
              scene === "attempt",
            )}
          </View>
          <TextInput
            accessibilityLabel={copy(
              "提问或尝试记录",
              "Question or attempt notes",
            )}
            style={[s.input, { minHeight: 100, textAlignVertical: "top" }]}
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
          {action(
            busy
              ? copy("分析中…", "Analyzing…")
              : copy("发送分析", "Send analysis"),
            () => void run(),
            true,
            !question.trim() && !attachment,
          )}
          <Text style={s.muted}>
            {copy(
              "AI 建议可能出错，无法确认线路或保护安全。疼痛时停止相关动作。AI 分析不修改 XP 或能力属性。",
              "AI advice may be wrong and cannot certify route or protection safety. Stop painful movements. Analysis does not change XP or attributes.",
            )}
          </Text>
          {current && (
            <View style={s.card}>
              <Text style={s.heading}>
                {copy("分析详情", "Analysis details")}
              </Text>
              <Text selectable style={s.text}>
                {current.question}
              </Text>
              {current.attachment && (
                <>
                  {current.attachment.mime.startsWith("image/") ? (
                    <Image
                      source={{ uri: current.attachment.uri }}
                      style={s.image}
                      resizeMode="contain"
                    />
                  ) : (
                    action(copy("打开保存的视频", "Open saved video"), () => {
                      FS.getContentUriAsync(current.attachment!.uri)
                        .then((uri) => {
                          if (!media) throw new Error("viewer");
                          return media.open(uri, current.attachment!.mime);
                        })
                        .catch(fail);
                    })
                  )}
                  <Text style={s.muted}>{current.attachment.name}</Text>
                </>
              )}
              <Text style={s.muted}>
                {current.provider} · {current.model} ·{" "}
                {new Date(current.date).toLocaleString(l)}
              </Text>
              <Text selectable style={s.text}>
                {current.answer ||
                  copy(
                    "尚未完成，可保留并重试。",
                    "Not completed. Kept locally; retry when ready.",
                  )}
              </Text>
              {current.status !== "complete" &&
                action(
                  copy("用当前密钥重试", "Retry with active key"),
                  () => void run(current),
                )}
              {action(copy("删除此分析", "Delete analysis"), () =>
                remove(current),
              )}
            </View>
          )}
          <Text style={s.heading}>
            {copy("本机分析历史", "On-device analysis history")}
          </Text>
          {!entries.length && (
            <Text style={s.muted}>
              {copy("还没有分析记录。", "No analyses yet.")}
            </Text>
          )}
          {entries.map((e) => (
            <View key={e.id} style={s.card}>
              {action(
                `${e.scene === "route" ? copy("线路", "Route") : copy("复盘", "Review")} · ${e.question.slice(0, 60) || e.attachment?.name || ""}`,
                () => setDetail(e.id),
              )}
              <Text style={s.muted}>
                {new Date(e.date).toLocaleString(l)} · {e.provider} · {e.status}
              </Text>
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
