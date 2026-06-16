import Link from "next/link";
import { getItemDetail } from "@/lib/itemDetail";
import { getGodRoll } from "@/lib/wishlist";

const CLASS_NAMES: Record<number, string> = { 0: "Titan", 1: "Hunter", 2: "Warlock" };
const TIER_COLOR: Record<string, string> = {
  Exotic: "#ceae33",
  Legendary: "#b58cf6",
  Rare: "#5076a3",
  Uncommon: "#5b9e4d",
  Common: "#c3bcb4",
};

export default async function ItemDetail({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;

  let item;
  try {
    item = await getItemDetail(hash);
  } catch (e: any) {
    return (
      <>
        <BackLink />
        <div className="notice error">Kon item niet laden: {e.message}</div>
      </>
    );
  }
  if (!item) {
    return (
      <>
        <BackLink />
        <div className="empty">Item niet gevonden.</div>
      </>
    );
  }

  const color = TIER_COLOR[item.tier] ?? "var(--text)";

  return (
    <>
      <BackLink />
      <div className="idetail-head">
        {item.icon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="idetail-icon" src={item.icon} alt="" style={{ borderColor: color }} />
        )}
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 style={{ marginBottom: 4, color }}>{item.name}</h1>
          <div className="muted">
            {item.tier} · {item.type}
            {item.classType !== 3 && CLASS_NAMES[item.classType] ? ` · ${CLASS_NAMES[item.classType]}` : ""}
          </div>
          {item.description && <p style={{ marginTop: "0.75rem", maxWidth: 640 }}>{item.description}</p>}
          {item.flavor && (
            <p className="muted" style={{ fontStyle: "italic", maxWidth: 640 }}>“{item.flavor}”</p>
          )}
        </div>
      </div>

      {/* Hoe/waar te krijgen */}
      <div className="card" style={{ marginTop: "1.5rem", borderLeft: "3px solid var(--accent)" }}>
        <h3>Hoe kom je eraan?</h3>
        {item.source ? (
          <p style={{ margin: 0 }}>{item.source}</p>
        ) : (
          <p className="muted" style={{ margin: 0 }}>
            Geen specifieke bron-info beschikbaar in de manifest. Dit item komt
            waarschijnlijk uit algemene world-drops of vendor-engrams.
          </p>
        )}
      </div>

      {/* Exotic trait */}
      {item.intrinsic && (
        <div className="card" style={{ marginTop: "1rem", borderLeft: `3px solid ${color}` }}>
          <h3 style={{ color }}>Exotic trait</h3>
          <div className="idetail-trait">
            {item.intrinsic.icon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.intrinsic.icon} alt="" />
            )}
            <div>
              <strong>{item.intrinsic.name}</strong>
              <p className="muted" style={{ margin: "0.25rem 0 0" }}>{item.intrinsic.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* God rolls voor wapens — inline uit de wishlist */}
      {item.itemType === 3 && <GodRolls hash={item.hash} isExotic={item.tier === "Exotic"} />}

      {item.screenshot && (
        <div className="card" style={{ marginTop: "1.5rem", padding: 0, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.screenshot} alt="" style={{ width: "100%", display: "block" }} />
        </div>
      )}
    </>
  );
}

async function GodRolls({ hash, isExotic }: { hash: number; isExotic: boolean }) {
  const roll = await getGodRoll(hash);
  const hasRolls = roll && (roll.pve.length > 0 || roll.pvp.length > 0);

  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <h3>God rolls</h3>
      {hasRolls ? (
        <>
          {roll!.pve.length > 0 && (
            <div className="perk-row" style={{ marginBottom: "0.5rem" }}>
              <span className="perk-tag pve">PvE</span>
              <div className="perk-chips">
                {roll!.pve.map((p) => (
                  <span key={p.hash} className="perk-chip">
                    {p.icon && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.icon} alt="" />}
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {roll!.pvp.length > 0 && (
            <div className="perk-row">
              <span className="perk-tag pvp">PvP</span>
              <div className="perk-chips">
                {roll!.pvp.map((p) => (
                  <span key={p.hash} className="perk-chip">
                    {p.icon && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.icon} alt="" />}
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : isExotic ? (
        <p className="muted" style={{ margin: 0 }}>
          Exotic met vaste perks — er is geen random "god roll". Zie de Exotic trait hierboven.
        </p>
      ) : (
        <p className="muted" style={{ margin: 0 }}>Geen wishlist-roll bekend voor dit wapen.</p>
      )}
      <a
        href={`https://www.light.gg/db/items/${hash}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="muted"
        style={{ fontSize: "0.82rem", display: "inline-block", marginTop: "0.6rem" }}
      >
        Meer details op light.gg ↗
      </a>
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/items" className="muted" style={{ display: "inline-block", marginBottom: "1rem" }}>
      ← Terug naar zoeken
    </Link>
  );
}
