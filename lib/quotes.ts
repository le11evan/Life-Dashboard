// Contextual quotes for different sections of the app

export interface Quote {
  text: string;
  author: string;
}

// General motivational quotes
const GENERAL_QUOTES: Quote[] = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
];

// Fitness-related quotes
const FITNESS_QUOTES: Quote[] = [
  { text: "The body achieves what the mind believes.", author: "Napoleon Hill" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
  { text: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi" },
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
];

// Finance-related quotes
const FINANCE_QUOTES: Quote[] = [
  { text: "The stock market is a device for transferring money from the impatient to the patient.", author: "Warren Buffett" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
  { text: "The individual investor should act consistently as an investor and not as a speculator.", author: "Benjamin Graham" },
  { text: "Risk comes from not knowing what you're doing.", author: "Warren Buffett" },
];

// Journal/reflection quotes
const JOURNAL_QUOTES: Quote[] = [
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "Journaling is like whispering to one's self and listening at the same time.", author: "Mina Murray" },
  { text: "In the journal I am at ease.", author: "Anaïs Nin" },
  { text: "Writing in a journal reminds you of your goals and of your learning in life.", author: "Robin Sharma" },
  { text: "Journal writing is a voyage to the interior.", author: "Christina Baldwin" },
];

// Goals/productivity quotes
const GOALS_QUOTES: Quote[] = [
  { text: "A goal without a plan is just a wish.", author: "Antoine de Saint-Exupéry" },
  { text: "Setting goals is the first step in turning the invisible into the visible.", author: "Tony Robbins" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Dream big. Start small. Act now.", author: "Robin Sharma" },
];

// Creative/inspiration quotes
const CREATIVE_QUOTES: Quote[] = [
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "The chief enemy of creativity is good sense.", author: "Pablo Picasso" },
  { text: "Creativity takes courage.", author: "Henri Matisse" },
  { text: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou" },
  { text: "The desire to create is one of the deepest yearnings of the human soul.", author: "Dieter F. Uchtdorf" },
];

// Tasks/productivity quotes
const TASKS_QUOTES: Quote[] = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Productivity is never an accident. It is always the result of a commitment to excellence.", author: "Paul J. Meyer" },
  { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
];

// News/learning quotes
const LEARN_QUOTES: Quote[] = [
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "W.B. Yeats" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Knowledge is power.", author: "Francis Bacon" },
];

type QuoteCategory =
  | "general"
  | "fitness"
  | "finance"
  | "journal"
  | "goals"
  | "creative"
  | "tasks"
  | "learn";

const QUOTE_MAP: Record<QuoteCategory, Quote[]> = {
  general: GENERAL_QUOTES,
  fitness: FITNESS_QUOTES,
  finance: FINANCE_QUOTES,
  journal: JOURNAL_QUOTES,
  goals: GOALS_QUOTES,
  creative: CREATIVE_QUOTES,
  tasks: TASKS_QUOTES,
  learn: LEARN_QUOTES,
};

// Get a quote for a specific category - rotates daily
export function getQuoteForCategory(category: QuoteCategory): Quote {
  const quotes = QUOTE_MAP[category];
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Use category string to offset the quote selection
  const categoryOffset = category.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = (dayOfYear + categoryOffset) % quotes.length;

  return quotes[index];
}

// Get a random quote from a category
export function getRandomQuote(category: QuoteCategory): Quote {
  const quotes = QUOTE_MAP[category];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// Get all quotes for a category
export function getAllQuotes(category: QuoteCategory): Quote[] {
  return QUOTE_MAP[category];
}
