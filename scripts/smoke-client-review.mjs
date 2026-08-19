import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, randomUUID } from "node:crypto";
import { getPlatformProxy } from "wrangler";
import { generateReviewHtml } from "../src/lib/website-review/render-review-html.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wranglerCli = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
const PUBLIC_ORIGIN = "http://127.0.0.1:3003";
const CEDAR_HOST = "cedar.localhost:3003";
const COPPER_HOST = "copper.localhost:3003";
const CEDAR_PUBLISHED_MEDIA = "69125cd0-bcde-433c-b603-786a4f4c9e7f";
const CEDAR_UNREFERENCED_MEDIA = "97852466-8e79-4ccd-bc27-f44ce213a200";
const COPPER_MEDIA = "ff6e9372-408e-4cc1-807d-cdbc9c72ad13";
const ARBITRARY_MEDIA = "00000000-0000-4000-8000-000000000099";
const MALFORMED_TOKEN = "not-a-valid-token";
const NONEXISTENT_TOKEN = "b".repeat(64);
const DRAFT_MARKER = `PXWS-M26-DRAFT-${randomUUID()}`;

function curl(args) {
  const output = execFileSync("curl.exe", ["-sS", "-D", "-", "-o", "-", ...args], {
    encoding: "buffer",
    maxBuffer: 20 * 1024 * 1024,
  });
  const text = output.toString("latin1");
  const split = text.indexOf("\r\n\r\n");
  const headerText = split === -1 ? text : text.slice(0, split);
  const body = split === -1 ? "" : text.slice(split + 4);
  const statusMatch = /^HTTP\/\d(?:\.\d)?\s+(\d+)/m.exec(headerText);
  const status = statusMatch ? Number(statusMatch[1]) : 0;
  return { status, headerText, body };
}

function request(pathname, host, extraArgs = []) {
  return curl(["-H", `Host: ${host}`, `${PUBLIC_ORIGIN}${pathname}`, ...extraArgs]);
}

function d1Json(sql) {
  const raw = execFileSync(
    process.execPath,
    [
      wranglerCli,
      "d1",
      "execute",
      "projectx-website-service",
      "--local",
      "--json",
      "--command",
      sql,
    ],
    { encoding: "utf8", cwd: root },
  );
  return JSON.parse(raw);
}

function firstRow(result) {
  const batch = Array.isArray(result) ? result[0] : result;
  const rows = batch?.results ?? batch?.result ?? [];
  return Array.isArray(rows) ? rows[0] ?? null : null;
}

function assert(name, ok, detail) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
  return ok ? 0 : 1;
}

function hasAdminNav(html) {
  return /href="\/(clients|websites|templates|settings|login|support-requests)"/i.test(
    html,
  );
}

function hasWebsiteUuid(html) {
  return /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(
    html,
  );
}

function genericUnavailable(result) {
  return (
    result.status === 404 &&
    /Review unavailable/.test(result.body) &&
    /invalid or no longer active/.test(result.body) &&
    /noindex, nofollow/.test(result.body) &&
    !/self\.__next_f/.test(result.body) &&
    !hasWebsiteUuid(result.body) &&
    !hasAdminNav(result.body)
  );
}

function waitForPublic() {
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    try {
      const result = request("/", "127.0.0.1:3003");
      if (result.status > 0) {
        return;
      }
    } catch {
      // retry
    }
  }
  throw new Error("Public runtime on port 3003 did not become ready.");
}

waitForPublic();

let failures = 0;

const reviewRoute = readFileSync(
  path.join(root, "public-runtime", "src", "app", "review", "[token]", "route.ts"),
  "utf8",
);
const serveReview = readFileSync(
  path.join(root, "src", "lib", "website-review", "serve-review-html.ts"),
  "utf8",
);
const hostRoute = readFileSync(
  path.join(root, "public-runtime", "src", "app", "host", "[[...slug]]", "route.ts"),
  "utf8",
);
const migration0012 = readFileSync(
  path.join(root, "migrations", "0012_review_html.sql"),
  "utf8",
);

failures += assert(
  "review route is a Route Handler without template SSR",
  /serveClientReviewHtml/.test(reviewRoute) &&
    !/renderTemplate/.test(reviewRoute) &&
    !/ClientReviewControls/.test(reviewRoute),
);
failures += assert(
  "serve-review-html does not generate or render templates",
  !/renderTemplate/.test(serveReview) &&
    !/generateReviewHtml/.test(serveReview) &&
    !/render-public-html/.test(serveReview) &&
    /isReviewToken/.test(serveReview),
);
failures += assert(
  "published host path is unchanged stored public_html",
  /servePublishedWebsiteHtml/.test(hostRoute) && !/renderTemplate/.test(hostRoute),
);
failures += assert(
  "0012 only adds websites.review_html",
  /ALTER TABLE websites\s+ADD COLUMN review_html TEXT NOT NULL DEFAULT ''/.test(
    migration0012,
  ) && !/ALTER TABLE website_publications/.test(migration0012),
);

