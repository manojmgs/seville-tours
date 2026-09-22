// Generate the Spanish narration for the three Carlos concept videos.
//
// Usage (PowerShell):
//   node scripts/generate-carlos-voiceovers.mjs          # missing clips only
//   node scripts/generate-carlos-voiceovers.mjs --force   # regenerate everything
//   # or: pnpm video:carlos:voiceover
//
// Reads ELEVENLABS_API_KEY from .env.local / .env. The key is never logged.
// Output: public/audio/carlos/<sceneId>.mp3 plus measured durations written to
// remotion/carlos/audio-timings.ts so scenes stay in sync with the narration.

import { mkdir, writeFile, stat } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

/** Anchored per line: an unanchored match would also hit a commented-out key. */
function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    let raw;
    try {
      raw = readFileSync(resolve(process.cwd(), file), "utf8");
    } catch {
      continue;
    }
    for (const line of raw.split(/\r?\n/)) {
      if (line.trimStart().startsWith("#")) continue;
      const match = line.match(/^[ \t]*([A-Za-z0-9_]+)[ \t]*=[ \t]*(.*)$/);
      if (!match) continue;
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[match[1]] === undefined) process.env[match[1]] = value;
    }
  }
}

loadEnvFiles();

// Premade ElevenLabs voices only: free plans return 402 for community library
// voices. "George" is warm and neutral, and eleven_multilingual_v2 handles Spanish.
const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";
const MODEL_ID = "eleven_multilingual_v2";
const OUT_DIR = resolve(process.cwd(), "public/audio/carlos");
const TIMINGS_PATH = resolve(process.cwd(), "remotion/carlos/audio-timings.ts");

/** Pulls the Spanish lines straight out of the composition script, so they cannot drift. */
function readScenes() {
  const source = readFileSync(resolve(process.cwd(), "remotion/carlos/script.ts"), "utf8");
  const scenes = [];
  const blockPattern = /id:\s*"([^"]+)",\s*\n\s*estimatedSeconds:\s*[\d.]+,\s*\n\s*es:\s*"((?:[^"\\]|\\.)*)"/g;
  let match;
  while ((match = blockPattern.exec(source)) !== null) {
    scenes.push({ id: match[1], es: match[2].replace(/\\"/g, '"') });
  }
  return scenes;
}

/** Remotion ships ffprobe. It writes the stream summary to stderr, so stderr is merged in. */
function durationSeconds(file) {
  let output = "";
  try {
    output = execSync(`pnpm exec remotion ffprobe "${file}" 2>&1`, { encoding: "utf8" });
  } catch (error) {
    output = `${error.stdout ?? ""}${error.stderr ?? ""}`;
  }
  const match = output.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  if (!match) return null;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

async function synthesise(apiKey, voiceId, text, outPath) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: { stability: 0.55, similarity_boost: 0.8, style: 0.05, use_speaker_boost: true },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${detail.slice(0, 300)}`);
  }

  await writeFile(outPath, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("ERROR: ELEVENLABS_API_KEY is not set. Add it to .env.local and re-run.");
    process.exit(1);
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
  const force = process.argv.includes("--force");
  const scenes = readScenes();

  if (scenes.length === 0) {
    console.error("ERROR: no scenes parsed from remotion/carlos/script.ts");
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Generating ${scenes.length} Spanish clips with voice ${voiceId} (${MODEL_ID})...`);

  const timings = {};
  for (const scene of scenes) {
    const outPath = resolve(OUT_DIR, `${scene.id}.mp3`);
    if (!force && existsSync(outPath)) {
      console.log(`  = ${scene.id} (exists, skipped)`);
    } else {
      await synthesise(apiKey, voiceId, scene.es, outPath);
      const { size } = await stat(outPath);
      console.log(`  + ${scene.id} (${(size / 1024).toFixed(0)} KB)`);
    }
    const seconds = durationSeconds(outPath);
    if (seconds) timings[scene.id] = Number(seconds.toFixed(2));
  }

  const body = Object.entries(timings)
    .map(([id, seconds]) => `  "${id}": ${seconds},`)
    .join("\n");

  await writeFile(
    TIMINGS_PATH,
    `/**\n * Measured narration lengths, in seconds, keyed by scene id.\n *\n * GENERATED by \`pnpm video:carlos:voiceover\` — do not edit by hand. Empty means\n * no audio has been generated yet, and the compositions fall back to the\n * estimates in \`script.ts\` so a silent preview still renders.\n */\nexport const CARLOS_AUDIO_SECONDS: Readonly<Record<string, number>> = {\n${body}\n};\n`,
    "utf8",
  );

  const total = Object.values(timings).reduce((sum, value) => sum + value, 0);
  console.log(`Wrote ${Object.keys(timings).length} durations (${total.toFixed(1)}s narration) to audio-timings.ts`);
}

main().catch((error) => {
  console.error(`FAILED: ${error.message}`);
  process.exit(1);
});
