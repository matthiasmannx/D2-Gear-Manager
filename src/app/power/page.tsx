import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getValidAccessToken } from "@/lib/auth";
import { loadGear } from "@/lib/gear";
import { analyzePower, CharPower } from "@/lib/power";
import { Loading } from "@/components/Skeleton";

export const metadata = { title: "Power · Guardian Hub" };
export const dynamic = "force-dynamic";

const CLASS_NAMES: Record<number, string> = { 0: "Titan", 1: "Hunter", 2: "Warlock", 3: "Guardian" };

export default async function PowerPage() {
  const t = await getTranslations("power");
  return (
    <>
      <h1>{t("title")}</h1>
      <p className="muted">{t("intro")}</p>
      <Suspense fallback={<Loading cards={3} rows={3} />}>
        <PowerBody />
      </Suspense>
    </>
  );
}

async function PowerBody() {
  const t = await getTranslations("power");
  const token = await getValidAccessToken();
  if (!token) {
    return (
      <div className="notice" style={{ marginTop: "1rem" }}>
        {t("loginPrompt")} <a href="/api/auth/login" className="btn" style={{ marginLeft: "0.5rem" }}>{t("loginBtn")}</a>
      </div>
    );
  }
  let data;
  try {
    data = await loadGear(token);
  } catch (e: any) {
    return <div className="notice error">{e.message}</div>;
  }
  if (!data || data.characters.length === 0) return <div className="empty">{t("noChars")}</div>;

  return (
    <div className="power-grid">
      {analyzePower(data).map((c) => <PowerCard key={c.characterId} c={c} t={t} />)}
    </div>
  );
}

function PowerCard({ c, t }: { c: CharPower; t: (k: string, v?: any) => string }) {
  return (
    <div className="card power-card">
      <div className="power-banner" style={c.emblem ? { backgroundImage: `linear-gradient(90deg, rgba(11,14,20,0.85), rgba(11,14,20,0.5)), url(${c.emblem})` } : undefined}>
        <span className="power-class">{CLASS_NAMES[c.classType]}</span>
        <span className="power-now">
          {c.current}
          {c.totalGain > 0 && <span className="power-max"> → {c.max} <span className="power-gain">+{c.totalGain}</span></span>}
        </span>
      </div>
      <div className="power-slots">
        {c.slots.map((s) => (
          <div key={s.bucket} className={`power-slot ${s.upgrade > 0 ? "up" : "ok"}`}>
            {s.best?.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="item-icon" src={s.best.icon} alt="" />
            ) : (
              <div className="item-icon" />
            )}
            <div className="power-slot-info">
              <div className="power-slot-top">
                <span className="power-slot-label">{s.label}</span>
                <span className="power-slot-power">
                  {s.equipped?.power ?? 0}
                  {s.upgrade > 0 && <span className="power-arrow"> → {s.best?.power} <b>+{s.upgrade}</b></span>}
                </span>
              </div>
              <div className="power-slot-name muted">
                {s.upgrade > 0 ? <span className="power-equip">⤴ {s.best?.name}</span> : s.best?.name}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="muted power-note">{c.totalGain > 0 ? t("equipBest", { n: c.max }) : t("atMax")}</p>
    </div>
  );
}
