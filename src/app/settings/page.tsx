import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/placeholders/ComingSoonPage";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <ComingSoonPage
      title="Settings"
      description="Configure internal Project X Website Service settings and future integrations."
      emptyLabel="No settings to configure yet"
    />
  );
}
