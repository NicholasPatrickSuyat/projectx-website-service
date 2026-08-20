# Production infrastructure & deployment safety

**Milestone 20 planning document. This does not authorize deployment.**

**NO REAL CLIENT LAUNCH YET.** Do not create R2, a Custom Domain, DNS,
or a paid Cloudflare product from this repository without a later
approval. Production D1 exists. Remote Workers KV is **not** created.
The public Worker is not currently deployed.

This is the main production deployment planning reference for Project X
Website Service. Related documents:

- Public vs admin split: [`docs/public-runtime.md`](public-runtime.md)
- Hosting/cost research (Milestone 17): [`docs/deployment-decision.md`](deployment-decision.md)
- Production architecture: [`docs/production.md`](production.md)

**Baseline:** Milestone 19 commit `79f1c82d1c25338dfabd62fb80868e3ed016acfe`
(`79f1c82`).

**Retrieval date for official Cloudflare facts in this file:** 2026-08-16.

Facts the official docs do not establish are marked **INCONCLUSIVE**.
Do not treat this document as a billing guarantee.

---

## 1. Current local state

| Item | State |
|---|---|
| Admin app | Local only, `npm run dev` → http://localhost:3002 |
| Public runtime | Local only, `npm run dev:public` → http://localhost:3003 |
| Remote Worker | NONE (Milestone 25 test Worker deleted) |
| Remote D1 | `projectx-websites-production` (empty business tables) |
| Remote KV | `projectx-websites-media` (`f95b658d6c914e0fbec1f06bec4b6e4d`) |
| Remote R2 | NONE |
| Custom Domains / DNS | NONE |
| Workers Paid | NONE |
| Payment information | NONE |
| Cost | **$0** |

Public OpenNext artifact gzip size (Milestone 19 / 25, local dry-run):
**~1.09 MiB gzip** (under the documented Workers Free **3 MB gzip** /
**64 MB uncompressed** Worker size limit).

The **published Website** path on Workers Free is **PASS** (Milestone 25:
Host → production D1 → stored `public_html`, n=60, p50 4 ms, max 9 ms,
0/60 > 10 ms). Client Review on stored `review_html` is **approved** for
the initial Workers Free workflow (Milestone 26: valid n=20, p50 5 ms,
max 9 ms, 0/20 > 10 ms). One cold-isolate malformed request recorded
148 ms CPU with `outcome: ok` and no Error 1102; do not claim every
invocation always stays below 10 ms. Local workerd wall-clock is not
Cloudflare production CPU accounting.

---

## 2. Official Cloudflare facts (2026-08-16)

### 2.1 Workers Free

Sources:

- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/platform/limits/

| Fact | Official value |
|---|---|
| Default plan | Workers Free is the default |
| Requests | 100,000 per day, reset midnight UTC. Over limit → **Error 1027** |
| CPU time | **10 ms CPU per invocation** (not wall-clock) |
| Duration / wall-clock | No charge for duration |
| Memory | 128 MB |
| Worker size | 3 MB gzip / 64 MB uncompressed |
| Subrequests | 50 external + 1,000 Cloudflare-service subrequests per invocation (Free) |
| Number of Workers | 100 |
| Static asset files / Worker version | 20,000 |
| Individual static asset | 25 MiB |
| Over-limit behavior | Fail closed (errors), not a bill |

Waiting on network I/O (fetch, D1, R2) does **not** count as CPU time.
Executing JavaScript does.

### 2.2 Workers Paid (Standard)

Source: https://developers.cloudflare.com/workers/platform/pricing/

| Fact | Official value |
|---|---|
| Floor | **$5 USD / month** per account |
| Requests | 10 million / month included, then $0.30 / additional million |
| CPU-ms | 30 million CPU-ms / month included, then $0.02 / additional million |
| CPU per invocation | Default 30 s, configurable up to 5 minutes via `limits.cpu_ms` |
| Worker size | 10 MB gzip / 64 MB uncompressed |
| Requests | No daily Free-style cap (“No limit” on the limits table) |
| Overage | Billed. **Not a hard dollar cap.** |

**Do not enable Workers Paid** unless a later milestone explicitly accepts
the $5 floor and uncapped usage overage.

`limits.cpu_ms` is documented as a **Paid** control to cap CPU **per
invocation** (runaway-bill protection). It does **not** cap monthly spend.
It does **not** raise the Free-plan 10 ms limit.

