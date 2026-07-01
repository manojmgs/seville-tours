import { useEffect, useRef } from "react";
import { Bubble } from "./Bubble";
import { TypingIndicator } from "./TypingIndicator";
import { TourCard } from "./TourCard";
import { GiftCardWidget } from "./GiftCardWidget";
import { DirectBookingCard } from "./DirectBookingCard";
import { EscalationCard } from "./EscalationCard";
import type { MarcoAnswers, MarcoConfig, MarcoMessage, MarcoTour } from "./types";

type MessageListProps = {
  messages: MarcoMessage[];
  answers: MarcoAnswers;
  config: MarcoConfig;
  locale: string;
  onBook: (tour: MarcoTour) => void;
  onBookDirect: (tour: MarcoTour) => void;
  onGift: (tour: MarcoTour) => void;
  onEscalate: (tour: MarcoTour) => void;
};

/**
 * Scrollable transcript. Switches on each message's `kind` to pick a renderer and
 * auto-scrolls to the newest item. Layout only — state lives in the parent.
 */
export function MessageList({
  messages,
  answers,
  config,
  locale,
  onBook,
  onBookDirect,
  onGift,
  onEscalate,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto bg-[#EDE8E1] px-3.5 py-4">
      {messages.map((message) => {
        switch (message.kind) {
          case "ai":
          case "user":
            return (
              <Bubble
                key={message.id}
                role={message.kind}
                text={message.text}
                primaryColor={config.primaryColor}
              />
            );
          case "typing":
            return <TypingIndicator key={message.id} persona={config.persona} locale={locale} />;
          case "tour":
            return (
              <TourCard
                key={message.id}
                tour={message.tour}
                primaryColor={config.primaryColor}
                accentColor={config.accentColor}
                giftCards={config.giftCards}
                operatorName={config.operatorName}
                locale={locale}
                onBook={onBook}
                onBookDirect={onBookDirect}
                onGift={onGift}
                onEscalate={onEscalate}
              />
            );
          case "direct":
            return (
              <DirectBookingCard
                key={message.id}
                tour={message.tour}
                config={config}
                locale={locale}
              />
            );
          case "gift":
            return (
              <GiftCardWidget
                key={message.id}
                giftUrl={config.giftUrl}
                giftProviderName={config.giftProviderName}
                accentColor={config.accentColor}
                primaryColor={config.primaryColor}
                locale={locale}
              />
            );
          case "escalation":
            return (
              <EscalationCard
                key={message.id}
                answers={answers}
                tourName={message.tourName}
                persona={config.persona}
                operatorName={config.operatorName}
                brandName={config.brandName}
                whatsapp={config.whatsapp}
                accentColor={config.accentColor}
                locale={locale}
              />
            );
          default:
            return null;
        }
      })}
      <div ref={endRef} />
    </div>
  );
}
