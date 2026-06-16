"use client";

import Countdown from "./Countdown";
import { nextDailyReset, nextWeeklyReset, weekendWindow } from "@/lib/schedule";

export interface IronBannerInfo {
  active: boolean;
  startDate?: string;
  endDate?: string;
  nextDate?: string;
}

function fmtDate(iso?: string): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(new Date(iso));
  } catch {
    return "";
  }
}

export default function EventSchedule({ ironBanner }: { ironBanner: IronBannerInfo }) {
  const daily = nextDailyReset().getTime();
  const weekly = nextWeeklyReset().getTime();
  const weekend = weekendWindow();

  return (
    <div className="sched-grid">
      <Card title="Dagelijkse reset" status="In" live>
        <Countdown to={daily} />
      </Card>
      <Card title="Wekelijkse reset" status="Dinsdag · in" live>
        <Countdown to={weekly} />
      </Card>

      <Card
        title="Trials of Osiris"
        status={weekend.active ? "Live · sluit over" : "Begint vrijdag · over"}
        accent={weekend.active ? "live" : "soon"}
      >
        <Countdown to={(weekend.active ? weekend.end : weekend.start).getTime()} />
      </Card>

      <Card
        title="Iron Banner"
        status={
          ironBanner.active
            ? `Actief · t/m ${fmtDate(ironBanner.endDate)} · sluit over`
            : ironBanner.nextDate
            ? `Start ${fmtDate(ironBanner.nextDate)} · over`
            : "Datum nog niet bekend (TWID)"
        }
        accent={ironBanner.active ? "live" : ironBanner.nextDate ? "soon" : "off"}
      >
        {ironBanner.active && ironBanner.endDate ? (
          <Countdown to={ironBanner.endDate} />
        ) : ironBanner.nextDate ? (
          <Countdown to={ironBanner.nextDate} />
        ) : (
          <span className="cd muted">—</span>
        )}
      </Card>

      <Card
        title="Xûr"
        status={weekend.active ? "Hier · vertrekt over" : "Komt vrijdag · over"}
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
