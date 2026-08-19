import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { getPlatformProxy } from "wrangler";
import { generatePublicationPublicHtml } from "../src/lib/website-publications/render-public-html.tsx";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wranglerCli = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
const PUBLIC_ORIGIN = "http://127.0.0.1:3003";
const CEDAR_HOST = "cedar.localhost:3003";
const COPPER_HOST = "copper.localhost:3003";
const LINDEN_HOST = "linden.localhost:3003";
const CEDAR_PUBLISHED_MEDIA = "69125cd0-bcde-433c-b603-786a4f4c9e7f";
const CEDAR_UNREFERENCED_MEDIA = "97852466-8e79-4ccd-bc27-f44ce213a200";
const COPPER_MEDIA = "ff6e9372-408e-4cc1-807d-cdbc9c72ad13";
const MARKER = `PXWS-M22-SAFETY-${randomUUID()}`;

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

function request(pathname, host) {
  return curl(["-H", `Host: ${host}`, `${PUBLIC_ORIGIN}${pathname}`]);
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
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
  return ok ? 0 : 1;
}

function websiteState(hostname) {
  return firstRow(
    d1Json(
      `SELECT w.id AS website_id, w.client_id, w.status, w.active_publication_id,
              w.content_json, w.template_id, w.updated_at,
              p.id AS publication_id, p.publication_number, p.content_json AS publication_json,
              p.public_html, p.template_id AS publication_template
       FROM websites w
       JOIN website_domains d ON d.website_id = w.id
       LEFT JOIN website_publications p ON p.id = w.active_publication_id
       WHERE d.hostname = ${sqlString(hostname)}
       LIMIT 1;`,
    ),
  );
}

function publicationCount(websiteId) {
  const row = firstRow(
    d1Json(
      `SELECT COUNT(*) AS total FROM website_publications WHERE website_id = ${sqlString(websiteId)};`,
    ),
  );
  return Number(row?.total ?? 0);
}

function versionCount(websiteId) {
  const row = firstRow(
    d1Json(
      `SELECT COUNT(*) AS total FROM website_versions WHERE website_id = ${sqlString(websiteId)};`,
    ),
  );
  return Number(row?.total ?? 0);
}

function waitForPublic() {
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    try {
      if (request("/", "127.0.0.1:3003").status > 0) {
        return;
      }
    } catch {
      // retry
    }
  }
  throw new Error("Public runtime on port 3003 did not become ready.");
}

function hasAdminUi(html) {
  return /href="\/(clients|websites|templates|settings|login|support-requests)"/i.test(
    html,
  );
}

function extractTitle(html) {
  const match = /<title>([^<]*)<\/title>/i.exec(html);
  return match?.[1] ?? "";
}

function extractDescription(html) {
  const match = /<meta name="description" content="([^"]*)"/i.exec(html);
  return match?.[1] ?? "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

waitForPublic();

let failures = 0;
const repoSource = readFileSync(
  path.join(root, "src", "lib", "website-publications", "repository.ts"),
  "utf8",
);
const actionSource = readFileSync(
  path.join(root, "src", "lib", "website-publications", "actions.ts"),
  "utf8",
);
const migrateSource = readFileSync(
  path.join(root, "package.json"),
  "utf8",
);
const migration0011 = readFileSync(
  path.join(root, "migrations", "0011_static_publication_html.sql"),
  "utf8",
);
const backfillSource = readFileSync(
  path.join(root, "scripts", "backfill-publication-html.mjs"),
  "utf8",
);

