import { describe, it, expect } from "vitest";
import {
  buildBuckets,
  countBy,
  findBucketIndex,
  formatDuration,
  FUNNEL_STAGES,
  granularityFor,
  percentChange,
  resolveRange,
  sharePct,
  summarize,
  toDateInputValue,
  topFacets,
  type Bucket,
} from "@/lib/admin/stats";

const NOW = new Date(2026, 0, 15, 11, 30, 0);

describe("resolveRange", () => {
  it("defaults to a 30-day window ending today", () => {
    const range = resolveRange({ now: NOW });
    expect(range).not.toBeNull();
    expect(range!.preset).toBe("30d");
    expect(range!.days).toBe(30);
    expect(range!.granularity).toBe("day");
    expect(range!.to.getDate()).toBe(15);
    // 30 days back from Jan 15 inclusive, so the window opens on Dec 17.
    expect(range!.from.getMonth()).toBe(11);
    expect(range!.from.getDate()).toBe(17);
    expect(range!.compareFrom.getTime()).toBeLessThan(range!.from.getTime());
  });

  it("counts both endpoints so a single day window is one day", () => {
    const range = resolveRange({ range: "1d", now: NOW });
    expect(range!.days).toBe(1);
    expect(range!.compareFrom.getTime()).toBe(range!.from.getTime() - 24 * 60 * 60 * 1000);
  });

  it("builds a comparison window of identical length immediately before", () => {
    const range = resolveRange({ range: "7d", now: NOW });
    const span = range!.to.getTime() - range!.from.getTime();
    const compareSpan = range!.compareTo.getTime() - range!.compareFrom.getTime();
    expect(Math.round(compareSpan / (24 * 60 * 60 * 1000))).toBe(Math.round(span / (24 * 60 * 60 * 1000)));
    expect(range!.compareTo.getTime()).toBeLessThan(range!.from.getTime());
  });

  it("accepts an explicit custom window", () => {
    const range = resolveRange({ range: "custom", from: "2026-01-01", to: "2026-01-10", now: NOW });
    expect(range!.preset).toBe("custom");
    expect(range!.days).toBe(10);
    expect(toDateInputValue(range!.from)).toBe("2026-01-01");
    expect(toDateInputValue(range!.to)).toBe("2026-01-10");
  });

  it("rejects unparseable and inverted windows", () => {
    expect(resolveRange({ range: "banana", now: NOW })).toBeNull();
    expect(resolveRange({ range: "custom", from: "2026-02-31", to: "2026-03-05", now: NOW })).toBeNull();
    expect(resolveRange({ range: "custom", from: "2026-03-05", to: "2026-01-01", now: NOW })).toBeNull();
    expect(resolveRange({ range: "custom", from: "2026-01-01", now: NOW })).toBeNull();
    expect(resolveRange({ range: "0d", now: NOW })).toBeNull();
    expect(resolveRange({ range: "400d", now: NOW })).toBeNull();
  });

  it("rejects custom windows longer than a year", () => {
    expect(resolveRange({ range: "custom", from: "2020-01-01", to: "2026-01-01", now: NOW })).toBeNull();
    expect(resolveRange({ range: "custom", from: "2025-01-02", to: "2026-01-01", now: NOW })!.days).toBe(365);
  });
});

describe("granularity", () => {
  it("scales buckets with the window length", () => {
    expect(granularityFor(7)).toBe("day");
    expect(granularityFor(31)).toBe("day");
    expect(granularityFor(32)).toBe("week");
    expect(granularityFor(120)).toBe("week");
    expect(granularityFor(121)).toBe("month");
    expect(granularityFor(365)).toBe("month");
  });
});

