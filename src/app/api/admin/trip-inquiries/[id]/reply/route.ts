import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/admin/api-registry";
import { logAudit } from "@/lib/audit";
import { replyToCustomer } from "@/lib/services/email";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireRole("EDITOR");
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();
  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const record = await prisma.tripInquiry.findUnique({ where: { id }, select: { email: true, name: true } });
  if (!record?.email) {
    return NextResponse.json({ error: "No recipient email found" }, { status: 400 });
  }

  try {
    await replyToCustomer({ to: record.email, subject, body: message });
    await logAudit({ userId: session.user.id, action: "tripinquiry:reply", entity: "TripInquiry", entityId: id, details: JSON.stringify({ subject }) });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin:trip-inquiries] reply failed", err);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}
