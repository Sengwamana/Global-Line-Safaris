"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  Download,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Loader2,
  MapPin,
  MessageSquare,
  Newspaper,
  Package,
  RefreshCw,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/admin-fetch";
import { DateRangeFilter, defaultWindowFor } from "@/components/admin/dashboard/DateRangeFilter";
import { FacetGrid } from "@/components/admin/dashboard/FacetGrid";
import { LeadsChart } from "@/components/admin/dashboard/LeadsChart";
import { ChannelStrip, FunnelPanel, StatusPanel, WorkloadPanel } from "@/components/admin/dashboard/PipelinePanels";
import { SectionCard } from "@/components/admin/dashboard/primitives";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { buildDashboardCsv, downloadCsv } from "@/components/admin/dashboard/exportCsv";
import {
  CHANNELS,
  formatDay,
  formatStatus,
  formatTimestamp,
  STATUS_PILLS,
  type DashboardPayload,
  type RangePreset,
  type RangeSelection,
  type RecentLead,
} from "@/components/admin/dashboard/types";
import { cn } from "@/lib/utils";

/**
 * Evaluated once at module scope so the server render and the first client
 * render agree — the window is adopted from the URL in a mount effect below.
 */
const DEFAULT_SELECTION: RangeSelection = { preset: "30d", ...defaultWindowFor("30d") };

const CHANNEL_FILTERS = [
  { key: "all", label: "All" },
  { key: "website", label: "Website" },
  { key: "trip", label: "Trip" },
  { key: "internship", label: "Internship" },
] as const;

const LEAD_KIND_LABELS: Record<RecentLead["kind"], string> = {
  website: "Website",
  trip: "Trip",
  internship: "Internship",
};

const LEAD_KIND_ICONS = {
  website: MessageSquare,
  trip: FileText,
  internship: GraduationCap,
};

const CONTENT_CARDS = [
  { label: "Services", key: "services", icon: Briefcase, href: "/admin/services" },
  { label: "Tour Packages", key: "tourPackages", icon: Package, href: "/admin/tour-packages" },
  { label: "Destinations", key: "destinations", icon: MapPin, href: "/admin/destinations" },
  { label: "Blog Posts", key: "blogPosts", icon: Newspaper, href: "/admin/blog-posts" },
  { label: "Team Members", key: "teamMembers", icon: Users, href: "/admin/team" },
  { label: "Industries", key: "industries", icon: Building2, href: "/admin/industries" },
  { label: "FAQs", key: "faqs", icon: HelpCircle, href: "/admin/faqs" },
] as const;

const QUICK_ACTIONS = [
  { label: "Trip inquiries", href: "/admin/trip-inquiries" },
  { label: "Website inquiries", href: "/admin/inquiries" },
  { label: "Internship applications", href: "/admin/internship-inquiries" },
  { label: "Destinations", href: "/admin/destinations" },
  { label: "Tour packages", href: "/admin/tour-packages" },
  { label: "Services", href: "/admin/services" },
  { label: "Homepage", href: "/admin/homepage" },
  { label: "SEO settings", href: "/admin/seo" },
  { label: "Media library", href: "/admin/media" },
  { label: "Subscribers", href: "/admin/subscribers" },
  { label: "Notifications", href: "/admin/notifications" },
  { label: "Site settings", href: "/admin/settings" },
];

/**
 * The window is part of the URL so a dashboard view can be linked or
 * bookmarked. `range=custom` requires `from` and `to` to be present as well.
 */
function selectionFromParams(params: URLSearchParams): RangeSelection {
  const raw = params.get("range");

  if (raw === "custom") {
    const from = params.get("from");
    const to = params.get("to");
    if (from && to) return { preset: "custom", from, to };
  }

  if (raw === "7d" || raw === "30d" || raw === "90d" || raw === "365d") {
    return { preset: raw, ...defaultWindowFor(raw) };
  }

  return DEFAULT_SELECTION;
}

