"use client";

import { useState } from "react";
import type { MarcoTour } from "@/components/marco-chat/types";
import { RESEARCH_BANNER } from "@/lib/marco/research/claims";
import { Demo1Enquiry } from "./Demo1Enquiry";
import { Demo2Journey } from "./Demo2Journey";
import { Demo3Return } from "./Demo3Return";
import type { Locale } from "@/lib/i18n/types";

/**
 * Private presenter shell for the three Carlos research demos.
 *
 * Each demo owns its state and is remounted by key on reset, so no demo can leak
 * into another. Development-only; the route guards access.
 */

type DemoId = "menu" | "demo1" | "demo2" | "demo3";

const RECORDING_PACK_PATH = "docs/strategy/seville-tours-carlos-demo-recording-pack-2026-09.md";
const QUESTIONNAIRE_PATH = "docs/strategy/seville-tours-carlos-questionnaire-spec-2026-09.md";

const MENU: readonly { id: DemoId; label: string; length: string }[] = [
  { id: "demo1", label: "Demo 1: From a WhatsApp question to a useful request", length: "75–100 seconds" },
  { id: "demo2", label: "Demo 2: Four-day private journey and professional collaboration", length: "90–120 seconds" },
  { id: "demo3", label: "Demo 3: Gift, remember, refer and return", length: "60–90 seconds" },
];

export function ResearchDemoShell({ tours, locale }: { tours: readonly MarcoTour[]; locale: Locale }) {
  const [active, setActive] = useState<DemoId>("menu");
  const [resetCount, setResetCount] = useState(0);
  const [openNotes, setOpenNotes] = useState<"none" | "script" | "questionnaire">("none");

  const resetAll = () => {
    setActive("menu");
    setResetCount((count) => count + 1);
    setOpenNotes("none");
  };

  return (
    <main
      data-research-shell
      className="page-shell min-h-screen px-4 pb-24 pt-8 text-[var(--foreground)] sm:px-6 sm:pt-12 lg:px-8"
    >
      <div className="mx-auto max-w-3xl">
        <p className="rounded-full bg-[var(--brand-green-900)] px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-white">
          {RESEARCH_BANNER}
        </p>

        <header className="mt-6">
          <p className="text-xs font-semibold uppercase text-[var(--brand-green-700)]">
            Para Usted · operator research
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-[var(--brand-green-900)] sm:text-4xl">
            Three short demos for Carlos
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
            Recorded for one operator, to decide what is worth showing at TIS. Local playback only — nothing leaves
            this browser.
          </p>
        </header>

        <nav aria-label="Presenter menu" className="mt-6 flex flex-col gap-2">
          {MENU.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setActive(entry.id)}
              aria-current={active === entry.id}
              className="flex min-h-11 flex-col items-start rounded-[10px] border border-[var(--brand-green-700)]/35 bg-white px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
            >
              <span className="text-sm font-semibold text-[var(--brand-green-900)]">{entry.label}</span>
              <span className="text-xs text-[var(--text-muted)]">{entry.length}</span>
            </button>
          ))}

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetAll}
              className="min-h-11 rounded-[10px] border border-[var(--brand-green-700)]/35 px-4 py-2 text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
            >
              Reset all
            </button>
            <button
              type="button"
              onClick={() => setOpenNotes(openNotes === "script" ? "none" : "script")}
              aria-expanded={openNotes === "script"}
              className="min-h-11 rounded-[10px] border border-[var(--brand-green-700)]/35 px-4 py-2 text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
            >
              Open recording script
            </button>
            <button
              type="button"
              onClick={() => setOpenNotes(openNotes === "questionnaire" ? "none" : "questionnaire")}
              aria-expanded={openNotes === "questionnaire"}
              className="min-h-11 rounded-[10px] border border-[var(--brand-green-700)]/35 px-4 py-2 text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
            >
              Questionnaire placeholder
            </button>
          </div>

          {openNotes !== "none" ? (
            <p className="rounded-[10px] border border-[var(--border-soft)] bg-white px-4 py-3 text-sm leading-6 text-[var(--brand-green-900)]">
              {openNotes === "script" ? RECORDING_PACK_PATH : QUESTIONNAIRE_PATH}
            </p>
          ) : null}
        </nav>

        <div className="mt-8">
          {active === "menu" ? (
            <p className="text-sm leading-6 text-[var(--text-muted)]">
              Choose a demo above. Each one starts from the same place every time.
            </p>
          ) : null}

          {active === "demo1" ? <Demo1Enquiry key={`demo1-${resetCount}`} tours={tours} /> : null}

          {active === "demo2" ? <Demo2Journey key={`demo2-${resetCount}`} tours={tours} /> : null}

          {active === "demo3" ? <Demo3Return key={`demo3-${resetCount}`} locale={locale} /> : null}
        </div>
      </div>
    </main>
  );
}
