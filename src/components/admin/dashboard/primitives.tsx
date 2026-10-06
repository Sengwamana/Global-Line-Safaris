"use client";

/**
 * Presentational primitives for the dashboard.
 *
 * Every bar, sparkline and funnel is drawn as SVG with presentation
 * attributes rather than a `style` prop: the production CSP is
 * `style-src 'self' 'nonce-…'` with no `unsafe-inline`, so inline style
 * attributes are blocked and dynamic widths must come from geometry instead.
 */
import type { ReactNode } from "react";
import { ArrowUpRight, Minus, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatHours } from "./types";

export function SectionCard({
  title,
  description,
  icon,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-700/50",
        className
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="flex items-start gap-2.5">
          {icon ? <span className="mt-0.5 text-brand">{icon}</span> : null}
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
            {description ? <p className="text-xs text-slate-400">{description}</p> : null}
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

/**
 * Horizontal meter drawn in SVG. `percent` is clamped to 0–100 and maps to the
 * rect width, which keeps it working under a strict style-src CSP.
 */
export function Meter({
  percent,
  className,
  trackClassName,
  ariaLabel,
}: {
  percent: number;
  className?: string;
  trackClassName?: string;
  ariaLabel?: string;
}) {
  const width = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));
  return (
    <svg
      viewBox="0 0 100 6"
      preserveAspectRatio="none"
      className={cn("h-1.5 w-full", className)}
      role="img"
      aria-label={ariaLabel ?? `${Math.round(width)}%`}
    >
      <rect width="100" height="6" className={cn("fill-slate-100 dark:fill-slate-800", trackClassName)} />
      {width > 0 ? <rect width={width} height="6" className="fill-brand" /> : null}
    </svg>
  );
}

/** Stacked meter for a status row: one segment per lead channel. */
export function StackedMeter({
  segments,
  ariaLabel,
}: {
  segments: { value: number; fillClass: string; title: string }[];
  ariaLabel: string;
}) {
  const total = segments.reduce((acc, segment) => acc + segment.value, 0);
  let offset = 0;
  return (
    <svg
      viewBox="0 0 100 6"
      preserveAspectRatio="none"
      className="h-1.5 w-full"
      role="img"
      aria-label={ariaLabel}
    >
      <rect width="100" height="6" className="fill-slate-100 dark:fill-slate-800" />
      {total > 0
        ? segments
            .filter((segment) => segment.value > 0)
            .map((segment) => {
              const width = (segment.value / total) * 100;
              const rect = (
                <rect
                  key={segment.title}
                  x={offset}
                  width={width}
                  height="6"
                  className={segment.fillClass}
                >
                  <title>{`${segment.title}: ${segment.value}`}</title>
                </rect>
              );
              offset += width;
              return rect;
            })
        : null}
    </svg>
  );
}

/** Compact trend line for the KPI cards. */
export function Sparkline({
  values,
  className,
  label,
}: {
  values: number[];
  className?: string;
  label?: string;
}) {
  const points = values.length > 0 ? values : [0];
  const max = Math.max(...points, 1);
  const step = points.length > 1 ? 100 / (points.length - 1) : 100;
  const coords = points.map((value, index) => {
    const x = points.length > 1 ? index * step : 100;
    const y = 24 - (value / max) * 22 - 1;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const line = coords.join(" ");
  const area = `0,24 ${line} 100,24`;

  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" className={cn("h-8 w-full", className)} aria-hidden="true">
      <polygon points={area} className="fill-brand/10" />
      <polyline
        points={line}
        fill="none"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        className="stroke-brand"
      >
        {label ? <title>{label}</title> : null}
      </polyline>
    </svg>
  );
}

/** Period-over-period trend badge. Renders an em dash when there is no baseline. */
export function DeltaBadge({
  deltaPct,
  suffix = "vs previous period",
}: {
  deltaPct: number | null;
  suffix?: string;
}) {
  if (deltaPct === null || deltaPct === undefined) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
        <Minus className="size-3" aria-hidden="true" />
        No prior data
      </span>
    );
  }

  const flat = deltaPct === 0;
  const up = deltaPct > 0;
  const Icon = flat ? Minus : up ? ArrowUpRight : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-bold",
        flat ? "text-slate-400" : up ? "text-emerald-600" : "text-rose-600"
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      <span>
        {flat ? "No change" : `${up ? "+" : ""}${deltaPct}%`}
      </span>
      <span className="font-medium text-slate-400">{suffix}</span>
    </span>
  );
}

/** Labelled figure used across the workload and pipeline panels. */
export function Metric({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "warning" | "positive";
}) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-black",
          tone === "warning" ? "text-amber-600" : tone === "positive" ? "text-emerald-600" : "text-slate-900 dark:text-white"
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{hint}</p> : null}
    </div>
  );
}

export { formatHours };
