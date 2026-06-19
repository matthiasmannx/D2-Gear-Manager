"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

export default function ArmorThreshold({ value, label }: { value: number; label: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [v, setV] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apply = (n: number) => {
    if (timer.current) clearTimeout(timer.current);
    const p = new URLSearchParams(sp.toString());
    p.set("armorMin", String(Math.max(0, Math.min(100, n))));
    router.push(`/gear/cleanup?${p.toString()}`, { scroll: false });
  };

  const onChange = (n: number) => {
    setV(n);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => apply(n), 700); // auto-verversen kort na typen
  };

  return (
    <label className="cleanup-thr">
      <span className="muted">{label}</span>
      <input
        type="number"
        min={0}
        max={100}
        value={v}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={() => apply(v)}
        onKeyDown={(e) => { if (e.key === "Enter") apply(v); }}
      />
    </label>
  );
}
