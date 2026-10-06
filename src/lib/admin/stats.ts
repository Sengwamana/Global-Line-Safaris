/**
 * Admin dashboard analytics helpers.
 *
 * Everything in this module is pure and dependency-free so the range maths,
 * bucketing and aggregation can be unit tested without a database or a request.
 * The route handler (`/api/admin/stats`) only supplies rows and serialises the
 * result; all shaping happens here.
 */

export type Granularity = "day" | "week" | "month";

/** Longest window the dashboard will analyse (inclusive day count). */
export const MAX_RANGE_DAYS = 366;

export const DAY_MS = 24 * 60 * 60 * 1000;

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export interface DashboardRange {
  /** Echo of the requested preset: "7d" | "30d" | "90d" | "365d" | "custom". */
  preset: string;
  /** Inclusive window start, midnight local time. */
  from: Date;
  /** Inclusive window end, end of day local time. */
  to: Date;
  /** Inclusive number of days covered by the window. */
  days: number;
  granularity: Granularity;
  /** Immediately preceding window of identical length, used for deltas. */
  compareFrom: Date;
  compareTo: Date;
}

export interface Bucket {
  /** Stable identifier for the bucket start (ISO date). */
  key: string;
  /** Short axis label, e.g. "Feb 3" or "Feb '26". */
  label: string;
  /** Full range label for tooltips and screen readers. */
  labelLong: string;
  start: number;
  end: number;
}

const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function longDayLabel(date: Date): string {
  return `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function parseDateOnly(value: string): Date | null {
  if (!DATE_ONLY.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  // Guards against overflow dates such as 2026-02-31.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

function toDateOnly(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Granularity scales with the window so a 7-day view stays per-day while a
 * year-long view does not render 365 bars.
 */
export function granularityFor(days: number): Granularity {
  if (days <= 31) return "day";
  if (days <= 120) return "week";
  return "month";
}

/**
 * Resolves the dashboard window from query parameters.
 *
 * Accepts either a preset (`?range=30d`) or an explicit window
 * (`?range=custom&from=2026-01-01&to=2026-01-31`). Returns null when the
 * request is unparseable so the caller can answer 400.
 */
export function resolveRange(input: {
  range?: string | null;
  from?: string | null;
  to?: string | null;
  now?: Date;
}): DashboardRange | null {
  const now = input.now ?? new Date();
  const today = startOfDay(now);

  const preset = (input.range ?? "30d").trim();
  const presetMatch = /^(\d{1,4})d$/.exec(preset);

  let from: Date;
  let to: Date;
  let resolvedPreset: string;

  if (preset === "custom") {
    const parsedFrom = input.from ? parseDateOnly(input.from.trim()) : null;
    const parsedTo = input.to ? parseDateOnly(input.to.trim()) : null;
    if (!parsedFrom || !parsedTo || parsedFrom > parsedTo) return null;
    from = parsedFrom;
    to = parsedTo;
    resolvedPreset = "custom";
  } else if (presetMatch) {
    const requested = Number(presetMatch[1]);
    if (requested < 1 || requested > MAX_RANGE_DAYS) return null;
    from = new Date(today.getTime() - (requested - 1) * DAY_MS);
    to = today;
    resolvedPreset = `${requested}d`;
  } else {
    return null;
  }

  const toEnd = endOfDay(to);
  const fromStart = startOfDay(from);
  const days = Math.floor((toEnd.getTime() - fromStart.getTime()) / DAY_MS) + 1;

  if (days > MAX_RANGE_DAYS) return null;
  if (days < 1) return null;

  return {
    preset: resolvedPreset,
    from: fromStart,
    to: toEnd,
    days,
    granularity: granularityFor(days),
    compareFrom: new Date(fromStart.getTime() - days * DAY_MS),
    compareTo: new Date(fromStart.getTime() - 1),
  };
}

/** `2026-02-03` — used for `<input type="date">` defaults and deep links. */
export function toDateInputValue(date: Date): string {
  return toDateOnly(date);
}

/**
 * Builds the contiguous bucket list covering the whole window so charts render
 * gaps as zero rather than skipping them.
 */
export function buildBuckets(range: DashboardRange): Bucket[] {
  const buckets: Bucket[] = [];
  const start = range.from.getTime();
  const end = range.to.getTime();

  if (range.granularity === "day") {
    for (let cursor = start; cursor <= end; cursor += DAY_MS) {
      const date = new Date(cursor);
      buckets.push({
        key: toDateOnly(date),
        label: `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}`,
        labelLong: longDayLabel(date),
        start: cursor,
        end: Math.min(cursor + DAY_MS - 1, end),
      });
    }
    return buckets;
  }

  if (range.granularity === "week") {
    for (let cursor = start; cursor <= end; cursor += 7 * DAY_MS) {
      const date = new Date(cursor);
      const bucketEnd = Math.min(cursor + 7 * DAY_MS - 1, end);
      buckets.push({
        key: toDateOnly(date),
        label: `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}`,
        labelLong: `${longDayLabel(date)} – ${longDayLabel(new Date(bucketEnd))}`,
        start: cursor,
        end: bucketEnd,
      });
    }
    return buckets;
  }

  const monthCursor = new Date(range.from.getFullYear(), range.from.getMonth(), 1);
  while (monthCursor.getTime() <= end) {
    const monthEnd = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0, 23, 59, 59, 999);
    buckets.push({
      key: `${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, "0")}`,
      label: `${MONTH_LABELS[monthCursor.getMonth()]} '${String(monthCursor.getFullYear()).slice(-2)}`,
      labelLong: `${FULL_MONTHS[monthCursor.getMonth()]} ${monthCursor.getFullYear()}`,
      start: Math.max(monthCursor.getTime(), start),
      end: Math.min(monthEnd.getTime(), end),
    });
    monthCursor.setMonth(monthCursor.getMonth() + 1);
  }
  return buckets;
}

