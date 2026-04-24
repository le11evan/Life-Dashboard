import { ReactNode } from "react";

export function SectionHead({
  kicker,
  title,
  right,
}: {
  kicker?: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        {kicker && <div className="t-kicker mb-1">{kicker}</div>}
        <h3>{title}</h3>
      </div>
      {right}
    </div>
  );
}
