"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createBuildAction } from "@/app/community/actions";
import { PlugInput, PlugChips } from "@/components/PlugInput";
import type { BuildLoadout, BuildStats, BuildWeapon, CommunityBuildInput, WeaponPerks } from "@/lib/communityBuilds";

const CLASSES = ["Titan", "Hunter", "Warlock"];
const SUBCLASSES = ["Solar", "Arc", "Void", "Strand", "Stasis", "Prismatic"];
const ACTIVITIES = ["PvE", "PvP", "Raid", "Dungeon", "Solo", "GM Nightfall"];
const STAT_KEYS: (keyof BuildStats)[] = ["Weapons", "Health", "Class", "Grenade", "Melee", "Super"];
const ARMOR_PIECES = ["Helmet", "Arms", "Chest", "Legs", "Class Item"];
const ABILITY_SLOTS: { key: "classAbility" | "movement" | "grenade" | "melee"; label: string; cat: string }[] = [
  { key: "classAbility", label: "Class Ability", cat: "classability" },
  { key: "movement", label: "Movement", cat: "movement" },
  { key: "grenade", label: "Grenade", cat: "grenade" },
  { key: "melee", label: "Melee", cat: "melee" },
];

interface ItemHit {
  hash: number;
  name: string;
  icon: string | null;
  type: string;
  tier: string;
}

