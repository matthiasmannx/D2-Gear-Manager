import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getValidAccessToken } from "@/lib/auth";
import { getWeeklyChecklist, ChecklistItem } from "@/lib/checklist";
import { nextWeeklyReset } from "@/lib/schedule";
import { Loading } from "@/components/Skeleton";
import Countdown from "@/components/Countdown";

export const metadata = { title: "Weekly · Guardian Hub" };
export const dynamic = "force-dynamic";

export default async function WeeklyPage() {
  const t = await getTranslations("weekly");
  return (
    <>
      <h1>{t("title")}</h1>
      <p className="muted">{t("intro")}</p>
      <Suspense fallback={<Loading head={false} cards={0} rows={6} />}>
        <WeeklyBody />
      </Suspense>
    </>
  );
}

async function WeeklyBody() {
  const t = await getTranslations("weekly");
  const token = await getValidAccessToken();
  if (!token) {
    return (
      <div className="notice" style={{ marginTop: "1rem" }}>
        {t("loginPrompt")} <a href="/api/auth/login" className="btn" style={{ marginLeft: "0.5rem" }}>{t("loginBtn")}</a>
      </div>
    );
  }
  let items: ChecklistItem[] = [];
  try {
    items = await getWeeklyChecklist(token);
  } catch (e: any) {
    return <div className="notice error">{e.message}</div>;
  }
  if (items.length === 0) return <div className="empty">{t("none")}</div>;

  const done = items.filter((i) => i.done).length;

  return (
    <>
      <div className="weekly-bar">
        <span className="weekly-count">{done} / {items.length} ✓</span>
        <span className="muted">{t("resetIn")} <Countdown to={nextWeeklyReset().getTime()} /></span>
      </div>
      <div className="weekly-list">
        {items.map((it) => (
          <div key={it.hash} className={`card weekly-row ${it.done ? "is-done" : ""}`}>
            <span className="weekly-check">{it.done ? "✓" : "○"}</span>
            {it.icon && /* eslint-disable-next-line @next/next/no-img-element */ <img className="item-icon" src={it.icon} alt="" />}
            <div className="weekly-info">
              <div className="weekly-name">{it.name}</div>
              {it.description && <div className="muted weekly-desc">{it.description}</div>}
            </div>
          </div>
        ))}
      </div>
      <p className="muted" style={{ fontSize: "0.78rem", marginTop: "0.8rem" }}>{t("note")}</p>
    </>
  );
}
