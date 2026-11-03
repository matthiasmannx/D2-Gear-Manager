import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getPlayerBuild, PlayerBuild, BuildCharacter, CLASS_NAMES } from "@/lib/playerBuild";

export const metadata = { title: "Build · Guardian Hub" };

const CLASS_COLOR: Record<number, string> = { 0: "#e0564b", 1: "#4aa3c7", 2: "#e8a13a", 3: "#888" };

export default async function PlayerBuildPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  const t = await getTranslations("players");

  let build: PlayerBuild | null = null;
  let error: string | null = null;
  try {
    build = await getPlayerBuild(Number(type), id);
  } catch (e: any) {
    error = e.message;
  }

  return (
    <>
      <Link href={`/players/${type}/${id}`} className="muted" style={{ display: "inline-block", marginBottom: "1rem" }}>
        {t("buildBack")}
      </Link>
      <h1 style={{ marginBottom: 0 }}>{t("buildTitle")}{build?.name ? ` · ${build.name}` : ""}</h1>
      <div className="notice" style={{ marginTop: "0.5rem", fontSize: "0.82rem" }}>
        {t("buildNote")}
      </div>

      {error || !build ? (
        <div className="notice error" style={{ marginTop: "1rem" }}>{t("buildLoadFailed")}</div>
      ) : (
        build.characters.map((c, i) => <CharBuild key={i} c={c} />)
      )}
    </>
  );
}

function CharBuild({ c }: { c: BuildCharacter }) {
  const color = CLASS_COLOR[c.classType] ?? "var(--accent)";
  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h3 className="class-head" style={{ borderColor: color, color }}>
        {CLASS_NAMES[c.classType]} <span className="muted" style={{ fontSize: "0.8rem", fontWeight: 400 }}>· ◆ {c.light}</span>
      </h3>
      <div className="build-items">
        {c.items.map((it) => (
          <Link key={it.slot} href={`/items/${it.hash}`} className="bi-row">
            {it.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.icon} alt="" className="bi-icon" />
            ) : (
              <div className="bi-icon" />
            )}
            <div className="bi-info">
              <div className="bi-top">
                <span className="bi-slot muted">{it.slot}</span>
                <span className="bi-name">{it.name}</span>
                {it.power != null && <span className="bi-power">⚡{it.power}</span>}
              </div>
              {it.stats.length > 0 && (
                <div className="bi-stats">
                  {it.stats.map((s) => (
                    <span key={s.name} className="bi-stat">
                      <span className="muted">{s.name}</span> <b>{s.value}</b>
                    </span>
                  ))}
                </div>
              )}
              {it.perks.length > 0 && (
                <div className="bi-perks">
                  {it.perks.map((p) => (
                    <span key={p} className="perk-chip">{p}</span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