describe("buildBuckets", () => {
  it("produces one bucket per day with contiguous coverage", () => {
    const range = resolveRange({ range: "7d", now: NOW })!;
    const buckets = buildBuckets(range);
    expect(buckets).toHaveLength(7);
    expect(buckets[0].key).toBe("2026-01-09");
    expect(buckets[6].end).toBe(range.to.getTime());
    for (let i = 1; i < buckets.length; i += 1) {
      expect(buckets[i].start).toBe(buckets[i - 1].end + 1);
    }
  });

  it("chunks long windows into weeks and years into months", () => {
    const weekly = buildBuckets(resolveRange({ range: "90d", now: NOW })!);
    expect(weekly.length).toBe(13);

    const monthly = buildBuckets(resolveRange({ range: "365d", now: NOW })!);
    expect(monthly.length).toBe(13);
    expect(monthly[0].label).toMatch(/'/);
    expect(monthly[0].labelLong).toBe("January 2025");
    expect(monthly[12].labelLong).toBe("January 2026");
  });

  it("locates timestamps and reports misses", () => {
    const buckets: Bucket[] = buildBuckets(resolveRange({ range: "7d", now: NOW })!);
    expect(findBucketIndex(buckets, buckets[2].start)).toBe(2);
    expect(findBucketIndex(buckets, buckets[2].end)).toBe(2);
    expect(findBucketIndex(buckets, buckets[0].start - 1)).toBe(-1);
    expect(findBucketIndex(buckets, buckets[6].end + 1)).toBe(-1);
  });
});

describe("percentChange", () => {
  it("returns null without a baseline instead of an inflated number", () => {
    expect(percentChange(10, 0)).toBeNull();
  });

  it("rounds to one decimal", () => {
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(125, 100)).toBe(25);
    expect(percentChange(33, 100)).toBe(-67);
  });
});

describe("summarize", () => {
  it("computes median and p90 across an unsorted sample", () => {
    const stats = summarize([5, 1, 9, 3, 7]);
    expect(stats.count).toBe(5);
    expect(stats.sum).toBe(25);
    expect(stats.mean).toBe(5);
    expect(stats.median).toBe(5);
    expect(stats.min).toBe(1);
    expect(stats.max).toBe(9);
    expect(stats.p90).toBeGreaterThan(7);
  });

  it("handles an empty sample", () => {
    expect(summarize([])).toEqual({ count: 0, sum: 0, mean: 0, median: 0, p90: 0, min: 0, max: 0 });
  });
});

describe("countBy and topFacets", () => {
  it("normalises whitespace and groups empty values", () => {
    const counts = countBy([" Gorilla Trek ", "Gorilla   Trek", null, "   ", undefined]);
    expect(counts.get("Gorilla Trek")).toBe(2);
    expect(counts.get("Unspecified")).toBe(3);
  });

  it("ranks by count then alphabetically", () => {
    const facets = topFacets(countBy(["b", "a", "a", "c", "a"]), 2);
    expect(facets).toEqual([
      { label: "a", count: 3 },
      { label: "b", count: 1 },
    ]);
  });

  it("folds the long tail into a single row when asked", () => {
    const facets = topFacets(countBy(["a", "a", "b", "c", "d"]), 3, true);
    expect(facets).toHaveLength(3);
    expect(facets[2]).toEqual({ label: "2 other", count: 2 });
  });
});

describe("sharePct", () => {
  it("never divides by zero and caps at 100", () => {
    expect(sharePct(5, 0)).toBe(0);
    expect(sharePct(1, 3)).toBe(33.3);
    expect(sharePct(10, 5)).toBe(100);
  });
});

describe("funnel vocabulary", () => {
  it("narrows at every stage and never counts spam as received", () => {
    const received = FUNNEL_STAGES[0];
    const engaged = FUNNEL_STAGES[1];
    const qualified = FUNNEL_STAGES[2];
    const converted = FUNNEL_STAGES[3];

    expect(received.statuses).not.toContain("SPAM");
    expect(converted.statuses).toEqual(["CONVERTED"]);
    // Each later stage is a subset of the one before it.
    for (const status of engaged.statuses) expect(received.statuses).toContain(status);
    for (const status of qualified.statuses) expect(engaged.statuses).toContain(status);
  });
});

describe("formatDuration", () => {
  it("scales the unit to the magnitude", () => {
    expect(formatDuration(0)).toBe("—");
    expect(formatDuration(0.5)).toBe("30m");
    expect(formatDuration(30)).toBe("30h");
    expect(formatDuration(72)).toBe("3d");
  });
});
