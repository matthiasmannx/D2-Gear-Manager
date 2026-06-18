import { getValidAccessToken } from "@/lib/auth";
import { loadGear, GearData } from "@/lib/gear";
import GearBoard from "@/components/GearBoard";
import { getTranslations } from "next-intl/server";

export const metadata = { title: "Gear · Guardian Hub" };

export default async function GearPage() {
  const t = await getTranslations("gear");
  const token = await getValidAccessToken();
  if (!token) return <LoginPrompt />;

  let data: GearData | null = null;
  let error: string | null = null;
  try {
    data = await loadGear(token);
  } catch (e: any) {
    error = e.message;
  }

  if (error) {
    return (
      <>
        <h1>{t("title")}</h1>
        <div className="notice error">{t("loadFailed", { error })}</div>
      </>
    );
  }
  if (!data || data.characters.length === 0) {
    return (
      <>
        <h1>{t("title")}</h1>
        <div className="empty">{t("noChars")}</div>
      </>
    );
  }

  return (
    <>
      <h1>{t("title")}</h1>
      <p className="muted">{t("intro", { name: data.name })}</p>
      <GearBoard
        characters={data.characters}
        vault={data.vault}
        membershipType={data.membershipType}
      />
    </>
  );
}

async function LoginPrompt() {
  const t = await getTranslations("gear");
  return (
    <>
      <h1>{t("title")}</h1>
      <div className="notice">{t("loginPrompt")}</div>
      <a href="/api/auth/login" className="btn" style={{ marginTop: "1rem" }}>
        {t("loginBtn")}
      </a>
    </>
  );
}
