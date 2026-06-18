import Link from "next/link";
import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("events");
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
          // Activiteit + aanbevolen power + banner + loot-pool uit de activity.
          let activity: string | undefined;
          let power: number | undefined;
          let banner: string | undefined;
          let group: "raid" | "dungeon" | "weekly" = "weekly";
          const lootHashes: number[] = [];
          const actHash = m.activities?.[0]?.activityHash;
          if (actHash) {
            try {
              const ad = await getEntityDefinition("DestinyActivityDefinition", actHash);
              activity = ad?.displayProperties?.name;
              const lvl = ad?.activityLightLevel;
              if (lvl && lvl > 100) power = lvl;
              if (ad?.pgcrImage) banner = icon(ad.pgcrImage) ?? undefined;
              // Loot-pool: de reward-items die deze activity kan geven.
              for (const block of ad?.rewards ?? []) {
                for (const ri of block.rewardItems ?? []) {
                  if (ri.itemHash) lootHashes.push(ri.itemHash);
                }
              }
              // Groep bepalen via het activiteitstype (Raid/Dungeon/overig).
              let typeName = "";
              if (ad?.activityTypeHash) {
                try {
                  const td = await getEntityDefinition("DestinyActivityTypeDefinition", ad.activityTypeHash);
                  typeName = td?.displayProperties?.name ?? "";
                } catch {
                  /* val terug op naam/banner */
                }
              }
              const probe = `${typeName} ${ad?.pgcrImage ?? ""}`.toLowerCase();
              if (/raid/.test(probe)) group = "raid";
              else if (/dungeon/.test(probe)) group = "dungeon";
            } catch {
              /* negeer */
            }
          }

          // Concrete reward-items uit de milestone-def (vaak leeg) + activity-loot.
          const rewardHashes: number[] = [];
          const cats = m.def.rewards ?? {};
          for (const cat of Object.values<any>(cats)) {
            for (const entry of Object.values<any>(cat.rewardEntries ?? {})) {
              for (const it of entry.items ?? []) {
                if (it.itemHash) rewardHashes.push(it.itemHash);
              }
            }
          }
          const allLoot = [...new Set([...rewardHashes, ...lootHashes])];
          let loot: { hash: number; name: string; icon: string | null }[] = [];
          if (allLoot.length > 0) {
            const defs = await lookupItems(allLoot);
            loot = [...defs.values()].map((d) => ({ hash: d.hash, name: d.name, icon: icon(d.icon) })).slice(0, 12);
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
            banner,
            loot,
            group,
            rewardLabel: loot.length === 0 && activity ? t("rewardPool") : undefined,
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
      <h1>{t("title")}</h1>
      <p className="muted">{t("intro")}</p>

      {/* Schedule als allereerste */}
      <h2 style={{ marginTop: "1.25rem" }}>{t("schedule")}</h2>
      <EventSchedule ironBanner={ironBanner} />

      {/* Daarna de active milestones */}
      <h2 style={{ marginTop: "2rem" }}>{t("activeMilestones")}</h2>
      {loadError ? (
        <div className="notice error">{t("milestonesFailed", { error: loadError })}</div>
      ) : milestones.length === 0 ? (
        <div className="empty">{t("noMilestones")}</div>
      ) : (
        <MilestoneBoard milestones={milestones} />
      )}

      <ThisWeek />

      {/* Vendors (vereist login) */}
      <Vendors />
    </>
  );
}

async function ThisWeek() {
  const t = await getTranslations("events");
  const w = WEEKLY;
  const has = w.nightfall || w.legendLostSector || w.featuredDungeon || w.featuredRaid;
  return (
    <>
      <h2 style={{ marginTop: "2rem" }}>{t("thisWeek")}</h2>
      {has ? (
        <div className="sched-grid">
          {w.nightfall && (
            <div className="sched-card soon">
              <div className="sched-title">{t("nightfall")}</div>
              <div className="sched-status muted">{w.nightfall.activity}</div>
              <div style={{ fontWeight: 700 }}>🎁 {w.nightfall.weapon}</div>
            </div>
          )}
          {w.legendLostSector && (
            <div className="sched-card soon">
              <div className="sched-title">{t("legendLostSector")}</div>
              <div className="sched-status muted">{w.legendLostSector.name}</div>
              <div style={{ fontWeight: 700 }}>🎁 {t("exoticReward", { slot: w.legendLostSector.exoticSlot })}</div>
            </div>
          )}
          {w.featuredRaid && (
            <div className="sched-card">
              <div className="sched-title">{t("featuredRaid")}</div>
              <div style={{ fontWeight: 700 }}>{w.featuredRaid}</div>
            </div>
          )}
          {w.featuredDungeon && (
            <div className="sched-card">
              <div className="sched-title">{t("featuredDungeon")}</div>
              <div style={{ fontWeight: 700 }}>{w.featuredDungeon}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="notice" style={{ fontSize: "0.86rem" }}>
          {t("weeklyMissing")}{" "}
          <a href="https://www.bungie.net/7/en/News" target="_blank" rel="noopener noreferrer">Bungie TWID</a>,{" "}
          <a href="https://www.blueberries.gg/leveling/lost-sectors/" target="_blank" rel="noopener noreferrer">blueberries.gg</a>.
        </div>
      )}
    </>
  );
}

async function Vendors() {
  const t = await getTranslations("events");
  const token = await getValidAccessToken();
  if (!token) {
    return (
      <>
        <h2 style={{ marginTop: "2rem" }}>{t("vendors")}</h2>
        <div className="notice">
          <Link href="/api/auth/login">{t("vendorsLoginLink")}</Link> {t("vendorsLoginRest")}
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
      <h2 style={{ marginTop: "2rem" }}>{t("vendors")}</h2>
      {!vendors || vendors.length === 0 ? (
        <div className="empty">{t("noVendors")}</div>
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
