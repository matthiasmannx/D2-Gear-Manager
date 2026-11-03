"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { saveMyPrefs } from "@/app/settings-actions";

/** Gebruiker kiest hoeveel aanbevolen perks minimaal moeten matchen voor een god roll. */
export default function GodRollSetting({ value, label }: { value: number; label: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [v, setV] = useState(value);

  const apply = (n: number) => {
    setV(n);
    saveMyPrefs({ godRollMin: n }).catch(() => {}); // bewaar (werkt door op gear-badges)
    const p = new URLSearchParams(sp.toString());
    p.set("godRoll", String(n)); // navigeren = direct zichtbaar in de lijst
    router.push(`/gear/cleanup?${p.toString()}`, { scroll: false });
  };

  return (
    <label className="cleanup-thr">
      <span className="muted">{label}</span>
      <select value={v} onChange={(e) => apply(Number(e.target.value))} className="cb-sel">
        <option value={2}>2</option>
        <option value={3}>3</option>
        <option value={4}>4</option>
      </select>
    </label>
  );
}