### 2.3 D1 Free vs Paid

Sources:

- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/d1/platform/limits/
- https://developers.cloudflare.com/d1/reference/faq/
- https://developers.cloudflare.com/d1/reference/time-travel/
- https://developers.cloudflare.com/d1/best-practices/import-export-data/
- https://developers.cloudflare.com/d1/reference/migrations/

| Fact | Workers Free | Workers Paid |
|---|---|---|
| Rows read | 5 million / day | 25 billion / month included, then $0.001 / million |
| Rows written | 100,000 / day | 50 million / month included, then $1.00 / million |
| Storage per account | 5 GB total | 5 GB included + $0.75 / GB-month |
| Per-database size | 500 MB | 10 GB |
| Databases per account | 10 | 50,000 |
| Time Travel window | **7 days** | **30 days** |
| Over Free daily limits | Queries error until 00:00 UTC | N/A (Paid bills overage) |
| Over Paid included | N/A | **Billed. No hard dollar cap.** |

Time Travel is always on, no extra cost. Restore overwrites the database.
Export: `wrangler d1 export <name> --remote --output=./database.sql`.
Import: `wrangler d1 execute <name> --remote --file=...`.
Migrations: `wrangler d1 migrations apply <name>` with `--local` or
`--remote`.

Free-plan D1 is included with Workers Free. Official FAQ: exceeding Free
daily read/write limits **stops queries** rather than billing.

### 2.4 R2

Sources:

- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/r2/get-started/
- https://developers.cloudflare.com/r2/buckets/public-buckets/
- https://developers.cloudflare.com/r2/platform/limits/
- https://developers.cloudflare.com/billing/understand/how-billing-works/
- https://developers.cloudflare.com/billing/understand/usage-based-billing/

| Fact | Official value |
|---|---|
| Free monthly included | 10 GB-month storage, 1 million Class A, 10 million Class B |
| Standard storage overage | $0.015 / GB-month |
| Class A overage | $4.50 / million |
| Class B overage | $0.36 / million |
| Egress to Internet | Free |
| Default bucket access | **Private.** Public access requires explicit enable |
| `r2.dev` public URL | Non-production, rate-limited |
| Account setup | “Complete the **checkout flow** to add an R2 subscription” |
| Billing | Monthly usage-based. Invoice lines exist even at $0.00 |
| Bucket storage cap | Unlimited per bucket (no documented dollar cap) |
| Hard usage / dollar cap | **Not documented.** Treat as **none** |
| Budget alerts | Email only; **do not pause or cap usage** |

**R2 billing requirement (deployment gate):** official Get started requires
an R2 **subscription via checkout**. Whether checkout can complete with $0
and **without** a payment method is **INCONCLUSIVE** (docs do not say
“card required” in those words, but they do require checkout).

Once an R2 subscription exists, usage above the free monthly included
amounts is billed. There is **no documented hard dollar cap**. Budget
alerts are **not** a spending cap.

**Do not create an R2 bucket in Milestone 20 or 21 until this checkout
risk is explicitly accepted.**

### 2.5 Custom Domains

Sources:

- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/

| Fact | Official value |
|---|---|
| Requirement | An **active Cloudflare zone** + a Worker |
| DNS/TLS | Cloudflare creates DNS records and issues certificates |
| Match | Exact hostname. `example.com` ≠ `www.example.com` |
| Multiple Custom Domains | Supported on one Worker |
| Custom domains per zone | 100 |
| Routes per zone | 1,000 |
| Free vs Paid for Custom Domains | Docs do **not** state Workers Paid is required |
| Zone on Free/Pro | Full setup is the only option; **nameserver change at registrar** |

“Without having to make changes to your DNS settings” means Cloudflare
writes the zone’s records after the zone exists. Adding the zone still
requires pointing the domain’s **authoritative nameservers** at Cloudflare
(full setup on Free/Pro).

Whether Workers Custom Domains work on Cloudflare **partial / CNAME-only**
setup (no nameserver change): **INCONCLUSIVE** (Custom Domains docs require
an active zone; Free/Pro full setup requires nameservers).

### 2.6 workers.dev

Source: https://developers.cloudflare.com/workers/configuration/routing/workers-dev/

