const PUBLIC_EXACT_PATHS = new Set(["/login"]);

const BUNDLED_TEMPLATE_ASSET_IDS = new Set([
  "service-modern-01",
  "restaurant-modern-01",
  "salon-modern-01",
]);

const BUNDLED_TEMPLATE_ASSET_EXTENSIONS = new Set([
  "avif",
  "gif",
  "ico",
  "jpeg",
  "jpg",
  "otf",
  "png",
  "svg",
  "ttf",
  "webp",
  "woff",
  "woff2",
]);

export function isBundledTemplateAssetPath(pathname: string): boolean {
  const match = /^\/templates\/([^/]+)\/([^/]+)$/.exec(pathname);
  if (!match) {
    return false;
  }

  const templateId = match[1];
  const filename = match[2];
  if (!templateId || !filename || !BUNDLED_TEMPLATE_ASSET_IDS.has(templateId)) {
    return false;
  }

  const separator = filename.lastIndexOf(".");
  if (separator <= 0 || separator === filename.length - 1) {
    return false;
  }

  const extension = filename.slice(separator + 1).toLowerCase();
  return BUNDLED_TEMPLATE_ASSET_EXTENSIONS.has(extension);
}

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname) || isBundledTemplateAssetPath(pathname)) {
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
