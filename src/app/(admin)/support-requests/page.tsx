import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/placeholders/ComingSoonPage";

export const metadata: Metadata = {
  title: "Support Requests",
};

export default function SupportRequestsPage() {
  return (
    <ComingSoonPage
      title="Support Requests"
      description="Review website update requests according to client support priority."
      emptyLabel="No support requests to display yet"
    />
  );
}
