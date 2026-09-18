// Generate the background music bed for the Isabel concierge promo using the
// ElevenLabs sound-generation API.
//
// The dedicated Music API requires a paid plan, so we use sound-generation,
// which is available on the free tier and produces a usable ambient music bed.
// Its max length is 22s; the 24s edit fades the track out cleanly at the end.
//
// Usage (PowerShell):
//   $env:ELEVENLABS_API_KEY="sk_..."       # required — your key, never committed
//   $env:ELEVENLABS_MUSIC_PROMPT="..."     # optional — override the music brief
//   node scripts/generate-music.mjs
//   # or: pnpm video:music
//
// Output: public/audio/music.mp3  (auto-detected by the Remotion composition)

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

// Video is 24s (720 frames @ 30fps). Sound-generation caps at 22s; the
// composition fades/ducks the track under the voiceover so the 2s tail is fine.
const MUSIC_LENGTH_SECONDS = 22;
const OUTPUT_PATH = resolve(process.cwd(), "public/audio/music.mp3");

// Warm, cinematic Andalusian brief that sits under narration without competing.
const DEFAULT_PROMPT =
  "Warm, elegant cinematic underscore for a luxury Seville travel promo. " +
  "Soft Spanish nylon guitar, gentle strings, light hand percussion, " +
  "hopeful and calm, low-key so a voiceover sits clearly on top. " +
  "No vocals, no lyrics, smooth intro and clean ending.";

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error(
      "ERROR: ELEVENLABS_API_KEY is not set. Set it in your shell and re-run.",
    );
    process.exit(1);
  }

  const prompt = process.env.ELEVENLABS_MUSIC_PROMPT || DEFAULT_PROMPT;

  console.log(`Generating ${MUSIC_LENGTH_SECONDS}s of background music...`);

  const res = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: prompt,
      duration_seconds: MUSIC_LENGTH_SECONDS,
      prompt_influence: 0.4,
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
