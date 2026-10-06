"use client";

import type { ReactNode } from "react";
import { Check, Globe, X } from "lucide-react";
import { CountryFlag } from "@/components/shared/CountryFlag";
import {
  buildCountryOptions,
  countryDemonym,
  type CountryOption,
} from "@/lib/country";
import { cn } from "@/lib/utils";

export { buildCountryOptions, countryDemonym };
export type { CountryOption };

interface CountryFlagCardsProps {
  options: CountryOption[];
  selected: string;
  onSelect: (country: string) => void;
}

/**
 * Country shortcut cards that scope the "Preferred Tour Package" list.
 * Picking a flag narrows the package dropdown to that country only; picking the
 * same card again (or "All destinations") restores the full list.
 */
export function CountryFlagCards({ options, selected, onSelect }: CountryFlagCardsProps) {
  if (options.length === 0) return null;

  const total = options.reduce((sum, o) => sum + o.count, 0);
  const active = options.find((o) => o.country === selected);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Where would you like to go?
        </span>
        {active ? (
          <button
            type="button"
            onClick={() => onSelect("")}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:text-brand-strong dark:text-accent dark:hover:text-accent/80"
          >
            <X className="size-3.5" />
            Clear — show all {total}
          </button>
        ) : (
          <span className="text-xs text-slate-400">Optional — helps us quote faster</span>
        )}
      </div>

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        role="group"
        aria-label="Filter packages by country"
      >
        <DestinationCard
          active={selected === ""}
          onClick={() => onSelect("")}
          label="All destinations"
          sublabel={`${total} tours`}
          visual={
            <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/12 to-accent/12">
              <Globe className="size-7 text-brand dark:text-accent" strokeWidth={1.5} />
            </span>
          }
        />

        {options.map((option) => (
          <DestinationCard
            key={option.country}
            active={selected === option.country}
            onClick={() => onSelect(selected === option.country ? "" : option.country)}
            label={option.country}
            sublabel={`${option.count} ${option.count === 1 ? "tour" : "tours"}`}
            visual={<CountryFlag country={option.country} alt="" className="h-full w-full" />}
          />
        ))}
      </div>
    </div>
  );
}

function DestinationCard({
  active,
  onClick,
  label,
  sublabel,
  visual,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sublabel: string;
  visual: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-white text-left transition-all duration-200",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/25",
        "dark:bg-slate-800",
        active
          ? "border-brand shadow-md ring-2 ring-brand/30 dark:border-accent dark:ring-accent/30"
          : "border-slate-200 hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md dark:border-slate-700 dark:hover:border-accent/50"
      )}
    >
      <span className="relative block aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-700/60">
        {visual}
        {active && (
          <span
            aria-hidden
            className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-brand text-white shadow-sm dark:bg-accent dark:text-brand-strong"
          >
            <Check className="size-3" strokeWidth={3} />
          </span>
        )}
      </span>

      <span className="flex items-baseline justify-between gap-1 px-2.5 py-2">
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
            {label}
          </span>
          <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">{sublabel}</span>
        </span>
      </span>
    </button>
  );
}
