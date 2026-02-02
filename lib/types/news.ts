export interface NewsArticle {
  category: string;
  title: string;
  summary: string;
  source?: string;
  url?: string;
}

export interface DailyNewsData {
  date: string;
  articles: NewsArticle[];
  generatedAt: string;
}

export const NEWS_CATEGORIES = [
  "Politics",
  "Technology",
  "Finance",
  "Health",
  "Science",
  "Sports",
  "Entertainment",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];
