const TOEFL_LISTENING_PRACTICE = [
  {
    "id": "reply-1",
    "kind": "Choose a response",
    "title": "Borrowing headphones",
    "script": "Would you mind returning these headphones to the front desk before you leave?",
    "questions": [
      {
        "prompt": "Which reply best fits what you heard?",
        "choices": [
          "Of course. I’ll drop them off on my way out.",
          "No, the front desk is beside the entrance.",
          "I returned them after I left tomorrow.",
          "Yes, I borrowed them from the front desk."
        ],
        "answer": 0,
        "reason": "The speaker is making a polite request. The reply agrees to return the headphones."
      }
    ]
  },
  {
    "id": "reply-2",
    "kind": "Choose a response",
    "title": "An extra seat",
    "script": "Is anyone sitting here, or can I take this seat?",
    "questions": [
      {
        "prompt": "Which reply best fits what you heard?",
        "choices": [
          "The seats were replaced last month.",
          "Go ahead. The seat is free.",
          "I’m taking the bus this afternoon.",
          "Yes, I’ll wait until you finish."
        ],
        "answer": 1,
        "reason": "The speaker is asking permission to sit down. The reply gives permission and confirms the seat is free."
      }
    ]
  },
  {
    "id": "conversation-1",
    "kind": "Conversation",
    "title": "The statistics workshop",
    "script": "Student: I signed up for the statistics workshop on Wednesday, but I just found out my lab runs until four.\nAdvisor: The workshop starts at three, but there’s another session Thursday morning.\nStudent: That could work. Do I need to register again?\nAdvisor: Email the workshop coordinator and ask her to move you. That way, you won’t lose your place if Thursday is nearly full.",
    "questions": [
      {
        "prompt": "Why does the student need a different workshop session?",
        "choices": [
          "The workshop room has changed.",
          "The student’s lab overlaps with the workshop.",
          "The student signed up for the wrong subject.",
          "The Wednesday session was canceled."
        ],
        "answer": 1,
        "reason": "The lab ends at four, an hour after Wednesday’s workshop begins."
      },
      {
        "prompt": "What does the advisor suggest doing next?",
        "choices": [
          "Ask the lab instructor to end class early.",
          "Register for both sessions online.",
          "Email the coordinator about switching sessions.",
          "Attend the second half on Wednesday."
        ],
        "answer": 2,
        "reason": "The advisor says to ask the coordinator to move the registration so the student keeps a place."
      }
    ]
  },
  {
    "id": "conversation-2",
    "kind": "Conversation",
    "title": "Printing a poster",
    "script": "Student: The lab printer says my poster is too wide.\nAssistant: Which paper size did you choose?\nStudent: A two. That’s what the professor asked for.\nAssistant: The print preview shows a white margin on both sides. The poster file is the right size. The preview scales it because the printer is set to borderless paper. Switch the printer setting to standard A two, and check the preview before you send it again.",
    "questions": [
      {
        "prompt": "What is causing the problem?",
        "choices": [
          "The professor gave the wrong paper size.",
          "The file is set to the wrong page size.",
          "The printer is using the wrong paper setting.",
          "The printer has run out of paper."
        ],
        "answer": 2,
        "reason": "The assistant says the file is the right size and identifies the borderless paper setting."
      },
      {
        "prompt": "What should the student do before printing again?",
        "choices": [
          "Open the print preview.",
          "Remove the margins from the file.",
          "Ask for permission to use A three paper.",
          "Restart the lab printer."
        ],
        "answer": 0,
        "reason": "The assistant recommends switching the setting and checking the preview before sending the poster."
      }
    ]
  },
  {
    "id": "announcement-1",
    "kind": "Announcement",
    "title": "Friday library pickup",
    "script": "Attention, library users. On Friday morning the main entrance will be closed while workers replace the front doors. You can enter through the courtyard, but the usual pickup desk will be closed until noon. Morning pickup requests will be available at the information desk on the first floor. Books that are due that morning can still be returned through the outdoor book slot.",
    "questions": [
      {
        "prompt": "Where can someone pick up a requested book on Friday morning?",
        "choices": [
          "At the usual pickup desk",
          "At the information desk",
          "At the outdoor book slot",
          "At the main entrance"
        ],
        "answer": 1,
        "reason": "Morning pickups move to the information desk. The outdoor slot is for returns."
      },
      {
        "prompt": "Why will people use the courtyard entrance?",
        "choices": [
          "The information desk is moving outside.",
          "The courtyard is closer to the book slot.",
          "Workers are replacing the front doors.",
          "The library is holding an event at noon."
        ],
        "answer": 2,
        "reason": "The main entrance is closed while workers replace the doors."
      }
    ]
  },
  {
    "id": "announcement-2",
    "kind": "Announcement",
    "title": "A change to the shuttle route",
    "script": "This is a service notice for the campus shuttle. Starting Monday, the evening shuttle will stop at the north gate instead of the student center because of road repairs. The afternoon route and the evening departure times will stay the same. If you usually catch the shuttle at the student center after six, allow about five extra minutes to walk to the north gate.",
    "questions": [
      {
        "prompt": "What is changing on Monday?",
        "choices": [
          "The evening pickup location",
          "The afternoon shuttle route",
          "The evening departure times",
          "The walking route to the student center"
        ],
        "answer": 0,
        "reason": "The evening shuttle will use the north gate. The announcement says the departure times and afternoon route stay the same."
      },
      {
        "prompt": "Who needs to allow extra walking time?",
        "choices": [
          "Anyone who takes the shuttle before noon",
          "People who normally board at the north gate",
          "People who board at the student center after six",
          "People who get off at the first afternoon stop"
        ],
        "answer": 2,
        "reason": "The last sentence addresses riders who usually board at the student center after six."
      }
    ]
  },
  {
    "id": "talk-1",
    "kind": "Academic talk",
    "title": "How shade cools a street",
    "script": "A tree cools a street in two different ways. First, its leaves block sunlight, so the pavement below absorbs less energy. Second, water leaves the tree through tiny openings in its leaves. Some of the heat in the surrounding air goes into evaporating this water. The two effects do not always make equal contributions. A tree planted in a dry strip of soil can still provide shade, but it may release much less water on a hot afternoon. That is one reason researchers measure both surface temperature and air temperature when they compare streets.",
    "questions": [
      {
        "prompt": "What is the main point of the talk?",
        "choices": [
          "Pavement cools trees when the soil is dry.",
          "Trees can cool a street through shade and evaporation.",
          "Air temperature is always the same as pavement temperature.",
          "Researchers should measure every street at the same time."
        ],
        "answer": 1,
        "reason": "The talk introduces two cooling processes and explains why they can differ."
      },
      {
        "prompt": "Why does the speaker mention a tree in dry soil?",
        "choices": [
          "To show that shade can still work when evaporation is limited",
          "To suggest that dry soil makes pavement hotter than air",
          "To explain why trees lose their leaves on hot days",
          "To argue that surface temperatures are unreliable"
        ],
        "answer": 0,
        "reason": "The dry-soil example shows how the tree can block sunlight while releasing less water."
      }
    ]
  },
  {
    "id": "talk-2",
    "kind": "Academic talk",
    "title": "Seeing what a detector misses",
    "script": "When ecologists record bats at night, they often set up devices that detect high-frequency calls. A silent recording can seem to mean that no bats visited the site. But insects, rain, and the position of the microphone can affect whether the device picks up calls. Ecologists therefore compare recordings from several nights and, when possible, use a second method such as a thermal camera. The camera may show a bat flying past even when the sound detector misses it. The point is to distinguish where animals are absent from where the equipment simply failed to detect them.",
    "questions": [
      {
        "prompt": "What problem is the speaker explaining?",
        "choices": [
          "Thermal cameras interfere with bat calls.",
          "Rain always drives bats away from a site.",
          "A missing recording does not establish that bats were absent.",
          "Ecologists cannot compare observations from separate nights."
        ],
        "answer": 2,
        "reason": "The equipment can miss an animal that passed the site. The speaker distinguishes absence from a missed detection."
      },
      {
        "prompt": "Why might researchers use a thermal camera?",
        "choices": [
          "To record the sound of bat calls at a higher frequency",
          "To check for bats that the sound detector misses",
          "To keep the microphone dry",
          "To count insects around the microphone"
        ],
        "answer": 1,
        "reason": "The camera can register the bat’s presence using a signal other than sound."
      }
    ]
  },
  {
    "id": "reply-3",
    "kind": "Choose a response",
    "title": "Checking lab hours",
    "script": "Do you happen to know whether the computer lab stays open past eight on Thursdays?",
    "questions": [
      {
        "prompt": "Which reply best fits what you heard?",
        "choices": [
          "I think it closes at ten on weekdays, except Fridays.",
          "Yes, I opened the computer on Thursday morning.",
          "The lab computers were updated last semester.",
          "No, I already finished my assignment at eight."
        ],
        "answer": 0,
        "reason": "The speaker asks about Thursday evening closing hours. Choice A directly answers when the lab closes."
      }
    ]
  },
  {
    "id": "reply-4",
    "kind": "Choose a response",
    "title": "Sharing lecture slides",
    "script": "I missed the first ten minutes of today’s lecture because my bus was delayed. Could I copy your notes from the opening slides?",
    "questions": [
      {
        "prompt": "Which reply best fits what you heard?",
        "choices": [
          "The bus usually stops behind the library.",
          "Sure, I can send you photos of those pages right after class.",
          "Ten minutes is a very long lecture.",
          "Yes, I also forgot to bring my umbrella today."
        ],
        "answer": 1,
        "reason": "The speaker requests notes from the missed slides. Choice B agrees and offers a practical way to share them."
      }
    ]
  },
  {
    "id": "conversation-3",
    "kind": "Conversation",
    "title": "Reserving a recording booth",
    "script": "Student: Hi, I booked a sound booth for three o'clock, but my partner just told me she has a quiz until three thirty.\nStaff: Let me check the schedule. Booth B is free from three thirty to five, though someone already has it at five.\nStudent: An hour and a half is plenty. Should I cancel the three o'clock booking online?\nStaff: I can move your reservation right now so you don't get flagged for a no-show. Just remember to bring your student ID when you check in.",
    "questions": [
      {
        "prompt": "Why does the student want to change the reservation?",
        "choices": [
          "Booth B has better microphones than Booth A.",
          "The student's partner has a quiz that overlaps with the original time.",
          "The student forgot to bring a student ID card.",
          "The recording project will take longer than two hours."
        ],
        "answer": 1,
        "reason": "The student says her partner has a quiz until three thirty, conflicting with the three o'clock booking."
      },
      {
        "prompt": "Why does the staff member offer to move the booking immediately?",
        "choices": [
          "To prevent the student from being marked as a no-show",
          "Because the online booking website is closed for maintenance",
          "To give the student access to the booth after five o'clock",
          "Because student IDs are not accepted online"
        ],
        "answer": 0,
        "reason": "The staff member explicitly states moving it right away prevents a no-show flag."
      }
    ]
  },
  {
    "id": "conversation-4",
    "kind": "Conversation",
    "title": "Field trip reimbursement",
    "script": "Student: Professor Morales, I kept my train ticket from Saturday’s museum trip. Do I submit it to you for reimbursement?\nProfessor: Actually, the department office handles all student travel refunds this semester. You’ll need the itemized receipt rather than just the boarding pass.\nStudent: Good thing I kept the email confirmation with the price on it. Is there a deadline?\nProfessor: Turn it in by Friday afternoon. After that, the accounting office closes the month's budget and you’d have to wait until next month’s cycle.",
    "questions": [
      {
        "prompt": "What document does the department office require for a refund?",
        "choices": [
          "Only the paper boarding pass",
          "A signed note from the museum",
          "An itemized receipt showing the price",
          "A copy of the student's class schedule"
        ],
        "answer": 2,
        "reason": "The professor clarifies that the office needs the itemized receipt rather than just the boarding pass."
      },
      {
        "prompt": "What happens if the student submits the form after Friday afternoon?",
        "choices": [
          "The refund request will be permanently denied.",
          "The student will have to wait until next month's billing cycle.",
          "The professor will pay the fare directly.",
          "The student must retake the museum trip."
        ],
        "answer": 1,
        "reason": "The professor says the accounting office closes the monthly budget on Friday, pushing late claims to next month."
      }
    ]
  },
  {
    "id": "announcement-3",
    "kind": "Announcement",
    "title": "Chemistry lab locker clearance",
    "script": "Reminder to all undergraduate chemistry students: hall lockers in the Science Annex must be emptied by five o'clock this Wednesday so custodial staff can repaint the corridors over break. Please remove all lab coats, goggles, and notebooks before leaving. Any padlock still attached after Wednesday evening will be cut, and items found inside will be held in the stockroom for two weeks before being donated.",
    "questions": [
      {
        "prompt": "Why must students clear out their Science Annex lockers by Wednesday?",
        "choices": [
          "The building is installing digital locks.",
          "Custodial staff are repainting the corridors during break.",
          "The chemistry department is moving to a new campus.",
          "Students are switching lab sections next week."
        ],
        "answer": 1,
        "reason": "The announcement states lockers must be emptied so custodial staff can repaint the corridors over break."
      },
      {
        "prompt": "What will happen to items left in a locked locker after Wednesday evening?",
        "choices": [
          "They will be mailed to students' home addresses.",
          "They will remain locked until classes resume.",
          "The padlock will be cut and items held in the stockroom for two weeks.",
          "They will be discarded immediately on Thursday morning."
        ],
        "answer": 2,
        "reason": "Remaining padlocks will be cut and contents stored in the stockroom for two weeks before donation."
      }
    ]
  },
  {
    "id": "announcement-4",
    "kind": "Announcement",
    "title": "Writing center exam-week hours",
    "script": "Attention students preparing final papers: during exam week, the Campus Writing Center will shift from fifty-minute appointments to focused twenty-five-minute review sessions so more students can be seen. Drop-in tables will also open in the main library lobby every evening from six to nine. Please bring a printed or downloaded draft, as tutors will not have time to help brainstorm topics from scratch during exam week.",
    "questions": [
      {
        "prompt": "How is the Writing Center changing its appointments during exam week?",
        "choices": [
          "It is closing all evening sessions.",
          "It is shortening sessions to twenty-five minutes to serve more students.",
          "It is moving permanently to the library lobby.",
          "It is accepting only group paper submissions."
        ],
        "answer": 1,
        "reason": "Sessions shift from fifty minutes to twenty-five minutes so more students can get feedback."
      },
      {
        "prompt": "What are students asked to bring to an exam-week session?",
        "choices": [
          "A list of possible essay topics to brainstorm",
          "A printed or downloaded draft of their paper",
          "A letter of approval from their instructor",
          "Two copies of their course syllabus"
        ],
        "answer": 1,
        "reason": "The announcement says to bring a printed or downloaded draft because tutors cannot brainstorm from scratch that week."
      }
    ]
  },
  {
    "id": "talk-3",
    "kind": "Academic talk",
    "title": "Why bridges have expansion joints",
    "script": "When drivers cross a long steel bridge, they often hear a rhythmic thump every few seconds. Those small metal gaps in the roadway are called expansion joints, and they solve a basic physics problem. Steel and concrete expand on hot summer afternoons and contract during freezing winter nights. Across a kilometer-long bridge, that seasonal shift can add up to more than half a meter of movement. Without expansion joints to absorb the change, internal stress would buckle the road deck or crack the supporting piers. The brief noise drivers hear is actually the sound of a structure staying intact.",
    "questions": [
      {
        "prompt": "What is the main purpose of expansion joints on a bridge?",
        "choices": [
          "To slow down heavy trucks during winter storms",
          "To allow bridge materials to expand and contract safely with temperature changes",
          "To drain rainwater off the roadway faster",
          "To reduce the amount of steel needed during construction"
        ],
        "answer": 1,
        "reason": "Expansion joints absorb seasonal expansion and contraction so thermal stress does not buckle or crack the bridge."
      },
      {
        "prompt": "Why does the speaker mention 'more than half a meter of movement'?",
        "choices": [
          "To show how large thermal expansion becomes across a long span",
          "To criticize bridges built out of concrete",
          "To warn drivers about uneven pavement",
          "To explain how wide each traffic lane must be"
        ],
        "answer": 0,
        "reason": "Quantifying the shift across a kilometer demonstrates why rigid construction would fail without joints."
      }
    ]
  },
  {
    "id": "talk-4",
    "kind": "Academic talk",
    "title": "How sleep consolidates memory",
    "script": "Students often pull an all-nighter before an exam assuming extra study hours always equal better recall. Neuroscience experiments tell a different story. During deep slow-wave sleep, the brain replays neural patterns formed earlier in the day, transferring fragile short-term traces from the hippocampus into more stable cortical networks. In one study, two groups learned identical word lists, but only the group allowed a full night of sleep retained the pairs a week later. Even a brief nap improved recall compared with staying awake. Studying introduces information, yet sleep is what stabilizes it for retrieval.",
    "questions": [
      {
        "prompt": "What happens during slow-wave sleep according to the speaker?",
        "choices": [
          "The brain erases all word lists learned earlier in the day.",
          "Recent memory patterns are replayed and stabilized in cortical networks.",
          "The hippocampus stops communicating with the rest of the brain.",
          "Students learn brand-new vocabulary without studying."
        ],
        "answer": 1,
        "reason": "The talk explains that slow-wave sleep replays neural patterns and moves fragile traces into stable cortical networks."
      },
      {
        "prompt": "What is the speaker's attitude toward staying awake all night to study?",
        "choices": [
          "It is effective as long as students drink coffee.",
          "It overlooks sleep's essential role in stabilizing long-term memory.",
          "It works better for word lists than for math problems.",
          "It produces the same results as taking a brief nap."
        ],
        "answer": 1,
        "reason": "The speaker contrasts the all-nighter assumption with evidence that sleep is required to stabilize recall."
      }
    ]
  },
  {
    "id": "conversation-5",
    "kind": "Conversation",
    "title": "Requesting a Deadline Extension",
    "script": "Student: Professor Chen, do you have a moment? I wanted to ask about the research paper that's due on Friday.\n\nProfessor: Sure, come in. What's on your mind?\n\nStudent: Well, I've been working on it steadily, but I've had trouble finding enough sources for my argument about renewable energy policy. The library's database was down for two days last week.\n\nProfessor: I see. That's frustrating. How far along are you with the paper?\n\nStudent: I have my outline and about half the paper written. I just need more time to find credible sources and incorporate them properly. I don't want to submit something that isn't well-supported.\n\nProfessor: I appreciate that you're taking the research seriously. I can give you until Monday, but I should mention that there will be a five-percent penalty for late submissions according to the syllabus. However, given the database issue, I'll waive that this time.\n\nStudent: Thank you so much. That makes a big difference. I'll make sure to use at least the eight peer-reviewed sources you recommended.\n\nProfessor: Good. And one more thing - have you tried the interlibrary loan system? If our database doesn't have what you need, you can request articles from other universities. It usually takes about twenty-four hours.",
    "questions": [
      {
        "prompt": "Why does the student visit the professor?",
        "choices": [
          "To submit his paper early",
          "To request more time for an assignment",
          "To ask about the grading rubric",
          "To discuss his thesis topic"
        ],
        "answer": 1,
        "reason": "The student says he wants to ask about the paper due Friday and explains he needs more time to find credible sources."
      },
      {
        "prompt": "What reason does the student give for needing more time?",
        "choices": [
          "He was sick last week",
          "He had too many other assignments",
          "The library database was unavailable",
          "He changed his topic"
        ],
        "answer": 2,
        "reason": "He states that the library's database was down for two days last week."
      },
      {
        "prompt": "What does the professor offer?",
        "choices": [
          "A new topic",
          "An extension until Monday without penalty",
          "Extra credit",
          "Help finding sources"
        ],
        "answer": 1,
        "reason": "She offers until Monday and says she will waive the five-percent late penalty because of the database issue."
      }
    ]
  },
  {
    "id": "conversation-6",
    "kind": "Conversation",
    "title": "Housing Assignment Mix-Up",
    "script": "Student: Hi, I'm having an issue with my housing assignment for next semester. The system shows me in a triple room in Morrison Hall, but I applied and was approved for a single room in Greenfield.\n\nAdvisor: Let me pull up your file. What's your student ID?\n\nStudent: It's seven four two one eight zero. I have the confirmation email right here on my phone if you need to see it.\n\nAdvisor: I see. So your original application was indeed for a single in Greenfield, and it was approved in March. But it looks like when the system migrated to the new software in April, several assignments were shuffled. You're not the only one affected.\n\nStudent: That's concerning. Is there a way to fix it? I specifically chose a single because I'm a graduate student and I need quiet for my research.\n\nAdvisor: Absolutely. I'll file a correction request today. The original approval takes priority. In the meantime, I'd recommend also emailing Doctor Patterson in graduate housing - she's been handling these migration cases directly and can sometimes expedite things.\n\nStudent: Great. How long does the correction usually take?\n\nAdvisor: Typically five to seven business days, but with the email to Doctor Patterson, it could be faster. I'll also flag your case as urgent since it involves a graduate student accommodation.",
    "questions": [
      {
        "prompt": "What is the student's problem?",
        "choices": [
          "She was assigned to the wrong building and room type",
          "Her housing application was rejected",
          "She wants to change roommates",
          "Her room has maintenance issues"
        ],
        "answer": 0,
        "reason": "She was approved for a single room in Greenfield but the system shows a triple room in Morrison Hall."
      },
      {
        "prompt": "What caused the assignment error?",
        "choices": [
          "The student submitted the wrong form",
          "A software migration shuffled assignments",
          "The room was already taken",
          "Budget cuts reduced available rooms"
        ],
        "answer": 1,
        "reason": "The advisor explains that when the system migrated to new software in April, several assignments were shuffled."
      },
      {
        "prompt": "Why does the student need a single room?",
        "choices": [
          "She has a medical condition",
          "She is a resident advisor",
          "She needs quiet for graduate research",
          "She doesn't get along with roommates"
        ],
        "answer": 2,
        "reason": "The student says she chose a single because she is a graduate student who needs quiet for her research."
      }
    ]
  },
  {
    "id": "conversation-7",
    "kind": "Conversation",
    "title": "Student Discusses Thesis Proposal with Advisor",
    "script": "Student: Hi, Dr. Martinez? I'm Emily Chen. I had an appointment about my thesis proposal?\n\nAdvisor: Oh yes, Emily, come in. I've looked over your proposal. It's promising — your topic on migratory bird adaptation to urban environments is well-chosen. But I have some concerns about your methodology section.\n\nStudent: Really? I thought including both field observation and GPS tracking would make it stronger.\n\nAdvisor: The combination is good, actually. My concern is the sample size. Twenty birds per species is going to be quite limiting for the statistical analysis you're proposing.\n\nStudent: How many would you recommend?\n\nAdvisor: For the confidence intervals you're targeting, you'd ideally want at least forty per species. I know that sounds like a lot more work.\n\nStudent: That would add at least two more months of fieldwork. Would there be funding to cover that?\n\nAdvisor: That's something you should discuss with the biology department directly. They have a small grants program specifically for thesis research. Dr. Patel is coordinating it this semester.\n\nStudent: Okay. Should I also revise the methodology section before I submit formally?\n\nAdvisor: Yes, please rewrite that section with the revised sample size justification. And I'd like you to add a paragraph addressing potential confounding variables — things like the urban heat island effect that might affect your bird behavior data independently of what you're studying.\n\nStudent: The urban heat island — right, I hadn't thought about controlling for that. That's a good point.\n\nAdvisor: It'll strengthen your proposal considerably. Submit the revision by the end of next week, and I should be able to sign off on it fairly quickly after that.",
    "questions": [
      {
        "prompt": "Why did the student meet with the advisor?",
        "choices": [
          "To discuss a problem with her GPS tracking equipment",
          "To get feedback on her thesis proposal",
          "To request funding for her research",
          "To change her thesis topic"
        ],
        "answer": 1,
        "reason": "Supported directly by the recording: To get feedback on her thesis proposal"
      },
      {
        "prompt": "What is the advisor's main concern about the student's proposal?",
        "choices": [
          "The topic is not original enough",
          "The combination of field methods is inappropriate",
          "The sample size is too small for the planned analysis",
          "The research will take too long to complete"
        ],
        "answer": 2,
        "reason": "Supported directly by the recording: The sample size is too small for the planned analysis"
      },
      {
        "prompt": "What additional element does the advisor ask the student to include in the methodology section?",
        "choices": [
          "A discussion of GPS tracking limitations",
          "A paragraph addressing potential confounding variables",
          "A comparison with previous bird migration studies",
          "A section on ethical considerations"
        ],
        "answer": 1,
        "reason": "Supported directly by the recording: A paragraph addressing potential confounding variables"
      }
    ]
  },
  {
    "id": "conversation-8",
    "kind": "Conversation",
    "title": "Student Asks About Research Database Access",
    "script": "Student: Excuse me, I was told the library has access to the JSTOR database, but I can't seem to find it on the website.\n\nLibrarian: Sure, it's there — it's listed under the 'Research Databases' tab on the main library page, not under 'Journals.' A lot of students miss it. What are you researching?\n\nStudent: I'm writing a paper on urban planning history for my architecture class. I need sources going back to at least the 1970s.\n\nLibrarian: JSTOR is perfect for that — it has an excellent archive of planning and architecture journals. You should also look at the Avery Index; it's specifically designed for architecture and design literature.\n\nStudent: Is the Avery Index also through the library?\n\nLibrarian: Yes, it's listed right below JSTOR in the database list. Now, one thing about JSTOR — and this trips up a lot of students — is that the most recent three to five years of most journals are embargoed. So if you need very recent articles, you'll need to use a different database, like Web of Science or Scopus, for anything published in the last few years.\n\nStudent: Oh, I didn't realize that. My professor said I need at least three sources from the last decade.\n\nLibrarian: In that case, I'd recommend combining JSTOR for historical sources with Web of Science for more recent work. And if you find a citation you can't access, just submit an interlibrary loan request — we can usually get articles within two to three days.\n\nStudent: That's really helpful. How do I access these from off campus? I usually study at home.\n\nLibrarian: You'll need to log in through our VPN using your student ID. There's a link on the library homepage labeled 'Off-Campus Access.' Once you're connected, all the databases work exactly the same as on campus.",
    "questions": [
      {
        "prompt": "What is the student's main reason for visiting the library?",
        "choices": [
          "To borrow books on architecture",
          "To find out how to access a research database",
          "To submit an interlibrary loan request",
          "To get help with her paper outline"
        ],
        "answer": 1,
        "reason": "Supported directly by the recording: To find out how to access a research database"
      },
      {
        "prompt": "Why does the librarian recommend the Avery Index in addition to JSTOR?",
        "choices": [
          "It has no embargo restrictions on recent articles",
          "It is specifically designed for architecture and design literature",
          "It provides free access to all journals since the 1970s",
          "It is easier to use than JSTOR"
        ],
        "answer": 1,
        "reason": "Supported directly by the recording: It is specifically designed for architecture and design literature"
      },
      {
        "prompt": "What limitation does the librarian mention about JSTOR?",
        "choices": [
          "It only covers journals published before 1990",
          "It requires a special password to access off campus",
          "The most recent three to five years of most journals are embargoed",
          "It cannot be used for architecture research"
        ],
        "answer": 2,
        "reason": "Supported directly by the recording: The most recent three to five years of most journals are embargoed"
      }
    ]
  },
  {
    "id": "talk-5",
    "kind": "Academic talk",
    "title": "Announcement: Lab Safety Training Requirement",
    "script": "Attention all students enrolled in laboratory courses for the fall semester. This is a reminder that completion of the online lab safety training module is mandatory before you can attend your first lab session. The training covers proper handling of chemicals, emergency procedures, and equipment protocols. It takes approximately forty-five minutes to complete. The deadline to finish the training is September fifth. Students who have not completed it by that date will be temporarily dropped from their lab section and must re-enroll once certified. To access the module, log into the student portal and navigate to the Safety Training tab under Academic Services. If you completed lab safety training last year, please note that certification expires annually and you must retake it. For questions, contact the Office of Environmental Health and Safety.",
    "questions": [
      {
        "prompt": "What is the purpose of this announcement?",
        "choices": [
          "To announce a new lab course",
          "To remind students about mandatory safety training",
          "To introduce a new safety officer",
          "To describe lab equipment"
        ],
        "answer": 1,
        "reason": "The announcer opens with a reminder that the online lab safety training is mandatory before the first lab session."
      },
      {
        "prompt": "What happens if a student misses the deadline?",
        "choices": [
          "They receive a warning",
          "They must pay a fee",
          "They are dropped from their lab section",
          "They fail the course"
        ],
        "answer": 2,
        "reason": "Students who have not completed the training by September fifth are temporarily dropped from their lab section."
      },
      {
        "prompt": "How long does the training take?",
        "choices": [
          "Thirty minutes",
          "Forty-five minutes",
          "One hour",
          "Two hours"
        ],
        "answer": 1,
        "reason": "The announcement says the training takes approximately forty-five minutes."
      }
    ]
  },
  {
    "id": "talk-6",
    "kind": "Academic talk",
    "title": "Neuroplasticity and Language Acquisition",
    "script": "Professor: So, last time we discussed the critical period hypothesis, the idea that there's a window during childhood when language acquisition happens most naturally.\n\nToday I want to complicate that picture a bit by talking about neuroplasticity. Neuroplasticity refers to the brain's ability to reorganize itself by forming new neural connections throughout life.\n\nNow, the traditional view, championed by Lenneberg in the nineteen sixties, held that after puberty, the brain loses much of its capacity to acquire language natively. And there's evidence for this - think of the difficulty most adults have achieving native-like pronunciation in a second language.\n\nBut recent research has challenged the absoluteness of this view. A twenty twenty-two study by Hartshorne and colleagues analyzed data from nearly seven hundred thousand English learners and found that while the critical period for achieving native-level grammar does end around seventeen or eighteen, the decline is gradual, not a cliff.\n\nMoreover, neuroimaging studies show that adult language learners can develop neural pathways that closely resemble those of native speakers, especially with intensive immersion. The key factor isn't age per se - it's the quantity and quality of input.\n\nThis has practical implications for language education. Programs that emphasize immersive, contextual learning tend to produce better outcomes than grammar-translation methods, even for adult learners. In our next class, we'll look at specific case studies of successful late language acquisition and what they tell us about optimal learning strategies.",
    "questions": [
      {
        "prompt": "What is the main topic of this lecture?",
        "choices": [
          "Why children learn languages better than adults",
          "How neuroplasticity challenges traditional views on language learning age limits",
          "The history of neuroscience research",
          "Methods for teaching grammar to adults"
        ],
        "answer": 1,
        "reason": "The professor introduces neuroplasticity to complicate the critical period hypothesis and shows adults can still develop native-like pathways."
      },
      {
        "prompt": "According to the study mentioned, when does the critical period for native-level grammar end?",
        "choices": [
          "Around age ten",
          "At puberty",
          "Around seventeen or eighteen",
          "It never ends"
        ],
        "answer": 2,
        "reason": "The professor says the 2022 study found the period ends around seventeen or eighteen, with a gradual decline."
      },
      {
        "prompt": "What factor does the professor identify as most important for adult language acquisition?",
        "choices": [
          "Starting age",
          "Natural talent",
          "Quantity and quality of input",
          "Grammar instruction"
        ],
        "answer": 2,
        "reason": "He states that the key factor isn't age per se but the quantity and quality of input."
      }
    ]
  },
  {
    "id": "talk-7",
    "kind": "Academic talk",
    "title": "Ocean Acidification and Marine Ecosystems",
    "script": "Professor: Today I want to talk about ocean acidification — a process that's sometimes called climate change's 'evil twin,' because it's driven by the same culprit, carbon dioxide, but through a completely different mechanism.\n\nHere's the basic chemistry. When carbon dioxide from the atmosphere dissolves in seawater, it reacts with water molecules to form carbonic acid. Carbonic acid then partially dissociates, releasing hydrogen ions. More hydrogen ions in the water means lower pH — which is to say, more acidic water. Since the Industrial Revolution, the average pH of the world's oceans has dropped from about 8.2 to 8.1. That might sound tiny, but pH is a logarithmic scale, so that 0.1 unit drop actually represents a 26 percent increase in acidity.\n\nNow, why does this matter for marine ecosystems? The most immediate concern involves calcifying organisms — creatures that build shells or skeletons from calcium carbonate. This group includes corals, oysters, mussels, sea urchins, and many species of plankton. In more acidic water, calcium carbonate dissolves more easily, making it harder and more energetically costly for these organisms to build and maintain their structures. In extreme cases, shells can actually begin to dissolve.\n\nThe effects cascade up the food chain. Calcifying plankton species like pteropods and foraminifera are foundational to many marine food webs. If their populations decline, the fish and marine mammals that depend on them are affected. And of course, this has implications for fisheries and human food security.\n\nCoral reefs are perhaps the most visually dramatic example of the threat. Coral polyps build their calcium carbonate skeletons in a process that becomes energetically unsustainable as acidification increases. Combined with the thermal stress from rising ocean temperatures — which causes coral bleaching — acidification represents a compounding threat to reef ecosystems that harbor roughly 25 percent of all marine species.\n\nI should note that the rate of current acidification is faster than anything in the geological record over the past 300 million years, with the possible exception of the mass extinction event at the end of the Permian period. Some marine organisms have adapted to pH changes over millions of years of gradual change — but the pace of current change may simply be too fast for evolutionary adaptation to keep pace.",
    "questions": [
      {
        "prompt": "Why does the professor call ocean acidification climate change's \"evil twin\"?",
        "choices": [
          "Because it causes the same damage to land ecosystems as climate change does",
          "Because it is driven by the same cause but works through a different mechanism",
          "Because it is more dangerous than climate change",
          "Because it was discovered at the same time as climate change"
        ],
        "answer": 1,
        "reason": "Supported directly by the recording: Because it is driven by the same cause but works through a different mechanism"
      },
      {
        "prompt": "According to the lecture, what does a 0.1 drop in ocean pH actually represent?",
        "choices": [
          "A 0.1 percent increase in acidity",
          "A 10 percent increase in acidity",
          "A 26 percent increase in acidity",
          "A doubling of ocean acidity"
        ],
        "answer": 2,
        "reason": "Supported directly by the recording: A 26 percent increase in acidity"
      },
      {
        "prompt": "Which organisms does the professor identify as most immediately affected by ocean acidification?",
        "choices": [
          "Large marine mammals such as whales and dolphins",
          "Deep-sea fish that live near hydrothermal vents",
          "Calcifying organisms that build shells from calcium carbonate",
          "Photosynthetic algae on the ocean surface"
        ],
        "answer": 2,
        "reason": "Supported directly by the recording: Calcifying organisms that build shells from calcium carbonate"
      }
    ]
  },
  {
    "id": "talk-8",
    "kind": "Academic talk",
    "title": "Marine Biology — Coral Reef Symbiosis and Thermal Bleaching",
    "script": "Professor: Today we're moving into marine ecosystems, and I want to focus on coral reefs — specifically, the paradoxical fact that coral reefs are among the most biodiverse and productive ecosystems on Earth, yet they thrive in tropical waters that are essentially marine deserts, containing very low concentrations of dissolved nutrients like nitrogen and phosphorus.\n\nHow do corals pull this off? The secret is an obligate mutualistic symbiosis between the coral polyp — which is a tiny invertebrate animal related to jellyfish — and microscopic photosynthetic algae called zooxanthellae that live inside the coral's own tissue cells. Here's how the partnership works: the coral animal provides the algae with a protected environment and compounds they need for photosynthesis, mainly carbon dioxide and metabolic waste products like ammonia. In return, the zooxanthellae photosynthesize using sunlight and transfer up to 90 percent of the organic carbon they produce — sugars, glycerol, and amino acids — directly back to the host coral. This internal nutrient recycling is so tight and efficient that almost nothing is lost to the surrounding water, allowing massive calcium carbonate reef structures to grow in nutrient-poor seas.\n\nHowever, this finely tuned partnership has an Achilles' heel: temperature sensitivity. When ocean temperatures rise even one to two degrees Celsius above the normal summer maximum for a prolonged period, the photosynthetic machinery inside the zooxanthellae breaks down. Instead of producing harmless oxygen and sugars, the stressed algae begin generating toxic reactive oxygen species — free radicals — that damage the coral's cells. In self-defense, the coral expels the algae from its tissues. Without the pigmented algae, the coral's white calcium carbonate skeleton becomes visible through its transparent tissue — a phenomenon we call coral bleaching.\n\nNow, a common misconception is that a bleached coral is already dead. It's not! A bleached coral is alive, but it is starving, because it has lost 90 percent of its energy supply. If water temperatures drop back to normal within a few weeks, the coral can acquire new zooxanthellae from the water column and recover. Even more fascinating, marine biologists have recently discovered what they call the 'adaptive bleaching hypothesis': some corals recover by taking up a different strain — or clade — of zooxanthellae that is naturally more heat-tolerant than the original strain, effectively upgrading their thermal resilience for future heatwaves.",
    "questions": [
      {
        "prompt": "What is the main purpose of the lecture?",
        "choices": [
          "To explain the symbiotic relationship that sustains coral reefs and how thermal stress disrupts it",
          "To compare the biodiversity of tropical coral reefs with that of deep-sea hydrothermal vents",
          "To argue that all bleached coral reefs around the world are permanently dead",
          "To describe the evolutionary history of jellyfish and other marine invertebrates"
        ],
        "answer": 0,
        "reason": "The lecture explains how coral reefs thrive in nutrient-poor waters through symbiosis with zooxanthellae, and how rising ocean temperatures disrupt this symbiosis to cause coral bleaching and potential recovery."
      },
      {
        "prompt": "According to the professor, why does a coral polyp expel its zooxanthellae during periods of high water temperature?",
        "choices": [
          "The heat-stressed algae begin producing toxic reactive oxygen species that damage the coral's cells",
          "The algae consume all of the coral's calcium carbonate skeleton when water warms",
          "The coral needs to make room inside its tissues for cooler water to circulate",
          "The zooxanthellae die immediately upon contact with warm water and dissolve"
        ],
        "answer": 0,
        "reason": "The professor states that when ocean temperatures rise 1–2°C above normal summer maximums, the zooxanthellae's photosynthetic machinery breaks down and begins producing toxic reactive oxygen species (free radicals) that damage coral cells, prompting the coral to expel them."
      },
      {
        "prompt": "Why does the professor refer to tropical waters as 'essentially marine deserts'?",
        "choices": [
          "To emphasize the paradox that highly productive coral reefs thrive in waters with very low nutrient levels",
          "To explain why very few species of fish are able to survive near tropical coastlines",
          "To illustrate that tropical oceans receive less annual rainfall than temperate oceans",
          "To show that sand from terrestrial deserts frequently blows into tropical seas"
        ],
        "answer": 0,
        "reason": "The professor calls tropical waters 'essentially marine deserts' to highlight the paradox of Darwin's coral reef problem: how an extraordinarily productive, biodiverse ecosystem can flourish in water with almost no dissolved nutrients."
      }
    ]
  }
];
