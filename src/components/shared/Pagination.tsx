import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
  pageLabel?: string;
}

function pageItems(current: number, total: number): Array<number | "…"> {
  const wanted = new Set<number>([1, total, current, current - 1, current + 1]);
  const nums = [...wanted].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const items: Array<number | "…"> = [];
  let prev = 0;
  for (const n of nums) {
    if (n - prev > 1) items.push("…");
    items.push(n);
    prev = n;
  }
  return items;
}

export function Pagination({ page, totalPages, makeHref, pageLabel = "Page" }: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = pageItems(page, totalPages);

  return (
    <nav aria-label={pageLabel} className="pagination">
      {page > 1 ? (
        <Link href={makeHref(page - 1)} className="pagination-btn" aria-label="Previous page">
          <ChevronLeft className="size-4" />
          Prev
        </Link>
      ) : (
        <span aria-hidden="true" className="pagination-btn is-disabled">
          <ChevronLeft className="size-4" />
          Prev
        </span>
      )}

      <div className="pagination-nums">
        {items.map((item, i) =>
          item === "…" ? (
            <span key={`gap-${i}`} className="pagination-ellipsis">
              …
            </span>
          ) : (
            <Link
              key={item}
              href={makeHref(item)}
              aria-current={item === page ? "page" : undefined}
              className={cn("pagination-btn", item === page && "is-active")}
            >
              {item}
            </Link>
          )
        )}
      </div>

      {page < totalPages ? (
        <Link href={makeHref(page + 1)} className="pagination-btn" aria-label="Next page">
          Next
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span aria-hidden="true" className="pagination-btn is-disabled">
          Next
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}