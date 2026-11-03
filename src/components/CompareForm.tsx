"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import PlayerPicker, { Picked } from "@/components/PlayerPicker";

export default function CompareForm({ labels }: { labels: { p1: string; p2: string; compare: string } }) {
  const router = useRouter();
  const t = useTranslations("compare");
  const [a, setA] = useState<Picked | null>(null);
  const [b, setB] = useState<Picked | null>(null);
  const agoLabel = (n: number) => t("ago", { n });

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    if (a && b) router.push(`/compare?a=${encodeURIComponent(a.ref)}&b=${encodeURIComponent(b.ref)}`);
  };

  return (
    <form onSubmit={go} className="compare-form">
      <PlayerPicker placeholder={labels.p1} onPick={setA} agoLabel={agoLabel} />
      <span className="compare-vs">vs</span>
      <PlayerPicker placeholder={labels.p2} onPick={setB} agoLabel={agoLabel} />
      <button type="submit" className="btn btn-primary" disabled={!a || !b}>{labels.compare}</button>
    </form>
  );
}
