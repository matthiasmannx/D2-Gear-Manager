"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ArmorThreshold({ value, label }: { value: number; label: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [v, setV] = useState(value);

  const apply = (n: number) => {
    const p = new URLSearchParams(sp.toString());
    p.set("armorMin", String(n));
    router.push(`/gear/cleanup?${p.toString()}`, { scroll: false });
  };

  return (
    <label className="cleanup-thr">
      <span className="muted">{label}</span>
      <input
        type="number"
        min={0}
        max={100}
        value={v}
        onChange={(e) => setV(Number(e.target.value))}
        onBlur={() => apply(v)}
        onKeyDown={(e) => { if (e.key === "Enter") apply(v); }}
      />
    </label>
  );
}
