import type { NextConfig } from "next";

// Cloudflare R2 public assets are served from either an r2.dev subdomain
// (pub-*.r2.dev) or a custom domain. Remote patterns are evaluated at build
// time, so a custom R2 domain must be present in R2_PUBLIC_URL at build time
// (Vercel injects project env vars during the build).
function r2RemotePatterns(): { protocol: "https"; hostname: string }[] {
  const patterns: { protocol: "https"; hostname: string }[] = [
    { protocol: "https", hostname: "*.r2.dev" },
  ];
  const publicUrl = process.env.R2_PUBLIC_URL?.trim();
  if (publicUrl) {
    try {
      const { hostname } = new URL(publicUrl);
      if (hostname && !hostname.endsWith(".r2.dev")) {
        patterns.push({ protocol: "https", hostname });
      }
    } catch {
      /* ignore malformed R2_PUBLIC_URL */
    }
  }
  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        // Vercel Blob storage (may live on a custom store host)
        hostname: "**.blob.vercel-storage.com",
      },
      ...r2RemotePatterns(),
    ],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
    {
      source: "/api/(.*)",
      headers: [
        { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        { key: "Pragma", value: "no-cache" },
      ],
    },
  ],
};

export default nextConfig;
