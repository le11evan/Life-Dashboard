"use server";

import { db } from "@/lib/db";
import type { NewsArticle, DailyNewsData } from "@/lib/types/news";

// Get today's cached news or return placeholder
export async function getDailyNews(): Promise<DailyNewsData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cached = await db.dailyNews.findUnique({
    where: { date: today },
  });

  if (cached) {
    return {
      date: today.toISOString(),
      articles: cached.articles as unknown as NewsArticle[],
      generatedAt: cached.generatedAt.toISOString(),
    };
  }

  // Return placeholder news - in production, this would fetch from news APIs
  const placeholderNews: NewsArticle[] = [
    {
      category: "Technology",
      title: "AI Continues to Transform Industries",
      summary: "Latest developments in artificial intelligence are reshaping how businesses operate across sectors.",
    },
    {
      category: "Finance",
      title: "Markets Show Mixed Signals",
      summary: "Global markets display volatility as investors weigh economic indicators and policy decisions.",
    },
    {
      category: "Health",
      title: "New Research in Preventive Care",
      summary: "Studies highlight the importance of lifestyle factors in long-term health outcomes.",
    },
    {
      category: "Politics",
      title: "Policy Debates Continue",
      summary: "Legislators discuss key issues affecting communities nationwide.",
    },
    {
      category: "Science",
      title: "Space Exploration Milestones",
      summary: "Recent missions advance our understanding of the solar system and beyond.",
    },
  ];

  return {
    date: today.toISOString(),
    articles: placeholderNews,
    generatedAt: new Date().toISOString(),
  };
}

// Save fetched news to cache
export async function saveDailyNews(articles: NewsArticle[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db.dailyNews.upsert({
    where: { date: today },
    update: {
      articles: JSON.parse(JSON.stringify(articles)),
      generatedAt: new Date(),
    },
    create: {
      date: today,
      articles: JSON.parse(JSON.stringify(articles)),
      generatedAt: new Date(),
    },
  });
}
