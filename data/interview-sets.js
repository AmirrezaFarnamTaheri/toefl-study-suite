// 2026-format "Take an Interview" sets: one scenario, one everyday topic, four linked turns.
// Turn order: factual question about the learner -> reaction/preference and why ->
// agree or disagree with a stated view -> opinion on a policy or proposal.
// Original sets written for VoxPilot, shaped after the public 2026 task description.
const INTERVIEW_SETS = [
  {
    id: "is-libraries",
    topic: "Libraries",
    scenario: "You are taking part in a study about how people use public libraries. A researcher will talk to you online and ask you some questions.",
    turns: [
      "Thank you for joining me today. I'm studying how people use libraries now that so much reading has moved online, and I'd like to ask you a few questions. First, how often do you go to a library, and what do you usually do there?",
      "I see. People feel differently about studying in public places. Some find that a quiet reading room helps them concentrate. Others say they work better at home, where nobody is watching. Which is closer to your own experience, and why do you think that is?",
      "Thanks. Now I'd like your opinion. Some people argue that libraries no longer need printed books, because almost everything can be read on a screen. They say the space would be better used for computers and group study rooms. Do you agree that libraries should replace most of their printed books? Why or why not?",
      "That's helpful. I have one last question. Many towns have to decide how to spend limited public money, and libraries are expensive to run. Do you think local governments should keep paying for libraries even when fewer people visit them? Why or why not?"
    ]
  },
  {
    id: "is-commuting",
    topic: "Commuting",
    scenario: "You are taking part in a survey about how students travel to campus. An interviewer will ask you some questions about your own travel habits and opinions.",
    turns: [
      "Hello, and thanks for your time. We're surveying students about how they get to campus each day. To start, how do you usually travel to your classes, and roughly how long does the trip take?",
      "Okay. Some students enjoy their trip because it gives them time to relax or listen to music. Others find it tiring and wish it were shorter. How do you feel about your own trip, and what makes you feel that way?",
      "Thank you. Here is a view I hear often. Some people say that universities should schedule classes later in the morning, because many students spend a long time traveling and arrive tired. Do you agree that classes should start later? Why or why not?",
      "One last question. Some cities are thinking about giving students free public transport passes, paid for by higher local taxes. Do you think that is a good use of public money? Why or why not?"
    ]
  },
  {
    id: "is-parttime",
    topic: "Part-time work",
    scenario: "You are talking to a researcher who is studying how students balance work and study. She will ask you a few questions.",
    turns: [
      "Welcome, and thank you for helping with my research. I'm interested in how students manage work alongside their studies. First, do you have a part-time job now, or have you had one in the past? Please tell me a little about it.",
      "Thanks. Students often describe two sides of working while studying. Some say a job teaches them useful skills like time management. Others feel it leaves too little energy for their classes. Which side is closer to your view, and why?",
      "I see. Now, some people believe that students should focus only on their studies and not work at all until they graduate. They say grades are the most important thing at this stage of life. Do you agree with that view? Why or why not?",
      "My last question is about policy. Some universities are considering offering on-campus jobs with flexible hours, so students can earn money without leaving campus. Do you think universities should provide those jobs? Why or why not?"
    ]
  },
  {
    id: "is-online-learning",
    topic: "Learning online",
    scenario: "You are taking part in an education study about online courses. A researcher will ask you some questions about your experience.",
    turns: [
      "Good afternoon, and thank you for joining. I'm researching how students learn online. To begin, have you ever taken a class or followed a course online? If so, what was it about?",
      "Interesting. People react differently to online classes. Some enjoy the freedom to study at any time. Others miss the energy of a real classroom and find it hard to stay focused at home. Which describes you better, and why?",
      "Thank you. Here is something some teachers say. They argue that most university courses should be offered online, because it saves students money and travel time. Do you agree that most courses should move online? Why or why not?",
      "Finally, some governments are thinking about paying for free online courses for adults who want to learn new job skills. Do you think this is a good use of public money? Why or why not?"
    ]
  },
  {
    id: "is-parks",
    topic: "City parks",
    scenario: "You are speaking with a city planner who is gathering opinions about public parks. She will ask you four questions.",
    turns: [
      "Hello, and thank you for speaking with me. Our city is planning improvements to its parks, and we want to hear from residents. First, how often do you visit a park, and what do you usually do there?",
      "I see. Some people like parks to be quiet and natural, with trees and paths. Others prefer lively parks with sports fields, cafes, and events. Which type do you prefer, and why?",
      "Thanks. Now, some residents say that the city should turn small empty lots into parking spaces instead of parks, because parking is hard to find downtown. Do you agree with that idea? Why or why not?",
      "My last question is about funding. The city could raise a small fee on new buildings to pay for more parks. Do you think that is a fair way to pay for them? Why or why not?"
    ]
  },
  {
    id: "is-phones",
    topic: "Using phones",
    scenario: "You are taking part in a study about technology in daily life. A researcher will ask you some questions about how you use your phone.",
    turns: [
      "Thank you for joining me. I'm studying how people use their phones during the day. First, what do you mostly use your phone for, and about how much time do you spend on it each day?",
      "Okay. Some people say their phone makes life easier because it keeps everything in one place. Others say it distracts them from work and from people around them. Which is closer to how you feel, and why?",
      "I see. Some teachers believe that students should not be allowed to use phones in class at all, even for taking notes. They say phones are too distracting. Do you agree with this rule? Why or why not?",
      "One more question. Some towns are considering limiting phone use in public places like restaurants and buses. Do you think governments should make such rules? Why or why not?"
    ]
  },
  {
    id: "is-eating",
    topic: "Eating habits",
    scenario: "You are talking to a student researcher who is studying eating habits on campus. He will ask you some questions.",
    turns: [
      "Hi, and thanks for helping me with my project. I'm learning how students eat during a busy week. To start, where do you usually eat your meals during the school week, and what do you usually have?",
      "Okay. Some students prefer to cook for themselves because it is cheaper and healthier. Others prefer to buy food because it saves time. Which is closer to your own choice, and why?",
      "Thanks. Here is a view some people hold. They say that universities should only sell healthy food on campus and remove fast food completely. Do you agree with that idea? Why or why not?",
      "Finally, some universities are thinking about giving students a low-cost meal plan that includes one free healthy meal a day. Do you think this is a good idea? Why or why not?"
    ]
  },
  {
    id: "is-groupwork",
    topic: "Group projects",
    scenario: "You are speaking with a teaching researcher who is looking at group projects in university courses. He will ask you a few questions.",
    turns: [
      "Good morning, and thank you for coming. I'm researching group projects at university. First, have you worked on a group project before? Please tell me about one and what your role was.",
      "I see. Some students enjoy group projects because they can share ideas and divide the work. Others find them stressful because some members do not do their part. Which is closer to your experience, and why?",
      "Thanks. Some professors say that all group projects should be graded individually, so that each student gets credit only for their own work. Do you agree with this approach? Why or why not?",
      "My last question is about course design. Some universities are considering requiring at least one group project in every course. Do you think that is a good rule? Why or why not?"
    ]
  }
];
