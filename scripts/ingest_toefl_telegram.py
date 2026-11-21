#!/usr/bin/env python3
"""
Ingests curated TOEFL 2026 Telegram study assets from E:\TOEFL-GRE\curated\files
into toefl-study-suite (expanding Speaking banks + building data/toefl-suite-bank.js + copying audio).
"""
import os
import re
import gzip
import json
import base64
import shutil
import zipfile
import sqlite3
import tempfile
from html import unescape
from pathlib import Path

import docx
from pypdf import PdfReader

CUR = Path(r"E:\TOEFL-GRE\curated\files")
REPO = Path(r"E:\TOEFL-GRE\toefl-study-suite")
DATA = REPO / "data"
AUDIO_OUT = REPO / "assets" / "audio"
LISTENING_OUT = AUDIO_OUT / "listening"

AUDIO_OUT.mkdir(parents=True, exist_ok=True)
LISTENING_OUT.mkdir(parents=True, exist_ok=True)

TAG_RE = re.compile(r"<[^>]+>")

def clean_html(s: str) -> str:
    if not s:
        return ""
    s = re.sub(r"<br\s*/?>", " ", s, flags=re.I)
    s = TAG_RE.sub("", s)
    return re.sub(r"\s+", " ", unescape(s)).strip()

# ============================================================================
# 1. COPY AUDIO ASSETS (Exam-Room Babble + 24 Listening Micro-Quizzes)
# ============================================================================
babble_src = CUR / "TOEFL_2026/04_Speaking_Listen_Repeat_and_Interview/babble_speaking.mp3"
if babble_src.exists():
    shutil.copy2(babble_src, AUDIO_OUT / "babble_speaking.mp3")

listening_clips = []
ldir = CUR / "TOEFL_2026/03_Listening_and_Audio_Quizzes"
if ldir.exists():
    for mp3 in sorted(ldir.glob("*.mp3")):
        shutil.copy2(mp3, LISTENING_OUT / mp3.name)
        nl = mp3.name.lower()
        if nl.startswith("best_title"):
            cat, task_prompt = "Best Title", "Listen carefully and determine the most accurate title / main idea for this audio clip."
        elif nl.startswith("context_"):
            cat, task_prompt = "Context & Inference", "Listen carefully and summarize the speaker's context, tone, and implied meaning."
        elif nl.startswith("next_action"):
            cat, task_prompt = "Next Action", "Listen carefully and identify what the speaker will most likely do next."
        elif nl.startswith("vocab_in_context"):
            cat, task_prompt = "Vocab in Context", "Listen carefully and note the key academic expression and its meaning in context."
        else:
            cat, task_prompt = "Real Test Audio", "Listen once under exam conditions, take structured notes, then replay and transcribe key sentences."
        listening_clips.append({
            "id": mp3.stem,
            "title": mp3.stem.replace("_", " ").replace("-", " ").title(),
            "category": cat,
            "prompt": task_prompt,
            "src": f"./assets/audio/listening/{mp3.name}",
        })

print(f"[AUDIO] babble copied={ (AUDIO_OUT/'babble_speaking.mp3').exists() } | listening clips={len(listening_clips)}")

# ============================================================================
# 2. EXPAND SPEAKING LISTEN & REPEAT IN data/question-bank.js
# ============================================================================
def expand_repeat_bank():
    qb_path = DATA / "question-bank.js"
    raw = qb_path.read_text(encoding="utf-8")
    # Preserve everything cleanly: extract repeat & interview arrays via node or regex?
    # Actually let's parse existing IDs and append new items cleanly via a separate additive bank file
    # OR update question-bank.js cleanly while keeping all 60 original lr-01..lr-60 intact!
    # Wait: smoke-test.mjs loads question-bank.js in VM; keeping question-bank.js clean + appending
    # telegram Listen & Repeat sentences into QUESTION_BANK.repeat from data/toefl-suite-bank.js OR directly in question-bank.js!
    # Let's parse Shadowings 1 - 49.pdf & listen and repeat.docx cleanly first!
    sentences = []
    seen = set()

    # From Shadowings 1 - 49.pdf
    sh_pdf = CUR / "TOEFL_2026/04_Speaking_Listen_Repeat_and_Interview/Shadowings 1 - 49.pdf"
    if sh_pdf.exists():
        r = PdfReader(str(sh_pdf))
        full = "\n".join(p.extract_text() or "" for p in r.pages)
        cur_set = 0
        for ln in full.splitlines():
            ln = ln.strip()
            if re.fullmatch(r"\d{1,2}", ln):
                cur_set = int(ln)
                continue
            # Clean valid English sentence (5-28 words)
            ln = re.sub(r"^\d+[\.\)]\s*", "", ln).strip()
            words = ln.split()
            if 5 <= len(words) <= 28 and re.match(r"^[A-Z]", ln) and not re.search(r"http|@|shadowing|page \d", ln, re.I):
                if not ln.endswith((".", "!", "?")):
                    ln += "."
                key = re.sub(r"\W+", "", ln.lower())
                if key not in seen:
                    seen.add(key)
                    diff = "Easy" if len(words) <= 9 else ("Medium" if len(words) <= 15 else "Hard")
                    sentences.append({
                        "set": cur_set,
                        "text": ln,
                        "difficulty": diff,
                        "category": f"Real Set {cur_set}" if cur_set else "Campus & Daily",
                    })

    # Also from listen and repeat.docx
    lr_docx = CUR / "TOEFL_2026/04_Speaking_Listen_Repeat_and_Interview/listen and repeat.docx"
    if lr_docx.exists():
        d = docx.Document(str(lr_docx))
        for pr in d.paragraphs:
            ln = pr.text.strip()
            words = ln.split()
            if 5 <= len(words) <= 26 and re.match(r"^[A-Z]", ln) and not ln.lower().startswith(("you are ", "listen to ", "repeat ")):
                if not ln.endswith((".", "!", "?")):
                    ln += "."
                key = re.sub(r"\W+", "", ln.lower())
                if key not in seen:
                    seen.add(key)
                    diff = "Easy" if len(words) <= 9 else ("Medium" if len(words) <= 15 else "Hard")
                    sentences.append({
                        "set": 0,
                        "text": ln,
                        "difficulty": diff,
                        "category": "Campus & Workplace",
                    })

    # Avoid duplicating existing 60 sentences in question-bank.js
    existing_texts = set(re.sub(r"\W+", "", m.lower()) for m in re.findall(r'text:\s*"([^"]+)"', raw))
    extra_repeats = []
    idx = 61
    for item in sentences:
        k = re.sub(r"\W+", "", item["text"].lower())
        if k in existing_texts:
            continue
        existing_texts.add(k)
        extra_repeats.append({
            "id": f"lr-{idx:03d}",
            "type": "repeat",
            "category": item["category"],
            "difficulty": item["difficulty"],
            "text": item["text"],
            "focus": "Retain content words in 2–3 natural thought groups with clear word endings.",
        })
        idx += 1
        if len(extra_repeats) >= 260:
            break

    print(f"[SPEAKING REPEAT] parsed={len(sentences)}, extra_repeats_ready={len(extra_repeats)}")
    return extra_repeats

