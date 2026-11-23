import json
import pathlib
import re
from pypdf import PdfReader

ROOT = pathlib.Path(r"E:\TOEFL-GRE\curated\files\TOEFL_2026")
OUT_JS = pathlib.Path(r"E:\TOEFL-GRE\toefl-study-suite\data\toefl-full-mocks.js")


def clean_text(s: str) -> str:
    s = (s or "").replace("\u00a0", " ").replace("\ufb01", "fi").replace("\ufb02", "fl").replace("\ufb00", "ff")
    s = s.replace("\u2014", " - ").replace("\u2013", "-")
    s = re.sub(r"[ \t]+", " ", s)
    return s.strip()


def normalize_sentence_tokens(prompt_line: str, raw_choices: str, answer_sentence: str):
    """Build {prompt, layout, choices, answer} compatible with Build-a-Sentence UI."""
    # Parse choices split by '/'
    choices = [clean_text(c) for c in raw_choices.split("/") if clean_text(c)]
    # Determine exact ordered answer chunks matching choices
    ans_clean = re.sub(r"[.?!]+$", "", clean_text(answer_sentence)).strip()
    # Match template slots from prompt_line (e.g. "The _____ _____ ... fantastic.")
    tokens = re.split(r"(_+)", prompt_line)
    layout = []
    slot_idx = 0
    for tok in tokens:
        if not tok:
            continue
        if re.fullmatch(r"_+", tok):
            layout.append({"slot": slot_idx})
            slot_idx += 1
        else:
            t = tok.strip()
            if t:
                layout.append({"text": t})

    # Reconstruct ordered chunks from choices to match ans_clean
    ordered = match_chunks_to_answer(ans_clean, layout, choices)
    if not ordered or len(ordered) != slot_idx:
        # Fallback: treat entire answer sentence as slot-per-choice if layout mismatch
        return None
    return {
        "layout": layout,
        "choices": choices,
        "answer": ordered,
        "fullAnswer": clean_text(answer_sentence),
    }


def match_chunks_to_answer(ans_clean: str, layout, choices):
    """Greedy backtracking matcher aligning fixed layout texts and choices against answer sentence."""
    target = re.sub(r"\s+", " ", ans_clean.lower()).strip()
    # Strip leading/trailing punctuation from target
    target = re.sub(r"^[.,?!\s]+|[.,?!\s]+$", "", target)
    n_slots = sum(1 for p in layout if "slot" in p)
    used = [False] * len(choices)
    result = []

    def norm_piece(s: str) -> str:
        return re.sub(r"[.,?!]+$", "", re.sub(r"\s+", " ", s.lower()).strip()).strip()

    def backtrack(pos_in_layout: int, rem: str):
        rem = rem.lstrip(" ,.")
        if pos_in_layout == len(layout):
            return len(rem.strip(" .?!")) == 0
        part = layout[pos_in_layout]
        if "text" in part:
            fixed = norm_piece(part["text"])
            if not fixed:
                return backtrack(pos_in_layout + 1, rem)
            if rem.startswith(fixed):
                nxt = rem[len(fixed):]
                if not nxt or nxt[0] in " ,.?!'":
                    return backtrack(pos_in_layout + 1, nxt)
            return False
        # Try matching an unused choice
        for i, ch in enumerate(choices):
            if used[i]:
                continue
            ch_n = norm_piece(ch)
            if rem.startswith(ch_n):
                nxt = rem[len(ch_n):]
                if not nxt or nxt[0] in " ,.?!'":
                    used[i] = True
                    result.append(ch)
                    if backtrack(pos_in_layout + 1, nxt):
                        return True
                    result.pop()
                    used[i] = False
        return False

    if backtrack(0, target) and len(result) == n_slots:
        return result
    return None


