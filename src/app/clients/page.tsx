import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/placeholders/ComingSoonPage";

export const metadata: Metadata = {
  title: "Clients",
};

export default function ClientsPage() {
  return (
    <ComingSoonPage
      title="Clients"
      description="Manage client businesses, service models, plans, and contact information."
      emptyLabel="No client records to display yet"
    />
  );
}
