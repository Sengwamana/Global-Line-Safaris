"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKeys?: string[];
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  onRowClick?: (item: T) => void;
  pageSize?: number;
  loading?: boolean;
  /** When provided, enables server-side search (wired to useAdminList.setSearch). */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** When provided, enables server-side pagination (wired to useAdminList.setPage). */
  serverPage?: number;
  serverTotalPages?: number;
  serverTotal?: number;
  onPageChange?: (page: number) => void;
  /** Load/request error message. When set, an error state is shown instead of "No results found." */
  error?: string | null;
  /** Called by the Retry button in the error state. */
  onRetry?: () => void;
}

export function AdminDataTable<T extends Record<string, any>>({
  columns,
  data = [],
  searchKeys = [],
  searchPlaceholder = "Search...",
  filters,
  onRowClick,
  pageSize = 10,
  loading = false,
  searchValue,
  onSearchChange,
  serverPage,
  serverTotalPages,
  serverTotal,
  onPageChange,
  error = null,
  onRetry,
}: AdminDataTableProps<T>) {
  const serverSide = Boolean(onSearchChange || onPageChange);
  const [localSearch, setLocalSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const search = serverSide ? (searchValue ?? "") : localSearch;

  const filtered = useMemo(() => {
    // In server-side mode the data is already filtered/paginated by the server.
    if (serverSide) return data;
    let result = data;
    if (search && searchKeys.length > 0) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => String(item[key] ?? "").toLowerCase().includes(q))
      );
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortKey] ?? "";
        const bVal = b[sortKey] ?? "";
        const cmp = typeof aVal === "number" ? aVal - bVal : String(aVal).localeCompare(String(bVal));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, sortKey, sortDir, searchKeys, serverSide]);

  const totalPages = serverSide
    ? (serverTotalPages ?? Math.ceil(data.length / pageSize))
    : Math.ceil(filtered.length / pageSize);
  const paged = serverSide ? filtered : filtered.slice(page * pageSize, (page + 1) * pageSize);

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setLocalSearch(value);
      setPage(0);
    }
  };

  // Pagination inside the table is zero-based, whereas the API contract is
  // one-based. Keep that conversion here so every CMS list behaves alike.
  const handlePageChange = (target: number) => {
    if (onPageChange) {
      onPageChange(target + 1);
    } else {
      setPage(target);
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const currentPage = serverSide ? Math.max(0, (serverPage ?? 1) - 1) : page;
  const start = currentPage * pageSize + 1;
  const end = serverSide
    ? currentPage * pageSize + data.length
    : Math.min((currentPage + 1) * pageSize, filtered.length);
  const total = serverSide ? (serverTotal ?? data.length) : filtered.length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { handleSearchChange(e.target.value); }}
            placeholder={searchPlaceholder}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300 dark:placeholder:text-slate-500 transition-all"
          />
        </div>
        {filters && (
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-slate-400" />
            {filters}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400",
                      col.sortable && "cursor-pointer hover:text-slate-600 select-none",
                      col.className
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortKey === col.key && (
                        <ChevronDown className={cn("size-3 transition-transform", sortDir === "desc" && "rotate-180")} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="size-6 text-red-400" />
                      <p className="text-sm text-slate-500">
                        {error === "Failed to fetch" ? "Could not load data. Please check your connection and try again." : error}
                      </p>
                      {onRetry && (
                        <button
                          onClick={onRetry}
                          className="inline-flex items-center gap-1.5 h-8 px-3 mt-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors"
                        >
                          <RefreshCw className="size-3.5" /> Retry
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-400">
                    No results found.
                  </td>
                </tr>
              ) : (
                paged.map((item, i) => (
                  <motion.tr
                    key={(item as any).id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={cn(
                      "transition-colors",
                      onRowClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30" : ""
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn("px-4 py-3 text-sm", col.className)}>
                        {col.render ? col.render(item) : (item[col.key] ?? "—")}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              Showing {start}–{Math.max(start, end)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                    currentPage === i
                      ? "bg-brand text-white"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
