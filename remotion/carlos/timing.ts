import { CARLOS_AUDIO_SECONDS } from "./audio-timings";
import type { CarlosScene } from "./script";

/** Breathing room after each narration line, so scenes never cut on the last word. */
const SCENE_PAD_SECONDS = 0.7;

export function sceneSeconds(scene: CarlosScene): number {
  return (CARLOS_AUDIO_SECONDS[scene.id] ?? scene.estimatedSeconds) + SCENE_PAD_SECONDS;
}

export function sceneFrames(scene: CarlosScene, fps: number): number {
  return Math.max(fps, Math.round(sceneSeconds(scene) * fps));
}

export function videoDurationInFrames(scenes: readonly CarlosScene[], fps: number): number {
  return scenes.reduce((total, scene) => total + sceneFrames(scene, fps), 0);
}

export function sceneStarts(scenes: readonly CarlosScene[], fps: number): readonly number[] {
  let cursor = 0;
  return scenes.map((scene) => {
    const start = cursor;
    cursor += sceneFrames(scene, fps);
    return start;
  });
}

export function audioPathFor(sceneId: string): string {
  return `audio/carlos/${sceneId}.mp3`;
}
