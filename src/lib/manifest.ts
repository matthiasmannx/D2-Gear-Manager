import "server-only";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { bungieFetch, BUNGIE_ROOT } from "./bungie";

/**
 * Bungie's SearchDestinyEntities-endpoint is uitgefaseerd/onbetrouwbaar, dus we
 * zoeken zelf in de manifest. We downloaden het (grote) item-definitiebestand
 * één keer, bouwen er een slanke index van (hash, naam, icon, type, tier) en
 * cachen die op schijf. Bij een nieuwe manifest-versie bouwen we opnieuw.
 */

export interface ItemIndexEntry {
  hash: number;
  name: string;
  icon: string | null;
  type: string;
  tier: string;
  /** DestinyItemType: 2 = Armor, 3 = Weapon (zie Bungie enum). */
  itemType: number;
  /** Inventory bucket (slot) hash, bv. kinetic/helmet. */
  bucketHash: number;
  equippable: boolean;
  /** 0=Titan, 1=Hunter, 2=Warlock, 3=elke class (bv. wapens). */
  classType: number;
}

// Gebundelde, vooraf gebouwde data (committen in de repo) — werkt op serverless
// zonder de 190MB-manifest te downloaden.
const BUNDLED_DIR = path.join(process.cwd(), "data");
const BUNDLED_INDEX = path.join(BUNDLED_DIR, "item-index-v3.json");
const BUNDLED_STAT = path.join(BUNDLED_DIR, "stat-names.json");
// Runtime-cache (alleen /tmp is schrijfbaar op serverless).
const CACHE_DIR = path.join(os.tmpdir(), "guardian-hub");
const INDEX_FILE = path.join(CACHE_DIR, "item-index-v3.json");
const STAT_FILE = path.join(CACHE_DIR, "stat-names.json");

interface CachedIndex {
  version: string;
  entries: ItemIndexEntry[];
}

// Module-level cache zodat we de index maar één keer per serverproces laden.
let memo: CachedIndex | null = null;
let building: Promise<CachedIndex> | null = null;

interface ManifestResponse {
  version: string;
  jsonWorldComponentContentPaths: Record<string, Record<string, string>>;
}

async function getItemTablePath(): Promise<{ version: string; url: string }> {
  const m = await bungieFetch<ManifestResponse>("/Destiny2/Manifest/", {
    revalidate: 60 * 60,
  });
  const rel = m.jsonWorldComponentContentPaths.en?.DestinyInventoryItemDefinition;
  if (!rel) throw new Error("Manifest bevat geen DestinyInventoryItemDefinition-pad.");
  return { version: m.version, url: `${BUNGIE_ROOT}${rel}` };
}

async function readCache(): Promise<CachedIndex | null> {
  try {
    const raw = await fs.readFile(INDEX_FILE, "utf8");
    return JSON.parse(raw) as CachedIndex;
  } catch {
    return null;
  }
}

