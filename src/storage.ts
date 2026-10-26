import Storage from "expo-sqlite/kv-store";
import { AppData, isProfile } from "./domain";
const KEY = "ascent.profile.v1";
export async function loadProfile(): Promise<AppData | null> {
  const text = await Storage.getItem(KEY);
  if (!text) return null;
  try {
    const value: unknown = JSON.parse(text);
    return isProfile(value) ? value : null;
  } catch {
    return null;
  }
}
export async function saveProfile(data: AppData): Promise<void> {
  await Storage.setItem(KEY, JSON.stringify(data));
}
export async function clearProfile(): Promise<void> {
  await Storage.removeItem(KEY);
}

export async function loadLanguage(): Promise<"zh-CN" | "en"> {
  return (await Storage.getItem("ascent.language")) === "en" ? "en" : "zh-CN";
}
export async function saveLanguage(language: "zh-CN" | "en"): Promise<void> {
  await Storage.setItem("ascent.language", language);
}