def parse_ets_practice_test_1():
    """Parse Official ETS 2026 Practice Test 1 completely with exact official keys."""
    r = PdfReader(str(ROOT / "01_Official_Guides_and_Rubrics/toefl-ibt-full-length-practice-test-1.pdf"))
    pages = [(pg.extract_text() or "").strip() for pg in r.pages]

    def parse_key_page(pg_text: str):
        keys = {}
        for m in re.finditer(r"(?m)^\s*(\d+)\s+([A-Za-z]+)\s*$", pg_text):
            keys[int(m.group(1))] = m.group(2).strip()
        return keys

    r_m1_keys = parse_key_page(pages[12])  # Page 13
    r_m2_keys = parse_key_page(pages[13])  # Page 14
    l_m1_keys = parse_key_page(pages[24])  # Page 25
    l_m2_keys = parse_key_page(pages[25])  # Page 26

    # Exact Reading Module 1 & 2 full clean passages + MCQs
    r_m1_ctw_full = (
        "We know from drawings that have been preserved in caves for over 10,000 years that early humans "
        "performed dances as a group activity. We might think that prehistoric people concentrated only on "
        "basic survival. However, it is clear from the record that dancing was important to them. They "
        "recorded more drawings of dances than of any other group activity. Dances served various purposes, "
        "including ritualistic communication with the divine, storytelling, and social cohesion."
    )
    r_m2_ctw_full = (
        "The human brain is a complex organ responsible for controlling all bodily functions and enabling "
        "thought, emotion, and memory. It is divided into several regions, each with specific roles. The "
        "cerebrum, its largest part, is involved in cognitive functions such as reasoning, planning, and "
        "language. The cerebellum coordinates movement and balance, while the brainstem controls vital "
        "bodily functions like breathing and heart rate. Together, they enable the brain to perform its various tasks."
    )

    def parse_mcqs(text_block: str, key_map: dict):
        # Remove page footer lines
        text_block = re.sub(r"TOEFL iBT®?\s*Practice\s*T\s*est\s*1\s*\d*", "", text_block)
        qs = []
        pattern = re.compile(
            r"(?m)^(\d+)\.\s+(.*?)\n\s*\(A\)\s+(.*?)\n\s*\(B\)\s+(.*?)\n\s*\(C\)\s+(.*?)\n\s*\(D\)\s+(.*?)(?=\n\d+\.|\Z)",
            re.S,
        )
        for m in pattern.finditer(text_block):
            qnum = int(m.group(1))
            qtext = clean_text(re.sub(r"\s+", " ", m.group(2)))
            opts = [clean_text(re.sub(r"\s+", " ", m.group(k))) for k in (3, 4, 5, 6)]
            letter = key_map.get(qnum, "A")
            idx = {"A": 0, "B": 1, "C": 2, "D": 3}.get(letter, 0)
            qs.append({
                "num": qnum,
                "q": qtext,
                "choices": opts,
                "answer": opts[idx],
                "answerLetter": letter,
                "explanation": f"Official answer: ({letter}) {opts[idx]}",
            })
        return qs

    def split_passage_and_mcqs(raw_block: str, key_map: dict):
        m = re.search(r"(?m)^\d+\.\s+", raw_block)
        if not m:
            return clean_text(raw_block), []
        passage_part = raw_block[:m.start()].strip()
        q_part = raw_block[m.start():].strip()
        passage_part = re.sub(r"TOEFL iBT®?\s*Practice\s*T\s*est\s*1\s*\d*", "", passage_part).strip()
        return passage_part, parse_mcqs(q_part, key_map)

    # Reading Mod 1 passages
    p4_notice = pages[3][pages[3].find("Read a notice.") + len("Read a notice."):]
    rm1_dl1_txt, rm1_dl1_qs = split_passage_and_mcqs(p4_notice, r_m1_keys)
    p5_social = pages[4][pages[4].find("Read a social media post.") + len("Read a social media post."):]
    rm1_dl2_txt, rm1_dl2_qs = split_passage_and_mcqs(p5_social, r_m1_keys)
    p67_acad = pages[5] + "\n" + pages[6]
    rm1_ac_txt, rm1_ac_qs = split_passage_and_mcqs(p67_acad, r_m1_keys)
    rm1_ac_lines = [l.strip() for l in rm1_ac_txt.splitlines() if l.strip()]
    rm1_ac_title = rm1_ac_lines[0] if rm1_ac_lines else "The Mirror Test"
    rm1_ac_body = "\n".join(rm1_ac_lines[1:])

    # Reading Mod 2 passages
    p9_email = pages[8][pages[8].find("Read an email.") + len("Read an email."):]
    rm2_dl1_txt, rm2_dl1_qs = split_passage_and_mcqs(p9_email, r_m2_keys)
    p10_email = pages[9][pages[9].find("Read an email.") + len("Read an email."):]
    rm2_dl2_txt, rm2_dl2_qs = split_passage_and_mcqs(p10_email, r_m2_keys)
    p1112_acad = pages[10] + "\n" + pages[11]
    rm2_ac_txt, rm2_ac_qs = split_passage_and_mcqs(p1112_acad, r_m2_keys)
    rm2_ac_lines = [l.strip() for l in rm2_ac_txt.splitlines() if l.strip()]
    rm2_ac_title = rm2_ac_lines[0] if rm2_ac_lines else "The Paradox of Choice"
    rm2_ac_body = "\n".join(rm2_ac_lines[1:])

    # Listening Module 1 & Module 2 items
    def parse_listening_module(raw_pages: str, key_map: dict, mod_id: str):
        txt = re.sub(r"TOEFL iBT®?\s*Practice\s*T\s*est\s*1\s*\d*", "", raw_pages)
        # Split into Choose the best response (items 1-8) and Conversations/Announcements/Talks
        items = []
        # Find sections by markers
        sections = re.split(
            r"(?=(?:Choose the best response\.|Listen to a conversation\.|Listen to an announcement[^\n]*\.|Listen to a talk[^\n]*\.))",
            txt,
        )
        for sec in sections:
            sec = sec.strip()
            if not sec:
                continue
            if sec.startswith("Choose the best response."):
                qs = parse_mcqs(sec, key_map)
                for q in qs:
                    # The question stem IS the spoken prompt ("Woman: Didn't I just see you...")
                    items.append({
                        "id": f"{mod_id}-q{q['num']}",
                        "kind": "Choose a Response",
                        "title": f"Quick Response {q['num']}",
                        "script": q["q"],
                        "questions": [{
                            "q": "Choose the best response to what you heard.",
                            "choices": q["choices"],
                            "answer": q["answer"],
                            "explanation": q["explanation"],
                        }],
                    })
            elif sec.startswith("Listen to "):
                first_nl = sec.find("\n")
                header = sec[:first_nl].strip().rstrip(".")
                body = sec[first_nl + 1:].strip()
                script_txt, qs = split_passage_and_mcqs(body, key_map)
                if qs:
                    kind = (
                        "Conversation" if "conversation" in header.lower()
                        else "Announcement" if "announcement" in header.lower()
                        else "Academic Talk"
                    )
                    items.append({
                        "id": f"{mod_id}-{kind.lower().replace(' ', '_')}-{qs[0]['num']}",
                        "kind": kind,
                        "title": header.replace("Listen to ", "").capitalize(),
                        "script": clean_text(re.sub(r"\n+", "\n", script_txt)),
                        "questions": qs,
                    })
        return items

    lm1_items = parse_listening_module(pages[16] + "\n" + pages[17] + "\n" + pages[18] + "\n" + pages[19], l_m1_keys, "ets1-lm1")
    lm2_items = parse_listening_module(pages[21] + "\n" + pages[22] + "\n" + pages[23], l_m2_keys, "ets1-lm2")

    # Writing: 10 official Build-a-Sentence + Email + Academic Discussion
    w_ans_map = {}
    for m in re.finditer(r"(?m)^(\d+)\s+(.+)$", pages[31]):
        w_ans_map[int(m.group(1))] = clean_text(m.group(2))

    w_bas_raw = re.sub(r"TOEFL iBT®?\s*Practice\s*T\s*est\s*1\s*\d*", "", pages[27] + "\n" + pages[28])
    bas_items = []
    bas_pat = re.compile(r"(?m)^(\d+)\.\s+(.+?)\n(.+?)\n([^\n]+/[^\n]+)", re.S)
    for m in bas_pat.finditer(w_bas_raw):
        num = int(m.group(1))
        prompt = clean_text(m.group(2))
        template_line = clean_text(m.group(3))
        choices_line = clean_text(m.group(4))
        ans_sent = w_ans_map.get(num, "")
        built = normalize_sentence_tokens(template_line, choices_line, ans_sent)
        if built:
            bas_items.append({"id": f"ets1-bas-{num}", "prompt": prompt, **built})

    email_task = {
        "id": "ets1-email",
        "title": "Poetry Magazine Submission Problem",
        "to": "editor@sunshinepoetrymagazine.com",
        "subject": "Problem using submission form",
        "scenario": (
            "A new poetry magazine has asked its readers for submissions, and you decided to submit two of your poems. "
            "However, you had a problem using the online submission form, and you are not certain that your submissions were received. "
            "Write an email to the editor: (1) Tell the editor what you like about the new magazine. "
            "(2) Describe the problem you experienced. (3) Ask about the status of your submissions."
        ),
        "modelEmail": (
            "Subject: Problem using submission form\n\n"
            "Dear Editor,\n\n"
            "I recently discovered Sunshine Poetry Magazine and truly appreciate its focus on emerging voices and vivid contemporary imagery. "
            "Yesterday evening, I tried to submit two of my original poems through your online form, but the page froze right after I clicked submit and never displayed a confirmation message.\n\n"
            "Could you please check whether my two poems were received under my name? If they did not go through, I would be happy to resubmit them promptly. Thank you for your time and assistance.\n\n"
            "Best regards,\nAlex"
        ),
    }

    discussion_task = {
        "id": "ets1-disc",
        "title": "Mandatory High School Volunteerism",
        "professorPrompt": (
            "Volunteerism refers to offering your time without financial compensation to benefit a community. "
            "Some high schools require students to complete volunteer hours to graduate. "
            "Should high school students be required to do volunteer work? Why or why not?\n\n"
            "Student A: Yes, requiring volunteer hours helps teenagers build civic responsibility and see that their effort matters.\n"
            "Student B: No, many students already work part-time jobs or care for siblings, so mandatory hours add unfair stress."
        ),
        "modelResponse": (
            "While I understand Student A's point about building civic awareness, I agree with Student B that volunteer work should remain optional in high school. "
            "True community service relies on genuine motivation; when schools turn helping others into a graduation hurdle, many students simply rush through hours without forming lasting empathy. "
            "Moreover, teenagers from lower-income families often hold after-school jobs or care for younger siblings, so a mandatory quota penalizes those with the fewest spare hours. "
            "Instead of requiring service, schools can highlight local volunteer opportunities and recognize active contributors, encouraging authentic participation without adding unequal pressure."
        ),
    }

    # Speaking: 7 Listen & Repeat + 4 Take an Interview
    lr_items = [
        {"id": "ets1-lr-1", "text": "We have a variety of wildlife.", "context": "Zoo Visitor Orientation"},
        {"id": "ets1-lr-2", "text": "Bears, wolves, and large cats are to the right.", "context": "Zoo Visitor Orientation"},
        {"id": "ets1-lr-3", "text": "You can find sea lions and elephants further down the path.", "context": "Zoo Visitor Orientation"},
        {"id": "ets1-lr-4", "text": "Please, no outside food or drinks, and do not feed the animals.", "context": "Zoo Visitor Orientation"},
        {"id": "ets1-lr-5", "text": "Avoid banging or tapping on the displays and enclosures.", "context": "Zoo Visitor Orientation"},
        {"id": "ets1-lr-6", "text": "For those with children, we offer summer camps and educational opportunities.", "context": "Zoo Visitor Orientation"},
        {"id": "ets1-lr-7", "text": "The visitor's center, located near the front entrance, can give you more information.", "context": "Zoo Visitor Orientation"},
    ]

    interview_items = [
        {
            "id": "ets1-int-1",
            "turn": 1,
            "scenario": "You have agreed to take part in a research study about urban life.",
            "text": "Do you currently live in a big city, a small town, or a village?",
        },
        {
            "id": "ets1-int-2",
            "turn": 2,
            "scenario": "Urban life research interview (Turn 2/4)",
            "text": "Some people find cities dynamic and exciting, while others find them overwhelming and draining. What kind of reaction do you have to cities, and why?",
        },
        {
            "id": "ets1-int-3",
            "turn": 3,
            "scenario": "Urban life research interview (Turn 3/4)",
            "text": "Do you agree that people who live in cities lead more interesting lives because of access to jobs and leisure activities? Why or why not?",
        },
        {
            "id": "ets1-int-4",
            "turn": 4,
            "scenario": "Urban life research interview (Turn 4/4)",
            "text": "Do you think city governments should create more parks in urban areas to promote happiness and life satisfaction? Why or why not?",
        },
    ]

    return {
        "id": "mock-official-1",
        "title": "Practice Test 1 (Official 2026 Format)",
        "subtitle": "Complete 4-section exam aligned with ETS Practice Test 1",
        "reading": {
            "module1": {
                "title": "Reading Part 1",
                "minutes": 18,
                "ctw": {"title": "Prehistoric Cave Dances", "category": "Archaeology", "text": r_m1_ctw_full},
                "passages": [
                    {"id": "ets1-r1-dl1", "kind": "Daily Life Notice", "title": "Municipal Charter Paperless Billing", "text": rm1_dl1_txt, "questions": rm1_dl1_qs},
                    {"id": "ets1-r1-dl2", "kind": "Social Media Post", "title": "Saturday Farmer's Market", "text": rm1_dl2_txt, "questions": rm1_dl2_qs},
                    {"id": "ets1-r1-ac1", "kind": "Academic Passage", "title": rm1_ac_title, "text": rm1_ac_body, "questions": rm1_ac_qs},
                ],
            },
            "module2": {
                "title": "Reading Part 2",
                "minutes": 18,
                "ctw": {"title": "The Human Brain", "category": "Biology", "text": r_m2_ctw_full},
                "passages": [
                    {"id": "ets1-r2-dl1", "kind": "Daily Life Email", "title": "Art Workshop Confirmation", "text": rm2_dl1_txt, "questions": rm2_dl1_qs},
                    {"id": "ets1-r2-dl2", "kind": "Daily Life Email", "title": "Gym Grand Opening Invite", "text": rm2_dl2_txt, "questions": rm2_dl2_qs},
                    {"id": "ets1-r2-ac1", "kind": "Academic Passage", "title": rm2_ac_title, "text": rm2_ac_body, "questions": rm2_ac_qs},
                ],
            },
        },
        "listening": {
            "module1": {"title": "Listening Part 1", "minutes": 15, "items": lm1_items},
            "module2": {"title": "Listening Part 2", "minutes": 14, "items": lm2_items},
        },
        "writing": {
            "buildASentence": bas_items,
            "email": email_task,
            "discussion": discussion_task,
        },
        "speaking": {
            "repeat": lr_items,
            "interview": interview_items,
        },
    }


