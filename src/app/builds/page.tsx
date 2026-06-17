import Link from "next/link";
import { BUILDS, META_SEASON, META_UPDATED, Mode, GuardianClass, Build } from "@/lib/builds";
import { resolveItems, ResolvedItem } from "@/lib/buildItems";
import ItemHover from "@/components/ItemHover";

export const metadata = { title: "Meta Builds — Guardian Hub" };

const MODES: { key: Mode; label: string; group: "PvE" | "PvP"; desc: string }[] = [
  { key: "GM", label: "Grandmaster", group: "PvE", desc: "Survivability, champion-coverage & add-clear" },
  { key: "Raid", label: "Raid", group: "PvE", desc: "Boss-DPS, support & add-clear" },
  { key: "Dungeon", label: "Dungeon", group: "PvE", desc: "Solo-survivable & single-target" },
  { key: "Trials", label: "Trials of Osiris", group: "PvP", desc: "3v3 — duels & zone-control" },
  { key: "IronBanner", label: "Iron Banner", group: "PvP", desc: "6v6 — ability-heavy & objective" },
  { key: "Crucible", label: "Crucible", group: "PvP", desc: "Algemene PvP — duels & movement" },
];
const CLASSES: GuardianClass[] = ["Titan", "Hunter", "Warlock"];
const CLASS_COLOR: Record<string, string> = { Titan: "#e0564b", Hunter: "#4aa3c7", Warlock: "#e8a13a" };
const TIER_RANK: Record<string, number> = { S: 0, A: 1, B: 2 };

export default async function BuildsPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const active = MODES.find((x) => x.key === m)?.key ?? null;

  const updated = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(META_UPDATED));

  return (
    <>
      <h1>Meta Builds</h1>
      <p className="muted">
        Builds per modus voor <strong>{META_SEASON}</strong> · laatst bijgewerkt {updated}.
      </p>
      <div className="notice" style={{ marginTop: "0.5rem", fontSize: "0.82rem" }}>
        Recente community-builds (Armor 3.0). Kies een modus om de builds te zien. Hover over een exotic voor de info.
      </div>

      {/* Modus-keuze */}
      <ModePicker active={active} />

      {active ? <ModeBuilds mode={active} /> : <PickPrompt />}
    </>
  );
}

function ModePicker({ active }: { active: Mode | null }) {
  return (
    <div className="mode-picker">
      {(["PvE", "PvP"] as const).map((grp) => (
        <div key={grp} className="mode-group">
          <span className="mode-group-h">{grp}</span>
          <div className="mode-tabs">
            {MODES.filter((x) => x.group === grp).map((x) => (
              <Link key={x.key} href={`/builds?m=${x.key}`} className={`mode-tab ${active === x.key ? "active" : ""}`}>
                {x.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PickPrompt() {
  return (
    <div className="mode-cards">
      {MODES.map((x) => {
        const count = BUILDS.filter((b) => b.modes.includes(x.key)).length;
        return (
          <Link key={x.key} href={`/builds?m=${x.key}`} className="card card-link mode-card">
            <span className="tag">{x.group}</span>
            <h3 style={{ margin: "0.5rem 0 0.2rem" }}>{x.label}</h3>
            <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>{x.desc}</p>
            <span className="muted" style={{ fontSize: "0.78rem" }}>{count} builds →</span>
          </Link>
        );
      })}
    </div>
  );
}

async function ModeBuilds({ mode }: { mode: Mode }) {
  const byClass = CLASSES.map((cls) => ({
    cls,
    builds: BUILDS.filter((b) => b.modes.includes(mode) && b.guardianClass === cls)
      .sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier])
      .slice(0, 5),
  }));

  const all = byClass.flatMap((g) => g.builds);
  const resolvedList = await Promise.all(all.map((b) => resolveItems([b.exoticArmor, b.exoticWeapon])));
  const resolved: Record<string, (ResolvedItem | null)[]> = {};
  all.forEach((b, i) => (resolved[b.id] = resolvedList[i]));

  const label = MODES.find((x) => x.key === mode)!.label;

  return (
    <>
      <h2 style={{ marginTop: "1.5rem" }}>{label}</h2>
      {byClass.every((g) => g.builds.length === 0) && (
        <div className="empty">Nog geen builds voor {label}.</div>
      )}
      {byClass.map(({ cls, builds }) =>
        builds.length === 0 ? null : (
          <section key={cls} style={{ marginTop: "1.5rem" }}>
            <h3 className="class-head" style={{ borderColor: CLASS_COLOR[cls], color: CLASS_COLOR[cls] }}>{cls}</h3>
            <div className="build-list">
              {builds.map((b, rank) => (
                <BuildRow key={b.id} build={b} rank={rank + 1} exotics={resolved[b.id]} color={CLASS_COLOR[cls]} />
              ))}
            </div>
          </section>
        )
      )}
    </>
  );
}

function BuildRow({ build: b, rank, exotics, color }: { build: Build; rank: number; exotics: (ResolvedItem | null)[]; color: string }) {
  const [armor, weapon] = exotics;
  return (
    <Link href={`/builds/${b.id}`} className="inspect-card" style={{ ["--class-color" as any]: color }}>
      <div className="inspect-left">
        <div className="inspect-rank">
          <span className="inspect-rank-num">#{rank}</span>
          <span className={`build-tier tier-${b.tier}`}>{b.tier}</span>
        </div>
        {armor ? <ItemHover item={armor} label="Exotic armor" size={64} /> : b.exoticArmor && <div className="muted" style={{ fontSize: "0.8rem" }}>{b.exoticArmor}</div>}
        {weapon && <ItemHover item={weapon} label="Exotic weapon" size={64} />}
      </div>
      <div className="inspect-right">
        <div className="inspect-id">
          <span className="build-class" style={{ color }}>{b.guardianClass} · {b.subclass}</span>
          <h3 className="build-name">{b.name}</h3>
          <p className="build-summary muted">{b.summary}</p>
        </div>
        <div className="inspect-slots">
          <SlotRow label="Aspects" items={b.aspects} accent />
          <SlotRow label="Fragments" items={b.fragments} />
          <SlotRow label="Wapens" items={b.weapons} />
        </div>
        <div className="inspect-stats">
          <span className="build-section-h">Stats</span>
          <div className="stat-priority">
            {b.statPriority.map((s, i) => (
              <span key={s} className="stat-step">{i > 0 && <span className="stat-arrow">›</span>}{s}</span>
            ))}
          </div>
        </div>
        <p className="build-how">{b.howItWorks}</p>
        {b.source && <p className="build-source muted">Bron: {b.source}</p>}
      </div>
    </Link>
  );
}

function SlotRow({ label, items, accent }: { label: string; items: string[]; accent?: boolean }) {
  return (
    <div className="slot-row">
      <span className="slot-label">{label}</span>
      <div className="chips">
        {items.map((x) => <span key={x} className={`chip ${accent ? "chip-aspect" : ""}`}>{x}</span>)}
      </div>
    </div>
  );
}
