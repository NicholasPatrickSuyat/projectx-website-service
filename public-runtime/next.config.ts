import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const repoRoot = path.resolve(__dirname, "..");

process.env.PXWS_PUBLIC_RUNTIME = "1";

function loadLocalDevVars() {
  const filePath = path.join(repoRoot, ".dev.vars");
  let contents = "";
  try {
    contents = fs.readFileSync(filePath, "utf8");
  } catch {
    return;
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
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadLocalDevVars();

const nextConfig: NextConfig = {
  serverExternalPackages: ["wrangler"],
  outputFileTracingRoot: repoRoot,
};

export default nextConfig;

void initOpenNextCloudflareForDev({
  configPath: path.join(__dirname, "wrangler.jsonc"),
  // Match the admin app's Miniflare persist (`.wrangler/state/v3`).
  persist: { path: path.join(repoRoot, ".wrangler", "state", "v3") },
  remoteBindings: false,
});
