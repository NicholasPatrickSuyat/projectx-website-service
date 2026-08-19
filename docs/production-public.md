# Production public runtime

Admin stays local/private. R2 is not approved. Custom Domains and DNS
are not approved. This is not a Client launch.

Config: `public-runtime/wrangler.production.jsonc`. Local
`npm run dev:public` still uses `public-runtime/wrangler.jsonc`
(`remote: false`). Do not load the production file from local public
dev.

## Official Free-plan recheck (2026-08-18)

Sources: [Workers limits](https://developers.cloudflare.com/workers/platform/limits/),
[Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/),
[D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/),
[D1 limits](https://developers.cloudflare.com/d1/platform/limits/),
[workers.dev](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/),
[Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/),
[Error 1102](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1102/).

No material change vs Milestones 20–24:

| Topic | Workers Free |
|---|---|
| Requests | 100,000/day, reset 00:00 UTC. Over limit → Error 1027 |
| CPU / invocation | 10 ms. Over limit → Error 1102 / `exceededCpu` |
| Worker size | 3 MB gzip / 64 MB uncompressed |
| workers.dev | Available; treated as a Free website |
| Workers Logs | Included: 200,000 log events/day, 3-day retention |
| D1 reads | 5 million rows/day |
| D1 writes | 100,000 rows/day |
| D1 size | 500 MB/database, 5 GB/account, 10 databases |
| Time Travel | Always on, 7 days on Free |
| Over D1 Free limits | Queries error until 00:00 UTC; not a paid-plan prompt by itself |

I/O wait (including D1) does not count as CPU. Serialization and HTML
response construction do.

## Published Website path

```
Request Host
  → parseRequestHostname
  → website_domains.hostname
  → websites.active_publication_id
  → website_publications.public_html
  → Response (stored HTML, no renderTemplate)
```

Normal published hostname serving must not call `renderTemplate()`.

Workers Free is **approved** for this path only. Do not enable Workers
Paid for it.

Real Client production must later use a Custom Domain. `workers.dev` in
`wrangler.production.jsonc` is for controlled testing, not a Client URL.
Do not add a Custom Domain or DNS from this milestone.

## Production-public Wrangler config

File: `public-runtime/wrangler.production.jsonc`

- Worker name: `projectx-websites-public`
- `workers_dev`: true for future controlled tests only
- D1: `projectx-websites-production` (`remote: true`)
- ASSETS / WORKER_SELF_REFERENCE: OpenNext
- **No R2 / MEDIA**
- No admin secrets
- Observability enabled

Temporary Milestone 25 and Milestone 26 Workers were deleted after
their CPU samples. The config remains. The Worker is not currently
deployed.

## Media without R2

`/media/{id}` on the production-public Worker returns **404** when the
`MEDIA` binding is absent. It must not create or access R2.

## CPU results

Workers Free remains 10 ms CPU/invocation.

| Test | Path | Result |
|---|---|---|
| Milestone 21 | Dynamic SSR | **FAIL** — p50 ~13 ms, 65/81 > 10 ms |
| Milestone 23 | Stored HTML, no production D1 | **PASS** — n=80, p50 3 ms, max 9 ms, 0/80 > 10 ms, Error 1102=0 |
| Milestone 25 | Stored HTML + production D1 hostname lookup | **PASS** — publication n=60, p50 4 ms, max 9 ms, 0/60 > 10 ms, Error 1102=0 |
| Milestone 26 | Stored draft `review_html` + early 404 | **PASS** for initial Client Review — valid n=20, p50 5 ms, max 9 ms, 0/20 > 10 ms, Error 1102=0 |

Do not claim every invocation always stays below 10 ms. See the
Client Review cold-isolate caveat below.

### Client Review CPU — approved for initial Workers Free

**Old path:** Next.js page + `renderTemplate()` SSR. Milestone 25
`GET /review/not-a-valid-token` recorded cpuTime **72 ms**.

**New path:** stored `websites.review_html` (saved draft, not
`public_html`) + early generic 404. See
[`docs/client-review-runtime.md`](client-review-runtime.md).

Controlled production sample (Workers Logs `cpuTime`):

| Category | n | p50 | max | >10 ms | Error 1102 |
|---|---:|---:|---:|---:|---:|
| Valid review | 20 | 5 ms | 9 ms | 0 | 0 |
| Well-formed nonexistent | 20 | 4.5 ms | 9 ms | 0 | 0 |
| Revoked / regenerated | 20 | 4 ms | 7 ms | 0 | 0 |
| Malformed warm | 19 | 4 ms | 10 ms | 0 | 0 |

Workers Free is **approved** for this initial Client Review workflow.
Do not enable Workers Paid.

**Cold-isolate caveat:** one malformed-token request after a long idle
recorded cpuTime **148 ms**, wallTime 152 ms, `outcome: ok`, HTTP 404,
Error 1102 = 0. Do not claim cold starts are proven always below the
Free CPU limit. Do not create another optimization milestone solely for
this observation. Client Review is occasional approval traffic, not the
normal published Website path.

## Forbidden

- Workers Paid
- R2
- Custom Domains / DNS
- admin Worker
- real Client data
- Cedar / Copper / Linden / Kickyuni in production
- automatic remote migrate/seed
