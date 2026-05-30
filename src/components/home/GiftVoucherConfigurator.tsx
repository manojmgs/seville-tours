"use client";

import { useMemo, useState } from "react";
import { buildWhatsAppUrl } from "@/lib/wordpress-rest/urls";
import { siteCopy, type Locale } from "@/lib/i18n/site";

type VoucherMode = "private" | "luxury";
type DeliveryChannel = "whatsapp" | "email";

const privateAmounts = [35, 50, 75, 100];
const luxuryAmounts = [100, 250, 500, 1000];

function buildGiftSummary(options: {
  mode: VoucherMode;
  amount: number;
  recipientName: string;
  personalMessage: string;
}): string {
  const lines = [
    "Gift voucher request",
    `Type: ${options.mode === "private" ? "Private tours" : "Luxury escapes"}`,
    `Amount: €${options.amount}`,
  ];

  if (options.recipientName.trim()) {
    lines.push(`Recipient: ${options.recipientName.trim()}`);
  }

  if (options.personalMessage.trim()) {
    lines.push(`Message: ${options.personalMessage.trim()}`);
  }

  lines.push("Carlos will confirm the voucher and payment manually.");

  return lines.join("\n");
}

export function GiftVoucherConfigurator({ locale = "en" }: { locale?: Locale }) {
  const [mode, setMode] = useState<VoucherMode>("private");
  const [delivery, setDelivery] = useState<DeliveryChannel>("whatsapp");
  const [privateAmount, setPrivateAmount] = useState(35);
  const [luxuryAmount, setLuxuryAmount] = useState(500);
  const [recipientName, setRecipientName] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [lastSentSummary, setLastSentSummary] = useState("");
  const [isSending, setIsSending] = useState(false);

  const isLuxury = mode === "luxury";
  const amount = isLuxury ? luxuryAmount : privateAmount;
  const copy = siteCopy(locale);
  const ctaLabel = useMemo(() => {
    return isLuxury
      ? `${copy.home.gift.luxuryCta} · €${amount}`
      : `${copy.home.gift.privateCta} · €${amount}`;
  }, [amount, isLuxury, copy.home.gift.luxuryCta, copy.home.gift.privateCta]);

  const summary = buildGiftSummary({
    mode,
    amount,
    recipientName,
    personalMessage,
  });

  const deliveryHref =
    delivery === "email"
      ? `mailto:contact@sevilletoursco.com?subject=${encodeURIComponent(
          isLuxury
            ? `Luxury voucher request · €${amount}`
            : `Gift voucher request · €${amount}`,
        )}&body=${encodeURIComponent(summary)}`
      : buildWhatsAppUrl(summary);

  function handleSend() {
    setIsSending(true);
    setLastSentSummary(summary);

    window.setTimeout(() => {
      if (delivery === "email") {
        window.location.href = deliveryHref;
      } else {
        window.location.assign(deliveryHref);
      }

      window.setTimeout(() => setIsSending(false), 700);
    }, 50);
  }

  return (
    <section id="gift-cards" className="bg-[var(--surface-card)] py-12 [content-visibility:auto] [contain-intrinsic-size:1px_900px]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-[calc(var(--radius-card)+0.35rem)] border border-[color:var(--border-soft)] bg-[var(--surface-cream)] p-6 card-glow lg:grid-cols-[minmax(0,1fr)_20rem] lg:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand-green-700)]">
              {copy.home.gift.eyebrow}
            </p>
            <div className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-5xl">
              {copy.home.gift.titleTop}<br />
              <em className="not-italic text-[var(--brand-green-700)]">{copy.home.gift.titleBottom}</em>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              {copy.home.gift.intro}
            </p>

            <div className="mt-6 inline-flex rounded-full border border-[color:var(--border-soft)] bg-white p-1">
              <button
                type="button"
                onClick={() => setMode("private")}
                className={
                  !isLuxury
                    ? "rounded-full bg-[var(--brand-green-700)] px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-full px-4 py-2 text-sm font-semibold text-[var(--text-muted)]"
                }
              >
                {copy.home.gift.privateMode}
              </button>
              <button
                type="button"
                onClick={() => setMode("luxury")}
                className={
                  isLuxury
                    ? "rounded-full border border-[color:rgba(184,144,58,0.28)] bg-[rgba(184,144,58,0.14)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-gold-500)]"
                    : "rounded-full px-4 py-2 text-sm font-semibold text-[var(--text-muted)]"
                }
              >
                {copy.home.gift.luxuryMode}
              </button>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div
                className={
                  isLuxury
                    ? "relative overflow-hidden rounded-[1.75rem] border border-[color:rgba(184,144,58,0.28)] bg-[#120d07] text-white shadow-[0_22px_60px_rgba(0,0,0,0.34)]"
                    : "relative overflow-hidden rounded-[1.75rem] border border-[color:rgba(6,80,63,0.16)] bg-[linear-gradient(145deg,#0b4d3c,#0f7357)] text-white shadow-[0_20px_60px_rgba(6,80,63,0.18)]"
                }
              >
                {isLuxury ? (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(240,212,138,0.24),transparent_22%),radial-gradient(circle_at_82%_22%,rgba(240,212,138,0.14),transparent_18%),linear-gradient(120deg,transparent_20%,rgba(240,212,138,0.18)_36%,transparent_60%)]" />
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(70deg,rgba(255,255,255,0.02)_0,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_22px)]" />
                    <div className="absolute inset-0 rounded-[1.75rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(184,144,58,0.14)]" />

                    <div className="relative p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--brand-gold-100)]/72">
                            AndaluciaExpert
                          </p>
                          <p className="mt-2 text-sm font-semibold tracking-[0.08em] text-white/88">
                            ◆ Luxury Experience
                          </p>
                        </div>
                        <div className="rounded-full border border-[color:rgba(184,144,58,0.24)] bg-black/20 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-gold-100)]">
                          Luxury
                        </div>
                      </div>

                      <div className="mt-7 rounded-[1.55rem] border border-[color:rgba(184,144,58,0.16)] bg-[rgba(255,255,255,0.03)] p-5">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.35em] text-[color:rgba(184,144,58,0.45)]">
                          Luxury collection
                        </p>
                        <p className="mt-2 text-center text-[0.66rem] font-semibold uppercase tracking-[0.38em] text-[color:rgba(184,144,58,0.55)]">
                          Gift value
                        </p>
                        <p className="font-display mt-1 bg-[linear-gradient(135deg,#F0D48A,#B8903A,#D4AF5A)] bg-clip-text text-center text-5xl font-medium italic tracking-[-0.04em] text-transparent">
                          €{amount}
                        </p>
                        <p className="mt-2 text-center text-sm italic text-[color:rgba(240,212,138,0.7)]">
                          {copy.home.gift.luxuryHint}
                        </p>
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[color:rgba(184,144,58,0.45)]">
                            For
                          </p>
                          <p className="mt-1 max-w-[11rem] truncate font-display text-lg italic text-[color:rgba(240,212,138,0.84)]">
                            {recipientName.trim() ? recipientName.trim() : "Your recipient"}
                          </p>
                        </div>
                        <div className="rounded-full border border-[color:rgba(184,144,58,0.18)] bg-black/20 px-3 py-1 text-[0.7rem] font-bold tracking-[0.16em] text-[color:rgba(240,212,138,0.62)]">
                          GC-LUX-••••
                        </div>
                      </div>

                      <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] border border-[color:rgba(184,144,58,0.08)]" />
                      <div className="pointer-events-none absolute left-4 top-4 h-5 w-5 rounded-full border border-[color:rgba(184,144,58,0.18)]" />
                      <div className="pointer-events-none absolute right-4 top-4 h-5 w-5 rounded-full border border-[color:rgba(184,144,58,0.18)]" />
                      <div className="pointer-events-none absolute left-4 bottom-4 h-5 w-5 rounded-full border border-[color:rgba(184,144,58,0.18)]" />
                      <div className="pointer-events-none absolute right-4 bottom-4 h-5 w-5 rounded-full border border-[color:rgba(184,144,58,0.18)]" />
                    </div>
                  </>
                ) : (
                  <div className="relative p-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.12),transparent_22%),radial-gradient(circle_at_78%_24%,rgba(255,255,255,0.08),transparent_18%),linear-gradient(120deg,transparent_24%,rgba(255,255,255,0.08)_36%,transparent_58%)]" />
                    <div className="relative flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/70">
                          AndaluciaExpert
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white/90">
                          ✧ Private Experience
                        </p>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/80">
                        Private
                      </div>
                    </div>

                    <div className="relative mt-8 rounded-[1.5rem] border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
                      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/72">
                        Gift value
                      </p>
                      <p className="font-display mt-2 text-4xl font-semibold tracking-[-0.03em]">
                        €{amount}
                      </p>
                        <p className="mt-2 text-sm leading-6 text-white/74">
                          {copy.home.gift.privateHint}
                        </p>
                    </div>

                    <div className="relative mt-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/72">
                          For
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white/90">
                          {recipientName.trim() ? recipientName.trim() : "Your recipient"}
                        </p>
                      </div>
                      <div className="rounded-full border border-white/12 bg-black/20 px-3 py-1 text-[0.7rem] font-bold tracking-[0.16em] text-white/70">
                        GC-PRV-••••
                      </div>
                    </div>
                  </div>
                )}

              </div>

              <div className="grid gap-4">
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-green-700)]">
                    {isLuxury ? copy.home.gift.luxuryRange : copy.home.gift.privateRange}
                  </label>
                  <input
                    type="range"
                    min={isLuxury ? 100 : 5}
                    max={isLuxury ? 1000 : 100}
                    step={isLuxury ? 50 : 5}
                    value={amount}
                    onChange={(event) =>
                      isLuxury
                        ? setLuxuryAmount(Number(event.target.value))
                        : setPrivateAmount(Number(event.target.value))
                    }
                    className="mt-4 w-full accent-[var(--brand-green-700)]"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  {(isLuxury ? luxuryAmounts : privateAmounts).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        isLuxury ? setLuxuryAmount(preset) : setPrivateAmount(preset)
                      }
                      className={
                        amount === preset
                          ? isLuxury
                            ? "rounded-full border border-[color:rgba(184,144,58,0.24)] bg-[rgba(184,144,58,0.12)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-gold-500)]"
                            : "rounded-full border border-[color:rgba(6,80,63,0.18)] bg-[var(--brand-green-100)] px-4 py-2 text-sm font-semibold text-[var(--brand-green-900)]"
                          : "rounded-full border border-[color:var(--border-soft)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)]"
                      }
                    >
                      €{preset}
                    </button>
                  ))}
                </div>

                <label className="grid gap-2 text-sm font-semibold text-[var(--foreground)]">
                  {copy.home.gift.recipient}
                  <input
                    value={recipientName}
                    onChange={(event) => setRecipientName(event.target.value)}
                    className="input"
                    placeholder={copy.home.gift.recipient}
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-[var(--foreground)]">
                  {copy.home.gift.message}
                  <textarea
                    value={personalMessage}
                    onChange={(event) => setPersonalMessage(event.target.value)}
                    className="input min-h-28"
                    placeholder={copy.home.gift.messagePlaceholder}
                  />
                </label>

                <div className="inline-flex rounded-full border border-[color:var(--border-soft)] bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setDelivery("whatsapp")}
                    className={
                      delivery === "whatsapp"
                        ? "rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
                        : "rounded-full px-4 py-2 text-sm font-semibold text-[var(--text-muted)]"
                    }
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setDelivery("email")}
                    className={
                      delivery === "email"
                        ? "rounded-full border border-[color:rgba(184,144,58,0.28)] bg-[rgba(184,144,58,0.14)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-gold-500)]"
                        : "rounded-full px-4 py-2 text-sm font-semibold text-[var(--text-muted)]"
                    }
                  >
                    Email
                  </button>
                </div>

                <a
                  href={deliveryHref}
                  target={delivery === "whatsapp" ? "_blank" : undefined}
                  rel={delivery === "whatsapp" ? "noreferrer" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    handleSend();
                  }}
                  aria-busy={isSending}
                  className={
                    isLuxury
                      ? "inline-flex min-h-11 items-center justify-center rounded-[1.1rem] bg-[var(--surface-dark)] px-6 py-3 text-center text-sm font-semibold tracking-[0.18em] text-[var(--brand-gold-100)] transition hover:bg-[var(--surface-dark-soft)]"
                      : "inline-flex min-h-11 items-center justify-center rounded-[1.1rem] bg-[var(--brand-green-700)] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--brand-green-900)]"
                  }
                >
                  {isSending ? copy.shared.sending : ctaLabel}
                </a>

                <div className="rounded-[1.25rem] border border-[color:rgba(184,144,58,0.16)] bg-white px-4 py-4 text-sm leading-7 text-[var(--text-muted)]">
                  Direct bookings only · Not redeemable for cash · Cannot be combined with discounts unless approved · No expiry · Non-refundable once issued except where required by law · Carlos confirms voucher and payment manually.
                </div>

                {lastSentSummary ? (
                  <div className="rounded-[1.25rem] border border-[color:rgba(6,80,63,0.12)] bg-[var(--brand-green-100)] px-4 py-4 text-sm leading-7 text-[var(--brand-green-900)]">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em]">
                      {copy.shared.requestDrafted}
                    </p>
                    <p className="mt-2 whitespace-pre-line">{lastSentSummary}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <aside className="rounded-[1.5rem] border border-[color:rgba(184,144,58,0.18)] bg-white p-5 text-sm leading-7 text-[var(--text-muted)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--brand-gold-500)]">
              {copy.shared.terms}
            </p>
            <p className="mt-3">
              Direct bookings only · Not redeemable for cash · Cannot be combined with discounts unless approved · No expiry · Non-refundable once issued except where required by law · Carlos confirms voucher and payment manually.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}