import { Suspense } from "react";
import { getValidAccessToken } from "@/lib/auth";
import { loadGear, GearData } from "@/lib/gear";
import GearBoard from "@/components/GearBoard";
import { Loading } from "@/components/Skeleton";
import { getTranslations } from "next-intl/server";

export const metadata = { title: "Gear · Guardian Hub" };

export default async function GearPage() {
  const t = await getTranslations("gear");
  return (
    <>
      <h1>{t("title")}</h1>
      <Suspense fallback={<Loading head={false} cards={4} rows={3} />}>
        <GearContent />
      </Suspense>
    </>
  );
}

async function GearContent() {
  const t = await getTranslations("gear");
  const token = await getValidAccessToken();
  if (!token) {
    return (
      <>
        <div className="notice">{t("loginPrompt")}</div>
        <a href="/api/auth/login" className="btn" style={{ marginTop: "1rem" }}>
          {t("loginBtn")}
        </a>
      </>
    );
  }

  let data: GearData | null = null;
  let error: string | null = null;
  try {
    data = await loadGear(token);
  } catch (e: any) {
    error = e.message;
  }

  if (error) return <div className="notice error">{t("loadFailed", { error })}</div>;
  if (!data || data.characters.length === 0) return <div className="empty">{t("noChars")}</div>;

  return (
    <>
      <p className="muted">{t("intro", { name: data.name })}</p>
      <GearBoard characters={data.characters} vault={data.vault} membershipType={data.membershipType} />
    </>
  );
}