| Fact | Official value |
|---|---|
| Purpose | Quick start without onboarding a custom domain |
| Public | Yes, when enabled |
| Production Client URL | **Not recommended.** Treated as a Free website / hobby |
| Disable | Dashboard, or `workers_dev: false` and redeploy |
| Workers Free | Supported (no extra Paid plan documented) |
| Cloudflare Access | Optional sign-in gate (do **not** enable Access here) |

Local Wrangler files keep `workers_dev: false`.
`public-runtime/wrangler.production.jsonc` may keep `workers_dev: true`
for future controlled tests. That is **not** a Client URL. Real Client
production must use a Custom Domain later.

### 2.7 CPU inspection

Sources:

- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/observability/metrics-and-analytics/
- https://developers.cloudflare.com/workers/observability/dev-tools/cpu-usage/
- https://developers.cloudflare.com/workers/observability/logs/workers-logs/
- https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1102/

| Mechanism | What it shows | Notes |
|---|---|---|
| Dashboard Metrics → CPU Time per execution | Production CPU quantiles | After a Worker exists |
| Metrics → Errors → Exceeded CPU Time Limits | Error **1102** | Also Error **1027** (Free daily requests) |
| Workers Logs invocation logs | CPU time + wall time | Free: 200,000 log events/day, 3-day retention |
| DevTools CPU profiling | Local CPU, not production | Official: production timers are limited |
| `limits.cpu_ms` | Per-invocation cap | Documented for **Paid** |

There is **no** official way to obtain production CPU accounting without
running the Worker on Cloudflare. Local workerd wall-clock ≠ Worker CPU.

Workers Logs is included on Workers Free (with the Free log-event cap).
It is not a separate paid add-on at the Free included volume. Do not
enable extra paid observability (Logpush, Log Explorer) without approval.

Measured production CPU (Workers Logs `cpuTime`, milliseconds):

| Milestone | Path | Result |
|---|---|---|
| 21 | Dynamic SSR | FAIL — p50 ~13 ms, 65/81 > 10 ms |
| 23 | Stored HTML, no production D1 | PASS — n=80, p50 3 ms, max 9 ms, 0/80 > 10 ms |
| 25 | Stored HTML + production D1 | PASS — publication n=60, p50 4 ms, max 9 ms, 0/60 > 10 ms, Error 1102=0 |
| 26 | Stored draft `review_html` | PASS for initial Client Review — valid n=20, p50 5 ms, max 9 ms, 0/20 > 10 ms, Error 1102=0 |

Client Review is **approved** for the initial Workers Free workflow.
Milestone 25 invalid-token SSR recorded 72 ms. Milestone 26 warm invalid
paths were ≤10 ms. One cold-isolate malformed request recorded 148 ms
CPU (`outcome: ok`, Error 1102=0). Do not claim every invocation always
stays below 10 ms. Do not enable Workers Paid for this observation.

### 2.8 Billing alerts and caps

Sources:

- https://developers.cloudflare.com/billing/manage/budget-alerts/
- https://developers.cloudflare.com/workers/platform/pricing/

| Mechanism | Stops spending? |
|---|---|
| Budget alerts | **No.** Email only |
| Usage notifications | **No.** Informational |
| Workers Free request/CPU/D1 Free daily limits | **Yes** — fail closed, no bill |
| Workers Paid / R2 overage | **No hard dollar cap** |
| `limits.cpu_ms` | Caps CPU **per request** on Paid, not monthly dollars |
| R2 bucket-level dollar cap | **Not documented** |

### 2.9 Payment methods

| Product | Payment method required? |
|---|---|
| Workers Free | Official default plan. No checkout documented. Treat as **no** |
| D1 Free | Included with Workers Free |
| R2 | Checkout / R2 subscription required (see §2.4). Card: **INCONCLUSIVE** |
| Workers Paid | Yes ($5/month) — **do not enable** |
| Custom Domain | Cloudflare zone; domain registrar already paid by Client. Workers Paid not documented as required |

---

## 3. Production architecture (proposed, not created)

One public Worker. One production D1. One private R2 bucket.
Admin stays local/private for the first Client.

Do **not** create one Worker, D1, or R2 bucket per Client.

```
Client browsers
    │
    ├─ Custom Domain (later)  ─┐
    └─ workers.dev (CPU test only, then disable)
                               ▼
                    projectx-websites-public
                    (OpenNext public runtime)
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
         projectx-websites-production    projectx-websites-media
         (D1, empty then first Client)   (private R2, /media/{id} only)
```

