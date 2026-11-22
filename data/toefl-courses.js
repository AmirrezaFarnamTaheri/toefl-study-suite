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
      "Use the exact per-letter blanks (_ _ _ _) together with grammar clues: e.g., 'dan_ _ _ _' (4 letters) rules out 'dance' (2) and 'dances' (3) and locks in 'dancing'."
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
    id: "s-repeat-drills",
    track: "Speaking",
    title: "Listen & Repeat Drills: Working-Memory Ladder & Intelligibility",
    duration: "9 min",
    summary: "Train verbatim accuracy, zero-latency starts, and natural linking using ETS 2026 Listen & Repeat criteria.",
    keyRules: [
      "ETS 2026 scores Listen & Repeat (0-5) across three pillars: Repeat Accuracy (exact words + grammar endings), Fluency (steady pace, minimal pauses), and Intelligibility (clear pronunciation, rhythm, and syllable stress).",
      "Know the Score 5 vs. Score 4 boundary: Score 5 is an exact, fully intelligible repeat; Score 4 captures full meaning with 1-2 minor function-word or tense slips; Score 3 drops meaning or multiple words.",
      "Climb the Working-Memory Ladder: master 5-7 word prompts cleanly first, stretch to 12-15 words by chunking (Subject / Verb+Object / Time-or-Place), and overtrain with 1.1x-1.3x playback so normal 1.0x exam audio feels slow.",
      "Zero-latency start + 7-point self-audit: begin speaking immediately after the beep with no 'uh/um', keep exact -s/-ed endings, avoid mid-sentence restarts, and check speech-to-text transcripts for misheard words."
    ],
    workedExample: {
      prompt: "15-word prompt: 'Students who register for the workshop before Thursday will receive a complimentary lab manual.'",
      solution: "Chunk 1: 'Students who register for the workshop' | Chunk 2: 'before Thursday' | Chunk 3: 'will receive a complimentary lab manual.' Watch final consonants in 'students', 'before', 'receive', and 'manual'.",
      takeaway: "If speech-to-text misrecognizes a word twice, write 3 short sentences with that word and drill it aloud until ASR captures it cleanly."
    },
    practiceTarget: { tab: "practice", speakingMode: "repeat", label: "Drill Listen & Repeat Now" },
    quiz: [
      {
        question: "What separates a Score 5 from a Score 4 on TOEFL 2026 Listen & Repeat?",
        choices: [
          "Score 5 adds extra personal opinions after the sentence",
          "Score 5 is an exact, fully intelligible repeat, whereas Score 4 captures the meaning with 1-2 minor function-word or tense slips",
          "Score 5 must be spoken twice as fast as the recording",
          "Score 4 requires repeating only half the sentence"
        ],
        answer: 1,
        explanation: "Keeping exact function words ('the', 'for', 'will') and grammar endings (-s, -ed) lifts a strong Score 4 repeat to Score 5."
      },
      {
        question: "What should you do if you notice a small mistake halfway through a Listen & Repeat sentence?",
        choices: [
          "Stop completely and stay silent for the rest of the 10 seconds",
          "Say 'sorry, let me start over' and repeat from word 1",
          "Keep speaking smoothly to finish the sentence; avoid full restarts that break fluency",
          "Whisper the remaining words"
        ],
        answer: 2,
        explanation: "Full restarts waste your 8-12 second window and hurt Fluency more than one minor slip."
      }
    ]
  },
  {
    id: "s-interview-frameworks",
    track: "Speaking",
    title: "Take an Interview: STAR & PREP Frameworks (45-Second Pacing)",
    duration: "10 min",
    summary: "Structure zero-prep interview answers effortlessly using STAR for experiences, PREP for opinions, and natural recovery chunks.",
    keyRules: [
      "The 4 interview turns progress from personal/factual questions (use STAR) to broader opinion/policy questions (use PREP), with 45 seconds each and zero prep time.",
      "STAR timing for personal stories: Situation (6-8s) -> Task (10-12s) -> Action you took (14-16s) -> Result/Takeaway (5-6s).",
      "PREP timing for opinion turns: Point (direct answer in sentence 1) -> Reason (one sharp 'why') -> Example (one concrete story or habit) -> Wrap-up when 3 seconds remain so you never get cut off mid-clause.",
      "Clarity beats robotic perfection: use natural micro-pauses between ideas, fix small slips once calmly without apologizing, and keep flexible recovery chunks ready ('Another thing worth mentioning is...', 'Over time, I've realized that...')."
    ],
    workedExample: {
      prompt: "Personal turn: 'Tell me about a time you solved a difficult problem with a team.' (STAR, 45s)",
      solution: "S (7s): 'Last semester, my lab group had to present an engineering report in three days.' T (10s): 'Our data charts didn't match, and two members had conflicting schedules.' A (18s): 'I set up a shared spreadsheet, divided each section clearly, and ran a short 15-minute video check-in that night so everyone could verify their numbers.' R (7s): 'We finished a day early and earned full marks on the presentation.'",
      takeaway: "Watching the timer at 38-42 seconds lets you land a calm 1-sentence result instead of getting cut off mid-sentence."
    },
    practiceTarget: { tab: "practice", speakingMode: "interview", label: "Practice 45s Interview Answers" },
    quiz: [
      {
        question: "When should you start wrapping up your 45-second Take an Interview answer?",
        choices: [
          "At 15 seconds so you leave 30 seconds of silence",
          "When about 3-5 seconds remain, landing a short closing takeaway cleanly",
          "Never wrap up; keep adding new examples until the beep cuts you off mid-word",
          "Wait 10 seconds silently before starting"
        ],
        answer: 1,
        explanation: "Glancing at the timer with 3-5 seconds left lets you finish your final clause naturally."
      },
      {
        question: "If you make a small grammar slip mid-sentence during an interview turn, what is the best move?",
        choices: [
          "Apologize ('Sorry, my English is bad') and restart the whole answer",
          "Correct it once quickly or keep going smoothly without apologizing",
          "Pause silently for 8 seconds to think of a rare synonym",
          "Stop speaking immediately"
        ],
        answer: 1,
        explanation: "ETS rewards clear, natural communication; apologizing and restarting hurts fluency far more than a minor slip."
      }
    ]
  },
  {
    id: "s-interview-topics",
    track: "Speaking",
    title: "Speaking Topic Idea Bank: Tech, Health, Education & Culture",
    duration: "10 min",
    summary: "Stock your mind with flexible, natural idea angles and collocations across the four highest-frequency TOEFL Speaking themes.",
    keyRules: [
      "Technology & Daily Life: emphasize saving time on routine tasks (online banking, calendar reminders), staying connected across distances, balanced against screen fatigue and privacy trade-offs.",
      "Health & Routines: anchor on 'consistency beats intensity' (daily evening walks, steady sleep schedule, hydration) and how fixed habits remove daily decision fatigue.",
      "Education & Work: focus on actionable feedback vs. raw grades, active peer collaboration vs. passive lectures, and using digital/AI tools to spot blind spots without outsourcing real thinking.",
      "Culture & Traditions: highlight how shared meals, festivals, and local customs build belonging across generations, while globalization spreads new perspectives alongside a need to preserve heritage."
    ],
    workedExample: {
      prompt: "Question: 'How do you usually maintain a healthy balance when your schedule gets busy?'",
      solution: "Core idea (Consistency > Intensity): 'I don't follow an extreme routine, because intense plans usually fail during exam week. Instead, I stick to small daily habits: I take a 20-minute walk every evening and keep a fixed bedtime. Making those habits automatic keeps my stress manageable and helps me focus better the next morning.'",
      takeaway: "Memorizing 2 flexible idea angles per theme beats memorizing rigid full-paragraph scripts that sound unnatural."
    },
    practiceTarget: { tab: "starter", label: "Try 4-Step Speaking Warm-up" },
    quiz: [
      {
        question: "Why do flexible 'idea angles' (like 'consistency beats intensity') outperform memorized full scripts in Take an Interview?",
        choices: [
          "Because memorized scripts cannot adapt smoothly to unexpected follow-up questions and sound robotic",
          "Because ETS bans talking about personal habits",
          "Because scripts are always shorter than 20 words",
          "Because idea angles eliminate the need for clear pronunciation"
        ],
        answer: 0,
        explanation: "Linked interview turns shift from factual to opinion follow-ups; flexible idea patterns let you answer naturally on the spot."
      },
      {
        question: "Which collocation sounds most natural in a TOEFL Speaking answer about technology?",
        choices: [
          "Technology makes a big convenience to my routine.",
          "Calendar apps help me organize my schedule and cut down on stress.",
          "I do a communication with my colleagues by phone.",
          "Digital tools give a feedback to my work very fast."
        ],
        answer: 1,
        explanation: "'Organize my schedule' and 'cut down on stress' are natural, idiomatic spoken collocations."
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
    id: "w-email-register",
    track: "Writing",
    title: "Write an Email: Tone, Politeness & Functional Phrase Bank",
    duration: "9 min",
    summary: "Master the official ETS Social Conventions dimension: register matching, polite modals, and idiomatic collocations.",
    keyRules: [
      "ETS explicitly evaluates Social Conventions on Write an Email: greeting/closing, register (formal for professors/managers vs. friendly-clear for peers), polite requests, and professional phrasing of complaints or apologies.",
      "Replace blunt commands ('Fix the heater now') with polite modal frames ('Could you please arrange for the heating system to be inspected as soon as possible?' or 'I would be grateful if you could...').",
      "Use clean functional openers & sign-offs: 'I am writing regarding...', 'I am afraid I cannot make Friday; would Tuesday work instead?', 'I sincerely apologize for any inconvenience caused.', and 'Best regards,' + name.",
      "Fix high-frequency collocation traps flagged in the ETS Technical Manual: write 'provide feedback' (not 'give a feedback'), 'suggest that you repair' (not 'suggest you to repair'), 'strike a balance' (not 'make a balance'), and 'request an extension'."
    ],
    workedExample: {
      prompt: "Too direct (Score 3 tone): 'Hello, the heater in Room 204 is broken. Fix it today and tell me when you come. Thanks.'",
      solution: "Band 5 tone: 'Dear Building Manager, I am writing to report that the heating unit in Room 204 stopped working this morning. Because temperatures are dropping sharply this week, could you please arrange for a technician to inspect it as soon as possible? Please let me know what time works best so I can ensure access to the room. Thank you for your prompt assistance. Best regards, Sam'",
      takeaway: "Polite modals ('could you please arrange...'), concrete context, and a clear next step lift an email from Score 3 to Score 5."
    },
    practiceTarget: { tab: "writing", subKey: "writingMode", subVal: "email", label: "Practice Writing Polite Emails" },
    quiz: [
      {
        question: "Which sentence uses the most natural collocation and appropriate tone for an email to a campus director?",
        choices: [
          "I suggest you to repair the lab projector immediately.",
          "Could you please arrange for the lab projector to be repaired before Thursday's seminar?",
          "Give me a feedback about when you fix the projector.",
          "Hey Director, fix the projector ASAP!"
        ],
        answer: 1,
        explanation: "'Could you please arrange for ... to be repaired' matches formal register and uses accurate grammar and collocation."
      },
      {
        question: "Which sign-off works reliably across almost every academic and professional TOEFL email?",
        choices: [
          "Best regards, [Your Name]",
          "Later bro,",
          "Submitted respectfully without further ado,",
          "No closing or name at all"
        ],
        answer: 0,
        explanation: "'Best regards,' (or 'Kind regards,') followed by your name is polite, natural, and fits both professors and managers."
      }
    ]
  },
  {
    id: "w-discussion-examples",
    track: "Writing",
    title: "Academic Discussion: Concrete Examples & Avoiding Circular Filler",
    duration: "10 min",
    summary: "Turn thin opinions into Band 5 contributions using the Position -> Reason -> Concrete Example -> Relevance chain.",
    keyRules: [
      "Zero circular restatement: do not repeat your opinion three times in synonyms. Follow Position -> Reason (why/how) -> Concrete Example -> Relevance (what the example proves).",
      "Keep vocabulary proportional to your syntax (register balance): clear, precise verbs ('experienced', 'demonstrated', 'reduced') beat awkward rare words dropped into broken grammar or wordy 'have + noun' ('had some experiences').",
      "Use natural classmate engagement when helpful: 'While [Name] raises a valid point about..., it is easy to overlook...' or 'Building on [Name]'s point, I would add that...' (note: ETS does NOT require naming a student, only making a meaningful contribution).",
      "Prepare adaptable personal-anecdote frames across recurring themes (AI/tech tools, remote work, environmental rules vs. cost, written feedback vs. grades, social media, privacy): 'For instance, during my..., I noticed that [specific outcome].'"
    ],
    workedExample: {
      prompt: "Weak circular draft: 'I think written feedback is better than grades. Grades are not helpful and feedback helps students learn much more effectively.'",
      solution: "Concrete Band 5 upgrade: 'I strongly favor detailed written feedback over bare letter grades. While numerical scores show where a student stands, they rarely explain how to improve. For instance, when one of my professors returned a major essay with specific comments on my argument structure instead of a letter grade, I immediately saw where my evidence was thin and raised my next paper's clarity dramatically.'",
      takeaway: "One specific 2-sentence example immediately replaces vague repetition and proves your reasoning."
    },
    practiceTarget: { tab: "writing", subKey: "writingMode", subVal: "discussion", label: "Practice Academic Discussion" },
    quiz: [
      {
        question: "Which sentence best replaces wordy 'have + noun' phrasing with a strong active verb?",
        choices: [
          "I had some experiences with remote work during my internship.",
          "I did an observation of a big increase in focus.",
          "During my remote internship, I experienced far fewer interruptions and finished reports faster.",
          "Remote work gave a benefit to my productivity."
        ],
        answer: 2,
        explanation: "Direct active verbs ('experienced', 'finished') make 100-140 word responses tighter, clearer, and more idiomatic."
      },
      {
        question: "According to the official 2026 ETS Writing Scoring Guide, must you always name another student in Academic Discussion?",
        choices: [
          "Yes, omitting a classmate's name automatically gives Score 0",
          "No; naming a student is optional, though briefly engaging or contrasting with an existing idea is a great way to show a meaningful contribution",
          "Yes, you must quote both students word for word",
          "No, you should ignore the discussion topic completely"
        ],
        answer: 1,
        explanation: "ETS requires a relevant, original contribution in your own words; engaging a classmate's point helps naturally, but rigid templates are never required."
      }
    ]
  },
  {
    id: "w-rubric-traps",
    track: "Writing",
    title: "Inside the Official 2026 Writing Rubric: Score 4 vs. 5 & Myths",
    duration: "8 min",
    summary: "Understand how ETS scores the 20-point Writing section, local vs. global errors, and what actually separates Score 4 from Score 5.",
    keyRules: [
      "2026 Writing raw score is out of 20: Build a Sentence (10 items x 1 pt = 10 pts) + Write an Email (0-5 holistic) + Academic Discussion (0-5 holistic), linked statistically to the 1.0-6.0 Band scale.",
      "Local vs. global errors: one minor typo or missing article (local) rarely caps a strong response, whereas omitting a required email bullet, unclear meaning, wrong tone, or circular filler (global) pulls you down to Score 3.",
      "The 4-vs-3 Decision Test: For Email, can the recipient understand the full situation, details, and requested action easily? For Discussion, is the position backed by a relevant, clearly explained reason/example?",
      "Myths busted by ETS Technical Manual RR-25-12: ETS does NOT award separate bonus points for memorized templates, forced rare C2 words, or inflated length padded with repetition. Clarity, complete task coverage, and natural control win Score 5."
    ],
    workedExample: {
      prompt: "Comparison: Response A (185 words, memorized intro template, misses bullet #3, two unclear sentences) vs. Response B (112 words, addresses all 3 bullets cleanly, natural tone, 1 tiny typo).",
      solution: "Response B scores higher (4-5) because it accomplishes the communicative purpose completely and reads clearly on the first pass; Response A drops to 3 due to a missing requirement and unclear filler.",
      takeaway: "Every extra word only helps if it adds relevant detail; protect 60 seconds to verify all prompt points and clean up unclear sentences."
    },
    practiceTarget: { tab: "writing", subKey: "writingMode", subVal: "rubric", label: "Open Official Writing Guide" },
    quiz: [
      {
        question: "How is the TOEFL 2026 Writing section raw score structured across its three tasks?",
        choices: [
          "Build a Sentence (10 pts) + Write an Email (0-5) + Academic Discussion (0-5) = 20 raw points",
          "One 30-minute essay worth 100 points",
          "Only Academic Discussion is graded",
          "Build a Sentence (5 pts) + Integrated Essay (15 pts)"
        ],
        answer: 0,
        explanation: "Because Build a Sentence makes up half of the 20 raw points, drilling sentence word order and embedded clauses yields huge Writing Band gains."
      },
      {
        question: "Which mistake is a 'global' (score-damaging) error rather than a minor local slip?",
        choices: [
          "One small spelling slip in an otherwise clear sentence",
          "Omitting one of the three requested points in Write an Email or using a rude tone with a professor",
          "Using 'Best regards,' instead of 'Yours faithfully,'",
          "Writing 115 words instead of 150 words"
        ],
        answer: 1,
        explanation: "Global errors undermine task completion, clarity, or social appropriateness, directly lowering the holistic band."
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
