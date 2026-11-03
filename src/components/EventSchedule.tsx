"use client";

import { useLocale, useTranslations } from "next-intl";
import Countdown from "./Countdown";
import { nextDailyReset, nextWeeklyReset, weekendWindow } from "@/lib/schedule";

export interface IronBannerInfo {
  active: boolean;
  startDate?: string;
  endDate?: string;
  nextDate?: string;
}

export default function EventSchedule({ ironBanner }: { ironBanner: IronBannerInfo }) {
  const t = useTranslations("events");
  const locale = useLocale();
  const fmtDate = (iso?: string): string => {
    if (!iso) return "";
    try {
      return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(iso));
    } catch {
      return "";
    }
  };
  const daily = nextDailyReset().getTime();
  const weekly = nextWeeklyReset().getTime();
  const weekend = weekendWindow();

  return (
    <div className="sched-grid">
      <Card title={t("dailyReset")} status={t("statusIn")} live>
        <Countdown to={daily} />
      </Card>
      <Card title={t("weeklyReset")} status={t("weeklyStatus")} live>
        <Countdown to={weekly} />
      </Card>

      <Card
        title={t("trials")}
        status={weekend.active ? t("trialsLive") : t("trialsSoon")}
        accent={weekend.active ? "live" : "soon"}
      >
        <Countdown to={(weekend.active ? weekend.end : weekend.start).getTime()} />
      </Card>

      <Card
        title={t("ironBanner")}
        status={
          ironBanner.active
            ? t("ibActive", { date: fmtDate(ironBanner.endDate) })
            : ironBanner.nextDate
            ? t("ibStart", { date: fmtDate(ironBanner.nextDate) })
            : t("ibUnknown")
        }
        accent={ironBanner.active ? "live" : ironBanner.nextDate ? "soon" : "off"}
      >
        {ironBanner.active && ironBanner.endDate ? (
          <Countdown to={ironBanner.endDate} />
        ) : ironBanner.nextDate ? (
          <Countdown to={ironBanner.nextDate} />
        ) : (
          <span className="cd muted">-</span>
        )}
      </Card>

      <Card
        title={t("xur")}
        status={weekend.active ? t("xurLive") : t("xurSoon")}
        accent={weekend.active ? "live" : "soon"}
      >
        <Countdown to={(weekend.active ? weekend.end : weekend.start).getTime()} />
      </Card>
    </div>
  );
}

function Card({
  title,
  status,
  children,
  live,
  accent,
}: {
  title: string;
  status: string;
  children: React.ReactNode;
  live?: boolean;
  accent?: "live" | "soon" | "off";
}) {
  return (
    <div className={`sched-card ${accent ?? ""}`}>
      <div className="sched-title">{title}</div>
      <div className="sched-status muted">{status}</div>
      <div className="sched-cd">{children}</div>
    </div>
  );
}
