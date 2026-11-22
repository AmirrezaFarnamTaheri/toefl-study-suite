// TOEFL 2026 Guided Courses, Topic Lectures & Interactive Quick-Check Quizzes
(function initToeflCourses(global) {
  const DONE_KEY = "toefl-courses-done-v1";

  function esc(v) {
    return String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function loadDone() {
    try {
      const raw = global.localStorage && global.localStorage.getItem(DONE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveDone(ids) {
    try {
      if (global.localStorage) global.localStorage.setItem(DONE_KEY, JSON.stringify(ids));
    } catch {
      // ignore storage errors
    }
  }

  function getCourses() {
    return typeof TOEFL_COURSES !== "undefined" && Array.isArray(TOEFL_COURSES) ? TOEFL_COURSES : [];
  }

  const courseState = {
    track: "All",
    activeId: "r-ctw",
    quizAnswers: {},
    doneIds: loadDone()
  };

  function getTracks(list) {
    const seen = [];
    for (const c of list) {
      if (!seen.includes(c.track)) seen.push(c.track);
    }
    return ["All", ...seen];
  }

  function getVisible(list) {
    return courseState.track === "All" ? list : list.filter((c) => c.track === courseState.track);
  }

  function ensureActive(visible) {
    if (!visible.length) return null;
    const found = visible.find((c) => c.id === courseState.activeId);
    if (found) return found;
    courseState.activeId = visible[0].id;
    return visible[0];
  }

  function toggleDone(id) {
    if (courseState.doneIds.includes(id)) {
      courseState.doneIds = courseState.doneIds.filter((x) => x !== id);
    } else {
      courseState.doneIds = [...courseState.doneIds, id];
    }
    saveDone(courseState.doneIds);
  }

  function launchPracticeSession(target) {
    if (!target || typeof state === "undefined") return;
    if (target.subKey && target.subVal && global.ToeflSuiteModules && global.ToeflSuiteModules.state) {
      global.ToeflSuiteModules.state[target.subKey] = target.subVal;
    }
    if (target.speakingMode) {
      state.mode = target.speakingMode;
    }
    state.tab = target.tab || "starter";
    if (typeof render === "function") render();
  }

  function getTrackExamTarget(track) {
    const t = String(track || "").toLowerCase();
    if (t.includes("reading")) return "Targets TOEFL 2026 Reading (Complete the Words, Daily Life & Academic Passages)";
    if (t.includes("listening")) return "Targets TOEFL 2026 Listening (Choose a Response, Conversations, Announcements & Academic Talks)";
    if (t.includes("speaking")) return "Targets TOEFL 2026 Speaking (Task 1: Listen & Repeat, Task 2: Take an Interview)";
    if (t.includes("writing")) return "Targets TOEFL 2026 Writing (Task 1: Build a Sentence, Task 2: Write an Email, Task 3: Academic Discussion)";
    return "Targets overall TOEFL 2026 adaptive pacing, grammar clarity, and 1-6 Band performance";
  }

  function renderCoursesView() {
    const list = getCourses();
    if (!list.length) {
      return `<section class="suite-card"><p>Courses are not loaded yet.</p></section>`;
    }
    const tracks = getTracks(list);
    const visible = getVisible(list);
    const active = ensureActive(visible);
    const doneCount = courseState.doneIds.length;
    const pct = Math.round((doneCount / list.length) * 100);
    const isDone = active ? courseState.doneIds.includes(active.id) : false;

    return `
      <section class="suite-workspace">
        <div class="suite-card">
          <div class="suite-header-row">
            <div>
              <p class="compact-copy" style="margin:0;">Short, practical lessons for every skill, each paired with a quick check and a one-click practice session.</p>
            </div>
            <div class="course-progress-box">
              <div class="course-progress-label">
                <span>Progress</span>
                <strong>${doneCount}/${list.length} (${pct}%)</strong>
              </div>
              <div class="course-progress-track" aria-hidden="true">
                <div class="course-progress-fill" style="width:${pct}%"></div>
              </div>
            </div>
          </div>
          <div class="course-track-tabs" role="tablist" aria-label="Course tracks">
            ${tracks
              .map(
                (t) => `
                  <button
                    type="button"
                    role="tab"
                    aria-selected="${courseState.track === t ? "true" : "false"}"
                    class="${courseState.track === t ? "active" : ""}"
                    data-course-track="${esc(t)}"
                  >${esc(t)}</button>
                `
              )
              .join("")}
          </div>
        </div>

        <div class="course-layout">
          <aside class="suite-card course-sidebar" aria-label="Lesson list">
            <h3 class="course-sidebar-title">Lessons (${visible.length})</h3>
            <div class="course-list">
              ${visible
                .map((lesson, idx) => {
                  const done = courseState.doneIds.includes(lesson.id);
                  const current = active && active.id === lesson.id;
                  return `
                    <button
                      type="button"
                      class="course-nav-item ${current ? "active" : ""}"
                      data-course-select="${esc(lesson.id)}"
                      aria-current="${current ? "true" : "false"}"
                    >
                      <span class="course-nav-meta">${idx + 1}. ${esc(lesson.track)} | ${esc(lesson.duration)}${done ? " | Done" : ""}</span>
                      <strong>${esc(lesson.title)}</strong>
                    </button>
                  `;
                })
                .join("")}
            </div>
          </aside>

          ${
            active
              ? `
                <article class="suite-card course-detail">
                  <div class="suite-header-row">
                    <div>
                      <div class="badge-row">
                        <span class="badge blue">${esc(active.track)}</span>
                        <span class="badge">${esc(active.duration)}</span>
                        ${isDone ? `<span class="badge ok">Completed</span>` : ""}
                      </div>
                      <h2 class="course-title">${esc(active.title)}</h2>
                      <p class="compact-copy">${esc(active.summary)}</p>
                      <div class="exam-target-bar" aria-label="Exam task target">
                        <span class="exam-target-tag">${esc(getTrackExamTarget(active.track))}</span>
                      </div>
                    </div>
                  </div>

                  <div class="course-block">
                    <h3>What to remember</h3>
                    <ul class="course-rules">
                      ${active.keyRules.map((rule) => `<li>${esc(rule)}</li>`).join("")}
                    </ul>
                  </div>

                  <div class="course-example-box">
                    <h3>Worked Example</h3>
                    <p><strong>Task:</strong> ${esc(active.workedExample.prompt)}</p>
                    <p><strong>How to solve:</strong> ${esc(active.workedExample.solution)}</p>
                    <p class="course-takeaway"><strong>Takeaway:</strong> ${esc(active.workedExample.takeaway)}</p>
                  </div>

                  <div class="course-block">
                    <h3>Check your understanding</h3>
                    <div class="course-quiz-list">
                      ${active.quiz
                        .map((q, qIdx) => {
                          const key = `${active.id}:${qIdx}`;
                          const picked = courseState.quizAnswers[key];
                          const answered = picked !== undefined;
                          const correct = answered && picked === q.answer;
                          return `
                            <div class="course-quiz-card">
                              <p class="course-quiz-q"><strong>Q${qIdx + 1}.</strong> ${esc(q.question)}</p>
                              <div class="course-quiz-choices">
                                ${q.choices
                                  .map((choice, cIdx) => {
                                    let cls = "course-choice";
                                    if (answered && cIdx === q.answer) cls += " ok";
                                    else if (answered && cIdx === picked && cIdx !== q.answer) cls += " bad";
                                    return `
                                      <button
                                        type="button"
                                        class="${cls}"
                                        data-course-quiz="${esc(key)}"
                                        data-course-choice="${cIdx}"
                                      >${String.fromCharCode(65 + cIdx)}. ${esc(choice)}</button>
                                    `;
                                  })
                                  .join("")}
                              </div>
                              ${
                                answered
                                  ? `<p class="course-quiz-feedback ${correct ? "ok" : "bad"}"><strong>${correct ? "Correct." : "Not quite."}</strong> ${esc(q.explanation)}</p>`
                                  : ""
                              }
                            </div>
                          `;
                        })
                        .join("")}
                    </div>
                  </div>

                  <div class="course-actions">
                    <button
                      type="button"
                      class="primary-button"
                      data-course-practice="${esc(active.id)}"
                    >${esc(active.practiceTarget?.label || "Start Practice Session")}</button>
                    <button
                      type="button"
                      class="ghost-button"
                      data-course-toggle-done="${esc(active.id)}"
                    >${isDone ? "Mark as Incomplete" : "Mark Lesson Complete"}</button>
                  </div>
                </article>
              `
              : ""
          }
        </div>
      </section>
    `;
  }

  function bindEvents() {
    const doc = global.document;
    if (!doc) return;

    doc.querySelectorAll("[data-course-track]").forEach((btn) => {
      btn.addEventListener("click", () => {
        courseState.track = btn.dataset.courseTrack || "All";
        if (typeof render === "function") render();
      });
    });

    doc.querySelectorAll("[data-course-select]").forEach((btn) => {
      btn.addEventListener("click", () => {
        courseState.activeId = btn.dataset.courseSelect;
        if (typeof render === "function") render();
      });
    });

    doc.querySelectorAll("[data-course-quiz]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.courseQuiz;
        const choice = Number(btn.dataset.courseChoice);
        courseState.quizAnswers[key] = choice;
        if (typeof render === "function") render();
      });
    });

    doc.querySelectorAll("[data-course-toggle-done]").forEach((btn) => {
      btn.addEventListener("click", () => {
        toggleDone(btn.dataset.courseToggleDone);
        if (typeof render === "function") render();
      });
    });

    doc.querySelectorAll("[data-course-practice]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lesson = getCourses().find((c) => c.id === btn.dataset.coursePractice);
        if (lesson && lesson.practiceTarget) {
          launchPracticeSession(lesson.practiceTarget);
        }
      });
    });
  }

  global.ToeflCourses = {
    state: courseState,
    render: renderCoursesView,
    bindEvents,
    toggleDone,
    launchPracticeSession
  };
})(typeof window !== "undefined" ? window : globalThis);
