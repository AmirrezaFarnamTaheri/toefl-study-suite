const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;

const state = {
  tab: "starter",
  mode: "repeat",
  currentRepeat: QUESTION_BANK.repeat[0],
  currentInterview: QUESTION_BANK.interview[0],
  showSentence: false,
  transcript: "",
  feedback: null,
  isRecording: false,
  status: "Ready",
  elapsed: 0,
  duration: 0,
  audioUrl: "",
  audioBlob: null,
  isScoring: false,
  audioStats: null,
  audioAnalysisPending: false,
  recordingTarget: "main",
  recognitionStats: {
    confidenceSamples: [],
    finalSegments: 0,
    interimSegments: 0
  },
  mediaRecorder: null,
  stream: null,
  recognition: null,
  timerId: null,
  lastSavedSignature: "",
  setup: loadSetupConfig(),
  ladder: loadLadderProfile(),
  coach: getDefaultCoachState(),
  starter: getDefaultStarterState(),
  wordDrill: getDefaultWordDrillState(),
  mistakeReview: getDefaultMistakeReviewState(),
  bankType: "all",
  bankDifficulty: "all",
  mistakeBookMode: "sounds",
  wordMistakeFilter: "all",
  toast: "",
  full: {
    active: false,
    complete: false,
    examMode: true,
    sequence: [],
    index: 0,
    results: []
  }
};

const app = document.querySelector("#app");

function init() {
  state.currentRepeat = randomItem(QUESTION_BANK.repeat);
  state.currentInterview = randomItem(QUESTION_BANK.interview);
  render();
}

function render() {
  app.innerHTML = `
    <div class="app-shell">
      ${renderTopbar()}
      ${renderNav()}
      <main class="content">
        ${renderActiveTab()}
      </main>
      ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ""}
    </div>
  `;
  bindEvents();
  updateTimerDom();
}

function renderTopbar() {
  const history = loadHistory();
  const average = averageScore(history);
  const todayCount = history.filter((item) => isToday(item.createdAt)).length;
  const ladderLabel = state.ladder && state.ladder.diagnosed ? (LADDER_LEVELS[state.ladder.level] || LADDER_LEVELS[1]).name : "Undiagnosed";
  return `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">TS</div>
        <div>
          <h1 class="brand-title">VoxPilot Speaking Lab</h1>
          <p class="brand-subtitle">2026 Academic Speaking Studio · Local-First · Zero Login</p>
        </div>
      </div>
      <div class="top-actions">
        <span class="stat-pill"><strong>${todayCount}</strong> Today</span>
        <span class="stat-pill"><strong>${average || "-"}</strong> Recent Avg</span>
        <span class="stat-pill"><strong>${history.length}</strong> Saved Runs</span>
        <span class="stat-pill"><strong>${escapeHtml(ladderLabel)}</strong> Ladder</span>
        <span class="stat-pill"><strong>${QUESTION_BANK.repeat.length + QUESTION_BANK.interview.length}</strong> Prompts</span>
      </div>
    </header>
  `;
}

function renderNav() {
  const tabs = [
    ["starter", "Start Easy"],
    ["ladder", "Ladder"],
    ["practice", "Studio"],
    ["full", "Full Sim"],
    ["bank", "Prompt Bank"],
    ["mistakes", "Error Log"],
    ["history", "History"],
    ["setup", "Setup"]
  ];
  return `
    <nav class="main-nav" aria-label="Primary navigation">
      ${tabs
        .map(
          ([id, label]) => `
            <button class="nav-button ${state.tab === id ? "active" : ""}" data-tab="${id}">
              ${label}
            </button>
          `
        )
        .join("")}
    </nav>
  `;
}

function renderActiveTab() {
  if (state.tab === "starter") return renderStarterView();
  if (state.tab === "ladder") return renderLadderView();
  if (state.tab === "full") return renderFullRunView();
  if (state.tab === "bank") return renderBankView();
  if (state.tab === "mistakes") return renderMistakeBookView();
  if (state.tab === "history") return renderHistoryView();
  if (state.tab === "setup") return renderSetupView();
  return renderPracticeView();
}

function renderPracticeView() {
  return `
    <section class="workspace">
      <aside class="panel">
        <h2>Daily Studio</h2>
        <p class="compact-copy">Listen carefully, speak steadily. Review diagnostic feedback immediately after each attempt and record a focused retake.</p>
        <div class="segmented" role="group" aria-label="Practice mode">
          <button class="${state.mode === "repeat" ? "active" : ""}" data-mode="repeat">Listen & Repeat</button>
          <button class="${state.mode === "interview" ? "active" : ""}" data-mode="interview">Interview</button>
        </div>
        ${renderMiniStats()}
      </aside>
      <div>
        ${renderPracticeCard(false)}
        ${renderFeedback()}
      </div>
    </section>
  `;
}

function renderStarterView() {
  const starter = state.starter;
  const question = getStarterQuestion();
  const steps = getStarterSteps(question);
  const step = steps[starter.step - 1] || steps[0];
  const completedToday = getTodayStarterCompletions();
  const isRepeat = question.type === "repeat";
  return `
    <section class="workspace starter-workspace">
      <aside class="panel starter-panel">
        <span class="badge blue">Start Easy</span>
        <h2>Start Easy · 4-Step Scaffold</h2>
        <p class="compact-copy">Break each speaking prompt into 4 manageable micro-steps. Steps 1–3 evaluate only the immediate target; Step 4 returns to full local scoring.</p>
        <div class="segmented" role="group" aria-label="Starter mode">
          <button class="${starter.mode === "interview" ? "active" : ""}" data-starter-mode="interview">Interview Scaffold</button>
          <button class="${starter.mode === "repeat" ? "active" : ""}" data-starter-mode="repeat">Repeat Scaffold</button>
        </div>
        <div class="starter-step-list">
          ${steps.map((item, index) => `
            <div class="starter-step ${starter.step === index + 1 ? "active" : ""} ${starter.step > index + 1 ? "done" : ""}">
              <span>${index + 1}</span>
              <div>
                <strong>${escapeHtml(item.title)}</strong>
                <small>${escapeHtml(item.microGoal)}</small>
              </div>
            </div>
          `).join("")}
        </div>
        <div class="mini-stats">
          <div class="mini-stat">
            <span>Completed Today</span>
            <strong>${completedToday}</strong>
          </div>
          <div class="mini-stat">
            <span>Current Step</span>
            <strong>${starter.step}/4</strong>
          </div>
        </div>
      </aside>
      <div>
        <section class="practice-board starter-board">
          <div class="practice-header">
            <div>
              <div class="badge-row">
                <span class="badge">Start Easy</span>
                <span class="badge ${isRepeat ? "violet" : "blue"}">${isRepeat ? "Listen & Repeat" : "Take an Interview"}</span>
                <span class="badge orange">Step ${starter.step}/4</span>
                <span class="badge">${escapeHtml(step.interactionLabel)}</span>
                <span class="badge blue">${escapeHtml(question.category)}</span>
              </div>
              <h2 class="question-text starter-question">${escapeHtml(step.displayText)}</h2>
              <p class="prompt-note">${escapeHtml(step.promptNote)}</p>
            </div>
            <div class="question-actions">
              ${isRepeat && starter.step === 4 ? `<button class="ghost-button" data-starter-show-sentence="true"><span class="button-icon">Aa</span>${state.showSentence ? "Hide Sentence" : "Show Sentence"}</button>` : ""}
              <button class="ghost-button" data-play-prompt="true"><span class="button-icon">▶</span>${isRepeat ? "Play Sentence" : "Read Prompt"}</button>
              <button class="ghost-button" data-starter-new-question="true"><span class="button-icon">↻</span>New Prompt</button>
            </div>
          </div>

          <div class="starter-mission">
            <div>
              <span class="badge">Step Goal</span>
              <h3>${escapeHtml(step.title)}</h3>
              <p>${escapeHtml(step.mission)}</p>
            </div>
            <div class="starter-template">
              <span>${escapeHtml(step.templateLabel)}</span>
              <strong>${escapeHtml(step.template)}</strong>
            </div>
          </div>

          ${renderStarterScaffold(step)}

          <div class="control-band">
            <div class="record-control">
              <button class="record-button ${state.isRecording && state.recordingTarget === "starter" ? "recording" : ""}" data-starter-record-toggle="true" aria-label="${state.isRecording ? "Stop Recording" : "Start Recording"}">
                <span class="record-dot"></span>
              </button>
              <span class="timer" id="timer">${formatTime(state.elapsed)}</span>
            </div>
            <div>
              <div class="control-actions">
                <button class="primary-button" data-starter-record-toggle="true">
                  <span class="button-icon">${state.isRecording && state.recordingTarget === "starter" ? "■" : "●"}</span>
                  ${state.isRecording && state.recordingTarget === "starter" ? "Stop Recording" : "Start Recording"}
                </button>
                <button class="tool-button" data-analyze-starter="true"><span class="button-icon">✓</span>Check Step</button>
                <button class="tool-button" data-clear-starter="true"><span class="button-icon">×</span>Clear Step</button>
                ${starter.feedback && starter.step < 4 ? `<button class="tool-button" data-starter-next-step="true"><span class="button-icon">→</span>Next Step</button>` : ""}
                ${starter.feedback && starter.step === 4 ? `<button class="tool-button" data-starter-to-practice="true"><span class="button-icon">→</span>Open in Studio</button>` : ""}
              </div>
              <div class="status-line">
                <span class="status-dot ${state.isRecording && state.recordingTarget === "starter" ? "recording" : starter.feedback ? "done" : "ready"}"></span>
                <span>${escapeHtml(state.status)}</span>
              </div>
              ${state.audioUrl ? `<audio class="audio-player" controls src="${state.audioUrl}"></audio>` : ""}
            </div>
          </div>

          <div class="transcript-area">
            <label for="starterTranscriptInput">Your Response Transcript</label>
            <textarea id="starterTranscriptInput" placeholder="${SpeechRecognitionApi ? "Auto-transcribed while recording, or type/edit your response manually." : "Browser speech recognition is unavailable; please type what you said manually."}">${escapeHtml(state.transcript)}</textarea>
          </div>
        </section>
        ${renderStarterFeedback()}
      </div>
    </section>
  `;
}

