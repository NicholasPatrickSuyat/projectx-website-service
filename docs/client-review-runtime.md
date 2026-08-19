# Client Review runtime (Milestone 26)

**NO REMOTE DEPLOYMENT FROM THIS FILE.** This documents the local Client
Review architecture chosen to fit Workers Free. It does not authorize
enabling Workers Paid, creating R2, applying production migrations,
inserting production rows, or deploying a Worker.

Related:

- [`docs/static-publication.md`](static-publication.md) — approved published path
- [`docs/public-runtime.md`](public-runtime.md)
- [`docs/production-public.md`](production-public.md)

## Why this exists

Milestone 25 approved the **normal published Website** path for Workers
Free (stored `public_html`, n=60, p50 4 ms, max 9 ms, Error 1102=0).

The same Worker still served Client Review as a Next.js **page** that
imported `renderTemplate()` and `ClientReviewControls`. One measured
request:

`GET /review/not-a-valid-token` → cpuTime **72 ms**, wallTime 78 ms,
outcome `ok`.

That token is **malformed** (`REVIEW_TOKEN_PATTERN` is 64 hex). It never
needed draft content or a template. The 72 ms was the review **page
module graph** (all three React templates + client review chrome +
Next metadata/SSR), not a stored-HTML lookup. Official Workers docs
treat SSR as CPU; isolate flexibility can allow an infrequent over-10 ms
event without Error 1102. Do not treat that sample as “just a cold start.”

Workers Paid is **not** required for the chosen fix and must not be
enabled.

## Official Free-plan recheck (2026-08-18)

Sources retrieved 2026-08-18:

- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) (docs updated 2026-07-28)
- [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/) (docs updated 2026-08-11)
- [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) (docs updated 2026-04-21)
- [Error 1102](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1102/)

No material change vs Milestone 25:

| Topic | Workers Free |
|---|---|
| CPU / invocation | 10 ms. Consistent overage → Error 1102 / `exceededCpu` |
| Requests | 100,000/day |
| Worker size | 3 MB gzip |
| Workers Logs | Included; 200,000 events/day; 3-day retention |
| D1 I/O wait | Does **not** count as CPU |
| HTML / JS / SSR | Counts as CPU |
| `limits.cpu_ms` | Paid-only; do not enable Paid to raise Free 10 ms |

## Current product facts (unchanged)

- Token: 32 random bytes, stored as 64 hex. Lookup is exact match on
  `website_review_sessions.token`.
- There is **no expiry column**. “Expired” in operations means the
  token was **regenerated** (old token misses). Status is `OPEN` or
  `APPROVED` only.
- Client Review must show the **current saved draft**
  (`websites.content_json`), not `website_publications.public_html`.
- Save Draft must update Client Review without Publish.
- Media remains token-authorized against the **draft** content
  references. No R2.
- Failures stay generic: “Review unavailable” / invalid or no longer
  active. No Website UUID, Client, or session leakage.
- `noindex, nofollow` on review responses.

## Selected architecture

**Invalid review requests fail before template work. Valid review
requests return stored draft HTML generated at Save Draft (admin/Node),
not React/Next SSR on the Worker.**

| Approach | Decision |
|---|---|
| Early 404 Route Handler for malformed / missing / regenerated tokens | Selected |
| Stored `websites.review_html` generated from the **draft** at Save Draft / create / local backfill | Selected |
| Serve-time token + approve-state substitution (no token baked into D1 HTML) | Selected |
| On-Worker `renderTemplate()` / `renderToStaticMarkup` for review GET | Rejected — Milestone 21 FAIL path |
| Cache API / HTML whose invalidation is unclear | Rejected |
| Reuse `website_publications.public_html` for review | Rejected — that is the immutable published snapshot |
| Workers Paid | Rejected |

### When `review_html` is generated

Admin/Node CPU only:

1. **Create Website** — initial draft HTML
2. **Save Draft** when content actually changes — regenerate from the
   new `content_json`
3. **Local backfill** — fill empty `review_html` (same idea as
   publication HTML backfill)

It becomes stale if draft content changes without regenerating. Save
Draft writes `content_json` and `review_html` together. Empty
`review_html` **fails closed** (generic unavailable), same as empty
`public_html`.

Publish, rollback, and hostname serving do **not** write `review_html`.
Regenerating a review token does **not** rewrite HTML (the token is not
stored in the HTML).

### Serve path

```
GET /review/{token}
  → malformed? generic 404 HTML (no D1, no templates)
  → D1: session token JOIN websites.review_html
  → miss / empty HTML? generic 404
  → substitute token + approve slot + optional notice
  → Response(html) with noindex,nofollow
```

The public review Route Handler must not import `renderTemplate`,
template components, or `ClientReviewControls`.

POST feedback/approve stays token-authorized (`public-actions.ts`) and
redirects back to GET. Approve still does not publish.

### Migration 0012

Additive: `websites.review_html TEXT NOT NULL DEFAULT ''`.

Do **not** add `review_html` to `getWebsiteById` column lists (avoid
loading large HTML on every admin Website read).

Production D1 has **0012 applied**. Local `npm run db:migrate` applies
it to the emulator. The SQL file itself is additive schema only — no
HTML generation or backfill.

## Production CPU (Milestone 26)

Workers Logs `cpuTime` on the temporary `projectx-websites-public`
workers.dev Worker (deleted after the sample). Sequential requests,
controlled sample excluding the cold-isolate event below.

**Old review path:** Next.js page + `renderTemplate()` SSR.

**New review path:** stored `websites.review_html` (saved draft).

| Category | n | p50 | max | >10 ms | Error 1102 |
|---|---:|---:|---:|---:|---:|
| Valid review | 20 | 5 ms | 9 ms | 0 | 0 |
| Well-formed nonexistent | 20 | 4.5 ms | 9 ms | 0 | 0 |
| Revoked / regenerated | 20 | 4 ms | 7 ms | 0 | 0 |
| Malformed warm | 19 | 4 ms | 10 ms | 0 | 0 |

Valid review: p90 6.1 ms, p99 8.6 ms, HTTP 200 20/20, `exceededCpu` 0,
exceptions 0.

Milestone 25 malformed-token SSR was **72 ms**. The warm invalid path is
now dramatically cheaper.

### Cold-isolate caveat

One malformed-token request after a long idle recorded **cpuTime 148 ms**,
wallTime 152 ms, `outcome: ok`, HTTP 404, Error 1102 = 0.

That is an infrequent cold-isolate observation. Do **not** claim every
invocation always remains below 10 ms. Controlled valid Review stayed
below 10 ms. Controlled invalid/revoked paths stayed at or below 10 ms.
Cloudflare completed the cold request successfully. Client Review is an
occasional approval workflow, not the normal public Website traffic path.

Do not create another optimization milestone solely for this observation.
Workers Paid remains **not** approved.

The temporary public Worker was deleted after the sample. Config in
`public-runtime/wrangler.production.jsonc` remains.

## Security invariants

- Authorization happens **before** HTML is returned (token format, then
  session row).
- Stored HTML contains placeholders, not the live token.
- Invalid/missing/regenerated tokens share one generic 404 body.
- Review media cookie is still set only for well-formed tokens in
  middleware (no D1 in middleware). Authorization still requires a live
  session and draft media reference.
- Published hostname path remains
  `servePublishedWebsiteHtml` → stored `public_html` only.
