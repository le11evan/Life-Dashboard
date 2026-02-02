import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// LA Timezone utilities
export const LA_TIMEZONE = "America/Los_Angeles";

export function getLADate(date?: Date): Date {
  const d = date || new Date();
  return new Date(d.toLocaleString("en-US", { timeZone: LA_TIMEZONE }));
}

export function getLADateString(date?: Date): string {
  const d = date || new Date();
  return d.toLocaleDateString("en-US", { timeZone: LA_TIMEZONE });
}

export function getLATimeString(date?: Date): string {
  const d = date || new Date();
  return d.toLocaleTimeString("en-US", {
    timeZone: LA_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getStartOfDayLA(date?: Date): Date {
  const laDate = getLADate(date);
  laDate.setHours(0, 0, 0, 0);
  return laDate;
}

export function formatDateLA(date: Date, options?: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString("en-US", {
    timeZone: LA_TIMEZONE,
    ...options
  });
}
