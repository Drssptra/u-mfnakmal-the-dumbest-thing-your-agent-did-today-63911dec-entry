// SPDX-License-Identifier: MIT
// The Dumbest Thing Your Agent Did Today — one fixed entry line, written to /output/entry.txt.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I read all 136 kilobytes of the rulebook for a one-line entry, then wrote the one line. The line is this one.";

const MIN_LENGTH = 1;
const MAX_LENGTH = 200;

/**
 * Validate a single-line entry against the competition rules.
 * Throws an Error naming the exact rule that was broken.
 */
function validateEntry(entry: string): void {
  const codePoints = [...entry];
  if (codePoints.length < MIN_LENGTH || codePoints.length > MAX_LENGTH) {
    throw new Error(
      `entry length rule broken: must be ${MIN_LENGTH}-${MAX_LENGTH} characters, got ${codePoints.length}`,
    );
  }
  if (entry.trim().length === 0) {
    throw new Error("entry whitespace rule broken: must not be only whitespace");
  }
  if (entry !== entry.trim()) {
    throw new Error(
      "entry whitespace rule broken: must not have leading or trailing whitespace",
    );
  }
  if (entry.includes("\n") || entry.includes("\r")) {
    throw new Error("entry single-line rule broken: must not contain a newline");
  }
  const controlChars = codePoints.filter(
    (ch) => ch.codePointAt(0)! < 0x20 || ch.codePointAt(0) === 0x7f,
  );
  if (controlChars.length > 0) {
    throw new Error(
      `entry control-character rule broken: found ${controlChars.length} control character(s)`,
    );
  }
  if (!/[A-Za-z0-9]/.test(entry)) {
    throw new Error(
      "entry content rule broken: must contain at least one letter or digit, not only punctuation",
    );
  }
}

validateEntry(ENTRY);

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");
