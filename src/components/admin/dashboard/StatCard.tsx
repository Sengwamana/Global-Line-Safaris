"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeltaBadge, Sparkline } from "./primitives";

interface StatCardProps {
  label: string;
  value: number;
  /**
   * Period-over-period change. `null` renders "No prior data" for metrics that
   * do trend; omit it entirely for point-in-time counts such as a backlog.
   */
  deltaPct?: number | null;
  series?: number[];
  icon: React.ReactNode;
  href: string;
  /** Sub-label replacing the trend caption (e.g. "Open: 12"). */
  footnote?: string;
  badge?: { label: string; tone: "rose" | "amber" | "slate" } | null;
}

const BADGE_TONES = {
  rose: "bg-rose-500 text-white",
  amber: "bg-amber-500 text-white",
  slate: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

export function StatCard({
  label,
  value,
  deltaPct,
  series,
  icon,
  href,
  footnote,
  badge,
}: StatCardProps) {
  const hasTrend = series !== undefined && series.length > 1;
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 transition-all hover:border-brand/30 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">{icon}</span>
        <div className="flex items-center gap-1.5">
          {badge ? (
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", BADGE_TONES[badge.tone])}>
              {badge.label}
            </span>
          ) : null}
          <ArrowUpRight className="size-4 text-slate-300 transition-colors group-hover:text-brand" aria-hidden="true" />
        </div>
      </div>

      <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{value.toLocaleString()}</p>
      <p className="text-xs font-medium text-slate-500">{label}</p>

      <div className="mt-2 min-h-4">
        {deltaPct !== undefined ? <DeltaBadge deltaPct={deltaPct} /> : null}
      </div>

      {hasTrend ? (
        <div className="mt-3 border-t border-slate-100 pt-2 dark:border-slate-800">
          <Sparkline values={series} label={`${label} trend`} />
        </div>
      ) : null}

      {footnote ? <p className="mt-2 text-[11px] text-slate-400">{footnote}</p> : null}
    </Link>
  );
}
