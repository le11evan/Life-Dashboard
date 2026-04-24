import { ReactNode } from "react";

interface RingProps {
  value?: number;
  size?: number;
  stroke?: number;
  color?: string;
  glow?: boolean;
  children?: ReactNode;
}

export function Ring({
  value = 0.7,
  size = 64,
  stroke = 6,
  color = "var(--pink)",
  glow = true,
  children,
}: RingProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={size}
        height={size}
        style={{
          transform: "rotate(-90deg)",
          filter: glow ? `drop-shadow(0 0 6px ${color})` : "none",
        }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: "absolute" }}>{children}</div>
    </div>
  );
}
