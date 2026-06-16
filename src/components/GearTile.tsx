"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface TileItem {
  instanceId?: string;
  hash: number;
  name: string;
  icon: string | null;
  type: string;
  tier: string;
  power?: number;
}

export interface CharTarget {
  characterId: string;
  label: string;
}

const TIER_COLOR: Record<string, string> = {
  Exotic: "#ceae33",
  Legendary: "#522f65",
  Rare: "#5076a3",
  Uncommon: "#366f42",
  Common: "#c3bcb4",
};

export default function GearTile({
  item,
  context,
  characterId,
  membershipType,
  targets,
}: {
  item: TileItem;
  context: "equipped" | "inventory" | "vault";
  characterId: string; // huidige character (of "" voor vault)
  membershipType: number;
  targets: CharTarget[]; // andere characters om naar te sturen
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(url: string, body: object) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Actie mislukt");
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const toVault = () =>
    call("/api/gear/transfer", {
      itemReferenceHash: item.hash,
      itemId: item.instanceId,
      characterId,
      membershipType,
      transferToVault: true,
    });

  const toCharacter = (target: string) =>
    call("/api/gear/transfer", {
      itemReferenceHash: item.hash,
      itemId: item.instanceId,
      characterId: target,
      membershipType,
      transferToVault: false,
    });

  const equip = () =>
    call("/api/gear/equip", {
      itemId: item.instanceId,
      characterId,
      membershipType,
    });

  const border = TIER_COLOR[item.tier] ?? "var(--border)";
  const canAct = !!item.instanceId;

  return (
    <div className="gear-tile-wrap">
      <button
        className="gear-tile"
        style={{ borderColor: border }}
        onClick={() => canAct && setOpen((v) => !v)}
        title={`${item.name}${item.power ? ` · ${item.power}` : ""}`}
        disabled={busy}
      >
        {item.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.icon} alt={item.name} />
        ) : (
          <div className="gear-tile-empty" />
        )}
        {item.power != null && <span className="gear-power">{item.power}</span>}
        {busy && <span className="gear-spinner">…</span>}
      </button>

      {open && (
        <div className="gear-pop" onMouseLeave={() => setOpen(false)}>
          <div className="gear-pop-name" style={{ color: border === "var(--border)" ? "var(--text)" : border }}>
            {item.name}
          </div>
          <div className="gear-pop-type muted">
            {item.tier} {item.type}
          </div>
          <div className="gear-pop-actions">
            {context === "inventory" && (
              <button onClick={equip} disabled={busy}>Equip</button>
            )}
            {(context === "inventory" || context === "equipped") && (
              <button onClick={toVault} disabled={busy}>→ Vault</button>
            )}
            {context === "vault" &&
              targets.map((t) => (
                <button key={t.characterId} onClick={() => toCharacter(t.characterId)} disabled={busy}>
                  → {t.label}
                </button>
              ))}
          </div>
          {context === "equipped" && (
            <div className="muted" style={{ fontSize: "0.72rem" }}>
              Uitgerust — naar vault stuurt het direct weg.
            </div>
          )}
          {error && <div className="gear-pop-err">{error}</div>}
        </div>
      )}
    </div>
  );
}
