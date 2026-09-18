import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_DISPLAY, FONT_SANS } from "./theme";

/* -------------------------------------------------------------------------- */
/* Animation helpers                                                          */
/* -------------------------------------------------------------------------- */

/** Spring-driven fade + slide-up, rebased to the current Sequence. */
const useRise = (delay: number, distance = 48) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.6 },
  });
  return {
    opacity: s,
    transform: `translateY(${interpolate(s, [0, 1], [distance, 0])}px)`,
  };
};

/** Spring-driven pop-in scale, rebased to the current Sequence. */
const usePop = (delay: number, from = 0.4) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 0.7, stiffness: 140 },
  });
  return {
    opacity: interpolate(s, [0, 1], [0, 1]),
    transform: `scale(${interpolate(s, [0, 1], [from, 1])})`,
  };
};

/** Gentle infinite pulse for CTAs / live indicators. */
const usePulse = (speed = 0.12, min = 1, max = 1.06) => {
  const frame = useCurrentFrame();
  const t = (Math.sin(frame * speed) + 1) / 2;
  return interpolate(t, [0, 1], [min, max]);
};

/* -------------------------------------------------------------------------- */
/* Ambient background                                                         */
/* -------------------------------------------------------------------------- */

const GoldDots: React.FC = () => {
  const frame = useCurrentFrame();
  const dots = React.useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        x: (i * 137.5) % 100,
        y: (i * 61.8) % 100,
        r: 3 + ((i * 7) % 6),
        speed: 0.4 + (i % 5) * 0.18,
        phase: i * 0.9,
      })),
    [],
  );
  return (
    <AbsoluteFill>
      {dots.map((d, i) => {
        const drift = Math.sin(frame * 0.02 * d.speed + d.phase) * 26;
        const twinkle = (Math.sin(frame * 0.06 + d.phase) + 1) / 2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.r,
              height: d.r,
              borderRadius: "50%",
              background: COLORS.gold,
              opacity: 0.15 + twinkle * 0.35,
              transform: `translateY(${drift}px)`,
              filter: "blur(0.5px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const GreenBackdrop: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 90% at 50% 8%, ${COLORS.green500} 0%, ${COLORS.green700} 42%, ${COLORS.green900} 100%)`,
    }}
  >
    <GoldDots />
    {children}
  </AbsoluteFill>
);

/* -------------------------------------------------------------------------- */
/* Small brand atoms                                                          */
/* -------------------------------------------------------------------------- */

const Avatar: React.FC<{ size?: number }> = ({ size = 150 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `linear-gradient(145deg, ${COLORS.goldLight}, ${COLORS.gold})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT_DISPLAY,
      fontSize: size * 0.5,
      fontWeight: 700,
      color: COLORS.green900,
      boxShadow: `0 24px 60px rgba(0,0,0,0.35), inset 0 3px 10px rgba(255,255,255,0.5)`,
    }}
  >
    I
  </div>
);

const Kicker: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = COLORS.gold,
}) => (
  <div
    style={{
      fontFamily: FONT_SANS,
      fontSize: 34,
      letterSpacing: 10,
      textTransform: "uppercase",
      fontWeight: 700,
      color,
    }}
  >
    {children}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Scene 1 — Hook / reveal                                                    */
/* -------------------------------------------------------------------------- */

const SceneHook: React.FC = () => {
  const kicker = useRise(4);
  const avatar = usePop(14);
  const title = useRise(24);
  const sub = useRise(40);
  return (
    <GreenBackdrop>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 90px",
          gap: 40,
        }}
      >
        <div style={kicker}>
          <Kicker>Seville · Andalucía</Kicker>
        </div>
        <div style={avatar}>
          <Avatar />
        </div>
        <div
          style={{
            ...title,
            fontFamily: FONT_DISPLAY,
            fontSize: 150,
            lineHeight: 1,
            color: COLORS.white,
            fontWeight: 700,
          }}
        >
          Meet Isabel
        </div>
        <div
          style={{
            ...sub,
            fontFamily: FONT_SANS,
            fontSize: 46,
            color: COLORS.cream,
            fontWeight: 400,
          }}
        >
          your private Seville concierge
        </div>
      </AbsoluteFill>
    </GreenBackdrop>
  );
};

/* -------------------------------------------------------------------------- */
/* Scene 2 — Why it feels different                                           */
/* -------------------------------------------------------------------------- */

const ValueLine: React.FC<{ delay: number; text: string }> = ({ delay, text }) => {
  const style = useRise(delay, 60);
  return (
    <div
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        gap: 30,
        fontFamily: FONT_SANS,
        fontSize: 58,
        color: COLORS.white,
        fontWeight: 600,
      }}
    >
      <span
        style={{
          minWidth: 74,
          height: 74,
          borderRadius: "50%",
          background: COLORS.gold,
          color: COLORS.green900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 44,
          fontWeight: 800,
        }}
      >
        ✓
      </span>
      {text}
    </div>
  );
};

const SceneValue: React.FC = () => {
  const heading = useRise(4);
  return (
    <GreenBackdrop>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          padding: "0 100px",
          gap: 56,
        }}
      >
        <div
          style={{
            ...heading,
            fontFamily: FONT_DISPLAY,
            fontSize: 78,
            color: COLORS.goldLight,
            fontWeight: 700,
            marginBottom: 20,
          }}
        >
          Planning, finally simple.
        </div>
        <ValueLine delay={22} text="No apps to download" />
        <ValueLine delay={40} text="No waiting for replies" />
        <ValueLine delay={58} text="Real tours — no AI guesswork" />
      </AbsoluteFill>
    </GreenBackdrop>
  );
};

/* -------------------------------------------------------------------------- */
/* Scene 3 — Live chat demo inside a phone                                    */
/* -------------------------------------------------------------------------- */

const ChatHeader: React.FC = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 20,
      padding: "26px 30px",
      background: COLORS.green700,
    }}
  >
    <Avatar size={64} />
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 38,
          color: COLORS.white,
          fontWeight: 700,
        }}
      >
        Isabel
      </span>
      <span
        style={{
          fontFamily: FONT_SANS,
          fontSize: 24,
          color: COLORS.goldLight,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: COLORS.whatsapp,
            display: "inline-block",
          }}
        />
        Online
      </span>
    </div>
  </div>
);

const UserBubble: React.FC<{ delay: number; text: string }> = ({ delay, text }) => {
  const style = useRise(delay, 30);
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div
        style={{
          ...style,
          maxWidth: "78%",
          background: COLORS.green500,
          color: COLORS.white,
          fontFamily: FONT_SANS,
          fontSize: 34,
          padding: "22px 30px",
          borderRadius: "28px 28px 8px 28px",
        }}
      >
        {text}
      </div>
    </div>
  );
};

const TypingDots: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <div
        style={{
          background: COLORS.cream,
          padding: "26px 32px",
          borderRadius: "28px 28px 28px 8px",
          display: "flex",
          gap: 14,
        }}
      >
        {[0, 1, 2].map((i) => {
          const bounce = Math.sin(frame * 0.35 + i * 0.9);
          return (
            <span
              key={i}
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: COLORS.muted,
                transform: `translateY(${bounce * 8}px)`,
                opacity: 0.5 + (bounce + 1) / 4,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const IsabelBubble: React.FC<{ delay: number; text: string }> = ({ delay, text }) => {
  const style = useRise(delay, 30);
  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <div
        style={{
          ...style,
          maxWidth: "82%",
          background: COLORS.cream,
          color: COLORS.ink,
          fontFamily: FONT_SANS,
          fontSize: 34,
          padding: "22px 30px",
          borderRadius: "28px 28px 28px 8px",
        }}
      >
        {text}
      </div>
    </div>
  );
};

const TourCard: React.FC<{ delay: number }> = ({ delay }) => {
  const style = usePop(delay, 0.7);
  const livePulse = usePulse(0.18, 1, 1.08);
  return (
    <div
      style={{
        ...style,
        background: COLORS.card,
        borderRadius: 30,
        overflow: "hidden",
        boxShadow: "0 30px 70px rgba(0,0,0,0.28)",
        border: `1px solid rgba(0,0,0,0.05)`,
      }}
    >
      <div
        style={{
          height: 190,
          background: `linear-gradient(135deg, ${COLORS.green500}, ${COLORS.green900})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 90,
          position: "relative",
        }}
      >
        🏛️
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            background: "rgba(255,255,255,0.92)",
            color: COLORS.green900,
            fontFamily: FONT_SANS,
            fontSize: 24,
            fontWeight: 700,
            padding: "8px 18px",
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            gap: 10,
            transform: `scale(${livePulse})`,
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: COLORS.whatsapp,
            }}
          />
          10 spots left
        </div>
      </div>
      <div style={{ padding: "26px 30px" }}>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 40,
            fontWeight: 700,
            color: COLORS.ink,
          }}
        >
          Alcázar of Seville
        </div>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 30,
            color: COLORS.muted,
            marginTop: 6,
          }}
        >
          Guided skip-the-line · 1.5h · €50
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 26 }}>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              background: COLORS.green700,
              color: COLORS.white,
              fontFamily: FONT_SANS,
              fontSize: 30,
              fontWeight: 700,
              padding: "20px 0",
              borderRadius: 16,
            }}
          >
            Book now
          </div>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              background: "transparent",
              color: COLORS.green700,
              border: `2px solid ${COLORS.green700}`,
              fontFamily: FONT_SANS,
              fontSize: 30,
              fontWeight: 700,
              padding: "18px 0",
              borderRadius: 16,
            }}
          >
            Book direct
          </div>
        </div>
      </div>
    </div>
  );
};

