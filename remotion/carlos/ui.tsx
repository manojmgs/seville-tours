import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_DISPLAY, FONT_SANS, SAFE_PADDING } from "./theme";

/** Video-only presentation primitives. No application state, no network, no remote fonts. */

/** Restrained entrance: opacity plus a small rise, never a bounce. */
export function useReveal(delayFrames = 0, durationFrames = 14) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [delayFrames, delayFrames + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { opacity: progress, transform: `translateY(${(1 - progress) * 18}px)` };
}

export function Stage({
  label,
  labelTone = "concept",
  children,
}: {
  label: string;
  labelTone?: "concept" | "future" | "built" | "warn";
  children: React.ReactNode;
}) {
  const toneBg =
    labelTone === "future"
      ? COLORS.gold
      : labelTone === "built"
        ? COLORS.green500
        : labelTone === "warn"
          ? "#6B531D"
          : COLORS.green700;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: COLORS.cream,
        fontFamily: FONT_SANS,
        color: COLORS.ink,
        display: "flex",
        flexDirection: "column",
        padding: SAFE_PADDING,
        paddingBottom: 200,
      }}
    >
      <div
        style={{
          alignSelf: "flex-start",
          background: toneBg,
          color: COLORS.white,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: 0.6,
          padding: "12px 26px",
          borderRadius: 999,
          marginBottom: 36,
        }}
      >
        {label}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 28 }}>
        {children}
      </div>
    </div>
  );
}

export function Heading({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const style = useReveal(delay);
  return (
    <h1
      style={{
        ...style,
        fontFamily: FONT_DISPLAY,
        fontSize: 62,
        lineHeight: 1.12,
        margin: 0,
        color: COLORS.green900,
        maxWidth: 1500,
      }}
    >
      {children}
    </h1>
  );
}

export function Card({
  title,
  tone = "plain",
  delay = 0,
  children,
  flex,
}: {
  title?: string;
  tone?: "plain" | "known" | "open" | "ask";
  delay?: number;
  children: React.ReactNode;
  flex?: number;
}) {
  const style = useReveal(delay);
  const border =
    tone === "open" ? COLORS.gold : tone === "ask" ? COLORS.green500 : "rgba(24,32,25,0.14)";
  const background = tone === "open" ? "#FFF9EF" : tone === "ask" ? "#F4F9F5" : COLORS.card;

  return (
    <section
      style={{
        ...style,
        flex,
        border: `3px solid ${border}`,
        background,
        borderRadius: 28,
        padding: 32,
        minWidth: 0,
      }}
    >
      {title ? (
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 34,
            margin: "0 0 18px",
            color: COLORS.green900,
          }}
        >
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

export function ListBlock({
  label,
  items,
  delay = 0,
  muted,
}: {
  label?: string;
  items: readonly string[];
  delay?: number;
  muted?: boolean;
}) {
  const style = useReveal(delay);

  return (
    <div style={{ ...style, marginBottom: 18 }}>
      {label ? (
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: muted ? COLORS.muted : COLORS.green500,
          }}
        >
          {label}
        </p>
      ) : null}
      <ul style={{ margin: 0, paddingLeft: 30 }}>
        {items.map((item) => (
          <li
            key={item}
            style={{ fontSize: 30, lineHeight: 1.5, color: muted ? COLORS.muted : COLORS.ink }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Bubble({
  speaker,
  text,
  delay = 0,
}: {
  speaker: "marco" | "traveller";
  text: string;
  delay?: number;
}) {
  const style = useReveal(delay);
  const isMarco = speaker === "marco";

  return (
    <div
      style={{
        ...style,
        display: "flex",
        justifyContent: isMarco ? "flex-start" : "flex-end",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          maxWidth: "86%",
          background: isMarco ? COLORS.card : COLORS.green900,
          color: isMarco ? COLORS.ink : COLORS.white,
          borderRadius: 26,
          borderTopLeftRadius: isMarco ? 6 : 26,
          borderTopRightRadius: isMarco ? 26 : 6,
          padding: "20px 26px",
          fontSize: 29,
          lineHeight: 1.45,
        }}
      >
        {text}
      </div>
    </div>
  );
}

/** The two-pane grammar from the traveller playback: conversation left, result right. */
export function TwoPane({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
      <div
        style={{
          background: "#EDE8E1",
          borderRadius: 28,
          padding: 30,
          overflow: "hidden",
          border: "3px solid rgba(24,32,25,0.10)",
        }}
      >
        {left}
      </div>
      <div
        style={{
          background: "#FAF8F5",
          borderRadius: 28,
          padding: 30,
          overflow: "hidden",
          border: "3px solid rgba(24,32,25,0.10)",
        }}
      >
        {right}
      </div>
    </div>
  );
}

export function Boundary({ lines, delay = 0 }: { lines: readonly string[]; delay?: number }) {
  const style = useReveal(delay);

  return (
    <div style={{ ...style, marginTop: 14 }}>
      {lines.map((line) => (
        <p
          key={line}
          style={{
            margin: "0 0 6px",
            fontSize: 24,
            lineHeight: 1.45,
            color: "#6B531D",
            fontWeight: 700,
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

export function KeyValue({ rows, delay = 0 }: { rows: readonly [string, string][]; delay?: number }) {
  const style = useReveal(delay);

  return (
    <div style={style}>
      {rows.map(([key, value]) => (
        <div
          key={key}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 24,
            padding: "12px 0",
            borderBottom: "2px solid rgba(24,32,25,0.08)",
            fontSize: 27,
          }}
        >
          <span style={{ color: COLORS.muted }}>{key}</span>
          <span style={{ fontWeight: 700, color: COLORS.green900, textAlign: "right" }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

export function BigQuestion({ question }: { question: string }) {
  const style = useReveal(6, 18);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: COLORS.green900,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: SAFE_PADDING + 40,
        fontFamily: FONT_SANS,
      }}
    >
      <p
        style={{
          ...style,
          margin: "0 0 28px",
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: COLORS.gold,
        }}
      >
        Pregunta para Carlos
      </p>
      <p
        style={{
          ...style,
          margin: 0,
          fontFamily: FONT_DISPLAY,
          fontSize: 66,
          lineHeight: 1.28,
          color: COLORS.white,
        }}
      >
        {question}
      </p>
    </div>
  );
}

/** Persistent caption band. Large enough to survive WhatsApp compression. */
export function Caption({ text }: { text: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE_PADDING,
        right: SAFE_PADDING,
        bottom: 48,
        background: "rgba(15,36,26,0.94)",
        borderRadius: 20,
        padding: "22px 30px",
        fontFamily: FONT_SANS,
        fontSize: 32,
        lineHeight: 1.35,
        color: COLORS.white,
        textAlign: "center",
      }}
    >
      {text}
    </div>
  );
}