function renderStarterScaffold(step) {
  const items = step.scaffold || [];
  if (!items.length) return "";
  return `
    <section class="starter-scaffold ${step.scaffoldType || ""}">
      <div class="section-title-row">
        <h3>${escapeHtml(step.scaffoldTitle || "Step Scaffold")}</h3>
        <span class="badge">${escapeHtml(step.interactionLabel)}</span>
      </div>
      <div class="starter-scaffold-grid">
        ${items.map((item, index) => `
          <div class="starter-scaffold-item">
            <span>${index + 1}</span>
            <strong>${escapeHtml(item.label || item)}</strong>
            ${item.detail ? `<small>${escapeHtml(item.detail)}</small>` : ""}
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderStarterFeedback() {
  const feedback = state.starter.feedback;
  if (!feedback) {
    return `
      <section class="feedback-board starter-feedback">
        <div class="empty-feedback">Record or enter your response for this step. Only the current micro-goal is evaluated locally (no external AI calls).</div>
      </section>
    `;
  }
  const resultClass = feedback.result === "pass" ? "pass" : feedback.result === "almost" ? "almost" : "retry";
  return `
    <section class="feedback-board starter-feedback">
      <div class="starter-result ${resultClass}">
        <div>
          <span class="badge">${escapeHtml(feedback.label)}</span>
          <h2>${escapeHtml(feedback.summary)}</h2>
          <p class="compact-copy">${escapeHtml(feedback.nextAction)}</p>
        </div>
        ${feedback.score ? `<div class="starter-score"><strong>${feedback.score}</strong><span>/ 6</span></div>` : ""}
      </div>
      <div class="starter-check-grid">
        ${feedback.checks.map((item) => `
          <div class="starter-check ${item.passed ? "passed" : ""}">
            <span>${item.passed ? "✓" : "•"}</span>
            <div>
              <strong>${escapeHtml(item.label)}</strong>
              <p>${escapeHtml(item.detail)}</p>
            </div>
          </div>
        `).join("")}
      </div>
      ${feedback.fullFeedback ? `
        <section class="feedback-section wide-section">
          <h3>Full Prompt Local Evaluation</h3>
          <p class="compact-copy">${escapeHtml(feedback.fullFeedback.summary)}</p>
          ${feedback.fullFeedback.confidence ? renderScoringConfidence(feedback.fullFeedback.confidence) : ""}
          ${feedback.fullFeedback.detailScores ? renderScoreBreakdown(feedback.fullFeedback.detailScores) : ""}
        </section>
      ` : ""}
    </section>
  `;
}

function renderMiniStats() {
  const history = loadHistory();
  const repeatItems = history.filter((item) => item.type === "repeat");
  const interviewItems = history.filter((item) => item.type === "interview");
  return `
    <div class="mini-stats">
      <div class="mini-stat">
        <span>Repeat Avg</span>
        <strong>${averageScore(repeatItems) || "-"}</strong>
      </div>
      <div class="mini-stat">
        <span>Interview Avg</span>
        <strong>${averageScore(interviewItems) || "-"}</strong>
      </div>
      <div class="mini-stat">
        <span>Recent Items</span>
        <strong>${history.slice(0, 10).length}</strong>
      </div>
      <div class="mini-stat">
        <span>Action</span>
        <strong>${history.length ? "Practice" : "Start"}</strong>
      </div>
    </div>
  `;
}

function renderLadderView() {
  const profile = state.ladder;
  if (!profile.diagnosed) return renderLadderDiagnostic(profile);

  const level = LADDER_LEVELS[profile.level] || LADDER_LEVELS[1];
  const step = getCurrentLadderStep(profile);
  const plan = getTodayLadderPlan(profile);
  const recentAverage = averageScore((profile.recent || []).slice(0, 8));
  const progress = getStepProgress(profile, step.id);
  const recommendation = DRILL_LIBRARY[profile.recommendedDrill] || DRILL_LIBRARY["example-builder"];
  const coachProfile = loadCoachProfile();

  return `
    <section class="ladder-board">
      <div class="ladder-hero">
        <div>
          <div class="badge-row">
            <span class="badge violet">VoxPilot Ladder</span>
            <span class="badge blue">${escapeHtml(level.name)}</span>
            <span class="badge orange">Step ${profile.step}/5</span>
          </div>
          <h2>${escapeHtml(step.title)}</h2>
          <p>${escapeHtml(level.target)}</p>
        </div>
        <div class="ladder-score">
          <span>Recent Avg</span>
          <strong>${recentAverage || "-"}</strong>
        </div>
      </div>

      <div class="ladder-grid">
        <section class="feedback-section">
          <h3>Current Step</h3>
          <p class="upgrade-answer">${escapeHtml(step.goal)}</p>
          <div class="ladder-progress">
            <div class="progress-track">
              <div class="progress-fill" style="width: ${Math.min(100, progress.points * 33.34)}%"></div>
            </div>
            <span>${progress.points}/3 stable passes to level up this step</span>
          </div>
          <div class="item-meta">
            <span class="badge">${escapeHtml(DRILL_LIBRARY[step.drill].label)}</span>
            <span class="badge blue">${escapeHtml(step.difficulty)}</span>
          </div>
        </section>

        <section class="feedback-section">
          <h3>Recommended Fix</h3>
          <p class="upgrade-answer">${escapeHtml(recommendation.tip)}</p>
          <div class="item-meta">
            <span class="badge orange">${escapeHtml(recommendation.label)}</span>
            ${(profile.weaknesses || []).slice(0, 3).map((item) => `<span class="badge blue">${escapeHtml(item)}</span>`).join("")}
          </div>
          ${state.setup.coach?.enabled ? `
            <div class="coach-inline-actions">
              <button class="primary-button" data-start-coach-ladder="true"><span class="button-icon">◎</span>Practice Fix with Coach</button>
            </div>
          ` : ""}
        </section>
      </div>

      ${renderCoachProfileSummary(coachProfile)}
      ${state.coach.active ? renderCoachCapsule() : ""}

      <section class="feedback-section wide-section">
        <div class="history-top">
          <div>
            <h3>Today's Ladder</h3>
            <p class="compact-copy">Follow the sequence: Warm-up, Core Task, Weakness Fix, and Checkpoint. Your Ladder rank updates automatically after each scored item.</p>
          </div>
          <button class="ghost-button" data-reset-ladder-plan="true"><span class="button-icon">↻</span>Regenerate Plan</button>
        </div>
        <div class="ladder-plan">
          ${plan.tasks
            .map((task, index) => renderLadderTask(task, index))
            .join("")}
        </div>
      </section>

      <section class="feedback-section wide-section">
        <div class="history-top">
          <div>
            <h3>Level Control</h3>
            <p class="compact-copy">Want to recalibrate your placement level? Retake the 6-item diagnostic anytime.</p>
          </div>
          <button class="danger-button" data-reset-ladder="true"><span class="button-icon">×</span>Reset Ladder</button>
        </div>
      </section>
    </section>
  `;
}

function renderLadderDiagnostic(profile) {
  const diagnostic = profile.diagnostic || null;
  const active = diagnostic && diagnostic.active;
  const total = active ? diagnostic.sequence.length : 6;
  const done = active ? diagnostic.results.length : 0;
  const currentQuestion = active ? getQuestionById(diagnostic.sequence[Math.min(diagnostic.index, diagnostic.sequence.length - 1)]) : null;

  return `
    <section class="ladder-board">
      <div class="ladder-hero">
        <div>
          <div class="badge-row">
            <span class="badge violet">VoxPilot Ladder</span>
            <span class="badge blue">Diagnostic</span>
          </div>
          <h2>Start From Your Real Level</h2>
          <p>Complete a 6-item diagnostic (3 Listen & Repeat + 3 Interview questions). The engine assigns your starting Ladder tier and training focus.</p>
        </div>
        <div class="ladder-score">
          <span>Progress</span>
          <strong>${done}/${total}</strong>
        </div>
      </div>

      <section class="feedback-section wide-section">
        <h3>${active ? "Continue Diagnostic" : "Diagnostic Set"}</h3>
        <p class="compact-copy">
          ${active && currentQuestion ? `Next Prompt: ${escapeHtml(currentQuestion.text)}` : "The diagnostic starts with accessible items and scales up to medium and challenging prompts."}
        </p>
        <div class="summary-grid">
          <div class="summary-tile"><span>Repeat</span><strong>3</strong></div>
          <div class="summary-tile"><span>Interview</span><strong>3</strong></div>
          <div class="summary-tile"><span>Time</span><strong>8m</strong></div>
          <div class="summary-tile"><span>Result</span><strong>Level</strong></div>
        </div>
        <div class="control-actions" style="margin-top: 16px">
          <button class="primary-button" data-ladder-diagnostic-next="true">
            <span class="button-icon">▶</span>${active ? "Resume Diagnostic" : "Start Diagnostic"}
          </button>
          ${active ? `<button class="ghost-button" data-reset-ladder="true"><span class="button-icon">×</span>Restart</button>` : ""}
        </div>
      </section>
    </section>
  `;
}

function renderLadderTask(task, index) {
  const question = getQuestionById(task.questionId);
  const completed = task.completed ? "done" : "";
  return `
    <article class="ladder-task ${completed}">
      <div>
        <div class="item-meta">
          <span class="badge">${escapeHtml(task.label)}</span>
          <span class="badge blue">${question ? (question.type === "repeat" ? "Repeat" : "Interview") : "Mixed"}</span>
          <span class="badge orange">${escapeHtml(task.drillLabel)}</span>
        </div>
        <p class="item-title">${escapeHtml(task.goal)}</p>
        <p class="compact-copy">${question ? escapeHtml(question.text) : "Question will be selected when you start."}</p>
      </div>
      <button class="${task.completed ? "ghost-button" : "small-button"}" data-ladder-plan-index="${index}">
        ${task.completed ? "Redo" : "Start"}
      </button>
    </article>
  `;
}

function renderPracticeCard(isFullRun) {
  const question = getActiveQuestion(isFullRun);
  const isRepeat = question.type === "repeat";
  const examLocked = isFullRun && state.full.examMode;
  const text = isRepeat && !state.showSentence ? "Click Play to hear the prompt and repeat it verbatim. Reveal the sentence afterward to compare." : question.text;
  const difficultyClass = question.difficulty === "Hard" ? "orange" : question.difficulty === "Medium" ? "blue" : "";
  const fullProgress = isFullRun ? renderFullProgress() : "";

  return `
    <section class="practice-board">
      ${fullProgress}
      <div class="practice-header">
        <div>
          <div class="badge-row">
            <span class="badge">${isRepeat ? "Listen and Repeat" : "Take an Interview"}</span>
            <span class="badge blue">${escapeHtml(question.category)}</span>
            <span class="badge ${difficultyClass}">${escapeHtml(question.difficulty)}</span>
          </div>
          <h2 class="question-text ${isRepeat ? "sentence-text" : ""} ${isRepeat && !state.showSentence ? "blurred" : ""}">
            ${escapeHtml(text)}
          </h2>
          <p class="prompt-note">
            ${isRepeat ? escapeHtml(question.focus) : "Target 35–60s: State your claim directly, give a clear reason, add a concrete example, and wrap up."}
          </p>
        </div>
        <div class="question-actions">
          ${isRepeat && !examLocked ? `<button class="ghost-button" data-show-sentence="true"><span class="button-icon">Aa</span>${state.showSentence ? "Hide Sentence" : "Show Sentence"}</button>` : ""}
          <button class="ghost-button" data-play-prompt="true"><span class="button-icon">▶</span>${isRepeat ? "Play Audio" : "Read Prompt"}</button>
          ${!examLocked ? `<button class="ghost-button" data-next-question="true"><span class="button-icon">↻</span>${isFullRun ? "Swap Item" : "Next Prompt"}</button>` : ""}
        </div>
      </div>

      <div class="control-band">
        <div class="record-control">
          <button class="record-button ${state.isRecording ? "recording" : ""}" data-record-toggle="true" aria-label="${state.isRecording ? "Stop Recording" : "Start Recording"}">
            <span class="record-dot"></span>
          </button>
          <span class="timer" id="timer">${formatTime(state.elapsed)}</span>
        </div>
        <div>
          <div class="control-actions">
            <button class="primary-button" data-record-toggle="true">
              <span class="button-icon">${state.isRecording ? "■" : "●"}</span>
              ${state.isRecording ? "Stop Recording" : "Start Recording"}
            </button>
            <button class="tool-button" data-analyze="true"><span class="button-icon">✓</span>Analyze</button>
            <button class="tool-button" data-clear-current="true"><span class="button-icon">×</span>Clear</button>
            ${isFullRun && state.feedback ? `<button class="tool-button" data-full-next="true"><span class="button-icon">→</span>${state.full.index === state.full.sequence.length - 1 ? "Finish Run" : "Next Item"}</button>` : ""}
          </div>
          <div class="status-line">
            <span class="status-dot ${state.isRecording ? "recording" : state.feedback ? "done" : "ready"}"></span>
            <span>${escapeHtml(state.status)}</span>
          </div>
          ${state.audioUrl ? `<audio class="audio-player" controls src="${state.audioUrl}"></audio>` : ""}
        </div>
      </div>

      <div class="transcript-area">
        <label for="transcriptInput">Response Transcript</label>
        <textarea id="transcriptInput" placeholder="${SpeechRecognitionApi ? "Auto-transcribed while recording, or type/edit your response manually." : "Browser speech recognition is unavailable; please type your spoken response here."}">${escapeHtml(state.transcript)}</textarea>
      </div>
    </section>
  `;
}

function renderFullProgress() {
  const total = state.full.sequence.length || 11;
  const current = Math.min(state.full.index + 1, total);
  const percent = total ? Math.round((state.full.index / total) * 100) : 0;
  return `
    <div class="badge-row">
      <span class="badge violet">Full Sim ${current}/${total}</span>
      <span class="badge blue">~8 Min</span>
    </div>
    <div class="progress-track" aria-label="Full practice progress">
      <div class="progress-fill" style="width: ${percent}%"></div>
    </div>
    <div style="height: 18px"></div>
  `;
}

function renderFeedback() {
  if (!state.feedback) {
    return `
      <section class="feedback-board">
        <div class="empty-feedback">${state.isScoring ? "Generating diagnostic report (external APIs may take a few seconds)..." : "Record and analyze a response to view your band score, rubric breakdown, and targeted retake advice."}</div>
      </section>
    `;
  }

  const feedback = state.feedback;
  const meterWidth = Math.max(0, Math.min(100, Math.round((feedback.score / 6) * 100)));
  return `
    <section class="feedback-board">
      <h2>Diagnostic Feedback</h2>
      <p class="compact-copy">${escapeHtml(feedback.summary)}</p>
      ${feedback.confidence ? renderScoringConfidence(feedback.confidence) : ""}
      <div class="feedback-grid">
        <aside class="score-box">
          <div class="score-number">${feedback.score}<span>/ 6</span></div>
          <div class="meter"><div class="meter-fill" style="width: ${meterWidth}%"></div></div>
          <div class="metric-list">
            ${feedback.metrics
              .map(
                (metric) => `
                  <div class="metric-row">
                    <span>${escapeHtml(metric.label)}</span>
                    <strong>${escapeHtml(metric.value)}</strong>
                  </div>
                `
              )
              .join("")}
          </div>
        </aside>
        <div class="feedback-columns">
          <section class="feedback-section">
            <h3>Key Strengths</h3>
            <ul>${feedback.strengths.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </section>
          <section class="feedback-section">
            <h3>Priority Fixes</h3>
            <ul>${feedback.issues.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </section>
          ${feedback.detailScores ? renderScoreBreakdown(feedback.detailScores) : ""}
          ${feedback.rubricProfile ? renderRubricProfile(feedback.rubricProfile) : ""}
          ${feedback.comparison ? renderAttemptComparison(feedback.comparison) : ""}
          ${feedback.externalAi ? renderExternalAiSection(feedback.externalAi) : ""}
          ${feedback.pronunciation ? renderPronunciationSection(feedback.pronunciation) : ""}
          ${feedback.alignment ? renderDiffSection(feedback.alignment) : ""}
          <section class="feedback-section wide-section">
            <h3>${feedback.type === "repeat" ? "How to Improve Next Attempt" : "Model Upgraded Response"}</h3>
            <p class="upgrade-answer">${escapeHtml(feedback.improvedAnswer)}</p>
          </section>
        </div>
      </div>
      ${renderCoachEntryFromFeedback()}
      ${state.coach.active ? renderCoachCapsule() : ""}
    </section>
  `;
}

function renderCoachEntryFromFeedback() {
  if (!state.setup.coach?.enabled || !state.feedback || !cleanupSpacing(state.transcript) || state.coach.active) return "";
  const aiReady = canUseCoachAi();
  return `
    <section class="coach-entry">
      <div>
        <div class="badge-row">
          <span class="badge violet">Coach Capsule</span>
          <span class="badge">${aiReady ? "AI Deep Coach Ready" : "Local Rule Coach"}</span>
        </div>
        <h3>Want a targeted micro-drill for your retake?</h3>
        <p class="compact-copy">Coach isolates your single highest-leverage weakness, builds a focused micro-drill, and compares your retake against your first attempt.</p>
      </div>
      <button class="primary-button" data-start-coach-current="true"><span class="button-icon">◎</span>Launch Coach Capsule</button>
    </section>
  `;
}

function renderCoachCapsule() {
  const coach = state.coach;
  if (!coach.active) return "";
  const modeLabel = coach.usedAi ? "AI Coach" : "Basic Local Coach";
  return `
    <section class="coach-capsule">
      <div class="history-top">
        <div>
          <div class="badge-row">
            <span class="badge violet">Coach Deep Retake</span>
            <span class="badge blue">${escapeHtml(modeLabel)}</span>
            <span class="badge">${escapeHtml(coach.source || "practice")}</span>
          </div>
          <h2>From Feedback to Action</h2>
          <p class="compact-copy">Target one primary bottleneck at a time: Diagnose → Micro-Drill → Retake → Compare.</p>
        </div>
        <button class="ghost-button" data-coach-reset="true"><span class="button-icon">×</span>Close Coach</button>
      </div>
      ${renderCoachStepper(coach.phase)}
      ${coach.error ? `<div class="coach-alert">${escapeHtml(coach.error)}</div>` : ""}
      ${renderCoachDiagnosis()}
      ${renderCoachDrill()}
      ${renderCoachRetake()}
      ${renderCoachReflection()}
    </section>
  `;
}

function renderCoachStepper(phase) {
  const order = [
    ["diagnosing", "Diagnosis"],
    ["drill-ready", "Micro-Drill"],
    ["retaking", "Retake"],
    ["complete", "Reflection"]
  ];
  const activeIndex = Math.max(0, order.findIndex(([key]) => key === phase));
  const safeIndex = phase === "reflecting" ? 3 : activeIndex;
  return `
    <div class="coach-stepper">
      ${order.map(([key, label], index) => {
        const className = index < safeIndex ? "done" : index === safeIndex ? "active" : "";
        return `<div class="coach-step ${className}"><span>${index + 1}</span>${escapeHtml(label)}</div>`;
      }).join("")}
    </div>
  `;
}

function renderCoachDiagnosis() {
  const coach = state.coach;
  if (coach.phase === "diagnosing") {
    return `
      <section class="coach-card coach-diagnosis">
        <h3>Step 1 · Diagnosis</h3>
        <p class="upgrade-answer">Coach is analyzing the prompt, transcript, rubric scores, audio telemetry, and recent weakness history...</p>
      </section>
    `;
  }
  if (!coach.diagnosis) return "";
  const weaknessLabel = getWeaknessLabel(coach.diagnosis.primaryWeakness, coach.original.taskType);
  return `
    <section class="coach-card coach-diagnosis">
      <div class="section-title-row">
        <h3>Step 1 · Diagnosis</h3>
        <span class="badge orange">${escapeHtml(weaknessLabel)}</span>
      </div>
      <p class="upgrade-answer">${escapeHtml(coach.diagnosis.mainDiagnosis)}</p>
      <h4>Diagnostic Evidence</h4>
      <ul class="coach-evidence">
        ${(coach.diagnosis.evidence || []).slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function renderCoachDrill() {
  const coach = state.coach;
  if (!coach.drill || !["drill-ready", "retaking", "reflecting", "complete"].includes(coach.phase)) return "";
  return `
    <section class="coach-card coach-drill">
      <div class="section-title-row">
        <h3>Step 2 · Micro-Drill</h3>
        <span class="badge violet">${escapeHtml(coach.drill.title)}</span>
      </div>
      <p class="upgrade-answer">${escapeHtml(coach.drill.instruction)}</p>
      <div class="coach-mission">
        <strong>Retake Mission</strong>
        <p>${escapeHtml(coach.drill.retakeMission)}</p>
        <ul>
          ${(coach.drill.successCriteria || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
      ${coach.phase === "drill-ready" ? `
        <div class="control-actions">
          <button class="primary-button" data-start-coach-retake="true"><span class="button-icon">●</span>Start Coach Retake</button>
        </div>
      ` : ""}
    </section>
  `;
}

function renderCoachRetake() {
  const coach = state.coach;
  if (!["retaking", "reflecting", "complete"].includes(coach.phase)) return "";
  const isCoachRecording = state.isRecording && state.recordingTarget === "coach";
  const recordingBlocked = state.isRecording && state.recordingTarget !== "coach";
  const retakeText = cleanupSpacing(coach.retake.transcript);
  return `
    <section class="coach-card">
      <div class="section-title-row">
        <h3>Step 3 · Retake</h3>
        <span class="badge">${retakeText ? `${normalizeWords(retakeText).length} words` : "Awaiting Retake"}</span>
      </div>
      <div class="recorder-row compact-recorder">
        <div class="timer">${formatTime(isCoachRecording ? state.elapsed : coach.retake.duration || 0)}</div>
        <button class="record-button ${isCoachRecording ? "recording" : ""}" data-coach-record-toggle="true" ${recordingBlocked ? "disabled" : ""} aria-label="Coach retake record">
          <span class="record-dot"></span>
          <span>${isCoachRecording ? "Stop Recording" : "Record Coach Retake"}</span>
        </button>
        <div class="control-actions">
          <button class="primary-button" data-analyze-coach-retake="true" ${coach.phase === "reflecting" ? "disabled" : ""}><span class="button-icon">✓</span>Analyze Retake</button>
          <button class="ghost-button" data-start-coach-retake="true"><span class="button-icon">↻</span>Redo Retake</button>
        </div>
      </div>
      ${coach.retake.audioUrl ? `<audio class="audio-player" controls src="${coach.retake.audioUrl}"></audio>` : ""}
      <label class="transcript-box">
        <span>Coach Retake Transcript</span>
        <textarea id="coachTranscriptInput" placeholder="${SpeechRecognitionApi ? "Auto-transcribed while recording, or type/edit your response manually." : "Browser speech recognition is unavailable; please enter your Coach retake transcript here."}">${escapeHtml(coach.retake.transcript)}</textarea>
      </label>
      ${coach.phase === "reflecting" ? `<p class="compact-copy">Coach is comparing your initial attempt against your retake...</p>` : ""}
    </section>
  `;
}

function renderCoachReflection() {
  const coach = state.coach;
  if (coach.phase !== "complete" || !coach.reflection) return "";
  return `
    <section class="coach-card coach-reflection">
      <div class="section-title-row">
        <h3>Step 4 · Reflection</h3>
        <span class="badge ${coach.reflection.improved ? "blue" : "orange"}">${coach.reflection.improved ? "Clear Improvement" : "Needs Another Pass"}</span>
      </div>
      <div class="coach-before-after">
        <div>
          <h4>Before</h4>
          <p>${escapeHtml(coach.original.transcript || "No first-attempt transcript")}</p>
        </div>
        <div>
          <h4>After</h4>
          <p>${escapeHtml(coach.retake.transcript || "No retake transcript")}</p>
        </div>
      </div>
      <p class="upgrade-answer">${escapeHtml(coach.reflection.improvementSummary)}</p>
      <ul class="coach-evidence">
        ${(coach.reflection.visibleChanges || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      <div class="coach-mission">
        <strong>Next Action</strong>
        <p>${escapeHtml(coach.reflection.nextAction)}</p>
      </div>
    </section>
  `;
}

function renderCoachProfileSummary(profile = loadCoachProfile()) {
  const weakness = profile.primaryWeakness
    ? getWeaknessLabel(profile.primaryWeakness, profile.primaryWeakness in REPEAT_WEAKNESSES ? "repeat" : "interview")
    : "No recurring bottleneck yet";
  const drill = DRILL_LIBRARY[profile.currentDrill] || DRILL_LIBRARY["example-builder"];
  return `
    <section class="feedback-section wide-section coach-profile-summary">
      <div class="history-top">
        <div>
          <h3>Coach Profile</h3>
          <p class="compact-copy">Long-term progress is stored locally in your browser. Basic mode tracks recurring bottlenecks and retake gains automatically.</p>
        </div>
        <div class="coach-profile-chip">
          <span>${escapeHtml(weakness)}</span>
          <strong>${profile.stablePasses || 0}/3 stable</strong>
        </div>
      </div>
      <div class="item-meta">
        <span class="badge violet">${escapeHtml(profile.levelHint || "L?")}</span>
        <span class="badge blue">${escapeHtml(drill.label)}</span>
        <span class="badge orange">${escapeHtml(profile.currentCoachGoal || "Complete one Coach retake to establish your current goal")}</span>
      </div>
    </section>
  `;
}

function renderScoringConfidence(confidence) {
  const signals = confidence.signals || [];
  return `
    <section class="feedback-section wide-section confidence-section">
      <div class="section-title-row">
        <h3>Scoring Confidence</h3>
        <span class="badge ${confidence.level === "high" ? "blue" : confidence.level === "medium" ? "orange" : ""}">${escapeHtml(confidence.label)}</span>
      </div>
      <div class="confidence-meter" aria-label="Scoring Confidence">
        <div style="width: ${Math.round((confidence.score || 0) * 100)}%"></div>
      </div>
      <p class="compact-copy">${escapeHtml(confidence.note || "Local scoring provides simulated training diagnostics and is not an official ETS score.")}</p>
      <div class="item-meta">
        ${signals.map((item) => `<span class="badge">${escapeHtml(item)}</span>`).join("")}
      </div>
      ${confidence.reasons && confidence.reasons.length ? `
        <ul class="confidence-reasons">
          ${confidence.reasons.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      ` : ""}
    </section>
  `;
}

function renderDiffSection(alignment) {
  return `
    <section class="feedback-section wide-section">
      <h3>Verbatim Alignment</h3>
      <div class="diff-line">
        ${alignment
          .map((token) => {
            if (token.type === "match") return `<span class="word-token match">${escapeHtml(token.ref)}</span>`;
            if (token.type === "substitute") return `<span class="word-token substitute">${escapeHtml(token.ref)} → ${escapeHtml(token.hyp)}</span>`;
            if (token.type === "missing") return `<span class="word-token missing">${escapeHtml(token.ref)}</span>`;
            return `<span class="word-token extra">+ ${escapeHtml(token.hyp)}</span>`;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderScoreBreakdown(detailScores) {
  return `
    <section class="feedback-section wide-section">
      <h3>Rubric Breakdown</h3>
      <div class="score-breakdown">
        ${detailScores
          .map(
            (item) => `
              <div class="breakdown-row">
                <div>
                  <strong>${escapeHtml(item.label)}</strong>
                  <span>${escapeHtml(item.detail)}</span>
                </div>
                <div class="breakdown-meter" aria-label="${escapeHtml(item.label)}">
                  <div style="width: ${Math.round(item.score * 100)}%"></div>
                </div>
                <b>${Math.round(item.score * 100)}%</b>
              </div>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderRubricProfile(rubricProfile) {
  return `
    <section class="feedback-section wide-section">
      <h3>Rubric Weights</h3>
      <div class="rubric-grid">
        ${rubricProfile
          .map(
            (item) => `
              <div class="rubric-tile">
                <span>${escapeHtml(item.label)}</span>
                <strong>${Math.round(item.weight * 100)}%</strong>
                <p>${escapeHtml(item.note)}</p>
              </div>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderAttemptComparison(comparison) {
  return `
    <section class="feedback-section wide-section">
      <h3>Retry Comparison</h3>
      <div class="comparison-grid">
        <div class="comparison-score ${comparison.delta >= 0 ? "up" : "down"}">
          <span>vs. Previous Attempt</span>
          <strong>${comparison.delta >= 0 ? "+" : ""}${comparison.delta}</strong>
        </div>
        <div>
          <p class="upgrade-answer">${escapeHtml(comparison.summary)}</p>
          <ul class="pron-notes">
            ${comparison.notes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </div>
      </div>
    </section>
  `;
}

function renderExternalAiSection(externalAi) {
  const dimensions = Object.entries(externalAi.dimensionScores || {}).slice(0, 8);
  return `
    <section class="feedback-section wide-section">
      <h3>AI Evaluation Enhancement</h3>
      <div class="external-grid">
        <div class="pron-tile">
          <span>AI Band</span>
          <strong>${externalAi.score ? `${externalAi.score}/6` : "-"}</strong>
        </div>
        <div class="external-copy">
          <p class="upgrade-answer">${escapeHtml(externalAi.summary || "AI evaluation insights received.")}</p>
          ${externalAi.grammarNotes && externalAi.grammarNotes.length ? `
            <ul class="pron-notes">
              ${externalAi.grammarNotes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          ` : ""}
        </div>
      </div>
      ${dimensions.length ? `
        <div class="item-meta">
          ${dimensions.map(([key, value]) => `<span class="badge blue">${escapeHtml(key)} ${escapeHtml(String(value))}</span>`).join("")}
        </div>
      ` : ""}
    </section>
  `;
}

function renderPronunciationSection(pronunciation) {
  const stats = pronunciation.audioStats || {};
  const statsItems = [
    ["Intelligibility Proxy", `${Math.round(pronunciation.score * 100)}%`],
    ["ASR Confidence", `${Math.round(pronunciation.confidence * 100)}%`],
    ["Audio Quality", `${Math.round(pronunciation.audioQuality * 100)}%`],
    ["Pause Control", `${Math.round(pronunciation.pauseControl * 100)}%`],
    ["Articulation Rate", pronunciation.articulationRate ? `${pronunciation.articulationRate} WPM` : "-"],
    ["Longest Pause", stats.available ? `${stats.longestSilence.toFixed(1)}s` : "-"],
    ["Silence Ratio", stats.available ? `${Math.round(stats.silenceRatio * 100)}%` : "-"],
    ["Estimated SNR", stats.available ? `${Math.round(stats.snrDb)} dB` : "-"]
  ];

  return `
    <section class="feedback-section wide-section">
      <h3>Intelligibility & Acoustic Telemetry</h3>
      <div class="pron-grid">
        ${statsItems
          .map(
            ([label, value]) => `
              <div class="pron-tile">
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(value)}</strong>
              </div>
            `
          )
          .join("")}
      </div>
      <ul class="pron-notes">
        ${pronunciation.notes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      ${pronunciation.external ? renderExternalPronunciation(pronunciation.external) : ""}
      ${pronunciation.phonemeFocus && pronunciation.phonemeFocus.length ? `
        <h4 class="subsection-title">Targeted Phoneme & Sound Focus</h4>
        <p class="compact-copy">Basic mode identifies high-value pronunciation targets from transcript alignment; external phoneme API scores take priority when configured.</p>
        <div class="phoneme-list">
          ${pronunciation.phonemeFocus
            .map(
              (item) => `
                <div class="phoneme-card">
                  <strong>${escapeHtml(item.sound)}</strong>
                  <span>${escapeHtml(item.label)}</span>
                  <p>${escapeHtml(item.tip)}</p>
                  <small>${escapeHtml(item.words.join(", "))}</small>
                </div>
              `
            )
            .join("")}
        </div>
      ` : ""}
    </section>
  `;
}

function renderExternalPronunciation(external) {
  const stats = [
    ["Provider", external.provider || "-"],
    ["Pron", external.score !== null ? `${Math.round(external.score * 100)}%` : "-"],
    ["Accuracy", external.accuracy !== null ? `${Math.round(external.accuracy * 100)}%` : "-"],
    ["Fluency", external.fluency !== null ? `${Math.round(external.fluency * 100)}%` : "-"],
    ["Completeness", external.completeness !== null ? `${Math.round(external.completeness * 100)}%` : "-"]
  ];
  return `
    <div class="external-pron">
      <h4 class="subsection-title">External Phoneme Assessment</h4>
      <div class="pron-grid">
        ${stats
          .map(
            ([label, value]) => `
              <div class="pron-tile">
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(value)}</strong>
              </div>
            `
          )
          .join("")}
      </div>
      ${external.phonemes && external.phonemes.length ? `
        <div class="item-meta">
          ${external.phonemes.slice(0, 8).map((item) => `<span class="badge orange">${escapeHtml(item.word || "")} ${escapeHtml(item.sound || item.phoneme || "")} ${Number.isFinite(Number(item.score)) ? Math.round(Number(item.score)) : ""}</span>`).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

function renderFullRunView() {
  if (state.full.complete) {
    return renderFullSummary();
  }

  if (!state.full.active) {
    return `
      <section class="full-run-board">
        <div class="full-setup">
          <div>
            <h2>Full 11-Item Simulation</h2>
            <p class="compact-copy">Complete a full 11-item speaking set: 6 Listen & Repeat items followed by 5 Interview prompts. Exam mode auto-plays audio and locks sentence reveals.</p>
          </div>
          <button class="primary-button" data-start-full="true"><span class="button-icon">▶</span>Start Full Simulation</button>
        </div>
        ${renderFullTips()}
      </section>
    `;
  }

  return `
    <div>
      ${renderPracticeCard(true)}
      ${renderFeedback()}
    </div>
  `;
}

function renderFullTips() {
  return `
    <div class="summary-grid">
      <div class="summary-tile">
        <span>Items</span>
        <strong>11</strong>
      </div>
      <div class="summary-tile">
        <span>Repeat</span>
        <strong>6</strong>
      </div>
      <div class="summary-tile">
        <span>Interview</span>
        <strong>5</strong>
      </div>
      <div class="summary-tile">
        <span>Storage</span>
        <strong>Local</strong>
      </div>
    </div>
  `;
}

function renderFullSummary() {
  const results = state.full.results;
  const avg = averageScore(results.map((item) => ({ score: item.feedback.score })));
  const repeatAvg = averageScore(results.filter((item) => item.question.type === "repeat").map((item) => ({ score: item.feedback.score })));
  const interviewAvg = averageScore(results.filter((item) => item.question.type === "interview").map((item) => ({ score: item.feedback.score })));
  const commonIssues = results.flatMap((item) => item.feedback.issues).slice(0, 5);

  return `
    <section class="full-run-board">
      <div class="history-top">
        <div>
          <h2>Simulation Summary</h2>
          <p class="compact-copy">Average Band: ${avg || "-"}. Prioritize retaking your two lowest-scoring prompts in the next session.</p>
        </div>
        <button class="primary-button" data-start-full="true"><span class="button-icon">↻</span>Start New Simulation</button>
      </div>
      <div class="summary-grid">
        <div class="summary-tile"><span>Overall Avg</span><strong>${avg || "-"}</strong></div>
        <div class="summary-tile"><span>Repeat Avg</span><strong>${repeatAvg || "-"}</strong></div>
        <div class="summary-tile"><span>Interview Avg</span><strong>${interviewAvg || "-"}</strong></div>
        <div class="summary-tile"><span>Completed</span><strong>${results.length}</strong></div>
      </div>
      <section class="feedback-section" style="margin-top: 16px">
        <h3>Priority Action Items</h3>
        <ul>${(commonIssues.length ? commonIssues : ["Keep delivering complete responses and perform an immediate retake after each prompt."]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </section>
    </section>
  `;
}

function renderBankView() {
  const items = getFilteredQuestions();
  return `
    <section>
      <div class="history-top">
        <div>
          <h2>Simulation Prompt Bank</h2>
          <p class="compact-copy">Browse all ${QUESTION_BANK.repeat.length + QUESTION_BANK.interview.length} original prompts modeled on public ETS task descriptions. No leaked exam content is included.</p>
        </div>
        <button class="primary-button" data-random-bank="true"><span class="button-icon">↻</span>Practice Random Prompt</button>
      </div>
      <div class="filters">
        <select id="bankType">
          <option value="all" ${state.bankType === "all" ? "selected" : ""}>All Task Types</option>
          <option value="repeat" ${state.bankType === "repeat" ? "selected" : ""}>Listen and Repeat</option>
          <option value="interview" ${state.bankType === "interview" ? "selected" : ""}>Take an Interview</option>
        </select>
        <select id="bankDifficulty">
          <option value="all" ${state.bankDifficulty === "all" ? "selected" : ""}>All Difficulties</option>
          <option value="Easy" ${state.bankDifficulty === "Easy" ? "selected" : ""}>Easy</option>
          <option value="Medium" ${state.bankDifficulty === "Medium" ? "selected" : ""}>Medium</option>
          <option value="Hard" ${state.bankDifficulty === "Hard" ? "selected" : ""}>Hard</option>
        </select>
      </div>
      <div class="bank-list">
        ${items
          .map(
            (item) => `
              <article class="bank-item">
                <div>
                  <p class="item-title">${escapeHtml(item.text)}</p>
                  <div class="item-meta">
                    <span class="badge">${item.type === "repeat" ? "Repeat" : "Interview"}</span>
                    <span class="badge blue">${escapeHtml(item.category)}</span>
                    <span class="badge orange">${escapeHtml(item.difficulty)}</span>
                  </div>
                </div>
                <button class="small-button" data-practice-question="${item.id}">Practice</button>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderHistoryView() {
  const history = loadHistory();
  return `
    <section>
      <div class="history-top">
        <div>
          <h2>Local Practice History</h2>
          <p class="compact-copy">All practice logs are stored privately in your browser localStorage and never uploaded to a server.</p>
        </div>
        <div class="control-actions">
          <button class="ghost-button" data-export-history="true"><span class="button-icon">↓</span>Export History</button>
          <button class="ghost-button" data-export-local-data="true"><span class="button-icon">⇩</span>Export All Local Data</button>
          <button class="danger-button" data-clear-history="true"><span class="button-icon">×</span>Clear Local History</button>
        </div>
      </div>
      ${renderLocalDataPanel(history)}
      ${renderWeaknessPanel(history)}
      <div class="history-list">
        ${
          history.length
            ? history
                .map(
                  (item) => `
                    <article class="history-item">
                      <div>
                        <p class="item-title">${escapeHtml(item.prompt)}</p>
                        <p class="compact-copy">${escapeHtml(item.summary)}</p>
                        <div class="item-meta">
                          <span class="badge">${item.trainingMode === "starter" ? "Start Easy" : item.type === "repeat" ? "Repeat" : "Interview"}</span>
                          <span class="badge blue">${formatDate(item.createdAt)}</span>
                          <span class="badge orange">${item.trainingMode === "starter" ? `Step ${item.starterStep} ${item.starterResult || ""}` : `Score ${item.score}/6`}</span>
                        </div>
                      </div>
                      <div class="history-actions">
                        <button class="small-button" data-review-history="${item.id}">Review</button>
                        ${item.trainingMode === "starter" ? "" : `<button class="small-button" data-start-coach-history="${item.id}">Coach Review</button>`}
                      </div>
                    </article>
                  `
                )
                .join("")
            : `<div class="empty-feedback">No practice attempts recorded yet.</div>`
        }
      </div>
    </section>
  `;
}

function renderMistakeBookView() {
  const history = loadHistory();
  const soundNotebook = buildPronunciationNotebook(history);
  const rawWordNotebook = buildWordPronunciationNotebook(history);
  const wordNotebook = filterWordNotebook(rawWordNotebook, state.wordMistakeFilter);
  const activeMode = state.mistakeBookMode === "words" ? "words" : "sounds";
  const isWordMode = activeMode === "words";
  const activeNotebook = isWordMode ? wordNotebook : soundNotebook;
  const totalWords = soundNotebook.reduce((sum, item) => sum + item.words.length, 0);
  const totalWordHits = rawWordNotebook.reduce((sum, item) => sum + item.count, 0);
  const activeSourceCount = countNotebookSources(activeNotebook);
  const categoryCounts = getWordNotebookCategoryCounts(rawWordNotebook);
  return `
    <section class="mistake-book">
      <div class="history-top">
        <div>
          <h2>Pronunciation & Recall Error Log</h2>
          <p class="compact-copy">Automatically compiled from your local pronunciation diagnostics, Listen & Repeat word alignments, and word-level accuracy scores.</p>
        </div>
        <div class="control-actions">
          <button class="ghost-button" data-tab="history"><span class="button-icon">↗</span>View Source History</button>
          <button class="ghost-button" data-export-local-data="true"><span class="button-icon">⇩</span>Export Local Data</button>
        </div>
      </div>

      <div class="segmented mistake-mode-toggle" role="group" aria-label="Mistake book mode">
        <button class="${activeMode === "sounds" ? "active" : ""}" data-mistake-book-mode="sounds">Sound Patterns</button>
        <button class="${activeMode === "words" ? "active" : ""}" data-mistake-book-mode="words">Target Words</button>
      </div>

      ${isWordMode ? renderWordMistakeFilter(categoryCounts) : ""}

      <section class="feedback-section wide-section notebook-summary">
        <div class="summary-grid">
          <div class="summary-tile"><span>Sound Patterns</span><strong>${soundNotebook.length}</strong></div>
          <div class="summary-tile"><span>Flagged Words</span><strong>${rawWordNotebook.length}</strong></div>
          <div class="summary-tile"><span>${isWordMode ? "Total Misses" : "Linked Words"}</span><strong>${isWordMode ? totalWordHits : totalWords}</strong></div>
          <div class="summary-tile"><span>Source Runs</span><strong>${activeSourceCount}</strong></div>
        </div>
        <p class="compact-copy">${isWordMode
          ? "Flagged words are categorized into Pronunciation-Likely, Recall Omission, Semantic Substitution, or Uncertain based on alignment evidence."
          : "Sound patterns aggregate recurring phoneme and cluster targets from local alignment and optional external phoneme assessments."}</p>
      </section>

      ${isWordMode ? renderMistakeReviewEntry(rawWordNotebook) : ""}

      ${isWordMode && state.mistakeReview.active ? renderMistakeReviewDeck() : ""}

      ${isWordMode && !state.mistakeReview.active && state.wordDrill.active ? renderWordEchoDrill() : ""}

      ${
        state.mistakeReview.active
          ? ""
          : activeNotebook.length
          ? `<div class="mistake-grid">
              ${isWordMode
                ? wordNotebook.map((item) => renderWordPronunciationNotebookCard(item)).join("")
                : soundNotebook.map((item) => renderPronunciationNotebookCard(item)).join("")}
            </div>`
          : `<div class="empty-feedback">${isWordMode
            ? "No flagged words yet. Complete a few Listen & Repeat items to automatically collect omitted, substituted, or low-scoring words."
            : "No sound patterns logged yet. Complete a few practice prompts to automatically aggregate pronunciation targets."}</div>`
      }
    </section>
  `;
}

function renderMistakeReviewEntry(wordNotebook) {
  const highFrequencyCount = wordNotebook.filter((item) => item.count >= 2).length;
  const recentCount = wordNotebook.filter((item) => isWithinDays(item.lastSeen, 7)).length;
  const pronunciationCount = wordNotebook.filter((item) => item.category === "pronunciationLikely").length;
  const recallCount = wordNotebook.filter((item) => item.category === "recallLikely").length;
  return `
    <section class="mistake-review-entry">
      <div>
        <span class="badge blue">Mistake Deck</span>
        <h3>Targeted Word Deck</h3>
        <p class="compact-copy">Drill one word at a time: isolate word pronunciation first, then anchor it inside a full sentence. Unstable words cycle back to the queue.</p>
      </div>
      <div class="control-actions">
        <button class="primary-button" data-start-mistake-review="weakest" ${wordNotebook.length ? "" : "disabled"}>
          <span class="button-icon">▶</span>Start Word Deck
        </button>
        <button class="ghost-button" data-start-mistake-review="pronunciation" ${pronunciationCount ? "" : "disabled"}>
          <span class="button-icon">◉</span>Pronunciation ${pronunciationCount}
        </button>
        <button class="ghost-button" data-start-mistake-review="recall" ${recallCount ? "" : "disabled"}>
          <span class="button-icon">□</span>Recall ${recallCount}
        </button>
        <button class="ghost-button" data-start-mistake-review="frequent" ${highFrequencyCount ? "" : "disabled"}>
          <span class="button-icon">↺</span>Frequent ${highFrequencyCount}
        </button>
        <button class="ghost-button" data-start-mistake-review="recent" ${recentCount ? "" : "disabled"}>
          <span class="button-icon">⏱</span>Recent ${recentCount}
        </button>
      </div>
    </section>
  `;
}

function renderWordMistakeFilter(categoryCounts) {
  const filters = [
    ["all", "All", categoryCounts.all],
    ["pronunciationLikely", "Pronunciation", categoryCounts.pronunciationLikely],
    ["recallLikely", "Omission / Recall", categoryCounts.recallLikely],
    ["semanticSubstitution", "Paraphrase", categoryCounts.semanticSubstitution],
    ["uncertain", "Uncertain", categoryCounts.uncertain]
  ];
  return `
    <div class="segmented word-mistake-filter" role="group" aria-label="Word mistake filter">
      ${filters.map(([id, label, count]) => `
        <button class="${state.wordMistakeFilter === id ? "active" : ""}" data-word-mistake-filter="${id}" ${count ? "" : "disabled"}>
          ${label} ${count || 0}
        </button>
      `).join("")}
    </div>
  `;
}

function renderPronunciationNotebookCard(item) {
  return `
    <article class="mistake-card">
      <div class="mistake-card-head">
        <div>
          <span class="badge ${item.hasExternal ? "blue" : ""}">${item.hasExternal ? "External Score" : "Local Target"}</span>
          <h3>${escapeHtml(item.sound)}</h3>
        </div>
        <strong>${item.count}x</strong>
      </div>
      <p class="compact-copy">${escapeHtml(item.tip)}</p>
      <div class="word-chip-list">
        ${item.words.map((word) => `<span>${escapeHtml(word.word)} <small>${word.count}</small></span>`).join("")}
      </div>
      <div class="notebook-drill">
        <span>Practice Sentence</span>
        <p>${escapeHtml(item.reviewSentence)}</p>
      </div>
      <div class="recent-source-list">
        ${item.sources.slice(0, 3).map((source) => `
          <button class="source-pill" data-review-history="${source.id}" title="${escapeHtml(source.prompt)}">
            ${escapeHtml(source.type === "repeat" ? "Repeat" : "Interview")} · ${formatDate(source.createdAt)}
          </button>
        `).join("")}
      </div>
      <div class="control-actions">
        <button class="primary-button" data-review-pronunciation="${escapeHtml(item.key)}"><span class="button-icon">▶</span>Practice This Sound</button>
      </div>
    </article>
  `;
}

function renderWordPronunciationNotebookCard(item) {
  const reasonBadges = item.reasons.map((reason) => `<span>${escapeHtml(getWordMistakeReasonLabel(reason))}</span>`).join("");
  const heardAs = item.heardAs.slice(0, 4);
  const scoreLabel = Number.isFinite(item.lowestScore) ? `${Math.round(item.lowestScore * 100)}%` : "";
  const category = getWordMistakeCategoryMeta(item.category);
  return `
    <article class="mistake-card word-mistake-card">
      <div class="mistake-card-head">
        <div>
          <span class="badge ${category.badgeClass}">${category.label}</span>
          <h3>${escapeHtml(item.word)}</h3>
        </div>
        <strong>${item.count}x</strong>
      </div>
      <div class="word-diagnosis ${escapeHtml(item.category)}">
        <strong>${escapeHtml(category.title)}${Number.isFinite(item.categoryConfidence) ? ` · ${Math.round(item.categoryConfidence * 100)}%` : ""}</strong>
        <p>${escapeHtml(category.tip)}</p>
      </div>
      <div class="word-breakdown">
        <span>Syllable Breakdown</span>
        <div class="breakdown-parts">
          ${item.breakdown.map((part) => `<b>${escapeHtml(part)}</b>`).join("")}
        </div>
        <small>${escapeHtml(item.stressHint)}</small>
      </div>
      <div class="word-mistake-tags">
        ${reasonBadges}
        ${scoreLabel ? `<span>Lowest Word Score: ${scoreLabel}</span>` : ""}
        ${item.evidence.slice(0, 3).map((evidence) => `<span>${escapeHtml(getWordMistakeEvidenceLabel(evidence))}</span>`).join("")}
        ${item.phonemeSounds.map((sound) => `<span>${escapeHtml(sound)}</span>`).join("")}
      </div>
      ${
        heardAs.length
          ? `<div class="heard-as-list">
              <span>Often Heard As</span>
              ${heardAs.map((entry) => `<strong>${escapeHtml(entry.word)} <small>${entry.count}</small></strong>`).join("")}
            </div>`
          : ""
      }
      <div class="notebook-drill">
        <span>3-Step Drill</span>
        <p>${escapeHtml(item.word)} → the ${escapeHtml(item.word)} → ${escapeHtml(item.practiceLine)}</p>
      </div>
      <div class="recent-source-list">
        ${item.sources.slice(0, 3).map((source) => `
          <button class="source-pill" data-review-history="${source.id}" title="${escapeHtml(source.prompt)}">
            ${escapeHtml(source.type === "repeat" ? "Repeat" : "Interview")} · ${formatDate(source.createdAt)}
          </button>
        `).join("")}
      </div>
      <div class="control-actions word-action-row">
        <button class="ghost-button" data-speak-word-slow="${escapeHtml(item.key)}"><span class="button-icon">◌</span>Listen Slow</button>
        <button class="ghost-button" data-speak-word="${escapeHtml(item.key)}"><span class="button-icon">▶</span>Listen Normal</button>
        <button class="tool-button" data-start-word-drill="${escapeHtml(item.key)}"><span class="button-icon">◎</span>Word + Sentence Drill</button>
        <button class="primary-button" data-review-word-pronunciation="${escapeHtml(item.key)}"><span class="button-icon">↻</span>Load in Repeat</button>
      </div>
    </article>
  `;
}

function renderWordEchoDrill(options = {}) {
  const drill = state.wordDrill;
  const wordRecording = state.isRecording && state.recordingTarget === "wordDrill" && drill.target === "word";
  const sentenceRecording = state.isRecording && state.recordingTarget === "wordDrill" && drill.target === "sentence";
  const blocked = state.isRecording && state.recordingTarget !== "wordDrill";
  const inDeck = Boolean(options.inDeck);
  return `
    <section class="word-drill-capsule">
      <div class="section-title-row">
        <div>
          <span class="badge blue">${inDeck ? "Deck Card" : "Word + Sentence Drill"}</span>
          <h3>${escapeHtml(drill.word)}</h3>
          <p class="compact-copy">First articulate the isolated word clearly, then embed it in a complete sentence. Evaluated locally without external AI calls.</p>
        </div>
        ${inDeck ? "" : `<button class="ghost-button" data-reset-word-drill="true"><span class="button-icon">×</span>Close</button>`}
      </div>

      <div class="word-drill-grid">
        <article class="word-drill-step ${drill.wordCheck ? `result-${drill.wordCheck.result}` : ""}">
          <div class="word-drill-step-head">
            <span>Step 1</span>
            <strong>Step 1: Speak Word</strong>
          </div>
          <div class="word-drill-target">
            <b>${escapeHtml(drill.word)}</b>
            <small>${escapeHtml(drill.breakdown.join(" / "))}</small>
          </div>
          <p class="compact-copy">${escapeHtml(drill.stressHint)}</p>
          <div class="control-actions">
            <button class="ghost-button" data-word-drill-speak="word" data-word-drill-slow="true"><span class="button-icon">◌</span>Listen Slow</button>
            <button class="ghost-button" data-word-drill-speak="word"><span class="button-icon">▶</span>Listen Normal</button>
            <button class="primary-button" data-word-drill-record="word" ${blocked ? "disabled" : ""}>
              <span class="button-icon">${wordRecording ? "■" : "●"}</span>${wordRecording ? "Stop" : "Record Word"}
            </button>
            <button class="tool-button" data-check-word-drill="word"><span class="button-icon">✓</span>Check</button>
          </div>
          <label class="transcript-box">
            <span>Word Transcript</span>
            <textarea id="wordDrillWordInput" placeholder="${SpeechRecognitionApi ? "Auto-transcribed after recording, or type manually." : "Browser speech recognition unavailable; please type manually."}">${escapeHtml(drill.wordTranscript)}</textarea>
          </label>
          ${renderWordDrillCheck(drill.wordCheck)}
        </article>

        <article class="word-drill-step ${drill.sentenceCheck ? `result-${drill.sentenceCheck.result}` : ""}">
          <div class="word-drill-step-head">
            <span>Step 2</span>
            <strong>Step 2: Speak Sentence</strong>
          </div>
          <div class="notebook-drill sentence-target">
            <span>Target Sentence</span>
            <p>${escapeHtml(drill.sentence)}</p>
          </div>
          <div class="control-actions">
            <button class="ghost-button" data-word-drill-speak="sentence" data-word-drill-slow="true"><span class="button-icon">◌</span>Listen Slow</button>
            <button class="ghost-button" data-word-drill-speak="sentence"><span class="button-icon">▶</span>Listen Normal</button>
            <button class="primary-button" data-word-drill-record="sentence" ${blocked ? "disabled" : ""}>
              <span class="button-icon">${sentenceRecording ? "■" : "●"}</span>${sentenceRecording ? "Stop" : "Record Sentence"}
            </button>
            <button class="tool-button" data-check-word-drill="sentence"><span class="button-icon">✓</span>Check</button>
          </div>
          <label class="transcript-box">
            <span>Sentence Transcript</span>
            <textarea id="wordDrillSentenceInput" placeholder="${SpeechRecognitionApi ? "Auto-transcribed after recording, or type manually." : "Browser speech recognition unavailable; please type manually."}">${escapeHtml(drill.sentenceTranscript)}</textarea>
          </label>
          ${renderWordDrillCheck(drill.sentenceCheck)}
        </article>
      </div>
    </section>
  `;
}

function renderWordDrillCheck(check) {
  if (!check) {
    return `<div class="word-drill-feedback muted">Ready to check. Listen to the model, record your voice, or type your transcript directly.</div>`;
  }
  const labelMap = {
    pass: "Pass",
    almost: "Almost",
    retry: "Retry"
  };
  return `
    <div class="word-drill-feedback result-${check.result}">
      <strong>${labelMap[check.result] || "Result"}${Number.isFinite(check.score) ? ` · ${Math.round(check.score * 100)}%` : ""}</strong>
      <p>${escapeHtml(check.message)}</p>
      ${check.nextAction ? `<span>${escapeHtml(check.nextAction)}</span>` : ""}
    </div>
  `;
}

function renderMistakeReviewDeck() {
  const review = state.mistakeReview;
  if (review.complete) return renderMistakeReviewSummary();
  const current = review.deck[review.index];
  if (!current) return renderMistakeReviewSummary();
  const progress = `${Math.min(review.index + 1, review.deck.length)} / ${review.deck.length}`;
  const outcome = getMistakeReviewOutcome();
  const marked = review.starredKeys.includes(current.key);
  return `
    <section class="mistake-review-deck">
      <div class="deck-topline">
        <div>
          <span class="badge blue">${escapeHtml(getMistakeReviewFilterLabel(review.filter))}</span>
          <h3>Active Word Review Deck</h3>
          <p class="compact-copy">Card ${progress}. Complete both the isolated word and target sentence checks, then advance to the next card.</p>
        </div>
        <div class="deck-progress">
          <strong>${progress}</strong>
          <span>${review.results.length} Completed</span>
        </div>
      </div>

      <div class="deck-card-shell" data-mistake-review-card="true">
        <div class="deck-card-meta">
          <span>${escapeHtml(getWordMistakeCategoryMeta(current.category).label)}</span>
          <span>Flagged ${current.count}x</span>
          ${current.heardAs?.length ? `<span>Heard as "${escapeHtml(current.heardAs[0].word)}"</span>` : ""}
          ${Number.isFinite(current.lowestScore) ? `<span>Lowest Score: ${Math.round(current.lowestScore * 100)}%</span>` : ""}
          ${marked ? `<span>Starred</span>` : ""}
        </div>
        ${renderWordEchoDrill({ inDeck: true })}
      </div>

      <div class="deck-action-bar">
        <button class="ghost-button" data-mistake-review-action="retry"><span class="button-icon">↺</span>Retry Card</button>
        <button class="primary-button" data-mistake-review-action="pass">
          <span class="button-icon">→</span>${outcome === "pass" ? "Next Card" : "Skip for Now"}
        </button>
        <button class="tool-button ${marked ? "active" : ""}" data-mistake-review-star="true"><span class="button-icon">★</span>${marked ? "Starred" : "Star Word"}</button>
        <button class="ghost-button" data-end-mistake-review="true"><span class="button-icon">×</span>End Session</button>
      </div>
    </section>
  `;
}

function renderMistakeReviewSummary() {
  const review = state.mistakeReview;
  const counts = review.results.reduce(
    (acc, item) => {
      acc[item.outcome] = (acc[item.outcome] || 0) + 1;
      return acc;
    },
    { pass: 0, almost: 0, retry: 0 }
  );
  const weakItems = review.results
    .filter((item) => item.outcome !== "pass")
    .slice(-5)
    .reverse();
  return `
    <section class="mistake-review-deck summary">
      <div class="deck-topline">
        <div>
          <span class="badge blue">Deck Complete</span>
          <h3>Word Deck Summary</h3>
          <p class="compact-copy">Session results are summarized below. Return to the Error Log anytime to launch a fresh deck.</p>
        </div>
        <div class="deck-progress">
          <strong>${review.results.length}</strong>
          <span>Cards Reviewed</span>
        </div>
      </div>
      <div class="summary-grid">
        <div class="summary-tile"><span>Mastered</span><strong>${counts.pass || 0}</strong></div>
        <div class="summary-tile"><span>Almost</span><strong>${counts.almost || 0}</strong></div>
        <div class="summary-tile"><span>Needs Retry</span><strong>${counts.retry || 0}</strong></div>
        <div class="summary-tile"><span>Starred</span><strong>${review.starredKeys.length}</strong></div>
      </div>
      ${
        weakItems.length
          ? `<div class="deck-weak-list">
              ${weakItems.map((item) => `<span>${escapeHtml(item.word)} · ${escapeHtml(getMistakeReviewOutcomeLabel(item.outcome))}</span>`).join("")}
            </div>`
          : ""
      }
      <div class="control-actions">
        <button class="primary-button" data-start-mistake-review="retry"><span class="button-icon">↺</span>Retry Unmastered Words</button>
        <button class="ghost-button" data-end-mistake-review="true"><span class="button-icon">←</span>Back to Error Log</button>
      </div>
    </section>
  `;
}

function buildPronunciationNotebook(history = loadHistory()) {
  const buckets = new Map();
  history.forEach((entry) => {
    const focusItems = entry.pronunciation?.phonemeFocus || [];
    const seenInEntry = new Set();
    focusItems.forEach((focus) => {
      const normalized = normalizePronunciationFocusItem(focus);
      if (!normalized.key || seenInEntry.has(normalized.key)) return;
      seenInEntry.add(normalized.key);
      if (!buckets.has(normalized.key)) {
        buckets.set(normalized.key, {
          ...normalized,
          count: 0,
          wordCounts: new Map(),
          sources: [],
          hasExternal: false,
          lastSeen: ""
        });
      }
      const bucket = buckets.get(normalized.key);
      bucket.count += 1;
      bucket.hasExternal = bucket.hasExternal || Boolean(entry.pronunciation?.external) || normalized.hasExternal;
      bucket.lastSeen = !bucket.lastSeen || new Date(entry.createdAt) > new Date(bucket.lastSeen) ? entry.createdAt : bucket.lastSeen;
      normalized.words.forEach((word) => {
        if (!word) return;
        bucket.wordCounts.set(word, (bucket.wordCounts.get(word) || 0) + 1);
      });
      bucket.sources.push({
        id: entry.id,
        type: entry.type,
        prompt: entry.prompt,
        createdAt: entry.createdAt,
        score: entry.score
      });
    });
  });

  return [...buckets.values()]
    .map((item) => ({
      ...item,
      words: [...item.wordCounts.entries()]
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
        .slice(0, 8),
      reviewSentence: buildPronunciationReviewSentence(item)
    }))
    .sort((a, b) => b.count - a.count || new Date(b.lastSeen) - new Date(a.lastSeen))
    .slice(0, 12);
}

function buildWordPronunciationNotebook(history = loadHistory()) {
  const buckets = new Map();
  history.forEach((entry) => {
    const seenWordsInEntry = new Set();
    collectWordMistakeCandidates(entry).forEach((candidate) => {
      const normalized = normalizeWordMistakeCandidate(candidate);
      if (!normalized) return;
      if (!buckets.has(normalized.key)) {
        buckets.set(normalized.key, {
          key: normalized.key,
          word: normalized.word,
          count: 0,
          reasons: new Set(),
          heardAsCounts: new Map(),
          phonemeSounds: new Set(),
          categoryScores: new Map(),
          evidenceCounts: new Map(),
          sources: [],
          hasExternal: false,
          lowestScore: null,
          lastSeen: ""
        });
      }
      const bucket = buckets.get(normalized.key);
      if (!seenWordsInEntry.has(normalized.key)) {
        bucket.count += 1;
        seenWordsInEntry.add(normalized.key);
      }
      bucket.reasons.add(normalized.reason);
      bucket.hasExternal = bucket.hasExternal || normalized.hasExternal;
      if (normalized.heardAs) {
        bucket.heardAsCounts.set(normalized.heardAs, (bucket.heardAsCounts.get(normalized.heardAs) || 0) + 1);
      }
      if (normalized.sound) bucket.phonemeSounds.add(normalized.sound);
      bucket.categoryScores.set(
        normalized.category,
        (bucket.categoryScores.get(normalized.category) || 0) + normalized.confidence
      );
      normalized.evidence.forEach((item) => {
        bucket.evidenceCounts.set(item, (bucket.evidenceCounts.get(item) || 0) + 1);
      });
      if (Number.isFinite(normalized.score)) {
        bucket.lowestScore = bucket.lowestScore === null ? normalized.score : Math.min(bucket.lowestScore, normalized.score);
      }
      bucket.lastSeen = !bucket.lastSeen || new Date(entry.createdAt) > new Date(bucket.lastSeen) ? entry.createdAt : bucket.lastSeen;
      if (!bucket.sources.some((source) => source.id === entry.id)) {
        bucket.sources.push({
          id: entry.id,
          type: entry.type,
          prompt: entry.prompt,
          createdAt: entry.createdAt,
          score: entry.score
        });
      }
    });
  });

  return [...buckets.values()]
    .map((item) => {
      const category = getDominantWordMistakeCategory(item.categoryScores);
      const categoryTotal = [...item.categoryScores.values()].reduce((sum, value) => sum + value, 0) || 1;
      return {
        ...item,
        category,
        categoryConfidence: Math.min(0.95, Math.max(0.35, (item.categoryScores.get(category) || 0) / categoryTotal)),
        reasons: [...item.reasons],
        evidence: [...item.evidenceCounts.entries()]
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .map(([evidence]) => evidence),
        heardAs: [...item.heardAsCounts.entries()]
          .map(([word, count]) => ({ word, count }))
          .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word)),
        phonemeSounds: [...item.phonemeSounds].slice(0, 4),
        sources: item.sources.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        breakdown: splitWordForPractice(item.word),
        stressHint: getWordStressHint(item.word),
        practiceLine: buildWordReviewSentence(item.word)
      };
    })
    .sort((a, b) => {
      const scoreA = Number.isFinite(a.lowestScore) ? a.lowestScore : 1;
      const scoreB = Number.isFinite(b.lowestScore) ? b.lowestScore : 1;
      return b.count - a.count || scoreA - scoreB || new Date(b.lastSeen) - new Date(a.lastSeen);
    })
    .slice(0, 20);
}

function collectWordMistakeCandidates(entry) {
  const candidates = [];
  if (entry.type === "repeat" && Array.isArray(entry.alignment)) {
    entry.alignment.forEach((item) => {
      if (item.type === "missing" || item.type === "substitute") {
        candidates.push({
          word: item.ref,
          heardAs: item.hyp,
          reason: item.type === "missing" ? "repeat-missing" : "repeat-substitute",
          alignmentType: item.type,
          hasExternal: false
        });
      }
    });
  }

  const external = entry.pronunciation?.external || entry.externalPronunciation || {};
  const externalWords = Array.isArray(external.words) ? external.words : [];
  externalWords.forEach((wordItem) => {
    const score = normalizeNotebookScore(
      wordItem.score ?? wordItem.accuracyScore ?? wordItem.AccuracyScore ?? wordItem.pronunciationScore ?? wordItem.PronScore
    );
    const errorType = cleanupSpacing(wordItem.errorType || wordItem.ErrorType || wordItem.error || "");
    const hasExplicitError = Boolean(errorType && !/none|correct|accurate/i.test(errorType));
    if ((Number.isFinite(score) && score < 0.78) || hasExplicitError) {
      candidates.push({
        word: wordItem.word || wordItem.Word || wordItem.text || wordItem.Text,
        reason: "low-word-score",
        score,
        hasExternal: true
      });
    }
  });

  (entry.pronunciation?.phonemeFocus || []).forEach((focus) => {
    const normalized = normalizePronunciationFocusItem(focus);
    normalized.words.forEach((word) => {
      candidates.push({
        word,
        reason: "phoneme-focus",
        sound: normalized.sound,
        hasExternal: normalized.hasExternal
      });
    });
  });

  return candidates;
}

function normalizeWordMistakeCandidate(candidate) {
  const word = normalizeNotebookWord(candidate.word);
  if (!isUsefulNotebookWord(word)) return null;
  const heardAs = normalizeNotebookWord(candidate.heardAs);
  const score = normalizeNotebookScore(candidate.score);
  const classification = classifyWordMistakeCandidate({ ...candidate, word, heardAs, score });
  return {
    key: word,
    word,
    heardAs: heardAs && heardAs !== word ? heardAs : "",
    reason: candidate.reason || "repeat-mismatch",
    sound: cleanupSpacing(candidate.sound || ""),
    score,
    hasExternal: Boolean(candidate.hasExternal || candidate.reason === "low-word-score"),
    category: classification.category,
    confidence: classification.confidence,
    evidence: classification.evidence
  };
}

function classifyWordMistakeCandidate(candidate) {
  const word = candidate.word;
  const heardAs = candidate.heardAs;
  const evidence = [];

  if (candidate.reason === "low-word-score" && Number.isFinite(candidate.score)) {
    evidence.push("external_low_word_score");
    return {
      category: "pronunciationLikely",
      confidence: candidate.score < 0.65 ? 0.92 : 0.84,
      evidence
    };
  }

  if (candidate.reason === "phoneme-focus") {
    evidence.push("phoneme_focus");
    return {
      category: "pronunciationLikely",
      confidence: candidate.hasExternal ? 0.76 : 0.58,
      evidence
    };
  }

  if (candidate.alignmentType === "missing") {
    evidence.push("repeat_missing");
    return {
      category: "recallLikely",
      confidence: 0.82,
      evidence
    };
  }

  if (candidate.alignmentType === "substitute") {
    evidence.push("repeat_substitute");
    if (isKnownSemanticSubstitution(word, heardAs)) {
      evidence.push("known_semantic_substitution");
      return {
        category: "semanticSubstitution",
        confidence: 0.8,
        evidence
      };
    }

    const spelling = getWordSimilarity(word, heardAs);
    const phonetic = getPhoneticSimilarity(word, heardAs);
    const confusion = getCommonLearnerConfusionScore(word, heardAs);
    const shape = getSyllableShapeSimilarity(word, heardAs);
    const soundScore = spelling * 0.18 + phonetic * 0.42 + confusion * 0.28 + shape * 0.12;
    if (spelling >= 0.58) evidence.push("spelling_shape_close");
    if (phonetic >= 0.62) evidence.push("phonetic_key_close");
    if (confusion >= 0.7) evidence.push("common_learner_confusion");
    if (shape >= 0.72) evidence.push("similar_syllable_shape");

    if (soundScore >= 0.64) {
      return {
        category: "pronunciationLikely",
        confidence: Math.min(0.9, soundScore),
        evidence
      };
    }
    if (soundScore >= 0.46) {
      return {
        category: "uncertain",
        confidence: soundScore,
        evidence
      };
    }
    evidence.push("substitution_not_sound_similar");
    return {
      category: "recallLikely",
      confidence: 0.64,
      evidence
    };
  }

  evidence.push("insufficient_signal");
  return {
    category: "uncertain",
    confidence: 0.4,
    evidence
  };
}

function getDominantWordMistakeCategory(categoryScores) {
  const entries = [...categoryScores.entries()];
  if (!entries.length) return "uncertain";
  return entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
}

function filterWordNotebook(items, filter) {
  if (!filter || filter === "all") return items;
  return items.filter((item) => item.category === filter);
}

function getWordNotebookCategoryCounts(items) {
  return items.reduce(
    (acc, item) => {
      acc.all += 1;
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    },
    { all: 0, pronunciationLikely: 0, recallLikely: 0, semanticSubstitution: 0, uncertain: 0 }
  );
}

function getPhoneticSimilarity(a, b) {
  const keyA = getSimplePhoneticKey(a);
  const keyB = getSimplePhoneticKey(b);
  if (!keyA || !keyB) return 0;
  return getWordSimilarity(keyA, keyB);
}

function getSimplePhoneticKey(value) {
  let word = normalizeNotebookWord(value);
  if (!word) return "";
  word = word
    .replace(/^kn/, "n")
    .replace(/^wr/, "r")
    .replace(/^wh/, "w")
    .replace(/mb$/, "m")
    .replace(/tion|sion|cian/g, "shun")
    .replace(/ture/g, "cher")
    .replace(/ph/g, "f")
    .replace(/ght/g, "t")
    .replace(/ck/g, "k")
    .replace(/qu/g, "kw")
    .replace(/x/g, "ks")
    .replace(/c(?=[eiy])/g, "s")
    .replace(/c/g, "k")
    .replace(/j/g, "g")
    .replace(/z/g, "s")
    .replace(/v/g, "w")
    .replace(/[aeiouy]+/g, "A")
    .replace(/(.)\1+/g, "$1");
  return word;
}

function getCommonLearnerConfusionScore(a, b) {
  const left = getLearnerConfusionKey(a);
  const right = getLearnerConfusionKey(b);
  if (!left || !right) return 0;
  const score = getWordSimilarity(left, right);
  return score >= 0.72 ? 1 : score >= 0.58 ? 0.65 : 0;
}

function getLearnerConfusionKey(value) {
  return normalizeNotebookWord(value)
    .replace(/th/g, "T")
    .replace(/[rl]/g, "R")
    .replace(/[vw]/g, "V")
    .replace(/[td]/g, "D")
    .replace(/[pb]/g, "B")
    .replace(/[sz]/g, "S")
    .replace(/[kgqc]/g, "K")
    .replace(/[aeiouy]+/g, "A")
    .replace(/(.)\1+/g, "$1");
}

function getSyllableShapeSimilarity(a, b) {
  const left = getWordShape(a);
  const right = getWordShape(b);
  if (!left.syllables || !right.syllables) return 0;
  const syllableScore = 1 - Math.abs(left.syllables - right.syllables) / Math.max(left.syllables, right.syllables);
  const lengthScore = 1 - Math.abs(left.length - right.length) / Math.max(left.length, right.length);
  const endingScore = left.ending && left.ending === right.ending ? 1 : 0;
  return Math.max(0, Math.min(1, syllableScore * 0.45 + lengthScore * 0.35 + endingScore * 0.2));
}

function getWordShape(value) {
  const word = normalizeNotebookWord(value);
  const vowelGroups = word.match(/[aeiouy]+/g) || [];
  return {
    length: word.length || 1,
    syllables: Math.max(1, vowelGroups.length),
    ending: getWordEndingShape(word)
  };
}

function getWordEndingShape(word) {
  if (/(tion|sion|cian)$/.test(word)) return "shun";
  if (/ing$/.test(word)) return "ing";
  if (/ed$/.test(word)) return "ed";
  if (/s$/.test(word)) return "s";
  return word.slice(-2);
}

function isKnownSemanticSubstitution(ref, hyp) {
  const groups = [
    ["presentation", "talk", "speech"],
    ["professor", "teacher", "instructor"],
    ["dormitory", "dorm", "residence"],
    ["cafeteria", "dining", "canteen"],
    ["assignment", "homework", "task"],
    ["classmate", "friend", "partner"],
    ["university", "college", "school"],
    ["information", "data", "details"],
    ["explanation", "reason", "answer"]
  ];
  return groups.some((group) => group.includes(ref) && group.includes(hyp));
}

function normalizeNotebookWord(value) {
  return cleanupSpacing(value || "")
    .toLowerCase()
    .replace(/^[^a-z]+|[^a-z]+$/g, "")
    .replace(/[^a-z'-]/g, "");
}

function normalizeNotebookScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return null;
  return score > 1 ? Math.max(0, Math.min(1, score / 100)) : Math.max(0, Math.min(1, score));
}

function isUsefulNotebookWord(word) {
  const stopwords = new Set([
    "a", "an", "the", "to", "of", "in", "on", "at", "by", "for", "and", "or", "but",
    "is", "am", "are", "was", "were", "be", "been", "being", "i", "me", "my", "you",
    "your", "he", "she", "we", "they", "it", "its", "his", "her", "our", "their",
    "do", "does", "did", "can", "will", "would", "should", "could"
  ]);
  return Boolean(word && word.length > 2 && !stopwords.has(word));
}

function splitWordForPractice(word) {
  const overrides = {
    academic: ["a", "ca", "DE", "mic"],
    assignment: ["a", "SIGN", "ment"],
    available: ["a", "VAIL", "a", "ble"],
    because: ["be", "CAUSE"],
    classmate: ["CLASS", "mate"],
    comfortable: ["COMF", "ter", "ble"],
    communication: ["com", "mu", "ni", "CA", "tion"],
    convenient: ["con", "VE", "nient"],
    decided: ["de", "CI", "ded"],
    development: ["de", "VE", "lop", "ment"],
    different: ["DIFF", "er", "ent"],
    education: ["e", "du", "CA", "tion"],
    environment: ["en", "VI", "ron", "ment"],
    environmental: ["en", "vi", "ron", "MEN", "tal"],
    experience: ["ex", "PE", "ri", "ence"],
    explained: ["ex", "PLAIN", "d"],
    important: ["im", "POR", "tant"],
    information: ["in", "for", "MA", "tion"],
    interesting: ["IN", "ter", "est", "ing"],
    library: ["LI", "bra", "ry"],
    opportunity: ["op", "por", "TU", "ni", "ty"],
    prepared: ["pre", "PARE", "d"],
    presentation: ["pre", "sen", "TA", "tion"],
    professor: ["pro", "FE", "ssor"],
    project: ["PROJ", "ect"],
    responsibility: ["re", "spon", "si", "BI", "li", "ty"],
    store: ["store"],
    stores: ["store", "z"],
    student: ["STU", "dent"],
    students: ["STU", "dent", "s"],
    technology: ["tech", "NO", "lo", "gy"],
    updated: ["up", "DATE", "id"],
    university: ["u", "ni", "VER", "si", "ty"]
  };
  const clean = normalizeNotebookWord(word);
  if (overrides[clean]) return overrides[clean];
  const suffixBreakdown = splitCommonFinalSuffix(clean);
  if (suffixBreakdown) return suffixBreakdown;
  if (clean.length <= 5) return [clean];

  const chunks = [];
  let current = "";
  const vowels = "aeiouy";
  for (let index = 0; index < clean.length; index += 1) {
    const char = clean[index];
    const next = clean[index + 1] || "";
    current += char;
    if (vowels.includes(char) && !vowels.includes(next) && current.length >= 2 && chunks.length < 4) {
      chunks.push(current);
      current = "";
    }
  }
  if (current) chunks.push(current);
  return chunks.length ? chunks : [clean];
}

function splitCommonFinalSuffix(clean) {
  if (!clean || clean.length < 5) return null;
  if (/(us|ss|is|ous)$/.test(clean)) return null;
  if (/ies$/.test(clean)) return [`${clean.slice(0, -3)}y`, "z"];
  if (/(ches|shes|sses|xes|zes)$/.test(clean)) return [clean.slice(0, -2), "iz"];
  if (/(ces|ges|ses)$/.test(clean)) return [clean.slice(0, -1), "iz"];
  if (/oes$/.test(clean)) return [clean.slice(0, -2), "z"];
  if (/[^s]s$/.test(clean)) {
    const base = clean.slice(0, -1);
    return [base, getPluralSPronunciation(base)];
  }
  if (/ied$/.test(clean)) return [`${clean.slice(0, -3)}y`, "d"];
  if (/ed$/.test(clean)) {
    const base = normalizePastEdBase(clean);
    return [base, getPastEdPronunciation(base)];
  }
  return null;
}

function getPronouncedFinalLetter(base) {
  if (!base) return "";
  if (base.endsWith("e") && base.length > 1) return base.slice(-2, -1);
  return base.slice(-1);
}

function getPluralSPronunciation(base) {
  const final = getPronouncedFinalLetter(base);
  if (/[ptkfc]$/.test(final) || /(ch|sh|th)$/.test(base)) return "s";
  return "z";
}

function normalizePastEdBase(clean) {
  let base = clean.slice(0, -2);
  if (/(ced|ged|sed|zed)$/.test(clean)) base = clean.slice(0, -1);
  if (/([b-df-hj-np-tv-z])\1$/.test(base) && !/(ss|ll|zz)$/.test(base)) base = base.slice(0, -1);
  return base;
}

function getPastEdPronunciation(base) {
  const final = getPronouncedFinalLetter(base);
  if (/[td]$/.test(final)) return "id";
  if (/[ptkfsxc]$/.test(final) || /(ch|sh|th)$/.test(base)) return "t";
  return "d";
}

function getWordStressHint(word) {
  const clean = normalizeNotebookWord(word);
  if (clean === "stores") return "\"stores\" is one syllable (/storz/); the final -s is voiced as /z/ after /r/—do not add an extra syllable.";
  if (/(ches|shes|sses|xes|zes|ces|ges|ses)$/.test(clean)) return "This ending adds a short /iz/ syllable; articulate the base word clearly before linking the final /iz/.";
  if (/[^s]s$/.test(clean) && !/(us|ss|is|ous)$/.test(clean)) {
    const base = /ies$/.test(clean) ? `${clean.slice(0, -3)}y` : clean.slice(0, -1);
    return `The final -s here sounds like /${getPluralSPronunciation(base)}/; pronounce "${base}" clearly and link the ending lightly.`;
  }
  if (/ed$/.test(clean)) {
    const base = /ied$/.test(clean) ? `${clean.slice(0, -3)}y` : normalizePastEdBase(clean);
    return `The past-tense -ed here sounds like /${getPastEdPronunciation(base)}/; articulate "${base}" first and link the ending.`;
  }
  if (/(tion|sion|cian)$/.test(clean)) return "Primary stress typically falls on the syllable right before -tion/-sion.";
  if (/(ic|ical|ity|ety)$/.test(clean)) return "Primary stress typically falls right before -ic or -ity; practice slowly in chunks before linking.";
  if (clean.length <= 5) return "For short words, open the core vowel and release the final consonant clearly before embedding in a phrase.";
  return "Syllable chunking is a practice scaffold; consult a phonetic dictionary if unsure about primary stress.";
}

function buildWordReviewSentence(word) {
  const clean = normalizeNotebookWord(word);
  const examples = {
    academic: "The academic schedule is busy this semester.",
    assignment: "I finished the assignment before dinner.",
    available: "The study room is available this afternoon.",
    because: "I chose this class because it is useful.",
    classmate: "My classmate helped me review the notes.",
    comfortable: "The library is quiet and comfortable.",
    communication: "Clear communication helps the group work better.",
    convenient: "Online registration is convenient for students.",
    development: "This activity supports my language development.",
    different: "I tried a different method this time.",
    education: "Education gives people more choices.",
    environment: "A quiet environment helps me focus.",
    experience: "This experience taught me to plan earlier.",
    important: "Time management is important for students.",
    information: "The professor gave us useful information.",
    interesting: "The lecture was interesting and practical.",
    library: "The library will extend its hours this week.",
    opportunity: "This project gave me a good opportunity.",
    presentation: "I gave a presentation in class today.",
    professor: "The professor explained the problem clearly.",
    responsibility: "Teamwork requires responsibility and patience.",
    technology: "Technology makes online learning easier.",
    university: "The university offers many student clubs."
  };
  return examples[clean] || `I will practice the word ${clean} slowly and clearly.`;
}

function getWordMistakeReasonLabel(reason) {
  const labels = {
    "repeat-mismatch": "Repeat Mismatch",
    "repeat-substitute": "Repeat Substitution",
    "repeat-missing": "Repeat Omission",
    "low-word-score": "Low Word Score",
    "phoneme-focus": "Phoneme Target"
  };
  return labels[reason] || reason;
}

function getWordMistakeCategoryMeta(category) {
  const map = {
    pronunciationLikely: {
      label: "Pronunciation",
      title: "Likely Pronunciation / ASR Confusion",
      tip: "You produced a sound-similar word at this position or received a low word-level pronunciation score. Drill the isolated word first, then embed it in the sentence.",
      badgeClass: "blue"
    },
    recallLikely: {
      label: "Recall / Omission",
      title: "Likely Omitted or Missed in Working Memory",
      tip: "The word was omitted or replaced with a phonetically unrelated word. Practice keyword recall first, then repeat the full sentence.",
      badgeClass: ""
    },
    semanticSubstitution: {
      label: "Paraphrase",
      title: "Likely Synonym or Semantic Substitution",
      tip: "Acceptable in open-ended responses, but in Listen & Repeat it indicates the exact target word was paraphrased instead of repeated verbatim.",
      badgeClass: "green"
    },
    uncertain: {
      label: "Uncertain",
      title: "Mixed Signal — Practice Both Sound & Recall",
      tip: "Listen to the model word first, then complete a two-step word and sentence repetition.",
      badgeClass: ""
    }
  };
  return map[category] || map.uncertain;
}

function getWordMistakeEvidenceLabel(evidence) {
  const labels = {
    external_low_word_score: "Low API Score",
    phoneme_focus: "Phoneme Cue",
    repeat_missing: "Omitted",
    repeat_substitute: "Substituted",
    known_semantic_substitution: "Synonym Used",
    spelling_shape_close: "Similar Spelling",
    phonetic_key_close: "Sound-Similar",
    common_learner_confusion: "Common Confusion Pair",
    similar_syllable_shape: "Similar Syllable Shape",
    substitution_not_sound_similar: "Not Sound-Similar",
    insufficient_signal: "Limited Signal"
  };
  return labels[evidence] || evidence;
}

function countNotebookSources(notebook) {
  return new Set(notebook.flatMap((item) => item.sources.map((source) => source.id))).size;
}

function normalizePronunciationFocusItem(focus) {
  const sound = cleanupSpacing(focus?.sound || focus?.phoneme || focus?.label || "pronunciation focus");
  const key = sound.toLowerCase().replace(/[^a-z0-9θð/ -]+/gi, "").replace(/\s+/g, "-");
  const words = Array.isArray(focus?.words)
    ? focus.words
    : String(focus?.word || focus?.label || "").split(/[,\s/]+/);
  return {
    key,
    sound,
    label: cleanupSpacing(focus?.label || ""),
    tip: cleanupSpacing(focus?.tip || focus?.errorType || "Articulate this target sound slowly, then anchor it inside a full sentence."),
    words: [...new Set(words.map((word) => cleanupSpacing(String(word).toLowerCase())).filter((word) => word && word.length > 1))].slice(0, 8),
    hasExternal: /external|azure|phoneme|score/i.test(`${focus?.tip || ""} ${focus?.errorType || ""}`)
  };
}

function buildPronunciationReviewSentence(item) {
  const words = [...item.wordCounts.keys()].slice(0, 5);
  if (!words.length) return `Today I will practice the sound ${item.sound}.`;
  const list = words.length === 1
    ? words[0]
    : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
  return `Today I will practice the words ${list}.`;
}

function startPronunciationReview(key) {
  const item = buildPronunciationNotebook().find((entry) => entry.key === key);
  if (!item) {
    showToast("Could not find that pronunciation target.");
    return;
  }
  stopIfRecording();
  resetCoachSession(false);
  state.currentRepeat = {
    id: `pron-review-${item.key}`,
    type: "repeat",
    category: "Pronunciation Notebook",
    difficulty: "Review",
    text: item.reviewSentence,
    focus: `${item.sound}: ${item.tip}`
  };
  state.mode = "repeat";
  state.tab = "practice";
  state.full.active = false;
  state.full.complete = false;
  clearCurrentWork(true);
  state.showSentence = true;
  state.status = `Reviewing sound: ${item.sound}`;
  render();
}

function startWordPronunciationReview(key) {
  const item = buildWordPronunciationNotebook().find((entry) => entry.key === key);
  if (!item) {
    showToast("Could not find that target word.");
    return;
  }
  stopIfRecording();
  resetCoachSession(false);
  state.currentRepeat = {
    id: `word-review-${item.key}`,
    type: "repeat",
    category: "Word Notebook",
    difficulty: "Review",
    text: item.practiceLine,
    focus: `${item.word}: ${item.breakdown.join(" / ")} · ${item.stressHint}`
  };
  state.mode = "repeat";
  state.tab = "practice";
  state.full.active = false;
  state.full.complete = false;
  clearCurrentWork(true);
  state.showSentence = true;
  state.status = `Reviewing word: ${item.word}`;
  render();
}

function speakNotebookWord(key, slow = false) {
  const item = buildWordPronunciationNotebook().find((entry) => entry.key === key);
  if (!item) {
    showToast("Could not find that target word.");
    return;
  }
  const text = slow
    ? `${item.word}. ${item.breakdown.join(" ")}. ${item.word}. the ${item.word}.`
    : item.practiceLine;
  speakText(text, slow ? 0.68 : 0.9, slow ? `Playing "${item.word}" (slow)` : `Playing "${item.word}"`);
}

function speakText(text, rate = 0.9, statusMessage = "Playing audio model") {
  if (!window.speechSynthesis) {
    showToast("Speech synthesis is not supported in this browser.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  state.status = statusMessage;
  render();
}

function createWordDrillStateFromNotebookItem(item) {
  return {
    ...getDefaultWordDrillState(),
    active: true,
    key: item.key,
    word: item.word,
    sentence: item.practiceLine,
    breakdown: item.breakdown,
    stressHint: item.stressHint,
    sourceCount: item.count
  };
}

function startWordEchoDrill(key) {
  const item = buildWordPronunciationNotebook().find((entry) => entry.key === key);
  if (!item) {
    showToast("Could not find that target word.");
    return;
  }
  stopIfRecording();
  resetCoachSession(false);
  state.mistakeReview = getDefaultMistakeReviewState();
  state.mistakeBookMode = "words";
  state.wordDrill = createWordDrillStateFromNotebookItem(item);
  state.status = `Word + Sentence Drill: ${item.word}`;
  render();
}

function resetWordEchoDrill(renderNow = true) {
  if (state.wordDrill?.wordAudioUrl) URL.revokeObjectURL(state.wordDrill.wordAudioUrl);
  if (state.wordDrill?.sentenceAudioUrl) URL.revokeObjectURL(state.wordDrill.sentenceAudioUrl);
  state.wordDrill = getDefaultWordDrillState();
  if (state.recordingTarget === "wordDrill") state.recordingTarget = "main";
  if (renderNow) render();
}

function startMistakeReview(filter = "weakest") {
  const deck = buildMistakeReviewDeck(filter);
  if (!deck.length) {
    showToast("No flagged words match the selected filter.");
    return;
  }
  stopIfRecording();
  resetCoachSession(false);
  resetWordEchoDrill(false);
  state.mistakeBookMode = "words";
  state.mistakeReview = {
    ...getDefaultMistakeReviewState(),
    active: true,
    filter,
    deck,
    startedAt: new Date().toISOString()
  };
  loadMistakeReviewCard(0);
  state.status = "Start Word Deck";
  render();
}

function buildMistakeReviewDeck(filter = "weakest") {
  let items = buildWordPronunciationNotebook();
  if (filter === "pronunciation") items = items.filter((item) => item.category === "pronunciationLikely");
  if (filter === "recall") items = items.filter((item) => item.category === "recallLikely");
  if (filter === "semantic") items = items.filter((item) => item.category === "semanticSubstitution");
  if (filter === "uncertain") items = items.filter((item) => item.category === "uncertain");
  if (filter === "frequent") items = items.filter((item) => item.count >= 2);
  if (filter === "recent") items = items.filter((item) => isWithinDays(item.lastSeen, 7));
  if (filter === "retry" && state.mistakeReview.results.length) {
    const retryKeys = new Set(state.mistakeReview.results.filter((item) => item.outcome !== "pass").map((item) => item.key));
    items = items.filter((item) => retryKeys.has(item.key));
  }
  return items
    .map((item) => ({
      ...item,
      priority: getMistakeReviewPriority(item),
      reviewLoops: 0
    }))
    .sort((a, b) => b.priority - a.priority || b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, 24);
}

function getMistakeReviewPriority(item) {
  const scorePenalty = Number.isFinite(item.lowestScore) ? 1 - item.lowestScore : 0;
  const recentBoost = isWithinDays(item.lastSeen, 7) ? 1.2 : 0;
  const externalBoost = item.hasExternal ? 0.8 : 0;
  const recallBoost = item.category === "recallLikely" ? 0.5 : 0;
  const pronunciationBoost = item.category === "pronunciationLikely" ? 0.4 : 0;
  return item.count * 1.7 + item.heardAs.length * 0.7 + item.reasons.length * 0.35 + scorePenalty * 2 + recentBoost + externalBoost + recallBoost + pronunciationBoost;
}

function loadMistakeReviewCard(index) {
  const item = state.mistakeReview.deck[index];
  if (!item) {
    completeMistakeReview();
    return;
  }
  state.mistakeReview.index = index;
  state.wordDrill = createWordDrillStateFromNotebookItem(item);
}

function finishMistakeReviewCard(action = "pass") {
  if (!state.mistakeReview.active || state.mistakeReview.complete) return;
  const current = state.mistakeReview.deck[state.mistakeReview.index];
  if (!current) {
    completeMistakeReview();
    render();
    return;
  }
  const outcome = action === "retry" ? "retry" : getMistakeReviewOutcome();
  state.mistakeReview.results.push({
    key: current.key,
    word: current.word,
    action,
    outcome,
    wordResult: state.wordDrill.wordCheck?.result || "none",
    sentenceResult: state.wordDrill.sentenceCheck?.result || "none",
    createdAt: new Date().toISOString()
  });
  if (action === "retry" && current.reviewLoops < 2) {
    state.mistakeReview.deck.push({
      ...current,
      reviewLoops: current.reviewLoops + 1
    });
  }
  const nextIndex = state.mistakeReview.index + 1;
  if (nextIndex >= state.mistakeReview.deck.length) completeMistakeReview();
  else loadMistakeReviewCard(nextIndex);
  state.status = action === "retry" ? "Returned card to end of queue" : "Advanced to next card";
  render();
}

function toggleMistakeReviewStar() {
  const current = state.mistakeReview.deck[state.mistakeReview.index];
  if (!current) return;
  if (state.mistakeReview.starredKeys.includes(current.key)) {
    state.mistakeReview.starredKeys = state.mistakeReview.starredKeys.filter((key) => key !== current.key);
  } else {
    state.mistakeReview.starredKeys.push(current.key);
  }
  render();
}

function completeMistakeReview() {
  state.mistakeReview.complete = true;
  resetWordEchoDrill(false);
  state.status = "Word Review Deck complete";
}

function endMistakeReview() {
  stopIfRecording();
  state.mistakeReview = getDefaultMistakeReviewState();
  resetWordEchoDrill(false);
  state.status = "Returned to Error Log";
  render();
}

function getMistakeReviewOutcome() {
  const wordResult = state.wordDrill.wordCheck?.result || "none";
  const sentenceResult = state.wordDrill.sentenceCheck?.result || "none";
  if (wordResult === "pass" && sentenceResult === "pass") return "pass";
  if (wordResult === "retry" || sentenceResult === "retry" || wordResult === "none" || sentenceResult === "none") return "retry";
  return "almost";
}

function getMistakeReviewOutcomeLabel(outcome) {
  const labels = {
    pass: "Mastered",
    almost: "Almost",
    retry: "Needs Retry"
  };
  return labels[outcome] || outcome;
}

function getMistakeReviewFilterLabel(filter) {
  const labels = {
    weakest: "Priority Queue",
    frequent: "High-Frequency Words",
    recent: "Last 7 Days",
    pronunciation: "Pronunciation Focus",
    recall: "Recall & Omissions",
    semantic: "Paraphrase Substitutions",
    uncertain: "Uncertain Cases",
    retry: "Unmastered Retry Queue"
  };
  return labels[filter] || "Word Review Queue";
}

function toggleWordDrillRecording(target = "word") {
  if (!state.wordDrill.active) {
    showToast("Launch a Word + Sentence Drill from a word card first.");
    return;
  }
  if (state.isRecording && state.recordingTarget === "wordDrill" && state.wordDrill.target === target) {
    stopRecording();
    return;
  }
  if (state.isRecording) {
    showToast("Please stop the active recording first.");
    return;
  }
  state.wordDrill.target = target === "sentence" ? "sentence" : "word";
  state.recordingTarget = "wordDrill";
  startRecording();
}

function speakWordDrillPart(part = "word", slow = false) {
  if (!state.wordDrill.active) {
    showToast("Start a Word + Sentence Drill first.");
    return;
  }
  const isSentence = part === "sentence";
  const text = isSentence
    ? state.wordDrill.sentence
    : slow
      ? `${state.wordDrill.word}. ${state.wordDrill.breakdown.join(" ")}. ${state.wordDrill.word}.`
      : state.wordDrill.word;
  speakText(
    text,
    slow ? 0.68 : isSentence ? 0.88 : 0.92,
    isSentence ? "Playing target sentence" : `Playing "${state.wordDrill.word}"`
  );
}

function analyzeWordDrillPart(part = "word") {
  if (!state.wordDrill.active) return;
  const target = part === "sentence" ? "sentence" : "word";
  const check = target === "sentence" ? checkWordDrillSentence() : checkWordDrillWord();
  if (target === "sentence") state.wordDrill.sentenceCheck = check;
  else state.wordDrill.wordCheck = check;
  state.status = check.result === "pass" ? "Drill check passed" : "Drill check evaluated";
  render();
}

function checkWordDrillWord() {
  const transcript = cleanupSpacing(state.wordDrill.wordTranscript);
  state.wordDrill.wordTranscript = transcript;
  if (!transcript) {
    return {
      result: "retry",
      score: 0,
      message: "No word transcript found. Record the word first or type what you said.",
      nextAction: "Listen to the slow model once, then speak just the target word."
    };
  }
  const targetWord = normalizeNotebookWord(state.wordDrill.word);
  const spokenWords = normalizeWords(transcript);
  const best = getBestWordMatch(targetWord, spokenWords);
  if (best.score >= 0.92) {
    return {
      result: "pass",
      score: best.score,
      message: `Recognized "${state.wordDrill.word}" clearly. Now anchor it in the full target sentence.`,
      nextAction: "Move to Step 2: listen to the target sentence and repeat it completely."
    };
  }
  if (best.score >= 0.72) {
    return {
      result: "almost",
      score: best.score,
      message: `Close, but ASR heard "${best.word || "another word"}". Check primary stress, core vowel quality, and final consonant release.`,
      nextAction: "Listen to the slow model again and slightly exaggerate the stressed syllable and word ending."
    };
  }
  return {
    result: "retry",
    score: best.score,
    message: `Did not reliably recognize "${state.wordDrill.word}" on this attempt.`,
    nextAction: "Practice the syllable chunks first, then blend them into the whole word."
  };
}

function checkWordDrillSentence() {
  const transcript = cleanupSpacing(state.wordDrill.sentenceTranscript);
  state.wordDrill.sentenceTranscript = transcript;
  if (!transcript) {
    return {
      result: "retry",
      score: 0,
      message: "No sentence transcript found. Record or type the full target sentence first.",
      nextAction: "Listen to the target sentence and repeat it as completely as possible."
    };
  }
  const question = {
    id: `word-drill-${state.wordDrill.key}`,
    type: "repeat",
    text: state.wordDrill.sentence
  };
  const duration = state.wordDrill.sentenceDuration || state.duration || 0;
  const feedback = createRepeatFeedback(question, transcript, duration, {
    audioStats: state.wordDrill.sentenceAudioStats || null,
    recognitionStats: state.recognitionStats
  });
  const targetWord = normalizeNotebookWord(state.wordDrill.word);
  const includesWord = normalizeWords(transcript).includes(targetWord);
  const recallScore = getDetailScoreValue(feedback.detailScores, "Completeness") ?? ((feedback.score - 1) / 5);
  const score = Math.max(0, Math.min(1, recallScore));
  const result = includesWord && score >= 0.72 ? "pass" : score >= 0.52 ? "almost" : "retry";
  return {
    result,
    score,
    message: includesWord
      ? `Target word anchored in the sentence! Sentence completeness: ~${Math.round(score * 100)}%.`
      : `The target word "${state.wordDrill.word}" was not stably detected in the sentence; articulate the target word clearly before linking the rest of the clause.`,
    nextAction: result === "pass" ? "Great work! Return to the Error Log or advance to the next card." : "Listen to the target sentence once more and make sure to include the target word.",
    feedback
  };
}

function getBestWordMatch(targetWord, spokenWords) {
  if (!targetWord || !spokenWords.length) return { word: "", score: 0 };
  return spokenWords.reduce(
    (best, word) => {
      const score = getWordSimilarity(targetWord, word);
      return score > best.score ? { word, score } : best;
    },
    { word: "", score: 0 }
  );
}

function getWordSimilarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const distance = getEditDistance(a, b);
  return Math.max(0, 1 - distance / Math.max(a.length, b.length));
}

function getEditDistance(a, b) {
  const rows = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) rows[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) rows[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + cost
      );
    }
  }
  return rows[a.length][b.length];
}

function getDetailScoreValue(detailScores, label) {
  const match = (detailScores || []).find((item) => item.label === label);
  const value = Number(match?.score);
  if (!Number.isFinite(value)) return null;
  return value > 1 ? value / 100 : value;
}

function renderLocalDataPanel(history = loadHistory()) {
  const coachSessions = loadCoachSessions();
  const hasCoachProfile = Boolean(localStorage.getItem(COACH_PROFILE_STORAGE_KEY));
  const hasLadder = Boolean(localStorage.getItem(LADDER_STORAGE_KEY));
  const hasSetup = Boolean(localStorage.getItem(SETUP_STORAGE_KEY));
  return `
    <section class="feedback-section wide-section data-panel">
      <div class="section-title-row">
        <h3>Local Data Management</h3>
        <span class="badge">Browser-Local Only</span>
      </div>
      <div class="summary-grid compact-summary">
        <div class="summary-tile"><span>Practice Runs</span><strong>${history.length}</strong></div>
        <div class="summary-tile"><span>Coach Sessions</span><strong>${coachSessions.length}</strong></div>
        <div class="summary-tile"><span>Coach Profile</span><strong>${hasCoachProfile ? "Active" : "None"}</strong></div>
        <div class="summary-tile"><span>Ladder</span><strong>${hasLadder ? "Active" : "None"}</strong></div>
      </div>
      <p class="compact-copy">"Export All Local Data" downloads your practice history, Ladder state, and Coach sessions while automatically redacting any API keys.</p>
      <div class="control-actions">
        <button class="ghost-button" data-export-local-data="true"><span class="button-icon">⇩</span>Export All Local Data</button>
        <button class="ghost-button" data-clear-coach-data="true"><span class="button-icon">×</span>Clear Coach Data Only</button>
        <button class="danger-button" data-clear-history="true"><span class="button-icon">×</span>Clear All History & Coach</button>
      </div>
      <div class="item-meta">
        <span class="badge ${hasSetup ? "blue" : ""}">Setup ${hasSetup ? "Saved" : "Default"}</span>
        <span class="badge ${state.setup.ai?.apiKey ? "orange" : ""}">API key ${state.setup.ai?.apiKey || state.setup.pronunciation?.apiKey ? "Stored locally (redacted on export)" : "Not configured"}</span>
      </div>
    </section>
  `;
}

function renderSetupView() {
  const setup = state.setup;
  return `
    <section class="setup-board">
      <div class="history-top">
        <div>
          <h2>API Setup</h2>
          <p class="compact-copy">API keys, endpoints, and model names are saved exclusively in your browser localStorage and never committed to git.</p>
        </div>
        <div class="control-actions">
          <button class="primary-button" data-save-setup="true"><span class="button-icon">✓</span>Save Settings</button>
          <button class="ghost-button" data-clear-setup="true"><span class="button-icon">×</span>Reset Settings</button>
        </div>
      </div>

      <div class="setup-grid">
        <section class="feedback-section setup-basic">
          <h3>Built-In Local Engine (Zero API Required)</h3>
          <ul>
            <li>Simulated 1–6 half-band scoring, rubric breakdown, acoustic telemetry, and weakness tracking run 100% locally by default.</li>
            <li>Adaptive Ladder and Coach Capsule work out of the box using local diagnostic rules without sending audio or text to external servers.</li>
            <li>All practice history, Ladder progression, and Coach profiles persist privately in browser localStorage.</li>
          </ul>
        </section>

        <section class="feedback-section">
          <h3>Optional AI Content Evaluation</h3>
          <label class="check-row">
            <input id="aiEnabled" type="checkbox" ${setup.ai.enabled ? "checked" : ""}>
            <span>Enable external AI content evaluation</span>
          </label>
          <label class="setup-field">
            <span>API Provider Format</span>
            <select id="aiMode">
              <option value="responses" ${setup.ai.mode === "responses" ? "selected" : ""}>OpenAI Responses API</option>
              <option value="chat" ${setup.ai.mode === "chat" ? "selected" : ""}>OpenAI-compatible Chat Completions</option>
            </select>
          </label>
          <label class="setup-field">
            <span>Endpoint URL</span>
            <input id="aiEndpoint" value="${escapeHtml(setup.ai.endpoint)}" placeholder="https://api.openai.com/v1/responses">
          </label>
          <label class="setup-field">
            <span>API Key</span>
            <input id="aiKey" type="password" value="${escapeHtml(setup.ai.apiKey)}" placeholder="sk-...">
          </label>
          <label class="setup-field">
            <span>Model</span>
            <input id="aiModel" value="${escapeHtml(setup.ai.model)}" placeholder="gpt-4.1-mini">
          </label>
          <label class="setup-field">
            <span>Temperature</span>
            <input id="aiTemperature" type="number" step="0.1" min="0" max="1" value="${escapeHtml(String(setup.ai.temperature))}">
          </label>
          <p class="compact-copy">Supplements local scoring with LLM-powered rubric critique and upgraded sample responses. Falls back to local scoring when unconfigured.</p>
        </section>

        <section class="feedback-section">
          <h3>Optional Phoneme-Level Pronunciation API</h3>
          <label class="check-row">
            <input id="pronEnabled" type="checkbox" ${setup.pronunciation.enabled ? "checked" : ""}>
            <span>Enable external phoneme pronunciation assessment</span>
          </label>
          <label class="setup-field">
            <span>Provider</span>
            <select id="pronProvider">
              <option value="azure" ${setup.pronunciation.provider === "azure" ? "selected" : ""}>Azure Speech Pronunciation Assessment</option>
              <option value="custom" ${setup.pronunciation.provider === "custom" ? "selected" : ""}>Custom JSON endpoint</option>
            </select>
          </label>
          <label class="setup-field">
            <span>Azure Region</span>
            <input id="azureRegion" value="${escapeHtml(setup.pronunciation.azureRegion)}" placeholder="eastus">
          </label>
          <label class="setup-field">
            <span>Endpoint Override</span>
            <input id="pronEndpoint" value="${escapeHtml(setup.pronunciation.endpoint)}" placeholder="Leave blank to auto-generate from Azure region">
          </label>
          <label class="setup-field">
            <span>API Key</span>
            <input id="pronKey" type="password" value="${escapeHtml(setup.pronunciation.apiKey)}" placeholder="Azure Speech key or custom endpoint key">
          </label>
          <p class="compact-copy">Azure mode converts audio to 16kHz mono WAV for Pronunciation Assessment. Custom mode posts JSON to your configured endpoint.</p>
        </section>

        <section class="feedback-section">
          <h3>Agentic Coach</h3>
          <label class="check-row">
            <input id="coachEnabled" type="checkbox" ${setup.coach.enabled ? "checked" : ""}>
            <span>Enable Coach Capsule retake workflow</span>
          </label>
          <label class="check-row">
            <input id="coachUseAi" type="checkbox" ${setup.coach.useAi ? "checked" : ""}>
            <span>Use AI to generate Coach diagnostics and micro-drills</span>
          </label>
          <label class="setup-field">
            <span>Coach Feedback Tone</span>
            <select id="coachTone">
              <option value="strict" ${setup.coach.tone === "strict" ? "selected" : ""}>Strict Examiner</option>
              <option value="balanced" ${setup.coach.tone === "balanced" ? "selected" : ""}>Balanced Coach</option>
              <option value="encouraging" ${setup.coach.tone === "encouraging" ? "selected" : ""}>Encouraging Mentor</option>
            </select>
          </label>
          <label class="check-row">
            <input id="coachSingleWeaknessOnly" type="checkbox" ${setup.coach.singleWeaknessOnly ? "checked" : ""}>
            <span>Focus on one primary bottleneck per retake</span>
          </label>
          <p class="compact-copy">Coach AI reuses the AI Content Evaluation endpoint, key, and model above, automatically falling back to local diagnostic rules if unconfigured.</p>
        </section>
      </div>

      <section class="feedback-section setup-note">
        <h3>Privacy & Security</h3>
        <ul>
          <li>No personal API keys are stored in source code.</li>
          <li>Keys exist only in your current browser localStorage and are redacted from data exports.</li>
          <li>Requests are made directly from the client browser using your local configuration.</li>
        </ul>
      </section>
    </section>
  `;
}

function renderWeaknessPanel(history) {
  if (!history.length) return "";
  const recent = history.slice(0, 20);
  const buckets = {};
  recent.forEach((item) => {
    (item.detailScores || []).forEach((detail) => {
      if (!buckets[detail.label]) buckets[detail.label] = [];
      buckets[detail.label].push(Number(detail.score));
    });
  });
  const weakScores = Object.entries(buckets)
    .map(([label, values]) => ({
      label,
      score: values.reduce((sum, value) => sum + value, 0) / values.length
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 4);
  const issueCounts = {};
  recent.flatMap((item) => item.issues || []).forEach((issue) => {
    const key = classifyIssue(issue);
    issueCounts[key] = (issueCounts[key] || 0) + 1;
  });
  const topIssues = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return `
    <section class="feedback-section wide-section weakness-panel">
      <h3>Weakness Telemetry</h3>
      <div class="weakness-grid">
        ${weakScores
          .map(
            (item) => `
              <div class="weakness-tile">
                <span>${escapeHtml(item.label)}</span>
                <strong>${Math.round(item.score * 100)}%</strong>
              </div>
            `
          )
          .join("")}
      </div>
      <div class="item-meta">
        ${topIssues.map(([label, count]) => `<span class="badge orange">${escapeHtml(label)} x${count}</span>`).join("")}
      </div>
    </section>
  `;
}

function classifyIssue(issue) {
  if (/omit|missing|completeness|retention|repeat|verbatim/i.test(issue)) return "Repetition Completeness";
  if (/reason|example|result|brief|expand|claim/i.test(issue)) return "Topic Development";
  if (/organization|order|sequence|discourse|structure/i.test(issue)) return "Discourse Organization";
  if (/pronunciation|intelligibility|consonant|stress|articulate/i.test(issue)) return "Pronunciation Clarity";
  if (/rate|pace|pacing|pause|filler|fluency/i.test(issue)) return "Fluency & Pacing";
  if (/audio|microphone|noise|signal/i.test(issue)) return "Audio Signal Quality";
  if (/vocabulary|lexical|repetition|language/i.test(issue)) return "Language Use";
  return "General Delivery";
}

function continueLadderDiagnostic() {
  if (!state.ladder.diagnostic || !state.ladder.diagnostic.active) {
    state.ladder = {
      ...getDefaultLadderProfile(),
      diagnostic: createDiagnosticSession()
    };
    saveLadderProfile();
  }

  const diagnostic = state.ladder.diagnostic;
  if (diagnostic.index >= diagnostic.sequence.length) {
    finalizeLadderDiagnostic();
    state.tab = "ladder";
    render();
    return;
  }

  const questionId = diagnostic.sequence[diagnostic.index];
  state.ladder.currentTask = {
    source: "diagnostic",
    questionId,
    diagnosticIndex: diagnostic.index,
    startedAt: new Date().toISOString()
  };
  saveLadderProfile();
  practiceQuestion(questionId);
}

function resetLadderWithConfirm() {
  const ok = window.confirm("Reset your Ladder diagnostic placement and progression? Practice history will be preserved.");
  if (!ok) return;
  state.ladder = getDefaultLadderProfile();
  saveLadderProfile();
  state.tab = "ladder";
  render();
}

function resetLadderPlan() {
  state.ladder.dailyPlan = null;
  saveLadderProfile();
  render();
}

function startLadderPlanTask(index) {
  const plan = getTodayLadderPlan(state.ladder);
  const task = plan.tasks[index];
  if (!task) return;
  const questionId = task.questionId || selectQuestionForLadderTask(task).id;
  task.questionId = questionId;
  state.ladder.currentTask = {
    source: "plan",
    planDate: plan.date,
    planIndex: index,
    stepId: task.stepId,
    drill: task.drill,
    questionId,
    startedAt: new Date().toISOString()
  };
  saveLadderProfile();
  practiceQuestion(questionId);
}

function updateLadderAfterFeedback(question, feedback, transcript) {
  const profile = state.ladder || getDefaultLadderProfile();
  const task = profile.currentTask || null;
  const entry = {
    createdAt: new Date().toISOString(),
    questionId: question.id,
    type: question.type,
    score: feedback.score,
    detailScores: feedback.detailScores || [],
    issues: feedback.issues || [],
    pronunciation: feedback.pronunciation || null,
    source: task ? task.source : "free",
    stepId: task ? task.stepId : null,
    drill: task ? task.drill : null,
    transcriptFingerprint: fingerprintText(transcript)
  };

  profile.recent = [entry, ...(profile.recent || [])].slice(0, 40);
  profile.weaknesses = inferLadderWeaknesses(profile.recent);
  profile.recommendedDrill = recommendDrillFromFeedback(feedback);

  if (task && task.source === "diagnostic" && profile.diagnostic && profile.diagnostic.active) {
    const alreadyRecorded = profile.diagnostic.results.some((item) => item.diagnosticIndex === task.diagnosticIndex);
    if (!alreadyRecorded) {
      profile.diagnostic.results.push({ ...entry, diagnosticIndex: task.diagnosticIndex });
      profile.diagnostic.index += 1;
    }
    profile.currentTask = null;
    if (profile.diagnostic.index >= profile.diagnostic.sequence.length) {
      applyDiagnosticResult(profile);
    }
    state.ladder = profile;
    saveLadderProfile();
    return;
  }

  if (profile.diagnosed && task && task.source === "plan") {
    markLadderPlanTaskComplete(profile, task.planIndex);
    updateLadderStepProgress(profile, feedback, task.stepId);
    profile.currentTask = null;
  }

  state.ladder = profile;
  saveLadderProfile();
}

function createDiagnosticSession() {
  const sequence = [
    selectQuestion({ type: "repeat", difficulty: "Easy" }).id,
    selectQuestion({ type: "repeat", difficulty: "Medium" }).id,
    selectQuestion({ type: "repeat", difficulty: "Hard" }).id,
    selectQuestion({ type: "interview", difficulty: "Easy" }).id,
    selectQuestion({ type: "interview", difficulty: "Medium" }).id,
    selectQuestion({ type: "interview", difficulty: "Hard" }).id
  ];
  return {
    active: true,
    sequence,
    index: 0,
    results: [],
    startedAt: new Date().toISOString()
  };
}

function finalizeLadderDiagnostic() {
  applyDiagnosticResult(state.ladder);
  saveLadderProfile();
}

function applyDiagnosticResult(profile) {
  const results = profile.diagnostic ? profile.diagnostic.results : [];
  const avg = averageNumeric(results.map((item) => item.score));
  const repeatAvg = averageNumeric(results.filter((item) => item.type === "repeat").map((item) => item.score));
  const interviewAvg = averageNumeric(results.filter((item) => item.type === "interview").map((item) => item.score));
  const pronAvg = averageNumeric(results.map((item) => item.pronunciation ? item.pronunciation.score * 6 : item.score));
  const adjusted = avg * 0.72 + repeatAvg * 0.1 + interviewAvg * 0.1 + pronAvg * 0.08;
  let level = 1;
  if (adjusted >= 5.25) level = 5;
  else if (adjusted >= 4.75) level = 4;
  else if (adjusted >= 4.05) level = 3;
  else if (adjusted >= 3.25) level = 2;

  profile.diagnosed = true;
  profile.level = level;
  profile.step = 1;
  profile.recommendedDrill = recommendDrillFromEntries(results);
  profile.weaknesses = inferLadderWeaknesses(results);
  profile.diagnostic = { ...profile.diagnostic, active: false, completedAt: new Date().toISOString(), level };
  profile.dailyPlan = null;
  profile.stepProgress = {};
  profile.currentTask = null;
}

function getTodayLadderPlan(profile) {
  const today = getDateKey();
  if (profile.dailyPlan && profile.dailyPlan.date === today && profile.dailyPlan.tasks && profile.dailyPlan.tasks.length) {
    return profile.dailyPlan;
  }
  profile.dailyPlan = buildLadderPlan(profile, today);
  saveLadderProfile();
  return profile.dailyPlan;
}

function buildLadderPlan(profile, date) {
  const step = getCurrentLadderStep(profile);
  const level = profile.level || 1;
  const warmDifficulty = level <= 1 ? "Easy" : level <= 3 ? "Medium" : "Hard";
  const fixDrill = profile.recommendedDrill || step.drill;
  const fixType = drillPrefersRepeat(fixDrill) ? "repeat" : "interview";
  const checkpointType = step.type === "repeat" ? "repeat" : step.type === "interview" ? "interview" : "mixed";
  const tasks = [
    createLadderTask("Warm-up", "chunk-repeat", "repeat", warmDifficulty, "Warm up with one Listen & Repeat item focusing on clarity and full keyword retention.", step.id),
    createLadderTask("Core Step", step.drill, step.type, step.difficulty, step.goal, step.id),
    createLadderTask("Fix Drill", fixDrill, fixType, step.difficulty, DRILL_LIBRARY[fixDrill].tip, step.id),
    createLadderTask("Checkpoint", "checkpoint", checkpointType, step.difficulty, "Complete one unassisted checkpoint prompt to verify today's speaking stability.", step.id)
  ];
  return { date, tasks };
}

function createLadderTask(label, drill, type, difficulty, goal, stepId) {
  const question = selectQuestionForLadderTask({ type, difficulty, drill });
  return {
    label,
    drill,
    drillLabel: DRILL_LIBRARY[drill].label,
    type,
    difficulty,
    goal,
    stepId,
    questionId: question.id,
    completed: false
  };
}

function selectQuestionForLadderTask(task) {
  if (task.type === "mixed") {
    const type = Math.random() > 0.45 ? "interview" : "repeat";
    return selectQuestion({ type, difficulty: task.difficulty });
  }
  return selectQuestion({ type: task.type, difficulty: task.difficulty });
}

function selectQuestion({ type, difficulty }) {
  const pool = type === "repeat" ? QUESTION_BANK.repeat : QUESTION_BANK.interview;
  const filtered = pool.filter((item) => !difficulty || item.difficulty === difficulty);
  return randomItem(filtered.length ? filtered : pool);
}

function getQuestionById(id) {
  return [...QUESTION_BANK.repeat, ...QUESTION_BANK.interview].find((item) => item.id === id) || null;
}

function getCurrentLadderStep(profile) {
  const levelSteps = LADDER_STEPS[profile.level] || LADDER_STEPS[1];
  return levelSteps[Math.max(0, Math.min(levelSteps.length - 1, (profile.step || 1) - 1))];
}

function getStepProgress(profile, stepId) {
  return (profile.stepProgress && profile.stepProgress[stepId]) || { points: 0, attempts: 0 };
}

function markLadderPlanTaskComplete(profile, planIndex) {
  if (!profile.dailyPlan || !profile.dailyPlan.tasks || !profile.dailyPlan.tasks[planIndex]) return;
  profile.dailyPlan.tasks[planIndex].completed = true;
}

function updateLadderStepProgress(profile, feedback, stepId) {
  if (!profile.stepProgress) profile.stepProgress = {};
  const current = profile.stepProgress[stepId] || { points: 0, attempts: 0 };
  const threshold = (LADDER_LEVELS[profile.level] || LADDER_LEVELS[1]).threshold;
  const weakDimension = getWeakestDetailScore(feedback.detailScores || []);
  current.attempts += 1;
  if (feedback.score >= threshold && (!weakDimension || weakDimension.score >= 0.62)) current.points += 1;
  else current.points = Math.max(0, current.points - 1);
  profile.stepProgress[stepId] = current;

  if (current.points >= 3) advanceLadderStep(profile);
}

function advanceLadderStep(profile) {
  const maxStep = (LADDER_STEPS[profile.level] || LADDER_STEPS[1]).length;
  if (profile.step < maxStep) {
    profile.step += 1;
  } else if (profile.level < 5) {
    profile.level += 1;
    profile.step = 1;
  }
  profile.dailyPlan = null;
}

function recommendDrillFromFeedback(feedback) {
  const weakest = getWeakestDetailScore(feedback.detailScores || []);
  if (!weakest) return "example-builder";
  return drillForWeakness(weakest.label);
}

function recommendDrillFromEntries(entries) {
  const labels = {};
  entries.forEach((entry) => {
    const weakest = getWeakestDetailScore(entry.detailScores || []);
    if (weakest) labels[weakest.label] = (labels[weakest.label] || 0) + 1;
  });
  const top = Object.entries(labels).sort((a, b) => b[1] - a[1])[0];
  return top ? drillForWeakness(top[0]) : "example-builder";
}

function getWeakestDetailScore(detailScores) {
  const numeric = detailScores.filter((item) => Number.isFinite(Number(item.score)));
  if (!numeric.length) return null;
  return numeric.sort((a, b) => Number(a.score) - Number(b.score))[0];
}

function drillForWeakness(label) {
  if (/Accuracy|Completeness|Order|Listening|Repetition/i.test(label)) return "chunk-repeat";
  if (/Pronunciation|Intelligibility|Clarity/i.test(label)) return "pronunciation-focus";
  if (/Fluency|Pacing|Speed|Pause/i.test(label)) return "speed-control";
  if (/Task|Direct/i.test(label)) return "answer-skeleton";
  if (/Development|Example|Reason/i.test(label)) return "example-builder";
  if (/Organization|Discourse|Result/i.test(label)) return "result-builder";
  if (/Language|Vocabulary|Lexical/i.test(label)) return "language-upgrade";
  return "example-builder";
}

function inferLadderWeaknesses(entries) {
  const counts = {};
  entries.forEach((entry) => {
    const weakest = getWeakestDetailScore(entry.detailScores || []);
    if (weakest) counts[weakest.label] = (counts[weakest.label] || 0) + 1;
    (entry.issues || []).forEach((issue) => {
      const key = classifyIssue(issue);
      counts[key] = (counts[key] || 0) + 0.5;
    });
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label]) => label);
}

function drillPrefersRepeat(drill) {
  return ["chunk-repeat", "shadow-sprint", "pronunciation-focus"].includes(drill);
}

function getDateKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function averageNumeric(values) {
  const numeric = values.map(Number).filter(Number.isFinite);
  if (!numeric.length) return 0;
  return numeric.reduce((sum, value) => sum + value, 0) / numeric.length;
}

function bindEvents() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.tab = button.dataset.tab;
      render();
    });
  });

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode;
      clearCurrentWork(true);
      render();
    });
  });

  document.querySelectorAll("[data-record-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.isRecording) stopRecording();
      else {
        state.recordingTarget = "main";
        startRecording();
      }
    });
  });

  const transcriptInput = document.querySelector("#transcriptInput");
  if (transcriptInput) {
    transcriptInput.addEventListener("input", (event) => {
      state.transcript = event.target.value;
    });
  }

  const starterTranscriptInput = document.querySelector("#starterTranscriptInput");
  if (starterTranscriptInput) {
    starterTranscriptInput.addEventListener("input", (event) => {
      state.transcript = event.target.value;
    });
  }

  const coachTranscriptInput = document.querySelector("#coachTranscriptInput");
  if (coachTranscriptInput) {
    coachTranscriptInput.addEventListener("input", (event) => {
      state.coach.retake.transcript = event.target.value;
    });
  }

  const wordDrillWordInput = document.querySelector("#wordDrillWordInput");
  if (wordDrillWordInput) {
    wordDrillWordInput.addEventListener("input", (event) => {
      state.wordDrill.wordTranscript = event.target.value;
    });
  }

  const wordDrillSentenceInput = document.querySelector("#wordDrillSentenceInput");
  if (wordDrillSentenceInput) {
    wordDrillSentenceInput.addEventListener("input", (event) => {
      state.wordDrill.sentenceTranscript = event.target.value;
    });
  }

  const bankType = document.querySelector("#bankType");
  if (bankType) {
    bankType.addEventListener("change", (event) => {
      state.bankType = event.target.value;
      render();
    });
  }

  const bankDifficulty = document.querySelector("#bankDifficulty");
  if (bankDifficulty) {
    bankDifficulty.addEventListener("change", (event) => {
      state.bankDifficulty = event.target.value;
      render();
    });
  }

  bindClick("[data-show-sentence]", () => {
    state.showSentence = !state.showSentence;
    render();
  });
  bindClick("[data-play-prompt]", () => speakPrompt());
  bindClick("[data-next-question]", () => nextQuestion());
  bindClick("[data-analyze]", () => analyzeCurrent());
  bindClick("[data-starter-show-sentence]", () => {
    state.showSentence = !state.showSentence;
    render();
  });
  bindClick("[data-starter-new-question]", () => resetStarterQuestion());
  bindClick("[data-starter-next-step]", () => nextStarterStep());
  bindClick("[data-starter-to-practice]", () => practiceQuestion(getStarterQuestion().id));
  bindClick("[data-analyze-starter]", () => analyzeStarterStep());
  bindClick("[data-clear-starter]", () => {
    clearStarterAttemptWork(false);
    render();
  });
  bindClick("[data-starter-record-toggle]", () => {
    if (state.isRecording && state.recordingTarget === "starter") stopRecording();
    else {
      state.recordingTarget = "starter";
      startRecording();
    }
  });
  bindClick("[data-clear-current]", () => {
    clearCurrentWork(false);
    render();
  });
  bindClick("[data-start-full]", () => startFullRun());
  bindClick("[data-full-next]", () => nextFullItem());
  bindClick("[data-random-bank]", () => practiceQuestion(randomItem([...QUESTION_BANK.repeat, ...QUESTION_BANK.interview]).id));
  bindClick("[data-export-history]", () => exportHistory());
  bindClick("[data-export-local-data]", () => exportAllLocalData());
  bindClick("[data-clear-coach-data]", () => clearCoachDataWithConfirm());
  bindClick("[data-clear-history]", () => clearHistoryWithConfirm());
  bindClick("[data-save-setup]", () => saveSetupFromForm());
  bindClick("[data-clear-setup]", () => clearSetupWithConfirm());
  bindClick("[data-ladder-diagnostic-next]", () => continueLadderDiagnostic());
  bindClick("[data-reset-ladder]", () => resetLadderWithConfirm());
  bindClick("[data-reset-ladder-plan]", () => resetLadderPlan());
  bindClick("[data-start-coach-current]", () => startCoachFromCurrentAttempt());
  bindClick("[data-start-coach-ladder]", () => startCoachFromLadder());
  bindClick("[data-coach-reset]", () => resetCoachSession());
  bindClick("[data-start-coach-retake]", () => startCoachRetake());
  bindClick("[data-coach-record-toggle]", () => {
    if (state.isRecording && state.recordingTarget === "coach") stopRecording();
    else startCoachRetakeRecording();
  });
  bindClick("[data-analyze-coach-retake]", () => analyzeCoachRetake());

  document.querySelectorAll("[data-practice-question]").forEach((button) => {
    button.addEventListener("click", () => practiceQuestion(button.dataset.practiceQuestion));
  });

  document.querySelectorAll("[data-starter-mode]").forEach((button) => {
    button.addEventListener("click", () => setStarterMode(button.dataset.starterMode));
  });

  document.querySelectorAll("[data-ladder-plan-index]").forEach((button) => {
    button.addEventListener("click", () => startLadderPlanTask(Number(button.dataset.ladderPlanIndex)));
  });

  document.querySelectorAll("[data-review-history]").forEach((button) => {
    button.addEventListener("click", () => reviewHistory(button.dataset.reviewHistory));
  });

  document.querySelectorAll("[data-review-pronunciation]").forEach((button) => {
    button.addEventListener("click", () => startPronunciationReview(button.dataset.reviewPronunciation));
  });

  document.querySelectorAll("[data-mistake-book-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.mistakeBookMode = button.dataset.mistakeBookMode;
      render();
    });
  });

  document.querySelectorAll("[data-word-mistake-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.wordMistakeFilter = button.dataset.wordMistakeFilter;
      state.mistakeReview = getDefaultMistakeReviewState();
      render();
    });
  });

  document.querySelectorAll("[data-review-word-pronunciation]").forEach((button) => {
    button.addEventListener("click", () => startWordPronunciationReview(button.dataset.reviewWordPronunciation));
  });

  document.querySelectorAll("[data-start-word-drill]").forEach((button) => {
    button.addEventListener("click", () => startWordEchoDrill(button.dataset.startWordDrill));
  });

  document.querySelectorAll("[data-reset-word-drill]").forEach((button) => {
    button.addEventListener("click", () => resetWordEchoDrill());
  });

  document.querySelectorAll("[data-word-drill-speak]").forEach((button) => {
    button.addEventListener("click", () => speakWordDrillPart(button.dataset.wordDrillSpeak, button.dataset.wordDrillSlow === "true"));
  });

  document.querySelectorAll("[data-word-drill-record]").forEach((button) => {
    button.addEventListener("click", () => toggleWordDrillRecording(button.dataset.wordDrillRecord));
  });

  document.querySelectorAll("[data-check-word-drill]").forEach((button) => {
    button.addEventListener("click", () => analyzeWordDrillPart(button.dataset.checkWordDrill));
  });

  document.querySelectorAll("[data-start-mistake-review]").forEach((button) => {
    button.addEventListener("click", () => startMistakeReview(button.dataset.startMistakeReview));
  });

  document.querySelectorAll("[data-mistake-review-action]").forEach((button) => {
    button.addEventListener("click", () => finishMistakeReviewCard(button.dataset.mistakeReviewAction));
  });

  document.querySelectorAll("[data-mistake-review-star]").forEach((button) => {
    button.addEventListener("click", () => toggleMistakeReviewStar());
  });

  document.querySelectorAll("[data-end-mistake-review]").forEach((button) => {
    button.addEventListener("click", () => endMistakeReview());
  });

  bindMistakeReviewSwipe();

  document.querySelectorAll("[data-speak-word]").forEach((button) => {
    button.addEventListener("click", () => speakNotebookWord(button.dataset.speakWord, false));
  });

  document.querySelectorAll("[data-speak-word-slow]").forEach((button) => {
    button.addEventListener("click", () => speakNotebookWord(button.dataset.speakWordSlow, true));
  });

  document.querySelectorAll("[data-start-coach-history]").forEach((button) => {
    button.addEventListener("click", () => startCoachFromHistory(button.dataset.startCoachHistory));
  });
}

