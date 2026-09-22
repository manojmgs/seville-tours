"use client";

import { useState } from "react";
import { SouvenirShelf } from "@/components/marco-chat/SouvenirShelf";
import { shelfForOperator } from "@/lib/marco/souvenirs";
import { PARAUSTED_ALCAZAR_FIXED_GIFT_CARD } from "@/lib/parausted/gift-cards";
import { buildParaUstedGiftCardProductUrl } from "@/lib/parausted/merchant-url";
import type { Locale } from "@/lib/i18n/types";
import { BoundaryNote, ChipButton, LabelledList, Panel, ResearchQuestion } from "./ResearchUi";
import {
  DEMO3_BEFORE,
  DEMO3_BUILT_FACTS,
  DEMO3_COMPLETED_STATE,
  DEMO3_DIRECTION,
  DEMO3_GIFT_FORWARD,
  DEMO3_GIFT_TRUTHS,
  DEMO3_STAGES,
  DEMO3_VISION_LABEL,
  DEMO3_VISION_STEPS,
  type Demo3Stage,
} from "@/lib/marco/research/demo3-lifecycle";

/**
 * Demo 3 — the post-trip loop, with built and proposed rails visibly separated.
 *
 * The souvenir shelf is reused exactly as it ships; nothing here adds checkout,
 * payment, order completion or network stored value.
 */
export function Demo3Return({ locale }: { locale: Locale }) {
  const [stageIndex, setStageIndex] = useState(0);
  const shelf = shelfForOperator("seville-tours-co");

  const stage: Demo3Stage = DEMO3_STAGES[stageIndex].id;
  const isLast = stageIndex === DEMO3_STAGES.length - 1;
  const giftCardUrl = buildParaUstedGiftCardProductUrl(
    locale,
    PARAUSTED_ALCAZAR_FIXED_GIFT_CARD.giftCardId,
  );

  return (
    <div className="space-y-5">
      <header>
        <h2 className="font-display text-2xl font-semibold text-[var(--brand-green-900)]">
          Demo 3 · Gift, remember, refer and return
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          Step {stageIndex + 1} of {DEMO3_STAGES.length} · {DEMO3_STAGES[stageIndex].label}
        </p>
      </header>

      {stage === "completed" ? (
        <Panel title="The experience is over">
          <LabelledList label="What happens automatically" items={DEMO3_COMPLETED_STATE} />
          <BoundaryNote lines={["Nothing is published, promoted or inferred without the traveller choosing it."]} />
        </Panel>
      ) : null}

      {stage === "foundation" ? (
        <Panel title="Built today" tone="known">
          <LabelledList label="Built" items={DEMO3_BUILT_FACTS} />
          <LabelledList label="What that does not mean" items={DEMO3_GIFT_TRUTHS} />
          <a
            href={giftCardUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex min-h-11 w-fit items-center rounded-[10px] border border-[var(--brand-green-700)]/40 px-4 py-2 text-sm font-semibold text-[var(--brand-green-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-green-900)]"
          >
            Open the operator gift card
          </a>
          <BoundaryNote lines={["Opening the product page needs connectivity. Everything else here runs offline."]} />
        </Panel>
      ) : null}

      {stage === "giftForward" ? (
        <Panel title="Giving it to someone else" tone="ask">
          <LabelledList label="How the roles separate" items={DEMO3_GIFT_FORWARD} />
          <BoundaryNote
            lines={[
              "No booking created. Availability not confirmed. No price quoted.",
              "Automated delivery to a recipient is not claimed here.",
            ]}
          />
        </Panel>
      ) : null}

      {stage === "memory" ? (
        <Panel title="Something to keep">
          <p className="text-sm leading-6 text-[var(--brand-green-900)]">
            The approved gift card leads. Everything below it is a sample the operator has not approved.
          </p>
          <div className="mt-4">
            {shelf ? (
              <SouvenirShelf
                shelf={shelf}
                tourId="alcazar"
                giftProviderName="ParaUsted"
                accentColor="#d8b45a"
                primaryColor="#1a3a2a"
                locale={locale}
              />
            ) : null}
          </div>
          <BoundaryNote lines={["There is no checkout here, and no order can be completed."]} />
        </Panel>
      ) : null}

      {stage === "vision" ? (
        <Panel title={DEMO3_VISION_LABEL} tone="open">
          <LabelledList label="A possible continuation" items={DEMO3_VISION_STEPS} />
          <BoundaryNote
            lines={[
              "None of this exists today.",
              "No points, no balance held by us, no automatic discount, no network voucher, no settlement, no resale.",
            ]}
          />
        </Panel>
      ) : null}

      {stage === "whyItMatters" ? (
        <Panel title="Why this may matter to Carlos" tone="known">
          <LabelledList label="Today" items={DEMO3_BEFORE} />
          <LabelledList label="Possible direction" items={DEMO3_DIRECTION} />
        </Panel>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <ChipButton onClick={() => setStageIndex((index) => Math.max(0, index - 1))}>Back</ChipButton>
        {!isLast ? (
          <ChipButton onClick={() => setStageIndex((index) => index + 1)}>Next step</ChipButton>
        ) : null}
      </div>

      <ResearchQuestion question="Which post-trip task would you actually pay to stop doing manually?" />
    </div>
  );
}
