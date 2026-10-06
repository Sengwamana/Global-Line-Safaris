"use client";

import type { DashboardPayload } from "./types";

function escapeCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
}

/**
 * Flattens the current dashboard window into a spreadsheet: the time series
 * first, then every ranked facet, so a single download covers the whole view.
 */
export function buildDashboardCsv(payload: DashboardPayload): string {
  const rows: (string | number | null | undefined)[][] = [
    ["Global Line Safaris — dashboard export"],
    ["Window", `${payload.range.from.slice(0, 10)} to ${payload.range.to.slice(0, 10)}`, `${payload.range.days} days`],
    ["Granularity", payload.range.granularity],
    [],
    ["LEAD VOLUME"],
    ["Period", "Website", "Trip", "Internship", "Subscribers", "Total leads"],
    ...payload.series.map((point) => [
      point.labelLong,
      point.inquiries,
      point.tripInquiries,
      point.internshipInquiries,
      point.subscribers,
      point.totalLeads,
    ]),
    [],
    ["PIPELINE"],
    ["Stage", "Leads", "Share %"],
    ...payload.funnel.map((stage) => [stage.label, stage.count, stage.sharePct]),
    [],
    ["STATUS BREAKDOWN"],
    ["Status", "Website", "Trip", "Internship", "Total"],
    ...payload.statusBreakdown.map((row) => [
      row.label,
      row.website,
      row.tripInquiries,
      row.internshipInquiries,
      row.total,
    ]),
    [],
  ];

  for (const [key, values] of Object.entries(payload.facets)) {
    rows.push([key.toUpperCase()], ["Value", "Leads"], ...values.map((facet) => [facet.label, facet.count]), []);
  }

  rows.push(
    ["SUMMARY"],
    ["Metric", "Value"],
    ["Leads in window", payload.summary.leads.total],
    ["Previous period", payload.summary.leads.previous],
    ["Change %", payload.summary.leads.deltaPct ?? "n/a"],
    ["Open pipeline", payload.summary.pipeline.open],
    ["Unassigned", payload.summary.pipeline.unassigned],
    ["Converted", payload.summary.pipeline.converted],
    ["Conversion %", payload.summary.pipeline.conversionRatePct],
    ["Read rate %", payload.summary.pipeline.readRatePct],
    ["Unread backlog", payload.summary.workload.unread],
    ["Oldest unread (hours)", payload.summary.workload.oldestUnreadHours],
    ["Median first touch (hours)", payload.summary.workload.medianFirstTouchHours],
    ["Newsletter sign-ups", payload.summary.subscribers.newInRange],
    ["Active subscribers", payload.summary.subscribers.activeTotal]
  );

  return toCsv(rows);
}

/** Triggers a client-side download; no server round-trip and no inline styles. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
