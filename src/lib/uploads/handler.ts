/**
 * Upload handler: validates files and stores them.
 *
 * Backends (in priority order):
 *  - Vercel Blob (@vercel/blob) when BLOB_READ_WRITE_TOKEN is set (Vercel/production).
 *  - Cloudflare R2 (@aws-sdk/client-s3) when the R2_* vars are set (free 10 GB, zero egress).
 *  - Local filesystem under public/uploads when neither is configured (local dev /
 *    self-hosted), preserving the previous behavior.
 * Returns metadata for Prisma Media record creation.
 */
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { isBlobConfigured } from "@/lib/uploads/config";
import { isR2Configured, putR2Object } from "@/lib/uploads/r2";

const MAX_FILE_SIZE = Number(process.env.RESOURCE_MAX_UPLOAD_BYTES ?? 5 * 1024 * 1024); // 5MB default

// NOTE: SVG is intentionally excluded — raw SVG uploads can contain script
// (stored-XSS) when served same-origin. Use PNG/WebP for logos and graphics.
//
// NOTE: Only images are accepted. The media library is consumed exclusively by
// <img> elements across the marketing site; accepting PDFs/DOCX etc. would
// publish potentially sensitive client documents to public-by-URL paths with no
// access control. Documents have no supported home in this system yet.
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const ALL_ALLOWED_TYPES = ALLOWED_IMAGE_TYPES;

