# Project X Website Service

Internal Project X application for creating professional client websites from reusable templates.

This is a private admin tool. Customers do not log in.

**Admin authentication is implemented for this internal tool. Do not expose
the application publicly with real Client data until a later deployment
milestone is explicitly approved.**

## Local development

```bash
npm install
npm run db:migrate
npm run dev
```

Open [http://localhost:3002](http://localhost:3002).

Port 3002 is reserved for this project. Do not use port 3000.

Local client records are stored in Wrangler’s local D1 emulator under `.wrangler/`. This is not a Cloudflare-hosted database.

Website media uploaded in local development is stored under `storage/` and is gitignored.

Local admin authentication uses gitignored `.dev.vars` values. Copy
[`.dev.vars.example`](.dev.vars.example), set `ADMIN_USERNAME` and
`AUTH_SESSION_SECRET`, and generate `ADMIN_PASSWORD_HASH` with:

```bash
node scripts/hash-admin-password.mjs "<your-local-password>"
```

Do not commit passwords, password hashes used as production credentials, or
session secrets. Production must later use Cloudflare Worker secrets, not git.

Unauthenticated visits to internal admin routes redirect to `/login`.
Client Review remains token-based at `/review/[token]` and does not use the
admin login. `/media/[id]` stays available for legitimate rendered Website
images. `/site/[websiteId]` and `/published/[websiteId]` are local preview
routes and require admin authentication.

Optional development seed (never automatic):

```bash
npm run db:seed
```

```bash
npm run lint
npm run typecheck
npm run build
```

## Production readiness (Milestone 15)

The current architecture can later run on Cloudflare Workers with D1 and R2.
Milestone 15 does **not** deploy, create remote resources, or enable billing.

Cloudflare-target build (local only, does not deploy):

```bash
npm run build:cloudflare
```

Local Workers-runtime preview on port 3002 (does not deploy):

```bash
npm run preview:cloudflare
```

There is no `deploy` npm script. See [docs/production.md](docs/production.md)
for architecture, future deployment requirements, cost-safety notes, and the
production-readiness checklist.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Local Wrangler D1 emulator
- `@opennextjs/cloudflare` production-target adapter (not deployed)
