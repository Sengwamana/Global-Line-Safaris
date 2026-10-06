"use client";

import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionCard } from "./primitives";
import { CHANNELS, NEWSLETTER_SWATCH, SERIES_SWATCH, type SeriesPoint } from "./types";

interface LeadsChartProps {
  series: SeriesPoint[];
  granularity: "day" | "week" | "month";
  loading: boolean;
  failed: boolean;
}

const SERIES_LABELS: Record<string, string> = {
  inquiries: "Website",
  tripInquiries: "Trip",
  internshipInquiries: "Internship",
  subscribers: "Newsletter",
};

/**
 * Lead volume over time. Channels stack as areas (left axis) while newsletter
 * sign-ups render as bars on the right axis, so growth in the two systems can be
 * compared without either axis flattening the other.
 *
 * There is deliberately no Recharts `<Tooltip>` here. The production
 * Content-Security-Policy is `style-src 'self' 'nonce-…'` with no
 * `unsafe-inline`, and Recharts' tooltip wrapper is positioned by writing
 * `style="left: …; top: …"` at hover time — writes the CSP blocks, leaving the
 * tooltip hidden at 0,0. Instead the hover state is lifted into React (via
 * `onMouseMove`) and rendered as a static "inspector" strip, which is CSP-clean
 * and also works on touch screens where there is no cursor.
 */
