// Bouwt data/wishlist.json uit de DIM community-wishlist (voltron). Per wapen-
// hash een lijst aanbevolen perk-combinaties met PvE/PvP-tag. Run lokaal of in
// de cloud-routine:  node scripts/build-wishlist.mjs
// Structuur: { "<itemHash>": [ { "p": [plugHash,...], "t": 0|1|2 } ] }
//   t: 0 = algemeen/onbekend, 1 = PvE, 2 = PvP
import fs from "node:fs/promises";

const URL = "https://raw.githubusercontent.com/48klocs/dim-wish-list-sources/master/voltron.txt";

function tagOf(s) {
  s = s.toLowerCase();
  const pve = /\bpve\b|raid|nightfall|\bgm\b|grandmaster|pinnacle|dungeon|ad ?clear|boss|dps/.test(s);
  const pvp = /\bpvp\b|crucible|trials|controlled|\bcomp\b|elimination|6v6|3v3/.test(s);
  if (pve && !pvp) return 1;
  if (pvp && !pve) return 2;
  return 0;
}

console.log("Wishlist downloaden...");
const res = await fetch(URL);
if (!res.ok) throw new Error(`Download mislukt (HTTP ${res.status}).`);
const text = await res.text();

const map = {}; // hash -> Map<comboKey, tag>
let curTag = 0;
let lines = 0;
for (const line of text.split("\n")) {
  if (line.startsWith("//")) { curTag = tagOf(line); continue; }
  if (!line.startsWith("dimwishlist:item=")) continue;
  const item = line.match(/item=(-?\d+)/);
  const perks = line.match(/perks=([\d,]+)/);
  if (!item || !perks) continue;
  const hash = Number(item[1]);
  if (hash < 0) continue; // trash-roll
  const combo = perks[1].split(",").map(Number).filter(Boolean);
  if (combo.length === 0) continue;
  lines++;
  const tag = tagOf(line) || curTag;
  const key = combo.sort((a, b) => a - b).join(",");
  const m = (map[hash] ??= new Map());
  // Combineer tags: als dezelfde combo zowel PvE als PvP is -> algemeen (0).
  if (m.has(key)) { if (m.get(key) !== tag) m.set(key, 0); }
  else m.set(key, tag);
}

const out = {};
let combos = 0;
for (const hash in map) {
  out[hash] = [...map[hash].entries()].map(([k, t]) => ({ p: k.split(",").map(Number), t }));
  combos += out[hash].length;
}

await fs.writeFile("data/wishlist.json", JSON.stringify(out));
const byTag = { general: 0, pve: 0, pvp: 0 };
for (const h in out) for (const r of out[h]) byTag[r.t === 1 ? "pve" : r.t === 2 ? "pvp" : "general"]++;
console.log(`Klaar: ${Object.keys(out).length} wapens, ${combos} combo's (${lines} regels) -> data/wishlist.json`);
console.log(byTag);
