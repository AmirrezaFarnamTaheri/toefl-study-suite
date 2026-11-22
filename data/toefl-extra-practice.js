// Additional TOEFL 2026 Reading Passages (Daily Life + Academic) and Build-a-Sentence Grammar Drills
const TOEFL_EXTRA_PRACTICE = {
  readingPassages: [
    {
      id: "rp-extra-notice-1",
      kind: "Read in Daily Life",
      title: "Student Health Clinic Walk-In Policy Update",
      text: "CAMPUS HEALTH SERVICES - SPRING UPDATE\nStarting February 3, same-day walk-in appointments for minor illnesses will be offered Monday through Thursday from 8:30 AM to 11:30 AM only. Afternoon slots (1:00 PM to 4:30 PM) are reserved for scheduled follow-ups, travel vaccinations, and lab blood draws. Students needing urgent care after 4:30 PM should call the 24-hour nurse advice line before visiting the regional hospital. Bring your student ID and health insurance card to every visit; paper copies are not accepted.",
      questions: [
        {
          q: "When can a student walk in without an appointment for a minor illness?",
          choices: [
            "Friday mornings between 8:30 AM and 11:30 AM",
            "Monday through Thursday mornings between 8:30 AM and 11:30 AM",
            "Any weekday afternoon between 1:00 PM and 4:30 PM",
            "After 4:30 PM at the clinic front desk"
          ],
          answer: "Monday through Thursday mornings between 8:30 AM and 11:30 AM",
          explanation: "Sentence 1 states walk-in appointments are offered Monday through Thursday from 8:30 AM to 11:30 AM only."
        },
        {
          q: "What are afternoon clinic slots reserved for?",
          choices: [
            "Walk-in minor illnesses",
            "24-hour nurse advice calls",
            "Scheduled follow-ups, travel vaccinations, and lab blood draws",
            "Issuing replacement student ID cards"
          ],
          answer: "Scheduled follow-ups, travel vaccinations, and lab blood draws",
          explanation: "Sentence 2 lists scheduled follow-ups, travel vaccinations, and lab blood draws for 1:00 PM to 4:30 PM."
        },
        {
          q: "Which item will NOT be accepted at check-in?",
          choices: [
            "A physical student ID",
            "An original insurance card",
            "A paper photocopy of an insurance card",
            "A confirmed afternoon appointment"
          ],
          answer: "A paper photocopy of an insurance card",
          explanation: "The final sentence specifies that paper copies are not accepted."
        }
      ]
    },
    {
      id: "rp-extra-syllabus-2",
      kind: "Read in Daily Life",
      title: "Environmental Science 201 - Field Report Guidelines",
      text: "COURSE PAGE: ENV 201 - LAB & FIELD REPORT RULES\nEach student will submit three short water-sampling reports (15% each) and one group presentation (20%) during the term. Field reports are due on the course portal by 11:59 PM on the Sunday following each lab trip. Late reports lose 5 percentage points per calendar day and are not accepted after three days unless an extension was requested at least 24 hours before the deadline. Raw sensor spreadsheets must be uploaded as a separate attachment alongside the PDF report.",
      questions: [
        {
          q: "How much of the course grade do the three field reports represent in total?",
          choices: ["15%", "20%", "35%", "45%"],
          answer: "45%",
          explanation: "Sentence 1 states there are three reports worth 15% each (3 x 15% = 45%)."
        },
        {
          q: "When can a student submit a report four days late and still receive credit?",
          choices: [
            "Whenever the student accepts a 20-point deduction",
            "Only if the student requested an extension at least 24 hours before the deadline",
            "If the student uploads the PDF without the raw sensor spreadsheet",
            "Never, under any circumstances"
          ],
          answer: "Only if the student requested an extension at least 24 hours before the deadline",
          explanation: "Sentence 3 states late reports are not accepted after three days unless an extension was requested at least 24 hours ahead."
        },
        {
          q: "What must accompany every PDF field report upload?",
          choices: [
            "Slides from the group presentation",
            "A separate raw sensor spreadsheet attachment",
            "A printed receipt from the science lab",
            "Peer reviews from two classmates"
          ],
          answer: "A separate raw sensor spreadsheet attachment",
          explanation: "The final sentence requires raw sensor spreadsheets to be uploaded as a separate attachment."
        }
      ]
    },
    {
      id: "rp-extra-thread-3",
      kind: "Read in Daily Life",
      title: "Message Thread: Robotics Club Workshop Setup",
      text: "Nadia (9:12 AM): Hey everyone, our Saturday soldering workshop has 28 sign-ups, which is 8 more than the benches in Room 105 can fit.\nDevon (9:18 AM): Good catch. I checked the engineering calendar and Room 210 is open all Saturday morning. It has 32 seats, though it does not have built-in fume extractors.\nNadia (9:22 AM): We can wheel the four portable extractor units up from the basement storage closet on Friday afternoon. Devon, can you reserve Room 210 today?\nDevon (9:25 AM): Already submitted the request. Once facilities approves it, I will update the sign-up page and email everyone the new room number.",
      questions: [
        {
          q: "Why does the club need to move out of Room 105?",
          choices: [
            "Room 105 has broken fume extractors.",
            "More students signed up than Room 105 can seat.",
            "Room 105 is booked by another club on Saturday.",
            "The basement storage closet is locked on Saturday."
          ],
          answer: "More students signed up than Room 105 can seat.",
          explanation: "Nadia's first message says 28 people signed up, which is 8 more than Room 105's benches fit (capacity 20)."
        },
        {
          q: "How does Nadia plan to address the limitation of Room 210?",
          choices: [
            "By capping workshop attendance at 20 students",
            "By moving four portable fume extractors from basement storage on Friday afternoon",
            "By canceling the soldering portion of the workshop",
            "By holding the workshop outdoors"
          ],
          answer: "By moving four portable fume extractors from basement storage on Friday afternoon",
          explanation: "In her 9:22 AM message, Nadia proposes wheeling up four portable extractor units from basement storage."
        },
        {
          q: "What will Devon do after facilities approves the room change?",
          choices: [
            "Order 8 new soldering irons",
            "Move the portable extractors on Friday morning",
            "Update the sign-up page and email attendees the new room number",
            "Ask Nadia to cancel the Room 105 booking"
          ],
          answer: "Update the sign-up page and email attendees the new room number",
          explanation: "Devon's final message states he will update the sign-up page and email everyone once facilities approves."
        }
      ]
    },
    {
      id: "rp-extra-schedule-4",
      kind: "Read in Daily Life",
      title: "Campus Bike Share Maintenance Schedule",
      text: "CAMPUS MOBILITY NOTICE - AUTUMN BIKE SHARE CHECKS\nDuring the week of October 14, mechanics will inspect all 120 campus bike-share bicycles in three rotating zones so most riders keep access each day. Zone A (North Dorms and Library) racks will be offline Monday; Zone B (Science Quad and Dining Hall) will be offline Tuesday; Zone C (Athletics Center and South Gate) will be offline Wednesday. Any bicycle checked out before 7:00 AM on a zone's maintenance day may still be returned to an active zone without a late fee. Standard 45-minute ride limits remain unchanged.",
      questions: [
        {
          q: "Why are the bike racks being closed one zone per day instead of all at once?",
          choices: [
            "Mechanics only have tools for 40 bikes.",
            "So most riders keep access to bicycles throughout the week.",
            "Because South Gate is closed on Mondays.",
            "To extend the standard 45-minute ride limit."
          ],
          answer: "So most riders keep access to bicycles throughout the week.",
          explanation: "Sentence 1 states inspections rotate across three zones so most riders keep access each day."
        },
        {
          q: "Where should a rider return a Zone B bike checked out at 6:45 AM on Tuesday?",
          choices: [
            "To the Science Quad rack only",
            "To an active rack in Zone A or Zone C without a late fee",
            "To the campus police office",
            "Keep it until Wednesday morning"
          ],
          answer: "To an active rack in Zone A or Zone C without a late fee",
          explanation: "Sentence 3 explains bikes checked out before 7:00 AM on a maintenance day can be returned to any active zone without a late fee."
        }
      ]
    },
    {
      id: "rp-extra-acad-5",
      kind: "Academic Passage",
      title: "Native Bees in Urban Pocket Gardens",
      text: "Cities are often assumed to be biological deserts for pollinators, yet recent surveys across European and North American neighborhoods have recorded surprisingly high numbers of solitary native bee species. Unlike managed honeybees, which live in large perennial colonies and can forage several kilometers from a hive, most native bees are solitary nesters that travel only a few hundred meters. Consequently, small pocket gardens, flowering balcony boxes, and unmown roadside strips can sustain diverse local populations provided blooms appear from early spring through late autumn. Researchers caution, however, that floral variety alone is insufficient: native bees also require bare patches of soil or hollow plant stems for nesting. Parks that cover every square meter with thick wood-chip mulch inadvertently block ground-nesting bees even when flowers are plentiful.",
      questions: [
        {
          q: "Why do small pocket gardens matter especially for solitary native bees compared with honeybees?",
          choices: [
            "Native bees prefer balcony boxes over natural meadows.",
            "Native bees forage over much shorter distances than honeybees.",
            "Honeybees cannot digest nectar from urban flowers.",
            "Native bees live in larger perennial colonies than honeybees."
          ],
          answer: "Native bees forage over much shorter distances than honeybees.",
          explanation: "Sentence 2 contrasts honeybees (foraging several kilometers) with solitary native bees (traveling only a few hundred meters)."
        },
        {
          q: "Why does the author mention parks covered entirely with thick wood-chip mulch?",
          choices: [
            "To show that mulch helps flowers bloom from spring through autumn",
            "To argue that cities should replace native bees with managed honeybees",
            "To illustrate how well-meaning landscaping can remove nesting sites even when flowers exist",
            "To prove that wood chips attract harmful predators"
          ],
          answer: "To illustrate how well-meaning landscaping can remove nesting sites even when flowers exist",
          explanation: "The last two sentences explain that floral variety alone is insufficient because thick mulch blocks ground-nesting bees from bare soil."
        },
        {
          q: "What can be inferred about a neighborhood garden that blooms only in July?",
          choices: [
            "It is ideal for sustaining native bees year-round.",
            "It leaves seasonal food gaps that limit its value for native bee populations.",
            "It eliminates the need for hollow stems or bare soil.",
            "It attracts honeybees exclusively."
          ],
          answer: "It leaves seasonal food gaps that limit its value for native bee populations.",
          explanation: "Sentence 3 states pocket gardens sustain diverse populations provided blooms appear from early spring through late autumn."
        }
      ]
    },
    {
      id: "rp-extra-acad-6",
      kind: "Academic Passage",
      title: "Self-Healing Chemistry in Ancient Roman Concrete",
      text: "Many modern concrete piers exposed to seawater begin cracking and corroding within decades, whereas numerous Roman harbor breakwaters have endured pounding waves for two thousand years. Materials scientists long credited volcanic ash from the Bay of Naples, known as pozzolana, for giving Roman mortar unusual strength. Closer microscopic imaging recently revealed a second crucial ingredient: tiny millimeter-scale white flecks called lime clasts. Earlier scholars dismissed these clasts as signs of sloppy mixing, yet chemical analysis shows Roman builders intentionally used hot quicklime rather than fully slaked lime. When microscopic cracks later form and rainwater or seawater seeps in, the reactive lime clasts dissolve and recrystallize as calcium carbonate, sealing the fissures before they widen. Engineers are now adapting this hot-mixing principle to extend the service life of modern low-carbon concretes.",
      questions: [
        {
          q: "How has scholars' interpretation of lime clasts in Roman concrete changed?",
          choices: [
            "They are now seen as accidental volcanic ash rather than lime.",
            "Once dismissed as sloppy mixing, they are now recognized as an intentional self-healing component.",
            "They were previously prized for color but are now known to weaken harbors.",
            "Scientists now believe Roman builders imported them only for modern roads."
          ],
          answer: "Once dismissed as sloppy mixing, they are now recognized as an intentional self-healing component.",
          explanation: "Sentences 4 and 5 contrast earlier dismissal ('sloppy mixing') with evidence of intentional hot quicklime use that seals cracks."
        },
        {
          q: "What triggers the self-healing reaction inside Roman concrete?",
          choices: [
            "Direct sunlight drying the harbor wall",
            "Water seeping into tiny cracks and dissolving reactive lime clasts",
            "Repeated waves washing away volcanic ash",
            "Replacing calcium carbonate with steel bars"
          ],
          answer: "Water seeping into tiny cracks and dissolving reactive lime clasts",
          explanation: "Sentence 5 states rainwater or seawater seeps into cracks, dissolving the lime clasts so they recrystallize as calcium carbonate."
        },
        {
          q: "The word 'fissures' in the passage is closest in meaning to:",
          choices: ["harbors", "minerals", "cracks", "waves"],
          answer: "cracks",
          explanation: "Sentence 5 introduces 'microscopic cracks' and refers back to them as 'the fissures before they widen'."
        }
      ]
    }
  ],

  buildASentence: [
    {
      id: "bas-ex-01",
      prompt: "Could you help me find the Registrar's Office?",
      layout: [{ text: "Sure, do you know" }, { slot: 0 }, { slot: 1 }, { slot: 2 }, { slot: 3 }, { text: "?" }],
      choices: ["building", "which", "located in", "it is"],
      answer: ["which", "building", "it is", "located in"]
    },
    {
      id: "bas-ex-02",
      prompt: "Why did you leave the lecture early yesterday?",
      layout: [{ text: "I had to leave because" }, { slot: 0 }, { slot: 1 }, { slot: 2 }, { slot: 3 }, { text: "." }],
      choices: ["scheduled", "an appointment", "had been", "at three"],
      answer: ["an appointment", "had been", "scheduled", "at three"]
    },
    {
      id: "bas-ex-03",
      prompt: "Can you tell me how to submit the lab assignment?",
      layout: [{ text: "The professor explained" }, { slot: 0 }, { slot: 1 }, { slot: 2 }, { slot: 3 }, { slot: 4 }, { text: "." }],
      choices: ["online", "how", "should upload", "students", "their files"],
      answer: ["how", "students", "should upload", "their files", "online"]
    },
    {
      id: "bas-ex-04",
      prompt: "What makes this study guide so helpful?",
      layout: [{ text: "It is clear, concise, and" }, { slot: 0 }, { slot: 1 }, { slot: 2 }, { slot: 3 }, { text: "." }],
      choices: ["to follow", "easy", "well organized", "very"],
      answer: ["very", "well organized", "easy", "to follow"]
    },
    {
      id: "bas-ex-05",
      prompt: "Did Professor Patel announce the exam date?",
      layout: [{ text: "She hasn't decided" }, { slot: 0 }, { slot: 1 }, { slot: 2 }, { slot: 3 }, { text: "." }],
      choices: ["will take", "the exam", "when", "place"],
      answer: ["when", "the exam", "will take", "place"]
    },
    {
      id: "bas-ex-06",
      prompt: "Why is the main library entrance closed today?",
      layout: [{ text: "The front doors" }, { slot: 0 }, { slot: 1 }, { slot: 2 }, { slot: 3 }, { text: "." }],
      choices: ["being", "this morning", "are", "repaired"],
      answer: ["are", "being", "repaired", "this morning"]
    },
    {
      id: "bas-ex-07",
      prompt: "Do you remember the title of the book Dr. Lin recommended?",
      layout: [{ text: "No, I forgot" }, { slot: 0 }, { slot: 1 }, { slot: 2 }, { slot: 3 }, { text: "." }],
      choices: ["book", "she", "which", "mentioned"],
      answer: ["which", "book", "she", "mentioned"]
    },
    {
      id: "bas-ex-08",
      prompt: "How often does the campus shuttle run after six?",
      layout: [{ text: "The evening shuttle" }, { slot: 0 }, { slot: 1 }, { slot: 2 }, { slot: 3 }, { text: "." }],
      choices: ["twenty minutes", "arrives", "usually", "every"],
      answer: ["usually", "arrives", "every", "twenty minutes"]
    },
    {
      id: "bas-ex-09",
      prompt: "What skills does the internship require?",
      layout: [{ text: "Applicants must be comfortable" }, { slot: 0 }, { slot: 1 }, { slot: 2 }, { slot: 3 }, { text: "." }],
      choices: ["data", "analyzing", "writing reports", "and"],
      answer: ["analyzing", "data", "and", "writing reports"]
    },
    {
      id: "bas-ex-10",
      prompt: "Where did Maya get those practice charts?",
      layout: [{ text: "She borrowed them from the tutor" }, { slot: 0 }, { slot: 1 }, { slot: 2 }, { slot: 3 }, { text: "." }],
      choices: ["runs", "who", "the math", "center"],
      answer: ["who", "runs", "the math", "center"]
    },
    {
      id: "bas-ex-11",
      prompt: "Are we allowed to bring calculators to the statistics quiz?",
      layout: [{ text: "Could you check" }, { slot: 0 }, { slot: 1 }, { slot: 2 }, { slot: 3 }, { text: "?" }],
      choices: ["permitted", "whether", "calculators", "are"],
      answer: ["whether", "calculators", "are", "permitted"]
    },
    {
      id: "bas-ex-12",
      prompt: "Why did the outdoor concert move indoors?",
      layout: [{ text: "The event was moved" }, { slot: 0 }, { slot: 1 }, { slot: 2 }, { slot: 3 }, { text: "." }],
      choices: ["heavy rain", "of the", "because", "forecast"],
      answer: ["because", "of the", "heavy rain", "forecast"]
    },
    {
      id: "bas-ex-13",
      prompt: "What did the advisor say about your course load?",
      layout: [{ text: "She suggested" }, { slot: 0 }, { slot: 1 }, { slot: 2 }, { slot: 3 }, { text: "." }],
      choices: ["next spring", "waiting", "to take chemistry", "until"],
      answer: ["waiting", "until", "next spring", "to take chemistry"]
    },
    {
      id: "bas-ex-14",
      prompt: "Did you finish proofreading your group paper?",
      layout: [{ text: "Yes, we checked" }, { slot: 0 }, { slot: 1 }, { slot: 2 }, { slot: 3 }, { text: "." }],
      choices: ["both", "the citations", "grammar", "and the"],
      answer: ["both", "the citations", "and the", "grammar"]
    }
  ]
};

if (typeof window !== "undefined") {
  window.TOEFL_EXTRA_PRACTICE = TOEFL_EXTRA_PRACTICE;
}
