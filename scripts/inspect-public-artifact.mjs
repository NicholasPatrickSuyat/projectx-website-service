import { existsSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const handlerPath = path.join(
  root,
  "public-runtime",
  ".open-next",
  "server-functions",
  "default",
  "handler.mjs",
);
const workerPath = path.join(root, "public-runtime", ".open-next", "worker.js");

function report(filePath, extraSearch = "") {
  const raw = readFileSync(filePath);
  const gzip = gzipSync(raw);
  const text = raw.toString("utf8") + extraSearch;
  console.log(`\n${path.relative(root, filePath)}`);
  console.log(
    `uncompressed: ${raw.length} bytes (${(raw.length / 1024 / 1024).toFixed(3)} MiB)`,
  );
  console.log(
    `gzip: ${gzip.length} bytes (${(gzip.length / 1024).toFixed(2)} KiB / ${(gzip.length / 1024 / 1024).toFixed(3)} MiB)`,
  );
  const checks = [
    ["renderTemplate", /renderTemplate/],
    ["ServiceModern01", /ServiceModern01/],
    ["RestaurantModern01", /RestaurantModern01/],
    ["SalonModern01", /SalonModern01/],
    ["PBKDF2", /PBKDF2|pbkdf2/i],
    ["ADMIN_PASSWORD_HASH", /ADMIN_PASSWORD_HASH/],
    ["ADMIN_USERNAME", /ADMIN_USERNAME/],
    ["AUTH_SESSION_SECRET", /AUTH_SESSION_SECRET/],
    ["pxws_admin_session", /pxws_admin_session/],
    ["generateViaNode", /generatePublicationPublicHtmlViaNode/],
    ["execFileSync", /execFileSync/],
    ["servePublishedWebsiteHtml", /servePublishedWebsiteHtml/],
    ["public_html", /public_html/],
  ];
  for (const [label, pattern] of checks) {
    console.log(`${label}: ${pattern.test(text) ? "PRESENT" : "absent"}`);
  }
}

const dryRun = path.join(
  root,
  "public-runtime",
  ".open-next",
  "wrangler-dry-run",
  "worker.js",
);
if (existsSync(dryRun)) {
  report(dryRun);
}
