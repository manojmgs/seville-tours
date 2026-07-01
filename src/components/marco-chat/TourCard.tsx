import Image from "next/image";
import type { CSSProperties } from "react";
import type { MarcoTour } from "./types";
import { getChatCopy } from "./chat-copy";

type TourCardProps = {
  tour: MarcoTour;
  primaryColor: string;
  accentColor: string;
  /** Whether the gift-card exit is offered (from MarcoConfig.giftCards). */
  giftCards: boolean;
  /** Name of the human the guest hands off to, e.g. "Carlos". */
  operatorName: string;
  locale: string;
  onBook: (tour: MarcoTour) => void;
  onBookDirect: (tour: MarcoTour) => void;
  onGift: (tour: MarcoTour) => void;
  onEscalate: (tour: MarcoTour) => void;
};

/**
 * A recommended tour with exit paths. Fixed-price FareHarbor tours get a self-serve
 * "Book now" plus a "Book direct with us" option (pay by Bizum/cash, no booking fee);
 * private/quote tours only get "Book direct with us". Gift Card and Talk to Carlos
 * are always available. Presentation + click delegation only; the parent owns
 * transcript changes.
 */
export function TourCard({
  tour,
  primaryColor,
  accentColor,
  giftCards,
  operatorName,
  locale,
  onBook,
  onBookDirect,
  onGift,
  onEscalate,
}: TourCardProps) {
  const copy = getChatCopy(locale);
  const badgeStyle: CSSProperties = {
    backgroundColor: accentColor,
    color: primaryColor,
  };
  const bookStyle: CSSProperties = { backgroundColor: primaryColor };

  return (
    <div className="flex justify-start">
      <div className="w-full max-w-[280px] overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
        <div className="relative h-[130px] w-full bg-gradient-to-br from-[#2C5F3F] to-[#1A3A2A]">
          {tour.img ? (
            <Image
              src={tour.img}
              alt={tour.name}
              fill
              sizes="280px"
              quality={65}
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl">
              {tour.emoji}
            </div>
          )}
          <span
            style={badgeStyle}
            className="absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
          >
            {tour.badge}
          </span>
        </div>

        <div className="p-3.5">
          <h3 className="font-display text-base font-semibold leading-tight text-[#1A3A2A]">
            {tour.name}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-[#666]">{tour.desc}</p>

          <div className="mt-2.5 flex gap-3 text-[11px] text-[#8A7F72]">
            <span>⏱ {tour.duration}</span>
            <span>💰 {tour.price}</span>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => (tour.bookable ? onBook(tour) : onBookDirect(tour))}
              style={bookStyle}
              className="min-h-[44px] w-full rounded-[10px] px-3 text-sm font-medium text-white transition active:scale-95"
            >
              {tour.bookable ? copy.bookNow : copy.bookDirect}
            </button>
            {tour.bookable ? (
              <button
                type="button"
                onClick={() => onBookDirect(tour)}
                style={{ borderColor: primaryColor, color: primaryColor }}
                className="min-h-[44px] w-full rounded-[10px] border bg-white px-3 text-sm font-medium transition active:scale-95"
              >
                {copy.bookDirect}
              </button>
            ) : null}
            <div className="flex gap-2">
              {giftCards ? (
                <button
                  type="button"
                  onClick={() => onGift(tour)}
                  className="min-h-[44px] flex-1 rounded-[10px] bg-[#F2EDE6] px-3 text-sm font-medium text-[#1A3A2A] transition active:scale-95"
                >
                  {copy.giftCard}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onEscalate(tour)}
                className="min-h-[44px] flex-1 rounded-[10px] bg-[#F2EDE6] px-3 text-sm font-medium text-[#1A3A2A] transition active:scale-95"
              >
                {copy.talkTo(operatorName)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
