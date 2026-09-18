import { useId, useState } from "react";
import { getChatCopy } from "./chat-copy";
import type {
  MarcoTour,
  RecommendationConfirmationItem,
  RecommendationResult,
} from "./types";

type RecommendationReceiptProps = {
  tour: MarcoTour;
  recommendation: RecommendationResult;
  operatorName: string;
  primaryColor: string;
  accentColor: string;
  locale: string;
};

const defaultConfirmationItems = (
  tour: MarcoTour,
): RecommendationConfirmationItem[] =>
  tour.confirmationItems ??
  (tour.priceKnown
    ? ["price-unit", "format", "availability"]
    : ["date", "final-price", "inclusions"]);

function formatSourceDate(date: string, locale: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(parsed);
}

export function RecommendationReceipt({
  tour,
  recommendation,
  operatorName,
  primaryColor,
  accentColor,
  locale,
}: RecommendationReceiptProps) {
  const [open, setOpen] = useState(false);
  const copy = getChatCopy(locale).receipt;
  const receiptId = `recommendation-receipt-${useId().replace(/:/g, "")}`;
  const confirmationItems = defaultConfirmationItems(tour);
  const hasOnlineBooking = Boolean(tour.bookable && tour.fareHarborItemId);

  return (
    <div className="mt-3 border-t border-[#E7E0D8] pt-2.5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={receiptId}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-[44px] w-full items-center justify-between gap-3 text-left text-xs font-semibold text-[#1A3A2A] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: primaryColor }}
      >
        <span>{copy.disclosure}</span>
        <span aria-hidden="true" className="text-base leading-none" style={{ color: accentColor }}>
          {open ? "−" : "+"}
        </span>
      </button>

      {open ? (
        <div id={receiptId} className="space-y-3 pb-1 text-[11px] leading-relaxed text-[#5E574F]">
          <section>
            <h4 className="font-semibold text-[#1A3A2A]">{copy.whyFits}</h4>
            <p>{copy.reasons[recommendation.reasonCode]}</p>
          </section>

          <section>
            <h4 className="font-semibold text-[#1A3A2A]">{copy.operatorInfo}</h4>
            <p>{copy.duration(tour.duration)}</p>
            <p>{copy.operatorName(operatorName)}</p>
          </section>

          <section>
            <h4 className="font-semibold text-[#1A3A2A]">{copy.bookingInfo}</h4>
            <p>{hasOnlineBooking ? copy.onlineBooking : copy.operatorConfirmation}</p>
            <p>{hasOnlineBooking ? copy.checkDates : copy.noDirectBooking}</p>
          </section>

          <section>
            <h4 className="font-semibold text-[#1A3A2A]">{copy.source}</h4>
            {tour.operatorUrl ? (
              <a
                href={tour.operatorUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-2"
                style={{ color: primaryColor }}
              >
                {copy.openSource}
              </a>
            ) : (
              <p>{copy.sourceUnavailable}</p>
            )}
            <p>
              {tour.sourceUpdatedAt
                ? copy.sourceUpdated(formatSourceDate(tour.sourceUpdatedAt, locale))
                : copy.sourceDateUnavailable}
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-[#1A3A2A]">{copy.stillToConfirm}</h4>
            <ul className="list-disc space-y-0.5 pl-4">
              {confirmationItems.map((item) => (
                <li key={item}>{copy.confirmationItems[item]}</li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </div>
  );
}
