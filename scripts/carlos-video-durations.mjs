// Prints the rendered duration of each Carlos video from the generated timings.
import { readFileSync } from "node:fs";

const source = readFileSync("remotion/carlos/audio-timings.ts", "utf8");
const entries = [...source.matchAll(/"([^"]+)":\s*([\d.]+)/g)];
const PAD = 0.7;

for (const prefix of ["d1", "d2", "d3"]) {
  const scenes = entries.filter((entry) => entry[1].startsWith(prefix));
  const seconds = scenes.reduce((total, entry) => total + Number(entry[2]) + PAD, 0);
  console.log(`${prefix}: ${scenes.length} scenes, ${seconds.toFixed(1)}s (${Math.round(seconds * 30)} frames)`);
}
