import React from "react";
import { Composition, staticFile } from "remotion";
import { ConciergePromo, type ConciergePromoProps } from "./ConciergePromo";
import { VIDEO } from "./theme";
import { CarlosDemo1JourneyBrief } from "./carlos/CarlosDemo1JourneyBrief";
import { CarlosDemo2Collaboration } from "./carlos/CarlosDemo2Collaboration";
import { CarlosDemo3ReturnLoop } from "./carlos/CarlosDemo3ReturnLoop";
import { resolveCarlosAudio, type CarlosVideoProps } from "./carlos/VideoShell";
import { DEMO1_SCENES, DEMO2_SCENES, DEMO3_SCENES } from "./carlos/script";
import { CARLOS_VIDEO } from "./carlos/theme";
import { videoDurationInFrames } from "./carlos/timing";

const VOICEOVER_FILE = "audio/vo-en.mp3";
const MUSIC_FILE = "audio/music.mp3";

/** HEAD-check a static asset so a missing file simply disables that track. */
const assetExists = async (src: string): Promise<boolean> => {
  try {
    const res = await fetch(src, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
};

/** Detect optional audio at metadata time (runs in Studio and during render). */
const resolveAudio = async (
  props: ConciergePromoProps,
): Promise<{ props: ConciergePromoProps }> => {
  const voiceover = staticFile(VOICEOVER_FILE);
  const music = staticFile(MUSIC_FILE);
  const [hasVoiceover, hasMusic] = await Promise.all([
    assetExists(voiceover),
    assetExists(music),
  ]);
  return {
    props: {
      ...props,
      voiceoverSrc: hasVoiceover ? voiceover : null,
      musicSrc: hasMusic ? music : null,
    },
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ConciergePromo"
        component={ConciergePromo}
        durationInFrames={VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={
          {
            voiceoverSrc: null,
            musicSrc: null,
            showCaptions: true,
          } satisfies ConciergePromoProps
        }
        calculateMetadata={({ props }) => resolveAudio(props)}
      />
      <Composition
        id="ConciergePromoSquare"
        component={ConciergePromo}
        durationInFrames={VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={1080}
        height={1080}
        defaultProps={
          {
            voiceoverSrc: null,
            musicSrc: null,
            showCaptions: false,
          } satisfies ConciergePromoProps
        }
        calculateMetadata={({ props }) => resolveAudio(props)}
      />

      <Composition
        id="CarlosDemo1JourneyBrief"
        component={CarlosDemo1JourneyBrief}
        durationInFrames={videoDurationInFrames(DEMO1_SCENES, CARLOS_VIDEO.fps)}
        fps={CARLOS_VIDEO.fps}
        width={CARLOS_VIDEO.width}
        height={CARLOS_VIDEO.height}
        defaultProps={{ hasAudio: false } satisfies CarlosVideoProps}
        calculateMetadata={() => resolveCarlosAudio(DEMO1_SCENES)}
      />
      <Composition
        id="CarlosDemo2Collaboration"
        component={CarlosDemo2Collaboration}
        durationInFrames={videoDurationInFrames(DEMO2_SCENES, CARLOS_VIDEO.fps)}
        fps={CARLOS_VIDEO.fps}
        width={CARLOS_VIDEO.width}
        height={CARLOS_VIDEO.height}
        defaultProps={{ hasAudio: false } satisfies CarlosVideoProps}
        calculateMetadata={() => resolveCarlosAudio(DEMO2_SCENES)}
      />
      <Composition
        id="CarlosDemo3ReturnLoop"
        component={CarlosDemo3ReturnLoop}
        durationInFrames={videoDurationInFrames(DEMO3_SCENES, CARLOS_VIDEO.fps)}
        fps={CARLOS_VIDEO.fps}
        width={CARLOS_VIDEO.width}
        height={CARLOS_VIDEO.height}
        defaultProps={{ hasAudio: false } satisfies CarlosVideoProps}
        calculateMetadata={() => resolveCarlosAudio(DEMO3_SCENES)}
      />
    </>
  );
};
