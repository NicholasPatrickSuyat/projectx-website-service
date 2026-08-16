import Link from "next/link";
import { Panel } from "@/components/ui/Panel";

export default function WebsiteEditNotFound() {
  return (
    <div className="mx-auto max-w-xl">
      <Panel className="px-6 py-10 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Website not found
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          That website ID does not match a saved draft.
        </p>
        <Link
          href="/websites"
          className="mt-5 inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white"
        >
          Back to websites
        </Link>
      </Panel>
    </div>
  );
}
