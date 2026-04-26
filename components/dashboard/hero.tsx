"use client";

import { useEffect, useState } from "react";
import { Cloud, Flame } from "lucide-react";
import { HabitDots } from "@/components/ui/habit-dots";

function SunArc({ hour, minute }: { hour: number; minute: number }) {
  const frac = (hour + minute / 60 - 6) / 12;
  const isDay = frac >= 0 && frac <= 1;
  const t = isDay ? frac : ((hour + minute / 60 + 6) % 24) / 12;

  const W = 260;
  const H = 70;
  const cx = W / 2;
  const cy = H + 6;
  const r = H - 6;
  const a = Math.PI - t * Math.PI;
  const x = cx + Math.cos(a) * r;
  const y = cy - Math.sin(a) * r;

  const color = isDay ? "var(--yellow)" : "var(--cyan)";
  const trackColor = isDay ? "rgba(255,214,0,0.18)" : "rgba(0,229,255,0.18)";
  const path = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H + 12}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block", maxHeight: H + 12 }}
    >
      <defs>
        <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,229,255,0.6)" />
          <stop offset="50%" stopColor="rgba(157,78,221,0.5)" />
          <stop offset="100%" stopColor="rgba(255,45,120,0.6)" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke={trackColor} strokeWidth="1.2" strokeDasharray="2 4" />
      <path
        d={path}
        fill="none"
        stroke="url(#arcGrad)"
        strokeWidth="2"
        style={{
          strokeDasharray: Math.PI * r,
          strokeDashoffset: Math.PI * r * (1 - t),
          transition: "stroke-dashoffset 1s ease",
        }}
      />
      <circle cx={x} cy={y} r="7" fill={color} style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
      {!isDay && <circle cx={x - 2} cy={y - 1} r="5" fill="var(--ink-000)" />}
    </svg>
  );
}

interface HeroProps {
  name?: string;
  streak?: number;
  weekPattern?: number[];
  todayIdx?: number;
  weather?: string;
}

export function Hero({
  name = "Evan",
  streak = 0,
  weekPattern = [0, 0, 0, 0, 0, 0, 0],
  todayIdx,
  weather = "67° · LA · clear",
}: HeroProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const h = now?.getHours() ?? 12;
  const m = now?.getMinutes() ?? 0;
  const greeting =
    h < 5 ? "Still up" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 21 ? "Good evening" : "Good night";

  const date = now
    ? now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "";
  const time = now ? now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "";

  const resolvedTodayIdx = todayIdx ?? (now ? (now.getDay() + 6) % 7 : 0);

  return (
    <div
      className="rel grain"
      style={{ padding: "28px 20px 22px", overflow: "hidden" }}
    >
      <div className="ambient-bg" />

      {/* Mobile-only stacked layout (≤lg). On desktop we lay it out side-by-side. */}
      <div className="lg:hidden">
        <div className="z1 flex-row ai-c jc-sb mb-4">
          <div className="flex-row ai-c gap-2">
            <Cloud size={14} style={{ color: "var(--fg-dim)" }} />
            <span className="t-mono" style={{ fontSize: 11, color: "var(--fg-dim)" }}>
              {weather}
            </span>
          </div>
          <div className="t-mono" style={{ fontSize: 11, color: "var(--fg-mute)" }}>
            {time}
          </div>
        </div>

        <div className="z1">
          <div className="t-kicker mb-2">{date}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span className="t-display" style={{ fontSize: 38, color: "var(--fg)" }}>
              {greeting},
            </span>
            <span
              className="t-display-i"
              style={{
                fontSize: 42,
                background: "linear-gradient(90deg, var(--pink), var(--purple), var(--cyan))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {name}
            </span>
          </div>
        </div>

        <div className="z1 mt-4" style={{ position: "relative" }}>
          <div style={{ maxWidth: 320, margin: "0 auto" }}>
            <SunArc hour={h} minute={m} />
            <div className="flex-row jc-sb" style={{ marginTop: -2 }}>
              <span className="t-mono c-faint" style={{ fontSize: 9 }}>06:00</span>
              <span className="t-mono c-faint" style={{ fontSize: 9 }}>12:00</span>
              <span className="t-mono c-faint" style={{ fontSize: 9 }}>18:00</span>
            </div>
          </div>
        </div>

        <div className="z1 mt-6">
          <div className="flex-row ai-c jc-sb mb-2">
            <div className="t-kicker">this week</div>
            {streak > 0 && (
              <div className="flex-row ai-c gap-2">
                <Flame size={12} style={{ color: "var(--pink)" }} />
                <span className="t-mono" style={{ fontSize: 11, color: "var(--fg)" }}>
                  {streak} day streak
                </span>
              </div>
            )}
          </div>
          <HabitDots pattern={weekPattern} todayIdx={resolvedTodayIdx} color="pink" />
        </div>
      </div>

      {/* Desktop layout (≥lg): two-column with greeting on left, arc + week on right */}
      <div className="hidden lg:grid z1" style={{ gridTemplateColumns: "1.4fr 1fr", gap: 32, alignItems: "center" }}>
        <div>
          <div className="flex-row ai-c gap-2 mb-3">
            <Cloud size={14} style={{ color: "var(--fg-dim)" }} />
            <span className="t-mono" style={{ fontSize: 11, color: "var(--fg-dim)" }}>
              {weather}
            </span>
            <span className="t-mono" style={{ fontSize: 11, color: "var(--fg-mute)", marginLeft: 8 }}>
              · {time}
            </span>
          </div>
          <div className="t-kicker mb-3">{date}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <span className="t-display" style={{ fontSize: 56, color: "var(--fg)" }}>
              {greeting},
            </span>
            <span
              className="t-display-i"
              style={{
                fontSize: 64,
                background: "linear-gradient(90deg, var(--pink), var(--purple), var(--cyan))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {name}
            </span>
          </div>
        </div>

        <div className="col gap-5">
          <div style={{ position: "relative", maxWidth: 320, marginLeft: "auto" }}>
            <SunArc hour={h} minute={m} />
            <div className="flex-row jc-sb" style={{ marginTop: -2 }}>
              <span className="t-mono c-faint" style={{ fontSize: 9 }}>06:00</span>
              <span className="t-mono c-faint" style={{ fontSize: 9 }}>12:00</span>
              <span className="t-mono c-faint" style={{ fontSize: 9 }}>18:00</span>
            </div>
          </div>
          <div>
            <div className="flex-row ai-c jc-sb mb-2">
              <div className="t-kicker">this week</div>
              {streak > 0 && (
                <div className="flex-row ai-c gap-2">
                  <Flame size={12} style={{ color: "var(--pink)" }} />
                  <span className="t-mono" style={{ fontSize: 11, color: "var(--fg)" }}>
                    {streak} day streak
                  </span>
                </div>
              )}
            </div>
            <HabitDots pattern={weekPattern} todayIdx={resolvedTodayIdx} color="pink" />
          </div>
        </div>
      </div>
    </div>
  );
}
