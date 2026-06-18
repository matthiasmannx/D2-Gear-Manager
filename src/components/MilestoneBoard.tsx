"use client";

import { useMemo, useState } from "react";
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
  rewardLabel?: string; // generiek label als er geen concrete loot bekend is
}

export default function MilestoneBoard({ milestones }: { milestones: MilestoneView[] }) {
  const t = useTranslations("events");
  const [sort, setSort] = useState<"default" | "ending">("default");
  const [endingSoon, setEndingSoon] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  const list = useMemo(() => {
    let l = [...milestones];
    if (endingSoon) {
      const cutoff = Date.now() + 24 * 3600 * 1000;
      l = l.filter((m) => m.endDate && new Date(m.endDate).getTime() <= cutoff);
    }
    if (sort === "ending") {
      l.sort((a, b) => {
        const ax = a.endDate ? new Date(a.endDate).getTime() : Infinity;
        const bx = b.endDate ? new Date(b.endDate).getTime() : Infinity;
        return ax - bx;
      });
    } else {
      l.sort((a, b) => a.order - b.order);
    }
    return l;
  }, [milestones, sort, endingSoon]);

  return (
    <>
      <div className="ms-controls">
        <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
          <option value="default">{t("sortDefault")}</option>
          <option value="ending">{t("sortEnding")}</option>
        </select>
        <label className="vault-toggle">
          <input type="checkbox" checked={endingSoon} onChange={(e) => setEndingSoon(e.target.checked)} />
          {t("endingSoon")}
        </label>
      </div>

      {list.length === 0 ? (
        <div className="empty">{t("noFilterMilestones")}</div>
      ) : (
        <div className="section-list">
          {list.map((m) => {
            const expanded = open === m.hash;
            return (
              <div key={m.hash} className={`card ms-card ${expanded ? "open" : ""}`}>
                {/* Klikbare kop — details pas zichtbaar na een klik */}
                <button className="ms-toggle" onClick={() => setOpen(expanded ? null : m.hash)}>
                  {m.icon && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="item-icon" src={m.icon} alt="" />
                  )}
                  <div className="ms-toggle-info">
                    <div className="item-name">{m.name}</div>
                    {m.endDate && (
                      <div className="item-type">
                        {t("endsIn")} <Countdown to={m.endDate} />
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
          })}
        </div>
      )}
    </>
  );
}