const generated = generateReviewHtml("service-modern-01", '{"not":"valid"}');
failures += assert("invalid draft JSON does not generate review HTML", generated === null);

const cedar = firstRow(
  d1Json(
    `SELECT w.id AS website_id, w.template_id, w.content_json, w.review_html,
            s.token, s.status, p.public_html
     FROM websites w
     JOIN website_domains d ON d.website_id = w.id
     JOIN website_review_sessions s ON s.website_id = w.id
     LEFT JOIN website_publications p ON p.id = w.active_publication_id
     WHERE d.hostname = 'cedar.localhost'
     LIMIT 1;`,
  ),
);
const copper = firstRow(
  d1Json(
    `SELECT s.token
     FROM website_review_sessions s
     JOIN website_domains d ON d.website_id = s.website_id
     WHERE d.hostname = 'copper.localhost'
     LIMIT 1;`,
  ),
);

if (!cedar?.token || !cedar.website_id) {
  failures += assert("Cedar review fixture exists", false, "missing local Cedar review");
  process.exit(1);
}

failures += assert(
  "Cedar review_html is stored and is not the publication snapshot",
  typeof cedar.review_html === "string" &&
    cedar.review_html.includes("Project X review") &&
    cedar.review_html.includes("__PXWS_REVIEW_TOKEN__") &&
    !cedar.review_html.includes(cedar.token) &&
    cedar.review_html !== cedar.public_html,
);

const valid = request(`/review/${cedar.token}`, "127.0.0.1:3003");
failures += assert(
  "valid token → current draft review HTML",
  valid.status === 200 &&
    /Project X review/.test(valid.body) &&
    /not the live website/.test(valid.body) &&
    /Request a change/.test(valid.body) &&
    /Approve Website|Approved/.test(valid.body) &&
    !/self\.__next_f/.test(valid.body) &&
    /noindex, nofollow/.test(valid.body) &&
    /x-robots-tag:\s*noindex, nofollow/i.test(valid.headerText) &&
    !hasAdminNav(valid.body) &&
    !/pxws_admin_session/i.test(valid.headerText) &&
    valid.body.includes(cedar.token) &&
    !/__PXWS_REVIEW_TOKEN__/.test(valid.body),
  `status=${valid.status}`,
);

const malformed = request(`/review/${MALFORMED_TOKEN}`, "127.0.0.1:3003");
failures += assert("malformed token → generic 404", genericUnavailable(malformed));

const nonexistent = request(`/review/${NONEXISTENT_TOKEN}`, "127.0.0.1:3003");
failures += assert(
  "well-formed nonexistent token → generic 404",
  genericUnavailable(nonexistent) && nonexistent.body === malformed.body,
);

if (copper?.token) {
  const copperReview = request(`/review/${copper.token}`, "127.0.0.1:3003");
  failures += assert(
    "token A cannot expose Website B",
    valid.status === 200 &&
      copperReview.status === 200 &&
      valid.body.includes("Cedar Ridge Handyman") &&
      !valid.body.includes("Copper Finch Kitchen") &&
      copperReview.body.includes("Copper Finch Kitchen") &&
      !copperReview.body.includes("Cedar Ridge Handyman"),
  );
} else {
  failures += assert("token A cannot expose Website B", false, "no Copper token");
}

const reviewMedia = curl([
  "-H",
  "Host: 127.0.0.1:3003",
  "-H",
  `Referer: ${PUBLIC_ORIGIN}/review/${cedar.token}`,
  `${PUBLIC_ORIGIN}/media/${CEDAR_PUBLISHED_MEDIA}`,
]);
failures += assert(
  "review referenced media → 200",
  reviewMedia.status === 200,
  `status=${reviewMedia.status}`,
);

const unreferenced = curl([
  "-H",
  "Host: 127.0.0.1:3003",
  "-H",
  `Referer: ${PUBLIC_ORIGIN}/review/${cedar.token}`,
  `${PUBLIC_ORIGIN}/media/${CEDAR_UNREFERENCED_MEDIA}`,
]);
failures += assert(
  "unreferenced media denied",
  unreferenced.status === 404,
  `status=${unreferenced.status}`,
);

