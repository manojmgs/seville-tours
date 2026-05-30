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

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
          <div className="space-y-4">
            <div className="card-glow rounded-[calc(var(--radius-card)+0.25rem)] border border-[color:rgba(184,144,58,0.16)] bg-[var(--surface-card)] p-5 shadow-sm sm:p-6">
              <div className="animate-pulse space-y-4 motion-reduce:animate-none">
                <div className="h-4 w-28 rounded-full bg-[color:rgba(19,17,15,0.08)]" />
                <div className="h-8 w-2/3 rounded-full bg-[color:rgba(19,17,15,0.07)]" />
                <div className="h-4 w-4/5 rounded-full bg-[color:rgba(19,17,15,0.06)]" />
                <div className="h-4 w-2/3 rounded-full bg-[color:rgba(19,17,15,0.06)]" />
              </div>
            </div>

            <div className="card-glow rounded-[calc(var(--radius-card)+0.25rem)] bg-[var(--surface-card)] p-5 shadow-sm ring-1 ring-[color:var(--border-soft)] sm:p-6">
              <div className="animate-pulse space-y-3 motion-reduce:animate-none">
                <div className="h-4 w-1/3 rounded-full bg-[color:rgba(19,17,15,0.08)]" />
                <div className="h-4 w-full rounded-full bg-[color:rgba(19,17,15,0.06)]" />
                <div className="h-4 w-11/12 rounded-full bg-[color:rgba(19,17,15,0.06)]" />
                <div className="h-4 w-10/12 rounded-full bg-[color:rgba(19,17,15,0.06)]" />
              </div>
            </div>
          </div>

          <div className="card-glow overflow-hidden rounded-[calc(var(--radius-card)+0.25rem)] bg-[var(--surface-card)] shadow-sm ring-1 ring-[color:var(--border-soft)]">
            <div className="border-b border-[color:rgba(184,144,58,0.12)] px-5 py-4 sm:px-6">
              <div className="animate-pulse space-y-3 motion-reduce:animate-none">
                <div className="h-4 w-32 rounded-full bg-[color:rgba(19,17,15,0.08)]" />
                <div className="h-6 w-3/4 rounded-full bg-[color:rgba(19,17,15,0.06)]" />
              </div>
            </div>
            <div className="bg-[linear-gradient(180deg,rgba(252,249,243,0.92),rgba(244,240,232,0.98))] p-5 sm:p-6">
              <div className="flex min-h-[720px] items-stretch rounded-[1.5rem] border border-[color:rgba(19,17,15,0.06)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(246,241,232,0.96))] p-4 sm:min-h-[800px]">
                <div className="flex w-full flex-col gap-4">
                  <div className="animate-pulse space-y-3 motion-reduce:animate-none">
                    <div className="h-4 w-40 rounded-full bg-[color:rgba(19,17,15,0.08)]" />
                    <div className="h-4 w-3/4 rounded-full bg-[color:rgba(19,17,15,0.06)]" />
                    <div className="h-4 w-2/3 rounded-full bg-[color:rgba(19,17,15,0.06)]" />
                  </div>
                  <div className="mt-2 flex-1 rounded-[1.25rem] border border-dashed border-[color:rgba(184,144,58,0.24)] bg-[linear-gradient(180deg,rgba(255,255,255,0.75),rgba(243,236,223,0.9))]">
                    <div className="flex h-full min-h-[560px] items-center justify-center px-6 py-10 sm:min-h-[640px]">
                      <div className="w-full max-w-md animate-pulse space-y-4 motion-reduce:animate-none">
                        <div className="h-12 w-full rounded-[1rem] bg-[color:rgba(19,17,15,0.06)]" />
                        <div className="h-12 w-full rounded-[1rem] bg-[color:rgba(19,17,15,0.06)]" />
                        <div className="h-12 w-5/6 rounded-[1rem] bg-[color:rgba(19,17,15,0.06)]" />
                        <div className="h-12 w-full rounded-[1rem] bg-[color:rgba(13,122,92,0.16)]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}