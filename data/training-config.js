const STORAGE_KEY = "toefl-speaking-lab-history-v1";
const SETUP_STORAGE_KEY = "toefl-speaking-lab-setup-v1";
const LADDER_STORAGE_KEY = "voxpilot-ladder-profile-v1";
const COACH_PROFILE_STORAGE_KEY = "voxpilot-coach-profile-v1";
const COACH_SESSIONS_STORAGE_KEY = "voxpilot-coach-sessions-v1";

const LADDER_LEVELS = {
  1: { name: "L1 Survival", target: "Speak steadily, repeat short sentences, and answer in complete sentences.", threshold: 3.2 },
  2: { name: "L2 Stable", target: "Reduce word omissions and consistently include a clear reason in every answer.", threshold: 3.8 },
  3: { name: "L3 Developing", target: "Develop complete reasons, concrete examples, and clear outcomes.", threshold: 4.4 },
  4: { name: "L4 Test Ready", target: "Maintain natural pacing and clear articulation under strict time limits.", threshold: 5.0 },
  5: { name: "L5 Advanced", target: "Polish high-scoring lexical variety, natural prosody, and nuanced ideas.", threshold: 5.4 }
};

const LADDER_STEPS = {
  1: [
    { id: "l1-s1", title: "Short Repeat", type: "repeat", difficulty: "Easy", drill: "chunk-repeat", goal: "Repeat 8-10 word sentences accurately before focusing on speed." },
    { id: "l1-s2", title: "One Clear Sentence", type: "interview", difficulty: "Easy", drill: "answer-skeleton", goal: "Answer the prompt directly using one complete sentence." },
    { id: "l1-s3", title: "Reason Starter", type: "interview", difficulty: "Easy", drill: "because-builder", goal: "Attach a clear 'because' clause to every response." },
    { id: "l1-s4", title: "Clean Ending", type: "repeat", difficulty: "Easy", drill: "pronunciation-focus", goal: "Articulate word endings and key content words clearly." },
    { id: "l1-s5", title: "Mini Check", type: "mixed", difficulty: "Easy", drill: "checkpoint", goal: "Complete a short repeat and interview checkpoint." }
  ],
  2: [
    { id: "l2-s1", title: "Campus Repeat", type: "repeat", difficulty: "Medium", drill: "chunk-repeat", goal: "Repeat 12-15 word campus sentences with minimal word omissions." },
    { id: "l2-s2", title: "Because Chain", type: "interview", difficulty: "Easy", drill: "because-builder", goal: "Follow your opening claim immediately with a supporting reason." },
    { id: "l2-s3", title: "First Example", type: "interview", difficulty: "Medium", drill: "example-builder", goal: "Add one specific personal or academic example to every answer." },
    { id: "l2-s4", title: "Speed Control", type: "interview", difficulty: "Medium", drill: "speed-control", goal: "Stay within a natural speaking pace while minimizing mid-clause pauses." },
    { id: "l2-s5", title: "Stability Check", type: "mixed", difficulty: "Medium", drill: "checkpoint", goal: "Complete back-to-back repeat and interview prompts to verify consistency." }
  ],
  3: [
    { id: "l3-s1", title: "Academic Repeat", type: "repeat", difficulty: "Hard", drill: "chunk-repeat", goal: "Repeat academic sentences while preserving content words and word order." },
    { id: "l3-s2", title: "Example Builder", type: "interview", difficulty: "Medium", drill: "example-builder", goal: "Include specific people, actions, and outcomes in your example." },
    { id: "l3-s3", title: "Result Sentence", type: "interview", difficulty: "Medium", drill: "result-builder", goal: "Close your example with a clear takeaway or result sentence." },
    { id: "l3-s4", title: "Language Upgrade", type: "interview", difficulty: "Hard", drill: "language-upgrade", goal: "Eliminate repetitive vocabulary and incorporate natural subordinate clauses." },
    { id: "l3-s5", title: "Timed Check", type: "mixed", difficulty: "Medium", drill: "checkpoint", goal: "Deliver a complete 4-part structure under exam timing." }
  ],
  4: [
    { id: "l4-s1", title: "Hard Repeat", type: "repeat", difficulty: "Hard", drill: "shadow-sprint", goal: "Maintain high recall accuracy and natural phrasing on complex sentences." },
    { id: "l4-s2", title: "Timed Interview", type: "interview", difficulty: "Hard", drill: "timed-response", goal: "Deliver a complete, well-structured response within 45-60 seconds." },
    { id: "l4-s3", title: "Fluency Polish", type: "interview", difficulty: "Hard", drill: "speed-control", goal: "Eliminate filler words and mid-sentence hesitations." },
    { id: "l4-s4", title: "Pronunciation Polish", type: "mixed", difficulty: "Hard", drill: "pronunciation-focus", goal: "Target flagged phonemes and final consonant clusters." },
    { id: "l4-s5", title: "Mock Segment", type: "mixed", difficulty: "Hard", drill: "checkpoint", goal: "Complete a timed mini-mock section with stable delivery." }
  ],
  5: [
    { id: "l5-s1", title: "Precision Repeat", type: "repeat", difficulty: "Hard", drill: "shadow-sprint", goal: "Achieve near-verbatim repetition with natural stress and intonation." },
    { id: "l5-s2", title: "Advanced Interview", type: "interview", difficulty: "Hard", drill: "language-upgrade", goal: "Deliver nuanced, layered arguments with idiomatic academic phrasing." },
    { id: "l5-s3", title: "Compression", type: "interview", difficulty: "Hard", drill: "timed-response", goal: "Pack higher information density into fewer, cleaner sentences." },
    { id: "l5-s4", title: "Voice Control", type: "mixed", difficulty: "Hard", drill: "pronunciation-focus", goal: "Refine intelligibility, thought-group pacing, and primary word stress." },
    { id: "l5-s5", title: "High Score Check", type: "mixed", difficulty: "Hard", drill: "checkpoint", goal: "Consistently hit Band 5.5-6.0 performance under exam conditions." }
  ]
};

