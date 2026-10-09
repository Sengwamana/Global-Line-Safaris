import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/admin/api-registry";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const { error } = await requireRole("EDITOR");
  if (error) return error;
  const data = await prisma.siteImage.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ data, pagination: { page: 1, limit: data.length || 1, total: data.length, totalPages: 1 } });
}

export async function PATCH(request: Request) {
  const { session, error } = await requireRole("ADMIN");
  if (error) return error;
  const body = await request.json();
  if (!body || typeof body.key !== "string" || !body.key.trim() || typeof body.url !== "string" || !body.url.trim()) {
    return NextResponse.json({ error: "An image key and image URL are required." }, { status: 400 });
  }
  const key = body.key.trim();
  const image = await prisma.siteImage.upsert({ where: { key }, update: { url: body.url.trim(), alt: typeof body.alt === "string" ? body.alt.trim() : null }, create: { key, url: body.url.trim(), alt: typeof body.alt === "string" ? body.alt.trim() : null } });
  await logAudit({ userId: session.user.id, action: "site-image:update", entity: "SiteImage", entityId: image.id, details: key });
  try { const { revalidateSite } = await import("@/lib/revalidate"); revalidateSite(); } catch { /* best effort */ }
  return NextResponse.json(image);
}
