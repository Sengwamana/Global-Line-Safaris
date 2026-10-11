import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/admin/api-registry";
import { logAudit } from "@/lib/audit";
import { sendInquiryStatusUpdate } from "@/lib/services/email";
import { tripInquiryUpdateSchema } from "@/lib/validation";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole("EDITOR");
  if (error) return error;

  const { id } = await params;
  const inquiry = await prisma.tripInquiry.findUnique({
    where: { id },
    include: { assignedTo: { select: { id: true, name: true, email: true } } },
  });
  if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(inquiry);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireRole("EDITOR");
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = tripInquiryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const data: Record<string, any> = { ...parsed.data };
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields provided to update" }, { status: 400 });
  }

  if (data.assignedToId !== undefined) {
    if (data.assignedToId !== null && typeof data.assignedToId === "string") {
      const assignee = await prisma.user.findUnique({
        where: { id: data.assignedToId },
        select: { id: true, active: true },
      });
      if (!assignee || !assignee.active) {
        return NextResponse.json({ error: "Assigned user not found or inactive" }, { status: 400 });
      }
    } else if (data.assignedToId !== null) {
      return NextResponse.json({ error: "Invalid assignedToId" }, { status: 400 });
    }
  }

  try {
    const old = await prisma.tripInquiry.findUnique({
      where: { id },
      select: { status: true, email: true, name: true, preferredPackage: true, destination: true },
    });

    const inquiry = await prisma.tripInquiry.update({ where: { id }, data });
    await logAudit({ userId: session.user.id, action: "tripinquiry:update", entity: "TripInquiry", entityId: id, details: JSON.stringify({ updatedFields: Object.keys(data) }) });

    if (old && data.status && data.status !== old.status && old.email) {
      sendInquiryStatusUpdate(
        { email: old.email, name: old.name, service: old.preferredPackage || old.destination },
        data.status,
      ).catch((err) => console.error("[trip-inquiry] status email failed", err));
    }

    return NextResponse.json(inquiry);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireRole("SUPER_ADMIN");
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.tripInquiry.delete({ where: { id } });
    await logAudit({ userId: session.user.id, action: "tripinquiry:delete", entity: "TripInquiry", entityId: id });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    console.error("[admin:trip-inquiries] delete error", error);
    return NextResponse.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}