Admin (port 3002) is **not** this Worker. It must not be deployed in
Milestone 21.

### 3.1 Proposed resource names (not created)

| Resource | Proposed name | Binding |
|---|---|---|
| Public Worker | `projectx-websites-public` | — |
| Production D1 | `projectx-websites-production` | `DB` |
| Production KV (V1 media) | `projectx-websites-media` | `MEDIA_KV` |
| Production R2 | rejected for V1 | dormant `MEDIA` code only |

Local Wrangler placeholders remain:

- `database_id`: `00000000-0000-4000-8000-000000000001` (not a real D1)
- `bucket_name`: `projectx-website-media-unprovisioned`
- `remote`: **false**
- `workers_dev`: **false**

Future real IDs belong only in a **production Wrangler environment** that
does not exist yet, filled in during Milestone 21 **after** resources are
approved to be created. They must never be committed as secrets; database
and bucket IDs are identifiers, but still must not be invented now.

### 3.2 What the public Worker does

- Hostname → `website_domains` → latest **publication** only
- `/review/[token]` Client Review (token in D1; no admin session)
- `/media/{id}` authorized GET (R2 private; no public R2 URL)
- Bundled template static assets

### 3.3 What it must not do

Login, Clients, editor, Publish, hostname admin, media upload, PBKDF2,
admin session cookies.

---

## 4. Workers Free CPU — Milestone 21 smoke-test design

**Do not execute this test in Milestone 20.**

### 4.1 Why this is the launch blocker

Milestone 19 local wall-clock (workerd, not production CPU):

| Route | Approx. local wall-clock |
|---|---|
| Cedar `/` | ~30 ms |
| Copper `/` | ~30 ms |
| Linden `/` | ~29 ms |
| `/review/[token]` | ~37 ms |
| Authorized `/media/{id}` | ~96 ms |

Workers Free allows **10 ms CPU**. I/O wait does not count. Whether
OpenNext SSR stays under 10 ms CPU is **UNPROVEN** until a real Worker
runs.

Do not weaken hashing, skip authorization, or enable Paid to hide this.

### 4.2 Temporary URL strategy

Use a **temporary `workers.dev` URL only** for this CPU test:

1. Workers Free supports `workers.dev` (no Paid plan documented).
2. It is **public** while enabled — use an unguessable Worker name still
   based on `projectx-websites-public`, and do not advertise the URL.
3. No customer domain. No real customer traffic.
4. Disable `workers.dev` immediately after the test (`workers_dev: false`
   + dashboard Disable).
5. Do **not** enable Cloudflare Access (out of scope / possible billing).

Do not use `workers.dev` as a Client website URL.

### 4.3 Procedure (design only)

Prefer the **smallest** remote setup that can measure public Worker CPU.
Do **not** automatically create Worker + D1 + R2 together. Do **not**
create R2 for the first CPU test unless a later review proves it is
absolutely necessary.

1. Confirm the Cloudflare account is on **Workers Free** (no Paid, no
   billing change, no R2 subscription).
2. Determine whether a meaningful CPU sample can run **without**
   production D1 or R2 (Worker + bundled static assets + public 404 /
   invalid-review paths on temporary `workers.dev`). Prefer that.
3. If hostname/publication SSR **genuinely** needs D1 for a
   representative result: **propose** one empty Free D1 named
   `projectx-websites-production` and **STOP for explicit approval**
   before creating it. Do not create it in this design step.
4. Build `npm run build:cloudflare:public` locally.
5. Deploy **only** the minimum approved public Worker. Temporarily set
   `workers_dev: true` **for that deploy only**. Enable Workers Logs
   (`observability.enabled = true`) for the test window (Free included
   volume). No admin Worker. No real Client. No customer domain.
6. Send a **tiny** controlled set of requests (order of tens, not
   thousands) to:
   - `/` on the workers.dev host (expect public 404 without a mapped
     hostname — still measures Worker CPU)
   - `/review/{invalid}` (404)
   - publication SSR **only if** an approved empty D1 plus disposable
     test row exists (default: skip; keep production empty)
7. In the dashboard, inspect:
   - Metrics → **CPU Time per execution**
   - Metrics → Errors → **Exceeded CPU Time Limits** / Error **1102**
   - Workers Logs invocation CPU time
