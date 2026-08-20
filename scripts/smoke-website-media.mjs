import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, renameSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { createKvWebsiteMediaStorage } from "../src/lib/website-media/kv-storage.ts";
import { writeWebsiteMediaThenRecord, deleteWebsiteMediaRecordThenObject } from "../src/lib/website-media/consistency.ts";
import { getDeleteWebsiteMediaDenial, WEBSITE_MEDIA_REFERENCED_ERROR } from "../src/lib/website-media/delete-guard.ts";
import { inspectWebsiteImageBytes } from "../src/lib/website-media/inspect.ts";
import { getWebsiteMediaObjectKey, STORED_FILENAME_PATTERN } from "../src/lib/website-media/object-key.ts";
import { chooseWebsiteMediaProvider, MISSING_MEDIA_KV_BINDING } from "../src/lib/website-media/provider.ts";
import { collectReferencedMediaIds } from "../src/lib/website-media/references.ts";
import { planWebsiteMediaUpload } from "../src/lib/website-media/upload-plan.ts";
import { WEBSITE_MEDIA_MAX_BYTES } from "../src/lib/website-media/types.ts";
import { getWebsiteMediaResponseHeaders } from "../src/lib/website-media/headers.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wranglerCli = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
const ADMIN_ORIGIN = "http://127.0.0.1:3002";
const PUBLIC_ORIGIN = "http://127.0.0.1:3003";
const CEDAR_HOST = "cedar.localhost:3003";
const CEDAR_PUBLISHED_MEDIA = "69125cd0-bcde-433c-b603-786a4f4c9e7f";
const CEDAR_UNREFERENCED_MEDIA = "97852466-8e79-4ccd-bc27-f44ce213a200";
const COPPER_MEDIA = "ff6e9372-408e-4cc1-807d-cdbc9c72ad13";
const ARBITRARY_MEDIA = "00000000-0000-4000-8000-000000000099";
const UNKNOWN_TOKEN = "ab".repeat(32);

let failures = 0;

function pass(name, detail = "") {
  console.log(`PASS  ${name}${detail ? `  (${detail})` : ""}`);
}

function fail(name, detail = "") {
  failures += 1;
  console.log(`FAIL  ${name}${detail ? `  (${detail})` : ""}`);
}

function assert(name, ok, detail = "") {
  if (ok) {
    pass(name, detail);
  } else {
    fail(name, detail);
  }
}

function jpegBytes() {
  return Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0xff, 0xd9]);
}

function pngBytes() {
  return Uint8Array.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52,
  ]);
}

function webpBytes() {
  return Uint8Array.from([
    0x52, 0x49, 0x46, 0x46, 0x18, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  ]);
}

function createMemoryKv() {
  const values = new Map();
  return {
    values,
    namespace: {
      async put(key, value) {
        const bytes =
          typeof value === "string"
            ? new TextEncoder().encode(value)
            : new Uint8Array(value);
        values.set(key, bytes);
      },
      async get(key, type) {
        if (type !== "arrayBuffer") {
          throw new Error("test KV mock only supports arrayBuffer");
        }
        const bytes = values.get(key);
        return bytes ? bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) : null;
      },
      async delete(key) {
        values.delete(key);
      },
    },
  };
}

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

function request(origin, pathname, host, extraArgs = []) {
  return curl(["-H", `Host: ${host}`, `${origin}${pathname}`, ...extraArgs]);
}

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

function readConfig(rel) {
  return readFileSync(path.join(root, rel), "utf8");
}

const jpegId = randomUUID();
const pngId = randomUUID();
const webpId = randomUUID();
const jpegPlan = planWebsiteMediaUpload({
  originalName: "../../secret.JPG",
  size: jpegBytes().byteLength,
  bytes: jpegBytes(),
  id: jpegId,
});
const pngPlan = planWebsiteMediaUpload({
  originalName: "hero.png",
  size: pngBytes().byteLength,
  bytes: pngBytes(),
  id: pngId,
});
const webpPlan = planWebsiteMediaUpload({
  originalName: "card.webp",
  size: webpBytes().byteLength,
  bytes: webpBytes(),
  id: webpId,
});

assert("1. valid JPEG upload", jpegPlan.ok && jpegPlan.plan?.mimeType === "image/jpeg" && jpegPlan.plan.storedFilename === `${jpegId}.jpg`);
assert("2. valid PNG upload", pngPlan.ok && pngPlan.plan?.mimeType === "image/png" && pngPlan.plan.storedFilename === `${pngId}.png`);
assert("3. valid WEBP upload", webpPlan.ok && webpPlan.plan?.mimeType === "image/webp" && webpPlan.plan.storedFilename === `${webpId}.webp`);