const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const rise = useRise(0, 80);
  return (
    <div
      style={{
        ...rise,
        width: 760,
        height: 1480,
        borderRadius: 72,
        background: "#0B0B0C",
        padding: 18,
        boxShadow: "0 40px 120px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 56,
          overflow: "hidden",
          background: COLORS.white,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* notch */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            width: 200,
            height: 34,
            borderRadius: 999,
            background: "#0B0B0C",
            zIndex: 5,
          }}
        />
        {children}
      </div>
    </div>
  );
};

const SceneChat: React.FC = () => {
  const { width, height } = useVideoConfig();
  // Phone is authored at 760x1480; scale it down to fit narrower/shorter formats.
  const phoneScale = Math.min(1, (height - 120) / 1480, (width - 80) / 760);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLORS.green700}, ${COLORS.green900})`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ transform: `scale(${phoneScale})` }}>
      <PhoneFrame>
        <ChatHeader />
        <div
          style={{
            flex: 1,
            padding: "34px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 26,
            background: COLORS.white,
          }}
        >
          <UserBubble delay={10} text="Alcázar tour for 2 😍" />
          {/* Typing shows, then Isabel replies + card */}
          <Sequence from={34} durationInFrames={34} layout="none">
            <TypingDots />
          </Sequence>
          <Sequence from={68} layout="none">
            <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
              <IsabelBubble delay={0} text="¡Perfecto! The one I'd book first:" />
              <TourCard delay={16} />
            </div>
          </Sequence>
        </div>
      </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* Scene 4 — Multilingual                                                     */
/* -------------------------------------------------------------------------- */

const GREETINGS = ["Hola", "Hello", "Bonjour", "مرحبا"];

const SceneLanguages: React.FC = () => {
  const frame = useCurrentFrame();
  const heading = useRise(4);
  const per = 24;
  const index = Math.min(GREETINGS.length - 1, Math.floor(frame / per));
  const local = frame - index * per;
  const wordOpacity = interpolate(local, [0, 6, per - 6, per], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wordScale = interpolate(local, [0, 8], [0.8, 1], {
    extrapolateRight: "clamp",
  });
  const closing = useRise(GREETINGS.length * per + 6);
  return (
    <GreenBackdrop>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 50,
          padding: "0 80px",
        }}
      >
        <div
          style={{
            ...heading,
            fontFamily: FONT_SANS,
            fontSize: 44,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: COLORS.goldLight,
            fontWeight: 700,
          }}
        >
          She speaks your language
        </div>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 190,
            fontWeight: 700,
            color: COLORS.white,
            opacity: wordOpacity,
            transform: `scale(${wordScale})`,
            minHeight: 220,
          }}
        >
          {GREETINGS[index]}
        </div>
        <div
          style={{
            ...closing,
            fontFamily: FONT_SANS,
            fontSize: 40,
            color: COLORS.cream,
          }}
        >
          English · Español · Français · العربية
        </div>
      </AbsoluteFill>
    </GreenBackdrop>
  );
};

/* -------------------------------------------------------------------------- */
/* Scene 5 — CTA                                                              */
/* -------------------------------------------------------------------------- */

const SceneCTA: React.FC = () => {
  const avatar = usePop(4);
  const title = useRise(16);
  const btn = useRise(30);
  const url = useRise(44);
  const foot = useRise(56);
  const btnPulse = usePulse(0.14, 1, 1.05);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 100% at 50% 30%, ${COLORS.green500} 0%, ${COLORS.green700} 45%, ${COLORS.green900} 100%)`,
      }}
    >
      <GoldDots />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 44,
          padding: "0 80px",
        }}
      >
        <div style={avatar}>
          <Avatar size={170} />
        </div>
        <div
          style={{
            ...title,
            fontFamily: FONT_DISPLAY,
            fontSize: 96,
            lineHeight: 1.05,
            color: COLORS.white,
            fontWeight: 700,
          }}
        >
          Chat with Isabel
        </div>
        <div
          style={{
            ...btn,
            transform: `${(btn.transform as string) ?? ""} scale(${btnPulse})`,
            background: `linear-gradient(145deg, ${COLORS.goldLight}, ${COLORS.gold})`,
            color: COLORS.green900,
            fontFamily: FONT_SANS,
            fontSize: 52,
            fontWeight: 800,
            padding: "34px 70px",
            borderRadius: 999,
            boxShadow: "0 24px 60px rgba(201,168,76,0.45)",
          }}
        >
          Start planning →
        </div>
        <div
          style={{
            ...url,
            fontFamily: FONT_SANS,
            fontSize: 46,
            color: COLORS.goldLight,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          seville-tours.vercel.app
        </div>
        <div
          style={{
            ...foot,
            fontFamily: FONT_SANS,
            fontSize: 32,
            color: COLORS.cream,
          }}
        >
          Private tours & day trips · Seville, Spain
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* Captions (burned-in, synced to the voiceover)                              */
/* -------------------------------------------------------------------------- */

type Caption = { start: number; end: number; text: string };

const CAPTIONS: Caption[] = [
  { start: 0, end: 105, text: "Planning a trip to Seville? Meet Isabel." },
  { start: 105, end: 210, text: "No apps, no waiting, no AI guesswork — just real tours." },
  {
    start: 210,
    end: 450,
    text: "Tell her what you want — live availability, honest prices, book direct with zero fees.",
  },
  { start: 450, end: 555, text: "And she speaks your language." },
];

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const active = CAPTIONS.find((c) => frame >= c.start && frame < c.end);
  if (!active) return null;
  const local = frame - active.start;
  const dur = active.end - active.start;
  const opacity = interpolate(local, [0, 8, dur - 8, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 70px 110px",
      }}
    >
      <div
        style={{
          opacity,
          background: "rgba(15,36,26,0.74)",
          color: COLORS.white,
          fontFamily: FONT_SANS,
          fontSize: 42,
          fontWeight: 700,
          lineHeight: 1.28,
          textAlign: "center",
          padding: "24px 36px",
          borderRadius: 24,
          maxWidth: "100%",
          border: `1px solid rgba(201,168,76,0.35)`,
        }}
      >
        {active.text}
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* Soundtrack — voiceover + background music with ducking / fades             */
/* -------------------------------------------------------------------------- */

const Soundtrack: React.FC<{
  voiceoverSrc: string | null;
  musicSrc: string | null;
}> = ({ voiceoverSrc, musicSrc }) => {
  const { durationInFrames, fps } = useVideoConfig();
  const fadeOut = durationInFrames - 24;
  // Music bed is 22s (sound-generation max), shorter than the 24s edit, so fade
  // it out within its own length to avoid an abrupt cut at the file's end.
  const musicEnd = Math.min(durationInFrames, Math.round(22 * fps));
  const musicFadeOut = musicEnd - 24;
  return (
    <>
      {musicSrc ? (
        <Audio
          src={musicSrc}
          volume={(f) =>
            interpolate(
              f,
              [0, 18, musicFadeOut, musicEnd],
              [0, 0.18, 0.18, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            )
          }
        />
      ) : null}
      {voiceoverSrc ? (
        <Audio
          src={voiceoverSrc}
          volume={(f) =>
            interpolate(f, [0, 6, fadeOut, durationInFrames], [0, 1, 1, 0.4], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* Composition root — scene timeline                                          */
/* -------------------------------------------------------------------------- */

export type ConciergePromoProps = {
  voiceoverSrc: string | null;
  musicSrc: string | null;
  showCaptions: boolean;
};

export const ConciergePromo: React.FC<ConciergePromoProps> = ({
  voiceoverSrc,
  musicSrc,
  showCaptions,
}) => {
  return (
    <AbsoluteFill style={{ background: COLORS.green900 }}>
      <Sequence from={0} durationInFrames={105}>
        <SceneHook />
      </Sequence>
      <Sequence from={105} durationInFrames={105}>
        <SceneValue />
      </Sequence>
      <Sequence from={210} durationInFrames={240}>
        <SceneChat />
      </Sequence>
      <Sequence from={450} durationInFrames={105}>
        <SceneLanguages />
      </Sequence>
      <Sequence from={555} durationInFrames={165}>
        <SceneCTA />
      </Sequence>
      {showCaptions ? <Captions /> : null}
      <Soundtrack voiceoverSrc={voiceoverSrc} musicSrc={musicSrc} />
    </AbsoluteFill>
  );
};