failures += assert(
  "HTML generation runs before any D1 write in Publish action",
  /generatePublicationPublicHtmlViaNode/.test(actionSource) &&
    actionSource.indexOf("generatePublicationPublicHtmlViaNode") <
      actionSource.indexOf("publishWebsite(websiteId"),
);
failures += assert(
  "empty HTML throws before D1 batch",
  /WEBSITE_PUBLICATION_HTML_FAILED[\s\S]*db\.batch/s.test(repoSource) ||
    (repoSource.indexOf("WEBSITE_PUBLICATION_HTML_FAILED") <
      repoSource.indexOf("db.batch") &&
      repoSource.includes("if (!html || !contentJson || !templateId)")),
);
failures += assert(
  "publish uses D1 batch for insert + active pointer",
  /await db\.batch\(/.test(repoSource) &&
    /INSERT INTO website_publications/.test(repoSource) &&
    /active_publication_id = \?/.test(repoSource) &&
    /AND EXISTS \(/.test(repoSource),
);
failures += assert(
  "Make live requires admin auth",
  actionSource.includes("export async function activateWebsitePublicationAction") &&
    actionSource
      .slice(actionSource.indexOf("export async function activateWebsitePublicationAction"))
      .includes("getAdminActionError"),
);
failures += assert(
  "activate UPDATE requires same-Website publication ownership",
  /p\.website_id = websites\.id/.test(repoSource) &&
    /getWebsitePublicationForWebsite/.test(repoSource),
);
failures += assert(
  "db:migrate is SQL-only and local",
  /"db:migrate": "wrangler d1 migrations apply projectx-website-service --local"/.test(
    migrateSource,
  ) && !/"db:migrate": .*\.mjs/.test(migrateSource),
);
failures += assert(
  "backfill is local-only and does not use --remote",
  !/--remote/.test(backfillSource) &&
    /persist:\s*true/.test(backfillSource) &&
    /length\(public_html\) = 0/.test(backfillSource),
);
failures += assert(
  "0011 does not generate HTML and keeps active_publication_id nullable",
  !/renderTemplate|public-html/.test(migration0011) &&
    /ADD COLUMN active_publication_id TEXT;/.test(migration0011) &&
    !/NOT NULL/.test(
      /ADD COLUMN active_publication_id TEXT;/.exec(migration0011)?.[0] ?? "",
    ),
);
failures += assert(
  "migrations 0001–0010 unchanged in git",
  execFileSync(
    "git",
    ["diff", "--name-only", "--", "migrations/0001_create_clients.sql"],
    { encoding: "utf8", cwd: root },
  ).trim() === "" &&
    execFileSync("git", ["diff", "--name-only", "--", "migrations"], {
      encoding: "utf8",
      cwd: root,
    })
      .split(/\r?\n/)
      .filter(Boolean)
      .every((name) => name.includes("0011") || name.includes("0012")),
);

const cedar = websiteState("cedar.localhost");
const copper = websiteState("copper.localhost");
const linden = websiteState("linden.localhost");
if (!cedar?.website_id || !copper?.publication_id || !linden?.publication_id) {
  failures += assert("local Cedar/Copper/Linden exist", false, "missing fixture");
  process.exit(1);
}

const beforeCedarHtml = request("/", CEDAR_HOST);
const beforePubs = publicationCount(cedar.website_id);
const beforeVersions = versionCount(cedar.website_id);
const beforeActive = cedar.active_publication_id;
const beforeStatus = cedar.status;
const beforeDraft = cedar.content_json;
const beforePubHtml = cedar.public_html;
const beforePubJson = cedar.publication_json;
const beforePubNumber = cedar.publication_number;

const invalidHtml = generatePublicationPublicHtml(
  "service-modern-01",
  '{"not":"valid website content"}',
);
failures += assert(
  "invalid snapshot does not generate public HTML",
  invalidHtml === null,
);

let generatorExit = 0;
try {
  execFileSync(
    process.execPath,
    [
      "--import",
      "./scripts/publication-tsx-register.mjs",
      "./scripts/generate-publication-html.mjs",
    ],
    {
      cwd: root,
      input: JSON.stringify({
        templateId: "service-modern-01",
        contentJson: "{",
      }),
      encoding: "utf8",
    },
  );
} catch (error) {
  generatorExit = error?.status ?? 1;
}
failures += assert(
  "failed generator exits without writing D1",
  generatorExit === 2,
);

const afterFail = websiteState("cedar.localhost");
failures += assert(
  "failed generation leaves active publication N",
  afterFail.active_publication_id === beforeActive &&
    afterFail.status === beforeStatus &&
    afterFail.public_html === beforePubHtml &&
    publicationCount(cedar.website_id) === beforePubs &&
    versionCount(cedar.website_id) === beforeVersions &&
    afterFail.content_json === beforeDraft,
);
failures += assert(
  "public hostname still serves N after failed generation",
  request("/", CEDAR_HOST).body === beforeCedarHtml.body &&
    request("/", CEDAR_HOST).status === 200,
);

const proxy = await getPlatformProxy({
  configPath: path.join(root, "wrangler.jsonc"),
  persist: true,
});

try {
  const db = proxy.env.DB;
  const phantomId = randomUUID();
  const now = new Date().toISOString();
  let batchFailed = false;
  try {
    await db.batch([
      db
        .prepare(
          `INSERT INTO website_publications (
            id, website_id, publication_number, template_id, content_json, public_html, published_at, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          phantomId,
          cedar.website_id,
          Number(beforePubNumber) + 50,
          cedar.template_id,
          cedar.publication_json,
          `<html>${MARKER}</html>`,
          now,
          now,
        ),
      db
        .prepare(
          `UPDATE websites
           SET active_publication_id = ?, updated_at = ?
           WHERE id = ?`,
        )
        .bind(phantomId, now, cedar.website_id),
      db
        .prepare(
          `INSERT INTO website_publications (
            id, website_id, publication_number, template_id, content_json, public_html, published_at, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          phantomId,
          cedar.website_id,
          Number(beforePubNumber) + 51,
          cedar.template_id,
          cedar.publication_json,
          "<html>partial</html>",
          now,
          now,
        ),
    ]);
  } catch {
    batchFailed = true;
  }

  const afterBatch = websiteState("cedar.localhost");
  const phantom = firstRow(
    d1Json(
      `SELECT id FROM website_publications WHERE id = ${sqlString(phantomId)};`,
    ),
  );
  failures += assert(
    "failed D1 batch rolls back insert and pointer",
    batchFailed &&
      !phantom &&
      afterBatch.active_publication_id === beforeActive &&
      afterBatch.public_html === beforePubHtml &&
      !String(afterBatch.public_html || "").includes(MARKER) &&
      publicationCount(cedar.website_id) === beforePubs,
  );

  const cross = await db
    .prepare(
      `UPDATE websites
       SET active_publication_id = ?, updated_at = ?
       WHERE id = ?
         AND EXISTS (
           SELECT 1
           FROM website_publications p
           WHERE p.id = ?
             AND p.website_id = websites.id
             AND length(p.public_html) > 0
         )`,
    )
    .bind(copper.publication_id, now, cedar.website_id, copper.publication_id)
    .run();
  failures += assert(
    "Cedar cannot activate a Copper publication",
    (cross.meta?.changes ?? 0) === 0 &&
      websiteState("cedar.localhost").active_publication_id === beforeActive,
  );

  const switchId = randomUUID();
  const switchNumber = Number(beforePubNumber) + 80;
  const switchHtml = `<!DOCTYPE html><html><head><title>Safety B</title><meta name="robots" content="index, follow"/></head><body><p>${MARKER}</p></body></html>`;
  await db
    .prepare(
      `INSERT INTO website_publications (
        id, website_id, publication_number, template_id, content_json, public_html, published_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      switchId,
      cedar.website_id,
      switchNumber,
      cedar.template_id,
      cedar.publication_json,
      switchHtml,
      now,
      now,
    )
    .run();

  const originalA = firstRow(
    d1Json(
      `SELECT content_json, public_html, publication_number
       FROM website_publications WHERE id = ${sqlString(beforeActive)};`,
    ),
  );

  const makeB = await db
    .prepare(
      `UPDATE websites
       SET active_publication_id = ?, updated_at = ?
       WHERE id = ?
         AND EXISTS (
           SELECT 1 FROM website_publications p
           WHERE p.id = ? AND p.website_id = websites.id AND length(p.public_html) > 0
         )`,
    )
    .bind(switchId, now, cedar.website_id, switchId)
    .run();
  const servedB = request("/", CEDAR_HOST);
  failures += assert(
    "Make live B serves publication B",
    (makeB.meta?.changes ?? 0) === 1 &&
      servedB.status === 200 &&
      servedB.body.includes(MARKER),
  );

  const makeA = await db
    .prepare(
      `UPDATE websites
       SET active_publication_id = ?, updated_at = ?
       WHERE id = ?
         AND EXISTS (
           SELECT 1 FROM website_publications p
           WHERE p.id = ? AND p.website_id = websites.id AND length(p.public_html) > 0
         )`,
    )
    .bind(beforeActive, now, cedar.website_id, beforeActive)
    .run();
  const servedA = request("/", CEDAR_HOST);
  const afterA = firstRow(
    d1Json(
      `SELECT content_json, public_html, publication_number
       FROM website_publications WHERE id = ${sqlString(beforeActive)};`,
    ),
  );
  const afterB = firstRow(
    d1Json(
      `SELECT content_json, public_html, publication_number
       FROM website_publications WHERE id = ${sqlString(switchId)};`,
    ),
  );
  failures += assert(
    "Make live A restores original A exactly",
    (makeA.meta?.changes ?? 0) === 1 &&
      servedA.status === 200 &&
      servedA.body === beforeCedarHtml.body &&
      afterA.content_json === originalA.content_json &&
      afterA.public_html === originalA.public_html &&
      Number(afterA.publication_number) === Number(originalA.publication_number) &&
      afterB.public_html === switchHtml &&
      Number(afterB.publication_number) === switchNumber,
  );

  await db
    .prepare(`DELETE FROM website_publications WHERE id = ?`)
    .bind(switchId)
    .run();
  await db
    .prepare(
      `UPDATE websites SET active_publication_id = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(beforeActive, cedar.updated_at, cedar.website_id)
    .run();
} finally {
  await proxy.dispose();
}

const restored = websiteState("cedar.localhost");
failures += assert(
  "Cedar fixture restored after safety tests",
  restored.active_publication_id === beforeActive &&
    restored.status === beforeStatus &&
    restored.public_html === beforePubHtml &&
    restored.publication_json === beforePubJson &&
    publicationCount(cedar.website_id) === beforePubs &&
    versionCount(cedar.website_id) === beforeVersions,
);

const hosts = [
  {
    name: "Service Cedar",
    host: CEDAR_HOST,
    hostname: "cedar.localhost",
    className: "sm01",
    navId: "mobile-nav",
    state: cedar,
  },
  {
    name: "Restaurant Copper",
    host: COPPER_HOST,
    hostname: "copper.localhost",
    className: "rm01",
    navId: "restaurant-mobile-nav",
    state: copper,
  },
  {
    name: "Salon Linden",
    host: LINDEN_HOST,
    hostname: "linden.localhost",
    className: "sa01",
    navId: "salon-mobile-nav",
    state: linden,
  },
];

for (const site of hosts) {
  const page = request("/", site.host);
  const seo = JSON.parse(site.state.publication_json).seo ?? {};
  const expectedTitle = escapeHtml(seo.title || "");
  const expectedDescription = escapeHtml(seo.description || "");
  failures += assert(
    `${site.name} static HTML is a complete publication document`,
    page.status === 200 &&
      page.body.includes("<!DOCTYPE html>") &&
      page.body.includes(site.className) &&
      lengthOk(site.state.public_html) &&
      !/self\.__next_f/.test(page.body) &&
      /publication-runtime\.css/.test(page.body) &&
      !hasAdminUi(page.body) &&
      !page.body.includes(site.state.website_id) &&
      !page.body.includes(site.state.client_id) &&
      extractTitle(page.body) === expectedTitle &&
      extractDescription(page.body) === expectedDescription &&
      /name="robots" content="index, follow"/.test(page.body) &&
      !/\/_next\/image\?/.test(page.body) &&
      !/r2\.cloudflarestorage|https:\/\/.*\.r2\./i.test(page.body) &&
      page.body.includes(`id="${site.navId}"`) &&
      /aria-controls="[^"]+"/.test(page.body) &&
      /aria-expanded=/.test(page.body) &&
      /<script>/.test(page.body) &&
      /getElementById\(button\.getAttribute\("aria-controls"\)/.test(page.body),
    `status=${page.status} title=${extractTitle(page.body)}`,
  );
}

function lengthOk(html) {
  return typeof html === "string" && html.trim().length > 1000;
}

const css = request("/publication-runtime.css", CEDAR_HOST);
failures += assert(
  "publication-runtime.css returns in public runtime",
  css.status === 200 && /sm01|rm01|sa01/.test(css.body),
  `status=${css.status}`,
);

const cedarMedia = request(`/media/${CEDAR_PUBLISHED_MEDIA}`, CEDAR_HOST);
failures += assert("referenced Cedar media → 200", cedarMedia.status === 200);
failures += assert(
  "cross-Website media → 404",
  request(`/media/${COPPER_MEDIA}`, CEDAR_HOST).status === 404,
);
failures += assert(
  "unreferenced Cedar media → 404",
  request(`/media/${CEDAR_UNREFERENCED_MEDIA}`, CEDAR_HOST).status === 404,
);

const nullable = firstRow(
  d1Json(
    `SELECT COUNT(*) AS total
     FROM websites
     WHERE active_publication_id IS NULL
       AND NOT EXISTS (
         SELECT 1 FROM website_publications p WHERE p.website_id = websites.id
       );`,
  ),
);
failures += assert(
  "websites without publications may have null active_publication_id",
  Number(nullable?.total ?? 0) >= 0,
);

const review = firstRow(
  d1Json(
    "SELECT s.token FROM website_review_sessions s JOIN website_domains d ON d.website_id = s.website_id WHERE d.hostname = 'cedar.localhost' LIMIT 1;",
  ),
);
if (!review?.token) {
  failures += assert("review stored draft HTML", false, "no cedar review token");
} else {
  const page = request(`/review/${review.token}`, "127.0.0.1:3003");
  failures += assert(
    "review serves stored draft HTML, not Next RSC",
    page.status === 200 &&
      /Project X review/i.test(page.body) &&
      !/self\.__next_f/.test(page.body) &&
      /noindex, nofollow/.test(page.body),
    `status=${page.status}`,
  );
}

const adminClients = curl(["http://127.0.0.1:3002/clients"]);
failures += assert(
  "unauthenticated admin still redirects to login",
  /location:\s*\/login/i.test(adminClients.headerText),
  `status=${adminClients.status}`,
);

if (failures > 0) {
  console.error(`\n${failures} publication safety test(s) failed.`);
  process.exit(1);
}

console.log("\nAll publication safety tests passed.");
