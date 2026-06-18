"use server";

import { getCurrentUserId } from "@/lib/auth";
import { getUserPrefs, saveUserPrefs, UserPrefs } from "@/lib/userPrefs";

export async function loadMyPrefs(): Promise<UserPrefs | null> {
  const uid = await getCurrentUserId();
  if (!uid) return null;
  return getUserPrefs(uid);
}

export async function saveMyPrefs(prefs: UserPrefs): Promise<{ ok: boolean }> {
  const uid = await getCurrentUserId();
  if (!uid) return { ok: false };
  const clean: UserPrefs = {
    favPlayers: (prefs.favPlayers ?? [])
      .slice(0, 300)
      .map((f) => ({ type: Number(f.type) || 0, id: String(f.id).slice(0, 40), name: String(f.name).slice(0, 80) }))
      .filter((f) => f.id),
    favGear: (prefs.favGear ?? []).map((n) => Number(n)).filter((n) => Number.isFinite(n)).slice(0, 800),
  };
  await saveUserPrefs(uid, clean);
  return { ok: true };
}
