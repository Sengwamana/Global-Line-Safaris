import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware: first line of defense for admin route protection.
 * Checks for Auth.js session cookie presence.
 * Defense-in-depth: the (protected)/layout.tsx also verifies the session server-side.
 *
 * Also enforces the production Content-Security-Policy with a per-request nonce:
 * - Inlines `script-src 'self'` and drops 'unsafe-inline'/'unsafe-eval'.
 * - The nonce is propagated to Next.js rendering via the `x-nonce` request header
 *   so Next's own inline scripts and next/font styles receive it.
 * - Development keeps a permissive policy (fast refresh needs it); production is strict.
 */

/** Generate a CSP nonce (Web Crypto, available on Node and Edge runtimes). */
function makeNonce(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function buildCsp(nonce: string): string {
  const isProd = process.env.NODE_ENV !== "development";

  // Development keeps 'unsafe-inline'/'unsafe-eval' for Fast Refresh to work.
  const scriptSrc = isProd
    ? `'self' 'nonce-${nonce}'`
    : `'self' 'unsafe-inline' 'unsafe-eval'`;
  const styleSrc = isProd ? `'self' 'unsafe-inline'` : `'self' 'unsafe-inline'`;

  // Analytics (GA4) is opt-in only: when a measurement id is configured at build
  // time the CSP is widened for Google's script/collect hosts; otherwise the
  // policy stays strict and no third-party scripts can load.
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gaScriptSrc = gaId
    ? " https://www.googletagmanager.com https://www.google-analytics.com"
    : "";
  const gaConnectSrc = gaId
    ? " https://www.google-analytics.com https://analytics.google.com"
    : "";
  const gaImgSrc = gaId ? " https://www.google-analytics.com" : "";

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}${gaScriptSrc}`,
    `style-src ${styleSrc}`,
    "img-src 'self' data: blob: https://*.blob.vercel-storage.com" + gaImgSrc,
    "font-src 'self' data:",
    "connect-src 'self' https://*.blob.vercel-storage.com" + gaConnectSrc,
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Auth.js v5 session cookie presence check
  const hasSession =
    req.cookies.has("__Secure-authjs.session-token") ||
    req.cookies.has("authjs.session-token");

  // Public admin-only-adjacent pages that must be reachable WITHOUT a session.
  const isPublicAdminPath =
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password";

  // ─── Protect admin pages ────────────────────────────────────────
  // /admin/* (except public auth pages) requires a session cookie
  if (pathname.startsWith("/admin") && !isPublicAdminPath && !hasSession) {
    const loginUrl = new URL("/admin/login", req.url);
    // Pass the original path so login can redirect back (validated server-side)
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Protect admin API routes ───────────────────────────────────
  if (pathname.startsWith("/api/admin") && !hasSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ─── Redirect logged-in users away from login page ─────────────
  if (pathname === "/admin/login" && hasSession) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // ─── CSP with a per-request nonce (next.config no longer sets CSP) ──
  const nonce = makeNonce();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", buildCsp(nonce));

  // ─── Add cache-control headers to admin pages ───────────────────
  // Prevent CDN/edge caching of admin content
  if (pathname.startsWith("/admin")) {
    response.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate"
    );
  }
  return response;
}

export const config = {
  // Run everywhere EXCEPT Next internals (static assets, image optimizer, icons).
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};