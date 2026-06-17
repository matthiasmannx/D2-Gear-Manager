/**
 * Server-side Bungie API client. Mag ALLEEN op de server draaien (gebruikt
 * geheime env-vars). De API key en OAuth-secret verlaten zo nooit de browser.
 *
 * API-docs: https://bungie-net.github.io/
 */
import "server-only";

export const BUNGIE_ROOT = "https://www.bungie.net";
export const PLATFORM = `${BUNGIE_ROOT}/Platform`;

export function apiKey(): string {
  const key = process.env.BUNGIE_API_KEY;
  if (!key || key === "your_api_key_here") {
    throw new Error(
      "BUNGIE_API_KEY ontbreekt. Zet je key in .env.local (zie .env.local.example)."
    );
  }
  return key;
}

/** Alle Bungie-responses zitten in deze envelope. */
interface BungieEnvelope<T> {
  Response: T;
  ErrorCode: number;
  ErrorStatus: string;
  Message: string;
}

class BungieError extends Error {
  constructor(public status: number, public errorStatus: string, message: string) {
    super(message);
    this.name = "BungieError";
  }
}

interface CallOpts {
  accessToken?: string;
  method?: "GET" | "POST";
  body?: unknown;
  /** Next.js fetch-cache revalidatie in seconden (alleen publieke calls). */
  revalidate?: number;
}

/**
 * Lage-niveau call naar het Platform-endpoint. `path` begint met "/".
 */
export async function bungieFetch<T>(path: string, opts: CallOpts = {}): Promise<T> {
  const headers: Record<string, string> = { "X-API-Key": apiKey() };
  if (opts.accessToken) headers["Authorization"] = `Bearer ${opts.accessToken}`;
  if (opts.body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${PLATFORM}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    next: opts.revalidate ? { revalidate: opts.revalidate } : undefined,
    cache: opts.revalidate ? undefined : opts.accessToken ? "no-store" : undefined,
  });

  const text = await res.text();
  let json: BungieEnvelope<T>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new BungieError(res.status, "ParseError", text.slice(0, 200));
  }

  if (!res.ok || json.ErrorCode !== 1) {
    throw new BungieError(
      res.status,
      json.ErrorStatus ?? "Unknown",
      json.Message ?? `HTTP ${res.status}`
    );
  }
  return json.Response;
}

// ---------------------------------------------------------------------------
// OAuth
// ---------------------------------------------------------------------------