const crossMedia = curl([
  "-H",
  "Host: 127.0.0.1:3003",
  "-H",
  `Referer: ${PUBLIC_ORIGIN}/review/${cedar.token}`,
  `${PUBLIC_ORIGIN}/media/${COPPER_MEDIA}`,
]);
failures += assert(
  "cross-Website media denied",
  crossMedia.status === 404,
  `status=${crossMedia.status}`,
);

const arbitraryMedia = curl([
  "-H",
  "Host: 127.0.0.1:3003",
  "-H",
  `Referer: ${PUBLIC_ORIGIN}/review/${cedar.token}`,
  `${PUBLIC_ORIGIN}/media/${ARBITRARY_MEDIA}`,
]);
failures += assert(
  "arbitrary media ID denied",
  arbitraryMedia.status === 404 && !hasWebsiteUuid(arbitraryMedia.body),
  `status=${arbitraryMedia.status}`,
);

const published = request("/", CEDAR_HOST);
failures += assert(
  "published hostname still serves stored public_html",
  published.status === 200 &&
    /Cedar/i.test(published.body) &&
    !/Project X review/.test(published.body) &&
    !/self\.__next_f/.test(published.body) &&
    /publication-runtime\.css/.test(published.body) &&
    /name="robots" content="index, follow"/.test(published.body),
  `status=${published.status}`,
);

const proxy = await getPlatformProxy({
  configPath: path.join(root, "wrangler.jsonc"),
  persist: true,
});

try {
  const db = proxy.env.DB;
  const originalContent = cedar.content_json;
  const originalReviewHtml = cedar.review_html;
  const originalToken = cedar.token;
  const parsed = JSON.parse(originalContent);
  if (!parsed?.business?.businessName) {
    throw new Error("Cedar draft JSON missing business.businessName");
  }
  parsed.business.businessName = DRAFT_MARKER;
  const nextJson = JSON.stringify(parsed);
  const nextHtml = generateReviewHtml(cedar.template_id, nextJson);
  if (!nextHtml) {
    throw new Error("Could not generate mutated Cedar review HTML");
  }

  await db
    .prepare(
      `UPDATE websites SET content_json = ?, review_html = ? WHERE id = ?`,
    )
    .bind(nextJson, nextHtml, cedar.website_id)
    .run();

  const afterDraft = request(`/review/${originalToken}`, "127.0.0.1:3003");
  const afterPublished = request("/", CEDAR_HOST);
  failures += assert(
    "Save Draft behavior: review shows new draft without Publish",
    afterDraft.status === 200 &&
      afterDraft.body.includes(DRAFT_MARKER) &&
      /Project X review/.test(afterDraft.body),
    `status=${afterDraft.status}`,
  );
  failures += assert(
    "draft edit does not alter published Website",
    afterPublished.status === 200 &&
      !afterPublished.body.includes(DRAFT_MARKER) &&
      /Cedar/i.test(afterPublished.body),
    `status=${afterPublished.status}`,
  );

  await db
    .prepare(
      `UPDATE websites SET content_json = ?, review_html = ? WHERE id = ?`,
    )
    .bind(originalContent, originalReviewHtml, cedar.website_id)
    .run();

  const restoredReview = request(`/review/${originalToken}`, "127.0.0.1:3003");
  failures += assert(
    "review restore after draft-isolation test",
    restoredReview.status === 200 && !restoredReview.body.includes(DRAFT_MARKER),
    `status=${restoredReview.status}`,
  );

  const revokedToken = randomBytes(32).toString("hex");
  await db
    .prepare(`UPDATE website_review_sessions SET token = ? WHERE website_id = ?`)
    .bind(revokedToken, cedar.website_id)
    .run();

  const revoked = request(`/review/${originalToken}`, "127.0.0.1:3003");
  const regenerated = request(`/review/${revokedToken}`, "127.0.0.1:3003");
  failures += assert(
    "regenerated/revoked token → generic 404",
    genericUnavailable(revoked),
  );
  failures += assert(
    "new token after regeneration → 200",
    regenerated.status === 200 && /Project X review/.test(regenerated.body),
    `status=${regenerated.status}`,
  );

  await db
    .prepare(`UPDATE website_review_sessions SET token = ? WHERE website_id = ?`)
    .bind(originalToken, cedar.website_id)
    .run();
} finally {
  await proxy.dispose();
}

if (failures > 0) {
  console.error(`\n${failures} Client Review smoke test(s) failed.`);
  process.exit(1);
}

console.log("\nAll Client Review smoke tests passed.");
