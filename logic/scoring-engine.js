function createRepeatFeedback(question, transcript, duration, context = {}) {
  const refWords = normalizeWords(question.text);
  const hypWords = normalizeWords(transcript);
  const alignment = alignWords(refWords, hypWords);
  const stats = countAlignment(alignment);
  const refLength = Math.max(1, refWords.length);
  const hypLength = Math.max(1, hypWords.length);
  const exactRecall = stats.matches / refLength;
  const precision = stats.matches / hypLength;
  const contentRecall = getContentRecall(alignment, refWords);
  const omissionRate = stats.missing / refLength;
  const substitutionRate = stats.substitutions / refLength;
  const extraRate = stats.extras / refLength;
  const lengthFit = clamp01(1 - Math.abs(hypWords.length - refWords.length) / Math.max(refWords.length, 4));
  const sequenceScore = clamp01(1 - (stats.substitutions + stats.extras * 0.65 + stats.missing * 0.85) / refLength);
  const expectedSeconds = Math.max(3, refWords.length / 2.25);
  const paceScore = duration ? clamp01(1 - Math.abs(duration - expectedSeconds) / Math.max(expectedSeconds, 5)) : 0.58;
  const fillerPenalty = getFillerPenalty(transcript);
  const audioQualityScore = getAudioQualityScore(context.audioStats);
  const pauseScore = getPauseScore(context.audioStats, duration);
  const recognitionConfidenceScore = getRecognitionConfidenceScore(context.recognitionStats);
  const processingScore = clamp01(exactRecall * 0.68 + precision * 0.18 + contentRecall * 0.14 - extraRate * 0.16);
  const completenessScore = clamp01(1 - omissionRate * 1.35);
  const pronunciationScore = getPronunciationProxy({
    exactRecall,
    precision,
    contentRecall,
    deliveryScore: paceScore,
    audioQualityScore,
    recognitionConfidenceScore,
    fillerPenalty
  });
  const intelligibilityProxy = clamp01(precision * 0.35 + contentRecall * 0.2 + recognitionConfidenceScore * 0.2 + audioQualityScore * 0.15 + lengthFit * 0.1 - fillerPenalty);
  const deliveryScore = clamp01(paceScore * 0.48 + pauseScore * 0.22 + lengthFit * 0.16 + audioQualityScore * 0.14 - fillerPenalty);
  const composite = clamp01(
    processingScore * 0.34 +
    completenessScore * 0.2 +
    sequenceScore * 0.14 +
    pronunciationScore * 0.2 +
    deliveryScore * 0.12
  );
  const score = applyRepeatCaps(roundHalf(1 + composite * 5), {
    exactRecall,
    precision,
    hypWords,
    refWords,
    stats,
    deliveryScore
  });
  const issues = [];
  const strengths = [];

  if (processingScore >= 0.82) strengths.push("Strong auditory processing and retention of core content words.");
  if (completenessScore >= 0.82) strengths.push("High sentence completeness with minimal phrase omissions.");
  if (sequenceScore >= 0.8) strengths.push("Stable word order and syntactic structure matching the original sentence.");
  if (pronunciationScore >= 0.74) strengths.push("Clear pronunciation and high speech recognition intelligibility.");
  if (deliveryScore >= 0.78) strengths.push("Natural speaking pace without rushing or dragging.");

  if (stats.missing > 0) issues.push(`Omitted ${stats.missing} word(s) from the prompt; focus on anchoring the subject, main verb, and modifiers.`);
  if (stats.substitutions > 0) issues.push(`Substituted ${stats.substitutions} word(s); aim for verbatim repetition rather than paraphrasing.`);
  if (stats.extras > 2) issues.push("Inserted extra words not present in the original prompt, which reduces repetition accuracy.");
  if (contentRecall < 0.75) issues.push("Low content-word retention; prioritize nouns, main verbs, adjectives, and numbers.");
  if (pronunciationScore < 0.55) issues.push("Intelligibility is low; slow down slightly to stress content words and articulate word endings.");
  if (audioQualityScore < 0.55) issues.push("Audio signal quality is low; speak closer to the microphone in a quiet room.");
  if (duration && deliveryScore < 0.58) issues.push("Pacing diverged from natural speech; repeat in 2-3 cohesive thought groups instead of word-by-word.");
  if (!issues.length) issues.push("Challenge yourself next time by listening only once while keeping the same accuracy.");
  if (!strengths.length) strengths.push("Completed an analyzable repetition attempt; focus next on reducing omitted and substituted words.");

  return {
    type: "repeat",
    score,
    summary: `Simulated Band: ${getBandLabel(score)}. Accuracy: ${Math.round(processingScore * 100)}%, Completeness: ${Math.round(completenessScore * 100)}%.`,
    strengths,
    issues: issues.slice(0, 3),
    improvedAnswer: "Target for Listen & Repeat: retain the exact meaning and key content words first, then smooth out your rhythm across 2-3 thought groups without paraphrasing.",
    metrics: [
      { label: "Accuracy", value: `${Math.round(processingScore * 100)}%` },
      { label: "Completeness", value: `${Math.round(completenessScore * 100)}%` },
      { label: "Word Order", value: `${Math.round(sequenceScore * 100)}%` },
      { label: "Intelligibility", value: `${Math.round(pronunciationScore * 100)}%` },
      { label: "Pacing", value: `${Math.round(deliveryScore * 100)}%` },
      { label: "Miss/Sub/Extra", value: `${stats.missing}/${stats.substitutions}/${stats.extras}` }
    ],
    detailScores: [
      { label: "Accuracy", score: processingScore, detail: "Exact word and content-word match against the original prompt." },
      { label: "Completeness", score: completenessScore, detail: "Proportion of original words retained and overall sentence coverage." },
      { label: "Word Order", score: sequenceScore, detail: "Preservation of original syntactic sequence without substitutions or insertions." },
      { label: "Intelligibility", score: pronunciationScore, detail: "Combined proxy of ASR confidence, content-word clarity, and audio quality." },
      { label: "Pacing", score: deliveryScore, detail: "Response duration, pause ratio, and natural rhythmic delivery." }
    ],
    rubricProfile: [
      { label: "Repetition Accuracy", weight: 0.54, note: "How accurately heard words and core meaning are preserved." },
      { label: "Completeness & Order", weight: 0.22, note: "Whether key segments are retained in the original sequence." },
      { label: "Intelligibility", weight: 0.14, note: "ASR recognition stability, audio clarity, and content-word articulation." },
      { label: "Natural Rhythm", weight: 0.1, note: "Chunked delivery across thought groups without choppy pauses." }
    ],
    pronunciation: buildPronunciationReport({
      pronunciationScore,
      recognitionConfidenceScore,
      audioQualityScore,
      pauseScore,
      audioStats: context.audioStats,
      recognitionStats: context.recognitionStats,
      phonemeFocus: inferPronunciationFocus({ alignment, refWords, hypWords, transcript }),
      wordCount: hypWords.length,
      duration
    }),
    alignment
  };
}

