# Global Line Safaris — Deployment

Two production paths are supported:

- **A. Vercel + Neon** (primary, recommended) — serverless hosting + managed Postgres.
- **B. Self-hosted `next start` + local Postgres (systemd)** — the current setup on this
  machine (`deploy/global-line-safaris-cms.service`).

The code is already configured for both. Uploads use **Vercel Blob** when
`BLOB_READ_WRITE_TOKEN` is set, otherwise **Cloudflare R2** when the `R2_*`
variables are set, otherwise fall back to the local filesystem.
Rate limiting uses **Upstash Redis** when configured, otherwise an in-memory fallback.

---

## A. Vercel + Neon (primary)

### 1. Create the Neon database

1. Create a project at [neon.tech](https://neon.tech) (Postgres 16).
2. Copy the **pooled** connection string → `DATABASE_URL` and the **direct**
   connection string → `DIRECT_URL` from the Neon "Connection Details" panel.
   - Both need `?sslmode=require`; the pooled one also wants `&pgbouncer=true`.

### 2. Apply the schema to Neon (do NOT use `db push` in prod)

Migrations are committed under `prisma/migrations`. Apply them once:

```bash
# point Prisma at Neon for this one command
DATABASE_URL="<pooled-url>" DIRECT_URL="<direct-url>" npx prisma migrate deploy
```

Then seed the initial admin user + content:

```bash
DATABASE_URL="<pooled-url>" DIRECT_URL="<direct-url>" npm run db:seed
```

### 3. Push the repo to GitHub, then import into Vercel

1. `git remote add origin <repo-url>` and push.
2. In Vercel: **Add New Project → Import** the repo. Framework = Next.js (auto).
3. Build settings are inferred; `next build` is used, and the new
   `postinstall: "prisma generate"` runs automatically during install.

### 4. Set environment variables in Vercel

Copy values from `deploy/.env.vercel.example` into **Settings → Environment Variables**:
`NEXT_PUBLIC_APP_URL`, `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL`,
`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `BLOB_READ_WRITE_TOKEN` (from Vercel Storage → Blob),
`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, plus SMTP vars.

Then add Blob storage and Upstash Redis via **Storage** tabs (or use your own instances).

#### Cloudflare R2 (free alternative to Vercel Blob)

Vercel Blob's Hobby tier is limited to 1 GB and non-commercial use only. For a
production tourism site, **Cloudflare R2** is the recommended free backend: 10 GB
storage, zero egress fees, and commercial use allowed. Set these env vars (Blob,
if also set, still takes priority):

| Var | Notes |
|---|---|
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_BUCKET_NAME` | e.g. `global-line-safaris-media` |
| `R2_PUBLIC_URL` | public base URL, e.g. `https://pub-xxxx.r2.dev` or a custom domain |

Setup: create a bucket + API token in the Cloudflare dashboard, enable **public
access** on the bucket, and set `R2_PUBLIC_URL` to its public base URL. Because
`next/image` remote patterns and the CSP are generated at build time, redeploy
after adding/changing `R2_PUBLIC_URL`. A custom domain (rather than an r2.dev URL)
is best for production so the CSP/remote-pattern host is stable.

Confirm the active backend at runtime via `GET /api/admin/media/storage-status`
(ADMIN role) — `backend` is `blob`, `r2`, or `local`.

### 5. Deploy

Deploy (a production deployment triggers automatically on push to the default branch).
Verify:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://<your-app>.vercel.app/
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://<your-app>.vercel.app/api/contact \
  -H "Content-Type: application/json" -H "Origin: https://<your-app>.vercel.app" \
  -d '{"name":"T","email":"t@example.com","subject":"s","message":"m"}'
# expect 201
```

### Vercel notes / caveats

- **Uploads** now go to Vercel Blob (no local disk). The media library, image
  remote patterns, and CSP (`img-src`/`connect-src`) already allow
  `**.blob.vercel-storage.com`.
- **Rate limiting** uses Upstash globally; if Upstash vars are absent it degrades to
  per-instance in-memory (still works, just not global).
- **Prisma** is a proper global singleton; schema already has `DIRECT_URL`; no
  Edge-forced routes; logging is console-only (view in Vercel logs).

---

## B. Self-hosted (systemd) — current local production

Points to the local Postgres (`localhost:5433`). See `deploy/global-line-safaris-cms.service`.

```bash
# build with the correct public URL (inlined at build time)
NEXT_PUBLIC_APP_URL=http://localhost:3100 NEXTAUTH_URL=http://localhost:3100 npm run build

# stop any stale server on 3100, then install+start the service (as root)
sudo cp deploy/global-line-safaris-cms.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now global-line-safaris-cms
```

Port **3100** is intentional — 3000/3002 belong to adjacent projects on this machine.
The systemd unit (`deploy/global-line-safaris-cms.service`) already pins port 3100 and the
Node binary; only `WorkingDirectory` must point at the real app path.

If the site moves behind a real domain, change `NEXT_PUBLIC_APP_URL`/`NEXTAUTH_URL`
(rebuild since the app URL is inlined) and have the reverse proxy → 3100.

Management: `sudo systemctl status/restart global-line-safaris-cms`, `journalctl -u global-line-safaris-cms -f`.

Required env before first start (values from `deploy/.env.production`, installed as
`/etc/global-line-safaris-cms/env` root-only): `NEXTAUTH_SECRET` (REAL random value — never
commit one), `DATABASE_URL`/`DIRECT_URL`, and email credentials (Resend or SMTP).

---

## Verification before deploy

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 errors (pre-existing warnings only)
npm test            # 63 passed
npm run build       # succeeds (needs the local Postgres container running)
```

## Launch checklist (self-hosted, port 3100)

After the service is up, smoke-test the money paths:

```bash
BASE=http://localhost:3100

# Static + deep-link redirect + session choreography
curl -s -o /dev/null -w "home %{http_code}\n" $BASE/
curl -s -o /dev/null -w "admin deep-link: %{http_code}\n" -L $BASE/admin/dashboard
curl -s -o /dev/null -w "unauth api: %{http_code}\n" $BASE/api/admin/stats

# CSP present with nonce, no unsafe-inline in production
curl -sI $BASE/ | rg -i "content-security-policy" | rg -v "unsafe-inline|unsafe-eval"

# Public form: 201, then duplicate with same idempotency key -> 200 duplicate
curl -s -o /dev/null -w "contact: %{http_code}\n" -X POST $BASE/api/contact \
  -H "Content-Type: application/json" -H "Origin: http://localhost:3100" \
  -d '{"name":"T","email":"t@example.com","subject":"s","message":"m","idempotencyKey":"test-key-123abc-456def"}'
curl -s -X POST $BASE/api/contact -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3100" \
  -d '{"name":"T","email":"t@example.com","subject":"s","message":"m","idempotencyKey":"test-key-123abc-456def"}' \
  | rg -o '"duplicate":true'    # expect match

# Newsletter subscribe (200/201) and unsubscribe (200); then /unsubscribe page
curl -s -o /dev/null -w "nl subscribe: %{http_code}\n" -X POST $BASE/api/newsletter \
  -H "Content-Type: application/json" -H "Origin: http://localhost:3100" \
  -d '{"email":"reader@example.com"}'
curl -s -o /dev/null -w "nl unsubscribe: %{http_code}\n" -X POST $BASE/api/newsletter/unsubscribe \
  -H "Content-Type: application/json" -H "Origin: http://localhost:3100" \
  -d '{"email":"reader@example.com"}'
curl -s -o /dev/null -w "unsubscribe page: %{http_code}\n" $BASE/unsubscribe

# Admin login round-trip (create the admin with a REAL password first, see seed)
curl -s -o /dev/null -w "login page: %{http_code}\n" $BASE/admin/login
```

### Analytics (optional, GA4)

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` (e.g. `G-XXXXXXXXXX` **at build time** — it is
inlined). When set, the root layout loads the GA script via `next/script` and the
production CSP automatically adds `googletagmanager.com` / `google-analytics.com`
to `script-src`/`connect-src`. When unset, analytics is completely absent and the
CSP stays strict. No other change needed.

### Newsletter / unsubscribe

The footer now has a subscribe form (POST `/api/newsletter`); the confirmation
email includes an unsubscribe link to `/unsubscribe`, which POSTs to
`/api/newsletter/unsubscribe` (marks the subscriber inactive, kept for admin stats).
Subscribe is already idempotent via the unique email; unsubscribing a non-subscriber
still returns success (no enumeration).

---

## Environment variable reference

| Var | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | client/build | real URL, inlined at build |
| `DATABASE_URL` | server | Neon **pooled** |
| `DIRECT_URL` | server | Neon **direct** (Prisma CLI/migrations) |
| `AUTH_SECRET`/`NEXTAUTH_SECRET` | server | must match; random 64-char |
| `AUTH_URL`/`NEXTAUTH_URL` | server | real URL |
| `BLOB_READ_WRITE_TOKEN` | server | Vercel Blob (priority 1) |
| `R2_ACCOUNT_ID`/`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/`R2_BUCKET_NAME`/`R2_PUBLIC_URL` | server | Cloudflare R2 (priority 2; free 10 GB, zero egress) |
| `UPSTASH_REDIS_REST_URL`/`_TOKEN` | server | Upstash Redis |
| `SMTP_*`, `EMAIL_FROM` | server | for real email delivery |
| `ADMIN_EMAIL`/`ADMIN_PASSWORD` | seed | bootstrap admin |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | client/build | optional GA4; enables analytics + opens CSP |
| `LOG_LEVEL` | server | default `info` |
