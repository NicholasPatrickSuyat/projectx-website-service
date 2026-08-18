import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLACEHOLDER_D1_ID = "00000000-0000-4000-8000-000000000001";
const UNPROVISIONED_R2 = "projectx-website-media-unprovisioned";
const EXPECTED_MIGRATIONS = [
  "0001_create_clients.sql",
  "0002_create_websites.sql",
  "0003_create_website_versions.sql",
  "0004_create_website_media.sql",
  "0005_allow_restaurant_template.sql",
  "0006_allow_salon_template.sql",
  "0007_create_website_review.sql",
  "0008_create_website_publications.sql",
  "0009_create_admin_session.sql",
  "0010_create_website_domains.sql",
  "0011_static_publication_html.sql",
];

let failures = 0;

function pass(name, detail) {
  console.log(`PASS  ${name}${detail ? `  (${detail})` : ""}`);
}

function fail(name, detail) {
  failures += 1;
  console.log(`FAIL  ${name}${detail ? `  (${detail})` : ""}`);
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

console.log("Project X Website Service — local production preflight");
console.log("This script does not deploy, create resources, or use --remote.\n");

try {
  const branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  if (branch === "main") {
    pass("git branch is main");
  } else {
    fail("git branch is main", branch);
  }
} catch (error) {
  fail("git branch is main", String(error));
}

try {
  const head = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  pass("git HEAD recorded", head);
} catch (error) {
  fail("git HEAD recorded", String(error));
}

const migrationDir = path.join(root, "migrations");
const migrationFiles = fs
  .readdirSync(migrationDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();
if (EXPECTED_MIGRATIONS.every((name) => migrationFiles.includes(name))) {
  pass("migrations 0001–0011 present");
} else {
  fail("migrations 0001–0011 present", migrationFiles.join(", "));
}
if (migrationFiles.some((name) => name.startsWith("0012"))) {
  fail("no migration 0012", "0012 file found");
} else {
  pass("no migration 0012");
}

for (const rel of [
  "docs/static-publication.md",
  "docs/production-infrastructure.md",
  "docs/production.md",
  "docs/public-runtime.md",
  "docs/deployment-decision.md",
  "docs/production-admin.md",
  "public-runtime/wrangler.jsonc",
  "wrangler.jsonc",
  "wrangler.production-admin.jsonc",
]) {
  if (exists(rel)) {
    pass(`required file ${rel}`);
  } else {
    fail(`required file ${rel}`);
  }
}

const wranglerFiles = ["wrangler.jsonc", "public-runtime/wrangler.jsonc"];
for (const rel of wranglerFiles) {
  const text = read(rel);
  if (/"remote"\s*:\s*true/.test(text)) {
    fail(`${rel} remote is false`, "remote: true found");
  } else if (/"remote"\s*:\s*false/.test(text)) {
    pass(`${rel} remote is false`);
  } else {
    fail(`${rel} remote is false`, "remote field missing");
  }
  if (/"workers_dev"\s*:\s*false/.test(text)) {
    pass(`${rel} workers_dev is false`);
  } else {
    fail(`${rel} workers_dev is false`);
  }
  if (text.includes(PLACEHOLDER_D1_ID)) {
    pass(`${rel} uses placeholder D1 id`);
  } else {
    fail(`${rel} uses placeholder D1 id`);
  }
  if (text.includes(UNPROVISIONED_R2)) {
    pass(`${rel} uses unprovisioned R2 name`);
  } else {
    fail(`${rel} uses unprovisioned R2 name`);
  }
  if (
    /ADMIN_USERNAME|ADMIN_PASSWORD_HASH|AUTH_SESSION_SECRET/.test(text)
  ) {
    fail(`${rel} has no admin secrets`, "admin secret name found");
  } else {
    pass(`${rel} has no admin secret names`);
  }
}

const PRODUCTION_D1_ID = "db47d1af-bc9c-47f0-ad8a-1377971dbd24";
const productionAdmin = read("wrangler.production-admin.jsonc");
if (/"remote"\s*:\s*true/.test(productionAdmin) && productionAdmin.includes(PRODUCTION_D1_ID)) {
  pass("wrangler.production-admin.jsonc binds remote production D1");
} else {
  fail(
    "wrangler.production-admin.jsonc binds remote production D1",
    "missing remote:true or production UUID",
  );
}
if (/"workers_dev"\s*:\s*false/.test(productionAdmin)) {
  pass("wrangler.production-admin.jsonc workers_dev is false");
} else {
  fail("wrangler.production-admin.jsonc workers_dev is false");
}
if (/r2_buckets/.test(productionAdmin)) {
  fail("wrangler.production-admin.jsonc has no R2", "r2_buckets found");
} else {
  pass("wrangler.production-admin.jsonc has no R2");
}
if (/ADMIN_USERNAME|ADMIN_PASSWORD_HASH|AUTH_SESSION_SECRET/.test(productionAdmin)) {
  fail("wrangler.production-admin.jsonc has no admin secrets", "admin secret name found");
} else {
  pass("wrangler.production-admin.jsonc has no admin secrets");
}
for (const rel of ["wrangler.jsonc", "public-runtime/wrangler.jsonc"]) {
  if (read(rel).includes(PRODUCTION_D1_ID)) {
    fail(`${rel} stays off production D1`, "production UUID found");
  } else {
    pass(`${rel} stays off production D1`);
  }
}

const packageJson = JSON.parse(read("package.json"));
const lockExists = exists("package-lock.json");
if (lockExists) {
  pass("package-lock.json present");
} else {
  fail("package-lock.json present");
}
if (packageJson.dependencies && packageJson.devDependencies) {
  pass("package.json has existing dependency blocks (no preflight mutation)");
}
if (packageJson.scripts?.["admin:production"] === "node scripts/admin-production.mjs") {
  pass("admin:production is explicit and does not migrate/seed");
} else {
  fail("admin:production is explicit and does not migrate/seed");
}
const adminProductionScript = exists("scripts/admin-production.mjs")
  ? read("scripts/admin-production.mjs")
  : "";
if (
  adminProductionScript.includes('PXWS_ADMIN_PRODUCTION_COMMAND: "1"') &&
  adminProductionScript.includes("wrangler.production-admin.jsonc") &&
  !/\b(migrate|seed|backfill|reset)\b/.test(
    adminProductionScript.replace(
      "Startup will not migrate, seed, backfill, or reset.",
      "",
    ),
  )
) {
  pass("admin:production startup is fail-closed and non-mutating");
} else {
  fail("admin:production startup is fail-closed and non-mutating");
}
if (
  typeof packageJson.scripts?.dev === "string" &&
  packageJson.scripts.dev.includes("db:migrate") &&
  packageJson.scripts.dev.includes("--port 3002") &&
  !packageJson.scripts.dev.includes("production")
) {
  pass("npm run dev remains local-only on port 3002");
} else {
  fail("npm run dev remains local-only on port 3002");
}

const publicDevVars = path.join(root, "public-runtime", ".dev.vars");
if (fs.existsSync(publicDevVars)) {
  const keys = fs
    .readFileSync(publicDevVars, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => line.slice(0, line.indexOf("=")));
  const adminKeys = keys.filter((key) =>
    ["ADMIN_USERNAME", "ADMIN_PASSWORD_HASH", "AUTH_SESSION_SECRET"].includes(
      key,
    ),
  );
  if (adminKeys.length === 0) {
    pass("public-runtime/.dev.vars has no admin credential keys", keys.join(","));
  } else {
    fail(
      "public-runtime/.dev.vars has no admin credential keys",
      adminKeys.join(","),
    );
  }
} else {
  pass("public-runtime/.dev.vars absent or unused (public boot without admin secrets)");
}

const workerPath = path.join(root, "public-runtime", ".open-next", "worker.js");
const dryRunWorker = path.join(
  root,
  "public-runtime",
  ".open-next",
  "wrangler-dry-run",
  "worker.js",
);
if (fs.existsSync(dryRunWorker)) {
  const raw = fs.readFileSync(dryRunWorker);
  const gzip = gzipSync(raw);
  const gzipKiB = gzip.length / 1024;
  const gzipMiB = gzip.length / (1024 * 1024);
  pass(
    "public Worker wrangler dry-run gzip (local, not a deploy)",
    `${gzipKiB.toFixed(2)} KiB / ${gzipMiB.toFixed(3)} MiB gzip`,
  );
  if (gzip.length > 3 * 1024 * 1024) {
    fail("gzip under documented Free 3 MB", `${gzipMiB.toFixed(3)} MiB`);
  } else {
    pass("gzip under documented Free 3 MB");
  }
} else if (fs.existsSync(workerPath)) {
  const raw = fs.readFileSync(workerPath);
  const gzip = gzipSync(raw);
  pass(
    "public OpenNext worker.js entry (local file, not a deploy)",
    `${(gzip.length / 1024).toFixed(2)} KiB gzip; wrangler dry-run bundle not present`,
  );
} else {
  pass(
    "public Worker artifact optional",
    "public-runtime/.open-next/worker.js not present; size check skipped",
  );
}

const forbiddenExact = [
  ".dev.vars",
  "public-runtime/.dev.vars",
  ".dev.vars.production-admin",
];
const forbiddenPrefixes = [
  ".wrangler/",
  ".open-next/",
  "public-runtime/.open-next/",
  "public-runtime/.wrangler/",
  "storage/",
  "backups/",
];
try {
  const tracked = execFileSync("git", ["ls-files"], {
    cwd: root,
    encoding: "utf8",
  }).split(/\r?\n/);
  const leaked = tracked.filter(
    (file) =>
      forbiddenExact.includes(file) ||
      forbiddenPrefixes.some((prefix) => file.startsWith(prefix)),
  );
  if (leaked.length === 0) {
    pass("git does not track local state/secrets paths");
  } else {
    fail("git does not track local state/secrets paths", leaked.join(", "));
  }
} catch (error) {
  fail("git does not track local state/secrets paths", String(error));
}

console.log("");
if (failures > 0) {
  console.error(`${failures} preflight check(s) failed.`);
  process.exit(1);
}
console.log("Local production preflight passed. No remote actions were taken.");
