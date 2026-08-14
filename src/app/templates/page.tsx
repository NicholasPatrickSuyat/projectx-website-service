import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/placeholders/ComingSoonPage";

export const metadata: Metadata = {
  title: "Templates",
};

export default function TemplatesPage() {
  return (
    <ComingSoonPage
      title="Templates"
      description="Manage reusable Service Business, Restaurant/Food, and Salon/Beauty website templates."
      emptyLabel="No templates to display yet"
    />
  );
}
