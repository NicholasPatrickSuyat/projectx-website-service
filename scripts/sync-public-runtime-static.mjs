import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fromTemplates = path.join(root, "public", "templates");
const toPublic = path.join(root, "public-runtime", "public");
const toTemplates = path.join(toPublic, "templates");
const fromHeaders = path.join(root, "public", "_headers");
const toHeaders = path.join(toPublic, "_headers");

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
