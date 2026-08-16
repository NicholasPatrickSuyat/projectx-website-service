import "server-only";
import { cookies, headers } from "next/headers";
import { getVerifiedAdminSession } from "@/lib/auth/session";
import {
  isAdminApplicationHostname,
  parseRequestHostname,
} from "@/lib/website-domains/hostname";
import { getWebsiteDomainByHostname } from "@/lib/website-domains/repository";
import { contentReferencesMedia } from "@/lib/website-media/references";
import { getWebsiteMediaById } from "@/lib/website-media/repository";
import { getLatestWebsitePublication } from "@/lib/website-publications/repository";
import { REVIEW_MEDIA_COOKIE } from "@/lib/website-review/types";
import { isReviewToken } from "@/lib/website-review/token";
import { getReviewSessionByToken } from "@/lib/website-review/repository";
import { getWebsiteById } from "@/lib/websites/repository";

function parseReviewTokenFromCookieHeader(
  cookieHeader: string | null,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  const prefix = `${REVIEW_MEDIA_COOKIE}=`;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      const value = trimmed.slice(prefix.length).trim();
      return isReviewToken(value) ? value : null;
    }
  }

  return null;
}

function parseReviewTokenFromReferer(referer: string | null): string | null {
  if (!referer) {
    return null;
  }

  try {
    const url = new URL(referer);
    const match = /^\/review\/([^/]+)\/?$/.exec(url.pathname);
    const token = match?.[1];
    return token && isReviewToken(token) ? token : null;
  } catch {
    return null;
  }
}

async function readReviewTokenFromCookie(
  request: Request,
): Promise<string | null> {
  const fromRequest = parseReviewTokenFromCookieHeader(
    request.headers.get("cookie"),
  );
  if (fromRequest) {
    return fromRequest;
  }

  try {
    const value = (await cookies()).get(REVIEW_MEDIA_COOKIE)?.value;
    return value && isReviewToken(value) ? value : null;
  } catch {
    return null;
  }
}

async function readReviewTokenFromReferer(
  request: Request,
): Promise<string | null> {
  const fromRequest = parseReviewTokenFromReferer(
    request.headers.get("referer"),
  );
  if (fromRequest) {
    return fromRequest;
  }

  try {
    const headerStore = await headers();
    return parseReviewTokenFromReferer(
      headerStore.get("referer") ?? headerStore.get("referrer"),
    );
  } catch {
    return null;
  }
}

async function readReviewTokenFromRequest(
  request: Request,
): Promise<string | null> {
  return (
    (await readReviewTokenFromCookie(request)) ||
    (await readReviewTokenFromReferer(request))
  );
}

async function mediaAllowedForWebsiteContent(
  mediaId: string,
  websiteId: string,
  contentJson: string,
): Promise<boolean> {
  const media = await getWebsiteMediaById(mediaId);
  if (!media || media.websiteId !== websiteId) {
    return false;
  }

  return contentReferencesMedia(contentJson, mediaId);
}

async function authorizePublicHostMedia(
  mediaId: string,
  hostname: string,
  request: Request,
): Promise<boolean> {
  const mapping = await getWebsiteDomainByHostname(hostname);
  if (!mapping) {
    return false;
  }

  const publication = await getLatestWebsitePublication(mapping.websiteId);
  if (publication) {
    const publishedAllowed = await mediaAllowedForWebsiteContent(
      mediaId,
      mapping.websiteId,
      publication.contentJson,
    );
    if (publishedAllowed) {
      return true;
    }
  }

  const reviewToken = await readReviewTokenFromRequest(request);
  if (!reviewToken) {
    return false;
  }

  const review = await getReviewSessionByToken(reviewToken);
  if (!review || review.websiteId !== mapping.websiteId) {
    return false;
  }

  const website = await getWebsiteById(review.websiteId);
  if (!website) {
    return false;
  }

  return mediaAllowedForWebsiteContent(
    mediaId,
    website.id,
    website.contentJson,
  );
}

async function authorizeAdminHostMedia(
  mediaId: string,
  request: Request,
): Promise<boolean> {
  const adminSession = await getVerifiedAdminSession();
  if (adminSession) {
    return true;
  }

  const reviewToken = await readReviewTokenFromRequest(request);
  if (!reviewToken) {
    return false;
  }

  const review = await getReviewSessionByToken(reviewToken);
  if (!review) {
    return false;
  }

  const website = await getWebsiteById(review.websiteId);
  if (!website) {
    return false;
  }

  return mediaAllowedForWebsiteContent(
    mediaId,
    website.id,
    website.contentJson,
  );
}

export async function authorizeMediaRequest(
  mediaId: string,
  request: Request,
): Promise<boolean> {
  const hostname = parseRequestHostname(request.headers.get("host"));
  if (hostname && !isAdminApplicationHostname(hostname)) {
    return authorizePublicHostMedia(mediaId, hostname, request);
  }

  return authorizeAdminHostMedia(mediaId, request);
}
