-- Stored Client Review HTML for the current saved draft.
-- Additive only. Do not modify 0001–0011.
-- review_html is generated at Create Website / Save Draft (or local
-- backfill) from websites.content_json. It is NOT copied from
-- website_publications.public_html. Empty HTML fails closed on /review.
-- Production apply of this migration is a later gated remote write.

ALTER TABLE websites
  ADD COLUMN review_html TEXT NOT NULL DEFAULT '';
