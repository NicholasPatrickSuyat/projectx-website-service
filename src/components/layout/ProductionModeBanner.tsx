import { isProductionAdminMode } from "@/lib/runtime/production-admin";

export function ProductionModeBanner() {
  if (!isProductionAdminMode()) {
    return null;
  }

  return (
    <div
      role="status"
      className="sticky top-0 z-[70] border-b-4 border-red-900 bg-red-700 px-4 py-3 text-center text-white shadow-md"
    >
      <p className="text-sm font-bold uppercase tracking-[0.18em]">
        Production Management Mode
      </p>
      <p className="mt-1 text-sm font-medium">
        You are editing live production data.
      </p>
    </div>
  );
}
