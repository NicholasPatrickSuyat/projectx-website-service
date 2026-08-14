import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getTemplate,
  getTemplateDemoContent,
} from "@/lib/templates/registry";
import { renderTemplate } from "@/lib/templates/render";

export const dynamic = "force-dynamic";

type PreviewPageProps = {
  params: Promise<{ templateId: string }>;
};

export async function generateMetadata({
  params,
}: PreviewPageProps): Promise<Metadata> {
  const { templateId } = await params;
  const template = getTemplate(templateId);
  const content = getTemplateDemoContent(templateId);

  if (!template || !content) {
    return { title: "Template preview" };
  }

  return {
    title: content.seo?.title ?? `${template.displayName} preview`,
    description: content.seo?.description,
    robots: { index: false, follow: false },
  };
}

export default async function TemplatePreviewPage({ params }: PreviewPageProps) {
  const { templateId } = await params;
  const template = getTemplate(templateId);
  const content = getTemplateDemoContent(templateId);

  if (!template || !content) {
    notFound();
  }

  const rendered = renderTemplate(template.id, content);

  if (!rendered) {
    notFound();
  }

  return rendered;
}
