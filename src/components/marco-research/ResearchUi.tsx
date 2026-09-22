"use client";

import type { ReactNode } from "react";

/** Shared presentation primitives for the three Carlos research demos. */

export function Panel({
  title,
  tone = "plain",
  children,
}: {
  title?: string;
  tone?: "plain" | "known" | "open" | "ask";
  children: ReactNode;
}) {
  const toneClass =
    tone === "open"
      ? "border-[var(--brand-gold-500)]/50 bg-[#fff9ef]"
      : tone === "ask"
        ? "border-[var(--brand-green-700)]/30 bg-[#f6faf7]"
        : "border-[var(--border-soft)] bg-white";

  return (
    <section className={`rounded-[1.25rem] border p-5 ${toneClass}`}>
      {title ? (
        <h3 className="font-display text-lg font-semibold text-[var(--brand-green-900)]">{title}</h3>
      ) : null}
      <div className={title ? "mt-3" : undefined}>{children}</div>
    </section>
  );
}

export function LabelledList({ label, items }: { label: string; items: readonly string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-3 first:mt-0">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand-green-700)]">{label}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--brand-green-900)]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ChipButton({
  onClick,
  children,
  pressed,
}: {
  onClick: () => void;
  children: ReactNode;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)] ${
        pressed
          ? "border-transparent bg-[var(--brand-green-900)] text-white"
          : "border-[var(--brand-green-900)]/40 bg-white text-[var(--brand-green-900)]"
      }`}
    >
      {children}
    </button>
  );
}

export function BoundaryNote({ lines }: { lines: readonly string[] }) {
  return (
    <ul className="mt-3 space-y-1 text-xs leading-5 text-[var(--text-muted)]">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

export function ResearchQuestion({ question }: { question: string }) {
  return (
    <section className="rounded-[1.25rem] border border-[var(--brand-gold-500)]/50 bg-[#fff9ef] p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-[#6b531d]">Question for Carlos</p>
      <p className="mt-2 text-base font-semibold leading-7 text-[var(--brand-green-900)]">{question}</p>
    </section>
  );
}
