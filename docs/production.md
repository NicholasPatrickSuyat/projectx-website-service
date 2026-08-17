# Production architecture and deployment readiness

This document describes the intended future production architecture for
Project X Website Service.

**No milestone through Milestone 20 deploys anything.** Do not create a
remote Worker, D1, R2, domain, or paid resource from this repository.

Production deployment planning (Milestone 20):
[`docs/production-infrastructure.md`](production-infrastructure.md).
Public vs private split details: [`docs/public-runtime.md`](public-runtime.md).
Hosting/cost research: [`docs/deployment-decision.md`](deployment-decision.md).

## Current state

- No remote Cloudflare Worker
- No remote D1
- No remote R2
- No Cloudflare Pages
- No domains or DNS changes
- No paid services enabled
- Local development only
- Current cost: $0
- Admin application: `npm run dev` on port 3002
- Public runtime target: `npm run dev:public` on port 3003 (Milestone 19)

Do not expose this internal admin application publicly with real Client data
until a later deployment milestone is explicitly approved. Admin authentication
is implemented in Milestone 16; it is not a public launch.

Milestone 17 production hosting, cost, and CPU-gate research lives in
[`docs/deployment-decision.md`](deployment-decision.md). Do not create remote
Worker, D1, R2, domain, or paid resources until that checklist is approved.

## Target architecture

### Local development

Admin (`npm run dev`):

