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

    // Eén parallelle golf per milestone: milestone-def + activity-def tegelijk.
    // Groep (raid/dungeon) leiden we af uit de banner/naam — geen extra fetch.
    const built = await Promise.all(
      list.map(async (m): Promise<MilestoneView | null> => {
        const actHash = m.activities?.[0]?.activityHash;
        const [def, ad] = await Promise.all([
          getEntityDefinition("DestinyMilestoneDefinition", m.milestoneHash).catch(() => null),
          actHash ? getEntityDefinition("DestinyActivityDefinition", actHash).catch(() => null) : Promise.resolve(null),
        ]);
        if (!def?.displayProperties?.name) return null;

        let activity: string | undefined;
        let power: number | undefined;
        let banner: string | undefined;
        let group: "raid" | "dungeon" | "weekly" = "weekly";
        const lootHashes: number[] = [];
        if (ad) {
          activity = ad.displayProperties?.name;
          const lvl = ad.activityLightLevel;
          if (lvl && lvl > 100) power = lvl;
          if (ad.pgcrImage) banner = icon(ad.pgcrImage) ?? undefined;
          for (const block of ad.rewards ?? []) {
            for (const ri of block.rewardItems ?? []) {
              if (ri.itemHash) lootHashes.push(ri.itemHash);
            }
          }
          const probe = `${ad.displayProperties?.name ?? ""} ${ad.pgcrImage ?? ""}`.toLowerCase();
          if (/raid/.test(probe)) group = "raid";
          else if (/dungeon/.test(probe)) group = "dungeon";
        }

        const rewardHashes: number[] = [];
        for (const cat of Object.values<any>(def.rewards ?? {})) {
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
          name: def.displayProperties.name,
          icon: icon(def.displayProperties.icon),
          description: def.displayProperties.description ?? "",
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
    milestones = built.filter((m): m is MilestoneView => m !== null);

    // Iron Banner: actief (milestone aanwezig) of komende datum uit de lijst.
    const ibBuilt = milestones.find((b) => /iron banner/i.test(b.name));
    if (ibBuilt) {
      const ibRaw = list.find((m) => m.milestoneHash === ibBuilt.hash);
      ironBanner = { active: true, startDate: ibRaw?.startDate, endDate: ibBuilt.endDate };
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
  // Niets tonen als er geen weekly-data is (lege placeholder verbergen).
  if (!has) return null;
  return (
    <>
      <h2 style={{ marginTop: "2rem" }}>{t("thisWeek")}</h2>
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
