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
  }
];

