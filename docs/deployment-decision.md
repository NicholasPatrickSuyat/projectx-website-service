# Milestone 17 — Production deployment preflight and cost gate

**Status:** Architecture decision approved by ChatGPT (2026-08-16). No remote resources created. No billing changes.
**Research date:** 2026-08-15 (America/Denver) / 2026-08-16 UTC
**Baseline commit:** `661ce587bf52b33e89ed2cf87bcd4789b3c6b006` (`661ce58`)
**This document does not authorize deployment.**

Milestone 18 implemented hostname → latest publication routing locally.
Milestone 19 implemented a separate public Next.js/OpenNext build target
locally (`docs/public-runtime.md`). Neither milestone created remote
resources. **NO REAL DEPLOYMENT YET.**

Approved production direction (**Option C**):

- Public Client runtime: one Cloudflare Worker on **Workers Free** (initial target)
- Private admin: remains local; do not deploy the admin application yet
- One shared production D1 and one shared production R2 (when a later milestone is approved to create them)
- Many Client hostnames on one Worker (hostname routing implemented locally in Milestone 18; not deployed)
- Keep `/media/{id}` for the first Client; no public R2 hostname yet
- PBKDF2-HMAC-SHA256 stays at **600,000** iterations
- Workers Paid, Cloudflare Access, and payment information are **not** approved
- Public OpenNext SSR CPU on Workers Free remains **INCONCLUSIVE** and must be smoke-tested before a Client site is announced production-live
- R2 provisioning/payment requirements remain a future deployment gate

Predictable and capped infrastructure cost is a hard Project X requirement.
Do not create a remote Worker, D1, R2, domain, DNS record, Zero Trust
organization, or paid subscription until ChatGPT and the operator approve
the architecture and the checklist at the end of this file.

---

## 1. Current state

Project X Website Service is a local-only internal application:

- Next.js 16.3.1 + `@opennextjs/cloudflare`
- Local D1 emulator, local filesystem media, local R2 emulator for preview
- Admin authentication (Milestone 16): one operator, PBKDF2-HMAC-SHA256 at
  **600,000** iterations, D1 session revocation, D1 login throttle
- Client Review is token-public; `/media/{id}` GET is public; `/site` and
  `/published` are admin-only local previews
- `wrangler.jsonc` uses placeholder D1/R2 IDs with `"remote": false`
- `workers_dev` is already `false`

Remote infrastructure today:

| Resource | State |
|---|---|
| Worker | NONE |
| D1 | NONE |
| R2 | NONE |
| Domains / DNS | NONE |
| Deployment | NONE |
| Paid services | NONE |
| Cost | **$0** |

Unresolved Milestone 16 blocker (still valid):

> Admin authentication uses PBKDF2-HMAC-SHA256 at 600,000 iterations.
> Cloudflare Workers Free currently has a 10 ms CPU-time limit per HTTP
> request. Local workerd timing cannot establish production CPU accounting
> for Web Crypto PBKDF2. Free-plan compatibility is therefore considered
> **INCONCLUSIVE** and must be verified/resolved before production
> deployment. Do not lower the password work factor or enable a paid
> Cloudflare plan without explicit approval.

Local wall-clock `deriveBits` on workerd was roughly 238–296 ms. That is
**not** Cloudflare production CPU accounting.

---

## 2. Current official Cloudflare facts

Sources were retrieved on the research date above. Do not treat this file as
a substitute for re-checking the live docs before any later deployment
milestone.

### 2.1 Workers Free

- 100,000 requests per day (account), reset midnight UTC
- 10 ms CPU time per HTTP request
- Gzip Worker size 3 MB; uncompressed 64 MB
- 128 MB memory
- Exceeding the daily request limit returns **Error 1027** (service stops
  for that Worker path; it does not start billing)
- Exceeding CPU returns **Error 1102** (`Worker exceeded resource limits`)
- Isolates have some infrequent-burst flexibility; consistent overage is
  terminated
- Heavier SSR / authentication / large payloads are documented as typically
  10–20 ms of CPU — already around or above the Free 10 ms limit, independent
  of PBKDF2

