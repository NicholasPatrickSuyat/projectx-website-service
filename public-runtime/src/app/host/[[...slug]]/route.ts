import { servePublishedWebsiteHtml } from "@/lib/website-publications/serve-public-html";

export const dynamic = "force-dynamic";

type PublicHostRouteContext = {
  params: Promise<{ slug?: string[] }>;
};

export async function GET(
  request: Request,
  context: PublicHostRouteContext,
) {
  const { slug } = await context.params;
  return servePublishedWebsiteHtml(request.headers.get("host"), slug);
}
