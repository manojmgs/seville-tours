import type { CSSProperties } from "react";

type BubbleProps = {
  role: "ai" | "user";
  text: string;
  /** User-bubble background, from MarcoConfig.primaryColor. */
  primaryColor: string;
};

/**
 * A single chat bubble. AI bubbles sit left on white; user bubbles sit right on
 * the operator's primary colour. Presentation only.
 */
export function Bubble({ role, text, primaryColor }: BubbleProps) {
  const isUser = role === "user";
  const style: CSSProperties | undefined = isUser
    ? { backgroundColor: primaryColor }
    : undefined;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        style={style}
        className={
          isUser
            ? "max-w-[78%] rounded-[18px] rounded-tr-[4px] px-3.5 py-2 text-sm leading-relaxed text-white"
            : "max-w-[78%] rounded-[18px] rounded-tl-[4px] bg-white px-3.5 py-2 text-sm leading-relaxed text-[#1a1a1a] shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
        }
      >
        {text}
      </div>
    </div>
  );
}