Sources:
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/platform/limits/

### 2.2 Workers Paid (Standard)

- Minimum **$5 USD / month** per account
- 10 million requests / month included, then **$0.30 per additional million**
- 30 million CPU-ms / month included, then **$0.02 per additional million CPU-ms**
- Default 30 s CPU per invocation; configurable up to 5 minutes (`limits.cpu_ms`)
- Gzip Worker size 10 MB
- No charge for duration/egress of Worker responses
- Usage beyond included amounts is **billed**. There is no hard monthly dollar cap.
- `cpu_ms` can limit CPU **per invocation**, which reduces runaway-CPU risk, but
  does **not** cap total monthly request or CPU-ms spend

Sources:
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/platform/limits/

### 2.3 D1

Tied to the Workers plan:

| | Workers Free | Workers Paid |
|---|---|---|
| Rows read | 5 million / day | 25 billion / month included + $0.001 / million |
| Rows written | 100,000 / day | 50 million / month included + $1.00 / million |
| Storage | 5 GB account / 500 MB per database | 5 GB included + $0.75 / GB-month; 10 GB per database |
| Databases | 10 | 50,000 |
| Time Travel | 7 days | 30 days |
| D1 queries per Worker invocation | 50 | 1,000 |

Free overage behavior: queries **error** until midnight UTC (reads/writes) or
until data is deleted (storage). Free does **not** automatically bill D1
overage.

Paid overage behavior: **billed** for extra reads, writes, and storage.

Sources:
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/d1/platform/limits/

### 2.4 R2

R2 is a **usage-based** product with a monthly free allowance (Standard class):

- Storage: 10 GB-month
- Class A (writes/lists): 1 million / month
- Class B (reads): 10 million / month
- Egress to the Internet: **free**
- Beyond the allowance: storage $0.015 / GB-month; Class A $4.50 / million;
  Class B $0.36 / million (Standard)

Overage behavior: **billed** (does not fail closed like Workers Free requests
or D1 Free). Budget alerts do **not** stop R2 usage.

Cloudflare’s billing policy treats R2 as usage-based: Cloudflare may
preauthorize a payment method; if preauthorization fails, R2 access can be
suspended and data may be deleted after 30 days. Official docs describe this
in the context of a payment method already on file. They do **not** clearly
state whether creating the first R2 bucket requires adding a card. Treat
“does first R2 require a payment method?” as **INCONCLUSIVE** until an
operator inspects the live dashboard without enabling anything.

Do not enable Cloudflare Images in this milestone (separate paid/usage product,
not evaluated here).

Sources:
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/billing/understand/billing-policy/
- https://developers.cloudflare.com/billing/understand/usage-based-billing/

### 2.5 Cloudflare Zero Trust / Access

Official setup: creating a Zero Trust organization requires choosing a
subscription plan **and entering payment details**. The Free plan still
requires this step; Cloudflare states you will not be charged for Free.

Official marketing pricing (Cloudflare Zero Trust plans page):

- Free: $0 forever, described for teams under 50 users
- Pay-as-you-go: $7 / user / month, billed annually

Developer docs confirm seats are consumed by authentication events; when seats
are exhausted, additional users are blocked.

Do **not** create an organization or enter payment information in Milestone 17.

Sources:
- https://developers.cloudflare.com/cloudflare-one/setup/
- https://developers.cloudflare.com/learning-paths/clientless-access/initial-setup/create-zero-trust-org/
- https://www.cloudflare.com/plans/zero-trust-services/

### 2.6 Spend controls

- **Budget alerts:** email when account-wide usage-based spend crosses a dollar
  threshold. **Informational only. They do not pause or cap usage.**
- **Usage notifications:** per-product metric alerts. Also informational.
- Workers Paid `limits.cpu_ms`: caps CPU **per request**, not monthly dollars.
- Workers Free / D1 Free: hard stop (errors), not a bill.
- R2 and Workers Paid overage: bill continues.

Sources:
- https://developers.cloudflare.com/billing/manage/budget-alerts/
- https://developers.cloudflare.com/billing/understand/usage-based-billing/

### 2.7 Custom domains and workers.dev