async function buildIndex(): Promise<CachedIndex> {
  // 1. Gebundelde snapshot heeft voorrang — geen 190MB-download op de server.
  try {
    const raw = await fs.readFile(BUNDLED_INDEX, "utf8");
    return JSON.parse(raw) as CachedIndex;
  } catch {
    /* geen bundle → live bouwen */
  }

  const { version, url } = await getItemTablePath();

  // Hergebruik de schijf-cache als de manifest-versie ongewijzigd is.
  const cached = await readCache();
  if (cached?.version === version) return cached;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Manifest-download mislukt (HTTP ${res.status}).`);
  const table: Record<string, any> = await res.json();

  const entries: ItemIndexEntry[] = [];
  for (const key in table) {
    const def = table[key];
    const name = def?.displayProperties?.name;
    // Sla naamloze/redacted/placeholder definities over.
    if (!name || def.redacted) continue;
    entries.push({
      hash: def.hash,
      name,
      icon: def.displayProperties?.icon ?? null,
      type: def.itemTypeDisplayName ?? "",
      tier: def.inventory?.tierTypeName ?? "",
      itemType: def.itemType ?? 0,
      bucketHash: def.inventory?.bucketTypeHash ?? 0,
      equippable: !!def.equippable,
      classType: def.classType ?? 3,
    });
  }

  const index: CachedIndex = { version, entries };
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(INDEX_FILE, JSON.stringify(index));
  return index;
}

async function getIndex(): Promise<CachedIndex> {
  if (memo) return memo;
  if (!building) {
    building = buildIndex()
      .then((idx) => {
        memo = idx;
        return idx;
      })
      .finally(() => {
        building = null;
      });
  }
  return building;
}

// Stat-hash → naam, gedownload uit DestinyStatDefinition en gecachet.
let statNames: Record<string, string> | null = null;

export async function getStatNames(): Promise<Record<string, string>> {
  if (statNames) return statNames;
  // Gebundelde snapshot eerst, dan runtime-cache.
  for (const file of [BUNDLED_STAT, STAT_FILE]) {
    try {
      const raw = await fs.readFile(file, "utf8");
      statNames = JSON.parse(raw);
      return statNames!;
    } catch {
      /* volgende bron */
    }
  }
  const m = await bungieFetch<ManifestResponse>("/Destiny2/Manifest/", {
    revalidate: 60 * 60,
  });
  const rel = m.jsonWorldComponentContentPaths.en?.DestinyStatDefinition;
  const out: Record<string, string> = {};
  if (rel) {
    const res = await fetch(`${BUNGIE_ROOT}${rel}`);
    if (res.ok) {
      const table: Record<string, any> = await res.json();
      for (const k in table) {
        const n = table[k]?.displayProperties?.name;
        if (n) out[k] = n;
      }
    }
  }
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(STAT_FILE, JSON.stringify(out));
  statNames = out;
  return out;
}

// Hash → entry map, lazy gebouwd vanuit de index voor instant lookups.
let hashMap: Map<number, ItemIndexEntry> | null = null;

async function getHashMap(): Promise<Map<number, ItemIndexEntry>> {
  if (hashMap) return hashMap;
  const { entries } = await getIndex();
  hashMap = new Map(entries.map((e) => [e.hash, e]));
  return hashMap;
}

/** Zoek meerdere items op hash op (uit de in-memory index, geen API-calls). */
export async function lookupItems(
  hashes: (number | string)[]
): Promise<Map<number, ItemIndexEntry>> {
  const map = await getHashMap();
  const out = new Map<number, ItemIndexEntry>();
  for (const h of hashes) {
    const n = typeof h === "string" ? Number(h) : h;
    const e = map.get(n);
    if (e) out.set(n, e);
  }
  return out;
}

/**
 * Zoek items op naam (case-insensitive substring). Exacte/begin-matches eerst.
 */
export async function searchItemIndex(
  query: string,
  limit = 60
): Promise<ItemIndexEntry[]> {
  const { entries } = await getIndex();
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matches = entries.filter((e) => e.name.toLowerCase().includes(q));
  matches.sort((a, b) => {
    const an = a.name.toLowerCase();
    const bn = b.name.toLowerCase();
    const aExact = an === q ? 0 : an.startsWith(q) ? 1 : 2;
    const bExact = bn === q ? 0 : bn.startsWith(q) ? 1 : 2;
    if (aExact !== bExact) return aExact - bExact;
    return a.name.length - b.name.length;
  });

  // Bundel duplicaten: dezelfde naam + type + rarity = hetzelfde item (de
  // manifest bevat meerdere kopieën/versies per item). Hou de eerste (best
  // gesorteerde) en geef de voorkeur aan een exemplaar met een icoon.
  const seen = new Map<string, ItemIndexEntry>();
  for (const e of matches) {
    const key = `${e.name.toLowerCase()}|${e.type}|${e.tier}`;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, e);
    } else if (!existing.icon && e.icon) {
      seen.set(key, e); // upgrade naar een exemplaar mét icoon
    }
  }
  return [...seen.values()].slice(0, limit);
}
