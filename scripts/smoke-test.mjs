import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPaths = [
  path.join(root, "data", "question-bank.js"),
  path.join(root, "data", "pytoefl-interview-bank.js"),
  path.join(root, "data", "interview-sets.js"),
  path.join(root, "data", "training-config.js"),
  path.join(root, "data", "toefl-suite-bank.js"),
  path.join(root, "data", "listening-practice.js"),
  path.join(root, "data", "toefl-full-mocks.js"),
  path.join(root, "data", "toefl-extra-practice.js"),
  path.join(root, "data", "toefl-studytools-absorbed.js"),
  path.join(root, "data", "toefl-courses.js"),
  path.join(root, "logic", "scoring-engine.js"),
  path.join(root, "modules", "toefl-suite-modules.js"),
  path.join(root, "modules", "toefl-full-mock.js"),
  path.join(root, "modules", "toefl-courses.js"),
  path.join(root, "modules", "toefl-study-timer.js")
];
const appPath = path.join(root, "app.js");
const source = [
  ...dataPaths.map((filePath) => fs.readFileSync(filePath, "utf8")),
  fs.readFileSync(appPath, "utf8")
].join("\n");

function createLocalStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    }
  };
}

const appElement = { innerHTML: "" };
const noopElement = {
  value: "",
  textContent: "",
  dataset: {},
  style: {},
  addEventListener() {},
  click() {}
};

const context = {
  console,
  Blob,
  URL: {
    createObjectURL: () => "blob:mock",
    revokeObjectURL() {}
  },
  crypto: {
    randomUUID: () => "test-id"
  },
  localStorage: createLocalStorage(),
  navigator: {},
  SpeechSynthesisUtterance: function SpeechSynthesisUtterance(text) {
    this.text = text;
  },
  window: {
    SpeechRecognition: null,
    webkitSpeechRecognition: null,
    MediaRecorder: null,
    speechSynthesis: {
      cancel() {},
      speak() {}
    },
    confirm: () => true,
    setTimeout: (fn) => {
      if (typeof fn === "function") fn();
      return 0;
    },
    clearTimeout() {}
  },
  document: {
    querySelector(selector) {
      if (selector === "#app") return appElement;
      return null;
    },
    querySelectorAll() {
      return [];
    },
    createElement() {
      return { ...noopElement };
    }
  },
  setTimeout: (fn) => {
    if (typeof fn === "function") fn();
    return 0;
  },
  clearTimeout() {}
};

context.window.window = context.window;
context.window.document = context.document;

const expose = `
globalThis.__voxpilot = {
  state,
  STORAGE_KEY,
  COACH_PROFILE_STORAGE_KEY,
  COACH_SESSIONS_STORAGE_KEY,
  createInterviewFeedback,
  analyzeStarterStep,
  buildScoringConfidence,
  nextQuestion,
  clearHistoryWithConfirm,
  loadCoachSessions,
  buildLocalDataSnapshot,
  buildPronunciationNotebook,
  buildWordPronunciationNotebook,
  startWordEchoDrill,
  analyzeWordDrillPart,
  startMistakeReview,
  finishMistakeReviewCard,
  splitWordForPractice,
  getWordStressHint,
  INTERVIEW_SETS,
  QUESTION_BANK,
  TOEFL_SUITE_BANK,
  TOEFL_LISTENING_PRACTICE,
  TOEFL_FULL_MOCKS,
  startFullRun,
  render
};
`;

vm.runInNewContext(`${source}\n${expose}`, context, {
  filename: "app.js",
  timeout: 5000
});

const api = context.__voxpilot;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(appElement.innerHTML.includes("TOEFL study desk"), "home did not render");
assert(appElement.innerHTML.includes("Start a warm-up"), "warm-up entry point is missing");
api.state.tab = "starter";
api.render();
assert(appElement.innerHTML.includes("Four steps"), "warm-up did not render");

api.state.transcript = "I prefer studying with classmates.";
api.analyzeStarterStep();
assert(api.state.starter.feedback?.result === "pass", "starter step 1 should pass a direct answer");
assert(context.localStorage.getItem(api.STORAGE_KEY)?.includes("starter"), "starter attempt was not saved");