export function authorizeUrl(state: string): string {
  const clientId = process.env.BUNGIE_CLIENT_ID;
  if (!clientId || clientId === "your_client_id_here") {
    throw new Error("BUNGIE_CLIENT_ID ontbreekt in .env.local.");
  }
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    state,
  });
  return `${BUNGIE_ROOT}/en/OAuth/Authorize?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  membership_id: string;
}

async function tokenRequest(form: Record<string, string>): Promise<TokenResponse> {
  const clientId = process.env.BUNGIE_CLIENT_ID!;
  const clientSecret = process.env.BUNGIE_CLIENT_SECRET;
  const headers: Record<string, string> = {
    "X-API-Key": apiKey(),
    "Content-Type": "application/x-www-form-urlencoded",
  };
  // Confidential clients authenticeren met Basic auth (id:secret).
  if (clientSecret && clientSecret !== "your_client_secret_here") {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    headers["Authorization"] = `Basic ${basic}`;
  } else {
    form.client_id = clientId;
  }

  const res = await fetch(`${PLATFORM}/App/OAuth/Token/`, {
    method: "POST",
    headers,
    body: new URLSearchParams(form).toString(),
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new BungieError(res.status, json.error ?? "TokenError", json.error_description ?? "OAuth token request mislukt");
  }
  return json as TokenResponse;
}

export function exchangeCode(code: string): Promise<TokenResponse> {
  return tokenRequest({ grant_type: "authorization_code", code });
}

export function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  return tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken });
}

// ---------------------------------------------------------------------------
// Account / profiel (vereist OAuth)
// ---------------------------------------------------------------------------

export interface DestinyMembership {
  membershipType: number;
  membershipId: string;
  displayName: string;
  iconPath?: string;
}

export async function getMemberships(accessToken: string): Promise<{
  primary: DestinyMembership | null;
  memberships: DestinyMembership[];
  bungieGlobalDisplayName: string;
}> {
  const r = await bungieFetch<any>("/User/GetMembershipsForCurrentUser/", {
    accessToken,
  });
  const memberships: DestinyMembership[] = r.destinyMemberships ?? [];
  const primaryId = r.primaryMembershipId;
  const primary =
    memberships.find((m) => m.membershipId === primaryId) ?? memberships[0] ?? null;
  return {
    primary,
    memberships,
    bungieGlobalDisplayName: r.bungieNetUser?.displayName ?? "Guardian",
  };
}

/**
 * Haalt profiel + characters + equipment op. `components` zijn de Destiny
 * component-nummers, bv. 200 = characters, 205 = character equipment,
 * 300 = item instances (voor power level e.d.).
 */
export async function getProfile(
  accessToken: string,
  membershipType: number,
  membershipId: string,
  components: number[]
): Promise<any> {
  const c = components.join(",");
  return bungieFetch<any>(
    `/Destiny2/${membershipType}/Profile/${membershipId}/?components=${c}`,
    { accessToken }
  );
}

// ---------------------------------------------------------------------------
// Items verplaatsen / equippen (vereist OAuth + MoveEquipDestinyItems-scope)
// ---------------------------------------------------------------------------

export interface TransferArgs {
  itemReferenceHash: number;
  itemId: string; // itemInstanceId
  characterId: string;
  membershipType: number;
  transferToVault: boolean;
  stackSize?: number;
}

/** Verplaats een item van/naar de vault (of tussen vault en character). */
export async function transferItem(accessToken: string, args: TransferArgs): Promise<void> {
  await bungieFetch<number>("/Destiny2/Actions/Items/TransferItem/", {
    method: "POST",
    accessToken,
    body: {
      itemReferenceHash: args.itemReferenceHash,
      stackSize: args.stackSize ?? 1,
      transferToVault: args.transferToVault,
      itemId: args.itemId,
      characterId: args.characterId,
      membershipType: args.membershipType,
    },
  });
}

/** Trek een item uit de postmaster naar de character-inventory. */
export async function pullFromPostmaster(
  accessToken: string,
  args: { itemReferenceHash: number; itemId?: string; characterId: string; membershipType: number; stackSize?: number }
): Promise<void> {
  await bungieFetch<number>("/Destiny2/Actions/Items/PullFromPostmaster/", {
    method: "POST",
    accessToken,
    body: {
      itemReferenceHash: args.itemReferenceHash,
      stackSize: args.stackSize ?? 1,
      itemId: args.itemId ?? "0",
      characterId: args.characterId,
      membershipType: args.membershipType,
    },
  });
}

/** Equip een opgeslagen in-game loadout (slot-index) op een character. */
export async function equipLoadout(
  accessToken: string,
  args: { loadoutIndex: number; characterId: string; membershipType: number }
): Promise<void> {
  await bungieFetch<number>("/Destiny2/Actions/Loadouts/EquipLoadout/", {
    method: "POST",
    accessToken,
    body: args,
  });
}

/** Lock of unlock een item (locked items kun je in-game niet dismantlen). */
export async function setItemLockState(
  accessToken: string,
  args: { state: boolean; itemId: string; characterId: string; membershipType: number }
): Promise<void> {
  await bungieFetch<number>("/Destiny2/Actions/Items/SetLockState/", {
    method: "POST",
    accessToken,
    body: args,
  });
}

/** Equip een item op een character (item moet al op die character staan). */
export async function equipItem(
  accessToken: string,
  args: { itemId: string; characterId: string; membershipType: number }
): Promise<void> {
  await bungieFetch<number>("/Destiny2/Actions/Items/EquipItem/", {
    method: "POST",
    accessToken,
    body: args,
  });
}

// ---------------------------------------------------------------------------
// Publieke game-data (alleen API key)
// ---------------------------------------------------------------------------

/** Eén enkele definitie ophalen zonder de hele manifest te downloaden. */
export async function getEntityDefinition(
  entityType: string,
  hash: string | number,
  revalidate = 60 * 60 * 24
): Promise<any> {
  return bungieFetch<any>(`/Destiny2/Manifest/${entityType}/${hash}/`, {
    revalidate,
  });
}

/** Publieke milestones = wekelijkse/dagelijkse activiteiten en resets. */
export async function getPublicMilestones(): Promise<any> {
  return bungieFetch<any>("/Destiny2/Milestones/", { revalidate: 60 * 15 });
}

// ---------------------------------------------------------------------------
// Spelers zoeken + publieke PvP-stats (geen OAuth nodig, mits privacy open)
// ---------------------------------------------------------------------------

export const PLATFORMS: Record<number, string> = {
  1: "Xbox",
  2: "PlayStation",
  3: "Steam",
  4: "Blizzard",
  5: "Stadia",
  6: "Epic Games",
  10: "Demon",
  254: "Bungie.net",
};

export interface PlayerResult {
  bungieName: string; // "Naam#1234"
  memberships: DestinyMembership[];
}

/**
 * Zoek spelers. Bevat de query een `#code` (bv. "Guardian#1234"), dan doen we
 * een exacte Bungie-naam-zoekopdracht; anders een prefix-zoekopdracht op de
 * Bungie-naam. Let op: de API ondersteunt geen losse PSN-gamertag-zoek meer —
 * alleen de Bungie-naam.
 */
