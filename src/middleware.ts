import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, SESSION_SECRET_MIN_BYTES } from "@/lib/auth/constants";
import { isPublicPath, isSafeInternalNextPath } from "@/lib/auth/paths";
import { readAdminSessionValue } from "@/lib/auth/session-token";

// OpenNext on Cloudflare does not support Next.js 16 `proxy.ts` (Node middleware).
// Keep Edge `middleware.ts` and still verify sessions in the admin layout/actions.

function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  const current = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.search = isSafeInternalNextPath(current)
    ? `?next=${encodeURIComponent(current)}`
    : "";
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionCookie) {
    return redirectToLogin(request);
  }

  const sessionSecret = process.env.AUTH_SESSION_SECRET?.trim();
  if (sessionSecret && sessionSecret.length >= SESSION_SECRET_MIN_BYTES) {
    const session = await readAdminSessionValue(sessionCookie, sessionSecret);
    if (!session) {
      return redirectToLogin(request);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|templates/(?:service-modern-01|restaurant-modern-01|salon-modern-01)/[^/?]+\\.(?:avif|gif|ico|jpe?g|png|svg|webp|woff2?|ttf|otf)).*)",
  ],
};
