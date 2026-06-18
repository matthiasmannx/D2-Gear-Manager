import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { sectionColor } from "@/lib/sectionColors";
import Brand from "@/components/Brand";

const SECTION_KEYS = ["items", "gear", "builds", "players", "profile", "events", "changelog", "sandbox"] as const;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const t = await getTranslations("home");
  return (
    <>
      <section className="home-hero">
        <span className="tag">{t("tag")}</span>
        <h1 className="home-title"><Brand /></h1>
        <p className="muted">{t("intro")}</p>
      </section>

      <ErrorBanner searchParams={searchParams} />

      <div className="home-cards">
        {SECTION_KEYS.map((key) => {
          const href = `/${key}`;
          return (
            <Link
              key={href}
              href={href}
              className="home-card"
              style={{ ["--c" as string]: sectionColor(href) } as React.CSSProperties}
            >
              <span className="home-card-dot" />
              <h3>{t(`sections.${key}.title`)}</h3>
              <p className="muted">{t(`sections.${key}.desc`)}</p>
              <span className="home-card-go">{t("open")}</span>
            </Link>
          );
        })}
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
  const t = await getTranslations("home");
  return (
    <div className="notice error" style={{ marginTop: "1rem" }}>
      {t("error", { error })}
    </div>
  );
}
