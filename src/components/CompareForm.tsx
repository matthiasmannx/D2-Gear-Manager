"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CompareForm({ a0, b0, labels }: { a0?: string; b0?: string; labels: { p1: string; p2: string; compare: string } }) {
  const router = useRouter();
  const [a, setA] = useState(a0 ?? "");
  const [b, setB] = useState(b0 ?? "");

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    if (a.trim() && b.trim()) router.push(`/compare?a=${encodeURIComponent(a.trim())}&b=${encodeURIComponent(b.trim())}`);
  };

  return (
    <form onSubmit={go} className="compare-form">
      <input value={a} onChange={(e) => setA(e.target.value)} placeholder={labels.p1} />
      <span className="compare-vs">vs</span>
      <input value={b} onChange={(e) => setB(e.target.value)} placeholder={labels.p2} />
      <button type="submit" className="btn btn-primary">{labels.compare}</button>
    </form>
  );
}
