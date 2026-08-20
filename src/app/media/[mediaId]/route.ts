import { getWebsiteMediaById } from "@/lib/website-media/repository";
import { authorizeMediaRequest } from "@/lib/website-media/authorize";
import { getWebsiteMediaResponseHeaders } from "@/lib/website-media/headers";
import { getWebsiteMediaStorage } from "@/lib/website-media/storage";
import { isWebsiteId } from "@/lib/websites/validation";

export const dynamic = "force-dynamic";

type WebsiteMediaRouteProps = {
  params: Promise<{ mediaId: string }>;
};

function notFoundResponse() {
  return new Response("Not found", { status: 404 });
}

export async function GET(
  request: Request,
  { params }: WebsiteMediaRouteProps,
) {
  const { mediaId } = await params;
  if (!isWebsiteId(mediaId)) {
    return notFoundResponse();
  }

  const allowed = await authorizeMediaRequest(mediaId, request);
  if (!allowed) {
    return notFoundResponse();
  }

  const media = await getWebsiteMediaById(mediaId);
  if (!media) {
    return notFoundResponse();
  }

  const storage = await getWebsiteMediaStorage();
  const bytes = await storage.read(media.websiteId, media.storedFilename);
  if (!bytes) {
    return notFoundResponse();
  }

  return new Response(bytes as unknown as BodyInit, {
    status: 200,
    headers: getWebsiteMediaResponseHeaders({
      mimeType: media.mimeType,
      originalFilename: media.originalFilename,
      byteLength: bytes.byteLength,
    }),
  });
}
