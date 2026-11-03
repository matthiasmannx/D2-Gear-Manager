import Link from "next/link";
import type { CommunityBuild } from "@/lib/communityBuilds";

const SUBCLASS_COLOR: Record<string, string> = {
  Solar: "#f0762b", Arc: "#7ae0ff", Void: "#b184df", Strand: "#35e36e", Stasis: "#4d88ff", Prismatic: "#d59bff",
};

export interface CardLabels {
  by: string;
  views: string;
  verifiedBadge: string;
  featuredBadge: string;
}

export default function BuildCard({ build, labels, rank }: { build: CommunityBuild; labels: CardLabels; rank?: number }) {
  const color = SUBCLASS_COLOR[build.subclass] ?? "var(--accent)";
  const exotic = build.loadout?.exoticArmor;
  return (
    <Link href={`/community/${build.id}`} className="bc" style={{ ["--sc" as string]: color } as React.CSSProperties}>
      {rank != null && <span className="bc-rank">#{rank}</span>}
      <span className="bc-bar" />
      <div className="bc-head">
        {exotic?.icon && /* eslint-disable-next-line @next/next/no-img-element */ <img className="bc-exotic" src={exotic.icon} alt="" />}
        <div style={{ minWidth: 0 }}>
          <div className="bc-title">{build.title}</div>
          <div className="bc-sub muted">{build.subclass} {build.guardianClass}{build.super ? ` · ${build.super}` : ""}</div>
        </div>
      </div>
      <div className="bc-tags">
        {build.verified && <span className="bc-badge verified">✅ {labels.verifiedBadge}</span>}
        {build.featured && <span className="bc-badge featured">🔥 {labels.featuredBadge}</span>}
        {build.activities.slice(0, 3).map((a) => <span key={a} className={`bc-tag ${a === "PvE" ? "pve" : a === "PvP" ? "pvp" : ""}`}>{a}</span>)}
      </div>
      <div className="bc-foot muted">
        <span>▲ {build.likes}</span>
        <span>★ {build.favorites}</span>
        <span>{build.views} {labels.views}</span>
        <span className="bc-author">{labels.by} {build.authorName}</span>
      </div>
    </Link>
  );
}
