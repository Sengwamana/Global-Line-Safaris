"use client";

import { Compass, MapPin, Package, School, Sparkles, Wallet } from "lucide-react";
import { Meter, SectionCard } from "./primitives";
import type { Facet } from "./types";

interface FacetDefinition {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  empty: string;
}

/**
 * What guests asked for, ranked. These drive merchandising decisions — which
 * destination to push, which package to feature, where to spend on content.
 */
const FACET_DEFINITIONS: FacetDefinition[] = [
  {
    key: "destinations",
    title: "Top destinations",
    description: "Where travellers want to go.",
    icon: <MapPin className="size-4" aria-hidden="true" />,
    empty: "No trip destinations recorded yet.",
  },
  {
    key: "packages",
    title: "Popular tour packages",
    description: "Packages named on trip requests.",
    icon: <Package className="size-4" aria-hidden="true" />,
    empty: "No package preferences recorded yet.",
  },
  {
    key: "services",
    title: "Services in demand",
    description: "Services named on website inquiries.",
    icon: <Compass className="size-4" aria-hidden="true" />,
    empty: "No service selections recorded yet.",
  },
  {
    key: "budgets",
    title: "Budget bands",
    description: "Self-reported trip budgets.",
    icon: <Wallet className="size-4" aria-hidden="true" />,
    empty: "No budgets recorded yet.",
  },
  {
    key: "universities",
    title: "Internship sources",
    description: "Universities students are applying from.",
    icon: <School className="size-4" aria-hidden="true" />,
    empty: "No internship applications in range.",
  },
  {
    key: "sources",
    title: "Lead sources",
    description: "Where website inquiries originate.",
    icon: <Sparkles className="size-4" aria-hidden="true" />,
    empty: "No website inquiries in range.",
  },
];

export function FacetGrid({
  facets,
  rangeDays,
}: {
  facets: Record<string, Facet[]>;
  rangeDays: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 min-w-0 sm:grid-cols-2 xl:grid-cols-3">
      {FACET_DEFINITIONS.map((definition) => {
        const rows = facets[definition.key] ?? [];
        const max = rows.reduce((acc, facet) => Math.max(acc, facet.count), 0);

        return (
          <SectionCard
            key={definition.key}
            title={definition.title}
            description={definition.description}
            icon={definition.icon}
          >
            {rows.length === 0 ? (
              <p className="px-5 py-8 text-center text-xs text-slate-400">{definition.empty}</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((facet) => (
                  <li key={facet.label} className="min-w-0 px-5 py-2.5">
                    <div className="mb-1.5 flex min-w-0 items-center justify-between gap-3">
                      <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {facet.label}
                      </span>
                      <span className="shrink-0 text-xs font-black text-slate-900 dark:text-white">
                        {facet.count}
                      </span>
                    </div>
                    <Meter
                      percent={max > 0 ? (facet.count / max) * 100 : 0}
                      ariaLabel={`${facet.label}: ${facet.count} leads`}
                    />
                  </li>
                ))}
              </ul>
            )}
            {rangeDays <= 31 && rows.length > 0 ? (
              <p className="border-t border-slate-100 px-5 py-2 text-[10px] text-slate-400 dark:border-slate-800">
                Ranked across {rangeDays} days.
              </p>
            ) : null}
          </SectionCard>
        );
      })}
    </div>
  );
}
