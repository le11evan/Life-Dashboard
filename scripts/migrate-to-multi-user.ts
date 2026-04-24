/**
 * One-off migration: move single-user data to a User row.
 * Safe to re-run: idempotent.
 *
 *   npx tsx scripts/migrate-to-multi-user.ts
 *
 * Uses raw SQL for the backfill since Prisma types enforce non-null userId
 * after the schema tightening — SQL bypasses that and no-ops on already-scoped rows.
 */
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const ADMIN_USERNAME = "le11evan";
const ADMIN_PASSWORD = "password";

const TABLES = [
  "Task",
  "GroceryItem",
  "JournalEntry",
  "WorkoutTemplate",
  "Holding",
  "WatchlistItem",
  "Goal",
  "CreativeIdea",
  "DietLog",
  "DietGoals",
  "Supplement",
  "WeightLog",
];

async function main() {
  console.log("→ ensuring admin user exists");

  let admin = await db.user.findUnique({ where: { username: ADMIN_USERNAME } });
  if (!admin) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    admin = await db.user.create({
      data: { username: ADMIN_USERNAME, passwordHash, isAdmin: true },
    });
    console.log(`  ✓ created admin ${admin.username} (${admin.id})`);
  } else {
    console.log(`  ✓ admin already exists (${admin.id})`);
  }

  console.log("→ backfilling userId on any legacy rows (no-op if already scoped)");

  for (const table of TABLES) {
    const res = await db.$executeRaw(
      Prisma.sql`UPDATE ${Prisma.raw(`"${table}"`)} SET "userId" = ${admin.id} WHERE "userId" IS NULL`,
    );
    console.log(`  ✓ ${table}: ${res} rows updated`);
  }

  console.log(`\nDone. Admin login: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
