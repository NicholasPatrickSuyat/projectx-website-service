export default function SavedWebsiteNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f4efe8] px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Website preview unavailable
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This saved website could not be shown. It may not exist, or its saved
          content could not be rendered.
        </p>
      </div>
    </main>
  );
}