const oversized = new Uint8Array(WEBSITE_MEDIA_MAX_BYTES + 1);
oversized.set(jpegBytes(), 0);
const oversizedPlan = planWebsiteMediaUpload({
  originalName: "huge.jpg",
  size: oversized.byteLength,
  bytes: oversized,
  id: randomUUID(),
});
assert("4. oversized >5 MB rejection", !oversizedPlan.ok && /too large/i.test(oversizedPlan.error || ""));

const svgPlan = planWebsiteMediaUpload({
  originalName: "icon.svg",
  size: 32,
  bytes: new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
  id: randomUUID(),
});
assert("5. SVG rejection", !svgPlan.ok && /SVG/i.test(svgPlan.error || ""));

const gifPlan = planWebsiteMediaUpload({
  originalName: "anim.gif",
  size: 8,
  bytes: Uint8Array.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00, 0x00]),
  id: randomUUID(),
});
const gifAsJpg = planWebsiteMediaUpload({
  originalName: "photo.jpg",
  size: 8,
  bytes: Uint8Array.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00, 0x00]),
  id: randomUUID(),
});
assert(
  "6. GIF rejection",
  !gifPlan.ok &&
    !gifAsJpg.ok &&
    /GIF|not allowed/i.test(gifPlan.error || "") &&
    /GIF/i.test(gifAsJpg.error || ""),
);

const htmlPlan = planWebsiteMediaUpload({
  originalName: "page.html",
  size: 40,
  bytes: new TextEncoder().encode("<html><script>alert(1)</script></html>"),
  id: randomUUID(),
});
const scriptPlan = inspectWebsiteImageBytes(new TextEncoder().encode("<script>alert(1)</script>"));
const htmlAsJpg = planWebsiteMediaUpload({
  originalName: "image.jpg",
  size: 40,
  bytes: new TextEncoder().encode("<html><script>alert(1)</script></html>"),
  id: randomUUID(),
});
assert(
  "7. HTML/script rejection",
  !htmlPlan.ok &&
    !htmlAsJpg.ok &&
    "error" in scriptPlan &&
    /HTML|script|not allowed/i.test(htmlPlan.error || "") &&
    /HTML|script/i.test(htmlAsJpg.error || ""),
);

const fakeExt = planWebsiteMediaUpload({
  originalName: "photo.png",
  size: jpegBytes().byteLength,
  bytes: jpegBytes(),
  id: jpegId,
});
assert(
  "8. fake extension / mismatched content",
  fakeExt.ok && fakeExt.plan?.storedFilename.endsWith(".jpg") && fakeExt.plan.mimeType === "image/jpeg",
);

const key = getWebsiteMediaObjectKey("11a1dcd6-0000-4000-8000-000000000001", `${jpegId}.jpg`);
assert(
  "9. safe generated key",
  key === `11a1dcd6-0000-4000-8000-000000000001/${jpegId}.jpg` &&
    !key.includes("..") &&
    !key.includes("secret") &&
    STORED_FILENAME_PATTERN.test(`${jpegId}.jpg`),
);
try {
  getWebsiteMediaObjectKey("11a1dcd6-0000-4000-8000-000000000001", "../escape.jpg");
  fail("9b. traversal stored filename rejected");
} catch {
  pass("9b. traversal stored filename rejected");
}

const kv = createMemoryKv();
const storage = createKvWebsiteMediaStorage(kv.namespace);
if (jpegPlan.ok) {
  await storage.write("11a1dcd6-0000-4000-8000-000000000001", jpegPlan.plan.storedFilename, jpegBytes());
  const readBack = await storage.read(
    "11a1dcd6-0000-4000-8000-000000000001",
    jpegPlan.plan.storedFilename,
  );
  assert("KV binary put/get", Boolean(readBack && readBack.byteLength === jpegBytes().byteLength));
}

let recordCalls = 0;
const cleaned = createMemoryKv();
const cleanupStorage = createKvWebsiteMediaStorage(cleaned.namespace);
try {
  await writeWebsiteMediaThenRecord(
    cleanupStorage,
    "11a1dcd6-0000-4000-8000-000000000001",
    `${jpegId}.jpg`,
    jpegBytes(),
    async () => {
      recordCalls += 1;
      throw new Error("D1 insert failed");
    },
  );
  fail("20. D1/KV partial-failure cleanup behavior", "expected throw");
} catch (error) {
  const leftover = await cleanupStorage.read(
    "11a1dcd6-0000-4000-8000-000000000001",
    `${jpegId}.jpg`,
  );
  assert(
    "20. D1/KV partial-failure cleanup behavior",
    recordCalls === 1 && leftover === null && error instanceof Error,
  );
}

