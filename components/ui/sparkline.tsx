interface SparklineProps {
  data?: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}

export function Sparkline({
  data = [3, 4, 4, 5, 6, 5, 7, 8, 7, 9],
  color = "var(--pink)",
  width = 80,
  height = 26,
  fill = false,
}: SparklineProps) {
  if (data.length < 2) {
    return <svg className="spark" width={width} height={height} />;
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => [
    i * step,
    height - ((v - min) / range) * (height - 4) - 2,
  ] as const);
  const d = pts
    .map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1))
    .join(" ");
  const fd = d + ` L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg className="spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill && <path d={fd} fill={color} opacity="0.15" />}
      <path
        d={d}
        stroke={color}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}
