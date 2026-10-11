// Simple CSRF Origin/Referer validator for mutating API routes
export function validateOrigin(req: Request): { ok: boolean; reason?: string } {
  const allowedOrigins = new Set<string>();

  // Add NEXTAUTH_URL
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl) {
    try {
      allowedOrigins.add(new URL(nextAuthUrl).origin);
    } catch { /* ignore invalid URL */ }
  }

  // Add NEXT_PUBLIC_APP_URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      allowedOrigins.add(new URL(appUrl).origin);
    } catch { /* ignore invalid URL */ }
  }

  // Add Vercel deployment URLs (production + preview deployments), so the app
  // works even when NEXTAUTH_URL / NEXT_PUBLIC_APP_URL are not (yet) pointed at
  // the deployed domain.
  const vercelHosts = [
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL,
  ];
  for (const host of vercelHosts) {
    if (!host) continue;
    try {
      allowedOrigins.add(new URL(`https://${host}`).origin);
    } catch { /* ignore invalid value */ }
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  // The origin the request was actually sent to (behind Vercel's proxy the
  // real host lives in x-forwarded-host). A same-origin request must match
  // this host — that is the actual CSRF guarantee we rely on.
  const ownHost = req.headers.get("x-forwarded-host") || req.headers.get("host");

  // In development, also allow localhost on any port
  const isDev = process.env.NODE_ENV !== "production";

  const isAllowed = (url: URL): boolean => {
    if (allowedOrigins.has(url.origin)) return true;
    if (isDev && url.hostname === "localhost") return true;
    if (ownHost && url.host === ownHost) return true;
    return false;
  };

  if (origin) {
    try {
      const o = new URL(origin);
      if (isAllowed(o)) return { ok: true };
      return { ok: false, reason: `Origin ${o.origin} not allowed` };
    } catch {
      return { ok: false, reason: "Invalid Origin header" };
    }
  }

  if (referer) {
    try {
      const r = new URL(referer);
      if (isAllowed(r)) return { ok: true };
      return { ok: false, reason: `Referer ${r.origin} not allowed` };
    } catch {
      return { ok: false, reason: "Invalid Referer header" };
    }
  }

  return { ok: false, reason: "No Origin or Referer header" };
}
