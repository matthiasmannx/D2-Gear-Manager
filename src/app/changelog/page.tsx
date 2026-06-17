import { getTranslations, getLocale } from "next-intl/server";
import { CHANGELOG, ChangeEntry } from "@/lib/changelog";

export const metadata = { title: "Changelog — Guardian Hub" };

const TAG_COLOR: Record<string, string> = {
  Major: "#f5a623",
  Hotfix: "#4a9eff",
  Event: "#e0564b",
  Rotatie: "#38d39f",
};

export default async function ChangelogPage() {
  const t = await getTranslations("changelog");
  const locale = await getLocale();
  return (
    <>
      <h1>{t("title")}</h1>
      <p className="muted">{t("intro")}</p>

      <div className="timeline">
        {CHANGELOG.map((e, i) => (
          <Entry key={i} e={e} locale={locale} patchNotes={t("patchNotes")} />
        ))}
      </div>
    </>
  );
}

function Entry({ e, locale, patchNotes }: { e: ChangeEntry; locale: string; patchNotes: string }) {
  const color = TAG_COLOR[e.tag ?? ""] ?? "var(--accent)";
  const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(e.date));
  return (
    <div className="tl-entry" style={{ ["--tl-color" as any]: color }}>
      <div className="tl-dot" />
      <div className="tl-card">
        <div className="tl-head">
          {e.tag && <span className="tl-tag" style={{ background: color }}>{e.tag}</span>}
          <span className="tl-version">{e.version}</span>
          <span className="muted tl-date">{date}</span>
        </div>
        <h3 style={{ margin: "0.3rem 0" }}>{e.title}</h3>
        <p className="muted" style={{ marginTop: 0 }}>{e.summary}</p>
        {e.highlights.length > 0 && (
          <ul className="tl-highlights">
            {e.highlights.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        )}
        {e.url && (
          <a href={e.url} target="_blank" rel="noopener noreferrer" className="muted" style={{ fontSize: "0.82rem" }}>
            {patchNotes}
          </a>
        )}
      </div>
    </div>
  );
}
