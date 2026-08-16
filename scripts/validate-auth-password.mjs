import { webcrypto } from "node:crypto";

const ITERATIONS = 600_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;
const HASH_PATTERN =
  /^pbkdf2-sha256\$(\d+)\$([A-Za-z0-9_-]+)\$([A-Za-z0-9_-]+)$/;

function bytesToBase64Url(bytes) {
  return Buffer.from(bytes).toString("base64url");
}

function base64UrlToBytes(value) {
  try {
    return new Uint8Array(Buffer.from(value, "base64url"));
  } catch {
    return null;
  }
}

function timingSafeEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

async function deriveBits(password, salt, iterations) {
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
      iterations,
    },
    key,
    KEY_BITS,
  );
  return new Uint8Array(bits);
}

async function hashPassword(password) {
  const salt = webcrypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const started = Date.now();
  const hash = await deriveBits(password, salt, ITERATIONS);
  return {
    encoded: `pbkdf2-sha256$${ITERATIONS}$${bytesToBase64Url(salt)}$${bytesToBase64Url(hash)}`,
    ms: Date.now() - started,
  };
}

async function verifyPassword(password, stored) {
  const match = HASH_PATTERN.exec(stored.trim());
  if (!match) {
    await deriveBits(
      password,
      webcrypto.getRandomValues(new Uint8Array(SALT_BYTES)),
      ITERATIONS,
    );
    return false;
  }
  const iterations = Number(match[1]);
  const salt = base64UrlToBytes(match[2]);
  const hash = base64UrlToBytes(match[3]);
  if (
    !Number.isInteger(iterations) ||
    iterations < 100_000 ||
    !salt ||
    !hash
  ) {
    return false;
  }
  const derived = await deriveBits(password, salt, iterations);
  return timingSafeEqual(derived, hash);
}

const password = "local-validation-only";
const generated = await hashPassword(password);
const parts = generated.encoded.split("$");
if (parts[1] !== "600000") {
  throw new Error(`expected 600000 iterations, got ${parts[1]}`);
}
if (!(await verifyPassword(password, generated.encoded))) {
  throw new Error("correct password should verify");
}
if (await verifyPassword("wrong-password", generated.encoded)) {
  throw new Error("wrong password should fail");
}
if (await verifyPassword(password, "not-a-hash")) {
  throw new Error("malformed hash should fail");
}
if (await verifyPassword(password, "pbkdf2-sha256$abc$aa$bb")) {
  throw new Error("malformed iteration count should fail");
}

console.log(
  JSON.stringify({
    ok: true,
    iterations: Number(parts[1]),
    hashDurationMs: generated.ms,
  }),
);
