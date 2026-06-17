import Link from "next/link";
import { BUILDS } from "@/lib/builds";
import { resolveItemByName } from "@/lib/buildItems";
import { getItemDetail } from "@/lib/itemDetail";

const CLASS_COLOR: Record<string, string> = {
  Titan: "#e0564b",
  Hunter: "#4aa3c7",
  Warlock: "#e8a13a",
};

export default async function BuildDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const b = BUILDS.find((x) => x.id === id);

  if (!b) {
    return (
      <>
        <Link href="/builds" className="muted" style={{ display: "inline-block", marginBottom: "1rem" }}>← Terug naar builds</Link>
        <div className="empty">Build niet gevonden.</div>
      </>
    );
  }

  const color = CLASS_COLOR[b.guardianClass] ?? "var(--accent)";

  // Resolve exotic(s) + hun intrinsieke trait.
  const armorRes = b.exoticArmor ? await resolveItemByName(b.exoticArmor) : null;
  const weaponRes = b.exoticWeapon ? await resolveItemByName(b.exoticWeapon) : null;
  const armorDetail = armorRes ? await getItemDetail(armorRes.hash) : null;
  const weaponDetail = weaponRes ? await getItemDetail(weaponRes.hash) : null;

  return (
    <>
      <Link href={`/builds?m=${b.modes[0]}`} className="muted" style={{ display: "inline-block", marginBottom: "1rem" }}>
        ← Terug naar builds
      </Link>

      <div className="bd-head" style={{ ["--class-color" as any]: color }}>
        <span className={`build-tier tier-${b.tier}`} style={{ width: 48, height: 48, fontSize: "1.5rem" }}>{b.tier}</span>
        <div>
          <div className="build-class" style={{ color }}>{b.guardianClass} · {b.subclass} · {b.modes.join(" · ")}</div>
          <h1 style={{ margin: "0.1rem 0" }}>{b.name}</h1>
          <p className="muted" style={{ margin: 0, maxWidth: 640 }}>{b.summary}</p>
        </div>
      </div>

      <div className="bd-grid">
        {/* Exotics met trait */}
        <div className="bd-col">
          <h3 className="build-section-h">Exotics</h3>
          {[{ res: armorRes, det: armorDetail, label: "Exotic armor" }, { res: weaponRes, det: weaponDetail, label: "Exotic weapon" }]
            .filter((x) => x.res)
            .map((x, i) => (
              <div key={i} className="bd-exotic" style={{ borderColor: "#ceae33" }}>
                {x.res!.icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={x.res!.icon} alt="" />
                )}
                <div>
                  <div className="muted" style={{ fontSize: "0.7rem", textTransform: "uppercase" }}>{x.label}</div>
                  <div style={{ fontWeight: 700, color: "#ceae33" }}>{x.res!.name}</div>
                  <div className="muted" style={{ fontSize: "0.78rem" }}>{x.res!.type}</div>
                  {x.det?.intrinsic && (
                    <p className="bd-trait">
                      <strong>{x.det.intrinsic.name}:</strong> {x.det.intrinsic.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          {!armorRes && b.exoticArmor && <div className="muted">{b.exoticArmor}</div>}
        </div>

        {/* Subclass-setup */}
        <div className="bd-col">
          <h3 className="build-section-h">Subclass-setup</h3>
          <Block label="Aspects" items={b.aspects} accent />
          <Block label="Fragments" items={b.fragments} />
          <Block label="Stat-prioriteit">
            <div className="stat-priority">
              {b.statPriority.map((s, i) => (
                <span key={s} className="stat-step">{i > 0 && <span className="stat-arrow">›</span>}{s}</span>
              ))}
            </div>
          </Block>
        </div>

        {/* Wapens */}
        <div className="bd-col">
          <h3 className="build-section-h">Wapens</h3>
          <div className="chips">
            {b.weapons.map((w) => <span key={w} className="chip">{w}</span>)}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem", borderLeft: `3px solid ${color}` }}>
        <h3>Hoe werkt het?</h3>
        <p style={{ margin: 0 }}>{b.howItWorks}</p>
      </div>
      {b.source && <p className="build-source muted" style={{ marginTop: "0.75rem" }}>Bron: {b.source} — verifieer/fine-tune op light.gg of Mobalytics.</p>}
    </>
  );
}

function Block({ label, items, accent, children }: { label: string; items?: string[]; accent?: boolean; children?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <span className="slot-label">{label}</span>
      {children ?? (
        <div className="chips" style={{ marginTop: "0.3rem" }}>
          {items!.map((x) => <span key={x} className={`chip ${accent ? "chip-aspect" : ""}`}>{x}</span>)}
        </div>
      )}
    </div>
  );
}
