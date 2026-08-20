import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configRel = "wrangler.production-admin.jsonc";
const varsRel = ".dev.vars.production-admin";
const productionId = "db47d1af-bc9c-47f0-ad8a-1377971dbd24";
const productionKvId = "f95b658d6c914e0fbec1f06bec4b6e4d";
const placeholderId = "00000000-0000-4000-8000-000000000001";
const port = "3004";

function fail(message) {
  console.error(`PRODUCTION ADMIN REFUSED: ${message}`);
  process.exit(1);
}

function readJsonc(rel) {
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) {
    fail(`missing ${rel}`);
  }
  const stripped = fs
    .readFileSync(filePath, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  try {
    return JSON.parse(stripped);
  } catch (error) {
    fail(`could not parse ${rel}: ${error}`);
  }
}

const config = readJsonc(configRel);
const databases = Array.isArray(config.d1_databases) ? config.d1_databases : [];
const db = databases[0];
if (!db) {
  fail(`${configRel} has no D1 binding`);
}
if (db.binding !== "DB") {
  fail("production D1 binding must be DB");
}
if (db.database_name !== "projectx-websites-production") {
  fail("production D1 name must be projectx-websites-production");
}
if (db.database_id !== productionId) {
  fail("production D1 UUID does not match projectx-websites-production");
}
if (db.database_id === placeholderId) {
  fail("production config still uses the local placeholder D1 id");
}
if (db.remote !== true) {
  fail("production D1 must set remote: true");
}
if (config.workers_dev === true) {
  fail("production-admin config must not enable workers.dev");
}
if (Array.isArray(config.r2_buckets) && config.r2_buckets.length > 0) {
  fail("production-admin config must not bind R2");
}
const namespaces = Array.isArray(config.kv_namespaces) ? config.kv_namespaces : [];
const kv = namespaces[0];
if (!kv) {
  fail("production-admin config must bind MEDIA_KV");
}
if (kv.binding !== "MEDIA_KV") {
  fail("production KV binding must be MEDIA_KV");
}
if (kv.id !== productionKvId) {
  fail("production KV ID does not match projectx-websites-media");
}
if (kv.remote !== true) {
  fail("production MEDIA_KV must set remote: true");
}

const varsPath = path.join(root, varsRel);
if (!fs.existsSync(varsPath)) {
  fail(`${varsRel} is missing. Run node scripts/ensure-production-admin-vars.mjs`);
}
const varsText = fs.readFileSync(varsPath, "utf8");
for (const key of ["ADMIN_USERNAME", "ADMIN_PASSWORD_HASH", "AUTH_SESSION_SECRET"]) {
  if (!new RegExp(`^${key}=.+$`, "m").test(varsText)) {
    fail(`${varsRel} is missing ${key}`);
  }
}

console.log("PRODUCTION MANAGEMENT MODE");
console.log("You are about to edit live production data.");
console.log(`Port: ${port}`);
console.log("Config: wrangler.production-admin.jsonc");
console.log("D1: projectx-websites-production (remote)");
console.log("KV: projectx-websites-media (remote MEDIA_KV)");
console.log("R2: none");
console.log("Startup will not migrate, seed, backfill, or reset.");

const env = {
  ...process.env,
  PXWS_PRODUCTION_ADMIN: "1",
  PXWS_ADMIN_PRODUCTION_COMMAND: "1",
};
delete env.ADMIN_USERNAME;
delete env.ADMIN_PASSWORD_HASH;
delete env.AUTH_SESSION_SECRET;

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const child = spawn(
  process.execPath,
  [nextBin, "dev", "--port", port],
  {
    cwd: root,
    stdio: "inherit",
    env,
    windowsHide: true,
  },
);
child.on("exit", (code) => {
  process.exit(code ?? 1);
});
