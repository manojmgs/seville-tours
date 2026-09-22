"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Two-pane demo window, matching the trusted TIS playback grammar: conversation
 * on the left, what it produced on the right, one honest status line underneath.
 * Reimplemented here rather than imported so the research route stays removable.
 */
export function ResearchWindow({
  title,
  subtitle,
  avatar,
  statusLine,
  latestKey,
  conversation,
  context,
}: {
  title: string;
  subtitle: string;
  avatar: string;
  statusLine: string;
  latestKey: string;
  conversation: ReactNode;
  context: ReactNode;
}) {
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pane = messagesRef.current;
    if (pane) pane.scrollTop = pane.scrollHeight;
  }, [latestKey]);

  return (
    <div className="flex flex-col overflow-hidden rounded-[1.25rem] border border-[var(--border-soft)] bg-[var(--surface-card)] shadow-[0_12px_34px_rgba(17,17,17,0.08)] lg:h-[min(40rem,calc(100vh-19rem))] lg:min-h-[26rem]">
      <header className="flex shrink-0 items-center gap-3 bg-[var(--brand-green-900)] px-4 py-3 text-white">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-gold-100)] font-display text-base font-semibold text-[var(--brand-green-900)]"
        >
          {avatar}
        </span>
        <div className="min-w-0">
          <p className="font-display text-base font-semibold leading-tight">{title}</p>
          <p className="truncate text-xs text-white/75">{subtitle}</p>
        </div>
      </header>

      <div className="grid min-h-0 min-w-0 flex-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-col border-b border-[var(--border-soft)] lg:border-b-0 lg:border-r">
          <section className="flex min-h-0 flex-1 flex-col" aria-labelledby="research-conversation-heading">
            <h3 id="research-conversation-heading" className="sr-only">
              Your conversation with Marco
            </h3>
            <div ref={messagesRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#ede8e1] p-4 sm:p-5">
              {conversation}
            </div>
          </section>
        </div>
        <div className="min-h-0 min-w-0 space-y-5 bg-[#faf8f5] p-4 sm:p-5 lg:overflow-y-auto">{context}</div>
      </div>

      <p className="shrink-0 border-t border-[var(--border-soft)] bg-white px-4 py-3 text-sm font-semibold text-[var(--brand-green-900)]">
        {statusLine}
      </p>
    </div>
  );
}

export function ResearchBubble({ speaker, text }: { speaker: "marco" | "traveller"; text: string }) {
  const isMarco = speaker === "marco";

  return (
    <div className={`flex ${isMarco ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[88%] rounded-[18px] px-4 py-3 text-sm leading-6 shadow-[0_1px_2px_rgba(0,0,0,0.1)] ${
          isMarco
            ? "rounded-tl-[4px] bg-white text-[#1a1a1a]"
            : "rounded-tr-[4px] bg-[var(--brand-green-900)] text-white"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
