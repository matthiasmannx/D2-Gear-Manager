"use client";

import { useEffect, useState } from "react";

/** Live aftellen naar een tijdstip (ms timestamp of ISO-string). */
export default function Countdown({ to }: { to: number | string }) {
  const target = typeof to === "string" ? new Date(to).getTime() : to;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return <span className="cd">…</span>; // vermijd hydration-mismatch
  const ms = target - now;
  if (ms <= 0) return <span className="cd">nu</span>;

  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  const parts = d > 0 ? [`${d}d`, `${h}u`, `${m}m`] : h > 0 ? [`${h}u`, `${m}m`, `${sec}s`] : [`${m}m`, `${sec}s`];
  return <span className="cd">{parts.join(" ")}</span>;
}
