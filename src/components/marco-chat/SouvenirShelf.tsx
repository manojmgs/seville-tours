"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { getSouvenirCopy } from "@/lib/marco/souvenir-copy";
import { shelfProductsForTour, type OperatorShelf, type SouvenirProduct } from "@/lib/marco/souvenirs";
import { buildParaUstedGiftCardProductUrl } from "@/lib/parausted/merchant-url";
import type { Locale } from "@/lib/i18n/types";

type SouvenirShelfProps = {
  shelf: OperatorShelf;
  /** Leads with keepsakes tied to this tour, when the guest has picked one. */
  tourId?: string;
  /** Gift provider name shown in copy, e.g. "ParaUsted". */
  giftProviderName: string;
  accentColor: string;
  primaryColor: string;
  locale: string;
};

/**
 * The operator's print-on-demand shelf, rendered inline in the transcript.
 *
 * Presentation only. The operator decides what is listed and how it is branded;
 * the guest picks the variant. Nothing here places an order or holds value — the
 * footer says so, in the same grammar as "nothing booked".
 */
export function SouvenirShelf({
  shelf,
  tourId,
  giftProviderName,
  accentColor,
  primaryColor,
  locale,
}: SouvenirShelfProps) {
  const copy = getSouvenirCopy(locale);
  const products = shelfProductsForTour(shelf, tourId);
  const [openProductId, setOpenProductId] = useState<string | null>(null);
  const [choices, setChoices] = useState<Record<string, string>>({});

  const accentStyle: CSSProperties = { color: accentColor };
  const ctaStyle: CSSProperties = { backgroundColor: accentColor, color: primaryColor };

  function choiceKey(product: SouvenirProduct, optionLabel: string) {
    return `${product.id}:${optionLabel}`;
  }

  return (
    <div className="flex justify-start">
      <div className="w-full max-w-[280px] rounded-2xl border border-[rgba(201,168,76,0.3)] bg-gradient-to-br from-[#1A3A2A] to-[#2C5F3F] p-4">
        <p style={accentStyle} className="text-[10px] font-medium uppercase tracking-[0.15em]">
          {copy.eyebrow}
        </p>
        <h3 className="font-display mt-1.5 text-[17px] leading-tight text-white">
          {copy.heading(shelf.operatorName)}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-white/65">{copy.intro}</p>

        <ul className="mt-3 flex flex-col gap-2">
          {products.map((product) => {
            const isOpen = openProductId === product.id;
            return (
              <li
                key={product.id}
                className="rounded-xl border border-white/10 bg-black/15 p-3"
              >
                <div className="flex items-start gap-2">
                  <span aria-hidden className="text-lg leading-none">
                    {product.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{product.name}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-white/60">
                      {product.blurb}
                    </p>
                    <p style={accentStyle} className="mt-1 text-sm font-semibold">
                      {product.price}
                    </p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wide text-white/40">
                      {copy.brandingLabels[product.branding]}
                      {product.validity ? ` · ${copy.validityLabel(product.validity)}` : ""}
                    </p>
                    {product.status === "sample" ? (
                      <p className="mt-1 text-[10px] leading-relaxed text-white/55">
                        {copy.sampleDisclosure}
                      </p>
                    ) : null}
                  </div>
                </div>

                {product.paraUstedGiftCardId ? (
                  <>
                    <a
                      href={buildParaUstedGiftCardProductUrl(
                        locale as Locale,
                        product.paraUstedGiftCardId,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={ctaStyle}
                      className="mt-2.5 flex min-h-[44px] w-full items-center justify-center rounded-[10px] px-3 text-xs font-semibold"
                    >
                      {copy.buyCta}
                    </a>
                    <p className="mt-1.5 text-[10px] leading-relaxed text-white/45">
                      {copy.issuedBy(giftProviderName)}
                    </p>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenProductId(isOpen ? null : product.id)}
                      aria-expanded={isOpen}
                      style={ctaStyle}
                      className="mt-2.5 flex min-h-[44px] w-full items-center justify-center rounded-[10px] px-3 text-xs font-semibold"
                    >
                      {copy.cta}
                    </button>

                    {isOpen ? (
                  <div className="mt-2.5 flex flex-col gap-2.5">
                    {product.options.map((option) => (
                      <div key={option.label}>
                        <p className="text-[10px] uppercase tracking-wide text-white/45">
                          {copy.optionsLabel} · {option.label}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {option.values.map((value) => {
                            const key = choiceKey(product, option.label);
                            const selected = choices[key] === value;
                            return (
                              <button
                                key={value}
                                type="button"
                                aria-pressed={selected}
                                onClick={() =>
                                  setChoices((prev) => ({ ...prev, [key]: value }))
                                }
                                className={`min-h-[44px] rounded-full border px-3 text-[11px] font-medium ${
                                  selected
                                    ? "border-transparent bg-white text-[#1A3A2A]"
                                    : "border-white/25 text-white/80"
                                }`}
                              >
                                {value}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-white/45">
                        {copy.fulfilmentLabel}
                      </p>
                      <ul className="mt-1 flex flex-wrap gap-1.5">
                        {product.fulfilment.map((option) => (
                          <li
                            key={option}
                            className="rounded-full border border-white/20 px-2.5 py-1 text-[11px] text-white/70"
                          >
                            {copy.fulfilmentLabels[option]}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-[10px] leading-relaxed text-white/45">
                      {copy.madeToOrder}
                    </p>
                  </div>
                ) : null}
                  </>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-3 text-[11px] font-medium text-white/70">{copy.nothingBooked}</p>
      </div>
    </div>
  );
}