function createInterviewFeedback(question, transcript, duration, context = {}) {
  const words = normalizeWords(transcript);
  const wordCount = words.length;
  const uniqueRatio = wordCount ? new Set(words).size / wordCount : 0;
  const wpm = duration ? Math.round(wordCount / (duration / 60)) : 0;
  const lower = ` ${transcript.toLowerCase()} `;
  const reasonMarkers = [" because ", " since ", " the reason ", " one reason ", " this is because ", " so "];
  const exampleMarkers = [" for example ", " for instance ", " such as ", " last semester ", " once ", " when i ", " in my class ", " in one course "];
  const structureMarkers = [" first ", " also ", " however ", " in addition ", " on the other hand ", " overall ", " in the end ", " that is why "];
  const resultMarkers = [" as a result ", " this helps ", " this made ", " therefore ", " so that ", " because of this "];
  const directMarkers = [" i think ", " i believe ", " in my opinion ", " i prefer ", " i would ", " yes ", " no ", " one ", " my "];
  const fillerMatches = lower.match(/\b(um|uh|er|like|you know|sort of|kind of)\b/g) || [];
  const repeatedWordPenalty = getRepeatedWordPenalty(words);
  const hasReason = hasAnyMarker(lower, reasonMarkers);
  const hasExample = hasAnyMarker(lower, exampleMarkers);
  const hasStructure = hasAnyMarker(lower, structureMarkers);
  const hasResult = hasAnyMarker(lower, resultMarkers);
  const hasDirectAnswer = hasAnyMarker(lower.slice(0, 120), directMarkers) || /^[\s"']*(yes|no)\b/i.test(transcript);
  const promptKeywords = getContentWords(normalizeWords(question.text));
  const promptOverlap = promptKeywords.length ? countOverlap(promptKeywords, new Set(words)) / promptKeywords.length : 0.45;
  const relevanceScore = clamp01(promptOverlap * 1.6 + (wordCount >= 28 ? 0.25 : 0));
  const lengthScore = getInterviewLengthScore(wordCount);
  const demandScore = getPromptDemandScore(question.text, { hasReason, hasExample, hasDirectAnswer, lower });
  const taskScore = clamp01(lengthScore * 0.32 + relevanceScore * 0.22 + demandScore * 0.26 + (hasDirectAnswer ? 0.2 : 0));
  const developmentScore = clamp01(
    (hasReason ? 0.28 : 0) +
    (hasExample ? 0.34 : 0) +
    (hasResult ? 0.18 : 0) +
    getSpecificDetailScore(transcript, words) * 0.2
  );
  const organizationScore = clamp01(
    (hasDirectAnswer ? 0.25 : 0) +
    Math.min(0.35, countMarkers(lower, structureMarkers) * 0.12 + countMarkers(lower, reasonMarkers) * 0.08) +
    (hasExample ? 0.18 : 0) +
    (hasResult ? 0.12 : 0) +
    getAnswerShapeScore(words, lower) * 0.1
  );
  const lexicalScore = clamp01((uniqueRatio * 1.45 + getContentDensity(words) * 0.55) / 1.35);
  const sentenceComplexityScore = clamp01(countMarkers(lower, [" because ", " when ", " if ", " although ", " while ", " which ", " that "]) / 3);
  const languageScore = clamp01(lexicalScore * 0.55 + sentenceComplexityScore * 0.2 + lengthScore * 0.2 - repeatedWordPenalty);
  const paceScore = wpm ? clamp01(1 - Math.abs(wpm - 125) / 85) : 0.56;
  const fillerPenalty = Math.min(0.25, fillerMatches.length * 0.05);
  const durationFit = duration ? getDurationFit(duration, 35, 75) : 0.58;
  const audioQualityScore = getAudioQualityScore(context.audioStats);
  const pauseScore = getPauseScore(context.audioStats, duration);
  const recognitionConfidenceScore = getRecognitionConfidenceScore(context.recognitionStats);
  const pronunciationScore = getPronunciationProxy({
    exactRecall: relevanceScore,
    precision: lexicalScore,
    contentRecall: developmentScore,
    deliveryScore: paceScore,
    audioQualityScore,
    recognitionConfidenceScore,
    fillerPenalty
  });
  const deliveryScore = clamp01(paceScore * 0.34 + durationFit * 0.18 + pauseScore * 0.2 + pronunciationScore * 0.18 + audioQualityScore * 0.1 - fillerPenalty);
  const composite = clamp01(
    taskScore * 0.27 +
    developmentScore * 0.27 +
    organizationScore * 0.2 +
    languageScore * 0.16 +
    deliveryScore * 0.1
  );
  const score = applyInterviewCaps(roundHalf(clamp(1, 6, 1 + composite * 5)), {
    wordCount,
    hasDirectAnswer,
    hasReason,
    hasExample,
    taskScore,
    developmentScore,
    deliveryScore,
    wpm
  });
  const strengths = [];
  const issues = [];

  if (taskScore >= 0.72) strengths.push("Directly addresses the prompt with a clear opening position.");
  if (developmentScore >= 0.72) strengths.push("Well-developed response supported by reasons and specific examples.");
  if (organizationScore >= 0.7) strengths.push("Coherent discourse progression that is easy for a listener to follow.");
  if (languageScore >= 0.68) strengths.push("Good lexical variety and sentence complexity beyond simple clauses.");
  if (pronunciationScore >= 0.72) strengths.push("Clear articulation with strong keyword intelligibility.");
  if (deliveryScore >= 0.72) strengths.push("Natural speaking rate and pause profile suitable for an academic interview.");

  if (wordCount < 35) issues.push("Response is too brief; expand to 45-75 words with at least one reason and one concrete example.");
  if (!hasDirectAnswer) issues.push("Missing a direct opening claim; state your choice or opinion in the very first sentence.");
  if (!hasReason) issues.push("Lacks an explicit reason; connect your claim with 'because' or 'the main reason is'.");
  if (!hasExample) issues.push("Missing a concrete personal or academic example; introduce one with 'for example' or 'last semester'.");
  if (!hasResult) issues.push("Add a concluding result or takeaway after your example using 'as a result' or 'this helped me'.");
  if (organizationScore < 0.52) issues.push("Weak discourse structure; follow the 4-step 'Claim -> Reason -> Example -> Result' sequence.");
  if (wpm && wpm < 85) issues.push("Speaking rate is slow; outline key content words mentally and link full clauses smoothly.");
  if (wpm > 170) issues.push("Speaking rate is rushed, which can hurt clarity; pause briefly between thought groups.");
  if (fillerMatches.length >= 3) issues.push("Excessive filler words ('um', 'uh', 'like'); replace verbal fillers with silent micro-pauses.");
  if (pronunciationScore < 0.55) issues.push("Pronunciation clarity is low; slow down on multisyllabic content words and final consonants.");
  if (audioQualityScore < 0.55) issues.push("Audio recording quality is low; reduce background noise and maintain steady microphone distance.");
  if (repeatedWordPenalty > 0.08) issues.push("Noticeable word repetition; vary your high-frequency verbs and adjectives.");

  if (!strengths.length) strengths.push("Completed an analyzable response; focus next on pairing a clear claim with a specific example.");
  if (!issues.length) issues.push("Strong overall response; tighten your opening sentence to leave even more time for detailed examples.");

  return {
    type: "interview",
    score,
    summary: `Simulated Band: ${getBandLabel(score)}. Length: ${wordCount} words, Pace: ${wpm || "-"} WPM.`,
    strengths: strengths.slice(0, 3),
    issues: issues.slice(0, 3),
    improvedAnswer: question.sample,
    metrics: [
      { label: "Task Fulfillment", value: `${Math.round(taskScore * 100)}%` },
      { label: "Topic Development", value: `${Math.round(developmentScore * 100)}%` },
      { label: "Organization", value: `${Math.round(organizationScore * 100)}%` },
      { label: "Language Use", value: `${Math.round(languageScore * 100)}%` },
      { label: "Intelligibility", value: `${Math.round(pronunciationScore * 100)}%` },
      { label: "Fluency", value: `${Math.round(deliveryScore * 100)}%` }
    ],
    detailScores: [
      { label: "Task Fulfillment", score: taskScore, detail: "Directness of opening response and alignment with prompt keywords." },
      { label: "Topic Development", score: developmentScore, detail: "Presence of supporting reasons, concrete examples, and outcomes." },
      { label: "Organization", score: organizationScore, detail: "Logical progression across Claim -> Reason -> Example -> Result." },
      { label: "Language Use", score: languageScore, detail: "Vocabulary diversity, content-word density, and subordinate clause usage." },
      { label: "Intelligibility", score: pronunciationScore, detail: "Combined proxy of ASR confidence, audio quality, and keyword clarity." },
      { label: "Fluency", score: deliveryScore, detail: "Speaking rate (WPM), duration fit, pause profile, and filler control." }
    ],
    rubricProfile: [
      { label: "Task & Development", weight: 0.54, note: "Directly answering the prompt and elaborating with reasons and examples." },
      { label: "Organization", weight: 0.2, note: "Clear rhetorical progression across claim, reason, example, and result." },
      { label: "Language Use", weight: 0.16, note: "Lexical precision, syntactic variety, and grammatical control." },
      { label: "Fluency & Clarity", weight: 0.1, note: "Intelligibility, natural pacing, pause control, and audio stability." }
    ],
    pronunciation: buildPronunciationReport({
      pronunciationScore,
      recognitionConfidenceScore,
      audioQualityScore,
      pauseScore,
      audioStats: context.audioStats,
      recognitionStats: context.recognitionStats,
      phonemeFocus: inferPronunciationFocus({ alignment: [], refWords: promptKeywords, hypWords: words, transcript }),
      wordCount,
      duration
    })
  };
}

function getBandLabel(score) {
  if (score >= 5.5) return "Advanced (C1-C2)";
  if (score >= 4.5) return "High-Intermediate (B2+)";
  if (score >= 3.5) return "Intermediate (B1-B2)";
  if (score >= 2.5) return "Basic (A2-B1)";
  return "Developing (Needs Practice)";
}

async function enhanceFeedbackWithExternalScorers(feedback, question, transcript, duration, context, audioBlob = state.audioBlob) {
  const setup = state.setup || getDefaultSetupConfig();
  const errors = [];

  if (setup.ai.enabled) {
    state.status = "Calling AI Content Evaluator...";
    render();
    try {
      const aiResult = await callAiScorer(setup.ai, question, transcript, duration, feedback);
      mergeAiFeedback(feedback, aiResult);
    } catch (error) {
      errors.push(`AI evaluation failed: ${error.message}`);
    }
  }

  if (setup.pronunciation.enabled) {
    state.status = "Calling External Pronunciation Scorer...";
    render();
    try {
      const pronunciationResult = await callPronunciationScorer(setup.pronunciation, question, transcript, duration, context, audioBlob);
      mergeExternalPronunciation(feedback, pronunciationResult, question.type);
    } catch (error) {
      errors.push(`Pronunciation scoring failed: ${error.message}`);
    }
  }

  if (errors.length) {
    feedback.externalErrors = errors;
    feedback.issues = [...feedback.issues, ...errors].slice(0, 4);
  }
}

async function callAiScorer(config, question, transcript, duration, feedback) {
  if (!config.endpoint || !config.apiKey || !config.model) {
    throw new Error("Please configure AI endpoint, API key, and model in Setup.");
  }

  const systemPrompt = [
    "You are a TOEFL iBT 2026 speaking evaluator.",
    "Score on a 1-6 half-point scale.",
    "Return only valid JSON with keys: score, summary, strengths, issues, improvedAnswer, grammarNotes, dimensionScores.",
    "dimensionScores should contain percentages from 0 to 100."
  ].join(" ");
  const userPrompt = JSON.stringify({
    taskType: question.type,
    prompt: question.text,
    transcript,
    durationSeconds: duration,
    localScore: feedback.score,
    localSummary: feedback.summary,
    expectedRubric: question.type === "repeat"
      ? ["accuracy of repetition", "completeness", "word order", "clear intelligibility", "natural pace"]
      : ["task response", "development", "organization", "language use", "clear intelligibility", "fluency"]
  }, null, 2);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.apiKey}`
  };
  const body = config.mode === "chat"
    ? {
        model: config.model,
        temperature: clamp(0, 1, Number(config.temperature) || 0),
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      }
    : {
        model: config.model,
        temperature: clamp(0, 1, Number(config.temperature) || 0),
        instructions: systemPrompt,
        input: userPrompt
      };

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${text.slice(0, 160)}`);
  }

  const data = await response.json();
  const text = extractAiText(data);
  return parseJsonLike(text);
}

