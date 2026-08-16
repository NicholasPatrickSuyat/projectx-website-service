import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WebsiteEditor } from "@/components/website-editor/WebsiteEditor";
import {
  getTemplate,
  getTemplateDemoContent,
} from "@/lib/templates/registry";

export const dynamic = "force-dynamic";

type EditPageProps = {
  params: Promise<{ templateId: string }>;
};

export async function generateMetadata({
  params,
}: EditPageProps): Promise<Metadata> {
  const { templateId } = await params;
  const template = getTemplate(templateId);

  return {
    title: template ? `Edit ${template.displayName}` : "Template editor",
  };
}

export default async function TemplateEditPage({ params }: EditPageProps) {
  const { templateId } = await params;
  const template = getTemplate(templateId);
  const content = getTemplateDemoContent(templateId);

  if (!template || !content) {
    notFound();
  }

  return <WebsiteEditor template={template} initialContent={content} />;
}
