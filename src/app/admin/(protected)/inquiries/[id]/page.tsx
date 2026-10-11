"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageCircle,
  Archive,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/lib/admin-fetch";
import { CrudDialog } from "@/components/admin/CrudDialog";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  CONTACTED: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  IN_PROGRESS: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
  QUALIFIED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  CONVERTED: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  CLOSED: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400",
  SPAM: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

export default function AdminInquiryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [inquiry, setInquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);

  const loadInquiry = useCallback(async () => {
    try {
      const res = await adminFetch(`/api/admin/inquiries/${id}`);
      if (res.status === 404) {
        setLoadError("notfound");
        return;
      }
      if (!res.ok) {
        setLoadError("Failed to load this inquiry.");
        return;
      }
      setInquiry(await res.json());
    } catch {
      setLoadError("Failed to load this inquiry.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInquiry();
  }, [loadInquiry]);

  const reloadInquiry = useCallback(() => {
    setLoadError(null);
    setLoading(true);
    loadInquiry();
  }, [loadInquiry]);

  const updateStatus = async (status: string) => {
    const res = await adminFetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setInquiry((prev: any) => ({ ...prev, status }));
      toast.success(`Status updated to ${status.replace("_", " ")}`);
    } else {
      toast.error("Failed to update status");
    }
  };

  const toggleArchive = async () => {
    const archived = !inquiry.archived;
    const res = await adminFetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived }),
    });
    if (res.ok) {
      setInquiry((prev: any) => ({ ...prev, archived }));
      toast.success(archived ? "Inquiry archived" : "Inquiry unarchived");
    } else {
      toast.error("Failed to update archive status");
    }
  };

  const handleReply = async (data: Record<string, any>) => {
    const res = await adminFetch(`/api/admin/inquiries/${id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reply", subject: data.subject, message: data.message }),
    });
    if (res.ok) {
      toast.success("Reply sent successfully");
    } else {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || "Failed to send reply");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading inquiry...</div>;
  if (loadError) {
    return (
      <div className="max-w-3xl py-16 text-center">
        <Link
          href="/admin/inquiries"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand transition-colors mb-8"
        >
          <ArrowLeft className="size-3.5" /> Back to Inquiries
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700/50 px-6 py-10">
          {loadError === "notfound" ? (
            <>
              <AlertTriangle className="size-7 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">This inquiry could not be found. It may have been deleted.</p>
            </>
          ) : (
            <>
              <AlertTriangle className="size-7 text-red-400 mx-auto mb-3" />
              <p className="text-sm text-slate-500">{loadError}</p>
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5 mt-4" onClick={reloadInquiry}>
                <RefreshCw className="size-3.5" /> Retry
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }
  if (!inquiry) return null;

  const cleanPhone = inquiry.phone ? inquiry.phone.replace(/[^0-9]/g, "") : null;
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${inquiry.name}, thank you for contacting Global Line Safaris regarding ${inquiry.service || "our travel services"}.`)}`
    : null;

  return (
    <div className="max-w-3xl space-y-4">
      <Link
        href="/admin/inquiries"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand transition-colors"
      >
        <ArrowLeft className="size-3.5" /> Back to Inquiries
      </Link>

      <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-700/50 overflow-hidden shadow-sm">
        {/* Header banner */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white">{inquiry.name}</h1>
              {inquiry.archived && (
                <Badge className="bg-slate-200 text-slate-700 border-0 text-[10px]">Archived</Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{inquiry.email}</p>
          </div>
          <Badge className={`${STATUS_COLORS[inquiry.status] ?? ""} border-0 text-[11px] font-bold px-3 py-1`}>
            {inquiry.status?.replace("_", " ")}
          </Badge>
        </div>

        {/* Quick Action Bar */}
        <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 flex flex-wrap gap-2">
          <button
            onClick={() => setReplyOpen(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 transition-colors"
          >
            <Mail className="size-3.5 text-blue-500" />
            Reply
          </button>

          {inquiry.phone && (
            <a
              href={`tel:${inquiry.phone.replace(/[^0-9+]/g, "")}`}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 transition-colors"
            >
              <Phone className="size-3.5 text-emerald-500" />
              Call Client
            </a>
          )}

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 transition-colors"
            >
              <MessageCircle className="size-3.5 text-green-500" />
              WhatsApp
            </a>
          )}

          <button
            onClick={toggleArchive}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 transition-colors ml-auto"
          >
            <Archive className="size-3.5 text-slate-400" />
            {inquiry.archived ? "Unarchive" : "Archive"}
          </button>
        </div>

        {/* Lead Details Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Company</span>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {inquiry.company || "Not provided (Individual)"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Phone</span>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {inquiry.phone || "Not provided"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Requested Service</span>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {inquiry.service || "General Inquiry"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Submission Date</span>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {new Date(inquiry.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Message body */}
        <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Client Message</span>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {inquiry.message}
          </div>
        </div>

        {/* Status update workflow */}
        <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Update Lead Workflow Status</span>
          <div className="flex flex-wrap gap-2">
            {["NEW", "CONTACTED", "IN_PROGRESS", "QUALIFIED", "CONVERTED", "CLOSED", "SPAM"].map((s) => {
              const active = inquiry.status === s;
              return (
                <Button
                  key={s}
                  variant={active ? "brand" : "outline"}
                  size="sm"
                  className="rounded-xl text-[11px]"
                  onClick={() => updateStatus(s)}
                >
                  {active && <CheckCircle2 className="size-3 mr-1" />}
                  {s.replace("_", " ")}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      <CrudDialog
        open={replyOpen}
        onClose={() => setReplyOpen(false)}
        onSave={handleReply}
        title="Send Reply"
        initial={{
          subject: `Re: ${inquiry?.service ? inquiry.service : "Global Line Safaris Inquiry"}`,
          message: "",
        }}
        fields={[
          { name: "subject", label: "Subject", type: "text", required: true },
          { name: "message", label: "Message", type: "textarea", required: true },
        ]}
      />
    </div>
  );
}
