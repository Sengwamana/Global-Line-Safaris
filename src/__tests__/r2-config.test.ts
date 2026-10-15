import { describe, it, expect, afterEach } from "vitest";
import {
  isR2Configured,
  getR2KeyFromUrl,
  buildR2PublicUrl,
  getR2PublicUrl,
} from "@/lib/uploads/r2";
import { isBlobConfigured, getStorageConfigStatus } from "@/lib/uploads/config";

const R2_VARS = {
  R2_ACCOUNT_ID: "acct123",
  R2_ACCESS_KEY_ID: "access123",
  R2_SECRET_ACCESS_KEY: "secret123",
  R2_BUCKET_NAME: "my-bucket",
  R2_PUBLIC_URL: "https://pub-abcd1234.r2.dev",
} as const;

const ALL_VARS = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_PUBLIC_URL", "BLOB_READ_WRITE_TOKEN"];

function setR2Env(values: Partial<Record<keyof typeof R2_VARS, string | undefined>>) {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function clearAll() {
  for (const key of ALL_VARS) delete process.env[key];
}

afterEach(clearAll);

describe("R2 config validation", () => {
  it("reports not configured when all vars are unset", () => {
    clearAll();
    expect(isR2Configured()).toBe(false);
  });

  it("reports not configured when vars are partially set", () => {
    setR2Env({ R2_ACCOUNT_ID: R2_VARS.R2_ACCOUNT_ID, R2_PUBLIC_URL: R2_VARS.R2_PUBLIC_URL });
    expect(isR2Configured()).toBe(false);
  });

  it("reports not configured when a value is empty or whitespace", () => {
    setR2Env({ ...R2_VARS, R2_BUCKET_NAME: "   " });
    expect(isR2Configured()).toBe(false);
  });

  it("reports configured when all five vars are present", () => {
    setR2Env(R2_VARS);
    expect(isR2Configured()).toBe(true);
  });

  it("trims whitespace from R2_PUBLIC_URL", () => {
    setR2Env({ ...R2_VARS, R2_PUBLIC_URL: `  ${R2_VARS.R2_PUBLIC_URL}  ` });
    expect(getR2PublicUrl()).toBe(R2_VARS.R2_PUBLIC_URL);
    expect(isR2Configured()).toBe(true);
  });
});

describe("R2 URL helpers", () => {
  it("builds public URLs from a key", () => {
    setR2Env(R2_VARS);
    expect(buildR2PublicUrl("uploads/2026/10/photo.webp")).toBe(
      "https://pub-abcd1234.r2.dev/uploads/2026/10/photo.webp"
    );
  });

  it("extracts the object key from a public URL", () => {
    setR2Env(R2_VARS);
    expect(getR2KeyFromUrl("https://pub-abcd1234.r2.dev/uploads/2026/10/photo.webp")).toBe(
      "uploads/2026/10/photo.webp"
    );
  });

  it("returns an empty key for foreign URLs", () => {
    setR2Env(R2_VARS);
    expect(getR2KeyFromUrl("https://example.com/uploads/x.webp")).toBe("");
    expect(getR2KeyFromUrl("")).toBe("");
  });
});

describe("storage backend priority", () => {
  it("falls back to local when neither Blob nor R2 is configured", () => {
    clearAll();
    expect(getStorageConfigStatus()).toEqual({ configured: false, backend: "local" });
  });

  it("uses R2 when only R2 is configured", () => {
    clearAll();
    setR2Env(R2_VARS);
    expect(isBlobConfigured()).toBe(false);
    expect(getStorageConfigStatus()).toEqual({ configured: true, backend: "r2" });
  });

  it("prefers Blob over R2 when both are configured", () => {
    clearAll();
    setR2Env(R2_VARS);
    process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_abcd1234_foobar";
    expect(getStorageConfigStatus()).toEqual({ configured: true, backend: "blob" });
  });

  it("never surfaces secret values in the status object", () => {
    clearAll();
    setR2Env(R2_VARS);
    const status = getStorageConfigStatus();
    const serialized = JSON.stringify(status);
    expect(serialized).not.toContain(R2_VARS.R2_SECRET_ACCESS_KEY);
    expect(serialized).not.toContain(R2_VARS.R2_ACCESS_KEY_ID);
  });
});
