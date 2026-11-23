const path = require("path");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const DEFAULT_DB_PATH = process.env.STUDY_RESULTS_DB
  ? path.resolve(process.env.STUDY_RESULTS_DB)
  : path.resolve(__dirname, "..", "..", "study_results.sqlite");

let dbInstance = null;

function getDb() {
  if (dbInstance) return dbInstance;
  fs.mkdirSync(path.dirname(DEFAULT_DB_PATH), { recursive: true });
  const db = new DatabaseSync(DEFAULT_DB_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS exam_runs (
      id TEXT PRIMARY KEY,
      app TEXT NOT NULL,
      run_type TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      scores_json TEXT NOT NULL,
      details_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS writing_submissions (
      id TEXT PRIMARY KEY,
      app TEXT NOT NULL,
      task_type TEXT NOT NULL,
      run_id TEXT,
      created_at TEXT NOT NULL,
      prompt_title TEXT,
      prompt_text TEXT,
      response_text TEXT NOT NULL,
      word_count INTEGER NOT NULL,
      elapsed_sec INTEGER,
      self_score REAL,
      ai_feedback TEXT
    );

    CREATE TABLE IF NOT EXISTS speaking_attempts (
      id TEXT PRIMARY KEY,
      app TEXT NOT NULL DEFAULT 'toefl',
      task_type TEXT NOT NULL,
      run_id TEXT,
      created_at TEXT NOT NULL,
      prompt_text TEXT,
      transcript TEXT,
      score REAL,
      metrics_json TEXT
    );

    CREATE TABLE IF NOT EXISTS practice_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app TEXT NOT NULL,
      section TEXT NOT NULL,
      qtype TEXT NOT NULL,
      topic TEXT,
      question_id TEXT,
      correct INTEGER NOT NULL,
      elapsed_sec INTEGER,
      user_answer TEXT,
      expected_answer TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_exam_runs_app_time ON exam_runs(app, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_writing_app_time ON writing_submissions(app, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_speaking_time ON speaking_attempts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_practice_app_section ON practice_attempts(app, section, created_at DESC);
  `);
  dbInstance = db;
  return db;
}

function saveExamRun(payload) {
  const db = getDb();
  const id = String(payload.id || `run-${Date.now()}`);
  const app = String(payload.app || "toefl");
  const runType = String(payload.runType || "full_mock");
  const title = String(payload.title || "Practice Test");
  const createdAt = String(payload.createdAt || new Date().toISOString());
  const scoresJson = JSON.stringify(payload.scores || {});
  const detailsJson = JSON.stringify(payload.details || {});

  db.prepare(`
    INSERT INTO exam_runs (id, app, run_type, title, created_at, scores_json, details_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      scores_json = excluded.scores_json,
      details_json = excluded.details_json
  `).run(id, app, runType, title, createdAt, scoresJson, detailsJson);

  // Also extract nested writing & speaking items when present
  const w = payload.details && payload.details.writing;
  if (w && w.emailText && String(w.emailText).trim()) {
    saveWritingSubmission({
      id: `${id}:email`,
      app,
      taskType: "email",
      runId: id,
      createdAt,
      promptTitle: `${title} - Email`,
      promptText: w.emailScenario || "",
      responseText: w.emailText,
      wordCount: Number(w.emailWc) || 0
    });
  }
  if (w && w.discText && String(w.discText).trim()) {
    saveWritingSubmission({
      id: `${id}:discussion`,
      app,
      taskType: "academic_discussion",
      runId: id,
      createdAt,
      promptTitle: `${title} - Academic Discussion`,
      promptText: w.discPrompt || "",
      responseText: w.discText,
      wordCount: Number(w.discWc) || 0
    });
  }

  const sp = payload.details && payload.details.speaking;
  if (sp) {
    for (const [kind, items] of [["mock_repeat", sp.repeatItems], ["mock_interview", sp.interviewItems]]) {
      if (!Array.isArray(items)) continue;
      items.forEach((it, idx) => {
        if (it && it.response && String(it.response).trim()) {
          saveSpeakingAttempt({
            id: `${id}:${kind}:${idx}`,
            app,
            taskType: kind,
            runId: id,
            createdAt,
            promptText: it.prompt || "",
            transcript: it.response,
            score: null,
            metrics: { index: idx }
          });
        }
      });
    }
  }
  return { ok: true, id, dbPath: DEFAULT_DB_PATH };
}

function saveWritingSubmission(payload) {
  const db = getDb();
  const id = String(payload.id || `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  const createdAt = String(payload.createdAt || new Date().toISOString());
  const text = String(payload.responseText || "");
  const wc = Number.isFinite(Number(payload.wordCount))
    ? Number(payload.wordCount)
    : (text.trim() ? text.trim().split(/\s+/).length : 0);

  db.prepare(`
    INSERT INTO writing_submissions (id, app, task_type, run_id, created_at, prompt_title, prompt_text, response_text, word_count, elapsed_sec, self_score, ai_feedback)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      response_text = excluded.response_text,
      word_count = excluded.word_count,
      elapsed_sec = excluded.elapsed_sec,
      self_score = COALESCE(excluded.self_score, writing_submissions.self_score),
      ai_feedback = COALESCE(excluded.ai_feedback, writing_submissions.ai_feedback)
  `).run(
    id,
    String(payload.app || "toefl"),
    String(payload.taskType || "email"),
    payload.runId ? String(payload.runId) : null,
    createdAt,
    payload.promptTitle ? String(payload.promptTitle) : null,
    payload.promptText ? String(payload.promptText) : null,
    text,
    wc,
    payload.elapsedSec != null ? Number(payload.elapsedSec) : null,
    payload.selfScore != null ? Number(payload.selfScore) : null,
    payload.aiFeedback ? String(payload.aiFeedback) : null
  );
  return { ok: true, id };
}

function saveSpeakingAttempt(payload) {
  const db = getDb();
  const id = String(payload.id || `sp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  const createdAt = String(payload.createdAt || new Date().toISOString());
  db.prepare(`
    INSERT INTO speaking_attempts (id, app, task_type, run_id, created_at, prompt_text, transcript, score, metrics_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      transcript = excluded.transcript,
      score = excluded.score,
      metrics_json = excluded.metrics_json
  `).run(
    id,
    String(payload.app || "toefl"),
    String(payload.taskType || "interview"),
    payload.runId ? String(payload.runId) : null,
    createdAt,
    payload.promptText ? String(payload.promptText) : null,
    payload.transcript ? String(payload.transcript) : null,
    payload.score != null && Number.isFinite(Number(payload.score)) ? Number(payload.score) : null,
    JSON.stringify(payload.metrics || {})
  );
  return { ok: true, id };
}

function savePracticeAttempt(payload) {
  const db = getDb();
  const items = Array.isArray(payload.items) ? payload.items : [payload];
  const stmt = db.prepare(`
    INSERT INTO practice_attempts (app, section, qtype, topic, question_id, correct, elapsed_sec, user_answer, expected_answer, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const now = new Date().toISOString();
  for (const it of items) {
    stmt.run(
      String(it.app || "toefl"),
      String(it.section || "reading"),
      String(it.qtype || "unknown"),
      it.topic ? String(it.topic) : null,
      it.questionId ? String(it.questionId) : null,
      it.correct ? 1 : 0,
      it.elapsedSec != null ? Number(it.elapsedSec) : null,
      it.userAnswer != null ? String(it.userAnswer) : null,
      it.expectedAnswer != null ? String(it.expectedAnswer) : null,
      String(it.createdAt || now)
    );
  }
  return { ok: true, count: items.length };
}

function getSummary() {
  const db = getDb();
  return {
    dbPath: DEFAULT_DB_PATH,
    counts: {
      exam_runs: db.prepare("SELECT COUNT(*) AS c FROM exam_runs").get().c,
      writing_submissions: db.prepare("SELECT COUNT(*) AS c FROM writing_submissions").get().c,
      speaking_attempts: db.prepare("SELECT COUNT(*) AS c FROM speaking_attempts").get().c,
      practice_attempts: db.prepare("SELECT COUNT(*) AS c FROM practice_attempts").get().c
    },
    recentRuns: db.prepare("SELECT id, app, run_type, title, created_at, scores_json FROM exam_runs ORDER BY created_at DESC LIMIT 20").all()
  };
}

module.exports = {
  DEFAULT_DB_PATH,
  getDb,
  saveExamRun,
  saveWritingSubmission,
  saveSpeakingAttempt,
  savePracticeAttempt,
  getSummary
};
