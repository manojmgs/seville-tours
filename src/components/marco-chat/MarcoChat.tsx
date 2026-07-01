"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import "./marco-chat.css";
import { MessageList } from "./MessageList";
import { QuickReplies } from "./QuickReplies";
import { ChatInput } from "./ChatInput";
import { quickRepliesFor, recommend } from "./decisionTree";
import { getChatCopy } from "./chat-copy";
import { answerQuestion } from "@/lib/marco/knowledge-base";
import type {
  DurationAnswer,
  GroupAnswer,
  InterestAnswer,
  MarcoAnswers,
  MarcoConfig,
  MarcoMessage,
  MarcoStep,
  MarcoTour,
  QuickReply,
} from "./types";

type MarcoChatProps = {
  open: boolean;
  onClose: () => void;
  tours: MarcoTour[];
  config: MarcoConfig;
  locale: string;
};

const RESTART_VALUE = "__restart";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parent panel and conversation orchestrator for the Marco advisor.
 *
 * Owns the entire transcript, the decision-tree step, and the collected answers.
 * The flow is deterministic: a greeting, three chip-driven questions, then 1–2
 * tour cards — each with Book / Gift / Talk-to-Carlos exits. No AI API is used.
 */
export function MarcoChat({ open, onClose, tours, config, locale }: MarcoChatProps) {
  const copy = getChatCopy(locale);
  const [messages, setMessages] = useState<MarcoMessage[]>([]);
  const [answers, setAnswers] = useState<MarcoAnswers>({});
  const [step, setStep] = useState<MarcoStep>("duration");
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [busy, setBusy] = useState(false);

  const mountedRef = useRef(true);
  const startedRef = useRef(false);
  const idRef = useRef(0);

  const nextId = useCallback(() => `m${(idRef.current += 1)}`, []);

  const findTour = useCallback(
    (id: string) => tours.find((tour) => tour.id === id),
    [tours],
  );

  /** Show a typing indicator, then replace it with an AI bubble. */
  const botSay = useCallback(
    async (text: string) => {
      const typingId = nextId();
      setMessages((prev) => [...prev, { id: typingId, kind: "typing" }]);
      await delay(650 + Math.random() * 500);
      if (!mountedRef.current) return;
      setMessages((prev) => [
        ...prev.filter((message) => message.id !== typingId),
        { id: nextId(), kind: "ai", text },
      ]);
    },
    [nextId],
  );

  const pushUser = useCallback(
    (text: string) => {
      setMessages((prev) => [...prev, { id: nextId(), kind: "user", text }]);
    },
    [nextId],
  );

  const recommendTours = useCallback(
    async (finalAnswers: MarcoAnswers) => {
      const ids = recommend(finalAnswers);
      const picked = ids
        .map((id) => findTour(id))
        .filter((tour): tour is MarcoTour => Boolean(tour));

      await botSay(picked.length > 1 ? copy.recommendLeadTwo : copy.recommendLeadOne);
      if (!mountedRef.current) return;

      for (const tour of picked) {
        setMessages((prev) => [...prev, { id: nextId(), kind: "tour", tour }]);
        await delay(220);
        if (!mountedRef.current) return;
      }

      await botSay(copy.tapInstruction(config.operatorName));
      if (!mountedRef.current) return;
      setStep("recommend");
      setQuickReplies([{ label: copy.startOver, value: RESTART_VALUE }]);
    },
    [botSay, config.operatorName, copy, findTour, nextId],
  );

  const startConversation = useCallback(async () => {
    await delay(400);
    if (!mountedRef.current) return;
    await botSay(
      copy.greeting({
        persona: config.persona,
        destination: config.destination,
        operator: config.operatorName,
      }),
    );
    if (!mountedRef.current) return;
    await botSay(copy.questionDuration(config.destination));
    if (!mountedRef.current) return;
    setStep("duration");
    setQuickReplies(quickRepliesFor("duration", copy));
  }, [botSay, config, copy]);

  // Run the greeting exactly once when the panel opens.
  useEffect(() => {
    mountedRef.current = true;
    if (open && !startedRef.current) {
      startedRef.current = true;
      void startConversation();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [open, startConversation]);

  // Lock body scroll and close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setAnswers({});
    setStep("duration");
    setQuickReplies([]);
    startedRef.current = false;
    void (async () => {
      startedRef.current = true;
      await startConversation();
    })();
  }, [startConversation]);

  const handleSelect = useCallback(
    async (reply: QuickReply) => {
      if (busy) return;

      if (reply.value === RESTART_VALUE) {
        resetConversation();
        return;
      }

      setBusy(true);
      setQuickReplies([]);
      pushUser(reply.label);

      if (step === "duration") {
        const nextAnswers = { ...answers, duration: reply.value as DurationAnswer };
        setAnswers(nextAnswers);
        await botSay(copy.questionInterest(config.region));
        if (mountedRef.current) {
          setStep("interest");
          setQuickReplies(quickRepliesFor("interest", copy));
        }
      } else if (step === "interest") {
        const nextAnswers = { ...answers, interest: reply.value as InterestAnswer };
        setAnswers(nextAnswers);
        await botSay(copy.questionGroup);
        if (mountedRef.current) {
          setStep("group");
          setQuickReplies(quickRepliesFor("group", copy));
        }
      } else if (step === "group") {
        const nextAnswers = { ...answers, group: reply.value as GroupAnswer };
        setAnswers(nextAnswers);
        await recommendTours(nextAnswers);
      }

      if (mountedRef.current) setBusy(false);
    },
    [answers, botSay, busy, config, copy, pushUser, recommendTours, resetConversation, step],
  );

  const handleBook = useCallback((tour: MarcoTour) => {
    window.open(tour.url, "_blank", "noopener,noreferrer");
  }, []);

  const handleBookDirect = useCallback(
    (tour: MarcoTour) => {
      setMessages((prev) => [...prev, { id: nextId(), kind: "direct", tour }]);
    },
    [nextId],
  );

  const handleGift = useCallback(() => {
    setMessages((prev) => [...prev, { id: nextId(), kind: "gift" }]);
  }, [nextId]);

  const handleEscalate = useCallback(
    (tour: MarcoTour) => {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), kind: "escalation", tourName: tour.name },
      ]);
    },
    [nextId],
  );

  const handleFreeText = useCallback(
    async (text: string) => {
      if (busy) return;
      setBusy(true);
      setQuickReplies([]);
      pushUser(text);

      const answer = answerQuestion(text, tours, config, locale);
      await botSay(answer.text);
      if (!mountedRef.current) {
        return;
      }

      if (answer.kind === "reply") {
        const picked = (answer.recommend ?? [])
          .map((id) => findTour(id))
          .filter((tour): tour is MarcoTour => Boolean(tour));
        for (const tour of picked) {
          setMessages((prev) => [...prev, { id: nextId(), kind: "tour", tour }]);
          await delay(220);
          if (!mountedRef.current) return;
        }
      } else {
        setMessages((prev) => [...prev, { id: nextId(), kind: "escalation" }]);
      }

      if (mountedRef.current) setBusy(false);
    },
    [botSay, busy, config, findTour, locale, nextId, pushUser, tours],
  );

  if (!open) return null;

  const headerStyle: CSSProperties = { backgroundColor: config.primaryColor };
  const avatarStyle: CSSProperties = {
    backgroundColor: config.accentColor,
    color: config.primaryColor,
  };

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label={copy.closeChat}
        className="absolute inset-0 bg-[rgba(7,10,8,0.5)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex min-h-full items-stretch justify-center sm:items-end sm:justify-end sm:p-6">
        <section
          role="dialog"
          aria-modal="true"
          aria-label={copy.advisorAria({
            persona: config.persona,
            destination: config.destination,
          })}
          className="marco-panel relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#EDE8E1] shadow-[0_28px_80px_rgba(0,0,0,0.4)] sm:h-[640px] sm:max-h-[85vh] sm:w-[390px] sm:rounded-[28px]"
        >
          <header
            style={headerStyle}
            className="flex items-center gap-3 border-b border-[rgba(201,168,76,0.15)] px-4 py-3"
          >
            <div
              style={avatarStyle}
              className="font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-semibold"
            >
              {config.persona.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[17px] font-semibold leading-tight text-[#FAF7F2]">
                {config.persona} · {config.expertTitle}
              </p>
              <p className="text-[11px] text-[color:var(--brand-gold-100,#f0d48a)] opacity-90">
                ● {copy.headerOnline} · {copy.headerExpertSuffix(config.region)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={copy.closeChat}
              className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-white/80 transition hover:text-white"
            >
              ×
            </button>
          </header>

          <MessageList
            messages={messages}
            answers={answers}
            config={config}
            locale={locale}
            onBook={handleBook}
            onBookDirect={handleBookDirect}
            onGift={handleGift}
            onEscalate={handleEscalate}
          />

          <QuickReplies
            replies={quickReplies}
            onSelect={handleSelect}
            primaryColor={config.primaryColor}
          />

          <ChatInput
            onSend={handleFreeText}
            disabled={busy}
            primaryColor={config.primaryColor}
            persona={config.persona}
            locale={locale}
          />
        </section>
      </div>
    </div>
  );
}