function bindClick(selector, handler) {
  document.querySelectorAll(selector).forEach((element) => {
    element.addEventListener("click", handler);
  });
}

function bindMistakeReviewSwipe() {
  const card = document.querySelector("[data-mistake-review-card]");
  if (!card) return;
  let startX = 0;
  let startY = 0;
  card.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, textarea, input, audio")) return;
    startX = event.clientX;
    startY = event.clientY;
  });
  card.addEventListener("pointerup", (event) => {
    if (!startX) return;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    startX = 0;
    startY = 0;
    if (Math.abs(deltaX) < 90 || Math.abs(deltaX) < Math.abs(deltaY) * 1.4) return;
    finishMistakeReviewCard(deltaX > 0 ? "pass" : "retry");
  });
}

async function startCoachFromCurrentAttempt(source = "practice") {
  if (!state.setup.coach?.enabled) {
    showToast("Coach Capsule is currently disabled in Setup.");
    return;
  }
  const question = getActiveQuestion(state.tab === "full" && state.full.active);
  const transcript = cleanupSpacing(state.transcript);
  if (!state.feedback || !transcript) {
    showToast("Score a practice response first before launching Coach Capsule.");
    return;
  }

  stopIfRecording();
  resetCoachSession(false);
  state.coach = createCoachSessionState({
    source,
    question,
    transcript,
    feedback: state.feedback,
    audioStats: state.audioStats,
    historyId: null
  });
  await runCoachDiagnosis();
}