function extractAiText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  if (data.choices && data.choices[0] && data.choices[0].message) return data.choices[0].message.content || "";
  if (data.output && data.output[0] && data.output[0].content) {
    const content = data.output.flatMap((item) => item.content || []);
    const textItem = content.find((item) => item.text || item.type === "output_text");
    return textItem ? (textItem.text || "") : "";
  }
  return JSON.stringify(data);
}

function parseJsonLike(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const match = String(text).match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("AI response did not contain valid JSON.");
  }
}

function mergeAiFeedback(feedback, aiResult) {
  const aiScore = clamp(1, 6, Number(aiResult.score));
  feedback.externalAi = {
    score: Number.isFinite(aiScore) ? roundHalf(aiScore) : null,
    summary: cleanupSpacing(aiResult.summary || ""),
    strengths: Array.isArray(aiResult.strengths) ? aiResult.strengths.slice(0, 4) : [],
    issues: Array.isArray(aiResult.issues) ? aiResult.issues.slice(0, 4) : [],
    grammarNotes: Array.isArray(aiResult.grammarNotes) ? aiResult.grammarNotes.slice(0, 6) : [],
    dimensionScores: aiResult.dimensionScores || {}
  };

  if (feedback.externalAi.score) {
    feedback.localScore = feedback.localScore || feedback.score;
    feedback.score = roundHalf(feedback.localScore * 0.65 + feedback.externalAi.score * 0.35);
    feedback.metrics.push({ label: "AI Score", value: `${feedback.externalAi.score}/6` });
    feedback.summary = `${feedback.summary} AI-blended score: ${feedback.score}/6.`;
  }
  if (cleanupSpacing(aiResult.improvedAnswer || "")) feedback.improvedAnswer = aiResult.improvedAnswer;
}

