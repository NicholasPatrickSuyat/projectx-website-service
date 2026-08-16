const PUBLIC_EXACT_PATHS = new Set(["/login"]);

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) {
    return true;
  }

  return (
    pathname.startsWith("/review/") ||
    pathname.startsWith("/media/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  );
}

export function isSafeInternalNextPath(value: string | null | undefined): value is string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return false;
  }
  if (value.startsWith("/login") || value.startsWith("/review/")) {
    return false;
  }
  if (value.includes("\\") || value.includes("://")) {
    return false;
  }

  return true;
}
