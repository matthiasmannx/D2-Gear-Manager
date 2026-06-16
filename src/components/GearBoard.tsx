"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface ItemStat {
  name: string;
  value: number;
}
interface Item {
  instanceId?: string;
  hash: number;
  name: string;
  icon: string | null;
  type: string;
  tier: string;
  itemType: number;
  classType: number;
  bucketHash: number;
  power?: number;
  itemLevel?: number;
  energy?: number;
  locked: boolean;
  masterwork: boolean;
  stats: ItemStat[];
  perks: number[];
}
interface Loadout { index: number; name: string; icon: string | null; color: string | null; itemCount: number }
interface Character {
  characterId: string;
  classType: number;
  light: number;
  emblemPath?: string;
  emblemBackground?: string;
  equipped: Item[];
  inventory: Item[];
  postmaster: Item[];
  loadouts: Loadout[];
}
interface GodRollPerk { hash: number; name: string; icon: string | null }
interface Trait { name: string; description: string; icon: string | null }
interface ItemInfo { pve: GodRollPerk[]; pvp: GodRollPerk[]; exoticTrait: Trait | null }

const CLASS_NAMES: Record<number, string> = { 0: "Titan", 1: "Hunter", 2: "Warlock", 3: "Elke class" };
// Equip-slots in volgorde, met label (wapens genummerd 1/2/3).
const SLOTS: { bucket: number; label: string }[] = [
  { bucket: 1498876634, label: "1 · Kinetic" },
  { bucket: 2465295065, label: "2 · Energy" },
  { bucket: 953998645, label: "3 · Power" },
  { bucket: 3448274439, label: "Helm" },
  { bucket: 3551918588, label: "Arms" },
  { bucket: 14239492, label: "Chest" },
  { bucket: 20886954, label: "Legs" },
  { bucket: 1585787867, label: "Class" },
];
const TIER_COLOR: Record<string, string> = {
  Exotic: "#ceae33",
  Legendary: "#b58cf6",
  Rare: "#5076a3",
  Uncommon: "#5b9e4d",
  Common: "#c3bcb4",
};
const BUNGIE = "https://www.bungie.net";
const iconUrl = (i: string | null) => (!i ? null : i.startsWith("http") ? i : BUNGIE + i);

interface DragData {
  hash: number;
  instanceId?: string;
  source: string;
  equipped: boolean;
  name: string;
  icon: string | null;
}

interface TileActions {
  busy: boolean;
  characters: Character[];
  membershipType: number;
  enqueue: (d: DragData, target: string) => void;
  equip: (item: Item, characterId: string) => void;
  toggleLock: (item: Item, source: string, locked: boolean) => void;
  pull: (item: Item, characterId: string) => void;
  setDragging: (v: boolean) => void;
}

