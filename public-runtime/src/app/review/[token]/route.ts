import {
  handleClientReviewPost,
  serveClientReviewHtml,
} from "@/lib/website-review/serve-review-html";

export const dynamic = "force-dynamic";

type ClientReviewRouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(
  request: Request,
  context: ClientReviewRouteContext,
) {
  const { token } = await context.params;
  const notice = new URL(request.url).searchParams.get("notice");
  return serveClientReviewHtml(token, notice);
}

export async function POST(
  request: Request,
  context: ClientReviewRouteContext,
) {
  const { token } = await context.params;
  return handleClientReviewPost(token, request);
}
