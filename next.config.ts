import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

function loadLocalDevVars() {
  const filePath = path.join(process.cwd(), ".dev.vars");
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
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;

void initOpenNextCloudflareForDev({
  persist: true,
  remoteBindings: false,
});