const deleteKv = createMemoryKv();
const deleteStorage = createKvWebsiteMediaStorage(deleteKv.namespace);
await deleteStorage.write("11a1dcd6-0000-4000-8000-000000000001", `${jpegId}.jpg`, jpegBytes());
let deletedRecord = false;
await deleteWebsiteMediaRecordThenObject(
  deleteStorage,
  "11a1dcd6-0000-4000-8000-000000000001",
  `${jpegId}.jpg`,
  async () => {
    deletedRecord = true;
  },
);
assert(
  "20b. delete removes KV after metadata delete",
  deletedRecord &&
    (await deleteStorage.read("11a1dcd6-0000-4000-8000-000000000001", `${jpegId}.jpg`)) === null,
);

assert(
  "19. delete authorization",
  getDeleteWebsiteMediaDenial({
    adminError: "You must be signed in to continue.",
    websiteExists: true,
    mediaBelongsToWebsite: true,
    referenced: false,
  }) === "You must be signed in to continue." &&
    getDeleteWebsiteMediaDenial({
      adminError: null,
      websiteExists: true,
      mediaBelongsToWebsite: false,
      referenced: false,
    }) === "That image could not be found." &&
    getDeleteWebsiteMediaDenial({
      adminError: null,
      websiteExists: true,
      mediaBelongsToWebsite: true,
      referenced: true,
    }) === WEBSITE_MEDIA_REFERENCED_ERROR &&
    getDeleteWebsiteMediaDenial({
      adminError: null,
      websiteExists: true,
      mediaBelongsToWebsite: true,
      referenced: false,
    }) === null,
);

try {
  chooseWebsiteMediaProvider({
    isWorkersRuntime: true,
    isProductionAdmin: false,
    hasMediaKv: false,
  });
  fail("18. missing production KV binding → safe failure");
} catch (error) {
  assert(
    "18. missing production KV binding → safe failure",
    error instanceof Error && error.message === MISSING_MEDIA_KV_BINDING,
  );
}

assert(
  "18b. local npm run dev stays on filesystem",
  chooseWebsiteMediaProvider({
    isWorkersRuntime: false,
    isProductionAdmin: false,
    hasMediaKv: true,
  }) === "filesystem",
);

const missingObject = await storage.read(
  "11a1dcd6-0000-4000-8000-000000000001",
  `${randomUUID()}.jpg`,
);
assert("17. missing KV object → safe 404", missingObject === null);

const headers = getWebsiteMediaResponseHeaders({
  mimeType: "image/jpeg",
  originalFilename: "hero.jpg",
  byteLength: 12,
});
assert(
  "security headers",
  headers["X-Content-Type-Options"] === "nosniff" &&
    headers["Content-Type"] === "image/jpeg" &&
    headers["Cache-Control"] === "private, max-age=3600" &&
    String(headers["Content-Disposition"]).startsWith("inline;"),
);

const referenced = collectReferencedMediaIds(
  JSON.stringify({ hero: { src: `/media/${CEDAR_PUBLISHED_MEDIA}` } }),
);
assert(
  "reference isolation helper",
  referenced.has(CEDAR_PUBLISHED_MEDIA) && !referenced.has(CEDAR_UNREFERENCED_MEDIA),
);

const localAdmin = readConfig("wrangler.jsonc");
const localPublic = readConfig("public-runtime/wrangler.jsonc");
const productionAdmin = readConfig("wrangler.production-admin.jsonc");
const productionPublic = readConfig("public-runtime/wrangler.production.jsonc");
const packageJson = JSON.parse(readConfig("package.json"));
assert(
  "21. local npm run dev cannot touch remote KV",
  !/"remote"\s*:\s*true/.test(localAdmin) &&
    !/"remote"\s*:\s*true/.test(localPublic) &&
    localAdmin.includes("00000000-0000-4000-8000-000000000003") &&
    !localAdmin.includes("f95b658d6c914e0fbec1f06bec4b6e4d") &&
    !localPublic.includes("f95b658d6c914e0fbec1f06bec4b6e4d") &&
    !packageJson.scripts.dev.includes("production") &&
    productionAdmin.includes("f95b658d6c914e0fbec1f06bec4b6e4d") &&
    productionPublic.includes("f95b658d6c914e0fbec1f06bec4b6e4d") &&
    /"binding"\s*:\s*"MEDIA_KV"/.test(productionAdmin) &&
    /"binding"\s*:\s*"MEDIA_KV"/.test(productionPublic) &&
    !/r2_buckets/.test(productionAdmin) &&
    !/r2_buckets/.test(productionPublic),
);

let httpAvailable = true;
try {
  const probe = request(PUBLIC_ORIGIN, "/", CEDAR_HOST);
  if (!probe.status) {
    httpAvailable = false;
  }
} catch {
  httpAvailable = false;
}

