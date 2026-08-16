import { webcrypto } from "node:crypto";

const ITERATIONS = 600_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

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
  const hash = new Uint8Array(bits);
  return `pbkdf2-sha256$${ITERATIONS}$${bytesToBase64Url(salt)}$${bytesToBase64Url(hash)}`;
}

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-admin-password.mjs <password>");
  process.exit(1);
}

const hash = await hashPassword(password);
console.log(hash);
