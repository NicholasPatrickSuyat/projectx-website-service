import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientReviewControls } from "@/components/website-review/ClientReviewControls";
import { renderTemplate } from "@/lib/templates/render";
import { getClientReviewByToken } from "@/lib/website-review/actions";
import { isReviewToken } from "@/lib/website-review/token";

export const dynamic = "force-dynamic";

type ClientReviewPageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({
  params,
}: ClientReviewPageProps): Promise<Metadata> {
  const { token } = await params;
  const review = await getClientReviewByToken(token);

  if (!review) {
    return {
      title: { absolute: "Review unavailable" },
      robots: { index: false, follow: false },
    };
  }

  return {
    title: {
      absolute: review.content.seo?.title
        ? `${review.content.seo.title} · Review`
        : "Website review",
    },
    description: review.content.seo?.description,
    robots: { index: false, follow: false },
  };
}

export default async function ClientReviewPage({
  params,
}: ClientReviewPageProps) {
  const { token } = await params;
  if (!isReviewToken(token)) {
    notFound();
  }

  const review = await getClientReviewByToken(token);
  if (!review) {
    notFound();
  }

  const rendered = renderTemplate(review.templateId, review.content);
  if (!rendered) {
    notFound();
  }

  return (
    <div className="min-h-dvh bg-[#f8f6f2]">
      <header className="sticky top-0 z-[60] border-b border-slate-200 bg-[#f8f6f2]/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
          Project X review
        </p>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-700">
          This is a preview of the current saved website draft for review. It is
          not the live website.
        </p>
      </header>
      {rendered}
      <ClientReviewControls
        token={token}
        approved={review.sessionStatus === "APPROVED"}
        approvedAt={review.approvedAt}
      />
    </div>
  );
}
