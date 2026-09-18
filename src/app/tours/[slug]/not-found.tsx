import Link from "next/link";

export default function TourNotFound() {
  return (
    <main className="page-shell min-h-screen px-4 py-10 text-[var(--foreground)] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-[calc(var(--radius-card)+0.25rem)] border border-[color:var(--border-soft)] bg-[var(--surface-card)] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-green-700)]">
          Seville Tours Co.
        </p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-[-0.03em]">
          Tour not found
        </h1>
        <p className="mt-3 text-base leading-7 text-[var(--text-muted)]">
          The tour you requested is unavailable or may have moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-green-700)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-green-900)]"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}