- Production should use a Workers **route or Custom Domain**, not `workers.dev`.
- `workers.dev` is treated as a Free website and is intended for hobby use.
- Custom Domains require an **active Cloudflare zone** and attach all paths of
  that hostname to the Worker. Cloudflare creates DNS and certificates.
- This repo already sets `workers_dev: false`.
- Adding a zone can use Cloudflare’s Free website plan; domain **registration**
  is a separate cost if Project X buys the name.

Sources:
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://developers.cloudflare.com/workers/configuration/routing/workers-dev/

### 2.8 OpenNext on Cloudflare

- Official path for this Next.js app: `@opennextjs/cloudflare`
- Develop with `next dev`; use OpenNext for Workers preview/deploy
- Worker gzip limit: 3 MiB Free / 10 MiB Paid
- OpenNext incremental cache on remote R2 and Cloudflare Images can add cost;
  they are **not** enabled in this repo
- Windows support is not guaranteed; WSL or Linux CI is recommended for
  production deploys
- `opennextjs-cloudflare deploy` would create remote resources — **do not run it**

Sources:
- https://opennext.js.org/cloudflare
- https://opennext.js.org/cloudflare/howtos/dev-deploy

---

## 3. Architecture options

None of these are implemented in Milestone 17.

### Option A — Single Cloudflare Worker on Workers Free

**Architecture:** One OpenNext Worker serves admin, login/PBKDF2, D1, R2,
review, media, and later published Client sites.

**Cost:** $0 if it stays on Free and D1 stays inside Free. R2 free allowance
applies; R2 overage would bill if a payment method exists.

**Security:** Current M16 auth stays in-process. Admin UI would be on the same
public origin as Client sites unless extra Access/path rules are added later.

**Complexity:** Lowest operationally (one deploy).

**PBKDF2:** Unresolved. Local deriveBits ~270 ms wall-clock. Official docs do
not say whether native Web Crypto counts as Worker CPU. Workers Free is 10 ms.
**INCONCLUSIVE, likely hostile to login if PBKDF2 is counted as CPU.** OpenNext
SSR of published pages may **also** exceed 10 ms even without hashing.

**Advantages:** Simple, $0 floor, hard request/CPU/D1 caps prevent surprise
bills.

**Disadvantages:** Login and possibly all SSR may Error 1102. Daily 100k
request cap is easy to hit if `/media/{id}` runs through the Worker. Admin and
public share one attack surface. Not a safe first-production bet without a
production CPU measurement that we are forbidden to obtain by deploying.

**Verdict:** Not recommended as the first production Client architecture.

### Option B — Single Worker on Workers Paid

**Architecture:** Same as A, but $5/month Workers Paid so PBKDF2 and SSR have
a 30 s default CPU budget (configurable).

**Cost:** **$5/month minimum**, plus usage overages for Workers requests,
CPU-ms, D1, and R2. No official monthly dollar cap. Budget alerts do not stop
spend.

**Security:** Same as A plus enough CPU for M16 hashing. Admin still public on
the same Worker unless extra controls are added.

**Complexity:** Low (one deploy). Requires a payment method.

**PBKDF2:** Practical on Paid CPU limits. Do not lower 600,000 iterations.

**Advantages:** Matches the current codebase. Custom domains work. Enough CPU
for login.

**Disadvantages:** Violates a strict reading of “predictable/capped cost”
because overages are uncapped. A traffic spike or hotlinked `/media/{id}`
loop is a billing risk, not a hard stop. Enabling Paid is exactly the kind of
billing change this milestone must not make without approval.

**Verdict:** Technically the easiest full-app deploy. Financially acceptable
**only if** ChatGPT/user explicitly accept $5/month plus uncapped usage-based
overage, with monitoring. Do not enable it in M17.

### Option C — Public website runtime + separate admin (recommended target)

**Architecture (conceptual, not implemented):**

- **Public Worker:** published Client Websites, `/media/{id}` (or later R2
  custom domain), Client Review `/review/[token]`. No PBKDF2 login.
