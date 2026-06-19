"use client";

import { useEffect, useState } from "react";

interface Live { active: boolean; map?: string; mode?: string; pvp?: boolean }

/** Compacte live-indicator (rood puntje + mode) voor favoriete spelers. */
export default function LivePill({ type, id }: { type: number; id: string }) {
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
    const iv = setInterval(load, 40000); // favorietenlijst: iets rustiger pollen
    return () => { stop = true; clearInterval(iv); };
  }, [type, id]);

  if (!live?.active) return null;
  return (
    <span className={`live-pill ${live.pvp ? "pvp" : ""}`} title={[live.mode, live.map].filter(Boolean).join(" · ")}>
      <span className="live-dot" />
      {live.mode || "In-game"}
    </span>
  );
}
