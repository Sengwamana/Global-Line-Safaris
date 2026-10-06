"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CountryFlagCards, type CountryOption } from "@/components/shared/CountryFlagCards";
import { buildQueryString } from "@/lib/utils";

interface DiscoveryToolbarProps {
  isDestinations: boolean;
  countryOptions: CountryOption[];
  categoryOptions: string[];
  durationOptions: string[];
}

export function DiscoveryToolbar({
  isDestinations,
  countryOptions,
  categoryOptions,
  durationOptions,
}: DiscoveryToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const duration = searchParams.get("duration") ?? "";
  const existingQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(existingQ);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function navigate(next: Record<string, string | undefined>) {
    const nextCategory = next.category !== undefined ? next.category : category;
    const nextDuration = next.duration !== undefined ? next.duration : duration;
    const q = next.q !== undefined ? next.q : (query || undefined);
    const params: Record<string, string | undefined> = {
      category: nextCategory || undefined,
      duration: nextDuration || undefined,
      q,
      page: undefined,
    };
    router.replace(`${pathname}${buildQueryString(params)}`, { scroll: false });
  }

  function commitSearch(value: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => navigate({ q: value || undefined }),
      350,
    );
  }

  // Keep the input in sync when the URL changes outside this component
  // (e.g. browser back/forward). Adjusted during render to avoid effect cascades.
  const [lastUrlQ, setLastUrlQ] = useState(existingQ);
  if (lastUrlQ !== existingQ) {
    setLastUrlQ(existingQ);
    setQuery(existingQ);
  }

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <div>
      {countryOptions.length > 0 && (
        <div className="mb-8">
          <CountryFlagCards
            options={countryOptions}
            selected={category}
            onSelect={(c) => navigate({ category: c || undefined })}
          />
        </div>
      )}

      <div className="discovery-toolbar">
        <label htmlFor="discovery-search">
          Find your {isDestinations ? "destination" : "journey"}
          <input
            id="discovery-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              commitSearch(e.target.value);
            }}
            placeholder={isDestinations ? "Search destinations…" : "Search tours, places, experiences…"}
          />
        </label>
        {categoryOptions.length > 1 && isDestinations && (
          <label htmlFor="discovery-category">
            Explore by category
            <select
              id="discovery-category"
              value={category}
              onChange={(e) => navigate({ category: e.target.value || undefined })}
            >
              <option value="">{isDestinations ? "All destinations" : "All countries"}</option>
              {categoryOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        )}
        {durationOptions.length > 1 && (
          <label htmlFor="discovery-duration">
            Filter by duration
            <select
              id="discovery-duration"
              value={duration}
              onChange={(e) => navigate({ duration: e.target.value || undefined })}
            >
              <option value="">All journeys</option>
              {durationOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}