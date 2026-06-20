"use client";

import { useEffect, useRef, useState } from "react";

export interface Picked { name: string; ref: string }
interface Hit { name: string; type: number; id: string }

export default function PlayerPicker({ placeholder, onPick }: { placeholder: string; onPick: (p: Picked | null) => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (picked || q.trim().length < 3) { setHits([]); return; }
    const id = setTimeout(async () => {
      try {
        const r = await fetch(`/api/players/search?q=${encodeURIComponent(q.trim())}`);
        const d = await r.json();
        setHits(d.items ?? []);
        setOpen(true);
      } catch { /* negeer */ }
    }, 250);
    return () => clearTimeout(id);
  }, [q, picked]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="cmp-pick" ref={box}>
      <input
        className="cmp-input"
        value={q}
        placeholder={placeholder}
        onChange={(e) => { setQ(e.target.value); setPicked(false); onPick(null); }}
        onFocus={() => { if (hits.length) setOpen(true); }}
      />
      {open && hits.length > 0 && (
        <div className="cmp-results">
          {hits.map((h) => (
            <button
              key={`${h.type}:${h.id}`}
              type="button"
              className="cmp-result"
              onClick={() => { onPick({ name: h.name, ref: `${h.type}:${h.id}` }); setQ(h.name); setPicked(true); setOpen(false); }}
            >
              {h.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
