import Link from "next/link";
import { DestinationCard } from "@/components/shared/DestinationCard";
import { buildCountryOptions } from "@/lib/country";
import { PackageCard } from "@/domains/packages/components/PackageCard";
import { DiscoveryToolbar } from "@/components/shared/DiscoveryToolbar";
import { Pagination } from "@/components/shared/Pagination";
import type { Destination, TourPackage } from "@/lib/content/types";
import { buildQueryString, clampPage, paginate } from "@/lib/utils";

const PAGE_SIZE = 9;

type Props =
  | { destinations: Destination[]; packages?: never; params: { page?: string; q?: string; category?: string; duration?: string } }
  | { packages: TourPackage[]; destinations?: never; params: { page?: string; q?: string; category?: string; duration?: string } };

export function DiscoveryGrid(props: Props) {
  const params = props.params ?? {};
  const isDestinations = !!props.destinations;
  const records = props.destinations || props.packages || [];

  const categoryOptions = [
    ...new Set(
      records
        .map((r) => ("category" in r ? r.category : undefined))
        .filter((v): v is string => !!v),
    ),
  ].sort();
  const countryOptions = !isDestinations ? buildCountryOptions(records as TourPackage[]) : [];
  const durationOptions = !isDestinations
    ? [...new Set(records.map((r) => (r as TourPackage).duration).filter((v): v is string => !!v))].sort()
    : [];

  const category = categoryOptions.includes(params.category ?? "") ? (params.category as string) : "";
  const duration = durationOptions.includes(params.duration ?? "") ? (params.duration as string) : "";
  const query = (params.q ?? "").trim().toLowerCase();

  const filtered = records.filter((r) => {
    const title = "name" in r ? r.name : r.title;
    const description = "description" in r ? r.description : r.overview;
    const matchesCategory = !category || ("category" in r && (r.category || "") === category);
    const matchesDuration = !duration || ("duration" in r && (r.duration || "") === duration);
    const matchesQuery =
      !query ||
      `${title} ${description} ${r.location || ""}`.toLowerCase().includes(query);
    return matchesCategory && matchesDuration && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = clampPage(params.page, totalPages);
  const { items } = paginate(filtered, page, PAGE_SIZE);

  const hrefWith = (overrides: Record<string, string | undefined>) => {
    const values: Record<string, string | undefined> = {
      category: category || undefined,
      duration: duration || undefined,
      q: (params.q ?? "").trim() || undefined,
      ...overrides,
    };
    if (values.q === undefined) delete values.q;
    return buildQueryString(values);
  };

  const hasActiveFilter = Boolean(category || duration || query);

  return (
    <div>
      <DiscoveryToolbar
        isDestinations={isDestinations}
        countryOptions={countryOptions}
        categoryOptions={categoryOptions}
        durationOptions={durationOptions}
      />

      <div className="discovery-results mb-8" aria-live="polite">
        {filtered.length} {isDestinations ? "destinations" : "journeys"} to explore
      </div>

      {items.length ? (
        <>
          <div className="discovery-grid">
            {items.map((r) =>
              "name" in r ? (
                <DestinationCard key={r.slug} destination={r} />
              ) : (
                <PackageCard key={r.slug} pkg={r} />
              )
            )}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            makeHref={(p) => hrefWith({ page: p > 1 ? String(p) : undefined })}
            pageLabel={`${isDestinations ? "Destinations" : "Tour packages"} pages`}
          />
        </>
      ) : (
        <div className="discovery-empty">
          <h2>{records.length ? "A different path awaits." : "Let's create a journey for you."}</h2>
          <p className="mt-4">
            {records.length
              ? "Try another search or explore the full collection."
              : "Tell us your interests and we'll help you plan your trip."}
          </p>
          {records.length ? (
            hasActiveFilter ? (
              <Link className="safari-button mt-6" href={hrefWith({})}>
                Clear filters
              </Link>
            ) : null
          ) : (
            <Link className="safari-button mt-6" href="/plan-your-trip">
              Plan Your Trip
            </Link>
          )}
        </div>
      )}
    </div>
  );
}