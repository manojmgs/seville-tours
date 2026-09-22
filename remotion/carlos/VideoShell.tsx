import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { COLORS } from "./theme";
import type { CarlosScene } from "./script";
import { audioPathFor, sceneFrames, sceneStarts } from "./timing";
import { Caption } from "./ui";

export type CarlosVideoProps = {
  /** Resolved at metadata time: missing narration renders a silent, captioned preview. */
  hasAudio: boolean;
};

/**
 * Sequences a scene list, pairing each scene with its own narration clip so the
 * captions and the voice can never drift. Silent when narration is absent.
 */
export function CarlosVideoShell({
  scenes,
  hasAudio,
  renderScene,
}: {
  scenes: readonly CarlosScene[];
  hasAudio: boolean;
  renderScene: (sceneId: string) => React.ReactNode;
}) {
  const { fps } = useVideoConfig();
  const starts = sceneStarts(scenes, fps);

  return (
    <AbsoluteFill style={{ background: COLORS.cream }}>
      {scenes.map((scene, index) => (
        <Sequence
          key={scene.id}
          from={starts[index]}
          durationInFrames={sceneFrames(scene, fps)}
          name={scene.id}
        >
          <AbsoluteFill>
            {renderScene(scene.id)}
            <Caption text={scene.caption} />
            {hasAudio ? <Audio src={staticFile(audioPathFor(scene.id))} /> : null}
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

/** HEAD-checks the first narration clip so one missing folder disables audio cleanly. */
export async function resolveCarlosAudio(
  scenes: readonly CarlosScene[],
): Promise<{ props: CarlosVideoProps }> {
  try {
    const res = await fetch(staticFile(audioPathFor(scenes[0].id)), { method: "HEAD" });
    return { props: { hasAudio: res.ok } };
  } catch {
    return { props: { hasAudio: false } };
  }
}