- **Private admin:** current admin UI, editor, media admin, versions, publish,
  M16 username/password. Stays off the public Worker until a suitable admin
  host/CPU plan is approved (local-only at first Client, or a later
  fixed-price VPS — Option E).

Both sides would share the same D1 + R2 (application-level isolation). Publish
writes a snapshot; the public Worker only reads published data.

**Cost:** Public Worker can attempt Workers Free ($0, hard caps). Admin adds
$0 if it remains local, or a capped VPS later. Avoids Workers Paid unless
public SSR itself cannot run in 10 ms.

**Security:** Admin is not on the public Client origin. PBKDF2 never runs on
the public request path. Review stays token-based.

**Complexity:** Requires a later milestone to split deploy surfaces (not a
data-model rewrite). Cursor local `npm run dev` can stay one app.

**PBKDF2:** Removed from the public runtime. The M16 INCONCLUSIVE CPU issue
becomes an **admin-host** question, not a Client-site outage question.

**Advantages:** Best fit for the hard cost requirement and the unresolved
hashing CPU issue. Public failure mode on Free is Error 1027/1102 (outage),
not a surprise bill.

**Disadvantages:** Split is not built yet. First Client cannot go fully
self-serve on a public domain until the public Worker exists. OpenNext SSR
CPU on Free is still INCONCLUSIVE even without PBKDF2. Shared D1/R2 remains.

**Verdict:** **Recommended first-production direction.** Do not implement in
M17.

### Option D — Cloudflare Access in front of admin

**Architecture:** Keep one Worker (or split) and put Access on admin hostnames.
Official Free setup still requires payment details.

**Cost:** $0 for Free if seats stay within the Free offering; PAYG is
$7/user/month billed annually. Payment details are required at signup even
for Free.

**Security:** Strong identity gate in front of the admin UI. Could later
reduce reliance on app passwords, but M16 auth must **not** be removed in
this milestone.

**Complexity:** New identity surface, Access policies, possible interaction
with OpenNext cache-populate workers.dev helper if Access is applied too
broadly.

**PBKDF2:** Does **not** by itself remove hashing from the Worker. Login POST
would still run unless Access fully replaces app login (future decision).

**Advantages:** Good later hardening for a public admin URL.

**Disadvantages:** Requires payment details; does not solve Free CPU; easy to
accidentally protect public Review/media if policies are too wide.

**Verdict:** Optional later control, not the M17 hosting decision. Do not
create an organization now.

### Option E — Fixed-price VPS for admin only

Example from current official DigitalOcean Droplet pricing (retrieved
2026-08-16 UTC): Basic Droplet **$6/month** for 1 GiB / 1 vCPU / 25 GiB SSD,
billed with a **monthly cap** for that Droplet. A 512 MiB plan is $4/month
(likely too small for Next.js comfortably).

**Architecture:** Admin Next.js on a small VM (localhost or VPS). Public
Client sites still belong on Cloudflare (Option C). Shared D1/R2 via
Cloudflare API/bindings is awkward from a VPS; a VPS-only world would need a
different database story. The useful pattern is: **VPS = private admin UI**,
**Cloudflare = public Worker + D1 + R2**, with the admin talking to D1
through an approved path in a later milestone.

**Cost:** Capped VM invoice (e.g. $6/month) plus whatever Cloudflare public
plan is chosen.

**Security:** Admin not on Workers.dev; SSH/firewall required. Operator
responsibility for OS patching.

**PBKDF2:** Runs on Node.js on the VM. No Workers 10 ms CPU issue.

**Advantages:** Predictable admin hosting cost; keeps 600,000 iterations.

**Disadvantages:** Extra runtime to operate; not needed for a still-local
first-Client admin; must not become an unmanaged second production without
backup/secrets plans.

**Verdict:** Acceptable **admin** fallback if the public Worker is split and
admin must be reachable off-localhost. Not a replacement for Cloudflare
public hosting. Do not sign up in M17.

---

## 4. Public website architecture (conceptual)

`/published/[websiteId]` is a **local internal snapshot preview**, not a
customer site. Future customers need `clientdomain.com` or
`customer.projectx-host.tld`.

### Recommended multi-Client model

**One public Worker serves many Client websites.**