- Next.js on Node.js at [http://localhost:3002](http://localhost:3002)
- Full internal application, including login/PBKDF2
- Database: local Wrangler D1 emulator (`DB` binding, `--local` only)
- Media: local filesystem under `storage/website-media/`
- Website content continues to reference `/media/{id}` only

Public runtime (`npm run dev:public`):

- Separate Next.js app in `public-runtime/` at [http://localhost:3003](http://localhost:3003)
- Hostname published sites, Client Review, `/media/{id}`, template assets
- Same local D1 persist and filesystem/R2-emulator media
- Does not require admin credentials and does not run PBKDF2

### Future production

- **Public:** Next.js on Cloudflare Workers via `@opennextjs/cloudflare`
  from `npm run build:cloudflare:public` only
- **Admin:** remains local/private until a later host is approved
- Database: one shared Cloudflare D1 (`DB`)
- Client media: one shared Cloudflare R2 (`MEDIA`)
- Same `/media/{id}` content model; the application never stores raw R2 URLs
  in Website, Version, or Publication JSON

The application/domain layer uses centralized adapters:

- `getDb()` / `getDatabase()` → D1 binding
- `getWebsiteMediaStorage()` / `getMediaStorage()` → filesystem locally, R2
  in the Cloudflare Workers runtime

Repositories, Server Actions, and routes must not look up `getPlatformProxy()`,
`process.env.NODE_ENV`, or filesystem paths themselves.

## Runtime safety

A production Worker must never silently fall back to local filesystem storage.

- Local `next dev`: filesystem media is allowed
- Cloudflare Workers runtime (including local `npm run preview:cloudflare`):
  R2 binding `MEDIA` is required
- Missing `DB` or `MEDIA` in the Workers runtime: clear server error, no
  silent fallback

Local Wrangler / OpenNext preview uses emulated bindings only. It does not
create remote D1 or R2 resources. Preview media state is isolated from the
`storage/` filesystem used by `npm run dev`. To exercise `/media/{id}` in
preview, copy bytes into the local R2 emulator (`wrangler r2 object put
... --local`). Do not use `--remote`.

OpenNext currently warns that it is not fully compatible with Windows and
recommends WSL for optimal production-target runtime behavior. Milestone 15
validated the Cloudflare-target build and local Workers preview on Windows;
future deployment should re-test on the intended production/CI environment.

## Cloudflare production-target build

Combined/admin-capable validation artifact (does not deploy):

```bash
npm run build:cloudflare
```

Public-only production artifact (does not deploy):

```bash
npm run build:cloudflare:public
```

Local Workers preview:

```bash
npm run preview:cloudflare          # combined, port 3002
npm run preview:cloudflare:public   # public-only, port 3003
```

These serve built Workers locally. They do not deploy.

There is intentionally **no** `deploy` npm script. Do not run
`opennextjs-cloudflare deploy`, `wrangler deploy`, or any `--remote`
command as part of normal validation.

Build output lives in `.open-next/` (combined) and
`public-runtime/.open-next/` (public). Both are gitignored.

## Future deployment requirements

A later deployment milestone must explicitly:

1. Review current Cloudflare plan/pricing, included free usage, overage
   behavior, usage notifications/limits, and expected Client count, traffic,
   and media storage
2. Get explicit cost/risk approval
3. Create the production Worker/application
4. Create/configure production D1 (the current `database_id` in
   `wrangler.jsonc` is a **local placeholder**, not a real database)
5. Apply migrations `0001`–`0010` remotely
6. Create/configure production R2 for Client media (the current
   `bucket_name` is an **unprovisioned local identifier**)
7. Bind `DB` and `MEDIA`
8. Copy/move required production media into R2 using the object key
   `{websiteId}/{storedFilename}`
9. Configure production environment values (no secrets in git)
10. Decide whether to add OpenNext incremental-cache R2 / Images (both can
    have cost implications; they are not enabled in M15)
11. Smoke-test the production Worker privately
12. Implement admin authentication/access control **before** public exposure
13. Only then consider a domain strategy

## Cost safety

Costs are **not** permanently fixed.

Before any real production deployment, Project X must review:

- Current Cloudflare plan and pricing
- Included free usage
- Whether payment/billing setup is required
- Overage behavior
- Available usage notifications and limits
- Expected Client count, traffic, and media storage
- Worker size limits (Workers Free compressed size is smaller than Paid)

Do not enable billing, automatically upgrade a plan, or purchase a paid
service from this repository.

Admin authentication uses PBKDF2-HMAC-SHA256 at 600,000 iterations. Cloudflare Workers Free currently has a 10 ms CPU-time limit per HTTP request. Local workerd timing cannot establish production CPU accounting for Web Crypto PBKDF2. Free-plan compatibility is therefore considered INCONCLUSIVE and must be verified/resolved before production deployment. Do not lower the password work factor or enable a paid Cloudflare plan without explicit approval.

This is a later-deployment decision, not a user-facing runtime warning.

## Production-readiness checklist

Complete only in a later deployment milestone after explicit approval.

- [ ] Cloudflare account reviewed
- [ ] Current pricing reviewed
- [ ] Cost/risk explicitly approved
- [ ] Worker resource created
- [ ] production D1 created
- [ ] migrations applied remotely
- [ ] R2 created/enabled
- [ ] bindings configured
- [ ] secrets configured
- [ ] **admin auth completed** (implemented locally in Milestone 16; production secrets are not created yet)
- [ ] **Workers Free CPU compatibility for PBKDF2-600k resolved** (currently INCONCLUSIVE; do not enable a paid plan or weaken hashing without explicit approval)
- [ ] production smoke test
- [ ] domain strategy approved

### Authentication warning

**DO NOT expose the internal admin application publicly with real Client data
until a later deployment milestone is explicitly approved.**

Milestone 16 implements one-admin internal authentication. It does not deploy
the app, create Cloudflare secrets, or make Client Review require an admin
account.

## Admin authentication

V1 protects the internal Project X administration UI for **one operator**.
This is not a customer/SaaS account system.

### Architecture

- Username + password from environment configuration
- Password stored as PBKDF2-HMAC-SHA256
  (`pbkdf2-sha256$iterations$salt$hash`, new hashes use 600,000 iterations;
  verification uses the iteration count encoded in the hash)
- Signed HttpOnly session cookie (`pxws_admin_session`)
- HMAC-SHA256 over the session payload using `AUTH_SESSION_SECRET`
- 12-hour session expiration
- Logout clears the cookie and the D1 session row
- SameSite=Lax; Secure on HTTPS, not on localhost HTTP
- Failed logins are throttled in D1 using an HMAC of the client network
  key (raw IP is not stored). 5 failures in a 15-minute window cause a
  15-minute cooldown. Successful login clears that key's failures.
- Server Actions check the session on the server
- `src/middleware.ts` redirects unauthenticated admin routes (OpenNext does
  not support Next.js 16 `proxy.ts` Node middleware)
- Admin App Router layout also verifies the session

No auth customer-account system is used. Migration `0009_create_admin_session.sql`
adds `admin_auth_session` (current session id for logout revocation) and
`admin_auth_login_throttle` (privacy-minimized login failure state).
Migrations 0001–0008 are unchanged.

### Public / token routes

On the **admin** application (port 3002):

| Route | Access | Why |
|---|---|---|
| `/login` | Public | Admin sign-in |
| `/review/[token]` | Public with review token | Client Review must not require an admin account |
| `/media/[mediaId]` GET | Authorized per hostname/review/admin session | Review, standalone, and published previews render `/media/{id}` |
| `/site/[websiteId]` | Admin session | Local saved-draft preview, not a deployed customer site |
| `/published/[websiteId]` | Admin session | Local published-snapshot preview, not a public domain |

On the **public** runtime (port 3003 / future public Worker), `/login`,
`/site`, `/published`, and other admin paths are **absent** (404). See
[`docs/public-runtime.md`](public-runtime.md).

Protecting `/site` and `/published` does not break Client Review because
review uses `/review/[token]` and `/media/{id}` only. Future public websites
must not be these local preview routes.

Review-token Server Actions (`submitReviewFeedbackAction`,
`approveReviewAction`, `getClientReviewByToken`) stay token-authorized and
must not create an admin session.

### Required configuration

Local `.dev.vars` (gitignored):

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `AUTH_SESSION_SECRET` (at least 32 characters)

Generate a local hash:

```bash
node scripts/hash-admin-password.mjs "<your-local-password>"
```

Future production must set the same names as Cloudflare Worker secrets.
Do not put production values in git, `wrangler.jsonc` vars, or
`.dev.vars.example`. Milestone 16 does **not** create those secrets.

Missing auth configuration fails closed: login is unavailable and no session
is accepted.

The public runtime does not read these values and must not fail to boot
when they are absent.

## Commands that must not be used for M15–M20

- `wrangler deploy`
- `wrangler d1 ... --remote`
- `wrangler r2 ...` against a remote bucket
- `opennextjs-cloudflare deploy`
- `opennextjs-cloudflare upload`
- `npx @opennextjs/cloudflare migrate` (can create a remote R2 cache bucket)
- Cloudflare dashboard resource creation, domains, DNS, or billing changes
