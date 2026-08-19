import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { randomUUID } from "node:crypto";
import { generatePublicationPublicHtml } from "../src/lib/website-publications/render-public-html.tsx";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wranglerCli = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");

const PUBLIC_ORIGIN = "http://127.0.0.1:3003";
const OLD_SAMPLES = 100;
const NEW_SAMPLES = 50;

const CEDAR_HOST = "cedar.localhost:3003";
const COPPER_HOST = "copper.localhost:3003";
const LINDEN_HOST = "linden.localhost:3003";
const UNKNOWN_HOST = "unknown.localhost:3003";

const CEDAR_PUBLISHED_MEDIA = "69125cd0-bcde-433c-b603-786a4f4c9e7f";
const CEDAR_UNREFERENCED_MEDIA = "97852466-8e79-4ccd-bc27-f44ce213a200";
const COPPER_MEDIA = "ff6e9372-408e-4cc1-807d-cdbc9c72ad13";
const LINDEN_MEDIA = "23358428-5d8d-463d-bd9c-32f103fec309";
const INVALID_REVIEW_TOKEN = "a".repeat(64);
const MALFORMED_REVIEW_TOKEN = "not-a-valid-token";
const SWITCH_MARKER = `PXWS-M22-SWITCH-${randomUUID()}`;

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

function percentile(sorted, p) {
  if (sorted.length === 0) {
    return 0;
  }
  const index = Math.max(
    0,
    Math.min(
      sorted.length - 1,
      Math.ceil((p / 100) * sorted.length) - 1,
    ),
  );
  return sorted[index];
}

function summarize(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  return {
    n: sorted.length,
    min: sorted[0] ?? 0,
    p50: percentile(sorted, 50),
    p75: percentile(sorted, 75),
    p90: percentile(sorted, 90),
    p99: percentile(sorted, 99),
    max: sorted[sorted.length - 1] ?? 0,
  };
}

function formatMs(value) {
  return `${value.toFixed(2)} ms`;
}

