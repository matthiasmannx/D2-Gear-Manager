import "server-only";
import { randomUUID } from "crypto";
import { sql, ensureSchema, dbConfigured } from "./db";

export interface BuildWeapon {
  hash?: number;
  name: string;
  icon?: string | null;
  perks?: string[];
}
export interface BuildLoadout {
  kinetic?: BuildWeapon;
  energy?: BuildWeapon;
  power?: BuildWeapon;
  exoticArmor?: { hash?: number; name: string; icon?: string | null };
  exoticWeapon?: { hash?: number; name: string; icon?: string | null };
  abilities?: { classAbility?: string; movement?: string; grenade?: string; melee?: string };
  mods?: Record<string, string[]>;
  artifact?: string[];
}
export type BuildStats = Partial<Record<"Weapons" | "Health" | "Class" | "Grenade" | "Melee" | "Super", number>>;

export interface CommunityBuildInput {
  title: string;
  description: string;
  activities: string[];
  guardianClass: string;
  subclass: string;
  super: string;
  loadout: BuildLoadout;
  stats: BuildStats;
  aspects: string[];
  fragments: string[];
  forkedFrom?: string | null;
}

export interface CommunityBuild extends CommunityBuildInput {
  id: string;
  authorId: string;
  authorName: string;
  verified: boolean;
  featured: boolean;
  views: number;
  createdAt: string;
  likes: number;
  favorites: number;
  score: number;
  trendingScore: number;
}

export type SortKey = "trending" | "top" | "newest" | "verified";
export interface BuildFilters {
  guardianClass?: string;
  subclass?: string;
  activity?: string;
  sort?: SortKey;
  authorId?: string;
  limit?: number;
}

function rowToBuild(r: any): CommunityBuild {
  const likes = Number(r.likes ?? 0);
  const favorites = Number(r.favorites ?? 0);
  const views = Number(r.views ?? 0);
  const likes7 = Number(r.likes7 ?? 0);
  const favs7 = Number(r.favs7 ?? 0);
  return {
    id: r.id,
    authorId: r.author_id,
    authorName: r.author_name,
    title: r.title,
    description: r.description ?? "",
    activities: r.activities ?? [],
    guardianClass: r.guardian_class,
    subclass: r.subclass,
    super: r.super ?? "",
    loadout: r.loadout ?? {},
    stats: r.stats ?? {},
    aspects: r.aspects ?? [],
    fragments: r.fragments ?? [],
    forkedFrom: r.forked_from ?? null,
    verified: !!r.verified,
    featured: !!r.featured,
    views,
    createdAt: typeof r.created_at === "string" ? r.created_at : new Date(r.created_at).toISOString(),
    likes,
    favorites,
    score: likes * 3 + favorites * 5 + views * 0.1,
    trendingScore: likes7 * 3 + favs7 * 5,
  };
}

const COUNT_COLS = `
  (SELECT count(*)::int FROM build_likes l WHERE l.build_id = b.id) AS likes,
  (SELECT count(*)::int FROM build_favorites f WHERE f.build_id = b.id) AS favorites,
  (SELECT count(*)::int FROM build_likes l WHERE l.build_id = b.id AND l.created_at > now() - interval '7 days') AS likes7,
  (SELECT count(*)::int FROM build_favorites f WHERE f.build_id = b.id AND f.created_at > now() - interval '7 days') AS favs7
`;

