"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Hero } from "@/components/dashboard/hero";
import { SectionHead } from "@/components/dashboard/section-head";
import { Tile } from "@/components/ui/tile";
import { Ring } from "@/components/ui/ring";
import { Sparkline } from "@/components/ui/sparkline";
import { Check } from "@/components/ui/check";
import { Chip } from "@/components/ui/chip";

interface DashboardClientProps {
  name: string;
  streak: number;
  weekPattern: number[];
  todayIdx: number;
  tasks: {
    pending: Array<{ id: string; title: string; priority: number }>;
    completedToday: number;
    totalToday: number;
  };
  groceries: {
    items: Array<{ id: string; name: string; category: string | null }>;
    total: number;
  };
  fitness: {
    workoutsThisWeek: number;
    templateCount: number;
    exerciseCount: number;
  };
  diet: {
    calorieGoal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
    caloriesLogged: number;
    proteinLogged: number;
    carbsLogged: number;
    fatLogged: number;
    supplements: number;
    currentWeight: number | null;
  };
  portfolio: {
    totalValue: number;
    totalGain: number;
    totalGainPercent: number;
    holdings: number;
  };
  goals: Array<{ id: string; title: string; progress: number }>;
  journal: {
    streak: number;
    latest: { content: string; mood: string | null; tags: string[] } | null;
  };
  quote: { text: string; author?: string };
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const priorityTags = ["low", "low", "med", "high"] as const;

export function DashboardClient({
  name,
  streak,
  weekPattern,
  todayIdx,
  tasks,
  groceries,
  fitness,
  diet,
  portfolio,
  goals,
  journal,
  quote,
}: DashboardClientProps) {
  const taskPct = tasks.totalToday > 0 ? tasks.completedToday / tasks.totalToday : 0;
  const caloriePct = diet.calorieGoal > 0 ? Math.min(1, diet.caloriesLogged / diet.calorieGoal) : 0;
  const workoutPct = Math.min(1, fitness.workoutsThisWeek / 4);

  return (
    <div className="screen-enter" style={{ paddingBottom: 120 }}>
      <Hero
        name={name}
        streak={streak}
        weekPattern={weekPattern}
        todayIdx={todayIdx}
      />

      <SectionHead
        kicker={`${tasks.pending.length} open · focus`}
        title="Today"
        right={
          <Link
            href="/tasks"
            className="t-mono"
            style={{
              fontSize: 10,
              color: "var(--fg-mute)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            edit
          </Link>
        }
      />

      <div className="bento">
        {/* Tasks — feature tile (span-2, cyan) */}
        <Link href="/tasks" className="span-2">
          <Tile accent="cyan" span innerStyle={{ padding: 0 }}>
            <div
              style={{
                padding: "16px 16px 6px",
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div className="t-kicker">tasks · today</div>
                <div className="flex-row ai-b gap-2 mt-2">
                  <span
                    className="t-display glow-cyan"
                    style={{ fontSize: 56, color: "var(--cyan)" }}
                  >
                    {tasks.pending.length}
                  </span>
                  <span className="t-display-i c-mute" style={{ fontSize: 18 }}>
                    {tasks.totalToday > 0
                      ? `of ${tasks.totalToday} left`
                      : "all clear"}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: "var(--fg-mute)" }} />
            </div>
            <div style={{ padding: "0 16px 16px" }}>
              <div className="bar mb-3">
                <div
                  className="bar__fill"
                  style={{
                    width: `${Math.round(taskPct * 100)}%`,
                    background: "var(--cyan)",
                    boxShadow: "0 0 8px rgba(0,229,255,0.6)",
                  }}
                />
              </div>
              {tasks.pending.length === 0 ? (
                <p className="t-mono c-mute" style={{ fontSize: 12 }}>
                  nothing pending — you're free
                </p>
              ) : (
                <div className="col gap-2">
                  {tasks.pending.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="flex-row ai-c gap-3 row-press"
                      style={{ padding: "6px 2px" }}
                    >
                      <Check color="cyan" />
                      <span
                        style={{
                          flex: 1,
                          fontSize: 13,
                          color: "var(--fg)",
                        }}
                      >
                        {t.title}
                      </span>
                      <span
                        className="t-mono c-faint"
                        style={{
                          fontSize: 9,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {priorityTags[t.priority] ?? ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tile>
        </Link>

        {/* Fitness */}
        <Link href="/fitness">
          <Tile accent="orange" innerStyle={{ padding: 16 }}>
            <div className="t-kicker">fitness</div>
            <div className="flex-row ai-b gap-1 mt-3">
              <span
                className="t-display glow-orange"
                style={{ fontSize: 56, color: "var(--orange)" }}
              >
                {fitness.workoutsThisWeek}
              </span>
              <span className="t-mono c-mute" style={{ fontSize: 11 }}>
                / 4 wk
              </span>
            </div>
            <div className="t-caps mt-1">workouts this week</div>
            <div className="mt-3">
              <div className="bar">
                <div
                  className="bar__fill"
                  style={{
                    width: `${Math.round(workoutPct * 100)}%`,
                    background: "var(--orange)",
                    boxShadow: "0 0 8px rgba(255,107,53,0.5)",
                  }}
                />
              </div>
              <div
                className="t-mono c-mute mt-2"
                style={{ fontSize: 10 }}
              >
                {fitness.templateCount} templates · {fitness.exerciseCount} exercises
              </div>
            </div>
          </Tile>
        </Link>

        {/* Diet */}
        <Link href="/diet">
          <Tile accent="lime" innerStyle={{ padding: 16 }}>
            <div className="t-kicker">diet</div>
            <div className="flex-row ai-c gap-3 mt-3">
              <Ring value={caloriePct} size={58} stroke={5} color="var(--lime)">
                <div className="tc">
                  <div
                    className="t-mono"
                    style={{ fontSize: 11, color: "var(--lime)" }}
                  >
                    {Math.round(caloriePct * 100)}%
                  </div>
                </div>
              </Ring>
              <div className="col gap-1">
                <div
                  className="t-display"
                  style={{ fontSize: 30, color: "var(--fg)" }}
                >
                  {diet.caloriesLogged.toLocaleString()}
                </div>
                <div className="t-caps">
                  of {diet.calorieGoal.toLocaleString()} kcal
                </div>
              </div>
            </div>
            <div className="flex-row gap-3 mt-3">
              <div className="col" style={{ gap: 2 }}>
                <span className="t-mono c-lime" style={{ fontSize: 11 }}>
                  {diet.proteinLogged}g
                </span>
                <span className="t-caps" style={{ fontSize: 8 }}>
                  protein
                </span>
              </div>
              <div className="col" style={{ gap: 2 }}>
                <span className="t-mono c-dim" style={{ fontSize: 11 }}>
                  {diet.carbsLogged}g
                </span>
                <span className="t-caps" style={{ fontSize: 8 }}>
                  carbs
                </span>
              </div>
              <div className="col" style={{ gap: 2 }}>
                <span className="t-mono c-dim" style={{ fontSize: 11 }}>
                  {diet.fatLogged}g
                </span>
                <span className="t-caps" style={{ fontSize: 8 }}>
                  fat
                </span>
              </div>
            </div>
          </Tile>
        </Link>

        {/* Groceries span */}
        <Link href="/groceries" className="span-2">
          <Tile accent="lime" span innerStyle={{ padding: 0 }}>
            <div
              style={{
                padding: "16px 16px 0",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div className="t-kicker">groceries</div>
                <div className="flex-row ai-b gap-2 mt-2">
                  <span
                    className="t-display glow-lime"
                    style={{ fontSize: 44, color: "var(--lime)" }}
                  >
                    {groceries.total}
                  </span>
                  <span className="t-display-i c-mute" style={{ fontSize: 14 }}>
                    items to get
                  </span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: "var(--fg-mute)" }} />
            </div>
            <div style={{ padding: "10px 16px 16px" }}>
              {groceries.items.length === 0 ? (
                <p className="t-mono c-mute" style={{ fontSize: 12 }}>
                  list is empty
                </p>
              ) : (
                <div className="col gap-2">
                  {groceries.items.slice(0, 5).map((g) => (
                    <div key={g.id} className="flex-row ai-c gap-3">
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 99,
                          background: "var(--lime)",
                          boxShadow: "0 0 6px rgba(57,255,20,0.6)",
                        }}
                      />
                      <span style={{ fontSize: 13, color: "var(--fg-dim)" }}>
                        {g.name}
                      </span>
                      {g.category && (
                        <span
                          className="t-mono c-faint"
                          style={{ fontSize: 9, textTransform: "uppercase" }}
                        >
                          {g.category}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tile>
        </Link>

        {/* Finance */}
        <Link href="/finance">
          <Tile accent="purple" innerStyle={{ padding: 16 }}>
            <div className="t-kicker">portfolio</div>
            <div
              className="t-display mt-3"
              style={{ fontSize: 30, color: "var(--fg)" }}
            >
              {formatCurrency(portfolio.totalValue)}
            </div>
            <div className="flex-row ai-c gap-2 mt-1">
              <span
                className="t-mono"
                style={{
                  fontSize: 11,
                  color:
                    portfolio.totalGain >= 0 ? "var(--lime)" : "var(--pink)",
                }}
              >
                {portfolio.totalGain >= 0 ? "+" : ""}
                {formatCurrency(portfolio.totalGain)}
              </span>
              <span className="t-mono c-mute" style={{ fontSize: 10 }}>
                {portfolio.totalGainPercent >= 0 ? "+" : ""}
                {portfolio.totalGainPercent.toFixed(2)}%
              </span>
            </div>
            <div className="mt-3">
              <Sparkline
                data={[40, 41, 40, 42, 43, 42, 44, 43, 45, 44, 46, 47, 46, 48]}
                color="var(--purple)"
                width={130}
                height={26}
                fill
              />
            </div>
            <div className="t-mono c-mute mt-1" style={{ fontSize: 10 }}>
              {portfolio.holdings} positions
            </div>
          </Tile>
        </Link>

        {/* Goals */}
        <Link href="/goals">
          <Tile accent="pink" innerStyle={{ padding: 16 }}>
            <div className="t-kicker">goals</div>
            {goals.length === 0 ? (
              <p className="t-mono c-mute mt-3" style={{ fontSize: 12 }}>
                no active goals
              </p>
            ) : (
              <div className="col gap-3 mt-3">
                {goals.map((g, i) => {
                  const colors = ["var(--pink)", "var(--orange)", "var(--cyan)"];
                  const color = colors[i % colors.length];
                  return (
                    <div key={g.id} className="col" style={{ gap: 4 }}>
                      <div className="flex-row ai-c jc-sb">
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--fg-dim)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 120,
                          }}
                        >
                          {g.title}
                        </span>
                        <span
                          className="t-mono"
                          style={{ fontSize: 10, color }}
                        >
                          {g.progress}%
                        </span>
                      </div>
                      <div className="bar">
                        <div
                          className="bar__fill"
                          style={{
                            width: `${g.progress}%`,
                            background: color,
                            boxShadow: `0 0 6px ${color}`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Tile>
        </Link>

        {/* Journal — editorial span */}
        <Link href="/journal" className="span-2">
          <Tile accent="yellow" span innerStyle={{ padding: 0 }}>
            <div style={{ padding: "16px 18px 18px" }}>
              <div className="flex-row ai-c jc-sb mb-2">
                <div className="t-kicker">journal · today</div>
                {journal.streak > 0 && (
                  <Chip tone="yellow">{journal.streak} day streak</Chip>
                )}
              </div>
              {journal.latest ? (
                <>
                  <p
                    style={{
                      fontFamily: "var(--ff-ui)",
                      fontWeight: 400,
                      fontSize: 15.5,
                      lineHeight: 1.45,
                      color: "var(--fg)",
                      margin: "10px 0 8px",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {journal.latest.content}
                  </p>
                  {(journal.latest.mood || journal.latest.tags.length > 0) && (
                    <div className="flex-row ai-c gap-2 mt-3" style={{ flexWrap: "wrap" }}>
                      {journal.latest.mood && (
                        <Chip>{journal.latest.mood}</Chip>
                      )}
                      {journal.latest.tags.slice(0, 3).map((tag, i) => (
                        <Chip key={i}>{tag}</Chip>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p
                  className="t-mono c-mute"
                  style={{ fontSize: 13, margin: "10px 0" }}
                >
                  no entry yet today — write something.
                </p>
              )}
            </div>
          </Tile>
        </Link>

        {/* Quote */}
        <div className="span-2" style={{ padding: "22px 20px", textAlign: "center" }}>
          <div className="t-kicker mb-3">daily inspiration</div>
          <p
            className="t-display"
            style={{
              fontWeight: 500,
              fontSize: 22,
              lineHeight: 1.3,
              color: "var(--fg)",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            &ldquo;{quote.text}&rdquo;
          </p>
          {quote.author && (
            <div
              className="t-mono c-mute mt-3"
              style={{
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              — {quote.author}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
