import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fromTemplates = path.join(root, "public", "templates");
const toPublic = path.join(root, "public-runtime", "public");
const toTemplates = path.join(toPublic, "templates");
const fromHeaders = path.join(root, "public", "_headers");
const toHeaders = path.join(toPublic, "_headers");
const fromCss = path.join(root, "public", "publication-runtime.css");
const toCss = path.join(toPublic, "publication-runtime.css");

const cssBuild = spawnSync(
  process.execPath,
  [path.join(root, "scripts", "build-publication-css.mjs")],
  { cwd: root, stdio: "inherit" },
);
if (cssBuild.status !== 0) {
  throw new Error("Failed to build publication-runtime.css");
}

mkdirSync(toPublic, { recursive: true });

if (existsSync(toTemplates)) {
  rmSync(toTemplates, { recursive: true, force: true });
}

if (!existsSync(fromTemplates)) {
  throw new Error(`Missing template assets at ${fromTemplates}`);
}

cpSync(fromTemplates, toTemplates, { recursive: true });

if (existsSync(fromHeaders)) {
  cpSync(fromHeaders, toHeaders);
}

if (!existsSync(fromCss)) {
  throw new Error(`Missing ${fromCss}`);
}
cpSync(fromCss, toCss);
