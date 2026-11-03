import "server-only";
import fs from "fs/promises";
import path from "path";
import { icon } from "./bungie";

export interface PlugEntry {
  hash: number;
  name: string;
  icon: string | null;
  cat: string;
  el: string | null;
  type: string;
}

const FILE = path.join(process.cwd(), "data", "plug-index.json");
let memo: PlugEntry[] | null = null;

async function load(): Promise<PlugEntry[]> {
  if (memo) return memo;
  try {
    const raw = await fs.readFile(FILE, "utf8");
    memo = (JSON.parse(raw).plugs ?? []) as PlugEntry[];
  } catch {
    memo = [];
  }
  return memo;
}

/** Zoek plugs op naam, optioneel gefilterd op categorie (en element). */
export async function searchPlugs(cat: string | null, q: string, el: string | null = null, limit = 12): Promise<{ hash: number; name: string; icon: string | null; type: string }[]> {
  const all = await load();
  const ql = q.trim().toLowerCase();
  if (ql.length < 2) return [];
  let pool = cat ? all.filter((p) => p.cat === cat) : all;
  if (el) pool = pool.filter((p) => !p.el || p.el === el);
  const hits = pool.filter((p) => p.name.toLowerCase().includes(ql));
  hits.sort((a, b) => {
    const aw = a.name.toLowerCase().startsWith(ql) ? 0 : 1;
    const bw = b.name.toLowerCase().startsWith(ql) ? 0 : 1;
    return aw - bw || a.name.length - b.name.length;
  });
  const seen = new Set<string>();
  const out: { hash: number; name: string; icon: string | null; type: string }[] = [];
  for (const p of hits) {
    if (seen.has(p.name)) continue; // dubbele namen samenvouwen
    seen.add(p.name);
    out.push({ hash: p.hash, name: p.name, icon: icon(p.icon), type: p.type });
    if (out.length >= limit) break;
  }
  return out;
}
