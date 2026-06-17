import { getTranslations } from "next-intl/server";
import { SANDBOX_CHANGES, SandboxChange, ChangeKind } from "@/lib/sandbox";

export const metadata = { title: "Buffs & Nerfs — Guardian Hub" };

const KIND_META: Record<ChangeKind, { cls: string; icon: string }> = {
  buff: { cls: "buff", icon: "▲" },
  nerf: { cls: "nerf", icon: "▼" },
  change: { cls: "change", icon: "↔" },
};

export default async function SandboxPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const active = (["buff", "nerf", "change"] as const).includes(kind as any) ? (kind as ChangeKind) : "all";
  const t = await getTranslations("sandbox");

  const list = SANDBOX_CHANGES.filter((c) => active === "all" || c.kind === active);
  const counts = {
    buff: SANDBOX_CHANGES.filter((c) => c.kind === "buff").length,
    nerf: SANDBOX_CHANGES.filter((c) => c.kind === "nerf").length,
    change: SANDBOX_CHANGES.filter((c) => c.kind === "change").length,
  };

  return (
    <>
      <h1>{t("title")}</h1>
      <p className="muted">{t("intro")}</p>
      <div className="notice" style={{ marginTop: "0.5rem", fontSize: "0.82rem" }}>{t("note")}</div>

      <div className="build-tabs">
        <Tab k="all" label={t("tabAll", { n: SANDBOX_CHANGES.length })} active={active} />
        <Tab k="buff" label={`▲ ${t("tabBuffs", { n: counts.buff })}`} active={active} />
        <Tab k="nerf" label={`▼ ${t("tabNerfs", { n: counts.nerf })}`} active={active} />
        <Tab k="change" label={`↔ ${t("tabChange", { n: counts.change })}`} active={active} />
      </div>

      <div className="section-list" style={{ marginTop: "1.25rem" }}>
        {list.map((c, i) => (
          <Card key={i} c={c} label={t(c.kind)} patchNotes={t("patchNotes")} />
        ))}
      </div>
    </>
  );
}

function Tab({ k, label, active }: { k: string; label: string; active: string }) {
  return (
    <a href={k === "all" ? "/sandbox" : `/sandbox?kind=${k}`} className={`build-tab ${active === k ? "active" : ""}`}>
      {label}
    </a>
  );
}

function Card({ c, label, patchNotes }: { c: SandboxChange; label: string; patchNotes: string }) {
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
