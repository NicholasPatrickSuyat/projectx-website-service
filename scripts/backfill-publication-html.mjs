import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPlatformProxy } from "wrangler";
import { generatePublicationPublicHtml } from "../src/lib/website-publications/render-public-html.tsx";

// Local D1 emulator only. Never connect to production D1. Never create
// publications, never modify drafts, and never overwrite non-empty public_html.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const proxy = await getPlatformProxy({
  configPath: path.join(root, "wrangler.jsonc"),
  persist: true,
});

try {
  const db = proxy.env.DB;
  if (!db) {
    throw new Error("Local D1 binding DB is missing.");
  }

  const pending = await db
    .prepare(
      `SELECT id, template_id, content_json
       FROM website_publications
       WHERE public_html IS NULL OR length(public_html) = 0`,
    )
    .all();
  const rows = pending.results ?? [];

  if (rows.length === 0) {
    console.log("Publication HTML backfill: nothing to do.");
  } else {
    let updated = 0;
    for (const row of rows) {
      const html = generatePublicationPublicHtml(row.template_id, row.content_json);
      if (!html) {
        throw new Error(
          `Could not generate public HTML for publication ${row.id} (${row.template_id}).`,
        );
      }
      await db
        .prepare(
          `UPDATE website_publications
           SET public_html = ?
           WHERE id = ?
             AND (public_html IS NULL OR length(public_html) = 0)`,
        )
        .bind(html, row.id)
        .run();
      updated += 1;
    }
    console.log(`Publication HTML backfill: generated ${updated} snapshot(s).`);
  }

  await db
    .prepare(
      `UPDATE websites
       SET active_publication_id = (
         SELECT p.id
         FROM website_publications p
         WHERE p.website_id = websites.id
         ORDER BY p.publication_number DESC
         LIMIT 1
       )
       WHERE active_publication_id IS NULL
         AND EXISTS (
           SELECT 1 FROM website_publications p WHERE p.website_id = websites.id
         )`,
    )
    .run();
} finally {
  await proxy.dispose();
}
