import Link from "next/link";

const SECTIONS = [
  {
    href: "/items",
    title: "Items",
    desc: "Zoek door alle wapens, armor en mods uit de Destiny 2 database.",
  },
  {
    href: "/gear",
    title: "Gear",
    desc: "Bekijk je eigen characters en uitrusting (login vereist).",
  },
  {
    href: "/builds",
    title: "Meta Builds",
    desc: "Sterkste PvE- en PvP-builds voor de huidige seizoens-meta.",
  },
  {
    href: "/players",
    title: "Players",
    desc: "Zoek spelers en bekijk hun K/D, wins, Trials, Iron Banner en Flawless-count.",
  },
  {
    href: "/events",
    title: "Events Tracker",
    desc: "Wekelijkse reset, milestones, vendors en actieve activiteiten.",
  },
  {
    href: "/changelog",
    title: "Changelog",
    desc: "Destiny 2 updates, patches en rotaties — nieuwste bovenaan.",
  },
  {
    href: "/sandbox",
    title: "Buffs & Nerfs",
    desc: "Sandbox-wijzigingen volgens Bungie — buffs, nerfs en aanpassingen.",
  },
];

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <>
      <section className="hero">
        <span className="tag">Powered by de Bungie API</span>
        <h1>Guardian Hub</h1>
        <p className="muted" style={{ maxWidth: 600, fontSize: "1.05rem" }}>
          Je centrale plek voor Destiny 2: doorzoek items, beheer je gear, volg
          events en vind snel waar je moet zijn.
        </p>
      </section>

      <ErrorBanner searchParams={searchParams} />

      <div className="section-list" style={{ marginTop: "1.5rem" }}>
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="card card-link">
            <h3>{s.title}</h3>
            <p className="muted" style={{ margin: 0 }}>
              {s.desc}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}

async function ErrorBanner({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (!error) return null;
  return (
    <div className="notice error" style={{ marginTop: "1rem" }}>
      Er ging iets mis: {error}
    </div>
  );
}
