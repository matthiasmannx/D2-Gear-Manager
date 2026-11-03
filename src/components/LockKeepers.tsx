"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  if (targets.length === 0) return <span className="muted">{labels.none}</span>;

  async function tryLock(instanceId: string): Promise<boolean> {
    try {
      const r = await fetch("/api/gear/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: true, itemId: instanceId, characterId, membershipType }),
      });
      return r.ok;
    } catch {
      return false;
    }
  }

  async function lockAll() {
    setBusy(true);
    setResult(null);
    let ok = 0;
    const failed: string[] = [];
    // Rustig aan i.v.m. Bungie-rate-limit: ~300ms tussen acties.
    for (const t of targets) {
      if (await tryLock(t.instanceId)) ok++;
      else failed.push(t.instanceId);
      setDone(ok);
      await sleep(300);
    }
    // Eén retry-ronde voor de gefaalde (meestal throttling).
    for (const id of [...failed]) {
      await sleep(500);
      if (await tryLock(id)) {
        ok++;
        failed.splice(failed.indexOf(id), 1);
        setDone(ok);
      }
    }
    setBusy(false);
    setResult(`${ok}/${targets.length}`);
    router.refresh();
  }

  return (
    <span className="lock-keepers">
      <button type="button" className="btn btn-primary" disabled={busy} onClick={lockAll}>
        {busy ? `${labels.locking} ${done}/${targets.length}` : `🔒 ${labels.lock} (${targets.length})`}
      </button>
      {result && <span className="muted lock-result">🔒 {result}</span>}
    </span>
  );
}
