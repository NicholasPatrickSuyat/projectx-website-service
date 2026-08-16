export const HOSTNAME_MAX_LENGTH = 253;
export const HOSTNAME_LABEL_MAX_LENGTH = 63;
export const HOSTNAME_MAX_PER_WEBSITE = 20;

const DNS_LABEL_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const IPV4_PATTERN =
  /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/;

export type HostnameParseResult =
  | { ok: true; hostname: string }
  | { ok: false; error: string };

function isIPv6Literal(value: string): boolean {
  return value.includes(":");
}

function isIPv4Literal(value: string): boolean {
  return IPV4_PATTERN.test(value);
}

export function isAdminApplicationHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    isIPv4Literal(hostname) ||
    isIPv6Literal(hostname)
  );
}

function inputShapeError(raw: string): string | null {
  if (raw.includes("://")) {
    return "Enter a hostname only, without http:// or https://.";
  }
  if (raw.includes("/") || raw.includes("?") || raw.includes("#")) {
    return "Hostnames cannot include a path or query string.";
  }
  if (
    raw.includes("@") ||
    raw.includes(" ") ||
    raw.includes("*") ||
    raw.includes("\\")
  ) {
    return "That hostname is not valid.";
  }
  return null;
}

function stripTrailingDots(value: string): string {
  return value.replace(/\.+$/u, "");
}

function stripPort(value: string): string | null {
  if (value.startsWith("[")) {
    const end = value.indexOf("]");
    if (end === -1) {
      return null;
    }
    const literal = value.slice(1, end);
    const rest = value.slice(end + 1);
    if (rest && !/^:\d+$/.test(rest)) {
      return null;
    }
    return literal;
  }

  const lastColon = value.lastIndexOf(":");
  if (lastColon === -1) {
    return value;
  }

  if (value.indexOf(":") !== lastColon) {
    return value;
  }

  const port = value.slice(lastColon + 1);
  if (!/^\d+$/.test(port)) {
    return null;
  }

  return value.slice(0, lastColon);
}

function hasValidDnsLabels(hostname: string): boolean {
  if (hostname.length === 0 || hostname.length > HOSTNAME_MAX_LENGTH) {
    return false;
  }

  const labels = hostname.split(".");
  if (labels.length < 2) {
    return false;
  }

  return labels.every(
    (label) =>
      label.length > 0 &&
      label.length <= HOSTNAME_LABEL_MAX_LENGTH &&
      DNS_LABEL_PATTERN.test(label),
  );
}

function extractNormalizedHostname(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || inputShapeError(trimmed)) {
    return null;
  }

  const lowered = stripTrailingDots(trimmed.toLowerCase());
  if (!lowered) {
    return null;
  }

  const withoutPort = stripPort(lowered);
  if (!withoutPort) {
    return null;
  }

  const hostname = stripTrailingDots(withoutPort);
  return hostname || null;
}

export function parseHostnameCandidate(raw: string): HostnameParseResult {
  if (typeof raw !== "string") {
    return { ok: false, error: "Enter a hostname." };
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter a hostname." };
  }

  const shapeError = inputShapeError(trimmed);
  if (shapeError) {
    return { ok: false, error: shapeError };
  }

  const hostname = extractNormalizedHostname(trimmed);
  if (!hostname) {
    return { ok: false, error: "That hostname is not valid." };
  }

  if (isAdminApplicationHostname(hostname)) {
    return {
      ok: false,
      error: "That hostname is reserved for the local admin application.",
    };
  }

  if (!hasValidDnsLabels(hostname)) {
    return { ok: false, error: "That hostname is not valid." };
  }

  return { ok: true, hostname };
}

export function parseRequestHostname(
  rawHostHeader: string | null | undefined,
): string | null {
  if (!rawHostHeader) {
    return null;
  }

  const hostname = extractNormalizedHostname(rawHostHeader);
  if (!hostname) {
    return null;
  }

  if (isAdminApplicationHostname(hostname)) {
    return hostname;
  }

  if (!hasValidDnsLabels(hostname)) {
    return null;
  }

  return hostname;
}
