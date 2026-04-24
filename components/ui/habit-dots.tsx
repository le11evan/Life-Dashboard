interface HabitDotsProps {
  pattern?: number[];
  todayIdx?: number;
  color?: "pink" | "cyan" | "lime" | "purple";
  labels?: string[];
}

export function HabitDots({
  pattern = [1, 1, 1, 1, 0, 0, 0],
  todayIdx = 3,
  color = "pink",
  labels = ["M", "T", "W", "T", "F", "S", "S"],
}: HabitDotsProps) {
  return (
    <div className="dots">
      {pattern.map((v, i) => (
        <div
          key={i}
          className={`dot ${v ? `done ${color}` : ""} ${i === todayIdx ? "today" : ""}`}
        >
          {!v && labels[i]}
        </div>
      ))}
    </div>
  );
}