export async function searchPlayers(query: string, page = 0): Promise<PlayerResult[]> {
  const hashIdx = query.lastIndexOf("#");
  if (hashIdx > 0) {
    const name = query.slice(0, hashIdx).trim();
    const code = query.slice(hashIdx + 1).trim();
    if (/^\d{1,4}$/.test(code)) {
      // Exacte Bungie-naam + code → betrouwbaarste match.
      const r = await bungieFetch<any[]>(
        `/Destiny2/SearchDestinyPlayerByBungieName/-1/`,
        { method: "POST", body: { displayName: name, displayNameCode: Number(code) } }
      );
      const memberships = (r ?? []) as DestinyMembership[];
      if (memberships.length === 0) return [];
      return [{ bungieName: `${name}#${code}`, memberships }];
    }
  }

  const r = await bungieFetch<any>(`/User/Search/GlobalName/${page}/`, {
    method: "POST",
    body: { displayNamePrefix: query },
  });
  return (r?.searchResults ?? []).map((u: any) => ({
    bungieName: `${u.bungieGlobalDisplayName}#${u.bungieGlobalDisplayNameCode}`,
    memberships: (u.destinyMemberships ?? []) as DestinyMembership[],
  }));
}

/** Eén PvP-mode met uitgebreide stats. */
export interface PvpModeStats {
  mode: string;
  label: string;
  kd: string;
  kda: string;
  efficiency: string;
  winRate: string; // percentage
  wins: string;
  games: string;
  kills: string;
  deaths: string;
  assists: string;
  precisionPct: string;
  bestGameKills: string;
  longestSpree: string;
  longestLife: string;
  avgLifespan: string;
  combatRating: string;
  timePlayed: string;
}

const MODE_LABELS: Record<string, string> = {
  allPvP: "Crucible (alle PvP)",
  trialsOfOsiris: "Trials of Osiris",
  ironBanner: "Iron Banner",
  pvpCompetitive: "Competitive",
  pvpQuickplay: "Quickplay",
  control: "Control",
  clash: "Clash",
  rumble: "Rumble",
};

function disp(stat: any, key: string): string {
  const b = stat?.[key]?.basic;
  return b?.displayValue ?? (b?.value != null ? String(b.value) : "—");
}
function num(stat: any, key: string): number {
  return stat?.[key]?.basic?.value ?? 0;
}
function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function toModeStats(mode: string, a: any): PvpModeStats {
  const won = num(a, "activitiesWon");
  const entered = num(a, "activitiesEntered");
  const kills = num(a, "kills");
  const precision = num(a, "precisionKills");
  return {
    mode,
    label: MODE_LABELS[mode] ?? mode,
    kd: disp(a, "killsDeathsRatio"),
    kda: disp(a, "killsDeathsAssists"),
    efficiency: disp(a, "efficiency"),
    winRate: entered > 0 ? pct(won / entered) : "—",
    wins: disp(a, "activitiesWon"),
    games: disp(a, "activitiesEntered"),
    kills: disp(a, "kills"),
    deaths: disp(a, "deaths"),
    assists: disp(a, "assists"),
    precisionPct: kills > 0 ? pct(precision / kills) : "—",
    bestGameKills: disp(a, "bestSingleGameKills"),
    longestSpree: disp(a, "longestKillSpree"),
    longestLife: disp(a, "longestSingleLife"),
    avgLifespan: disp(a, "averageLifespan"),
    combatRating: disp(a, "combatRating"),
    timePlayed: disp(a, "secondsPlayed"),
  };
}

