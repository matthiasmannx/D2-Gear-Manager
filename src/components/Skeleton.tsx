/** Herbruikbare laad-skeletons voor Suspense-fallbacks (streaming). */

export function SkelLine({ w = "100%", h = "0.9rem", mt }: { w?: string; h?: string; mt?: string }) {
  return <div className="skel skel-line" style={{ width: w, height: h, marginTop: mt }} />;
}

/** Generieke pagina-skeleton: optionele kop + kaartenrij + lijst. */
export function Loading({ head = true, cards = 4, rows = 3 }: { head?: boolean; cards?: number; rows?: number }) {
  return (
    <div aria-busy="true">
      {head && <SkelLine w="30%" h="1.5rem" />}
      {cards > 0 && (
        <div className="bc-grid" style={{ margin: "1rem 0 1.25rem" }}>
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} className="card">
              <SkelLine w="55%" />
              <SkelLine w="40%" h="1.6rem" mt="0.5rem" />
            </div>
          ))}
        </div>
      )}
      {rows > 0 && (
        <div className="section-list">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="card">
              <SkelLine w="45%" h="1.1rem" />
              <SkelLine w="80%" mt="0.6rem" />
              <SkelLine w="65%" mt="0.4rem" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
