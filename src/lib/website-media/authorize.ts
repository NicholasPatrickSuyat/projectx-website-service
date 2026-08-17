import "server-only";
import { getVerifiedAdminSession } from "@/lib/auth/session";
import {
  isAdminApplicationHostname,
  parseRequestHostname,
} from "@/lib/website-domains/hostname";
import {
  authorizePublicHostMedia,
  authorizeReviewTokenMedia,
} from "@/lib/website-media/authorize-public";

export async function authorizeMediaRequest(
  mediaId: string,
  request: Request,
): Promise<boolean> {
  const hostname = parseRequestHostname(request.headers.get("host"));
  if (hostname && !isAdminApplicationHostname(hostname)) {
    return authorizePublicHostMedia(mediaId, hostname, request);
  }

  const adminSession = await getVerifiedAdminSession();
  if (adminSession) {
    return true;
  }

  return authorizeReviewTokenMedia(mediaId, request);
}
