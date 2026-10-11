"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Compass,
  Mountain,
  Landmark,
  GraduationCap,
  Building2,
  Globe,
  Map,
  Users,
  Car,
  BedDouble,
  LucideIcon,
} from "lucide-react";
import type { ServiceCategory } from "@/lib/content/types";
import { siteImages } from "@/lib/siteImages";

const iconMap: Record<string, LucideIcon> = {
  Compass,
  Mountain,
  Landmark,
  GraduationCap,
  Building2,
  Globe,
  Map,
  Users,
  Car,
  BedDouble,
};

export function ServiceCard({ category }: { category: ServiceCategory }) {
  const [expanded, setExpanded] = useState(false);
  const image =
    category.image ||
    category.services.find((service) => service.image)?.image ||
    (category.slug === "training-attachments"
      ? siteImages.trainingHero.src
      : siteImages.servicesHero.src);

  const visibleServices = expanded
    ? category.services
    : category.services.slice(0, 3);

  const hasMore = category.services.length > 3;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white transition-all duration-300 hover:border-brand/20 hover:shadow-xl dark:border-slate-800/50 dark:bg-slate-900">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={image}
          alt={category.title}
          fill
          sizes="(max-width: 800px) 100vw, (max-width: 1100px) 50vw, 33vw"
          loading="lazy"
          decoding="async"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-serif text-xl font-bold text-white drop-shadow-md sm:text-2xl">
            {category.title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {category.description}
        </p>

        {/* Sub-services list */}
        <div className="mt-5 space-y-2.5">
          {visibleServices.map((service) => {
            const Icon = iconMap[service.icon] || Compass;
            return (
              <div
                key={service.name}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:border-brand/10 hover:bg-brand/[0.03] dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-brand/20 dark:hover:bg-brand/10"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand dark:bg-brand/20 dark:text-accent">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {service.name}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expand/collapse toggle */}
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand/80 dark:text-accent dark:hover:text-accent/80"
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="size-4" />
              </>
            ) : (
              <>
                Show all {category.services.length} services{" "}
                <ChevronDown className="size-4" />
              </>
            )}
          </button>
        )}

        {/* CTA button */}
        <div className="mt-auto pt-5">
          <Link
            href={`/services/${category.slug}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-brand/90 hover:shadow-lg dark:bg-accent dark:text-brand dark:hover:bg-accent/90"
          >
            View Details
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