async function callPronunciationScorer(config, question, transcript, duration, context, audioBlob) {
  if (!config.apiKey) throw new Error("Please configure a pronunciation API key in Setup.");
  if (!audioBlob) throw new Error("No audio recording available to send. Please record first.");

  if (config.provider === "custom") {
    if (!config.endpoint) throw new Error("Custom provider requires an endpoint URL.");
    return callCustomPronunciationEndpoint(config, question, transcript, duration, context, audioBlob);
  }

  const region = config.azureRegion;
  const endpoint = config.endpoint || (region
    ? `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`
    : "");
  if (!endpoint) throw new Error("Azure provider requires a region or endpoint override.");

  const wavBlob = await convertBlobToWav16k(audioBlob);
  const referenceText = question.type === "repeat" ? question.text : transcript;
  const assessment = {
    ReferenceText: referenceText.slice(0, 5000),
    GradingSystem: "HundredMark",
    Granularity: "Phoneme",
    Dimension: "Comprehensive",
    EnableMiscue: true
  };
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": config.apiKey,
      "Pronunciation-Assessment": base64EncodeUnicode(JSON.stringify(assessment)),
      "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
      Accept: "application/json"
    },
    body: wavBlob
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${text.slice(0, 160)}`);
  }
  const data = await response.json();
  return normalizeAzurePronunciation(data);
}

async function callCustomPronunciationEndpoint(config, question, transcript, duration, context, audioBlob) {
  const audioBase64 = await blobToBase64(audioBlob);
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {})
    },
    body: JSON.stringify({
      taskType: question.type,
      prompt: question.text,
      referenceText: question.type === "repeat" ? question.text : transcript,
      transcript,
      duration,
      audio: audioBase64,
      audioStats: context.audioStats
    })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${text.slice(0, 160)}`);
  }
  return normalizeCustomPronunciation(await response.json());
}

function normalizeAzurePronunciation(data) {
  const best = data.NBest && data.NBest[0] ? data.NBest[0] : {};
  const assessment = best.PronunciationAssessment || data.PronunciationAssessment || {};
  const words = best.Words || data.Words || [];
  const phonemes = [];
  words.forEach((word) => {
    (word.Phonemes || []).forEach((phoneme) => {
      const score = phoneme.PronunciationAssessment && Number(phoneme.PronunciationAssessment.AccuracyScore);
      if (Number.isFinite(score) && score < 75) {
        phonemes.push({
          sound: phoneme.Phoneme || "",
          word: word.Word || "",
          score,
          errorType: phoneme.PronunciationAssessment.ErrorType || ""
        });
      }
    });
  });
  return {
    provider: "Azure Speech",
    raw: data,
    score: normalizeHundredScore(assessment.PronScore),
    accuracy: normalizeHundredScore(assessment.AccuracyScore),
    fluency: normalizeHundredScore(assessment.FluencyScore),
    completeness: normalizeHundredScore(assessment.CompletenessScore),
    prosody: normalizeHundredScore(assessment.ProsodyScore),
    words: words.slice(0, 80).map((word) => ({
      word: word.Word,
      score: word.PronunciationAssessment ? word.PronunciationAssessment.AccuracyScore : null,
      errorType: word.PronunciationAssessment ? word.PronunciationAssessment.ErrorType : ""
    })),
    phonemes: phonemes.slice(0, 12)
  };
}

function normalizeCustomPronunciation(data) {
  return {
    provider: data.provider || "Custom",
    raw: data,
    score: normalizeHundredScore(data.score || data.pronunciationScore),
    accuracy: normalizeHundredScore(data.accuracy),
    fluency: normalizeHundredScore(data.fluency),
    completeness: normalizeHundredScore(data.completeness),
    prosody: normalizeHundredScore(data.prosody),
    words: Array.isArray(data.words) ? data.words.slice(0, 80) : [],
    phonemes: Array.isArray(data.phonemes) ? data.phonemes.slice(0, 12) : []
  };
}

function normalizeHundredScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return number > 1 ? clamp01(number / 100) : clamp01(number);
}

function mergeExternalPronunciation(feedback, pronunciationResult, taskType) {
  if (!pronunciationResult) return;
  feedback.externalPronunciation = pronunciationResult;
  if (feedback.pronunciation) {
    feedback.pronunciation.external = pronunciationResult;
    if (Number.isFinite(pronunciationResult.score)) {
      feedback.pronunciation.score = clamp01(feedback.pronunciation.score * 0.5 + pronunciationResult.score * 0.5);
      feedback.metrics.push({ label: "Ext. Pron.", value: `${Math.round(pronunciationResult.score * 100)}%` });
    }
    if (pronunciationResult.phonemes && pronunciationResult.phonemes.length) {
      const externalFocus = pronunciationResult.phonemes.map((item) => ({
        sound: item.sound || item.phoneme || "",
        label: `${item.word || ""} ${Number.isFinite(Number(item.score)) ? Math.round(Number(item.score)) : ""}`.trim(),
        tip: item.errorType ? `External assessment flag: ${item.errorType}` : "External assessment flagged this phoneme for practice.",
        words: [item.word || ""].filter(Boolean)
      }));
      feedback.pronunciation.phonemeFocus = [...externalFocus, ...(feedback.pronunciation.phonemeFocus || [])].slice(0, 8);
    }
  }

  if (Number.isFinite(pronunciationResult.score)) {
    feedback.localScore = feedback.localScore || feedback.score;
    const externalScore = 1 + pronunciationResult.score * 5;
    const weight = taskType === "repeat" ? 0.15 : 0.1;
    feedback.score = roundHalf(feedback.score * (1 - weight) + externalScore * weight);
  }
}

