"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, getCurrentUserId, isAdmin } from "@/lib/auth";
import { createBuild, toggleLike, toggleFavorite, addComment, deleteComment, setBuildFlags, CommunityBuildInput } from "@/lib/communityBuilds";
import { dbConfigured } from "@/lib/db";

const CLASSES = ["Titan", "Hunter", "Warlock"];
const SUBCLASSES = ["Solar", "Arc", "Void", "Strand", "Stasis", "Prismatic"];

function clampStr(s: unknown, max: number): string {
  return typeof s === "string" ? s.trim().slice(0, max) : "";
}

export async function createBuildAction(input: CommunityBuildInput): Promise<{ ok: boolean; error?: string }> {
  if (!dbConfigured()) return { ok: false, error: "db" };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "auth" };

  const title = clampStr(input.title, 120);
  if (!title || !CLASSES.includes(input.guardianClass) || !SUBCLASSES.includes(input.subclass)) {
    return { ok: false, error: "invalid" };
  }

  const clean: CommunityBuildInput = {
    title,
    description: clampStr(input.description, 4000),
    activities: (input.activities ?? []).filter((a) => typeof a === "string").slice(0, 8),
    guardianClass: input.guardianClass,
    subclass: input.subclass,
    super: clampStr(input.super, 80),
    loadout: input.loadout ?? {},
    stats: input.stats ?? {},
    aspects: (input.aspects ?? []).map((a) => clampStr(a, 60)).filter(Boolean).slice(0, 4),
    fragments: (input.fragments ?? []).map((f) => clampStr(f, 60)).filter(Boolean).slice(0, 8),
    forkedFrom: input.forkedFrom ? clampStr(input.forkedFrom, 60) : null,
  };

  const id = await createBuild(clean, user);
  revalidatePath("/community");
  redirect(`/community/${id}`);
}

export async function likeAction(buildId: string): Promise<{ ok: boolean; liked?: boolean }> {
  const uid = await getCurrentUserId();
  if (!uid || !dbConfigured()) return { ok: false };
  const liked = await toggleLike(buildId, uid);
  revalidatePath(`/community/${buildId}`);
  revalidatePath("/community");
  return { ok: true, liked };
}

export async function favoriteAction(buildId: string): Promise<{ ok: boolean; favorited?: boolean }> {
  const uid = await getCurrentUserId();
  if (!uid || !dbConfigured()) return { ok: false };
  const favorited = await toggleFavorite(buildId, uid);
  revalidatePath(`/community/${buildId}`);
  revalidatePath("/community");
  return { ok: true, favorited };
}

export async function addCommentAction(buildId: string, body: string): Promise<{ ok: boolean }> {
  if (!dbConfigured()) return { ok: false };
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  const text = (body ?? "").trim().slice(0, 2000);
  if (!text) return { ok: false };
  await addComment(buildId, user.id, user.name, text);
  revalidatePath(`/community/${buildId}`);
  return { ok: true };
}

export async function deleteCommentAction(buildId: string, commentId: string): Promise<{ ok: boolean }> {
  const uid = await getCurrentUserId();
  if (!uid || !dbConfigured()) return { ok: false };
  await deleteComment(commentId, uid, await isAdmin());
  revalidatePath(`/community/${buildId}`);
  return { ok: true };
}

export async function setFlagsAction(buildId: string, flags: { verified?: boolean; featured?: boolean }): Promise<{ ok: boolean }> {
  if (!dbConfigured() || !(await isAdmin())) return { ok: false };
  await setBuildFlags(buildId, flags);
  revalidatePath(`/community/${buildId}`);
  revalidatePath("/community");
  return { ok: true };
}