Do **not** create one Worker per Client. Workers Free allows 100 Workers;
Paid allows 500. Per-Client Workers multiply deploy, secrets, and CPU
risk without helping early-stage cost.

### Hostname lookup (implemented locally in Milestone 18; not deployed)

1. Client (or Project X) points the hostname at Cloudflare (Custom Domain or
   route on a Project X zone). **Not configured yet.**
2. The Worker reads `Host`.
3. D1 looks up `website_domains`:
   `hostname → website_id` (unique). Public rendering loads the **latest
   publication snapshot**, not the live draft.
4. Unknown host → clean 404. Never fall back to another Client.

Migration `0010_create_website_domains.sql` exists. Do not add migration
`0011` for DNS/ownership. Custom Domains are still not configured.

### Custom domains

- Cheapest operationally: one Worker, many Custom Domains / routes.
- Each customer domain still needs a Cloudflare zone **or** a CNAME onto a
  Project X zone that Cloudflare can proxy.
- `workers.dev` is not acceptable for Client production sites.

### Media

Today `/media/{id}` is a Worker/Next route that reads R2/filesystem and
returns bytes. Every image view is:

- 1 Worker request
- 1 D1 metadata read
- 1 R2 Class B `GetObject` (in Workers)

That is simple and keeps object keys private, but it spends Worker request
quota quickly.

Later (after approval): serve published media from an R2 custom domain or
cached path still keyed by media id, with the Worker only doing HTML. That
is cheaper at scale. Do not enable public r2.dev URLs for production.

### Isolation

Early production should keep **one shared D1** and **one shared R2**.

Reasons:

- D1 pricing is query/storage, not per-database fee
- Per-Client databases explode operational load
- Current rows already key by `website_id` / `client_id`

Required application rules (already directionally true, must stay true):

- Admin mutations require the M16 admin session
- Public hostname lookup may only load **published** snapshots for **that**
  hostname
- `/media/{id}` must not leak unpublished or other-Client objects (today it
  loads by media id; production hostname serving must not allow browsing
  another Client’s library)
- Review tokens stay unguessable and website-scoped

One Client accessing another Client’s data is an **application-layer** risk,
not a reason to provision 50 D1s for the first 50 Clients.

### Scale 1 → 10 → 50

Same Worker, same D1, same R2, more hostname rows. Bottlenecks to watch:

- Workers Free 100k requests/day if media stays on the Worker
- OpenNext SSR CPU on Free
- D1 single-threaded per database (fine at this size if queries stay indexed)

---

## 5. Cost model (estimates, not invoices)

Assumptions (labeled):

- 20 uploaded images per Client, average **200 KB** optimized (not Cloudflare
  Images)
- 1 published website per Client
- Small-business traffic: **1,000 HTML page views / Client / day**
- Average page references **8** `/media/{id}` images
- Admin: **50** authenticated page loads / day total (not per Client)
- Login: **5** PBKDF2 verifications / day
- Version History: ~20 saved versions × ~100 KB JSON ≈ 2 MB / Client
- Publication History: a few snapshots, similar order
- Media served **through the Worker** (current design)
- 30-day month

Storage:

| Clients | Image storage | JSON/versions (rough) |
|---|---|---|
| 1 | 4 MB | < 5 MB |
| 10 | 40 MB | < 50 MB |
| 25 | 100 MB | < 125 MB |
| 50 | 200 MB | < 250 MB |

All of these sit inside R2’s 10 GB free storage and D1 Free 500 MB/database
**if version history is not allowed to grow without bound**.

### Workers requests (HTML + media through Worker)

Per Client per day ≈ 1,000 HTML + 8,000 media = **9,000** requests.

| Clients | Requests / day | vs Workers Free 100k/day | vs Paid 10M/month |
|---|---|---|---|
| 1 | 9,000 | OK | OK |
| 10 | 90,000 | Near the cap | OK |
| 25 | 225,000 | **Exceeds Free** | OK (~6.8M/month) |
| 50 | 450,000 | **Exceeds Free** | OK (~13.5M/month → ~$1.05 request overage) |

