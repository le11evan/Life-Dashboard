import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with demo data...");

  // Clear existing data
  await prisma.exerciseLog.deleteMany();
  await prisma.templateExercise.deleteMany();
  await prisma.workoutTemplate.deleteMany();
  await prisma.task.deleteMany();
  await prisma.groceryItem.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.holding.deleteMany();
  await prisma.watchlistItem.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.creativeIdea.deleteMany();
  await prisma.dietLog.deleteMany();
  await prisma.dietGoals.deleteMany();
  await prisma.supplement.deleteMany();
  await prisma.weightLog.deleteMany();

  // === TASKS ===
  console.log("Creating tasks...");
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.task.createMany({
    data: [
      { title: "Review pull request for auth feature", priority: 3, dueDate: today, status: "pending" },
      { title: "Schedule dentist appointment", priority: 2, dueDate: tomorrow, status: "pending" },
      { title: "Prepare presentation slides", priority: 3, dueDate: nextWeek, status: "pending" },
      { title: "Buy birthday gift for mom", priority: 2, dueDate: nextWeek, status: "pending" },
      { title: "Update project documentation", priority: 1, status: "pending" },
      { title: "Call insurance company", priority: 2, dueDate: yesterday, status: "pending" },
      { title: "Finish reading chapter 5", priority: 1, status: "completed" },
      { title: "Set up automatic bill pay", priority: 2, status: "completed" },
    ],
  });

  // === GROCERIES ===
  console.log("Creating groceries...");
  await prisma.groceryItem.createMany({
    data: [
      { name: "Chicken breast", category: "Protein" },
      { name: "Ground beef", category: "Protein" },
      { name: "Eggs (2 dozen)", category: "Protein" },
      { name: "Greek yogurt", category: "Dairy" },
      { name: "Milk", category: "Dairy" },
      { name: "Cheddar cheese", category: "Dairy" },
      { name: "Broccoli", category: "Vegetables" },
      { name: "Spinach", category: "Vegetables" },
      { name: "Bell peppers", category: "Vegetables" },
      { name: "Bananas", category: "Fruits" },
      { name: "Apples", category: "Fruits" },
      { name: "Rice", category: "Grains" },
      { name: "Oatmeal", category: "Grains" },
      { name: "Olive oil", category: "Pantry", isChecked: true },
      { name: "Almonds", category: "Snacks", isChecked: true },
      { name: "Toothpaste", category: "Personal Care" },
      { name: "Shampoo", category: "Personal Care" },
      { name: "Mouthwash", category: "Personal Care" },
      { name: "Paper towels", category: "Household" },
      { name: "Dish soap", category: "Household" },
      { name: "Cat food", category: "Pet" },
      { name: "Vitamins", category: "Health" },
    ],
  });

  // === JOURNAL ===
  console.log("Creating journal entries...");
  const journalDates = [
    new Date(today.getTime() - 0 * 24 * 60 * 60 * 1000),
    new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
    new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
    new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
    new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
  ];

  await prisma.journalEntry.create({
    data: {
      content: "Had a really productive day today. Finished the major feature I've been working on and got great feedback from the team. Feeling accomplished and motivated to keep the momentum going.",
      mood: "energetic",
      tags: ["work", "productivity", "wins"],
      createdAt: journalDates[0],
    },
  });
  await prisma.journalEntry.create({
    data: {
      content: "Took some time to reflect on my goals for the year. I'm making good progress on the fitness front but need to be more consistent with reading. Going to set a daily reminder.",
      mood: "thoughtful",
      tags: ["reflection", "goals", "self-improvement"],
      createdAt: journalDates[1],
    },
  });
  await prisma.journalEntry.create({
    data: {
      content: "Great workout session this morning. Hit a new PR on bench press! The consistent training is paying off. Also had a nice lunch with an old friend - good conversations about life and future plans.",
      mood: "happy",
      tags: ["fitness", "friends", "social"],
      createdAt: journalDates[2],
    },
  });
  await prisma.journalEntry.create({
    data: {
      content: "Feeling a bit overwhelmed with everything on my plate. Need to prioritize better and maybe delegate some tasks. Going to make a proper to-do list tomorrow morning.",
      mood: "stressed",
      tags: ["work", "planning"],
      createdAt: journalDates[3],
    },
  });
  await prisma.journalEntry.create({
    data: {
      content: "Quiet weekend at home. Caught up on some reading and did meal prep for the week. Sometimes these low-key days are exactly what I need to recharge.",
      mood: "calm",
      tags: ["weekend", "rest", "self-care"],
      createdAt: journalDates[4],
    },
  });

  // === WORKOUT TEMPLATES ===
  console.log("Creating workout templates...");

  // Push Day Template
  const pushDay = await prisma.workoutTemplate.create({
    data: {
      name: "PUSH DAY",
      order: 0,
      exercises: {
        create: [
          { name: "Smith Incline Chest Press (24hr)", sets: "2 Working Sets", repRange: "6-8", order: 0 },
          { name: "Chest Fly Pec Dec Single Arm (24hr Nautilus)", sets: "2 Working Sets", repRange: "8-10", order: 1 },
          { name: "Tricep Straight Bar PD Cable (24hr)", sets: "2 Working Sets", repRange: "8-12", order: 2 },
          { name: "Chest Press Machine (24hr Nautilus)", sets: "2 Working Sets", repRange: "6-8", order: 3 },
          { name: "Side Delt Raise Machine (24hr Nautilus)", sets: "2 Working Sets", repRange: "8-12", order: 4 },
          { name: "Shoulder Press (24hr Nautilus)", sets: "2 Working Sets", repRange: "6-8", order: 5 },
          { name: "Tricep Dip Assisted (24hr)", sets: "2 Working Sets", repRange: "2 Sets Til Failure", order: 6 },
        ],
      },
    },
    include: { exercises: true },
  });

  // Pull Day Template
  const pullDay = await prisma.workoutTemplate.create({
    data: {
      name: "PULL DAY",
      order: 1,
      exercises: {
        create: [
          { name: "Lat Pulldown Wide Grip (24hr)", sets: "2 Working Sets", repRange: "8-10", order: 0 },
          { name: "Seated Row Machine (24hr Nautilus)", sets: "2 Working Sets", repRange: "8-10", order: 1 },
          { name: "Rear Delt Fly Machine (24hr)", sets: "2 Working Sets", repRange: "10-15", order: 2 },
          { name: "Bicep Curl Machine (24hr)", sets: "2 Working Sets", repRange: "8-12", order: 3 },
          { name: "Face Pulls Cable (24hr)", sets: "2 Working Sets", repRange: "12-15", order: 4 },
          { name: "Hammer Curl Dumbbell", sets: "2 Working Sets", repRange: "8-12", order: 5 },
        ],
      },
    },
    include: { exercises: true },
  });

  // Legs Day Template
  const legsDay = await prisma.workoutTemplate.create({
    data: {
      name: "LEG DAY",
      order: 2,
      exercises: {
        create: [
          { name: "Leg Press (24hr)", sets: "3 Working Sets", repRange: "8-12", order: 0 },
          { name: "Leg Extension (24hr)", sets: "2 Working Sets", repRange: "10-15", order: 1 },
          { name: "Leg Curl Lying (24hr)", sets: "2 Working Sets", repRange: "10-15", order: 2 },
          { name: "Hip Adductor Machine (24hr)", sets: "2 Working Sets", repRange: "12-15", order: 3 },
          { name: "Calf Raise Standing (24hr)", sets: "3 Working Sets", repRange: "12-15", order: 4 },
        ],
      },
    },
    include: { exercises: true },
  });

  // Add some exercise logs
  console.log("Creating exercise logs...");
  const logDates = [
    new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
    new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
    new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000),
  ];

  // Logs for Push Day exercises
  for (const exercise of pushDay.exercises.slice(0, 3)) {
    for (let i = 0; i < logDates.length; i++) {
      const d = new Date(logDates[i]);
      d.setHours(0, 0, 0, 0);
      await prisma.exerciseLog.create({
        data: {
          exerciseId: exercise.id,
          date: d,
          entries: [
            { weight: 100 + i * 5, reps: 8 - i },
            { weight: 100 + i * 5, reps: 7 - i },
          ],
        },
      });
    }
  }

  // Logs for Pull Day exercises
  for (const exercise of pullDay.exercises.slice(0, 2)) {
    for (let i = 0; i < 2; i++) {
      const d = new Date(logDates[i]);
      d.setHours(0, 0, 0, 0);
      await prisma.exerciseLog.create({
        data: {
          exerciseId: exercise.id,
          date: d,
          entries: [
            { weight: 80 + i * 5, reps: 10 - i },
            { weight: 80 + i * 5, reps: 9 - i },
          ],
        },
      });
    }
  }

  // === DIET GOALS ===
  console.log("Creating diet goals...");
  await prisma.dietGoals.create({
    data: {
      calories: 2500,
      protein: 180,
      carbs: 250,
      fat: 80,
      fiber: 35,
      water: 120, // oz
    },
  });

  // === DIET LOGS ===
  console.log("Creating diet logs...");
  const dietDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  for (let i = 0; i < dietDates.length; i++) {
    await prisma.dietLog.create({
      data: {
        date: dietDates[i],
        calories: 2300 + Math.floor(Math.random() * 400),
        protein: 160 + Math.floor(Math.random() * 40),
        carbs: 220 + Math.floor(Math.random() * 60),
        fat: 70 + Math.floor(Math.random() * 20),
        fiber: 28 + Math.floor(Math.random() * 10),
        water: 80 + Math.floor(Math.random() * 50), // oz
      },
    });
  }

  // === SUPPLEMENTS ===
  console.log("Creating supplements...");
  await prisma.supplement.createMany({
    data: [
      { name: "Creatine Monohydrate", dosage: "5g", frequency: "daily", timeOfDay: "morning", isActive: true },
      { name: "Whey Protein", dosage: "25g", frequency: "daily", timeOfDay: "post-workout", isActive: true },
      { name: "Vitamin D3", dosage: "5000 IU", frequency: "daily", timeOfDay: "morning", isActive: true },
      { name: "Fish Oil", dosage: "2g", frequency: "daily", timeOfDay: "with-meals", isActive: true },
      { name: "Magnesium", dosage: "400mg", frequency: "daily", timeOfDay: "bedtime", isActive: true },
      { name: "Zinc", dosage: "30mg", frequency: "daily", timeOfDay: "evening", isActive: true },
      { name: "Pre-workout", dosage: "1 scoop", frequency: "as-needed", timeOfDay: "pre-workout", notes: "Only on heavy lifting days", isActive: true },
      { name: "Ashwagandha", dosage: "600mg", frequency: "daily", timeOfDay: "evening", isActive: false, notes: "Cycling off for a month" },
    ],
  });

  // === WEIGHT LOGS ===
  console.log("Creating weight logs...");
  let currentWeight = 185;
  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    // Simulate gradual weight loss with some fluctuation
    currentWeight = currentWeight - 0.05 + (Math.random() * 0.3 - 0.15);

    if (i % 2 === 0) { // Log every other day
      await prisma.weightLog.create({
        data: {
          date: d,
          weight: Math.round(currentWeight * 10) / 10,
        },
      });
    }
  }

  // === FINANCE ===
  console.log("Creating holdings...");
  await prisma.holding.createMany({
    data: [
      { symbol: "AAPL", shares: 50, avgCost: 165.50, currentPrice: 178.25 },
      { symbol: "GOOGL", shares: 20, avgCost: 125.00, currentPrice: 142.80 },
      { symbol: "MSFT", shares: 30, avgCost: 320.00, currentPrice: 378.50 },
      { symbol: "NVDA", shares: 15, avgCost: 450.00, currentPrice: 520.75 },
      { symbol: "AMZN", shares: 25, avgCost: 140.00, currentPrice: 155.20 },
      { symbol: "VOO", shares: 40, avgCost: 380.00, currentPrice: 425.00 },
    ],
  });

  await prisma.watchlistItem.createMany({
    data: [
      { symbol: "TSLA", notes: "Waiting for better entry point" },
      { symbol: "AMD", notes: "AI play, watching for pullback" },
      { symbol: "META", notes: "Strong ad revenue growth" },
    ],
  });

  // === GOALS ===
  console.log("Creating goals...");
  await prisma.goal.createMany({
    data: [
      { title: "Get to 12% body fat", description: "Currently around 18%, aiming for visible abs", type: "long", status: "active", progress: 35, targetDate: new Date("2025-06-01") },
      { title: "Bench press 225 lbs", description: "Current max is 195 lbs", type: "short", status: "active", progress: 75, targetDate: new Date("2025-03-01") },
      { title: "Read 24 books this year", description: "2 books per month", type: "long", status: "active", progress: 25 },
      { title: "Save $10,000 emergency fund", description: "Building financial security", type: "long", status: "active", progress: 60 },
      { title: "Learn Spanish basics", description: "Complete Duolingo Spanish course", type: "short", status: "active", progress: 40 },
      { title: "Run a 5K", description: "Build up cardio endurance", type: "short", status: "completed", progress: 100 },
    ],
  });

  // === CREATIVE IDEAS ===
  console.log("Creating creative ideas...");
  await prisma.creativeIdea.createMany({
    data: [
      { title: "Productivity app concept", content: "An app that gamifies daily tasks with RPG elements - gain XP, level up skills, unlock achievements", category: "app", isPinned: true },
      { title: "Lo-fi beat melody", content: "Chord progression: Fmaj7 - Em7 - Dm7 - Cmaj7. Add vinyl crackle and rain sounds", category: "music", isPinned: true },
      { title: "Blog post: My fitness journey", content: "Document the transformation from sedentary to consistent gym-goer. Include lessons learned and practical tips", category: "writing" },
      { title: "Minimal desk setup", content: "Clean aesthetic with monitor arm, mechanical keyboard, plant, and ambient lighting", category: "design" },
      { title: "Recipe: High protein overnight oats", content: "Greek yogurt base, whey protein, chia seeds, berries, honey. Prep Sunday for the week", category: "recipe" },
      { title: "Side project: Budget tracker", content: "Simple CLI tool to track expenses by category. Use SQLite for storage", category: "code" },
    ],
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
