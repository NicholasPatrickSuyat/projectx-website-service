# Project X Website Service

Internal Project X application for creating professional client websites from reusable templates.

This is a private admin tool. Customers do not log in.

## Milestone 1

Project foundation only: Next.js app shell, navigation placeholders, and a demo dashboard. Client management, templates, editing, publishing, Stripe, and databases are not included yet.

## Local development

```bash
npm install
npm run db:migrate
npm run dev
```

Open [http://localhost:3002](http://localhost:3002).

Port 3002 is reserved for this project. Do not use port 3000.

Local client records are stored in Wrangler’s local D1 emulator under `.wrangler/`. This is not a Cloudflare-hosted database.

Optional development seed (never automatic):

```bash
npm run db:seed
```

```bash
npm run lint
npm run typecheck
npm run build
```

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
