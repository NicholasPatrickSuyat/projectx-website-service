import type { Metadata } from "next";
import { ClientForm } from "@/components/clients/ClientForm";
import { createClientAction } from "@/lib/clients/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Client",
};

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          New Client
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Create a client business record. Website setup happens in a later
          milestone.
        </p>
      </div>
      <ClientForm
        action={createClientAction}
        cancelHref="/clients"
        submitLabel="Create client"
      />
    </div>
  );
}