async function startCoachFromLadder() {
  if (!state.setup.coach?.enabled) {
    showToast("Coach Capsule is currently disabled in Setup.");
    return;
  }
  if (state.feedback && cleanupSpacing(state.transcript)) {
    await startCoachFromCurrentAttempt("ladder");
    return;
  }

  const profile = state.ladder || getDefaultLadderProfile();
  const step = getCurrentLadderStep(profile);
  const plan = profile.diagnosed ? getTodayLadderPlan(profile) : null;
  const fixTask = plan ? plan.tasks.find((task) => task.drill === profile.recommendedDrill) || plan.tasks[2] || plan.tasks[0] : null;
  const question = getQuestionById(fixTask?.questionId) || selectQuestionForLadderTask({
    type: drillPrefersRepeat(profile.recommendedDrill) ? "repeat" : "interview",
    difficulty: step.difficulty,
    drill: profile.recommendedDrill
  });
  const primaryWeakness = weaknessFromDrill(profile.recommendedDrill, question.type);
  const copy = getCoachCopy(primaryWeakness, question.type);
  const diagnosis = normalizeCoachDiagnosis({
    primaryWeakness,
    secondaryWeakness: question.type === "repeat" ? "endingRetention" : "reasonDevelopment",
    mainDiagnosis: `Ladder priority target: ${getWeaknessLabel(primaryWeakness, question.type)}.`,
    evidence: [
      `Recommended Ladder drill: ${DRILL_LIBRARY[profile.recommendedDrill]?.label || "Example Builder"}.`,
      "Coach provides an actionable micro-drill below before you record your targeted retake.",
      "Once you complete the retake, your progress updates your local Coach Profile."
    ],
    coachGoal: copy.goal,
    recommendedDrill: profile.recommendedDrill,
    drillInstruction: copy.instruction,
    retakeMission: copy.mission,
    successCriteria: copy.criteria,
    userFacingFeedback: copy.feedback
  }, { taskType: question.type });

  stopIfRecording();
  resetCoachSession(false);
  state.coach = createCoachSessionState({
    source: "ladder",
    question,
    transcript: "",
    feedback: null,
    audioStats: null,
    historyId: null
  });
  state.coach.phase = "drill-ready";
  state.coach.diagnosis = diagnosis;
  state.coach.drill = buildCoachDrill(diagnosis, question.type);
  state.coach.usedAi = false;
  render();
}

