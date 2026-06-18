"use server";

import { getCurrentUserId } from "@/lib/auth";
import { getUserPrefs, saveUserPrefs, UserPrefs, VaultView } from "@/lib/userPrefs";

export async function loadMyPrefs(): Promise<UserPrefs | null> {
  const uid = await getCurrentUserId();
  if (!uid) return null;
  return getUserPrefs(uid);
}

const BOOL = (v: unknown) => v === true;
const STR = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);

function cleanVault(v?: VaultView): VaultView | undefined {
  if (!v || typeof v !== "object") return undefined;
  return {
    typeFilter: STR(v.typeFilter, 16),
    rarity: STR(v.rarity, 16),
    tierFilter: STR(v.tierFilter, 4),
    powerSort: STR(v.powerSort, 8),
    mwOnly: BOOL(v.mwOnly),
    lockedOnly: BOOL(v.lockedOnly),
    favOnly: BOOL(v.favOnly),
  };
}

/** Partiële update: alleen meegegeven velden worden samengevoegd met de rest. */
export async function saveMyPrefs(partial: UserPrefs): Promise<{ ok: boolean }> {
  const uid = await getCurrentUserId();
  if (!uid) return { ok: false };
  const existing = (await getUserPrefs(uid)) ?? {};
  const merged: UserPrefs = { ...existing };

  if (partial.favPlayers !== undefined) {
    merged.favPlayers = partial.favPlayers
      .slice(0, 300)
      .map((f) => ({ type: Number(f.type) || 0, id: String(f.id).slice(0, 40), name: String(f.name).slice(0, 80) }))
      .filter((f) => f.id);
  }
  if (partial.favGear !== undefined) {
    merged.favGear = partial.favGear.map((n) => Number(n)).filter((n) => Number.isFinite(n)).slice(0, 800);
  }
  if (partial.locale !== undefined) merged.locale = STR(partial.locale, 5);
  if (partial.vaultView !== undefined) merged.vaultView = cleanVault(partial.vaultView);

  await saveUserPrefs(uid, merged);
  return { ok: true };
}
