import { getChatCopy } from "./chat-copy";

type TypingIndicatorProps = {
  persona: string;
  locale: string;
};

/**
 * Three-dot "typing" indicator shown while the concierge composes a reply. The
 * dots are animated via `marco-chat.css` (`.marco-typing-dot`); colour is inherited.
 */
export function TypingIndicator({ persona, locale }: TypingIndicatorProps) {
  const copy = getChatCopy(locale);
  return (
    <div className="flex justify-start">
      <div
        className="flex w-fit items-center gap-1 rounded-[18px] rounded-tl-[4px] bg-white px-3.5 py-2.5 text-[#8A7F72] shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
        aria-label={copy.typingAria(persona)}
        role="status"
      >
        <span className="marco-typing-dot" />
        <span className="marco-typing-dot" />
        <span className="marco-typing-dot" />
      </div>
    </div>
  );
}