export interface WeaponKill {
  label: string;
  kills: number;
  isAbility: boolean;
}
export interface PvpHighlights {
  kd: string;
  kda: string;
  winRate: string;
  totalKills: string;
  bestGameKills: string;
  longestSpree: string;
  longestLife: string;
  combatRating: string;
  timePlayed: string;
  precisionPct: string;
}

const WEAPON_LABELS: Record<string, string> = {
  weaponKillsAutoRifle: "Auto Rifle",
  weaponKillsHandCannon: "Hand Cannon",
  weaponKillsPulseRifle: "Pulse Rifle",
  weaponKillsScoutRifle: "Scout Rifle",
  weaponKillsSideArm: "Sidearm",
  weaponKillsSubmachinegun: "SMG",
  weaponKillsFusionRifle: "Fusion Rifle",
  weaponKillsBeamRifle: "Linear Fusion",
  weaponKillsTraceRifle: "Trace Rifle",
  weaponKillsShotgun: "Shotgun",
  weaponKillsSniper: "Sniper",
  weaponKillsBow: "Bow",
  weaponKillsGrenadeLauncher: "Grenade Launcher",
  weaponKillsRocketLauncher: "Rocket Launcher",
  weaponKillsMachineGun: "Machine Gun",
  weaponKillsSword: "Sword",
  weaponKillsGlaive: "Glaive",
  weaponKillsSuper: "Super",
  weaponKillsMelee: "Melee",
  weaponKillsGrenade: "Grenade",
  weaponKillsAbility: "Ability",
  weaponKillsRelic: "Relic",
};
const ABILITY_KEYS = new Set([
  "weaponKillsSuper",
  "weaponKillsMelee",
  "weaponKillsGrenade",
  "weaponKillsAbility",
  "weaponKillsRelic",
]);

export interface PvpStatsResult {
  modes: PvpModeStats[];
  weapons: WeaponKill[];
  highlights: PvpHighlights | null;
}

/** Publieke PvP-stats: per mode, wapentype-kills en career highlights. */
export async function getPvpStats(
  membershipType: number,
  membershipId: string
): Promise<PvpStatsResult> {
  const r = await bungieFetch<any>(
    `/Destiny2/${membershipType}/Account/${membershipId}/Stats/`,
    { revalidate: 60 * 30 }
  );
  const results = r?.mergedAllCharacters?.results ?? {};

  const modes: PvpModeStats[] = [];
  for (const mode of Object.keys(MODE_LABELS)) {
    const a = results?.[mode]?.allTime;
    if (a) modes.push(toModeStats(mode, a));
  }

  const all = results?.allPvP?.allTime;
  let weapons: WeaponKill[] = [];
  let highlights: PvpHighlights | null = null;
  if (all) {
    weapons = Object.keys(WEAPON_LABELS)
      .map((k) => ({
        label: WEAPON_LABELS[k],
        kills: num(all, k),
        isAbility: ABILITY_KEYS.has(k),
      }))
      .filter((w) => w.kills > 0)
      .sort((a, b) => b.kills - a.kills);

    const won = num(all, "activitiesWon");
    const entered = num(all, "activitiesEntered");
    const kills = num(all, "kills");
    highlights = {
      kd: disp(all, "killsDeathsRatio"),
      kda: disp(all, "killsDeathsAssists"),
      winRate: entered > 0 ? pct(won / entered) : "—",
      totalKills: disp(all, "kills"),
      bestGameKills: disp(all, "bestSingleGameKills"),
      longestSpree: disp(all, "longestKillSpree"),
      longestLife: disp(all, "longestSingleLife"),
      combatRating: disp(all, "combatRating"),
      timePlayed: disp(all, "secondsPlayed"),
      precisionPct: kills > 0 ? pct(num(all, "precisionKills") / kills) : "—",
    };
  }

  return { modes, weapons, highlights };
}

