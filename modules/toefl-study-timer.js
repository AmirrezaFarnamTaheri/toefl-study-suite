// TOEFL 2026 Study Timer: Pomodoro, Sprint Countdown, Stopwatch & Daily Focus Goal
(function initToeflStudyTimer(global) {
  const STORAGE_KEY = "toefl-study-timer-v1";
  const POMODORO_PRESETS = [
    { label: "25 / 5", focus: 25, rest: 5 },
    { label: "50 / 10", focus: 50, rest: 10 },
    { label: "15 / 3", focus: 15, rest: 3 }
  ];
  const SPRINT_PRESETS = [
    { label: "7m Email", minutes: 7 },
    { label: "10m Discussion", minutes: 10 },
    { label: "18m Reading", minutes: 18 },
    { label: "25m Focus", minutes: 25 }
  ];

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function yesterdayKey() {
    const d = new Date(Date.now() - 86400000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function defaultStats() {
    return {
      date: todayKey(),
      focusMinutes: 0,
      pomodoros: 0,
      goalMinutes: 30,
      streakDays: 0,
      lastActiveDate: ""
    };
  }

  function loadStats() {
    try {
      const raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultStats();
      const parsed = JSON.parse(raw);
      const today = todayKey();
      if (parsed && parsed.date === today) return { ...defaultStats(), ...parsed };
      const keptStreak = parsed && parsed.lastActiveDate === yesterdayKey() ? (parsed.streakDays || 0) : 0;
      return {
        ...defaultStats(),
        goalMinutes: (parsed && parsed.goalMinutes) || 30,
        streakDays: keptStreak,
        lastActiveDate: (parsed && parsed.lastActiveDate) || ""
      };
    } catch {
      return defaultStats();
    }
  }

  function saveStats(stats) {
    try {
      if (global.localStorage) global.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore storage errors
    }
  }

  function fmtClock(totalSec) {
    const safe = Math.max(0, Math.floor(totalSec));
    const hrs = Math.floor(safe / 3600);
    const mins = Math.floor((safe % 3600) / 60);
    const secs = safe % 60;
    if (hrs > 0) return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function playGentleChime() {
    try {
      const AudioCtx = global.AudioContext || global.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.46);
    } catch {
      // ignore audio restrictions
    }
  }

  const timerState = {
    open: false,
    mode: "pomodoro", // pomodoro | countdown | stopwatch
    presetIdx: 0,
    phase: "focus", // focus | break
    sprintMinutes: 10,
    seconds: 25 * 60,
    running: false,
    muted: false,
    notice: "",
    intervalId: null,
    focusAccumSec: 0,
    stats: loadStats()
  };

  function logStudyMinutes(minutes, completedPomodoro) {
    if (minutes <= 0 && !completedPomodoro) return;
    const today = todayKey();
    const s = timerState.stats.date === today
      ? timerState.stats
      : {
          ...defaultStats(),
          goalMinutes: timerState.stats.goalMinutes,
          streakDays: timerState.stats.lastActiveDate === yesterdayKey() ? timerState.stats.streakDays : 0,
          lastActiveDate: timerState.stats.lastActiveDate
        };
    const isNewActiveDay = s.lastActiveDate !== today;
    timerState.stats = {
      ...s,
      date: today,
      focusMinutes: s.focusMinutes + minutes,
      pomodoros: s.pomodoros + (completedPomodoro ? 1 : 0),
      streakDays: isNewActiveDay ? s.streakDays + 1 : Math.max(1, s.streakDays),
      lastActiveDate: today
    };
    saveStats(timerState.stats);
  }

  function pillLabel() {
    if (!timerState.running) return "Study timer";
    const prefix = timerState.mode === "pomodoro"
      ? (timerState.phase === "focus" ? "Focus" : "Break")
      : timerState.mode === "countdown"
        ? "Timer"
        : "Clock";
    return `${prefix} ${fmtClock(timerState.seconds)}`;
  }

  function updateLiveDom() {
    const doc = global.document;
    if (!doc || typeof doc.querySelector !== "function") return;
    const trigger = doc.querySelector("[data-study-timer-toggle]");
    if (trigger) {
      trigger.textContent = pillLabel();
      if (trigger.classList) trigger.classList.toggle("active", timerState.running);
    }
    const clock = doc.querySelector("[data-study-timer-clock]");
    if (clock) clock.textContent = fmtClock(timerState.seconds);
    const summary = doc.querySelector("[data-study-timer-summary]");
    if (summary) {
      summary.innerHTML = `<span>Today: <strong>${timerState.stats.focusMinutes} / ${timerState.stats.goalMinutes} min</strong></span><span>${timerState.stats.pomodoros} pomodoros · ${timerState.stats.streakDays}d streak</span>`;
    }
    const fill = doc.querySelector("[data-study-timer-goal-fill]");
    if (fill && fill.style) {
      const pct = Math.min(100, Math.round((timerState.stats.focusMinutes / Math.max(1, timerState.stats.goalMinutes)) * 100));
      fill.style.width = `${pct}%`;
    }
  }

  function stopInterval() {
    if (timerState.intervalId && typeof clearInterval === "function") {
      clearInterval(timerState.intervalId);
      timerState.intervalId = null;
    }
  }

  function startInterval() {
    stopInterval();
    if (typeof setInterval !== "function") return;
    timerState.intervalId = setInterval(() => {
      if (!timerState.running) return;
      if (timerState.mode === "stopwatch") {
        timerState.seconds += 1;
        timerState.focusAccumSec += 1;
        if (timerState.focusAccumSec >= 60) {
          timerState.focusAccumSec -= 60;
          logStudyMinutes(1, false);
        }
        updateLiveDom();
        return;
      }

      if (timerState.mode === "countdown" || (timerState.mode === "pomodoro" && timerState.phase === "focus")) {
        timerState.focusAccumSec += 1;
        if (timerState.focusAccumSec >= 60) {
          timerState.focusAccumSec -= 60;
          logStudyMinutes(1, false);
        }
      }

      if (timerState.seconds > 1) {
        timerState.seconds -= 1;
        updateLiveDom();
        return;
      }

      timerState.running = false;
      stopInterval();
      if (!timerState.muted) playGentleChime();
      if (timerState.mode === "pomodoro") {
        const preset = POMODORO_PRESETS[timerState.presetIdx];
        if (timerState.phase === "focus") {
          logStudyMinutes(0, true);
          timerState.phase = "break";
          timerState.seconds = preset.rest * 60;
          timerState.notice = `Focus block complete. Take a ${preset.rest}-minute break.`;
        } else {
          timerState.phase = "focus";
          timerState.seconds = preset.focus * 60;
          timerState.notice = "Break finished. Ready for your next focus block.";
        }
      } else {
        timerState.seconds = 0;
        timerState.notice = "Sprint timer finished.";
      }
      if (typeof render === "function") render();
    }, 1000);
  }

  function toggleRun() {
    timerState.notice = "";
    timerState.running = !timerState.running;
    if (timerState.running) startInterval();
    else stopInterval();
    if (typeof render === "function") render();
  }

  function selectMode(mode) {
    timerState.running = false;
    stopInterval();
    timerState.notice = "";
    timerState.mode = mode;
    if (mode === "pomodoro") {
      timerState.phase = "focus";
      timerState.seconds = POMODORO_PRESETS[timerState.presetIdx].focus * 60;
    } else if (mode === "countdown") {
      timerState.seconds = timerState.sprintMinutes * 60;
    } else {
      timerState.seconds = 0;
    }
    if (typeof render === "function") render();
  }

  function resetTimer() {
    timerState.running = false;
    stopInterval();
    timerState.notice = "";
    if (timerState.mode === "pomodoro") {
      const p = POMODORO_PRESETS[timerState.presetIdx];
      timerState.seconds = (timerState.phase === "focus" ? p.focus : p.rest) * 60;
    } else if (timerState.mode === "countdown") {
      timerState.seconds = timerState.sprintMinutes * 60;
    } else {
      timerState.seconds = 0;
    }
    if (typeof render === "function") render();
  }

  function renderHeaderControl() {
    const pct = Math.min(100, Math.round((timerState.stats.focusMinutes / Math.max(1, timerState.stats.goalMinutes)) * 100));
    const phaseLabel = timerState.mode === "pomodoro"
      ? (timerState.phase === "focus" ? "Focus session" : "Short break")
      : timerState.mode === "countdown"
        ? "Countdown sprint"
        : "Elapsed study time";

    return `
      <div class="study-timer-wrap">
        <button
          type="button"
          class="ghost-button study-timer-trigger ${timerState.running ? "active" : ""}"
          data-study-timer-toggle="true"
          aria-expanded="${timerState.open ? "true" : "false"}"
          aria-controls="toefl-study-timer-panel"
        >${pillLabel()}</button>
        ${timerState.open ? `
          <section id="toefl-study-timer-panel" class="study-timer-panel" role="dialog" aria-label="Study timer and focus tools">
            <div class="study-timer-head">
              <strong>Study timer</strong>
              <div class="study-timer-head-actions">
                <button type="button" class="ghost-button study-timer-mini" data-study-timer-mute="true">${timerState.muted ? "Sound off" : "Sound on"}</button>
                <button type="button" class="ghost-button study-timer-mini" data-study-timer-close="true" aria-label="Close study timer">Close</button>
              </div>
            </div>
            <div class="study-timer-tabs" role="tablist" aria-label="Timer mode">
              ${[["pomodoro", "Pomodoro"], ["countdown", "Sprint"], ["stopwatch", "Stopwatch"]].map(([id, label]) => `
                <button type="button" role="tab" aria-selected="${timerState.mode === id ? "true" : "false"}" class="study-timer-tab ${timerState.mode === id ? "active" : ""}" data-study-timer-mode="${id}">${label}</button>
              `).join("")}
            </div>
            <div class="study-timer-readout">
              <span class="study-timer-phase">${phaseLabel}</span>
              <strong class="study-timer-clock" data-study-timer-clock="true">${fmtClock(timerState.seconds)}</strong>
            </div>
            ${timerState.notice ? `<p class="study-timer-notice" role="status">${timerState.notice}</p>` : ""}
            <div class="study-timer-controls">
              <button type="button" class="primary-button" data-study-timer-run="true">${timerState.running ? "Pause" : "Start"}</button>
              <button type="button" class="ghost-button" data-study-timer-reset="true">Reset</button>
              ${timerState.mode === "pomodoro" ? `
                <button type="button" class="ghost-button" data-study-timer-switch="true">${timerState.phase === "focus" ? "Break" : "Focus"}</button>
              ` : ""}
            </div>
            ${timerState.mode === "pomodoro" ? `
              <div class="study-timer-presets" aria-label="Pomodoro intervals">
                ${POMODORO_PRESETS.map((p, idx) => `
                  <button type="button" class="study-timer-chip ${timerState.presetIdx === idx ? "active" : ""}" data-study-timer-pomo="${idx}">${p.label} min</button>
                `).join("")}
              </div>
            ` : ""}
            ${timerState.mode === "countdown" ? `
              <div class="study-timer-presets" aria-label="Sprint presets">
                ${SPRINT_PRESETS.map((s) => `
                  <button type="button" class="study-timer-chip ${timerState.sprintMinutes === s.minutes ? "active" : ""}" data-study-timer-sprint="${s.minutes}">${s.label}</button>
                `).join("")}
              </div>
            ` : ""}
            <div class="study-timer-goal">
              <div class="study-timer-goal-row" data-study-timer-summary="true">
                <span>Today: <strong>${timerState.stats.focusMinutes} / ${timerState.stats.goalMinutes} min</strong></span>
                <span>${timerState.stats.pomodoros} pomodoros · ${timerState.stats.streakDays}d streak</span>
              </div>
              <div class="course-progress-track" style="margin-top:6px" aria-hidden="true">
                <div class="course-progress-fill" data-study-timer-goal-fill="true" style="width:${pct}%"></div>
              </div>
              <div class="study-timer-goal-picks">
                <span class="suite-meta-inline">Daily goal:</span>
                ${[20, 30, 45, 60].map((m) => `
                  <button type="button" class="study-timer-chip ${timerState.stats.goalMinutes === m ? "active" : ""}" data-study-timer-goal="${m}">${m}m</button>
                `).join("")}
              </div>
            </div>
          </section>
        ` : ""}
      </div>
    `;
  }

  let escBound = false;
  function bindEvents() {
    const doc = global.document;
    if (!doc) return;

    if (!escBound && typeof global.addEventListener === "function") {
      escBound = true;
      global.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && timerState.open) {
          timerState.open = false;
          if (typeof render === "function") render();
        }
      });
    }

    doc.querySelector("[data-study-timer-toggle]")?.addEventListener("click", () => {
      timerState.open = !timerState.open;
      if (typeof render === "function") render();
    });
    doc.querySelector("[data-study-timer-close]")?.addEventListener("click", () => {
      timerState.open = false;
      if (typeof render === "function") render();
    });
    doc.querySelector("[data-study-timer-mute]")?.addEventListener("click", () => {
      timerState.muted = !timerState.muted;
      if (typeof render === "function") render();
    });
    doc.querySelector("[data-study-timer-run]")?.addEventListener("click", toggleRun);
    doc.querySelector("[data-study-timer-reset]")?.addEventListener("click", resetTimer);
    doc.querySelector("[data-study-timer-switch]")?.addEventListener("click", () => {
      timerState.running = false;
      stopInterval();
      timerState.phase = timerState.phase === "focus" ? "break" : "focus";
      const p = POMODORO_PRESETS[timerState.presetIdx];
      timerState.seconds = (timerState.phase === "focus" ? p.focus : p.rest) * 60;
      if (typeof render === "function") render();
    });
    doc.querySelectorAll("[data-study-timer-mode]").forEach((btn) => {
      btn.addEventListener("click", () => selectMode(btn.dataset.studyTimerMode));
    });
    doc.querySelectorAll("[data-study-timer-pomo]").forEach((btn) => {
      btn.addEventListener("click", () => {
        timerState.running = false;
        stopInterval();
        timerState.presetIdx = Number(btn.dataset.studyTimerPomo) || 0;
        timerState.phase = "focus";
        timerState.seconds = POMODORO_PRESETS[timerState.presetIdx].focus * 60;
        if (typeof render === "function") render();
      });
    });
    doc.querySelectorAll("[data-study-timer-sprint]").forEach((btn) => {
      btn.addEventListener("click", () => {
        timerState.running = false;
        stopInterval();
        timerState.mode = "countdown";
        timerState.sprintMinutes = Number(btn.dataset.studyTimerSprint) || 10;
        timerState.seconds = timerState.sprintMinutes * 60;
        if (typeof render === "function") render();
      });
    });
    doc.querySelectorAll("[data-study-timer-goal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        timerState.stats.goalMinutes = Number(btn.dataset.studyTimerGoal) || 30;
        saveStats(timerState.stats);
        if (typeof render === "function") render();
      });
    });
  }

  global.ToeflStudyTimer = {
    state: timerState,
    renderHeaderControl,
    bindEvents,
    selectMode,
    toggleRun,
    resetTimer
  };
})(typeof window !== "undefined" ? window : globalThis);
