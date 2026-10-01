"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  FileText,
  Bell,
  Users,
  HelpCircle,
  ArrowUpRight,
  Briefcase,
  Activity,
  Building2,
  MapPin,
  Package,
  Newspaper,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  GraduationCap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/admin-fetch";

interface LeadItem {
  id: string;
  name: string;
  email: string;
  service: string | null;
  status: string;
  read: boolean;
  createdAt: string;
}

interface TripLeadItem {
  id: string;
  name: string;
  email: string;
  destination: string | null;
  preferredPackage: string | null;
  status: string;
  read: boolean;
  createdAt: string;
}

interface InternshipLeadItem {
  id: string;
  name: string;
  email: string;
  university: string | null;
  programType: string | null;
  status: string;
  read: boolean;
  createdAt: string;
}

interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  user: string;
  createdAt: string;
}

interface MonthlyTrend {
  month: string;
  inquiries: number;
  tripInquiries: number;
  internshipInquiries: number;
  totalLeads: number;
}

interface DashboardPayload {
  adminUser?: { name?: string; email?: string; role?: string };
  stats: {
    inquiries: { total: number; recent: number; unread: number };
    tripInquiries: { total: number; recent: number; unread: number };
    internshipInquiries: { total: number; recent: number; unread: number };
    subscribers: { total: number; recent: number };
    unreadNotifications: number;
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
  };
  monthlyTrends: MonthlyTrend[];
  recentInquiries: LeadItem[];
  recentTripInquiries: TripLeadItem[];
  recentInternshipInquiries: InternshipLeadItem[];
  recentActivity: AuditLogItem[];
}