export interface PveStats {
  kd: string;
  kda: string;
  kills: string;
  deaths: string;
  assists: string;
  timePlayed: string;
  activitiesCleared: string;
  publicEvents: string;
  bestGameKills: string;
  longestSpree: string;
  weapons: WeaponKill[];
}

/** Publieke PvE-stats (allPvE-mode). Null bij privé/geen data. */
export async function getPveStats(
  membershipType: number,
  membershipId: string
): Promise<PveStats | null> {
  const r = await bungieFetch<any>(
    `/Destiny2/${membershipType}/Account/${membershipId}/Stats/`,
    { revalidate: 60 * 30 }
  );
  const a = r?.mergedAllCharacters?.results?.allPvE?.allTime;
  if (!a) return null;

  const weapons: WeaponKill[] = Object.keys(WEAPON_LABELS)
    .map((k) => ({ label: WEAPON_LABELS[k], kills: num(a, k), isAbility: ABILITY_KEYS.has(k) }))
    .filter((w) => w.kills > 0)
    .sort((x, y) => y.kills - x.kills);

  return {
    kd: disp(a, "killsDeathsRatio"),
    kda: disp(a, "killsDeathsAssists"),
    kills: disp(a, "kills"),
    deaths: disp(a, "deaths"),
    assists: disp(a, "assists"),
    timePlayed: disp(a, "secondsPlayed"),
    activitiesCleared: disp(a, "activitiesCleared"),
    publicEvents: disp(a, "publicEventsCompleted"),
    bestGameKills: disp(a, "bestSingleGameKills"),
    longestSpree: disp(a, "longestKillSpree"),
    weapons,
  };
}

// --- Ranks, characters, flawless (profiel-componenten 200/202/1100) ---

export interface RankInfo {
  label: string;
  rankName: string;
  resets: number | null;
}
export interface PlayerCharacter {
  characterId: string;
  classType: number;
  light: number;
  emblemPath?: string;
}
export interface PlayerExtras {
  characters: PlayerCharacter[];
  ranks: RankInfo[];
  flawlessCount: number | null;
}

const RANK_PROGRESSIONS: { hash: number; label: string }[] = [
  { hash: 2083746873, label: "Valor" },
  { hash: 3696598664, label: "Glory" },
  { hash: 2755675426, label: "Trials" },
];
const FLAWLESS_TICKETS = "2590760275";

export async function getPlayerExtras(
  membershipType: number,
  membershipId: string
): Promise<PlayerExtras> {
  const r = await bungieFetch<any>(
    `/Destiny2/${membershipType}/Profile/${membershipId}/?components=200,202,1100`,
    { revalidate: 60 * 30 }
  );

  const charData = r?.characters?.data ?? {};
  const characters: PlayerCharacter[] = Object.values<any>(charData).map((c) => ({
    characterId: c.characterId,
    classType: c.classType,
    light: c.light,
    emblemPath: c.emblemPath,
  }));

  // Progressions zitten per character; pak de eerste character met data.
  const progAll = r?.characterProgressions?.data ?? {};
  const firstChar = Object.values<any>(progAll)[0];
  const progs = firstChar?.progressions ?? {};
  const ranks: RankInfo[] = [];
  for (const { hash, label } of RANK_PROGRESSIONS) {
    const p = progs[hash];
    if (!p) continue;
    let rankName = `Level ${p.level}`;
    try {
      const def = await getEntityDefinition("DestinyProgressionDefinition", hash);
      const step = def?.steps?.[p.level];
      if (step?.stepName) rankName = step.stepName;
    } catch {
      /* val terug op level */
    }
    ranks.push({
      label,
      rankName,
      resets: typeof p.currentResetCount === "number" ? p.currentResetCount : null,
    });
  }

  const metrics = r?.metrics?.data?.metrics ?? {};
  const fl = metrics?.[FLAWLESS_TICKETS]?.objectiveProgress?.progress;
  const flawlessCount = typeof fl === "number" ? fl : null;

  return { characters, ranks, flawlessCount };
}

// --- Recente wedstrijden (match history) ---

