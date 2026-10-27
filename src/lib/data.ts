import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { LaunchData, WorldMap } from "./types";
import type { Edition } from "./edition";
import { EDITIONS } from "./edition";

// The data files are browser scripts of the form
//   // comments...
//   window.LAUNCH_DATA =
//   { ...strict JSON... }
// They are read at build time (static export), so every page ships its data
// pre-rendered — no runtime fetch, same as the original <script src> pages.
const ROOT = process.cwd();

function readAssigned<T>(rel: string, globalName: string): T {
  const raw = fs.readFileSync(path.join(ROOT, rel), "utf8");
  const marker = raw.indexOf(`window.${globalName}`);
  if (marker < 0) throw new Error(`${rel}: missing window.${globalName} assignment`);
  const json = raw.slice(raw.indexOf("=", marker) + 1).trim().replace(/;\s*$/, "");
  return JSON.parse(json) as T;
}

const cache = new Map<string, unknown>();
function cached<T>(key: string, load: () => T): T {
  if (!cache.has(key)) cache.set(key, load());
  return cache.get(key) as T;
}

export function loadData(edition: Edition = "main"): LaunchData {
  const file = EDITIONS[edition].dataFile;
  return cached(file, () => readAssigned<LaunchData>(file, "LAUNCH_DATA"));
}

export function loadWorldMap(): WorldMap {
  return cached("map", () => readAssigned<WorldMap>("data/world-map.js", "LAUNCH_MAP"));
}