def parse_tst_reading_100():
    """Extract all Daily Life + Academic Passages + Answers & Explanations from TST Prep 2026 Reading 100."""
    r = PdfReader(str(ROOT / "02_Reading_Complete_the_Words_and_Passages/toefl-reading-100-questions-freebie-2026.pdf"))
    pages = [(pg.extract_text() or "").strip() for pg in r.pages]

    # Parse answer key + explanations from pages 35..48 (indices 34..47)
    key_blob = "\n".join(pages[34:])
    key_blob = re.sub(r"100 Practice Questions for the TOEFL®?\s*Reading Section\s*TST Prep", "", key_blob)
    answers = {}
    ans_pat = re.compile(r"(?m)^(\d{3})\.\s+([A-D])\s*\n(.*?)(?=\n\d{3}\.\s+[A-D]\s*\n|\Z)", re.S)
    for m in ans_pat.finditer(key_blob):
        qnum = int(m.group(1))
        letter = m.group(2).strip()
        exp = clean_text(re.sub(r"\s+", " ", m.group(3)))
        # Trim trailing section headers leaked into last explanation
        exp = re.sub(r"\s+\d{1,2}\s*$", "", exp)
        answers[qnum] = (letter, exp[:420])

    # Parse Daily Life (pages 11..24 -> indices 10..23) and Academic Passages (pages 26..34 -> indices 25..33)
    def extract_tst_mcqs(block: str):
        block = re.sub(r"100 Practice Questions for the TOEFL®?\s*Reading Section\s*TST Prep", "", block)
        qs = []
        pat = re.compile(
            r"(?m)^(\d{3})\.\s+(.*?)\n\s*a\.\s+(.*?)\n\s*b\.\s+(.*?)\n\s*c\.\s+(.*?)\n\s*d\.\s+(.*?)(?=\n\d{3}\.\s+|\Z)",
            re.S,
        )
        for m in pat.finditer(block):
            qnum = int(m.group(1))
            qtext = clean_text(re.sub(r"\s+", " ", m.group(2)))
            opts = [clean_text(re.sub(r"\s+", " ", m.group(k))) for k in (3, 4, 5, 6)]
            # Strip trailing page number from option d
            opts[3] = re.sub(r"\s+\d{1,2}\s*$", "", opts[3]).strip()
            letter, exp = answers.get(qnum, ("A", ""))
            idx = {"A": 0, "B": 1, "C": 2, "D": 3}.get(letter, 0)
            qs.append({
                "num": qnum,
                "q": qtext,
                "choices": opts,
                "answer": opts[idx],
                "explanation": exp or f"Correct answer: ({letter}) {opts[idx]}",
            })
        return qs

    daily_blob = "\n".join(pages[10:24])
    daily_blob = re.sub(r"100 Practice Questions for the TOEFL®?\s*Reading Section\s*TST Prep", "", daily_blob)
    daily_chunks = re.split(r"(?=(?:Read an email\.|Read an announcement\.|Read a text chain\.))", daily_blob)
    daily_sets = []
    for idx_c, ch in enumerate(daily_chunks, 1):
        ch = ch.strip()
        if not ch.startswith("Read "):
            continue
        nl = ch.find("\n")
        kind_line = ch[:nl].strip().rstrip(".")
        rest = ch[nl + 1:].strip()
        m_q = re.search(r"(?m)^\d{3}\.\s+", rest)
        if not m_q:
            continue
        # Note: in TST Prep PDF, text appears AFTER questions on some pages or BEFORE on others; check both!
        qs = extract_tst_mcqs(rest)
        if not qs:
            continue
        # Extract passage text by removing question blocks
        # On TST pages, often questions appear first or passage appears first; clean cleanly:
        first_q = m_q.start()
        before_q = rest[:first_q].strip()
        # Find end of last question
        last_d = list(re.finditer(r"(?m)^\s*d\.\s+[^\n]+", rest))
        after_q = rest[last_d[-1].end():].strip() if last_d else ""
        passage_text = before_q if len(before_q) > len(after_q) else after_q
        passage_text = re.sub(r"(?m)^\d{1,2}\s*$", "", passage_text).strip()
        if len(passage_text) < 40:
            continue
        kind = "Text Messages" if "text chain" in kind_line.lower() else ("Notice" if "announcement" in kind_line.lower() else "Daily Life Email")
        title_line = [l.strip() for l in passage_text.splitlines() if len(l.strip()) > 6][0][:60]
        daily_sets.append({
            "id": f"tst-dl-{idx_c}",
            "kind": kind,
            "title": clean_text(title_line),
            "text": clean_text(passage_text),
            "questions": qs,
        })

    # Academic passages: pages 26-27, 28-29, 30-31, 32-33, 34-35 (5 exact pairs)
    acad_pairs = [(25, 26), (27, 28), (29, 30), (31, 32), (33, 34)]
    acad_sets = []
    for idx_a, (p_start, p_end) in enumerate(acad_pairs, 1):
        block = pages[p_start] + "\n" + (pages[p_end] if p_end < len(pages) else "")
        block = re.sub(r"100 Practice Questions for the TOEFL®?\s*Reading Section\s*TST Prep", "", block)
        m_q = re.search(r"(?m)^\d{3}\.\s+", block)
        if not m_q:
            continue
        p_raw = re.sub(r"(?m)^\d{1,2}\s*$", "", block[:m_q.start()]).strip()
        lines = [l.strip() for l in p_raw.splitlines() if l.strip()]
        if not lines:
            continue
        title = clean_text(lines[0])
        body = clean_text("\n".join(lines[1:]))
        qs = extract_tst_mcqs(block[m_q.start():])
        if len(body) > 150 and qs:
            acad_sets.append({
                "id": f"tst-ac-{idx_a}",
                "kind": "Academic Passage",
                "title": title,
                "text": body,
                "questions": qs,
            })

    return daily_sets, acad_sets