const STATUS_PILLS: Record<string, string> = {
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

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-xs dark:bg-slate-900 dark:border-slate-800">
      <p className="font-bold text-slate-900 dark:text-white mb-1.5">{label}</p>
      {payload.map((item: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-slate-500 capitalize">
            <span className="size-2 rounded-full" data-color={item.color} />
            {item.name}:
          </span>
          <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = () => {
    setLoading(true);
    setError(null);
    adminFetch("/api/admin/stats")
      .then(async (r) => {
        if (!r.ok) {
          setError("Failed to load dashboard statistics.");
          return;
        }
        setData(await r.json());
      })
      .catch(() => setError("Failed to load dashboard statistics."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Fetch dashboard stats on mount (async; setState happens after await).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, []);

  const stats = data?.stats;
  const adminName = data?.adminUser?.name || "Admin";

  const kpiCards = [
    {
      label: "Website Inquiries",
      value: stats?.inquiries.total ?? 0,
      recent: stats?.inquiries.recent ?? 0,
      unread: stats?.inquiries.unread ?? 0,
      icon: MessageSquare,
      href: "/admin/inquiries",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Trip Inquiries",
      value: stats?.tripInquiries.total ?? 0,
      recent: stats?.tripInquiries.recent ?? 0,
      unread: stats?.tripInquiries.unread ?? 0,
      icon: FileText,
      href: "/admin/trip-inquiries",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Internship Applications",
      value: stats?.internshipInquiries.total ?? 0,
      recent: stats?.internshipInquiries.recent ?? 0,
      unread: stats?.internshipInquiries.unread ?? 0,
      icon: GraduationCap,
      href: "/admin/internship-inquiries",
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Newsletter Subscribers",
      value: stats?.subscribers.total ?? 0,
      recent: stats?.subscribers.recent ?? 0,
      unread: 0,
      icon: Users,
      href: "/admin/subscribers",
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Notifications",
      value: stats?.unreadNotifications ?? 0,
      recent: 0,
      unread: 0,
      icon: Bell,
      href: "/admin/notifications",
      color: "from-amber-500 to-orange-500",
    },
  ];

  const contentCards = [
    { label: "Services", value: stats?.content.services ?? 0, icon: Briefcase, href: "/admin/services" },
    { label: "Tour Packages", value: stats?.content.tourPackages ?? 0, icon: Package, href: "/admin/tour-packages" },
    { label: "Destinations", value: stats?.content.destinations ?? 0, icon: MapPin, href: "/admin/destinations" },
    { label: "Blog Posts", value: stats?.content.blogPosts ?? 0, icon: Newspaper, href: "/admin/blog-posts" },
    { label: "Team Members", value: stats?.content.teamMembers ?? 0, icon: Users, href: "/admin/team" },
    { label: "Industries", value: stats?.content.industries ?? 0, icon: Building2, href: "/admin/industries" },
    { label: "FAQs", value: stats?.content.faqs ?? 0, icon: HelpCircle, href: "/admin/faqs" },
  ];

  const hasChartData = (data?.monthlyTrends ?? []).some((m) => m.totalLeads > 0);

  return (
    <AdminPageShell
      title="Your workspace, at a glance."
      subtitle={`Welcome back, ${adminName}. Here’s what’s happening across your website.`}
      onRefresh={fetchStats}
      loading={loading}
    >
      {error && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/30 px-6 py-5 mb-8 text-center">
          <AlertTriangle className="size-6 text-red-400" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5 mt-1" onClick={fetchStats}>
            <RefreshCw className="size-3.5" /> Retry
          </Button>
        </div>
      )}
      <section className="admin-welcome">
        <div>
          <p className="admin-eyebrow">Every great journey starts here</p>
          <h2>Make room for the next adventure.</h2>
          <p>Keep your destinations inspiring, your tours up to date, and your guests one step closer to their journey.</p>
        </div>
        <Link href="/admin/trip-inquiries">Review trip inquiries <ArrowUpRight width={16} height={16} /></Link>
      </section>
      <div className="flex flex-wrap gap-3 mb-8">
        <Link className="safari-text-link" href="/admin/destinations">Manage destinations <ArrowUpRight width={15} height={15} /></Link>
        <Link className="safari-text-link" href="/admin/tour-packages">Manage tour packages <ArrowUpRight width={15} height={15} /></Link>
      </div>
      {/* 1. KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 dark:bg-slate-900 dark:border-slate-700/50 hover:shadow-md hover:border-brand/30 transition-all relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand`}>
                  <Icon className="size-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  {card.unread > 0 && (
                    <span className="h-5 px-2 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center">
                      {card.unread} unread
                    </span>
                  )}
                  <ArrowUpRight className="size-4 text-slate-300 group-hover:text-brand transition-colors" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {loading || error ? "—" : card.value.toLocaleString()}
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{card.label}</p>
              {card.recent > 0 ? (
                <p className="text-[11px] font-bold text-emerald-600 mt-1">
                  +{card.recent} in last 30 days
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">All time records</p>
              )}
            </Link>
          );
        })}
      </div>

      {/* 2. Monthly Lead Trends Chart */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:bg-slate-900 dark:border-slate-700/50 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-brand" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Interest in your journeys
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Website and trip inquiries over the last six months.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#214d3b]" /> Website
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#8c6949]" /> Trip inquiries
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#c7a46a]" /> Consultations
            </span>
          </div>
        </div>

        {loading || error || !hasChartData ? (
          <div className="h-64 flex items-center justify-center text-sm text-slate-500" role="status">{loading ? "Loading journey insights…" : error ? "Insights are unavailable. Please retry above." : "Your journey insights will appear as inquiries arrive."}</div>
        ) : <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.monthlyTrends ?? []}>
              <defs>
                <linearGradient id="inqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#214d3b" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#214d3b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="quoteGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8c6949" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#8c6949" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="consultGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c7a46a" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#c7a46a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="inquiries" stroke="#214d3b" strokeWidth={2} fill="url(#inqGrad)" name="Website" />
              <Area type="monotone" dataKey="tripInquiries" stroke="#8c6949" strokeWidth={2} fill="url(#quoteGrad)" name="Trip inquiries" />
              <Area type="monotone" dataKey="internshipInquiries" stroke="#c7a46a" strokeWidth={2} fill="url(#consultGrad)" name="Internship applications" />
            </AreaChart>
          </ResponsiveContainer>
        </div>}
      </div>

      {/* 3. Live Activity & Recent Leads */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Recent Inquiries */}
        <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-700/50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-brand" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Website Inquiries</h2>
            </div>
            <Link href="/admin/inquiries" className="text-xs font-bold text-brand hover:underline">
              View All Inquiries →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(data?.recentInquiries?.length ?? 0) === 0 ? (
              <p className="px-5 py-10 text-center text-xs text-slate-400">
                {loading ? "Loading inquiries…" : error ? "Inquiries are unavailable." : "No inquiries yet. New contact form submissions will appear here."}
              </p>
            ) : (
              data?.recentInquiries.map((inquiry) => (
                <Link
                  key={inquiry.id}
                  href={`/admin/inquiries/${inquiry.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                      {inquiry.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm ${!inquiry.read ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300"} truncate`}>
                        {inquiry.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{inquiry.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <Badge className={`${STATUS_PILLS[inquiry.status] ?? ""} border-0 text-[10px] font-bold`}>
                      {inquiry.status.replace("_", " ")}
                    </Badge>
                    <span className="text-[10px] text-slate-400">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Trip Requests */}
        <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-700/50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-brand" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Trip Requests</h2>
            </div>
            <Link href="/admin/trip-inquiries" className="text-xs font-bold text-brand hover:underline">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(data?.recentTripInquiries?.length ?? 0) === 0 ? (
              <p className="px-5 py-10 text-center text-xs text-slate-400">
                {loading ? "Loading trip requests…" : error ? "Trip requests are unavailable." : "No trip requests yet. Plan-your-trip submissions will appear here."}
              </p>
            ) : (
              data?.recentTripInquiries.map((trip) => (
                <Link
                  key={trip.id}
                  href="/admin/trip-inquiries"
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                      {trip.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm ${!trip.read ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300"} truncate`}>
                        {trip.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {trip.destination || trip.preferredPackage || trip.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <Badge className={`${STATUS_PILLS[trip.status] ?? ""} border-0 text-[10px] font-bold`}>
                      {trip.status.replace("_", " ")}
                    </Badge>
                    <span className="text-[10px] text-slate-400">
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Real Audit Log Activity */}
        <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-700/50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-brand" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent team activity</h2>
            </div>
            <Link href="/admin/audit-logs" className="text-xs font-bold text-brand hover:underline">
              Full Audit Trail →
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(data?.recentActivity?.length ?? 0) === 0 ? (
              <p className="px-5 py-10 text-center text-xs text-slate-400">
                {loading ? "Loading activity…" : error ? "Activity is unavailable." : "No team activity recorded yet."}
              </p>
            ) : (
              data?.recentActivity.map((log) => (
                <div key={log.id} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 mt-0.5">
                    <ShieldCheck className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {log.action}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      by {log.user} on {log.entity}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Published Content Counts */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Website content</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {contentCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="group flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 dark:bg-slate-900 dark:border-slate-700/50 hover:shadow-md hover:border-brand/30 transition-all"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 dark:text-white">
                    {loading || error ? "—" : card.value}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">{card.label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 5. Quick Actions */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:bg-slate-900 dark:border-slate-700/50">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Keep things moving</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Trip Inquiries", href: "/admin/trip-inquiries" },
            { label: "Website Inquiries", href: "/admin/inquiries" },
            { label: "Destinations", href: "/admin/destinations" },
            { label: "Tour Packages", href: "/admin/tour-packages" },
            { label: "Manage Services", href: "/admin/services" },
            { label: "Manage Team", href: "/admin/team" },
            { label: "Edit Homepage", href: "/admin/homepage" },
            { label: "SEO Settings", href: "/admin/seo" },
            { label: "Upload Media", href: "/admin/media" },
            { label: "Website Settings", href: "/admin/settings" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="inline-flex items-center h-9 rounded-xl border border-slate-200/80 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-all"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </AdminPageShell>
  );
}
