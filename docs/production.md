# Production architecture and deployment readiness

This document describes the intended future production architecture for
Project X Website Service after Milestone 15.

**Milestone 15 is production readiness only. It does not deploy anything.**

## Current M15 state

- No remote Cloudflare Worker
- No remote D1
- No remote R2
- No Cloudflare Pages
- No domains or DNS changes
- No paid services enabled
- Local development only
- Current cost: $0

Do not expose this internal admin application publicly with real Client data
until authentication and access control are implemented.

## Target architecture

### Local development (`npm run dev`)

- Next.js on Node.js at [http://localhost:3002](http://localhost:3002)
- Database: local Wrangler D1 emulator (`DB` binding, `--local` only)
- Media: local filesystem under `storage/website-media/`
- Website content continues to reference `/media/{id}` only

### Future production

- Next.js on a Cloudflare Workers-compatible runtime via `@opennextjs/cloudflare`
- Database: bound Cloudflare D1 (`DB`)
- Client media: bound Cloudflare R2 (`MEDIA`)
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

```bash
npm run build:cloudflare
```

This builds for the Workers runtime. It does not deploy.

Local production-runtime preview (after the Cloudflare-target build):

```bash
npm run preview:cloudflare
```

This serves the built Worker locally on port 3002. It does not deploy.

There is intentionally **no** `deploy` npm script. Do not run
`opennextjs-cloudflare deploy`, `wrangler deploy`, or any `--remote`
command as part of normal validation.

Build output lives in `.open-next/` and is gitignored.

## Future deployment requirements

A later deployment milestone must explicitly:

1. Review current Cloudflare plan/pricing, included free usage, overage
   behavior, usage notifications/limits, and expected Client count, traffic,
   and media storage
2. Get explicit cost/risk approval
3. Create the production Worker/application
4. Create/configure production D1 (the current `database_id` in
   `wrangler.jsonc` is a **local placeholder**, not a real database)
5. Apply migrations `0001`–`0008` remotely
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
- [ ] **admin auth completed**
- [ ] production smoke test
- [ ] domain strategy approved

### Authentication warning

**DO NOT expose the internal admin application publicly with real Client data
until authentication/access control is implemented.**

Authentication is not implemented in Milestone 15 and must not be added here.

## Commands that must not be used for M15

- `wrangler deploy`
- `wrangler d1 ... --remote`
- `wrangler r2 ...` against a remote bucket
- `opennextjs-cloudflare deploy`
- `opennextjs-cloudflare upload`
- `npx @opennextjs/cloudflare migrate` (can create a remote R2 cache bucket)
- Cloudflare dashboard resource creation, domains, DNS, or billing changes