def parse_tst_writing_bas():
    """Extract 30 Build-a-Sentence items + 5 Emails + 5 Academic Discussions from TST Prep Writing 2026."""
    r = PdfReader(str(ROOT / "05_Writing_Sentence_Email_and_Discussion/toefl-writing-100-questions-freebie-2026.pdf"))
    pages = [(pg.extract_text() or "").strip() for pg in r.pages]

    # Answer key for Build-a-Sentence is on pages 25-26 (indices 24-25)
    ans_blob = pages[24] + "\n" + pages[25]
    ans_blob = re.sub(r"Free Writing Practice 2026.*?Writing Section", "", ans_blob)
    ans_map = {}
    for m in re.finditer(r"(?m)^(\d+)\.\s+(.+)$", ans_blob):
        num = int(m.group(1))
        if 1 <= num <= 30:
            ans_map[num] = clean_text(m.group(2))

    # Questions 1-30 on pages 3-13 (indices 2-12)
    q_blob = "\n".join(pages[2:13])
    q_blob = re.sub(r"Free Writing Practice 2026.*?Writing Section", "", q_blob)
    q_blob = re.sub(r"(?m)^\d{1,2}\s*$", "", q_blob)

    items = []
    # Split by question number "1." .. "30."
    parts = re.split(r"(?m)^(\d{1,2})\.\s+", q_blob)
    for i in range(1, len(parts) - 1, 2):
        num = int(parts[i])
        if num not in ans_map:
            continue
        body_lines = [clean_text(ln) for ln in parts[i + 1].splitlines() if clean_text(ln)]
        # Find line with underscores and line with slashes
        u_idx = next((idx for idx, l in enumerate(body_lines) if "___" in l), None)
        s_idx = next((idx for idx, l in enumerate(body_lines) if "/" in l), None)
        if u_idx is None or s_idx is None or u_idx == 0:
            continue
        prompt = " ".join(body_lines[:u_idx])
        tmpl = body_lines[u_idx]
        ch_line = " ".join(body_lines[s_idx:s_idx + 2]) if s_idx + 1 < len(body_lines) and "/" in body_lines[s_idx + 1] else body_lines[s_idx]
        built = normalize_sentence_tokens(tmpl, ch_line, ans_map[num])
        if built:
            items.append({"id": f"tst-bas-{num}", "prompt": prompt, **built})

    return items


