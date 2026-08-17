import { NextRequest, NextResponse } from "next/server";
import {
  isPublicHostPath,
  isSharedPublicResourcePath,
} from "@/lib/auth/paths";
import {
  parseRequestHostname,
} from "@/lib/website-domains/hostname";
import { isReviewToken } from "@/lib/website-review/token";
import {
  REVIEW_MEDIA_COOKIE,
  REVIEW_MEDIA_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/website-review/types";

// Public runtime only. No admin session, login redirect, or PBKDF2.
// Hostname routing uses the Host header only. Do not query D1 from middleware.
// OpenNext on Cloudflare does not support Next.js 16 `proxy.ts`.

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isSharedPublicResourcePath(pathname) || isPublicHostPath(pathname)) {
    return continueRequest(request);
  }

  const rawHost = request.headers.get("host");
  const hostname = parseRequestHostname(rawHost);
  if (rawHost && !hostname) {
    return rewriteToPublicHost(request);
  }

  return rewriteToPublicHost(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|templates/(?:service-modern-01|restaurant-modern-01|salon-modern-01)/[^/?]+\\.(?:avif|gif|ico|jpe?g|png|svg|webp|woff2?|ttf|otf)).*)",
  ],
};
