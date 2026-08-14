import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CreateWebsiteForm } from "@/components/websites/CreateWebsiteForm";
import { getClientById } from "@/lib/clients/repository";
import { getTemplate, SERVICE_MODERN_01_ID } from "@/lib/templates/registry";
import { getWebsiteForClient } from "@/lib/websites/repository";

export const dynamic = "force-dynamic";

type NewWebsitePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: NewWebsitePageProps): Promise<Metadata> {
  const { id } = await params;
  const client = await getClientById(id);

  return {
    title: client ? `Create website — ${client.businessName}` : "Create website",
  };
}

export default async function NewWebsitePage({ params }: NewWebsitePageProps) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  const existing = await getWebsiteForClient(client.id);
  if (existing) {
    redirect(`/clients/${client.id}`);
  }

  const template = getTemplate(SERVICE_MODERN_01_ID);
  if (!template) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Create Website
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Create a saved website draft for {client.businessName}. V1 allows one
          website per client. Content starts from Service Modern 01, then you
          can edit and Save Draft.
        </p>
      </div>
      <CreateWebsiteForm
        client={client}
        templateId={template.id}
        templateDisplayName={template.displayName}
      />
    </div>
  );
}
