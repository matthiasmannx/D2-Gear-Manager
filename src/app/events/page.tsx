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

export const metadata = { title: "Events Tracker · Guardian Hub" };
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
    // Groep (raid/dungeon) leiden we af uit de banner/naam, geen extra fetch.
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

const TIER_COLOR: Record<string, string> = {
  Exotic: "#ceae33",
  Legendary: "#b58cf6",
  Rare: "#5076a3",
  Uncommon: "#5b9e4d",
  Common: "#c3bcb4",
};

interface CatLabels {
  weapons: string;
  armor: string;
  titan: string;
  hunter: string;
  warlock: string;
  other: string;
  free: string;
}

// Elementen — subclass-items (Aspects/Supers/Melees…) hebben dit in hun type,
// bv. "Arc Melee", "Void Aspect". Zo groeperen we ze per subclass.
const ELEMENTS = ["Arc", "Solar", "Void", "Stasis", "Strand", "Prismatic", "Kinetic"];

// In welke sub-groep valt een vendor-item?
function bucketOf(it: { itemType: number; classType: number; type: string; subcat?: string }): string {
  if (it.subcat) return it.subcat; // bron-element/categorie (Ikora)
  if (it.itemType === 3) return "weapons";
  if (it.itemType === 2) return "armor";
  const el = ELEMENTS.find((e) => (it.type || "").startsWith(e));
  if (el) return el; // per element (subclass)
  if (it.classType === 0) return "titan";
  if (it.classType === 1) return "hunter";
  if (it.classType === 2) return "warlock";
  return "other";
}
const BUCKET_RANK: Record<string, number> = {
  weapons: 0, armor: 1,
  Arc: 2, Solar: 3, Void: 4, Stasis: 5, Strand: 6, Prismatic: 7, Kinetic: 8,
  Supers: 10, "Class Abilities": 11, Aspects: 12, Fragments: 13, Grenades: 14, Melees: 15, Movement: 16,
  titan: 30, hunter: 31, warlock: 32, other: 99,
};
const rankBucket = (k: string) => BUCKET_RANK[k] ?? 50;

function bucketLabel(key: string, labels: CatLabels): string {
  if (key === "weapons") return labels.weapons;
  if (key === "armor") return labels.armor;
  if (key === "titan") return labels.titan;
  if (key === "hunter") return labels.hunter;
  if (key === "warlock") return labels.warlock;
  if (key === "other") return labels.other;
  return key; // element-naam (Arc/Solar/…)
}

async function Vendors() {
  const t = await getTranslations("events");
  const tg = await getTranslations("gear");
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

  const labels: CatLabels = {
    weapons: tg("weapons"),
    armor: tg("armor"),
    titan: "Titan",
    hunter: "Hunter",
    warlock: "Warlock",
    other: t("vendorOther"),
    free: t("free"),
  };

  // Groeperen op locatie: Tower ("The Last City") eerst, daarna planeten.
  const groups = new Map<string, VendorView[]>();
  for (const v of vendors ?? []) {
    const key = v.location || labels.other;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(v);
  }
  const rank = (loc: string) =>
    loc === "The Last City" ? 0 : loc === "Ikora Rey" ? 1 : loc === "Monument to Lost Lights" ? 2 : loc === labels.other ? 99 : 50;
  const order = [...groups.keys()].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });

  return (
    <>
      <h2 style={{ marginTop: "2rem" }}>{t("vendors")}</h2>
      {!vendors || vendors.length === 0 ? (
        <div className="empty">{t("noVendors")}</div>
      ) : (
        order.map((loc) => (
          <section key={loc} style={{ marginTop: "1rem" }}>
            <h3 className="vendor-loc-h">{loc}</h3>
            {groups.get(loc)!.map((v) => (
              <VendorCard key={v.hash} v={v} labels={labels} />
            ))}
          </section>
        ))
      )}
    </>
  );
}

function VendorCard({ v, labels }: { v: VendorView; labels: CatLabels }) {
  const exotics = v.items.filter((it) => it.tier === "Exotic").length;
  const legendaries = v.items.filter((it) => it.tier === "Legendary").length;

  return (
    <details className="vendor-details">
      <summary className="vendor-summary" style={v.banner ? { backgroundImage: `linear-gradient(90deg, rgba(20,25,37,0.92), rgba(20,25,37,0.55)), url(${v.banner})` } : undefined}>
        {v.icon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.icon} alt="" className="vendor-icon" />
        )}
        <span className="vendor-name">{v.name}</span>
        <span className="muted vendor-count">
          {v.items.length}
          {exotics > 0 && <span className="vendor-ex"> · ✦{exotics}</span>}
          {legendaries > 0 && <span className="vendor-leg"> · {legendaries}L</span>}
        </span>
        <span className="vendor-chevron">▸</span>
      </summary>
      <div className="vendor-body">
        {[...new Set(v.items.map(bucketOf))].sort((a, b) => rankBucket(a) - rankBucket(b)).map((bk) => {
          const group = v.items.filter((it) => bucketOf(it) === bk);
          if (group.length === 0) return null;
          return (
            <div key={bk} className="vendor-cat">
              <span className="vendor-cat-h">{bucketLabel(bk, labels)}</span>
              <div className="grid">
                {group.map((it) => (
                  <Link
                    key={it.hash}
                    href={`/items/${it.hash}`}
                    className={`card card-link vendor-item ${it.tier === "Exotic" ? "is-exotic" : ""}`}
                    style={{ borderLeft: `3px solid ${TIER_COLOR[it.tier] ?? "var(--border)"}` }}
                  >
                    <div className="item">
                      {it.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="item-icon" src={it.icon} alt="" />
                      ) : (
                        <div className="item-icon" />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div className="item-name">{it.name}</div>
                        <div className="item-type">{[it.tier, it.type].filter(Boolean).join(" · ")}</div>
                        {it.cost.length > 0 ? (
                          <div className="vendor-cost">
                            {it.cost.map((c, i) => (
                              <span key={i} className="vendor-cost-i">
                                {c.icon && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={c.icon} alt="" />
                                )}
                                {c.quantity.toLocaleString()} {c.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="vendor-cost vendor-free">{labels.free}</div>
                        )}
                        {it.requirement && <div className="vendor-req">🔒 {it.requirement}</div>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );
}
