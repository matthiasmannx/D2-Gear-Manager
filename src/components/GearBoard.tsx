"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

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
interface Loadout { index: number; name: string; icon: string | null; color: string | null; itemCount: number; active: boolean }
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
interface Trait { name: string; description: string; icon: string | null }
interface ItemInfo { exoticTrait: Trait | null }

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
  bucketHash: number;
}

interface TileActions {
  busy: boolean;
  dragging: boolean;
  characters: Character[];
  membershipType: number;
  enqueue: (d: DragData, target: string) => void;
  equip: (item: Item, characterId: string) => void;
  moveEquipped: (item: Item, source: string, target: string) => void;
  toggleLock: (item: Item, source: string, locked: boolean) => void;
  pull: (item: Item, characterId: string) => void;
  setDragging: (v: boolean) => void;
  setDraggingBucket: (v: number | null) => void;
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
  const [flipUp, setFlipUp] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("gear");
  const border = TIER_COLOR[item.tier] ?? "var(--border)";
  const canAct = !!item.instanceId;
  const otherChars = a.characters.filter((c) => c.characterId !== source);
  // Tijdens slepen alle panelen verbergen zodat ze de drop-plekken niet blokkeren.
  const show = (hover || pinned) && !a.dragging;
  const isWeapon = item.itemType === 3;
  const isExotic = item.tier === "Exotic";

  useEffect(() => {
    if (show && (isWeapon || isExotic) && info === null && !loading) {
      setLoading(true);
      fetch(`/api/godrolls/${item.hash}`)
        .then((r) => r.json())
        .then((d) => setInfo({ exoticTrait: d.exoticTrait ?? null }))
        .catch(() => setInfo({ exoticTrait: null }))
        .finally(() => setLoading(false));
    }
  }, [show, isWeapon, isExotic, info, loading, item.hash]);

  const dragData: DragData = { hash: item.hash, instanceId: item.instanceId, source, equipped, name: item.name, icon: item.icon, bucketHash: item.bucketHash };

  return (
    <div
      ref={wrapRef}
      className="gear-tile-wrap"
      style={{ zIndex: pinned ? 200 : hover ? 120 : undefined }}
      onMouseEnter={() => {
        // Bepaal vóór het tonen of het paneel naar boven moet openen, zodat het
        // niet buiten beeld valt (voorkomt flikker onderaan de pagina).
        const r = wrapRef.current?.getBoundingClientRect();
        if (r) setFlipUp(window.innerHeight - r.bottom < 380);
        setHover(true);
      }}
      onMouseLeave={() => setHover(false)}
    >
      <button
        className={`gear-tile ${item.masterwork ? "is-mw" : ""}`}
        style={{ borderColor: border }}
        draggable={canAct}
        onDragStart={(e) => { e.dataTransfer.setData("application/json", JSON.stringify(dragData)); a.setDragging(true); a.setDraggingBucket(item.bucketHash); }}
        onDragEnd={() => { a.setDragging(false); a.setDraggingBucket(null); }}
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
          style={{
            borderTopColor: border,
            pointerEvents: pinned ? "auto" : "none",
            ...(flipUp ? { top: "auto", bottom: "calc(100% + 4px)" } : {}),
          }}
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
              <div className="gear-godroll-links">
                <a className="gear-godroll-btn pve" href={`https://www.light.gg/db/items/${item.hash}/`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>light.gg ↗</a>
              </div>
            </div>
          )}