8. **STOP conditions (abort, disable workers.dev, do not add a domain,
   do not enable Paid, do not accept a paid-plan upsell):**
   - Any Error **1102** / exceededCpu
   - CPU quantiles at or above ~10 ms with errors
   - Error **1027** (should not happen at tens of requests; if it does,
     something else is consuming the account quota)
   - Any billing/plan change prompt
   - Any unexpected public content leak (admin HTML, other Clients)
9. Disable `workers.dev` and observability sampling when appropriate.
10. **STOP for ChatGPT review.** Do not continue into R2, real Client
    data, Custom Domains, DNS, or first-Client launch. The CPU result
    is its own decision gate.

### 4.4 Billing safety for the CPU test

Stay on Workers Free. Do not create R2 until checkout risk is accepted.
Do not enable Workers Paid, Images, Cache Reserve, Log Explorer, or
Access. Tens of requests cannot meaningfully approach 100,000/day.

---

## 5. D1 production plan

### 5.1 Initialization (Milestone 24)

Created:

```bash
npx wrangler d1 create projectx-websites-production
```

UUID `db47d1af-bc9c-47f0-ad8a-1377971dbd24` lives only in
`wrangler.production-admin.jsonc`. Default `wrangler.jsonc` stays on the
local placeholder with `remote: false`.

Remote migrations:

```bash
npx wrangler d1 migrations apply projectx-websites-production --remote --config wrangler.production-admin.jsonc
```

Local development must keep using:

```bash
npx wrangler d1 migrations apply projectx-website-service --local
```

(`npm run db:migrate` already passes `--local`.)

### 5.2 Empty-production strategy

Production starts **empty**. Do not copy the local emulator (Cedar,
Copper, Linden, review tokens, media rows).

Kickyuni must never be introduced.

The first real Client is created **intentionally** through the approved
admin-to-production workflow after CPU and R2 gates pass.

### 5.3 Verify schema (after create)

```bash
npx wrangler d1 execute projectx-websites-production --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
npx wrangler d1 migrations list projectx-websites-production --remote
```

Expected application tables from 0001–0012 include clients, websites,
versions, media, templates-related constraints, review, publications
(including `public_html`), `websites.active_publication_id`,
`websites.review_html`, admin session, website_domains, plus
`d1_migrations`.

### 5.4 Backup and restore

| Tool | Window / use |
|---|---|
| Time Travel (Free) | 7 days, always on |
| Time Travel (Paid) | 30 days — do not enable Paid for this |
| `wrangler d1 export ... --remote` | Operator-held `.sql` file |

Proposed first-Client backup:

- **Before every remote migration:** Time Travel bookmark via
  `wrangler d1 time-travel info projectx-websites-production` **and**
  `wrangler d1 export ... --output=backups/d1-YYYYMMDD.sql` stored
  **outside git** (encrypted operator storage).
- **Weekly** export while a live Client exists.
- Restore: Time Travel within 7 days; otherwise import the SQL export
  into a **new** database and re-bind (in-place import can be destructive).
  Time Travel restore **overwrites** the current database.

Do not download production data in Milestone 20 (none exists).

---

## 6. R2 production plan

### 6.1 Bucket

Proposed name: `projectx-websites-media`.

**Keep the bucket private.** Do not enable:

- R2 custom domain
- `r2.dev` public development URL
- public bucket access

Client images continue to use **`/media/{id}`** with application
authorization. Object keys remain `{websiteId}/{storedFilename}`.

Binding: `MEDIA` on the public Worker (read). Admin production management
would use the same bucket for write (upload) — not implemented yet.

### 6.2 Billing / cost risk

R2 is the **only** planned production storage product whose official
onboarding is a **checkout / subscription**, and whose overage is
**usage-billed without a documented hard dollar cap**.

| Question | Answer |
|---|---|
| Free-tier-only stop at allowance? | **No official hard stop** like Workers Free Error 1027. Over-allowance **bills** after subscription. |
| Overage automatically billed? | **Yes**, once subscribed |
| Hard usage cap? | **Not documented** |
| Budget alerts prevent charges? | **No** |
| Bucket-level caps? | **Not documented** |
| Rate limits? | REST API 1,200 / 5 min; object ops otherwise unlimited per limits table |

**There is no true dollar cap on R2.** Do not describe a budget alert as
a cap.

### 6.3 Backup