if (!httpAvailable) {
  fail("HTTP media suite", "public runtime on port 3003 is not reachable");
} else {
  const published = request(PUBLIC_ORIGIN, `/media/${CEDAR_PUBLISHED_MEDIA}`, CEDAR_HOST);
  assert(
    "10. admin authorized read / 16. published referenced media",
    published.status === 200 &&
      /content-type:\s*image\//i.test(published.headerText) &&
      /x-content-type-options:\s*nosniff/i.test(published.headerText) &&
      /cache-control:\s*private/i.test(published.headerText),
    `status=${published.status}`,
  );

  const unauthenticatedAdmin = request(
    ADMIN_ORIGIN,
    `/media/${CEDAR_PUBLISHED_MEDIA}`,
    "localhost:3002",
  );
  const adminDenied =
    unauthenticatedAdmin.status === 404 ||
    ((unauthenticatedAdmin.status === 302 || unauthenticatedAdmin.status === 307) &&
      /location:\s*\/login/i.test(unauthenticatedAdmin.headerText));
  assert(
    "11. unauthenticated arbitrary media denial",
    adminDenied,
    `status=${unauthenticatedAdmin.status}`,
  );

  const crossWebsite = request(PUBLIC_ORIGIN, `/media/${COPPER_MEDIA}`, CEDAR_HOST);
  assert("12. cross-Website denial", crossWebsite.status === 404, `status=${crossWebsite.status}`);

  const unreferenced = request(
    PUBLIC_ORIGIN,
    `/media/${CEDAR_UNREFERENCED_MEDIA}`,
    CEDAR_HOST,
  );
  assert(
    "13. same-Website unreferenced denial",
    unreferenced.status === 404,
    `status=${unreferenced.status}`,
  );

  const arbitrary = request(PUBLIC_ORIGIN, `/media/${ARBITRARY_MEDIA}`, CEDAR_HOST);
  assert(
    "11b. unauthenticated arbitrary media denial (public)",
    arbitrary.status === 404,
    `status=${arbitrary.status}`,
  );

  let cedarToken = "";
  try {
    const rows = d1(
      `SELECT s.token AS token
       FROM website_review_sessions s
       INNER JOIN website_domains d ON d.website_id = s.website_id
       WHERE d.hostname = 'cedar.localhost'
       LIMIT 1`,
    );
    cedarToken = rows[0]?.token || "";
  } catch (error) {
    fail("review token lookup", String(error));
  }

  if (cedarToken) {
    const reviewMedia = request(
      PUBLIC_ORIGIN,
      `/media/${CEDAR_PUBLISHED_MEDIA}`,
      "127.0.0.1:3003",
      ["-H", `Referer: ${PUBLIC_ORIGIN}/review/${cedarToken}`],
    );
    assert(
      "14. valid review referenced media",
      reviewMedia.status === 200,
      `status=${reviewMedia.status}`,
    );
  } else {
    fail("14. valid review referenced media", "Cedar review token missing");
  }

  const revoked = request(
    PUBLIC_ORIGIN,
    `/media/${CEDAR_PUBLISHED_MEDIA}`,
    "127.0.0.1:3003",
    ["-H", `Referer: ${PUBLIC_ORIGIN}/review/${UNKNOWN_TOKEN}`],
  );
  assert("15. revoked review denial", revoked.status === 404, `status=${revoked.status}`);

  try {
    const mediaRows = d1(
      `SELECT website_id, stored_filename
       FROM website_media
       WHERE id = '${CEDAR_PUBLISHED_MEDIA}'
       LIMIT 1`,
    );
    const row = mediaRows[0];
    if (!row?.website_id || !row?.stored_filename) {
      fail("17b. missing object HTTP 404", "published media row missing");
    } else {
      const filePath = path.join(
        root,
        "storage",
        "website-media",
        row.website_id,
        row.stored_filename,
      );
      const movedPath = `${filePath}.m27-missing`;
      if (!existsSync(filePath)) {
        fail("17b. missing object HTTP 404", "filesystem object missing before test");
      } else {
        renameSync(filePath, movedPath);
        try {
          const missing = request(
            PUBLIC_ORIGIN,
            `/media/${CEDAR_PUBLISHED_MEDIA}`,
            CEDAR_HOST,
          );
          assert(
            "17b. missing object HTTP 404",
            missing.status === 404,
            `status=${missing.status}`,
          );
        } finally {
          renameSync(movedPath, filePath);
        }
        const restored = request(
          PUBLIC_ORIGIN,
          `/media/${CEDAR_PUBLISHED_MEDIA}`,
          CEDAR_HOST,
        );
        assert(
          "17c. object restore after missing-object test",
          restored.status === 200,
          `status=${restored.status}`,
        );
      }
    }
  } catch (error) {
    fail("17b. missing object HTTP 404", String(error));
  }
}

if (failures > 0) {
  console.error(`\n${failures} website media smoke test(s) failed.`);
  process.exit(1);
}

console.log("\nAll website media smoke tests passed.");
