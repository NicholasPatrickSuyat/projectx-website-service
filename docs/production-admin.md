# Production admin management

**Admin stays local/private.** This is not a public admin Worker and not a
Client launch.

## Production D1

| Field | Value |
|---|---|
| Name | `projectx-websites-production` |
| UUID | `db47d1af-bc9c-47f0-ad8a-1377971dbd24` |
| Plan | Workers Free D1 |
| Migrations | `0001`–`0012` applied remotely. `0012` adds `websites.review_html TEXT NOT NULL DEFAULT ''`. |
| Seed data | **None.** Production starts empty. |

The UUID is a resource identifier, not a secret. It belongs only in
`wrangler.production-admin.jsonc`.

## Commands

| Command | Port | Database | Startup |
|---|---|---|---|
| `npm run dev` | 3002 | Local D1 emulator | Local migrate + local HTML backfill |
| `npm run admin:production` | **3004** | Remote `projectx-websites-production` | **No** migrate, seed, backfill, or reset |
| `npm run dev:public` | 3003 | Local D1 emulator | Local public runtime |

`npm run admin:production` requires:

- `PXWS_PRODUCTION_ADMIN=1`
- `PXWS_ADMIN_PRODUCTION_COMMAND=1` (set only by this command)
- `wrangler.production-admin.jsonc` with `remote: true` and the production UUID
- OpenNext `remoteBindings: true` so D1 `remote: true` is not ignored
- gitignored `.dev.vars.production-admin`
- **no** R2 binding
- production `MEDIA_KV` bound to `projectx-websites-media` (`remote: true`)

If the remote D1 schema is missing, production admin **fails closed**. It does
not migrate, seed, or fall back to the local emulator.

Media writes in production admin require `MEDIA_KV`. Missing `MEDIA_KV` fails
closed. Uploads do not write the local filesystem and do not use R2.

If the remote D1 schema is missing, production admin **fails closed**. It does
not migrate, seed, or fall back to the local emulator.

It **fails closed** if those are missing. It does not fall back to the local
emulator or to `.dev.vars`. Setting `PXWS_PRODUCTION_ADMIN=1` on
`npm run dev` is refused; only `npm run admin:production` sets
`PXWS_ADMIN_PRODUCTION_COMMAND=1`.

## Banner

Production-management mode shows a persistent red banner on every page,
including `/login`:

**PRODUCTION MANAGEMENT MODE**  
You are editing live production data.

Normal `npm run dev` does not show this banner.

## Credentials

Store production-admin credentials only in `.dev.vars.production-admin`
(gitignored). Use `.dev.vars.production-admin.example` as the template.

Do **not**:

- commit username, password, hash, or session secret
- copy `.dev.vars` into the production-admin file
- create remote Worker secrets (admin is not deployed)

Generate a missing local file with:

```bash
node scripts/ensure-production-admin-vars.mjs
```

That script does not print secret values. Open the gitignored file locally.

Production admin uses cookie `pxws_production_admin_session`. Local admin
keeps `pxws_admin_session`.

## Backup / export

Empty-schema export (operator machine, gitignored):

```bash
npx wrangler d1 export projectx-websites-production --remote --config wrangler.production-admin.jsonc --output backups/d1/projectx-websites-production-empty.sql -y
```

`/backups/` is gitignored. Do not commit dumps.

Time Travel (Free, 7 days) is always on:

```bash
npx wrangler d1 time-travel info projectx-websites-production --config wrangler.production-admin.jsonc
```

## Restore (do not run unless recovering)

Time Travel **overwrites** the current database:

```bash
npx wrangler d1 time-travel restore projectx-websites-production --bookmark=<bookmark> --config wrangler.production-admin.jsonc
```

SQL import is destructive. Prefer restoring into a **new** D1 and re-binding
`wrangler.production-admin.jsonc` rather than importing over live production.

Do **not** import through R2. Large `d1 execute` imports can use Cloudflare's
internal R2 pipeline; this project has not enabled account R2.

## Forbidden

- `npm run dev` against production D1
- automatic remote migrate/seed/backfill/reset on admin startup
- remote R2 / `MEDIA` binding
- Workers Paid
- Custom Domains / DNS
- public admin Worker
- seeding Cedar, Copper, Linden, or Kickyuni into production
- committing `.dev.vars.production-admin` or `/backups/`

## First Client

Not in this milestone. Create the first real Client only after ChatGPT
approves onboarding, and only from production-management mode on port 3004.
