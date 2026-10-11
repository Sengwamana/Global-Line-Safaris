"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { useAdminList } from "@/components/admin/useAdminList";
import { AdminDataTable, type Column } from "@/components/admin/AdminDataTable";
import { CrudDialog } from "@/components/admin/CrudDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useContentActions } from "@/components/admin/useContentActions";
import { Badge } from "@/components/ui/badge";
import { PROGRAM_TYPE_VALUES, PROGRAM_TYPE_LABELS } from "@/lib/validation";

const PROGRAM_OPTIONS = PROGRAM_TYPE_VALUES.map((value) => ({
  label: PROGRAM_TYPE_LABELS[value],
  value,
}));

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  CONTACTED: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  IN_PROGRESS: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
  QUALIFIED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  CONVERTED: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  CLOSED: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400",
  SPAM: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

export default function AdminInternshipInquiriesPage() {
  const searchKeys = ["name", "email", "university", "fieldOfStudy", "programType", "status"];
  const { data, loading, error, search, setSearch, page, setPage, totalPages, total, refresh, params, setParams } =
    useAdminList<any>({ endpoint: "/api/admin/internship-inquiries", pageSize: 20 });
  const [editItem, setEditItem] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [replyItem, setReplyItem] = useState<any>(null);
  const { canDelete, deleteItem, setDeleteItem, toggleArchive, confirmDelete } =
    useContentActions<any>(
      "/api/admin/internship-inquiries",
      refresh,
      { singular: "application" },
      // InternshipInquiry archives via the `archived` boolean; `status` is the
      // lead lifecycle enum and has no ARCHIVED member.
      { archiveField: "archived" }
    );

  const showArchived = params.archived === "true";

  const toggleArchived = (archived: boolean) => {
    setParams({ ...params, archived: String(archived) });
  };

  const patchItem = async (item: any, body: Record<string, any>, successMsg: string) => {
    const res = await fetch(`/api/admin/internship-inquiries/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success(successMsg);
      refresh();
    } else {
      const e = await res.json().catch(() => ({}));
      toast.error(e.error || "Update failed");
    }
  };

  const handleSave = async (formData: Record<string, any>) => {
    const method = editItem ? "PATCH" : "POST";
    const url = editItem ? `/api/admin/internship-inquiries/${editItem.id}` : "/api/admin/internship-inquiries";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      toast.success(editItem ? "Application updated" : "Application created");
      refresh();
      setEditItem(null);
      setShowCreate(false);
    } else {
      const e = await res.json().catch(() => ({}));
      toast.error(e.error || "Failed to save application");
    }
  };

  const handleReply = async (data: Record<string, any>) => {
    if (!replyItem) return;
    const res = await fetch(`/api/admin/internship-inquiries/${replyItem.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reply", subject: data.subject, message: data.message }),
    });
    if (res.ok) {
      toast.success("Reply sent successfully");
      setReplyItem(null);
    } else {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || "Failed to send reply");
    }
  };

  const columns: Column<any>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (item) => (
        <span className="font-medium text-slate-900 dark:text-white line-clamp-1">{item.name}</span>
      ),
    },
    { key: "email", label: "Email" },
    {
      key: "university",
      label: "University",
      render: (item) => item.university || <span className="text-xs text-slate-400">—</span>,
    },
    {
      key: "fieldOfStudy",
      label: "Field of Study",
      render: (item) => item.fieldOfStudy || <span className="text-xs text-slate-400">—</span>,
    },
    {
      key: "programType",
      label: "Programme",
      render: (item) =>
        item.programType ? (
          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
            {PROGRAM_TYPE_LABELS[item.programType as keyof typeof PROGRAM_TYPE_LABELS] ?? item.programType}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Badge className={`${STATUS_COLORS[item.status] ?? ""} border-0 text-[10px] font-bold`}>
          {item.status?.replace(/_/g, " ") ?? "—"}
        </Badge>
      ),
    },
    {
      key: "read",
      label: "Seen",
      render: (item) =>
        item.read ? (
          <span className="text-xs text-slate-400">Read</span>
        ) : (
          <Badge className="border-0 bg-blue-100 text-[10px] font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
            Unread
          </Badge>
        ),
    },
    {
      key: "archived",
      label: "Archived",
      render: (item) =>
        item.archived ? (
          <Badge className="border-0 bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-500/15 dark:text-slate-400">
            Archived
          </Badge>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      key: "preferredStartDate",
      label: "Start",
      render: (item) => item.preferredStartDate || <span className="text-xs text-slate-400">—</span>,
    },
    {
      key: "duration",
      label: "Duration",
      render: (item) => item.duration || <span className="text-xs text-slate-400">—</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              patchItem(item, { read: !item.read }, item.read ? "Marked as unread" : "Marked as read");
            }}
            className="text-xs font-semibold text-slate-500 hover:text-brand hover:underline"
          >
            {item.read ? "Unread" : "Read"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setReplyItem(item);
            }}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Reply
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditItem(item);
            }}
            className="text-xs font-semibold text-brand hover:underline"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleArchive(item);
            }}
            className="text-xs font-semibold text-amber-600 hover:underline"
          >
            {item.archived ? "Restore" : "Archive"}
          </button>
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteItem(item);
              }}
              className="text-xs font-semibold text-red-500 hover:underline"
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Internship Applications"
      subtitle="Manage internship, industrial attachment and apprenticeship applications submitted via the website"
      onRefresh={refresh}
      loading={loading}
      onAdd={() => setShowCreate(true)}
      addLabel="Add Application"
    >
      <AdminDataTable
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={searchKeys}
        searchPlaceholder="Search inquiries..."
        pageSize={20}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setParams({ archived: "false" }); }}
        serverPage={page}
        onPageChange={setPage}
        serverTotalPages={totalPages}
        serverTotal={total}
        error={error}
        onRetry={refresh}
        filters={
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setParams({ status: "", archived: "false" })}
              className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition-colors ${
                !params.status && !showArchived
                  ? "bg-brand text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              All
            </button>
            {["NEW", "CONTACTED", "IN_PROGRESS", "QUALIFIED", "CONVERTED", "CLOSED", "SPAM"].map((s) => (
              <button
                key={s}
                onClick={() => setParams({ status: s, archived: "false" })}
                className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition-colors ${
                  params.status === s && !showArchived
                    ? "bg-brand text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
            <button
              onClick={() => toggleArchived(!showArchived)}
              className={`h-7 px-2.5 rounded-lg text-[11px] font-bold transition-colors ${
                showArchived
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              Archived
            </button>
          </div>
        }
      />

      <CrudDialog
        open={showCreate || !!editItem}
        onClose={() => {
          setShowCreate(false);
          setEditItem(null);
        }}
        onSave={handleSave}
        title={editItem ? "Edit Application" : "Add Application"}
        initial={editItem ?? {}}
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "email", label: "Email", required: true },
          { name: "phone", label: "Phone", type: "text" },
          { name: "country", label: "Country of Residence", type: "text", placeholder: "e.g. Rwanda" },
          { name: "university", label: "Institution / University", type: "text", placeholder: "e.g. University of Rwanda" },
          { name: "fieldOfStudy", label: "Field of Study", type: "text", placeholder: "e.g. Tourism Management" },
          { name: "programType", label: "Programme", type: "select", options: PROGRAM_OPTIONS },
          { name: "preferredStartDate", label: "Preferred Start Date", type: "text", placeholder: "e.g. 2026-07-15 or July 2026" },
          { name: "duration", label: "Duration / Availability", type: "text", placeholder: "e.g. 3 months, weekdays only" },
          { name: "experience", label: "Relevant Experience", type: "textarea" },
          { name: "areasOfInterest", label: "Areas of Interest", type: "text", placeholder: "e.g. Safari guiding, Hospitality" },
          { name: "message", label: "Message / Motivation", type: "textarea" },
          { name: "status", label: "Status", type: "select", options: [
            { label: "New", value: "NEW" },
            { label: "Contacted", value: "CONTACTED" },
            { label: "In Progress", value: "IN_PROGRESS" },
            { label: "Qualified", value: "QUALIFIED" },
            { label: "Converted", value: "CONVERTED" },
            { label: "Closed", value: "CLOSED" },
            { label: "Spam", value: "SPAM" },
          ]},
          { name: "read", label: "Mark as read", type: "checkbox" },
          { name: "archived", label: "Archived", type: "checkbox" },
        ]}
      />

      <CrudDialog
        open={Boolean(replyItem)}
        onClose={() => setReplyItem(null)}
        onSave={handleReply}
        title="Send Reply"
        initial={{
          subject: replyItem ? `Re: ${replyItem.programType ? replyItem.programType.replace(/_/g, " ") : "Internship"} Application` : "",
          message: "",
        }}
        fields={[
          { name: "subject", label: "Subject", type: "text", required: true },
          { name: "message", label: "Message", type: "textarea", required: true },
        ]}
      />
      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
        title="Delete this application?"
        message={`Are you sure you want to delete the inquiry from "${deleteItem?.name}"?`}
      />
    </AdminPageShell>
  );
}