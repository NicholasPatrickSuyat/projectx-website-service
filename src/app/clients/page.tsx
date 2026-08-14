import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/placeholders/ComingSoonPage";

export const metadata: Metadata = {
  title: "Clients",
};

export default function ClientsPage() {
  return (
    <ComingSoonPage
      title="Clients"
      description="Client records, business categories, models, and plans will be managed here in a later milestone."
    />
  );
}
