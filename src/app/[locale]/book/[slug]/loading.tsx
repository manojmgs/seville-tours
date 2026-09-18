export default function BookingLoading() {
  return (
    <main className="page-shell min-h-screen px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-8">
      <section
        className="mx-auto max-w-6xl"
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <div className="card-glow rounded-[calc(var(--radius-card)+0.25rem)] bg-[var(--surface-card)] p-5 shadow-sm ring-1 ring-[color:var(--border-soft)] sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-green-700)]">
            Secure booking
          </p>
          <h1 className="font-display mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Preparing secure booking…
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
            Please wait while the booking experience loads.
          </p>
          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-[color:rgba(184,144,58,0.12)]">
            <div className="loading-shimmer h-full w-1/2 rounded-full bg-[linear-gradient(90deg,transparent,rgba(212,175,90,0.12),rgba(240,212,138,0.82),rgba(212,175,90,0.12),transparent)]" />
          </div>
        </div>
      </section>
    </main>
  );
}
