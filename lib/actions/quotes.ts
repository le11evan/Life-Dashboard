"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createQuoteSchema, type CreateQuoteInput } from "@/lib/validations/quote";

// Default quotes to use when no quote is set for today
const DEFAULT_QUOTES = [
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    quote: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
  },
  {
    quote: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
  },
  {
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
  {
    quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
  },
];

export async function getTodayQuote() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingQuote = await db.dailyQuote.findUnique({
    where: { date: today },
  });

  if (existingQuote) {
    return existingQuote;
  }

  // Return a random default quote based on the day
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const quoteIndex = dayOfYear % DEFAULT_QUOTES.length;

  return {
    id: "default",
    date: today,
    quote: DEFAULT_QUOTES[quoteIndex].quote,
    author: DEFAULT_QUOTES[quoteIndex].author,
    source: null,
    createdAt: today,
  };
}

export async function setTodayQuote(input: CreateQuoteInput) {
  const validated = createQuoteSchema.parse(input);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const quote = await db.dailyQuote.upsert({
    where: { date: today },
    update: {
      quote: validated.quote,
      author: validated.author,
      source: validated.source,
    },
    create: {
      date: today,
      quote: validated.quote,
      author: validated.author,
      source: validated.source,
    },
  });

  revalidatePath("/");
  return quote;
}
