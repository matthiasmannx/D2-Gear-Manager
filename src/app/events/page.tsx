import Link from "next/link";
import { getPublicMilestones, getEntityDefinition, icon } from "@/lib/bungie";
import { lookupItems } from "@/lib/manifest";
import { getValidAccessToken } from "@/lib/auth";
import { getVendorInventory, VendorView } from "@/lib/vendors";
import { nextIronBanner } from "@/lib/schedule";
import { WEEKLY } from "@/lib/weekly";
import EventSchedule, { IronBannerInfo } from "@/components/EventSchedule";
import MilestoneBoard, { MilestoneView } from "@/components/MilestoneBoard";

export const metadata = { title: "Events Tracker — Guardian Hub" };
export const revalidate = 900; // 15 min

interface RawMilestone {
  milestoneHash: number;
  startDate?: string;
  endDate?: string;
  order?: number;
  activities?: any[];
  def?: any;
}

export default async function EventsPage() {
  let milestones: MilestoneView[] = [];
  let ironBanner: IronBannerInfo = { active: false };
  let loadError: string | null = null;

  try {
    const data = await getPublicMilestones();
    const list: RawMilestone[] = Object.values(data ?? {});
    const enriched = await Promise.all(
      list.map(async (m) => {
        try {
          const def = await getEntityDefinition("DestinyMilestoneDefinition", m.milestoneHash);
          return { ...m, def };
        } catch {
          return m;
        }
      })
    );

    milestones = await Promise.all(
      enriched
        .filter((m) => m.def?.displayProperties?.name)
        .map(async (m): Promise<MilestoneView> => {
          // Activiteit + aanbevolen power uit de eerste activity.
          let activity: string | undefined;
          let power: number | undefined;
          const actHash = m.activities?.[0]?.activityHash;
          if (actHash) {
            try {
              const ad = await getEntityDefinition("DestinyActivityDefinition", actHash);
              activity = ad?.displayProperties?.name;
              const lvl = ad?.activityLightLevel;
              if (lvl && lvl > 100) power = lvl;
            } catch {
              /* negeer */
            }
          }

          // Concrete reward-items uit de def (vaak leeg).
          const rewardHashes: number[] = [];
          const cats = m.def.rewards ?? {};
          for (const cat of Object.values<any>(cats)) {
            for (const entry of Object.values<any>(cat.rewardEntries ?? {})) {
              for (const it of entry.items ?? []) {
                if (it.itemHash) rewardHashes.push(it.itemHash);
              }
            }
          }
          let rewards: string[] = [];
          if (rewardHashes.length > 0) {
            const defs = await lookupItems(rewardHashes);
            rewards = [...defs.values()].map((d) => d.name).slice(0, 4);
          }

          return {
            hash: m.milestoneHash,
            name: m.def.displayProperties.name,
            icon: icon(m.def.displayProperties.icon),
            description: m.def.displayProperties.description ?? "",
            endDate: m.endDate,
            order: m.order ?? 999,
            activity,
            power,
            rewards,
            rewardLabel: rewards.length === 0 && activity ? "Loot uit de activiteit-pool + wekelijkse beloning" : undefined,
          };
        })
    );

    // Iron Banner detecteren: actief (uit milestone, met datums) of komende
    // datum uit de onderhoudbare lijst.
    const ibRaw = enriched.find((m) => /iron banner/i.test(m.def?.displayProperties?.name ?? ""));
    if (ibRaw) {
      ironBanner = { active: true, startDate: ibRaw.startDate, endDate: ibRaw.endDate };
    } else {
      const next = nextIronBanner();
      ironBanner = { active: false, nextDate: next?.toISOString() };
    }
  } catch (e: any) {
    loadError = e.message;
  }

  return (
    <>
      <h1>Events Tracker</h1>
      <p className="muted">
        Resets, weekend-events en actieve milestones — met live afteltimers.
      </p>

      <h2 style={{ marginTop: "1.25rem" }}>Schema</h2>
      <EventSchedule ironBanner={ironBanner} />

      <ThisWeek />

      {/* Vendors (vereist login) */}
      <Vendors />

      <h2 style={{ marginTop: "2rem" }}>Actieve milestones</h2>
      {loadError ? (
        <div className="notice error">Kon milestones niet laden: {loadError}</div>
      ) : milestones.length === 0 ? (
        <div className="empty">Geen actieve milestones gevonden.</div>
      ) : (
        <MilestoneBoard milestones={milestones} />
      )}
    </>
  );
}

