#!/usr/bin/env node
/**
 * Absorbs 20 independent TOEFL speaking prompts from
 * F:\StudyTools\toefl\src\data\speaking.json into VoxPilot's
 * pytoefl-interview-bank.js as additional practice items.
 *
 * Run from VoxPilot-Speaking-Lab root.
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const SRC   = "F:/StudyTools/toefl/src/data/speaking.json";
const BANK  = join(__dir, "..", "data", "pytoefl-interview-bank.js");

// Read source
const src = JSON.parse(readFileSync(SRC, "utf8"));

// Read existing bank JS (extract the array literal)
const raw = readFileSync(BANK, "utf8");
const arrayStart = raw.indexOf("[");
const arrayEnd   = raw.lastIndexOf("]") + 1;
const existing   = eval(raw.slice(arrayStart, arrayEnd)); // safe for local data

// Find highest existing id number
const lastId = Math.max(
  ...existing.map((q) => parseInt(q.id.replace(/[^0-9]/g, ""), 10) || 0)
);

const existingTexts = new Set(existing.map((q) => q.text.toLowerCase().slice(0, 60)));
let nextNum = lastId + 1;
const newItems = [];

for (const q of src) {
  const key = q.prompt.toLowerCase().slice(0, 60);
  if (existingTexts.has(key)) continue;
  existingTexts.add(key);
  newItems.push({
    id:         `pt-${String(nextNum).padStart(3, "0")}`,
    type:       "interview",
    category:   "Independent",
    difficulty: "Medium",
    text:       q.prompt,
    sample:     `Model: State your preference in the first sentence, give 2 reasons with "because", one specific example, and wrap up with a result sentence. Aim for 45 seconds.`,
  });
  nextNum++;
}

if (newItems.length === 0) {
  console.log("No new prompts to add.");
  process.exit(0);
}

const merged = [...existing, ...newItems];
const newContent =
  `// Additional Independent Speaking prompts adapted from the pytoefl prompt list.\n` +
  `// Appended to the main interview bank so every consumer sees one combined list.\n` +
  `const PYTOEFL_INTERVIEW_QUESTIONS = ${JSON.stringify(merged, null, 2)};\n\n` +
  `if (typeof module !== "undefined") module.exports = { PYTOEFL_INTERVIEW_QUESTIONS };\n`;

writeFileSync(BANK, newContent);
console.log(`pytoefl-interview-bank.js: +${newItems.length} → ${merged.length} total`);
