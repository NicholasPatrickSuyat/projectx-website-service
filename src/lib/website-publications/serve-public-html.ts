import "server-only";

// Public hostname serving only. Do not import template renderers or
// publication HTML generation from this module.
import { PUBLIC_UNAVAILABLE_HTML } from "@/lib/website-publications/public-unavailable-html";
import { getActivePublicationPublicHtmlByHostname } from "@/lib/website-publications/repository";
import {
  isAdminApplicationHostname,
  parseRequestHostname,
} from "@/lib/website-domains/hostname";

const HTML_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "private, no-cache",
} as const;

export function publicUnavailableResponse(): Response {
  return new Response(PUBLIC_UNAVAILABLE_HTML, {
    status: 404,
    headers: {
      ...HTML_HEADERS,
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

export async function servePublishedWebsiteHtml(
  rawHostHeader: string | null | undefined,
  slug?: string[],
): Promise<Response> {
  if (slug && slug.length > 0) {
    return publicUnavailableResponse();
  }

  const hostname = parseRequestHostname(rawHostHeader);
  if (!hostname || isAdminApplicationHostname(hostname)) {
    return publicUnavailableResponse();
  }

  const html = await getActivePublicationPublicHtmlByHostname(hostname);
  if (!html) {
    return publicUnavailableResponse();
  }

  return new Response(html, {
    status: 200,
    headers: HTML_HEADERS,
  });
}