/** Binary search for the bucket containing a timestamp; -1 when outside. */
export function findBucketIndex(buckets: Bucket[], timestamp: number): number {
  let low = 0;
  let high = buckets.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    const bucket = buckets[mid];
    if (timestamp < bucket.start) high = mid - 1;
    else if (timestamp > bucket.end) low = mid + 1;
    else return mid;
  }
  return -1;
}

/**
 * Percentage change between two periods. Returns null when there is no
 * baseline, so the UI can show "—" instead of a misleading +100%.
 */
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export interface Distribution {
  count: number;
  sum: number;
  mean: number;
  median: number;
  p90: number;
  min: number;
  max: number;
}

/** Summary statistics for a numeric sample; all-zero when the sample is empty. */
export function summarize(values: number[]): Distribution {
  if (values.length === 0) {
    return { count: 0, sum: 0, mean: 0, median: 0, p90: 0, min: 0, max: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, value) => acc + value, 0);
  return {
    count: sorted.length,
    sum,
    mean: Math.round((sum / sorted.length) * 10) / 10,
    median: percentile(sorted, 50),
    p90: percentile(sorted, 90),
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const position = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return Math.round((sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower)) * 10) / 10;
}

export interface Facet {
  label: string;
  count: number;
}

export const UNSPECIFIED = "Unspecified";

/** Trims a stored free-text field into a label, falling back when empty. */
export function normalizeLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length === 0 ? null : cleaned;
}

/** Counts normalised labels, keeping ties alphabetical for stable rendering. */
export function countBy(values: (string | null | undefined)[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) {
    const label = normalizeLabel(value) ?? UNSPECIFIED;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return counts;
}

/** Top facets by count, optionally merging the long tail into one row. */
export function topFacets(counts: Map<string, number>, limit: number, groupOthers = false): Facet[] {
  const sorted = [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  if (!groupOthers || sorted.length <= limit) return sorted.slice(0, limit);

  const head = sorted.slice(0, limit - 1);
  const tail = sorted.slice(limit - 1);
  return [
    ...head,
    {
      label: `${tail.length} other`,
      count: tail.reduce((acc, facet) => acc + facet.count, 0),
    },
  ];
}

/** Fraction of `value` within `total`, clamped to 0–100 and rounded. */
export function sharePct(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((value / total) * 1000) / 10);
}

// ---------------------------------------------------------------------------
// Inquiry pipeline vocabulary — shared by the API and the dashboard UI so the
// status pills, funnel and breakdown never drift apart.
// ---------------------------------------------------------------------------

export const INQUIRY_STATUSES = [
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "QUALIFIED",
  "CONVERTED",
  "CLOSED",
  "SPAM",
] as const;

export type InquiryStatusKey = (typeof INQUIRY_STATUSES)[number];

export const INQUIRY_STATUS_LABELS: Record<InquiryStatusKey, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  IN_PROGRESS: "In progress",
  QUALIFIED: "Qualified",
  CONVERTED: "Converted",
  CLOSED: "Closed",
  SPAM: "Spam",
};

/** Statuses that mean the lead has been worked but has not converted yet. */
export const OPEN_STATUSES: InquiryStatusKey[] = ["NEW", "CONTACTED", "IN_PROGRESS", "QUALIFIED"];

/** Statuses that indicate the team touched the lead at least once. */
export const ENGAGED_STATUSES: InquiryStatusKey[] = [
  "CONTACTED",
  "IN_PROGRESS",
  "QUALIFIED",
  "CONVERTED",
  "CLOSED",
];

export const QUALIFIED_STATUSES: InquiryStatusKey[] = ["QUALIFIED", "CONVERTED"];

export interface FunnelStage {
  key: string;
  label: string;
  /** Statuses that count toward this stage. */
  statuses: InquiryStatusKey[];
}

export const FUNNEL_STAGES: FunnelStage[] = [
  { key: "received", label: "Received", statuses: [...INQUIRY_STATUSES].filter((s) => s !== "SPAM") },
  { key: "engaged", label: "Contacted", statuses: ENGAGED_STATUSES },
  { key: "qualified", label: "Qualified", statuses: QUALIFIED_STATUSES },
  { key: "converted", label: "Converted", statuses: ["CONVERTED"] },
];

/** Human-readable duration for backlog/response metrics. */
export function formatDuration(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "—";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}
