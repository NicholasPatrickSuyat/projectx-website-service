import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { renderTemplate } from "@/lib/templates/render";
import { getStandaloneSavedWebsite } from "@/lib/websites/standalone";

export const dynamic = "force-dynamic";

type SavedWebsitePageProps = {
  params: Promise<{ websiteId: string }>;
};

export async function generateMetadata({
  params,
}: SavedWebsitePageProps): Promise<Metadata> {
  const { websiteId } = await params;
  const saved = await getStandaloneSavedWebsite(websiteId);

  if (!saved) {
    return {
      title: { absolute: "Website preview unavailable" },
      robots: { index: false, follow: false },
    };
  }

  return {
    title: {
      absolute:
        saved.content.seo?.title || saved.content.business.businessName,
    },
    description: saved.content.seo?.description,
    robots: { index: false, follow: false },
  };
}

export default async function SavedWebsitePage({
  params,
}: SavedWebsitePageProps) {
  const { websiteId } = await params;
  const saved = await getStandaloneSavedWebsite(websiteId);

  if (!saved) {
    notFound();
  }

  const rendered = renderTemplate(saved.templateId, saved.content);

  if (!rendered) {
    notFound();
  }

  return rendered;
}
