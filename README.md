# VoxPilot TOEFL 2026 Study Suite

A local-first, zero-login study suite built for the TOEFL iBT 2026 format across all four sections: Speaking, Reading, Writing, and Listening. Progress, SRS decks, pronunciation notebooks, and optional BYOK API settings stay in your browser.

> Note: This project is not affiliated with ETS. It is an independent personal study application.

## Features

- **Exam Task Targets & Focus Study Tools**:
  - Every Reading, Listening, Speaking, Writing, Vocab, and Course screen clearly displays which TOEFL iBT 2026 exam task it targets.
  - Built-in **Study Timer** in the header (Pomodoro `25/5`, `50/10`, `15/3`, TOEFL sprint timers `7m/10m/18m/25m`, stopwatch, daily focus goal, and streak tracker).
- **Guided Courses & Interactive Lessons (`Courses` tab)**:
  - **11 structured lessons** across 5 tracks (Reading, Listening, Speaking, Writing, Grammar & Strategy) with key rules, worked examples, 22 interactive quick-check quiz items, progress tracking, and one-click jumps directly into matching practice sessions.
- **Full 4-Section TOEFL 2026 Practice Tests (`Full Mock` tab)**:
  - **Practice Test 1 (Official 2026 Format)** plus **Practice Tests 2-3** and a **Random Full Test** generator covering Reading (Part 1 & Part 2), Listening (Part 1 & Part 2 with spoken audio playback), Writing (10 Build-a-Sentence + Email + Academic Discussion), and Speaking (7 Listen & Repeat + 4 Interview turns) with a unified 1.0-6.0 Band score report and answer review.
- **Speaking Studio (2026 Format)**:
  - **320 Listen and Repeat** prompts plus **49 four-turn Interview sets** with model answers.
  - **Start Easy** 4-step local scaffold, **Adaptive Ladder** diagnostic and daily plan, **11-item Full Sim** (7 Listen & Repeat + 1 four-turn Interview), **Coach Capsule** retake loop, and **Pronunciation Error Log**.
  - **Exam-Room Babble Noise Mixer** (`assets/audio/babble_speaking.mp3`) with live volume control to simulate real test-center background noise.
- **Reading 2026 Lab**:
  - **115 Complete the Words** interactive cloze passages across 15 ETS topics with deterministic blank generation, Enter/Space blank navigation, and accuracy tracking.
  - **53 Daily Life & Academic Reading MCQ passage sets** with instant answer explanations.
- **Writing 2026 Lab**:
  - **95 Build a Sentence** interactive word-tile grammar drills.
  - **54 Write an Email** scenarios (7-minute timer, live 90-130 word progress meter, offline self-revision checklist, model emails, BYOK AI grader).
  - **63 Academic Discussion** prompts (10-minute timer, live 100-140 word progress meter, offline self-revision checklist, Band 5-6 model responses, BYOK AI grader).
  - Official **ETS RR-106 Writing Scoring Guide** and phrase sheets.
- **Listening & Dictation Lab**:
  - **24 standalone TOEFL 2026 Listening exercises** across all 4 tasks (Choose a Response, Campus Conversations, Announcements, Academic Talks) with offline audio & transcripts, plus **24 real MP3 micro-quizzes** with playback speed controls (`0.8x` to `1.25x`), A-B loop playback for shadowing, and dictation note pad.
- **Vocab SRS & Topic Idea Bank**:
  - **1,937 vocabulary, Academic Word List (AWL), and Complete-the-Words collocation cards** with keyboard shortcuts (`Space`, `1`-`4`) and local mastery tracking.
  - **6 curated Topic Idea Banks** with high-yield reasons, academic collocations, and 45-second interview angles.
- **Band & Plans Hub**:
  - **1-6 Band / Classic 0-120 / CEFR Converter**, **B1 / B2 / C1 daily study roadmaps**, and one-click copy **2026 AI Diagnostic Prompts**.
- **Modern Academic Language Studio UI**:
  - Grouped three-section navigation with collapsible mobile menu, WCAG AA verified Light and Dark themes, keyboard focus indicators, and local JSON export/import.

## Run Locally

Double-click **`TOEFL-Study-Suite.exe`** in the project root to start the local server automatically and open the app in your default browser (close the launcher window to stop the server cleanly).

Or run from a terminal:

```bash
npm start
```

Open **http://localhost:5173** (falls back to 5174 if busy).

## Verification & Static Build

```bash
npm test
npm run build
```

`npm run build` outputs the deployable static site (including `modules/` and `assets/`) to `dist/`.

## Project Structure

```text
toefl-study-suite/
  app.js                      Core VoxPilot Speaking Lab & navigation shell
  modules/toefl-suite-modules.js  TOEFL 2026 Reading, Writing, Listening, Vocab, Band & Theme modules
  data/                       Speaking, interview, and TOEFL 2026 suite data banks
  assets/audio/               Babble background track + 24 Listening MP3 clips
  logic/scoring-engine.js     Local 1-6 scoring & audio/pronunciation diagnostics
  styles.css                  Light & Dark WCAG AA design tokens and responsive layout
  DESIGN.md                   Design system & accessibility specification
  scripts/                    Smoke tests, static build, and curated ingestion script
```

## License

MIT
