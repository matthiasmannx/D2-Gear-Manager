import "server-only";
import { sql, ensureSchema, dbConfigured } from "./db";

/** Per-account instellingen die over apparaten synchroniseren (favorieten e.d.). */
export interface UserPrefs {
  favPlayers?: { type: number; id: string; name: string }[];
  favGear?: number[];
}

export async function getUserPrefs(userId: string): Promise<UserPrefs | null> {
  if (!dbConfigured()) return null;
  await ensureSchema();
  const { rows } = await sql`SELECT prefs FROM user_prefs WHERE user_id = ${userId}`;
  return rows[0] ? (rows[0].prefs as UserPrefs) : null;
}

export async function saveUserPrefs(userId: string, prefs: UserPrefs): Promise<void> {
  if (!dbConfigured()) return;
  await ensureSchema();
  await sql`
    INSERT INTO user_prefs (user_id, prefs, updated_at)
    VALUES (${userId}, ${JSON.stringify(prefs)}::jsonb, now())
    ON CONFLICT (user_id) DO UPDATE SET prefs = EXCLUDED.prefs, updated_at = now()
  `;
}
