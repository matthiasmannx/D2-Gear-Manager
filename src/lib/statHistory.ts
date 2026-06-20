import "server-only";
import { sql, ensureSchema, dbConfigured } from "./db";

export interface Snapshot {
  day: string;
  kd: number | null;
  winRate: number | null;
  kills: number | null;
}

/** Slaat (max 1×/dag) een snapshot op van de stats van een gebruiker. */
export async function saveSnapshot(userId: string | null, s: { kd?: number | null; winRate?: number | null; kills?: number | null }): Promise<void> {
  if (!dbConfigured() || !userId) return;
  try {
    await ensureSchema();
    await sql`
      INSERT INTO stat_snapshots (user_id, day, kd, win_rate, kills)
      VALUES (${userId}, CURRENT_DATE, ${s.kd ?? null}, ${s.winRate ?? null}, ${s.kills ?? null})
      ON CONFLICT (user_id, day) DO UPDATE SET kd = EXCLUDED.kd, win_rate = EXCLUDED.win_rate, kills = EXCLUDED.kills, captured_at = now()
    `;
  } catch {
    /* negeer */
  }
}

export async function getHistory(userId: string | null): Promise<Snapshot[]> {
  if (!dbConfigured() || !userId) return [];
  try {
    await ensureSchema();
    const { rows } = await sql`SELECT day, kd, win_rate, kills FROM stat_snapshots WHERE user_id = ${userId} ORDER BY day ASC LIMIT 90`;
    return rows.map((r: any) => ({
      day: typeof r.day === "string" ? r.day.slice(0, 10) : new Date(r.day).toISOString().slice(0, 10),
      kd: r.kd != null ? Number(r.kd) : null,
      winRate: r.win_rate != null ? Number(r.win_rate) : null,
      kills: r.kills != null ? Number(r.kills) : null,
    }));
  } catch {
    return [];
  }
}
