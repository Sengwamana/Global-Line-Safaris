import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/admin/api-registry";
import { homepageSectionSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export async function GET(_request: Request, { params }: { params: Promise<{ sectionKey: string }> }) {
  const { error } = await requireRole("EDITOR");
  if (error) return error;

  const { sectionKey } = await params;
  const section = await prisma.homepageSection.findUnique({ where: { sectionKey } });
  if (!section) {
    return NextResponse.json({ sectionKey, eyebrow: null, title: null, subtitle: null, description: null, items: [], imageKey: null, ctaLabel: null, ctaUrl: null });
  }
  return NextResponse.json(section);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ sectionKey: string }> }) {
  const { session, error } = await requireRole("ADMIN");
  if (error) return error;

  const { sectionKey } = await params;
  const body = await request.json();
  const parsed = homepageSectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") }, { status: 400 });
  }

  const prismaData: Record<string, any> = { ...parsed.data };
  if (prismaData.items && Array.isArray(prismaData.items)) {
    prismaData.items = JSON.stringify(prismaData.items);
  }
  for (const [key, val] of Object.entries(prismaData)) {
    if (val === undefined) delete prismaData[key];
  }

  try {
    const section = await prisma.homepageSection.upsert({
      where: { sectionKey },
      update: prismaData,
      create: { sectionKey, ...prismaData },
    });

    await logAudit({ userId: session.user.id, action: "homepage:update", entity: "HomepageSection", entityId: section.id, details: sectionKey });

    try {
      const { revalidateSite } = await import("@/lib/revalidate");
      revalidateSite();
    } catch { /* best-effort */ }

    return NextResponse.json(section);
  } catch (err) {
    console.error("[admin:homepage] update error", err);
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 });
  }
}