async function startCoachFromHistory(historyId) {
  if (!state.setup.coach?.enabled) {
    showToast("Coach Capsule is currently disabled in Setup.");
    return;
  }
  const item = loadHistory().find((entry) => entry.id === historyId);
  if (!item) return;
  const question = getQuestionById(item.questionId) || {
    id: item.questionId,
    type: item.type,
    text: item.prompt,
    category: "History",
    difficulty: "Review",
    sample: ""
  };
  const feedback = createFeedbackFromHistoryItem(item, question);

  stopIfRecording();
  resetCoachSession(false);
  if (question.type === "repeat") {
    state.currentRepeat = question;
    state.mode = "repeat";
  } else {
    state.currentInterview = question;
    state.mode = "interview";
  }
  state.tab = "practice";
  state.full.active = false;
  state.full.complete = false;
  state.transcript = item.transcript || "";
  state.duration = item.duration || 0;
  state.elapsed = item.duration || 0;
  state.feedback = feedback;
  state.audioStats = item.pronunciation?.audioStats || null;
  state.coach = createCoachSessionState({
    source: "history",
    question,
    transcript: state.transcript,
    feedback,
    audioStats: state.audioStats,
    historyId
  });
  await runCoachDiagnosis();
}

async function runCoachDiagnosis() {
  const coach = state.coach;
  const payload = buildCoachPayload(coach);
  coach.phase = "diagnosing";
  coach.isRunning = true;
  coach.error = null;
  render();

  let diagnosis = null;
  let usedAi = false;
  const canUseAi = canUseCoachAi();
  if (canUseAi) {
    try {
      diagnosis = await runAiCoachDiagnosis(payload);
      usedAi = true;
    } catch (error) {
      coach.error = `AI Coach request failed; switched to local diagnostic rules: ${error.message}`;
    }
  }
  if (!diagnosis) diagnosis = buildLocalCoachDiagnosis(payload);

  coach.phase = "drill-ready";
  coach.isRunning = false;
  coach.usedAi = usedAi;
  coach.diagnosis = normalizeCoachDiagnosis(diagnosis, payload);
  coach.drill = buildCoachDrill(coach.diagnosis, payload.taskType);
  render();
}

