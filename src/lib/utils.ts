import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** Builds a search string from a record, dropping undefined/empty values. */
export function buildQueryString(values: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Clamps a raw page value to a valid page number within `totalPages`. */
export function clampPage(raw: string | undefined | null, totalPages: number): number {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, Math.max(totalPages, 1));
}

/** Splits an array into a page slice; returns items + derived pagination info. */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): { items: T[]; page: number; totalPages: number; total: number } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page: safePage, totalPages, total };
}

export interface PageParams {
  page?: string;
  q?: string;
  category?: string;
  duration?: string;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

/**
 * Returns a displayable price, or null when the value is a placeholder.
 * The source site shows "From $0.00" for packages without a published price,
 * so those must never be rendered.
 */
export function displayPackagePrice(price?: string | null): string | null {
  if (!price) return null
  const normalized = price.trim()
  if (!normalized) return null
  const numeric = Number(normalized.replace(/[^0-9.]/g, ""))
  if (Number.isNaN(numeric) || numeric <= 0) return null
  return normalized
}
