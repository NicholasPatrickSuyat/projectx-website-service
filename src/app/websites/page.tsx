import type { Metadata } from "next";
import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatTimestamp } from "@/lib/clients/types";
import { getTemplate } from "@/lib/templates/registry";
import { listWebsites } from "@/lib/websites/repository";
import { getSavedWebsitePreviewPath } from "@/lib/websites/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Websites",
};

export default async function WebsitesPage() {
  const websites = await listWebsites();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Websites
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
          Saved client website drafts. Create a website from a Client record.
          Ready to publish is an internal status only — these websites are not
          public.
        </p>
      </div>

      {websites.length === 0 ? (
        <Panel className="px-6 py-12 text-center">
          <p className="text-base font-medium text-foreground">No websites yet.</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            Open a Client and choose Create Website to start the first saved
            draft.
          </p>
          <Link
            href="/clients"
            className="mt-5 inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white"
          >
            Go to Clients
          </Link>
        </Panel>
      ) : (
        <Panel>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <caption className="sr-only">Website drafts</caption>
              <thead className="bg-background text-xs font-medium uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Website
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Client
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Template
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Updated
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {websites.map((website) => {
                  const template = getTemplate(website.templateId);
                  return (
                    <tr key={website.id} className="border-t border-border">
                      <th scope="row" className="px-5 py-3.5 font-medium">
                        {website.name}
                      </th>
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/clients/${website.clientId}`}
                          className="text-foreground hover:text-accent"
                        >
                          {website.clientBusinessName}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-muted">
                        {template?.displayName ?? website.templateId}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge
                          kind="websiteRecord"
                          value={website.status}
                        />
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-muted">
                        {formatTimestamp(website.updatedAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col items-start gap-1">
                          <Link
                            href={`/websites/${website.id}/edit`}
                            className="font-medium text-accent hover:underline"
                          >
                            Open editor
                          </Link>
                          <Link
                            href={getSavedWebsitePreviewPath(website.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-accent hover:underline"
                          >
                            Preview saved site
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-border md:hidden">
            {websites.map((website) => {
              const template = getTemplate(website.templateId);
              return (
                <li key={website.id} className="px-5 py-4">
                  <p className="font-medium text-foreground">{website.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {website.clientBusinessName}
                    {template ? ` · ${template.displayName}` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusBadge kind="websiteRecord" value={website.status} />
                    <span className="text-xs text-muted">
                      Updated {formatTimestamp(website.updatedAt)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                    <Link
                      href={`/websites/${website.id}/edit`}
                      className="inline-flex text-sm font-medium text-accent hover:underline"
                    >
                      Open editor
                    </Link>
                    <Link
                      href={getSavedWebsitePreviewPath(website.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-sm font-medium text-accent hover:underline"
                    >
                      Preview saved site
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </div>
  );
}