const question = api.state.currentInterview;
const transcript = "I prefer studying with classmates because I can get useful feedback. For example, last semester I prepared a presentation with two classmates. As a result, our presentation became clearer.";
const feedback = api.createInterviewFeedback(question, transcript, 52, {
  audioStats: null,
  recognitionStats: { confidenceSamples: [], finalSegments: 0, interimSegments: 0 }
});
feedback.confidence = api.buildScoringConfidence(question, feedback, transcript, 52, {
  audioStats: null,
  recognitionStats: { confidenceSamples: [], finalSegments: 0, interimSegments: 0 }
});
assert(feedback.score >= 1 && feedback.score <= 6, "feedback score is outside 1-6");
assert(["high", "medium", "low"].includes(feedback.confidence.level), "confidence level missing");

api.state.coach.active = true;
api.state.coach.phase = "complete";
api.state.coach.original.questionId = api.state.currentRepeat.id;
api.state.recordingTarget = "coach";
api.nextQuestion();
assert(api.state.recordingTarget === "main", "nextQuestion did not reset recording target");
assert(api.state.coach.active === false, "nextQuestion did not clear coach state");

context.localStorage.setItem(api.STORAGE_KEY, JSON.stringify([{ id: "h1" }]));
context.localStorage.setItem(api.COACH_SESSIONS_STORAGE_KEY, JSON.stringify([{ id: "c1" }]));
context.localStorage.setItem(api.COACH_PROFILE_STORAGE_KEY, JSON.stringify({ primaryWeakness: "exampleSpecificity" }));
api.clearHistoryWithConfirm();
assert(context.localStorage.getItem(api.STORAGE_KEY) === null, "history was not cleared");
assert(context.localStorage.getItem(api.COACH_SESSIONS_STORAGE_KEY) === null, "coach sessions were not cleared");
assert(context.localStorage.getItem(api.COACH_PROFILE_STORAGE_KEY) === null, "coach profile was not cleared");

context.localStorage.setItem(api.STORAGE_KEY, JSON.stringify([{ id: "h2" }]));
api.state.setup.ai.apiKey = "secret-key";
const snapshot = api.buildLocalDataSnapshot();
assert(snapshot.setup.ai.hasApiKey === true, "export should preserve key presence");
assert(!JSON.stringify(snapshot).includes("secret-key"), "export leaked an API key");

context.localStorage.setItem(api.STORAGE_KEY, JSON.stringify([
  {
    id: "pron-1",
    type: "repeat",
    questionId: "lr-01",
    prompt: "The library will extend its hours during final exam week.",
    transcript: "library hours final exam week",
    createdAt: new Date().toISOString(),
    alignment: [
      { type: "match", ref: "the", hyp: "the" },
      { type: "substitute", ref: "library", hyp: "liberty" },
      { type: "missing", ref: "extend", hyp: "" },
      { type: "substitute", ref: "presentation", hyp: "talk" },
      { type: "substitute", ref: "campus", hyp: "banana" },
      { type: "match", ref: "hours", hyp: "hours" }
    ],
    pronunciation: {
      external: {
        provider: "Test",
        words: [
          { word: "environment", score: 62, errorType: "Mispronunciation" }
        ]
      },
      phonemeFocus: [
        { sound: "/r/ vs /l/", label: "right / library", tip: "Practice r and l.", words: ["library", "clearly"] }
      ]
    }
  }
]));
const notebook = api.buildPronunciationNotebook();
assert(notebook.length === 1, "pronunciation notebook did not aggregate history");
assert(notebook[0].words.some((item) => item.word === "library"), "pronunciation notebook missed focus words");
const wordNotebook = api.buildWordPronunciationNotebook();
assert(wordNotebook.some((item) => item.word === "library" && item.heardAs.some((heard) => heard.word === "liberty")), "word notebook missed repeat substitutions");
assert(wordNotebook.some((item) => item.word === "environment" && item.hasExternal), "word notebook missed external word scores");
assert(wordNotebook.find((item) => item.word === "library")?.category === "pronunciationLikely", "library/liberty should be a pronunciation-likely substitution");
assert(wordNotebook.find((item) => item.word === "extend")?.category === "recallLikely", "missing words should be recall-likely");
assert(wordNotebook.find((item) => item.word === "presentation")?.category === "semanticSubstitution", "known semantic substitutions should be separated");
assert(wordNotebook.find((item) => item.word === "campus")?.category === "recallLikely", "unrelated substitutions should not be pronunciation errors");
assert(JSON.stringify(api.splitWordForPractice("stores")) === JSON.stringify(["store", "z"]), "stores should be split as store + z");
assert(api.getWordStressHint("stores").includes("/z/"), "stores hint should mention final z sound");
const splitCases = new Map([
  ["assignment", ["a", "SIGN", "ment"]],
  ["comfortable", ["COMF", "ter", "ble"]],
  ["places", ["place", "iz"]],
  ["classes", ["class", "iz"]],
  ["changes", ["change", "iz"]],
  ["studies", ["study", "z"]],
  ["helps", ["help", "s"]],
  ["projects", ["project", "s"]],
  ["asked", ["ask", "t"]],
  ["changed", ["change", "d"]],
  ["practiced", ["practice", "t"]],
  ["stopped", ["stop", "t"]]
]);
splitCases.forEach((expected, word) => {
  assert(JSON.stringify(api.splitWordForPractice(word)) === JSON.stringify(expected), `${word} split was not ${expected.join(" / ")}`);
});
api.startWordEchoDrill("library");
assert(api.state.wordDrill.active === true, "word drill did not start");
api.state.wordDrill.wordTranscript = "library";
api.analyzeWordDrillPart("word");
assert(api.state.wordDrill.wordCheck?.result === "pass", "word drill should pass exact word repetition");
api.state.wordDrill.sentenceTranscript = "The library will extend its hours this week.";
api.analyzeWordDrillPart("sentence");
assert(api.state.wordDrill.sentenceCheck?.result === "pass", "word drill sentence should pass exact sentence repetition");
api.startMistakeReview("weakest");
assert(api.state.mistakeReview.active === true, "mistake review deck did not start");
assert(api.state.mistakeReview.deck.length >= 1, "mistake review deck is empty");
api.state.wordDrill.wordTranscript = api.state.wordDrill.word;
api.analyzeWordDrillPart("word");
api.state.wordDrill.sentenceTranscript = api.state.wordDrill.sentence;
api.analyzeWordDrillPart("sentence");
api.finishMistakeReviewCard("pass");
assert(api.state.mistakeReview.results.length === 1, "mistake review did not record a completed card");

