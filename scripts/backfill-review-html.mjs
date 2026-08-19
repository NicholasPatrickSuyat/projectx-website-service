import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPlatformProxy } from "wrangler";
import { generateReviewHtml } from "../src/lib/website-review/render-review-html.ts";

// Local D1 emulator only. Never connect to production D1. Never modify
// drafts, publications, or overwrite non-empty review_html.

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
       FROM websites
       WHERE review_html IS NULL OR length(review_html) = 0`,
    )
    .all();
  const rows = pending.results ?? [];

  if (rows.length === 0) {
    console.log("Review HTML backfill: nothing to do.");
  } else {
    let updated = 0;
    for (const row of rows) {
      const html = generateReviewHtml(row.template_id, row.content_json);
      if (!html) {
        throw new Error(
          `Could not generate review HTML for website ${row.id} (${row.template_id}).`,
        );
      }
      await db
        .prepare(
          `UPDATE websites
           SET review_html = ?
           WHERE id = ?
             AND (review_html IS NULL OR length(review_html) = 0)`,
        )
        .bind(html, row.id)
        .run();
      updated += 1;
    }
    console.log(`Review HTML backfill: generated ${updated} draft document(s).`);
  }
} finally {
  await proxy.dispose();
}
