import "server-only";
import { createPool, type VercelPool } from "@vercel/postgres";

/**
 * Vercel Postgres (Neon) — opslag voor Community Builds (likes/favorites/comments
 * /forks). De connectie-string komt uit de Vercel-integratie. We accepteren
 * meerdere namen (oude "Vercel Postgres" gebruikt POSTGRES_URL, de nieuwe Neon-
 * integratie soms DATABASE_URL), pooled varianten eerst. Zonder DB geeft
 * dbConfigured() false en degraderen de pagina's netjes i.p.v. te crashen.
 */
const CONN_VARS = [
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "DATABASE_URL",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL_UNPOOLED",
];

function connectionString(): string | undefined {
  for (const k of CONN_VARS) {
    const v = process.env[k];
    if (v) return v;
  }
  return undefined;
}

export function dbConfigured(): boolean {
  return !!connectionString();
}

let _pool: VercelPool | null = null;
function getPool(): VercelPool {
  if (!_pool) _pool = createPool({ connectionString: connectionString() });
  return _pool;
}

// Proxy zodat bestaande call-sites `sql\`...\`` en `sql.query(text, params)`
// blijven werken, ongeacht welke env-var de connectie levert.
type SqlFn = VercelPool["sql"];
export const sql = ((strings: TemplateStringsArray, ...values: unknown[]) =>
  // @ts-expect-error tagged template doorgeven aan de pool
  getPool().sql(strings, ...values)) as unknown as SqlFn & { query: VercelPool["query"] };
// @ts-expect-error query op de proxy hangen
sql.query = (text: string, params?: unknown[]) => getPool().query(text as never, params as never);

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
  await sql`
    CREATE TABLE IF NOT EXISTS user_prefs (
      user_id    TEXT PRIMARY KEY,
      prefs      JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_likes_build ON build_likes (build_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_favs_build ON build_favorites (build_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_likes_recent ON build_likes (created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_favs_recent ON build_favorites (created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_builds_author ON builds (author_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_builds_created ON builds (created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_builds_verified ON builds (verified)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_builds_class ON builds (guardian_class, subclass)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_builds_activities ON builds USING GIN (activities)`;
  schemaReady = true;
}
