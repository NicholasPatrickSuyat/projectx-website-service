import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmInactiveButton } from "@/components/clients/ConfirmInactiveButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Panel } from "@/components/ui/Panel";
import {
  markClientInactiveAction,
  reactivateClientAction,
} from "@/lib/clients/actions";
import { getClientById } from "@/lib/clients/repository";
import {
  formatPrimaryContact,
  formatTimestamp,
} from "@/lib/clients/types";
import {
  CLIENT_CATEGORY_LABELS,
  CLIENT_SERVICE_MODEL_LABELS,
  getServiceTermsSummary,
} from "@/lib/domain";
import { getTemplate } from "@/lib/templates/registry";
import { getWebsiteForClient } from "@/lib/websites/repository";
import { getSavedWebsitePreviewPath } from "@/lib/websites/types";

export const dynamic = "force-dynamic";

type ClientDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ClientDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const client = await getClientById(id);

  return {
    title: client ? client.businessName : "Client",
  };
}

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  const website = await getWebsiteForClient(client.id);
  const websiteTemplate = website ? getTemplate(website.templateId) : null;

  const contactName = [client.contactFirstName, client.contactLastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Client
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {client.businessName}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge kind="clientStatus" value={client.status} />
            <StatusBadge kind="serviceModel" value={client.serviceModel} />
            <StatusBadge kind="plan" value={client.plan} />
            <StatusBadge kind="clientCategory" value={client.category} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/clients/${client.id}/edit`}
            className="inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2f6ef0]"
          >
            Edit
          </Link>
          {client.status === "INACTIVE" ? (
            <form action={reactivateClientAction.bind(null, client.id)}>
              <button
                type="submit"
                className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground"
              >
                Reactivate
              </button>
            </form>
          ) : (
            <ConfirmInactiveButton
              action={markClientInactiveAction.bind(null, client.id)}
            />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-foreground">Contact</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted">Primary contact</dt>
              <dd className="mt-1 text-foreground">
                {contactName || formatPrimaryContact(client)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Email</dt>
              <dd className="mt-1 text-foreground">{client.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Phone</dt>
              <dd className="mt-1 text-foreground">{client.phone ?? "—"}</dd>
            </div>
          </dl>
        </Panel>

        <Panel className="p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-foreground">Service</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted">Model</dt>
              <dd className="mt-1 text-foreground">
                {CLIENT_SERVICE_MODEL_LABELS[client.serviceModel]}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Category</dt>
              <dd className="mt-1 text-foreground">
                {CLIENT_CATEGORY_LABELS[client.category]}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Current list terms</dt>
              <dd className="mt-1 text-foreground">
                {getServiceTermsSummary(client.serviceModel, client.plan)}
              </dd>
              <p className="mt-1 text-xs text-muted">
                Displayed from pricing constants. Not stored on the client
                record and not invoiced here.
              </p>
            </div>
          </dl>
        </Panel>
      </div>

      <Panel className="p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-foreground">Address</h3>
        <p className="mt-3 text-sm leading-6 text-foreground">
          {client.addressLine1 || client.city || client.state || client.postalCode
            ? [client.addressLine1, client.city, client.state, client.postalCode]
                .filter(Boolean)
                .join(", ")
            : "—"}
        </p>
      </Panel>

      <Panel className="p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-foreground">Internal notes</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
          {client.internalNotes ?? "—"}
        </p>
      </Panel>

      <Panel className="p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-foreground">Record</h3>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted">Created</dt>
            <dd className="mt-1 text-foreground">
              {formatTimestamp(client.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Updated</dt>
            <dd className="mt-1 text-foreground">
              {formatTimestamp(client.updatedAt)}
            </dd>
          </div>
        </dl>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-foreground">Website</h3>
          {website ? (
            <>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-muted">Name</dt>
                  <dd className="mt-1 text-foreground">{website.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Template</dt>
                  <dd className="mt-1 text-foreground">
                    {websiteTemplate?.displayName ?? website.templateId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Status</dt>
                  <dd className="mt-1">
                    <StatusBadge kind="websiteRecord" value={website.status} />
                    {website.status === "READY_TO_PUBLISH" ? (
                      <p className="mt-1 text-xs text-muted">
                        Internal status only. This website is not public.
                      </p>
                    ) : website.status === "PUBLISHED" ? (
                      <p className="mt-1 text-xs text-muted">
                        Internal published snapshot. Public deployment is not
                        configured yet.
                      </p>
                    ) : null}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Last updated</dt>
                  <dd className="mt-1 text-foreground">
                    {formatTimestamp(website.updatedAt)}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/websites/${website.id}/edit`}
                  className="inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2f6ef0]"
                >
                  Open Website Editor
                </Link>
                <Link
                  href={getSavedWebsitePreviewPath(website.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-background"
                >
                  Preview saved site
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm leading-6 text-muted">
                This client does not have a website yet. V1 supports one website
                per client.
              </p>
              <Link
                href={`/clients/${client.id}/website/new`}
                className="mt-5 inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2f6ef0]"
              >
                Create Website
              </Link>
            </>
          )}
        </Panel>
        <Panel className="border-dashed p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-foreground">Billing</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Stripe subscription status will appear in a later milestone.
          </p>
        </Panel>
      </div>
    </div>
  );
}
