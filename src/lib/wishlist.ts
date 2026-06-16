import "server-only";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { lookupItems } from "./manifest";
import { icon } from "./bungie";

/**
 * God rolls via een DIM-wishlist (community-onderhouden "voltron"-bestand). We
 * downloaden het één keer, parsen het naar een slanke map (wapen-hash →
 * aanbevolen PvE/PvP-perk-hashes) en cachen dat op schijf. Perk-namen resolven
 * we via de in-memory manifest-index.
 *
 * Bron: 48klocs/dim-wish-list-sources (voltron.txt).
 */

const BUNDLED_WISHLIST = path.join(process.cwd(), "data", "wishlist.json");
const CACHE_DIR = path.join(os.tmpdir(), "guardian-hub");
const WISHLIST_FILE = path.join(CACHE_DIR, "wishlist.json");
const SOURCE =
  "https://raw.githubusercontent.com/48klocs/dim-wish-list-sources/master/voltron.txt";

interface Entry {
  pve: number[];
  pvp: number[];
}

let memo: Map<number, Entry> | null = null;
let building: Promise<Map<number, Entry>> | null = null;

const CAP = 18; // max perks per categorie per wapen

async function buildMap(): Promise<Map<number, Entry>> {
  // Gebundelde snapshot eerst, dan runtime-cache (/tmp).
  for (const file of [BUNDLED_WISHLIST, WISHLIST_FILE]) {
    try {
      const raw = await fs.readFile(file, "utf8");
      const obj = JSON.parse(raw) as Record<string, Entry>;
      return new Map(Object.entries(obj).map(([k, v]) => [Number(k), v]));
    } catch {
      /* volgende bron */
    }
  }

  const res = await fetch(SOURCE);
  if (!res.ok) throw new Error(`Wishlist-download mislukt (HTTP ${res.status}).`);
  const text = await res.text();

  const map = new Map<number, Entry>();
  let curTags = "";

  for (const line of text.split("\n")) {
    if (line.startsWith("//") || line.startsWith("title:")) {
      const ti = line.indexOf("|tags:");
      curTags = ti >= 0 ? line.slice(ti + 6).toLowerCase() : "";
      continue;
    }
    if (!line.startsWith("dimwishlist:")) continue;

    const itemM = line.match(/item=(-?\d+)/);
    if (!itemM) continue;
    const hash = Number(itemM[1]);
    if (hash < 0) continue; // negatieve hash = "trash roll"-markering

    const perksM = line.match(/perks=([\d,]+)/);
    const perks = perksM ? perksM[1].split(",").map(Number).filter(Boolean) : [];
    if (perks.length === 0) continue;

    const tags = curTags + " " + line.toLowerCase();
    const isPvp = /pvp/.test(tags);
    const isPve = /pve/.test(tags) || !isPvp; // ongetagd → behandel als PvE

    let e = map.get(hash);
    if (!e) {
      e = { pve: [], pvp: [] };
      map.set(hash, e);
    }
    for (const p of perks) {
      if (isPve && e.pve.length < CAP && !e.pve.includes(p)) e.pve.push(p);
      if (isPvp && e.pvp.length < CAP && !e.pvp.includes(p)) e.pvp.push(p);
    }
  }

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const obj: Record<string, Entry> = {};
  for (const [k, v] of map) obj[k] = v;
  await fs.writeFile(WISHLIST_FILE, JSON.stringify(obj));
  return map;
}

async function getMap(): Promise<Map<number, Entry>> {
  if (memo) return memo;
  if (!building) {
    building = buildMap()
      .then((m) => {
        memo = m;
        return m;
      })
      .finally(() => {
        building = null;
      });
  }
  return building;
}

export interface GodRollPerk {
  hash: number;
  name: string;
  icon: string | null;
}
export interface GodRoll {
  pve: GodRollPerk[];
  pvp: GodRollPerk[];
}

/** God roll voor een wapen-hash, of null als er geen wishlist-entry is. */
export async function getGodRoll(hash: number): Promise<GodRoll | null> {
  const map = await getMap();
  const e = map.get(hash);
  if (!e) return null;

  const all = [...new Set([...e.pve, ...e.pvp])];
  const defs = await lookupItems(all);
  const resolve = (hs: number[]): GodRollPerk[] =>
    hs
      .map((h) => {
        const d = defs.get(h);
        return d ? { hash: h, name: d.name, icon: icon(d.icon) } : null;
      })
      .filter((x): x is GodRollPerk => !!x);

  return { pve: resolve(e.pve), pvp: resolve(e.pvp) };
}