function printSummary(label, stats) {
  console.log(
    `${label}: n=${stats.n} min=${formatMs(stats.min)} p50=${formatMs(stats.p50)} p75=${formatMs(stats.p75)} p90=${formatMs(stats.p90)} p99=${formatMs(stats.p99)} max=${formatMs(stats.max)}`,
  );
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

function allRows(result) {
  const batch = Array.isArray(result) ? result[0] : result;
  const rows = batch?.results ?? batch?.result ?? [];
  return Array.isArray(rows) ? rows : [];
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function assert(name, ok, detail) {
  const label = ok ? "PASS" : "FAIL";
  console.log(`${label}  ${name}${detail ? `  (${detail})` : ""}`);
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

function readHostHandlerSource() {
  return readFileSync(
    path.join(root, "public-runtime", "src", "app", "host", "[[...slug]]", "route.ts"),
    "utf8",
  );
}

function readServeSource() {
  return readFileSync(
    path.join(root, "src", "lib", "website-publications", "serve-public-html.ts"),
    "utf8",
  );
}

function readReviewRouteSource() {
  return readFileSync(
    path.join(root, "public-runtime", "src", "app", "review", "[token]", "route.ts"),
    "utf8",
  );
}

function readReviewServeSource() {
  return readFileSync(
    path.join(root, "src", "lib", "website-review", "serve-review-html.ts"),
    "utf8",
  );
}

waitForPublic();

const cedarReview = firstRow(
  d1Json(
    "SELECT s.token FROM website_review_sessions s JOIN website_domains d ON d.website_id = s.website_id WHERE d.hostname = 'cedar.localhost' LIMIT 1;",
  ),
);
const reviewToken = cedarReview?.token ?? null;

let failures = 0;

const hostSource = readHostHandlerSource();
const serveSource = readServeSource();
const reviewRouteSource = readReviewRouteSource();
const reviewServeSource = readReviewServeSource();
failures += assert(
  "host handler does not import renderTemplate",
  !/renderTemplate/.test(hostSource) &&
    !/render-public-html/.test(hostSource) &&
    !/templates\/render/.test(hostSource),
);
failures += assert(
  "serve-public-html does not import template renderers",
  !/from ["']@\/lib\/templates\/render["']/.test(serveSource) &&
    !/render-public-html/.test(serveSource) &&
    !/generatePublicationPublicHtml/.test(serveSource),
);
failures += assert(
  "review route does not import renderTemplate",
  !/renderTemplate/.test(reviewRouteSource) &&
    !/ClientReviewControls/.test(reviewRouteSource) &&
    !/render-review-html/.test(reviewRouteSource),
);
failures += assert(
  "serve-review-html does not import template renderers",
  !/from ["']@\/lib\/templates\/render["']/.test(reviewServeSource) &&
    !/render-public-html/.test(reviewServeSource) &&
    !/generateReviewHtml/.test(reviewServeSource) &&
    !/ClientReviewControls/.test(reviewServeSource),
);

const cedar = request("/", CEDAR_HOST);
failures += assert(
  "Cedar host → Cedar active publication",
  cedar.status === 200 && /Cedar/i.test(cedar.body) && !hasAdminNav(cedar.body),
  `status=${cedar.status}`,
);
failures += assert(
  "Cedar published HTML is not Next RSC/SSR payload",
  cedar.status === 200 &&
    !/self\.__next_f/.test(cedar.body) &&
    /publication-runtime\.css/.test(cedar.body),
);
failures += assert(
  "Cedar SEO index, follow",
  cedar.status === 200 &&
    /name="robots" content="index, follow"/.test(cedar.body) &&
    /<title>/i.test(cedar.body),
);

const copper = request("/", COPPER_HOST);
failures += assert(
  "Copper host → Copper active publication",
  copper.status === 200 && /Copper/i.test(copper.body),
  `status=${copper.status}`,
);

const linden = request("/", LINDEN_HOST);
failures += assert(
  "Linden host → Linden active publication",
  linden.status === 200 && /Linden/i.test(linden.body),
  `status=${linden.status}`,
);

const unknown = request("/", UNKNOWN_HOST);
failures += assert(
  "unknown hostname → 404 generic unavailable",
  unknown.status === 404 &&
    /Website unavailable/.test(unknown.body) &&
    /noindex/.test(unknown.body) &&
    !hasWebsiteUuid(unknown.body),
  `status=${unknown.status}`,
);

const malformed = request("/", "not a host");
failures += assert(
  "malformed hostname → fail closed",
  malformed.status === 404 || malformed.status >= 400,
  `status=${malformed.status}`,
);

const cedarCss = request("/publication-runtime.css", CEDAR_HOST);
failures += assert(
  "publication-runtime.css served",
  cedarCss.status === 200 && /sm01|rm01|sa01/.test(cedarCss.body),
  `status=${cedarCss.status}`,
);

const cedarMedia = request(`/media/${CEDAR_PUBLISHED_MEDIA}`, CEDAR_HOST);
failures += assert(
  "same-Website referenced media → 200",
  cedarMedia.status === 200,
  `status=${cedarMedia.status}`,
);
failures += assert(
  "cross-Website Copper media from Cedar → 404",
  request(`/media/${COPPER_MEDIA}`, CEDAR_HOST).status === 404,
);
failures += assert(
  "cross-Website Linden media from Cedar → 404",
  request(`/media/${LINDEN_MEDIA}`, CEDAR_HOST).status === 404,
);
failures += assert(
  "same-Website unreferenced media → 404",
  request(`/media/${CEDAR_UNREFERENCED_MEDIA}`, CEDAR_HOST).status === 404,
);
failures += assert(
  "unknown host media → 404",
  request(`/media/${CEDAR_PUBLISHED_MEDIA}`, UNKNOWN_HOST).status === 404,
);

const cedarWebsite = firstRow(
  d1Json(
    "SELECT w.id, w.content_json FROM websites w JOIN website_domains d ON d.website_id = w.id WHERE d.hostname = 'cedar.localhost' LIMIT 1;",
  ),
);
if (!cedarWebsite?.id || !cedarWebsite.content_json) {
  failures += assert("draft edit without publication leaves public unchanged", false, "missing Cedar website");
} else {
  const before = request("/", CEDAR_HOST).body;
  d1Json(
    `UPDATE websites SET content_json = ${sqlString('{"draftOnly":"PXWS-M22-DRAFT-LEAK"}')} WHERE id = ${sqlString(cedarWebsite.id)};`,
  );
  const afterDraft = request("/", CEDAR_HOST);
  d1Json(
    `UPDATE websites SET content_json = ${sqlString(cedarWebsite.content_json)} WHERE id = ${sqlString(cedarWebsite.id)};`,
  );
  failures += assert(
    "draft edit without publication leaves public unchanged",
    afterDraft.status === 200 &&
      afterDraft.body === before &&
      !/PXWS-M22-DRAFT-LEAK/.test(afterDraft.body),
    `status=${afterDraft.status}`,
  );
}

const live = firstRow(
  d1Json(
    `SELECT w.id AS website_id, w.active_publication_id, p.publication_number, p.template_id, p.content_json
     FROM websites w
     JOIN website_domains d ON d.website_id = w.id
     JOIN website_publications p ON p.id = w.active_publication_id
     WHERE d.hostname = 'cedar.localhost'
     LIMIT 1;`,
  ),
);

if (!live?.website_id || !live.active_publication_id) {
  failures += assert("new publication switches public output", false, "missing Cedar active publication");
  failures += assert("rollback restores previous immutable publication", false, "skipped");
} else {
  const nextNumber = Number(live.publication_number) + 1;
  const switchId = randomUUID();
  const now = new Date().toISOString();
  const switchHtml = `<!DOCTYPE html><html><head><title>Switch</title><meta name="robots" content="index, follow"/></head><body><p>${SWITCH_MARKER}</p></body></html>`;
  d1Json(
    `INSERT INTO website_publications (
      id, website_id, publication_number, template_id, content_json, public_html, published_at, created_at
    ) VALUES (
      ${sqlString(switchId)},
      ${sqlString(live.website_id)},
      ${nextNumber},
      ${sqlString(live.template_id)},
      ${sqlString(live.content_json)},
      ${sqlString(switchHtml)},
      ${sqlString(now)},
      ${sqlString(now)}
    );`,
  );
  d1Json(
    `UPDATE websites SET active_publication_id = ${sqlString(switchId)} WHERE id = ${sqlString(live.website_id)};`,
  );
  const switched = request("/", CEDAR_HOST);
  failures += assert(
    "new publication switches public output",
    switched.status === 200 && switched.body.includes(SWITCH_MARKER),
    `status=${switched.status}`,
  );
  d1Json(
    `UPDATE websites SET active_publication_id = ${sqlString(live.active_publication_id)} WHERE id = ${sqlString(live.website_id)};`,
  );
  d1Json(
    `DELETE FROM website_publications WHERE id = ${sqlString(switchId)};`,
  );
  const restored = request("/", CEDAR_HOST);
  failures += assert(
    "rollback restores previous immutable publication",
    restored.status === 200 &&
      /Cedar/i.test(restored.body) &&
      !restored.body.includes(SWITCH_MARKER),
    `status=${restored.status}`,
  );
}

if (!reviewToken) {
  failures += assert("review valid token → 200", false, "no cedar review session");
  failures += assert("review referenced draft media → 200", false, "skipped");
  failures += assert("review cross-Website media → 404", false, "skipped");
} else {
  const review = request(`/review/${reviewToken}`, "127.0.0.1:3003");
  failures += assert(
    "review valid token → 200",
    review.status === 200 && /Project X review/i.test(review.body),
    `status=${review.status}`,
  );
  failures += assert(
    "review valid token is stored HTML, not Next RSC",
    review.status === 200 &&
      /Project X review/i.test(review.body) &&
      !/self\.__next_f/.test(review.body) &&
      /publication-runtime\.css/.test(review.body) &&
      /name="robots" content="noindex, nofollow"/.test(review.body),
    `status=${review.status}`,
  );
  const reviewMedia = curl([
    "-H",
    "Host: 127.0.0.1:3003",
    "-H",
    `Referer: ${PUBLIC_ORIGIN}/review/${reviewToken}`,
    `${PUBLIC_ORIGIN}/media/${CEDAR_PUBLISHED_MEDIA}`,
  ]);
  failures += assert(
    "review referenced draft media → 200",
    reviewMedia.status === 200,
    `status=${reviewMedia.status}`,
  );
  const reviewUnrelated = curl([
    "-H",
    "Host: 127.0.0.1:3003",
    "-H",
    `Referer: ${PUBLIC_ORIGIN}/review/${reviewToken}`,
    `${PUBLIC_ORIGIN}/media/${LINDEN_MEDIA}`,
  ]);
  failures += assert(
    "review cross-Website media → 404",
    reviewUnrelated.status === 404,
    `status=${reviewUnrelated.status}`,
  );
}

failures += assert(
  "invalid review token → 404",
  request(`/review/${INVALID_REVIEW_TOKEN}`, "127.0.0.1:3003").status === 404,
);
const malformedReview = request(`/review/${MALFORMED_REVIEW_TOKEN}`, "127.0.0.1:3003");
failures += assert(
  "malformed review token → generic 404",
  malformedReview.status === 404 &&
    /Review unavailable/.test(malformedReview.body) &&
    /noindex, nofollow/.test(malformedReview.body) &&
    !/self\.__next_f/.test(malformedReview.body),
  `status=${malformedReview.status}`,
);

const adminPaths = [
  ["/login", "login"],
  ["/clients", "clients"],
  ["/websites", "websites"],
  ["/settings", "settings"],
  ["/support-requests", "support-requests"],
  ["/site/11a1dcd6-96d8-4f05-a075-810322e0ba16", "site"],
  ["/published/11a1dcd6-96d8-4f05-a075-810322e0ba16", "published"],
];
for (const [pathname] of adminPaths) {
  const result = request(pathname, CEDAR_HOST);
  const loginRedirect =
    /(?:^|\n)location:\s*\/login/i.test(result.headerText) ||
    /Sign in/i.test(result.body);
  failures += assert(
    `public ${pathname} → 404`,
    result.status === 404 && !loginRedirect && !hasAdminNav(result.body),
    `status=${result.status}`,
  );
}

const publications = allRows(
  d1Json(
    `SELECT p.template_id, p.content_json, d.hostname
     FROM website_publications p
     JOIN websites w ON w.active_publication_id = p.id
     JOIN website_domains d ON d.website_id = w.id
     WHERE d.hostname IN ('cedar.localhost', 'copper.localhost', 'linden.localhost')
     ORDER BY d.hostname;`,
  ),
);

const oldSamples = [];
for (const publication of publications) {
  const html = generatePublicationPublicHtml(
    publication.template_id,
    publication.content_json,
  );
  if (!html) {
    failures += assert(
      `old-path render ${publication.hostname}`,
      false,
      "render returned null",
    );
    continue;
  }
  for (let i = 0; i < OLD_SAMPLES; i += 1) {
    const started = performance.now();
    generatePublicationPublicHtml(publication.template_id, publication.content_json);
    oldSamples.push(performance.now() - started);
  }
}

const newSamples = [];
for (const host of [CEDAR_HOST, COPPER_HOST, LINDEN_HOST]) {
  for (let i = 0; i < NEW_SAMPLES; i += 1) {
    const started = performance.now();
    const result = request("/", host);
    newSamples.push(performance.now() - started);
    if (result.status !== 200) {
      failures += assert(`new-path GET ${host}`, false, `status=${result.status}`);
      break;
    }
  }
}

console.log("\nLOCAL PERFORMANCE (NOT Cloudflare production CPU)");
console.log(
  "OLD conceptual path: publication snapshot → renderTemplate() → renderToStaticMarkup",
);
printSummary("OLD local render", summarize(oldSamples));
console.log(
  "NEW normal published path: hostname → stored public_html HTTP GET (includes local HTTP/D1 overhead)",
);
printSummary("NEW local published GET", summarize(newSamples));

if (failures > 0) {
  console.error(`\n${failures} static publication smoke test(s) failed.`);
  process.exit(1);
}

console.log("\nAll static publication smoke tests passed.");
