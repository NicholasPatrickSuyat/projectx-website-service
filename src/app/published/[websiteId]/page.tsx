import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { renderTemplate } from "@/lib/templates/render";
import { getStandalonePublishedWebsite } from "@/lib/website-publications/standalone";

export const dynamic = "force-dynamic";

type PublishedWebsitePageProps = {
  params: Promise<{ websiteId: string }>;
};

export async function generateMetadata({
  params,
}: PublishedWebsitePageProps): Promise<Metadata> {
  const { websiteId } = await params;
  const published = await getStandalonePublishedWebsite(websiteId);

  if (!published) {
    return {
      title: { absolute: "Published preview unavailable" },
      robots: { index: false, follow: false },
    };
  }

  return {
    title: {
      absolute:
        published.content.seo?.title || published.content.business.businessName,
    },
    description: published.content.seo?.description,
    robots: { index: false, follow: false },
  };
}

export default async function PublishedWebsitePage({
  params,
}: PublishedWebsitePageProps) {
  const { websiteId } = await params;
  const published = await getStandalonePublishedWebsite(websiteId);

  if (!published) {
    notFound();
  }

  const rendered = renderTemplate(published.templateId, published.content);

  if (!rendered) {
    notFound();
  }

  return rendered;
}
