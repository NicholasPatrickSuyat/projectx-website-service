export default function PublishedWebsiteNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f4efe8] px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Published preview unavailable
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          No internal published snapshot exists for this website yet. This is
          not a public deployment.
        </p>
      </div>
    </main>
  );
}
