// Generate the English voiceover for the Isabel concierge promo using ElevenLabs.
//
// Usage (PowerShell):
//   $env:ELEVENLABS_API_KEY="sk_..."            # required — your key, never committed
//   $env:ELEVENLABS_VOICE_ID="21m00Tcm4TlvDq8ikWAM"   # optional — premade voice ID override; defaults to "Rachel"
//   node scripts/generate-voiceover.mjs
//   # or: pnpm video:voiceover
//
// Output: public/audio/vo-en.mp3  (auto-detected by the Remotion composition)

import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

// Load .env.local / .env into process.env (Next-style) without extra deps.
// Existing environment variables always win; secret values are never logged.
function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    let raw;
    try {
      raw = readFileSync(resolve(process.cwd(), file), "utf8");
    } catch {
      continue;
    }
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (!match || line.trimStart().startsWith("#")) continue;
      const key = match[1];
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}

loadEnvFiles();

// Voice selection: we do NOT fetch voices programmatically. The voice ID is a
// hardcoded premade ElevenLabs voice, chosen from ElevenLabs' public voice
// library, with an env-var override (ELEVENLABS_VOICE_ID).
//
// "Sarah" is a warm, natural female voice that suits the "Isabel" persona.
// We use a premade/default voice (not a community "library" voice) because
// free ElevenLabs plans return 402 for library voices via the API.
const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // ElevenLabs premade "Sarah"
const MODEL_ID = "eleven_multilingual_v2";
const OUTPUT_PATH = resolve(process.cwd(), "public/audio/vo-en.mp3");

// Narration script, timed to the 24s / 5-scene edit. Punctuation drives pacing.
const SCRIPT = [
  "Planning a trip to Seville? Meet Isabel.",
  "No apps, no waiting, no A.I. guesswork — just real tours.",
  "Tell her what you want, and she finds it instantly: live availability, honest prices, and book direct with zero fees.",
  "And she speaks your language.",
  "Start planning today, at seville dash tours dot vercel dot app.",
].join(" ");

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error(
      "ERROR: ELEVENLABS_API_KEY is not set. Set it in your shell and re-run.",
    );
    process.exit(1);
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

  console.log(`Generating voiceover with voice ${voiceId} (${MODEL_ID})...`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: SCRIPT,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.15,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`ERROR: ElevenLabs responded ${res.status}. ${detail}`);
    process.exit(1);
  }

  const audio = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, audio);

  console.log(`Done. Wrote ${(audio.length / 1024).toFixed(0)} KB to ${OUTPUT_PATH}`);
  console.log("Re-render with: pnpm video:render  (and video:render:square)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
