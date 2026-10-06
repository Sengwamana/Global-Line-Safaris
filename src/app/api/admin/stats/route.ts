import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/admin/api-registry";
import {
  buildBuckets,
  countBy,
  findBucketIndex,
  formatDuration,
  FUNNEL_STAGES,
  INQUIRY_STATUSES,
  INQUIRY_STATUS_LABELS,
  normalizeLabel,
  OPEN_STATUSES,
  percentChange,
  resolveRange,
  sharePct,
  summarize,
  topFacets,
  type InquiryStatusKey,
} from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

/**
 * A read lead whose first update landed more than 30 days after submission was
 * reopened by the team, not answered — it is dropped so a single stale record
 * cannot dominate the response-time statistics.
 */
const FIRST_TOUCH_OUTLIER_HOURS = 30 * 24;
const HOUR_MS = 60 * 60 * 1000;

/** Columns needed for lead analytics; message bodies are never loaded here. */
const leadAnalyticsSelect = {
  status: true,
  read: true,
  archived: true,
  createdAt: true,
  updatedAt: true,
  assignedToId: true,
} as const;

interface LeadRow {
  status: string;
  read: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  assignedToId: string | null;
}

interface LeadFacetRow extends LeadRow {
  id: string;
  name: string;
  email: string;
}

interface WebsiteRow extends LeadFacetRow {
  service: string | null;
  source: string;
}

interface TripRow extends LeadFacetRow {
  destination: string | null;
  preferredPackage: string | null;
  budget: string | null;
}

interface InternshipRow extends LeadFacetRow {
  university: string | null;
  programType: string | null;
}

function isSpam(row: LeadRow): boolean {
  return row.status === "SPAM";
}

/** Spam is excluded from every pipeline metric but still counted per source. */
function realLeads(rows: LeadRow[]): LeadRow[] {
  return rows.filter((row) => !isSpam(row));
}

function countStatuses(rows: LeadRow[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
  }
  return counts;
}

function sumStatuses(rows: LeadRow[], statuses: InquiryStatusKey[]): number {
  const wanted = new Set<string>(statuses);
  return rows.reduce((acc, row) => (wanted.has(row.status) ? acc + 1 : acc), 0);
}

/**
 * Hours between a lead arriving and the first recorded change to it. Used as a
 * proxy for "time to first response" — the schema has no dedicated field.
 */
function firstTouchHours(rows: LeadRow[]): number[] {
  const samples: number[] = [];
  for (const row of rows) {
    if (!row.read) continue;
    const hours = (row.updatedAt.getTime() - row.createdAt.getTime()) / HOUR_MS;
    if (hours >= 0 && hours <= FIRST_TOUCH_OUTLIER_HOURS) samples.push(Math.round(hours * 10) / 10);
  }
  return samples;
}

function summariseChannel(rows: LeadRow[], previous: number) {
  const leads = realLeads(rows);
  const touched = summarize(firstTouchHours(leads));
  const unread = leads.filter((row) => !row.read && !row.archived).length;

  return {
    total: leads.length,
    previous,
    deltaPct: percentChange(leads.length, previous),
    unread,
    open: sumStatuses(leads, OPEN_STATUSES),
    converted: sumStatuses(leads, ["CONVERTED"]),
    readRatePct: sharePct(
      leads.filter((row) => row.read).length,
      leads.length
    ),
    medianFirstTouchHours: touched.median,
    avgFirstTouchHours: touched.mean,
  };
}

