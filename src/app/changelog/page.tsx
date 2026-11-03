import { getTranslations, getLocale } from "next-intl/server";
import { CHANGELOG, ChangeEntry } from "@/lib/changelog";
import { SANDBOX_CHANGES, SandboxChange, ChangeKind } from "@/lib/sandbox";

export const metadata = { title: "Changelog · Guardian Hub" };

const TAG_COLOR: Record<string, string> = {
  Major: "#f5a623",
  Hotfix: "#4a9eff",
  Event: "#e0564b",
  Rotation: "#38d39f",
};
const KIND_META: Record<ChangeKind, { cls: string; icon: string }> = {
  buff: { cls: "buff", icon: "▲" },
  nerf: { cls: "nerf", icon: "▼" },
  change: { cls: "change", icon: "↔" },
};

export default async function ChangelogPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const t = await getTranslations("changelog");
  const ts = await getTranslations("sandbox");
  const locale = await getLocale();

  const active = (["buff", "nerf", "change"] as const).includes(kind as any) ? (kind as ChangeKind) : "all";
  const sandbox = SANDBOX_CHANGES.filter((c) => active === "all" || c.kind === active);
  const counts = {
    buff: SANDBOX_CHANGES.filter((c) => c.kind === "buff").length,
    nerf: SANDBOX_CHANGES.filter((c) => c.kind === "nerf").length,
    change: SANDBOX_CHANGES.filter((c) => c.kind === "change").length,
  };

  return (
    <>
      <h1>{t("title")}</h1>
      <p className="muted">{t("intro")}</p>

      <div className="timeline">
        {CHANGELOG.map((e, i) => (
          <Entry key={i} e={e} locale={locale} patchNotes={t("patchNotes")} />
        ))}
      </div>

      {/* Buffs & Nerfs, samengevoegd, hoort bij de patches */}
      <h2 style={{ marginTop: "2.5rem" }}>{ts("title")}</h2>
      <p className="muted">{ts("intro")}</p>
      <div className="notice" style={{ marginTop: "0.5rem", fontSize: "0.82rem" }}>{ts("note")}</div>

      <div className="build-tabs">
        <Tab k="all" label={ts("tabAll", { n: SANDBOX_CHANGES.length })} active={active} />
        <Tab k="buff" label={`▲ ${ts("tabBuffs", { n: counts.buff })}`} active={active} />
        <Tab k="nerf" label={`▼ ${ts("tabNerfs", { n: counts.nerf })}`} active={active} />
        <Tab k="change" label={`↔ ${ts("tabChange", { n: counts.change })}`} active={active} />
      </div>

      <div className="section-list" style={{ marginTop: "1.25rem" }}>
        {sandbox.map((c, i) => (
          <SbCard key={i} c={c} label={ts(c.kind)} patchNotes={ts("patchNotes")} />
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

function Tab({ k, label, active }: { k: string; label: string; active: string }) {
  return (
    <a href={k === "all" ? "/changelog" : `/changelog?kind=${k}`} className={`build-tab ${active === k ? "active" : ""}`}>
      {label}
    </a>
  );
}

function SbCard({ c, label, patchNotes }: { c: SandboxChange; label: string; patchNotes: string }) {
  const k = KIND_META[c.kind];
  return (
    <article className={`sb-card ${k.cls}`}>
      <div className="sb-head">
        <span className={`sb-badge ${k.cls}`}>{k.icon} {label}</span>
        <span className="tag">{c.category}</span>
        <span className="muted" style={{ fontSize: "0.78rem", marginLeft: "auto" }}>{c.version}</span>
      </div>
      <h3 style={{ margin: "0.4rem 0 0.2rem" }}>{c.subject}</h3>
      <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>{c.note}</p>
      {c.url && (
        <a href={c.url} target="_blank" rel="noopener noreferrer" className="muted" style={{ fontSize: "0.78rem" }}>
          {patchNotes}
        </a>
      )}
    </article>
  );
}
