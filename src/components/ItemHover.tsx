"use client";

import { useState } from "react";

export interface HoverItem {
  name: string;
  icon: string | null;
  type: string;
  tier: string;
  description?: string;
  flavor?: string;
}

const TIER_COLOR: Record<string, string> = {
  Exotic: "#ceae33",
  Legendary: "#b58cf6",
  Rare: "#5076a3",
  Uncommon: "#5b9e4d",
  Common: "#c3bcb4",
};

/**
 * Een Destiny-stijl item-tile die bij hover een tooltip toont met de echte
 * manifest-info (icoon, naam, type, omschrijving, flavor).
 */
export default function ItemHover({
  item,
  label,
  size = 48,
}: {
  item: HoverItem;
  label?: string;
  size?: number;
}) {
  const [hover, setHover] = useState(false);
  const color = TIER_COLOR[item.tier] ?? "var(--border)";

  return (
    <div
      className="ih-wrap"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="ih-row">
        <div className="ih-icon" style={{ width: size, height: size, borderColor: color }}>
          {item.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.icon} alt={item.name} />
          ) : null}
        </div>
        <div className="ih-meta">
          {label && <div className="ih-label">{label}</div>}
          <div className="ih-name" style={{ color }}>{item.name}</div>
          <div className="ih-type muted">{item.tier} {item.type}</div>
        </div>
      </div>

      {hover && (item.description || item.flavor) && (
        <div className="ih-tip" style={{ borderTopColor: color }}>
          <div className="ih-tip-head" style={{ background: color }}>
            <span>{item.name}</span>
          </div>
          <div className="ih-tip-sub muted">{item.tier} · {item.type}</div>
          {item.description && <p className="ih-tip-desc">{item.description}</p>}
          {item.flavor && <p className="ih-tip-flavor">“{item.flavor}”</p>}
        </div>
      )}
    </div>
  );
}
