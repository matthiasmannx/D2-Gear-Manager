"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Countdown from "./Countdown";

export interface MilestoneView {
  hash: number;
  name: string;
  icon: string | null;
  description: string;
  endDate?: string;
  order: number;
  activity?: string; // naam van de te spelen activiteit
  power?: number; // aanbevolen power level
  banner?: string; // pgcrImage van de activity
  loot: { hash: number; name: string; icon: string | null }[]; // mogelijke drops
  group?: "raid" | "dungeon" | "weekly";
  rewardLabel?: string; // generiek label als er geen concrete loot bekend is
}

export default function MilestoneBoard({ milestones }: { milestones: MilestoneView[] }) {
  const t = useTranslations("events");
  const [open, setOpen] = useState<number | null>(null);

  const list = [...milestones].sort((a, b) => a.order - b.order);

  // De meeste milestones eindigen bij dezelfde wekelijkse reset → toon die teller
  // één keer bovenaan i.p.v. dezelfde aftelling op elke kaart.
  const freq = new Map<string, number>();
  for (const m of list) if (m.endDate) freq.set(m.endDate, (freq.get(m.endDate) ?? 0) + 1);
  let commonEnd: string | undefined;
  let best = 1;
  for (const [d, n] of freq) if (n > best) { best = n; commonEnd = d; }

  const groups: { key: "raid" | "dungeon" | "weekly"; label: string }[] = [
    { key: "raid", label: t("groupRaids") },
    { key: "dungeon", label: t("groupDungeons") },
    { key: "weekly", label: t("groupWeekly") },
  ];

  function renderCard(m: MilestoneView) {
    const expanded = open === m.hash;
    // Alleen een eigen eindtijd tonen als die afwijkt van de gezamenlijke reset.
    const showEnd = m.endDate && m.endDate !== commonEnd;
    return (
      <div key={m.hash} className={`card ms-card ${expanded ? "open" : ""}`}>
        <button className="ms-toggle" onClick={() => setOpen(expanded ? null : m.hash)}>
          {m.icon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="item-icon" src={m.icon} alt="" />
          )}
          <div className="ms-toggle-info">
            <div className="item-name">{m.name}</div>
            {showEnd && (
              <div className="item-type">
                {t("endsIn")} <Countdown to={m.endDate!} />
              </div>
            )}
          </div>
          <span className="ms-chevron">{expanded ? "▾" : "▸"}</span>
        </button>

        {expanded && (
          <div className="ms-detail">
            {m.banner && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="ms-banner" src={m.banner} alt="" />
            )}

            {m.activity && (
              <div className="ms-meta">
                <span className="muted">{t("doLabel")} </span>
                {m.activity}
                {m.power ? ` · ⚡${m.power}` : ""}
              </div>
            )}

            {m.loot.length > 0 ? (
              <div className="ms-loot-wrap">
                <span className="muted ms-loot-h">{t("lootLabel")}</span>
                <div className="ms-loot">
                  {m.loot.map((it) => (
                    <Link key={it.hash} href={`/items/${it.hash}`} className="ms-loot-item" title={it.name}>
                      {it.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.icon} alt="" />
                      ) : (
                        <span className="ms-loot-noicon" />
                      )}
                      <span className="ms-loot-name">{it.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              m.rewardLabel && (
                <div className="ms-meta">
                  <span className="muted">{t("lootLabel")} </span>
                  {m.rewardLabel}
                </div>
              )
            )}

            {m.description && <p className="muted ms-desc">{m.description}</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {commonEnd && (
        <div className="ms-reset muted">
          {t("resetsIn")} <Countdown to={commonEnd} />
        </div>
      )}

      {groups.map((g) => {
        const items = list.filter((m) => (m.group ?? "weekly") === g.key);
        if (items.length === 0) return null;
        return (
          <section key={g.key} className="ms-group">
            <h3 className="ms-group-h">{g.label} <span className="muted">({items.length})</span></h3>
            <div className="section-list">{items.map(renderCard)}</div>
          </section>
        );
      })}
    </>
  );
}
