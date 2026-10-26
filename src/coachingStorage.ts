import Storage from "expo-sqlite/kv-store";
import { addAttempt, type ClimbAttempt, type ClimbProject } from "./coaching";
const KEY = "ascent.climbProjects.v1";
export const loadClimbs = async (): Promise<ClimbProject[]> =>
  JSON.parse((await Storage.getItem(KEY)) || "[]");
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>) {
  const result = queue.catch(() => {}).then(fn);
  queue = result;
  return result;
}
export const saveClimb = (p: ClimbProject) =>
  serial(async () => {
    const all = await loadClimbs();
    await Storage.setItem(
      KEY,
      JSON.stringify([p, ...all.filter((v) => v.id !== p.id)]),
    );
  });
export const recordClimbAttempt = (id: string, attempt: ClimbAttempt) =>
  serial(async () => {
    const all = await loadClimbs();
    if (!all.some((p) => p.id === id)) throw new Error("Climb missing");
    await Storage.setItem(
      KEY,
      JSON.stringify(
        all.map((p) => (p.id === id ? addAttempt(p, attempt) : p)),
      ),
    );
  });
export const removeClimb = (id: string) =>
  serial(async () => {
    await Storage.setItem(
      KEY,
      JSON.stringify((await loadClimbs()).filter((p) => p.id !== id)),
    );
  });
