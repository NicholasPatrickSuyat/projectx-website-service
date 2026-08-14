import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientForm } from "@/components/clients/ClientForm";
import { updateClientAction } from "@/lib/clients/actions";
import { getClientById } from "@/lib/clients/repository";

export const dynamic = "force-dynamic";

type EditClientPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditClientPageProps): Promise<Metadata> {
  const { id } = await params;
  const client = await getClientById(id);

  return {
    title: client ? `Edit ${client.businessName}` : "Edit Client",
  };
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Edit {client.businessName}
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Update client business, contact, and service details.
        </p>
      </div>
      <ClientForm
        action={updateClientAction.bind(null, client.id)}
        client={client}
        cancelHref={`/clients/${client.id}`}
        submitLabel="Save changes"
      />
    </div>
  );
}
