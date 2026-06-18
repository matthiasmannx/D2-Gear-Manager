import Link from "next/link";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Loading } from "@/components/Skeleton";
import { getItemDetail } from "@/lib/itemDetail";

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
  return (
    <>
      <BackLink />
      <Suspense fallback={<Loading head cards={0} rows={3} />}>
        <ItemBody hash={hash} />
      </Suspense>
    </>
  );
}

async function ItemBody({ hash }: { hash: string }) {
  const t = await getTranslations("items");

  let item;
  try {
    item = await getItemDetail(hash);
  } catch (e: any) {
    return <div className="notice error">{t("loadFailed", { error: e.message })}</div>;
  }
  if (!item) {
    return <div className="empty">{t("notFound")}</div>;
  }

  const color = TIER_COLOR[item.tier] ?? "var(--text)";

  return (
    <>
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
        <h3>{t("howToGet")}</h3>
        {item.source ? (
          <p style={{ margin: 0 }}>{item.source}</p>
        ) : (
          <p className="muted" style={{ margin: 0 }}>{t("noSource")}</p>
        )}
        <p className="muted" style={{ fontSize: "0.82rem", marginTop: "0.7rem", marginBottom: 0 }}>
          {t("sourceNote")}{" "}
          <a
            href={`https://www.light.gg/db/items/${item.hash}/`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent-2)", fontWeight: 600 }}
          >
            {t("allSourcesLink")}
          </a>
        </p>
      </div>

      {/* Exotic trait */}
      {item.intrinsic && (
        <div className="card" style={{ marginTop: "1rem", borderLeft: `3px solid ${color}` }}>
          <h3 style={{ color }}>{t("exoticTrait")}</h3>
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

      {/* God rolls voor wapens, inline uit de wishlist */}
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
  const t = await getTranslations("items");
  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <h3>{t("godRolls")}</h3>
      {isExotic && <p className="muted" style={{ margin: 0 }}>{t("exoticNoRoll")}</p>}
      <a
        href={`https://www.light.gg/db/items/${hash}/`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "var(--accent-2)", fontWeight: 600, fontSize: "0.9rem", display: "inline-block", marginTop: "0.5rem" }}
      >
        {t("moreLightGg")}
      </a>
    </div>
  );
}

async function BackLink() {
  const t = await getTranslations("items");
  return (
    <Link href="/items" className="muted" style={{ display: "inline-block", marginBottom: "1rem" }}>
      {t("back")}
    </Link>
  );
}