There is **no** official R2 Time Travel equivalent in the docs retrieved.
Backup is operator-driven:

- `wrangler r2 object get` / S3-compatible sync of
  `projectx-websites-media` to encrypted offline storage
- After each Publish that adds media, sync new keys
- Weekly full listing + get of objects referenced in D1 `website_media`

Object versioning as a first-class R2 feature: **INCONCLUSIVE** (not
established in the limits/pricing pages retrieved). Do not rely on it.

Deleted objects are not recoverable unless a copy exists in backup.
Application “delete media” must stay rare for the first Client.

### 6.4 First Client viability

`/media/{id}` through the Worker is **acceptable for Client #1**. Do not
optimize prematurely.

Future research-only options (not this milestone):

- Cache-Control / Cloudflare Cache on authorized public publication
  media (must not cache draft/review or cross-Client)
- Immutable publication asset keys after Publish
- Avoid D1 on every repeat image via cache, **not** by skipping auth on
  first request without a solid cache key

Those must preserve cross-Client isolation and private draft/review
media. Not required for Client #1.

---

## 7. Traffic / cost model (planning only)

Assumptions (stated, not a guarantee):

- Small local-business site: **50 HTML page views / Client / day**
- **8** R2-backed images per page view hit `/media/{id}` (uncached worst
  case; browsers will cache, so this is conservative-high)
- Template static files are Worker assets, not R2 Class B
- Each HTML and each media GET is **one Worker request**
- Worker requests / Client / day ≈ 50 × (1 + 8) = **450**
- R2 Class B / Client / month ≈ 400 × 30 = **12,000**
- R2 storage / Client ≈ **20 MB** (photos)

| Clients | Worker req/day | vs 100k Free | R2 Class B/month | vs 10M free | R2 storage |
|---|---|---|---|---|---|
| 1 | 450 | 0.5% | 12k | 0.1% | ~20 MB |
| 5 | 2,250 | 2% | 60k | 0.6% | ~100 MB |
| 10 | 4,500 | 5% | 120k | 1.2% | ~200 MB |
| 25 | 11,250 | 11% | 300k | 3% | ~500 MB |
| 50 | 22,500 | 23% | 600k | 6% | ~1 GB |

At **500 page views / Client / day** (busier site), 50 Clients ≈
**225,000 Worker requests/day**, which **exceeds Workers Free 100k/day**.
Rough Free request ceiling at 9 requests/view: about **22 Clients × 500
pv/day**, or **~222 Clients × 50 pv/day**.

**Limiting resource for this architecture:** Workers Free **daily
requests**, then D1 Free daily reads (each page does several queries),
then R2 Class B. R2 **storage** 10 GB is ample for tens of Clients.

D1 Free 5 million reads/day: even 20 reads/HTML × 50 pv × 50 Clients =
50,000 reads/day plus media auth queries — still large Free headroom at
the 50 pv/day model. **INCONCLUSIVE** exact rows-read per OpenNext
request without production metrics.

If R2 is subscribed, a traffic spike in Class B **bills** rather than
stopping. Workers Free HTML/media requests **stop** at 100k/day (Error
1027). That is fail-closed for the Worker, not for R2.

---

## 8. Custom domains & first-Client DNS

### 8.1 Architecture

Already implemented locally (Milestone 18, updated in Milestone 22):
`Host` → `website_domains` → Website → **active** publication HTML.

Production: attach each live hostname as a **Workers Custom Domain** on
`projectx-websites-public`. The Worker already reads the `Host` header.

### 8.2 V1 canonical hostname policy

**Canonical:** `www.clientdomain.com`  
**Optional:** `clientdomain.com` → **301 to www**

Reasons:

- Custom Domains require an **exact** hostname match
- Apex and www are two attachments or a DNS redirect
- Email (`MX`) stays on the apex; pointing only www at the Worker is
  easier to reason about than moving mail

Do not implement DNS automation.

### 8.3 Onboarding a Client who already has a site / email

1. Inventory existing DNS: `A`/`AAAA`/`CNAME` for apex and www, **MX**,
   TXT (SPF/DKIM/DMARC), any vendor records.
2. Add the domain as a Cloudflare zone **only after** those records are
   copied into Cloudflare (full setup).
