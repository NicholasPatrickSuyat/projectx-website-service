import Link from "next/link";
import { Panel } from "@/components/ui/Panel";

export default function ClientNotFound() {
  return (
    <div className="mx-auto max-w-xl">
      <Panel className="px-6 py-10 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Client not found
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          That client ID does not match a saved record.
        </p>
        <Link
          href="/clients"
          className="mt-5 inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white"
        >
          Back to clients
        </Link>
      </Panel>
    </div>
  );
}
