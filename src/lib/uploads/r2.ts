/**
 * Cloudflare R2 storage adapter (S3-compatible).
 *
 * R2 is the preferred free backend when Vercel Blob is not configured:
 * 10 GB free storage, zero egress fees, commercial use allowed.
 *
 * Required environment variables (all server-only, never NEXT_PUBLIC_):
 *   R2_ACCOUNT_ID      - Cloudflare account ID
 *   R2_ACCESS_KEY_ID   - R2 API token access key
 *   R2_SECRET_ACCESS_KEY - R2 API token secret
 *   R2_BUCKET_NAME     - target bucket name
 *   R2_PUBLIC_URL      - public base URL for the bucket, e.g. "https://pub-xxxx.r2.dev"
 *                        or a custom domain like "https://media.example.com"
 *
 * This module must only ever be imported from server-side code. Secret values
 * are never logged or returned; only booleans/configured flags surface.
 */

function readEnv(name: string): string {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

export function getR2AccountId(): string {
  return readEnv("R2_ACCOUNT_ID");
}

export function getR2AccessKeyId(): string {
  return readEnv("R2_ACCESS_KEY_ID");
}

export function getR2SecretAccessKey(): string {
  return readEnv("R2_SECRET_ACCESS_KEY");
}

export function getR2BucketName(): string {
  return readEnv("R2_BUCKET_NAME");
}

/**
 * Public base URL (no trailing slash) under which uploaded objects are served,
 * e.g. "https://pub-xxxx.r2.dev". Empty string when unset/invalid.
 */
export function getR2PublicUrl(): string {
  const raw = readEnv("R2_PUBLIC_URL").replace(/\/+$/, "");
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    return parsed.origin + parsed.pathname.replace(/\/+$/, "");
  } catch {
    return "";
  }
}

/**
 * Safe check that Cloudflare R2 storage is fully configured.
 * Requires all five env vars to be present. Never exposes secret values.
 */
export function isR2Configured(): boolean {
  return Boolean(
    getR2AccountId() &&
      getR2AccessKeyId() &&
      getR2SecretAccessKey() &&
      getR2BucketName() &&
      getR2PublicUrl()
  );
}

/**
 * Extract the object key from a public R2 URL. Returns "" when the URL does
 * not belong to the configured public base.
 */
export function getR2KeyFromUrl(url: string): string {
  const base = getR2PublicUrl();
  if (!base || !url || !url.startsWith(base)) return "";
  const key = url.slice(base.length).replace(/^\/+/, "");
  return key;
}

/**
 * Build the public URL for an object key under the configured base.
 */
export function buildR2PublicUrl(key: string): string {
  const base = getR2PublicUrl();
  return base ? `${base}/${key.replace(/^\/+/, "")}` : "";
}

/**
 * Lazily construct an S3 client pointed at Cloudflare R2. Env is read at call
 * time (not module-eval time) so runtime-injected vars are picked up.
 */
async function getR2Client() {
  const { S3Client } = await import("@aws-sdk/client-s3");
  return new S3Client({
    region: "auto",
    endpoint: `https://${getR2AccountId()}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: getR2AccessKeyId(),
      secretAccessKey: getR2SecretAccessKey(),
    },
  });
}

/**
 * Upload an object to R2 and return its public URL.
 * @param key object key, e.g. "uploads/2026/10/photo.webp"
 * @param body file bytes
 * @param contentType MIME type stored with the object
 */
export async function putR2Object(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<{ url: string }> {
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  const client = await getR2Client();
  const bucket = getR2BucketName();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      // Long-lived immutable cache: keys are unique per upload (timestamp+random),
      // so objects are never overwritten in place.
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return { url: buildR2PublicUrl(key) };
}

/**
 * Delete an object from R2. Throws on failure; callers decide whether to
 * swallow errors (media deletion ignores remote errors, mirroring Blob).
 */
export async function deleteR2Object(key: string): Promise<void> {
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  const client = await getR2Client();
  const bucket = getR2BucketName();

  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