assert(api.INTERVIEW_SETS.length >= 45 && api.INTERVIEW_SETS.every((s) => s.turns.length === 4 && s.scenario), "interview sets must have >=45 sets with a scenario and four turns");
assert(api.QUESTION_BANK.repeat.length >= 300, "expanded repeat bank should have >=300 sentences");
assert(api.TOEFL_SUITE_BANK.reading.completeTheWords.length >= 100, "CTW reading bank should have >=100 passages");
assert(api.TOEFL_SUITE_BANK.reading.passages.length >= 8, "Reading Daily Life & Academic passages should have >=8 sets");
assert(api.TOEFL_SUITE_BANK.writing.buildASentence.length >= 20, "Build-a-Sentence bank should have >=20 items");
assert(api.TOEFL_SUITE_BANK.writing.emails.length >= 45, "Email bank should have >=45 model emails");
assert(api.TOEFL_SUITE_BANK.writing.discussions.length >= 35, "Academic Discussion bank should have >=35 Pastel topics");
assert(api.TOEFL_SUITE_BANK.listening.clips.length === 24, "Listening bank should have 24 audio clips");
assert(api.TOEFL_SUITE_BANK.vocab.length >= 1000, "Vocab & collocations bank should have >=1000 items");

for (const suiteTab of ["courses", "fullmock", "reading", "writing", "listening", "vocab", "guides"]) {
  api.state.tab = suiteTab;
  api.render();
  assert(appElement.innerHTML.length > 500, `Suite tab ${suiteTab} failed to render`);
}
assert(context.window.TOEFL_COURSES.length >= 10, "Courses bank should have >=10 lessons");
context.window.ToeflCourses.toggleDone("r-ctw");
assert(context.window.ToeflCourses.state.doneIds.includes("r-ctw"), "Courses mark-complete failed");
context.window.ToeflCourses.launchPracticeSession({ tab: "writing", subKey: "writingMode", subVal: "email" });
assert(api.state.tab === "writing" && context.window.ToeflSuiteModules.state.writingMode === "email", "Courses practice jump failed");
assert(context.window.TOEFL_FULL_MOCKS.mocks.length >= 3, "Full mocks bank should have >=3 complete 4-section tests");
context.window.ToeflFullMock.startMock(context.window.TOEFL_FULL_MOCKS.mocks[0]);
assert(context.window.ToeflFullMock.state.phase === "reading1", "Full mock did not start in reading1");
context.window.ToeflFullMock.finishAndScore();
const marked = context.window.ToeflSuiteModules.buildCtwBlanks("An example. The {stu|dent} left.");
assert(marked.blanks.length === 1 && marked.blanks[0].word === "student", "Marked reading words must use the supplied blanks");
assert(!marked.parts.some((part) => part.raw?.includes("{")), "Reading markup leaked into visible text");
api.state.tab = "listening";
api.render();
assert(appElement.innerHTML.includes("Borrowing headphones") && appElement.innerHTML.includes("Read transcript"), "Listening questions did not render");
const listeningAssets = [
  ...api.TOEFL_LISTENING_PRACTICE.map(({ id }) => id),
  ...api.TOEFL_FULL_MOCKS.mocks.flatMap((mock) =>
    [1, 2].flatMap((part) => mock.listening["module" + part].items.map(
      (_, index) => mock.id + "-listening" + part + "-" + index
    ))
  )
];
for (const name of listeningAssets) {
  const audio = fs.readFileSync(path.join(root, "assets", "audio", "prompts", `${name}.wav`));
  assert(audio.length > 44 && audio.toString("ascii", 0, 4) === "RIFF" && audio.toString("ascii", 8, 12) === "WAVE", `Invalid listening audio: ${name}`);
}
const mockReport = context.window.ToeflFullMock.state.lastReport;
assert(context.window.ToeflFullMock.state.phase === "results" && mockReport.reading.total > 0 && mockReport.listening.total > 0, "Full mock results failed");
assert(!Object.hasOwn(mockReport, "overallBand"), "Text-only mock must not report an overall TOEFL band");
const randomMock = context.window.ToeflFullMock.pickRandomMock();
assert(randomMock && randomMock.listeningMockId, "Random full mock must carry listeningMockId for audio assets");
const randomAudio = fs.readFileSync(path.join(root, "assets", "audio", "prompts", `${randomMock.listeningMockId}-listening1-0.wav`));
assert(randomAudio.length > 44 && randomAudio.toString("ascii", 0, 4) === "RIFF", "Random full mock listening audio missing");
const diagMock = context.window.ToeflFullMock.buildDiagnosticMock();
assert(diagMock && diagMock.isDiagnostic && diagMock.listening.module1.items.length === 2 && diagMock.listening.module2.items.length === 2, "Evaluation diagnostic mock build failed");
for (const it of [...diagMock.listening.module1.items, ...diagMock.listening.module2.items]) {
  const wav = fs.readFileSync(path.join(root, "assets", "audio", "prompts", `${it.audioFile}.wav`));
  assert(wav.length > 44 && wav.toString("ascii", 0, 4) === "RIFF", `Diagnostic listening audio missing: ${it.audioFile}`);
}
const ctwBuilt = context.window.ToeflSuiteModules.buildCtwBlanks(api.TOEFL_SUITE_BANK.reading.completeTheWords[0].text);
assert(ctwBuilt.blanks.length === 10, "Complete the Words generator should create 10 blanks");

