# Public runtime (Milestone 19)

**NO REAL CLIENT LAUNCH YET.** This document describes the public
Next.js/OpenNext build target. The published-Website path is proven on
Workers Free (Milestone 25). The public Worker is not currently
deployed. Do not create R2, Custom Domains, or DNS from this file.

Production infrastructure planning:
[`docs/production-infrastructure.md`](production-infrastructure.md).
Static publication runtime (Milestone 22):
[`docs/static-publication.md`](static-publication.md).

## Why this exists

Milestone 17 approved Option C: public Client websites on Cloudflare,
private admin remaining local. Milestone 18 added hostname → published
Website mapping. Milestone 19 adds a **separate public Next.js / OpenNext
entry** so a future production artifact can ship without the admin
application.

The existing admin application is unchanged:

- `npm run dev` → [http://localhost:3002](http://localhost:3002)
- login, Dashboard, Clients, editors, Media Library, histories, Publish,
  Hostnames, and admin Server Actions remain in that app

## Architecture

One repository. Two Next.js compilations.

**Shared (imported by both apps):**

- template renderers (`src/components/website-templates`, `src/lib/templates`)
  — used by Client Review and admin Publish generation, **not** by the
  normal published hostname handler
- Website content parsers
- static publication serving (`serve-public-html.ts`)
- hostname resolver (`website_domains`)
- public media authorization (`src/lib/website-media/authorize-public.ts`)
- Client Review token/feedback/approval (`src/lib/website-review/public-actions.ts`)
- D1 (`getDb()`) and media storage adapters (filesystem locally, R2 in workerd)

**Admin application (existing):** `src/app`, `src/middleware.ts`,
`wrangler.jsonc`, `open-next.config.ts`

**Public application:** `public-runtime/`

The public app has only:

- `/host/[[...slug]]` Route Handler (stored publication HTML, no
  `renderTemplate()`)
- `/review/[token]` (dynamic draft review; still uses `renderTemplate()`)
- `/media/[mediaId]` GET
- `/publication-runtime.css`
- bundled template assets under `/templates/{id}/...`
- public 404/error pages

It does **not** include login, Dashboard, Clients, Website editor,
Templates admin, Settings, Support Requests, Version History,
Publication History, Media Library upload, Publish, hostname
administration, PBKDF2, or admin Server Actions.

Admin routes are not merely redirected. They are absent from the public
Next.js compile, so they are not functional endpoints in the public
Worker.

## Public routes

| Request | Behavior |
|---|---|
| `Host: cedar.localhost` `/` | Cedar **active** publication HTML |
| `Host: copper.localhost` `/` | Copper **active** publication HTML |
| `Host: linden.localhost` `/` | Linden **active** publication HTML |
| Unknown or malformed hostname `/` | Public 404, fail closed |
| `/review/{token}` | Saved-draft Client Review (valid token) or 404 |
| `/media/{id}` | Same Milestone 18 authorization against the **active** publication (or review draft), no public R2 URL. Production-public without `MEDIA` returns 404. |
| `/publication-runtime.css` | Shared generated template stylesheet |
| `/templates/{service\|restaurant\|salon}-modern-01/*` | Bundled public assets |
| `/login`, `/clients`, `/websites`, `/templates` admin, `/settings`, `/support-requests`, `/site/...`, `/published/...` | 404 / unavailable (not admin login) |

Middleware never requires an admin cookie. It never runs PBKDF2.

## Bindings

Same local placeholders as the admin wrangler config. Future production
still uses **one shared D1** and **one shared R2**.

| Binding | Purpose |
|---|---|
| `DB` | `website_domains`, Website identity/status, publications, media metadata, review sessions/feedback |
| `MEDIA` | Read Client website media |

Public rendering does not need media upload. The storage interface still
has `write` for adapter compatibility; no public route invokes it.

`public-runtime/wrangler.jsonc` sets `workers_dev: false` and
`"remote": false`. Do not deploy it.

## Secrets

The public runtime must boot **without**:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `AUTH_SESSION_SECRET`

Review media authorization uses the HttpOnly `pxws_review_media` cookie
(the review token, `Path=/media`) and a `/review/{token}` Referer
fallback. That does **not** require HMAC or `AUTH_SESSION_SECRET`.

`REVIEW_MEDIA_SECRET` is **not** introduced in this milestone because no
public review/media path currently needs a cryptographic secret beyond
the unguessable review token.

Do not put secrets in git, `wrangler.jsonc` `vars`, or client bundles.

## Commands

Local public Next.js (port **3003**; do not use 3000):

```bash
npm run dev:public
```

This shares the admin app's local D1 persist directory
(`.wrangler/state/v3`) via `initOpenNextCloudflareForDev`. It does not
create a second database.

Public Next.js compile (not a Worker):

```bash
npm run build:public
```

Public Cloudflare-target Worker (does **not** deploy):

```bash
npm run build:cloudflare:public
```

Artifact path: `public-runtime/.open-next/` (gitignored).

Local Workers preview of that artifact (port 3003, local persist only):

```bash
npm run preview:cloudflare:public
```

Admin remains:

```bash
npm run dev                 # localhost:3002
npm run build
npm run build:cloudflare    # combined/admin-capable artifact in .open-next/
```

There is intentionally **no** deploy script.

## Why PBKDF2 is absent

Admin password verification (`src/lib/auth/password.ts`) is only imported
by the admin login/session graph. The public app never mounts `/login`,
never imports `getVerifiedAdminSession` / `getAdminAuthConfig`, and uses
`authorize-public.ts` instead of the admin media allow-by-session path.

Workers Free CPU for PBKDF2 is therefore an **admin-host** question, not
a public Client-site question. The **published Website** path (Host →
production D1 → stored `public_html`) is **PASS** on Workers Free
(Milestone 25: n=60, p50 4 ms, max 9 ms, 0/60 > 10 ms). Client Review
CPU is **not approved** (one invalid-token request recorded 72 ms).
Local workerd wall-clock is not production CPU accounting.

## Future production deployment plan

Follow [`docs/production-infrastructure.md`](production-infrastructure.md)
and [`docs/production-public.md`](production-public.md). A later approved
milestone would still need to:

1. Re-check current Cloudflare pricing and Workers Free CPU
2. Validate Client Review production CPU before first Client use
3. Redeploy `projectx-websites-public` from
   `public-runtime/wrangler.production.jsonc` when launch is approved
4. Provision private R2 only if checkout risk is accepted
5. Configure Custom Domains / routes (not `workers.dev` for Client URLs)
6. Set production secrets **without** requiring admin credentials on the
   public Worker (none required today)
7. Do not copy local Cedar/Copper/Linden data into production

Until then:

- Remote Worker: NONE
- Remote D1: `projectx-websites-production` (empty business tables)
- Remote R2: NONE
- Domains/DNS: NONE
- Billing: NONE
- Cost: **$0**
