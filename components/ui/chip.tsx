import { ReactNode } from "react";

export type ChipTone = "pink" | "cyan" | "purple" | "lime" | "orange" | "yellow";

export function Chip({
  tone,
  children,
  className = "",
}: {
  tone?: ChipTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`chip ${tone ? "chip--" + tone : ""} ${className}`}>
      {children}
    </span>
  );
}