If media is later moved off the Worker, HTML-only 50 Clients ≈ 50,000
requests/day, which fits Free **request** count (CPU still INCONCLUSIVE).

### R2 Class B (image reads)

50 Clients × 8,000 reads/day × 30 ≈ **12 million** / month vs 10 million free
≈ **~$0.72** Class B overage. 25 Clients ≈ 6 million (inside free). 10
Clients ≈ 2.4 million (inside free).

Class A (uploads) is negligible at 20 images × 50 Clients.

### D1

Reads dominate (publication + media metadata per view). Even a generous
**20 rows read per request** × 9,000 requests × 10 Clients ≈ 1.8 million
rows/day, under Free 5 million/day. 25 Clients at that rate exceeds Free
daily reads **if** media metadata is queried on every image GET.

Writes (saves, versions, review, auth) are small versus 100k Free writes/day
unless Version History saves huge JSON on every keystroke without batching.

Storage risk is **unbounded version/publication JSON**, not Client count
itself. A later retention policy is a deployment gate.

### CPU-risk routes

| Route | Risk |
|---|---|
| `POST /login` (PBKDF2 600k) | High on Workers Free; acceptable on Paid or Node/VPS |
| OpenNext SSR of published HTML | INCONCLUSIVE on Free (docs say SSR often 10–20 ms) |
| `/media/{id}` GET | Lower CPU, high **request** volume |
| Admin editor Server Actions | Moderate; D1 + JSON parse |
| Token Review | Moderate SSR; no PBKDF2 |

Admin vs public must be modeled separately. Public volume dwarfs admin.

### Primary risk points

1. Workers Free **request** cap if media stays on the Worker (around ~11
   Clients at these assumptions).
2. Workers Free **CPU** for login and possibly SSR (INCONCLUSIVE).
3. Workers Paid / R2 **uncapped overage** if a payment method is on file.
4. D1 Free daily reads if every image GET hits D1.
5. Version History storage growth inside a 500 MB Free database.

---

## 6. Spend / failure behavior (do not mix products)

| Product | Exceed Free / included | Automatic bill? | Service impact |
|---|---|---|---|
| Workers Free requests | Error **1027** | No | Worker path stops |
| Workers Free CPU | Error **1102** | No | That request dies |
| D1 Free reads/writes | Query errors until 00:00 UTC | No | App DB calls fail |
| D1 Free storage | Writes blocked until data deleted | No | Cannot insert |
| Workers Paid requests/CPU | Overage rates apply | **Yes** | Continues |
| D1 Paid extra usage | Overage rates apply | **Yes** | Continues |
| R2 extra usage | Overage rates apply | **Yes** | Continues |
| Access Free seats | Extra users blocked | No (until PAYG) | New logins denied |

**Uncapped billing features if enabled:** Workers Paid usage, D1 Paid usage,
R2 usage, Zero Trust PAYG seats, Cloudflare Images (not enabled).

Budget alerts **do not cap** any of the billed products.

---

## 7. Recommendation (for ChatGPT/user approval — not implemented)

**Recommended first-production architecture: Option C (approved 2026-08-16)**

Public Client websites + review + media on **one Cloudflare Worker**.
Admin/editor/PBKDF2 stays **off that public Worker** until an admin host is
explicitly approved (remain local for the first Client, or a later capped
VPS).

One shared D1, one shared R2, hostname → published website lookup later.
Keep PBKDF2 at 600,000. Do not enable Workers Paid, Access, Images, or
OpenNext remote cache R2 without a separate approval.

**Why this order of priorities:**

1. **Security:** Admin and hashing stay off the public origin; Review stays
   token-based; unpublished drafts stay unpublished.
2. **Predictable cost:** Public Free plan **fails closed** instead of billing.
3. **Low initial spend:** $0 Cloudflare until a paid plan is approved.
4. **Custom domains:** One Worker, many Custom Domains, when a zone exists.
5. **Cursor development:** Still one repo and `npm run dev` on port 3002.
6. **Isolation:** Shared D1/R2 plus hostname and published-snapshot rules.
7. **Scale:** 1 → 50 Clients is more hostnames, not more Workers.
8. **Simplicity:** Split is a deploy/routing concern, not a product rewrite.

