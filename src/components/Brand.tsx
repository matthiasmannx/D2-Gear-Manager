/**
 * Origineel Guardian Hub-wordmerk: ⟡ + "Guardian" (wit) + "Hub" in een oranje
 * badge. Eigen vormgeving, geen overgenomen huisstijl.
 */
export default function Brand({ collapsible = false }: { collapsible?: boolean }) {
  return (
    <span className="brand">
      <span className="brand-star" aria-hidden>
        ⟡
      </span>
      <span className={collapsible ? "brand-text" : "brand-shown"}>
        <span className="brand-word">Guardian</span>
        <span className="brand-hub">Hub</span>
      </span>
    </span>
  );
}
