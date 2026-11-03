"use client";

import { useEffect, useRef, useState } from "react";

interface Hit { hash: number; name: string; icon: string | null; type: string }

function useSearch(cat: string | undefined, q: string) {
  const [hits, setHits] = useState<Hit[]>([]);
  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return; }
    const id = setTimeout(async () => {
      try {
        const p = new URLSearchParams({ q });
        if (cat) p.set("cat", cat);
        const r = await fetch(`/api/builds/plugs?${p.toString()}`);
        const d = await r.json();
        setHits(d.items ?? []);
      } catch { /* negeer */ }
    }, 220);
    return () => clearTimeout(id);
  }, [cat, q]);
  return hits;
}

/** Eén waarde met autocomplete uit het manifest (perks, mods, abilities, super). */
export function PlugInput({ cat, value, onChange, placeholder }: { cat?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [q, setQ] = useState(value);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const hits = useSearch(cat, open ? q : "");

  useEffect(() => { setQ(value); }, [value]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="cb-search" ref={box}>
      <input
        className="cb-input cb-perk"
        value={q}
        placeholder={placeholder}
        onChange={(e) => { setQ(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && hits.length > 0 && (
        <div className="cb-results">
          {hits.map((h) => (
            <button type="button" key={h.hash} className="cb-result" onClick={() => { onChange(h.name); setQ(h.name); setOpen(false); }}>
              {h.icon && /* eslint-disable-next-line @next/next/no-img-element */ <img src={h.icon} alt="" />}
              <span className="cb-result-n">{h.name}</span>
              <span className="muted cb-result-t">{h.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Meerdere waarden (chips) met autocomplete: aspects, fragments, artifact. */
export function PlugChips({ cat, chips, setChips, max, placeholder }: { cat?: string; chips: string[]; setChips: (x: string[]) => void; max: number; placeholder?: string }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const hits = useSearch(cat, q);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const add = (name: string) => {
    const v = name.trim();
    if (v && chips.length < max && !chips.includes(v)) setChips([...chips, v]);
    setQ("");
    setOpen(false);
  };

  return (
    <div className="cb-search" ref={box}>
      <div className="cb-chips" style={{ marginBottom: chips.length ? "0.4rem" : 0 }}>
        {chips.map((c) => (
          <span key={c} className="cb-chip on">{c}<button type="button" className="cb-clear" onClick={() => setChips(chips.filter((x) => x !== c))}>×</button></span>
        ))}
      </div>
      {chips.length < max && (
        <input
          className="cb-input"
          value={q}
          placeholder={placeholder}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(q); } }}
        />
      )}
      {open && hits.length > 0 && (
        <div className="cb-results">
          {hits.map((h) => (
            <button type="button" key={h.hash} className="cb-result" onClick={() => add(h.name)}>
              {h.icon && /* eslint-disable-next-line @next/next/no-img-element */ <img src={h.icon} alt="" />}
              <span className="cb-result-n">{h.name}</span>
              <span className="muted cb-result-t">{h.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
