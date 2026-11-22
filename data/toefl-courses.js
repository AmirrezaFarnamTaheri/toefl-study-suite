const TOEFL_COURSES = [
  {
    id: "r-ctw",
    track: "Reading",
    title: "Complete the Words: Context and Word Endings",
    duration: "8 min",
    summary: "Fill in missing word halves quickly by reading the whole sentence first and checking grammar endings.",
    keyRules: [
      "Read the first sentence completely; it has no blanks and gives you the main topic right away.",
      "Check the word before the blank to see what part of speech fits (noun, verb, adjective, or adverb).",
      "Watch endings carefully: third-person singular -s, past tense -ed, plural -s, and noun endings like -tion or -ment.",
      "Count letters only after you pick the meaning; do not guess random letters that break the sentence grammar."
    ],
    workedExample: {
      prompt: "Sentence: Solar panels have become much more affo_____ over the past decade, allowing homeowners to red___ their electricity bills.",
      solution: "1) 'more ___' needs an adjective -> affordable. 2) 'to ___ their bills' needs a base verb -> reduce.",
      takeaway: "Grammar clues ('more' + adjective, 'to' + base verb) narrow down the exact word in seconds."
    },
    practiceTarget: { tab: "reading", subKey: "readingMode", subVal: "ctw", label: "Practice Complete the Words" },
    quiz: [
      {
        question: "In 'Researchers recently disco_____ a new species of frog', which ending makes the sentence grammatically correct?",
        choices: ["discover", "discovered", "discovering", "discovery"],
        answer: 1,
        explanation: "'Recently' paired with a subject ('Researchers') needs a simple past tense verb: 'discovered'."
      },
      {
        question: "What should you do FIRST when a Complete the Words passage appears?",
        choices: [
          "Type the first blank before reading sentence 1",
          "Read the intact first sentence to understand the topic",
          "Count every letter in the whole passage",
          "Skip straight to the last sentence"
        ],
        answer: 1,
        explanation: "Sentence 1 is never blanked on TOEFL 2026 and sets the topic and tense for the entire paragraph."
      }
    ]
  },
  {
    id: "r-mcq",
    track: "Reading",
    title: "Daily Life and Academic Reading: Finding Evidence Fast",
    duration: "10 min",
    summary: "Match every answer choice to exact evidence in notices, emails, and short academic passages without falling for trap words.",
    keyRules: [
      "On campus notices, menus, and emails, scan dates, deadlines, fees, and exceptions before reading every line.",
      "On academic passages, write a 4-word mental label for each paragraph so you know where to look back.",
      "Be cautious of extreme choices ('always', 'never', 'only', 'all') unless the text states that exact limit.",
      "For inference questions, choose the answer that MUST be true based on the text, not an outside assumption."
    ],
    workedExample: {
      prompt: "Notice: 'Library study rooms may be booked up to 48 hours ahead. Reservations expire if a group arrives more than 10 minutes late.' Question: What happens if a group is 15 minutes late?",
      solution: "Their reservation expires (they lose the room), because 15 minutes is more than the 10-minute grace period.",
      takeaway: "Verify numbers and conditions directly in the notice before clicking."
    },
    practiceTarget: { tab: "reading", subKey: "readingMode", subVal: "passages", label: "Practice Reading Passages" },
    quiz: [
      {
        question: "Which answer choice is most likely a trap on an Academic Reading question?",
        choices: [
          "A paraphrase of two sentences in paragraph 2",
          "A choice that repeats exact passage words but flips cause and effect",
          "A cautious statement using 'suggests' or 'often'",
          "A summary of the main finding"
        ],
        answer: 1,
        explanation: "ETS traps frequently reuse familiar vocabulary from the text while reversing the relationship or changing who did what."
      },
      {
        question: "When answering a 'Daily Life' email or campus notice question, what saves the most time?",
        choices: [
          "Memorizing every word before reading the question",
          "Reading the question stem first and scanning the notice for dates, actions, and rules",
          "Skipping the subject line and sender",
          "Choosing the longest answer choice"
        ],
        answer: 1,
        explanation: "Reading the question first lets you jump straight to the exact line (time, location, fee, or policy) in the notice."
      }
    ]
  },
  {
    id: "l-campus",
    track: "Listening",
    title: "Campus Conversations and Announcements: Catching the Action",
    duration: "9 min",
    summary: "Track the speaker's main problem, the solution offered, and what will happen next in short real-life recordings.",
    keyRules: [
      "In the first 10 seconds, identify WHO is speaking and WHY they came (a problem, request, or schedule change).",
      "Pay close attention to the second speaker's reaction: advice, conditions, or deadlines are frequently tested.",
      "Listen for contrast markers ('actually', 'however', 'instead', 'the only catch is') because they signal the key detail.",
      "Write short symbols while listening (e.g., 'Lib -> Fri 5pm, need ID') instead of full sentences."
    ],
    workedExample: {
      prompt: "Announcement: 'Because the main gym floor is being refinished, Tuesday evening yoga will move to Room 204. Bring your own mat, as spare mats are locked in storage.'",
      solution: "Main change: Room 204 on Tuesday. Action required: bring your own mat.",
      takeaway: "Every campus announcement tests two things: what changed and what students must do."
    },
    practiceTarget: { tab: "listening", label: "Practice Listening Clips" },
    quiz: [
      {
        question: "What signal phrase in a campus conversation usually introduces a tested condition or exception?",
        choices: ["Good morning", "The only catch is...", "Nice to meet you", "See you around"],
        answer: 1,
        explanation: "Phrases like 'the only catch is', 'however', and 'just make sure' highlight rules and exceptions that appear in questions."
      },
      {
        question: "Why should you avoid writing full sentences during Listening?",
        choices: [
          "Notes are graded by ETS",
          "Writing full sentences makes you miss the next detail the speaker says",
          "Pencil lead breaks easily",
          "Short notes are harder to read"
        ],
        answer: 1,
        explanation: "Abbreviated keywords and arrows keep your ears focused on the speaker while preserving dates, reasons, and decisions."
      }
    ]
  },
  {
    id: "l-lecture",
    track: "Listening",
    title: "Academic Talks and Shadowing: Tracking Ideas and Shifts",
    duration: "10 min",
    summary: "Follow short academic talks by separating main ideas from examples, and train your ear with A-B loop shadowing.",
    keyRules: [
      "Listen for the lecture roadmap at the start ('Today we will look at two reasons why...').",
      "Whenever the speaker gives an example ('For instance', 'Take the case of...'), note WHAT concept it proves.",
      "Notice tone and attitude: if a speaker pauses, laughs, or says 'Surprisingly', expect a question about their point.",
      "Use 0.8x to 1.1x playback and A-B looping in the Listening Lab to replay missed phrases until every word is clear."
    ],
    workedExample: {
      prompt: "Professor: 'Many people assume desert plants grow slowly because of heat. Yet in experiments, water timing mattered far more than air temperature.'",
      solution: "Common myth: heat slows growth. Actual finding: water timing is the primary driver.",
      takeaway: "Whenever a professor contrasts a common belief with real evidence, that contrast is almost always a question."
    },
    practiceTarget: { tab: "listening", label: "Practice Listening & Shadowing" },
    quiz: [
      {
        question: "When a professor mentions a specific example (like a species of bird or a historical city), what question usually follows?",
        choices: [
          "How to spell the city's name",
          "Why the professor mentioned that example (which point it supports)",
          "The professor's favorite travel destination",
          "How many minutes the talk lasted"
        ],
        answer: 1,
        explanation: "TOEFL Listening tests the PURPOSE of an example: what concept, claim, or contrast it illustrates."
      },
      {
        question: "How does A-B loop shadowing improve Listening scores?",
        choices: [
          "It lets you replay fast connected speech until your brain recognizes natural word links",
          "It replaces reading practice",
          "It automatically skips hard words",
          "It lowers your speaking speed permanently"
        ],
        answer: 0,
        explanation: "Looping a 5-second clip trains your ear to catch reduced words, contractions, and linked consonants in real time."
      }
    ]
  },
  {
    id: "s-repeat",
    track: "Speaking",
    title: "Listen and Repeat: Chunking Sentences Under Pressure",
    duration: "8 min",
    summary: "Repeat longer sentences accurately by grouping words into 2 or 3 natural meaning chunks instead of memorizing word by word.",
    keyRules: [
      "Do not try to memorize 12 separate words; group them into 2-3 phrases (Subject / Action / Where-or-When).",
      "Keep a steady rhythm and clear word endings (-s, -ed, -t, -d) rather than rushing at top speed.",
      "Turn on the Exam-Room Babble Noise mixer at 30% volume during practice so real test-room voices do not distract you.",
      "If you miss one small word, keep going smoothly; long silent pauses hurt fluency more than a tiny slip."
    ],
    workedExample: {
      prompt: "Sentence (13 words): 'The science museum will stay open until nine o'clock every Friday this summer.'",
      solution: "Chunk 1: 'The science museum' | Chunk 2: 'will stay open until nine o'clock' | Chunk 3: 'every Friday this summer.'",
      takeaway: "Three meaningful chunks are far easier to hold in short-term memory than thirteen separate words."
    },
    practiceTarget: { tab: "practice", speakingMode: "repeat", label: "Practice Listen & Repeat" },
    quiz: [
      {
        question: "What is the best strategy for repeating a 14-word sentence accurately?",
        choices: [
          "Whisper every word while the audio is still playing",
          "Group the sentence into 2-3 natural phrase chunks and speak at a calm, steady pace",
          "Speak as fast as possible before you forget",
          "Stop and restart from the beginning if you miss 'the'"
        ],
        answer: 1,
        explanation: "Chunking into meaningful phrases protects memory and produces natural intonation and pacing."
      },
      {
        question: "Why should you practice Listen and Repeat with mild background babble noise?",
        choices: [
          "Because test centers are completely silent",
          "Because other test-takers speak aloud near you during the real exam",
          "Because background noise raises your microphone volume",
          "Because ETS adds music to the audio"
        ],
        answer: 1,
        explanation: "Practicing with realistic room chatter builds focus so nearby voices on exam day do not break your memory."
      }
    ]
  },
  {
    id: "s-interview",
    track: "Speaking",
    title: "Take an Interview: Strong 45-Second Answers",
    duration: "10 min",
    summary: "Answer all 4 interview turns with zero preparation time using the simple Point-Reason-Example-Wrap structure.",
    keyRules: [
      "Answer immediately in the first 3 seconds with a direct choice or clear opinion (avoid long 'umm' delays).",
      "Follow P-R-E-W: Point (1 sentence) -> Reason (why) -> Concrete Example (a real story or habit) -> Short Wrap-up.",
      "Aim for 80 to 110 natural words over 40-45 seconds (roughly 130-150 words per minute).",
      "Use everyday linking words naturally ('Mainly because...', 'For example, last month...', 'Because of that...')."
    ],
    workedExample: {
      prompt: "Question: 'Do you prefer studying alone or in a small group?'",
      solution: "Point: 'I definitely prefer studying alone.' Reason: 'It helps me stay focused and move at my own speed.' Example: 'Last semester, when I studied for biology by myself, I finished two chapters in one afternoon without getting distracted by side conversations.' Wrap: 'So solo study works much better for me.'",
      takeaway: "One specific personal example beats three vague generalities every time."
    },
    practiceTarget: { tab: "practice", speakingMode: "interview", label: "Practice Interview" },
    quiz: [
      {
        question: "In the 2026 'Take an Interview' task, how much preparation time do you get before each question?",
        choices: ["45 seconds", "15 seconds", "Zero preparation time - you answer right away", "60 seconds"],
        answer: 2,
        explanation: "Take an Interview mirrors a real conversation: once the interviewer finishes asking, your 45-second response starts immediately."
      },
      {
        question: "What makes a 45-second interview answer jump from Band 4 to Band 5-6?",
        choices: [
          "Memorizing rare Latin words and pausing often",
          "A direct answer, one clear reason, and one concrete everyday example spoken smoothly",
          "Speaking for only 15 seconds to avoid mistakes",
          "Repeating the interviewer's question three times"
        ],
        answer: 1,
        explanation: "Natural delivery plus specific, concrete development scores much higher than memorized templates or stiff vocabulary."
      }
    ]
  },
  {
    id: "w-sentence",
    track: "Writing",
    title: "Build a Sentence: Word Order, Clauses, and Agreement",
    duration: "9 min",
    summary: "Assemble scrambled word tiles into clean English sentences by locking in the Subject + Verb core first.",
    keyRules: [
      "Find the main Subject and main Verb first, then place the Object right after the verb.",
      "Watch indirect questions carefully: 'Could you tell me where the bus stops?' (NOT 'where does the bus stop?').",
      "Place frequency adverbs ('always', 'usually', 'rarely') BEFORE main verbs, but AFTER 'be' verbs ('is usually').",
      "Check prepositions and linking words last ('in order to', 'interested in', 'responsible for') and reread the whole sentence aloud in your head."
    ],
    workedExample: {
      prompt: "Prompt: 'Can you explain ___?' Tiles: [works / this / how / software / new]",
      solution: "Indirect question uses statement word order (how + subject + verb): 'how this new software works'.",
      takeaway: "Indirect questions ('Do you know...', 'Could you tell me...') ALWAYS keep normal Subject-before-Verb order."
    },
    practiceTarget: { tab: "writing", subKey: "writingMode", subVal: "sentence", label: "Practice Build a Sentence" },
    quiz: [
      {
        question: "Which arrangement is grammatically correct after 'Do you know...'?",
        choices: [
          "when does the library close",
          "when the library closes",
          "when closes the library",
          "does the library close when"
        ],
        answer: 1,
        explanation: "After 'Do you know', use statement order (wh-word + subject + verb): 'when the library closes'."
      },
      {
        question: "Where does the adverb 'usually' belong in 'The campus shuttle [is / arrives] on time'?",
        choices: [
          "After 'is' ('is usually'), and before 'arrives' ('usually arrives')",
          "Always at the very end of the sentence",
          "Before 'is' ('usually is') and after 'arrives' ('arrives usually')",
          "Between 'on' and 'time'"
        ],
        answer: 0,
        explanation: "Frequency adverbs go AFTER forms of 'be' ('is usually') and BEFORE other main verbs ('usually arrives')."
      }
    ]
  },
  {
    id: "w-email",
    track: "Writing",
    title: "Write an Email: Hitting All 3 Points in 7 Minutes",
    duration: "9 min",
    summary: "Write a polite, clear 90-130 word email that completes every bullet point with time left to proofread.",
    keyRules: [
      "Spend 30 seconds listing the 3 required bullet points from the prompt so you never miss one.",
      "Match your tone to the reader: polite and respectful for a professor or manager ('Dear Professor Lin'), friendly-polite for a classmate ('Hi Maya').",
      "Target 90 to 130 clear words across 3 short paragraphs: Purpose -> Details/Request -> Polite Closing.",
      "Save the final 60 seconds to fix verb tenses, missing articles ('a', 'the'), and capitalization."
    ],
    workedExample: {
      prompt: "Scenario: Email your professor to explain you missed Monday's lab due to illness, ask for the handout, and suggest a time to meet.",
      solution: "Dear Professor Chen, I am writing to let you know that I missed Monday's chemistry lab because I had a high fever. Could you please share the lab handout or data sheet so I can catch up before Friday? I would also appreciate a brief meeting during your office hours on Wednesday at 2:00 p.m. if you are available. Thank you for your time. Best regards, Alex",
      takeaway: "Every required point gets its own clean sentence, hitting 70-120 words easily in under 6 minutes."
    },
    practiceTarget: { tab: "writing", subKey: "writingMode", subVal: "email", label: "Practice Writing Emails" },
    quiz: [
      {
        question: "What is the single fastest way to lose points on Write an Email?",
        choices: [
          "Writing 110 words instead of 180",
          "Forgetting to address one of the prompt's 3 required points",
          "Using 'Dear Professor Smith' as a greeting",
          "Writing short, clear sentences"
        ],
        answer: 1,
        explanation: "Task completion is a core scoring rule: missing even one requested detail caps your score."
      },
      {
        question: "How should you budget your 7 minutes on the Email task?",
        choices: [
          "Plan 30 sec, write 5 min 30 sec, proofread 1 min",
          "Write nonstop for all 7 minutes with no check",
          "Spend 4 minutes planning and 3 minutes typing",
          "Write only 25 words and submit early"
        ],
        answer: 0,
        explanation: "A quick 30-second checklist prevents missed bullets, and 1 minute of editing catches easy grammar slips."
      }
    ]
  },
  {
    id: "w-discussion",
    track: "Writing",
    title: "Academic Discussion: Adding a Fresh Point in 10 Minutes",
    duration: "10 min",
    summary: "Contribute a clear 100-140 word forum post that engages one classmate and adds your own concrete reason and example.",
    keyRules: [
      "State your clear position in sentence 1 without copying the professor's prompt word-for-word.",
      "Acknowledge one student by name ('While Maya makes a fair point about cost, I believe...') to show real discussion engagement.",
      "Add ONE fresh reason that neither student mentioned, backed by a concrete example (2-3 sentences).",
      "Aim for 110 to 140 words and save 90 seconds to check subject-verb agreement, punctuation, and clear transitions."
    ],
    workedExample: {
      prompt: "Professor: Should cities ban cars in downtown areas? Student A (cost to shops) / Student B (cleaner air).",
      solution: "Position + Engagement: 'I strongly support car-free downtown zones. Although Liam raises a fair concern about delivery costs for local shops, cities can solve that by allowing delivery vans early in the morning.' Fresh point + Example: 'Beyond cleaner air, car-free streets also boost foot traffic for small businesses. For example, when my hometown turned Main Street into a walking plaza, cafes added outdoor seating and weekend sales grew noticeably.'",
      takeaway: "Engage a classmate briefly, then spend most of your words developing your OWN specific example."
    },
    practiceTarget: { tab: "writing", subKey: "writingMode", subVal: "discussion", label: "Practice Academic Discussion" },
    quiz: [
      {
        question: "Why should you mention one classmate's idea in Academic Discussion?",
        choices: [
          "To copy their paragraph so you hit the word count",
          "To show you are contributing to an ongoing class discussion before adding your own new idea",
          "Because ETS requires you to agree with Student A",
          "To criticize their grammar"
        ],
        answer: 1,
        explanation: "Briefly engaging a classmate (agreeing or politely countering) while adding a new reason fulfills the discussion goal."
      },
      {
        question: "What is the ideal target word range for Academic Discussion in 10 minutes?",
        choices: ["40-60 words", "110-140 well-edited words", "350+ words", "Under 80 words"],
        answer: 1,
        explanation: "110-140 clear, specific words give you full idea development while leaving time to proofread grammar and spelling."
      }
    ]
  },
  {
    id: "g-grammar",
    track: "Grammar & Strategy",
    title: "Clean Academic Sentences: Fixing the Top 5 Errors",
    duration: "8 min",
    summary: "Eliminate the five grammar slips that most often lower TOEFL Writing and Speaking scores.",
    keyRules: [
      "Fix comma splices: never join two full sentences with only a comma ('It rained, we stayed home' -> 'It rained, so we stayed home.').",
      "Check subject-verb agreement when a phrase sits in between ('The number of students IS rising', not 'are').",
      "Use 'a/an' or plural '-s' with countable singular nouns ('a good idea' or 'good ideas', never bare 'good idea').",
      "Keep verb tenses consistent inside one story: past tense for completed past examples, present tense for general truths."
    ],
    workedExample: {
      prompt: "Draft: 'Online class is convenient, however many student lose focus easily.'",
      solution: "Fixed: 'Online classes are convenient; however, many students lose focus easily.'",
      takeaway: "Fixing two tiny things (plural '-s' and semicolon before 'however') instantly raises clarity and grammar band."
    },
    practiceTarget: { tab: "vocab", label: "Review High-Yield Vocab" },
    quiz: [
      {
        question: "Which sentence fixes the comma splice properly?",
        choices: [
          "The museum was crowded, we visited the garden instead.",
          "The museum was crowded, so we visited the garden instead.",
          "The museum was crowded, however we visited the garden instead.",
          "The museum was crowded we visited the garden instead."
        ],
        answer: 1,
        explanation: "Adding a coordinating conjunction ('so') after the comma joins two independent clauses correctly."
      },
      {
        question: "Which sentence has correct subject-verb agreement?",
        choices: [
          "A wide range of free workshops are offered every Friday.",
          "A wide range of free workshops is offered every Friday.",
          "The results of the study shows a clear trend.",
          "Each of the volunteers receive a certificate."
        ],
        answer: 1,
        explanation: "The core subject is singular ('A wide range' -> 'is offered'; 'Each' -> 'receives'; 'The results' -> 'show')."
      }
    ]
  },
  {
    id: "g-strategy",
    track: "Grammar & Strategy",
    title: "TOEFL 2026 Adaptive Pacing and Test-Day Calm",
    duration: "7 min",
    summary: "Understand the 1-6 Band scale, multistage adaptive Reading and Listening, and how to stay calm across all four sections.",
    keyRules: [
      "Reading and Listening are multistage adaptive: Part 1 accuracy unlocks the harder, higher-scoring Part 2, so be extra careful on Part 1.",
      "Do not dwell on a tough question; make your best educated choice and protect your time for easier points ahead.",
      "Every section is scored on the 1.0 to 6.0 Band scale (in 0.5 steps), and your overall score is the average of the four sections.",
      "Take at least two full 4-section timed mocks before test day so switching from Reading to Listening, Writing, and Speaking feels automatic."
    ],
    workedExample: {
      prompt: "Situation: You miss one tough Listening question in Part 1 and feel anxious as the next clip starts.",
      solution: "Take one slow breath, drop the previous item completely, and focus 100% on the opening sentence of the new clip.",
      takeaway: "Missing one item never ruins your Band score, but letting stress spill into the next three items does."
    },
    practiceTarget: { tab: "fullmock", label: "Start a Full 4-Section Mock" },
    quiz: [
      {
        question: "Why is steady accuracy in Part 1 of Reading and Listening especially important in TOEFL 2026?",
        choices: [
          "Part 2 is not scored",
          "Part 1 performance routes you to the upper or lower Part 2 module",
          "Part 1 has no timer",
          "You can repeat Part 1 twice"
        ],
        answer: 1,
        explanation: "In the multistage adaptive design, strong Part 1 accuracy unlocks the upper Part 2 track needed for Band 5.0-6.0."
      },
      {
        question: "How is the overall TOEFL 2026 score calculated?",
        choices: [
          "Sum of all four sections out of 120 only",
          "Average of Reading, Listening, Writing, and Speaking on the 1.0-6.0 Band scale (rounded to 0.5)",
          "Only Speaking and Writing count",
          "Highest two sections divided by two"
        ],
        answer: 1,
        explanation: "Each of the four skills receives a 1.0-6.0 score in 0.5 increments, averaged into an overall 1.0-6.0 Band score."
      }
    ]
  }
];

if (typeof window !== "undefined") {
  window.TOEFL_COURSES = TOEFL_COURSES;
}