function buildCoachPayload(coach) {
  return {
    taskType: coach.original.taskType,
    questionText: coach.original.questionText,
    transcript: coach.original.transcript,
    localFeedback: coach.original.feedback,
    localFeedbackSummary: summarizeFeedbackForCoach(coach.original.feedback),
    audioMetrics: summarizeAudioStats(coach.original.audioStats),
    recentHistory: loadHistory().slice(0, 8).map((item) => ({
      type: item.type,
      score: item.score,
      summary: item.summary,
      issues: item.issues || []
    })),
    coachProfile: loadCoachProfile(),
    ladderProfile: state.ladder
  };
}

function buildLocalCoachDiagnosis(payload) {
  const primaryWeakness = payload.taskType === "repeat"
    ? inferRepeatWeakness(payload.localFeedback)
    : inferInterviewWeakness(payload.localFeedback, payload.transcript);
  const secondaryWeakness = inferSecondaryWeakness(primaryWeakness, payload.taskType);
  const copy = getCoachCopy(primaryWeakness, payload.taskType);
  return {
    primaryWeakness,
    secondaryWeakness,
    mainDiagnosis: copy.diagnosis,
    evidence: buildCoachEvidence(primaryWeakness, payload),
    coachGoal: copy.goal,
    recommendedDrill: COACH_DRILL_MAP[primaryWeakness],
    drillInstruction: copy.instruction,
    retakeMission: copy.mission,
    successCriteria: copy.criteria,
    userFacingFeedback: copy.feedback
  };
}

async function runAiCoachDiagnosis(payload) {
  const config = state.setup.ai;
  if (!config.endpoint || !config.apiKey || !config.model) {
    throw new Error("Please configure your AI endpoint, API key, and model in Setup.");
  }
  const systemPrompt = [
    "You are VoxPilot, an adaptive TOEFL-style speaking coach.",
    "Do not estimate an official TOEFL score.",
    "Diagnose the learner's most important training weakness and generate one actionable micro-drill.",
    "Choose primaryWeakness and secondaryWeakness only from the allowed taxonomy.",
    "Allowed Listen & Repeat weaknesses: keywordRetention, wordOrderStability, endingRetention, pronunciationClarity, paceControl.",
    "Allowed Take an Interview weaknesses: directAnswer, reasonDevelopment, exampleSpecificity, organization, languageUse, fluency.",
    "Return only valid JSON with keys: primaryWeakness, secondaryWeakness, mainDiagnosis, evidence, coachGoal, recommendedDrill, drillInstruction, retakeMission, successCriteria, userFacingFeedback."
  ].join(" ");
  const userPrompt = JSON.stringify({
    taskType: payload.taskType,
    question: payload.questionText,
    userTranscript: payload.transcript,
    localFeedback: payload.localFeedbackSummary,
    audioMetrics: payload.audioMetrics,
    recentLearnerProfile: payload.coachProfile,
    tone: state.setup.coach?.tone || "balanced",
    singleWeaknessOnly: Boolean(state.setup.coach?.singleWeaknessOnly)
  }, null, 2);
  return callConfiguredAiJson(config, systemPrompt, userPrompt);
}

function buildCoachDrill(diagnosis, taskType) {
  const fallbackDrill = taskType === "repeat" ? "chunk-repeat" : "answer-skeleton";
  const drillId = DRILL_LIBRARY[diagnosis.recommendedDrill] ? diagnosis.recommendedDrill : (COACH_DRILL_MAP[diagnosis.primaryWeakness] || fallbackDrill);
  const drill = DRILL_LIBRARY[drillId] || DRILL_LIBRARY[fallbackDrill];
  const copy = getCoachCopy(diagnosis.primaryWeakness, taskType);
  return {
    id: drillId,
    title: drill.label,
    instruction: cleanupSpacing(diagnosis.drillInstruction || copy.instruction || drill.tip),
    retakeMission: cleanupSpacing(diagnosis.retakeMission || copy.mission),
    successCriteria: Array.isArray(diagnosis.successCriteria) && diagnosis.successCriteria.length
      ? diagnosis.successCriteria.slice(0, 4)
      : copy.criteria,
    tip: drill.tip
  };
}

function startCoachRetake() {
  if (!state.coach.active) return;
  clearCoachRetakeWork();
  state.coach.phase = "retaking";
  state.status = "Ready for Coach Retake";
  render();
}

function startCoachRetakeRecording() {
  if (!state.coach.active) return;
  if (state.isRecording && state.recordingTarget !== "coach") {
    showToast("Please stop the active recording first.");
    return;
  }
  state.recordingTarget = "coach";
  state.coach.phase = "retaking";
  startRecording();
}

async function analyzeCoachRetake() {
  const coach = state.coach;
  if (!coach.active || coach.phase === "reflecting") return;
  const transcript = cleanupSpacing(coach.retake.transcript);
  if (!transcript) {
    showToast("No Coach retake transcript yet. Record your retake or type it manually.");
    return;
  }

  const question = getQuestionById(coach.original.questionId) || {
    id: coach.original.questionId,
    type: coach.original.taskType,
    text: coach.original.questionText,
    category: "Coach",
    difficulty: "Retake",
    sample: ""
  };
  const duration = coach.retake.duration || state.duration || state.elapsed;
  const context = {
    audioStats: coach.retake.audioStats,
    recognitionStats: {
      confidenceSamples: [...state.recognitionStats.confidenceSamples],
      finalSegments: state.recognitionStats.finalSegments,
      interimSegments: state.recognitionStats.interimSegments
    }
  };

  coach.retake.transcript = transcript;
  coach.phase = "reflecting";
  coach.isRunning = true;
  render();

  const feedback = question.type === "repeat"
    ? createRepeatFeedback(question, transcript, duration, context)
    : createInterviewFeedback(question, transcript, duration, context);
  await enhanceFeedbackWithExternalScorers(feedback, question, transcript, duration, context, coach.retake.audioBlob);
  feedback.confidence = buildScoringConfidence(question, feedback, transcript, duration, context);

  coach.retake.feedback = feedback;
  coach.isRunning = false;
  await runCoachReflection();
}

async function runCoachReflection() {
  const coach = state.coach;
  const payload = {
    questionText: coach.original.questionText,
    beforeTranscript: coach.original.transcript,
    afterTranscript: coach.retake.transcript,
    retakeMission: coach.drill?.retakeMission || "",
    primaryWeakness: coach.diagnosis?.primaryWeakness || "",
    beforeFeedback: coach.original.feedback,
    afterFeedback: coach.retake.feedback
  };
  let reflection = null;
  const canUseAi = canUseCoachAi();
  if (canUseAi) {
    try {
      reflection = await runAiCoachReflection(payload);
      coach.usedAi = true;
    } catch (error) {
      coach.error = `AI Reflection failed; using local before/after comparison: ${error.message}`;
    }
  }
  if (!reflection) reflection = buildLocalCoachReflection(payload);
  coach.reflection = normalizeCoachReflection(reflection, payload);
  coach.phase = "complete";
  coach.isRunning = false;
  completeCoachSession();
  render();
}

async function runAiCoachReflection(payload) {
  const config = state.setup.ai;
  if (!config.endpoint || !config.apiKey || !config.model) {
    throw new Error("Please configure your AI endpoint, API key, and model in Setup.");
  }
  const systemPrompt = [
    "You are VoxPilot's retake evaluator.",
    "Compare the learner's first answer and retake answer.",
    "Focus only on whether the retake followed the mission.",
    "Do not estimate an official TOEFL score.",
    "Return only valid JSON with keys: improved, improvementSummary, visibleChanges, remainingIssue, nextAction, profileUpdate."
  ].join(" ");
  const userPrompt = JSON.stringify({
    question: payload.questionText,
    firstAnswer: payload.beforeTranscript,
    retakeAnswer: payload.afterTranscript,
    retakeMission: payload.retakeMission,
    primaryWeakness: payload.primaryWeakness
  }, null, 2);
  return callConfiguredAiJson(config, systemPrompt, userPrompt);
}

function buildLocalCoachReflection(payload) {
  const beforeScore = Number(payload.beforeFeedback?.score) || 0;
  const afterScore = Number(payload.afterFeedback?.score) || 0;
  const mission = evaluateCoachMission(payload.afterTranscript, payload.primaryWeakness);
  const wordDelta = normalizeWords(payload.afterTranscript).length - normalizeWords(payload.beforeTranscript).length;
  const improved = mission.passed || afterScore >= beforeScore + 0.5 || wordDelta >= 12;
  const visibleChanges = [];
  if (wordDelta > 8) visibleChanges.push("Your retake included substantially more detail and elaboration.");
  if (mission.notes.length) visibleChanges.push(...mission.notes.slice(0, 3));
  if (afterScore > beforeScore) visibleChanges.push(`Simulated band improved from ${beforeScore || "-"} to ${afterScore}/6.`);
  if (!visibleChanges.length) visibleChanges.push("Retake completed, but the primary target needs one more focused pass.");
  return {
    improved,
    improvementSummary: improved ? "Noticeable improvement on this retake—your response fulfilled the Coach mission." : "The Coach mission is not yet stable; try one more retake before switching prompts.",
    visibleChanges,
    remainingIssue: mission.remainingIssue,
    nextAction: improved
      ? `Keep practicing ${state.coach.drill?.title || "this drill"} until you pass it 3 times in a row.`
      : "Do one more immediate retake with the same mission, focusing on that single bottleneck.",
    profileUpdate: {
      stablePassDelta: improved ? 1 : -1,
      patternResolved: improved
    }
  };
}

function completeCoachSession() {
  const coach = state.coach;
  if (coach.sessionSaved || !coach.reflection) return;
  const session = {
    id: crypto.randomUUID ? crypto.randomUUID() : `coach-${Date.now()}`,
    createdAt: new Date().toISOString(),
    source: coach.source,
    taskType: coach.original.taskType,
    questionId: coach.original.questionId,
    questionText: coach.original.questionText,
    before: {
      transcript: coach.original.transcript,
      score: coach.original.feedback?.score || null,
      feedbackSummary: coach.original.feedback?.summary || ""
    },
    diagnosis: coach.diagnosis,
    drill: coach.drill,
    after: {
      transcript: coach.retake.transcript,
      score: coach.retake.feedback?.score || null
    },
    reflection: coach.reflection,
    usedAi: coach.usedAi
  };
  saveCoachSession(session);
  updateCoachProfile(session);
  coach.sessionSaved = true;
}

async function callConfiguredAiJson(config, systemPrompt, userPrompt) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.apiKey}`
  };
  const body = config.mode === "chat"
    ? {
        model: config.model,
        temperature: clamp(0, 1, Number(config.temperature) || 0),
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      }
    : {
        model: config.model,
        temperature: clamp(0, 1, Number(config.temperature) || 0),
        instructions: systemPrompt,
        input: userPrompt
      };
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${text.slice(0, 160)}`);
  }
  const data = await response.json();
  return parseJsonLike(extractAiText(data));
}

function getDefaultStarterState(mode = "interview") {
  const question = pickStarterQuestion(mode);
  return {
    mode,
    questionId: question.id,
    step: 1,
    feedback: null,
    attempts: [],
    lastSavedSignature: ""
  };
}

function pickStarterQuestion(mode, excludeId = "") {
  const pool = (mode === "repeat" ? QUESTION_BANK.repeat : QUESTION_BANK.interview)
    .filter((item) => item.difficulty !== "Hard");
  const filtered = pool.filter((item) => item.id !== excludeId);
  return randomItem(filtered.length ? filtered : pool);
}

function getStarterQuestion() {
  const starter = state.starter || getDefaultStarterState();
  const pool = starter.mode === "repeat" ? QUESTION_BANK.repeat : QUESTION_BANK.interview;
  let question = pool.find((item) => item.id === starter.questionId);
  if (!question) {
    question = pickStarterQuestion(starter.mode);
    state.starter.questionId = question.id;
  }
  return question;
}

function getStarterSteps(question) {
  if (question.type === "repeat") {
    const chunks = splitStarterChunks(question.text);
    const keywordItems = getStarterKeywords(question).map((word) => ({
      label: word,
      detail: "content word"
    }));
    const keywords = keywordItems.map((item) => item.label).join(" / ");
    const repeatText = state.showSentence ? question.text : "Play the sentence and repeat it completely. Toggle Show Sentence if you need visual support.";
    return [
      {
        title: "Keyword Catch",
        microGoal: "Anchor Content Words",
        interactionLabel: "Target Words",
        displayText: keywords,
        promptNote: "Do not repeat the whole sentence yet—just speak the core content words you hear.",
        mission: "Speak only the key content words to train auditory anchoring.",
        templateLabel: "Target Words Only",
        template: keywords,
        scaffoldTitle: "Content Word Targets",
        scaffoldType: "target-words",
        scaffold: keywordItems
      },
      {
        title: "Chunk Shadowing",
        microGoal: "Speak in Thought Groups",
        interactionLabel: "Chunk Builder",
        displayText: chunks.join(" / "),
        promptNote: "Each slash marks a thought group—deliver each chunk smoothly in one breath.",
        mission: "Repeat chunk by chunk in order, linking content words into natural phrases.",
        templateLabel: "Chunk Sequence",
        template: chunks.join(" / "),
        scaffoldTitle: "Thought Group Assembly",
        scaffoldType: "chunks",
        scaffold: chunks.map((chunk) => ({ label: chunk, detail: "one breath" }))
      },
      {
        title: "Keyword Reconstruction",
        microGoal: "Rebuild from Cues",
        interactionLabel: "Keyword Recall",
        displayText: keywords,
        promptNote: "Reconstruct the complete sentence using only the keyword cues below.",
        mission: "Rebuild the full sentence from the keywords, keeping the subject, main verb, and ending intact.",
        templateLabel: "Required Cues",
        template: keywords,
        scaffoldTitle: "Reconstruction Cues",
        scaffoldType: "recall-cues",
        scaffold: [
          { label: "Start with subject + verb", detail: "Form a complete clause, not a word list" },
          { label: keywords, detail: "Include all core content words" },
          { label: "Finish the ending", detail: "Retain the final modifier phrase" }
        ]
      },
      {
        title: "Full Verbatim Repeat",
        microGoal: "Full Prompt Execution",
        interactionLabel: "Full Task",
        displayText: repeatText,
        promptNote: "Evaluated with the full local 1–6 scoring rubric (no external AI required).",
        mission: "Listen once and repeat the entire sentence verbatim with natural pacing.",
        templateLabel: "Exam Workflow",
        template: "Listen -> pause -> repeat the whole sentence",
        scaffoldTitle: "Full Task Checklist",
        scaffoldType: "full-task",
        scaffold: [
          { label: "Play once", detail: "Listen to the full prompt" },
          { label: "No keyword card", detail: "Rely on auditory memory" },
          { label: "Full local score", detail: "1–6 band rubric check" }
        ]
      }
    ];
  }

  return [
    {
      title: "Direct Claim Only",
      microGoal: "One-Sentence Opening",
      interactionLabel: "Choice Only",
      displayText: question.text,
      promptNote: "State your choice in one crisp sentence—no reasons or examples yet.",
      mission: "Deliver one clear opening claim so you never hesitate at the start of an interview question.",
      templateLabel: "Target Frame",
      template: "I prefer ___. / I think ___.",
      scaffoldTitle: "Opening Position Options",
      scaffoldType: "choice-only",
      scaffold: getStarterChoiceScaffold(question)
    },
    {
      title: "Add Reason (Because)",
      microGoal: "Claim + Reason",
      interactionLabel: "Reason Builder",
      displayText: question.text,
      promptNote: "Connect your Step 1 claim to a concrete reason using because or since.",
      mission: "Deliver a complete claim + reason chain (save your example for Step 3).",
      templateLabel: "Reason Frame",
      template: "I prefer ___ because ___.",
      scaffoldTitle: "Reason Building Blocks",
      scaffoldType: "reason-builder",
      scaffold: [
        { label: "I prefer / I think", detail: "State your opening claim" },
        { label: "because", detail: "Explicit causal connector" },
        { label: "it saves time / gives feedback / reduces stress", detail: "Use a specific benefit rather than 'good'" }
      ]
    },
    {
      title: "Concrete Example Card",
      microGoal: "Add a Real Scenario",
      interactionLabel: "Example Card",
      displayText: question.text,
      promptNote: "Build a vivid example card: Time/Setting + Concrete Action.",
      mission: "Speak just your supporting example with a specific time/place and concrete action verb.",
      templateLabel: "Example Frame",
      template: "For example, last semester I ___.",
      scaffoldTitle: "Example Components",
      scaffoldType: "example-card",
      scaffold: [
        { label: "When / where", detail: "last semester / in my class / once" },
        { label: "Action", detail: "prepared / asked / worked / created" },
        { label: "Object", detail: "presentation / project / homework / notes" }
      ]
    },
    {
      title: "Full Interview Response",
      microGoal: "Full Prompt Execution",
      interactionLabel: "Full Task",
      displayText: question.text,
      promptNote: "Evaluated with the full local 1–6 scoring rubric (no external AI required).",
      mission: "Combine your Claim, Reason, Example, and Result into a cohesive response.",
      templateLabel: "Full Response Blueprint",
      template: "Opinion -> because -> example -> result",
      scaffoldTitle: "4-Part Discourse Structure",
      scaffoldType: "full-task",
      scaffold: [
        { label: "Opinion", detail: "I prefer..." },
        { label: "Reason", detail: "because..." },
        { label: "Example", detail: "For example..." },
        { label: "Result", detail: "This helped me..." }
      ]
    }
  ];
}

function splitStarterChunks(text) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  if (words.length <= 7) return [text];
  const middle = Math.ceil(words.length / 2);
  return [words.slice(0, middle).join(" "), words.slice(middle).join(" ")];
}

function getStarterKeywords(question) {
  const contentWords = getContentWords(normalizeWords(question.text))
    .filter((word) => word.length > 2)
    .slice(0, 6);
  return contentWords.length ? contentWords : normalizeWords(question.text).slice(0, 5);
}

function getStarterChoiceScaffold(question) {
  const lower = question.text.toLowerCase();
  const preferMatch = question.text.match(/prefer\s+(.+?)\s+or\s+(.+?)[?.]?$/i);
  if (preferMatch) {
    return [
      { label: cleanupChoiceLabel(preferMatch[1]), detail: "Option A" },
      { label: cleanupChoiceLabel(preferMatch[2]), detail: "Option B" }
    ];
  }
  if (lower.startsWith("do you") || lower.startsWith("would you") || lower.startsWith("should ")) {
    return [
      { label: "Yes", detail: "agree / choose yes" },
      { label: "No", detail: "disagree / choose no" }
    ];
  }
  return [
    { label: "I think ___", detail: "give one clear opinion" },
    { label: "My choice is ___", detail: "name one object or action" }
  ];
}

function cleanupChoiceLabel(value) {
  return cleanupSpacing(String(value || "")
    .replace(/\bdo you\b/gi, "")
    .replace(/\bwould you\b/gi, "")
    .replace(/\?+$/g, ""));
}

function setStarterMode(mode) {
  if (!["repeat", "interview"].includes(mode)) return;
  stopIfRecording();
  state.starter = getDefaultStarterState(mode);
  state.mode = mode;
  clearStarterAttemptWork(false);
  state.status = "Ready";
  render();
}

function resetStarterQuestion() {
  stopIfRecording();
  const currentId = state.starter.questionId;
  const question = pickStarterQuestion(state.starter.mode, currentId);
  state.starter.questionId = question.id;
  state.starter.step = 1;
  state.starter.attempts = [];
  state.starter.lastSavedSignature = "";
  state.mode = state.starter.mode;
  state.showSentence = false;
  clearStarterAttemptWork(false);
  state.status = "New prompt loaded, starting at Step 1";
  render();
}

function nextStarterStep() {
  if (!state.starter.feedback) {
    showToast("Check this step before moving to the next one.");
    return;
  }
  if (state.starter.step >= 4) return;
  state.starter.step += 1;
  state.showSentence = false;
  clearStarterAttemptWork(false);
  state.status = `Entered Step ${state.starter.step}`;
  render();
}

function clearStarterAttemptWork(keepTranscript = false) {
  if (!keepTranscript) state.transcript = "";
  state.feedback = null;
  state.starter.feedback = null;
  state.isScoring = false;
  state.elapsed = 0;
  state.duration = 0;
  state.audioStats = null;
  state.audioAnalysisPending = false;
  state.recognitionStats = {
    confidenceSamples: [],
    finalSegments: 0,
    interimSegments: 0
  };
  if (state.audioUrl) {
    URL.revokeObjectURL(state.audioUrl);
    state.audioUrl = "";
  }
  state.audioBlob = null;
  if (state.coach?.active) resetCoachSession(false);
  state.recordingTarget = "starter";
}

function analyzeStarterStep() {
  if (state.isScoring) return;
  const question = getStarterQuestion();
  const transcript = cleanupSpacing(state.transcript);
  state.transcript = transcript;
  if (!transcript) {
    showToast("Record or type your response for this step first.");
    return;
  }

  state.isScoring = true;
  state.status = "Checking step goal";
  render();

  const feedback = createStarterFeedback(question, transcript);
  state.starter.feedback = feedback;
  state.isScoring = false;
  state.status = feedback.result === "pass" ? "Step complete. You can move on." : "Feedback ready. Try this step again.";
  state.starter.attempts.push({
    step: state.starter.step,
    transcript,
    result: feedback.result,
    createdAt: new Date().toISOString()
  });
  saveStarterHistoryItem(question, transcript, feedback);
  render();
}

function createStarterFeedback(question, transcript) {
  if (state.starter.step === 4) return createStarterFullFeedback(question, transcript);
  return question.type === "repeat"
    ? createStarterRepeatFeedback(question, transcript)
    : createStarterInterviewFeedback(question, transcript);
}

function createStarterInterviewFeedback(question, transcript) {
  const words = normalizeWords(transcript);
  const lower = ` ${transcript.toLowerCase()} `;
  const step = state.starter.step;
  const direct = /\b(i think|i believe|i prefer|i would|yes|no|my favorite|the best|i agree|i disagree)\b/.test(lower.slice(0, 160));
  const reason = /\b(because|since|the reason|one reason)\b/.test(lower);
  const example = /\b(for example|for instance|last semester|one time|once|when i|in my class|in one course)\b/.test(lower);
  const action = /\b(studied|prepared|joined|worked|asked|used|made|helped|learned|went|took|created|met|found|improved|finished|discussed)\b/.test(lower);

  if (step === 1) {
    const tooLong = words.length > 12 || reason || example;
    return buildStarterResult({
      passed: direct && words.length >= 4 && !tooLong,
      almost: direct || words.length >= 4,
      passSummary: "You stated your position directly.",
      almostSummary: tooLong ? "Your answer was too long; keep this step to one short claim." : "Close, but the claim could be more direct.",
      retrySummary: "Say just one clear opinion.",
      nextAction: "Next attempt: one sentence only, no because, no example.",
      checks: [
        { label: "Direct claim", passed: direct, detail: "Opens with a signal such as I prefer / I think / I would / yes / no." },
        { label: "Complete sentence", passed: words.length >= 4, detail: "Say at least 4 words so the sentence is understandable." },
        { label: "Stay brief", passed: !tooLong, detail: "Do not give reasons or examples in this step." }
      ]
    });
  }

  if (step === 2) {
    const hasGenericOnly = /\b(good|helpful|interesting|important)\b/.test(lower) && words.length < 12;
    return buildStarterResult({
      passed: direct && reason && words.length >= 8 && !example && !hasGenericOnly,
      almost: (direct && reason) || reason || words.length >= 8,
      passSummary: "You connected your claim to a reason.",
      almostSummary: example ? "You started giving an example, but this step is only about the reason." : "Close; you need a fuller because-clause.",
      retrySummary: "This round: claim + because only.",
      nextAction: "Next attempt: use I prefer ___ because ___ and avoid vague reasons like good / helpful.",
      checks: [
        { label: "Has a claim", passed: direct, detail: "Answer the question first, then explain why." },
        { label: "Has a because-reason", passed: reason, detail: "Uses a reason connector such as because / since / reason." },
        { label: "Reason is specific", passed: !hasGenericOnly, detail: "Do not stop at good / helpful / interesting." },
        { label: "No example yet", passed: !example, detail: "Step 2 does not need for example." }
      ]
    });
  }

  return buildStarterResult({
    passed: example && action && words.length >= 12 && !reason,
    almost: example || words.length >= 12,
    passSummary: "You added a concrete example.",
    almostSummary: reason ? "You are still explaining the reason; this step is an example card." : "Close; the example should sound like a real scenario.",
    retrySummary: "This round: concrete example only.",
    nextAction: "Next attempt: add For example / last semester / once and say what you did.",
    checks: [
      { label: "Example signal", passed: example, detail: "Uses a scenario signal such as for example / once / last semester / when I." },
      { label: "Concrete action", passed: action, detail: "The example includes an action like prepared / joined / asked / created." },
      { label: "Example is complete", passed: words.length >= 12, detail: "Use at least 12 words so the example stands on its own." },
      { label: "Example only", passed: !reason, detail: "No need to explain with because in this step." }
    ]
  });
}

