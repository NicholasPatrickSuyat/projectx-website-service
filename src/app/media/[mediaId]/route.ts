import { Buffer } from "node:buffer";
import { getWebsiteMediaById } from "@/lib/website-media/repository";
import { getWebsiteMediaStorage } from "@/lib/website-media/storage";
import { isWebsiteId } from "@/lib/websites/validation";

export const dynamic = "force-dynamic";

type WebsiteMediaRouteProps = {
  params: Promise<{ mediaId: string }>;
};

export async function GET(
  _request: Request,
  { params }: WebsiteMediaRouteProps,
) {
  const { mediaId } = await params;
  if (!isWebsiteId(mediaId)) {
    return new Response("Not found", { status: 404 });
  }

  const media = await getWebsiteMediaById(mediaId);
  if (!media) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = await getWebsiteMediaStorage().read(
    media.websiteId,
    media.storedFilename,
  );
  if (!bytes) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
