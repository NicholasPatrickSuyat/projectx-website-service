import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (
  process.env.PXWS_PRODUCTION_ADMIN === "1" &&
  process.env.PXWS_ADMIN_PRODUCTION_COMMAND !== "1"
) {
  throw new Error(
    "Production D1 is only available through npm run admin:production. Unset PXWS_PRODUCTION_ADMIN.",
  );
}

const PRODUCTION_ADMIN =
  process.env.PXWS_PRODUCTION_ADMIN === "1" &&
  process.env.PXWS_ADMIN_PRODUCTION_COMMAND === "1";
const DEV_VARS_FILE = PRODUCTION_ADMIN
  ? ".dev.vars.production-admin"
  : ".dev.vars";
const WRANGLER_CONFIG = PRODUCTION_ADMIN
  ? "wrangler.production-admin.jsonc"
  : "wrangler.jsonc";

function loadDevVars(fileName: string) {
  const filePath = path.join(process.cwd(), fileName);
  let contents = "";
  try {
    contents = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    if (PRODUCTION_ADMIN) {
      throw new Error(
        `Production admin mode requires ${fileName}. Create it from .dev.vars.production-admin.example. Do not copy .dev.vars.`,
      );
    }
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separator = trimmed.indexOf("=");
    if (separator <= 0) {
      continue;
    }
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (key && (PRODUCTION_ADMIN || process.env[key] === undefined)) {
      process.env[key] = value;
    }
  }
}

if (PRODUCTION_ADMIN) {
  delete process.env.ADMIN_USERNAME;
  delete process.env.ADMIN_PASSWORD_HASH;
  delete process.env.AUTH_SESSION_SECRET;
}

loadDevVars(DEV_VARS_FILE);

const wranglerConfigPath = path.join(process.cwd(), WRANGLER_CONFIG);
if (PRODUCTION_ADMIN) {
  if (!fs.existsSync(wranglerConfigPath)) {
    throw new Error(`Missing ${WRANGLER_CONFIG}. Production admin will not start.`);
  }
  const configText = fs.readFileSync(wranglerConfigPath, "utf8");
  if (!/"remote"\s*:\s*true/.test(configText)) {
    throw new Error(`${WRANGLER_CONFIG} must set D1 remote: true.`);
  }
  if (!configText.includes("db47d1af-bc9c-47f0-ad8a-1377971dbd24")) {
    throw new Error(`${WRANGLER_CONFIG} must bind projectx-websites-production.`);
  }
  if (/"remote"\s*:\s*true/.test(configText) && /"binding"\s*:\s*"MEDIA"/.test(configText)) {
    const mediaBlock = /"r2_buckets"\s*:\s*\[[\s\S]*?\]/.exec(configText)?.[0] || "";
    if (/"remote"\s*:\s*true/.test(mediaBlock)) {
      throw new Error("Production admin must not bind remote R2.");
    }
  }
} else if (fs.existsSync(wranglerConfigPath)) {
  const configText = fs.readFileSync(wranglerConfigPath, "utf8");
  if (configText.includes("db47d1af-bc9c-47f0-ad8a-1377971dbd24")) {
    throw new Error(
      "wrangler.jsonc must not bind production D1. Use npm run admin:production.",
    );
  }
  if (/"remote"\s*:\s*true/.test(configText)) {
    throw new Error(
      "wrangler.jsonc must keep remote: false. Production D1 is admin:production only.",
    );
  }
}

const nextConfig: NextConfig = {
  env: PRODUCTION_ADMIN ? { PXWS_PRODUCTION_ADMIN: "1" } : {},
  serverExternalPackages: ["wrangler"],
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;

void initOpenNextCloudflareForDev({
  configPath: path.join(process.cwd(), WRANGLER_CONFIG),
  persist: !PRODUCTION_ADMIN,
  remoteBindings: PRODUCTION_ADMIN,
});
