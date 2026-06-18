// Bouwt data/wishlist.json uit de DIM community-wishlist (voltron). Per wapen-
// hash een lijst aanbevolen perk-combinaties (god rolls). Run lokaal of in de
// cloud-routine:  node scripts/build-wishlist.mjs
import fs from "node:fs/promises";

const URL = "https://raw.githubusercontent.com/48klocs/dim-wish-list-sources/master/voltron.txt";

console.log("Wishlist downloaden...");
const res = await fetch(URL);
if (!res.ok) throw new Error(`Download mislukt (HTTP ${res.status}).`);
const text = await res.text();

const map = {}; // itemHash -> Set van "csv perk-combo" (string) voor dedup
let lines = 0;
for (const line of text.split("\n")) {
  if (!line.startsWith("dimwishlist:item=")) continue;
  const item = line.match(/item=(-?\d+)/);
  const perks = line.match(/perks=([\d,]+)/);
  if (!item || !perks) continue;
  const hash = Number(item[1]);
  if (hash < 0) continue; // negatieve hash = trash-roll, overslaan
  const combo = perks[1].split(",").map(Number).filter(Boolean);
  if (combo.length === 0) continue;
  lines++;
  (map[hash] ??= new Set()).add(combo.sort((a, b) => a - b).join(","));
}

// Set -> array van number-arrays
const out = {};
let combos = 0;
for (const hash in map) {
  out[hash] = [...map[hash]].map((s) => s.split(",").map(Number));
  combos += out[hash].length;
}

await fs.writeFile("data/wishlist.json", JSON.stringify(out));
console.log(`Klaar: ${Object.keys(out).length} wapens, ${combos} unieke god-roll-combo's (${lines} regels) -> data/wishlist.json`);
