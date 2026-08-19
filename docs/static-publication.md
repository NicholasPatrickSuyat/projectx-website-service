# Static publication runtime (Milestone 22)

**NO REMOTE DEPLOYMENT.** This document describes the local static
publication architecture. It does not authorize creating a remote
Worker, D1, R2, domain, DNS record, or paid Cloudflare service.

Related:

- [`docs/public-runtime.md`](public-runtime.md)
- [`docs/production.md`](production.md)
- [`docs/production-infrastructure.md`](production-infrastructure.md)

## Why this exists

Milestone 21 measured real Workers Free CPU for the previous public
path: hostname → D1 → `renderTemplate()` → Next.js/OpenNext React SSR
on every request. p50 CPU was about 13 ms and most invocations exceeded
10 ms. Dynamic template SSR is not approved for a real Client on
Workers Free. Workers Paid is not approved.

Published Websites are frozen snapshots. The expensive template render
now happens at Publish (and local backfill), not on every visitor
request.

## Selected architecture

**Generate complete publication HTML at Publish. The public hostname
path returns that stored HTML from a Route Handler.**

| Approach | Decision |
|---|---|
| A. Generate HTML at Publish | Selected |
| B. Public runtime returns stored HTML without `renderTemplate()` | Selected (same design) |
| C. Cloudflare Static Assets per Client | Rejected — needs deploy/R2/per-site artifacts |
| D. Cache API with SSR on miss | Rejected — M21 404 SSR was already ~10 ms CPU; unbounded miss rendering is not a Free plan strategy |
| E. Smaller variants | Route Handler + D1 `public_html` is the smallest change that removes React template SSR from the normal published path |

Why this one:

- Deterministic: HTML is derived from the immutable publication JSON
- Rollback: switch `websites.active_publication_id` to an older row
- No paid dependency, no R2, no extra Worker
- One Worker / many Clients: hostname → exact `website_domains` row →
  that Website's active publication
- Custom domains later still use the same Host header lookup
- Draft never becomes public unless Publish copies it into a new row

What became static:

- Normal published hostname `/` HTML
- Template visual CSS (`/publication-runtime.css`)
- First-party FAQ / mobile-nav toggles (small vanilla script)

What remains dynamic:

- Hostname → domain → active publication lookup (D1 I/O)
- `/media/{id}` authorization
- Client Review token lookup + stored `review_html` substitution
  (generation is admin/Save Draft, not per public GET — see
  [`docs/client-review-runtime.md`](client-review-runtime.md))
- Admin editor, previews, Publish generation, review HTML generation

## Old vs new request path

**Old (Milestone 21, rejected for Workers Free):**

Host header → parse hostname → `website_domains` → latest
`website_publications` row → JSON parse → `getTemplate` →
`renderTemplate()` React tree → Next.js page SSR → HTML

**New (normal published path):**

Host header → parse hostname (fail closed) → `website_domains` →
`websites.active_publication_id` → stored `public_html` → `Response(html)`

Evidence the expensive SSR no longer runs per published request:

- `public-runtime/src/app/host/[[...slug]]/route.ts` does not import
  `renderTemplate`
- `src/lib/website-publications/serve-public-html.ts` does not import
  template renderers
- Published HTML has no Next RSC payload (`self.__next_f`)
- HTML is generated only in admin Publish / local backfill
  (`render-public-html.tsx`)

Client Review GET no longer imports `renderTemplate`. The public Worker
must not execute template SSR for `/review/{token}`. See
[`docs/client-review-runtime.md`](client-review-runtime.md).

## Publication model

`website_publications` rows remain immutable snapshots:

- `content_json` — frozen validated content
- `public_html` — frozen HTML generated from that JSON at Publish
- Draft `websites.content_json` is separate

`websites.active_publication_id` is the live pointer.

| Event | Public site |
|---|---|
| Edit draft, do not Publish | Unchanged (still the active publication) |
| Publish | New row + pointer switches atomically to the new id |
| Make live on an older row | Pointer switches; old and new rows stay historically accurate |
| Missing/empty `public_html` | Fail closed, generic Website unavailable |

Rollback does **not** reconstruct from the current draft. It only
updates the pointer. Publication History → **Make live**.

## Publish sequence and failure safety

1. Admin auth required.
2. Website status must be Ready to publish.
3. Draft JSON is validated.
4. Static HTML is generated **before any write**. If generation fails,
   Publish returns an error and D1 is untouched.
5. One D1 `batch()` (transaction-equivalent) then:
   - `INSERT` the new publication from the **same** validated snapshot
     used to generate HTML
   - `UPDATE websites` to `PUBLISHED` and `active_publication_id = new id`
     only if that publication exists, belongs to this Website, and has
     non-empty `public_html`

If the batch fails, neither the insert nor the pointer/status change
commits. The previous active publication remains live.

Make live / rollback:

