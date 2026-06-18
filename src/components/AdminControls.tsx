"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { setFlagsAction } from "@/app/community/actions";

export default function AdminControls({ buildId, verified, featured }: { buildId: string; verified: boolean; featured: boolean }) {
  const t = useTranslations("community");
  const router = useRouter();
  const [pending, start] = useTransition();

  const toggle = (flags: { verified?: boolean; featured?: boolean }) =>
    start(async () => { await setFlagsAction(buildId, flags); router.refresh(); });

  return (
    <div className="cb-admin">
      <span className="muted">{t("adminTitle")}:</span>
      <button type="button" className={`cb-btn ${verified ? "on" : ""}`} disabled={pending} onClick={() => toggle({ verified: !verified })}>✅ {t("verifiedBadge")}</button>
      <button type="button" className={`cb-btn ${featured ? "on" : ""}`} disabled={pending} onClick={() => toggle({ featured: !featured })}>🔥 {t("featuredBadge")}</button>
    </div>
  );
}
