import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/admin/api-registry";
import { logAudit } from "@/lib/audit";
import { isR2Configured, getR2KeyFromUrl, deleteR2Object } from "@/lib/uploads/r2";

// Blob/R2 deletion uses Node-only APIs (fs/path, AWS SDK) and server-only tokens.
export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole("EDITOR");
  if (error) return error;

  const { id } = await params;
  const media = await prisma.media.findUnique({
    where: { id },
    include: { uploader: { select: { id: true, name: true } } },
  });
  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(media);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireRole("EDITOR");
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const allowed = ["alt", "title", "description"];
  const data: Record<string, string> = {};
  for (const key of allowed) {
    if (typeof body[key] === "string") data[key] = body[key];
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields provided (alt, title, description)" }, { status: 400 });
  }

  try {
    const media = await prisma.media.update({ where: { id }, data });
    await logAudit({ userId: session.user.id, action: "media:update", entity: "Media", entityId: id, details: JSON.stringify(Object.keys(data)) });
    return NextResponse.json(media);
  } catch (error: any) {
    if (error?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    console.error("[admin:media] update error", error);
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireRole("SUPER_ADMIN");
  if (error) return error;

  const { id } = await params;
  try {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Remove from Vercel Blob if hosted there.
    if (media.url?.includes("blob.vercel-storage.com")) {
      try {
        const { del } = await import("@vercel/blob");
        await del(media.url);
      } catch { /* ignore blob deletion errors */ }
    }

    // Remove from Cloudflare R2 if hosted there.
    if (isR2Configured() && media.url) {
      const key = getR2KeyFromUrl(media.url);
      if (key) {
        try {
          await deleteR2Object(key);
        } catch { /* ignore R2 deletion errors */ }
      }
    }

    // Remove from local filesystem if hosted locally (public/uploads/...).
    if (media.url?.startsWith("/uploads/")) {
      try {
        const { unlink } = await import("fs/promises");
        const path = await import("path");
        const abs = path.join(process.cwd(), "public", media.url.replace(/^\//, ""));
        await unlink(abs).catch(() => { /* ignore missing file */ });
      } catch { /* ignore */ }
    }

    await prisma.media.delete({ where: { id } });
    await logAudit({ userId: session.user.id, action: "media:delete", entity: "Media", entityId: id });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    console.error("[admin:media] delete error", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