def build_curated_listening_sets():
    """High-craft 2026 Listening Module sets (Choose a Response + Conversations + Announcements + Academic Talks) for Mocks 2-5."""
    return [
        # Mock 2 Listening (Mod 1 + Mod 2)
        {
            "m1": [
                {"id": "m2-l1-1", "kind": "Choose a Response", "title": "Quick Response 1", "script": "Man: Have you seen my lab notebook anywhere?", "questions": [{"q": "Choose the best response.", "choices": ["I think you left it near the printer.", "Yes, the lab is on the third floor.", "I bought a blue notebook yesterday.", "The experiment starts at two."], "answer": "I think you left it near the printer.", "explanation": "Directly answers where the notebook might be."}]},
                {"id": "m2-l1-2", "kind": "Choose a Response", "title": "Quick Response 2", "script": "Woman: Would you mind turning down the music a little?", "questions": [{"q": "Choose the best response.", "choices": ["Sure, sorry about that.", "Yes, I love this album too.", "I listened to it last night.", "The concert was sold out."], "answer": "Sure, sorry about that.", "explanation": "Politely agrees to the request."}]},
                {"id": "m2-l1-3", "kind": "Choose a Response", "title": "Quick Response 3", "script": "Man: When does registration for summer classes open?", "questions": [{"q": "Choose the best response.", "choices": ["Starting next Monday morning.", "I took two classes last summer.", "The registrar office is upstairs.", "Yes, it is required for seniors."], "answer": "Starting next Monday morning.", "explanation": "Gives the time when registration begins."}]},
                {"id": "m2-l1-4", "kind": "Choose a Response", "title": "Quick Response 4", "script": "Woman: Do you think we should reserve a study room for Thursday?", "questions": [{"q": "Choose the best response.", "choices": ["Good idea, they fill up fast during midterms.", "No, Thursday is after Wednesday.", "I studied in the cafe alone.", "The library closes at midnight."], "answer": "Good idea, they fill up fast during midterms.", "explanation": "Agrees and explains why reserving is smart."}]},
                {"id": "m2-l1-5", "kind": "Conversation", "title": "Campus Library Book Hold", "script": "Student: Hi, I got an email saying the textbook I requested is ready for pickup.\nLibrarian: Let me check your student ID. Ah, yes, Introduction to Microeconomics. Here it is. Just a heads-up, because it's on high-demand course reserve, the loan period is only three days instead of two weeks.\nStudent: Oh, good thing you told me! Can I renew it online if I need an extra day?\nLibrarian: Reserve books can't be renewed online, so you'll need to bring it back to the desk by Friday at 5 PM.", "questions": [
                    {"q": "Why is the loan period shorter than usual?", "choices": ["The student has overdue fines.", "The book is on high-demand course reserve.", "The library is closing for renovations.", "Only reference books can leave the library."], "answer": "The book is on high-demand course reserve.", "explanation": "The librarian explains high-demand reserve books have a 3-day limit."},
                    {"q": "What must the student do by Friday at 5 PM?", "choices": ["Renew the book on the website", "Pay a deposit at the desk", "Return the book to the desk in person", "Email the professor for an extension"], "answer": "Return the book to the desk in person", "explanation": "Reserve books cannot be renewed online and must be brought back to the desk."}
                ]},
                {"id": "m2-l1-6", "kind": "Announcement", "title": "Campus Shuttle Detour", "script": "Attention riders on the North Campus Shuttle. Due to water-main repairs along Oak Avenue, the shuttle will bypass the Science Hall stop today and tomorrow. Passengers heading to Science Hall should exit at the Engineering Plaza stop, which is a three-minute walk east. Normal service resumes Thursday morning at 7 AM.", "questions": [
                    {"q": "Why is the shuttle skipping Science Hall?", "choices": ["A campus festival is blocking the road.", "Water-main repairs are underway on Oak Avenue.", "The shuttle driver is on a new route.", "Science Hall is closed for cleaning."], "answer": "Water-main repairs are underway on Oak Avenue.", "explanation": "The announcement states water-main repairs on Oak Avenue cause the detour."},
                    {"q": "Where should Science Hall passengers get off?", "choices": ["North Gate", "Main Library", "Engineering Plaza", "Student Union"], "answer": "Engineering Plaza", "explanation": "Riders are advised to exit at Engineering Plaza."}
                ]},
                {"id": "m2-l1-7", "kind": "Academic Talk", "title": "Urban Heat Islands", "script": "Professor: Have you ever noticed that downtown areas feel noticeably warmer at night than nearby suburbs or farmland? Environmental scientists call this the urban heat island effect. Dark surfaces like asphalt roads and tar roofs absorb solar radiation all day and release it slowly after sunset. Meanwhile, cities have fewer trees, which normally cool the air through shade and evaporation. One practical solution cities are adopting is cool roofs painted with reflective white coatings, along with planting street trees along major corridors. Studies show these two simple changes can lower peak neighborhood temperatures by two to four degrees Celsius.", "questions": [
                    {"q": "What is the main cause of urban heat islands mentioned by the professor?", "choices": ["Heavy rainfall in downtown areas", "Dark building and road surfaces absorbing and releasing heat", "High winds blocked by suburban trees", "Subway tunnels warming the soil"], "answer": "Dark building and road surfaces absorbing and releasing heat", "explanation": "Asphalt and dark roofs absorb solar heat and release it slowly after dark."},
                    {"q": "Which solution does the professor mention?", "choices": ["Replacing sidewalks with gravel", "Building taller glass skyscrapers", "Using reflective cool roofs and planting street trees", "Closing downtown streets during winter"], "answer": "Using reflective cool roofs and planting street trees", "explanation": "Cool reflective roofs and street trees can cut peak temperatures by 2-4 degrees Celsius."}
                ]}
            ],
            "m2": [
                {"id": "m2-l2-1", "kind": "Choose a Response", "title": "Quick Response 1", "script": "Woman: Did Professor Kim post the slides from today's lecture?", "questions": [{"q": "Choose the best response.", "choices": ["Not yet, she said she'd upload them tonight.", "Yes, the lecture hall was full.", "I forgot to bring my laptop.", "Her office hours are on Tuesday."], "answer": "Not yet, she said she'd upload them tonight.", "explanation": "Directly answers whether the slides are posted."}]},
                {"id": "m2-l2-2", "kind": "Choose a Response", "title": "Quick Response 2", "script": "Man: I can't get the projector to connect to my laptop.", "questions": [{"q": "Choose the best response.", "choices": ["Try switching to the other HDMI adapter on the desk.", "The presentation is ten minutes long.", "Yes, I already printed the handouts.", "Let's meet in the cafeteria instead."], "answer": "Try switching to the other HDMI adapter on the desk.", "explanation": "Offers a direct troubleshooting suggestion."}]},
                {"id": "m2-l2-3", "kind": "Choose a Response", "title": "Quick Response 3", "script": "Woman: Are you coming to the career fair this afternoon?", "questions": [{"q": "Choose the best response.", "choices": ["I plan to stop by right after my two o'clock class.", "Yes, I updated my resume last month.", "The gymnasium is across from the pool.", "She got an internship in Boston."], "answer": "I plan to stop by right after my two o'clock class.", "explanation": "Directly states attendance plans."}]},
                {"id": "m2-l2-4", "kind": "Conversation", "title": "Group Presentation Timing", "script": "Woman: We just did a practice run of our history presentation and it ran fourteen minutes.\nMan: Wait, isn't the maximum limit ten minutes?\nWoman: Yes, and the professor deducts points if we go over. I think my section on early trade routes has too many dates.\nMan: Let's trim those minor dates and combine the last two slides into one summary chart. That should easily save four minutes.", "questions": [
                    {"q": "What problem did the students discover during practice?", "choices": ["Their slides were missing images.", "Their presentation was four minutes too long.", "They forgot to include trade routes.", "The professor moved the deadline earlier."], "answer": "Their presentation was four minutes too long.", "explanation": "It ran 14 minutes against a 10-minute maximum."},
                    {"q": "How do they plan to fix the problem?", "choices": ["Speak twice as fast", "Ask the professor for extra time", "Cut minor dates and merge the final two slides", "Remove the introduction completely"], "answer": "Cut minor dates and merge the final two slides", "explanation": "They agree to trim minor dates and combine the last two slides."}
                ]},
                {"id": "m2-l2-5", "kind": "Academic Talk", "title": "Bioluminescence in the Deep Sea", "script": "Professor: Below two hundred meters in the ocean, sunlight disappears almost completely. Yet over seventy-five percent of deep-sea organisms produce their own light through a chemical reaction called bioluminescence. Why spend precious energy making light in the dark? Scientists have identified three main roles: attracting prey, confusing predators with sudden flashes, and finding mates across vast empty water. Interestingly, most deep-sea light is blue-green because those wavelengths travel farthest through seawater. A few rare dragonfish, however, emit red light, which almost no other deep-sea creature can detect, giving them a private searchlight while hunting.", "questions": [
                    {"q": "Why is most deep-sea bioluminescence blue-green?", "choices": ["Blue-green chemicals are cheaper for fish to digest.", "Blue-green wavelengths travel farthest in seawater.", "Predators are blind to blue-green light.", "Sunlight reflects blue-green colors at great depth."], "answer": "Blue-green wavelengths travel farthest in seawater.", "explanation": "The professor notes blue-green wavelengths travel farthest through seawater."},
                    {"q": "What makes certain dragonfish unusual?", "choices": ["They live near the ocean surface.", "They cannot produce any light.", "They emit red light that most other species cannot see.", "They only glow during daytime."], "answer": "They emit red light that most other species cannot see.", "explanation": "Red light acts like a private searchlight invisible to most other deep-sea creatures."}
                ]}
            ]
        },
        # Mock 3 Listening (Mod 1 + Mod 2)
        {
            "m1": [
                {"id": "m3-l1-1", "kind": "Choose a Response", "title": "Quick Response 1", "script": "Woman: Excuse me, is this seat taken?", "questions": [{"q": "Choose the best response.", "choices": ["No, go right ahead.", "Yes, I bought the ticket online.", "The bus arrives in five minutes.", "I prefer sitting near the window."], "answer": "No, go right ahead.", "explanation": "Natural direct response confirming the seat is free."}]},
                {"id": "m3-l1-2", "kind": "Choose a Response", "title": "Quick Response 2", "script": "Man: Why was the chemistry workshop postponed?", "questions": [{"q": "Choose the best response.", "choices": ["The lab equipment didn't arrive on time.", "Yes, it starts at three o'clock.", "I already finished the worksheet.", "It's in the basement of North Hall."], "answer": "The lab equipment didn't arrive on time.", "explanation": "Directly explains the reason for the postponement."}]},
                {"id": "m3-l1-3", "kind": "Choose a Response", "title": "Quick Response 3", "script": "Woman: Could you proofread my cover letter before I send it?", "questions": [{"q": "Choose the best response.", "choices": ["Of course, email it over and I'll look tonight.", "Yes, I sent my application yesterday.", "The post office closes at five.", "It's a very competitive position."], "answer": "Of course, email it over and I'll look tonight.", "explanation": "Accepts the request and says how to share the letter."}]},
                {"id": "m3-l1-4", "kind": "Conversation", "title": "Dining Hall Meal Plan Change", "script": "Student: Hi, I'm on the 19-meal-per-week plan, but I keep leaving five or six meals unused every Sunday.\nAdvisor: That's very common for sophomores who start cooking in their dorms. You can switch down to the 12-meal plan and put the difference into campus dining dollars.\nStudent: Do dining dollars roll over to spring semester?\nAdvisor: Yes, unused dining dollars roll over from fall to spring, though unused weekly meal swipes reset every Sunday night.", "questions": [
                    {"q": "Why does the student want to change meal plans?", "choices": ["The dining hall food is too spicy.", "Several weekly meals go unused every week.", "The student is moving off campus tomorrow.", "The 19-meal plan does not cover breakfast."], "answer": "Several weekly meals go unused every week.", "explanation": "The student mentions leaving 5-6 meals unused every Sunday."},
                    {"q": "What happens to unused dining dollars at the end of fall semester?", "choices": ["They expire immediately.", "They are refunded in cash.", "They carry over to the spring semester.", "They convert into weekly swipes."], "answer": "They carry over to the spring semester.", "explanation": "The advisor explains dining dollars roll over from fall to spring."}
                ]},
                {"id": "m3-l1-5", "kind": "Academic Talk", "title": "The Spacing Effect in Memory", "script": "Professor: Students often feel confident after rereading a chapter for four straight hours the night before an exam. Cognitive psychologists call this massed practice, or cramming. While it creates a short-term illusion of fluency, retention drops sharply within a week. By contrast, distributing those same four hours across four separate days produces far stronger long-term memory. This phenomenon, known as the spacing effect, works because allowing slight forgetting between sessions forces the brain to actively reconstruct the memory trace, strengthening neural pathways each time you retrieve it.", "questions": [
                    {"q": "According to the professor, why does cramming feel effective at first?", "choices": ["It permanently strengthens neural pathways.", "It creates a short-term illusion of fluency.", "It requires less total study time.", "It eliminates test anxiety completely."], "answer": "It creates a short-term illusion of fluency.", "explanation": "Massed practice creates short-term familiarity that fades quickly."},
                    {"q": "Why does spaced practice improve long-term recall?", "choices": ["Slight forgetting forces active memory retrieval.", "Students sleep longer during cramming weeks.", "Teachers give easier questions on spaced topics.", "Reading chapters twice is unnecessary."], "answer": "Slight forgetting forces active memory retrieval.", "explanation": "Reconstructing a memory after a gap strengthens the memory trace."}
                ]}
            ],
            "m2": [
                {"id": "m3-l2-1", "kind": "Choose a Response", "title": "Quick Response 1", "script": "Man: How long does it take to walk to the train station?", "questions": [{"q": "Choose the best response.", "choices": ["About fifteen minutes if you cut through the park.", "The train leaves from platform three.", "I took a taxi there last week.", "Yes, tickets are cheaper online."], "answer": "About fifteen minutes if you cut through the park.", "explanation": "Directly answers the duration question."}]},
                {"id": "m3-l2-2", "kind": "Choose a Response", "title": "Quick Response 2", "script": "Woman: Did you remember to back up the survey data?", "questions": [{"q": "Choose the best response.", "choices": ["Yes, I saved a copy to the shared drive.", "Over two hundred people answered.", "The survey ends on Friday.", "No, I haven't read the textbook yet."], "answer": "Yes, I saved a copy to the shared drive.", "explanation": "Confirms the backup was completed."}]},
                {"id": "m3-l2-3", "kind": "Announcement", "title": "Campus Art Gallery Extended Hours", "script": "Good evening, visitors. In honor of the Annual Student Photography Exhibition, the university art gallery will stay open until 9 PM every Thursday this month. Admission remains free with a student ID, and student photographers will host brief Q&A sessions at 7 PM.", "questions": [
                    {"q": "What change is being announced?", "choices": ["Gallery admission now requires a fee.", "The gallery will stay open later on Thursdays this month.", "The photography exhibition has been canceled.", "Only photography majors may enter on Thursdays."], "answer": "The gallery will stay open later on Thursdays this month.", "explanation": "Hours are extended until 9 PM on Thursdays."}
                ]},
                {"id": "m3-l2-4", "kind": "Academic Talk", "title": "Keystone Species in Ecosystems", "script": "Professor: Not all species play an equal role in keeping an ecosystem balanced. Ecologists use the term keystone species for an organism whose impact on its environment is disproportionately large relative to its population size. A classic example is the sea otter along the Pacific coast. Sea otters eat sea urchins. When otters disappear, urchin populations explode and devour underwater kelp forests, wiping out habitat for dozens of fish and crab species. Reintroducing even a modest number of otters allows kelp forests to recover dramatically.", "questions": [
                    {"q": "What defines a keystone species?", "choices": ["It is the largest predator in the world.", "It has the biggest population in an ecosystem.", "Its ecological impact is huge relative to its small numbers.", "It can survive in every climate zone."], "answer": "Its ecological impact is huge relative to its small numbers.", "explanation": "Keystone species exert a disproportionately large effect relative to population size."},
                    {"q": "What happens to kelp forests when sea otters disappear?", "choices": ["Kelp grows twice as fast.", "Sea urchins multiply and destroy the kelp.", "Fish and crabs move to deeper coral reefs.", "Water temperature drops rapidly."], "answer": "Sea urchins multiply and destroy the kelp.", "explanation": "Without otters eating them, sea urchins overgraze the kelp."}
                ]}
            ]
        },
    ]