- Admin auth required
- `publication.website_id` must equal the Website id (query + UPDATE
  `EXISTS` predicate)
- Updates `active_publication_id` only
- Does not modify `content_json`, `public_html`, publication numbers,
  or Website Versions

## Migration 0011 vs HTML backfill

`0011_static_publication_html.sql` is deterministic schema/data SQL:

- Additive columns only
- `active_publication_id` is nullable
- Websites without publications stay `NULL`
- Existing Client/Website/publication rows are preserved
- It does **not** generate HTML

Local HTML backfill is a **separate** Node command:

```bash
npm run db:migrate
npm run db:backfill-publication-html
```

`db:migrate` is `--local` SQL only. It does not render templates.
`dev` / `dev:public` run backfill afterward so local Cedar/Copper/Linden
have `public_html`. Backfill never uses `--remote`, never creates
publications, never edits drafts, and never overwrites non-empty HTML.

### Hypothetical existing-database upgrade (not production today)

Production D1 does not exist. If an already-populated D1 ever needed
0011 later:

1. Apply `0011_static_publication_html.sql` (schema + latest-publication
   pointer for rows that have publications)
2. Public host fail-closes while `public_html` is empty
3. Run the local/admin HTML generator/backfill **explicitly**
4. Confirm each live publication has non-empty `public_html` before
   serving clients

Do not fold HTML rendering into the SQL migration.

## Hostname resolution

Still exact and fail closed. One Worker / many Clients.

1. Parse `Host` (`parseRequestHostname`)
2. Malformed / missing → 404 generic unavailable
3. Admin application hostnames (`localhost`, loopback, raw IPs) are not
   public Client sites
4. Exact `website_domains.hostname` match
5. Unknown host → 404, no Website UUID, no Client UUID, no D1 errors

Local examples: `cedar.localhost`, `copper.localhost`, `linden.localhost`.

## Static output safety

HTML is generated only from validated publication content through the
existing template components. Next.js forbids `react-dom/server` inside
Server Actions, so Publish runs a local Node helper
(`scripts/generate-publication-html.mjs`) at publish time. That helper
is admin-only and is not imported by the public hostname handler.

- React escaping is preserved for body text
- Title/description are HTML-escaped
- No Client-supplied JavaScript is copied into the document
- A small first-party script only toggles `aria-expanded` / `hidden`
- `next/image` optimizer URLs are rewritten back to `/templates/...` or
  `/media/{id}`
- Section visibility and template structure come from the snapshot

## Media

Milestone 18 isolation is unchanged in strength.

Published `/media/{id}` on a Client hostname: allowed only when the
media belongs to that Website **and** is referenced by the **active**
publication `content_json`.

- Cross-Website: 404
- Same-Website but unreferenced by the active publication: 404
- Unknown host: 404
- Client Review: draft-referenced media via the existing review token
  model
- Admin: authenticated media unchanged
- No R2 URLs are exposed. No R2 is created.

Switching the active publication changes which media references are
live. That is intentional: public media follows the live snapshot.

## Client Review

Uses stored saved-draft HTML, not publication snapshots.

- Invalid / malformed token → fast validation → generic 404 (no templates)
- Well-formed nonexistent / revoked token → D1 lookup → generic 404
- Valid token → `websites.review_html` → stored HTML Response
- Save Draft regenerates `review_html`; Publish stays independent
- No admin login. Never another Website. `noindex, nofollow`.

See [`docs/client-review-runtime.md`](client-review-runtime.md).

## Admin

`npm run dev` stays local (port 3002). Dashboard, Clients, Websites,
Templates, editor, Save Draft, statuses, Media Library, Version History,
Client Review, Publication History, Publish, Hostnames, Settings, and
Support Requests remain.

## Expected production resource model

Unchanged from Milestone 20/21 planning, still **not provisioned**:

- One public Worker later (not now)
- One shared D1 (`projectx-websites-production`) with migrations 0001–0012
- One shared R2 later only if checkout risk is accepted (not now)
- Custom Domains later
- Cost target $0 / Workers Free
- No admin credentials on the public Worker

## Why this should reduce Worker CPU

D1 lookup is I/O (not CPU). Milestone 21 showed React/Next SSR was the
expensive part, including ~11 ms p50 even on public 404 pages. Returning
stored HTML from a Route Handler skips:

- template selection
- React render
- Next.js page SSR / RSC payload

It does **not** prove Workers Free compatibility. Local wall-clock and
in-process render timings are **not** Cloudflare production CPU.

The next proof still requires an explicitly approved temporary
production CPU smoke test after ChatGPT review. Do not deploy from this
milestone.

## Local commands

```bash
npm run db:migrate
npm run db:backfill-publication-html
npm run test:static-publication
```

`db:migrate` applies 0011 and 0012 locally (SQL only). Publication and
review HTML backfill are separate local Node commands. Never use
`--remote`.