function Tile({
  item,
  source,
  equipped,
  context,
  a,
}: {
  item: Item;
  source: string;
  equipped: boolean;
  context: "equipped" | "inventory" | "vault" | "postmaster";
  a: TileActions;
}) {
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [info, setInfo] = useState<ItemInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const border = TIER_COLOR[item.tier] ?? "var(--border)";
  const canAct = !!item.instanceId;
  const otherChars = a.characters.filter((c) => c.characterId !== source);
  const show = hover || pinned;
  const isWeapon = item.itemType === 3;
  const isExotic = item.tier === "Exotic";

  useEffect(() => {
    if (show && (isWeapon || isExotic) && info === null && !loading) {
      setLoading(true);
      fetch(`/api/godrolls/${item.hash}`)
        .then((r) => r.json())
        .then((d) => setInfo({ pve: d.pve ?? [], pvp: d.pvp ?? [], exoticTrait: d.exoticTrait ?? null }))
        .catch(() => setInfo({ pve: [], pvp: [], exoticTrait: null }))
        .finally(() => setLoading(false));
    }
  }, [show, isWeapon, isExotic, info, loading, item.hash]);

  const dragData: DragData = { hash: item.hash, instanceId: item.instanceId, source, equipped, name: item.name, icon: item.icon };

  return (
    <div
      className="gear-tile-wrap"
      style={{ zIndex: pinned ? 200 : hover ? 120 : undefined }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        className={`gear-tile ${item.masterwork ? "is-mw" : ""}`}
        style={{ borderColor: border }}
        draggable={canAct}
        onDragStart={(e) => { e.dataTransfer.setData("application/json", JSON.stringify(dragData)); a.setDragging(true); }}
        onDragEnd={() => a.setDragging(false)}
        onClick={() => setPinned((p) => !p)}
        disabled={a.busy}
      >
        {item.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={iconUrl(item.icon)!} alt={item.name} />
        ) : (
          <div className="gear-tile-empty" />
        )}
        {item.power != null && <span className="gear-power">{item.power}</span>}
        {item.locked && <span className="gear-lock" title="Locked">🔒</span>}
        {item.masterwork && <span className="gear-mw" title="Masterwork">MW</span>}
      </button>

      {show && (
        <div
          className="gear-panel"
          style={{ borderTopColor: border, pointerEvents: pinned ? "auto" : "none" }}
        >
          <div className="gear-panel-head" style={{ background: border }}>
            {item.name}
            {pinned && <span className="gear-panel-close" onClick={(e) => { e.stopPropagation(); setPinned(false); }}>×</span>}
          </div>
          <div className="gear-panel-sub muted">
            {item.tier} · {item.type}{item.classType !== 3 ? ` · ${CLASS_NAMES[item.classType]}` : ""}
          </div>
          {!pinned && canAct && (
            <div className="gear-panel-hint">📌 Klik op het item voor acties</div>
          )}

          <div className="gear-panel-stats">
            {item.power != null && <div className="ih-stat"><span>Power</span><b>{item.power}</b></div>}
            {item.itemLevel != null && <div className="ih-stat"><span>Level</span><b>{item.itemLevel}</b></div>}
            {item.energy != null && <div className="ih-stat"><span>Energie</span><b>{item.energy}</b></div>}
            {(item.locked || item.masterwork) && (
              <div className="ih-stat"><span>Status</span><b>{[item.masterwork && "Masterwork", item.locked && "Locked 🔒"].filter(Boolean).join(", ")}</b></div>
            )}
            {item.stats.slice(0, 8).map((s) => (
              <div key={s.name} className="ih-stat"><span>{s.name}</span><b>{s.value}</b></div>
            ))}
          </div>

          {info?.exoticTrait && (
            <div className="gear-exotic">
              <span className="gear-godroll-h" style={{ color: "#ceae33" }}>Exotic trait</span>
              <div className="gear-exotic-name">
                {info.exoticTrait.icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={iconUrl(info.exoticTrait.icon)!} alt="" />
                )}
                {info.exoticTrait.name}
              </div>
              {info.exoticTrait.description && (
                <p className="gear-exotic-desc">{info.exoticTrait.description}</p>
              )}
            </div>
          )}

          {isWeapon && (
            <div className="gear-godroll">
              <span className="gear-godroll-h">God rolls</span>
              {loading && <span className="muted" style={{ fontSize: "0.76rem" }}>laden…</span>}
              {info && (info.pve.length > 0 || info.pvp.length > 0) && (
                <>
                  {info.pve.length > 0 && <PerkRow label="PvE" perks={info.pve} cls="pve" owned={item.perks} />}
                  {info.pvp.length > 0 && <PerkRow label="PvP" perks={info.pvp} cls="pvp" owned={item.perks} />}
                </>
              )}
              {info && info.pve.length === 0 && info.pvp.length === 0 && (
                <span className="muted" style={{ fontSize: "0.76rem" }}>Geen wishlist-roll bekend.</span>
              )}
              <div className="gear-godroll-links">
                <a className="gear-godroll-btn pve" href={`https://www.light.gg/db/items/${item.hash}/`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>PvE ↗</a>
                <a className="gear-godroll-btn pvp" href={`https://www.light.gg/db/items/${item.hash}/`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>PvP ↗</a>
              </div>
            </div>
          )}

          {context === "postmaster" ? (
            <div className="gear-panel-actions">
              <button onClick={() => a.pull(item, source)} disabled={a.busy}>⤓ Pull naar character</button>
              {canAct && (
                <button className="gear-lock-btn" onClick={() => a.toggleLock(item, source, item.locked)} disabled={a.busy}>
                  {item.locked ? "🔓 Unlock" : "🔒 Lock"}
                </button>
              )}
            </div>
          ) : (
            canAct && (
              <div className="gear-panel-actions">
                {context === "inventory" && <button onClick={() => a.equip(item, source)} disabled={a.busy}>Equip</button>}
                {(context === "inventory" || context === "equipped") && (
                  <button onClick={() => a.enqueue(dragData, "vault")} disabled={equipped}>+ Vault</button>
                )}
                {otherChars.map((c) => (
                  <button key={c.characterId} onClick={() => a.enqueue(dragData, c.characterId)} disabled={equipped}>
                    + {CLASS_NAMES[c.classType]}
                  </button>
                ))}
                <button className="gear-lock-btn" onClick={() => a.toggleLock(item, source, item.locked)} disabled={a.busy}>
                  {item.locked ? "🔓 Unlock" : "🔒 Lock"}
                </button>
              </div>
            )
          )}
          {equipped && <div className="muted" style={{ fontSize: "0.72rem", marginTop: "0.3rem" }}>Uitgerust — equip eerst iets anders om te verplaatsen.</div>}
        </div>
      )}
    </div>
  );
}

function PerkRow({ label, perks, cls, owned }: { label: string; perks: GodRollPerk[]; cls: string; owned: number[] }) {
  const ownedSet = new Set(owned);
  const matches = perks.filter((p) => ownedSet.has(p.hash)).length;
  return (
    <div className="perk-row">
      <span className={`perk-tag ${cls}`}>
        {label}
        {perks.length > 0 && <span className="perk-match"> {matches}/{perks.length} ✓</span>}
      </span>
      <div className="perk-chips">
        {perks.slice(0, 12).map((p) => {
          const has = ownedSet.has(p.hash);
          return (
            <span key={p.hash} className={`perk-chip ${has ? "has" : ""}`}>
              {p.icon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={iconUrl(p.icon)!} alt="" />
              )}
              {p.name}
              {has && <span className="perk-check">✓</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function GearBoard({
  characters,
  vault,
  membershipType,
}: {
  characters: Character[];
  vault: Item[];
  membershipType: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropZone, setDropZone] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // Verversen (handmatig + automatisch elke 10 min)
  const [refreshing, setRefreshing] = useState(false);
  function doRefresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1500);
  }
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [router]);

  // Transfer-wachtrij
  interface QueueItem { key: string; hash: number; instanceId?: string; source: string; target: string; name: string; icon: string | null }
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const targetLabel = (t: string) =>
    t === "vault" ? "Vault" : CLASS_NAMES[characters.find((c) => c.characterId === t)?.classType ?? 3];

  function enqueue(d: DragData, target: string) {
    if (d.source === target) return;
    if (d.equipped) {
      setError("Uitgeruste items kun je niet verplaatsen — equip eerst iets anders.");
      return;
    }
    if (!d.instanceId) return;
    const key = `${d.instanceId}->${target}`;
    setQueue((q) =>
      q.some((x) => x.instanceId === d.instanceId)
        ? q.map((x) => (x.instanceId === d.instanceId ? { ...x, key, target, source: d.source } : x)) // verplaatst doel als al in queue
        : [...q, { key, hash: d.hash, instanceId: d.instanceId, source: d.source, target, name: d.name, icon: d.icon }]
    );
  }

  function dequeue(key: string) {
    setQueue((q) => q.filter((x) => x.key !== key));
  }

  async function processQueue() {
    setProcessing(true);
    setError(null);
    const items = [...queue];
    for (let i = 0; i < items.length; i++) {
      setProgress(i + 1);
      const qi = items[i];
      try {
        const res = await fetch("/api/gear/move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemReferenceHash: qi.hash,
            itemId: qi.instanceId,
            membershipType,
            sourceCharacterId: qi.source === "vault" ? "" : qi.source,
            target: qi.target,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Mislukt");
        setQueue((q) => q.filter((x) => x.key !== qi.key));
      } catch (e: any) {
        setError(`Bij "${qi.name}" → ${targetLabel(qi.target)}: ${e.message}`);
        break;
      }
    }
    setProcessing(false);
    setProgress(0);
    router.refresh();
  }

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "weapon" | "armor">("all");
  const [rarity, setRarity] = useState<"all" | "Exotic" | "Legendary">("all");
  const [mwOnly, setMwOnly] = useState(false);
  const [lockedOnly, setLockedOnly] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE = 60;

  async function postJson(url: string, body: object) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Actie mislukt");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const equipLoadout = (loadoutIndex: number, characterId: string) =>
    postJson("/api/gear/loadout", { loadoutIndex, characterId, membershipType });

  // 1-klik equip op een character (verplaatst zo nodig + equipt, vervangt slot).
  const equipTo = (item: Item, source: string, target: string) => {
    // Is het item uitgerust op de bron-character? Zo ja, zoek een vervanger uit
    // hetzelfde slot zodat we het kunnen de-equippen vóór de transfer.
    let deequipItemId: string | undefined;
    if (source !== "vault" && source !== target) {
      const srcChar = characters.find((c) => c.characterId === source);
      const isEquipped = srcChar?.equipped.some((e) => e.instanceId === item.instanceId);
      if (isEquipped) {
        const repl = srcChar?.inventory.find((x) => x.bucketHash === item.bucketHash && x.instanceId);
        if (!repl) {
          setError(
            `"${item.name}" is uitgerust op ${CLASS_NAMES[srcChar!.classType]} en die guardian heeft geen ander item voor dat slot in z'n inventory. Equip daar eerst iets anders.`
          );
          return;
        }
        deequipItemId = repl.instanceId;
      }
    }
    postJson("/api/gear/equip-to", {
      itemReferenceHash: item.hash,
      itemId: item.instanceId,
      sourceCharacterId: source === "vault" ? "" : source,
      targetCharacterId: target,
      deequipItemId,
      membershipType,
    });
  };

  // Zoeken over álle gear (uitgerust + inventory + vault).
  const [gearQuery, setGearQuery] = useState("");
  const allItems = useMemo(() => {
    const out: { item: Item; source: string; location: string }[] = [];
    for (const c of characters) {
      const cls = CLASS_NAMES[c.classType];
      c.equipped.forEach((i) => out.push({ item: i, source: c.characterId, location: `Uitgerust · ${cls}` }));
      c.inventory.forEach((i) => out.push({ item: i, source: c.characterId, location: `${cls}-inventory` }));
    }
    vault.forEach((i) => out.push({ item: i, source: "vault", location: "Vault" }));
    return out;
  }, [characters, vault]);

  const gearResults = useMemo(() => {
    const q = gearQuery.trim().toLowerCase();
    if (!q) return [];
    return allItems.filter((r) => r.item.name.toLowerCase().includes(q) && r.item.instanceId).slice(0, 40);
  }, [allItems, gearQuery]);

  const actions: TileActions = {
    busy,
    characters,
    membershipType,
    enqueue,
    equip: (item, characterId) => postJson("/api/gear/equip", { itemId: item.instanceId, characterId, membershipType }),
    pull: (item, characterId) =>
      postJson("/api/gear/postmaster", { itemReferenceHash: item.hash, itemId: item.instanceId, characterId, membershipType }),
    setDragging,
    toggleLock: (item, sourceCharacterId, locked) =>
      postJson("/api/gear/lock", {
        itemId: item.instanceId,
        // SetLockState heeft altijd een character-context nodig; voor vault-items
        // valt dat terug op de eerste character.
        characterId:
          sourceCharacterId === "vault" || !sourceCharacterId
            ? characters[0]?.characterId
            : sourceCharacterId,
        membershipType,
        state: !locked,
      }),
  };

  function onDrop(e: React.DragEvent, target: string) {
    e.preventDefault();
    setDropZone(null);
    setDragging(false);
    try {
      const d: DragData = JSON.parse(e.dataTransfer.getData("application/json"));
      enqueue(d, target);
    } catch {
      /* geen drag-data */
    }
  }
  function allowDrop(e: React.DragEvent, zone: string) {
    e.preventDefault();
    setDropZone(zone);
  }

  const filteredVault = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return vault.filter((it) => {
      if (ql && !it.name.toLowerCase().includes(ql)) return false;
      if (typeFilter === "weapon" && it.itemType !== 3) return false;
      if (typeFilter === "armor" && it.itemType !== 2) return false;
      if (rarity !== "all" && it.tier !== rarity) return false;
      if (mwOnly && !it.masterwork) return false;
      if (lockedOnly && !it.locked) return false;
      return true;
    });
  }, [vault, q, typeFilter, rarity, mwOnly, lockedOnly]);

  const pageCount = Math.max(1, Math.ceil(filteredVault.length / PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filteredVault.slice(safePage * PAGE, safePage * PAGE + PAGE);

  return (
    <>
      <div className="gear-toolbar">
        <button className="gear-refresh" onClick={doRefresh} disabled={refreshing}>
          <span className={refreshing ? "spin" : ""}>🔄</span> {refreshing ? "Verversen…" : "Ververs"}
        </button>
        <input
          type="search"
          className="gear-search"
          placeholder="🔎 Zoek in al je gear (klik resultaat om te equippen)…"
          value={gearQuery}
          onChange={(e) => setGearQuery(e.target.value)}
        />
        <span className="muted" style={{ fontSize: "0.78rem" }}>Auto-ververst /10 min</span>
      </div>

      {gearQuery.trim() && (
        <div className="gear-search-results">
          {gearResults.length === 0 ? (
            <div className="muted" style={{ padding: "0.5rem" }}>Geen gear gevonden voor “{gearQuery}”.</div>
          ) : (
            gearResults.map((r, i) => (
              <div key={(r.item.instanceId ?? r.item.hash) + "-" + i} className="gsr-row">
                {r.item.icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={iconUrl(r.item.icon)!} alt="" />
                )}
                <div className="gsr-info">
                  <span className="gsr-name">{r.item.name}{r.item.power != null ? ` · ⚡${r.item.power}` : ""}</span>
                  <span className="muted gsr-loc">{r.location}{r.item.masterwork ? " · MW" : ""}{r.item.locked ? " · 🔒" : ""}</span>
                </div>
                <div className="gsr-actions">
                  {characters.map((c) => (
                    <button key={c.characterId} onClick={() => equipTo(r.item, r.source, c.characterId)} disabled={busy}>
                      Equip → {CLASS_NAMES[c.classType]}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {error && <div className="notice error" style={{ marginTop: "1rem" }}>{error}</div>}
      {busy && <div className="gear-busy">Bezig…</div>}

      {queue.length > 0 && (
        <div className="queue-panel">
          <div className="queue-head">
            <strong>Wachtrij ({queue.length})</strong>
            <button className="queue-clear" onClick={() => setQueue([])} disabled={processing}>Wis</button>
          </div>
          <div className="queue-list">
            {queue.map((qi) => (
              <div key={qi.key} className="queue-item">
                {qi.icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={iconUrl(qi.icon)!} alt="" />
                )}
                <span className="queue-name">{qi.name}</span>
                <span className="queue-arrow">→ {targetLabel(qi.target)}</span>
                <button className="queue-x" onClick={() => dequeue(qi.key)} disabled={processing} title="Verwijder">×</button>
              </div>
            ))}
          </div>
          <button className="queue-go" onClick={processQueue} disabled={processing}>
            {processing ? `Bezig… (${progress}/${queue.length})` : `Verplaats alles (${queue.length})`}
          </button>
        </div>
      )}

      <div className="gear-chars-grid">
      {characters.map((c) => (
        <section
          key={c.characterId}
          className={`gear-char ${dragging ? "drag-target" : ""} ${dropZone === c.characterId ? "drop-over" : ""}`}
          onDragOver={(e) => allowDrop(e, c.characterId)}
          onDragLeave={() => setDropZone(null)}
          onDrop={(e) => onDrop(e, c.characterId)}
        >
          {dragging && (
            <div className="drop-hint">⤵ Sleep hierheen → naar {CLASS_NAMES[c.classType]}-inventory</div>
          )}
          <div className="gear-char-head" style={emblemBg(c.emblemBackground)}>
            <span className="gear-char-class">{CLASS_NAMES[c.classType] ?? "Guardian"}</span>
            <span className="gear-char-power">◆ {c.light}</span>
          </div>

          {c.loadouts.length > 0 && (
            <>
              <div className="gear-label muted">Loadouts</div>
              <div className="loadout-row">
                {c.loadouts.map((lo) => (
                  <button
                    key={lo.index}
                    className="loadout-btn"
                    onClick={() => equipLoadout(lo.index, c.characterId)}
                    disabled={busy}
                    title={`Equip "${lo.name}" (${lo.itemCount} items)`}
                  >
                    {lo.icon && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={iconUrl(lo.icon)!} alt="" style={lo.color ? { background: "transparent" } : undefined} />
                    )}
                    <span>{lo.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="gear-label muted">Uitgerust</div>
          <div className="gear-slots">
            {SLOTS.map((slot) => {
              const it = c.equipped.find((x) => x.bucketHash === slot.bucket);
              return (
                <div key={slot.bucket} className="gear-slot">
                  <span className="gear-slot-label">{slot.label}</span>
                  {it ? (
                    <Tile item={it} source={c.characterId} equipped context="equipped" a={actions} />
                  ) : (
                    <div className="gear-slot-empty" title="Leeg" />
                  )}
                </div>
              );
            })}
          </div>

          {c.inventory.length > 0 && (
            <>
              <div className="gear-label muted">Op character ({c.inventory.length})</div>
              <div className="gear-vault">
                {c.inventory.slice(0, 40).map((it, i) => (
                  <Tile key={(it.instanceId ?? it.hash) + "-" + i} item={it} source={c.characterId} equipped={false} context="inventory" a={actions} />
                ))}
              </div>
            </>
          )}

          {c.postmaster.length > 0 && (
            <>
              <div className="gear-label muted">📭 Postmaster ({c.postmaster.length}) — klik voor god-roll & pull</div>
              <div className="gear-vault">
                {c.postmaster.map((it, i) => (
                  <Tile key={(it.instanceId ?? it.hash) + "-pm-" + i} item={it} source={c.characterId} equipped={false} context="postmaster" a={actions} />
                ))}
              </div>
            </>
          )}
        </section>
      ))}
      </div>

      <section
        className={`gear-char ${dragging ? "drag-target" : ""} ${dropZone === "vault" ? "drop-over" : ""}`}
        style={{ marginTop: "2rem" }}
        onDragOver={(e) => allowDrop(e, "vault")}
        onDragLeave={() => setDropZone(null)}
        onDrop={(e) => onDrop(e, "vault")}
      >
        {dragging && <div className="drop-hint">⤵ Sleep hierheen → naar de Vault</div>}
        <div className="gear-char-head">
          <span className="gear-char-class">Vault</span>
          <span className="muted">{filteredVault.length} / {vault.length} items</span>
        </div>

        <div className="vault-controls">
          <input type="search" placeholder="Zoek in vault…" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} style={{ flex: 1, minWidth: 160 }} />
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as any); setPage(0); }}>
            <option value="all">Alle types</option>
            <option value="weapon">Wapens</option>
            <option value="armor">Armor</option>
          </select>
          <select value={rarity} onChange={(e) => { setRarity(e.target.value as any); setPage(0); }}>
            <option value="all">Alle rarities</option>
            <option value="Exotic">Exotic</option>
            <option value="Legendary">Legendary</option>
          </select>
          <label className="vault-toggle"><input type="checkbox" checked={mwOnly} onChange={(e) => { setMwOnly(e.target.checked); setPage(0); }} /> MW</label>
          <label className="vault-toggle"><input type="checkbox" checked={lockedOnly} onChange={(e) => { setLockedOnly(e.target.checked); setPage(0); }} /> 🔒</label>
        </div>

        {pageItems.length === 0 ? (
          <div className="gear-label muted">Geen items die aan de filters voldoen.</div>
        ) : (
          <div className="gear-vault">
            {pageItems.map((it, i) => (
              <Tile key={(it.instanceId ?? it.hash) + "-" + i} item={it} source="vault" equipped={false} context="vault" a={actions} />
            ))}
          </div>
        )}

        {pageCount > 1 && (
          <div className="vault-pager">
            <button onClick={() => setPage(Math.max(0, safePage - 1))} disabled={safePage === 0}>← Vorige</button>
            <span className="muted">Pagina {safePage + 1} / {pageCount}</span>
            <button onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))} disabled={safePage >= pageCount - 1}>Volgende →</button>
          </div>
        )}
      </section>
    </>
  );
}

function emblemBg(path?: string): React.CSSProperties {
  if (!path) return {};
  const url = iconUrl(path);
  return {
    backgroundImage: `linear-gradient(90deg, rgba(10,12,18,0.15) 55%, rgba(10,12,18,0.8) 92%), url(${url})`,
    backgroundSize: "cover, cover",
    backgroundRepeat: "no-repeat, no-repeat",
    backgroundPosition: "center, center",
  };
}