function AdminDashboard() {
  const searchParams = useSearchParams();
  const [selection, setSelection] = useState<RangeSelection>(() => selectionFromParams(searchParams));
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leadFilter, setLeadFilter] = useState<(typeof CHANNEL_FILTERS)[number]["key"]>("all");

  useEffect(() => {
    const params = new URLSearchParams({ range: selection.preset });
    if (selection.preset === "custom") {
      params.set("from", selection.from);
      params.set("to", selection.to);
    }
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [selection]);

  const loadStats = useCallback(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ range: selection.preset });
    if (selection.preset === "custom") {
      params.set("from", selection.from);
      params.set("to", selection.to);
    }

    setLoading(true);
    setError(null);

    adminFetch(`/api/admin/stats?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          setError(
            response.status === 400
              ? "That date range is not valid. Choose a window of 366 days or less."
              : "Failed to load dashboard statistics."
          );
          return;
        }
        setData(await response.json());
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError("Failed to load dashboard statistics.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [selection]);

  useEffect(() => {
    // Fetch dashboard stats whenever the window changes (async; setState happens
    // after the await). The returned callback aborts an in-flight request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const abort = loadStats();
    return () => abort?.();
  }, [loadStats]);

  const summary = data?.summary;
  const series = useMemo(() => data?.series ?? [], [data]);
  const pending = loading || Boolean(error);

  const kpiCards = useMemo(() => {
    if (!summary) return [];
    const totals = series.map((point) => point.totalLeads);
    return [
      {
        label: "Total leads",
        value: summary.leads.total,
        deltaPct: summary.leads.deltaPct,
        series: totals,
        icon: <LayoutDashboard className="size-5" aria-hidden="true" />,
        href: "/admin/inquiries",
        badge:
          summary.workload.unread > 0
            ? { label: `${summary.workload.unread} unread`, tone: "rose" as const }
            : null,
      },
      {
        label: CHANNELS[0].longLabel,
        value: summary.website.total,
        deltaPct: summary.website.deltaPct,
        series: series.map((point) => point.inquiries),
        icon: <MessageSquare className="size-5" aria-hidden="true" />,
        href: CHANNELS[0].href,
        badge:
          summary.website.unread > 0
            ? { label: `${summary.website.unread} unread`, tone: "rose" as const }
            : null,
      },
      {
        label: CHANNELS[1].longLabel,
        value: summary.trip.total,
        deltaPct: summary.trip.deltaPct,
        series: series.map((point) => point.tripInquiries),
        icon: <FileText className="size-5" aria-hidden="true" />,
        href: CHANNELS[1].href,
        badge:
          summary.trip.unread > 0
            ? { label: `${summary.trip.unread} unread`, tone: "rose" as const }
            : null,
      },
      {
        label: CHANNELS[2].longLabel,
        value: summary.internship.total,
        deltaPct: summary.internship.deltaPct,
        series: series.map((point) => point.internshipInquiries),
        icon: <GraduationCap className="size-5" aria-hidden="true" />,
        href: CHANNELS[2].href,
        badge:
          summary.internship.unread > 0
            ? { label: `${summary.internship.unread} unread`, tone: "rose" as const }
            : null,
      },
    ];
  }, [summary, series]);

  const visibleLeads = useMemo(() => {
    const leads = data?.recentLeads ?? [];
    return leadFilter === "all" ? leads : leads.filter((lead) => lead.kind === leadFilter);
  }, [data, leadFilter]);

  const handleExport = () => {
    if (!data) return;
    const csv = buildDashboardCsv(data);
    downloadCsv(`global-line-safaris-dashboard-${data.range.from.slice(0, 10)}-to-${data.range.to.slice(0, 10)}.csv`, csv);
    toast.success("Dashboard exported as CSV");
  };

  const handleSelectionChange = (next: RangeSelection) => {
    setLeadFilter("all");
    setSelection(next as { preset: RangePreset; from: string; to: string });
  };

  const adminName = data?.adminUser?.name || "Admin";
  const windowLabel = data
    ? `${formatDay(data.range.from)} – ${formatDay(data.range.to)} · ${data.range.days} days · ${data.range.granularity} buckets`
    : null;

  return (
    <AdminPageShell
      title="Your workspace, at a glance."
      subtitle={`Welcome back, ${adminName}. Track every lead, every journey and every page.`}
      onRefresh={loadStats}
      loading={loading}
      actions={
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl gap-1.5"
          onClick={handleExport}
          disabled={!data}
        >
          <Download className="size-3.5" />
          Export CSV
        </Button>
      }
    >
      {error ? (
        <div className="mb-6 flex flex-col items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-center dark:border-red-500/30 dark:bg-red-500/10">
          <AlertTriangle className="size-6 text-red-400" aria-hidden="true" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
          <Button variant="outline" size="sm" className="mt-1 gap-1.5 rounded-xl" onClick={loadStats}>
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        </div>
      ) : null}

      <section className="admin-welcome">
        <div>
          <p className="admin-eyebrow">Every great journey starts here</p>
          <h2>Make room for the next adventure.</h2>
          <p>
            {summary
              ? `${summary.leads.total.toLocaleString()} leads arrived in this window, ${summary.pipeline.converted} converted, and ${summary.workload.unread} still need a reply.`
              : "Keep your destinations inspiring, your tours up to date, and your guests one step closer to their journey."}
          </p>
        </div>
        <Link href="/admin/trip-inquiries">
          Review trip inquiries <ArrowUpRight width={16} height={16} />
        </Link>
      </section>

      {/* Date range control — every panel below respects this window. */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 lg:flex-row lg:items-center lg:justify-between dark:border-slate-700/50 dark:bg-slate-900">
        <DateRangeFilter selection={selection} onChange={handleSelectionChange} disabled={loading} />
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          {windowLabel ?? "Loading window…"}
        </p>
      </div>

      {/* 1. KPI cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 min-w-0 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.length > 0
          ? kpiCards.map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                deltaPct={card.deltaPct}
                series={card.series}
                icon={card.icon}
                href={card.href}
                badge={card.badge}
              />
            ))
          : Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700/50 dark:bg-slate-900"
                aria-hidden="true"
              />
            ))}
      </div>

      {/* 2. Secondary metrics */}
      <div className="mb-6 grid grid-cols-1 gap-4 min-w-0 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Newsletter sign-ups"
          value={summary?.subscribers.newInRange ?? 0}
          deltaPct={summary?.subscribers.deltaPct ?? null}
          series={series.map((point) => point.subscribers)}
          icon={<Newspaper className="size-5" aria-hidden="true" />}
          href="/admin/subscribers"
          footnote={`${(summary?.subscribers.activeTotal ?? 0).toLocaleString()} active subscribers overall`}
        />
        <StatCard
          label="Unread leads"
          value={summary?.workload.unread ?? 0}
          icon={<Bell className="size-5" aria-hidden="true" />}
          href="/admin/inquiries"
          badge={
            summary && summary.workload.unread > 0
              ? { label: `Oldest ${summary.workload.oldestUnreadLabel}`, tone: "amber" as const }
              : { label: "Inbox clear", tone: "slate" as const }
          }
          footnote={`${summary?.pipeline.unassigned ?? 0} open leads unassigned`}
        />
        <StatCard
          label="Converted leads"
          value={summary?.pipeline.converted ?? 0}
          icon={<Users className="size-5" aria-hidden="true" />}
          href="/admin/trip-inquiries"
          badge={{ label: `${summary?.pipeline.conversionRatePct ?? 0}% rate`, tone: "slate" }}
          footnote={`${summary?.pipeline.open ?? 0} leads still open`}
        />
        <StatCard
          label="Unread notifications"
          value={summary?.unreadNotifications ?? 0}
          icon={<Zap className="size-5" aria-hidden="true" />}
          href="/admin/notifications"
          badge={{ label: "System", tone: "slate" }}
          footnote="Activity generated by the website and CMS"
        />
      </div>

      {/* 3. Volume chart + funnel */}
      <div className="mb-6 grid grid-cols-1 gap-6 min-w-0 xl:grid-cols-3">
        <LeadsChart
          series={series}
          granularity={data?.range.granularity ?? "day"}
          loading={loading}
          failed={Boolean(error)}
        />
        <FunnelPanel funnel={data?.funnel ?? []} total={summary?.leads.total ?? 0} />
      </div>

      {/* 4. Pipeline detail */}
      <div className="mb-6 grid grid-cols-1 gap-6 min-w-0 xl:grid-cols-3">
        <StatusPanel rows={data?.statusBreakdown ?? []} />
        {summary ? <WorkloadPanel summary={summary} /> : null}
        <SectionCard
          title="Channel health"
          description="Read rate and open leads per channel."
          icon={<Activity className="size-4" aria-hidden="true" />}
        >
          <div className="p-5">
            {summary ? (
              <ChannelStrip summary={summary} />
            ) : (
              <p className="py-8 text-center text-xs text-slate-400">Loading channel metrics…</p>
            )}
            <div className="mt-4 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Response speed</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {summary ? `${Math.round(summary.workload.medianFirstTouchHours)}h` : "—"}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
                Median time from a lead arriving to the first recorded change on it.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* 5. Demand facets */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
          What guests are asking for
        </h2>
        <FacetGrid facets={data?.facets ?? {}} rangeDays={data?.range.days ?? 0} />
      </div>

      {/* 6. Recent leads + team activity */}
      <div className="mb-6 grid grid-cols-1 gap-6 min-w-0 xl:grid-cols-3">
        <SectionCard
          title="Latest leads"
          description="Newest arrivals across every channel."
          icon={<MessageSquare className="size-4" aria-hidden="true" />}
          className="xl:col-span-2"
          action={
            <div className="flex flex-wrap gap-1.5">
              {CHANNEL_FILTERS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={leadFilter === option.key}
                  onClick={() => setLeadFilter(option.key)}
                  className={cn(
                    "h-7 rounded-lg px-2.5 text-[11px] font-bold transition-colors",
                    leadFilter === option.key
                      ? "bg-brand text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          }
        >
          {pending && !data ? (
            <p className="px-5 py-10 text-center text-xs text-slate-400" role="status">
              Loading leads…
            </p>
          ) : visibleLeads.length === 0 ? (
            <p className="px-5 py-10 text-center text-xs text-slate-400">
              No leads in this window. Try a wider date range or another channel.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {visibleLeads.map((lead) => {
                const Icon = LEAD_KIND_ICONS[lead.kind];
                return (
                  <li key={`${lead.kind}-${lead.id}`}>
                    <Link
                      href={lead.href}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                          <Icon className="size-3.5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "truncate text-sm",
                              lead.read
                                ? "font-medium text-slate-700 dark:text-slate-300"
                                : "font-bold text-slate-900 dark:text-white"
                            )}
                          >
                            {lead.name}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {lead.context ?? lead.email} · {LEAD_KIND_LABELS[lead.kind]}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge
                          className={`${STATUS_PILLS[lead.status] ?? STATUS_PILLS.CLOSED} border-0 text-[10px] font-bold`}
                        >
                          {formatStatus(lead.status)}
                        </Badge>
                        <span className="text-[10px] text-slate-400">{formatTimestamp(lead.createdAt)}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Team activity"
          description="Every change recorded in the audit trail."
          icon={<ShieldCheck className="size-4" aria-hidden="true" />}
          action={
            <Link href="/admin/audit-logs" className="text-xs font-bold text-brand hover:underline">
              Full trail →
            </Link>
          }
        >
          {(data?.recentActivity.length ?? 0) === 0 ? (
            <p className="px-5 py-10 text-center text-xs text-slate-400">
              {loading ? "Loading activity…" : "No admin activity in this window."}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.recentActivity.map((log) => (
                <li
                  key={log.id}
                  className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30"
                >
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <ShieldCheck className="size-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{log.action}</p>
                      <span className="shrink-0 text-[10px] text-slate-400">{formatTimestamp(log.createdAt)}</span>
                    </div>
                    <p className="truncate text-[11px] text-slate-500">
                      by {log.user} on {log.entity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* 7. Content inventory */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Published content</h2>
        <div className="grid grid-cols-1 gap-4 min-w-0 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {CONTENT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.key}
                href={card.href}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 transition-all hover:border-brand/30 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-900"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors group-hover:bg-brand/10 group-hover:text-brand dark:bg-slate-800 dark:text-slate-400">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-base font-black text-slate-900 dark:text-white">
                    {pending ? "—" : (data?.content[card.key] ?? 0)}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">{card.label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 8. Quick actions */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/50 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Keep things moving</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="inline-flex h-9 items-center rounded-xl border border-slate-200/80 bg-white px-4 text-xs font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </AdminPageShell>
  );
}

function DashboardFallback() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center" role="status">
      <Loader2 className="size-5 animate-spin text-brand" aria-hidden="true" />
      <p className="text-sm font-semibold text-slate-500">Preparing your dashboard…</p>
    </div>
  );
}

/**
 * The date-range control reads the query string, so the dashboard is wrapped in
 * a Suspense boundary — this keeps the server render and hydration in agreement
 * and lets a linked window (`?range=90d`) resolve before the first paint.
 */
export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <AdminDashboard />
    </Suspense>
  );
}
