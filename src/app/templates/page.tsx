import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/placeholders/ComingSoonPage";

export const metadata: Metadata = {
  title: "Templates",
};

export default function TemplatesPage() {
  return (
    <ComingSoonPage
      title="Templates"
      description="Reusable website templates for Service Business and later categories will be added in a later milestone."
    />
  );
}