assert(api.TOEFL_LISTENING_PRACTICE.length >= 24, "Listening practice should have >=24 exercises across all 4 tasks");
assert(api.TOEFL_SUITE_BANK.reading.passages.length >= 50, "Merged Reading passages should have >=50 sets");
assert(api.TOEFL_SUITE_BANK.writing.buildASentence.length >= 90, "Merged Build-a-Sentence drills should have >=90 items");
assert(api.TOEFL_SUITE_BANK.vocab.length >= 1800, "Merged Vocab bank should have >=1800 cards");
assert(context.window.ToeflStudyTimer && appElement.innerHTML.includes("Study timer"), "Study timer header control did not render");
context.window.ToeflStudyTimer.selectMode("countdown");
assert(context.window.ToeflStudyTimer.state.mode === "countdown", "Study timer mode switch failed");

api.startFullRun();
const run = api.state.full.sequence;
assert(run.length === 11, "full run should have 11 items");
assert(run.slice(0, 7).every((q) => q.type === "repeat") && run.slice(7).every((q) => q.type === "interview"), "full run should be 7 repeat then 4 interview");
assert(new Set(run.slice(7).map((q) => q.setId)).size === 1, "the four interview turns should come from one set");
assert(run.slice(7).map((q) => q.turn).join() === "1,2,3,4", "interview turns should be in order");

console.log("VoxPilot TOEFL 2026 Study Suite smoke test passed");
