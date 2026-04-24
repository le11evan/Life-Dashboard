/**
 * Local backup: dumps every row of every table in your prod DB to a timestamped JSON file.
 *
 *   npx tsx scripts/backup-prod.ts              # → backups/backup-2026-04-24T21-15-03.json
 *   BACKUP_DIR=~/Dropbox/elevan-backups npx tsx scripts/backup-prod.ts
 *
 * Differs from the in-app Settings → Export (which exports only the logged-in user's data):
 * this hits every table at the DB level, so it captures ALL users. Use this as your
 * "oh shit" safety net. Run it weekly or before risky migrations.
 *
 * Uses the DATABASE_URL from your .env — point it at prod.
 */
import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const db = new PrismaClient();

async function main() {
  const dir = process.env.BACKUP_DIR
    ? resolve(process.env.BACKUP_DIR.replace(/^~/, process.env.HOME ?? ""))
    : join(process.cwd(), "backups");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const file = join(dir, `backup-${stamp}.json`);

  console.log(`→ dumping prod DB to ${file}`);

  const [
    users,
    tasks,
    groceryItems,
    journalEntries,
    dailyQuotes,
    workoutTemplates,
    templateExercises,
    exerciseLogs,
    holdings,
    watchlistItems,
    stockResearch,
    goals,
    dailyNews,
    creativeIdeas,
    dietLogs,
    dietGoals,
    supplements,
    weightLogs,
  ] = await Promise.all([
    db.user.findMany({
      select: { id: true, username: true, isAdmin: true, createdAt: true, updatedAt: true },
    }),
    db.task.findMany(),
    db.groceryItem.findMany(),
    db.journalEntry.findMany(),
    db.dailyQuote.findMany(),
    db.workoutTemplate.findMany(),
    db.templateExercise.findMany(),
    db.exerciseLog.findMany(),
    db.holding.findMany(),
    db.watchlistItem.findMany(),
    db.stockResearch.findMany(),
    db.goal.findMany(),
    db.dailyNews.findMany(),
    db.creativeIdea.findMany(),
    db.dietLog.findMany(),
    db.dietGoals.findMany(),
    db.supplement.findMany(),
    db.weightLog.findMany(),
  ]);

  const backup = {
    dumpedAt: new Date().toISOString(),
    schemaVersion: "multi-user-1.0",
    counts: {
      users: users.length,
      tasks: tasks.length,
      groceryItems: groceryItems.length,
      journalEntries: journalEntries.length,
      dailyQuotes: dailyQuotes.length,
      workoutTemplates: workoutTemplates.length,
      templateExercises: templateExercises.length,
      exerciseLogs: exerciseLogs.length,
      holdings: holdings.length,
      watchlistItems: watchlistItems.length,
      stockResearch: stockResearch.length,
      goals: goals.length,
      dailyNews: dailyNews.length,
      creativeIdeas: creativeIdeas.length,
      dietLogs: dietLogs.length,
      dietGoals: dietGoals.length,
      supplements: supplements.length,
      weightLogs: weightLogs.length,
    },
    data: {
      users,
      tasks,
      groceryItems,
      journalEntries,
      dailyQuotes,
      workoutTemplates,
      templateExercises,
      exerciseLogs,
      holdings,
      watchlistItems,
      stockResearch,
      goals,
      dailyNews,
      creativeIdeas,
      dietLogs,
      dietGoals,
      supplements,
      weightLogs,
    },
  };

  writeFileSync(file, JSON.stringify(backup, null, 2));

  const sizeKb = Math.round((JSON.stringify(backup).length / 1024) * 10) / 10;
  console.log(`  ✓ wrote ${sizeKb} KB`);
  console.log("\nCounts:");
  console.table(backup.counts);
  console.log(`\nDone → ${file}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
