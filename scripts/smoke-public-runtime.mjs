import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wranglerCli = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");

const PUBLIC_ORIGIN = "http://127.0.0.1:3003";
const SAMPLES = 5;

const CEDAR_HOST = "cedar.localhost:3003";
const COPPER_HOST = "copper.localhost:3003";
const LINDEN_HOST = "linden.localhost:3003";
const UNKNOWN_HOST = "unknown.localhost:3003";

const CEDAR_PUBLISHED_MEDIA = "69125cd0-bcde-433c-b603-786a4f4c9e7f";
const CEDAR_UNREFERENCED_MEDIA = "97852466-8e79-4ccd-bc27-f44ce213a200";
const COPPER_MEDIA = "ff6e9372-408e-4cc1-807d-cdbc9c72ad13";
const LINDEN_MEDIA = "23358428-5d8d-463d-bd9c-32f103fec309";
const INVALID_REVIEW_TOKEN = "a".repeat(64);

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

function request(path, host, extraArgs = []) {
  return curl(["-H", `Host: ${host}`, `${PUBLIC_ORIGIN}${path}`, ...extraArgs]);
}

function timed(path, host, extraArgs = []) {
  const samples = [];
  let last = null;
  for (let i = 0; i < SAMPLES; i += 1) {
    const started = performance.now();
    last = request(path, host, extraArgs);
    samples.push(performance.now() - started);
  }
  samples.sort((a, b) => a - b);
  return {
    status: last?.status ?? 0,
    min: samples[0],
    median: samples[Math.floor(samples.length / 2)],
    max: samples[samples.length - 1],
  };
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

waitForPublic();

const cedarReview = firstRow(
  d1Json(
    "SELECT s.token FROM website_review_sessions s JOIN website_domains d ON d.website_id = s.website_id WHERE d.hostname = 'cedar.localhost' LIMIT 1;",
  ),
);
const reviewToken = cedarReview?.token ?? null;

let failures = 0;

const cedar = request("/", CEDAR_HOST);
failures += assert(
  "1. Cedar host → Cedar publication",
  cedar.status === 200 && /Cedar/i.test(cedar.body) && !hasAdminNav(cedar.body),
  `status=${cedar.status}`,
);

const copper = request("/", COPPER_HOST);
failures += assert(
  "2. Copper host → Copper publication",
  copper.status === 200 && /Copper/i.test(copper.body) && !hasAdminNav(copper.body),
  `status=${copper.status}`,
);

const linden = request("/", LINDEN_HOST);
failures += assert(
  "3. Linden host → Linden publication",
  linden.status === 200 && /Linden/i.test(linden.body) && !hasAdminNav(linden.body),
  `status=${linden.status}`,
);

const unknown = request("/", UNKNOWN_HOST);
failures += assert(
  "4. unknown hostname → 404",
  unknown.status === 404 && !hasWebsiteUuid(unknown.body),
  `status=${unknown.status}`,
);

const malformed = request("/", "not a host");
failures += assert(
  "5. malformed hostname → fail closed",
  malformed.status === 404 || malformed.status >= 400,
  `status=${malformed.status}`,
);

const cedarCopperMedia = request(`/media/${COPPER_MEDIA}`, CEDAR_HOST);
failures += assert(
  "6. Cedar cannot fetch Copper media",
  cedarCopperMedia.status === 404,
  `status=${cedarCopperMedia.status}`,
);

const cedarLindenMedia = request(`/media/${LINDEN_MEDIA}`, CEDAR_HOST);
failures += assert(
  "7. Cedar cannot fetch Linden media",
  cedarLindenMedia.status === 404,
  `status=${cedarLindenMedia.status}`,
);

const unreferenced = request(`/media/${CEDAR_UNREFERENCED_MEDIA}`, CEDAR_HOST);
failures += assert(
  "8. unreferenced Cedar media denied",
  unreferenced.status === 404,
  `status=${unreferenced.status}`,
);

if (!reviewToken) {
  failures += assert("9. review valid token → 200", false, "no cedar review session");
  failures += assert("11. review referenced media → 200", false, "skipped");
  failures += assert("12. review unrelated media → 404", false, "skipped");
} else {
  const review = request(`/review/${reviewToken}`, "127.0.0.1:3003");
  failures += assert(
    "9. review valid token → 200",
    review.status === 200 && /Project X review/i.test(review.body),
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
    "11. review referenced media → 200",
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
    "12. review unrelated media → 404",
    reviewUnrelated.status === 404,
    `status=${reviewUnrelated.status}`,
  );
}

const invalidReview = request(`/review/${INVALID_REVIEW_TOKEN}`, "127.0.0.1:3003");
failures += assert(
  "10. invalid review token → 404",
  invalidReview.status === 404,
  `status=${invalidReview.status}`,
);

const adminPaths = [
  ["13. /login → 404", "/login"],
  ["14. /clients → 404", "/clients"],
  ["15. /websites → 404", "/websites"],
  ["16. /templates admin path → 404", "/templates"],
  ["17. /settings → 404", "/settings"],
  ["18. /site/[id] → 404", "/site/11a1dcd6-96d8-4f05-a075-810322e0ba16"],
  ["19. /published/[id] → 404", "/published/11a1dcd6-96d8-4f05-a075-810322e0ba16"],
  ["19b. /support-requests → 404", "/support-requests"],
];

for (const [name, path] of adminPaths) {
  const result = request(path, CEDAR_HOST);
  const loginRedirect =
    /(?:^|\n)location:\s*\/login/i.test(result.headerText) ||
    /Sign in/i.test(result.body);
  failures += assert(
    name,
    result.status === 404 && !loginRedirect && !hasAdminNav(result.body),
    `status=${result.status}`,
  );
}

failures += assert(
  "20. no admin cookie/session required",
  cedar.status === 200 && !/pxws_admin_session/i.test(cedar.headerText),
  `status=${cedar.status}`,
);

failures += assert(
  "21. no admin navigation in HTML",
  !hasAdminNav(cedar.body) && !hasAdminNav(copper.body) && !hasAdminNav(linden.body),
);

failures += assert(
  "22. no Website UUID leak in public error pages",
  !hasWebsiteUuid(unknown.body) && !hasWebsiteUuid(invalidReview.body),
);

const cedarMedia = request(`/media/${CEDAR_PUBLISHED_MEDIA}`, CEDAR_HOST);
failures += assert(
  "Cedar published media → 200",
  cedarMedia.status === 200,
  `status=${cedarMedia.status}`,
);

const templateAsset = request(
  "/templates/service-modern-01/hero.jpg",
  CEDAR_HOST,
);
failures += assert(
  "bundled template asset → 200",
  templateAsset.status === 200,
  `status=${templateAsset.status}`,
);

const seoIndex = /index, follow|index,follow|content="index/i.test(cedar.body) ||
  /name="robots"/i.test(cedar.body);
failures += assert(
  "public hostname SEO index/follow present or title published",
  cedar.status === 200 && /<title>/i.test(cedar.body) && !/Project X Website Service/i.test(cedar.body),
);

failures += assert(
  "published host is stored HTML, not Next RSC",
  cedar.status === 200 &&
    !/self\.__next_f/.test(cedar.body) &&
    /publication-runtime\.css/.test(cedar.body),
);

console.log("\nWALL-CLOCK (local, NOT Cloudflare production CPU):");
const timings = [
  ["Cedar /", timed("/", CEDAR_HOST)],
  ["Copper /", timed("/", COPPER_HOST)],
  ["Linden /", timed("/", LINDEN_HOST)],
  [
    "review",
    reviewToken
      ? timed(`/review/${reviewToken}`, "127.0.0.1:3003")
      : { status: 0, min: 0, median: 0, max: 0 },
  ],
  ["Cedar media", timed(`/media/${CEDAR_PUBLISHED_MEDIA}`, CEDAR_HOST)],
];

for (const [name, timing] of timings) {
  console.log(
    `${name}: status=${timing.status} min=${timing.min.toFixed(1)}ms median=${timing.median.toFixed(1)}ms max=${timing.max.toFixed(1)}ms`,
  );
}

if (failures > 0) {
  console.error(`\n${failures} public smoke test(s) failed.`);
  process.exit(1);
}

console.log("\nAll public smoke tests passed.");