          {context === "postmaster" ? (
            <div className="gear-panel-actions">
              <button onClick={() => a.pull(item, source)} disabled={a.busy}>⤓ {t("pull")}</button>
              {canAct && (
                <button className="gear-lock-btn" onClick={() => a.toggleLock(item, source, item.locked)} disabled={a.busy}>
                  {item.locked ? `🔓 ${t("unlock")}` : `🔒 ${t("lock")}`}
                </button>
              )}
            </div>
          ) : (
            canAct && (
              <div className="gear-panel-actions">
                {context === "inventory" && <button onClick={() => a.equip(item, source)} disabled={a.busy}>{t("equip")}</button>}
                {(context === "inventory" || context === "equipped") && (
                  <button
                    onClick={() => (equipped ? a.moveEquipped(item, source, "vault") : a.enqueue(dragData, "vault"))}
                    disabled={a.busy}
                  >
                    + {t("vault")}
                  </button>
                )}
                {otherChars.map((c) => (
                  <button
                    key={c.characterId}
                    onClick={() => (equipped ? a.moveEquipped(item, source, c.characterId) : a.enqueue(dragData, c.characterId))}
                    disabled={a.busy}
                  >
                    + {CLASS_NAMES[c.classType]}
                  </button>
                ))}
                <button className="gear-lock-btn" onClick={() => a.toggleLock(item, source, item.locked)} disabled={a.busy}>
                  {item.locked ? `🔓 ${t("unlock")}` : `🔒 ${t("lock")}`}
                </button>
              </div>
            )
          )}
          {equipped && (
            <div className="muted" style={{ fontSize: "0.72rem", marginTop: "0.3rem" }}>
              {t("equippedNote")}
            </div>
          )}
        </div>
      )}
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
  const t = useTranslations("gear");
  const router = useRouter();
  // Direct verversen + nogmaals na 5s, omdat Bungie's profiel-data soms even
  // achterloopt na een transfer/equip.
  const refreshSoon = () => {
    router.refresh();
    setTimeout(() => router.refresh(), 5000);
  };
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropZone, setDropZone] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  // bucketHash van het item dat nu gesleept wordt (om passende slots te kleuren)
  const [draggingBucket, setDraggingBucket] = useState<number | null>(null);

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

  const targetLabel = (tg: string) =>
    tg === "vault" ? t("vault") : CLASS_NAMES[characters.find((c) => c.characterId === tg)?.classType ?? 3];

  function enqueue(d: DragData, target: string) {
    if (d.source === target) return;
    if (d.equipped) {
      setError(t("cannotMoveEquipped"));
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
        if (!res.ok) throw new Error(data.error ?? t("failed"));
        setQueue((q) => q.filter((x) => x.key !== qi.key));
      } catch (e: any) {
        setError(`${qi.name} → ${targetLabel(qi.target)}: ${e.message}`);
        break;
      }
    }
    setProcessing(false);
    setProgress(0);
    refreshSoon();
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
      if (!res.ok) throw new Error(data.error ?? t("actionFailed"));
      refreshSoon();
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
          setError(t("noReplacement", { name: item.name, who: CLASS_NAMES[srcChar!.classType] }));
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

  // Een uitgerust item verplaatsen naar vault/andere guardian: eerst een ander
  // item uit hetzelfde slot equippen (de-equip), dán pas verplaatsen.
  async function moveEquipped(item: Item, source: string, target: string) {
    if (source === target) return;
    const srcChar = characters.find((c) => c.characterId === source);
    const repl = srcChar?.inventory.find((x) => x.bucketHash === item.bucketHash && x.instanceId);
    if (!repl) {
      setError(t("noReplacement", { name: item.name, who: srcChar ? CLASS_NAMES[srcChar.classType] : t("anyClass") }));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let res = await fetch("/api/gear/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: repl.instanceId, characterId: source, membershipType }),
      });
      let data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("deequipFailed"));
      res = await fetch("/api/gear/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemReferenceHash: item.hash,
          itemId: item.instanceId,
          membershipType,
          sourceCharacterId: source,
          target,
        }),
      });
      data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("moveFailed"));
      refreshSoon();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // Zoeken over álle gear (uitgerust + inventory + vault).
  const [gearQuery, setGearQuery] = useState("");
  const allItems = useMemo(() => {
    const out: { item: Item; source: string; location: string }[] = [];
    for (const c of characters) {
      const cls = CLASS_NAMES[c.classType];
      c.equipped.forEach((i) => out.push({ item: i, source: c.characterId, location: t("locEquipped", { cls }) }));
      c.inventory.forEach((i) => out.push({ item: i, source: c.characterId, location: t("locInventory", { cls }) }));
    }
    vault.forEach((i) => out.push({ item: i, source: "vault", location: t("vault") }));
    return out;
  }, [characters, vault, t]);

  const gearResults = useMemo(() => {
    const q = gearQuery.trim().toLowerCase();
    if (!q) return [];
    return allItems.filter((r) => r.item.name.toLowerCase().includes(q) && r.item.instanceId).slice(0, 40);
  }, [allItems, gearQuery]);

  const actions: TileActions = {
    busy,
    dragging,
    characters,
    membershipType,
    enqueue,
    moveEquipped,
    equip: (item, characterId) => postJson("/api/gear/equip", { itemId: item.instanceId, characterId, membershipType }),
    pull: (item, characterId) =>
      postJson("/api/gear/postmaster", { itemReferenceHash: item.hash, itemId: item.instanceId, characterId, membershipType }),
    setDragging,
    setDraggingBucket,
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
    setDraggingBucket(null);
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

  // Sleep op een equip-slot → equip dat item op die guardian (auto-de-equip
  // via equipTo). Stopt bubbling zodat de kaart-drop (inventory) niet ook vuurt.
  function onDropSlot(e: React.DragEvent, characterId: string, slotBucket: number) {
    e.preventDefault();
    e.stopPropagation();
    setDropZone(null);
    setDragging(false);
    setDraggingBucket(null);
    try {
      const d: DragData = JSON.parse(e.dataTransfer.getData("application/json"));
      if (d.bucketHash !== slotBucket) {
        setError(t("slotNotFit"));
        return;
      }
      if (d.source === characterId && d.equipped) return; // al uitgerust hier
      equipTo({ hash: d.hash, instanceId: d.instanceId, bucketHash: d.bucketHash, name: d.name } as Item, d.source, characterId);
    } catch {
      /* geen drag-data */
    }
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
        <button className="gear-refresh" onClick={doRefresh} disabled={refreshing} title={t("refreshTitle")}>
          <span className={refreshing ? "spin" : ""}>🔄</span> {refreshing ? t("refreshing") : t("refresh")}
        </button>
        <input
          type="search"
          className="gear-search"
          placeholder={t("searchPlaceholder")}
          value={gearQuery}
          onChange={(e) => setGearQuery(e.target.value)}
        />
      </div>

      {gearQuery.trim() && (
        <div className="gear-search-results">
          {gearResults.length === 0 ? (
            <div className="muted" style={{ padding: "0.5rem" }}>{t("noGearFound", { query: gearQuery })}</div>
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
                      {t("equipToChar", { cls: CLASS_NAMES[c.classType] })}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {error && <div className="notice error" style={{ marginTop: "1rem" }}>{error}</div>}
      {busy && <div className="gear-busy">{t("busy")}</div>}

      {queue.length > 0 && (
        <div className="queue-panel">
          <div className="queue-head">
            <strong>{t("queue", { n: queue.length })}</strong>
            <button className="queue-clear" onClick={() => setQueue([])} disabled={processing}>{t("clear")}</button>
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
                <button className="queue-x" onClick={() => dequeue(qi.key)} disabled={processing} title={t("remove")}>×</button>
              </div>
            ))}
          </div>
          <button className="queue-go" onClick={processQueue} disabled={processing}>
            {processing ? t("processing", { progress, total: queue.length }) : t("moveAll", { n: queue.length })}
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
            <div className="drop-hint">⤵ {t("dropChar", { cls: CLASS_NAMES[c.classType] })}</div>
          )}
          {/* rij 1: banner */}
          <div className="gear-char-head" style={emblemBg(c.emblemBackground)}>
            <span className="gear-char-class">{CLASS_NAMES[c.classType] ?? "Guardian"}</span>
            <span className="gear-char-power">◆ {c.light}</span>
          </div>

          {/* rij 2: loadouts */}
          <div className="gc-row">
            <span className="gear-sublabel">{t("loadouts")}</span>
            <div className="loadout-row">
              {c.loadouts.length > 0 ? (
                c.loadouts.map((lo) => (
                  <button
                    key={lo.index}
                    className={`loadout-btn ${lo.active ? "active" : ""}`}
                    onClick={() => equipLoadout(lo.index, c.characterId)}
                    disabled={busy}
                    title={t(lo.active ? "loadoutTitleActive" : "loadoutTitle", { name: lo.name, n: lo.itemCount })}
                  >
                    {lo.icon && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={iconUrl(lo.icon)!} alt="" style={lo.color ? { background: "transparent" } : undefined} />
                    )}
                    <span>{lo.name}</span>
                  </button>
                ))
              ) : (
                <span className="loadout-empty muted">{t("noLoadouts")}</span>
              )}
            </div>
          </div>

          {/* rij 3: uitgerust */}
          <div className="gc-row">
            <span className="gear-sublabel">{t("equipped")}</span>
            <div className="gear-slots">
              {SLOTS.map((slot) => {
                const it = c.equipped.find((x) => x.bucketHash === slot.bucket);
                const slotKey = `slot-${c.characterId}-${slot.bucket}`;
                const fits = draggingBucket === null || draggingBucket === slot.bucket;
                const fitClass = !dragging ? "" : fits ? "slot-ok" : "slot-bad";
                return (
                  <div
                    key={slot.bucket}
                    className={`gear-slot ${fitClass} ${dropZone === slotKey && fits ? "drop-over" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDropZone(slotKey); }}
                    onDragLeave={() => setDropZone(null)}
                    onDrop={(e) => onDropSlot(e, c.characterId, slot.bucket)}
                  >
                    <span className="gear-slot-label">{slot.label}</span>
                    {it ? (
                      <Tile item={it} source={c.characterId} equipped context="equipped" a={actions} />
                    ) : (
                      <div className="gear-slot-empty" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* rij 4: "op character"-kop */}
          <div className="gc-row gc-invhead">
            <span className="gear-sublabel">{t("onCharacter", { n: c.inventory.length })}</span>
          </div>

          {/* rij 5-12: één rij per slot (subgrid lijnt ze uit over de guardians) */}
          {SLOTS.map((slot) => {
            const items = c.inventory.filter((it) => it.bucketHash === slot.bucket);
            return (
              <div key={slot.bucket} className="gc-row gc-invslot">
                <span className="gear-sublabel">{slot.label}</span>
                <div className="gear-vault gc-items">
                  {items.length > 0 ? (
                    items.map((it, i) => (
                      <Tile key={(it.instanceId ?? it.hash) + "-" + i} item={it} source={c.characterId} equipped={false} context="inventory" a={actions} />
                    ))
                  ) : (
                    <span className="inv-empty">—</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* rij 13: postmaster */}
          <div className="gc-row gc-postmaster">
            {c.postmaster.length > 0 ? (
              <>
                <span className="gear-sublabel">📭 {t("postmaster", { n: c.postmaster.length })}</span>
                <div className="gear-vault gc-items">
                  {c.postmaster.map((it, i) => (
                    <Tile key={(it.instanceId ?? it.hash) + "-pm-" + i} item={it} source={c.characterId} equipped={false} context="postmaster" a={actions} />
                  ))}
                </div>
              </>
            ) : (
              <span className="gear-sublabel muted">📭 {t("postmasterEmpty")}</span>
            )}
          </div>
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
        {dragging && <div className="drop-hint">⤵ {t("dropVault")}</div>}
        <div className="gear-char-head">
          <span className="gear-char-class">{t("vault")}</span>
          <span className="muted">{t("vaultItems", { shown: filteredVault.length, total: vault.length })}</span>
        </div>

        <div className="vault-controls">
          <input type="search" placeholder={t("vaultSearch")} value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} style={{ flex: 1, minWidth: 160 }} />
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as any); setPage(0); }}>
            <option value="all">{t("allTypes")}</option>
            <option value="weapon">{t("weapons")}</option>
            <option value="armor">{t("armor")}</option>
          </select>
          <select value={rarity} onChange={(e) => { setRarity(e.target.value as any); setPage(0); }}>
            <option value="all">{t("allRarities")}</option>
            <option value="Exotic">{t("exotic")}</option>
            <option value="Legendary">{t("legendary")}</option>
          </select>
          <label className="vault-toggle"><input type="checkbox" checked={mwOnly} onChange={(e) => { setMwOnly(e.target.checked); setPage(0); }} /> MW</label>
          <label className="vault-toggle"><input type="checkbox" checked={lockedOnly} onChange={(e) => { setLockedOnly(e.target.checked); setPage(0); }} /> 🔒</label>
        </div>

        {pageItems.length === 0 ? (
          <div className="gear-label muted">{t("noFilterMatch")}</div>
        ) : (
          <div className="gear-vault">
            {pageItems.map((it, i) => (
              <Tile key={(it.instanceId ?? it.hash) + "-" + i} item={it} source="vault" equipped={false} context="vault" a={actions} />
            ))}
          </div>
        )}

        {pageCount > 1 && (
          <div className="vault-pager">
            <button onClick={() => setPage(Math.max(0, safePage - 1))} disabled={safePage === 0}>{t("prev")}</button>
            <span className="muted">{t("page", { n: safePage + 1, total: pageCount })}</span>
            <button onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))} disabled={safePage >= pageCount - 1}>{t("next")}</button>
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
    backgroundImage: `linear-gradient(90deg, rgba(10,12,18,0.8) 0%, rgba(10,12,18,0.15) 32%, rgba(10,12,18,0.15) 60%, rgba(10,12,18,0.85) 100%), url(${url})`,
    backgroundSize: "cover, cover",
    backgroundRepeat: "no-repeat, no-repeat",
    backgroundPosition: "center, center",
  };
}