# ============================================================================
# 3. EXPAND 4-TURN TAKE AN INTERVIEW SETS FROM speaking- interview 1-41.docx
# ============================================================================
def parse_interview_sets():
    iv_docx = CUR / "TOEFL_2026/04_Speaking_Listen_Repeat_and_Interview/speaking- interview 1-41.docx"
    sets = []
    if not iv_docx.exists():
        return sets
    d = docx.Document(str(iv_docx))
    paras = [p.text.strip() for p in d.paragraphs if p.text.strip()]

    # Group blocks delimited by numbered markers like "1." or "2." or "Set 1"
    blocks = []
    cur = []
    for pr in paras:
        if re.fullmatch(r"\d{1,2}\.?", pr):
            if cur:
                blocks.append(cur)
            cur = []
        else:
            cur.append(pr)
    if cur:
        blocks.append(cur)

    for b_idx, blk in enumerate(blocks, 1):
        if len(blk) < 5:
            continue
        scenario = blk[0]
        # Remaining paragraphs alternate: Question, Model Answer, Question, Model Answer...
        rest = blk[1:]
        turns = []
        samples = []
        if len(rest) >= 8:
            # Pair Q/A alternating
            for i in range(0, min(8, len(rest)), 2):
                q_txt = rest[i]
                a_txt = rest[i + 1] if i + 1 < len(rest) else ""
                turns.append(q_txt)
                samples.append(a_txt)
        elif len(rest) == 4:
            turns = rest
            samples = [""] * 4
        if len(turns) == 4:
            # Extract concise topic from scenario
            m_top = re.search(r"about\s+([^.,;]+)", scenario, re.I)
            topic = m_top.group(1).strip().title()[:48] if m_top else f"Interview Topic {b_idx}"
            sets.append({
                "id": f"is-real-{b_idx:02d}",
                "topic": topic,
                "scenario": scenario,
                "turns": turns,
                "samples": samples,
            })

    print(f"[SPEAKING INTERVIEW SETS] parsed 4-turn sets={len(sets)}")
    return sets

# ============================================================================
# 4. PARSE READING 2026: COMPLETE THE WORDS (from Complete The Words (Task I).html)
# ============================================================================
def parse_complete_the_words():
    p = CUR / "TOEFL_2026/02_Reading_Complete_the_Words_and_Passages/Complete The Words (Task I).html"
    if not p.exists():
        return [], []
    txt = p.read_text(encoding="utf-8", errors="replace")
    scripts = re.findall(r"<script[^>]*>(.*?)</script>", txt, re.S)
    sc = max(scripts, key=len) if scripts else ""

    m_cats = re.search(r"const CATS\s*=\s*(\[[^\]]+\])", sc)
    cats = json.loads(m_cats.group(1)) if m_cats else []

    # Parse entries: [catIdx,"Title",`Passage text...`]
    passages = []
    for idx, m in enumerate(re.finditer(r'\[(\d+)\s*,\s*"([^"]+)"\s*,\s*`([^`]+)`\]', sc), 1):
        cidx = int(m.group(1))
        title = m.group(2).strip()
        body = re.sub(r"\s+", " ", m.group(3)).strip()
        cat_name = cats[cidx] if 0 <= cidx < len(cats) else "Academic"
        if len(body.split()) >= 35:
            passages.append({
                "id": f"ctw-{idx:03d}",
                "category": cat_name,
                "title": title,
                "text": body,
            })
    print(f"[READING CTW] categories={len(cats)}, passages={len(passages)}")
    return cats, passages