/** DestinyActivityModeType → leesbaar label (PvP-playlists). */
const PVP_MODE_NAMES: Record<number, string> = {
  5: "Crucible", 10: "Control", 12: "Clash", 19: "Iron Banner", 25: "Mayhem",
  31: "Supremacy", 37: "Survival", 38: "Countdown", 43: "Iron Banner Control",
  44: "Iron Banner Clash", 48: "Rumble", 60: "Scorched", 62: "Breakthrough",
  65: "Doubles", 69: "Competitive", 70: "Quickplay", 81: "Zone Control",
  84: "Trials of Osiris",
};
function modeLabel(details: any): string {
  // Pak de meest specifieke mode (niet de generieke 5/AllPvP).
  const candidates: number[] = [details?.mode, ...(details?.modes ?? [])].filter((x) => typeof x === "number");
  const specific = candidates.find((m) => m !== 5 && PVP_MODE_NAMES[m]);
  return PVP_MODE_NAMES[specific ?? details?.mode] ?? "Crucible";
}

export interface MatchResult {
  won: boolean;
  result: string; // "Victory" / "Defeat"
  mode: string; // playlist-naam
  mapName: string;
  kills: string;
  deaths: string;
  assists: string;
  kd: string;
  date: string; // ISO
  instanceId?: string;
}

/** Laatste PvP-wedstrijden over alle characters, gesorteerd op datum. */
export async function getRecentMatches(
  membershipType: number,
  membershipId: string,
  characterIds: string[],
  perChar = 12
): Promise<MatchResult[]> {
  const all = await Promise.all(
    characterIds.map(async (cid) => {
      try {
        const r = await bungieFetch<any>(
          `/Destiny2/${membershipType}/Account/${membershipId}/Character/${cid}/Stats/Activities/?mode=5&count=${perChar}&page=0`,
          { revalidate: 60 * 10 }
        );
        return (r?.activities ?? []) as any[];
      } catch {
        return [];
      }
    })
  );

  const flat = all.flat();
  // Resolveer map-namen (gededupliceerd).
  const hashes = [...new Set(flat.map((m) => m.activityDetails?.referenceId).filter(Boolean))];
  const mapNames: Record<string, string> = {};
  await Promise.all(
    hashes.map(async (h) => {
      try {
        const def = await getEntityDefinition("DestinyActivityDefinition", h);
        mapNames[h] = def?.displayProperties?.name ?? "Onbekende map";
      } catch {
        mapNames[h] = "Onbekende map";
      }
    })
  );

  const matches: MatchResult[] = flat.map((m) => {
    const v = m.values ?? {};
    const standing = v.standing?.basic?.value;
    const won = standing === 0;
    return {
      won,
      result: won ? "Victory" : "Defeat",
      mode: modeLabel(m.activityDetails),
      mapName: mapNames[m.activityDetails?.referenceId] ?? "—",
      kills: disp(v, "kills"),
      deaths: disp(v, "deaths"),
      assists: disp(v, "assists"),
      kd: disp(v, "killsDeathsRatio"),
      date: m.period,
      instanceId: m.activityDetails?.instanceId,
    };
  });

  matches.sort((a, b) => (a.date < b.date ? 1 : -1));
  return matches.slice(0, 20);
}

// --- Per-modus PvP-stats (weekly + lifetime): Crucible / Iron Banner / Trials ---

export interface ModeBlock {
  kd: string;
  winRate: string;
  wins: number;
  games: number;
}
export interface PvpModeSummary {
  label: string;
  lifetime: ModeBlock;
  weekly: ModeBlock;
}

const PVP_MODES_QUERY = [
  { id: 5, key: "allPvP", label: "Crucible" },
  { id: 19, key: "ironBanner", label: "Iron Banner" },
  { id: 84, key: "trialsOfOsiris", label: "Trials of Osiris" },
];

function blockFrom(kills: number, deaths: number, wins: number, games: number): ModeBlock {
  return {
    kd: deaths > 0 ? (kills / deaths).toFixed(2) : String(kills),
    winRate: games > 0 ? `${((wins / games) * 100).toFixed(1)}%` : "—",
    wins,
    games,
  };
}

