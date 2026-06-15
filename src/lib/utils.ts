import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatCurrency(
  amount: number | string,
  currency: string = "MYR",
  locale: string = "en-MY",
) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (!Number.isFinite(num)) return "—";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(num);
}

export function formatDate(
  value: string | Date | null | undefined,
  opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
  locale: string = "en-MY",
) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, opts).format(d);
}

export function timeUntil(date: string | Date | null | undefined) {
  if (!date) return null;
  const target = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(target.getTime())) return null;
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return "Closed";
  const days = Math.floor(ms / 86400000);
  if (days > 1) return `${days} days left`;
  if (days === 1) return "1 day left";
  const hours = Math.floor(ms / 3600000);
  if (hours >= 1) return `${hours}h left`;
  const minutes = Math.max(1, Math.floor(ms / 60000));
  return `${minutes}m left`;
}

export const SDG_GOALS: Record<number, { title: string; color: string }> = {
  1: { title: "No Poverty", color: "#E5243B" },
  2: { title: "Zero Hunger", color: "#DDA63A" },
  3: { title: "Good Health & Well-being", color: "#4C9F38" },
  4: { title: "Quality Education", color: "#C5192D" },
  5: { title: "Gender Equality", color: "#FF3A21" },
  6: { title: "Clean Water & Sanitation", color: "#26BDE2" },
  7: { title: "Affordable & Clean Energy", color: "#FCC30B" },
  8: { title: "Decent Work & Growth", color: "#A21942" },
  9: { title: "Industry & Innovation", color: "#FD6925" },
  10: { title: "Reduced Inequalities", color: "#DD1367" },
  11: { title: "Sustainable Cities", color: "#FD9D24" },
  12: { title: "Responsible Consumption", color: "#BF8B2E" },
  13: { title: "Climate Action", color: "#3F7E44" },
  14: { title: "Life Below Water", color: "#0A97D9" },
  15: { title: "Life on Land", color: "#56C02B" },
  16: { title: "Peace, Justice & Institutions", color: "#00689D" },
  17: { title: "Partnerships for the Goals", color: "#19486A" },
};
