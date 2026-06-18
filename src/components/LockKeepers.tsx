"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LockKeepers({
  targets,
  characterId,
  membershipType,
  labels,
}: {
  targets: { instanceId: string; name: string }[];
  characterId: string;
  membershipType: number;
  labels: { lock: string; locking: string; none: string };
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const router = useRouter();

  if (targets.length === 0) return <span className="muted">{labels.none}</span>;

  async function lockAll() {
    setBusy(true);
    let ok = 0;
    for (const t of targets) {
      try {
        const r = await fetch("/api/gear/lock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: true, itemId: t.instanceId, characterId, membershipType }),
        });
        if (r.ok) ok++;
      } catch {
        /* sla over */
      }
      setDone(ok);
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <button type="button" className="btn btn-primary" disabled={busy} onClick={lockAll}>
      {busy ? `${labels.locking} ${done}/${targets.length}` : `🔒 ${labels.lock} (${targets.length})`}
    </button>
  );
}
