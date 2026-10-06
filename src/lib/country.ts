export interface CountryOption {
  country: string;
  count: number;
}

const COUNTRY_DEMONYM: Record<string, string> = {
  Rwanda: "Rwandan",
  Tanzania: "Tanzanian",
  Kenya: "Kenyan",
  Uganda: "Ugandan",
};

const COUNTRY_ORDER: Record<string, number> = {
  Rwanda: 0,
  Tanzania: 1,
  Kenya: 2,
  Uganda: 3,
};

export function countryDemonym(country: string): string {
  return COUNTRY_DEMONYM[country] ?? country;
}

/** Builds "All destinations" + per-country counts from records, Rwanda first. */
export function buildCountryOptions(
  records: Array<{ category?: string | null }>,
): CountryOption[] {
  const counts = new Map<string, number>();
  for (const r of records) {
    if (!r.category) continue;
    counts.set(r.category, (counts.get(r.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => {
      const oa = COUNTRY_ORDER[a.country] ?? 99;
      const ob = COUNTRY_ORDER[b.country] ?? 99;
      return oa === ob ? a.country.localeCompare(b.country) : oa - ob;
    });
}