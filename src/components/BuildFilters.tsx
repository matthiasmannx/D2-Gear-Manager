"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CLASSES = ["Titan", "Hunter", "Warlock"];
const SUBCLASSES = ["Solar", "Arc", "Void", "Strand", "Stasis", "Prismatic"];
const ACTIVITIES = ["PvE", "PvP", "Raid", "Dungeon", "Solo", "GM Nightfall"];

export default function BuildFilters({
  labels,
}: {
  labels: { anyClass: string; anySubclass: string; anyActivity: string; clear: string };
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const cls = sp.get("class") ?? "";
  const sub = sp.get("subclass") ?? "";
  const act = sp.get("activity") ?? "";
  const hasFilter = cls || sub || act;

  function setParam(key: string, val: string) {
    const p = new URLSearchParams(sp.toString());
    if (val) p.set(key, val);
    else p.delete(key);
    router.push(`/community?${p.toString()}`, { scroll: false });
  }

  function clearAll() {
    const p = new URLSearchParams(sp.toString());
    p.delete("class");
    p.delete("subclass");
    p.delete("activity");
    router.push(`/community?${p.toString()}`, { scroll: false });
  }

  return (
    <div className="cb-filterbar">
      <select className={`cb-sel ${cls ? "set" : ""}`} value={cls} onChange={(e) => setParam("class", e.target.value)}>
        <option value="">{labels.anyClass}</option>
        {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select className={`cb-sel ${sub ? "set" : ""}`} value={sub} onChange={(e) => setParam("subclass", e.target.value)}>
        <option value="">{labels.anySubclass}</option>
        {SUBCLASSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select className={`cb-sel ${act ? "set" : ""}`} value={act} onChange={(e) => setParam("activity", e.target.value)}>
        <option value="">{labels.anyActivity}</option>
        {ACTIVITIES.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      {hasFilter && (
        <button type="button" className="cb-clear-btn" onClick={clearAll}>✕ {labels.clear}</button>
      )}
    </div>
  );
}