function getScoringContext() {
  return {
    audioStats: state.audioStats,
    recognitionStats: {
      confidenceSamples: [...state.recognitionStats.confidenceSamples],
      finalSegments: state.recognitionStats.finalSegments,
      interimSegments: state.recognitionStats.interimSegments
    }
  };
}

function buildScoringConfidence(question, feedback, transcript, duration, context = {}) {
  const words = normalizeWords(transcript);
  const reasons = [];
  const signals = [];
  let score = 0.74;

  if (words.length < 8) {
    score -= 0.24;
    reasons.push("Transcript is very short; limited evidence available for scoring.");
  } else if (words.length < 20 && question.type === "interview") {
    score -= 0.14;
    reasons.push("Interview response is brief; content development estimate is less stable.");
  } else {
    signals.push(`${words.length} words`);
  }

  if (!duration) {
    score -= 0.1;
    reasons.push("No audio duration recorded; speaking pace and rhythm are partially estimated.");
  } else {
    signals.push(`${formatTime(duration)} audio`);
  }

  const audioStats = context.audioStats || feedback.pronunciation?.audioStats || null;
  if (!audioStats || !audioStats.available) {
    score -= 0.12;
    reasons.push("Full acoustic features unavailable; intelligibility relies primarily on transcript.");
  } else {
    const audioQuality = getAudioQualityScore(audioStats);
    signals.push(`Audio quality ${Math.round(audioQuality * 100)}%`);
    if (audioQuality < 0.55) {
      score -= 0.18;
      reasons.push("Low audio recording quality may affect intelligibility and pause detection.");
    }
    if (audioStats.clippingPercent > 0.01) {
      score -= 0.08;
      reasons.push("Audio clipping detected; excessive microphone gain can reduce scoring accuracy.");
    }
  }

  const confidenceSamples = context.recognitionStats?.confidenceSamples || [];
  if (!confidenceSamples.length) {
    score -= 0.06;
    reasons.push("No browser ASR confidence samples available; pronunciation is a heuristic proxy.");
  } else {
    const recognitionScore = getRecognitionConfidenceScore(context.recognitionStats);
    signals.push(`ASR confidence ${Math.round(recognitionScore * 100)}%`);
    if (recognitionScore < 0.55) {
      score -= 0.16;
      reasons.push("Low speech recognition confidence; check articulation, volume, or background noise.");
    }
  }

  if (feedback.externalAi) {
    score += 0.06;
    signals.push("AI content evaluation merged");
  }
  if (feedback.externalPronunciation || feedback.pronunciation?.external) {
    score += 0.08;
    signals.push("External pronunciation assessment merged");
  }

  const safeScore = clamp(0.25, 0.95, score);
  const level = safeScore >= 0.78 ? "high" : safeScore >= 0.56 ? "medium" : "low";
  const label = level === "high" ? "High" : level === "medium" ? "Medium" : "Low";
  if (!reasons.length) reasons.push("Transcript length, audio signal quality, and ASR confidence strongly support this evaluation.");

  return {
    score: safeScore,
    level,
    label,
    signals: signals.slice(0, 5),
    reasons: reasons.slice(0, 4),
    note: "Simulated training confidence indicator (not an official ETS score guarantee)."
  };
}

async function analyzeAudioBlob(blob, fallbackDuration) {
  const AudioContextApi = window.AudioContext || window.webkitAudioContext;
  if (!blob || !AudioContextApi) return createAudioStatsFallback(fallbackDuration, "Web Audio is not available.");

  let audioContext;
  try {
    const arrayBuffer = await blob.arrayBuffer();
    audioContext = new AudioContextApi();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const sampleRate = audioBuffer.sampleRate;
    const sampleCount = audioBuffer.length;
    const duration = audioBuffer.duration || fallbackDuration || 0;
    const frameSize = Math.max(256, Math.floor(sampleRate * 0.02));
    const frames = [];
    let sumSquares = 0;
    let peak = 0;
    let clipping = 0;

    for (let start = 0; start < sampleCount; start += frameSize) {
      let frameSquares = 0;
      let frameSamples = 0;
      for (let offset = 0; offset < frameSize && start + offset < sampleCount; offset += 1) {
        let mixed = 0;
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
          mixed += audioBuffer.getChannelData(channel)[start + offset] || 0;
        }
        const sample = mixed / Math.max(1, audioBuffer.numberOfChannels);
        const abs = Math.abs(sample);
        if (abs > peak) peak = abs;
        if (abs > 0.985) clipping += 1;
        frameSquares += sample * sample;
        sumSquares += sample * sample;
        frameSamples += 1;
      }
      frames.push(Math.sqrt(frameSquares / Math.max(1, frameSamples)));
    }

    const rms = Math.sqrt(sumSquares / Math.max(1, sampleCount));
    const noiseFloor = percentile(frames, 0.18);
    const speechFloor = percentile(frames, 0.75);
    const silenceThreshold = clamp(0.006, 0.05, Math.max(noiseFloor * 2.35, rms * 0.3));
    const frameDuration = frameSize / sampleRate;
    let silenceFrames = 0;
    let currentSilence = 0;
    let longestSilence = 0;
    let pauseCount = 0;
    let speechSquares = 0;
    let speechFrameCount = 0;
    let noiseSquares = 0;
    let noiseFrameCount = 0;

    frames.forEach((frameRms) => {
      if (frameRms <= silenceThreshold) {
        silenceFrames += 1;
        currentSilence += frameDuration;
        noiseSquares += frameRms * frameRms;
        noiseFrameCount += 1;
      } else {
        if (currentSilence >= 0.28) pauseCount += 1;
        if (currentSilence > longestSilence) longestSilence = currentSilence;
        currentSilence = 0;
        speechSquares += frameRms * frameRms;
        speechFrameCount += 1;
      }
    });
    if (currentSilence >= 0.28) pauseCount += 1;
    if (currentSilence > longestSilence) longestSilence = currentSilence;

    const silenceSeconds = silenceFrames * frameDuration;
    const speechSeconds = Math.max(0, duration - silenceSeconds);
    const silenceRatio = duration ? clamp01(silenceSeconds / duration) : 0;
    const speechRms = Math.sqrt(speechSquares / Math.max(1, speechFrameCount));
    const noiseRms = Math.sqrt(noiseSquares / Math.max(1, noiseFrameCount));
    const snrDb = 20 * Math.log10((speechRms + 0.00001) / (noiseRms + 0.00001));

    return {
      available: true,
      duration,
      rms,
      peak,
      clippingPercent: clipping / Math.max(1, sampleCount),
      silenceRatio,
      longestSilence,
      pauseCount,
      speechSeconds,
      snrDb,
      noiseFloor,
      speechFloor
    };
  } catch (error) {
    return createAudioStatsFallback(fallbackDuration, error.message || "Audio analysis failed.");
  } finally {
    if (audioContext && audioContext.close) {
      try {
        await audioContext.close();
      } catch (error) {
        // Some browsers keep the context open for a short time after decoding.
      }
    }
  }
}

