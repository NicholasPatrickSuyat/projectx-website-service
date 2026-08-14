type ComingSoonPageProps = {
  title: string;
  description: string;
  emptyLabel: string;
};

export function ComingSoonPage({
  title,
  description,
  emptyLabel,
}: ComingSoonPageProps) {
  return (
    <section className="mx-auto max-w-3xl">
      <div className="rounded-xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          Coming in a later milestone
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-[15px]">
          {description}
        </p>
        <div className="mt-8 rounded-xl border border-dashed border-border bg-background px-5 py-10 text-center">
          <p className="text-sm font-medium text-foreground">{emptyLabel}</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            This section is a navigation destination only. No records, forms, or
            live data are available yet.
          </p>
        </div>
      </div>
    </section>
  );
}
