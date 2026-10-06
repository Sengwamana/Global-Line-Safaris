"use client";

import Link from "next/link";
import { AlertTriangle, BarChart3, Clock, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Meter, Metric, SectionCard, StackedMeter } from "./primitives";
import {
  CHANNELS,
  formatHours,
  formatStatus,
  STATUS_PILLS,
  type DashboardPayload,
  type FunnelStage,
  type StatusRow,
} from "./types";

/** Received → Contacted → Qualified → Converted, across every lead channel. */
export function FunnelPanel({ funnel, total }: { funnel: FunnelStage[]; total: number }) {
  return (
    <SectionCard
      title="Pipeline funnel"
      description="How leads progress through the inquiry lifecycle."
      icon={<Filter className="size-4" aria-hidden="true" />}
    >
      {total === 0 ? (
        <p className="px-5 py-10 text-center text-xs text-slate-400">
          No leads in this window, so there is nothing to progress yet.
        </p>
      ) : (
        <ol className="divide-y divide-slate-100 dark:divide-slate-800">
          {funnel.map((stage, index) => {
            const previous = index > 0 ? funnel[index - 1] : null;
            const stepRate =
              previous && previous.count > 0 ? Math.round((stage.count / previous.count) * 100) : null;

            return (
              <li key={stage.key} className="px-5 py-3.5">
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                    {stage.label}
                    {stepRate !== null && stepRate > 0 ? (
                      <span className="text-[10px] font-semibold text-slate-400">
                        {stepRate}% of {funnel[index - 1].label.toLowerCase()}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {stage.count.toLocaleString()}
                    <span className="ml-1.5 font-semibold text-slate-400">{stage.sharePct}%</span>
                  </span>
                </div>
                <Meter percent={stage.sharePct} ariaLabel={`${stage.label}: ${stage.count} leads (${stage.sharePct}%)`} />
              </li>
            );
          })}
        </ol>
      )}
    </SectionCard>
  );
}

/** Per-status split with each channel stacked inside the row. */
export function StatusPanel({ rows }: { rows: StatusRow[] }) {
  return (
    <SectionCard
      title="Status breakdown"
      description="Where leads are sitting right now, by channel."
      icon={<BarChart3 className="size-4" aria-hidden="true" />}
      action={
        <Link href="/admin/inquiries" className="text-xs font-bold text-brand hover:underline">
          Manage pipeline →
        </Link>
      }
    >
      {rows.length === 0 ? (
        <p className="px-5 py-10 text-center text-xs text-slate-400">No statuses to report in this window.</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row) => (
            <li key={row.status} className="px-5 py-3">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <Badge className={`${STATUS_PILLS[row.status] ?? STATUS_PILLS.CLOSED} border-0 text-[10px] font-bold`}>
                  {formatStatus(row.status)}
                </Badge>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {row.total.toLocaleString()}
                  <span className="ml-1.5 font-semibold text-slate-400">{row.sharePct}%</span>
                </span>
              </div>
              <StackedMeter
                ariaLabel={`${formatStatus(row.status)}: ${row.total} leads`}
                segments={[
                  { value: row.website, fillClass: "fill-[#214d3b]", title: "Website" },
                  { value: row.tripInquiries, fillClass: "fill-[#8c6949]", title: "Trip" },
                  { value: row.internshipInquiries, fillClass: "fill-[#c7a46a]", title: "Internship" },
                ]}
              />
              <p className="mt-1.5 text-[10px] text-slate-400">
                Website {row.website} · Trip {row.tripInquiries} · Internship {row.internshipInquiries}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

/** Read rate, conversion, backlog age and first-touch speed. */
export function WorkloadPanel({ summary }: { summary: DashboardPayload["summary"] }) {
  const { pipeline, workload } = summary;
  const stale = workload.oldestUnreadHours > 48;

  return (
    <SectionCard
      title="Response & workload"
      description="How quickly the team is working the inbox."
      icon={<Clock className="size-4" aria-hidden="true" />}
    >
      <div className="grid grid-cols-1 gap-2.5 p-5 min-w-0 sm:grid-cols-2">
        <Metric
          label="Unread backlog"
          value={workload.unread.toLocaleString()}
          hint={workload.unread > 0 ? `Oldest waiting ${workload.oldestUnreadLabel}` : "Inbox is clear"}
          tone={stale ? "warning" : "default"}
        />
        <Metric
          label="Median first touch"
          value={formatHours(workload.medianFirstTouchHours)}
          hint={
            workload.measured > 0
              ? `Based on ${workload.measured} handled leads`
              : "No handled leads in range"
          }
        />
        <Metric
          label="90th percentile"
          value={formatHours(workload.p90FirstTouchHours)}
          hint="Slowest tenth of responses"
        />
        <Metric
          label="Read rate"
          value={`${pipeline.readRatePct}%`}
          hint={`${pipeline.unassigned} open lead${pipeline.unassigned === 1 ? "" : "s"} unassigned`}
          tone={pipeline.readRatePct >= 80 ? "positive" : "default"}
        />
        <Metric
          label="Conversion rate"
          value={`${pipeline.conversionRatePct}%`}
          hint={`${pipeline.converted} converted of ${summary.leads.total} leads`}
        />
        <Metric
          label="Open pipeline"
          value={pipeline.open.toLocaleString()}
          hint="New, contacted, in progress or qualified"
        />
      </div>

      {stale ? (
        <p className="mx-5 mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] font-semibold leading-snug text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          The oldest unread lead has been waiting {workload.oldestUnreadLabel}. Review the queue before it cools.
        </p>
      ) : null}

      <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
        <p className="text-[11px] leading-relaxed text-slate-400">
          First touch is measured from a lead arriving to the first recorded change on it. Reopened or
          re-edited records older than 30 days are excluded.
        </p>
      </div>
    </SectionCard>
  );
}

/** Small channel recap used in the KPI header strip. */
export function ChannelStrip({ summary }: { summary: DashboardPayload["summary"] }) {
  const channels = [
    { channel: CHANNELS[0], data: summary.website },
    { channel: CHANNELS[1], data: summary.trip },
    { channel: CHANNELS[2], data: summary.internship },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 min-w-0 sm:grid-cols-3">
      {channels.map(({ channel, data }) => (
        <Link
          key={channel.key}
          href={channel.href}
          className="group rounded-xl border border-slate-200/70 bg-white p-3.5 transition-colors hover:border-brand/30 dark:border-slate-700/50 dark:bg-slate-900"
        >
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <span className={cn("size-2 rounded-full", channel.swatch)} aria-hidden="true" />
            {channel.longLabel}
          </p>
          <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{data.total}</p>
          <p className="text-[10px] text-slate-400">
            {data.unread > 0 ? `${data.unread} unread · ` : ""}
            {data.open} open · {data.readRatePct}% read
          </p>
        </Link>
      ))}
    </div>
  );
}