function ThisWeek() {
  const w = WEEKLY;
  const has = w.nightfall || w.legendLostSector || w.featuredDungeon || w.featuredRaid;
  return (
    <>
      <h2 style={{ marginTop: "2rem" }}>Deze week</h2>
      {has ? (
        <div className="sched-grid">
          {w.nightfall && (
            <div className="sched-card soon">
              <div className="sched-title">Nightfall</div>
              <div className="sched-status muted">{w.nightfall.activity}</div>
              <div style={{ fontWeight: 700 }}>🎁 {w.nightfall.weapon}</div>
            </div>
          )}
          {w.legendLostSector && (
            <div className="sched-card soon">
              <div className="sched-title">Legend Lost Sector</div>
              <div className="sched-status muted">{w.legendLostSector.name}</div>
              <div style={{ fontWeight: 700 }}>🎁 Exotic {w.legendLostSector.exoticSlot}</div>
            </div>
          )}
          {w.featuredRaid && (
            <div className="sched-card">
              <div className="sched-title">Featured raid</div>
              <div style={{ fontWeight: 700 }}>{w.featuredRaid}</div>
            </div>
          )}
          {w.featuredDungeon && (
            <div className="sched-card">
              <div className="sched-title">Featured dungeon</div>
              <div style={{ fontWeight: 700 }}>{w.featuredDungeon}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="notice" style={{ fontSize: "0.86rem" }}>
          Nightfall-wapen, Legend Lost Sector en featured dungeon/raid komen niet uit de
          Bungie API. Vul ze in{" "}
          <code>src/lib/weekly.ts</code> (of vraag mij "ververs de weekly highlights"). Bronnen:{" "}
          <a href="https://www.bungie.net/7/en/News" target="_blank" rel="noopener noreferrer">Bungie TWID</a>,{" "}
          <a href="https://www.blueberries.gg/leveling/lost-sectors/" target="_blank" rel="noopener noreferrer">blueberries.gg</a>.
        </div>
      )}
    </>
  );
}

async function Vendors() {
  const token = await getValidAccessToken();
  if (!token) {
    return (
      <>
        <h2 style={{ marginTop: "2rem" }}>Vendors</h2>
        <div className="notice">
          <Link href="/api/auth/login">Log in met Bungie</Link> om te zien wat Xûr, Banshee-44 en Ada-1 nu verkopen.
        </div>
      </>
    );
  }

  let vendors: VendorView[] | null = [];
  try {
    vendors = await getVendorInventory(token);
  } catch {
    vendors = [];
  }

  return (
    <>
      <h2 style={{ marginTop: "2rem" }}>Vendors</h2>
      {!vendors || vendors.length === 0 ? (
        <div className="empty">Geen vendor-inventory beschikbaar (Xûr is alleen in het weekend aanwezig).</div>
      ) : (
        vendors.map((v) => (
          <section key={v.hash} style={{ marginTop: "1rem" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {v.icon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.icon} alt="" style={{ width: 28, height: 28, borderRadius: 6 }} />
              )}
              {v.name}
            </h3>
            <div className="grid">
              {v.items.map((it) => (
                <Link key={it.hash} href={`/items/${it.hash}`} className="card card-link">
                  <div className="item">
                    {it.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="item-icon" src={it.icon} alt="" />
                    ) : (
                      <div className="item-icon" />
                    )}
                    <div>
                      <div className="item-name">{it.name}</div>
                      <div className="item-type">{[it.tier, it.type].filter(Boolean).join(" · ")}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