3. Change nameservers at the registrar **only after** MX/TXT match.
4. Attach Custom Domain `www.clientdomain.com` to the public Worker.
5. Insert `www.clientdomain.com` into production `website_domains`.
6. Add a proxied dummy record + Redirect Rule for apex → www if required
   (see Custom Domains “Redirect between www and root”).
7. Do not delete mail records. Do not enable Cloudflare Email Routing
   unless separately approved.

If the Client cannot change nameservers: **STOP**. Partial CNAME-only
Custom Domains on Free are **INCONCLUSIVE**. Do not break email to force
a launch.

### 8.4 SSL

Custom Domains generate an Advanced Certificate on the zone. No separate
Let’s Encrypt step in the Worker.

---

## 9. Admin production management

Local admin today uses **local** D1 (`--local`) and filesystem media.
The public Worker will use **production** D1/R2. Those are different
data stores.

**Do not** point `npm run dev` at production.

### 9.1 Options

| Option | Summary | First-Client fit |
|---|---|---|
| **A. Local admin + explicit production env** | Separate Wrangler env / command, never the default | **Recommended** |
| B. Private VPS admin | Fixed cost, not $0 | Later, if A is unsafe |
| C. CLI-only onboarding | Wrangler SQL/R2 for one Client | Fragile, easy to err |
| D. Deploy admin Worker | Puts admin on the Internet | Rejected (M17/M19) |

### 9.2 Implemented: Option A (`npm run admin:production`)

See [`docs/production-admin.md`](production-admin.md).

- `npm run dev` / `npm run db:migrate` stay **local-only** and must
  **never** connect to production D1 or R2
- `npm run admin:production` requires:
  - `PXWS_PRODUCTION_ADMIN=1`
  - `wrangler.production-admin.jsonc` (`remote: true`, production UUID)
  - OpenNext `remoteBindings: true` for this command only (so D1 is not emulated locally)
  - gitignored `.dev.vars.production-admin`
  - production-management banner on every page including login
  - **no** automatic migrations, seed, backfill, or reset
  - **no** R2
- No `remote: true` in the default `wrangler.jsonc` files
- Production admin fails closed if the remote D1 schema is missing

Do **not** onboard a real Client until ChatGPT approves that step.

### 9.3 Safeguards already in place

- `npm run db:migrate` uses `--local`
- Default `wrangler.jsonc` and `public-runtime/wrangler.jsonc` keep `"remote": false` and the placeholder D1 id
- `wrangler.production-admin.jsonc` and
  `public-runtime/wrangler.production.jsonc` are the only files with
  `"remote": true` and the production D1 UUID. Local `npm run dev` /
  `npm run dev:public` must not load them.
- `npm run admin:production` is the only command that sets `PXWS_ADMIN_PRODUCTION_COMMAND=1`
- Placeholder D1/R2 identifiers in the default configs are not provisioned resources
- Public preview strips admin secrets

---

## 10. Environments

| Environment | D1 | Media | Command |
|---|---|---|---|
| Local admin | Local emulator | Filesystem | `npm run dev` (3002) |
| Production admin-management | Remote `projectx-websites-production` | Remote `MEDIA_KV` (`projectx-websites-media`) | `npm run admin:production` (3004) |
| Local public | Same local emulator | Filesystem | `npm run dev:public` / `preview:cloudflare:public` |
| Production public | Remote `projectx-websites-production` | Remote `MEDIA_KV` (Worker not currently deployed) | `public-runtime/wrangler.production.jsonc` |

---

## 11. Secrets

Public runtime **does not require** admin secrets:

- Not required: `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`,
  `AUTH_SESSION_SECRET`
- Bindings: `DB` required. `MEDIA_KV` is bound in production configs to
  `projectx-websites-media`. Missing `MEDIA_KV` at runtime makes
  `/media` return 404. OpenNext still uses `ASSETS` /
  `WORKER_SELF_REFERENCE`.
  R2 is not a V1 production dependency.
- `NEXTJS_ENV` is a non-secret environment flag

Client Review authorization is the unguessable token stored in D1, plus
the HttpOnly review cookie / Referer for media. No HMAC secret is
required today.

If a future public secret is needed: Cloudflare Worker **secrets** (not
git, not `vars`). Do not create any in this milestone.

---

## 12. Rollback

