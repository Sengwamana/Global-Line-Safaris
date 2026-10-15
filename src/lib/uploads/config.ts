/**
 * Centralized storage configuration.
 *
 * This module is the single source of truth for how the app detects whether
 * Vercel Blob or Cloudflare R2 storage is configured. It must only ever be
 * imported from server-side code (API routes / server actions) — the tokens
 * are server-only secrets and must never be exposed to the browser or prefixed
 * with NEXT_PUBLIC_.
 *
 * Secret values themselves are NEVER logged or returned; we only ever surface a
 * boolean/backend name that reports which storage backend is available.
 */
import { isR2Configured } from "@/lib/uploads/r2";

const BLOB_ENV_VAR = "BLOB_READ_WRITE_TOKEN";

/**
 * Read the Blob token from the environment at call time (not module-eval time)
 * so that deployments which receive the variable at runtime pick it up.
 * Returns the trimmed value, or "" when unset.
 */
function readBlobToken(): string {
  // Reading lazily inside the function (rather than at module scope) keeps the
  // check resilient to env vars that are injected at request time.
  const token = process.env[BLOB_ENV_VAR];
  return typeof token === "string" ? token.trim() : "";
}

/**
 * Safe check that Vercel Blob storage is configured.
 * Returns true only when a non-empty BLOB_READ_WRITE_TOKEN is present.
 * Never logs, returns, or exposes the actual token.
 */
export function isBlobConfigured(): boolean {
  return readBlobToken() !== "";
}

/**
 * Safe validation helper for surfacing configuration status (e.g. in logs or
 * error messages). Only reports whether Blob is enabled — it does not reveal
 * the secret.
 */
export function getBlobConfigStatus(): { configured: boolean; backend: "blob" | "local" } {
  return isBlobConfigured()
    ? { configured: true, backend: "blob" }
    : { configured: false, backend: "local" };
}

export type StorageBackend = "blob" | "r2" | "local";

/**
 * Combined storage status across all backends. Priority mirrors the upload
 * handler: Vercel Blob wins over Cloudflare R2, which wins over local disk.
 * Only reports whether each backend is configured — never secret values.
 */
export function getStorageConfigStatus(): { configured: boolean; backend: StorageBackend } {
  if (isBlobConfigured()) return { configured: true, backend: "blob" };
  if (isR2Configured()) return { configured: true, backend: "r2" };
  return { configured: false, backend: "local" };
}
