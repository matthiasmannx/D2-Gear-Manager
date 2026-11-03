/** Eenvoudige SVG-sparkline (geen library). */
export default function Sparkline({ points, color = "#7c6cff", height = 46 }: { points: number[]; color?: string; height?: number }) {
  const pts = points.filter((p) => Number.isFinite(p));
  if (pts.length < 2) return null;
  const w = 100;
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;
  const step = w / (pts.length - 1);
  const coords = pts.map((p, i) => `${(i * step).toFixed(2)},${(height - ((p - min) / range) * (height - 8) - 4).toFixed(2)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }}>
      <polyline points={coords} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
