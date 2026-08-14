import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/placeholders/ComingSoonPage";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <ComingSoonPage
      title="Settings"
      description="Internal application settings will be configured here in a later milestone."
    />
  );
}
