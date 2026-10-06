/** Shapes returned by `GET /api/admin/stats` — the dashboard's only data source. */

export interface ChannelSummary {
  total: number;
  previous: number;
  /** Null when the previous window had no records to compare against. */
  deltaPct: number | null;
  unread: number;
  open: number;
  converted: number;
  readRatePct: number;
  medianFirstTouchHours: number;
  avgFirstTouchHours: number;
}

export interface SeriesPoint {
  key: string;
  label: string;
  labelLong: string;
  inquiries: number;
  tripInquiries: number;
  internshipInquiries: number;
  subscribers: number;
  totalLeads: number;
}

export interface FunnelStage {
  key: string;
  label: string;
  count: number;
  sharePct: number;
}

export interface StatusRow {
  status: string;
  label: string;
  website: number;
  tripInquiries: number;
  internshipInquiries: number;
  total: number;
  sharePct: number;
}

export interface Facet {
  label: string;
  count: number;
}

export interface RecentLead {
  id: string;
  kind: "website" | "trip" | "internship";
  name: string;
  email: string;
  context: string | null;
  status: string;
  read: boolean;
  createdAt: string;
  href: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  user: string;
  createdAt: string;
}

export interface DashboardPayload {
  adminUser?: { name?: string; email?: string; role?: string };
  range: {
    preset: string;
    from: string;
    to: string;
    days: number;
    granularity: "day" | "week" | "month";
  };
  summary: {
    leads: { total: number; previous: number; deltaPct: number | null; received: number };
    website: ChannelSummary;
    trip: ChannelSummary;
    internship: ChannelSummary;
    subscribers: { activeTotal: number; newInRange: number; previous: number; deltaPct: number | null };
    pipeline: {
      open: number;
      unassigned: number;
      converted: number;
      conversionRatePct: number;
      readRatePct: number;
    };
    workload: {
      unread: number;
      oldestUnreadHours: number;
      oldestUnreadLabel: string;
      medianFirstTouchHours: number;
      avgFirstTouchHours: number;
      p90FirstTouchHours: number;
      measured: number;
    };
    unreadNotifications: number;
  };
  series: SeriesPoint[];
  funnel: FunnelStage[];
  statusBreakdown: StatusRow[];
  facets: {
    destinations: Facet[];
    packages: Facet[];
    services: Facet[];
    universities: Facet[];
    budgets: Facet[];
    sources: Facet[];
  };
  recentLeads: RecentLead[];
  recentActivity: AuditLogItem[];
  content: {
    services: number;
    teamMembers: number;
    faqs: number;
    industries: number;
    destinations: number;
    tourPackages: number;
    blogPosts: number;
    homepageSections: number;
  };
}

export type RangePreset = "7d" | "30d" | "90d" | "365d" | "custom";

export interface RangeSelection {
  preset: RangePreset;
  from: string;
  to: string;
}

/** Lead channels shown across the dashboard, in display order. */
export const CHANNELS = [
  {
    key: "website" as const,
    seriesKey: "inquiries" as const,
    label: "Website",
    longLabel: "Website inquiries",
    href: "/admin/inquiries",
    hex: "#214d3b",
    swatch: "bg-[#214d3b]",
  },
  {
    key: "trip" as const,
    seriesKey: "tripInquiries" as const,
    label: "Trip",
    longLabel: "Trip inquiries",
    href: "/admin/trip-inquiries",
    hex: "#8c6949",
    swatch: "bg-[#8c6949]",
  },
  {
    key: "internship" as const,
    seriesKey: "internshipInquiries" as const,
    label: "Internship",
    longLabel: "Internship applications",
    href: "/admin/internship-inquiries",
    hex: "#c7a46a",
    swatch: "bg-[#c7a46a]",
  },
];

export const NEWSLETTER_SWATCH = "bg-slate-400";

/** Maps a Recharts `dataKey` to a static swatch class (CSP: no inline styles). */
export const SERIES_SWATCH: Record<string, string> = {
  inquiries: "bg-[#214d3b]",
  tripInquiries: "bg-[#8c6949]",
  internshipInquiries: "bg-[#c7a46a]",
  subscribers: "bg-slate-400",
  totalLeads: "bg-brand",
};

export const STATUS_PILLS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  CONTACTED: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  IN_PROGRESS: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
  QUALIFIED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  CONVERTED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  CONFIRMED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  REVIEWING: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  QUOTED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  CLOSED: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400",
  SPAM: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
};

export function formatStatus(status: string): string {
  return status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function formatHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "—";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

export function formatDay(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
