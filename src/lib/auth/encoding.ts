const encoder = new TextEncoder();

export function utf8Bytes(value: string): Uint8Array {
  return encoder.encode(value);
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function base64UrlToBytes(value: string): Uint8Array | null {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  try {
    const binary = atob(`${padded}${"=".repeat(padLength)}`);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    return null;
  }
}

export function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

export function timingSafeEqualString(left: string, right: string): boolean {
  const leftBytes = utf8Bytes(left);
  const rightBytes = utf8Bytes(right);
  const size = Math.max(leftBytes.length, rightBytes.length, 1);
  const paddedLeft = new Uint8Array(size);
  const paddedRight = new Uint8Array(size);
  paddedLeft.set(leftBytes);
  paddedRight.set(rightBytes);

  const equal =
    timingSafeEqual(paddedLeft, paddedRight) &&
    leftBytes.length === rightBytes.length;
  return equal;
}

export async function hmacSha256(
  secret: string,
  value: string,
): Promise<Uint8Array> {
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
