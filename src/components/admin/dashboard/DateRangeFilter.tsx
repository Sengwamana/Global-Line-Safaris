"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toDateInputValue } from "@/lib/admin/stats";
import type { RangePreset, RangeSelection } from "./types";

const PRESETS: { value: RangePreset; label: string; days: number }[] = [
  { value: "7d", label: "7 days", days: 7 },
  { value: "30d", label: "30 days", days: 30 },
  { value: "90d", label: "90 days", days: 90 },
  { value: "365d", label: "12 months", days: 365 },
];

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - (days - 1));
  return toDateInputValue(date);
}

/** Default window for a preset, also used to seed the custom date inputs. */
export function defaultWindowFor(preset: RangePreset): { from: string; to: string } {
  if (preset === "custom") return { from: isoDaysAgo(30), to: toDateInputValue(new Date()) };
  const days = PRESETS.find((presetOption) => presetOption.value === preset)?.days ?? 30;
  return { from: isoDaysAgo(days), to: toDateInputValue(new Date()) };
}

interface DateRangeFilterProps {
  selection: RangeSelection;
  onChange: (selection: RangeSelection) => void;
  disabled?: boolean;
}

/**
 * Custom window inputs. They are remounted (via `key`) whenever the committed
 * selection changes, so the drafts reset from props without an effect.
 */
function CustomRangeForm({
  from,
  to,
  onApply,
}: {
  from: string;
  to: string;
  onApply: (from: string, to: string) => void;
}) {
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);

  const today = toDateInputValue(new Date());
  const invalid = !draftFrom || !draftTo || draftFrom > draftTo || draftTo > today;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!invalid) onApply(draftFrom, draftTo);
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
        From
        <input
          type="date"
          value={draftFrom}
          max={draftTo}
          onChange={(event) => setDraftFrom(event.target.value)}
          className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        />
      </label>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
        To
        <input
          type="date"
          value={draftTo}
          max={today}
          onChange={(event) => setDraftTo(event.target.value)}
          className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        />
      </label>
      <Button type="submit" size="xs" variant="brand" disabled={invalid} className="rounded-lg">
        Apply
      </Button>
      {invalid ? (
        <span className="text-[11px] font-semibold text-rose-600">
          Pick a valid window of 366 days or less.
        </span>
      ) : null}
    </form>
  );
}

/**
 * Preset chips plus a custom window. Custom dates are only committed when the
 * form is valid, so a half-typed date never triggers a request.
 */
export function DateRangeFilter({ selection, onChange, disabled }: DateRangeFilterProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {PRESETS.map((preset) => {
          const active = selection.preset === preset.value;
          return (
            <button
              key={preset.value}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onChange({ preset: preset.value, ...defaultWindowFor(preset.value) })}
              className={cn(
                "h-7 rounded-lg px-2.5 text-[11px] font-bold transition-colors disabled:opacity-50",
                active
                  ? "bg-brand text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              )}
            >
              {preset.label}
            </button>
          );
        })}
        <button
          type="button"
          disabled={disabled}
          aria-pressed={selection.preset === "custom"}
          onClick={() => onChange({ preset: "custom", from: selection.from, to: selection.to })}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-bold transition-colors disabled:opacity-50",
            selection.preset === "custom"
              ? "bg-brand text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          )}
        >
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Custom
        </button>
      </div>

      {selection.preset === "custom" ? (
        <CustomRangeForm
          key={`${selection.from}|${selection.to}`}
          from={selection.from}
          to={selection.to}
          onApply={(from, to) => onChange({ preset: "custom", from, to })}
        />
      ) : null}
    </div>
  );
}
