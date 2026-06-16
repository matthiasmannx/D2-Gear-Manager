import { SANDBOX_CHANGES, SandboxChange, ChangeKind } from "@/lib/sandbox";

export const metadata = { title: "Buffs & Nerfs — Guardian Hub" };

const KIND: Record<ChangeKind, { label: string; cls: string; icon: string }> = {
  buff: { label: "Buff", cls: "buff", icon: "▲" },
  nerf: { label: "Nerf", cls: "nerf", icon: "▼" },
  change: { label: "Aangepast", cls: "change", icon: "↔" },
};

export default async function SandboxPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const active = (["buff", "nerf", "change"] as const).includes(kind as any) ? (kind as ChangeKind) : "all";

  const list = SANDBOX_CHANGES.filter((c) => active === "all" || c.kind === active);
  const counts = {
    buff: SANDBOX_CHANGES.filter((c) => c.kind === "buff").length,
    nerf: SANDBOX_CHANGES.filter((c) => c.kind === "nerf").length,
    change: SANDBOX_CHANGES.filter((c) => c.kind === "change").length,
  };

  return (
    <>
      <h1>Buffs &amp; Nerfs</h1>
      <p className="muted">Sandbox-wijzigingen volgens Bungie's patch notes.</p>
      <div className="notice" style={{ marginTop: "0.5rem", fontSize: "0.82rem" }}>
        Redactioneel (de API levert geen patch notes). Vraag mij "ververs de buffs en nerfs" om dit per update bij te werken.
      </div>

      <div className="build-tabs">
        <Tab k="all" label={`Alles (${SANDBOX_CHANGES.length})`} active={active} />
        <Tab k="buff" label={`▲ Buffs (${counts.buff})`} active={active} />
        <Tab k="nerf" label={`▼ Nerfs (${counts.nerf})`} active={active} />
        <Tab k="change" label={`↔ Aangepast (${counts.change})`} active={active} />
      </div>

      <div className="section-list" style={{ marginTop: "1.25rem" }}>
        {list.map((c, i) => (
          <Card key={i} c={c} />
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

function Card({ c }: { c: SandboxChange }) {
  const k = KIND[c.kind];
  return (
    <article className={`sb-card ${k.cls}`}>
      <div className="sb-head">
        <span className={`sb-badge ${k.cls}`}>{k.icon} {k.label}</span>
        <span className="tag">{c.category}</span>
        <span className="muted" style={{ fontSize: "0.78rem", marginLeft: "auto" }}>{c.version}</span>
      </div>
      <h3 style={{ margin: "0.4rem 0 0.2rem" }}>{c.subject}</h3>
      <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>{c.note}</p>
      {c.url && (
        <a href={c.url} target="_blank" rel="noopener noreferrer" className="muted" style={{ fontSize: "0.78rem" }}>
          Patch notes ↗
        </a>
      )}
    </article>
  );
}
