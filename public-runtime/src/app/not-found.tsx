import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Website unavailable" },
  description: "This website could not be found.",
  robots: { index: false, follow: false },
};

export default function PublicNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f8f6f2] px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Website unavailable
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This website could not be found.
        </p>
      </div>
    </main>
  );
}
