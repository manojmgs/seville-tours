import type { CSSProperties } from "react";
import type { QuickReply } from "./types";

type QuickRepliesProps = {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
  primaryColor: string;
};

/**
 * Row of tappable quick-reply chips. The parent clears these after a selection,
 * so this component is purely presentational and stateless.
 */
export function QuickReplies({ replies, onSelect, primaryColor }: QuickRepliesProps) {
  if (replies.length === 0) return null;

  const activeStyle: CSSProperties = {
    borderColor: primaryColor,
  };

  return (
    <div className="flex flex-wrap gap-2 px-3.5 pb-1 pt-2">
      {replies.map((reply) => (
        <button
          key={reply.value}
          type="button"
          onClick={() => onSelect(reply)}
          style={activeStyle}
          className="min-h-[44px] rounded-full border bg-white px-3.5 py-2 text-xs font-medium text-[#1A3A2A] transition active:scale-95 hover:text-white"
          onMouseEnter={(event) => {
            event.currentTarget.style.backgroundColor = primaryColor;
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.backgroundColor = "#ffffff";
          }}
        >
          {reply.label}
        </button>
      ))}
    </div>
  );
}