function createStarterRepeatFeedback(question, transcript) {
  const words = normalizeWords(transcript);
  const wordSet = new Set(words);
  const keywords = getStarterKeywords(question);
  const hitCount = countOverlap(keywords, wordSet);
  const hitRate = keywords.length ? hitCount / keywords.length : 0;
  const refWords = normalizeWords(question.text);
  const lengthFit = refWords.length ? clamp01(1 - Math.abs(words.length - refWords.length) / Math.max(refWords.length, 4)) : 0;
  const step = state.starter.step;

  if (step === 1) {
    return buildStarterResult({
      passed: hitRate >= 0.6 && words.length <= keywords.length + 2,
      almost: hitRate >= 0.4,
      passSummary: "You caught the core keywords.",
      almostSummary: words.length > keywords.length + 2 ? "You spoke a full sentence; this step is keywords only." : "You caught some keywords; add a few more.",
      retrySummary: "Do not repeat the whole sentence yet; catch the keywords.",
      nextAction: "Next attempt: focus on content words, especially nouns, verbs, times, and places.",
      checks: [
        { label: "Keyword hits", passed: hitRate >= 0.6, detail: `${hitCount}/${keywords.length} keywords spoken.` },
        { label: "Non-empty output", passed: words.length >= 2, detail: "Say at least two meaningful words." },
        { label: "Keywords only", passed: words.length <= keywords.length + 2, detail: "Step 1 does not need a full sentence." }
      ]
    });
  }

  if (step === 2) {
    return buildStarterResult({
      passed: hitRate >= 0.7 && words.length >= keywords.length && lengthFit < 0.95,
      almost: hitRate >= 0.5,
      passSummary: "Your chunked repetition keeps the main information.",
      almostSummary: "Core words are present in the chunks, but not yet stable.",
      retrySummary: "This round: repeat by thought group only.",
      nextAction: "Next attempt: say each chunk in one breath without word-by-word pauses.",
      checks: [
        { label: "More complete keywords", passed: hitRate >= 0.7, detail: `${hitCount}/${keywords.length} keywords retained.` },
        { label: "Sufficient length", passed: words.length >= keywords.length, detail: "Your word count covers at least the number of keywords." },
        { label: "Not yet a full repeat", passed: lengthFit < 0.95, detail: "Step 2 practices chunks; full-sentence exam mode comes later." }
      ]
    });
  }

  return buildStarterResult({
    passed: hitRate >= 0.75 && lengthFit >= 0.45,
    almost: hitRate >= 0.55,
    passSummary: "You rebuilt the main meaning from keywords.",
    almostSummary: "Keywords are there; the sentence needs to be more complete.",
    retrySummary: "This round: keyword-based reconstruction only.",
    nextAction: "Next attempt: start with the subject and verb, then attach the remaining keywords.",
    checks: [
      { label: "Stable keywords", passed: hitRate >= 0.75, detail: `${hitCount}/${keywords.length} keywords retained.` },
      { label: "Length close to original", passed: lengthFit >= 0.45, detail: "The answer cannot be just a keyword list." }
    ]
  });
}

function createStarterFullFeedback(question, transcript) {
  const context = getScoringContext();
  const duration = state.duration || state.elapsed;
  const fullFeedback = question.type === "repeat"
    ? createRepeatFeedback(question, transcript, duration, context)
    : createInterviewFeedback(question, transcript, duration, context);
  fullFeedback.confidence = buildScoringConfidence(question, fullFeedback, transcript, duration, context);
  const passed = fullFeedback.score >= 3.2;
  const almost = fullFeedback.score >= 2.6;
  return buildStarterResult({
    passed,
    almost,
    passSummary: "You completed a full prompt.",
    almostSummary: "You can complete a full prompt; tighten the structure.",
    retrySummary: "This attempt did not meet the basic requirements of the full prompt.",
    nextAction: passed
      ? "Next: try a similar prompt in the Studio, or continue with another Start Easy prompt."
      : "Go back to earlier steps and strengthen your claim, reason, example, or keywords.",
    score: fullFeedback.score,
    fullFeedback,
    checks: [
      { label: "Completed full prompt", passed: fullFeedback.score >= 2.6, detail: "Full local scoring was used to check overall performance." },
      { label: "Reached the starter pass line", passed, detail: "The Start Easy pass line is 3.2/6, not a high-score threshold." },
      { label: "No AI required", passed: true, detail: "Step 4 uses only full local scoring and does not call AI or external pronunciation APIs." }
    ]
  });
}

function buildStarterResult({ passed, almost, passSummary, almostSummary, retrySummary, nextAction, checks, score = null, fullFeedback = null }) {
  const result = passed ? "pass" : almost ? "almost" : "try-again";
  const label = passed ? "Pass" : almost ? "Almost" : "Try Again";
  const summary = passed ? passSummary : almost ? almostSummary : retrySummary;
  return {
    result,
    label,
    summary,
    nextAction,
    checks,
    score,
    fullFeedback
  };
}

function saveStarterHistoryItem(question, transcript, feedback) {
  const signature = `starter|${question.id}|${state.starter.step}|${transcript}|${feedback.result}|${feedback.score || ""}`;
  if (state.starter.lastSavedSignature === signature) return;
  saveHistoryItem({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
    trainingMode: "starter",
    starterStep: state.starter.step,
    starterResult: feedback.result,
    starterFeedback: {
      result: feedback.result,
      label: feedback.label,
      summary: feedback.summary,
      nextAction: feedback.nextAction,
      checks: feedback.checks,
      score: feedback.score
    },
    type: question.type,
    questionId: question.id,
    prompt: question.text,
    transcript,
    score: feedback.score,
    duration: state.duration || state.elapsed,
    summary: `Start Easy Step ${state.starter.step}: ${feedback.summary}`,
    issues: feedback.result === "pass" ? [] : [feedback.nextAction],
    strengths: feedback.result === "pass" ? [feedback.summary] : [],
    detailScores: feedback.fullFeedback?.detailScores || [],
    pronunciation: feedback.fullFeedback?.pronunciation || null,
    alignment: feedback.fullFeedback?.alignment || [],
    rubricProfile: feedback.fullFeedback?.rubricProfile || null,
    confidence: feedback.fullFeedback?.confidence || null
  });
  state.starter.lastSavedSignature = signature;
}

function getTodayStarterCompletions() {
  return loadHistory().filter((item) =>
    item.trainingMode === "starter" &&
    item.starterStep === 4 &&
    item.starterResult === "pass" &&
    isToday(item.createdAt)
  ).length;
}

function reviewStarterHistory(item) {
  stopIfRecording();
  const mode = item.type === "repeat" ? "repeat" : "interview";
  state.starter = {
    ...getDefaultStarterState(mode),
    mode,
    questionId: item.questionId,
    step: item.starterStep || 1,
    feedback: item.starterFeedback || null,
    attempts: [],
    lastSavedSignature: ""
  };
  state.mode = mode;
  state.tab = "starter";
  state.transcript = item.transcript || "";
  state.duration = item.duration || 0;
  state.elapsed = item.duration || 0;
  state.audioStats = null;
  state.audioBlob = null;
  state.audioUrl = "";
  state.feedback = null;
  state.recordingTarget = "starter";
  state.status = "Loaded Start Easy history entry";
  render();
}

function getCurrentRecordingTarget() {
  if (state.recordingTarget === "coach") return "coach";
  if (state.recordingTarget === "starter") return "starter";
  if (state.recordingTarget === "wordDrill") return "wordDrill";
  return "main";
}

function getWordDrillActiveTarget() {
  return state.wordDrill.target === "sentence" ? "sentence" : "word";
}

function getWordDrillTranscript(target = getWordDrillActiveTarget()) {
  return target === "sentence" ? state.wordDrill.sentenceTranscript : state.wordDrill.wordTranscript;
}

function setWordDrillTranscript(value, target = getWordDrillActiveTarget()) {
  if (target === "sentence") state.wordDrill.sentenceTranscript = value;
  else state.wordDrill.wordTranscript = value;
}

function clearWordDrillAttempt(target = getWordDrillActiveTarget()) {
  if (target === "sentence") {
    state.wordDrill.sentenceTranscript = "";
    state.wordDrill.sentenceCheck = null;
    state.wordDrill.sentenceDuration = 0;
    state.wordDrill.sentenceAudioStats = null;
    if (state.wordDrill.sentenceAudioUrl) URL.revokeObjectURL(state.wordDrill.sentenceAudioUrl);
    state.wordDrill.sentenceAudioUrl = "";
    state.wordDrill.sentenceAudioBlob = null;
  } else {
    state.wordDrill.wordTranscript = "";
    state.wordDrill.wordCheck = null;
    state.wordDrill.wordDuration = 0;
    state.wordDrill.wordAudioStats = null;
    if (state.wordDrill.wordAudioUrl) URL.revokeObjectURL(state.wordDrill.wordAudioUrl);
    state.wordDrill.wordAudioUrl = "";
    state.wordDrill.wordAudioBlob = null;
  }
}

async function startRecording() {
  if (state.isRecording) return;
  const target = getCurrentRecordingTarget();
  const drillTarget = target === "wordDrill" ? getWordDrillActiveTarget() : null;
  if (target === "coach") clearCoachRetakeWork();
  else if (target === "starter") clearStarterAttemptWork(false);
  else if (target === "wordDrill") clearWordDrillAttempt(drillTarget);
  else {
    state.recordingTarget = "main";
    clearCurrentWork(false);
  }
  state.isRecording = true;
  state.status = SpeechRecognitionApi ? "Recording, auto-transcribing" : "Recording; you can type the transcript afterward";
  state.elapsed = 0;
  state.duration = 0;
  render();
  startTimer();

  if (navigator.mediaDevices && window.MediaRecorder) {
    try {
      state.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.mediaRecorder = new MediaRecorder(state.stream);
      const chunks = [];
      state.mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      });
      state.mediaRecorder.addEventListener("stop", async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        if (target === "coach") {
          if (state.coach.retake.audioUrl) URL.revokeObjectURL(state.coach.retake.audioUrl);
          state.coach.retake.audioBlob = blob;
          state.coach.retake.audioUrl = URL.createObjectURL(blob);
        } else if (target === "wordDrill") {
          if (drillTarget === "sentence") {
            if (state.wordDrill.sentenceAudioUrl) URL.revokeObjectURL(state.wordDrill.sentenceAudioUrl);
            state.wordDrill.sentenceAudioBlob = blob;
            state.wordDrill.sentenceAudioUrl = URL.createObjectURL(blob);
          } else {
            if (state.wordDrill.wordAudioUrl) URL.revokeObjectURL(state.wordDrill.wordAudioUrl);
            state.wordDrill.wordAudioBlob = blob;
            state.wordDrill.wordAudioUrl = URL.createObjectURL(blob);
          }
        } else {
          if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
          state.audioBlob = blob;
          state.audioUrl = URL.createObjectURL(blob);
        }
        state.audioAnalysisPending = true;
        render();
        const audioStats = await analyzeAudioBlob(blob, state.duration || state.elapsed);
        if (target === "coach") state.coach.retake.audioStats = audioStats;
        else if (target === "wordDrill") {
          if (drillTarget === "sentence") state.wordDrill.sentenceAudioStats = audioStats;
          else state.wordDrill.wordAudioStats = audioStats;
        }
        else state.audioStats = audioStats;
        state.audioAnalysisPending = false;
        if (target === "main" && state.transcript.trim() && !state.feedback) {
          analyzeCurrent();
          return;
        }
        if (target === "starter" && state.transcript.trim() && !state.starter.feedback) {
          analyzeStarterStep();
          return;
        }
        if (target === "wordDrill" && getWordDrillTranscript(drillTarget).trim()) {
          analyzeWordDrillPart(drillTarget);
          return;
        }
        render();
      });
      state.mediaRecorder.start();
    } catch (error) {
      showToast("Microphone access is off. You can still type a transcript and analyze it.");
    }
  }

  startRecognition();
}

function stopRecording() {
  if (!state.isRecording) return;

  const target = getCurrentRecordingTarget();
  const drillTarget = target === "wordDrill" ? getWordDrillActiveTarget() : null;
  state.isRecording = false;
  state.duration = state.elapsed;
  if (target === "coach") state.coach.retake.duration = state.elapsed;
  if (target === "wordDrill" && drillTarget === "sentence") state.wordDrill.sentenceDuration = state.elapsed;
  if (target === "wordDrill" && drillTarget === "word") state.wordDrill.wordDuration = state.elapsed;
  const transcript = target === "coach"
    ? state.coach.retake.transcript
    : target === "wordDrill"
      ? getWordDrillTranscript(drillTarget)
      : state.transcript;
  state.status = cleanupSpacing(transcript) ? "Recording complete, transcript generated" : "Recording complete; check or type the transcript";
  stopTimer();

  if (state.mediaRecorder && state.mediaRecorder.state !== "inactive") {
    state.mediaRecorder.stop();
  }
  if (state.stream) {
    state.stream.getTracks().forEach((track) => track.stop());
  }
  if (state.recognition) {
    try {
      state.recognition.stop();
    } catch (error) {
      // The browser may already have stopped recognition.
    }
  }

  state.mediaRecorder = null;
  state.stream = null;
  state.recognition = null;
  render();

  if (target === "main" && state.transcript.trim()) {
    window.setTimeout(() => {
      if (!state.feedback && !state.audioAnalysisPending) analyzeCurrent();
    }, 900);
  }
  if (target === "starter" && state.transcript.trim()) {
    window.setTimeout(() => {
      if (!state.starter.feedback && !state.audioAnalysisPending) analyzeStarterStep();
    }, 900);
  }
  if (target === "wordDrill" && getWordDrillTranscript(drillTarget).trim()) {
    window.setTimeout(() => {
      if (!state.audioAnalysisPending) analyzeWordDrillPart(drillTarget);
    }, 600);
  }
}

function startRecognition() {
  if (!SpeechRecognitionApi) return;
  try {
    const target = getCurrentRecordingTarget();
    const drillTarget = target === "wordDrill" ? getWordDrillActiveTarget() : null;
    const recognition = new SpeechRecognitionApi();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognition.addEventListener("result", (event) => {
      let text = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const alternative = result[0];
        text += `${alternative.transcript} `;
        if (result.isFinal && index >= event.resultIndex) {
          state.recognitionStats.finalSegments += 1;
          if (Number.isFinite(alternative.confidence) && alternative.confidence > 0) {
            state.recognitionStats.confidenceSamples.push(alternative.confidence);
          }
        } else if (!result.isFinal) {
          state.recognitionStats.interimSegments += 1;
        }
      }
      const transcript = cleanupSpacing(text);
      if (target === "coach") {
        state.coach.retake.transcript = transcript;
        const input = document.querySelector("#coachTranscriptInput");
        if (input) input.value = state.coach.retake.transcript;
      } else if (target === "wordDrill") {
        setWordDrillTranscript(transcript, drillTarget);
        const input = document.querySelector(drillTarget === "sentence" ? "#wordDrillSentenceInput" : "#wordDrillWordInput");
        if (input) input.value = getWordDrillTranscript(drillTarget);
      } else {
        state.transcript = transcript;
        const input = document.querySelector(target === "starter" ? "#starterTranscriptInput" : "#transcriptInput");
        if (input) input.value = state.transcript;
      }
    });
    recognition.addEventListener("error", () => {
      if (state.isRecording) {
        state.status = "Recognition unavailable; type the transcript manually";
        render();
      }
    });
    recognition.addEventListener("end", () => {
      if (state.isRecording) {
        try {
          recognition.start();
        } catch (error) {
          state.status = "Recognition paused; edit the text manually or keep recording";
          updateStatusDom();
        }
      }
    });
    state.recognition = recognition;
    recognition.start();
  } catch (error) {
    state.status = "Recognition failed to start; type the transcript manually";
    updateStatusDom();
  }
}