| Layer | Rollback | Warning |
|---|---|---|
| Worker | Redeploy previous Worker version from dashboard / wrangler | Does **not** undo D1 migrations |
| D1 data | Time Travel (7 days Free) or SQL export restore | Restore overwrites; in-flight queries cancel |
| D1 schema | Restore to pre-migration bookmark **before** shipping a Worker that requires new columns | Never migrate forward without a Worker that understands both states, or migrate then deploy — not deploy then migrate blindly |
| R2 | Restore objects from offline backup | No official PITR |
| Domain | Remove Custom Domain; restore prior DNS/nameservers | TTL delay; mail at risk if MX was changed |

**Migration sequencing:** apply schema to empty or compatible D1 **before**
or **with** a Worker that matches that schema. Worker rollback after a
breaking migration can take production down until D1 is restored.

Migrations **0001–0011** remain unchanged. Milestone 22 added **0011**
(`public_html` + `active_publication_id`). Milestone 26 added **0012**
(`websites.review_html TEXT NOT NULL DEFAULT ''`). Production D1 has
**0001–0012**. Never use `--remote` from this repository until an
approved deployment milestone.

---

## 13. Milestone 21 deployment gates (design only — do not execute)

Minimize remote infrastructure. Do **not** create Worker + D1 + R2
together. **R2 is not approved for provisioning** until CPU feasibility
is reviewed and a later gate explicitly accepts checkout risk.

Expected cost is **$0**. Do not enter payment information.

| Gate | Action | Expected cost | Rollback | STOP if |
|---|---|---|---|---|
| 0 | Re-read current Cloudflare plan, pricing, and limits | $0 | N/A | Docs disagree with live pricing |
| 1 | Confirm account remains Workers Free; no billing change | $0 | N/A | Paid enabled; payment method added; upsell accepted |
| 2 | Determine **minimum** Worker CPU-test architecture. Prefer **no** production D1/R2. If publication SSR truly needs D1, **propose** one empty Free D1 and **STOP for approval** before creating it | $0 | N/A | Creating D1/R2 without that approval |
| 3 | `npm run build:cloudflare:public` locally | $0 | N/A | Build/size fail |
| 4 | Create/deploy **only** the minimum approved Free **public** Worker (temporary `workers.dev`, logs on). No admin Worker | $0 | Delete Worker; `workers_dev: false` | Admin artifact; Paid upsell; wrong account |
| 5 | Tiny controlled request sample (tens of requests) | $0 | Disable workers.dev | Real Client traffic or domain used |
| 6 | Inspect Cloudflare CPU metrics / Error **1102** / Workers Logs | $0 | Disable workers.dev | Cannot read metrics |
| 7 | **STOP for ChatGPT review.** Disable temporary `workers.dev` when appropriate | $0 | N/A | Continuing into R2, Client data, DNS, or launch |

Do not continue automatically after Gate 7 into R2, real Client data,
Custom Domains, DNS, or first-Client launch. The CPU test result is its
own decision gate.

Later, only after CPU review: empty D1 (if approved), then R2 checkout
decision (default **skip**; STOP if payment is required), then domain
policy (`www` canonical, preserve MX/TXT).

Milestone 21 must still get a separate start approval. This table is not
permission to create resources.

---

## 14. Wrangler safety

Default files (`wrangler.jsonc`, `public-runtime/wrangler.jsonc`):

- `workers_dev`: false
- D1/R2 `remote`: false
- Placeholder D1 UUID and unprovisioned R2 name only
- No production resource IDs
- No deploy npm script

`npm run preflight:production` re-reads these files locally.

---

## 15. Official source list (retrieved 2026-08-16)

- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://developers.cloudflare.com/workers/observability/metrics-and-analytics/
- https://developers.cloudflare.com/workers/observability/dev-tools/cpu-usage/
- https://developers.cloudflare.com/workers/observability/logs/workers-logs/
- https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1102/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/d1/platform/limits/
- https://developers.cloudflare.com/d1/reference/faq/
- https://developers.cloudflare.com/d1/reference/time-travel/
- https://developers.cloudflare.com/d1/reference/migrations/
- https://developers.cloudflare.com/d1/best-practices/import-export-data/
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/r2/get-started/
- https://developers.cloudflare.com/r2/buckets/public-buckets/
- https://developers.cloudflare.com/r2/platform/limits/
- https://developers.cloudflare.com/billing/manage/budget-alerts/
- https://developers.cloudflare.com/billing/understand/usage-based-billing/
- https://developers.cloudflare.com/billing/understand/how-billing-works/
- https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/
