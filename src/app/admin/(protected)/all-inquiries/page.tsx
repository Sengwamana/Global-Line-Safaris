"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminDataTable, type Column } from "@/components/admin/AdminDataTable";
import { useAdminList } from "@/components/admin/useAdminList";

const STATUS_COLORS: Record<string, string> = { NEW: "bg-blue-100 text-blue-700", CONTACTED: "bg-amber-100 text-amber-700", IN_PROGRESS: "bg-purple-100 text-purple-700", QUALIFIED: "bg-emerald-100 text-emerald-700", CONVERTED: "bg-green-100 text-green-700", CLOSED: "bg-slate-100 text-slate-700", SPAM: "bg-red-100 text-red-700" };
const TYPE_COLORS: Record<string, string> = { contact: "bg-sky-100 text-sky-700", trip: "bg-violet-100 text-violet-700", internship: "bg-orange-100 text-orange-700" };

export default function AllInquiriesPage() {
  const router = useRouter();
  const { data, loading, error, search, setSearch, page, setPage, totalPages, total, refresh, params, setParams } = useAdminList<any>({ endpoint: "/api/admin/all-inquiries", pageSize: 20, initialParams: { archived: "false" } });
  const columns: Column<any>[] = [
    { key: "name", label: "Sender", render: (item) => <div><p className="font-medium text-slate-900 dark:text-white">{!item.read && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-blue-500" />}{item.name}</p><p className="text-xs text-slate-500">{item.email}</p></div> },
    { key: "type", label: "Type", render: (item) => <Badge className={`${TYPE_COLORS[item.type]} border-0 text-[10px]`}>{item.typeLabel}</Badge> },
    { key: "context", label: "Request", render: (item) => <span className="line-clamp-1">{item.context}</span> },
    { key: "status", label: "Status", render: (item) => <Badge className={`${STATUS_COLORS[item.status]} border-0 text-[10px]`}>{item.status.replace("_", " ")}</Badge> },
    { key: "createdAt", label: "Received", render: (item) => new Date(item.createdAt).toLocaleDateString() },
  ];
  return <AdminPageShell title="All Inquiries" subtitle="One inbox for contact, trip-planning, and internship requests" onRefresh={refresh} loading={loading}>
    <AdminDataTable columns={columns} data={data} loading={loading} pageSize={20} searchValue={search} onSearchChange={setSearch} serverPage={page} onPageChange={setPage} serverTotalPages={totalPages} serverTotal={total} error={error} onRetry={refresh} searchPlaceholder="Search name, email, destination, university..." onRowClick={(item) => router.push(item.href)} filters={<div className="flex gap-1.5"><select aria-label="Inquiry type" value={params.type || "all"} onChange={(e) => setParams({ type: e.target.value })} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-800"><option value="all">All types</option><option value="contact">Contact</option><option value="trip">Trip planning</option><option value="internship">Internship</option></select><select aria-label="Inquiry status" value={params.status || ""} onChange={(e) => setParams({ status: e.target.value })} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-800"><option value="">All statuses</option>{Object.keys(STATUS_COLORS).map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select></div>} />
  </AdminPageShell>;
}
