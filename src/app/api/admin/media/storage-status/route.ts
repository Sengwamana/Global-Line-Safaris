import { NextResponse } from "next/server";
import { requireRole } from "@/lib/admin/api-registry";
import { getBlobConfigStatus, getStorageConfigStatus } from "@/lib/uploads/config";
import { isR2Configured } from "@/lib/uploads/r2";

/**
 * Server-only diagnostic endpoint: reports which upload storage backend is
 * configured in the current runtime WITHOUT ever exposing secret values.
 * Use this to confirm whether the deployed function can see
 * BLOB_READ_WRITE_TOKEN or the R2_* variables.
 */
export const runtime = "nodejs";

export async function GET() {
  const { error } = await requireRole("ADMIN");
  if (error) return error;

  const blob = getBlobConfigStatus();
  const storage = getStorageConfigStatus();

  return NextResponse.json({
    blobConfigured: blob.configured,
    r2Configured: isR2Configured(),
    // "backend" reflects the active priority: blob > r2 > local.
    backend: storage.backend,
    runtime: "nodejs",
    vercel: process.env.VERCEL === "1",
    nodeEnv: process.env.NODE_ENV,
    // NOTE: never include BLOB_READ_WRITE_TOKEN or R2_* secret values here.
  });
}