function startTimer() {
  stopTimer();
  const startedAt = Date.now();
  state.timerId = window.setInterval(() => {
    state.elapsed = Math.floor((Date.now() - startedAt) / 1000);
    updateTimerDom();
  }, 250);
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function updateTimerDom() {
  const timer = document.querySelector("#timer");
  if (timer) timer.textContent = formatTime(state.elapsed);
}

function updateStatusDom() {
  const status = document.querySelector(".status-line span:last-child");
  if (status) status.textContent = state.status;
}

function speakPrompt() {
  const question = getActiveQuestion(state.tab === "full" && state.full.active);
  if (!window.speechSynthesis) {
    showToast("Speech synthesis is not supported in this browser.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(question.text);
  utterance.lang = "en-US";
  utterance.rate = question.type === "repeat" ? 0.88 : 0.94;
  utterance.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  state.status = question.type === "repeat" ? "Playing sentence" : "Reading prompt aloud";
  render();
}

async function analyzeCurrent() {
  if (state.isScoring) return;
  const question = getActiveQuestion(state.tab === "full" && state.full.active);
  const transcript = cleanupSpacing(state.transcript);
  state.transcript = transcript;

  if (!transcript) {
    showToast("No transcript yet. Record first or type what you said.");
    return;
  }

  state.isScoring = true;
  state.status = "Generating score report";
  render();

  const scoringContext = getScoringContext();
  const feedback = question.type === "repeat"
    ? createRepeatFeedback(question, transcript, state.duration || state.elapsed, scoringContext)
    : createInterviewFeedback(question, transcript, state.duration || state.elapsed, scoringContext);
  await enhanceFeedbackWithExternalScorers(feedback, question, transcript, state.duration || state.elapsed, scoringContext);
  feedback.comparison = buildAttemptComparison(feedback, findPreviousAttempt(question.id, transcript));
  feedback.confidence = buildScoringConfidence(question, feedback, transcript, state.duration || state.elapsed, scoringContext);

  state.feedback = feedback;
  state.isScoring = false;
  state.status = "Feedback ready; edit and retake if you like";

  const signature = `${question.id}|${transcript}|${feedback.score}|${state.duration}`;
  if (state.lastSavedSignature !== signature) {
    saveHistoryItem({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      createdAt: new Date().toISOString(),
      type: question.type,
      questionId: question.id,
      prompt: question.text,
      transcript,
      score: feedback.score,
      duration: state.duration || state.elapsed,
      summary: feedback.summary,
      issues: feedback.issues,
      strengths: feedback.strengths,
      detailScores: feedback.detailScores,
      pronunciation: feedback.pronunciation,
      alignment: feedback.alignment || [],
      rubricProfile: feedback.rubricProfile,
      comparison: feedback.comparison,
      confidence: feedback.confidence
    });
    updateLadderAfterFeedback(question, feedback, transcript);
    state.lastSavedSignature = signature;
  }

  if (state.full.active) {
    state.full.results[state.full.index] = {
      question,
      transcript,
      feedback
    };
  }

  render();
}

function startFullRun() {
  stopIfRecording();
  const repeatSet = shuffle([...QUESTION_BANK.repeat]).slice(0, 6);
  const interviewSet = shuffle([...QUESTION_BANK.interview]).slice(0, 5);
  state.full = {
    active: true,
    complete: false,
    examMode: true,
    sequence: shuffle([...repeatSet, ...interviewSet]),
    index: 0,
    results: []
  };
  const current = state.full.sequence[0];
  state.mode = current.type;
  clearCurrentWork(true);
  state.tab = "full";
  render();
  window.setTimeout(() => speakPrompt(), 450);
}

function nextFullItem() {
  if (!state.feedback) {
    showToast("Analyze this prompt before moving to the next one.");
    return;
  }

  if (state.full.index >= state.full.sequence.length - 1) {
    state.full.active = false;
    state.full.complete = true;
    clearCurrentWork(true);
    render();
    return;
  }

  state.full.index += 1;
  state.mode = state.full.sequence[state.full.index].type;
  clearCurrentWork(true);
  render();
  window.setTimeout(() => speakPrompt(), 450);
}

function getActiveQuestion(isFullRun) {
  if (state.tab === "starter") return getStarterQuestion();
  if (isFullRun && state.full.sequence.length) {
    return state.full.sequence[state.full.index];
  }
  return state.mode === "repeat" ? state.currentRepeat : state.currentInterview;
}

function nextQuestion() {
  const isFull = state.tab === "full" && state.full.active;
  if (isFull) {
    const current = state.full.sequence[state.full.index];
    const pool = current.type === "repeat" ? QUESTION_BANK.repeat : QUESTION_BANK.interview;
    state.full.sequence[state.full.index] = randomItem(pool.filter((item) => item.id !== current.id));
    state.mode = state.full.sequence[state.full.index].type;
  } else if (state.mode === "repeat") {
    state.currentRepeat = randomItem(QUESTION_BANK.repeat.filter((item) => item.id !== state.currentRepeat.id));
  } else {
    state.currentInterview = randomItem(QUESTION_BANK.interview.filter((item) => item.id !== state.currentInterview.id));
  }
  clearCurrentWork(true);
  render();
}

function practiceQuestion(id) {
  const question = [...QUESTION_BANK.repeat, ...QUESTION_BANK.interview].find((item) => item.id === id);
  if (!question) return;
  stopIfRecording();
  if (question.type === "repeat") {
    state.currentRepeat = question;
    state.mode = "repeat";
  } else {
    state.currentInterview = question;
    state.mode = "interview";
  }
  state.full.active = false;
  state.full.complete = false;
  state.tab = "practice";
  clearCurrentWork(true);
  render();
}

function reviewHistory(id) {
  const item = loadHistory().find((entry) => entry.id === id);
  if (!item) return;
  if (item.trainingMode === "starter") {
    reviewStarterHistory(item);
    return;
  }
  resetCoachSession(false);
  const question = [...QUESTION_BANK.repeat, ...QUESTION_BANK.interview].find((entry) => entry.id === item.questionId) || {
    id: item.questionId,
    type: item.type,
    text: item.prompt,
    category: "History",
    difficulty: "Review",
    sample: ""
  };
  if (question.type === "repeat") {
    state.currentRepeat = question;
    state.mode = "repeat";
  } else {
    state.currentInterview = question;
    state.mode = "interview";
  }
  state.tab = "practice";
  state.transcript = item.transcript;
  state.duration = item.duration;
  state.elapsed = item.duration;
  state.feedback = question.type === "repeat"
    ? createRepeatFeedback(question, item.transcript, item.duration)
    : createInterviewFeedback(question, item.transcript, item.duration);
  state.status = "Loaded history entry";
  render();
}

function clearCurrentWork(keepQuestion) {
  if (!keepQuestion) {
    state.transcript = "";
  } else {
    state.transcript = "";
  }
  state.feedback = null;
  state.isScoring = false;
  state.status = "Ready";
  state.elapsed = 0;
  state.duration = 0;
  state.audioStats = null;
  state.audioAnalysisPending = false;
  state.recognitionStats = {
    confidenceSamples: [],
    finalSegments: 0,
    interimSegments: 0
  };
  state.showSentence = false;
  state.lastSavedSignature = "";
  if (state.audioUrl) {
    URL.revokeObjectURL(state.audioUrl);
    state.audioUrl = "";
  }
  state.audioBlob = null;
  if (state.coach?.active) resetCoachSession(false);
  else state.recordingTarget = "main";
}

function getDefaultCoachState() {
  return {
    active: false,
    phase: "idle",
    source: null,
    usedAi: false,
    sessionSaved: false,
    original: {
      questionId: null,
      taskType: null,
      questionText: "",
      transcript: "",
      feedback: null,
      audioStats: null,
      historyId: null
    },
    diagnosis: null,
    drill: null,
    retake: {
      transcript: "",
      audioBlob: null,
      audioUrl: "",
      feedback: null,
      audioStats: null,
      duration: 0
    },
    reflection: null,
    isRunning: false,
    error: null
  };
}

function createCoachSessionState({ source, question, transcript, feedback, audioStats, historyId }) {
  return {
    ...getDefaultCoachState(),
    active: true,
    phase: "diagnosing",
    source,
    original: {
      questionId: question.id,
      taskType: question.type,
      questionText: question.text,
      transcript: cleanupSpacing(transcript),
      feedback,
      audioStats,
      historyId
    }
  };
}

function getDefaultWordDrillState() {
  return {
    active: false,
    key: "",
    word: "",
    sentence: "",
    breakdown: [],
    stressHint: "",
    target: "word",
    sourceCount: 0,
    wordTranscript: "",
    sentenceTranscript: "",
    wordCheck: null,
    sentenceCheck: null,
    wordAudioUrl: "",
    sentenceAudioUrl: "",
    wordAudioBlob: null,
    sentenceAudioBlob: null,
    wordAudioStats: null,
    sentenceAudioStats: null,
    wordDuration: 0,
    sentenceDuration: 0
  };
}

function getDefaultMistakeReviewState() {
  return {
    active: false,
    complete: false,
    filter: "weakest",
    deck: [],
    index: 0,
    results: [],
    starredKeys: [],
    startedAt: ""
  };
}

function resetCoachSession(renderNow = true) {
  if (state.coach?.retake?.audioUrl) URL.revokeObjectURL(state.coach.retake.audioUrl);
  state.coach = getDefaultCoachState();
  state.recordingTarget = "main";
  if (renderNow) render();
}

function canUseCoachAi() {
  const setup = state.setup || getDefaultSetupConfig();
  return Boolean(
    setup.coach?.useAi &&
    setup.ai?.endpoint &&
    setup.ai?.apiKey &&
    setup.ai?.model
  );
}

function clearCoachRetakeWork() {
  if (state.coach?.retake?.audioUrl) URL.revokeObjectURL(state.coach.retake.audioUrl);
  state.coach.retake = {
    transcript: "",
    audioBlob: null,
    audioUrl: "",
    feedback: null,
    audioStats: null,
    duration: 0
  };
  state.coach.reflection = null;
  state.coach.sessionSaved = false;
  state.elapsed = 0;
  state.duration = 0;
  state.audioAnalysisPending = false;
  state.recordingTarget = "coach";
  state.recognitionStats = {
    confidenceSamples: [],
    finalSegments: 0,
    interimSegments: 0
  };
}

function createFeedbackFromHistoryItem(item, question) {
  return {
    type: item.type || question.type,
    score: item.score,
    summary: item.summary || "",
    strengths: item.strengths || [],
    issues: item.issues || [],
    improvedAnswer: "",
    metrics: [
      { label: "History", value: `${item.score}/6` },
      { label: "Duration", value: item.duration ? `${item.duration}s` : "-" }
    ],
    detailScores: item.detailScores || [],
    pronunciation: item.pronunciation || null,
    alignment: item.alignment || [],
    rubricProfile: item.rubricProfile || null,
    comparison: item.comparison || null,
    confidence: item.confidence || null
  };
}

function getWeaknessLabel(weakness, taskType) {
  const labels = taskType === "repeat" ? REPEAT_WEAKNESSES : INTERVIEW_WEAKNESSES;
  return labels[weakness] || REPEAT_WEAKNESSES[weakness] || INTERVIEW_WEAKNESSES[weakness] || weakness || "General delivery";
}

function weaknessFromDrill(drill, taskType) {
  const entries = Object.entries(COACH_DRILL_MAP).filter(([, drillId]) => drillId === drill);
  const match = entries.find(([weakness]) => taskType === "repeat" ? weakness in REPEAT_WEAKNESSES : weakness in INTERVIEW_WEAKNESSES);
  if (match) return match[0];
  return taskType === "repeat" ? "keywordRetention" : "exampleSpecificity";
}

function normalizeCoachDiagnosis(raw, payload) {
  const taskType = payload.taskType || "interview";
  const allowed = taskType === "repeat" ? REPEAT_WEAKNESSES : INTERVIEW_WEAKNESSES;
  const fallback = buildLocalCoachDiagnosis({
    ...payload,
    localFeedback: payload.localFeedback || null,
    transcript: payload.transcript || ""
  });
  const primaryWeakness = allowed[raw?.primaryWeakness] ? raw.primaryWeakness : fallback.primaryWeakness;
  const secondaryWeakness = allowed[raw?.secondaryWeakness] && raw.secondaryWeakness !== primaryWeakness
    ? raw.secondaryWeakness
    : inferSecondaryWeakness(primaryWeakness, taskType);
  const recommendedDrill = DRILL_LIBRARY[raw?.recommendedDrill]
    ? raw.recommendedDrill
    : (COACH_DRILL_MAP[primaryWeakness] || (taskType === "repeat" ? "chunk-repeat" : "answer-skeleton"));
  const copy = getCoachCopy(primaryWeakness, taskType);
  return {
    primaryWeakness,
    secondaryWeakness,
    mainDiagnosis: cleanupSpacing(raw?.mainDiagnosis || copy.diagnosis),
    evidence: Array.isArray(raw?.evidence) && raw.evidence.length ? raw.evidence.slice(0, 4) : fallback.evidence,
    coachGoal: cleanupSpacing(raw?.coachGoal || copy.goal),
    recommendedDrill,
    drillInstruction: cleanupSpacing(raw?.drillInstruction || copy.instruction),
    retakeMission: cleanupSpacing(raw?.retakeMission || copy.mission),
    successCriteria: Array.isArray(raw?.successCriteria) && raw.successCriteria.length ? raw.successCriteria.slice(0, 4) : copy.criteria,
    userFacingFeedback: cleanupSpacing(raw?.userFacingFeedback || copy.feedback)
  };
}

function summarizeFeedbackForCoach(feedback) {
  if (!feedback) return "No scored attempt yet.";
  return JSON.stringify({
    score: feedback.score,
    summary: feedback.summary,
    strengths: feedback.strengths || [],
    issues: feedback.issues || [],
    detailScores: (feedback.detailScores || []).map((item) => ({
      label: item.label,
      score: item.score,
      detail: item.detail
    })),
    pronunciation: feedback.pronunciation ? {
      score: feedback.pronunciation.score,
      confidence: feedback.pronunciation.confidence,
      pauseControl: feedback.pronunciation.pauseControl
    } : null
  });
}

function summarizeAudioStats(audioStats) {
  if (!audioStats || !audioStats.available) return "No audio metrics available.";
  return JSON.stringify({
    duration: audioStats.duration,
    rms: audioStats.rms,
    clippingPercent: audioStats.clippingPercent,
    silenceRatio: audioStats.silenceRatio,
    longestSilence: audioStats.longestSilence,
    pauseCount: audioStats.pauseCount,
    snrDb: audioStats.snrDb
  });
}

function inferInterviewWeakness(feedback, transcript) {
  const text = ` ${String(transcript || "").toLowerCase()} `;
  const wordCount = normalizeWords(transcript).length;
  const hasDirect = /\b(i think|i believe|i prefer|i would|my opinion|yes|no)\b/.test(text.slice(0, 160));
  const hasBecause = /\b(because|since|the reason|one reason)\b/.test(text);
  const hasExample = /\b(for example|for instance|last semester|one time|once|when i|in my class|in one course)\b/.test(text);
  const hasResult = /\b(as a result|this helped|therefore|because of this|so i|that is why)\b/.test(text);
  if (!hasDirect && wordCount < 28) return "directAnswer";
  if (!hasBecause) return "reasonDevelopment";
  if (!hasExample) return "exampleSpecificity";
  if (!hasResult) return "organization";
  if ((feedback?.pronunciation?.pauseControl ?? 1) < 0.6) return "fluency";
  return "languageUse";
}

function inferRepeatWeakness(feedback) {
  const details = feedback?.detailScores || [];
  const lowest = [...details].sort((a, b) => Number(a.score) - Number(b.score))[0];
  if (!lowest) return "keywordRetention";
  const label = lowest.label || "";
  if (/Completeness|Accuracy|Listening|Retention/i.test(label)) return "keywordRetention";
  if (/Order|Sequence/i.test(label)) return "wordOrderStability";
  if (/Pronunciation|Intelligibility/i.test(label)) return "pronunciationClarity";
  if (/Pace|Pacing|Fluency/i.test(label)) return "paceControl";
  return "endingRetention";
}

function inferSecondaryWeakness(primaryWeakness, taskType) {
  const repeatOrder = ["keywordRetention", "wordOrderStability", "endingRetention", "pronunciationClarity", "paceControl"];
  const interviewOrder = ["directAnswer", "reasonDevelopment", "exampleSpecificity", "organization", "languageUse", "fluency"];
  const order = taskType === "repeat" ? repeatOrder : interviewOrder;
  return order.find((item) => item !== primaryWeakness) || order[0];
}

function buildCoachEvidence(weakness, payload) {
  const text = ` ${String(payload.transcript || "").toLowerCase()} `;
  const evidence = [];
  if (payload.localFeedback?.summary) evidence.push(payload.localFeedback.summary);
  if (weakness === "exampleSpecificity") evidence.push("The answer lacks a clear scenario signal such as for example / last semester / one time.");
  if (weakness === "reasonDevelopment") evidence.push("The claim is not followed by a reason introduced with because / since.");
  if (weakness === "organization") evidence.push("The example is not followed by a result sentence such as as a result / this helped me.");
  if (weakness === "directAnswer") evidence.push("The opening does not state a position directly enough.");
  if (weakness === "languageUse") evidence.push("The basic structure is there; next, upgrade the wording and reduce repetition.");
  if (weakness === "fluency") evidence.push("Pauses, filler words, or rhythm stability are the best targets for the next attempt.");
  if (weakness === "keywordRetention") evidence.push("For repeat tasks, check first whether keywords and core content were retained.");
  if (weakness === "wordOrderStability") evidence.push("Paraphrase less and keep the original word order.");
  if (weakness === "endingRetention") evidence.push("Sentence endings are easy to lose; next time focus on the last 3-5 keywords.");
  if (weakness === "pronunciationClarity") evidence.push("Recognition stability or the local pronunciation proxy is low; speak content words slowly and clearly next time.");
  if (weakness === "paceControl") evidence.push("Pause between thought groups instead of pushing out one word at a time.");
  if (/\b(helpful|interesting|good|important)\b/.test(text)) evidence.push("You used vague evaluative words; replace them with concrete actions and results.");
  return evidence.slice(0, 4);
}

function getCoachCopy(weakness, taskType) {
  const copies = {
    keywordRetention: {
      diagnosis: "Your main repeat issue is unstable keyword retention.",
      goal: "Catch the subject, verb, time, place, and content words first.",
      instruction: "Split the sentence into 2-3 thought groups, keep only keywords in each, then link them.",
      mission: "Next attempt, do one thing: keep the original keywords and do not swap words.",
      criteria: ["Keep the main nouns and verbs", "Add no information that was not in the sentence", "Do not change the meaning"],
      feedback: "Accuracy first, then speed."
    },
    wordOrderStability: {
      diagnosis: "Your repeat has content, but word order and sentence frame are unstable.",
      goal: "Repeat in the original order; do not rush to paraphrase.",
      instruction: "After listening, silently rehearse the sentence frame, then say it in the original order.",
      mission: "Next attempt must keep the original word order.",
      criteria: ["Start with the subject and verb", "Keep middle details in order", "Do not paraphrase"],
      feedback: "Practice the sentence frame on this item."
    },
    endingRetention: {
      diagnosis: "Sentence endings are getting lost, making your repeat incomplete.",
      goal: "Finish the final thought group completely.",
      instruction: "While listening, mark the last 3-5 content words and slow down at the end when repeating.",
      mission: "Next attempt must include the ending keywords.",
      criteria: ["Keep the final thought group", "Finish word-final sounds", "Do not trail off"],
      feedback: "This time, focus only on the ending."
    },
    pronunciationClarity: {
      diagnosis: "Pronunciation clarity is affecting recognition and listener comprehension.",
      goal: "Speak content words and final sounds slowly and clearly.",
      instruction: "Pick 3 content words, read them slowly twice, then repeat the whole sentence.",
      mission: "Next attempt: slow down about 10% and complete content words and final sounds.",
      criteria: ["Stress content words", "Do not swallow final sounds", "Keep recording volume steady"],
      feedback: "Clear first, natural second."
    },
    paceControl: {
      diagnosis: "Your pace and pause control are not yet steady.",
      goal: "Speak through each thought group and reduce long pauses.",
      instruction: "Mark the sentence into chunks with slashes, say each chunk in one breath, and pause briefly between chunks.",
      mission: "Next attempt: use 2-3 thought groups and do not pause between every word.",
      criteria: ["Long pauses under 1.2 seconds", "Each thought group is continuous", "Overall pace sounds natural"],
      feedback: "Treat the sentence as chunks, not a list of words."
    },
    directAnswer: {
      diagnosis: "Your answer needs a more direct opening position.",
      goal: "Answer the question in your first sentence.",
      instruction: "Use the template: I prefer ___ because ___. Then explain.",
      mission: "Next attempt: the first sentence must state your opinion.",
      criteria: ["Open with I prefer / I think / I would", "Do not build up first", "Include because or a reason in the first sentence"],
      feedback: "Answer first, then expand."
    },
    reasonDevelopment: {
      diagnosis: "You have a claim, but the reason is underdeveloped.",
      goal: "Link your claim to the reason with because.",
      instruction: "Use two sentences: I prefer ___. This is because ___.",
      mission: "Next attempt must include a clear because-sentence.",
      criteria: ["Uses because / since", "The reason explains why", "Not just helpful / good"],
      feedback: "A reason should explain the effect."
    },
    exampleSpecificity: {
      diagnosis: "You have a claim, but the example is not specific enough.",
      goal: "Add one concrete experience and one result sentence.",
      instruction: "Use this structure: I prefer ___ because ___. For example, last semester I ___. This helped me ___.",
      mission: "Next attempt must include a specific time or scene, what you did, and the result.",
      criteria: ["Has a specific time or scene", "Has one concrete action", "Has a result sentence"],
      feedback: "Turn a generic reason into a real scenario."
    },
    organization: {
      diagnosis: "You have enough material, but the structure does not close clearly.",
      goal: "Close the answer with claim, reason, example, and result.",
      instruction: "Use four sentences: claim → because reason → for example → so/result conclusion.",
      mission: "Next attempt must include a clear result or summary sentence.",
      criteria: ["Claim comes first", "Result follows the example", "Ending returns to the question"],
      feedback: "Let the listener know you have finished."
    },
    languageUse: {
      diagnosis: "You can express the basic meaning, but vocabulary and sentence patterns are repetitive.",
      goal: "Replace vague words with specific expressions.",
      instruction: "Replace good/helpful/interesting with phrases like improve my efficiency / receive feedback / reduce stress.",
      mission: "Next attempt: upgrade at least two vague expressions.",
      criteria: ["Use good / helpful less", "Add one specific verb phrase", "Keep grammar simple but accurate"],
      feedback: "Upgrade wording without piling on complex sentences."
    },
    fluency: {
      diagnosis: "Your answer needs steadier fluency.",
      goal: "Finish with short, continuous sentences and fewer fillers and long pauses.",
      instruction: "Write 4 keywords first, then speak 4 short sentences; do not aim for long, complex ones.",
      mission: "Next attempt: speak in short sentences and avoid long stalls.",
      criteria: ["Fewer than 3 filler words", "8-14 words per sentence", "Do not restart the answer midway"],
      feedback: "Steady short sentences beat stalling on long ones."
    }
  };
  return copies[weakness] || copies[taskType === "repeat" ? "keywordRetention" : "exampleSpecificity"];
}

function evaluateCoachMission(transcript, weakness) {
  const words = normalizeWords(transcript);
  const lower = ` ${String(transcript || "").toLowerCase()} `;
  const notes = [];
  let passed = false;
  let remainingIssue = "The mission is not yet stable.";
  if (weakness === "exampleSpecificity") {
    const hasScene = /\b(for example|for instance|last semester|one time|once|when i|in my class|in one course)\b/.test(lower);
    const hasResult = /\b(as a result|this helped|therefore|because of this|so i|that is why)\b/.test(lower);
    passed = hasScene && hasResult;
    if (hasScene) notes.push("Your retake added a specific scene or experience.");
    if (hasResult) notes.push("Your retake added a result sentence.");
    remainingIssue = "You still need both a specific scene and a result sentence.";
  } else if (weakness === "reasonDevelopment") {
    passed = /\b(because|since|the reason)\b/.test(lower) && words.length >= 24;
    if (passed) notes.push("Your retake has a clearer because-sentence.");
    remainingIssue = "The reason must explain why, not just give an evaluative word.";
  } else if (weakness === "directAnswer") {
    passed = /\b(i think|i believe|i prefer|i would|yes|no)\b/.test(lower.slice(0, 120));
    if (passed) notes.push("Your retake opens by answering the question more directly.");
    remainingIssue = "The first sentence still needs to state your position sooner.";
  } else if (weakness === "organization") {
    passed = /\b(for example|for instance)\b/.test(lower) && /\b(as a result|therefore|that is why|so i)\b/.test(lower);
    if (passed) notes.push("Your retake has a fuller structure with both an example and a result.");
    remainingIssue = "Add a result or summary sentence after the example.";
  } else if (weakness === "languageUse") {
    const uniqueRatio = words.length ? new Set(words).size / words.length : 0;
    passed = words.length >= 30 && uniqueRatio >= 0.55;
    if (passed) notes.push("Your retake uses richer wording with less repetition.");
    remainingIssue = "Be more specific and use good/helpful/interesting less.";
  } else if (weakness === "fluency") {
    const fillers = lower.match(/\b(um|uh|er|like|you know|sort of|kind of)\b/g) || [];
    passed = words.length >= 25 && fillers.length <= 2;
    if (passed) notes.push("Your retake is more continuous with better filler control.");
    remainingIssue = "Reduce filler words or long pauses.";
  } else {
    const refWords = normalizeWords(state.coach.original.questionText);
    const overlap = refWords.length ? countOverlap(refWords, new Set(words)) / Math.max(1, new Set(refWords).size) : 0;
    passed = overlap >= 0.62;
    if (passed) notes.push("Your retake kept more of the original keywords.");
    remainingIssue = "Keyword retention is still low; catch the content words first.";
  }
  return { passed, notes, remainingIssue };
}

function normalizeCoachReflection(raw, payload) {
  const fallback = buildLocalCoachReflection(payload);
  return {
    improved: typeof raw?.improved === "boolean" ? raw.improved : fallback.improved,
    improvementSummary: cleanupSpacing(raw?.improvementSummary || fallback.improvementSummary),
    visibleChanges: Array.isArray(raw?.visibleChanges) && raw.visibleChanges.length ? raw.visibleChanges.slice(0, 5) : fallback.visibleChanges,
    remainingIssue: cleanupSpacing(raw?.remainingIssue || fallback.remainingIssue),
    nextAction: cleanupSpacing(raw?.nextAction || fallback.nextAction),
    profileUpdate: {
      stablePassDelta: Number(raw?.profileUpdate?.stablePassDelta ?? fallback.profileUpdate.stablePassDelta),
      patternResolved: Boolean(raw?.profileUpdate?.patternResolved ?? fallback.profileUpdate.patternResolved)
    }
  };
}

function getDefaultCoachProfile() {
  return {
    version: "1.0",
    updatedAt: new Date().toISOString(),
    levelHint: state.ladder?.diagnosed ? (LADDER_LEVELS[state.ladder.level] || LADDER_LEVELS[1]).name : "Undiagnosed",
    primaryWeakness: "",
    secondaryWeakness: "",
    skillState: {
      repeat: {
        keywordRetention: 0.62,
        wordOrderStability: 0.62,
        endingRetention: 0.58,
        pronunciationClarity: 0.66,
        paceControl: 0.66
      },
      interview: {
        directAnswer: 0.68,
        reasonDevelopment: 0.58,
        exampleSpecificity: 0.52,
        organization: 0.56,
        languageUse: 0.58,
        fluency: 0.64
      }
    },
    recentPatterns: [],
    currentCoachGoal: "Complete one Coach retake to set your first practice goal.",
    currentDrill: "example-builder",
    stablePasses: 0
  };
}

function loadCoachProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(COACH_PROFILE_STORAGE_KEY) || "{}");
    return normalizeCoachProfile(saved);
  } catch (error) {
    return getDefaultCoachProfile();
  }
}

function normalizeCoachProfile(saved) {
  const base = getDefaultCoachProfile();
  return {
    ...base,
    ...saved,
    skillState: {
      repeat: { ...base.skillState.repeat, ...(saved.skillState?.repeat || {}) },
      interview: { ...base.skillState.interview, ...(saved.skillState?.interview || {}) }
    },
    recentPatterns: Array.isArray(saved.recentPatterns) ? saved.recentPatterns.slice(0, 8) : [],
    stablePasses: Number.isFinite(Number(saved.stablePasses)) ? Number(saved.stablePasses) : 0
  };
}

function saveCoachProfile(profile) {
  localStorage.setItem(COACH_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function saveCoachSession(session) {
  const sessions = loadCoachSessions();
  sessions.unshift(session);
  localStorage.setItem(COACH_SESSIONS_STORAGE_KEY, JSON.stringify(sessions.slice(0, 50)));
}

function loadCoachSessions() {
  try {
    const raw = localStorage.getItem(COACH_SESSIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function updateCoachProfile(session) {
  const profile = loadCoachProfile();
  const group = session.taskType === "repeat" ? "repeat" : "interview";
  const primary = session.diagnosis?.primaryWeakness || (group === "repeat" ? "keywordRetention" : "exampleSpecificity");
  const secondary = session.diagnosis?.secondaryWeakness || inferSecondaryWeakness(primary, group);
  const beforeScore = Number(session.before?.score) || 0;
  const afterScore = Number(session.after?.score) || 0;
  const scoreDelta = afterScore && beforeScore ? clamp(-0.25, 0.25, (afterScore - beforeScore) / 6) : 0;
  const currentScore = clamp01((session.reflection?.improved ? 0.72 : 0.42) + scoreDelta);
  profile.skillState[group][primary] = updateSkillScore(profile.skillState[group][primary], currentScore);
  profile.primaryWeakness = primary;
  profile.secondaryWeakness = secondary;
  profile.updatedAt = new Date().toISOString();
  profile.levelHint = state.ladder?.diagnosed ? (LADDER_LEVELS[state.ladder.level] || LADDER_LEVELS[1]).name : profile.levelHint;
  profile.currentCoachGoal = session.drill?.retakeMission || profile.currentCoachGoal;
  profile.currentDrill = session.drill?.id || profile.currentDrill;
  profile.stablePasses = session.reflection?.improved
    ? (profile.stablePasses || 0) + 1
    : Math.max(0, (profile.stablePasses || 0) - 1);
  const pattern = patternForWeakness(primary);
  profile.recentPatterns = [pattern, ...(profile.recentPatterns || []).filter((item) => item !== pattern)].slice(0, 8);
  if (profile.stablePasses >= 3) {
    profile.currentCoachGoal = "You have hit this goal consistently. Next time Coach will pick a higher-priority issue from your new answer.";
    profile.stablePasses = 0;
  }
  saveCoachProfile(profile);
}

function updateSkillScore(oldScore, currentScore, alpha = 0.25) {
  if (!Number.isFinite(Number(oldScore))) return currentScore;
  return Number(oldScore) * (1 - alpha) + Number(currentScore) * alpha;
}

function patternForWeakness(weakness) {
  const patterns = {
    keywordRetention: "missing_keywords_in_repeat",
    wordOrderStability: "unstable_word_order",
    endingRetention: "missing_sentence_ending",
    pronunciationClarity: "low_pronunciation_clarity",
    paceControl: "unstable_pace_control",
    directAnswer: "delayed_direct_answer",
    reasonDevelopment: "generic_reason_without_explanation",
    exampleSpecificity: "generic_reason_without_example",
    organization: "missing_result_sentence",
    languageUse: "limited_language_variety",
    fluency: "fluency_breakdowns"
  };
  return patterns[weakness] || "general_speaking_issue";
}

function stopIfRecording() {
  if (state.isRecording) stopRecording();
  stopTimer();
}

function getFilteredQuestions() {
  return [...QUESTION_BANK.repeat, ...QUESTION_BANK.interview].filter((item) => {
    const typeMatch = state.bankType === "all" || item.type === state.bankType;
    const difficultyMatch = state.bankDifficulty === "all" || item.difficulty === state.bankDifficulty;
    return typeMatch && difficultyMatch;
  });
}

function getDefaultLadderProfile() {
  return {
    diagnosed: false,
    level: 1,
    step: 1,
    recommendedDrill: "example-builder",
    weaknesses: [],
    recent: [],
    stepProgress: {},
    dailyPlan: null,
    currentTask: null,
    diagnostic: null
  };
}

function loadLadderProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(LADDER_STORAGE_KEY) || "{}");
    return normalizeLadderProfile(saved);
  } catch (error) {
    return getDefaultLadderProfile();
  }
}

function normalizeLadderProfile(saved) {
  const base = getDefaultLadderProfile();
  const profile = { ...base, ...(saved || {}) };
  profile.level = clamp(1, 5, Number(profile.level) || 1);
  profile.step = clamp(1, 5, Number(profile.step) || 1);
  profile.weaknesses = Array.isArray(profile.weaknesses) ? profile.weaknesses : [];
  profile.recent = Array.isArray(profile.recent) ? profile.recent : [];
  profile.stepProgress = profile.stepProgress && typeof profile.stepProgress === "object" ? profile.stepProgress : {};
  profile.recommendedDrill = DRILL_LIBRARY[profile.recommendedDrill] ? profile.recommendedDrill : "example-builder";
  return profile;
}

function saveLadderProfile() {
  localStorage.setItem(LADDER_STORAGE_KEY, JSON.stringify(state.ladder));
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveHistoryItem(item) {
  const history = loadHistory();
  history.unshift(item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
}

function exportHistory() {
  const history = loadHistory();
  downloadJson(history, "toefl-speaking-history.json");
}

function exportAllLocalData() {
  downloadJson(buildLocalDataSnapshot(), "voxpilot-local-data.json");
}

function buildLocalDataSnapshot() {
  return {
    version: "1.1",
    exportedAt: new Date().toISOString(),
    app: "VoxPilot Speaking Lab",
    history: loadHistory(),
    ladder: state.ladder || loadLadderProfile(),
    coachProfile: loadCoachProfile(),
    coachSessions: loadCoachSessions(),
    setup: redactSetupConfig(state.setup || loadSetupConfig()),
    note: "API keys are intentionally redacted from this export."
  };
}

function redactSetupConfig(setup) {
  const safe = mergeSetupConfig(getDefaultSetupConfig(), setup || {});
  return {
    ai: {
      enabled: safe.ai.enabled,
      mode: safe.ai.mode,
      endpoint: safe.ai.endpoint,
      hasApiKey: Boolean(safe.ai.apiKey),
      model: safe.ai.model,
      temperature: safe.ai.temperature
    },
    pronunciation: {
      enabled: safe.pronunciation.enabled,
      provider: safe.pronunciation.provider,
      azureRegion: safe.pronunciation.azureRegion,
      endpoint: safe.pronunciation.endpoint,
      hasApiKey: Boolean(safe.pronunciation.apiKey)
    },
    coach: { ...safe.coach }
  };
}

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function clearCoachDataWithConfirm() {
  const hasCoachSessions = loadCoachSessions().length > 0;
  const hasCoachProfile = Boolean(localStorage.getItem(COACH_PROFILE_STORAGE_KEY));
  if (!hasCoachSessions && !hasCoachProfile) return;
  const ok = window.confirm("Clear only Coach retake records and the Coach Profile? Regular practice history and Ladder are kept.");
  if (!ok) return;
  localStorage.removeItem(COACH_SESSIONS_STORAGE_KEY);
  localStorage.removeItem(COACH_PROFILE_STORAGE_KEY);
  resetCoachSession(false);
  render();
}

function clearHistoryWithConfirm() {
  const hasHistory = loadHistory().length > 0;
  const hasCoachSessions = loadCoachSessions().length > 0;
  const hasCoachProfile = Boolean(localStorage.getItem(COACH_PROFILE_STORAGE_KEY));
  if (!hasHistory && !hasCoachSessions && !hasCoachProfile) return;
  const ok = window.confirm("Clear local practice history, Coach retake records, and the Coach Profile? This only affects this browser.");
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(COACH_SESSIONS_STORAGE_KEY);
  localStorage.removeItem(COACH_PROFILE_STORAGE_KEY);
  resetCoachSession(false);
  render();
}

function getDefaultSetupConfig() {
  return {
    ai: {
      enabled: false,
      mode: "responses",
      endpoint: "",
      apiKey: "",
      model: "",
      temperature: 0.1
    },
    pronunciation: {
      enabled: false,
      provider: "azure",
      azureRegion: "",
      endpoint: "",
      apiKey: ""
    },
    coach: {
      enabled: true,
      useAi: true,
      tone: "balanced",
      singleWeaknessOnly: true
    }
  };
}

function loadSetupConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETUP_STORAGE_KEY) || "{}");
    return mergeSetupConfig(getDefaultSetupConfig(), saved);
  } catch (error) {
    return getDefaultSetupConfig();
  }
}

function mergeSetupConfig(base, saved) {
  return {
    ai: { ...base.ai, ...(saved.ai || {}) },
    pronunciation: { ...base.pronunciation, ...(saved.pronunciation || {}) },
    coach: { ...base.coach, ...(saved.coach || {}) }
  };
}

function saveSetupFromForm() {
  const setup = {
    ai: {
      enabled: Boolean(document.querySelector("#aiEnabled")?.checked),
      mode: document.querySelector("#aiMode")?.value || "responses",
      endpoint: cleanupSpacing(document.querySelector("#aiEndpoint")?.value || ""),
      apiKey: document.querySelector("#aiKey")?.value || "",
      model: cleanupSpacing(document.querySelector("#aiModel")?.value || ""),
      temperature: Number(document.querySelector("#aiTemperature")?.value || 0.1)
    },
    pronunciation: {
      enabled: Boolean(document.querySelector("#pronEnabled")?.checked),
      provider: document.querySelector("#pronProvider")?.value || "azure",
      azureRegion: cleanupSpacing(document.querySelector("#azureRegion")?.value || ""),
      endpoint: cleanupSpacing(document.querySelector("#pronEndpoint")?.value || ""),
      apiKey: document.querySelector("#pronKey")?.value || ""
    },
    coach: {
      enabled: Boolean(document.querySelector("#coachEnabled")?.checked),
      useAi: Boolean(document.querySelector("#coachUseAi")?.checked),
      tone: document.querySelector("#coachTone")?.value || "balanced",
      singleWeaknessOnly: Boolean(document.querySelector("#coachSingleWeaknessOnly")?.checked)
    }
  };
  state.setup = mergeSetupConfig(getDefaultSetupConfig(), setup);
  localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(state.setup));
  showToast("Settings saved to this browser.");
}

function clearSetupWithConfirm() {
  const ok = window.confirm("Clear local API settings?");
  if (!ok) return;
  localStorage.removeItem(SETUP_STORAGE_KEY);
  state.setup = getDefaultSetupConfig();
  render();
}

function averageScore(items) {
  const scored = items.filter((item) => Number.isFinite(Number(item.score)));
  if (!scored.length) return "";
  const average = scored.reduce((sum, item) => sum + Number(item.score), 0) / scored.length;
  return String(roundHalf(average));
}

function normalizeWords(text) {
  return cleanupSpacing(text)
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.replace(/^-+|-+$/g, ""))
    .filter(Boolean);
}

function cleanupSpacing(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function formatTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function isWithinDays(value, days) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() <= days * 24 * 60 * 60 * 1000;
}

function isToday(value) {
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function clamp(min, max, value) {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value) {
  return clamp(0, 1, value);
}

function percentile(values, ratio) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * ratio)));
  return sorted[index];
}

function roundHalf(value) {
  return Math.round(Number(value) * 2) / 2;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message) {
  state.toast = message;
  render();
  window.setTimeout(() => {
    state.toast = "";
    render();
  }, 2600);
}

init();
