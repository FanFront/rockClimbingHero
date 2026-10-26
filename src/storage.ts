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

export type Preferences = {
  language: "zh-CN" | "en";
  outfit: "trail" | "gold";
};
const PREFS = "ascent.preferences.v1";
export async function loadPreferences(): Promise<Preferences> {
  const raw = await Storage.getItem(PREFS);
  if (!raw) return { language: "zh-CN", outfit: "trail" };
  try {
    const p = JSON.parse(raw);
    return {
      language: p.language === "en" ? "en" : "zh-CN",
      outfit: p.outfit === "gold" ? "gold" : "trail",
    };
  } catch {
    return { language: "zh-CN", outfit: "trail" };
  }
}
export async function savePreferences(p: Preferences) {
  await Storage.setItem(PREFS, JSON.stringify(p));
}