# ============================================================================
# 5. PARSE WRITING 2026: BUILD A SENTENCE + 70 EMAILS + 40 ACADEMIC DISCUSSIONS
# ============================================================================
def parse_writing_2026():
    # A. Build a Sentence from TOEFL_Writing_Practice_16_Questions_Complete.html + curated TOEFL 2026 items
    w_html = CUR / "TOEFL_2026/05_Writing_Sentence_Email_and_Discussion/TOEFL_Writing_Practice_16_Questions_Complete.html"
    build_sentences = []
    if w_html.exists():
        txt = w_html.read_text(encoding="utf-8", errors="replace")
        mq = re.search(r"const QUESTIONS\s*=\s*(\[.*?\]);", txt, re.S)
        if mq:
            raw_qs = json.loads(mq.group(1))
            for i, q in enumerate(raw_qs, 1):
                # Strip heavy base64 avatars
                build_sentences.append({
                    "id": f"bas-{i:02d}",
                    "prompt": q["prompt"],
                    "layout": q["layout"],
                    "choices": q["choices"],
                    "answer": q["answer"],
                })

    # Add 20 high-yield 2026 TOEFL Build-a-Sentence grammar traps (embedded questions, conditionals, reported speech, inversions, passive)
    extra_bas = [
        ("Did the professor mention when the lab report is due?", [{"text": "She"}, {"text": "asked"}, {"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"text": "."}], ["the report", "submit", "we could", "whether"], ["whether", "we could", "submit", "the report"]),
        ("Why was the outdoor concert moved inside?", [{"text": "Nobody"}, {"text": "knew"}, {"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"text": "."}], ["would last", "the storm", "how long", "actually"], ["how long", "the storm", "would last", "actually"]),
        ("Have you heard back about your internship application?", [{"text": "They"}, {"text": "told me"}, {"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"text": "."}], ["by Friday", "be notified", "candidates", "would"], ["candidates", "would", "be notified", "by Friday"]),
        ("Where can I find the reserve textbooks for biology?", [{"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"slot": 4}, {"text": "?"}], ["tell me", "could", "the desk is", "where", "you"], ["could", "you", "tell me", "where", "the desk is"]),
        ("What made the museum exhibit so memorable?", [{"text": "It was"}, {"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"text": "."}], ["we had", "the lighting", "expected", "far brighter than"], ["the lighting", "far brighter than", "we had", "expected"]),
        ("Are you planning to take the statistics seminar next term?", [{"text": "I'm not sure"}, {"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"text": "."}], ["my schedule", "fits", "whether", "the course"], ["whether", "the course", "fits", "my schedule"]),
        ("Why did so many commuters take the train this morning?", [{"text": "The highway"}, {"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"text": "."}], ["due to", "had been", "roadwork", "closed"], ["had been", "closed", "due to", "roadwork"]),
        ("How did Maya finish the data analysis so quickly?", [{"text": "She"}, {"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"text": "."}], ["automated", "a script", "that", "wrote"], ["wrote", "a script", "that", "automated"]),
        ("Did the committee approve the new parking policy?", [{"text": "We won't know"}, {"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"text": "."}], ["is published", "the report", "until", "final"], ["until", "the report", "final", "is published"]),
        ("Could you explain why the experiment failed twice?", [{"text": "The sensor"}, {"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"text": "."}], ["calibrated", "was not", "properly", "beforehand"], ["was not", "properly", "calibrated", "beforehand"]),
        ("What should I bring to the orientation workshop?", [{"text": "Make sure"}, {"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"text": "."}], ["student ID", "bring your", "that you", "valid"], ["that you", "bring your", "valid", "student ID"]),
        ("Why hasn't the advisor replied to my email yet?", [{"text": "He"}, {"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"text": "."}], ["a conference", "must be", "this week", "attending"], ["must be", "attending", "a conference", "this week"]),
        ("Do you know who organized the charity book drive?", [{"text": "I have no idea"}, {"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"text": "."}], ["in charge", "was", "of it", "who"], ["who", "was", "in charge", "of it"]),
        ("When will the library renovation finally be completed?", [{"text": "Officials expect"}, {"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"text": "."}], ["to reopen", "by autumn", "the wing", "east"], ["the wing", "east", "to reopen", "by autumn"]),
        ("Would you recommend living on campus during the first year?", [{"text": "Living on campus"}, {"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"text": "."}], ["makes it", "to meet", "much easier", "new friends"], ["makes it", "much easier", "to meet", "new friends"]),
    ]
    # Fix #9 and #14 natural phrasing cleanly:
    extra_bas[8] = ("Did the committee approve the new parking policy?", [{"text": "We won't know"}, {"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"text": "."}], ["is published", "final report", "until", "the"], ["until", "the", "final report", "is published"])
    extra_bas[13] = ("When will the library renovation finally be completed?", [{"text": "Officials expect"}, {"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"text": "."}], ["to reopen", "by autumn", "east wing", "the"], ["the", "east wing", "to reopen", "by autumn"])
    extra_bas[7] = ("How did Maya finish the data analysis so quickly?", [{"text": "She"}, {"slot": 0}, {"slot": 1}, {"slot": 2}, {"slot": 3}, {"text": "."}], ["the workflow", "a script", "that automated", "wrote"], ["wrote", "a script", "that automated", "the workflow"])

    start_i = len(build_sentences) + 1
    for offset, (pr, lay, ch, ans) in enumerate(extra_bas):
        build_sentences.append({
            "id": f"bas-{start_i + offset:02d}",
            "prompt": pr,
            "layout": lay,
            "choices": ch,
            "answer": ans,
        })

    # B. Email Tasks from TOEFL 70 Model Emails.pdf + TOEFL Email Practice Sheet.md
    email_tasks = []
    em_pdf = CUR / "TOEFL_2026/05_Writing_Sentence_Email_and_Discussion/TOEFL 70 Model Emails.pdf"
    if em_pdf.exists():
        r = PdfReader(str(em_pdf))
        full = "\n".join(p.extract_text() or "" for p in r.pages)
        # Clean page headers/footers
        full = re.sub(r"TOEFL iBT 2026\s*-\s*Write an Email\s*\n[^\n]*\nPage \d+\s*\n", "\n", full)
        # Split on numbered "1.  Scenario:" blocks
        blocks = re.split(r"\n(?=\d{1,2}\.\s+Scenario:)", full)
        eid = 1
        for blk in blocks:
            m_sc = re.match(r"^\d{1,2}\.\s+Scenario:\s*(.*?)\nSubject:\s*([^\n]+)\n(.*)", blk.strip(), re.S)
            if not m_sc:
                continue
            scenario = re.sub(r"\s+", " ", m_sc.group(1)).strip()
            subj = m_sc.group(2).strip()
            body = re.sub(r"\n(?:[1-7]\s*\n[A-Z][A-Za-z &]+\nTypical situations:.*)$", "", m_sc.group(3), flags=re.S).strip()
            body = re.sub(r"\n{3,}", "\n\n", body)
            if len(body) >= 120:
                email_tasks.append({
                    "id": f"em-{eid:02d}",
                    "title": subj[:75],
                    "scenario": scenario[:420],
                    "modelEmail": f"Subject: {subj}\n\n{body[:1400]}",
                })
                eid += 1
                if len(email_tasks) >= 50:
                    break

    # Fallback/supplement clean structured email tasks if PDF formatting split differently
    if len(email_tasks) < 10:
        email_tasks.extend([
            {
                "id": "em-s01",
                "title": "Requesting a Deadline Extension for a Research Paper",
                "scenario": "You are enrolled in Professor Morales's Environmental Policy seminar. Because of an unexpected family emergency, you need a 3-day extension on your term paper. Write an email to Professor Morales: (1) explain your situation briefly, (2) describe the progress you have already made, and (3) propose a specific new submission date.",
                "modelEmail": "Subject: Request for Short Extension on Environmental Policy Paper\n\nDear Professor Morales,\n\nI hope this message finds you well. I am writing to respectfully request a three-day extension on our upcoming Environmental Policy term paper due this Friday.\n\nEarlier this week, an unexpected family emergency required me to travel home, which disrupted my final editing schedule. However, I have already completed all primary research, finalized my outline, and drafted roughly 75% of the essay.\n\nWould it be possible for me to submit the completed paper by Monday at 5:00 PM instead? I truly appreciate your understanding and flexibility, and I am happy to share my current draft if helpful.\n\nBest regards,\nAlex Chen"
            },
            {
                "id": "em-s02",
                "title": "Reporting a Maintenance Issue in Campus Housing",
                "scenario": "The heating system in your university dormitory room has stopped working properly during cold weather. Write an email to the Campus Housing Office: (1) describe the exact problem and room number, (2) explain how it is affecting your studies/comfort, and (3) request a repair visit and state when you are available.",
                "modelEmail": "Subject: Urgent Heating Repair Request – Oak Hall Room 314\n\nDear Campus Housing Maintenance Team,\n\nI am writing to report a heating issue in Oak Hall, Room 314. For the past two days, the radiator has remained completely cold even when the thermostat is set to the highest level.\n\nWith nighttime temperatures dropping below freezing, the room has become uncomfortably cold, making it difficult to study and sleep properly.\n\nCould a technician please inspect and repair the unit as soon as possible? I will be in my room tomorrow between 1:00 PM and 5:00 PM, or you have my permission to enter with a master key if an earlier slot is available.\n\nThank you very much for your prompt assistance.\n\nSincerely,\nSara Miller"
            },
            {
                "id": "em-s03",
                "title": "Feedback on a New Campus Shuttle Schedule",
                "scenario": "Your university recently reduced evening campus shuttle trips. Write an email to the Campus Transportation Coordinator: (1) explain how you use the evening shuttle, (2) describe a problem caused by the reduced schedule, and (3) suggest one practical improvement.",
                "modelEmail": "Subject: Feedback Regarding the Revised Evening Shuttle Schedule\n\nDear Transportation Coordinator,\n\nI am a graduate student who relies on the Green Line campus shuttle four evenings a week after my lab sessions end at 8:30 PM.\n\nSince the recent schedule change cut service to once per hour after 7:00 PM, the 9:00 PM bus has become severely overcrowded, and several students have been left waiting outside in the dark for another hour.\n\nTo balance cost savings with student safety, could the university restore just one additional trip at 8:45 PM on Monday through Thursday nights, when evening classes and labs let out?\n\nThank you for considering student feedback.\n\nBest regards,\nDaniel Park"
            },
            {
                "id": "em-s04",
                "title": "Inviting a Guest Speaker to a Student Club Event",
                "scenario": "You are the president of your university's Data Science Club. Write an email to Dr. Priya Nair, an alumna working in AI healthcare: (1) introduce your club and upcoming career panel, (2) explain why her experience would benefit students, and (3) provide date/format details and ask about her availability.",
                "modelEmail": "Subject: Invitation to Speak at University Data Science Career Panel\n\nDear Dr. Nair,\n\nI am writing as president of the University Data Science Club to invite you to join our annual Career & Research Panel on Thursday, November 14, from 5:00 to 6:30 PM.\n\nMany of our members are eager to apply machine learning to healthcare, and your recent work leading clinical diagnostic models at MedTech Labs would offer invaluable real-world perspective.\n\nThe panel will be hosted via Zoom (or in person if you are in town), with a 15-minute talk followed by open Q&A. Would you be available to participate? I would be glad to share the full agenda.\n\nWarm regards,\nNadia Karimi"
            },
            {
                "id": "em-s05",
                "title": "Declining a Volunteer Shift & Offering an Alternative",
                "scenario": "You signed up to volunteer at the community library's Saturday book fair, but you now have a mandatory academic exam that morning. Write an email to the volunteer coordinator, Ms. Lopez: (1) apologize and explain why you cannot attend the morning shift, (2) offer to help during an alternative shift or setup day, and (3) confirm next steps.",
                "modelEmail": "Subject: Saturday Book Fair Shift Change Request\n\nDear Ms. Lopez,\n\nI sincerely apologize for the short notice, but I will unfortunately be unable to cover my Saturday morning volunteer shift (9:00 AM–12:00 PM) at the book fair.\n\nMy department just scheduled a mandatory midterm review exam for that exact morning, which I cannot miss. However, I am still eager to support the event and would gladly work the Saturday afternoon shift (1:00–4:00 PM) or help set up tables on Friday evening instead.\n\nPlease let me know which option works best for your team so I can plan accordingly.\n\nThank you for your understanding,\nLiam Ross"
            },
        ])

    email_guide_md = ""
    eg_p = CUR / "TOEFL_2026/05_Writing_Sentence_Email_and_Discussion/TOEFL Email Practice Sheet.md"
    if eg_p.exists():
        email_guide_md = eg_p.read_text(encoding="utf-8", errors="replace")[:7000]

    # C. Academic Discussion Tasks from Pastel_TOEFL2026_Academic_Discussion_COMPLETE.pdf (40 topics + 40 Band-5 models!)
    disc_tasks = []
    disc_pdf = CUR / "TOEFL_2026/05_Writing_Sentence_Email_and_Discussion/Pastel_TOEFL2026_Academic_Discussion_COMPLETE.pdf"
    if disc_pdf.exists():
        r = PdfReader(str(disc_pdf))
        full = "\n".join(p.extract_text() or "" for p in r.pages)
        # Split on "M1 · EDUCATION & LEARNING\n1 Online, Hybrid & Blended Learning"
        blocks = re.split(r"\n(?=M\d+\s*[\u00a0 ]*·[\u00a0 ]*[A-Z][A-Z &,/\-]+\n\d{1,2}\s+)", full)
        for blk in blocks:
            m_head = re.match(r"^M\d+\s*[\u00a0 ]*·[\u00a0 ]*([A-Z][A-Z &,/\-]+)\n(\d{1,2})\s+([^\n]+)", blk.strip())
            if not m_head:
                continue
            mod_name = m_head.group(1).strip().title()
            tnum = int(m_head.group(2))
            title = m_head.group(3).strip()[:85]
            m_pr = re.search(r"REPRESENTATIVE PROMPT\s*\n(.*?)(?=\n(?:ITEM TYPE|[a-z]+\s+&\s+|Band-5 model response)|\Z)", blk, re.S)
            prompt_txt = re.sub(r"\s+", " ", m_pr.group(1)).strip() if m_pr else ""
            # Clean trailing tag strip if glued onto prompt
            prompt_txt = re.sub(r"\s*[a-z ]+\s*&\s*[a-z ]+$", "", prompt_txt).strip()
            if len(prompt_txt) < 30:
                prompt_txt = f"Your professor has posted a discussion question on {title}. Express and support your view in 100–130 words."
            m_mod = re.search(r"Band-5 model response\s*\n(.*?)(?=\n(?:M\d+\s*·|M O D U L E|Pastel Language School|PAGE \d+|\d+\s+items\b)|\Z)", blk, re.S | re.I)
            model = ""
            if m_mod:
                model_raw = re.sub(r"pastellanguageschool\.com.*", "", m_mod.group(1), flags=re.S | re.I)
                model = re.sub(r"\s+", " ", model_raw).strip()[:1200]
            disc_tasks.append({
                "id": f"ad-{tnum:02d}",
                "module": mod_name,
                "title": f"{tnum}. {title}",
                "professorPrompt": prompt_txt[:520],
                "modelResponse": model,
            })
        disc_tasks.sort(key=lambda x: x["id"])

    if len(disc_tasks) < 8:
        disc_tasks.extend([
            {
                "id": "ad-s01",
                "title": "AI Tools in University Classrooms",
                "professorPrompt": "Some universities ban generative AI tools on all coursework to protect academic integrity, while others teach students to use AI responsibly as a research aid. Should universities integrate AI tools into coursework or restrict them? Explain your view.",
                "modelResponse": "While concerns about plagiarism are valid, I believe universities should teach students to use AI tools responsibly rather than imposing blanket bans. First, workplaces increasingly expect graduates to audit, prompt, and verify AI-assisted outputs; prohibiting exposure leaves students unprepared for modern careers. Second, bans are notoriously difficult to enforce fairly because AI detectors often misclassify non-native English writers. Instead, professors can redesign assessments around oral defenses, live problem-solving, and transparent AI citation logs. By pairing clear ethical guardrails with practical training, universities uphold academic rigor while equipping students with essential digital literacy."
            },
            {
                "id": "ad-s02",
                "title": "Remote Work vs. In-Office Collaboration",
                "professorPrompt": "Many companies are debating whether to require employees to return to offices full-time or allow permanent hybrid/remote arrangements. Which approach creates stronger long-term outcomes for both organizations and workers?",
                "modelResponse": "A structured hybrid model outperforms both strict office mandates and fully remote policies over the long run. Full-time office mandates waste hours in commuting and drive away skilled parents or rural talent, hurting retention. Conversely, entirely remote setups can weaken spontaneous mentorship for junior hires who benefit from observing experienced colleagues. Designating two or three anchor days for collaborative workshops while leaving the remaining days for deep focused work at home captures the strengths of both worlds—preserving team cohesion without sacrificing autonomy or productivity."
            },
            {
                "id": "ad-s03",
                "title": "Funding Space Exploration vs. Earth Challenges",
                "professorPrompt": "Critics argue that governments should redirect space exploration budgets toward urgent terrestrial problems like healthcare and climate change, whereas supporters emphasize scientific breakthroughs. Where do you stand?",
                "modelResponse": "Although urgent domestic challenges clearly deserve robust funding, cutting space exploration budgets would be shortsighted. Space programs represent a tiny fraction of national spending—often under one percent—yet they directly power the very tools we use to solve Earth's crises. Weather satellites track extreme storms, orbital sensors monitor deforestation and greenhouse gas leaks, and aerospace research has yielded medical imaging and water-purification advances. Rather than treating space and terrestrial investment as a zero-sum trade-off, governments should maintain targeted space research focused on climate monitoring and shared technological spin-offs."
            },
            {
                "id": "ad-s04",
                "title": "Four-Day Workweek Policy",
                "professorPrompt": "Several countries have piloted a four-day workweek with no reduction in pay. Do you think adopting a shorter workweek is practical and beneficial for most industries?",
                "modelResponse": "While a four-day workweek cannot be applied identically to every sector, piloting it across knowledge and service industries brings substantial gains. Recent trials in the UK and Iceland showed that cutting unproductive meetings allows teams to maintain—or even raise—output in 32 hours while sharply reducing burnout and sick leave. Admittedly, hospitals and retail operations require continuous coverage, so they would need staggered shifts rather than universal Friday closures. Even with staggered schedules, giving workers an extra rest day improves morale, lowers turnover costs, and sustains sharper focus during working hours."
            },
            {
                "id": "ad-s05",
                "title": "Mandatory Community Service for High School Graduation",
                "professorPrompt": "Some school districts require high school students to complete 40 hours of unpaid community service before graduating. Is mandatory volunteering a good educational policy?",
                "modelResponse": "Requiring a modest amount of community service is an effective way to cultivate civic awareness, provided students can choose causes aligned with their interests. Many teenagers would never visit a food bank, tutor younger children, or join a park cleanup without an initial push, yet firsthand exposure builds empathy and practical teamwork skills that textbooks cannot replicate. To prevent resentment or superficial compliance—and to accommodate students who already hold part-time jobs—schools should allow flexible hours across four years and pair service with brief reflection assignments."
            },
        ])

    disc_guide_md = ""
    dg_p = CUR / "TOEFL_2026/05_Writing_Sentence_Email_and_Discussion/TOEFL Academic Discussion Practice Sheet - v2.md"
    if dg_p.exists():
        disc_guide_md = dg_p.read_text(encoding="utf-8", errors="replace")[:7000]

    scoring_guide_md = ""
    sg_p = CUR / "TOEFL_2026/01_Official_Guides_and_Rubrics/TOEFL_iBT_2026_Writing_Scoring_Guide.md"
    if sg_p.exists():
        scoring_guide_md = sg_p.read_text(encoding="utf-8", errors="replace")[:8000]

    print(f"[WRITING 2026] Build-a-Sentence={len(build_sentences)} | Emails={len(email_tasks)} | Discussions={len(disc_tasks)}")
    return build_sentences, email_tasks, disc_tasks, email_guide_md, disc_guide_md, scoring_guide_md

# ============================================================================
# 6. PARSE TOEFL VOCAB (.apkg) + COLLOCATIONS (2,112 from HTML) + IDEA BANK
# ============================================================================
def parse_vocab_collocations_ideas():
    vocab_items = []
    seen_w = set()

    # A. 400 Must-Have Words (.apkg)
    apkg400 = CUR / "Evergreen_English/01_Vocabulary_and_Anki_Decks/400_must_have_words_for_the_TOEFL_.apkg"
    if apkg400.exists():
        with tempfile.TemporaryDirectory() as td:
            with zipfile.ZipFile(apkg400) as zf:
                db = "collection.anki21" if "collection.anki21" in zf.namelist() else "collection.anki2"
                zf.extract(db, td)
                conn = sqlite3.connect(str(Path(td) / db))
                for (flds,) in conn.execute("SELECT flds FROM notes").fetchall():
                    parts = flds.split("\x1f")
                    if len(parts) < 2:
                        continue
                    w = re.sub(r"\[sound:[^\]]+\]|\[[^\]]+\]", "", clean_html(parts[0])).strip()
                    w = w.split()[0] if w else ""
                    defn_raw = clean_html(parts[1])
                    if not w or not re.match(r"^[A-Za-z\-]{2,28}$", w) or w.lower() in seen_w:
                        continue
                    seen_w.add(w.lower())
                    ex_m = re.search(r"Ex\s*:\s*(.+)", defn_raw, re.I)
                    defn = re.sub(r"Ex\s*:.*", "", defn_raw, flags=re.I).strip()
                    vocab_items.append({
                        "id": f"v400_{w.lower()}",
                        "word": w,
                        "meaning": defn[:240],
                        "example": ex_m.group(1).strip()[:220] if ex_m else "",
                        "deck": "400 Must-Have TOEFL",
                    })
                conn.close()

    # B. Anki_TPO_Claasification.apkg (top 500 high-frequency academic words with Persian translation!)
    apkg_tpo = CUR / "Evergreen_English/01_Vocabulary_and_Anki_Decks/Anki_TPO_Claasification.apkg"
    if apkg_tpo.exists():
        with tempfile.TemporaryDirectory() as td:
            with zipfile.ZipFile(apkg_tpo) as zf:
                db = "collection.anki21" if "collection.anki21" in zf.namelist() else "collection.anki2"
                zf.extract(db, td)
                conn = sqlite3.connect(str(Path(td) / db))
                added_tpo = 0
                for (flds,) in conn.execute("SELECT flds FROM notes").fetchall():
                    parts = flds.split("\x1f")
                    if len(parts) < 2:
                        continue
                    w = clean_html(parts[0])
                    fa = clean_html(parts[1])
                    pos = clean_html(parts[8]) if len(parts) > 8 else ""
                    if not w or not fa or not re.match(r"^[A-Za-z][A-Za-z\- ]{1,28}$", w) or w.lower() in seen_w:
                        continue
                    seen_w.add(w.lower())
                    vocab_items.append({
                        "id": f"vtpo_{re.sub(r'[^a-z0-9]+','_',w.lower())}",
                        "word": w,
                        "meaning": f"({pos}) {fa}" if pos else fa,
                        "example": "",
                        "deck": "Classified Academic (EN-FA)",
                    })
                    added_tpo += 1
                    if added_tpo >= 450:
                        break
                conn.close()

    # C. Complete_the_words_collocation-1 to 50.html (extract top 600 high-yield collocations!)
    col_html = CUR / "Evergreen_English/02_Collocations_and_Phrasal_Verbs/Complete_the_words_collocation-1 to 50.html"
    collocations = []
    if col_html.exists():
        txt = col_html.read_text(encoding="utf-8", errors="replace")
        mb = re.search(r'const B64="([^"]+)"', txt)
        if mb:
            raw_list = json.loads(gzip.decompress(base64.b64decode(mb.group(1))).decode("utf-8"))
            seen_k = set()
            for idx, item in enumerate(raw_list, 1):
                k = (item.get("k") or "").strip()
                m = (item.get("m") or "").strip()
                if not k or k.lower() in seen_k:
                    continue
                seen_k.add(k.lower())
                collocations.append({
                    "id": f"col_{idx:04d}",
                    "word": k,
                    "meaning": m,
                    "example": item.get("e1") or "",
                    "deck": f"CTW Collocations ({'High-Yield' if item.get('t') == 'H' else 'Core'})",
                })
                if len(collocations) >= 600:
                    break

    # D. Speaking & Writing Topic Idea Bank (synthesized from Culture/Health/Tech/education HTMLs + Common Reasons)
    idea_bank = [
        {
            "topic": "Education & Online Learning",
            "reasons": [
                "Flexibility & accessibility: learners balance classes with work or family without commuting.",
                "Active peer collaboration: classroom discussions sharpen critical thinking and communication skills.",
                "Practical skill readiness: project-based courses bridge theory and real workplace demands."
            ],
            "collocations": ["academic performance", "lifelong learning", "hands-on experience", "self-paced study", "critical thinking", "curriculum design"],
            "sampleAngle": "Pair one personal study example (e.g., an online coding or language seminar) with a clear measurable outcome (saved 5 hours weekly / improved exam focus)."
        },
        {
            "topic": "Technology & AI in Daily Life",
            "reasons": [
                "Efficiency & automation: digital tools eliminate repetitive tasks and accelerate research.",
                "Over-reliance & distraction: constant notifications erode deep concentration and face-to-face connection.",
                "Privacy & digital divide: rapid tech adoption risks excluding lower-income communities."
            ],
            "collocations": ["technological advancement", "digital literacy", "screen fatigue", "data privacy", "streamline workflows", "double-edged sword"],
            "sampleAngle": "Acknowledge the convenience briefly, then pivot to a concrete boundary or balanced policy (e.g., scheduled tech-free study blocks)."
        },
        {
            "topic": "Health, Fitness & Wellness",
            "reasons": [
                "Preventive care lowers long-term stress and boosts daily cognitive energy.",
                "Built environments (parks, walkable streets, bike lanes) shape habits more reliably than willpower alone.",
                "Sleep and nutrition directly govern memory retention and emotional stability."
            ],
            "collocations": ["sedentary lifestyle", "mental well-being", "preventive healthcare", "balanced diet", "burnout prevention", "sustainable routine"],
            "sampleAngle": "Use a 20-minute daily walking/exercise habit as a crisp, authentic personal example for Take an Interview."
        },
        {
            "topic": "Work, Careers & Work-Life Balance",
            "reasons": [
                "Job satisfaction and growth opportunities drive stronger long-term performance than salary alone.",
                "Hybrid schedules cut commute fatigue while preserving mentorship during in-person anchor days.",
                "Part-time campus jobs cultivate time management and financial independence."
            ],
            "collocations": ["career advancement", "professional networking", "work-life balance", "employee retention", "transferable skills", "job security"],
            "sampleAngle": "Contrast short-term paycheck gains against long-term skill compounding and reduced burnout."
        },
        {
            "topic": "Culture, Travel & Community",
            "reasons": [
                "Preserving heritage sites & festivals sustains community identity and attracts cultural tourism.",
                "Public spaces (libraries, parks, museums) equalize access to knowledge across income groups.",
                "Cross-cultural exposure builds empathy and broadens problem-solving perspectives."
            ],
            "collocations": ["cultural heritage", "social cohesion", "civic engagement", "local traditions", "public funding", "sense of belonging"],
            "sampleAngle": "Connect a local public library or festival memory to wider community benefits (trust, inclusivity, local economy)."
        },
        {
            "topic": "Environment & Urban Policy",
            "reasons": [
                "Investing in reliable public transit reduces congestion, emissions, and commuting stress.",
                "Green urban planning (trees, parks, solar incentives) delivers both health and climate dividends.",
                "Individual habits matter, but policy incentives scale impact far faster."
            ],
            "collocations": ["carbon footprint", "sustainable development", "public transit", "renewable energy", "urban congestion", "environmental stewardship"],
            "sampleAngle": "Compare short-term municipal costs with long-term healthcare and congestion savings."
        }
    ]

    print(f"[VOCAB & COLLOC] vocab={len(vocab_items)}, collocations={len(collocations)}, idea_topics={len(idea_bank)}")
    return vocab_items, collocations, idea_bank

# ============================================================================
# 7. EXTRACT ALL 4 OFFICIAL 2026 AI DIAGNOSTIC PROMPTS FROM DOCX FILES
# ============================================================================
def parse_ai_prompts():
    pdir = CUR / "TOEFL_2026/06_AI_Diagnostic_Prompts"
    prompts = {}
    mapping = [
        ("listenAndRepeat", "Listen_and_Repeat_AI-Diagnostic-Prompt.docx", "Speaking Task 1: Listen & Repeat (2026 AI Diagnostic Prompt)"),
        ("takeAnInterview", "Take_an_Interview_AI-Diagnostic-Prompt.docx", "Speaking Task 2: Take an Interview (2026 AI Diagnostic Prompt)"),
        ("writeAnEmail", "Write an Email TOEFL-2026-AI-Diagnostic-Prompts.docx", "Writing Task 2: Write an Email (2026 AI Diagnostic Prompt)"),
        ("academicDiscussion", "Write_an_Academic_Discussion_TOEFL_2026_AI_Diagnostic_Prompts.docx", "Writing Task 3: Academic Discussion (2026 AI Diagnostic Prompt)"),
    ]
    for key, fname, title in mapping:
        fp = pdir / fname
        if fp.exists():
            d = docx.Document(str(fp))
            body = "\n".join(pr.text.strip() for pr in d.paragraphs if pr.text.strip())
            prompts[key] = {"title": title, "prompt": body[:9000]}
        else:
            prompts[key] = {
                "title": title,
                "prompt": f"Grade this TOEFL iBT 2026 response strictly on the official 1.0–6.0 half-point rubric for {title}. Provide: Estimated Band (1.0–6.0), Task Fulfillment, Coherence & Organization, Language Use/Grammar, 3 Priority Fixes, and a Band-6 Model Rewrite."
            }
    print(f"[AI PROMPTS] loaded={list(prompts.keys())}")
    return prompts

# ============================================================================
# EXECUTE ALL & WRITE OUTPUT JS FILES
# ============================================================================
extra_repeats = expand_repeat_bank()
extra_interviews = parse_interview_sets()
ctw_cats, ctw_passages = parse_complete_the_words()
bas_items, email_tasks, disc_tasks, email_guide_md, disc_guide_md, scoring_guide_md = parse_writing_2026()
vocab_items, collocations, idea_bank = parse_vocab_collocations_ideas()
ai_prompts = parse_ai_prompts()

# 1. Append extra_interviews cleanly into data/interview-sets.js (keeping all 8 originals first!)
iv_path = DATA / "interview-sets.js"
iv_raw = iv_path.read_text(encoding="utf-8")
# Strip any previous appended block
marker = "// === TELEGRAM_2026_INTERVIEW_SETS_START ==="
if marker in iv_raw:
    iv_raw = iv_raw[:iv_raw.index(marker)].rstrip() + "\n"
if extra_interviews:
    append_js = (
        f"\n{marker}\n"
        f"const EXTRA_INTERVIEW_SETS_2026 = {json.dumps(extra_interviews, ensure_ascii=False, indent=2)};\n"
        f"INTERVIEW_SETS.push(...EXTRA_INTERVIEW_SETS_2026);\n"
    )
    iv_path.write_text(iv_raw + append_js, encoding="utf-8")

# 2. Append extra_repeats cleanly into data/question-bank.js (keeping all 60 originals first!)
qb_path = DATA / "question-bank.js"
qb_raw = qb_path.read_text(encoding="utf-8")
rmarker = "// === TELEGRAM_2026_REPEAT_BANK_START ==="
if rmarker in qb_raw:
    qb_raw = qb_raw[:qb_raw.index(rmarker)].rstrip() + "\n"
if extra_repeats:
    append_qb = (
        f"\n{rmarker}\n"
        f"const EXTRA_REPEAT_2026 = {json.dumps(extra_repeats, ensure_ascii=False, indent=2)};\n"
        f"QUESTION_BANK.repeat.push(...EXTRA_REPEAT_2026);\n"
    )
    qb_path.write_text(qb_raw + append_qb, encoding="utf-8")

# 3. Write data/toefl-suite-bank.js for all new 2026 Suite tabs!
reading_passages_2026 = [
    {
        "id": "rp-dl-01",
        "kind": "Read in Daily Life",
        "title": "Campus Library Extended Hours Notice",
        "text": "NOTICE TO ALL STUDENTS — MAIN LIBRARY FINALS SCHEDULE\nFrom December 8 through December 19, the Main Library will remain open 24 hours a day on Levels 2 and 3. Quiet study rooms on Level 4 may be reserved up to 48 hours in advance via the student portal (maximum 3 hours per group per day). Please note that the Media Lab on Level 1 will close at its regular time of 9:00 PM because technical staff are unavailable overnight. Complimentary coffee and tea will be served in the East Lobby starting at 10:00 PM nightly—covered spill-proof mugs only.",
        "questions": [
            {
                "q": "Which area of the library will NOT stay open overnight during finals week?",
                "choices": ["Level 2 study floor", "Level 3 study floor", "Level 4 quiet rooms", "The Media Lab on Level 1"],
                "answer": "The Media Lab on Level 1",
                "explanation": "The notice explicitly states that the Media Lab on Level 1 closes at 9:00 PM because technical staff are unavailable overnight."
            },
            {
                "q": "What requirement applies to students getting complimentary coffee in the East Lobby?",
                "choices": ["They must reserve a room on Level 4.", "They must use covered spill-proof mugs.", "They must arrive before 9:00 PM.", "They must show a Media Lab pass."],
                "answer": "They must use covered spill-proof mugs.",
                "explanation": "The last sentence specifies 'covered spill-proof mugs only'."
            }
        ]
    },
    {
        "id": "rp-dl-02",
        "kind": "Read in Daily Life",
        "title": "Email: Science Fair Volunteer Orientation",
        "text": "Subject: Updated Room & Check-In for Saturday Science Fair\nHi Volunteers,\nThank you for signing up to help with the Regional Youth Science Fair this Saturday! Because 40 extra student teams registered this week, our morning orientation has moved from Room 104 to the West Auditorium. Please arrive by 7:45 AM to pick up your badge and lunch voucher. If you signed up for afternoon judging only, you do not need to attend the morning orientation—instead, report directly to the Registration Desk at 12:30 PM for a brief 15-minute rubric walkthrough.\nBest, Maya Lin (Event Coordinator)",
        "questions": [
            {
                "q": "Why was the morning orientation relocated?",
                "choices": ["Room 104 is undergoing repairs.", "More student teams registered than expected.", "Lunch vouchers are stored in the West Auditorium.", "Afternoon judges requested a larger space."],
                "answer": "More student teams registered than expected.",
                "explanation": "Maya explains that '40 extra student teams registered this week'."
            },
            {
                "q": "What should an afternoon-only judge do on Saturday?",
                "choices": ["Arrive at the West Auditorium at 7:45 AM.", "Email Maya Lin for a lunch voucher.", "Report to the Registration Desk at 12:30 PM.", "Skip the rubric walkthrough completely."],
                "answer": "Report to the Registration Desk at 12:30 PM.",
                "explanation": "Afternoon-only judges skip morning orientation and report to the Registration Desk at 12:30 PM."
            }
        ]
    },
    {
        "id": "rp-dl-03",
        "kind": "Read in Daily Life",
        "title": "Community Bike-Share Membership Update",
        "text": "CITYCYCLE SPRING UPDATE\nStarting April 1, Annual Pass holders receive unlimited 45-minute rides on standard bicycles (up from 30 minutes previously). Electric-assist bikes remain billed at $0.15 per minute after the first 5 free unlock minutes. Need to pause your pass while traveling? Members may now freeze an Annual Pass once per year for up to 60 days directly inside the CityCycle app, provided the request is submitted at least 24 hours before the pause date.",
        "questions": [
            {
                "q": "What is changing on April 1 for Annual Pass holders using standard bikes?",
                "choices": ["Electric-assist bikes become completely free.", "Included ride duration increases from 30 to 45 minutes.", "Members can freeze passes up to three times a year.", "The unlock fee is doubled."],
                "answer": "Included ride duration increases from 30 to 45 minutes.",
                "explanation": "Unlimited rides on standard bicycles expand from 30 minutes to 45 minutes."
            },
            {
                "q": "What condition must be met to freeze an Annual Pass?",
                "choices": ["Paying a $0.15/min holding fee", "Calling customer support a week ahead", "Submitting the request in-app at least 24 hours in advance", "Returning an electric bike to a hub"],
                "answer": "Submitting the request in-app at least 24 hours in advance",
                "explanation": "The notice requires submitting the freeze request via the app at least 24 hours prior."
            }
        ]
    },
    {
        "id": "rp-dl-04",
        "kind": "Read in Daily Life",
        "title": "Apartment Recycling Policy Reminder",
        "text": "MAPLE COURT RESIDENTS — RECYCLING REMINDER\nOur municipal waste carrier issued a warning this week because plastic bags and greasy pizza boxes were placed in the blue recycling bins. Plastic shopping bags jam the sorting rollers at the recycling plant and must be returned to grocery store drop-offs instead. Clean cardboard boxes should be flattened before placing them beside Bin B. Starting next Monday, unflattened boxes left in the hallway will not be collected by building staff.",
        "questions": [
            {
                "q": "Why should plastic shopping bags NOT be placed in the blue bins?",
                "choices": ["They attract pests in the hallway.", "They jam the sorting machinery at the recycling plant.", "They cannot be recycled anywhere in the city.", "They take up space needed for Bin B."],
                "answer": "They jam the sorting machinery at the recycling plant.",
                "explanation": "The notice states plastic bags 'jam the sorting rollers at the recycling plant'."
            },
            {
                "q": "What happens if a resident leaves unflattened cardboard in the hallway next week?",
                "choices": ["The resident is fined immediately.", "Building staff will not collect it.", "The waste carrier flattens it for a fee.", "It will be moved to grocery drop-offs."],
                "answer": "Building staff will not collect it.",
                "explanation": "Starting next Monday, unflattened hallway boxes will not be collected."
            }
        ]
    },
    {
        "id": "rp-ac-01",
        "kind": "Academic Passage",
        "title": "Urban Heat Islands and Tree Canopies",
        "text": "Metropolitan areas consistently record temperatures 2°C to 5°C higher than surrounding rural landscapes—a phenomenon known as the urban heat island (UHI) effect. Dark asphalt roads and concrete roofs absorb solar radiation throughout the day and release it slowly after sunset, preventing nocturnal cooling. Urban forestry studies demonstrate that increasing neighborhood tree canopy cover by just 20 percent can cut afternoon street-level temperatures by up to 3°C through two distinct mechanisms: direct shading of paved surfaces and evapotranspiration, in which leaves release water vapor that absorbs ambient heat. However, planners caution that planting drought-sensitive ornamental species in arid cities can backfire if irrigation demands strain municipal water supplies.",
        "questions": [
            {
                "q": "According to the passage, why do cities stay warm even after sunset?",
                "choices": ["Tree canopies trap warm air near streets.", "Paved and concrete surfaces release stored solar heat slowly.", "Municipal water irrigation raises humidity.", "Rural winds stop blowing at night."],
                "answer": "Paved and concrete surfaces release stored solar heat slowly.",
                "explanation": "The passage notes dark asphalt and concrete 'release it slowly after sunset, preventing nocturnal cooling'."
            },
            {
                "q": "What potential drawback of urban tree planting does the author mention?",
                "choices": ["Trees block too much winter sunlight.", "Roots damage underground power lines.", "Water-intensive species can strain water supplies in arid cities.", "Evapotranspiration increases asphalt heat absorption."],
                "answer": "Water-intensive species can strain water supplies in arid cities.",
                "explanation": "The final sentence warns that drought-sensitive species can strain municipal water supplies in arid regions."
            }
        ]
    },
    {
        "id": "rp-ac-02",
        "kind": "Academic Passage",
        "title": "Bioluminescence in Deep-Sea Ecosystems",
        "text": "Below 200 meters in the open ocean—the mesopelagic or 'twilight' zone—sunlight fades too rapidly to support photosynthesis. Yet more than 75 percent of marine organisms inhabiting this region produce their own light through bioluminescence, a chemical reaction between a light-emitting molecule (luciferin) and an enzyme (luciferase). Rather than serving a single purpose, bioluminescence fulfills diverse ecological roles. Hatchetfish emit faint blue light from their undersides to match the dim downwelling sunlight above, masking their silhouettes from predators below—a strategy called counterillumination. Conversely, deep-sea anglerfish dangle luminous lures powered by symbiotic bacteria to attract curious prey within striking distance.",
        "questions": [
            {
                "q": "How does counterillumination help hatchetfish survive?",
                "choices": ["It blinds predators swimming directly above them.", "It camouflages their silhouette against dim light from above.", "It attracts symbiotic bacteria to their scales.", "It warms the water around their fins."],
                "answer": "It camouflages their silhouette against dim light from above.",
                "explanation": "Counterillumination matches downwelling light to mask the fish's silhouette from predators looking up from below."
            },
            {
                "q": "What is the main purpose of the passage?",
                "choices": ["To explain why photosynthesis stops at 200 meters", "To illustrate how deep-sea species use bioluminescence for varied survival strategies", "To compare marine bacteria with land enzymes", "To argue that deep-sea fishing threatens hatchetfish"],
                "answer": "To illustrate how deep-sea species use bioluminescence for varied survival strategies",
                "explanation": "The passage defines deep-sea bioluminescence and highlights two contrasting survival functions (defense and hunting)."
            }
        ]
    },
    {
        "id": "rp-ac-03",
        "kind": "Academic Passage",
        "title": "The Economics of Open-Source Software",
        "text": "At first glance, open-source software appears to defy classical economic assumptions: thousands of skilled programmers contribute code freely to projects anyone can copy at zero marginal cost. Economists studying open-source ecosystems identify two primary incentives that sustain this model. First, individual contributors gain public, verifiable portfolios that signal competence to employers—a reputational return known as career-concern motivation. Second, large technology firms subsidize core infrastructure projects like Linux or database engines because sharing maintenance costs across an industry is far cheaper than building proprietary equivalents from scratch, while firms monetize complementary cloud hosting and enterprise support.",
        "questions": [
            {
                "q": "Why do large technology corporations often fund open-source infrastructure?",
                "choices": ["They are legally required to publish internal code.", "Sharing maintenance costs is cheaper than building proprietary equivalents while earning revenue on complementary services.", "Open-source licenses prohibit cloud hosting.", "It prevents individual contributors from building public portfolios."],
                "answer": "Sharing maintenance costs is cheaper than building proprietary equivalents while earning revenue on complementary services.",
                "explanation": "The passage explains firms share infrastructure maintenance costs and monetize cloud hosting and enterprise support."
            },
            {
                "q": "The phrase 'career-concern motivation' refers to:",
                "choices": ["Fear that software will become obsolete", "Contributing public code to demonstrate skill and attract employers", "Corporate anxiety about rival cloud providers", "Charging users marginal fees for downloads"],
                "answer": "Contributing public code to demonstrate skill and attract employers",
                "explanation": "Individual developers gain 'public, verifiable portfolios that signal competence to employers'."
            }
        ]
    },
    {
        "id": "rp-ac-04",
        "kind": "Academic Passage",
        "title": "Memory Consolidation During Sleep",
        "text": "Far from being a passive period of neural rest, sleep plays an active role in transforming fragile short-term memories into durable long-term knowledge. During slow-wave (deep) sleep, the hippocampus repeatedly replays newly encoded neural patterns from daytime learning, gradually transferring them to neocortical networks for permanent storage. Controlled experiments show that students who sleep for eight hours after learning complex vocabulary lists recall significantly more items 24 hours later than peers who spend the same interval awake—even when daytime study time is identical. Crucially, pulling an 'all-nighter' before an exam impairs both subsequent consolidation and the prefrontal cortex's capacity to encode new information the following day.",
        "questions": [
            {
                "q": "What occurs during slow-wave sleep according to the passage?",
                "choices": ["The prefrontal cortex shuts off permanently.", "The hippocampus replays new patterns and helps transfer them to the neocortex.", "Short-term memories are erased to save energy.", "Daytime study time becomes unnecessary."],
                "answer": "The hippocampus replays new patterns and helps transfer them to the neocortex.",
                "explanation": "During slow-wave sleep, the hippocampus replays daytime patterns and transfers them to neocortical networks."
            },
            {
                "q": "What does the passage imply about staying awake all night before an exam?",
                "choices": ["It improves vocabulary recall if study time is doubled.", "It harms both memory stabilization and next-day learning capacity.", "It only affects physical coordination, not cognition.", "It accelerates neocortical storage."],
                "answer": "It harms both memory stabilization and next-day learning capacity.",
                "explanation": "The last sentence states an all-nighter impairs both consolidation and the prefrontal cortex's ability to encode new info the next day."
            }
        ]
    }
]

band_conversion = [
    {"band": 6.0, "classic": "114–120", "cefr": "C2", "summary": "Near-native precision, nuanced argumentation, effortless comprehension & fluency."},
    {"band": 5.5, "classic": "107–113", "cefr": "C1+", "summary": "Highly competitive for top PhD/Ivy/fellowship programs; rare minor slips."},
    {"band": 5.0, "classic": "95–106", "cefr": "C1", "summary": "Strong graduate admissions benchmark; clear structure and broad academic lexicon."},
    {"band": 4.5, "classic": "86–94", "cefr": "B2+", "summary": "Solid upper-intermediate command; meets most MS/undergraduate cutoffs."},
    {"band": 4.0, "classic": "72–85", "cefr": "B2", "summary": "Functional academic English; noticeable pacing, lexical, or detail gaps."},
    {"band": 3.5, "classic": "58–71", "cefr": "B1+", "summary": "Developing academic readiness; needs daily structured skill-building."},
    {"band": 3.0, "classic": "42–57", "cefr": "B1", "summary": "Foundational communication; focus on core grammar, AWL vocab, and shadowing."}
]

study_roadmaps = [
    {
        "level": "B1 Foundation (Target: Band 4.0–4.5 · 8–12 Weeks)",
        "focus": "Build core grammar, 400 Must-Have + AWL vocab, daily shadowing & basic Complete-the-Words accuracy.",
        "dailyPlan": [
            "30m Vocabulary & Collocations SRS (25 new words/day + review)",
            "25m Grammar in Use + Build a Sentence (10 items/day)",
            "25m Listening & Shadowing (BBC 6-Minute / Listening Micro-Quizzes + transcript check)",
            "20m Complete the Words (2 passages/day) + 15m Listen & Repeat easy/medium sets"
        ]
    },
    {
        "level": "B2 Test-Ready (Target: Band 5.0–5.5 · 4–6 Weeks)",
        "focus": "Master 2026 adaptive timing, Build a Sentence perfection (50% of Writing!), Email archetypes, and 4-turn Interview fluency under noise.",
        "dailyPlan": [
            "25m Complete the Words (3 timed passages) + track spelling traps",
            "30m Writing Lab: 10 Build-a-Sentence + 1 timed Email (7m) + 1 Academic Discussion (10m) graded with AI Diagnostic Prompts",
            "25m Speaking Lab WITH Exam-Room Babble Noise ON: 1 Full 7+4 Sim + Coach Capsule retake",
            "20m CTW Collocations & Academic Reading vocab review"
        ]
    },
    {
        "level": "C1 Polish (Target: Band 5.5–6.0 · 2–3 Weeks)",
        "focus": "Eliminate careless spelling/grammar drops, compress interview answers cleanly into 45s, and simulate full noisy test-center conditions.",
        "dailyPlan": [
            "Full timed mixed sprint across Reading CTW + Build-a-Sentence + Listening + Speaking (with Babble Noise at 40%)",
            "Audit every single error in Error Log / Mistake Notebook; drill missed collocations & phonemes",
            "Review Official ETS RR-106 Writing & Speaking Rubrics and calibrate with AI Diagnostic Prompts"
        ]
    }
]

suite_bank = {
    "meta": {
        "generatedFrom": "E:\\TOEFL-GRE\\curated\\files",
        "babbleAudio": "./assets/audio/babble_speaking.mp3",
    },
    "reading": {
        "categories": ctw_cats,
        "completeTheWords": ctw_passages,
        "passages": reading_passages_2026,
    },
    "writing": {
        "buildASentence": bas_items,
        "emails": email_tasks,
        "discussions": disc_tasks,
        "emailGuideMd": email_guide_md,
        "discussionGuideMd": disc_guide_md,
        "scoringGuideMd": scoring_guide_md,
    },
    "listening": {
        "clips": listening_clips,
    },
    "vocab": vocab_items + collocations,
    "ideaBank": idea_bank,
    "aiPrompts": ai_prompts,
    "bandConversion": band_conversion,
    "studyRoadmaps": study_roadmaps,
}

out_js = (
    "// Auto-generated from curated TOEFL 2026 Telegram assets.\n"
    f"const TOEFL_SUITE_BANK = {json.dumps(suite_bank, ensure_ascii=False)};\n"
    "if (typeof module !== 'undefined') module.exports = { TOEFL_SUITE_BANK };\n"
)
(DATA / "toefl-suite-bank.js").write_text(out_js, encoding="utf-8")
print(f"=== TOEFL SUITE DATA BANK WRITTEN: {(DATA/'toefl-suite-bank.js').stat().st_size/1024:.1f} KB ===")
