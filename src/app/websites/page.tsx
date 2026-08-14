import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/placeholders/ComingSoonPage";

export const metadata: Metadata = {
  title: "Websites",
};

export default function WebsitesPage() {
  return (
    <ComingSoonPage
      title="Websites"
      description="Manage website setup, draft/live status, domains, and publishing."
      emptyLabel="No websites to display yet"
    />
  );
}
