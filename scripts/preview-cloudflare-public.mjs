import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public-runtime");
const persistTo = path.relative(publicDir, path.join(root, ".wrangler", "state"));
const cli = path.join(
  root,
  "node_modules",
  "@opennextjs",
  "cloudflare",
  "dist",
  "cli",
  "index.js",
);

const extraArgs = process.argv.slice(2);

const env = {
  ...process.env,
  PXWS_PUBLIC_RUNTIME: "1",
};
delete env.ADMIN_USERNAME;
delete env.ADMIN_PASSWORD_HASH;
delete env.AUTH_SESSION_SECRET;

const child = spawn(
  process.execPath,
  [
    cli,
    "preview",
    "--port",
    "3003",
    `--persist-to=${persistTo}`,
    ...extraArgs,
  ],
  {
    cwd: publicDir,
    stdio: "inherit",
    env,
  },
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