export function LeadsChart({ series, granularity, loading, failed }: LeadsChartProps) {
  const [hidden, setHidden] = useState<string[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const hasData = useMemo(() => series.some((point) => point.totalLeads > 0 || point.subscribers > 0), [series]);
  const maxLeads = useMemo(
    () => series.reduce((max, point) => Math.max(max, point.totalLeads), 0),
    [series]
  );
  const totals = useMemo(
    () =>
      CHANNELS.reduce(
        (acc, channel) => {
          acc[channel.seriesKey] = series.reduce((sum, point) => sum + point[channel.seriesKey], 0);
          return acc;
        },
        {} as Record<string, number>
      ),
    [series]
  );
  const subscriberTotal = useMemo(
    () => series.reduce((sum, point) => sum + point.subscribers, 0),
    [series]
  );

  const toggle = (key: string) =>
    setHidden((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );

  const granularityNote = granularity === "day" ? "Daily" : granularity === "week" ? "Weekly" : "Monthly";
  const hovered = hoveredIndex !== null ? series[hoveredIndex] : null;

  return (
    <SectionCard
      title="Lead volume over time"
      description={`${granularityNote} totals for the selected window. Toggle a series to focus.`}
      icon={<TrendingUp className="size-4" aria-hidden="true" />}
      action={
        <div className="flex flex-wrap items-center gap-1.5">
          {CHANNELS.map((channel) => {
            const off = hidden.includes(channel.seriesKey);
            return (
              <button
                key={channel.seriesKey}
                type="button"
                aria-pressed={!off}
                onClick={() => toggle(channel.seriesKey)}
                className={`inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-bold transition-colors ${
                  off
                    ? "bg-slate-100 text-slate-400 line-through dark:bg-slate-800"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <span
                  className={cn("size-2 rounded-full", channel.swatch)}
                  aria-hidden="true"
                />
                {channel.label}
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={!hidden.includes("subscribers")}
            onClick={() => toggle("subscribers")}
            className={`inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-bold transition-colors ${
              hidden.includes("subscribers")
                ? "bg-slate-100 text-slate-400 line-through dark:bg-slate-800"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <span className={cn("size-2 rounded-full", NEWSLETTER_SWATCH)} aria-hidden="true" />
            Newsletter
          </button>
        </div>
      }
    >
      {loading ? (
        <p className="px-5 py-16 text-center text-sm text-slate-400" role="status">
          Loading journey insights…
        </p>
      ) : failed ? (
        <p className="px-5 py-16 text-center text-sm text-slate-400">
          Insights are unavailable. Refresh to try again.
        </p>
      ) : !hasData ? (
        <p className="px-5 py-16 text-center text-sm text-slate-400">
          No lead activity in this window yet. Widen the range to see history.
        </p>
      ) : (
        <div className="p-5">
          {/* Hover inspector — static strip replacing the CSP-blocked floating tooltip. */}
          <div
            className="mb-3 flex min-h-10 flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/40"
            role="status"
            aria-live="polite"
          >
            {hovered ? (
              <>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {hovered.labelLong}
                </span>
                {(Object.keys(SERIES_LABELS) as (keyof typeof SERIES_LABELS)[])
                  .filter((key) => !hidden.includes(key) && hovered[key as keyof SeriesPoint] !== undefined)
                  .map((key) => (
                    <span key={key} className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className={cn("size-2 rounded-full", SERIES_SWATCH[key])} aria-hidden="true" />
                      {SERIES_LABELS[key]}
                      <span className="font-black text-slate-900 dark:text-white">
                        {Number(hovered[key as keyof SeriesPoint]).toLocaleString()}
                      </span>
                    </span>
                  ))}
                <span className="ml-auto text-[11px] font-semibold text-slate-400">
                  Total leads: {hovered.totalLeads.toLocaleString()}
                </span>
              </>
            ) : (
              <>
                <span className="text-xs text-slate-400">Hover the chart to inspect a point.</span>
                <span className="ml-auto text-xs text-slate-400">
                  Peak: <span className="font-bold text-slate-700 dark:text-slate-200">{maxLeads} leads</span>
                </span>
              </>
            )}
          </div>

          <div className="h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={series}
                margin={{ top: 5, right: 4, left: -18, bottom: 0 }}
                onMouseMove={(state: { activeTooltipIndex?: number }) => {
                  if (typeof state?.activeTooltipIndex === "number") {
                    setHoveredIndex(state.activeTooltipIndex);
                  }
                }}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <defs>
                  {CHANNELS.map((channel) => (
                    <linearGradient key={channel.seriesKey} id={`dash-${channel.seriesKey}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={channel.hex} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={channel.hex} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  minTickGap={24}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  yAxisId="leads"
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  yAxisId="subs"
                  orientation="right"
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  width={34}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Legend
                  verticalAlign="top"
                  height={28}
                  iconType="circle"
                  iconSize={7}
                  formatter={(value: string) => <span className="text-[11px] text-slate-500">{value}</span>}
                />
                {CHANNELS.map((channel) =>
                  hidden.includes(channel.seriesKey) ? null : (
                    <Area
                      key={channel.seriesKey}
                      yAxisId="leads"
                      type="monotone"
                      dataKey={channel.seriesKey}
                      name={channel.label}
                      stackId="leads"
                      stroke={channel.hex}
                      strokeWidth={2}
                      fill={`url(#dash-${channel.seriesKey})`}
                      activeDot={{ r: 3 }}
                    />
                  )
                )}
                {hidden.includes("subscribers") ? null : (
                  <Bar
                    yAxisId="subs"
                    dataKey="subscribers"
                    name="Newsletter"
                    fill="#94a3b8"
                    fillOpacity={0.45}
                    barSize={6}
                    radius={[2, 2, 0, 0]}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Totals for the window — the numbers a glance at the chart should answer. */}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-slate-100 pt-3 dark:border-slate-800">
            {(Object.keys(totals) as (keyof typeof totals)[])
              .filter((key) => !hidden.includes(key as string))
              .map((key) => (
                <span key={key} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className={cn("size-2 rounded-full", SERIES_SWATCH[key])} aria-hidden="true" />
                  {SERIES_LABELS[key]}
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {totals[key].toLocaleString()}
                  </span>
                </span>
              ))}
            {!hidden.includes("subscribers") ? (
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className={cn("size-2 rounded-full", NEWSLETTER_SWATCH)} aria-hidden="true" />
                Newsletter
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {subscriberTotal.toLocaleString()}
                </span>
              </span>
            ) : null}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
