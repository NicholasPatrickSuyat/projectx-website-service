import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/placeholders/ComingSoonPage";

export const metadata: Metadata = {
  title: "Websites",
};

export default function WebsitesPage() {
  return (
    <ComingSoonPage
      title="Websites"
      description="Client website drafts, publishing status, and model assignments will appear here in a later milestone."
    />
  );
}