export default function BuildCreator({ forkOf, initial }: { forkOf?: string; initial?: CommunityBuildInput }) {
  const t = useTranslations("community");
  const ld = initial?.loadout;
  const ex = ld?.exoticArmor;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [activities, setActivities] = useState<string[]>(initial?.activities ?? []);
  const [guardianClass, setGuardianClass] = useState(initial?.guardianClass ?? "");
  const [subclass, setSubclass] = useState(initial?.subclass ?? "");
  const [superName, setSuperName] = useState(initial?.super ?? "");
  const [kinetic, setKinetic] = useState<BuildWeapon | null>(ld?.kinetic ?? null);
  const [energy, setEnergy] = useState<BuildWeapon | null>(ld?.energy ?? null);
  const [power, setPower] = useState<BuildWeapon | null>(ld?.power ?? null);
  const [kineticPerks, setKineticPerks] = useState<WeaponPerks>(ld?.kinetic?.perks ?? {});
  const [energyPerks, setEnergyPerks] = useState<WeaponPerks>(ld?.energy?.perks ?? {});
  const [powerPerks, setPowerPerks] = useState<WeaponPerks>(ld?.power?.perks ?? {});
  const [exotic, setExotic] = useState<ItemHit | null>(ex ? { hash: ex.hash ?? 0, name: ex.name, icon: ex.icon ?? null, type: "", tier: "Exotic" } : null);
  const [stats, setStats] = useState<BuildStats>(initial?.stats ?? {});
  const [aspects, setAspects] = useState<string[]>(initial?.aspects ?? []);
  const [fragments, setFragments] = useState<string[]>(initial?.fragments ?? []);
  const [abilities, setAbilities] = useState<NonNullable<BuildLoadout["abilities"]>>(ld?.abilities ?? {});
  const [mods, setMods] = useState<Record<string, string[]>>(ld?.mods ?? {});
  const [artifact, setArtifact] = useState<string[]>(ld?.artifact ?? []);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function toggle(list: string[], v: string, set: (x: string[]) => void) {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  }

  async function submit() {
    setError("");
    if (!title.trim() || !guardianClass || !subclass) {
      setError(t("required"));
      return;
    }
    const wp = (w: BuildWeapon | null, p: WeaponPerks): BuildWeapon | undefined => {
      if (!w) return undefined;
      const perks = cleanPerks(p);
      return { hash: w.hash, name: w.name, icon: w.icon ?? null, ...(perks ? { perks } : {}) };
    };
    const loadout: BuildLoadout = {
      kinetic: wp(kinetic, kineticPerks),
      energy: wp(energy, energyPerks),
      power: wp(power, powerPerks),
      exoticArmor: exotic ? { hash: exotic.hash, name: exotic.name, icon: exotic.icon } : undefined,
      abilities: cleanAbilities(abilities),
      mods: cleanMods(mods),
      artifact: artifact.length ? artifact : undefined,
    };
    setSaving(true);
    const res = await createBuildAction({
      title,
      description,
      activities,
      guardianClass,
      subclass,
      super: superName,
      loadout,
      stats,
      aspects,
      fragments,
      forkedFrom: forkOf ?? null,
    });
    // Bij succes redirect de action; we komen hier alleen bij een fout terug.
    setSaving(false);
    if (res && !res.ok) setError(res.error === "auth" ? t("needLogin") : res.error === "db" ? t("dbMissing") : t("required"));
  }

  return (
    <div className="cb-form">
      <section className="card cb-section">
        <h2>{t("fBasics")}</h2>
        <label className="cb-label">{t("fTitle")}</label>
        <input className="cb-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("fTitlePh")} maxLength={120} />
        <label className="cb-label">{t("fDesc")}</label>
        <textarea className="cb-input cb-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("fDescPh")} rows={4} maxLength={4000} />

        <label className="cb-label">{t("fActivities")}</label>
        <div className="cb-chips">
          {ACTIVITIES.map((a) => (
            <button type="button" key={a} className={`cb-chip ${activities.includes(a) ? "on" : ""}`} onClick={() => toggle(activities, a, setActivities)}>{a}</button>
          ))}
        </div>

        <div className="cb-row">
          <div>
            <label className="cb-label">{t("fClass")}</label>
            <div className="cb-chips">
              {CLASSES.map((c) => (
                <button type="button" key={c} className={`cb-chip ${guardianClass === c ? "on" : ""}`} onClick={() => setGuardianClass(c)}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="cb-label">{t("fSubclass")}</label>
            <div className="cb-chips">
              {SUBCLASSES.map((s) => (
                <button type="button" key={s} className={`cb-chip ${subclass === s ? "on" : ""}`} onClick={() => setSubclass(s)}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        <label className="cb-label">{t("fSuper")}</label>
        <PlugInput cat="super" value={superName} onChange={setSuperName} placeholder={t("fSuperPh")} />
      </section>

      <section className="card cb-section">
        <h2>{t("fLoadout")}</h2>
        <div className="cb-weapon">
          <ItemSearch kind="weapon" label={t("fKinetic")} value={kinetic} onPick={(i) => setKinetic(i)} placeholder={t("searchPh")} />
          {kinetic && <PerksRow value={kineticPerks} onChange={setKineticPerks} />}
        </div>
        <div className="cb-weapon">
          <ItemSearch kind="weapon" label={t("fEnergy")} value={energy} onPick={(i) => setEnergy(i)} placeholder={t("searchPh")} />
          {energy && <PerksRow value={energyPerks} onChange={setEnergyPerks} />}
        </div>
        <div className="cb-weapon">
          <ItemSearch kind="weapon" label={t("fPower")} value={power} onPick={(i) => setPower(i)} placeholder={t("searchPh")} />
          {power && <PerksRow value={powerPerks} onChange={setPowerPerks} />}
        </div>
        <ItemSearch kind="armor" label={t("fExotic")} value={exotic} onPick={(i) => setExotic(i)} placeholder={t("fExoticPh")} />
      </section>

      <section className="card cb-section">
        <h2>{t("fStats")}</h2>
        <div className="cb-stats">
          {STAT_KEYS.map((k) => (
            <label key={k} className="cb-stat">
              <span>{k}</span>
              <input type="number" min={0} max={200} value={stats[k] ?? ""} onChange={(e) => setStats((s) => ({ ...s, [k]: e.target.value === "" ? undefined : Math.max(0, Math.min(200, Number(e.target.value))) }))} />
            </label>
          ))}
        </div>
      </section>

      <section className="card cb-section">
        <div className="cb-row">
          <div>
            <label className="cb-label">{t("fAspects")} <span className="muted">({aspects.length}/2)</span></label>
            <PlugChips cat="aspect" chips={aspects} setChips={setAspects} max={2} placeholder={t("searchPh")} />
          </div>
          <div>
            <label className="cb-label">{t("fFragments")} <span className="muted">({fragments.length}/5)</span></label>
            <PlugChips cat="fragment" chips={fragments} setChips={setFragments} max={5} placeholder={t("searchPh")} />
          </div>
        </div>
      </section>

      <section className="card cb-section">
        <h2>{t("fAbilities")}</h2>
        <div className="cb-stats">
          {ABILITY_SLOTS.map(({ key, label, cat }) => (
            <label key={key} className="cb-stat">
              <span>{label}</span>
              <PlugInput cat={cat} value={abilities[key] ?? ""} placeholder={label} onChange={(v) => setAbilities((a) => ({ ...a, [key]: v }))} />
            </label>
          ))}
        </div>
      </section>

      <section className="card cb-section">
        <h2>{t("fMods")}</h2>
        {ARMOR_PIECES.map((piece) => (
          <div key={piece} className="cb-mod-row">
            <span className="cb-mod-piece">{piece}</span>
            <div className="cb-perks">
              {[0, 1, 2].map((i) => (
                <PlugInput
                  key={i}
                  cat="armormod"
                  value={mods[piece]?.[i] ?? ""}
                  placeholder={`${t("fMods")} ${i + 1}`}
                  onChange={(v) => {
                    setMods((m) => {
                      const arr = [...(m[piece] ?? ["", "", ""])];
                      arr[i] = v;
                      return { ...m, [piece]: arr };
                    });
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="card cb-section">
        <label className="cb-label">{t("fArtifact")} <span className="muted">({artifact.length}/12)</span></label>
        <PlugChips chips={artifact} setChips={setArtifact} max={12} placeholder={t("searchPh")} />
      </section>

      {error && <div className="notice error">{error}</div>}
      <div className="cb-actions">
        <button type="button" className="btn btn-primary" onClick={submit} disabled={saving}>{saving ? t("saving") : t("save")}</button>
        <a href="/community" className="btn">{t("cancel")}</a>
      </div>
    </div>
  );
}

function cleanAbilities(a: NonNullable<BuildLoadout["abilities"]>): BuildLoadout["abilities"] {
  const out: NonNullable<BuildLoadout["abilities"]> = {};
  (Object.keys(a) as (keyof typeof a)[]).forEach((k) => {
    const v = (a[k] ?? "").trim().slice(0, 60);
    if (v) out[k] = v;
  });
  return Object.keys(out).length ? out : undefined;
}

function cleanMods(m: Record<string, string[]>): Record<string, string[]> | undefined {
  const out: Record<string, string[]> = {};
  for (const piece of Object.keys(m)) {
    const arr = (m[piece] ?? []).map((s) => (s ?? "").trim().slice(0, 60)).filter(Boolean);
    if (arr.length) out[piece] = arr;
  }
  return Object.keys(out).length ? out : undefined;
}

function cleanPerks(p: WeaponPerks): WeaponPerks | undefined {
  const out: WeaponPerks = {};
  (Object.keys(p) as (keyof WeaponPerks)[]).forEach((k) => {
    const v = (p[k] ?? "").trim().slice(0, 60);
    if (v) out[k] = v;
  });
  return Object.keys(out).length ? out : undefined;
}

const PERK_SLOTS: { key: keyof WeaponPerks; label: string }[] = [
  { key: "barrel", label: "Barrel" },
  { key: "magazine", label: "Magazine" },
  { key: "trait1", label: "Trait 1" },
  { key: "trait2", label: "Trait 2" },
  { key: "masterwork", label: "Masterwork" },
];

function PerksRow({ value, onChange }: { value: WeaponPerks; onChange: (v: WeaponPerks) => void }) {
  return (
    <div className="cb-perks">
      {PERK_SLOTS.map(({ key, label }) => (
        <PlugInput key={key} cat="weaponperk" value={value[key] ?? ""} placeholder={label} onChange={(v) => onChange({ ...value, [key]: v })} />
      ))}
    </div>
  );
}

function ItemSearch({ kind, label, value, onPick, placeholder }: { kind: "weapon" | "armor"; label: string; value: { name: string; icon?: string | null; tier?: string } | null; onPick: (i: ItemHit) => void; placeholder: string }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<ItemHit[]>([]);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return; }
    const id = setTimeout(async () => {
      try {
        const r = await fetch(`/api/builds/search?kind=${kind}&q=${encodeURIComponent(q)}`);
        const d = await r.json();
        setHits(d.items ?? []);
        setOpen(true);
      } catch { /* negeer */ }
    }, 250);
    return () => clearTimeout(id);
  }, [q, kind]);

  return (
    <div className="cb-search" ref={box}>
      <label className="cb-label">{label}</label>
      {value ? (
        <div className="cb-picked">
          {value.icon && /* eslint-disable-next-line @next/next/no-img-element */ <img src={value.icon} alt="" />}
          <span>{value.name}</span>
          <button type="button" className="cb-clear" onClick={() => { onPick(null as unknown as ItemHit); setQ(""); }}>×</button>
        </div>
      ) : (
        <input className="cb-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} onFocus={() => hits.length && setOpen(true)} />
      )}
      {open && !value && hits.length > 0 && (
        <div className="cb-results">
          {hits.map((h) => (
            <button type="button" key={h.hash} className={`cb-result ${h.tier === "Exotic" ? "is-exotic" : ""}`} onClick={() => { onPick(h); setOpen(false); setQ(""); }}>
              {h.icon && /* eslint-disable-next-line @next/next/no-img-element */ <img src={h.icon} alt="" />}
              <span className="cb-result-n">{h.name}</span>
              <span className="muted cb-result-t">{h.tier}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