function createAudioStatsFallback(duration, reason) {
  return {
    available: false,
    duration: duration || 0,
    rms: 0,
    peak: 0,
    clippingPercent: 0,
    silenceRatio: 0,
    longestSilence: 0,
    pauseCount: 0,
    speechSeconds: duration || 0,
    snrDb: 0,
    reason
  };
}

async function convertBlobToWav16k(blob) {
  const AudioContextApi = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextApi) throw new Error("Web Audio API is not supported in this browser; cannot convert WAV.");
  let audioContext;
  try {
    const arrayBuffer = await blob.arrayBuffer();
    audioContext = new AudioContextApi();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const mono = mixToMono(audioBuffer);
    const resampled = resampleLinear(mono, audioBuffer.sampleRate, 16000);
    const wavBuffer = encodeWav16Bit(resampled, 16000);
    return new Blob([wavBuffer], { type: "audio/wav" });
  } finally {
    if (audioContext && audioContext.close) {
      try {
        await audioContext.close();
      } catch (error) {
        // Closing can fail briefly while the browser releases the decoder.
      }
    }
  }
}

function mixToMono(audioBuffer) {
  const output = new Float32Array(audioBuffer.length);
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const data = audioBuffer.getChannelData(channel);
    for (let index = 0; index < data.length; index += 1) {
      output[index] += data[index] / audioBuffer.numberOfChannels;
    }
  }
  return output;
}

function resampleLinear(samples, fromRate, toRate) {
  if (fromRate === toRate) return samples;
  const ratio = fromRate / toRate;
  const newLength = Math.max(1, Math.round(samples.length / ratio));
  const output = new Float32Array(newLength);
  for (let index = 0; index < newLength; index += 1) {
    const sourceIndex = index * ratio;
    const left = Math.floor(sourceIndex);
    const right = Math.min(left + 1, samples.length - 1);
    const fraction = sourceIndex - left;
    output[index] = samples[left] * (1 - fraction) + samples[right] * fraction;
  }
  return output;
}

function encodeWav16Bit(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let index = 0; index < samples.length; index += 1) {
    const value = clamp(-1, 1, samples[index]);
    view.setInt16(offset, value < 0 ? value * 0x8000 : value * 0x7fff, true);
    offset += 2;
  }
  return buffer;
}

function writeAscii(view, offset, text) {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to convert Blob to base64."));
    reader.readAsDataURL(blob);
  });
}

