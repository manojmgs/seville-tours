import { useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { getChatCopy } from "./chat-copy";

type ChatInputProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
  primaryColor: string;
  persona: string;
  locale: string;
};

/**
 * Optional free-text input. The concierge is chip-driven, so this is a convenience
 * for guests who'd rather type; free text is answered from the knowledge base or
 * routed to the escalation summary.
 */
export function ChatInput({ onSend, disabled, primaryColor, persona, locale }: ChatInputProps) {
  const [value, setValue] = useState("");
  const copy = getChatCopy(locale);

  function submit(event: FormEvent) {
    event.preventDefault();
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  }

  const sendStyle: CSSProperties = { backgroundColor: primaryColor };

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 border-t border-[rgba(0,0,0,0.06)] bg-[#EDE8E1] px-3 py-2.5"
    >
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        placeholder={copy.inputPlaceholder(persona)}
        aria-label={copy.inputAria(persona)}
        className="min-h-[44px] flex-1 rounded-full bg-white px-4 text-sm text-[#111] outline-none shadow-[0_1px_3px_rgba(0,0,0,0.08)] disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || value.trim().length === 0}
        aria-label={copy.sendAria}
        style={sendStyle}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition active:scale-95 disabled:opacity-50"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M2 21L23 12 2 3v7l15 2-15 2v7z" />
        </svg>
      </button>
    </form>
  );
}