def main():
    ets1 = parse_ets_practice_test_1()
    tst_daily, tst_acad = parse_tst_reading_100()
    tst_bas = parse_tst_writing_bas()
    curated_listening = build_curated_listening_sets()

    # Load existing toefl-suite-bank.js to pull verified CTW, Emails, Discussions, and Listening clips for Mocks 2 & 3
    suite_js = pathlib.Path(r"E:\TOEFL-GRE\toefl-study-suite\data\toefl-suite-bank.js").read_text(encoding="utf-8")
    suite_bank, _ = json.JSONDecoder().raw_decode(suite_js, suite_js.index("{"))
    ctw_pool = suite_bank["reading"]["completeTheWords"]
    email_pool = suite_bank["writing"]["emails"]
    disc_pool = suite_bank["writing"]["discussions"]

    # Assemble Mock 2 & Mock 3 using freshly extracted TST Prep passages + TST BAS + Curated Listening + Suite Emails/Discussions
    def make_curated_mock(mock_num: int, title: str, subtitle: str, dl_slice, ac_slice, bas_slice, ctw_pair, listen_pair, email_idx: int, disc_idx: int, speak_seed: int):
        return {
            "id": f"mock-curated-{mock_num}",
            "title": title,
            "subtitle": subtitle,
            "reading": {
                "module1": {
                    "title": "Reading Part 1",
                    "minutes": 18,
                    "ctw": ctw_pair[0],
                    "passages": [dl_slice[0], dl_slice[1], ac_slice[0]],
                },
                "module2": {
                    "title": "Reading Part 2",
                    "minutes": 18,
                    "ctw": ctw_pair[1],
                    "passages": [dl_slice[2], dl_slice[3], ac_slice[1]],
                },
            },
            "listening": {
                "module1": {"title": "Listening Part 1", "minutes": 12, "items": listen_pair["m1"]},
                "module2": {"title": "Listening Part 2", "minutes": 10, "items": listen_pair["m2"]},
            },
            "writing": {
                "buildASentence": bas_slice,
                "email": email_pool[email_idx % len(email_pool)],
                "discussion": disc_pool[disc_idx % len(disc_pool)],
            },
            "speaking": {
                "useBankSeed": speak_seed,
            },
        }

    mocks = [ets1]
    if len(tst_daily) >= 8 and len(tst_acad) >= 4 and len(tst_bas) >= 20:
        mocks.append(make_curated_mock(
            2,
            "Practice Test 2 (Science & Campus)",
            "Full 4-section test featuring Evolution of Money & Hidden Life of Soil",
            tst_daily[0:4],
            tst_acad[0:2],
            tst_bas[0:10],
            [ctw_pool[5], ctw_pool[12]],
            curated_listening[0],
            2,
            3,
            1,
        ))
        mocks.append(make_curated_mock(
            3,
            "Practice Test 3 (Tech & Psychology)",
            "Full 4-section test featuring Facial Recognition & The Pull of Nostalgia",
            tst_daily[4:8],
            tst_acad[2:4],
            tst_bas[10:20],
            [ctw_pool[20], ctw_pool[32]],
            curated_listening[1],
            8,
            11,
            2,
        ))

    payload = {
        "mocks": mocks,
        "extraReadingPassages": (
            ets1["reading"]["module1"]["passages"]
            + ets1["reading"]["module2"]["passages"]
            + tst_daily
            + tst_acad
        ),
        "extraBuildASentence": ets1["writing"]["buildASentence"] + tst_bas,
    }

    js_out = (
        "// Auto-generated by scripts/ingest_toefl_mocks.py from curated 2026 TOEFL sources.\n"
        f"const TOEFL_FULL_MOCKS = {json.dumps(payload, ensure_ascii=False)};\n"
        "if (typeof window !== \"undefined\") { window.TOEFL_FULL_MOCKS = TOEFL_FULL_MOCKS; }\n"
    )
    OUT_JS.write_text(js_out, encoding="utf-8")

    print("SUCCESS ->", OUT_JS)
    print("  Full Mocks:", len(mocks))
    for mk in mocks:
        r1q = 10 + sum(len(p["questions"]) for p in mk["reading"]["module1"]["passages"])
        r2q = 10 + sum(len(p["questions"]) for p in mk["reading"]["module2"]["passages"])
        l1q = sum(len(it["questions"]) for it in mk["listening"]["module1"]["items"])
        l2q = sum(len(it["questions"]) for it in mk["listening"]["module2"]["items"])
        print(f"    - {mk['title']}: Reading {r1q}+{r2q} Qs, Listening {l1q}+{l2q} Qs, BAS {len(mk['writing']['buildASentence'])} Qs")
    print("  Extra Reading Passages absorbed:", len(payload["extraReadingPassages"]))
    print("  Extra Build-a-Sentence absorbed:", len(payload["extraBuildASentence"]))


if __name__ == "__main__":
    main()