export interface UploadResult {
  url: string;
  name: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

const EXTENSION_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/**
 * Infer a MIME type from a filename extension. Returns "" when unknown.
 */
export function detectMimeFromFilename(filename: string): string {
  return EXTENSION_MIME[path.extname(filename).toLowerCase()] ?? "";
}

export function validateFile(file: File): { ok: true; mimeType: string } | { ok: false; error: string } {
  if (file.size > MAX_FILE_SIZE) {
    const maxMB = Math.round(MAX_FILE_SIZE / (1024 * 1024));
    return { ok: false, error: `File too large. Maximum size is ${maxMB}MB.` };
  }

  // Some browsers send an empty MIME type for files with uncommon extensions.
  // Fall back to detection from the filename extension so valid uploads work.
  let mimeType = file.type || detectMimeFromFilename(file.name);

  if (!ALL_ALLOWED_TYPES.has(mimeType)) {
    return { ok: false, error: `File type "${file.type || "unknown"}" is not allowed. Use an image (JPG/PNG/WebP/GIF) only — documents are not permitted in the media library.` };
  }
  return { ok: true, mimeType };
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const base = sanitizeFilename(path.basename(originalName, ext));
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${base}-${timestamp}-${random}${ext}`;
}

function isImageByMime(mime: string): boolean {
  return ALLOWED_IMAGE_TYPES.has(mime);
}

/** Read image dimensions with sharp (best-effort, optional). */
async function imageDimensions(buffer: Buffer): Promise<{ width?: number; height?: number }> {
  try {
    const sharp = (await import("sharp")).default;
    const meta = await sharp(buffer).metadata();
    return { width: meta.width, height: meta.height };
  } catch {
    return {};
  }
}

/**
 * Resize + recompress an image to a WebP of at most `maxDim` px. Returns the
 * resized buffer and its computed dimensions, or null if the image could not
 * be processed (in which case the caller falls back to the original buffer).
 */
async function resizeToWebp(
  buffer: Buffer,
  maxDim = 2048
): Promise<{ buffer: Buffer; width: number; height: number; mimeType: string } | null> {
  try {
    const sharp = (await import("sharp")).default;
    const image = sharp(buffer);
    const metadata = await image.metadata();
    if (metadata.width && metadata.height && (metadata.width > maxDim || metadata.height > maxDim)) {
      image.resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true });
    }
    const resized = await image.webp({ quality: 85 }).toBuffer();
    const outMeta = await sharp(resized).metadata();
    return { buffer: resized, width: outMeta.width ?? metadata.width ?? 0, height: outMeta.height ?? metadata.height ?? 0, mimeType: "image/webp" };
  } catch {
    return null;
  }
}

/**
 * Store an uploaded file and return metadata for the Media record.
 * Uses Vercel Blob when configured, otherwise the local filesystem.
 *
 * @param file The uploaded File.
 * @param detectedMime Optional MIME type already validated by validateFile.
 *        Used as the source of truth when the browser reported an empty/incorrect
 *        MIME so image processing and storage use a recognized type.
 */
export async function processUpload(file: File, detectedMime?: string): Promise<UploadResult> {
  const mime = detectedMime || file.type;
  const originalBuffer = isImageByMime(mime) ? Buffer.from(await file.arrayBuffer()) : null;

  // Resize/recompress raster images (JPEG, PNG, WebP) once, used for BOTH backends.
  let buffer: Buffer | null = originalBuffer;
  let finalMime = mime;
  let width: number | undefined;
  let height: number | undefined;
  const dims = originalBuffer ? await imageDimensions(originalBuffer) : {};

  const convertibleImage = isImageByMime(mime) && mime !== "image/gif";
  if (convertibleImage) {
    const resized = await resizeToWebp(originalBuffer!);
    if (resized) {
      buffer = resized.buffer;
      finalMime = resized.mimeType;
      width = resized.width;
      height = resized.height;
    } else {
      // Fall back to raw (dimensions from source)
      width = dims.width;
      height = dims.height;
    }
  } else if (originalBuffer) {
    width = dims.width;
    height = dims.height;
  }

  const uploadFilename = finalMime === "image/webp"
    ? (generateUniqueFilename(file.name).replace(/\.[^.]+$/, ".webp"))
    : generateUniqueFilename(file.name);

  if (isBlobConfigured()) {
    // Use a fresh random suffix ourselves (deterministic name); disable Blob's own.
    const { put } = await import("@vercel/blob");
    const { url } = await put(`uploads/${uploadFilename}`, buffer ?? file, {
      access: "public",
      addRandomSuffix: false,
    });
    return { url, name: file.name, mimeType: finalMime, size: buffer?.length ?? file.size, width, height };
  }

  if (isR2Configured()) {
    // Cloudflare R2 (S3-compatible). Mirror the local subdirectory layout so the
    // stored URL structure stays predictable: uploads/YYYY/MM/<filename>.
    const now = new Date();
    const key = path.posix.join(
      "uploads",
      String(now.getFullYear()),
      String(now.getMonth() + 1).padStart(2, "0"),
      uploadFilename
    );
    const body = buffer ?? Buffer.from(await file.arrayBuffer());
    const { url } = await putR2Object(key, body, finalMime);
    return { url, name: file.name, mimeType: finalMime, size: body.length, width, height };
  }

  // Local filesystem fallback (local dev / self-hosted).
  // NOTE: In serverless environments (Vercel, etc.) the filesystem is read-only
  // during requests, so a local write here would fail and surface as a 400.
  // Require a remote backend (Vercel Blob or Cloudflare R2) or raise a clear
  // error instead of failing silently.
  if (process.env.NODE_ENV === "production" && process.env.VERCEL === "1") {
    throw new Error(
      "Upload storage is not configured for this environment. " +
        "Set BLOB_READ_WRITE_TOKEN (Vercel Blob) or the R2_* variables (Cloudflare R2) " +
        "to enable file uploads, or use 'Add by URL'. " +
        `(vercel=${process.env.VERCEL === "1"}, nodeEnv=${process.env.NODE_ENV})`
    );
  }

  const finalBuffer = buffer ?? Buffer.from(await file.arrayBuffer());
  const now = new Date();
  const subDir = path.join("uploads", String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, "0"));
  const absDir = path.join(process.cwd(), "public", subDir);
  await mkdir(absDir, { recursive: true });

  const filePath = path.join(absDir, uploadFilename);
  await writeFile(filePath, finalBuffer);

  const url = `/${subDir}/${uploadFilename}`;
  return { url, name: file.name, mimeType: finalMime, size: finalBuffer.length, width, height };
}