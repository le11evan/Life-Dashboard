"use client";

import { useRef, useState, ReactNode, CSSProperties } from "react";

export type Accent = "pink" | "cyan" | "purple" | "lime" | "orange" | "yellow";

interface TileProps {
  accent?: Accent;
  kicker?: string;
  title?: string;
  right?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
  onExpand?: () => void;
  span?: boolean;
  className?: string;
  style?: CSSProperties;
  innerStyle?: CSSProperties;
  noPad?: boolean;
}

export function Tile({
  accent,
  kicker,
  title,
  right,
  children,
  onClick,
  onExpand,
  span,
  className = "",
  style,
  innerStyle,
  noPad,
}: TileProps) {
  const [pressed, setPressed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onDown = () => {
    setPressed(true);
    if (onExpand) timerRef.current = setTimeout(() => onExpand(), 520);
  };
  const onUp = () => {
    setPressed(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div
      className={[
        "tile tile--elev",
        accent ? `edge-${accent}` : "",
        span ? "span-2" : "",
        pressed ? "tile--active" : "",
        onClick || onExpand ? "cursor-pointer" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      onClick={onClick}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      onPointerCancel={onUp}
    >
      {(kicker || title || right) && (
        <div
          className="flex items-center justify-between"
          style={{ padding: "14px 14px 6px" }}
        >
          <div className="flex flex-col gap-[2px]">
            {kicker && <div className="t-kicker">{kicker}</div>}
            {title && (
              <div
                className="text-[14px] font-semibold"
                style={{ color: "var(--fg)" }}
              >
                {title}
              </div>
            )}
          </div>
          {right}
        </div>
      )}
      <div style={{ padding: noPad ? 0 : "0 14px 14px", ...innerStyle }}>
        {children}
      </div>
    </div>
  );
}
