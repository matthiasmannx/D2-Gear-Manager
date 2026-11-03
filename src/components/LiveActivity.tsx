"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface Live {
  active: boolean;
  map?: string;
  mode?: string;
  icon?: string | null;
  since?: string;
  pvp?: boolean;
  hidden?: boolean;
  fireteam?: string[];
}

export default function LiveActivity({ type, id }: { type: number; id: string }) {
  const t = useTranslations("players");
  const [live, setLive] = useState<Live | null>(null);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const r = await fetch(`/api/live/${type}/${id}`, { cache: "no-store" });
        const d = await r.json();
        if (!stop) setLive(d);
      } catch {
        /* negeer */
      }
    };
    load();
    const iv = setInterval(load, 25000); // elke 25s verversen
    return () => { stop = true; clearInterval(iv); };
  }, [type, id]);

  if (!live) return null;
  if (live.hidden) return <div className="live-card off"><span className="muted">{t("livePrivate")}</span></div>;
  if (!live.active) return null;

  const mins = live.since ? Math.max(0, Math.floor((Date.now() - new Date(live.since).getTime()) / 60000)) : null;

  return (
    <div
      className={`live-card ${live.pvp ? "pvp" : ""}`}
      style={live.icon ? { backgroundImage: `linear-gradient(90deg, rgba(11,14,20,0.93), rgba(11,14,20,0.6)), url(${live.icon})` } : undefined}
    >
      <span className="live-dot" />
      <div className="live-info">
        <div className="live-now">{t("liveNow")}</div>
        <div className="live-where">{[live.mode, live.map].filter(Boolean).join(" · ")}</div>
        {live.fireteam && live.fireteam.length > 0 && <div className="live-team muted">👥 {live.fireteam.join(", ")}</div>}
      </div>
      {mins != null && <span className="live-since muted">{t("liveSince", { m: mins })}</span>}
    </div>
  );
}
