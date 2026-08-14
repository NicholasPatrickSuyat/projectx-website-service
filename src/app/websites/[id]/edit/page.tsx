import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Panel } from "@/components/ui/Panel";
import { WebsiteEditor } from "@/components/website-editor/WebsiteEditor";
import { getClientById } from "@/lib/clients/repository";
import { getTemplate } from "@/lib/templates/registry";
import {
  initializeWebsiteContent,
  parseWebsiteContentJson,
} from "@/lib/websites/content";
import { getWebsiteById } from "@/lib/websites/repository";
import { isWebsiteId } from "@/lib/websites/validation";

export const dynamic = "force-dynamic";

type WebsiteEditPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: WebsiteEditPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!isWebsiteId(id)) {
    return { title: "Website editor" };
  }

  const website = await getWebsiteById(id);
  return {
    title: website ? `Edit ${website.name}` : "Website editor",
  };
}

export default async function WebsiteEditPage({
  params,
}: WebsiteEditPageProps) {
  const { id } = await params;

  if (!isWebsiteId(id)) {
    notFound();
  }

  const website = await getWebsiteById(id);
  if (!website) {
    notFound();
  }

  const template = getTemplate(website.templateId);
  const parsed = parseWebsiteContentJson(website.contentJson);
  const client = await getClientById(website.clientId);

  if (!template) {
    return (
      <div className="mx-auto max-w-xl p-4">
        <Panel className="px-6 py-10 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            Template unavailable
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            This website uses a template that is not available in the current
            registry, so the editor cannot open.
          </p>
          <Link
            href="/websites"
            className="mt-5 inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white"
          >
            Back to websites
          </Link>
        </Panel>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="mx-auto max-w-xl p-4">
        <Panel className="px-6 py-10 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            Client unavailable
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            This website is missing its Client record, so identity cannot be
            applied and the editor cannot open.
          </p>
          <Link
            href="/websites"
            className="mt-5 inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white"
          >
            Back to websites
          </Link>
        </Panel>
      </div>
    );
  }

  let resetContent;
  try {
    resetContent = initializeWebsiteContent(client, website.templateId);
  } catch {
    return (
      <div className="mx-auto max-w-xl p-4">
        <Panel className="px-6 py-10 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            Template unavailable
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            This website uses a template that is not available in the current
            registry, so the editor cannot open.
          </p>
          <Link
            href="/websites"
            className="mt-5 inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white"
          >
            Back to websites
          </Link>
        </Panel>
      </div>
    );
  }

  if (!parsed.ok) {
    return (
      <div className="mx-auto max-w-xl p-4">
        <Panel className="px-6 py-10 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            Website draft could not be loaded
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">{parsed.error}</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            The rest of the admin app is unaffected. The saved JSON for{" "}
            {website.name} ({client.businessName}) could not be converted into
            website content.
          </p>
          <Link
            href={`/clients/${website.clientId}`}
            className="mt-5 inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white"
          >
            Back to client
          </Link>
        </Panel>
      </div>
    );
  }

  return (
    <WebsiteEditor
      template={template}
      initialContent={parsed.content}
      persistence={{
        websiteId: website.id,
        websiteName: website.name,
        status: website.status,
        resetContent,
      }}
    />
  );
}
