import "server-only";
import { sql } from "@vercel/postgres";

/**
 * Vercel Postgres (Neon) — opslag voor Community Builds (likes/favorites/comments
 * /forks). De env-vars worden door de Vercel-integratie ingespoten. Zolang er
 * geen DB gekoppeld is, geeft dbConfigured() false en degraderen de pagina's
 * netjes i.p.v. te crashen.
 */
export { sql };

export function dbConfigured(): boolean {
  return !!(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING);
}

let schemaReady = false;

/** Maakt de tabellen aan als ze nog niet bestaan (idempotent). */
export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS builds (
      id            TEXT PRIMARY KEY,
      author_id     TEXT NOT NULL,
      author_name   TEXT NOT NULL DEFAULT '',
      title         TEXT NOT NULL,
      description   TEXT NOT NULL DEFAULT '',
      activities    TEXT[] NOT NULL DEFAULT '{}',
      guardian_class TEXT NOT NULL,
      subclass      TEXT NOT NULL,
      super         TEXT NOT NULL DEFAULT '',
      loadout       JSONB NOT NULL DEFAULT '{}',
      stats         JSONB NOT NULL DEFAULT '{}',
      aspects       TEXT[] NOT NULL DEFAULT '{}',
      fragments     TEXT[] NOT NULL DEFAULT '{}',
      forked_from   TEXT,
      verified      BOOLEAN NOT NULL DEFAULT FALSE,
      featured      BOOLEAN NOT NULL DEFAULT FALSE,
      views         INTEGER NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS build_likes (
      build_id   TEXT NOT NULL,
      user_id    TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (build_id, user_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS build_favorites (
      build_id   TEXT NOT NULL,
      user_id    TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (build_id, user_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_likes_build ON build_likes (build_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_favs_build ON build_favorites (build_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_likes_recent ON build_likes (created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_builds_author ON builds (author_id)`;
  schemaReady = true;
}
