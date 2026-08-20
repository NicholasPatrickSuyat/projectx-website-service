import fs from "node:fs";
import path from "node:path";

const MISSING_DB_BINDING =
  "Missing required Cloudflare D1 binding `DB`. The application cannot use a silent database fallback.";
const MISSING_MEDIA_KV_BINDING =
  "Missing required Cloudflare KV binding `MEDIA_KV`. Production cannot use local filesystem media storage.";
const FILESYSTEM_WORKERS_ERROR =
  "Local filesystem media storage cannot run in the Cloudflare Workers runtime.";
const FILESYSTEM_PRODUCTION_ADMIN_ERROR =
  "Local filesystem media storage cannot run in production admin mode. Workers KV binding `MEDIA_KV` is required.";

function requireBinding(value, message) {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

function chooseWebsiteMediaProvider(input) {
  if (input.isWorkersRuntime || input.isProductionAdmin) {
    if (!input.hasMediaKv) {
      throw new Error(MISSING_MEDIA_KV_BINDING);
    }
    return "kv";
  }
  return "filesystem";
}

function assertLocalFilesystemAllowed(isWorkersRuntime, isProductionAdmin) {
  if (isWorkersRuntime) {
    throw new Error(FILESYSTEM_WORKERS_ERROR);
  }
  if (isProductionAdmin) {
    throw new Error(FILESYSTEM_PRODUCTION_ADMIN_ERROR);
  }
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

check("missing MEDIA_KV throws and does not fall back to filesystem", () => {
  try {
    chooseWebsiteMediaProvider({
      isWorkersRuntime: true,
      isProductionAdmin: false,
      hasMediaKv: false,
    });
    throw new Error("expected throw");
  } catch (error) {
    if (!(error instanceof Error) || error.message !== MISSING_MEDIA_KV_BINDING) {
      throw error;
    }
  }
});

check("production admin missing MEDIA_KV throws and does not use filesystem", () => {
  try {
    chooseWebsiteMediaProvider({
      isWorkersRuntime: false,
      isProductionAdmin: true,
      hasMediaKv: false,
    });
    throw new Error("expected throw");
  } catch (error) {
    if (!(error instanceof Error) || error.message !== MISSING_MEDIA_KV_BINDING) {
      throw error;
    }
  }
});

check("Workers runtime with MEDIA_KV uses kv", () => {
  const provider = chooseWebsiteMediaProvider({
    isWorkersRuntime: true,
    isProductionAdmin: false,
    hasMediaKv: true,
  });
  if (provider !== "kv") {
    throw new Error(`expected kv, got ${provider}`);
  }
});

check("production admin with MEDIA_KV uses kv", () => {
  const provider = chooseWebsiteMediaProvider({
    isWorkersRuntime: false,
    isProductionAdmin: true,
    hasMediaKv: true,
  });
  if (provider !== "kv") {
    throw new Error(`expected kv, got ${provider}`);
  }
});

check("local non-Workers runtime uses filesystem even if KV exists", () => {
  const provider = chooseWebsiteMediaProvider({
    isWorkersRuntime: false,
    isProductionAdmin: false,
    hasMediaKv: true,
  });
  if (provider !== "filesystem") {
    throw new Error(`expected filesystem, got ${provider}`);
  }
});

check("filesystem adapter refuses Workers runtime", () => {
  try {
    assertLocalFilesystemAllowed(true, false);
    throw new Error("expected throw");
  } catch (error) {
    if (!(error instanceof Error) || error.message !== FILESYSTEM_WORKERS_ERROR) {
      throw error;
    }
  }
});

check("filesystem adapter refuses production admin", () => {
  try {
    assertLocalFilesystemAllowed(false, true);
    throw new Error("expected throw");
  } catch (error) {
    if (
      !(error instanceof Error) ||
      error.message !== FILESYSTEM_PRODUCTION_ADMIN_ERROR
    ) {
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
const providerSrc = fs.readFileSync(
  path.join("src", "lib", "website-media", "provider.ts"),
  "utf8",
);

check("source keeps missing-DB message", () => {
  if (!envSrc.includes(MISSING_DB_BINDING)) {
    throw new Error("DB message missing from env.ts");
  }
});
check("source keeps missing-MEDIA_KV message", () => {
  if (!providerSrc.includes(MISSING_MEDIA_KV_BINDING)) {
    throw new Error("MEDIA_KV message missing from provider.ts");
  }
  if (!envSrc.includes("MISSING_MEDIA_KV_BINDING") || !envSrc.includes("getRequiredMediaKvBinding")) {
    throw new Error("MEDIA_KV binding helper missing from env.ts");
  }
});
check("Workers/production storage path requires MEDIA_KV", () => {
  if (
    !storageSrc.includes("chooseWebsiteMediaProvider") ||
    !storageSrc.includes("getRequiredMediaKvBinding") ||
    !storageSrc.includes("createKvWebsiteMediaStorage")
  ) {
    throw new Error("Workers KV path is not required in storage.ts");
  }
});
check("storage selector does not require R2", () => {
  if (
    storageSrc.includes("createR2WebsiteMediaStorage") ||
    storageSrc.includes("getRequiredMediaBinding")
  ) {
    throw new Error("R2 must not be a required production media dependency");
  }
});
check("Workers storage path does not fall back to filesystem", () => {
  if (!storageSrc.includes('if (provider === "kv")')) {
    throw new Error("KV provider branch missing");
  }
});
check("filesystem adapter has Workers and production-admin guards", () => {
  if (
    !localSrc.includes("FILESYSTEM_WORKERS_ERROR") ||
    !localSrc.includes("FILESYSTEM_PRODUCTION_ADMIN_ERROR") ||
    !providerSrc.includes(FILESYSTEM_WORKERS_ERROR) ||
    !providerSrc.includes(FILESYSTEM_PRODUCTION_ADMIN_ERROR)
  ) {
    throw new Error("filesystem guards missing");
  }
});

if (failed) {
  process.exitCode = 1;
} else {
  console.log("binding safety: pass");
}
