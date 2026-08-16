import {
  PBKDF2_ITERATIONS,
  PBKDF2_KEY_BITS,
  PBKDF2_SALT_BYTES,
} from "@/lib/auth/constants";
import {
  base64UrlToBytes,
  bytesToBase64Url,
  timingSafeEqual,
  utf8Bytes,
} from "@/lib/auth/encoding";

type ParsedPasswordHash = {
  iterations: number;
  salt: Uint8Array;
  hash: Uint8Array;
};

const HASH_PATTERN =
  /^pbkdf2-sha256\$(\d+)\$([A-Za-z0-9_-]+)\$([A-Za-z0-9_-]+)$/;

async function deriveBits(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    utf8Bytes(password) as BufferSource,
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: salt as BufferSource,
      iterations,
    },
    key,
    PBKDF2_KEY_BITS,
  );

  return new Uint8Array(bits);
}

function parsePasswordHash(stored: string): ParsedPasswordHash | null {
  const match = HASH_PATTERN.exec(stored.trim());
  if (!match) {
    return null;
  }

  const iterations = Number(match[1]);
  if (!Number.isInteger(iterations) || iterations < 100_000 || iterations > 1_000_000) {
    return null;
  }

  const salt = base64UrlToBytes(match[2]);
  const hash = base64UrlToBytes(match[3]);
  if (!salt || !hash || salt.byteLength !== PBKDF2_SALT_BYTES || hash.byteLength !== 32) {
    return null;
  }

  return { iterations, salt, hash };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_BYTES));
  const hash = await deriveBits(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2-sha256$${PBKDF2_ITERATIONS}$${bytesToBase64Url(salt)}$${bytesToBase64Url(hash)}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const parsed = parsePasswordHash(storedHash);
  if (!parsed) {
    await deriveBits(
      password,
      crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_BYTES)),
      PBKDF2_ITERATIONS,
    );
    return false;
  }

  const derived = await deriveBits(password, parsed.salt, parsed.iterations);
  return timingSafeEqual(derived, parsed.hash);
}
