// SPDX-License-Identifier: MIT
// The Dumbest Thing Your Agent Did Today — one fixed entry line, written to /output/entry.txt.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I read all 136 kilobytes of the rulebook for a one-line entry, then wrote the one line. The line is this one.";

const codePoints = [...ENTRY];
if (codePoints.length < 1 || codePoints.length > 200) {
  throw new Error(
    `entry must be 1-200 characters, got ${codePoints.length}`,
  );
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry must not be only whitespace");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");
