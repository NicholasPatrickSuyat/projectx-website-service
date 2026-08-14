import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/placeholders/ComingSoonPage";

export const metadata: Metadata = {
  title: "Support Requests",
};

export default function SupportRequestsPage() {
  return (
    <ComingSoonPage
      title="Support Requests"
      description="Support intake and plan-based priority will be tracked here in a later milestone."
    />
  );
}
