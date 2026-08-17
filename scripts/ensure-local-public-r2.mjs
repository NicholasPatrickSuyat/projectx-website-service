import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wranglerCli = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
const persistTo = path.join(root, ".wrangler", "state");

const MEDIA_IDS = [
  "69125cd0-bcde-433c-b603-786a4f4c9e7f",
  "97852466-8e79-4ccd-bc27-f44ce213a200",
  "ff6e9372-408e-4cc1-807d-cdbc9c72ad13",
  "23358428-5d8d-463d-bd9c-32f103fec309",
];

function d1(sql) {
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
  const parsed = JSON.parse(raw);
  const batch = Array.isArray(parsed) ? parsed[0] : parsed;
  return batch?.results ?? [];
}

function putLocalR2(key, filePath) {
  execFileSync(
    process.execPath,
    [
      wranglerCli,
      "r2",
      "object",
      "put",
      `projectx-website-media-local/${key}`,
      "--file",
      filePath,
      "--local",
      "--persist-to",
      persistTo,
    ],
    { stdio: "inherit", cwd: root },
  );
}

const quoted = MEDIA_IDS.map((id) => `'${id}'`).join(",");
const rows = d1(
  `SELECT id, website_id, stored_filename, file_size FROM website_media WHERE id IN (${quoted})`,
);

if (rows.length === 0) {
  throw new Error("No local website_media rows found for preview fixtures.");
}

for (const row of rows) {
  const key = `${row.website_id}/${row.stored_filename}`;
  const filePath = path.join(root, "storage", "website-media", key);
  const present = existsSync(filePath);
  console.log(
    `media ${row.id.slice(0, 8)}… size=${row.file_size} disk=${present ? "yes" : "NO"}`,
  );
  if (!present) {
    console.log(`  skip R2 put; filesystem object missing for ${row.id.slice(0, 8)}…`);
    continue;
  }
  putLocalR2(key, filePath);
}

const statuses = d1(
  `SELECT d.hostname, w.status AS website_status, s.status AS review_status
   FROM website_domains d
   JOIN websites w ON w.id = d.website_id
   LEFT JOIN website_review_sessions s ON s.website_id = w.id
   ORDER BY d.hostname`,
);
console.log("host review/website status:");
for (const row of statuses) {
  console.log(
    `  ${row.hostname} website=${row.website_status} review=${row.review_status ?? "none"}`,
  );
}
