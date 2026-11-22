// Full-Length 4-Section TOEFL iBT 2026 Mock Exam Engine
// Phases: select -> reading1 -> reading2 -> listening1 -> listening2 -> writing -> speaking -> results

(function initToeflFullMock(global) {
  const MOCK_HISTORY_KEY = "toefl-full-mock-history-v1";

  function esc(v) {
    return String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function loadHistory() {
    try {
      const raw = global.localStorage && global.localStorage.getItem(MOCK_HISTORY_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function saveHistory(list) {
    try {
      if (global.localStorage) global.localStorage.setItem(MOCK_HISTORY_KEY, JSON.stringify(list.slice(0, 30)));
    } catch {
      // ignore
    }
  }

  function getMocksData() {
    return typeof TOEFL_FULL_MOCKS !== "undefined" ? TOEFL_FULL_MOCKS : { mocks: [] };
  }

  function buildBlanks(text) {
    if (global.ToeflSuiteModules && typeof global.ToeflSuiteModules.buildCtwBlanks === "function") {
      return global.ToeflSuiteModules.buildCtwBlanks(text);
    }
    return { intro: text, parts: [], blanks: [] };
  }

  function countWords(text) {
    const t = String(text || "").trim();
    return t ? t.split(/\s+/).length : 0;
  }

  function fmtSec(sec) {
    const s = Math.max(0, Number(sec) || 0);
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }

  function speakText(text) {
    try {
      const synth = global.speechSynthesis || (global.window && global.window.speechSynthesis);
      const Utter = global.SpeechSynthesisUtterance || (global.window && global.window.SpeechSynthesisUtterance);
      if (!synth || !Utter) return;
      synth.cancel();
      const u = new Utter(String(text || ""));
      u.lang = "en-US";
      u.rate = 0.98;
      synth.speak(u);
    } catch {
      // ignore in headless/VM
    }
  }

  function stopSpeech() {
    try {
      const synth = global.speechSynthesis || (global.window && global.window.speechSynthesis);
      if (synth) synth.cancel();
    } catch {
      // ignore
    }
  }

  function buildDiagnosticMock() {
    const data = getMocksData();
    const suiteBank = typeof TOEFL_SUITE_BANK !== "undefined" ? TOEFL_SUITE_BANK : null;
    const extra = typeof TOEFL_EXTRA_PRACTICE !== "undefined" ? TOEFL_EXTRA_PRACTICE : null;
    const lp = typeof TOEFL_LISTENING_PRACTICE !== "undefined" ? TOEFL_LISTENING_PRACTICE : [];
    const base = (data.mocks || [])[0];
    if (!base) return null;

    const ctw1 = (suiteBank?.reading?.completeTheWords || [])[0] || base.reading.module1.ctw;
    const ctw2 = (suiteBank?.reading?.completeTheWords || [])[1] || base.reading.module2.ctw;
    const dlPassage = (extra?.readingPassages || []).find((p) => p.kind === "Read in Daily Life") || base.reading.module1.passages[0];
    const acadPassage = (extra?.readingPassages || []).find((p) => p.kind === "Academic Passage") || base.reading.module2.passages[0];

    const pickLp = (id) => lp.find((x) => x.id === id);
    const toListenItem = (entry) => ({
      id: entry.id,
      audioFile: entry.id,
      kind: entry.kind,
      title: entry.title,
      script: entry.script,
      questions: entry.questions.map((q) => ({
        q: q.prompt,
        choices: q.choices,
        answer: q.choices[q.answer],
        explanation: q.reason || ""
      }))
    });

    const m1Listen = [pickLp("reply-3"), pickLp("conversation-3")].filter(Boolean).map(toListenItem);
    const m2Listen = [pickLp("announcement-3"), pickLp("talk-3")].filter(Boolean).map(toListenItem);
    const basItems = (extra?.buildASentence || base.writing.buildASentence || []).slice(0, 4);
    const emailItem = (suiteBank?.writing?.emails || [])[1] || base.writing.email;
    const discItem = (suiteBank?.writing?.discussions || [])[1] || base.writing.discussion;

    return {
      id: "mock-diagnostic-1",
      isDiagnostic: true,
      title: "TOEFL 2026 Evaluation Diagnostic",
      subtitle: "Short calibrated check across all 4 sections and task formats (~25-30 min)",
      reading: {
        module1: { title: "Reading Check 1 (CTW + Daily Life)", minutes: 7, ctw: ctw1, passages: [dlPassage].filter(Boolean) },
        module2: { title: "Reading Check 2 (CTW + Academic)", minutes: 8, ctw: ctw2, passages: [acadPassage].filter(Boolean) }
      },
      listening: {
        module1: { title: "Listening Check 1 (Response + Conversation)", minutes: 6, items: m1Listen.length ? m1Listen : base.listening.module1.items.slice(0, 2) },
        module2: { title: "Listening Check 2 (Announcement + Academic Talk)", minutes: 7, items: m2Listen.length ? m2Listen : base.listening.module2.items.slice(0, 2) }
      },
      writing: {
        buildASentence: basItems,
        email: emailItem,
        discussion: discItem
      },
      speaking: {
        repeat: (resolveSpeakingItems(base).repeat || []).slice(0, 3),
        interview: (resolveSpeakingItems(base).interview || []).slice(0, 2)
      }
    };
  }

  function pickRandomMock() {
    const data = getMocksData();
    const suiteBank = typeof TOEFL_SUITE_BANK !== "undefined" ? TOEFL_SUITE_BANK : null;
    const baseMocks = data.mocks || [];
    if (!suiteBank || !baseMocks.length) return baseMocks[0] || null;

    const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const allPassages = data.extraReadingPassages || suiteBank.reading.passages || [];
    const daily = allPassages.filter((p) => p.kind !== "Academic Passage");
    const acad = allPassages.filter((p) => p.kind === "Academic Passage");
    const ctws = suiteBank.reading.completeTheWords || [];
    const basAll = [...(data.extraBuildASentence || []), ...(suiteBank.writing.buildASentence || [])];
    const shuffled = (arr) => [...arr].sort(() => Math.random() - 0.5);

    const dl = shuffled(daily);
    const ac = shuffled(acad);
    const ct = shuffled(ctws);
    const bs = shuffled(basAll).slice(0, 10);
    const listenSource = randPick(baseMocks);

    return {
      id: `mock-random-${Date.now()}`,
      listeningMockId: listenSource.id,
      title: "Random Full Practice Test",
      subtitle: "Freshly assembled 4-section 2026 practice test",
      reading: {
        module1: { title: "Reading Part 1", minutes: 18, ctw: ct[0], passages: [dl[0], dl[1], ac[0]].filter(Boolean) },
        module2: { title: "Reading Part 2", minutes: 18, ctw: ct[1] || ct[0], passages: [dl[2] || dl[0], dl[3] || dl[1], ac[1] || ac[0]].filter(Boolean) }
      },
      listening: listenSource.listening,
      writing: {
        buildASentence: bs,
        email: randPick(suiteBank.writing.emails || []),
        discussion: randPick(suiteBank.writing.discussions || [])
      },
      speaking: { useBankSeed: Math.floor(Math.random() * 40) + 3 }
    };
  }

  function resolveSpeakingItems(mock) {
    if (mock.speaking && Array.isArray(mock.speaking.repeat) && Array.isArray(mock.speaking.interview)) {
      return mock.speaking;
    }
    const seed = (mock.speaking && mock.speaking.useBankSeed) || 1;
    const qb = typeof QUESTION_BANK !== "undefined" ? QUESTION_BANK : { repeat: [] };
    const sets = typeof INTERVIEW_SETS !== "undefined" ? INTERVIEW_SETS : [];
    const repStart = (seed * 7) % Math.max(1, qb.repeat.length - 7);
    const repeat = qb.repeat.slice(repStart, repStart + 7).map((q, i) => ({
      id: `dyn-lr-${i + 1}`,
      text: q.text,
      context: q.category || "Listen & Repeat"
    }));
    const setObj = sets[seed % Math.max(1, sets.length)];
    const interview = setObj
      ? setObj.turns.map((t, i) => ({
          id: `dyn-int-${i + 1}`,
          turn: i + 1,
          scenario: setObj.scenario,
          text: t.prompt || t.text || String(t)
        }))
      : [
          { id: "dyn-int-1", turn: 1, scenario: "Campus Interview", text: "What is your favorite place to study, and why?" },
          { id: "dyn-int-2", turn: 2, scenario: "Campus Interview", text: "Do you prefer studying alone or in a group? Explain." },
          { id: "dyn-int-3", turn: 3, scenario: "Campus Interview", text: "How has technology changed the way students learn?" },
          { id: "dyn-int-4", turn: 4, scenario: "Campus Interview", text: "Should universities offer more online courses? Why or why not?" }
        ];
    return { repeat, interview };
  }

  const mockState = {
    phase: "select", // select | reading1 | reading2 | listening1 | listening2 | writing | speaking | results
    mock: null,
    speakingItems: null,
    secondsLeft: 0,
    timerId: null,

    // Reading answers
    ctwInputs: { reading1: {}, reading2: {} },
    readingMcq: {}, // key: `${phase}:${passageId}:${qi}` -> choice string

    // Listening state
    listenIdx: 0,
    listenMcq: {}, // key: `${phase}:${itemId}:${qi}` -> choice string

    // Writing state
    writingSub: "bas", // bas | email | discussion
    basIdx: 0,
    basSlots: {}, // basIdx -> array
    emailText: "",
    discText: "",

    // Speaking state
    speakSub: "repeat", // repeat | interview
    speakIdx: 0,
    speakSkipped: false,
    repeatResponses: {}, // idx -> transcript text
    interviewResponses: {}, // idx -> transcript text

    // Computed final report
    lastReport: null
  };

  let activeCapture = null;
  const recordings = new Map();
  let recordingStatus = "";
  let finishing = false;

  function clearRecordings() {
    const capture = activeCapture;
    activeCapture = null;
    capture?.stop();
    for (const url of recordings.values()) global.URL.revokeObjectURL(url);
    recordings.clear();
    recordingStatus = "";
  }

  function renderSpeakingControl(selector) {
    render();
    global.document.querySelector(selector)?.focus();
  }

  async function toggleRecording() {
    if (activeCapture) {
      activeCapture.stop();
      return;
    }
    if (!global.navigator?.mediaDevices?.getUserMedia || !global.MediaRecorder) {
      recordingStatus = "Recording is unavailable in this browser. You can type a response below.";
      renderSpeakingControl("[data-mock-speak-input]");
      return;
    }
    stopSpeech();
    const key = `${mockState.speakSub}:${mockState.speakIdx}`;
    const capture = { recorder: null, stream: null, stop() {} };
    activeCapture = capture;
    recordingStatus = "Waiting for microphone permission…";
    renderSpeakingControl("[data-mock-speak-status]");
    try {
      capture.stream = await global.navigator.mediaDevices.getUserMedia({ audio: true });
      if (activeCapture !== capture) {
        capture.stream.getTracks().forEach((track) => track.stop());
        return;
      }
      const recorder = new global.MediaRecorder(capture.stream);
      const chunks = [];
      capture.recorder = recorder;
      let recordingLimit;
      capture.stop = () => {
        clearTimeout(recordingLimit);
        if (recorder.state !== "inactive") recorder.stop();
        capture.stream.getTracks().forEach((track) => track.stop());
      };
      capture.done = new Promise((resolve) => {
        recorder.addEventListener("dataavailable", (event) => {
          if (event.data.size) chunks.push(event.data);
        });
        function complete(error) {
          clearTimeout(recordingLimit);
          if (activeCapture === capture) {
            activeCapture = null;
            if (!error && chunks.length) {
              const previous = recordings.get(key);
              if (previous) global.URL.revokeObjectURL(previous);
              recordings.set(key, global.URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType })));
              recordingStatus = "Recording ready to play.";
            } else {
              recordingStatus = "No audio was saved. Try recording again or type your response.";
            }
            if (!finishing) renderSpeakingControl("[data-mock-record]");
          }
          capture.stream.getTracks().forEach((track) => track.stop());
          resolve();
        }
        recorder.addEventListener("stop", () => complete(false), { once: true });
        recorder.addEventListener("error", () => complete(true), { once: true });
      });
      recorder.start();
      const limitSeconds = mockState.speakSub === "repeat" ? 10 : 45;
      recordingLimit = setTimeout(capture.stop, limitSeconds * 1000);
      recordingStatus = `Recording for up to ${limitSeconds} seconds…`;
      renderSpeakingControl("[data-mock-record]");
    } catch (error) {
      capture.stream?.getTracks().forEach((track) => track.stop());
      if (activeCapture !== capture) return;
      activeCapture = null;
      recordingStatus = error?.name === "NotAllowedError"
        ? "Microphone access was denied. Allow it in your browser and try again, or type your response."
        : "Could not start the microphone. Check your device or type your response.";
      renderSpeakingControl("[data-mock-record]");
    }
  }

  async function finishSpeaking(skipped = false) {
    if (finishing) return;
    finishing = true;
    const capture = activeCapture;
    try {
      if (capture?.recorder) {
        capture.stop();
        await capture.done;
      } else {
        activeCapture = null;
      }
      if (mockState.phase !== "speaking") return;
      mockState.speakSkipped = skipped && !recordings.size &&
        ![...Object.values(mockState.repeatResponses), ...Object.values(mockState.interviewResponses)].some((value) => value.trim());
      finishAndScore();
    } finally {
      finishing = false;
    }
  }

  function stopTimer() {
    if (mockState.timerId && typeof clearInterval === "function") {
      clearInterval(mockState.timerId);
    }
    mockState.timerId = null;
  }

  function startPhaseTimer(minutes) {
    stopTimer();
    mockState.secondsLeft = Math.max(60, Math.round(minutes * 60));
    const deadline = Date.now() + mockState.secondsLeft * 1000;
    if (typeof setInterval !== "function") return;
    mockState.timerId = setInterval(() => {
      mockState.secondsLeft = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      const el = global.document?.querySelector("#mockTimerDisplay");
      if (el) el.textContent = fmtSec(mockState.secondsLeft);
      if (mockState.secondsLeft === 0) {
        stopTimer();
        advancePhase();
      }
    }, 250);
  }

  function startMock(mockObj) {
    if (!mockObj) return;
    stopSpeech();
    clearRecordings();
    mockState.mock = mockObj;
    mockState.speakingItems = resolveSpeakingItems(mockObj);
    mockState.phase = "reading1";
    mockState.ctwInputs = { reading1: {}, reading2: {} };
    mockState.readingMcq = {};
    mockState.listenIdx = 0;
    mockState.listenMcq = {};
    mockState.writingSub = "bas";
    mockState.basIdx = 0;
    mockState.basSlots = {};
    mockState.emailText = "";
    mockState.discText = "";
    mockState.speakSub = "repeat";
    mockState.speakIdx = 0;
    mockState.speakSkipped = false;
    mockState.repeatResponses = {};
    mockState.interviewResponses = {};
    mockState.lastReport = null;
    startPhaseTimer(mockObj.reading.module1.minutes || 18);
    if (typeof render === "function") render();
  }

  function advancePhase() {
    stopSpeech();
    const m = mockState.mock;
    if (!m) return;
    if (mockState.phase === "reading1") {
      mockState.phase = "reading2";
      startPhaseTimer(m.reading.module2.minutes || 18);
    } else if (mockState.phase === "reading2") {
      mockState.phase = "listening1";
      mockState.listenIdx = 0;
      startPhaseTimer(m.listening.module1.minutes || 15);
    } else if (mockState.phase === "listening1") {
      mockState.phase = "listening2";
      mockState.listenIdx = 0;
      startPhaseTimer(m.listening.module2.minutes || 14);
    } else if (mockState.phase === "listening2") {
      mockState.phase = "writing";
      mockState.writingSub = "bas";
      mockState.basIdx = 0;
      startPhaseTimer(6);
    } else if (mockState.phase === "writing") {
      if (mockState.writingSub === "bas") {
        mockState.writingSub = "email";
        startPhaseTimer(7);
      } else if (mockState.writingSub === "email") {
        mockState.writingSub = "discussion";
        startPhaseTimer(10);
      } else {
        mockState.phase = "speaking";
        mockState.speakSub = "repeat";
        mockState.speakIdx = 0;
        startPhaseTimer(8);
      }
    } else if (mockState.phase === "speaking") {
      void finishSpeaking();
      return;
    }
    if (typeof render === "function") render();
  }

  function finishAndScore() {
    stopTimer();
    stopSpeech();
    const m = mockState.mock;
    // 1. Score Reading (Mod 1 + Mod 2: CTW blanks + MCQs)
    let rCorrect = 0;
    let rTotal = 0;
    const rReview = [];
    for (const modKey of ["reading1", "reading2"]) {
      const mod = modKey === "reading1" ? m.reading.module1 : m.reading.module2;
      const built = buildBlanks(mod.ctw.text);
      const userMap = mockState.ctwInputs[modKey] || {};
      built.blanks.forEach((b) => {
        rTotal += 1;
        const val = String(userMap[b.idx] || "").trim();
        const ok = val.toLowerCase() === b.missing.toLowerCase();
        if (ok) rCorrect += 1;
        rReview.push({
          section: mod.title,
          q: `Complete word: ${b.prefix}___`,
          yours: val ? b.prefix + val : "(blank)",
          expected: b.word,
          ok,
          explanation: `Full word: ${b.word}`
        });
      });
      mod.passages.forEach((p) => {
        p.questions.forEach((qq, qi) => {
          rTotal += 1;
          const k = `${modKey}:${p.id}:${qi}`;
          const picked = mockState.readingMcq[k] || "";
          const ok = picked === qq.answer;
          if (ok) rCorrect += 1;
          rReview.push({
            section: `${mod.title} - ${p.title}`,
            q: qq.q,
            yours: picked || "(unanswered)",
            expected: qq.answer,
            ok,
            explanation: qq.explanation || ""
          });
        });
      });
    }

    // 2. Score Listening (Mod 1 + Mod 2)
    let lCorrect = 0;
    let lTotal = 0;
    const lReview = [];
    for (const modKey of ["listening1", "listening2"]) {
      const mod = modKey === "listening1" ? m.listening.module1 : m.listening.module2;
      mod.items.forEach((item) => {
        item.questions.forEach((qq, qi) => {
          lTotal += 1;
          const k = `${modKey}:${item.id}:${qi}`;
          const picked = mockState.listenMcq[k] || "";
          const ok = picked === qq.answer;
          if (ok) lCorrect += 1;
          lReview.push({
            section: `${mod.title} - ${item.title}`,
            q: qq.q,
            yours: picked || "(unanswered)",
            expected: qq.answer,
            ok,
            explanation: qq.explanation || ""
          });
        });
      });
    }
    const basList = m.writing.buildASentence || [];
    let basOk = 0;
    const basReview = basList.map((item, idx) => {
      const slots = mockState.basSlots[idx] || [];
      const ok = item.answer.length > 0 && item.answer.every((ans, i) => String(slots[i] || "").toLowerCase() === ans.toLowerCase());
      if (ok) basOk += 1;
      return {
        section: "Build a Sentence",
        q: item.prompt,
        yours: slots.filter(Boolean).length ? slots.join(" ") : "(incomplete)",
        expected: item.fullAnswer || item.answer.join(" "),
        ok,
        explanation: ""
      };
    });
    const emailWc = countWords(mockState.emailText);
    const discWc = countWords(mockState.discText);
    const report = {
      id: `run-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      mockTitle: m.title,
      reading: { correct: rCorrect, total: rTotal },
      listening: { correct: lCorrect, total: lTotal },
      writing: { basCorrect: basOk, basTotal: basList.length, emailWc, discWc },
      speaking: {
        skipped: mockState.speakSkipped,
        recorded: recordings.size,
        answered: [...Object.values(mockState.repeatResponses), ...Object.values(mockState.interviewResponses)]
          .filter((response) => String(response || "").trim()).length
      },
      rReview,
      lReview,
      basReview
    };

    mockState.lastReport = report;
    mockState.phase = "results";

    const hist = loadHistory();
    hist.unshift({
      id: report.id,
      date: report.date,
      title: report.mockTitle,
      reading: report.reading,
      listening: report.listening
    });
    saveHistory(hist);
    if (typeof render === "function") render();
  }

  function renderStepper() {
    const steps = [
      ["reading1", "1. Reading P1"],
      ["reading2", "2. Reading P2"],
      ["listening1", "3. Listening P1"],
      ["listening2", "4. Listening P2"],
      ["writing", "5. Writing"],
      ["speaking", "6. Speaking"]
    ];
    const order = steps.map((s) => s[0]);
    const cur = order.indexOf(mockState.phase);
    return `
      <div class="mock-bar">
        <div class="mock-steps" aria-label="Test progress">
          ${steps.map(([key, label], i) => `
            <span class="mock-step ${i === cur ? "active" : i < cur ? "done" : ""}">${label}</span>
          `).join("")}
        </div>
        <div class="mock-bar-right">
          <span class="stat-pill">Time: <strong id="mockTimerDisplay">${fmtSec(mockState.secondsLeft)}</strong></span>
          <button type="button" class="ghost-button" data-mock-quit="true">Exit Test</button>
        </div>
      </div>
    `;
  }

  function displayMockTitle(title) {
    return title.replace(/ \(Official 2026 Format\)$/, "");
  }

  function formatCorrect(result) {
    return result && Number.isInteger(result.correct) && Number.isInteger(result.total)
      ? `${result.correct}/${result.total} correct`
      : "-";
  }

  function renderSelectScreen() {
    const data = getMocksData();
    const mocks = data.mocks || [];
    const hist = loadHistory();

    return `
      <section class="suite-focus">
        <div class="practice-board">
          <div class="practice-header">
            <div>
              <h1 class="study-page-title">Four-section tests</h1>
              <p class="prompt-note">These sets vary in length. Listening uses prerecorded device voices. Record your speaking answers or type them if a microphone is unavailable.</p>
            </div>
            <div class="question-actions">
              <button type="button" class="primary-button" data-mock-diagnostic="true">Start Evaluation Diagnostic (~25m)</button>
              <button type="button" class="ghost-button" data-mock-random="true">Choose a test for me</button>
            </div>
          </div>

          <div class="mock-cards-grid suite-mt">
            ${mocks.map((mk, i) => {
              const rCount = [mk.reading.module1, mk.reading.module2].reduce((sum, part) =>
                sum + buildBlanks(part.ctw.text).blanks.length + part.passages.reduce((total, passage) => total + passage.questions.length, 0), 0);
              const lCount = mk.listening.module1.items.reduce((s, it) => s + it.questions.length, 0) + mk.listening.module2.items.reduce((s, it) => s + it.questions.length, 0);
              return `
                <article class="suite-idea-card mock-select-card">
                  <div>
                    <h3>${esc(displayMockTitle(mk.title))}</h3>
                    <p class="suite-meta-inline">Reading: ${rCount} Q · Listening: ${lCount} Q · Writing: 12 tasks · Speaking: 11 tasks</p>
                  </div>
                  <button type="button" class="primary-button" data-mock-start="${i}">Start Test ${i + 1}</button>
                </article>
              `;
            }).join("")}
          </div>

          ${hist.length ? `
            <div class="suite-mt">
              <h3>Recent tests</h3>
              <div class="mock-table-wrap">
                <table class="mock-table">
                  <thead>
                    <tr><th scope="col">Date</th><th scope="col">Test</th><th scope="col">Reading</th><th scope="col">Listening</th></tr>
                  </thead>
                  <tbody>
                    ${hist.slice(0, 8).map((h) => `
                      <tr>
                        <td>${esc(h.date)}</td>
                        <td>${esc(displayMockTitle(h.title || "Practice test"))}</td>
                        <td>${formatCorrect(h.reading)}</td>
                        <td>${formatCorrect(h.listening)}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ""}
        </div>
      </section>
    `;
  }

  function renderReadingPhase() {
    const modKey = mockState.phase;
    const mod = modKey === "reading1" ? mockState.mock.reading.module1 : mockState.mock.reading.module2;
    const built = buildBlanks(mod.ctw.text);
    const userCtw = mockState.ctwInputs[modKey] || {};

    return `
      <section class="suite-focus">
        ${renderStepper()}
        <div class="practice-board suite-stack-lg">
          <div>
            <h2>${esc(mod.title)} - Task 1: Complete the Words</h2>
            <p class="prompt-note">Fill in the missing letters (one underline per missing letter, matching the official TOEFL 2026 interface). Press Enter or Space to move to the next blank.</p>
            <div class="suite-ctw-passage">
              <span>${esc(built.intro)}</span>${built.parts.map((pt) => {
                if (pt.type === "space" || pt.type === "word") return esc(pt.raw);
                const val = userCtw[pt.idx] || "";
                const len = pt.missing.length;
                return `${esc(pt.lead)}<span class="ctw-token"><strong class="ctw-prefix">${esc(pt.prefix)}</strong><input class="ctw-input" type="text" aria-label="Blank ${pt.idx + 1}: ${esc(pt.prefix)} plus ${len} missing ${len === 1 ? "letter" : "letters"}" data-mock-ctw="${pt.idx}" data-ctw-len="${len}" value="${esc(val)}" maxlength="${len}" style="--ctw-slots:${len}" autocomplete="off" spellcheck="false" /></span>${esc(pt.trail)}`;
              }).join("")}
            </div>
          </div>

          ${mod.passages.map((p, pi) => `
            <div class="mock-block">
              <span class="badge">${esc(p.kind)}</span>
              <h3>${esc(p.title)}</h3>
              <div class="suite-ctw-passage suite-passage-preline">${esc(p.text)}</div>
              <div class="suite-stack-md">
                ${p.questions.map((qq, qi) => {
                  const key = `${modKey}:${p.id}:${qi}`;
                  const picked = mockState.readingMcq[key] || "";
                  return `
                    <div class="suite-idea-card">
                      <p class="suite-mcq-prompt">Q${qi + 1}. ${esc(qq.q)}</p>
                      <div class="suite-stack-sm">
                        ${qq.choices.map((ch) => `
                          <button type="button" class="suite-clip-btn ${picked === ch ? "active" : ""}" data-mock-rmcq="${esc(key)}::${esc(ch)}">
                            <span>${esc(ch)}</span>
                          </button>
                        `).join("")}
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          `).join("")}

          <div class="control-actions">
            <button type="button" class="primary-button" data-mock-next-phase="true">
              ${modKey === "reading1" ? "Finish Reading Part 1 -> Start Part 2" : "Finish Reading -> Start Listening"}
            </button>
          </div>
        </div>
      </section>
    `;
  }

  function renderListeningPhase() {
    const modKey = mockState.phase;
    const mod = modKey === "listening1" ? mockState.mock.listening.module1 : mockState.mock.listening.module2;
    const items = mod.items || [];
    const safeIdx = Math.min(mockState.listenIdx, Math.max(0, items.length - 1));
    const item = items[safeIdx];
    const audioMockId = mockState.mock.listeningMockId || mockState.mock.id;
    const audio = item.audioFile
      ? `./assets/audio/prompts/${item.audioFile}.wav`
      : `./assets/audio/prompts/${audioMockId}-${modKey}-${safeIdx}.wav`;

    return `
      <section class="suite-focus">
        ${renderStepper()}
        <div class="practice-board suite-stack-md">
          <div class="practice-header">
            <div>
              <span class="badge">${esc(mod.title)} · ${esc(item.kind)} · ${safeIdx + 1} / ${items.length}</span>
              <h2 class="question-text">${esc(item.title)}</h2>
            </div>
          </div>

          <audio controls class="suite-audio-player" aria-label="Listening prompt" preload="metadata" src="${esc(audio)}"></audio>
          <details class="suite-details"><summary>Read transcript</summary><p class="suite-passage-preline">${esc(item.script)}</p></details>

          <div class="suite-stack-md">
            ${item.questions.map((qq, qi) => {
              const key = `${modKey}:${item.id}:${qi}`;
              const picked = mockState.listenMcq[key] || "";
              return `
                <div class="suite-idea-card">
                  <p class="suite-mcq-prompt">${esc(qq.q)}</p>
                  <div class="suite-stack-sm">
                    ${qq.choices.map((ch) => `
                      <button type="button" class="suite-clip-btn ${picked === ch ? "active" : ""}" aria-pressed="${picked === ch}" data-mock-lmcq="${esc(key)}::${esc(ch)}">
                        <span>${esc(ch)}</span>
                      </button>
                    `).join("")}
                  </div>
                </div>
              `;
            }).join("")}
          </div>

          <div class="control-actions">
            ${safeIdx > 0 ? `<button type="button" class="ghost-button" data-mock-listen-prev="true">Previous</button>` : ""}
            ${safeIdx < items.length - 1
              ? `<button type="button" class="primary-button" data-mock-listen-next="true">Next Listening Item</button>`
              : `<button type="button" class="primary-button" data-mock-next-phase="true">${modKey === "listening1" ? "Continue to listening part 2" : "Continue to writing"}</button>`
            }
          </div>
        </div>
      </section>
    `;
  }

  function renderWritingPhase() {
    const w = mockState.mock.writing;
    const sub = mockState.writingSub;
    let body = "";

    if (sub === "bas") {
      const list = w.buildASentence || [];
      const safeIdx = Math.min(mockState.basIdx, Math.max(0, list.length - 1));
      const item = list[safeIdx];
      if (!mockState.basSlots[safeIdx]) {
        mockState.basSlots[safeIdx] = new Array(item.answer.length).fill(null);
      }
      const slots = mockState.basSlots[safeIdx];
      const used = new Set(slots.filter(Boolean));
      body = `
        <div class="practice-header">
          <div>
            <span class="badge">Writing 1 of 3 · Build a Sentence · ${safeIdx + 1} / ${list.length}</span>
            <h2 class="question-text">"${esc(item.prompt)}"</h2>
          </div>
          <div class="question-actions">
            ${safeIdx > 0 ? `<button type="button" class="ghost-button" data-mock-bas-prev="true">Prev</button>` : ""}
            ${safeIdx < list.length - 1 ? `<button type="button" class="ghost-button" data-mock-bas-next="true">Next</button>` : ""}
          </div>
        </div>
        <div class="suite-bas-sentence">
          ${item.layout.map((part) => {
            if (part.text !== undefined) return `<span class="bas-fixed">${esc(part.text)}</span>`;
            const val = slots[part.slot];
            return `<button type="button" class="bas-slot ${val ? "filled" : ""}" data-mock-bas-slot="${part.slot}">${val ? esc(val) : "____"}</button>`;
          }).join(" ")}
        </div>
        <div class="suite-bas-bank">
          ${item.choices.map((ch) => `
            <button type="button" class="bas-chip ${used.has(ch) ? "used" : ""}" data-mock-bas-chip="${esc(ch)}" ${used.has(ch) ? "disabled" : ""}>${esc(ch)}</button>
          `).join("")}
        </div>
        <div class="control-actions suite-mt">
          <button type="button" class="tool-button" data-mock-bas-clear="true">Clear</button>
          ${safeIdx < list.length - 1
            ? `<button type="button" class="primary-button" data-mock-bas-next="true">Next Sentence</button>`
            : `<button type="button" class="primary-button" data-mock-next-phase="true">Continue to Write an Email</button>`
          }
        </div>
      `;
    } else if (sub === "email") {
      const em = w.email;
      const wc = countWords(mockState.emailText);
      const pct = Math.min(100, Math.round((wc / 130) * 100));
      body = `
        <div class="practice-header">
          <div>
            <span class="badge">Writing 2 of 3 · Write an Email (7 min)</span>
            <h2 class="question-text">${esc(em.title)}</h2>
            <p class="prompt-note">${esc(em.scenario)}</p>
          </div>
        </div>
        <div class="transcript-area">
          <label for="mockEmailInput">Your Email</label>
          <textarea id="mockEmailInput" class="suite-textarea" data-mock-email="true" rows="10" placeholder="Dear ...,">${esc(mockState.emailText)}</textarea>
        </div>
        <div class="suite-word-meter-wrap">
          <div class="suite-word-meter-head">
            <span class="stat-pill"><strong id="mockEmailWc">${wc}</strong> words (aim for 90-130)</span>
          </div>
          <div class="suite-word-meter"><div class="suite-word-fill ${wc >= 90 && wc <= 130 ? "in-range" : ""}" id="mockEmailFill" style="width:${pct}%"></div></div>
        </div>
        <div class="control-actions suite-mt">
          <button type="button" class="primary-button" data-mock-next-phase="true">Continue to Academic Discussion</button>
        </div>
      `;
    } else {
      const dc = w.discussion;
      const wc = countWords(mockState.discText);
      const pct = Math.min(100, Math.round((wc / 140) * 100));
      body = `
        <div class="practice-header">
          <div>
            <span class="badge">Writing 3 of 3 · Academic Discussion (10 min)</span>
            <h2 class="question-text">${esc(dc.title)}</h2>
            <p class="prompt-note suite-passage-preline">${esc(dc.professorPrompt)}</p>
          </div>
        </div>
        <div class="transcript-area">
          <label for="mockDiscInput">Your Response</label>
          <textarea id="mockDiscInput" class="suite-textarea" data-mock-disc="true" rows="10" placeholder="Share your view and support it with a clear reason and example...">${esc(mockState.discText)}</textarea>
        </div>
        <div class="suite-word-meter-wrap">
          <div class="suite-word-meter-head">
            <span class="stat-pill"><strong id="mockDiscWc">${wc}</strong> words (aim for 100-140)</span>
          </div>
          <div class="suite-word-meter"><div class="suite-word-fill ${wc >= 100 && wc <= 140 ? "in-range" : ""}" id="mockDiscFill" style="width:${pct}%"></div></div>
        </div>
        <div class="control-actions suite-mt">
          <button type="button" class="primary-button" data-mock-next-phase="true">Continue to speaking</button>
        </div>
      `;
    }

    return `
      <section class="suite-focus">
        ${renderStepper()}
        <div class="practice-board">${body}</div>
      </section>
    `;
  }

  function renderSpeakingPhase() {
    const sp = mockState.speakingItems;
    const isRepeat = mockState.speakSub === "repeat";
    const list = isRepeat ? sp.repeat : sp.interview;
    const safeIdx = Math.min(mockState.speakIdx, Math.max(0, list.length - 1));
    const item = list[safeIdx];
    const recording = recordings.get(`${mockState.speakSub}:${safeIdx}`);
    const pending = activeCapture && !activeCapture.recorder;
    const currentResp = isRepeat ? (mockState.repeatResponses[safeIdx] || "") : (mockState.interviewResponses[safeIdx] || "");

    return `
      <section class="suite-focus">
        ${renderStepper()}
        <div class="practice-board suite-stack-md">
          <div class="practice-header">
            <div>
              <span class="badge">${isRepeat ? `Speaking Part 1 · Listen & Repeat ${safeIdx + 1}/${list.length}` : `Speaking Part 2 · Interview ${safeIdx + 1}/${list.length}`}</span>
              <h2 class="question-text">${isRepeat ? "Listen carefully and repeat the sentence" : esc(item.text)}</h2>
              ${item.scenario ? `<p class="prompt-note">${esc(item.scenario)}</p>` : ""}
              ${item.context ? `<p class="prompt-note">Setting: ${esc(item.context)}</p>` : ""}
            </div>
            <div class="question-actions">
              <button type="button" class="ghost-button" data-mock-speak-play="true" ${activeCapture ? "disabled" : ""}>Play Audio</button>
              <button type="button" class="ghost-button" data-mock-skip-speaking="true">Skip speaking</button>
            </div>
          </div>

          <div class="control-actions">
            <button type="button" class="primary-button" data-mock-record ${pending ? "disabled" : ""}>${pending ? "Waiting for microphone" : activeCapture ? "Stop recording" : recording ? "Record again" : "Record answer"}</button>
            <span tabindex="-1" role="status" data-mock-speak-status>${esc(recordingStatus)}</span>
          </div>
          ${recording ? `<audio controls class="suite-audio-player" aria-label="Play your recording" src="${esc(recording)}"></audio>` : ""}
          <details class="suite-details" ${currentResp ? "open" : ""}>
            <summary>Type an answer instead</summary>
            <div class="transcript-area">
            <label for="mockSpeakInput">${isRepeat ? "Type the sentence you heard" : "Type a practice answer"}</label>
            <textarea id="mockSpeakInput" class="suite-textarea" data-mock-speak-input="true" rows="${isRepeat ? 3 : 7}" placeholder="${isRepeat ? "Type the exact sentence you heard..." : "State your answer clearly, give one reason, and add a short example..."}">${esc(currentResp)}</textarea>
            </div>
          </details>

          <div class="control-actions">
            ${safeIdx > 0 ? `<button type="button" class="ghost-button" data-mock-speak-prev="true" ${activeCapture ? "disabled" : ""}>Previous</button>` : ""}
            ${safeIdx < list.length - 1
              ? `<button type="button" class="primary-button" data-mock-speak-next="true" ${activeCapture ? "disabled" : ""}>Next Speaking Item</button>`
              : isRepeat
              ? `<button type="button" class="primary-button" data-mock-speak-to-int="true" ${activeCapture ? "disabled" : ""}>Start Interview (4 Questions)</button>`
              : `<button type="button" class="primary-button" data-mock-finish="true">See results</button>`
            }
          </div>
        </div>
      </section>
    `;
  }

  function renderResultsScreen() {
    const rep = mockState.lastReport;
    if (!rep) return renderSelectScreen();
    const m = mockState.mock;

    return `
      <section class="suite-focus">
        <div class="practice-board suite-stack-lg">
          <div class="practice-header">
            <div>
              <h1 class="study-page-title">Practice test results</h1>
              <p class="prompt-note">${esc(displayMockTitle(rep.mockTitle))} · Review your answers and compare them with the examples below.</p>
            </div>
            <button type="button" class="primary-button" data-mock-back-list="true">See all tests</button>
          </div>

          <div class="mock-score-grid">
            <div class="mini-stat"><span>Reading</span><strong>${rep.reading.correct}/${rep.reading.total}</strong><small>${Math.round((rep.reading.correct / Math.max(1, rep.reading.total)) * 100)}% correct</small></div>
            <div class="mini-stat"><span>Listening</span><strong>${rep.listening.correct}/${rep.listening.total}</strong><small>${Math.round((rep.listening.correct / Math.max(1, rep.listening.total)) * 100)}% correct</small></div>
            <div class="mini-stat"><span>Writing</span><strong>${rep.writing.basCorrect}/${rep.writing.basTotal}</strong><small>sentences correct · ${rep.writing.emailWc} email words · ${rep.writing.discWc} discussion words</small></div>
            <div class="mini-stat"><span>Speaking</span><strong>${rep.speaking.skipped ? "Skipped" : rep.speaking.recorded}</strong><small>${rep.speaking.skipped ? "" : `${rep.speaking.recorded === 1 ? "recording" : "recordings"} · ${rep.speaking.answered} typed ${rep.speaking.answered === 1 ? "answer" : "answers"}`}</small></div>
          </div>

          ${(() => {
            const ctwItems = rep.rReview.filter((x) => x.q.startsWith("Complete word:"));
            const ctwOk = ctwItems.filter((x) => x.ok).length;
            const rpItems = rep.rReview.filter((x) => !x.q.startsWith("Complete word:"));
            const rpOk = rpItems.filter((x) => x.ok).length;
            const recs = [
              { label: "Reading: Complete the Words", pct: Math.round((ctwOk / Math.max(1, ctwItems.length)) * 100), note: `${ctwOk}/${ctwItems.length}`, tab: "reading" },
              { label: "Reading: Passages", pct: Math.round((rpOk / Math.max(1, rpItems.length)) * 100), note: `${rpOk}/${rpItems.length}`, tab: "reading" },
              { label: "Listening (All Tasks)", pct: Math.round((rep.listening.correct / Math.max(1, rep.listening.total)) * 100), note: `${rep.listening.correct}/${rep.listening.total}`, tab: "listening" },
              { label: "Writing: Build a Sentence", pct: Math.round((rep.writing.basCorrect / Math.max(1, rep.writing.basTotal)) * 100), note: `${rep.writing.basCorrect}/${rep.writing.basTotal}`, tab: "writing" }
            ].sort((a, b) => a.pct - b.pct);
            return `
              <div class="suite-idea-card">
                <h3>Diagnostic Priority Breakdown</h3>
                <ul class="course-rules">
                  ${recs.map((r) => `<li><strong>${esc(r.label)}</strong>: ${esc(r.note)} (${r.pct}%)</li>`).join("")}
                  <li><strong>Writing Output</strong>: Email ${rep.writing.emailWc} words (target 90-130) · Discussion ${rep.writing.discWc} words (target 100-140)</li>
                  <li><strong>Speaking Output</strong>: ${rep.speaking.skipped ? "Skipped (practice Listen & Repeat + Interview with mic)" : `${rep.speaking.recorded} recorded, ${rep.speaking.answered} typed`}</li>
                </ul>
              </div>
            `;
          })()}

          <div class="control-actions">
            <button type="button" class="tool-button" data-mock-copy-writing="true">Copy writing for feedback</button>
          </div>

          ${recordings.size ? `<details class="suite-details"><summary>Review speaking recordings</summary>
            <p>Listen for wording, clarity, and whether each answer addresses the question. Recordings stay in this test view until you leave it.</p>
            ${[...recordings].map(([key, url]) => {
              const [kind, index] = key.split(":");
              const prompt = mockState.speakingItems[kind][Number(index)]?.text;
              return `<div><p>${kind === "repeat" ? "Listen and Repeat" : "Interview"} ${Number(index) + 1} · ${esc(prompt)}</p><audio controls class="suite-audio-player" src="${esc(url)}"></audio></div>`;
            }).join("")}</details>` : ""}

          <details open class="suite-details">
            <summary><strong>Reading Review (${rep.reading.correct}/${rep.reading.total})</strong></summary>
            <div class="suite-stack-sm suite-mt-sm">
              ${rep.rReview.map((item) => `
                <div class="mock-review-row ${item.ok ? "ok" : "bad"}">
                  <div><strong>${esc(item.q)}</strong></div>
                  <div>Your answer: ${esc(item.yours)} | Correct: <strong>${esc(item.expected)}</strong></div>
                  ${item.explanation ? `<small>${esc(item.explanation)}</small>` : ""}
                </div>
              `).join("")}
            </div>
          </details>

          <details class="suite-details">
            <summary><strong>Listening Review (${rep.listening.correct}/${rep.listening.total})</strong></summary>
            <div class="suite-stack-sm suite-mt-sm">
              ${rep.lReview.map((item) => `
                <div class="mock-review-row ${item.ok ? "ok" : "bad"}">
                  <div><strong>${esc(item.section)}:</strong> ${esc(item.q)}</div>
                  <div>Your answer: ${esc(item.yours)} | Correct: <strong>${esc(item.expected)}</strong></div>
                  ${item.explanation ? `<small>${esc(item.explanation)}</small>` : ""}
                </div>
              `).join("")}
            </div>
          </details>

          <details class="suite-details">
            <summary><strong>Writing Review (Build a Sentence ${rep.writing.basCorrect}/${rep.writing.basTotal} + Sample Essays)</strong></summary>
            <div class="suite-stack-sm suite-mt-sm">
              ${rep.basReview.map((item) => `
                <div class="mock-review-row ${item.ok ? "ok" : "bad"}">
                  <div><strong>${esc(item.q)}</strong></div>
                  <div>Yours: ${esc(item.yours)} | Correct: <strong>${esc(item.expected)}</strong></div>
                </div>
              `).join("")}
              ${m && m.writing.email ? `<div class="suite-model-box"><strong>Sample Email:</strong><pre class="suite-pre">${esc(m.writing.email.modelEmail)}</pre></div>` : ""}
              ${m && m.writing.discussion ? `<div class="suite-model-box"><strong>Sample Discussion Response:</strong><p>${esc(m.writing.discussion.modelResponse || "")}</p></div>` : ""}
            </div>
          </details>
        </div>
      </section>
    `;
  }

  function renderView() {
    if (mockState.phase === "select" || !mockState.mock) return renderSelectScreen();
    if (mockState.phase === "reading1" || mockState.phase === "reading2") return renderReadingPhase();
    if (mockState.phase === "listening1" || mockState.phase === "listening2") return renderListeningPhase();
    if (mockState.phase === "writing") return renderWritingPhase();
    if (mockState.phase === "speaking") return renderSpeakingPhase();
    return renderResultsScreen();
  }

  function bindEvents() {
    const doc = global.document;
    if (!doc || !doc.querySelector) return;

    doc.querySelectorAll("[data-mock-start]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.mockStart);
        const mk = (getMocksData().mocks || [])[idx];
        if (mk) startMock(mk);
      });
    });

    const diagBtn = doc.querySelector("[data-mock-diagnostic]");
    if (diagBtn) {
      diagBtn.addEventListener("click", () => {
        const d = buildDiagnosticMock();
        if (d) startMock(d);
      });
    }
    const randBtn = doc.querySelector("[data-mock-random]");
    if (randBtn) randBtn.addEventListener("click", () => startMock(pickRandomMock()));

    const quitBtn = doc.querySelector("[data-mock-quit]");
    if (quitBtn) {
      quitBtn.addEventListener("click", () => {
        if (!global.confirm("Exit this test? This attempt will not be saved.")) return;
        stopTimer();
        stopSpeech();
        clearRecordings();
        mockState.phase = "select";
        render();
      });
    }

    const backList = doc.querySelector("[data-mock-back-list]");
    if (backList) {
      backList.addEventListener("click", () => {
        clearRecordings();
        mockState.phase = "select";
        render();
      });
    }

    const nextPhaseBtn = doc.querySelector("[data-mock-next-phase]");
    if (nextPhaseBtn) nextPhaseBtn.addEventListener("click", advancePhase);

    // Reading CTW blanks
    const ctwInputs = Array.from(doc.querySelectorAll("[data-mock-ctw]"));
    ctwInputs.forEach((inp, idx) => {
      inp.addEventListener("input", (e) => {
        if (!mockState.ctwInputs[mockState.phase]) mockState.ctwInputs[mockState.phase] = {};
        mockState.ctwInputs[mockState.phase][Number(e.target.dataset.mockCtw)] = e.target.value;
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const nxt = ctwInputs[idx + 1];
          if (nxt && typeof nxt.focus === "function") nxt.focus();
        }
      });
    });

    // Reading MCQs
    doc.querySelectorAll("[data-mock-rmcq]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const parts = btn.dataset.mockRmcq.split("::");
        mockState.readingMcq[parts[0]] = parts.slice(1).join("::");
        render();
      });
    });

    // Listening controls
    doc.querySelectorAll("[data-mock-lmcq]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const parts = btn.dataset.mockLmcq.split("::");
        mockState.listenMcq[parts[0]] = parts.slice(1).join("::");
        btn.parentElement.querySelectorAll("[data-mock-lmcq]").forEach((option) => {
          option.classList.toggle("active", option === btn);
          option.setAttribute("aria-pressed", String(option === btn));
        });
      });
    });
    const lPrev = doc.querySelector("[data-mock-listen-prev]");
    if (lPrev) lPrev.addEventListener("click", () => { stopSpeech(); mockState.listenIdx = Math.max(0, mockState.listenIdx - 1); render(); });
    const lNext = doc.querySelector("[data-mock-listen-next]");
    if (lNext) lNext.addEventListener("click", () => { stopSpeech(); mockState.listenIdx += 1; render(); });

    // Writing controls
    doc.querySelectorAll("[data-mock-bas-chip]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const slots = mockState.basSlots[mockState.basIdx] || [];
        const empty = slots.findIndex((x) => !x);
        if (empty >= 0) {
          slots[empty] = btn.dataset.mockBasChip;
          render();
        }
      });
    });
    doc.querySelectorAll("[data-mock-bas-slot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const slots = mockState.basSlots[mockState.basIdx] || [];
        slots[Number(btn.dataset.mockBasSlot)] = null;
        render();
      });
    });
    const basClear = doc.querySelector("[data-mock-bas-clear]");
    if (basClear) basClear.addEventListener("click", () => { mockState.basSlots[mockState.basIdx] = (mockState.basSlots[mockState.basIdx] || []).map(() => null); render(); });
    const basPrev = doc.querySelector("[data-mock-bas-prev]");
    if (basPrev) basPrev.addEventListener("click", () => { mockState.basIdx = Math.max(0, mockState.basIdx - 1); render(); });
    doc.querySelectorAll("[data-mock-bas-next]").forEach((button) => {
      button.addEventListener("click", () => { mockState.basIdx += 1; render(); });
    });

    const emIn = doc.querySelector("[data-mock-email]");
    if (emIn) {
      emIn.addEventListener("input", (e) => {
        mockState.emailText = e.target.value;
        const wc = countWords(mockState.emailText);
        const wcEl = doc.querySelector("#mockEmailWc");
        const fillEl = doc.querySelector("#mockEmailFill");
        if (wcEl) wcEl.textContent = String(wc);
        if (fillEl) {
          fillEl.style.width = `${Math.min(100, Math.round((wc / 130) * 100))}%`;
          if (fillEl.classList) fillEl.classList.toggle("in-range", wc >= 90 && wc <= 130);
        }
      });
    }
    const dcIn = doc.querySelector("[data-mock-disc]");
    if (dcIn) {
      dcIn.addEventListener("input", (e) => {
        mockState.discText = e.target.value;
        const wc = countWords(mockState.discText);
        const wcEl = doc.querySelector("#mockDiscWc");
        const fillEl = doc.querySelector("#mockDiscFill");
        if (wcEl) wcEl.textContent = String(wc);
        if (fillEl) {
          fillEl.style.width = `${Math.min(100, Math.round((wc / 140) * 100))}%`;
          if (fillEl.classList) fillEl.classList.toggle("in-range", wc >= 100 && wc <= 140);
        }
      });
    }

    // Speaking controls
    const spPlay = doc.querySelector("[data-mock-speak-play]");
    if (spPlay) {
      spPlay.addEventListener("click", () => {
        const list = mockState.speakSub === "repeat" ? mockState.speakingItems.repeat : mockState.speakingItems.interview;
        const item = list[mockState.speakIdx];
        if (item) speakText(item.text);
      });
    }
    doc.querySelector("[data-mock-record]")?.addEventListener("click", toggleRecording);
    const spIn = doc.querySelector("[data-mock-speak-input]");
    if (spIn) {
      spIn.addEventListener("input", (e) => {
        if (mockState.speakSub === "repeat") mockState.repeatResponses[mockState.speakIdx] = e.target.value;
        else mockState.interviewResponses[mockState.speakIdx] = e.target.value;
      });
    }
    const spPrev = doc.querySelector("[data-mock-speak-prev]");
    if (spPrev) spPrev.addEventListener("click", () => { if (activeCapture) return; stopSpeech(); recordingStatus = ""; mockState.speakIdx = Math.max(0, mockState.speakIdx - 1); render(); });
    const spNext = doc.querySelector("[data-mock-speak-next]");
    if (spNext) spNext.addEventListener("click", () => { if (activeCapture) return; stopSpeech(); recordingStatus = ""; mockState.speakIdx += 1; render(); });
    const spToInt = doc.querySelector("[data-mock-speak-to-int]");
    if (spToInt) spToInt.addEventListener("click", () => { if (activeCapture) return; stopSpeech(); recordingStatus = ""; mockState.speakSub = "interview"; mockState.speakIdx = 0; render(); });
    const spSkip = doc.querySelector("[data-mock-skip-speaking]");
    if (spSkip) spSkip.addEventListener("click", () => finishSpeaking(true));
    const spFinish = doc.querySelector("[data-mock-finish]");
    if (spFinish) spFinish.addEventListener("click", () => finishSpeaking());

    const copyEssays = doc.querySelector("[data-mock-copy-writing]");
    if (copyEssays) {
      copyEssays.addEventListener("click", () => {
        const m = mockState.mock;
        const txt = `Give feedback on my TOEFL practice writing. For each task, identify one strength and one improvement, and explain why.\n\nEMAIL TASK:\n${m.writing.email.scenario}\n\nMY EMAIL:\n${mockState.emailText}\n\nDISCUSSION TASK:\n${m.writing.discussion.professorPrompt}\n\nMY RESPONSE:\n${mockState.discText}`;
        global.navigator?.clipboard?.writeText(txt);
        if (typeof showToast === "function") showToast("Copied both essays for AI feedback.");
      });
    }
  }

  global.ToeflFullMock = {
    state: mockState,
    buildDiagnosticMock,
    pickRandomMock,
    startMock,
    leaveResults() {
      if (mockState.phase !== "results") return;
      clearRecordings();
      mockState.phase = "select";
    },
    advancePhase,
    finishAndScore,
    render: renderView,
    bindEvents
  };
})(typeof window !== "undefined" ? window : globalThis);
