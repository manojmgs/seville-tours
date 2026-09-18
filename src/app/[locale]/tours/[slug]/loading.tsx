export default function TourLoading() {
  return (
    <main className="page-shell min-h-screen px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-8">
      <section
        className="mx-auto max-w-6xl"
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <div className="card-glow rounded-[calc(var(--radius-card)+0.25rem)] border border-[color:rgba(184,144,58,0.16)] bg-[var(--surface-card)] px-5 py-6 shadow-sm sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-green-700)]">
            Seville Tours Co.
          </p>
          <h1 className="font-display mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Preparing your tour…
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
            Loading photos, details and booking options.
          </p>
          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-[color:rgba(184,144,58,0.12)]">
            <div className="loading-shimmer h-full w-1/2 rounded-full bg-[linear-gradient(90deg,transparent,rgba(212,175,90,0.12),rgba(240,212,138,0.82),rgba(212,175,90,0.12),transparent)]" />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)] lg:items-start">
          <div className="space-y-6">
            <div className="card-glow overflow-hidden rounded-[calc(var(--radius-card)+0.25rem)] bg-[var(--surface-card)] shadow-sm ring-1 ring-[color:var(--border-soft)]">
              <div className="aspect-[4/3] w-full animate-pulse bg-[linear-gradient(135deg,#e9e1d4_0%,#f6f0e5_50%,#e7ddd0_100%)] motion-reduce:animate-none" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