/** Per modus lifetime + deze-week stats (gesommeerd over characters). */
export async function getPvpModes(
  membershipType: number,
  membershipId: string,
  characterIds: string[]
): Promise<PvpModeSummary[]> {
  // dayStart = 7 dagen terug (UTC), dayEnd = vandaag.
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const modes = PVP_MODES_QUERY.map((m) => m.id).join(",");

  // Accumulatoren per mode-key.
  const acc: Record<string, { lk: number; ld: number; lw: number; lg: number; wk: number; wd: number; ww: number; wg: number }> = {};
  for (const m of PVP_MODES_QUERY) acc[m.key] = { lk: 0, ld: 0, lw: 0, lg: 0, wk: 0, wd: 0, ww: 0, wg: 0 };

  await Promise.all(
    characterIds.map(async (cid) => {
      const base = `/Destiny2/${membershipType}/Account/${membershipId}/Character/${cid}/Stats/?modes=${modes}&groups=1`;
      const [life, daily] = await Promise.all([
        bungieFetch<any>(`${base}&periodType=0`, { revalidate: 60 * 30 }).catch(() => ({})),
        bungieFetch<any>(`${base}&periodType=2&dayStart=${fmt(weekAgo)}&dayEnd=${fmt(today)}`, { revalidate: 60 * 30 }).catch(() => ({})),
      ]);
      for (const m of PVP_MODES_QUERY) {
        const a = life?.[m.key]?.allTime;
        if (a) {
          acc[m.key].lk += num(a, "kills");
          acc[m.key].ld += num(a, "deaths");
          acc[m.key].lw += num(a, "activitiesWon");
          acc[m.key].lg += num(a, "activitiesEntered");
        }
        for (const day of daily?.[m.key]?.daily ?? []) {
          const v = day.values ?? {};
          acc[m.key].wk += v.kills?.basic?.value ?? 0;
          acc[m.key].wd += v.deaths?.basic?.value ?? 0;
          acc[m.key].ww += v.activitiesWon?.basic?.value ?? 0;
          acc[m.key].wg += v.activitiesEntered?.basic?.value ?? 0;
        }
      }
    })
  );

  return PVP_MODES_QUERY.map((m) => {
    const x = acc[m.key];
    return {
      label: m.label,
      lifetime: blockFrom(x.lk, x.ld, x.lw, x.lg),
      weekly: blockFrom(x.wk, x.wd, x.ww, x.wg),
    };
  });
}

// --- "Samen gematcht": gedeelde PvP-instanceIds met de ingelogde speler ---

async function recentInstanceIds(
  type: number,
  id: string,
  charIds: string[],
  perChar = 50
): Promise<Set<string>> {
  const ids = new Set<string>();
  await Promise.all(
    charIds.map(async (cid) => {
      try {
        const r = await bungieFetch<any>(
          `/Destiny2/${type}/Account/${id}/Character/${cid}/Stats/Activities/?mode=5&count=${perChar}&page=0`,
          { revalidate: 60 * 10 }
        );
        for (const a of r?.activities ?? []) {
          const iid = a.activityDetails?.instanceId;
          if (iid) ids.add(String(iid));
        }
      } catch {
        /* negeer */
      }
    })
  );
  return ids;
}

/**
 * Tel hoe vaak de ingelogde speler in dezelfde PvP-match zat als de doelspeler
 * (gedeelde recente instanceIds). accessToken = ingelogde gebruiker.
 */
export async function getSharedMatchCount(
  accessToken: string,
  target: { membershipType: number; membershipId: string; characterIds: string[] }
): Promise<{ count: number; self: boolean } | null> {
  try {
    const { primary } = await getMemberships(accessToken);
    if (!primary) return null;
    // Zelfde speler opgezocht?
    if (primary.membershipId === target.membershipId) return { count: 0, self: true };

    const meProfile = await getProfile(accessToken, primary.membershipType, primary.membershipId, [200]);
    const meChars = Object.keys(meProfile?.characters?.data ?? {});
    if (meChars.length === 0) return { count: 0, self: false };

    const [mine, theirs] = await Promise.all([
      recentInstanceIds(primary.membershipType, primary.membershipId, meChars),
      recentInstanceIds(target.membershipType, target.membershipId, target.characterIds),
    ]);
    let count = 0;
    for (const iid of theirs) if (mine.has(iid)) count++;
    return { count, self: false };
  } catch {
    return null;
  }
}

/** Volledige icon-URL bouwen vanuit een relatief manifest-pad. */
export function icon(path?: string | null): string | null {
  if (!path) return null;
  return path.startsWith("http") ? path : `${BUNGIE_ROOT}${path}`;
}
