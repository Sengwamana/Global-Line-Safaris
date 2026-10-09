import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/admin/api-registry";

export const dynamic = "force-dynamic";

/** A single inbox across contact, trip-planning, and internship submissions. */
export async function GET(request: Request) {
  const { error } = await requireRole("EDITOR");
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || "all";
    const archived = searchParams.get("archived") === "true";
    const common = { ...(status ? { status: status as any } : {}), archived };
    const contactWhere: any = { ...common, ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }, { message: { contains: q, mode: "insensitive" } }] } : {}) };
    const tripWhere: any = { ...common, ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { destination: { contains: q, mode: "insensitive" } }, { preferredPackage: { contains: q, mode: "insensitive" } }, { message: { contains: q, mode: "insensitive" } }] } : {}) };
    const internshipWhere: any = { ...common, ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { university: { contains: q, mode: "insensitive" } }, { fieldOfStudy: { contains: q, mode: "insensitive" } }, { message: { contains: q, mode: "insensitive" } }] } : {}) };
    const selected = { contact: type === "all" || type === "contact", trip: type === "all" || type === "trip", internship: type === "all" || type === "internship" };
    const include = { assignedTo: { select: { id: true, name: true, email: true } } };
    const [contacts, trips, internships] = await Promise.all([
      selected.contact ? prisma.inquiry.findMany({ where: contactWhere, include }) : [],
      selected.trip ? prisma.tripInquiry.findMany({ where: tripWhere, include }) : [],
      selected.internship ? prisma.internshipInquiry.findMany({ where: internshipWhere, include }) : [],
    ]);

    const data = [
      ...contacts.map((item) => ({ ...item, type: "contact", typeLabel: "Contact", context: item.service || item.company || "General inquiry", href: `/admin/inquiries/${item.id}` })),
      ...trips.map((item) => ({ ...item, type: "trip", typeLabel: "Trip planning", context: item.destination || item.preferredPackage || "Trip inquiry", href: "/admin/trip-inquiries" })),
      ...internships.map((item) => ({ ...item, type: "internship", typeLabel: "Internship", context: item.programType || item.fieldOfStudy || item.university || "Internship inquiry", href: "/admin/internship-inquiries" })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({ data: data.slice((page - 1) * limit, page * limit), pagination: { page, limit, total: data.length, totalPages: Math.ceil(data.length / limit) } });
  } catch (cause) {
    console.error("[admin:all-inquiries] list error", cause);
    return NextResponse.json({ error: "Failed to load inquiries" }, { status: 500 });
  }
}
