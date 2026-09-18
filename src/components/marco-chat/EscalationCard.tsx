import type { CSSProperties } from "react";
import type { MarcoAnswers } from "./types";
import { labelForAnswer } from "./decisionTree";
import { buildMarcoWhatsAppUrl } from "./whatsapp";
import { getChatCopy, type ChatCopy } from "./chat-copy";

type EscalationCardProps = {
  answers: MarcoAnswers;
  tourName?: string;
  persona: string;
  operatorName: string;
  brandName: string;
  whatsapp: string;
  accentColor: string;
  locale: string;
};

/** Turn the collected answers into a short, human summary line. */
function summarise(
  answers: MarcoAnswers,
  brandName: string,
  copy: ChatCopy,
  tourName?: string,
): string {
  const parts: string[] = [];
  if (answers.duration) parts.push(labelForAnswer("duration", answers.duration, copy));
  if (answers.interest) parts.push(labelForAnswer("interest", answers.interest, copy));
  if (answers.group) parts.push(labelForAnswer("group", answers.group, copy));
  if (tourName) parts.push(copy.escInterestedIn(tourName));
  return parts.length > 0 ? parts.join(" · ") : copy.escGuestEnquiry(brandName);
}

/**
 * Escalation hand-off card. Summarises the guest's answers and opens a WhatsApp
 * chat with the operator, pre-filled with context so the manual step is fast.
 */
export function EscalationCard({
  answers,
  tourName,
  persona,
  operatorName,
  brandName,
  whatsapp,
  accentColor,
  locale,
}: EscalationCardProps) {
  const copy = getChatCopy(locale);
  const summary = summarise(answers, brandName, copy, tourName);
  const message = copy.escMessage({ operator: operatorName, persona, brand: brandName, summary });
  const href = buildMarcoWhatsAppUrl(whatsapp, message);

  const labelStyle: CSSProperties = { color: accentColor };
  const borderStyle: CSSProperties = { borderLeftColor: accentColor };

  return (
    <div className="flex justify-start">
      <div
        style={borderStyle}
        className="w-full max-w-[280px] rounded-2xl border-l-[3px] bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
      >
        <p style={labelStyle} className="text-[10px] font-medium uppercase tracking-[0.12em]">
          ✦ {copy.escConnecting(operatorName)}
        </p>
        <h3 className="font-display mt-1.5 text-base text-[#1A3A2A]">
          {copy.escHeading}
        </h3>
        <p className="mt-1.5 rounded-lg bg-[#F2EDE6] px-2.5 py-2 text-xs italic leading-relaxed text-[#555]">
          {summary}
        </p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#25D366] px-4 text-sm font-medium text-white"
        >
          {copy.escWhatsApp(operatorName)}
        </a>
      </div>
    </div>
  );
}
