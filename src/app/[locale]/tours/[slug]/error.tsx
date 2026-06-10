"use client";

import Link from "next/link";

type TourErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function TourError({ error, reset }: TourErrorProps) {
  void error;

  return (
    <main className="page-shell min-h-screen px-4 py-10 text-[var(--foreground)] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-[calc(var(--radius-card)+0.25rem)] border border-[color:var(--border-soft)] bg-[var(--surface-card)] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-green-700)]">
          Seville Tours Co.
        </p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-[-0.03em]">
          Something went wrong
        </h1>
        <p className="mt-3 text-base leading-7 text-[var(--text-muted)]">
          The tour page could not load right now. Please try again.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-green-700)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-green-900)]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--brand-green-700)] hover:text-[var(--brand-green-700)]"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
