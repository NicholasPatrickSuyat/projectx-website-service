import {
  base64UrlToBytes,
  bytesToBase64Url,
  timingSafeEqual,
  utf8Bytes,
} from "@/lib/auth/encoding";
import { ADMIN_SESSION_TTL_SECONDS } from "@/lib/auth/constants";

export type AdminSession = {
  username: string;
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
};

type SessionPayload = {
  v: 1;
  u: string;
  sid: string;
  iat: number;
  exp: number;
};

async function hmacSha256(secret: string, value: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    utf8Bytes(secret) as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    utf8Bytes(value) as BufferSource,
  );
  return new Uint8Array(signature);
}

function encodePayload(payload: SessionPayload): string {
  return bytesToBase64Url(utf8Bytes(JSON.stringify(payload)));
}

function decodePayload(value: string): SessionPayload | null {
  const bytes = base64UrlToBytes(value);
  if (!bytes) {
    return null;
  }

  try {
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as SessionPayload;
    if (
      parsed?.v !== 1 ||
      typeof parsed.u !== "string" ||
      typeof parsed.sid !== "string" ||
      typeof parsed.iat !== "number" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function createAdminSessionValue(
  username: string,
  sessionId: string,
  sessionSecret: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    v: 1,
    u: username,
    sid: sessionId,
    iat: now,
    exp: now + ADMIN_SESSION_TTL_SECONDS,
  };
  const encoded = encodePayload(payload);
  const signature = bytesToBase64Url(await hmacSha256(sessionSecret, encoded));
  return `${encoded}.${signature}`;
}

export async function readAdminSessionValue(
  cookieValue: string | undefined,
  sessionSecret: string,
): Promise<AdminSession | null> {
  if (!cookieValue) {
    return null;
  }

  const separator = cookieValue.lastIndexOf(".");
  if (separator <= 0 || separator === cookieValue.length - 1) {
    return null;
  }

  const encoded = cookieValue.slice(0, separator);
  const provided = base64UrlToBytes(cookieValue.slice(separator + 1));
  if (!provided) {
    return null;
  }

  const expected = await hmacSha256(sessionSecret, encoded);
  if (!timingSafeEqual(provided, expected)) {
    return null;
  }

  const payload = decodePayload(encoded);
  if (!payload) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now || payload.iat > now + 60) {
    return null;
  }

  return {
    username: payload.u,
    sessionId: payload.sid,
    issuedAt: payload.iat,
    expiresAt: payload.exp,
  };
}