const DRILL_LIBRARY = {
  "chunk-repeat": { label: "Chunk Repeat", tip: "Split the sentence into 2-3 thought groups; repeat each chunk first, then link the full sentence." },
  "shadow-sprint": { label: "Shadow Sprint", tip: "Listen once, then shadow at near-native speed while matching stress and pause placement." },
  "answer-skeleton": { label: "Answer Skeleton", tip: "Follow the core frame: 'I prefer ___ because ___. For example, ___.'" },
  "because-builder": { label: "Because Builder", tip: "Answer directly in sentence one, then immediately justify it with 'because' in sentence two." },
  "example-builder": { label: "Example Builder", tip: "State when, where, what happened, and the outcome in your example." },
  "result-builder": { label: "Result Builder", tip: "Wrap up your example with a result clause: 'This helped me...' or 'As a result...'" },
  "pronunciation-focus": { label: "Pronunciation Focus", tip: "Slow down on flagged phonemes and enunciate content words and final consonants." },
  "speed-control": { label: "Speed Control", tip: "Aim for 110-150 WPM and keep mid-clause pauses under 1.2 seconds." },
  "language-upgrade": { label: "Language Upgrade", tip: "Replace generic verbs with precise academic verbs and include at least one subordinate clause." },
  "timed-response": { label: "Timed Response", tip: "Cover claim, reason, specific example, and conclusion within 45-60 seconds." },
  "checkpoint": { label: "Checkpoint", tip: "Complete as a real test check without switching prompts or peeking at scripts." }
};

const REPEAT_WEAKNESSES = {
  keywordRetention: "Content Word Retention",
  wordOrderStability: "Word Order Stability",
  endingRetention: "Sentence-Final Retention",
  pronunciationClarity: "Pronunciation & Intelligibility",
  paceControl: "Pacing & Pause Control"
};

const INTERVIEW_WEAKNESSES = {
  directAnswer: "Direct Opening Claim",
  reasonDevelopment: "Reason Development",
  exampleSpecificity: "Example Specificity",
  organization: "Discourse Organization",
  languageUse: "Lexical & Grammatical Range",
  fluency: "Speech Fluency & Pacing"
};

const COACH_DRILL_MAP = {
  keywordRetention: "chunk-repeat",
  wordOrderStability: "chunk-repeat",
  endingRetention: "chunk-repeat",
  pronunciationClarity: "pronunciation-focus",
  paceControl: "speed-control",
  directAnswer: "answer-skeleton",
  reasonDevelopment: "because-builder",
  exampleSpecificity: "example-builder",
  organization: "answer-skeleton",
  languageUse: "language-upgrade",
  fluency: "timed-response"
};