function base64EncodeUnicode(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function getAudioQualityScore(audioStats) {
  if (!audioStats || !audioStats.available) return 0.68;
  const volumeScore = audioStats.rms < 0.012
    ? clamp01(audioStats.rms / 0.012)
    : audioStats.rms > 0.18
      ? clamp01(1 - (audioStats.rms - 0.18) / 0.2)
      : 1;
  const peakScore = audioStats.peak > 0.99 ? 0.55 : audioStats.peak > 0.92 ? 0.78 : 1;
  const clippingScore = clamp01(1 - audioStats.clippingPercent * 18);
  const snrScore = clamp01((audioStats.snrDb - 8) / 18);
  const silenceBalance = clamp01(1 - Math.abs(audioStats.silenceRatio - 0.22) / 0.55);
  return clamp01(volumeScore * 0.28 + peakScore * 0.12 + clippingScore * 0.18 + snrScore * 0.3 + silenceBalance * 0.12);
}

function getPauseScore(audioStats, duration) {
  if (!audioStats || !audioStats.available || !duration) return 0.66;
  const silenceScore = audioStats.silenceRatio <= 0.38 ? 1 : clamp01(1 - (audioStats.silenceRatio - 0.38) / 0.35);
  const longPauseScore = audioStats.longestSilence <= 1.15 ? 1 : clamp01(1 - (audioStats.longestSilence - 1.15) / 2.2);
  const pauseRate = audioStats.pauseCount / Math.max(duration / 60, 0.2);
  const pauseRateScore = pauseRate <= 11 ? 1 : clamp01(1 - (pauseRate - 11) / 18);
  return clamp01(silenceScore * 0.42 + longPauseScore * 0.34 + pauseRateScore * 0.24);
}

function getRecognitionConfidenceScore(recognitionStats) {
  const samples = recognitionStats && recognitionStats.confidenceSamples ? recognitionStats.confidenceSamples : [];
  if (!samples.length) return 0.68;
  const average = samples.reduce((sum, value) => sum + value, 0) / samples.length;
  return clamp01((average - 0.35) / 0.55);
}

function getPronunciationProxy(parts) {
  return clamp01(
    parts.exactRecall * 0.22 +
    parts.precision * 0.2 +
    parts.contentRecall * 0.15 +
    parts.recognitionConfidenceScore * 0.18 +
    parts.audioQualityScore * 0.14 +
    parts.deliveryScore * 0.11 -
    parts.fillerPenalty
  );
}

function buildPronunciationReport(data) {
  const audioStats = data.audioStats || createAudioStatsFallback(data.duration, "No audio stats.");
  const articulationRate = audioStats.available && audioStats.speechSeconds
    ? Math.round(data.wordCount / Math.max(audioStats.speechSeconds / 60, 0.1))
    : 0;
  const notes = [];

  if (!audioStats.available) notes.push("Full acoustic features were not captured; local intelligibility is estimated from transcript and speaking rate.");
  if (data.recognitionConfidenceScore < 0.58) notes.push("Browser ASR confidence is low; check pronunciation clarity, microphone volume, or background noise.");
  if (data.audioQualityScore < 0.58) notes.push("Recording quality is low; use a quiet room and maintain a steady microphone distance.");
  if (data.pauseScore < 0.58) notes.push("Frequent or extended pauses detected; practice speaking in connected thought groups.");
  if (audioStats.available && audioStats.clippingPercent > 0.01) notes.push("Audio clipping detected; lower your microphone input gain slightly.");
  if (audioStats.available && audioStats.rms < 0.012) notes.push("Overall input volume is low; move closer to the microphone.");
  if (!notes.length) notes.push("Local acoustic diagnostics found no significant recording or intelligibility issues.");

  return {
    mode: "Local intelligibility proxy",
    score: data.pronunciationScore,
    confidence: data.recognitionConfidenceScore,
    audioQuality: data.audioQualityScore,
    pauseControl: data.pauseScore,
    articulationRate,
    audioStats,
    notes,
    phonemeFocus: data.phonemeFocus || []
  };
}

function inferPronunciationFocus({ alignment = [], refWords = [], hypWords = [], transcript = "" }) {
  const candidates = [];
  const mismatchWords = alignment.length
    ? alignment
        .filter((item) => item.type === "missing" || item.type === "substitute")
        .flatMap((item) => [item.ref, item.hyp])
        .filter(Boolean)
    : [];
  const sourceWords = [...mismatchWords, ...getContentWords(refWords), ...getContentWords(hypWords), ...normalizeWords(transcript)];
  const uniqueWords = [...new Set(sourceWords)].filter((word) => word.length > 2);
  const rules = [
    { key: "th-voiceless", sound: "/θ/", label: "think / three / method", pattern: /(^th|th$|th)/, tip: "Place the tongue tip lightly against the upper teeth and release air without substituting /s/ or /t/." },
    { key: "th-voiced", sound: "/ð/", label: "this / those / rather", pattern: /(the|this|that|these|those|there|rather|another)/, tip: "Touch the tongue tip lightly to the upper teeth with vocal cord vibration; avoid substituting /d/." },
    { key: "r-l", sound: "/r/ vs /l/", label: "right / library / clearly", pattern: /[rl]/, tip: "For /r/, curl or bunch the tongue without touching the alveolar ridge; for /l/, touch the ridge firmly." },
    { key: "v-w", sound: "/v/ vs /w/", label: "very / review / available", pattern: /v|w/, tip: "For /v/, touch upper teeth to lower lip; for /w/, round both lips without tooth contact." },
    { key: "final-consonant", sound: "final consonants", label: "asked / helps / project", pattern: /(ed|s|t|d|k|p|g|m|n)$/, tip: "Crisply release word-final consonants, especially -s, -ed, /t/, and /d/." },
    { key: "consonant-cluster", sound: "clusters", label: "students / strengths / projects", pattern: /(str|spr|skr|sts|nts|cts|ghts|rts|lds|lps|mps)/, tip: "Avoid dropping consonants inside clusters; practice slowly segmenting and blending them." },
    { key: "long-vowel", sound: "long vowels", label: "leave / reach / improve", pattern: /(ee|ea|oo|ou|oa|ai)/, tip: "Sustain tense/long vowels clearly to distinguish minimal pairs without over-dragging." }
  ];

  rules.forEach((rule) => {
    const words = uniqueWords.filter((word) => rule.pattern.test(word)).slice(0, 5);
    if (words.length) {
      candidates.push({
        sound: rule.sound,
        label: rule.label,
        tip: rule.tip,
        words
      });
    }
  });

  return candidates.slice(0, 4);
}

function applyRepeatCaps(score, data) {
  let capped = score;
  if (data.hypWords.length < Math.ceil(data.refWords.length * 0.45)) capped = Math.min(capped, 2.5);
  if (data.exactRecall < 0.5) capped = Math.min(capped, 3);
  if (data.exactRecall < 0.68 || data.precision < 0.62) capped = Math.min(capped, 4);
  if (data.stats.missing >= 3 || data.stats.substitutions >= 3) capped = Math.min(capped, 4.5);
  if (data.stats.extras >= 5) capped = Math.min(capped, 4.5);
  if (data.exactRecall >= 0.94 && data.precision >= 0.94 && data.deliveryScore >= 0.7) capped = Math.max(capped, 5.5);
  return roundHalf(clamp(1, 6, capped));
}

function applyInterviewCaps(score, data) {
  let capped = score;
  if (data.wordCount < 12) capped = Math.min(capped, 2);
  if (data.wordCount < 25) capped = Math.min(capped, 3);
  if (data.wordCount < 38) capped = Math.min(capped, 4);
  if (!data.hasDirectAnswer) capped = Math.min(capped, 4.5);
  if (!data.hasReason && !data.hasExample) capped = Math.min(capped, 4);
  if (!data.hasExample && data.developmentScore < 0.55) capped = Math.min(capped, 4.5);
  if ((data.wpm && (data.wpm < 70 || data.wpm > 185)) || data.deliveryScore < 0.42) capped = Math.min(capped, 5);
  if (data.wordCount >= 50 && data.hasDirectAnswer && data.hasReason && data.hasExample && data.taskScore >= 0.72 && data.developmentScore >= 0.72) {
    capped = Math.max(capped, 4.5);
  }
  return roundHalf(clamp(1, 6, capped));
}

function findPreviousAttempt(questionId, transcript) {
  const currentFingerprint = fingerprintText(transcript);
  return loadHistory().find((item) => item.questionId === questionId && fingerprintText(item.transcript) !== currentFingerprint) || null;
}

function buildAttemptComparison(feedback, previousAttempt) {
  if (!previousAttempt) return null;
  const previousScore = Number(previousAttempt.score) || 0;
  const delta = roundHalf(feedback.score - previousScore);
  const currentDetails = indexDetailScores(feedback.detailScores || []);
  const previousDetails = indexDetailScores(previousAttempt.detailScores || []);
  const notes = [];

  Object.keys(currentDetails).forEach((label) => {
    if (!Number.isFinite(previousDetails[label])) return;
    const diff = Math.round((currentDetails[label] - previousDetails[label]) * 100);
    if (Math.abs(diff) >= 6) {
      notes.push(`${label} ${diff > 0 ? "improved by" : "decreased by"} ${Math.abs(diff)}%.`);
    }
  });

  const currentPron = feedback.pronunciation ? feedback.pronunciation.score : null;
  const previousPron = previousAttempt.pronunciation ? previousAttempt.pronunciation.score : null;
  if (Number.isFinite(currentPron) && Number.isFinite(previousPron)) {
    const pronDiff = Math.round((currentPron - previousPron) * 100);
    if (Math.abs(pronDiff) >= 6) notes.push(`Intelligibility ${pronDiff > 0 ? "improved by" : "decreased by"} ${Math.abs(pronDiff)}%.`);
  }

  if (!notes.length) notes.push("Performance is similar to your previous attempt; focus on your single weakest dimension on the next retry.");

  return {
    previousScore,
    delta,
    summary: delta > 0
      ? `Improved by +${delta} band points over your last attempt on this prompt.`
      : delta < 0
        ? `Scored ${Math.abs(delta)} band points lower than your previous attempt; review the flagged issues and retry.`
        : "Matched your previous band score on this prompt; keep refining details.",
    notes: notes.slice(0, 4)
  };
}

function indexDetailScores(detailScores) {
  return detailScores.reduce((acc, item) => {
    acc[item.label] = Number(item.score);
    return acc;
  }, {});
}

function fingerprintText(text) {
  return normalizeWords(text).join(" ");
}

function getContentRecall(alignment, refWords) {
  const contentRef = getContentWords(refWords);
  if (!contentRef.length) return 1;
  const matchedContent = new Set(
    alignment
      .filter((item) => item.type === "match" && isContentWord(item.ref))
      .map((item) => item.ref)
  );
  return clamp01(matchedContent.size / new Set(contentRef).size);
}

function getContentWords(words) {
  return words.filter(isContentWord);
}

function isContentWord(word) {
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "but", "to", "of", "in", "on", "at", "for", "from", "with", "by", "as",
    "is", "are", "was", "were", "be", "been", "being", "it", "this", "that", "these", "those", "i", "you",
    "we", "they", "he", "she", "my", "your", "our", "their", "his", "her", "do", "does", "did", "will",
    "would", "should", "can", "could", "may", "might", "have", "has", "had"
  ]);
  return word.length > 2 && !stopWords.has(word);
}

