"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveMyPrefs } from "@/app/settings-actions";

/** Gebruiker kiest zelf hoeveel aanbevolen perks minimaal moeten matchen voor een god roll. */
export default function GodRollSetting({ value, label }: { value: number; label: string }) {
  const router = useRouter();
  const [v, setV] = useState(value);
  const [pending, start] = useTransition();

  const apply = (n: number) => {
    setV(n);
    start(async () => {
      await saveMyPrefs({ godRollMin: n });
      router.refresh();
    });
  };

  return (
    <label className="cleanup-thr">
      <span className="muted">{label}</span>
      <select value={v} onChange={(e) => apply(Number(e.target.value))} disabled={pending} className="cb-sel">
        <option value={2}>2</option>
        <option value={3}>3</option>
        <option value={4}>4</option>
      </select>
    </label>
  );
}
