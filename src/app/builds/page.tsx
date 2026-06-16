import Link from "next/link";
import { BUILDS, META_SEASON, META_UPDATED, Activity, GuardianClass, Build } from "@/lib/builds";
import { resolveItems, ResolvedItem } from "@/lib/buildItems";
import ItemHover from "@/components/ItemHover";

export const metadata = { title: "Meta Builds — Guardian Hub" };

const TABS: { key: Activity; label: string }[] = [
  { key: "PvE", label: "PvE" },
  { key: "PvP", label: "PvP" },
];
const CLASSES: GuardianClass[] = ["Titan", "Hunter", "Warlock"];
const CLASS_COLOR: Record<string, string> = {
  Titan: "#e0564b",
  Hunter: "#4aa3c7",
  Warlock: "#e8a13a",
};
const TIER_RANK: Record<string, number> = { S: 0, A: 1, B: 2 };

export default async function BuildsPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const active: Activity = mode === "PvP" ? "PvP" : "PvE";

  // Per class de top 5 (gesorteerd op tier) voor de gekozen activiteit.
  const byClass = CLASSES.map((cls) => {
    const builds = BUILDS.filter((b) => b.activity === active && b.guardianClass === cls)
      .sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier])
      .slice(0, 5);
    return { cls, builds };
  });

  // Resolve alle exotics in één keer (map per build-id).
  const allBuilds = byClass.flatMap((g) => g.builds);
  const resolvedList = await Promise.all(
    allBuilds.map((b) => resolveItems([b.exoticArmor, b.exoticWeapon]))
  );
  const resolved: Record<string, (ResolvedItem | null)[]> = {};
  allBuilds.forEach((b, i) => (resolved[b.id] = resolvedList[i]));

  const updated = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(META_UPDATED));

  return (
    <>
      <h1>Meta Builds</h1>
      <p className="muted">
        Top 5 builds per class voor <strong>{META_SEASON}</strong> · laatst bijgewerkt {updated}.
      </p>
      <div className="notice" style={{ marginTop: "0.5rem", fontSize: "0.82rem" }}>
        Samengesteld uit community-bronnen — verifieer/fine-tune op light.gg of Mobalytics. Hover over een exotic voor de volledige info.
      </div>

      <div className="build-tabs">
        {TABS.map((t) => (
          <Link key={t.key} href={`/builds?mode=${t.key}`} className={`build-tab ${t.key === active ? "active" : ""}`}>
            {t.label}
          </Link>
        ))}
      </div>

      {byClass.map(({ cls, builds }) => (
        <section key={cls} style={{ marginTop: "2rem" }}>
          <h2 className="class-head" style={{ borderColor: CLASS_COLOR[cls], color: CLASS_COLOR[cls] }}>
            {cls} <span className="muted" style={{ fontSize: "0.8rem", fontWeight: 400 }}>· top {builds.length}</span>
          </h2>
          {builds.length === 0 ? (
            <div className="muted" style={{ fontSize: "0.88rem" }}>Nog geen {active}-builds voor {cls}.</div>
          ) : (
            <div className="build-list">
              {builds.map((b, rank) => (
                <BuildRow key={b.id} build={b} rank={rank + 1} exotics={resolved[b.id]} color={CLASS_COLOR[cls]} />
              ))}
            </div>
          )}
        </section>
      ))}
    </>
  );
}

function BuildRow({
  build: b,
  rank,
  exotics,
  color,
}: {
  build: Build;
  rank: number;
  exotics: (ResolvedItem | null)[];
  color: string;
}) {
  const [armor, weapon] = exotics;
  return (
    <Link href={`/builds/${b.id}`} className="inspect-card" style={{ ["--class-color" as any]: color }}>
      {/* Linkerkolom: rang + exotic (inspect-stijl) */}
      <div className="inspect-left">
        <div className="inspect-rank">
          <span className="inspect-rank-num">#{rank}</span>
          <span className={`build-tier tier-${b.tier}`}>{b.tier}</span>
        </div>
        {armor ? (
          <ItemHover item={armor} label="Exotic armor" size={64} />
        ) : (
          b.exoticArmor && <div className="muted" style={{ fontSize: "0.8rem" }}>{b.exoticArmor}</div>
        )}
        {weapon && <ItemHover item={weapon} label="Exotic weapon" size={64} />}
      </div>

      {/* Rechterkolom: identiteit + loadout-slots */}
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
              <span key={s} className="stat-step">
                {i > 0 && <span className="stat-arrow">›</span>}{s}
              </span>
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
        {items.map((x) => (
          <span key={x} className={`chip ${accent ? "chip-aspect" : ""}`}>{x}</span>
        ))}
      </div>
    </div>
  );
}
