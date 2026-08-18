import { webcrypto } from "node:crypto";
import { writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ITERATIONS = 600_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, ".dev.vars.production-admin");

function bytesToBase64Url(bytes) {
  return Buffer.from(bytes).toString("base64url");
}

async function hashPassword(password) {
  const salt = webcrypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const key = await webcrypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await webcrypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: ITERATIONS,
    },
    key,
    KEY_BITS,
  );
  return `pbkdf2-sha256$${ITERATIONS}$${bytesToBase64Url(salt)}$${bytesToBase64Url(new Uint8Array(bits))}`;
}

if (existsSync(outPath)) {
  console.log(".dev.vars.production-admin already exists; leaving it unchanged.");
  process.exit(0);
}

const password = bytesToBase64Url(webcrypto.getRandomValues(new Uint8Array(24)));
const sessionSecret = bytesToBase64Url(webcrypto.getRandomValues(new Uint8Array(48)));
const passwordHash = await hashPassword(password);

const contents = `# Gitignored production-admin secrets. Do not commit.
# Do not copy values from .dev.vars.
NEXTJS_ENV=development
PXWS_PRODUCTION_ADMIN=1
ADMIN_USERNAME=pxws-production-admin
ADMIN_PASSWORD=${password}
ADMIN_PASSWORD_HASH=${passwordHash}
AUTH_SESSION_SECRET=${sessionSecret}
`;

writeFileSync(outPath, contents, { mode: 0o600 });
console.log("Wrote gitignored .dev.vars.production-admin.");
console.log("Open that file locally for the username and password. Values are not printed here.");
