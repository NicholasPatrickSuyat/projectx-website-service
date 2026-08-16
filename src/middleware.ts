import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, SESSION_SECRET_MIN_BYTES } from "@/lib/auth/constants";
import {
  isPublicHostPath,
  isPublicPath,
  isSafeInternalNextPath,
  isSharedPublicResourcePath,
} from "@/lib/auth/paths";
import { readAdminSessionValue } from "@/lib/auth/session-token";
import {
  isAdminApplicationHostname,
  parseRequestHostname,
} from "@/lib/website-domains/hostname";
import { isReviewToken } from "@/lib/website-review/token";
import {
  REVIEW_MEDIA_COOKIE,
  REVIEW_MEDIA_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/website-review/types";

// OpenNext on Cloudflare does not support Next.js 16 `proxy.ts` (Node middleware).
// Keep Edge `middleware.ts` and still verify sessions in the admin layout/actions.
// Hostname routing uses the Host header only. Do not query D1 from middleware.

function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  const current = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.search = isSafeInternalNextPath(current)
    ? `?next=${encodeURIComponent(current)}`
    : "";
  return NextResponse.redirect(loginUrl);
}

function withReviewMediaCookie(request: NextRequest, response: NextResponse) {
  const match = /^\/review\/([^/]+)\/?$/.exec(request.nextUrl.pathname);
  const token = match?.[1];
  if (!token || !isReviewToken(token)) {
    return response;
  }

  response.cookies.set({
    name: REVIEW_MEDIA_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/media",
    maxAge: REVIEW_MEDIA_COOKIE_MAX_AGE_SECONDS,
    secure: request.nextUrl.protocol === "https:",
  });
  return response;
}

function rewriteToPublicHost(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = request.nextUrl;
  url.pathname = pathname === "/" ? "/host" : `/host${pathname}`;
  return NextResponse.rewrite(url);
}

function continueRequest(request: NextRequest) {
  return withReviewMediaCookie(request, NextResponse.next());
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawHost = request.headers.get("host");
  const hostname = parseRequestHostname(rawHost);

  if (rawHost && !hostname) {
    if (isSharedPublicResourcePath(pathname) || isPublicHostPath(pathname)) {
      return continueRequest(request);
    }
    return rewriteToPublicHost(request);
  }

  const isAdminHost = !hostname || isAdminApplicationHostname(hostname);

  if (!isAdminHost) {
    if (isSharedPublicResourcePath(pathname) || isPublicHostPath(pathname)) {
      return continueRequest(request);
    }
    return rewriteToPublicHost(request);
  }

  if (isPublicPath(pathname)) {
    return continueRequest(request);
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

  return continueRequest(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|templates/(?:service-modern-01|restaurant-modern-01|salon-modern-01)/[^/?]+\\.(?:avif|gif|ico|jpe?g|png|svg|webp|woff2?|ttf|otf)).*)",
  ],
};
