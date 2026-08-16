import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { renderTemplate } from "@/lib/templates/render";
import { resolvePublishedWebsiteForHostname } from "@/lib/website-domains/resolve";

export const dynamic = "force-dynamic";

type PublicHostPageProps = {
  params: Promise<{ slug?: string[] }>;
};

async function loadPublicHostWebsite() {
  const headerStore = await headers();
  return resolvePublishedWebsiteForHostname(headerStore.get("host"));
}

export async function generateMetadata({
  params,
}: PublicHostPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug && slug.length > 0) {
    return {
      title: { absolute: "Website unavailable" },
      description: "This website could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const published = await loadPublicHostWebsite();
  if (!published) {
    return {
      title: { absolute: "Website unavailable" },
      description: "This website could not be found.",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: {
      absolute:
        published.content.seo?.title || published.content.business.businessName,
    },
    description: published.content.seo?.description,
    robots: { index: true, follow: true },
  };
}

export default async function PublicHostPage({ params }: PublicHostPageProps) {
  const { slug } = await params;
  if (slug && slug.length > 0) {
    notFound();
  }

  const published = await loadPublicHostWebsite();
  if (!published) {
    notFound();
  }

  const rendered = renderTemplate(published.templateId, published.content);
  if (!rendered) {
    notFound();
  }

  return rendered;
}
