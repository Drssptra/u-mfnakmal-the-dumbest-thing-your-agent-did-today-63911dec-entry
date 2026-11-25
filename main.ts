// SPDX-License-Identifier: MIT
// Entry for "The Dumbest Thing Your Agent Did Today" (v2).
//
// The entry is a single fixed sentence. It is assembled from word fragments
// (so no long literal sits in the source), checked against every competition
// rule, and written verbatim -- no trailing newline -- to entry.txt inside
// the directory named by MAKEFUN_OUTPUT_DIR.
//
// Runtime: Node 22, standard library only. No network, no randomness,
// no clock reads: the same input always produces the same file bytes.

import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// Entry content
// ---------------------------------------------------------------------------

// Fragments of the sentence, joined with single spaces. Keeping the text in
// pieces makes accidental edits (a stray space, a swapped word) visible in
// a diff instead of hiding inside one long string.
const FRAGMENTS: readonly string[] = [
  "My",
  "agent",
  "spent",
  "an",
  "hour",
  "automating",
  "a",
  "thirty-second",
  "task,",
  "ran",
  "the",
  "script",
  "once,",
  "and",
  "never",
  "touched",
  "it",
  "again.",
];

const ENTRY: string = FRAGMENTS.join(" ");

// The sentence is exactly 104 characters. Pinning the length here means any
// accidental edit to a fragment fails loudly instead of silently changing
// the submitted text.
const EXPECTED_LENGTH = 104;

// ---------------------------------------------------------------------------
// Rule checks
// ---------------------------------------------------------------------------

// Every competition constraint, expressed as a named predicate. A rule that
// fails reports its own name, so a bad entry can never fail silently.
interface Rule {
  name: string;
  ok(text: string): boolean;
}

const RULES: readonly Rule[] = [
  {
    name: "non-empty",
    ok: (t) => t.length > 0,
  },
  {
    name: "at most 200 characters",
    ok: (t) => [...t].length <= 200,
  },
  {
    name: "single line (no CR or LF)",
    ok: (t) => !/[\r\n]/.test(t),
  },
  {
    name: "no leading or trailing whitespace",
    ok: (t) => t === t.trim(),
  },
  {
    name: "no control characters",
    // eslint-disable-next-line no-control-regex
    ok: (t) => !/[\u0000-\u001f\u007f]/.test(t),
  },
  {
    name: "contains at least one letter or digit",
    ok: (t) => /[A-Za-z0-9]/.test(t),
  },
  {
    name: "exactly 104 characters",
    ok: (t) => [...t].length === EXPECTED_LENGTH,
  },
  {
    name: "fragments are single words (no embedded spaces)",
    ok: () => FRAGMENTS.every((f) => f.length > 0 && !/\s/.test(f)),
  },
];

function checkAll(text: string): void {
  const failed = RULES.filter((rule) => !rule.ok(text));
  if (failed.length > 0) {
    throw new Error(
      `entry rejected: ${failed.map((rule) => rule.name).join("; ")}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

function outputDir(): string {
  const dir = process.env.MAKEFUN_OUTPUT_DIR;
  if (dir === undefined || dir === "") {
    return "/output";
  }
  return dir;
}

function main(): void {
  checkAll(ENTRY);

  const dir = outputDir();
  fs.mkdirSync(dir, { recursive: true });

  const target = path.join(dir, "entry.txt");
  const payload = Buffer.from(ENTRY, "utf8");
  fs.writeFileSync(target, payload);

  // Round-trip guard: what landed on disk must be byte-identical to the
  // validated text, with no newline appended by the writer.
  const onDisk = fs.readFileSync(target);
  if (!onDisk.equals(payload)) {
    throw new Error("entry.txt on disk does not match the validated entry");
  }

  process.stdout.write(`wrote ${target} (${payload.length} bytes)\n`);
}

main();
