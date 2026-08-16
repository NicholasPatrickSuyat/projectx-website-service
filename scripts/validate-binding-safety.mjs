import fs from "node:fs";
import path from "node:path";

const MISSING_DB_BINDING =
  "Missing required Cloudflare D1 binding `DB`. The application cannot use a silent database fallback.";
const MISSING_MEDIA_BINDING =
  "Missing required Cloudflare R2 binding `MEDIA`. Production cannot use local filesystem media storage.";
const FILESYSTEM_WORKERS_ERROR =
  "Local filesystem media storage cannot run in the Cloudflare Workers runtime.";

function requireBinding(value, message) {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

function assertLocalFilesystemAllowed(isWorkersRuntime) {
  if (isWorkersRuntime) {
    throw new Error(FILESYSTEM_WORKERS_ERROR);
  }
}

function chooseMediaProvider(isWorkersRuntime, env) {
  if (isWorkersRuntime) {
    requireBinding(env.MEDIA, MISSING_MEDIA_BINDING);
    return "r2";
  }
  assertLocalFilesystemAllowed(false);
  return "filesystem";
}

let failed = false;
function check(name, fn) {
  try {
    fn();
    console.log(`pass: ${name}`);
  } catch (error) {
    failed = true;
    console.error(`fail: ${name}: ${error instanceof Error ? error.message : error}`);
  }
}

check("missing DB throws and does not fall back", () => {
  try {
    requireBinding(undefined, MISSING_DB_BINDING);
    throw new Error("expected throw");
  } catch (error) {
    if (!(error instanceof Error) || error.message !== MISSING_DB_BINDING) {
      throw error;
    }
  }
});

check("missing MEDIA throws and does not fall back to filesystem", () => {
  try {
    chooseMediaProvider(true, {});
    throw new Error("expected throw");
  } catch (error) {
    if (!(error instanceof Error) || error.message !== MISSING_MEDIA_BINDING) {
      throw error;
    }
  }
});

check("Workers runtime with MEDIA uses r2", () => {
  const provider = chooseMediaProvider(true, { MEDIA: { put() {}, get() {} } });
  if (provider !== "r2") {
    throw new Error(`expected r2, got ${provider}`);
  }
});

check("non-Workers runtime uses filesystem", () => {
  const provider = chooseMediaProvider(false, {});
  if (provider !== "filesystem") {
    throw new Error(`expected filesystem, got ${provider}`);
  }
});

check("filesystem adapter refuses Workers runtime", () => {
  try {
    assertLocalFilesystemAllowed(true);
    throw new Error("expected throw");
  } catch (error) {
    if (!(error instanceof Error) || error.message !== FILESYSTEM_WORKERS_ERROR) {
      throw error;
    }
  }
});

const envSrc = fs.readFileSync(path.join("src", "lib", "runtime", "env.ts"), "utf8");
const storageSrc = fs.readFileSync(
  path.join("src", "lib", "website-media", "storage.ts"),
  "utf8",
);
const localSrc = fs.readFileSync(
  path.join("src", "lib", "website-media", "local-filesystem-storage.ts"),
  "utf8",
);

check("source keeps missing-DB message", () => {
  if (!envSrc.includes(MISSING_DB_BINDING)) {
    throw new Error("DB message missing from env.ts");
  }
});
check("source keeps missing-MEDIA message", () => {
  if (!envSrc.includes(MISSING_MEDIA_BINDING)) {
    throw new Error("MEDIA message missing from env.ts");
  }
});
check("Workers storage path requires MEDIA binding", () => {
  if (
    !storageSrc.includes("isCloudflareWorkersRuntime()") ||
    !storageSrc.includes("getRequiredMediaBinding") ||
    !storageSrc.includes("createR2WebsiteMediaStorage")
  ) {
    throw new Error("Workers R2 path is not required in storage.ts");
  }
});
check("Workers storage path does not fall back to filesystem", () => {
  const workersBlock = storageSrc.slice(
    storageSrc.indexOf("if (isCloudflareWorkersRuntime())"),
    storageSrc.indexOf("const { getLocalWebsiteMediaStorage }"),
  );
  if (workersBlock.includes("getLocalWebsiteMediaStorage")) {
    throw new Error("Workers branch still references filesystem storage");
  }
});
check("filesystem adapter has Workers runtime guard", () => {
  if (!localSrc.includes(FILESYSTEM_WORKERS_ERROR)) {
    throw new Error("filesystem Workers guard missing");
  }
});

if (failed) {
  process.exitCode = 1;
} else {
  console.log("binding safety: pass");
}
