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

// === TELEGRAM_2026_INTERVIEW_SETS_START ===
const EXTRA_INTERVIEW_SETS_2026 = [
  {
    "id": "is-real-01",
    "topic": "Health And Wellness Habits",
    "scenario": "As part of a university project, you have agreed to take part in a short research interview about health and wellness habits. A graduate student conducting the research will ask you some questions online.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about your health and wellness habits. First, do you have any specific routines or practices you use to maintain your physical wellbeing? If so, what are they?",
      "Thank you. Can you describe any dietary choices or habits that you follow to stay healthy? Give details to explain your answer.",
      "Interesting. If you could make one significant change to your diet or exercise routine to stay healthy, what would it be? Why would you make that particular choice?",
      "Great. Some people believe that mental health is just as important as physical health and should be given equal attention. Do you agree or disagree with this viewpoint? Why?"
    ],
    "samples": [
      "Yes, absolutely. I have my own practices to maintain my fitness and improve my physical well-being. For example, I love walking. I used to take a long walk with my mom almost every evening in a park in my hometown. But recently, since I started working on a big construction project this job has been requiring me a lot of walking and constant movement, so my physical needs are being met naturally. So I no longer need to dedicate a separate time for exercise.",
      "To be honest, I don’t follow a special diet to maintain my well-being and all I do is that I try to avoid sugary or oily foods as much as possible such as fast food and already prepared food. Instead, I prefer eating things that supply my body with the nutrients and vitamins it needs which eventually help keep me healthy and allow me to do my job with full energy and power and improve my concentrate during work which can lead to higher productivity.",
      "If I could make one significant change to my diet routine, I think it would definitely be drinking more water during the day because it's something I constantly forget throughout the day, and I've noticed that my body ends up feeling dehydrated. I think building this simple habit would make a huge difference since it can benefit both my mind and my body since better hydration help improve the energy level and enhance concentration.",
      "I totally agree with the statement mental health as important as physical health and I think so for two main reasons. First, our body takes its orders from the mind. Once the mind is unwell, the body starts to deteriorate as well slowly. Second, working on our mental well-being allows us to deal with our physical problems more easily. When our mind is strong, we can stay resilient and push through illness until we're fully recovered."
    ]
  },
  {
    "id": "is-real-02",
    "topic": "Interview Topic 2",
    "scenario": "You have signed up for a study run by a university research group that is investigating education experiences. You will have a short video interview with one of the researchers. The researcher will ask you some questions.",
    "turns": [
      "Thank you for joining the study today. I'd like to ask you some questions about your education experiences. First, which do you think is more important for a college? Offering a wide variety of courses, or having small class sizes? Why?",
      "I see. Imagine that you are preparing for a test. Would you prefer to study by yourself or with the group? What would make you choose one over the other?",
      "Interesting. Some people believe that online courses offer more flexibility and accessibility compared to those offered in traditional classroom settings and are therefore superior. What are your thoughts on this? Do you agree or disagree? Why?",
      "ood points. Lastly, online courses are becoming increasingly popular and there are now full degree programs offered by universities where every class is available online only. Do you think online learning will someday completely replace in-person learning? Explain your thoughts."
    ],
    "samples": [
      "I think having small class sizes is more important for a college. First, students receive more attention from the teacher in smaller classes. This improves concentration, allows students to participate more, and usually leads to better productivity. Second, offering too many courses can sometimes be overwhelming, especially for new students. They may feel confused about what to choose and become distracted instead of focusing on their main goals which may even take away their peace of mind.",
      "I would prefer to study by myself. Because firstly, I get distracted easily, even by a single movement or sound, so studying alone helps me concentrate better and be more productive. Secondly, I have my own way of studying and memorizing concepts. I usually need to repeat information many times and spend long hours reviewing it, which may not match the study style of other people. Because of that, studying alone is more comfortable and effective for me.",
      "I agree with the idea that online courses are more flexible and accessible than traditional classroom courses. First, online courses are offered at different times during the day, which gives students more flexibility and allows them to choose a schedule that suits them best. In-person classes, however, are usually held at fixed times, so students have to attend regardless of their personal plans. Second, commuting to classes can take a great deal of time and energy. Online courses, however, can be attended from almost anywhere in the world, which makes learning much more convenient and accessible",
      "I believe that in-person learning will continue to exist in the future, despite the growing popularity of online classes. First, students can receive more attention from teachers in a traditional classroom setting. Teachers are often better able to notice students’ problems, weaknesses, and provide the support they need. Second, in-person classes help students socialize and communicate with a wide variety of people. This can improve their confidence and interpersonal skills, which may help shape them into more successful individuals in the future."
    ]
  },
  {
    "id": "is-real-03",
    "topic": "Holiday Celebrations",
    "scenario": "You received an email from your university inviting you to join a research study about holiday celebrations. You have scheduled a short online interview with a researcher to answer a few questions.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about holiday celebrations. First, do you celebrate holidays with your family, friends, or both? How often do you participate with them?",
      "Thank you. Can you describe one of your favorite holiday celebrations or festivals? What do you do to mark the occasion?",
      "Interesting. Tell me about a special event that was particularly memorable for you. What made it meaningful?",
      "Great. Some people believe that traditional cultural observances are becoming less important in modern society. Do you agree or disagree with this viewpoint? Why?"
    ],
    "samples": [
      "I’m usually away from home most of the time, so unfortunately I don’t get to celebrate holidays with my family very often. Although I have friends and colleagues around me and could celebrate with them, I usually choose not to. To be honest, I’m not very fond of holidays. I prefer to use my time productively by staying at home, studying, and organizing my tasks for the days after the holiday is over.",
      "One of my favorite celebrations is Mother's Day. It's a day that means a lot to me, and I become very emotional and expressive at that day. I would even try to talk with my boss and take a few days off from work so I can go back home and spend the day with my mother. To make the occasion even more special, I usually keep my visit a surprise because I know that that brings her so much happiness because, to her, my presence is much more valuable than any gift I could send.",
      "One of the most memorable events I've attended was the Festival of Iranian lady. During the event, I listened to the stories of successful women who shared their challenges. What made the event meaningful was that since then, I began to picture my goals much more clearly, and it made me believe that almost anything is possible with enough persistence. Also, I got to improve my social skills by approaching the speakers, introducing myself, and telling them how much I relate to their stories.",
      "I totally agree that traditional cultural observances are becoming less important in modern society. First, younger generations are so influenced by modern culture through the internet and social media that they started to adopt that culture instead of the culture they have inherited from previous generations. Second, some traditional practices are based on superstitions or beliefs that were widely accepted in the past. However, nowadays, people tend to rely more on science and evidence to believe or practice a way."
    ]
  },
  {
    "id": "is-real-04",
    "topic": "Personal Finance",
    "scenario": "You received an email from your university inviting you to join a research study about personal finance. You have scheduled a short online interview with a researcher to answer a few questions.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about your personal finance habits. First, how often do you review your money management, such as tracking your expenses or budgeting? Do you do this weekly, monthly, or less often?",
      "Thank you. Can you describe one or two methods you or someone you know uses to manage your finances? For example, do you use budgeting apps or keep a written record?",
      "Interesting. Tell me about a financial goal you have achieved recently. What motivated you to achieve this goal?",
      "Great. Some people believe that fiscal responsibility education should be mandatory in schools to help students manage money effectively as adults. Do you agree or disagree with this idea? Why?"
    ],
    "samples": [
      "I manage my money in two ways. First, I review my finances monthly right after I receive my salary. I calculate how much I should set aside for rent, food, transportation, and any plans that change from month to month. Second, I do it almost at the end of each day. I remind myself of my daily expenses and judge whether I've been careful with my money or not.",
      "I prefer keeping a written record to manage my budget. First, unlike apps, writing allows me to note down every single detail so nothing gets missed. This gives me a much more reliable record to review later when I need to check my spending. Secondly, writing forces me to be more honest with myself. When I physically write down what I've spent, I can't ignore it or hide the details. So, I can truly understand my financial situation.",
      "I remember that the most recent financial goal I achieved was saving a certain amount of money to have on hand for whenever I might need it. What motivated me was my plan to study abroad and pursuing this path requires a lot of money. Knowing that I couldn't take that step without enough savings pushed me to be disciplined. And I've been successful at achieving this goal.",
      "I truly disagree with the notion that taking a course or two would be very effective in improving students' budget management abilities. This is a skill that needs to be practiced in real life and cannot be learned simply from books. This way students are more likely to remember it or use it for later. Students need to start working from a young age, so, they learn how to be careful with their spending and how to set priorities."
    ]
  },
  {
    "id": "is-real-05",
    "topic": "People'S Experiences With Financial Planning",
    "scenario": "You have volunteered for a research study about people's experiences with financial planning. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for joining us today. To help with the study, I'd like to ask you some questions about your experiences with financial planning. First, do you currently have a financial plan or budget that you follow?",
      "Thank you. If you could design the ideal way of managing your money, what would it look like?",
      "I see. In your opinion, what are the most common obstacles people run into with financial planning?",
      "Some people believe that detailed financial planning is crucial for achieving long-term financial stability and goals. Do you agree or disagree with this belief? Why or why not?"
    ],
    "samples": [
      "I don’t really follow a strict financial plan or budget. I usually try to spend my money wisely without writing everything down or following a specific plan. Before making a purchase, I think about whether I really need it and whether I can afford it. Since I have more important expenses like rent, food, and transportation, I try to avoid unnecessary spending and save money as much as I can. This helps me avoid regretting my spending and decisions later and keep everything under control.",
      "If I were to design an ideal way of managing my money, I would first set aside the essential expenses such as rent, food, and transportation. Then, I would divide the remaining money into categories like clothing, recreation, and savings, setting a clear limit for each category. I would also keep track of every purchase to make sure I stay within my budget. This way, I can stay in control of my spending and manage my budgets more effectively.",
      "I think one of the most common obstacles in financial planning is that people fail to stick to their own plans. Many people promise themselves to spend carefully and save money, but they do not always follow through and fail to live up to their promises. For example, when they see something attractive online or notice someone else buying a new item, they may immediately rush into buying it as well. The issue is that they struggle to control their desires, which makes it difficult for them to stay within budget.",
      "I totally agree with the notion that financial planning is important for long-term financial stability. First, it helps people understand their income and expenses more clearly. When people know how much money they earn, spend and where it goes, they can avoid unnecessary spending and save more money for their future. Second, it helps people prepare for unexpected problems such as sickness or losing a job, having savings and a plan can reduce stress and help them manage the situation more easily."
    ]
  },
  {
    "id": "is-real-06",
    "topic": "Gardening",
    "scenario": "You have volunteered for a research study at your university about gardening. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about your experiences with gardening. First, do you have a garden or any plants that you take care of? If so, how often do you spend time gardening? And if not, why?",
      "Thank you. What kinds of plants or gardens have you seen or heard about that you found interesting or appealing? Describe them and talk about why you found them interesting or appealing.",
      "Interesting. What challenges do you think people face when trying to grow plants or maintain a garden?",
      "Great. Some people believe that gardening can have positive effects on personal mental health and wellbeing. Do you agree or disagree with this viewpoint? Why?"
    ],
    "samples": [
      "Personally, I don’t have a garden. Because firstly, I don't have enough space. Gardening requires an outdoor area where plants can get enough sunlight. Since I don't have that kind of space, growing plants would not make sense and would be unpractical. Second, I don't have enough time. Gardening requires constant caring, and sometimes I need to make research about them and their needs. Because of my busy schedule, I wouldn't be able to give them the attention they need.",
      "Personally, I find flower gardens that are divided into different sections based on the colors particularly interesting. First, they remind me of the beauty of nature and how many choices and opportunities exist around us, that we tend to miss them in our daily lives and tend to see the world as a tedious place. Second, flowers generally have a calming effect on people. It’s hard to feel angry or stressed when you are surrounded by flowers. People can feel more relaxed and peaceful in such environments.",
      "There are a few challenges people may face when trying to grow plants or maintain a garden. First, the weather is often unpredictable especially in some areas. Strong winds, heavy sunlight or rain, and temperature changes can damage plants and make it difficult for them to grow. The second challenge is that people in the neighborhood may cause damage to the plants. For example, children might accidentally or intentionally step on plants or pick flowers, which can ruin the garden.",
      "I agree with the view that gardening can have positive effects on mental health. First, it is scientifically proven that the smell of certain plants can have a calming and soothing effect on people and help reduce stress and improve mood. Second, gardening allows people to spend time their time productively. Gardening is about growing and building something from scratch. After months of care, attention, and patience, people get to see the outcome of their effort. This gives them a sense of accomplishment and pride and helps them develop patience in real life."
    ]
  },
  {
    "id": "is-real-07",
    "topic": "Entertainment Preferences",
    "scenario": "You received an email from your university inviting you to join a research study about entertainment preferences. You have scheduled a short online interview with a researcher to answer a few questions.",
    "turns": [
      "Thank you for your participation today. I'd like to ask you some questions about your entertainment preferences. What kind of movies do your family or friends generally like to watch? For example, do they prefer action, movies, comedies, dramas, or other types?",
      "I see. When you watch a movie, do you prefer to watch after work or school on weekdays, or do you like to watch during the weekends? Why?",
      "Interesting. Next, I'd like to get your opinion. In the past, people mostly watched movies in theaters today. Many people watch movies at home. Do you think that movie theaters will continue to exist in the future? Why or why not?",
      "Good points. I just have one more question. Some people believe that movies can be a powerful tool for educating people and raising awareness about important issues. Do you agree with this idea or do you think there are other more effective ways to educate people? Explain why you think so."
    ],
    "samples": [
      "Most of my friends are especially fond of drama movies. I think one reason is that dramas are emotional and realistic, so people can relate to the characters and their experiences in there more easily and especially girls enjoy movies that reflect real-life situations and emotions rather than unrealistic action scenes. Another reason is that, drama movies often create a stronger emotional connection with the audience, which makes them more memorable and meaningful, and a good choice to watch.",
      "Personally, I prefer watching movies during the weekend. Firstly, I enjoy watching movies with my friends, and during weekdays everyone is usually busy. On weekends, however, we have more free time, so we can coordinate a time and place, buy our favorite snacks and food, and watch a movie that everyone agrees on. Second, during the workweek my mind is busy, so I easily get distracted. On the weekend, I feel more relaxed mentally, which makes the experience much more enjoyable since and free to do whatever I want.",
      "I think movie theaters will cease ton exist in the future. Because firstly, with the advancement of technology, people can now watch movies at home and still have a very enjoyable experience, sometimes even better and more convenient than the one in a theater. Second, watching movies at home is usually more cost-effective. People can often stream or download movies for a lower cost, and if they do not enjoy one movie, they can simply switch to another, which makes it a good way to save money.",
      "I think movies are a very powerful tool for educating people. Firstly, because movies present information in a more realistic and convincing way than many other sources, such as books. Since movies combine visuals, sound, and emotion, they can make information easier to understand and remember, which increases their influence on viewers. Secondly, movies are visually engaging since they combine visuals and sounds so people are more likely to watch them compared to other sources and have a stronger educational impact, overall."
    ]
  },
  {
    "id": "is-real-08",
    "topic": "Public Transportation",
    "scenario": "As part of a university project, you have agreed to take part in a short research interview about public transportation. A graduate student conducting the research will ask you some questions online.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about your use of public transportation. First, how often do you use public transportation, like buses or trains? Give details to explain your answer.",
      "Thank you. Can you describe any benefits or disadvantages you might from using public transportation?",
      "Interesting. Would you consider moving in order to have better access to public transportation?Why or why not?",
      "That cities should invest more in public transportation to reduce traffic, congestion, commuting time, and pollution. Do you agree or disagree with this idea? Why?"
    ],
    "samples": [
      "I use public transportation almost every day to get to work. Specifically, I take the subway. I leave home at 6.30 a.m. and catch the train at 6.40. I arrive at my destination in exactly 25 minutes, without any delays or change in time. This makes it a very convenient and reliable way of travelling for many people due to its punctuality. So, I don’t think I would ever replace it with any other means of travelling.",
      "Public transportation has so many benefits that they far outweigh any disadvantages. First, it's cheap — its affordability is never a financial burden. Second, it runs on a fixed schedule. That means we can plan our departure from home around it and arrive at our destination right on time, without any unnecessary delays, which eventually gives us peace of mind in terms of our budget and whether we will arrive on time.",
      "I already live close to a subway station, but I would definitely move if I were far from one. This is because, firstly, it saves me a great deal of time and energy. I wouldn't have to take a taxi just to get to the station, and then from there to my destination. Secondly, it also saves me money, since I would only have to pay once — and that amount is significant once it adds up.",
      "I completely agree that cities should invest in public transportation. First, subways and similar systems don't add to traffic, which makes them a safe means of travelling for passengers. The chance of an accident is almost zero, and that leads to well-being of people and higher quality of life. Second, when there's less traffic, the air becomes cleaner. That means healthier people and less need for the city to invest in health care facilities."
    ]
  },
  {
    "id": "is-real-09",
    "topic": "Hobbies",
    "scenario": "You have volunteered for a research study at your university about hobbies. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about hobbies. To begin, do you have a hobby or interest that you regularly spend time doing?",
      "Thank you. If you were to select a new hobby, what would you choose and why?",
      "Interesting. Now, tell me what might prevent you from starting this new pastime.",
      "Some people believe it is better to have one interest outside of work or school that you dedicate yourself to rather than multiple smaller ones. What do you think about that and why?"
    ],
    "samples": [
      "Yes, watching movies is one of my main hobbies. I especially like to watch them when I'm overthinking a specific challenge in my life and it helps distract me and brings me peace of mind. I also benefit from movies educationally, especially when they're in English. They help me stay in touch with the language and maintain my English fluency.",
      "If I were to choose a new hobby, I would try to go out with friends more often. Right now, I don't really go out unless it's necessary because I find joy in staying indoors and doing my chores. But going out would require me to forget about my tasks and priorities for a while and that makes me want to postpone it for later but being a little carefree, spending time in nature, or going shopping with a friend can really help change your mood.",
      "I think what might prevent me from starting this hobby is being too organized, too busy, and too work-oriented. I always feel that spending time outdoors would push me away from my future plans. I prefer to stick to my priorities and I'm afraid I might regret it later and my mind keeps telling me that there will be time to go out, but now is the time to push hard.",
      "I do believe it's better to have a single interest rather than multiple smaller ones because, firstly, having one interest gives us the time to practice it regularly, which helps establish it and turn it into a real habit that would not be forgotten or given up easily. Secondly, studies show that jumping from one thing to another isn't very helpful but is actually a waste of time. When we divide our attention to too many directions we never get the chance to dig deep into a subject so we lose the opportunity to truly mastering the skill."
    ]
  },
  {
    "id": "is-real-10",
    "topic": "People'S Experiences With Recycling And Waste Ma",
    "scenario": "You have agreed to participate in a research study about people's experiences with recycling and waste management. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for taking the time to speak with us today. I'd like to ask you some questions about your experiences with recycling and waste management. First, do you regularly recycle items such as paper, plastic and glass? Why or why not?",
      "Thanks. Can you describe the recycling practices in your household or community?",
      "Great, that's helpful. What challenges or difficulties do you face when trying to recycle? And how do you overcome them?",
      "Some people believe that effective recycling programs are crucial for reducing pollution and conserving natural resources and therefore should be mandatory. Do you agree or disagree with this belief? Why or why not?"
    ],
    "samples": [
      "I regularly recycle items such as paper, plastic, and glass. First, recycling is important because it helps protect the environment. I believe taking care of the planet is a shared responsibility, and everyone needs to contribute if we want to create a better place to live. Second, I am a perfectionist and I like everything to be organized. When I separate different types of waste, I feel that everything is in its proper place, and it gives me a sense of satisfaction.",
      "Where I live people are not very committed to environmental practices, but there are only two common recycling efforts that people follow. First, there are usually three trash bins with different colors in front of the buildings. They are used to separate different types of waste, which makes the recycling process easier and more efficient. Second, the community encourages people to participate by giving them credit based on the amount of waste they recycle. This motivates them to take this simple step and become more involved in in this task.",
      "One of the biggest challenges I face when recycling is that I get the feeling that my effort does not make a significant difference. So, I feel discouraged to see that not everyone in the community is participating in recycling, because to be able to see a noticeable change all people should cooperate in this task not just a few individuals. Another challenge is that sometimes recycling bins are not emptied on time. When they become full, it becomes difficult to continue the recycling process. In such situations, I am forced to giving up on recycling completely.",
      "I totally agree with the notion that effective recycling programs should be mandatory. The first reason is that, some businesses produce a significant amount of pollution, which can negatively affect air quality and people health. If these companies are required to follow the regulations by the government, they will be more likely to adopt environmentally responsible practices and be careful in how they treat the environment. Secondly, people often take rules more seriously and when something is optional they are more likely to ignore it. So, implementing strict rules can be helpful."
    ]
  },
  {
    "id": "is-real-11",
    "topic": "Grocery Shopping Habits",
    "scenario": "You have volunteered for a research study about grocery shopping habits. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for taking part in our study. I'd like to ask you some questions about your grocery shopping habits. First, how often do you go grocery shopping each week? Why that often?",
      "Great, thank you. Can you tell me what types of items you usually buy when you go grocery shopping? For example, do you buy fresh produce, dairy products or packaged foods?",
      "Got it. When you are grocery shopping, how often do you impulse buy? In other words, buy things you did not plan on buying. What types of items do you or might you impulse buy?",
      "Great, that's helpful. Last question, some people believe that shopping at local farmers markets is better than shopping at large grocery stores. Do you agree or disagree with this opinion? Why?"
    ],
    "samples": [
      "personally, I go grocery shopping once a month. The reason is that I am very busy with my main responsibilities, such as work, studying, and other personal tasks so I rarely find the time to go for shopping. So, I prefer to set aside one specific time to do all my shopping and buy enough items to last for the whole month. Secondly, I’m personally not very interested in food or cooking, and I don’t have a good appetite for eating either. So, I don’t feel the need to go grocery shopping very frequently.",
      "usually buy packaged food when I go grocery shopping. The reason is that I have a busy schedule and I prefer convenient options. Packaged food is convenient for me because it saves me a lot of time and I don’t have to spend hours preparing meals from scratch by myself since pachaged food is already prepared and cleaned, which allows me to focus on my other priorities. Secondly, packaged food usually has a longer life span and I can store it in the refrigerator while fresh food can spoil much faster.",
      "personally, I rarely buy something that I did not plan on buying and I don’t make impulse purchases when I go grocery shopping. The reason is that I try to stay in control of my decisions and consider my priorities and my budget and make my purchases accordingly. Secondly, personally, I don’t have a good eating appetite and food does not interest me. The items I’m most likely to buy impulsively are clothes but grocery shopping is not accompanied with joy and temptation.",
      "I agree that shopping at local farmer’s markets is better than shopping at large grocery stores. First, local markets can often offer more affordable prices because the products usually come directly from local farmers. Since there are fewer people involved, sellers can offer better prices to customers. Second, the food at farmer’s markets is usually fresher and healthier. while in large grocery stores, food takes longer to reach customers. As a result, local markets can provide higher-quality food."
    ]
  },
  {
    "id": "is-real-12",
    "topic": "Interview Topic 12",
    "scenario": "You have signed up for a study run by a university research group that is investigating spending habits and budgeting. You will have a short video interview with one of the researchers. The researcher will ask you some questions.",
    "turns": [
      "Thank you for participating in this study. Today, I'd like to ask you some questions about your spending habits. First, can you tell me about a recent purchase you or someone in your family made and why you decided to buy it?",
      "I see, when you make a purchase do you usually plan ahead or do you buy things spontaneously? Why?",
      "nteresting. Some people believe that creating a monthly or weekly budget is essential for managing finances effectively. When budgeting your time or money for your next purchase, which is more important, quality for the money or spending less overall, why?",
      "Good points. For my final question, I'd like to ask about using apps or online tools for managing spending habits. Do you think people will increasingly rely on financial apps and tools to manage their money? Or will people prefer to hire personal financial managers? Explain your thoughts."
    ],
    "samples": [
      "My brother recently purchased a new, advanced violin. It was quite expensive because it is high quality. He decided to buy it so he could create better music, record it, and share it on his social media. Also, this new instrument allows him to be more creative and express skills that he couldn’t fully show before.",
      "I usually plan my purchases ahead of time. First, I have a limited budget, so I need to be careful with my spending in order to cover essential expenses such as food, rent, and transportation. Second, I consider myself an organized person, so I prefer planning things in advance and keeping track of my expenses. This gives me the opportunity to review my financial situation before making, so I don’t regret my purchases later.",
      "If I had to choose between quality and spending less, I would choose spending less. First, although high-quality products are usually more durable, I personally prefer buying less expensive items because I tend to get bored after a while and like to replace things with new ones, so old items often feel unnecessary to me. Second, I think that expensive products don’t necessarily guarantee high quality. So, I prefer not to rely on that idea.",
      "I believe that in the future, people will rely much more on financial apps and online tools rather than hiring personal financial managers. First, with the advancement of technology and AI, these apps can act quickly and accurately. In many cases and can even perform better than humans. Second, People usually hire financial managers to help them save money, but in reality, personal managers can be expensive while, many financial apps are free or very affordable, so why bother pay for human services if you can have it for free using these apps."
    ]
  },
  {
    "id": "is-real-13",
    "topic": "Online Shopping",
    "scenario": "You have volunteered for a research study at your university about online shopping. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about your online shopping habits. First, how often do you shop online? Do you do it weekly, monthly or less often?",
      "Thank you. If you were to shop online, what types of products would you be most likely to buy? For example, would you buy clothing, electronics, or groceries?",
      "Interesting. Some people believe that online shopping is more convenient than shopping in physical stores, while others think it's a worse experience because it lacks the human interaction of in-person shopping. What is your opinion on this?",
      "Some people believe physical stores might one day disappear because of online shopping. What is your opinion on this? Why?"
    ],
    "samples": [
      "",
      "",
      "",
      ""
    ]
  },
  {
    "id": "is-real-14",
    "topic": "People'S Experiences With Commuting",
    "scenario": "You have volunteered for a research study about people's experiences with commuting. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for your willingness to participate. Today I'd like to ask you some questions about your experiences with commuting. First, what kinds of places do you usually go to during the week and how do you get there?",
      "Got it. Can you describe how someone in your family or a friend usually travels to work or school? How much time does it take and what transportation does the person use?",
      "OK thanks. Next question. Some people believe that living close to work or school improves quality of life, while others think location doesn't matter much. What do you think and why?",
      "Great final question. Some people believe that employers should reimburse employees for their commuting costs, while others think that employees should pay for their own travel to work. Which view do you agree with and why?"
    ],
    "samples": [
      "I go to work every day — even on weekends. I take the subway to get there. I have easy access to the subway station and it is only five minutes’ walk from where I live. It's affordable for daily commuting and safe to travel on. The stations are reliable, and I never have to worry about traffic or delays. So for someone like me who works for long hours and is concerned about saving both money and time, the subway is simply the best option.",
      "My friend gets to work by car. She lives in a major city where traffic jams are very heavy. Unless she leaves home early, she gets stuck in traffic and arrives at work late. This has always been an issue for her because getting there on time is important. Every time she's late, her manager blames her, which makes her seem unserious, unreliable, and unpunctual. She doesn’t have easy access to public transportation, so, travelling by car is her only option.",
      "I believe that location matters and makes life go much more smoothly. First, as an employee, I wouldn't have to wake up so early to get to work on time. I could simply wake up just few minutes before and get myself ready. That would give me more time to sleep and rest, so I can have a productive day full of energy. Second, when my home isn't far from work, I can ride my bicycle or walk the distance. That gives me a chance to exercise.",
      "I agree with the notion that employers should reimburse travel costs for two reasons. First, it gives employees peace of mind because they don't have to worry about daily transportation expenses, and instead they can focus on their work and be more productive which eventually benefits the company through better performance of the workers. Second, reimbursement shows that the employer values their workers. Employees would feel respected, so they're more likely to stay with the company."
    ]
  },
  {
    "id": "is-real-15",
    "topic": "Interview Topic 15",
    "scenario": "You have signed up for a study run by a university research group that is investigating people's experiences with books and reading. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for your participation. I'd like to learn about your experiences with books and reading. Was there a time in your life when you read more or less than you do now? What changed?",
      "Great. In your opinion, is reading for pleasure a popular way people spend their free time where you live. Why do you think that is?",
      "Interesting. Do you think reading different types of books helps people understand each other and get along better? Why or why not?",
      "Good points. I just have one more question. Looking ahead, some people believe that future generations will read less than today's generation. Do you agree or disagree? Why?"
    ],
    "samples": [
      "I used to read a lot more in the past, both educational books related to my field and novels for leisure. However, this has changed since I started working. My job is physically tiring, and I usually finish late in the day. As a result, I no longer have the time or energy to read books regularly. In fact, this is something I consider one of my regrets because I genuinely used to enjoy reading and found it very relaxing.",
      "I don’t think reading is a common way to spend free time especially among younger people because many people are more attracted to visual content such as movies, short videos, and social media. Books require more patience and concentration; which is something many people lack nowadays. Instead, people prefer content that immediately engages their eyes and attention. That’s why they never miss out on watching movies, and they tend to stay updated in that area.",
      "Personally, I believe it depends on the type of book. For example, reading psychology, self-awareness, or self-development books can definitely help people understand others better. These types of books explain human behavior and why they behave in a certain way in different occasions. They can also help us accept differences and get along with others more easily. As a result, they may increase empathy, which can ultimately lead to fewer conflicts and more peace of mind.",
      "I disagree with the belief that future generation will read less than today’s generation. I believe that future generations will still access the information in books, but not necessarily by reading them in traditional form. First, I think future generations are very eager to learn about the world. They are curious and want to explore new ideas, and this curiosity will always drive them to look for information that satisfies their needs. However, I doubt they will rely heavily on reading books themselves. Instead, they will probably prefer to consume information from books in other formats, such as podcasts, videos, or movies."
    ]
  },
  {
    "id": "is-real-16",
    "topic": "People'S Experiences With Friendship",
    "scenario": "You have volunteered for a research study about people's experiences with friendship. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for signing up for the study. I'd like to ask you some questions about your experiences with friendship. First, do you have a large group of friends, or do you prefer to have a smaller group of friends?",
      "Very good. Now describe a time when a friendship taught you something valuable or helped you see something from a new perspective.",
      "Great. Next question. In your opinion, what makes a friendship last a long time?",
      "OK, last one. Some people believe that maintaining friendships is essential for emotional well-being and life satisfaction. Do you agree or disagree with this viewpoint? Why or why not?"
    ],
    "samples": [
      "Personally, I prefer having a small group of friends. This way, we can spend more quality time together during our free time, which helps us build a stronger bond and can even turn our friendship into a life-long one. Secondly, I believe that a large group of people can sometimes be distracting. With too many friends around, it may be harder to stay focused on your personal goals or be productive, so we will fall behind on our future goals.",
      "Friends always leave an impression on our lives and teach us something valuable. For example, I used to be a rather pessimistic person. I would often expect the worst and, even when I worked hard, I would still prepare myself for only the minimum result. However, I met a friend at university who completely changed my perspective on life. This person taught me to be more positive and to expect better outcomes instead of always focusing on the negative. As a result, my way of thinking became much more optimistic.",
      "There are definitely many factors that contribute to a long-lasting friendship, but I think the most important of all are loyalty and honesty. Being loyal and never turning your back on a friend, especially during difficult times, can make a friendship truly last longer. Second, honesty is also essential. When friends are honest with each other, they can rely on each other’s opinions and share their changes in their lives and decisions. This helps strengthen the bond between them over time.",
      "I agree with the view that maintaining friendships is essential for emotional well-being and life satisfaction. First, humans are social creatures. they cannot truly enjoy life on their own, no matter what they own or achieve. they always need companionship; otherwise life can feel empty unbearable. Second, friends can act like advisors who understand different parts of our lives. When we need guidance or support, they are usually there for us. This provides a sense of comfort and peace of mind."
    ]
  },
  {
    "id": "is-real-17",
    "topic": "Interview Topic 17",
    "scenario": "You have signed up for a study run by a university research group that is investigating shopping habits. You will have a short video interview with one of the researchers. The researcher will ask you some questions.",
    "turns": [
      "Thank you for taking the time to speak with me. I'd like to ask you some questions about your shopping habits. When was your last shopping trip? And what did you buy? Did you have a good shopping experience?",
      "I see when you shop which do you like better shopping for yourself or shopping for others? Why?",
      "Interesting. Next, I'd like to get your opinion. In recent years, people's shopping preferences have shifted in various ways. Do you think that in the future, people will continue to change how and where they shop? Why? Or why not?",
      "Good points. I just have one more question. Some people believe that buying too many products you do not need harms the environment. Do you agree with this idea? Why or why not?"
    ],
    "samples": [
      "My last shopping trip was about two weeks ago. I mainly bought clothes because I was invited to a formal event and needed something appropriate to wear. I actually had a very good shopping experience because I was able to find exactly what I had in mind so quickly and easily. As a result, I finished my shopping quickly, returned home early, and had enough time to do my other tasks.",
      "Although I enjoy shopping for others and making them happy, I prefer shopping for myself. The first reason is that when I shop for myself, I already know what I like and what makes me happy. I can also consider my budget and choose something that is both suitable and affordable. On the other hand, some people can be very picky, and it can be difficult to meet their expectations even when you know them well. When you see that someone is not satisfied with your choice, it can be disappointing and make you less willing to shop for them again.",
      "Yes, I believe people will continue to change how and where they shop in the future. First, people nowadays are increasingly short on time. they busy with work and daily responsibilities, which leaves them no time for rest. Going to stores and spending hours shopping requires a significant amount of time and effort, so more people are turning to online shopping instead. I believe this trend will continue to grow because online shopping allows people to purchase what they need with just a few clicks which saves them both time and energy.",
      "I definitely agree that buying too many unnecessary products harms the environment. First, it increases the demand for those products. As a result, companies have to manufacture more, which means more factories, higher energy consumption, and more air pollution. All of these have a negative impact on the environment. Second, buying things we do not really need creates more waste. Many people eventually throw away products they rarely use, and this increases the amount of garbage and leads to more pollution."
    ]
  },
  {
    "id": "is-real-18",
    "topic": "Sports Participation",
    "scenario": "You have volunteered for a research study at your university about sports participation. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about your participation in sports. First, do you currently play any sports or engage regularly in any physical activities?",
      "Thank you. If you were able to, what sport that you do not currently play? Would you like to be really good at why that particular sport?",
      "Interesting. Tell me about an experience you had while playing a sport or engaging in a physical activity that you remember well. What made it memorable?",
      "Great. Some people believe that children should not participate in contact sports like rugby or hockey because they could get hurt, while others believe that these sports teach awareness and teamwork. What do you think and why?"
    ],
    "samples": [
      "I don’t play any sports at the moment but I have lots of daily physical activities want it or not. I work on a large construction project, and the job is physically demanding. I’m constantly going up and down stairs and moving around the site, so I stay active throughout the day. Because of that, I feel like my physical activity needs are naturally met through my work. So I don’t need to dedicate extra tie to go to the gym.",
      "One sport I would really like to be good at is kickboxing. I find it interesting and a bit different, especially for women. It feels empowering and can build both confidence and physical strength. It also gives you the feeling that you can handle challenges and become more self-reliant. Second, sports like kickboxing can also improve mental well-being. They help reduce stress and bring a sense of peace of mind, which is very important in daily life.",
      "I remember an experience from a sports course I took at university during my first semester. I remember until now because it was a painful experience. I accidently hit a wall during the activity and got seriously injured and broke my hand. The pain was unbearable so I took a few days off from university to recover. This experience taught me to be more careful and that nothing is worth risking our health for.",
      "I agree with the second view, that contact sports can be beneficial for children. First, these sports require a high level of concentration. When children practice them from a young age, they can develop better focus, which can also help improve their performance in other areas like studying. Secondly, since these sports involve teamwork, children learn how to cooperate with others and communicate effectively which can lead to more successful individuals in the future."
    ]
  },
  {
    "id": "is-real-19",
    "topic": "Work Experience",
    "scenario": "You have volunteered for a research study at your university about work experience. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for being part of the study. I'd like to ask you some questions about your experiences with social gatherings. First, do you enjoy attending large social gatherings or do you prefer smaller, more private gatherings? Why is that?",
      "Thank you! Can you describe a memorable social gathering you attended recently? What made it special?",
      "Very good! How do you usually prepare for a social gathering? What do you focus on most?",
      "Some people believe that social gatherings are important opportunities for building and maintaining professional relationships. Do you agree or disagree with this idea? Why or why not?"
    ],
    "samples": [
      "I prefer smaller and more private gatherings. First, in smaller gatherings, people usually get the chance to spend more time together and learn more about one another. This makes the experience more enjoyable and meaningful, and it often makes people want to meet again in the future. Second, smaller gatherings are usually less stressful. People feel more comfortable because they already know each other well, so they do not need to overthink what to wear, how to behave, or how to interact with others. As a result, the atmosphere feels more relaxed.",
      "One memorable social gathering I attended recently was at the end of last year, when my manager invited all of us to lunch. It was special because I had the chance to see my colleagues in a more personal way and talk about things other than work. The atmosphere was relaxed and friendly, which made everyone feel closer to one another. I also really enjoyed the moment at the end when everyone shared a few kind words and good wishes. At that moment, I felt very lucky and grateful to be surrounded by such supportive people.",
      "It usually depends on the purpose of the gathering and the occasion. If it is a work-related or serious event, I prepare myself accordingly. I dress formally, pay attention to my behavior, and speak carefully and professionally. However, if it is a casual or fun gathering, I prefer to be myself. I dress comfortably, relax, and express my personality more naturally.",
      "I completely agree with the idea that social gatherings are important for building and maintaining professional relationships. First, humans are social creatures. We naturally need to communicate, exchange ideas, and support one another. Social gatherings provide an environment where these needs can be fulfilled. From a professional perspective, gatherings allow people to network and create valuable connections, which can lead to new opportunities, collaborations, and career growth."
    ]
  },
  {
    "id": "is-real-20",
    "topic": "Work Experience",
    "scenario": "You have volunteered for a research study at your university about work experience. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about your work experience. First, can you tell me about the type of work you are currently doing or have done in the past?",
      "Thank you. Can you describe some of your regular responsibilities or particular tasks that you do in your job?",
      "Interesting. Tell me about a challenging project or task you have worked on. How did you handle it?",
      "Great, some people believe that gaining diverse work experiences by often changing jobs and companies is more valuable than staying in one job or one company for a long time. What is your opinion on this? Why?"
    ],
    "samples": [
      "Personally, I am a civil engineer and fortunately I work in my field. I currently work on a large construction project. My job involves planning daily tasks, assigning responsibilities to workers, monitoring their progress. I also make sure that the work is completed safely. What I enjoy most about my job is that every day is different. I get to solve real problems, work with different people, and see the project’s progress which is very rewarding and satisfying.",
      "I work in the construction industry, and my job involves a variety of responsibilities. One of my main tasks is monitoring the quality of the construction work to make sure everything meets the required standards. I also write daily reports, supervise the workers, and monitor the progress of the project. In addition, I am currently covering for our HSE officer because we don't have one at the moment. This means I make sure the project is safe, that workers follow safety procedures, and that all health and safety protocols are being followed.",
      "A while ago, we had a problem with mosquitoes in the workers' accommodation. They were causing a lot of discomfort for the workers. At that time, I was covering for our HSE officer and handling her responsibilities. So, what I did was that I contacted a company that specialized in pest and coordinated the entire process. The company came to the site and sprayed the accommodation rooms. Within two days, the problem was completely solved, and the workers were able to return to a comfortable living environment.",
      "Sure, I believe that gaining diverse work experiences by changing jobs and companies can be more valuable, especially in the early stages of a person’s career. First, every workplace and position has its own challenges. Changing companies allows people to face different working styles and new problems to solve. This variety can greatly expand their experience and their confidence. Second, being in different work environments helps people build a wider professional network. They get the opportunity to meet new colleagues, develop new relationships, and become more recognized in their field."
    ]
  },
  {
    "id": "is-real-21",
    "topic": "People'S Experiences With Setting Personal Goals",
    "scenario": "You have agreed to participate in a research study about people's experiences with setting personal goals. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about your experiences with setting personal goals. First, think of a time, recent or not, when you had something you wanted to achieve. What was it?",
      "Gotcha! In general, how do you handle difficulties or obstacles that come up while working toward what you want to achieve?",
      "Understood. In your opinion, how important is goal setting for personal growth?",
      "Thanks. Last question. Do you think children should be taught to set personal goals from an early age, why, or why not?"
    ],
    "samples": [
      "A while ago, one of my biggest goals was to find a proper job related to my field. At that time, it was not easy, especially because I had no previous relative work experience. Also, since my field is mostly dominated by men, I felt that I had to work so hard to be qualified. However, after a lot of effort and patience, I finally achieved my goal and started working at a place I had always dreamed of. It was such a rewarding experience for me.",
      "I usually handle difficulties and obstacles in two ways. First, I remind myself of the challenges I have overcome in the past. This helps me realize that difficult times are temporary, and nothing is permanent. So, I keep moving forward and try not to give up. Second, whenever I decide to pursue a goal, I develop a very strong will and become determined. I try to cancel all distractions and stay fully focused on the goal itself. So, this way I am never discouraged.",
      "I think goal setting is extremely important for personal growth. First, goals give meaning and direction to our lives. When we work toward one goal after another, we begin to see value in our efforts and hardships. However, living without goals can make life feel empty and purposeless. Second, people who have goals are usually more organized and focused they manage their time and energy more effectively, and use it more productively and have a greater peace of mind.",
      "I believe it is important for children to learn how to set goals from a young age. First, it teaches them that life should be taken seriously. Once they they understand this, the more mature and responsible and reliable they will become over time. Secondly, setting and achieving goals is often associated with a sense of happiness and satisfaction. When children work hard and accomplish what they aim for, they experience the feeling of success, which is very rewarding and can motivate them to become more ambitious in the future."
    ]
  },
  {
    "id": "is-real-22",
    "topic": "Environmental Practices",
    "scenario": "You are participating in a research study conducted by your university's Department of Environmental Science about environmental practices. You will meet online with a researcher who will ask you some questions.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about your environmental practices. First, do you take any specific actions to reduce your environmental impact, such as recycling or conserving energy? Give details in your answer.",
      "Thank you. Can you describe one or two steps your community or neighborhood takes to be environmentally friendly? For example, are there solar panels on buildings or rainwater barrels available where you live?",
      "Interesting, if you had the chance to participate in an ecological or nature-based activity, such as a community cleanup effort or tree planting event, what would you do, and why?",
      "Great! Some people believe that individual actions are not enough to address conservation issues, and that significant changes must come from government policies. Do you agree or disagree with this viewpoint? Why or why not?"
    ],
    "samples": [
      "I try to take small individual actions to reduce my environmental impact and contribute to protecting the planet. There are two things I do. First, I participate in tree-planting campaigns. I contribute money to organizations run these programs. I believe this can help keep the environment greener and compensate for the deforestation that is happening around the world. Secondly, I recycle my garbage as much as I can. Recycling makes it easier to reuse materials which can contribute to better air quality.",
      "Where I live people are not very committed to environmental practices, but there are only two common recycling efforts that people follow. First, there are usually three trash bins with different colors in front of the buildings. They are used to separate different types of waste, which makes the recycling process easier and more efficient. Second, the community encourages people to participate by giving them credit based on the amount of waste they recycle. This motivates them to take this simple step and become more involved in in this task.",
      "I would choose a tree planting effort because I genuinely enjoy planting trees. First, there is something very satisfying about planting something positive and watching it grow over time. Seeing the results of your own efforts gives you a strong sense of accomplishment and makes you feel that you have contributed to something meaningful. Second, trees and green spaces provide many benefits for the community such as enhancing air quality and creating a healthier environment. This is especially beneficial for elderly people who cannot breathe easily.",
      "I strongly agree that significant changes in conservation issues need to come from government policies rather than relying only on individual actions. First, large industries are responsible for creating a significant amount of pollution and the government can require them to mind the environment while operating. Second, people are more likely to take environmental issues seriously when there are clear rules and policies imposed by the government and they may ignore Individual actions if they are optional."
    ]
  },
  {
    "id": "is-real-23",
    "topic": "Online Learning Experiences",
    "scenario": "As part of a university project, you have agreed to take part in a short research interview about online learning experiences. A graduate student conducting the research will ask you some questions online.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about your online learning experiences. First, have you or someone you know ever taken an online course? If so, what was the subject?",
      "Thank you. Can you describe what you think are some of the advantages or disadvantages of an online course over an in-person course?",
      "Interesting, online courses often let students work at their own pace. How do you feel about learning when there is no set class time?",
      "Great, one of the concerns with online learning is online assessment, with some people believing that you cannot trust the results of an online test. What do you think about that issue?"
    ],
    "samples": [
      "Yes, I recently took an online HSE course which stands for Health, Safety, and Environment. Because I work on a construction project, I want to understand every aspect of the job. Since I don't have much free time, an online course was the perfect solution. It prepared me for those responsibilities and gave me all the knowledge I needed and now I feel confident in this field.",
      "Online courses have several advantages that outweigh their disadvantages. First, they are time-efficient. Students can attend classes from anywhere at any time, without getting stuck in traffic or wasting energy on commuting. As a result, they can use their time more productively. Second, online courses are more affordable. Many students have limited budgets, and online classes usually cost less than in-person ones. This allows students to save money.",
      "I think the flexible schedules of online courses can be very beneficial for students. First, students are not forced to attend class when they are not in the right mood or mental state. Instead, they can study at a time when their mind is fully receptive and ready to absorb information, which makes learning more effective. Second, having a flexible schedule allows students to manage their other responsibilities more easily. Since they can choose when to attend the course, they can better balance their studies with other plans.",
      "I believe that although online assessment can be a concern for some people, it is still manageable and can be made reliable. First, the test environment can be controlled by using monitoring systems such as cameras. This helps ensure that no cheating is involved. Second, instructors can require students to have an online interview after the test to verify the student’s performance and determine whether the test taker truly deserves the score they received."
    ]
  },
  {
    "id": "is-real-24",
    "topic": "People'S Experiences With Technology In Daily Li",
    "scenario": "You have volunteered for a research study about people's experiences with technology in daily life. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for signing up for the study. I'd like to ask you some questions about your experiences with technology in daily life. First, how important is technology in your day-to-day activities?",
      "Noted. Thank you. Have you ever felt frustrated while using technology? What happened?",
      "Fair enough. Next question. Some people believe technology will replace many jobs, while others think it will create more opportunities. What is your opinion and why?",
      "Okay, last question. Some people believe that reliance on technology is reducing our ability to think independently and solve problems. Do you agree or disagree with this belief? Why or why not?"
    ],
    "samples": [
      "Technology plays a very important role in my day-to-day activities. As an engineer working on a large construction project, I often come across questions that I can't answer on my own. But with the internet, which is a key part of technology, I'm able to overcome the challenges I face. Secondly, I spend most of my time outside, and when I come home, I'm barely able to get myself ready to sleep let alone find time to cook. So I rely on some advanced kitchen equipment to feed myself, especially on days when I'm completely exhausted.",
      "Yes, definitely. I have felt frustrated with technology before. For example, I works from home and rely on the internet but I sometimes lose my internet connection in the middle of an important task, and I lose all my progress and this experience can be frustrating. Another example is when my phone or laptop starts slowing down especially when I'm in a hurry. In such cases, I feel that technology is working against me.",
      "I believe technology can do both depending on people. For example, people who are eager to learn and who avoid stagnation, people who pay attention to the daily needs of society and equip themselves with the skills needed for the new tasks that technology brings forward, they will always move forward with time and will never fall behind but will take advantage of the disappearance of old jobs and the arrival of new ones. So, they will not get stuck in time.",
      "I disagree with the statement that technology affects our ability to think independently. I think it has nothing to do with it. What technology does is that it advances those abilities to a level above what a human being alone can achieve. It also helps us reach results, make changes that are calculated from all aspects and fully considered and eventually, by practicing this, using technology we actually learn those skills and become stronger at making decisions by ourselves."
    ]
  },
  {
    "id": "is-real-25",
    "topic": "Childhood Education",
    "scenario": "You have volunteered for a research study at your university about childhood education. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about your thoughts on childhood education. First, did you enjoy your school experience as a child?",
      "Thank you. Tell me about a school project or activity you participated in. What made that project or activity special?",
      "Interesting. Tell me a little about the technology you used during your childhood education. Do you feel like that technology prepared you for life after school? Why or why not?",
      "Great. Some people believe that the current education system needs significant changes to better prepare children for the future, focusing more on skills like problem solving and teamwork instead of mainly teaching facts. Do you agree or disagree with this viewpoint? Why?"
    ],
    "samples": [
      "No, I didn't enjoy my school experience as child. First, I lacked confidence. I never trusted myself, and I always doubted my abilities. As a result, I developed a negative self-image and didn't enjoy my time at school. Second, my study strategy was ineffective. I used to believe that the more hours I studied, the higher my grades would be. However, I later realized that success wasn't about studying longer. It was about understanding the materials and simplifying complex ideas. Unfortunately, I didn't learn that until after I graduated from high school.",
      "One school activity I clearly remember was giving a presentation in front of my classmates and teacher. It was the first time I had ever stood in front of an audience, so I felt very nervous. I also felt a lot of pressure because I wanted to prove that I was capable of doing a good job. What made this experience so special was that it helped me discover something about myself. I realized that I actually have good presentation skills and that I genuinely enjoy giving speeches. It also gave me a lot of confidence, and since then, I have felt much more comfortable speaking in front of other people.",
      "My school wasn't very advanced in terms of technology and wasn't equipped with the tools needed to prepare students for the future. We did almost everything the traditional way and only learned about new technologies through books rather than using them ourselves. However, when I went to university, the situation was completely different. I had the opportunity to use more advanced equipment and modern technology in laboratories and classrooms develop an understanding of how technology is used in real life. So, I would say that my school education didn't prepare me very well for life after graduation, but my university education definitely did.",
      "I agree that the education system should place more emphasis on skills like problem-solving and teamwork. First, these skills are essential in today's world. No matter how much knowledge a person has, they also need to communicate effectively, work with others, and express their ideas clearly. Otherwise, they won’t be able to apply that knowledge in real-life situations. Second, problem-solving and teamwork prepare students for their future careers. Teaching these skills from a young age helps children become more confident, improve their social skills, and shape them into reliable individuals in the future."
    ]
  },
  {
    "id": "is-real-26",
    "topic": "Cultural Festivals",
    "scenario": "You have volunteered for a research study at your university about cultural festivals. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about cultural festivals. First, cultural festivals are events that celebrate traditions like food, music, art, or clothing from a certain culture. Have you ever been to one? Or would you like to go to one? Why?",
      "Thank you. If you were to go to a cultural festival, what would you like to see or do there?",
      "Interesting, if you were to participate in a cultural festival for your own culture, what would you want to share with other people and why?",
      "Great! Some people think cultural festivals are mainly just for fun, while others think they serve an important purpose, like helping to keep traditions alive. What do you think?"
    ],
    "samples": [
      "Yes, definitely. I have been to a few cultural festivals when I was at university. I remember students from different backgrounds would get together in a hall, share their food, wear their traditional clothes, and play their own local music while also give an explanation for each tradition and the concept behind it. That experience was so eye-opening. It made me realize that differences should bring us together and not just commonalities because they keep our curiosity sharp and lead us to learn more.",
      "Personally, if I were to go to a cultural festival, I would really want to learn about their language. Language differences have been fascinating for me because they encourage me to put aside my shyness, drive me to approach people from different backgrounds, ask them questions, and learn some basic words. I also believe communication is the very first step to truly understand a culture and if we learn the language, we would be able to communicate effectively.",
      "If I were to take part in a cultural festival, I would display the beauty of my language to the audience and show how meaningful it is. I'd teach them some poetic phrases that carry deep meanings and give them the closest translation of the words that don't even exist in other languages. language is the heart of every culture and is the first step for getting to know a culture or people. Once people hear how beautiful and rich my language is, they'll understand my people better and feel more connected to us.\"",
      "Personally, I believe these festivals serve both purposes, but more importantly, they value cultural differences and show how unique each culture is in its own way. They encourage people to protect their culture from dying out and to feel happy and proud that they belong to that culture and share it with others rather than feeling ashamed of it or making the effort to turn into a monoculture."
    ]
  },
  {
    "id": "is-real-27",
    "topic": "People'S Experiences With Music",
    "scenario": "You have agreed to participate in a research study about people's experiences with music. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for agreeing to take part in the study. I'd like to ask you some questions about your experiences with music. First, how important is music in your life? Why?",
      "Great. That's interesting. Now, if you had to choose, would you rather create music yourself or listen to music created by others? Why?",
      "Okay. Noted. Do you think music should be a required part of children's education? Why or why not?",
      "Fair enough. Final question. Some people believe that live music has a stronger impact than recorded music. Do you agree or disagree with that? Why or why not?"
    ],
    "samples": [
      "Music plays an important role in my life. First, it helps me pass the time, especially when I’m commuting. For example, when I’m on the subway, instead of listening to people complaining or making noise, I listen to calm music that helps me relax and regain my energy. Second, music also supports me emotionally during difficult times. Whenever I feel down, listening to empowering music helps me regain my confidence and belief in myself. This way, music can sometimes feel like a true friend that comforts me.",
      "I would rather listen to music created by others. First, I do not play any musical instruments, and even if I did, I am a perfectionist. Because of that, I assume I would focus too much on flaws in my own music instead of actually enjoying it. Second, I enjoy listening to new and different kinds of music. Creating music myself would require listening to the same piece repeatedly in order to adjust and improve it, which would probably become boring for me, so, listening to music created by others feels more enjoyable.",
      "I believe music should be a required part of children’s education. First, studying all day can become exhausting and boring for students. Children are not robots; they need variety. Music can help them release stress and negative energy while improving their mood and motivation. Second, I think music encourages creativity and helps students think outside the box. It allows them to express themselves they may never have imagined before. As a result, it can improve their confidence and make them feel proud of their achievements.",
      "I totally agree that live music has a stronger impact than recorded music. First, live music creates a much stronger emotional atmosphere. During live performances, people often dance, sing, laugh, or even cry together, which makes the experience more powerful and memorable while recorded music does not create the same level of excitement and energy. Second, concerts and live performances help people socialize and connect with others and learn about their similarities and differences which makes the experience more fun."
    ]
  },
  {
    "id": "is-real-28",
    "topic": "People'S Experiences With Art And Creativity",
    "scenario": "You have volunteered for a research study at your university about people's experiences with art and creativity. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for your participation. I'd like to learn about your experiences with art and creativity. Do you consider yourself to be a creative person? Why or why not?",
      "Great. Some people think that learning about art is just as important as learning science or math. Do you agree or disagree? Why?",
      "Interesting. Some people believe that engaging in creative activities can improve mental well-being. Do you agree or disagree? Why?",
      "Good points. One final question. Do you think future schools will teach more art or less? What factors might influence this?"
    ],
    "samples": [
      "Yes, I consider myself a creative person. First, I have always wanted to be different from others. I enjoy exploring different styles, thinking in unique ways, and expressing myself rather than simply following what everyone else does. I believe creativity allows people to stand out and show their individuality. Second, I am an ambitious person, and we live in a world with a lot of competition. In order to achieve our goals and compete successfully, we need to be creative and find new ways to solve problems instead of just doing things the same way as everyone else.",
      "I agree that learning about art is just as important as learning science or math. First, art is an important part of human culture, and many people today are interested in it. Having some background knowledge about art helps us start conversations easier and connect with people who share similar interests. Second, learning about art can broaden our knowledge and increase our confidence. It teaches us to look at the world from different perspectives and express our thoughts differently.",
      "I agree that engaging in creative activities can improve mental well-being. First, creative activities can help people take their minds off stressful situations. They will temporarily forget about their worries and enter a more peaceful state of mind. Second, seeing the results of their creativity can give people a sense of achievement and pride. When they realize they are capable of creating something valuable, their self-confidence increases. Over time, this can help them develop a more positive self-image and improve their mental health.",
      "Yes, I think future schools will probably teach more art. First, with the advancement of technology, practicality and technical skills alone are no longer enough. The final product or project also needs to be visually appealing in order to attract people and communicate ideas effectively. Therefore, regardless of the field students work in, they will need to learn how to present and introduce their work in a more creative and artistic way. Second, art helps students develop critical thinking skills. Teaching art at school can encourage students to think differently and become more innovative."
    ]
  },
  {
    "id": "is-real-29",
    "topic": "People'S Experiences With Job Satisfaction",
    "scenario": "You have agreed to participate in a research study about people's experiences with job satisfaction. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for helping with our study. I'd like to ask you some questions about your job satisfaction. First, what do you think are the most important things to consider when looking for a job?",
      "Got it. That's helpful. Now, can you describe a job that either you or one of your friends has had? What kind of work was involved?",
      "Noted,Moving on, what kinds of things do you think can lead people to feel unhappy in their work? Can you tell me about one or two of them?",
      "Great. And finally, some people believe that working for a large company offers more advantages than working for a small company, while others prefer the opposite. What do you think and why?"
    ],
    "samples": [
      "There are several important things to consider when looking for a job. First, the work environment should be safe and supportive. We spend a great deal of our time at work with our colleagues, so if they are kind and encouraging, it can make our daily life more productive. Second, salary is another important factor to consider. Especially today, most people are under financial stress and low salary can cost them their peace of mind.",
      "My friend Nahid used to work as a hair colorist. She spent months practicing and taking courses until she became skilled in this profession. Her job involved coloring and styling people’s hair, which required both creativity and technical skill. She really enjoyed this work and found it fun and interesting. However, over time she realized that it was not very rewarding financially and was also physically demanding. So even though she liked it, she eventually decided to leave the job and pursue other professions.",
      "There are a couple of things that can make me feel unhappy at work. First, having to communicate with negative or constantly complaining people can be very draining. It can make you feel exhausted even when you are not doing physically difficult work. Over time, this can reduce overall job satisfaction. Second, salary is also an important factor. Working all day and then feeling that the financial reward is not enough can be very discouraging. It can lower motivation and make people feel unhappy about their job.",
      "Personally, I prefer large companies. First, large companies are more likely to offer better benefits, such as meals, health insurance, and higher salaries compared to smaller companies. Second, large corporations often have branches in different cities and even countries. For someone like me who enjoys traveling and experiencing different cultures, this is a great advantage because it allows me to work in different locations while still earning an income, which is usually not possible in smaller firms."
    ]
  },
  {
    "id": "is-real-30",
    "topic": "Interview Topic 30",
    "scenario": "You have signed up for a study run by a university research group that is investigating volunteering and community service. You will have a short online interview with a r",
    "turns": [
      "esearcher. The researcher will ask you some questions.",
      "I rarely participate in volunteer or community service activities. One reason is that volunteering is not very common in my community, so there are not many opportunities available around me. However, whenever I come across activities that support orphaned children, I immediately try to participate. It is something I feel deeply connected to, and I find it difficult not to help. I believe most people naturally feel sympathy and compassion toward children who are in difficult situations.",
      "A few years ago, an organization in my area used to raise fund to help homeless people because their numbers were increasing, and we would often see them sleeping on the streets. The money that was raised was used to build shelters that included rooms and basic necessities for daily life. They also announced that anyone in need could stay there and receive support. Over time, the number of homeless people living on the streets noticeably decreased, so the project seemed to have a very positive impact on the community and it was a successful and meaningful effort.",
      "My manager sponsors an orphanage, and recently he invited me and some colleagues to visit the children with him. We spent time playing with them and trying to make them happy. The experience was both heartbreaking and eye-opening. It was sad because some of the children had incurable illnesses and I couldn't stop myself from crying. This experience also made me realize how many blessings I have in my own life. It reminded me how fortunate I am and taught me to be more grateful for the things I often take for granted."
    ],
    "samples": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about your experiences with volunteering and community service. First, have you ever participated in any volunteer activities, and if you do, how often do you volunteer?",
      "Thank you. Can you tell me about a charity effort or a donation drive that you have heard about that made an impact on where you live?",
      "Interesting. Can you describe a public service project that you have been involved in or would like to participate in if you had the time?",
      "Great. Some people believe that volunteering should be a mandatory part of the school curriculum to help students develop a sense of community. Do you agree or disagree with this idea? Why?"
    ]
  },
  {
    "id": "is-real-31",
    "topic": "Music Preferences",
    "scenario": "You received an email from your university inviting you to join a research study about music preferences. You have scheduled a short online interview with a researcher to answer a few questions.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about your music preferences. First, how often do you listen to music? Do you listen daily, weekly, or less often?",
      "Thank you. What genres or types of music do you usually enjoy listening to? For example, do you prefer classical, rock or jazz music? Give details to explain your answer.",
      "Interesting. Can you tell me about a concert or live music event you would like to attend? Why would you make that particular choice?",
      "Great, some people believe that music can have a powerful effect on our emotions or moods. Do you agree or disagree with this view point? Why?"
    ],
    "samples": [
      "I listen to music almost daily, especially in the morning when I'm heading to work because playing some songs make me feel empowered. They energize me, refresh my mood, and reassure me that I'm capable and strong. Also music helps block out people's nagging and negativity while I'm on my way. For example, when I am commuting to work, I can avoid hearing about people’s daily problems by playing my music.",
      "Personally, I listen to all types of music, to be honest because what draws me in isn't really the genre but it's the meaning behind the song. I really connect with songs that have deep, thoughtful lyrics and content that makes me feel something good. So, I consider myself a complete omnivore when it comes to music. I don't limit myself to one style and what matters is the words, the rhythm, or just the feeling it gives me.",
      "There is one concert I would really love to attend and it is for a very well-known singer named Alsahir. He's an Arab singer, and what draws me to him is his poetry. His lyrics are powerful and written specifically for women, celebrating their value and, beauty, strength. On top of that, his voice has this freeing quality and makes the audience fly with every single word. So, I always imagine that experiencing his concert would be unique and unforgettable.",
      "Yes, I completely agree that music has a powerful effect on our emotions and moods and I've experienced this myself. Whenever I listen to empowering music, it brings me back to life and makes me feel hopeful, no matter what my circumstances are. However, when I come across sad music, I suddenly find myself in the depths of despair for no particular reason. So I see it as medicine that plays a defining role in shaping our mood and our spirit.\""
    ]
  },
  {
    "id": "is-real-32",
    "topic": "Exercise Programs",
    "scenario": "You have volunteered for a research study at your university about exercise programs. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about exercise programs. First, do you think exercising daily is important for good health? Why or why not?",
      "Thank you. Imagine you are going to recommend or create an exercise program for a friend or family member who does not currently exercise. What kind of exercise or fitness routine would you recommend? Why?",
      "Interesting. For that same friend or family member, what do you think might challenge them the most about a regular exercise program? How would you help them through this challenge?",
      "Great, some people believe that it is important to have some sort of reward after a good week of exercising. What do you think would be a good reward for the program you created, and why?"
    ],
    "samples": [
      "Yes, I believe exercising every day is important for maintaining good health. First, regular exercise improves our physical health. It strengthens our muscles, keeps our bodies active, and gives us more energy throughout the day. Second, people are daily under so much pressure and stress from work or school that having exercise as art of our daily routine can help relieve stress, improve our mood, and support our mental health.",
      "Personally, I would recommend dancing as a form of exercise. First, dancing keeps almost every part of the body active, which improves overall fitness, strength, and flexibility. It is also enjoyable, so people are more likely to stick with it. When people enjoy the exercise they are doing, they feel motivated to continue, making it easier to turn it into a habit that they will not break. Second, dancing has many mental health benefits. It helps reduce stress, improve mood, and boost confidence.",
      "I think the biggest challenge for them would be staying disciplined. They often start something with a lot of enthusiasm, but after a while they lose motivation and stop doing it. To help them, I would encourage them to think a few months ahead and imagine the progress they could make if they stayed consistent. I would also remind them that the beginning is always the hardest part. Once exercise becomes a habit, it feels much easier to do.",
      "I think a good reward would be giving yourself time to do something you have been postponing because of a busy schedule, such as watching a movie, going out with friends, or spending time on a favorite hobby. This kind of reward helps people relax after a week of hard work and exercise. It also motivates them to stay consistent, because they know there is something enjoyable waiting for them at the end of the week. This way, they will stick to their exercise, never skip a day, and will eventually see the outcome of their dedication."
    ]
  },
  {
    "id": "is-real-33",
    "topic": "Sleep Habits",
    "scenario": "You have volunteered for a research study about sleep habits. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for your time. I'd like to ask you some questions about your sleep habits First do you usually go to bed early or late?",
      "Okay, thanks. What is your typical routine before bedtime? What do you usually do before going to bed?",
      "Great. Now, some people have trouble sleeping when they stay overnight at a hotel or at a friend's house. Are you able to sleep well in unfamiliar places? Why or why not?",
      "Many parents worry about their teenage children getting enough sleep. Some high schools have considered starting later in the morning to allow teenage students more time to sleep each night. What do you think of this idea? Explain why."
    ],
    "samples": [
      "Personally, I usually go to bed early. My job is physically demanding, so by the end of the day I'm usually exhausted. I also have to wake up early the next morning, so getting enough sleep is important for me. If I stay up too late, I won't have enough energy to perform well at work the next day. This decreases my productivity and my energy at work and makes me anxious and impatient. That is why to avoid all these consequences, I prefer going to bed early.",
      "I have these tasks to attend to before going to bed. The first task is taking a shower. A shower is a fixed part of my schedule. Then I would prepare something to eat for dinner if I'm hungry, and would get my clothes ready for the next day. I like to make sure everything is prepared in advance so I don't have to rush and get myself stressed out in the morning. After that, I study for an hour or two or listen to an audio book. Once I'm done with all that, I go straight to bed.",
      "I can sleep well in unfamiliar places, only under certain conditions. First, the place has to feel completely safe. Staying somewhere unfamiliar already creates some stress, and if I also have to worry about my safety, my mind won't be able to relax, and I won't be able to fall asleep. Second, I usually need to be physically exhausted after a long and tiring day. If I'm really tired, I can simply lie down and fall asleep without paying much attention to the fact that I'm in a different place.",
      "Personally, I’m not in favor of the idea that schools should start later to give students the chance to get extra sleep because I don’t think it would achieve the intended goal. First, if students are expected to start school later, many of them will still probably go to bed later as well. As a result, their sleeping habits probably won’t change very much, and they won't get more sleep. Second, waking up early is a hard thing to do and can help children develop discipline and responsibility from a young age and help them become more reliable adults."
    ]
  },
  {
    "id": "is-real-34",
    "topic": "Sleep Habits",
    "scenario": "You have volunteered for a research study about sleep habits. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for your time. I'd like to ask you some questions about your sleep habits First do you usually go to bed early or late?",
      "Okay, thanks. What is your typical routine before bedtime? What do you usually do before going to bed?",
      "Great. Now, some people have trouble sleeping when they stay overnight at a hotel or at a friend's house. Are you able to sleep well in unfamiliar places? Why or why not?",
      "Many parents worry about their teenage children getting enough sleep. Some high schools have considered starting later in the morning to allow teenage students more time to sleep each night. What do you think of this idea? Explain why."
    ],
    "samples": [
      "Personally, I usually go to bed early. My job is physically demanding, so by the end of the day I'm usually exhausted. I also have to wake up early the next morning, so getting enough sleep is important for me. If I stay up too late, I won't have enough energy to perform well at work the next day. This decreases my productivity and my energy at work and makes me anxious and impatient. That is why to avoid all these consequences, I prefer going to bed early.",
      "I have these tasks to attend to before going to bed. The first task is taking a shower. A shower is a fixed part of my schedule. Then I would prepare something to eat for dinner if I'm hungry, and would get my clothes ready for the next day. I like to make sure everything is prepared in advance so I don't have to rush and get myself stressed out in the morning. After that, I study for an hour or two or listen to an audio book. Once I'm done with all that, I go straight to bed.",
      "I can sleep well in unfamiliar places, only under certain conditions. First, the place has to feel completely safe. Staying somewhere unfamiliar already creates some stress, and if I also have to worry about my safety, my mind won't be able to relax, and I won't be able to fall asleep. Second, I usually need to be physically exhausted after a long and tiring day. If I'm really tired, I can simply lie down and fall asleep without paying much attention to the fact that I'm in a different place.",
      "Personally, I’m not in favor of the idea that schools should start later to give students the chance to get extra sleep because I don’t think it would achieve the intended goal. First, if students are expected to start school later, many of them will still probably go to bed later as well. As a result, their sleeping habits probably won’t change very much, and they won't get more sleep. Second, waking up early is a hard thing to do and can help children develop discipline and responsibility from a young age and help them become more reliable adults."
    ]
  },
  {
    "id": "is-real-35",
    "topic": "Time Management",
    "scenario": "You received an email from your university inviting you to join a research study about time management. You have scheduled a short online interview with a researcher to answer a few questions.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about your time management habits. First, Do you use any tools or techniques to manage your time effectively? Please give some examples.",
      "Thank you. Can you describe a typical day's events for you and how you organize your time?",
      "Interesting. Tell me about a time when you had to manage multiple tasks or responsibilities at once. How did you handle it?",
      "Great. Some people believe that managing your time wisely can lead to higher productivity, while others think it can cause unnecessary stress and prefer a looser schedule. What is your opinion on this? Why?"
    ],
    "samples": [
      "Personally, I manage my time by following one simple concept: I do things as soon as they need to be done instead of putting them off until later. It's been my experience that whenever I postpone a task, I probably won’t get back to it. That’s why I try to complete tasks immediately, regardless of how I feel or how difficult they are. I believe this habit helps me stay productive, avoid unnecessary stress, and manage my time much more effectively. I also feel relieved for completing a task because I don’t have to regret not doing it later.",
      "A typical day for me starts at 6:00 a.m. I get myself ready, head to the subway to catch the train so I can get to work by 7:15. At work, I monitor the construction activities and the workers' activities, and write reports about the progress of the project every single day. I also make several calls and coordinate with different teams every day. After work, I go back home, do my tasks, and spend some time reading. Then I go to bed and follow the same routine the next day.",
      "The pace of work on a construction project changes all the time. Some days are quiet, while on other days I have so many responsibilities that I barely have a moment to breathe. On one particularly busy day, I had to supervise several work teams at the same time, assign tasks to workers, monitor their progress, coordinate with different teams, and answer phone calls. I handled the situation by staying calm and prioritizing my tasks. By the end of the day, everything stayed on track.",
      "I prefer following a strict and organized schedule rather than a loose one. First, a well-planned schedule motivates people to take their responsibilities seriously and treat time as something valuable instead of wasting their time sleeping or chatting with friends, which can increase their productivity. Second, I actually believe that not having a well-organized schedule can lead to even more stress because without a clear plan, people don’t know when they will accomplish their goals, which puts them under so much unnecessary pressure and stress."
    ]
  },
  {
    "id": "is-real-36",
    "topic": "Food And Nutrition",
    "scenario": "As part of a university project, you have agreed to take part in a short research interview about food and nutrition. A graduate student conducting the research will ask you some questions online.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about your food and nutrition habits. First, do you follow any specific diet or eating plan?",
      "Thank you. Can you describe some foods that you eat on a regular basis?",
      "Interesting. Tell me about a time when you or someone you know made a significant change to their diet. What was the change and what motivated you or the person you know to make it?",
      "Great, some people say they have difficulty maintaining a healthy diet because they do not like the taste of healthier foods. What do you think about that argument? Why?"
    ],
    "samples": [
      "",
      "",
      "",
      ""
    ]
  },
  {
    "id": "is-real-37",
    "topic": "Interview Topic 37",
    "scenario": "You have signed up for a study run by a university research group that is investigating transportation habits. You will have a short video interview with one of the researchers. The researcher will ask you some questions.",
    "turns": [
      "Thank you for your participation. Today, I'd like to ask you some questions about your transportation habits. What kind of transportation do your family or friends generally prefer when they travel? For example, do they like boats, buses, trains, cars, or planes?",
      "I see. What do you think of the public transportation system in the place you live? Tell me one thing you especially like or dislike.",
      "Interesting. Next, I'd like to get your opinion. In recent years, there has been a push toward working from home instead of in an office building. Do you think that in the future more people will work from home? Why or why not?",
      "Good points. I just have one more question. Some people believe that improving public transportation systems is essential for reducing traffic congestion and pollution in cities. Do you agree with this idea or do you think there are other solutions to these problems? Explain why you think so."
    ],
    "samples": [
      "My family and friends generally prefer trains for transportation, especially when traveling between cities. First, trains don't get stuck in traffic, so they don't have to worry about being late or wondering when they'll reach their destination but they can be certain how long the journey will take, which makes traveling much less stressful. Second, trains are a relatively safe way to travel. The risk of accidents is quite low, which gives them a sense of comfort and allows them to enjoy the journey without worrying too much.",
      "I can describe the subway system as one of the main forms of public transportation where I live. The subway network covers most of the city, so people can easily access different parts of the city by train. The trains are also generally in good condition and are equipped with heating and air-conditioning systems, which make the journey more comfortable for passengers. Another thing I especially like is that the government recently decided to make subway travel free until further notice. This decision has made public transportation more affordable and accessible to everyone.",
      "I believe that in the future, more people will be motivated to work from home. First, employees can be more productive when they have the flexibility to work in a place and at a time that suits them best since they can concentrate better and perform more efficiently, which ultimately benefits the company. Second, employers can save a great deal of money by reducing their need for office space. They can cut costs such as rent, electricity, and maintenance, and furnishing expenses, so remote work can be financially beneficial as well which further pushes the decision to work from home.",
      "I definitely agree that improving public transportation is essential for reducing traffic congestion and pollution. First, many people use their cars for their daily commute. But, If public transportation becomes more accessible and convenient, fewer people will rely on their cars and issues related to traffic and pollution will be resolved. Second, People are always looking for ways to reduce their expenses, so if they have access to an affordable public transportation system, they will be more willing to use it which can further reduce both traffic and pollution."
    ]
  },
  {
    "id": "is-real-38",
    "topic": "Interview Topic 38",
    "scenario": "You have signed up for a study run by a university research group that is investigating travel habits. You will have a short video interview with one of the researchers. The researcher will ask you some questions.",
    "turns": [
      "Thank you for participating in this study. Today, I'd like to ask you some questions about your travel habits. First, can you tell me about a recent trip you or a friend took, and what you or the friend enjoyed most about it?",
      "I see. One important part of traveling is deciding to go alone or with a group. Thinking about a place you would like to visit, would you prefer to go there alone or with a group? Why?",
      "Interesting. For many people, one of the most exciting parts of travel is choosing a destination. If you are going to select a place to travel, how would you go about making a list of potential places? Please describe your process.",
      "Good points. Finally, one major issue with travel today is overcrowding. Popular places have so many tourists visiting at one time that the sites are unable to allow all the people to visit who want to. As a result, virtual travel experiences are becoming more common compared to real life travel. Do you think a virtual travel experience is worthwhile? Why or why not?"
    ],
    "samples": [
      "Recently, I took a short trip with a group of people to a nearby river, where we learned a little bit about surfing and enjoyed being out in nature. What I enjoyed most about the trip was the people I met for the first time. Even though we had never met before, we got along really well. We shared a little about ourselves, talked about our experiences, and discovered things we had in common. In general, I really enjoyed meeting these new people and connecting with them in such a relaxed environment.",
      "When visiting a place I like to see, I’d prefer to go with a friend rather than by myself. First, I believe that people experience greater happiness and a stronger sense of accomplishment when they can share special moments with others. So, having a friend by my side would make the experience more meaningful and give me the sense of satisfaction afterwards. Second, people often have doubts when they experience something for the first time. Having someone by my side can give me the courage to take a step forward and try new things, which can greatly add to my confidence.",
      "I would go through three main steps when choosing a travel destination. First, since I’m a nature-oriented person, I would write down places that are known for their beautiful nature and scenery. Second, I would narrow down my list based on my budget and eliminate destinations that are too expensive. Finally, once I have a smaller and more focused list, I would consider how much time I need to make the most of each destination. This would help me decide how many days I need to take off work and whether my boss would approve it.",
      "I believe nothing can replace a real-life travel experience, no matter how much technology advances. However, under certain circumstances, I think virtual travel can be worthwhile. First, some destinations are extremely far away or require a lengthy visa process and a large budget to visit. In such cases, a virtual trip can be a quick and affordable alternative. Second, virtual travel can be especially useful for students and researchers. Such virtual tour can give them access to valuable information without requiring them to actually travel there which allows them to continue their studies."
    ]
  },
  {
    "id": "is-real-39",
    "topic": "Dining Preferences",
    "scenario": "You have volunteered for a research study at your university about dining preferences. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for agreeing to participate. I'd like to ask you some questions about your dining preferences. First, how often do you eat out at restaurants? Do you do this daily, weekly, monthly, or less often?",
      "Thank you. If you were going to eat out, what types of cuisine do you prefer? For example, do you like savory foods or desserts?",
      "Interesting. Can you tell me about a memorable dining experience or meal you or a friend have had recently? What made it special or stand out?",
      "Great. Some people believe that the atmosphere and service at a restaurant are just as important as the food quality. Do you agree or disagree with this viewpoint? Why?"
    ],
    "samples": [
      "I very rarely eat out at restaurants. The reason is that I’m not a person with a big appetite, so I don’t usually crave food or feel the need to try different tastes. Because of that, I don’t see the point in spending money on something I don’t really enjoy. I’d rather save my money or spend it on something I actually care about. In particular, I prefer spending money on experiences that add something valuable to my life and make me feel happier and more fulfilled.",
      "I prefer desserts when I eat out. For me, savory foods are more or less the same everywhere, but desserts can vary greatly from one place to another. The differences in their ingredients, flavors, and cooking methods can make trying desserts a really enjoyable experience. In fact, I usually don’t have the tendency to eat out, but discovering new and unique desserts is one of the things that can convince me to eat out.",
      "One memorable dining experience I had recently was when I went to a restaurant with my colleagues. We ordered several types of pizza and shared them with each other, which made the meal more enjoyable. The food itself was good, but what made the experience special was the atmosphere. We were all relaxed, talking and laughing. I think what made it memorable was not just the food, but the fact that we were able to spend quality time together and enjoy each other’s company in a less stressful environment.",
      "I totally agree with this statement that the atmosphere and service at a restaurant are just as important as the food quality. First, people often go to restaurants not only for the food, but also to enjoy their time, relax, and get away from the stress of daily life. Sitting in a noisy or uncomfortable environment, even while eating delicious food, would not make the experience very enjoyable or memorable. Second, good service can make customers feel valued and welcomed. When the staff are friendly, people are more likely to enjoy their meal and want to come back again."
    ]
  },
  {
    "id": "is-real-40",
    "topic": "People'S Experiences With Fashion And Clothing",
    "scenario": "You have agreed to participate in a research study about people's experiences with fashion and clothing. You will have a short online interview with a researcher. The researcher will ask you some questions.",
    "turns": [
      "Thank you for signing up for the study. I'd like to ask you some questions about your experiences with fashion and clothing. First, do you enjoy shopping for clothes or is it something you find tedious? Why?",
      "Great, noted. Now what types of clothes do you usually prefer to wear? Do you have a particular style you enjoy?",
      "Fair enough. How do you decide what to wear each day? Do you choose your clothes in the morning or the night before?",
      "Got it. And finally, some people believe that fashion trends change too quickly, and that spending money on new fashions is wasteful. Do you agree or disagree with this viewpoint? Why or why not?"
    ],
    "samples": [
      "I definitely enjoy shopping for clothes. First, I think clothes play an important role in building our confidence. When we wear something that suits us well, we tend to feel more comfortable and confident, which also improves the way we present ourselves to others. Secondly, shopping helps me keep up with the latest fashion trends. It allows me to see how styles are changing. So, I don't find shopping tedious at all. Instead, I think it's an enjoyable and rewarding way to spend my free time.",
      "I mostly buy clothes for work because that is where I spend most of my time, so I always keep my job in mind when I go shopping. Because of that, I usually choose clothes that are comfortable and suitable for the work environment. I prefer anything that allows me to move around easily and do my job more efficiently. However, when I attend special occasions, such as parties, comfort becomes less important. In those situations, I choose clothes that make me look more confident, even if they are not as comfortable as my everyday work clothes.",
      "definitely choose what I'm going to wear the night before. First, I usually don't have much time in the morning. I have to get dressed and leave for work, so I don't have time to think about which clothes to wear. I also like to make sure my clothes are clean, properly ironed, and fit me well. Preparing everything the night before saves me time. Secondly, I'm an organized person and I like to plan things in advance. I don't like uncertainty, especially when it's something I can control. Planning ahead makes me feel calmer, more prepared, and more in control of my day.",
      "I totally disagree with the viewpoint that spending money on fashion is wasteful. First, the way we dress can influence the quality of our interactions and the opportunities we receive. so dressing well can increase our confidence and help us make a positive first impression. Second, I don't think spending money on fashion is necessarily a waste because fashion trends often come back. Styles that are popular today may disappear for a few years and then become fashionable again. As a result, people can keep their clothes and wear them again later."
    ]
  },
  {
    "id": "is-real-41",
    "topic": "Personal Finances",
    "scenario": "As part of a university research project, you have agreed to take part in a short interview about personal finances. A graduate student conducting the research will ask you some questions.",
    "turns": [
      "Thanks in advance for your time today. I'd like to ask you about your personal finance habits. To start off, do you typically keep a budget for your expenses, or do you manage them informally?",
      "Got it. Next question. Everyone has different spending habits. Who or what would you say most influences the way you make money-related choices? Your family, your friends or your own experience? Why?",
      "Great, thanks for that input. Now if you were to receive extra money, like as a gift, how would you decide what to do with it? For instance, would you spend it or save it and why?",
      "Thanks for sharing. And now for the last question. Some experts believe that personal finance should be something that schools teach to prepare young people for future money management. Do you agree or disagree with this idea? What impact do you think it would have on students?"
    ],
    "samples": [
      "",
      "",
      "",
      ""
    ]
  }
];
INTERVIEW_SETS.push(...EXTRA_INTERVIEW_SETS_2026);