function hasAnyMarker(lowerText, markers) {
  return markers.some((marker) => lowerText.includes(marker));
}

function countMarkers(lowerText, markers) {
  return markers.reduce((sum, marker) => sum + (lowerText.includes(marker) ? 1 : 0), 0);
}

function countOverlap(words, wordSet) {
  return new Set(words).size ? [...new Set(words)].filter((word) => wordSet.has(word)).length : 0;
}

function getPromptDemandScore(prompt, signals) {
  const lowerPrompt = prompt.toLowerCase();
  const asksWhy = /\bwhy\b/.test(lowerPrompt);
  const asksPreference = /\bprefer|rather|better|should|would\b/.test(lowerPrompt);
  const asksDescribe = /\bdescribe|what|which|how\b/.test(lowerPrompt);
  let score = 0.45;
  if (!asksWhy && !asksPreference && !asksDescribe) score += 0.2;
  if (asksWhy && signals.hasReason) score += 0.28;
  if (asksPreference && signals.hasDirectAnswer) score += 0.22;
  if (asksDescribe && signals.hasExample) score += 0.2;
  if (signals.hasReason && signals.hasExample) score += 0.18;
  if (/\bshould\b/.test(lowerPrompt) && /\b(should|need|important|benefit|problem)\b/.test(signals.lower)) score += 0.12;
  return clamp01(score);
}

function getInterviewLengthScore(wordCount) {
  if (wordCount <= 0) return 0;
  if (wordCount < 25) return clamp01(wordCount / 35);
  if (wordCount <= 85) return clamp01(0.62 + (wordCount - 25) / 100);
  return clamp01(1 - (wordCount - 85) / 90);
}

function getSpecificDetailScore(transcript, words) {
  const lower = transcript.toLowerCase();
  const hasNumber = /\b(one|two|three|first|second|last|semester|week|year|\d+)\b/.test(lower);
  const hasClassContext = /\b(class|course|teacher|professor|project|presentation|library|campus|exam|homework|club)\b/.test(lower);
  const hasPastEvent = /\b(was|were|had|joined|took|made|helped|worked|prepared|studied|finished)\b/.test(lower);
  return clamp01((hasNumber ? 0.28 : 0) + (hasClassContext ? 0.36 : 0) + (hasPastEvent ? 0.26 : 0) + (words.length >= 55 ? 0.1 : 0));
}

function getAnswerShapeScore(words, lowerText) {
  const openingClear = words.slice(0, 12).some((word) => ["think", "prefer", "would", "yes", "no", "one", "my"].includes(word));
  const hasMiddle = hasAnyMarker(lowerText, [" because ", " for example ", " for instance ", " when i ", " once "]);
  const hasEnding = hasAnyMarker(lowerText, [" that is why ", " overall ", " in the end ", " as a result ", " this helps "]);
  return clamp01((openingClear ? 0.36 : 0) + (hasMiddle ? 0.42 : 0) + (hasEnding ? 0.22 : 0));
}

function getContentDensity(words) {
  if (!words.length) return 0;
  return getContentWords(words).length / words.length;
}

function getRepeatedWordPenalty(words) {
  const contentWords = getContentWords(words);
  if (contentWords.length < 12) return 0;
  const counts = contentWords.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});
  const repeated = Object.values(counts).filter((count) => count >= 3).reduce((sum, count) => sum + count - 2, 0);
  return Math.min(0.18, repeated / Math.max(contentWords.length, 1));
}

function getFillerPenalty(text) {
  const matches = String(text).toLowerCase().match(/\b(um|uh|er|like|you know|sort of|kind of)\b/g) || [];
  return Math.min(0.22, matches.length * 0.045);
}

function getDurationFit(duration, minGood, maxGood) {
  if (!duration) return 0.58;
  if (duration >= minGood && duration <= maxGood) return 1;
  if (duration < minGood) return clamp01(duration / minGood);
  return clamp01(1 - (duration - maxGood) / maxGood);
}

function alignWords(refWords, hypWords) {
  const rows = refWords.length + 1;
  const cols = hypWords.length + 1;
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0));
  const op = Array.from({ length: rows }, () => Array(cols).fill(""));

  for (let i = 1; i < rows; i += 1) {
    dp[i][0] = i;
    op[i][0] = "del";
  }
  for (let j = 1; j < cols; j += 1) {
    dp[0][j] = j;
    op[0][j] = "ins";
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const same = refWords[i - 1] === hypWords[j - 1];
      const replaceCost = dp[i - 1][j - 1] + (same ? 0 : 1);
      const deleteCost = dp[i - 1][j] + 1;
      const insertCost = dp[i][j - 1] + 1;
      const min = Math.min(replaceCost, deleteCost, insertCost);
      dp[i][j] = min;
      op[i][j] = min === replaceCost ? (same ? "match" : "sub") : min === deleteCost ? "del" : "ins";
    }
  }

  const alignment = [];
  let i = refWords.length;
  let j = hypWords.length;
  while (i > 0 || j > 0) {
    const current = op[i][j];
    if (current === "match") {
      alignment.push({ type: "match", ref: refWords[i - 1], hyp: hypWords[j - 1] });
      i -= 1;
      j -= 1;
    } else if (current === "sub") {
      alignment.push({ type: "substitute", ref: refWords[i - 1], hyp: hypWords[j - 1] });
      i -= 1;
      j -= 1;
    } else if (current === "del") {
      alignment.push({ type: "missing", ref: refWords[i - 1], hyp: "" });
      i -= 1;
    } else {
      alignment.push({ type: "extra", ref: "", hyp: hypWords[j - 1] });
      j -= 1;
    }
  }

  return alignment.reverse();
}

function countAlignment(alignment) {
  return alignment.reduce(
    (acc, item) => {
      if (item.type === "match") acc.matches += 1;
      if (item.type === "substitute") acc.substitutions += 1;
      if (item.type === "missing") acc.missing += 1;
      if (item.type === "extra") acc.extras += 1;
      return acc;
    },
    { matches: 0, substitutions: 0, missing: 0, extras: 0 }
  );
}