export async function GET(request: Request) {
  const { session, error } = await requireRole("EDITOR");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const range = resolveRange({
    range: searchParams.get("range"),
    from: searchParams.get("from"),
    to: searchParams.get("to"),
  });

  if (!range) {
    return NextResponse.json(
      { error: "Invalid date range. Use ?range=30d or ?range=custom&from=YYYY-MM-DD&to=YYYY-MM-DD." },
      { status: 400 }
    );
  }

  try {
    const window = { createdAt: { gte: range.from, lte: range.to } };
    const previousWindow = { createdAt: { gte: range.compareFrom, lte: range.compareTo } };

    const [
      websiteRows,
      tripRows,
      internshipRows,
      subscriberRows,
      previousWebsite,
      previousTrip,
      previousInternship,
previousSubscribers,
      activeSubscribers,
      unreadNotifications,
      publishedServices,
      publishedTeamMembers,
      publishedFaqs,
      publishedIndustries,
      publishedDestinations,
      publishedTourPackages,
      publishedBlogPosts,
      homepageSections,
      recentWebsite,
      recentTrip,
      recentInternship,
      recentActivity,
    ] = await Promise.all([
      prisma.inquiry.findMany({
        where: window,
        select: {
          ...leadAnalyticsSelect,
          id: true,
          name: true,
          email: true,
          service: true,
          source: true,
        },
      }),
      prisma.tripInquiry.findMany({
        where: window,
        select: {
          ...leadAnalyticsSelect,
          id: true,
          name: true,
          email: true,
          destination: true,
          preferredPackage: true,
          budget: true,
        },
      }),
      prisma.internshipInquiry.findMany({
        where: window,
        select: {
          ...leadAnalyticsSelect,
          id: true,
          name: true,
          email: true,
          university: true,
          programType: true,
        },
      }),
      prisma.newsletterSubscriber.findMany({
        where: { createdAt: window.createdAt },
        select: { createdAt: true },
      }),
      // Previous-period baselines power the trend arrows on every KPI card.
      prisma.inquiry.count({ where: previousWindow }),
      prisma.tripInquiry.count({ where: previousWindow }),
      prisma.internshipInquiry.count({ where: previousWindow }),
      prisma.newsletterSubscriber.count({ where: { ...previousWindow, active: true } }),
      prisma.newsletterSubscriber.count({ where: { active: true } }),
      prisma.notification.count({ where: { read: false } }),
      prisma.service.count({ where: { status: "PUBLISHED" } }),
      prisma.teamMember.count({ where: { status: "PUBLISHED" } }),
      prisma.faqItem.count({ where: { status: "PUBLISHED" } }),
      prisma.industry.count({ where: { status: "PUBLISHED" } }),
      prisma.destination.count({ where: { status: "PUBLISHED" } }),
      prisma.tourPackage.count({ where: { status: "PUBLISHED" } }),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
      prisma.homepageSection.count(),
      prisma.inquiry.findMany({
        where: window,
        take: 4,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, service: true, status: true, read: true, createdAt: true },
      }),
      prisma.tripInquiry.findMany({
        where: window,
        take: 4,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          destination: true,
          preferredPackage: true,
          status: true,
          read: true,
          createdAt: true,
        },
      }),
      prisma.internshipInquiry.findMany({
        where: window,
        take: 4,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          university: true,
          programType: true,
          status: true,
          read: true,
          createdAt: true,
        },
      }),
      prisma.auditLog.findMany({
        where: window,
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    const website = websiteRows as WebsiteRow[];
    const trip = tripRows as TripRow[];
    const internship = internshipRows as InternshipRow[];

    // ── Time series ──────────────────────────────────────────────────────────
    const buckets = buildBuckets(range);
    const series = buckets.map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      labelLong: bucket.labelLong,
      inquiries: 0,
      tripInquiries: 0,
      internshipInquiries: 0,
      subscribers: 0,
      totalLeads: 0,
    }));

    const plot = (rows: LeadRow[], key: "inquiries" | "tripInquiries" | "internshipInquiries") => {
      for (const row of rows) {
        if (isSpam(row)) continue;
        const index = findBucketIndex(buckets, row.createdAt.getTime());
        if (index >= 0) {
          series[index][key] += 1;
          series[index].totalLeads += 1;
        }
      }
    };
    plot(website, "inquiries");
    plot(trip, "tripInquiries");
    plot(internship, "internshipInquiries");

    for (const subscriber of subscriberRows) {
      const index = findBucketIndex(buckets, subscriber.createdAt.getTime());
      if (index >= 0) series[index].subscribers += 1;
    }

    // ── Pipeline ─────────────────────────────────────────────────────────────
    const allLeads: LeadRow[] = [...websiteRows, ...tripRows, ...internshipRows];
    const qualified = realLeads(allLeads);
    const converted = sumStatuses(qualified, ["CONVERTED"]);
    const channelStatuses = {
      website: countStatuses(realLeads(website)),
      trip: countStatuses(realLeads(trip)),
      internship: countStatuses(realLeads(internship)),
    };
    const combinedStatuses = countStatuses(qualified);

    const statusBreakdown = INQUIRY_STATUSES.map((status) => ({
      status,
      label: INQUIRY_STATUS_LABELS[status],
      website: channelStatuses.website.get(status) ?? 0,
      tripInquiries: channelStatuses.trip.get(status) ?? 0,
      internshipInquiries: channelStatuses.internship.get(status) ?? 0,
      total: combinedStatuses.get(status) ?? 0,
      sharePct: sharePct(combinedStatuses.get(status) ?? 0, qualified.length),
    })).filter((row) => row.total > 0);

    const funnel = FUNNEL_STAGES.map((stage) => {
      const count = sumStatuses(qualified, stage.statuses);
      return { key: stage.key, label: stage.label, count, sharePct: sharePct(count, qualified.length) };
    });

    // ── Workload ─────────────────────────────────────────────────────────────
    const unread = qualified.filter((row) => !row.read && !row.archived);
    const oldestUnreadHours = unread.reduce(
      (max, row) => Math.max(max, (Date.now() - row.createdAt.getTime()) / HOUR_MS),
      0
    );
    const openLeads = qualified.filter((row) => (OPEN_STATUSES as string[]).includes(row.status));
    const responseStats = summarize(firstTouchHours(qualified));

    // ── Facets ───────────────────────────────────────────────────────────────
    const facetLimit = range.days <= 31 ? 6 : 8;
    const topDestinations = topFacets(countBy(trip.map((row) => row.destination)), facetLimit);
    const topPackages = topFacets(countBy(trip.map((row) => row.preferredPackage)), facetLimit);
    const topServices = topFacets(countBy(website.map((row) => row.service)), facetLimit);
    const topUniversities = topFacets(countBy(internship.map((row) => row.university)), facetLimit);
    const topBudgets = topFacets(countBy(trip.map((row) => row.budget)), facetLimit);
    const leadSources = topFacets(countBy(website.map((row) => row.source)), 6);

    // ── Recent leads across every channel ────────────────────────────────────
    const recentLeads = [
      ...recentWebsite.map((row) => ({
        id: row.id,
        kind: "website" as const,
        name: row.name,
        email: row.email,
        context: normalizeLabel(row.service),
        status: row.status,
        read: row.read,
        createdAt: row.createdAt,
        href: `/admin/inquiries/${row.id}`,
      })),
      ...recentTrip.map((row) => ({
        id: row.id,
        kind: "trip" as const,
        name: row.name,
        email: row.email,
        context: normalizeLabel(row.destination) ?? normalizeLabel(row.preferredPackage),
        status: row.status,
        read: row.read,
        createdAt: row.createdAt,
        href: "/admin/trip-inquiries",
      })),
      ...recentInternship.map((row) => ({
        id: row.id,
        kind: "internship" as const,
        name: row.name,
        email: row.email,
        context: normalizeLabel(row.university) ?? normalizeLabel(row.programType),
        status: row.status,
        read: row.read,
        createdAt: row.createdAt,
        href: "/admin/internship-inquiries",
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 8);

    const totalInRange = website.length + trip.length + internship.length;
    const previousTotal = previousWebsite + previousTrip + previousInternship;

    return NextResponse.json({
      adminUser: {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      },
      range: {
        preset: range.preset,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        days: range.days,
        granularity: range.granularity,
      },
      summary: {
        leads: {
          total: qualified.length,
          previous: previousTotal,
          deltaPct: percentChange(qualified.length, previousTotal),
          received: totalInRange,
        },
        website: summariseChannel(websiteRows, previousWebsite),
        trip: summariseChannel(tripRows, previousTrip),
        internship: summariseChannel(internshipRows, previousInternship),
        subscribers: {
          activeTotal: activeSubscribers,
          newInRange: subscriberRows.length,
          previous: previousSubscribers,
          deltaPct: percentChange(subscriberRows.length, previousSubscribers),
        },
        pipeline: {
          open: openLeads.length,
          unassigned: openLeads.filter((row) => !row.assignedToId).length,
          converted,
          conversionRatePct: sharePct(converted, qualified.length),
          readRatePct: sharePct(
            qualified.filter((row) => row.read).length,
            qualified.length
          ),
        },
        workload: {
          unread: unread.length,
          oldestUnreadHours: Math.round(oldestUnreadHours),
          oldestUnreadLabel: formatDuration(oldestUnreadHours),
          medianFirstTouchHours: responseStats.median,
          avgFirstTouchHours: responseStats.mean,
          p90FirstTouchHours: responseStats.p90,
          measured: responseStats.count,
        },
        unreadNotifications,
      },
      series,
      funnel,
      statusBreakdown,
      facets: {
        destinations: topDestinations,
        packages: topPackages,
        services: topServices,
        universities: topUniversities,
        budgets: topBudgets,
        sources: leadSources,
      },
      recentLeads,
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        details: log.details,
        user: log.user ? log.user.name || log.user.email : "System",
        createdAt: log.createdAt,
      })),
      content: {
        services: publishedServices,
        teamMembers: publishedTeamMembers,
        faqs: publishedFaqs,
        industries: publishedIndustries,
        destinations: publishedDestinations,
        tourPackages: publishedTourPackages,
        blogPosts: publishedBlogPosts,
        homepageSections,
      },
    });
  } catch (error) {
    console.error("[admin:stats] error", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
