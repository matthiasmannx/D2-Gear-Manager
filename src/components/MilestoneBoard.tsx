"use client";

import { useMemo, useState } from "react";
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
  rewards: string[]; // concrete reward-items (indien bekend)
  rewardLabel?: string; // generiek label (bv. "Pinnacle/krachtige beloning")
}

export default function MilestoneBoard({ milestones }: { milestones: MilestoneView[] }) {
  const t = useTranslations("events");
  const [sort, setSort] = useState<"default" | "ending">("default");
  const [endingSoon, setEndingSoon] = useState(false);

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
          {list.map((m) => (
            <div key={m.hash} className="card">
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {m.icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="item-icon" src={m.icon} alt="" />
                )}
                <div style={{ flex: 1 }}>
                  <div className="item-name">{m.name}</div>
                  {m.endDate && (
                    <div className="item-type">
                      {t("endsIn")} <Countdown to={m.endDate} />
                    </div>
                  )}
                </div>
              </div>

              <div className="ms-meta">
                {m.activity && (
                  <div><span className="muted">{t("doLabel")} </span>{m.activity}{m.power ? ` · ⚡${m.power}` : ""}</div>
                )}
                {((m.rewards?.length ?? 0) > 0 || m.rewardLabel) && (
                  <div><span className="muted">{t("lootLabel")} </span>{(m.rewards?.length ?? 0) > 0 ? m.rewards.join(", ") : m.rewardLabel}</div>
                )}
              </div>

              {m.description && (
                <p className="muted" style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
                  {m.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
