"use client";

interface CheckProps {
  done?: boolean;
  color?: "" | "cyan" | "lime";
  onChange?: (v: boolean) => void;
}

export function Check({ done, color = "", onChange }: CheckProps) {
  return (
    <button
      type="button"
      className={`check ${done ? "done" : ""} ${color}`}
      onClick={(e) => {
        e.stopPropagation();
        onChange?.(!done);
      }}
      aria-label="toggle"
    >
      {done && (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6l3 3 5-6"
            stroke="#0a0a14"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