export async function listBuilds(filters: BuildFilters = {}): Promise<CommunityBuild[]> {
  if (!dbConfigured()) return [];
  await ensureSchema();

  const where: string[] = [];
  const params: any[] = [];
  if (filters.guardianClass) { params.push(filters.guardianClass); where.push(`b.guardian_class = $${params.length}`); }
  if (filters.subclass) { params.push(filters.subclass); where.push(`b.subclass = $${params.length}`); }
  if (filters.activity) { params.push(filters.activity); where.push(`$${params.length} = ANY(b.activities)`); }
  if (filters.authorId) { params.push(filters.authorId); where.push(`b.author_id = $${params.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const text = `SELECT b.*, ${COUNT_COLS} FROM builds b ${whereSql}`;
  const { rows } = await sql.query(text, params);
  let builds = rows.map(rowToBuild);

  const sort = filters.sort ?? "trending";
  if (sort === "newest") builds.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else if (sort === "top") builds.sort((a, b) => b.score - a.score || b.createdAt.localeCompare(a.createdAt));
  else if (sort === "verified") builds.sort((a, b) => Number(b.verified) - Number(a.verified) || b.score - a.score);
  else builds.sort((a, b) => b.trendingScore - a.trendingScore || b.score - a.score); // trending

  if (filters.limit) builds = builds.slice(0, filters.limit);
  return builds;
}

export async function getBuild(id: string, incView = false): Promise<CommunityBuild | null> {
  if (!dbConfigured()) return null;
  await ensureSchema();
  if (incView) {
    try { await sql`UPDATE builds SET views = views + 1 WHERE id = ${id}`; } catch { /* negeer */ }
  }
  const { rows } = await sql.query(`SELECT b.*, ${COUNT_COLS} FROM builds b WHERE b.id = $1`, [id]);
  return rows[0] ? rowToBuild(rows[0]) : null;
}

export async function createBuild(input: CommunityBuildInput, author: { id: string; name: string }): Promise<string> {
  await ensureSchema();
  const id = randomUUID();
  await sql`
    INSERT INTO builds (id, author_id, author_name, title, description, activities, guardian_class, subclass, super, loadout, stats, aspects, fragments, forked_from)
    VALUES (
      ${id}, ${author.id}, ${author.name}, ${input.title}, ${input.description},
      ${input.activities as any}, ${input.guardianClass}, ${input.subclass}, ${input.super},
      ${JSON.stringify(input.loadout)}::jsonb, ${JSON.stringify(input.stats)}::jsonb,
      ${input.aspects as any}, ${input.fragments as any}, ${input.forkedFrom ?? null}
    )
  `;
  return id;
}

export async function toggleLike(buildId: string, userId: string): Promise<boolean> {
  await ensureSchema();
  const { rows } = await sql`SELECT 1 FROM build_likes WHERE build_id = ${buildId} AND user_id = ${userId}`;
  if (rows.length) {
    await sql`DELETE FROM build_likes WHERE build_id = ${buildId} AND user_id = ${userId}`;
    return false;
  }
  await sql`INSERT INTO build_likes (build_id, user_id) VALUES (${buildId}, ${userId}) ON CONFLICT DO NOTHING`;
  return true;
}

export async function toggleFavorite(buildId: string, userId: string): Promise<boolean> {
  await ensureSchema();
  const { rows } = await sql`SELECT 1 FROM build_favorites WHERE build_id = ${buildId} AND user_id = ${userId}`;
  if (rows.length) {
    await sql`DELETE FROM build_favorites WHERE build_id = ${buildId} AND user_id = ${userId}`;
    return false;
  }
  await sql`INSERT INTO build_favorites (build_id, user_id) VALUES (${buildId}, ${userId}) ON CONFLICT DO NOTHING`;
  return true;
}

/** Welke van deze builds heeft de gebruiker geliked/gefavorit? */
export async function getUserStates(userId: string, buildIds: string[]): Promise<Record<string, { liked: boolean; favorited: boolean }>> {
  const out: Record<string, { liked: boolean; favorited: boolean }> = {};
  if (!dbConfigured() || !userId || buildIds.length === 0) return out;
  await ensureSchema();
  const liked = await sql.query(`SELECT build_id FROM build_likes WHERE user_id = $1 AND build_id = ANY($2)`, [userId, buildIds]);
  const faved = await sql.query(`SELECT build_id FROM build_favorites WHERE user_id = $1 AND build_id = ANY($2)`, [userId, buildIds]);
  for (const id of buildIds) out[id] = { liked: false, favorited: false };
  for (const r of liked.rows) out[r.build_id].liked = true;
  for (const r of faved.rows) out[r.build_id].favorited = true;
  return out;
}