**Expected minimum cost (if followed, no paid Cloudflare plan):** **$0 / month**
infrastructure, plus any domain registration the Client already pays.

**Predictable-cost analysis:** Workers Free and D1 Free stop rather than bill.
The remaining leak is **R2** if a payment method is added — overages bill and
are not capped. First production must either keep R2 inside free usage with
eyes on Class B, or accept that adding a card for R2 creates uncapped R2
risk.

**Blockers before any remote resource:**

- Option C public/admin split is implemented **locally** in Milestone 19; it is **not** deployed
- Public-Worker OpenNext SSR CPU on Free is still INCONCLUSIVE
- Hostname routing / published-only lookup is implemented locally (migration `0010` / `website_domains`); DNS/Custom Domains are not
- Admin remains local until a host is approved
- R2 payment-method requirement is INCONCLUSIVE
- No production secrets, backups, or migration plan exists yet

If ChatGPT instead accepts **Option B**, the honest cost statement is:
**$5/month floor, uncapped usage overage, budget alerts are not a cap.**
Stop and get that acceptance in writing before enabling Paid.

---

## 8. Deployment gates (must be approved before Milestone 18 creates remotes)

- [ ] Hosting architecture approved by ChatGPT/user (**Option C approved 2026-08-16**; later milestones still implement it)
- [ ] Current official pricing re-checked on the deployment day
- [ ] Maximum expected monthly infrastructure cost accepted (number + cap policy)
- [ ] Worker plan decision approved (Free vs Paid — Paid requires a separate yes)
- [ ] D1 plan/behavior approved (Free fail-closed vs Paid bill-on-overage)
- [ ] R2 billing behavior approved, including whether a payment method is required
- [ ] Admin authentication strategy approved (keep M16 600k; host for admin decided)
- [ ] Cloudflare CPU issue resolved or explicitly accepted (do not lower PBKDF2)
- [ ] Domain architecture approved (one Worker, hostname → published website)
- [ ] Remote resource names approved (Worker, D1, R2 — placeholders today)
- [ ] Production backup/export plan approved (D1 Time Travel limits differ by plan)
- [ ] Production secret handling approved (Worker secrets, not git)
- [ ] Data migration strategy approved (local D1/filesystem → remote D1/R2)
- [ ] Media serving model approved (Worker `/media/{id}` vs later R2 domain)
- [ ] Version/publication retention policy approved
- [ ] `workers.dev` remains disabled for production Client traffic
- [ ] Cloudflare Images / OpenNext remote incremental-cache R2 remain off unless separately approved
- [ ] No Stripe, customer accounts, OAuth, or Access org until separately approved

**No remote resource creation until these are satisfied.**

---

## 9. Future refactor notes

Milestone 19 implemented the local public/admin split
(`docs/public-runtime.md`). Still required before any production Client
site:

- Deploy a public-only Worker (not done; **NO REAL DEPLOYMENT YET**)
- Configure Custom Domains / DNS (not done)
- Re-measure public OpenNext SSR CPU on Cloudflare (local wall-clock is
  not production CPU accounting)
- Decide admin host (local vs VPS vs later Paid Worker)

Do not add Access, Stripe, or paid Cloudflare products without a separate
approval.

---

## 10. Official sources (retrieved 2026-08-15 / 2026-08-16 UTC)

- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/runtime-apis/web-crypto/
- https://developers.cloudflare.com/workers/runtime-apis/performance/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/d1/platform/limits/
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/billing/understand/billing-policy/
- https://developers.cloudflare.com/billing/understand/usage-based-billing/
- https://developers.cloudflare.com/billing/manage/budget-alerts/
- https://developers.cloudflare.com/cloudflare-one/setup/
- https://developers.cloudflare.com/learning-paths/clientless-access/initial-setup/create-zero-trust-org/
- https://www.cloudflare.com/plans/zero-trust-services/
- https://opennext.js.org/cloudflare
- https://opennext.js.org/cloudflare/howtos/dev-deploy
- https://www.digitalocean.com/pricing/droplets
