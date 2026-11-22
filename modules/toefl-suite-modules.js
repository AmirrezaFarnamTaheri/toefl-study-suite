// Modular TOEFL iBT 2026 Suite Extensions:
// - Light & Dark Studio Theme Manager (persisted in localStorage)
// - Exam-Room Babble Noise Mixer (babble_speaking.mp3)
// - Reading 2026: Complete the Words interactive cloze drill (115 passages, 15 topics) + 8 passage sets
// - Writing 2026: Build a Sentence + Write an Email (7m) + Academic Discussion (10m) + BYOK AI Diagnostic Grader
// - Listening 2026: Audio Micro-Quiz & Shadowing Player (24 MP3 clips with speed control, A-B loop & dictation)
// - Vocab & Ideas: SM-2 Spaced Repetition (1,448 words & CTW collocations, keyboard shortcuts) + Topics to write or talk about
// - Band & Plans: 1-6 <-> 0-120 <-> CEFR Score Converter + B1/B2/C1 Roadmaps + 2026 AI Prompts

(function initToeflSuiteModules(global) {
  const SUITE_VOCAB_KEY = "toefl-suite-vocab-srs-v1";
  const SUITE_CTW_STATS_KEY = "toefl-suite-ctw-stats-v1";
  const SUITE_THEME_KEY = "toefl-suite-theme-v1";

  function getBank() {
    if (typeof TOEFL_SUITE_BANK === "undefined") return null;
    if (!TOEFL_SUITE_BANK.__mergedMocks && typeof TOEFL_FULL_MOCKS !== "undefined") {
      TOEFL_SUITE_BANK.__mergedMocks = true;
      const seenRp = new Set((TOEFL_SUITE_BANK.reading.passages || []).map((p) => p.title));
      for (const p of TOEFL_FULL_MOCKS.extraReadingPassages || []) {
        if (!seenRp.has(p.title)) {
          TOEFL_SUITE_BANK.reading.passages.push(p);
          seenRp.add(p.title);
        }
      }
      const seenBas = new Set((TOEFL_SUITE_BANK.writing.buildASentence || []).map((b) => b.prompt));
      for (const b of TOEFL_FULL_MOCKS.extraBuildASentence || []) {
        if (!seenBas.has(b.prompt)) {
          TOEFL_SUITE_BANK.writing.buildASentence.push(b);
          seenBas.add(b.prompt);
        }
      }
    }
    if (!TOEFL_SUITE_BANK.__mergedExtra && typeof TOEFL_EXTRA_PRACTICE !== "undefined") {
      TOEFL_SUITE_BANK.__mergedExtra = true;
      const seenRp = new Set((TOEFL_SUITE_BANK.reading.passages || []).map((p) => p.title));
      for (const p of TOEFL_EXTRA_PRACTICE.readingPassages || []) {
        if (!seenRp.has(p.title)) {
          TOEFL_SUITE_BANK.reading.passages.push(p);
          seenRp.add(p.title);
        }
      }
      const seenBas = new Set((TOEFL_SUITE_BANK.writing.buildASentence || []).map((b) => b.prompt));
      for (const b of TOEFL_EXTRA_PRACTICE.buildASentence || []) {
        if (!seenBas.has(b.prompt)) {
          TOEFL_SUITE_BANK.writing.buildASentence.push(b);
          seenBas.add(b.prompt);
        }
      }
    }
    if (!TOEFL_SUITE_BANK.__mergedStudyTools && typeof TOEFL_STUDYTOOLS_ABSORBED !== "undefined") {
      TOEFL_SUITE_BANK.__mergedStudyTools = true;
      const seenRp = new Set((TOEFL_SUITE_BANK.reading.passages || []).map((p) => p.title));
      for (const p of TOEFL_STUDYTOOLS_ABSORBED.readingPassages || []) {
        if (!seenRp.has(p.title)) {
          TOEFL_SUITE_BANK.reading.passages.push(p);
          seenRp.add(p.title);
        }
      }
      const seenBas = new Set((TOEFL_SUITE_BANK.writing.buildASentence || []).map((b) => b.prompt));
      for (const b of TOEFL_STUDYTOOLS_ABSORBED.buildASentence || []) {
        if (!seenBas.has(b.prompt)) {
          TOEFL_SUITE_BANK.writing.buildASentence.push(b);
          seenBas.add(b.prompt);
        }
      }
      const seenEm = new Set((TOEFL_SUITE_BANK.writing.emails || []).map((e) => e.title));
      for (const e of TOEFL_STUDYTOOLS_ABSORBED.emails || []) {
        if (!seenEm.has(e.title)) {
          TOEFL_SUITE_BANK.writing.emails.push(e);
          seenEm.add(e.title);
        }
      }
      const seenDisc = new Set((TOEFL_SUITE_BANK.writing.discussions || []).map((d) => d.title));
      for (const d of TOEFL_STUDYTOOLS_ABSORBED.discussions || []) {
        if (!seenDisc.has(d.title)) {
          TOEFL_SUITE_BANK.writing.discussions.push(d);
          seenDisc.add(d.title);
        }
      }
      const seenVocab = new Set((TOEFL_SUITE_BANK.vocab || []).map((v) => String(v.word || "").toLowerCase()));
      for (const v of TOEFL_STUDYTOOLS_ABSORBED.vocab || []) {
        const wl = String(v.word || "").toLowerCase();
        if (wl && !seenVocab.has(wl)) {
          TOEFL_SUITE_BANK.vocab.push(v);
          seenVocab.add(wl);
        }
      }
    }
    return TOEFL_SUITE_BANK;
  }

  function esc(v) {
    return String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function loadJson(key, fallback) {
    try {
      const raw = global.localStorage && global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, val) {
    try {
      if (global.localStorage) global.localStorage.setItem(key, JSON.stringify(val));
    } catch {
      // ignore storage errors
    }
  }

  // ---------------- THEME MANAGER (Light / Dark) ----------------
  function detectInitialTheme() {
    try {
      const saved = global.localStorage && global.localStorage.getItem(SUITE_THEME_KEY);
      if (saved === "light" || saved === "dark") return saved;
      if (typeof global.matchMedia === "function" && global.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    } catch {
      // ignore
    }
    return "light";
  }

  function applyTheme(theme) {
    const next = theme === "dark" ? "dark" : "light";
    suiteState.theme = next;
    try {
      const doc = global.document;
      if (doc && doc.documentElement && typeof doc.documentElement.setAttribute === "function") {
        doc.documentElement.setAttribute("data-theme", next);
      }
      if (global.localStorage) global.localStorage.setItem(SUITE_THEME_KEY, next);
    } catch {
      // ignore in headless/VM contexts
    }
  }

  function toggleTheme() {
    applyTheme(suiteState.theme === "dark" ? "light" : "dark");
    if (typeof render === "function") render();
  }

  function renderThemeToggle() {
    const isDark = suiteState.theme === "dark";
    return `
      <button
        type="button"
        class="ghost-button theme-toggle-btn"
        data-suite-theme-toggle="true"
        aria-pressed="${isDark ? "true" : "false"}"
        aria-label="Switch to ${isDark ? "light" : "dark"} theme"
      >
        ${isDark ? "Light mode" : "Dark mode"}
      </button>
    `;
  }

  // Deterministic ETS-2026 Complete the Words generator:
  // Keeps sentence 1 intact, then blanks the second half of every 2nd qualifying word (len >= 4) up to 10 blanks.
  function buildCtwBlanks(text) {
    const marked = [...text.matchAll(/\{([A-Za-z]+)\|([A-Za-z]+)\}/g)];
    if (marked.length) {
      const blanks = [];
      const parts = [];
      let offset = 0;
      for (const [token, prefix, missing] of marked) {
        const start = text.indexOf(token, offset);
        const idx = blanks.length;
        const word = prefix + missing;
        parts.push({ type: "word", raw: text.slice(offset, start) });
        blanks.push({ idx, word, prefix, missing });
        parts.push({ type: "blank", idx, lead: "", prefix, missing, trail: "", word });
        offset = start + token.length;
      }
      parts.push({ type: "word", raw: text.slice(offset) });
      return { intro: "", parts, blanks };
    }
    const firstEnd = text.search(/[.!?]\s+/);
    const splitAt = firstEnd > 20 ? firstEnd + 2 : 0;
    const intro = splitAt ? text.slice(0, splitAt) : "";
    const rest = splitAt ? text.slice(splitAt) : text;
    const tokens = rest.split(/(\s+)/);
    const blanks = [];
    let eligibleSeen = 0;
    const parts = [];

    for (const tok of tokens) {
      if (/^\s+$/.test(tok)) {
        parts.push({ type: "space", raw: tok });
        continue;
      }
      const m = tok.match(/^([^A-Za-z]*)([A-Za-z]+)([^A-Za-z]*)$/);
      if (m && m[2].length >= 4 && blanks.length < 10) {
        eligibleSeen += 1;
        if (eligibleSeen % 2 === 0) {
          const word = m[2];
          const keepLen = Math.floor(word.length / 2);
          const prefix = word.slice(0, keepLen);
          const missing = word.slice(keepLen);
          const idx = blanks.length;
          blanks.push({ idx, word, prefix, missing });
          parts.push({ type: "blank", idx, lead: m[1], prefix, missing, trail: m[3], word });
          continue;
        }
      }
      parts.push({ type: "word", raw: tok });
    }
    return { intro, parts, blanks };
  }

  // Internal UI state for all 5 TOEFL 2026 modules + Theme + Babble Noise mixer
  const suiteState = {
    theme: "light",
    babblePlaying: false,
    babbleVolume: 0.3,
    babbleAudio: null,

    // Reading 2026 (Complete the Words + Daily Life & Academic Passages)
    readingMode: "ctw",
    readingCategory: "All",
    readingIndex: 0,
    ctwInputs: {},
    ctwChecked: false,
    ctwShowAnswers: false,
    ctwStats: loadJson(SUITE_CTW_STATS_KEY, { completed: 0, totalBlanks: 0, correctBlanks: 0 }),
    rpIndex: 0,
    rpAnswers: {},
    rpChecked: false,

    // Writing 2026
    writingMode: "sentence",
    basIndex: 0,
    basSlots: [],
    basChecked: false,
    emailIndex: 0,
    emailText: "",
    emailTimerSec: 420,
    emailTimerActive: false,
    emailShowModel: false,
    emailAiFeedback: "",
    emailAiLoading: false,
    discIndex: 0,
    discText: "",
    discTimerSec: 600,
    discTimerActive: false,
    discShowModel: false,
    discAiFeedback: "",
    discAiLoading: false,
    writingIntervalId: null,

    // Listening 2026
    listeningFilter: "All",
    listeningMode: "questions",
    listeningKind: "",
    listeningExercise: 0,
    listeningAnswers: {},
    listeningIndex: 0,
    listeningRate: 1.0,
    listeningNotes: "",
    loopA: null,
    loopB: null,

    // Vocab & Ideas
    vocabMode: "srs",
    vocabDeck: "All",
    vocabIndex: 0,
    vocabRevealed: false,
    vocabSrs: loadJson(SUITE_VOCAB_KEY, {}),

    // Band Converter
  };

  // Initialize theme once on load
  applyTheme(detectInitialTheme());

  function ensureBabbleAudio() {
    if (suiteState.babbleAudio) return suiteState.babbleAudio;
    if (typeof Audio === "undefined") return null;
    const bank = getBank();
    const src = (bank && bank.meta && bank.meta.babbleAudio) || "./assets/audio/babble_speaking.mp3";
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = suiteState.babbleVolume;
    suiteState.babbleAudio = audio;
    return audio;
  }

  function toggleBabbleNoise() {
    const audio = ensureBabbleAudio();
    if (!audio) return;
    if (suiteState.babblePlaying) {
      audio.pause();
      suiteState.babblePlaying = false;
    } else {
      audio.volume = suiteState.babbleVolume;
      audio.play().catch(() => {});
      suiteState.babblePlaying = true;
    }
    if (typeof render === "function") render();
  }

  function setBabbleVolume(val) {
    const v = Math.max(0, Math.min(1, Number(val) || 0));
    suiteState.babbleVolume = v;
    if (suiteState.babbleAudio) suiteState.babbleAudio.volume = v;
  }

  function renderBabblePill() {
    return `
      <div class="suite-babble-pill" title="Simulate noisy TOEFL test-center speaking room">
        <button class="ghost-button ${suiteState.babblePlaying ? "tool-button active" : ""}" data-suite-babble-toggle="true" type="button" aria-pressed="${suiteState.babblePlaying ? "true" : "false"}">
          ${suiteState.babblePlaying ? "Room noise on" : "Room noise"}
        </button>
        ${suiteState.babblePlaying ? `<input type="range" min="0" max="1" step="0.05" value="${suiteState.babbleVolume}" data-suite-babble-vol="true" aria-label="Exam room noise volume" class="suite-range" />` : ""}
      </div>
    `;
  }

  function countWords(text) {
    const trimmed = String(text || "").trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }

  function buildWordMeterHtml(wc, minTarget, maxTarget, idPrefix) {
    const pct = Math.min(100, Math.round((wc / maxTarget) * 100));
    const inRange = wc >= minTarget && wc <= maxTarget;
    const statusText =
      wc === 0
        ? `Target: ${minTarget}-${maxTarget} words`
        : wc < minTarget
        ? `${minTarget - wc} words below target (${minTarget}-${maxTarget})`
        : wc <= maxTarget
        ? `In target range (${minTarget}-${maxTarget} words)`
        : `${wc - maxTarget} words above target (${minTarget}-${maxTarget})`;
    return `
      <div class="suite-word-meter-wrap" id="${idPrefix}-wrap">
        <div class="suite-word-meter-head">
          <span class="stat-pill"><strong id="${idPrefix}-count">${wc}</strong> words</span>
          <span class="suite-word-status ${inRange ? "in-range" : ""}" id="${idPrefix}-status">${statusText}</span>
        </div>
        <div class="suite-word-meter" role="progressbar" aria-valuenow="${wc}" aria-valuemin="0" aria-valuemax="${maxTarget}" aria-label="Word count progress">
          <div class="suite-word-fill ${inRange ? "in-range" : ""}" id="${idPrefix}-fill" style="width:${pct}%"></div>
        </div>
      </div>
    `;
  }

  function updateWordMeterDom(doc, wc, minTarget, maxTarget, idPrefix) {
    const countEl = doc.querySelector(`#${idPrefix}-count`);
    const statusEl = doc.querySelector(`#${idPrefix}-status`);
    const fillEl = doc.querySelector(`#${idPrefix}-fill`);
    const pct = Math.min(100, Math.round((wc / maxTarget) * 100));
    const inRange = wc >= minTarget && wc <= maxTarget;
    if (countEl) countEl.textContent = String(wc);
    if (statusEl) {
      statusEl.textContent =
        wc === 0
          ? `Target: ${minTarget}-${maxTarget} words`
          : wc < minTarget
          ? `${minTarget - wc} words below target (${minTarget}-${maxTarget})`
          : wc <= maxTarget
          ? `In target range (${minTarget}-${maxTarget} words)`
          : `${wc - maxTarget} words above target (${minTarget}-${maxTarget})`;
      if (statusEl.classList) statusEl.classList.toggle("in-range", inRange);
    }
    if (fillEl) {
      fillEl.style.width = `${pct}%`;
      if (fillEl.classList) fillEl.classList.toggle("in-range", inRange);
    }
  }

  // ---------------- TAB 1: READING 2026 (Complete the Words + Passages) ----------------
  function getFilteredCtwPassages() {
    const bank = getBank();
    if (!bank) return [];
    const list = bank.reading.completeTheWords || [];
    if (suiteState.readingCategory === "All") return list;
    return list.filter((p) => p.category === suiteState.readingCategory);
  }

  function renderReadingTab() {
    const bank = getBank();
    if (!bank) return "<p>TOEFL Suite Bank not loaded.</p>";
    const cats = ["All", ...(bank.reading.categories || [])];
    const list = getFilteredCtwPassages();
    const safeIdx = list.length ? suiteState.readingIndex % list.length : 0;
    const passage = list[safeIdx];
    const built = passage ? buildCtwBlanks(passage.text) : null;

    let scoreBanner = "";
    if (built && suiteState.ctwChecked) {
      let ok = 0;
      built.blanks.forEach((b) => {
        const val = String(suiteState.ctwInputs[b.idx] || "").trim().toLowerCase();
        if (val === b.missing.toLowerCase()) ok += 1;
      });
      scoreBanner = `<div class="suite-banner ${ok >= 8 ? "ok" : "warn"}" aria-live="polite">Score: <strong>${ok} / ${built.blanks.length}</strong> (${Math.round((ok / Math.max(1, built.blanks.length)) * 100)}%)</div>`;
    }

    const accuracyPct = suiteState.ctwStats.totalBlanks
      ? Math.round((suiteState.ctwStats.correctBlanks / suiteState.ctwStats.totalBlanks) * 100)
      : 0;

    const passagesList = bank.reading.passages || [];
    const rpSafe = passagesList.length ? suiteState.rpIndex % passagesList.length : 0;
    const rpItem = passagesList[rpSafe];

    const rightPanel =
      suiteState.readingMode === "passages" && rpItem
        ? `
          <div class="exam-target-bar" aria-label="Exam task target">
            <span class="exam-target-tag">Exam target: TOEFL 2026 Reading - ${rpItem.kind === "Academic Passage" ? "Task 3: Read an Academic Passage" : "Task 2: Read in Daily Life"}</span>
            <p class="exam-target-detail">${rpItem.kind === "Academic Passage"
              ? "Short academic reading testing main idea, detail, inference, and vocabulary in context."
              : "Real-world notices, emails, schedules, and message threads testing dates, rules, and next actions."}</p>
          </div>
          <div class="practice-header">
            <div>
              <div class="badge-row">
                <span class="badge blue">${esc(rpItem.kind)}</span>
                <span class="badge">Set ${rpSafe + 1} / ${passagesList.length}</span>
              </div>
              <h2 class="question-text">${esc(rpItem.title)}</h2>
            </div>
            <div class="question-actions">
              <button type="button" class="ghost-button" data-suite-rp-prev="true">Prev</button>
              <button type="button" class="ghost-button" data-suite-rp-next="true">Next</button>
            </div>
          </div>
          <div class="suite-ctw-passage suite-passage-preline">${esc(rpItem.text)}</div>
          <div class="suite-stack-md">
            ${rpItem.questions.map((qq, qi) => {
              const picked = suiteState.rpAnswers[qi] || "";
              return `
                <div class="suite-idea-card">
                  <p class="suite-mcq-prompt">Q${qi + 1}. ${esc(qq.q)}</p>
                  <div class="suite-stack-sm">
                    ${qq.choices.map((ch) => {
                      const isPicked = picked === ch;
                      const isRight = suiteState.rpChecked && ch === qq.answer;
                      const isWrong = suiteState.rpChecked && isPicked && ch !== qq.answer;
                      const stateCls = isRight ? "correct" : isWrong ? "incorrect" : "";
                      return `
                        <button type="button" class="suite-clip-btn mcq-option ${isPicked ? "active" : ""} ${stateCls}" data-suite-rp-pick="${qi}::${esc(ch)}">
                          <span>${esc(ch)}</span>
                        </button>
                      `;
                    }).join("")}
                  </div>
                  ${suiteState.rpChecked ? `<p class="prompt-note"><strong>Explanation:</strong> ${esc(qq.explanation)}</p>` : ""}
                </div>
              `;
            }).join("")}
          </div>
          <div class="control-actions suite-mt">
            <button type="button" class="primary-button" data-suite-rp-check="true">Check Answers</button>
            <button type="button" class="tool-button" data-suite-rp-reset="true">Reset</button>
          </div>
        `
        : passage && built
        ? `
            <div class="exam-target-bar" aria-label="Exam task target">
              <span class="exam-target-tag">Exam target: TOEFL 2026 Reading - Task 1: Complete the Words</span>
              <p class="exam-target-detail">Multistage adaptive cloze task: read sentence 1 intact, then complete 10 half-blanked words using context and grammar endings.</p>
            </div>
            <div class="practice-header">
              <div>
                <div class="badge-row">
                  <span class="badge violet">${esc(passage.category)}</span>
                  <span class="badge">Passage ${safeIdx + 1} / ${list.length}</span>
                  <span class="badge blue">${built.blanks.length} Blanks</span>
                </div>
                <h2 class="question-text">${esc(passage.title)}</h2>
                <p class="prompt-note">Fill in the missing letters (one underline per missing letter, matching the official TOEFL 2026 interface). Press Enter or Space to jump to the next blank.</p>
              </div>
              <div class="question-actions">
                <button type="button" class="ghost-button" data-suite-ctw-prev="true">Prev</button>
                <button type="button" class="ghost-button" data-suite-ctw-next="true">Next</button>
                <button type="button" class="ghost-button" data-suite-ctw-rand="true">Random</button>
              </div>
            </div>
            ${scoreBanner}
            <div class="suite-ctw-passage">
              <span>${esc(built.intro)}</span>${built.parts.map((pt) => {
                if (pt.type === "space" || pt.type === "word") return esc(pt.raw);
                const val = suiteState.ctwInputs[pt.idx] || "";
                const isRight = suiteState.ctwChecked && val.trim().toLowerCase() === pt.missing.toLowerCase();
                const isWrong = suiteState.ctwChecked && !isRight;
                const cls = isRight ? "ctw-ok" : isWrong ? "ctw-bad" : "";
                const len = pt.missing.length;
                return `${esc(pt.lead)}<span class="ctw-token"><strong class="ctw-prefix">${esc(pt.prefix)}</strong><input class="ctw-input ${cls}" type="text" aria-label="Blank ${pt.idx + 1}: ${esc(pt.prefix)} plus ${len} missing ${len === 1 ? "letter" : "letters"}" data-suite-ctw-blank="${pt.idx}" data-ctw-len="${len}" value="${esc(val)}" maxlength="${len}" style="--ctw-slots:${len}" autocomplete="off" spellcheck="false" />${suiteState.ctwShowAnswers && !isRight ? `<em class="ctw-ans">(${esc(pt.missing)})</em>` : ""}</span>${esc(pt.trail)}`;
              }).join("")}
            </div>
            <div class="control-actions suite-mt">
              <button type="button" class="primary-button" data-suite-ctw-check="true">Check Answers</button>
              <button type="button" class="tool-button" data-suite-ctw-reveal="true">${suiteState.ctwShowAnswers ? "Hide Key" : "Reveal Key"}</button>
              <button type="button" class="tool-button" data-suite-ctw-reset="true">Reset</button>
            </div>
          `
        : "<p>No passages in this topic.</p>";

    return `
      <section class="suite-focus">
        <div class="suite-toolbar">
          <div class="suite-pill-tabs" role="tablist" aria-label="Reading mode">
            <button type="button" role="tab" aria-selected="${suiteState.readingMode === "ctw" ? "true" : "false"}" class="tool-button ${suiteState.readingMode === "ctw" ? "active" : ""}" data-suite-rmode="ctw">Complete the Words</button>
            <button type="button" role="tab" aria-selected="${suiteState.readingMode === "passages" ? "true" : "false"}" class="tool-button ${suiteState.readingMode === "passages" ? "active" : ""}" data-suite-rmode="passages">Passages (${passagesList.length})</button>
          </div>
          ${suiteState.readingMode === "ctw" ? `
            <div class="suite-toolbar-right">
              <label class="sr-only" for="ctwTopicSelect">Topic Filter</label>
              <select id="ctwTopicSelect" class="suite-select suite-select-compact" data-suite-ctw-cat="true" aria-label="Topic Filter">
                ${cats.map((c) => `<option value="${esc(c)}" ${suiteState.readingCategory === c ? "selected" : ""}>${esc(c)}</option>`).join("")}
              </select>
              ${suiteState.ctwStats.completed > 0 ? `<span class="suite-meta-inline">${suiteState.ctwStats.completed} done · ${accuracyPct}%</span>` : ""}
            </div>
          ` : ""}
        </div>
        <div class="practice-board">${rightPanel}</div>
      </section>
    `;
  }

  // ---------------- TAB 2: WRITING 2026 (Sentence / Email / Discussion / Rubric) ----------------
  function fmtSec(s) {
    const safe = Math.max(0, Number(s) || 0);
    return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
  }

  function renderWritingTab() {
    const bank = getBank();
    if (!bank) return "<p>TOEFL Suite Bank not loaded.</p>";
    const w = bank.writing;
    const mode = suiteState.writingMode;

    let bodyHtml = "";
    if (mode === "sentence") {
      const list = w.buildASentence || [];
      const item = list[suiteState.basIndex % list.length];
      const slotCount = item.answer.length;
      if (suiteState.basSlots.length !== slotCount) {
        suiteState.basSlots = new Array(slotCount).fill(null);
      }
      const usedSet = new Set(suiteState.basSlots.filter(Boolean));
      const allFilled = suiteState.basSlots.every(Boolean);
      const isCorrect =
        suiteState.basChecked &&
        item.answer.every((ans, i) => (suiteState.basSlots[i] || "").toLowerCase() === ans.toLowerCase());

      bodyHtml = `
        <div class="exam-target-bar" aria-label="Exam task target">
          <span class="exam-target-tag">Exam target: TOEFL 2026 Writing - Task 1: Build a Sentence</span>
          <p class="exam-target-detail">10 items on the real exam testing English word order, indirect questions, clause links, and agreement.</p>
        </div>
        <div class="practice-header">
          <div>
            <div class="badge-row">
              <span class="badge blue">Writing Task 1 · Build a Sentence</span>
              <span class="badge orange">Item ${(suiteState.basIndex % list.length) + 1} / ${list.length}</span>
            </div>
            <h2 class="question-text">"${esc(item.prompt)}"</h2>
            <p class="prompt-note">Select word tiles in grammatical order to complete the response. Click a filled slot to remove it.</p>
          </div>
          <div class="question-actions">
            <button type="button" class="ghost-button" data-suite-bas-prev="true">Prev</button>
            <button type="button" class="ghost-button" data-suite-bas-next="true">Next</button>
          </div>
        </div>

        <div class="suite-bas-sentence">
          ${item.layout.map((part) => {
            if (part.text !== undefined) return `<span class="bas-fixed">${esc(part.text)}</span>`;
            const val = suiteState.basSlots[part.slot];
            const okSlot = suiteState.basChecked && val && val.toLowerCase() === item.answer[part.slot].toLowerCase();
            const badSlot = suiteState.basChecked && !okSlot;
            return `<button type="button" class="bas-slot ${val ? "filled" : ""} ${okSlot ? "ok" : ""} ${badSlot ? "bad" : ""}" data-suite-bas-slot="${part.slot}" aria-label="Sentence slot ${part.slot + 1}: ${val ? esc(val) : "empty"}">${val ? esc(val) : "____"}</button>`;
          }).join(" ")}
        </div>

        <div class="suite-bas-bank" aria-label="Word choices">
          ${item.choices.map((ch) => `
            <button type="button" class="bas-chip ${usedSet.has(ch) ? "used" : ""}" data-suite-bas-chip="${esc(ch)}" ${usedSet.has(ch) ? "disabled" : ""}>${esc(ch)}</button>
          `).join("")}
        </div>

        ${suiteState.basChecked ? `
          <div class="suite-banner ${isCorrect ? "ok" : "warn"}" aria-live="polite">
            ${isCorrect ? "Exact match. Well done." : `Expected order: <strong>${esc(item.answer.join(" "))}</strong>`}
          </div>
        ` : ""}

        <div class="control-actions suite-mt">
          <button type="button" class="primary-button" data-suite-bas-check="true" ${allFilled ? "" : "disabled"}>Check Sentence</button>
          <button type="button" class="tool-button" data-suite-bas-clear="true">Clear Slots</button>
        </div>
      `;
    } else if (mode === "email") {
      const list = w.emails || [];
      const item = list[suiteState.emailIndex % list.length];
      const wc = countWords(suiteState.emailText);
      bodyHtml = `
        <div class="exam-target-bar" aria-label="Exam task target">
          <span class="exam-target-tag">Exam target: TOEFL 2026 Writing - Task 2: Write an Email (7 minutes)</span>
          <p class="exam-target-detail">Write a clear, polite 90-130 word email that completes all three prompt requests with time left to proofread.</p>
        </div>
        <div class="practice-header">
          <div>
            <div class="badge-row">
              <span class="badge blue">Writing Task 2 · Write an Email (7 Min)</span>
              <span class="badge">${(suiteState.emailIndex % list.length) + 1} / ${list.length}</span>
              <span data-writing-time="email" class="badge ${suiteState.emailTimerSec < 60 ? "orange" : "violet"}">Time: ${fmtSec(suiteState.emailTimerSec)}</span>
            </div>
            <h2 class="question-text">${esc(item.title)}</h2>
            <p class="prompt-note">${esc(item.scenario)}</p>
          </div>
          <div class="question-actions">
            <button type="button" class="ghost-button" data-suite-email-timer="true">${suiteState.emailTimerActive ? "Pause Timer" : "Start 7m Timer"}</button>
            <button type="button" class="ghost-button" data-suite-email-prev="true">Prev</button>
            <button type="button" class="ghost-button" data-suite-email-next="true">Next</button>
          </div>
        </div>
        <div class="transcript-area">
          <label for="suiteEmailEditor">Your Email Draft</label>
          <textarea id="suiteEmailEditor" class="suite-textarea" data-suite-email-input="true" rows="10" placeholder="Subject: ...&#10;&#10;Dear ...,&#10;&#10;Write your email here.">${esc(suiteState.emailText)}</textarea>
        </div>
        ${buildWordMeterHtml(wc, 90, 130, "suite-email-wc")}
        <details class="revision-checklist">
          <summary>Self-revision checklist (before you finish)</summary>
          <div class="revision-check-items">
            <label><input type="checkbox"><span>Opening clearly states why you are writing and matches the reader's tone.</span></label>
            <label><input type="checkbox"><span>Every required detail or request from the prompt is directly answered.</span></label>
            <label><input type="checkbox"><span>Checked verb tenses, articles (a/an/the), and clear sentence punctuation.</span></label>
          </div>
        </details>
        <details class="revision-checklist">
          <summary>Useful Email Phrases, Register &amp; Collocation Fixes</summary>
          <div class="coach-drawer-grid">
            <div class="coach-mini-card">
              <h4>Salutation &amp; Opening</h4>
              <ul>
                <li><strong>Formal:</strong> <em>Dear Professor [Last Name],</em> / <em>Dear Director,</em></li>
                <li><strong>Peer:</strong> <em>Hi [First Name],</em></li>
                <li><strong>Purpose:</strong> <em>I am writing regarding...</em> / <em>I am writing to follow up on...</em></li>
              </ul>
            </div>
            <div class="coach-mini-card">
              <h4>Polite Requests, Rescheduling &amp; Apologies</h4>
              <ul>
                <li><strong>Request:</strong> <em>Could you please let me know...?</em> / <em>I would be grateful if you could...</em></li>
                <li><strong>Reschedule:</strong> <em>I am afraid I cannot make Friday; would Tuesday work instead?</em></li>
                <li><strong>Apology &amp; Close:</strong> <em>I sincerely apologize for any inconvenience.</em> / <em>Best regards, [Name]</em></li>
              </ul>
            </div>
            <div class="coach-mini-card">
              <h4>ETS Collocation Upgrades</h4>
              <ul>
                <li>Write <strong>provide feedback</strong> (not <em>give a feedback</em>).</li>
                <li>Write <strong>suggest that you repair</strong> (not <em>suggest you to repair</em>).</li>
                <li>Write <strong>request an extension</strong> / <strong>arrange a repair</strong> / <strong>strike a balance</strong>.</li>
              </ul>
            </div>
          </div>
        </details>
        <div class="control-actions suite-mt">
          <button type="button" class="primary-button" data-suite-email-ai="true" ${suiteState.emailAiLoading ? "disabled" : ""}>${suiteState.emailAiLoading ? "Checking..." : "Get AI Feedback"}</button>
          <button type="button" class="tool-button" data-suite-copy-email-prompt="true">Copy Prompt for AI</button>
          <button type="button" class="tool-button" data-suite-email-model="true">${suiteState.emailShowModel ? "Hide Sample" : "Show Sample"}</button>
        </div>
        ${suiteState.emailAiFeedback ? `<pre class="suite-pre">${esc(suiteState.emailAiFeedback)}</pre>` : ""}
        ${suiteState.emailShowModel ? `<div class="suite-model-box"><strong>Example email</strong><pre class="suite-pre">${esc(item.modelEmail)}</pre></div>` : ""}
      `;
    } else if (mode === "discussion") {
      const list = w.discussions || [];
      const item = list[suiteState.discIndex % list.length];
      const wc = countWords(suiteState.discText);
      bodyHtml = `
        <div class="exam-target-bar" aria-label="Exam task target">
          <span class="exam-target-tag">Exam target: TOEFL 2026 Writing - Task 3: Write for an Academic Discussion (10 minutes)</span>
          <p class="exam-target-detail">Write 100-140 words engaging one classmate and adding your own fresh reason with a concrete example.</p>
        </div>
        <div class="practice-header">
          <div>
            <div class="badge-row">
              <span class="badge violet">Writing Task 3 · Academic Discussion (10 Min)</span>
              <span class="badge">${(suiteState.discIndex % list.length) + 1} / ${list.length}</span>
              <span data-writing-time="discussion" class="badge ${suiteState.discTimerSec < 90 ? "orange" : "blue"}">Time: ${fmtSec(suiteState.discTimerSec)}</span>
            </div>
            <h2 class="question-text">${esc(item.title)}</h2>
            <p class="prompt-note">${esc(item.professorPrompt)}</p>
          </div>
          <div class="question-actions">
            <button type="button" class="ghost-button" data-suite-disc-timer="true">${suiteState.discTimerActive ? "Pause Timer" : "Start 10m Timer"}</button>
            <button type="button" class="ghost-button" data-suite-disc-prev="true">Prev</button>
            <button type="button" class="ghost-button" data-suite-disc-next="true">Next</button>
          </div>
        </div>
        <div class="transcript-area">
          <label for="suiteDiscEditor">Your Academic Discussion Response</label>
          <textarea id="suiteDiscEditor" class="suite-textarea" data-suite-disc-input="true" rows="10" placeholder="State your position clearly, engage with a classmate's point, and develop one sharp reason with a concrete example (100-140 words)...">${esc(suiteState.discText)}</textarea>
        </div>
        ${buildWordMeterHtml(wc, 100, 140, "suite-disc-wc")}
        <details class="revision-checklist">
          <summary>Self-revision checklist (before you finish)</summary>
          <div class="revision-check-items">
            <label><input type="checkbox"><span>Sentence 1 states a clear position without copying the prompt verbatim.</span></label>
            <label><input type="checkbox"><span>Engages a classmate's point briefly and adds a new, concrete example.</span></label>
            <label><input type="checkbox"><span>Checked subject-verb agreement, comma splices, and clear transitions.</span></label>
          </div>
        </details>
        <details class="revision-checklist">
          <summary>Discussion Starters &amp; Adaptable Personal Example Bank</summary>
          <div class="coach-drawer-grid">
            <div class="coach-mini-card">
              <h4>Engage &amp; Build (No Circular Filler)</h4>
              <ul>
                <li><strong>Extend:</strong> <em>I strongly agree with [Name], and I would add that...</em></li>
                <li><strong>Concede + Pivot:</strong> <em>While [Name] raises a valid concern about..., it is easy to overlook...</em></li>
                <li><strong>Chain:</strong> Position -&gt; Causal Reason (how/why) -&gt; Concrete Example -&gt; Relevance.</li>
              </ul>
            </div>
            <div class="coach-mini-card">
              <h4>Concrete Personal Example Frames</h4>
              <ul>
                <li><strong>Tech / AI:</strong> Using an AI study helper during a project revealed gaps in my own reasoning rather than replacing thinking.</li>
                <li><strong>Remote Work / Study:</strong> A remote internship cut open-office distractions and produced sharper weekly reports.</li>
                <li><strong>Policy / Environment:</strong> A city plastic-bag rule initially felt inconvenient, yet pushed local shops into durable reusable packaging.</li>
                <li><strong>Education / Feedback:</strong> Written comments on a draft essay showed exactly where evidence was weak, unlike a bare letter grade.</li>
              </ul>
            </div>
          </div>
        </details>
        <div class="control-actions suite-mt">
          <button type="button" class="primary-button" data-suite-disc-ai="true" ${suiteState.discAiLoading ? "disabled" : ""}>${suiteState.discAiLoading ? "Checking..." : "Get AI Feedback"}</button>
          <button type="button" class="tool-button" data-suite-copy-disc-prompt="true">Copy Prompt for AI</button>
          <button type="button" class="tool-button" data-suite-disc-model="true">${suiteState.discShowModel ? "Hide Sample" : "Show Sample"}</button>
        </div>
        ${suiteState.discAiFeedback ? `<pre class="suite-pre">${esc(suiteState.discAiFeedback)}</pre>` : ""}
        ${suiteState.discShowModel ? `<div class="suite-model-box"><strong>Sample High-Scoring Response:</strong><p>${esc(item.modelResponse || "No sample response stored for this topic.")}</p></div>` : ""}
      `;
    } else {
      bodyHtml = `
        <h2>TOEFL 2026 Writing Scoring Guide &amp; Toolkit</h2>
        <p class="prompt-note">Based on the official ETS 2026 Technical Manual (RR-25-12): 20 raw points total = Build a Sentence (10 pts) + Write an Email (0-5 holistic) + Academic Discussion (0-5 holistic).</p>
        <div class="coach-drawer-grid suite-mt">
          <div class="coach-mini-card">
            <h4>Score 4 vs. Score 3 Decision Test</h4>
            <ul>
              <li><strong>Write an Email:</strong> Can the recipient easily understand the full situation, key details, and requested action with appropriate tone? Yes = 4-5; missing bullet, blunt tone, or unclear sentences = 3.</li>
              <li><strong>Academic Discussion:</strong> Is the position supported by a relevant, clearly explained reason/example that advances the thread? Yes = 4-5; circular repetition or weak support = 3.</li>
            </ul>
          </div>
          <div class="coach-mini-card">
            <h4>Local vs. Global Errors &amp; Myths</h4>
            <ul>
              <li><strong>Local (low impact):</strong> One minor typo or missing article in an otherwise clear sentence.</li>
              <li><strong>Global (high penalty):</strong> Skipping a required prompt point, wrong register for recipient, unclear logic, or comma-splice pileups.</li>
              <li><strong>No bonus for:</strong> Memorized scripts, forced C2 words that clash with syntax, or inflated repetitive word counts.</li>
            </ul>
          </div>
        </div>
        <div class="suite-stack-sm suite-mt">
          <details class="suite-details"><summary><strong>Full Writing Scoring Rubric Reference</strong></summary><pre class="suite-pre">${esc(w.scoringGuideMd)}</pre></details>
          <details class="suite-details"><summary><strong>Email Writing Guide &amp; Phrase Bank</strong></summary><pre class="suite-pre">${esc(w.emailGuideMd)}</pre></details>
          <details class="suite-details"><summary><strong>Academic Discussion Guide</strong></summary><pre class="suite-pre">${esc(w.discussionGuideMd)}</pre></details>
        </div>
      `;
    }

    return `
      <section class="suite-focus">
        <div class="suite-toolbar">
          <div class="suite-pill-tabs" role="tablist" aria-label="Writing tasks">
            <button type="button" role="tab" aria-selected="${mode === "sentence" ? "true" : "false"}" class="tool-button ${mode === "sentence" ? "active" : ""}" data-suite-wmode="sentence">Build a Sentence</button>
            <button type="button" role="tab" aria-selected="${mode === "email" ? "true" : "false"}" class="tool-button ${mode === "email" ? "active" : ""}" data-suite-wmode="email">Write an Email</button>
            <button type="button" role="tab" aria-selected="${mode === "discussion" ? "true" : "false"}" class="tool-button ${mode === "discussion" ? "active" : ""}" data-suite-wmode="discussion">Academic Discussion</button>
            <button type="button" role="tab" aria-selected="${mode === "rubric" ? "true" : "false"}" class="tool-button ${mode === "rubric" ? "active" : ""}" data-suite-wmode="rubric">Scoring Guide</button>
          </div>
        </div>
        <div class="practice-board">${bodyHtml}</div>
      </section>
    `;
  }

  // ---------------- TAB 3: LISTENING 2026 (24 MP3 Micro-Quizzes + Shadowing) ----------------
  function renderListeningTab() {
    return `
      <section class="suite-focus">
        <div class="control-actions" role="group" aria-label="Listening practice type">
          <button type="button" class="tool-button ${suiteState.listeningMode === "questions" ? "active" : ""}" aria-pressed="${suiteState.listeningMode === "questions"}" data-listening-mode="questions">Questions</button>
          <button type="button" class="tool-button ${suiteState.listeningMode === "clips" ? "active" : ""}" aria-pressed="${suiteState.listeningMode === "clips"}" data-listening-mode="clips">Audio and notes</button>
        </div>
        ${suiteState.listeningMode === "questions" ? renderListeningQuestions() : renderListeningClips()}
      </section>
    `;
  }

  function getListeningExercises() {
    const kind = suiteState.listeningKind;
    return TOEFL_LISTENING_PRACTICE.filter((item) => !kind || item.kind === kind);
  }

  function renderListeningQuestions() {
    const items = getListeningExercises();
    const item = items[suiteState.listeningExercise];
    const kinds = [...new Set(TOEFL_LISTENING_PRACTICE.map(({ kind }) => kind))];
    const answers = suiteState.listeningAnswers[item.id] || {};
    const taskMap = {
      "Choose a response": "Task 1: Listen and Choose a Response (short 1-turn everyday reply)",
      "Conversation": "Task 2: Listen to a Conversation (campus problem, condition & next step)",
      "Announcement": "Task 3: Listen to an Announcement (schedule change, rule & action required)",
      "Academic talk": "Task 4: Listen to an Academic Talk (main idea, contrast & purpose of examples)"
    };
    const taskTarget = taskMap[item.kind] || item.kind;
    return `
      <div class="practice-board suite-stack-md">
        <div class="exam-target-bar" aria-label="Exam task target">
          <span class="exam-target-tag">Exam target: TOEFL 2026 Listening - ${esc(taskTarget)}</span>
        </div>
        <div class="suite-toolbar">
          <div class="listening-filter">
            <label for="listening-task">Task type</label>
            <select class="suite-select" id="listening-task" data-listening-kind>
              <option value="">All task types</option>
              ${kinds.map((kind) => `<option value="${esc(kind)}" ${suiteState.listeningKind === kind ? "selected" : ""}>${esc(kind)}</option>`).join("")}
            </select>
          </div>
          <div class="question-actions">
            <button type="button" class="ghost-button" data-listening-move="-1" ${suiteState.listeningExercise === 0 ? "disabled" : ""}>Previous</button>
            <span class="suite-meta-inline">${suiteState.listeningExercise + 1} of ${items.length}</span>
            <button type="button" class="ghost-button" data-listening-move="1" ${suiteState.listeningExercise === items.length - 1 ? "disabled" : ""}>Next</button>
          </div>
        </div>
        <div>
          <h2 class="question-text" tabindex="-1" id="listening-exercise-title">${esc(item.title)}</h2>
          <p class="prompt-note">${esc(item.kind)} · Prerecorded device voices</p>
          <audio controls class="suite-audio-player" aria-label="Listening prompt" preload="metadata" src="./assets/audio/prompts/${esc(item.id)}.wav"></audio>
        </div>
        ${item.questions.map((question, index) => `
          <fieldset class="listening-question">
            <legend>${item.questions.length > 1 ? `${index + 1}. ` : ""}${esc(question.prompt)}</legend>
            <div class="suite-stack-sm">
              ${question.choices.map((choice, choiceIndex) => {
                const selected = answers[index] === choiceIndex;
                const outcome = selected ? (choiceIndex === question.answer ? "correct" : "incorrect") : "";
                return `<button type="button" class="suite-clip-btn mcq-option ${outcome}" aria-pressed="${selected}" data-listening-answer="${index}:${choiceIndex}">${esc(choice)}</button>`;
              }).join("")}
            </div>
            ${answers[index] !== undefined ? `
              <div class="suite-banner ${answers[index] === question.answer ? "ok" : "warn"}" id="listening-feedback-${index}" tabindex="-1">
                <strong>${answers[index] === question.answer ? "Correct." : `Answer: ${esc(question.choices[question.answer])}`}</strong>
                ${esc(question.reason)}
              </div>
            ` : ""}
          </fieldset>
        `).join("")}
        <details class="suite-details">
          <summary>Read transcript</summary>
          <p class="suite-passage-preline">${esc(item.script)}</p>
        </details>
      </div>
    `;
  }

  function bindListeningQuestions(doc) {
    const rerender = (selector) => {
      render();
      doc.querySelector(selector)?.focus();
    };
    doc.querySelectorAll("[data-listening-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        global.speechSynthesis?.cancel();
        suiteState.listeningMode = button.dataset.listeningMode;
        rerender(`[data-listening-mode="${suiteState.listeningMode}"]`);
      });
    });
    doc.querySelector("[data-listening-kind]")?.addEventListener("change", (event) => {
      global.speechSynthesis?.cancel();
      suiteState.listeningKind = event.target.value;
      suiteState.listeningExercise = 0;
      rerender("#listening-task");
    });
    doc.querySelectorAll("[data-listening-move]").forEach((button) => button.addEventListener("click", () => {
      global.speechSynthesis?.cancel();
      suiteState.listeningExercise += Number(button.dataset.listeningMove);
      rerender("#listening-exercise-title");
    }));
    doc.querySelectorAll("[data-listening-answer]").forEach((button) => button.addEventListener("click", () => {
      const item = getListeningExercises()[suiteState.listeningExercise];
      const [index, choice] = button.dataset.listeningAnswer.split(":").map(Number);
      suiteState.listeningAnswers[item.id] ??= {};
      suiteState.listeningAnswers[item.id][index] = choice;
      rerender(`#listening-feedback-${index}`);
    }));
  }

  function renderListeningClips() {
    const bank = getBank();
    if (!bank) return "<p>TOEFL Suite Bank not loaded.</p>";
    const allClips = bank.listening.clips || [];
    const cats = ["All", ...Array.from(new Set(allClips.map((c) => c.category)))];
    const clips = suiteState.listeningFilter === "All" ? allClips : allClips.filter((c) => c.category === suiteState.listeningFilter);
    const safeIdx = clips.length ? suiteState.listeningIndex % clips.length : 0;
    const clip = clips[safeIdx];
    const loopActive = suiteState.loopA !== null && suiteState.loopB !== null && suiteState.loopB > suiteState.loopA;

    return `
      <div class="suite-stack-sm">
        <div class="suite-toolbar">
          <div class="suite-toolbar-right">
            <label class="sr-only" for="listeningCategorySelect">Category</label>
            <select id="listeningCategorySelect" class="suite-select suite-select-compact" data-suite-list-cat="true" aria-label="Category">
              ${cats.map((c) => `<option value="${esc(c)}" ${suiteState.listeningFilter === c ? "selected" : ""}>${esc(c)}</option>`).join("")}
            </select>
            <label class="sr-only" for="listeningClipSelect">Audio Clip</label>
            <select id="listeningClipSelect" class="suite-select suite-select-compact" data-suite-list-select="true" aria-label="Audio Clip">
              ${clips.map((c, i) => `<option value="${i}" ${i === safeIdx ? "selected" : ""}>${i + 1}. ${esc(c.title)}</option>`).join("")}
            </select>
          </div>
          <div class="question-actions">
            <button type="button" class="ghost-button" data-suite-list-prev="true">Prev</button>
            <button type="button" class="ghost-button" data-suite-list-next="true">Next</button>
          </div>
        </div>
        <div class="practice-board">
          <div class="exam-target-bar" aria-label="Exam task target">
            <span class="exam-target-tag">Exam target: TOEFL 2026 Listening - Note-Taking &amp; Shadowing Drill</span>
            <p class="exam-target-detail">Trains real-time note-taking and connected-speech recognition for Campus Conversations and Academic Talks.</p>
          </div>
          ${clip ? `
            <div class="practice-header">
              <div>
                <div class="badge-row">
                  <span class="badge">${esc(clip.category)} · ${safeIdx + 1}/${clips.length}</span>
                  ${loopActive ? `<span class="badge green">Loop ${suiteState.loopA.toFixed(1)}s - ${suiteState.loopB.toFixed(1)}s</span>` : ""}
                </div>
                <h2 class="question-text">${esc(clip.title)}</h2>
                <p class="prompt-note">${esc(clip.prompt)}</p>
              </div>
            </div>
            <audio id="suiteListeningPlayer" controls src="${esc(clip.src)}" class="suite-audio-player"></audio>
            <div class="control-actions">
              ${[0.85, 1.0, 1.15, 1.25].map((r) => `
                <button type="button" class="tool-button ${suiteState.listeningRate === r ? "active" : ""}" data-suite-list-rate="${r}">${r}x</button>
              `).join("")}
              <button type="button" class="tool-button ${suiteState.loopA !== null ? "active" : ""}" data-suite-loop-a="true">Loop A${suiteState.loopA !== null ? ` (${suiteState.loopA.toFixed(1)}s)` : ""}</button>
              <button type="button" class="tool-button ${suiteState.loopB !== null ? "active" : ""}" data-suite-loop-b="true">Loop B${suiteState.loopB !== null ? ` (${suiteState.loopB.toFixed(1)}s)` : ""}</button>
              ${suiteState.loopA !== null || suiteState.loopB !== null ? `<button type="button" class="tool-button" data-suite-loop-clear="true">Clear Loop</button>` : ""}
            </div>
            <div class="transcript-area suite-mt">
              <label for="suiteListeningNotes">Listening Notes</label>
              <textarea id="suiteListeningNotes" class="suite-textarea" data-suite-list-notes="true" rows="6" placeholder="Note the main idea and two details. Then replay any part you missed.">${esc(suiteState.listeningNotes)}</textarea>
            </div>
          ` : "<p>No audio clips available.</p>"}
        </div>
      </div>
    `;
  }

  // ---------------- TAB 4: VOCAB SRS & TOPIC IDEA BANK ----------------
  function renderVocabTab() {
    const bank = getBank();
    if (!bank) return "<p>TOEFL Suite Bank not loaded.</p>";
    const allVocab = bank.vocab || [];
    const decks = ["All", ...Array.from(new Set(allVocab.map((v) => v.deck)))];
    const filtered = suiteState.vocabDeck === "All" ? allVocab : allVocab.filter((v) => v.deck === suiteState.vocabDeck);
    const safeIdx = filtered.length ? suiteState.vocabIndex % filtered.length : 0;
    const card = filtered[safeIdx];
    const masteredCount = Object.values(suiteState.vocabSrs).filter((s) => s.level >= 2).length;

    let mainHtml = "";
    if (suiteState.vocabMode === "srs" && card) {
      mainHtml = `
        <div class="practice-header">
          <div>
            <span class="suite-meta-inline">${esc(card.deck)} · ${safeIdx + 1} / ${filtered.length}</span>
            <h2 class="suite-flashcard-word">${esc(card.word)}</h2>
          </div>
          <div class="question-actions">
            <button type="button" class="ghost-button" data-suite-v-prev="true">Prev</button>
            <button type="button" class="ghost-button" data-suite-v-next="true">Next</button>
            <button type="button" class="ghost-button" data-suite-v-rand="true">Random</button>
          </div>
        </div>
        ${suiteState.vocabRevealed ? `
          <div class="suite-model-box">
            <p class="suite-meaning-text"><strong>Meaning:</strong> ${esc(card.meaning)}</p>
            ${card.example ? `<p class="suite-example-text">"${esc(card.example)}"</p>` : ""}
          </div>
          <div class="control-actions suite-mt">
            <button type="button" class="tool-button" data-suite-v-grade="0">1 · Again</button>
            <button type="button" class="tool-button" data-suite-v-grade="1">2 · Hard</button>
            <button type="button" class="primary-button" data-suite-v-grade="2">3 · Good</button>
            <button type="button" class="tool-button" data-suite-v-grade="3">4 · Easy</button>
          </div>
        ` : `
          <div class="suite-mt">
            <button type="button" class="primary-button" data-suite-v-reveal="true">Show Meaning (Space)</button>
          </div>
        `}
      `;
    } else {
      mainHtml = `
        <h2>Topics to write or talk about</h2>
        <div class="suite-ideas-grid">
          ${(bank.ideaBank || []).map((t) => `
            <article class="suite-idea-card">
              <h3>${esc(t.topic)}</h3>
              <ul>${t.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
              <p><strong>Useful Phrases:</strong> ${t.collocations.map((c) => `<span class="badge">${esc(c)}</span>`).join(" ")}</p>
              <p class="prompt-note"><strong>Angle:</strong> ${esc(t.sampleAngle)}</p>
            </article>
          `).join("")}
        </div>
      `;
    }

    return `
      <section class="suite-focus">
        <div class="suite-toolbar">
          <div class="suite-pill-tabs" role="tablist" aria-label="Vocab mode">
            <button type="button" role="tab" aria-selected="${suiteState.vocabMode === "srs" ? "true" : "false"}" class="tool-button ${suiteState.vocabMode === "srs" ? "active" : ""}" data-suite-vmode="srs">Flashcards (${allVocab.length})</button>
            <button type="button" role="tab" aria-selected="${suiteState.vocabMode === "ideas" ? "true" : "false"}" class="tool-button ${suiteState.vocabMode === "ideas" ? "active" : ""}" data-suite-vmode="ideas">Idea Bank</button>
          </div>
          ${suiteState.vocabMode === "srs" ? `
            <div class="suite-toolbar-right">
              <label class="sr-only" for="vocabDeckSelect">Deck</label>
              <select id="vocabDeckSelect" class="suite-select suite-select-compact" data-suite-v-deck="true" aria-label="Deck">
                ${decks.map((d) => `<option value="${esc(d)}" ${suiteState.vocabDeck === d ? "selected" : ""}>${esc(d)}</option>`).join("")}
              </select>
              <span class="suite-meta-inline">${masteredCount} mastered</span>
            </div>
          ` : ""}
        </div>
        <div class="practice-board">
          <div class="exam-target-bar" aria-label="Exam task target">
            <span class="exam-target-tag">${suiteState.vocabMode === "srs"
              ? "Exam target: TOEFL 2026 Reading (Complete the Words & Academic Passages) and Writing/Speaking word choice"
              : "Exam target: TOEFL 2026 Speaking (Take an Interview) and Writing (Academic Discussion) brainstorming"}</span>
          </div>
          ${mainHtml}
        </div>
      </section>
    `;
  }

  // ---------------- TAB 5: BAND CONVERTER, ROADMAPS & 2026 AI PROMPTS ----------------
  function renderGuidesTab() {
    return `
      <section class="suite-focus">
        <div class="practice-board suite-stack-lg">
          <div>
            <h2>Understand your scores</h2>
            <p>ETS reports each skill and the overall result on a 1 to 6 scale. Check the ETS comparison table for scores on the older scale.</p>
            <a class="ghost-button study-reference" href="https://www.ets.org/toefl/test-takers/ibt/scores/understand-scores.html" target="_blank" rel="noopener noreferrer">Compare score scales on ETS</a>
            <a class="ghost-button study-reference" href="https://www.ets.org/toefl/test-takers/ibt/about/content.html" target="_blank" rel="noopener noreferrer">See test tasks and timing on ETS</a>
          </div>
          <div>
            <h2>Choose what to practice</h2>
            <dl class="study-plan-list">
              <dt>Build the basics</dt>
              <dd>Complete one reading passage. Review the spelling or word ending behind each miss, then try two listening prompts and check the transcript.</dd>
              <dt>Practice under time</dt>
              <dd>Write one timed email. Check that you addressed every request, then revise the sentence that was hardest to read. Record one interview answer and listen back for your main point and example.</dd>
              <dt>Review a practice test</dt>
              <dd>Choose two recurring mistakes from the results. Practice those skills on fresh prompts before you take another timed set.</dd>
            </dl>
          </div>
          <div>
            <h2>Speaking &amp; Writing 2026 Quick Reference</h2>
            <div class="coach-drawer-grid">
              <div class="coach-mini-card">
                <h4>Speaking Task 1: Listen &amp; Repeat (7 items)</h4>
                <ul>
                  <li>Chunk long sentences into 2-3 meaning phrases; start immediately after the beep.</li>
                  <li>Protect exact function words and <code>-s</code>/<code>-ed</code> endings to move from Score 4 to Score 5.</li>
                  <li>Overtrain with 1.1x-1.3x playback and enable mild room babble noise during drills.</li>
                </ul>
              </div>
              <div class="coach-mini-card">
                <h4>Speaking Task 2: Take an Interview (4 x 45s, 0s prep)</h4>
                <ul>
                  <li>Use <strong>STAR</strong> (Situation, Task, Action, Result) on personal/factual turns and <strong>PREP</strong> (Point, Reason, Example, Point) on opinion turns.</li>
                  <li>Begin wrapping up at 40-42s; if you slip, fix once calmly without apologizing.</li>
                </ul>
              </div>
              <div class="coach-mini-card">
                <h4>Writing Tasks 1-3 (23 min total, 20 raw pts)</h4>
                <ul>
                  <li><strong>Build a Sentence (10 pts):</strong> Lock Subject + Verb first; keep statement order inside embedded questions (<em>where she lives</em>).</li>
                  <li><strong>Email (7m, 90-130w):</strong> Hit all 3 prompt points with recipient-appropriate politeness and natural collocations.</li>
                  <li><strong>Discussion (10m, 100-140w):</strong> Engage briefly, avoid circular restatement, and anchor with one concrete example.</li>
                </ul>
              </div>
            </div>
          </div>
          <details class="suite-details">
            <summary>Optional AI diagnostic feedback prompts (Writing &amp; Speaking)</summary>
            <p>Copy a rubric-aligned diagnostic prompt to paste into your preferred AI tool along with your draft, transcript, or audio.</p>
            <div class="control-actions">
              <button type="button" class="tool-button" data-suite-copy-prompt="writeAnEmail">Copy Email prompt</button>
              <button type="button" class="tool-button" data-suite-copy-prompt="academicDiscussion">Copy Discussion prompt</button>
              <button type="button" class="tool-button" data-suite-copy-prompt="listenAndRepeat">Copy Listen &amp; Repeat prompt</button>
              <button type="button" class="tool-button" data-suite-copy-prompt="takeAnInterview">Copy Interview prompt</button>
            </div>
          </details>
        </div>
      </section>
    `;
  }

  const WRITING_FEEDBACK_PROMPTS = {
    writeAnEmail: "Evaluate this TOEFL 2026 Write an Email response on the official 0-5 ETS holistic scale (Content & task completion of all 3 requests, Syntactic/Lexical variety & collocations, Social Conventions/register politeness, and Local vs. Global errors). Quote one effective sentence and two concrete line-level rewrites.",
    academicDiscussion: "Evaluate this TOEFL 2026 Academic Discussion post on the official 0-5 ETS holistic scale (Relevant original contribution, Position -> Reason -> Concrete Example elaboration, Syntactic/Lexical variety, and Local vs. Global errors). Flag any circular filler and provide two concrete sentence upgrades.",
    listenAndRepeat: "Evaluate this TOEFL 2026 Listen and Repeat attempt against the original prompt on the official 0-5 rubric (Repeat Accuracy: exact words & -s/-ed forms, Fluency, and Intelligibility). List exact dropped, added, or substituted words and give 2 targeted drill sentences.",
    takeAnInterview: "Evaluate this 45-second TOEFL 2026 Take an Interview response on the official 0-5 rubric (Content & Relevance, STAR/PREP Organization, Delivery/Fluency, and Language Use). Point out fillers or vague claims and give 2 sharper, natural spoken upgrades."
  };

  async function copyWritingFeedback(prompt) {
    try {
      await global.navigator.clipboard.writeText(prompt);
      showToast("Feedback prompt copied.");
    } catch {
      showToast("Could not copy the feedback prompt.");
    }
  }

  async function gradeWritingWithSetupAi(kind) {
    const bank = getBank();
    if (!bank) return;
    const setup = typeof state !== "undefined" && state.setup ? state.setup.ai : null;
    if (!setup?.apiKey || !setup.enabled) {
      if (typeof showToast === "function") showToast("Enable AI feedback and add a key in Settings, or copy the feedback prompt.");
      return;
    }
    const isEmail = kind === "email";
    const feedbackPrompt = WRITING_FEEDBACK_PROMPTS[isEmail ? "writeAnEmail" : "academicDiscussion"];
    const taskObj = isEmail
      ? bank.writing.emails[suiteState.emailIndex % bank.writing.emails.length]
      : bank.writing.discussions[suiteState.discIndex % bank.writing.discussions.length];
    const textKey = isEmail ? "emailText" : "discText";
    const indexKey = isEmail ? "emailIndex" : "discIndex";
    const requestIndex = suiteState[indexKey];
    const studentText = suiteState[textKey];
    const currentDraft = () => suiteState[indexKey] === requestIndex && suiteState[textKey] === studentText;
    if (!studentText.trim()) {
      if (typeof showToast === "function") showToast("Write your response first before grading.");
      return;
    }

    if (isEmail) { suiteState.emailAiLoading = true; suiteState.emailAiFeedback = ""; }
    else { suiteState.discAiLoading = true; suiteState.discAiFeedback = ""; }
    if (typeof render === "function") render();

    try {
      const userPrompt = `TASK:\n${isEmail ? taskObj.scenario : taskObj.professorPrompt}\n\nSTUDENT RESPONSE:\n${studentText}`;
      const body = setup.mode === "chat"
        ? { model: setup.model, messages: [{ role: "system", content: feedbackPrompt }, { role: "user", content: userPrompt }] }
        : { model: setup.model, instructions: feedbackPrompt, input: userPrompt };
      const response = await fetch(setup.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${setup.apiKey}` },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}.`);
      const feedback = extractAiText(await response.json());
      if (!feedback?.trim()) throw new Error("The provider returned no feedback.");
      if (currentDraft()) {
        if (isEmail) suiteState.emailAiFeedback = feedback;
        else suiteState.discAiFeedback = feedback;
      }
    } catch (error) {
      if (currentDraft()) {
        const message = `Could not get feedback. ${error.message} You can still copy your draft and feedback prompt.`;
        if (isEmail) suiteState.emailAiFeedback = message;
        else suiteState.discAiFeedback = message;
      }
    } finally {
      if (isEmail) suiteState.emailAiLoading = false;
      else suiteState.discAiLoading = false;
      if (typeof render === "function") render();
    }
  }

  function startStopWritingTimer(kind) {
    if (suiteState.writingIntervalId) {
      clearInterval(suiteState.writingIntervalId);
      suiteState.writingIntervalId = null;
    }
    if (kind === "email") {
      if (suiteState.emailTimerSec === 0) suiteState.emailTimerSec = 420;
      suiteState.emailTimerActive = !suiteState.emailTimerActive;
      suiteState.discTimerActive = false;
    } else {
      if (suiteState.discTimerSec === 0) suiteState.discTimerSec = 600;
      suiteState.discTimerActive = !suiteState.discTimerActive;
      suiteState.emailTimerActive = false;
    }
    if (suiteState.emailTimerActive || suiteState.discTimerActive) {
      suiteState.writingIntervalId = setInterval(() => {
        if (suiteState.emailTimerActive && suiteState.emailTimerSec > 0) suiteState.emailTimerSec -= 1;
        if (suiteState.discTimerActive && suiteState.discTimerSec > 0) suiteState.discTimerSec -= 1;
        const isEmail = kind === "email";
        const seconds = isEmail ? suiteState.emailTimerSec : suiteState.discTimerSec;
        const timer = global.document?.querySelector(`[data-writing-time="${kind}"]`);
        if (timer) timer.textContent = `Time: ${fmtSec(seconds)}`;
        if (seconds === 0) {
          clearInterval(suiteState.writingIntervalId);
          suiteState.writingIntervalId = null;
          suiteState.emailTimerActive = false;
          suiteState.discTimerActive = false;
          const button = global.document?.querySelector(isEmail ? "[data-suite-email-timer]" : "[data-suite-disc-timer]");
          if (button) button.textContent = isEmail ? "Restart 7m timer" : "Restart 10m timer";
        }
      }, 1000);
    }
    if (typeof render === "function") render();
  }

  function gradeVocabCard(level) {
    const bank = getBank();
    if (!bank) return;
    const filtered = suiteState.vocabDeck === "All" ? bank.vocab : bank.vocab.filter((v) => v.deck === suiteState.vocabDeck);
    const card = filtered[suiteState.vocabIndex % Math.max(1, filtered.length)];
    if (card) {
      suiteState.vocabSrs[card.id] = { level: Number(level), updatedAt: Date.now() };
      saveJson(SUITE_VOCAB_KEY, suiteState.vocabSrs);
    }
    suiteState.vocabIndex += 1;
    suiteState.vocabRevealed = false;
    if (typeof render === "function") render();
  }

  // Bind single global keyboard listener for Vocab SRS shortcuts (Space, 1-4)
  let vocabKeyBound = false;
  function ensureGlobalKeyboardShortcuts() {
    if (vocabKeyBound || typeof global.addEventListener !== "function") return;
    vocabKeyBound = true;
    global.addEventListener("keydown", (e) => {
      if (typeof state === "undefined" || state.tab !== "vocab" || suiteState.vocabMode !== "srs") return;
      const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.code === "Space" && !suiteState.vocabRevealed) {
        e.preventDefault();
        suiteState.vocabRevealed = true;
        if (typeof render === "function") render();
      } else if (suiteState.vocabRevealed && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        gradeVocabCard(Number(e.key) - 1);
      }
    });
  }

  function bindEvents() {
    const doc = global.document;
    if (!doc || !doc.querySelector) return;

    ensureGlobalKeyboardShortcuts();

    // Theme toggle
    const themeBtn = doc.querySelector("[data-suite-theme-toggle]");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

    // Babble noise mixer
    const babbleBtn = doc.querySelector("[data-suite-babble-toggle]");
    if (babbleBtn) babbleBtn.addEventListener("click", toggleBabbleNoise);
    const babbleVol = doc.querySelector("[data-suite-babble-vol]");
    if (babbleVol) babbleVol.addEventListener("input", (e) => setBabbleVolume(e.target.value));

    // Reading CTW + Daily Life / Academic Passages
    doc.querySelectorAll("[data-suite-rmode]").forEach((btn) => {
      btn.addEventListener("click", () => { suiteState.readingMode = btn.dataset.suiteRmode; render(); });
    });
    doc.querySelectorAll("[data-suite-rp-pick]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [qiStr, ch] = btn.dataset.suiteRpPick.split("::");
        suiteState.rpAnswers[Number(qiStr)] = ch;
        suiteState.rpChecked = false;
        render();
      });
    });
    const rpCheck = doc.querySelector("[data-suite-rp-check]");
    if (rpCheck) rpCheck.addEventListener("click", () => { suiteState.rpChecked = true; render(); });
    const rpReset = doc.querySelector("[data-suite-rp-reset]");
    if (rpReset) rpReset.addEventListener("click", () => { suiteState.rpAnswers = {}; suiteState.rpChecked = false; render(); });
    const rpPrev = doc.querySelector("[data-suite-rp-prev]");
    if (rpPrev) rpPrev.addEventListener("click", () => { const n = getBank().reading.passages.length; suiteState.rpIndex = (suiteState.rpIndex - 1 + n) % n; suiteState.rpAnswers = {}; suiteState.rpChecked = false; render(); });
    const rpNext = doc.querySelector("[data-suite-rp-next]");
    if (rpNext) rpNext.addEventListener("click", () => { const n = getBank().reading.passages.length; suiteState.rpIndex = (suiteState.rpIndex + 1) % n; suiteState.rpAnswers = {}; suiteState.rpChecked = false; render(); });

    const ctwCat = doc.querySelector("[data-suite-ctw-cat]");
    if (ctwCat) ctwCat.addEventListener("change", (e) => {
      suiteState.readingCategory = e.target.value;
      suiteState.readingIndex = 0;
      suiteState.ctwInputs = {};
      suiteState.ctwChecked = false;
      suiteState.ctwShowAnswers = false;
      render();
    });
    const blankInputs = Array.from(doc.querySelectorAll("[data-suite-ctw-blank]"));
    blankInputs.forEach((inp, idx) => {
      inp.addEventListener("input", (e) => {
        suiteState.ctwInputs[Number(e.target.dataset.suiteCtwBlank)] = e.target.value;
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const nextInp = blankInputs[idx + 1];
          if (nextInp && typeof nextInp.focus === "function") nextInp.focus();
        }
      });
    });
    const onCtwMove = (delta, rand = false) => {
      const list = getFilteredCtwPassages();
      if (!list.length) return;
      suiteState.readingIndex = rand ? Math.floor(Math.random() * list.length) : (suiteState.readingIndex + delta + list.length) % list.length;
      suiteState.ctwInputs = {};
      suiteState.ctwChecked = false;
      suiteState.ctwShowAnswers = false;
      render();
    };
    const bPrev = doc.querySelector("[data-suite-ctw-prev]");
    if (bPrev) bPrev.addEventListener("click", () => onCtwMove(-1));
    const bNext = doc.querySelector("[data-suite-ctw-next]");
    if (bNext) bNext.addEventListener("click", () => onCtwMove(1));
    const bRand = doc.querySelector("[data-suite-ctw-rand]");
    if (bRand) bRand.addEventListener("click", () => onCtwMove(0, true));
    const bCheck = doc.querySelector("[data-suite-ctw-check]");
    if (bCheck) bCheck.addEventListener("click", () => {
      const list = getFilteredCtwPassages();
      const passage = list[suiteState.readingIndex % Math.max(1, list.length)];
      if (passage && !suiteState.ctwChecked) {
        const built = buildCtwBlanks(passage.text);
        let ok = 0;
        built.blanks.forEach((b) => {
          if (String(suiteState.ctwInputs[b.idx] || "").trim().toLowerCase() === b.missing.toLowerCase()) ok += 1;
        });
        suiteState.ctwStats.completed += 1;
        suiteState.ctwStats.totalBlanks += built.blanks.length;
        suiteState.ctwStats.correctBlanks += ok;
        saveJson(SUITE_CTW_STATS_KEY, suiteState.ctwStats);
      }
      suiteState.ctwChecked = true;
      suiteState.ctwShowAnswers = true;
      render();
    });
    const bRev = doc.querySelector("[data-suite-ctw-reveal]");
    if (bRev) bRev.addEventListener("click", () => { suiteState.ctwShowAnswers = !suiteState.ctwShowAnswers; render(); });
    const bRes = doc.querySelector("[data-suite-ctw-reset]");
    if (bRes) bRes.addEventListener("click", () => { suiteState.ctwInputs = {}; suiteState.ctwChecked = false; suiteState.ctwShowAnswers = false; render(); });

    // Writing 2026
    doc.querySelectorAll("[data-suite-wmode]").forEach((btn) => {
      btn.addEventListener("click", () => { suiteState.writingMode = btn.dataset.suiteWmode; render(); });
    });
    doc.querySelectorAll("[data-suite-bas-chip]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const emptyIdx = suiteState.basSlots.findIndex((x) => !x);
        if (emptyIdx >= 0) {
          suiteState.basSlots[emptyIdx] = btn.dataset.suiteBasChip;
          suiteState.basChecked = false;
          render();
        }
      });
    });
    doc.querySelectorAll("[data-suite-bas-slot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.suiteBasSlot);
        suiteState.basSlots[idx] = null;
        suiteState.basChecked = false;
        render();
      });
    });
    const basCheck = doc.querySelector("[data-suite-bas-check]");
    if (basCheck) basCheck.addEventListener("click", () => { suiteState.basChecked = true; render(); });
    const basClear = doc.querySelector("[data-suite-bas-clear]");
    if (basClear) basClear.addEventListener("click", () => { suiteState.basSlots = suiteState.basSlots.map(() => null); suiteState.basChecked = false; render(); });
    const basPrev = doc.querySelector("[data-suite-bas-prev]");
    if (basPrev) basPrev.addEventListener("click", () => {
      const len = getBank().writing.buildASentence.length;
      suiteState.basIndex = (suiteState.basIndex - 1 + len) % len;
      suiteState.basSlots = [];
      suiteState.basChecked = false;
      render();
    });
    const basNext = doc.querySelector("[data-suite-bas-next]");
    if (basNext) basNext.addEventListener("click", () => {
      const len = getBank().writing.buildASentence.length;
      suiteState.basIndex = (suiteState.basIndex + 1) % len;
      suiteState.basSlots = [];
      suiteState.basChecked = false;
      render();
    });

    // Email & Discussion controls (live word meter update without stealing focus)
    const emIn = doc.querySelector("[data-suite-email-input]");
    if (emIn) emIn.addEventListener("input", (e) => {
      suiteState.emailText = e.target.value;
      updateWordMeterDom(doc, countWords(suiteState.emailText), 90, 130, "suite-email-wc");
    });
    const emTimer = doc.querySelector("[data-suite-email-timer]");
    if (emTimer) emTimer.addEventListener("click", () => startStopWritingTimer("email"));
    const emPrev = doc.querySelector("[data-suite-email-prev]");
    if (emPrev) emPrev.addEventListener("click", () => { const n = getBank().writing.emails.length; suiteState.emailIndex = (suiteState.emailIndex - 1 + n) % n; suiteState.emailText = ""; suiteState.emailTimerSec = 420; suiteState.emailShowModel = false; suiteState.emailAiFeedback = ""; render(); });
    const emNext = doc.querySelector("[data-suite-email-next]");
    if (emNext) emNext.addEventListener("click", () => { const n = getBank().writing.emails.length; suiteState.emailIndex = (suiteState.emailIndex + 1) % n; suiteState.emailText = ""; suiteState.emailTimerSec = 420; suiteState.emailShowModel = false; suiteState.emailAiFeedback = ""; render(); });
    const emMod = doc.querySelector("[data-suite-email-model]");
    if (emMod) emMod.addEventListener("click", () => { suiteState.emailShowModel = !suiteState.emailShowModel; render(); });
    const emAi = doc.querySelector("[data-suite-email-ai]");
    if (emAi) emAi.addEventListener("click", () => gradeWritingWithSetupAi("email"));
    const emCopy = doc.querySelector("[data-suite-copy-email-prompt]");
    if (emCopy) emCopy.addEventListener("click", () => {
      const bank = getBank();
      const t = bank.writing.emails[suiteState.emailIndex % bank.writing.emails.length];
      copyWritingFeedback(`${WRITING_FEEDBACK_PROMPTS.writeAnEmail}\n\nSCENARIO:\n${t.scenario}\n\nMY EMAIL:\n${suiteState.emailText}`);
    });

    const dcIn = doc.querySelector("[data-suite-disc-input]");
    if (dcIn) dcIn.addEventListener("input", (e) => {
      suiteState.discText = e.target.value;
      updateWordMeterDom(doc, countWords(suiteState.discText), 100, 140, "suite-disc-wc");
    });
    const dcTimer = doc.querySelector("[data-suite-disc-timer]");
    if (dcTimer) dcTimer.addEventListener("click", () => startStopWritingTimer("discussion"));
    const dcPrev = doc.querySelector("[data-suite-disc-prev]");
    if (dcPrev) dcPrev.addEventListener("click", () => { const n = getBank().writing.discussions.length; suiteState.discIndex = (suiteState.discIndex - 1 + n) % n; suiteState.discText = ""; suiteState.discTimerSec = 600; suiteState.discShowModel = false; suiteState.discAiFeedback = ""; render(); });
    const dcNext = doc.querySelector("[data-suite-disc-next]");
    if (dcNext) dcNext.addEventListener("click", () => { const n = getBank().writing.discussions.length; suiteState.discIndex = (suiteState.discIndex + 1) % n; suiteState.discText = ""; suiteState.discTimerSec = 600; suiteState.discShowModel = false; suiteState.discAiFeedback = ""; render(); });
    const dcMod = doc.querySelector("[data-suite-disc-model]");
    if (dcMod) dcMod.addEventListener("click", () => { suiteState.discShowModel = !suiteState.discShowModel; render(); });
    const dcAi = doc.querySelector("[data-suite-disc-ai]");
    if (dcAi) dcAi.addEventListener("click", () => gradeWritingWithSetupAi("discussion"));
    const dcCopy = doc.querySelector("[data-suite-copy-disc-prompt]");
    if (dcCopy) dcCopy.addEventListener("click", () => {
      const bank = getBank();
      const t = bank.writing.discussions[suiteState.discIndex % bank.writing.discussions.length];
      copyWritingFeedback(`${WRITING_FEEDBACK_PROMPTS.academicDiscussion}\n\nPROMPT:\n${t.professorPrompt}\n\nMY RESPONSE:\n${suiteState.discText}`);
    });

    bindListeningQuestions(doc);
    const lPlayer = doc.querySelector("#suiteListeningPlayer");
    if (lPlayer) {
      lPlayer.playbackRate = suiteState.listeningRate;
      lPlayer.addEventListener("timeupdate", () => {
        if (suiteState.loopA !== null && suiteState.loopB !== null && suiteState.loopB > suiteState.loopA) {
          if (lPlayer.currentTime >= suiteState.loopB) {
            lPlayer.currentTime = suiteState.loopA;
          }
        }
      });
    }
    const btnLoopA = doc.querySelector("[data-suite-loop-a]");
    if (btnLoopA) btnLoopA.addEventListener("click", () => { suiteState.loopA = lPlayer ? lPlayer.currentTime : 0; render(); });
    const btnLoopB = doc.querySelector("[data-suite-loop-b]");
    if (btnLoopB) btnLoopB.addEventListener("click", () => { suiteState.loopB = lPlayer ? lPlayer.currentTime : 5; render(); });
    const btnLoopClr = doc.querySelector("[data-suite-loop-clear]");
    if (btnLoopClr) btnLoopClr.addEventListener("click", () => { suiteState.loopA = null; suiteState.loopB = null; render(); });
    const lCat = doc.querySelector("[data-suite-list-cat]");
    if (lCat) lCat.addEventListener("change", (e) => { suiteState.listeningFilter = e.target.value; suiteState.listeningIndex = 0; suiteState.loopA = null; suiteState.loopB = null; render(); });
    const lSelect = doc.querySelector("[data-suite-list-select]");
    if (lSelect) lSelect.addEventListener("change", (e) => { suiteState.listeningIndex = Number(e.target.value); suiteState.listeningNotes = ""; suiteState.loopA = null; suiteState.loopB = null; render(); });
    doc.querySelectorAll("[data-suite-list-pick]").forEach((btn) => {
      btn.addEventListener("click", () => { suiteState.listeningIndex = Number(btn.dataset.suiteListPick); suiteState.listeningNotes = ""; suiteState.loopA = null; suiteState.loopB = null; render(); });
    });
    const lPrev = doc.querySelector("[data-suite-list-prev]");
    if (lPrev) lPrev.addEventListener("click", () => { suiteState.listeningIndex = Math.max(0, suiteState.listeningIndex - 1); suiteState.loopA = null; suiteState.loopB = null; render(); });
    const lNext = doc.querySelector("[data-suite-list-next]");
    if (lNext) lNext.addEventListener("click", () => { suiteState.listeningIndex += 1; suiteState.loopA = null; suiteState.loopB = null; render(); });
    doc.querySelectorAll("[data-suite-list-rate]").forEach((btn) => {
      btn.addEventListener("click", () => { suiteState.listeningRate = Number(btn.dataset.suiteListRate); render(); });
    });
    const lNotes = doc.querySelector("[data-suite-list-notes]");
    if (lNotes) lNotes.addEventListener("input", (e) => { suiteState.listeningNotes = e.target.value; });

    // Vocab & Ideas
    doc.querySelectorAll("[data-suite-vmode]").forEach((btn) => {
      btn.addEventListener("click", () => { suiteState.vocabMode = btn.dataset.suiteVmode; render(); });
    });
    const vDeck = doc.querySelector("[data-suite-v-deck]");
    if (vDeck) vDeck.addEventListener("change", (e) => { suiteState.vocabDeck = e.target.value; suiteState.vocabIndex = 0; suiteState.vocabRevealed = false; render(); });
    const vRev = doc.querySelector("[data-suite-v-reveal]");
    if (vRev) vRev.addEventListener("click", () => { suiteState.vocabRevealed = true; render(); });
    const vPrev = doc.querySelector("[data-suite-v-prev]");
    if (vPrev) vPrev.addEventListener("click", () => { suiteState.vocabIndex = Math.max(0, suiteState.vocabIndex - 1); suiteState.vocabRevealed = false; render(); });
    const vNext = doc.querySelector("[data-suite-v-next]");
    if (vNext) vNext.addEventListener("click", () => { suiteState.vocabIndex += 1; suiteState.vocabRevealed = false; render(); });
    const vRand = doc.querySelector("[data-suite-v-rand]");
    if (vRand) vRand.addEventListener("click", () => { suiteState.vocabIndex = Math.floor(Math.random() * getBank().vocab.length); suiteState.vocabRevealed = false; render(); });
    doc.querySelectorAll("[data-suite-v-grade]").forEach((btn) => {
      btn.addEventListener("click", () => gradeVocabCard(Number(btn.dataset.suiteVGrade)));
    });

    doc.querySelectorAll("[data-suite-copy-prompt]").forEach((btn) => {
      btn.addEventListener("click", () => copyWritingFeedback(WRITING_FEEDBACK_PROMPTS[btn.dataset.suiteCopyPrompt]));
    });
  }

  global.ToeflSuiteModules = {
    state: suiteState,
    buildCtwBlanks,
    renderBabblePill,
    isRoomNoisePlaying: () => suiteState.babblePlaying,
    renderThemeToggle,
    toggleTheme,
    renderTab(tabId) {
      if (tabId === "reading") return renderReadingTab();
      if (tabId === "writing") return renderWritingTab();
      if (tabId === "listening") return renderListeningTab();
      if (tabId === "vocab") return renderVocabTab();
      if (tabId === "guides") return renderGuidesTab();
      return "";
    },
    bindEvents
  };
})(typeof window !== "undefined" ? window : globalThis);
