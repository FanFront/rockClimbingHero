import { withoutAdvice } from "./coaching";
import Storage from "expo-sqlite/kv-store";
import * as SecureStore from "expo-secure-store";
import * as FS from "expo-file-system/legacy";
import type { AIEntry, AIKeyProfile, AIAttachment } from "./ai";
const key = (id: string) => "ascent.ai.key." + id;
export const loadAIProfiles = async (): Promise<AIKeyProfile[]> =>
  JSON.parse((await Storage.getItem("ascent.ai.profiles")) || "[]");
export async function saveAIProfile(p: AIKeyProfile, secret: string) {
  await SecureStore.setItemAsync(key(p.id), secret);
  const all = await loadAIProfiles();
  await Storage.setItem(
    "ascent.ai.profiles",
    JSON.stringify([...all.filter((v) => v.id !== p.id), p]),
  );
}
export const readAIKey = (id: string) => SecureStore.getItemAsync(key(id));
export async function deleteAIProfile(id: string) {
  await SecureStore.deleteItemAsync(key(id));
  await Storage.setItem(
    "ascent.ai.profiles",
    JSON.stringify((await loadAIProfiles()).filter((v) => v.id !== id)),
  );
}
export const loadAIEntries = async (): Promise<AIEntry[]> =>
  JSON.parse((await Storage.getItem("ascent.ai.entries")) || "[]");
// Serialize read/modify/write operations so response completion cannot resurrect deleted history.
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const result = queue.catch(() => {}).then(fn);
  queue = result;
  return result;
}
export const addAIEntry = (e: AIEntry) =>
  serial(async () => {
    await Storage.setItem(
      "ascent.ai.entries",
      JSON.stringify([e, ...(await loadAIEntries())]),
    );
  });
export const updateAIEntry = (e: AIEntry) =>
  serial(async () => {
    const all = await loadAIEntries();
    await Storage.setItem(
      "ascent.ai.entries",
      JSON.stringify(all.map((v) => (v.id === e.id ? e : v))),
    );
  });
export const deleteAIEntry = (id: string) =>
  serial(async () => {
    const all = await loadAIEntries();
    const entry = all.find((e) => e.id === id);
    if (entry?.attachment)
      await FS.deleteAsync(entry.attachment.uri, { idempotent: true });
    await Storage.setItem(
      "ascent.ai.entries",
      JSON.stringify(
        all
          .filter((e) => e.id !== id)
          .map((e) => ({ ...e, context: withoutAdvice(e.context, id) })),
      ),
    );
  });
export async function retainAttachment(a: AIAttachment, id: string) {
  const info = await FS.getInfoAsync(a.uri);
  if (!info.exists || info.isDirectory || info.size > 12 * 1024 * 1024)
    throw new Error("MEDIA_SIZE");
  const dir = FS.documentDirectory + "ai-media/";
  await FS.makeDirectoryAsync(dir, { intermediates: true });
  const ext = a.mime === "video/mp4" ? "mp4" : a.mime.split("/")[1];
  const uri = dir + id + "." + ext;
  await FS.copyAsync({ from: a.uri, to: uri });
  return { ...a, uri };
}
export async function attachmentData(a: AIAttachment) {
  const info = await FS.getInfoAsync(a.uri);
  if (!info.exists || info.isDirectory || info.size > 12 * 1024 * 1024)
    throw new Error("MEDIA_SIZE");
  return `data:${a.mime};base64,${await FS.readAsStringAsync(a.uri, { encoding: FS.EncodingType.Base64 })}`;
}
