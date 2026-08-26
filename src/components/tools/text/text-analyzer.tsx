"use client";

import { useState, useMemo, useRef } from "react";
import { validateFileSize } from "@/lib/file-security";

interface Analysis {
  chars: number;
  charsNoSpace: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  avgWordLength: number;
  avgSentenceLength: number;
  syllables: number;
  readingTime: string;
  speakingTime: string;
  uniqueWords: number;
  longestWord: string;
  shortestWord: string;
  wordFrequency: [string, number][];
  charFrequency: [string, number][];
  fleschKincaid: number;
  fleschReadingEase: number;
  gunningFog: number;
  keywordDensity: [string, number][];
  letterDensity: { letter: string; count: number; percent: number }[];
  sentiment: { score: number; label: string; comparative: number };
  language: string;
  languageScores: { name: string; score: number; confidence: number }[];
  emotions: { label: string; score: number }[];
  classification: { formality: string; domain: string };
  entities: { text: string; type: string }[];
  lexicalDensity: number;
  typeTokenRatio: number;
  vocabLevels: { basic: number; intermediate: number; advanced: number };
  suggestions: string[];
  charDensity: { char: string; count: number; percent: number }[];
}

const POSITIVE_WORDS = new Set(["good", "great", "excellent", "amazing", "wonderful", "fantastic", "happy", "love", "beautiful", "best", "positive", "success", "joy", "delight", "brilliant", "awesome", "nice", "pleased", "perfect", "grateful"]);
const NEGATIVE_WORDS = new Set(["bad", "terrible", "awful", "horrible", "hate", "ugly", "worst", "negative", "failure", "sad", "angry", "fear", "dreadful", "poor", "wrong", "painful", "damage", "destroy", "crisis", "disaster"]);
const INTENSIFIERS = new Set(["very", "really", "extremely", "incredibly", "absolutely", "totally", "completely", "highly", "deeply", "strongly"]);

const LANGUAGE_SIGNATURES: { pattern: RegExp; name: string }[] = [
  { pattern: /\b(the|and|for|are|but|not|you|all|can|had|her|was|one|our|out|has|have|been|some|them|than|what|when|your|their|about|would|could|should|which|while|where|there|these|those|because|through|without)\b/i, name: "English" },
  { pattern: /\b(le|la|les|des|est|sont|dans|avec|pour|sur|une|que|pas|nous|vous|ils|elle|ce|cet|cette|qui|quoi|dont|où|mais|donc|car|ni|or)\b/i, name: "French" },
  { pattern: /\b(der|die|das|und|ist|sind|ein|eine|nicht|mit|auf|für|bei|aus|nach|wie|von|dem|den|zum|zur|hat|haben|werden|wurde|wird|kann|sich|auch)\b/i, name: "German" },
  { pattern: /\b(el|la|los|las|es|son|está|están|para|con|una|que|del|por|como|más|pero|sus|han|era|muy|sin|sobre|entre|también|cuando|donde)\b/i, name: "Spanish" },
  { pattern: /\b(il|la|le|gli|dei|dei|sono|è|con|per|una|che|del|della|delle|degli|nel|nella|negli|sul|sulla|sulle|dagli|dalle|anche|cosa|essere|avere|fare)\b/i, name: "Italian" },
  { pattern: /[а-яё]{3,}/i, name: "Russian" },
  { pattern: /[가-힣]{2,}/, name: "Korean" },
  { pattern: /[一-龠]{2,}/, name: "Chinese/Japanese" },
];

const NGRAM_PROFILES: { name: string; trigrams: Record<string, number> }[] = [
  { name: "English", trigrams: { the: 0.18, and: 0.08, ing: 0.06, ent: 0.04, ion: 0.04, tio: 0.03, for: 0.03, our: 0.02, thi: 0.02, ith: 0.02 } },
  { name: "French", trigrams: { les: 0.12, des: 0.10, ent: 0.08, ion: 0.06, our: 0.05, ant: 0.05, eux: 0.04, ait: 0.04, ans: 0.03, est: 0.03 } },
  { name: "German", trigrams: { der: 0.14, ein: 0.08, die: 0.07, und: 0.07, ich: 0.05, den: 0.05, sch: 0.04, gen: 0.04, che: 0.03, nen: 0.03 } },
  { name: "Spanish", trigrams: { los: 0.10, las: 0.08, ent: 0.07, que: 0.06, del: 0.05, par: 0.04, con: 0.04, est: 0.04, por: 0.03, com: 0.03 } },
  { name: "Italian", trigrams: { del: 0.09, che: 0.08, lle: 0.07, ent: 0.06, deg: 0.05, gli: 0.04, are: 0.04, ere: 0.03, nel: 0.03, con: 0.03 } },
  { name: "Russian", trigrams: { ова: 0.08, его: 0.07, нет: 0.06, она: 0.05, про: 0.04, дру: 0.04, ест: 0.03, ить: 0.03, как: 0.03, был: 0.02 } },
];

const EMOTION_KEYWORDS: Record<string, string[]> = {
  joy: ["happy", "delighted", "thrilled", "excited", "wonderful", "fantastic", "amazing", "joy", "celebrate", "pleased", "glad", "cheerful"],
  sadness: ["sad", "unhappy", "miserable", "depressed", "heartbroken", "sorrow", "grief", "tears", "crying", "lonely", "disappointed", "gloomy"],
  anger: ["angry", "furious", "outraged", "irate", "frustrated", "annoyed", "irritated", "enraged", "hostile", "fuming", "livid"],
  fear: ["afraid", "scared", "frightened", "terrified", "anxious", "worried", "nervous", "panic", "dread", "horror", "alarmed"],
  surprise: ["surprised", "astonished", "amazed", "shocked", "stunned", "startled", "unexpected", "incredible", "unbelievable", "dumbfounded"],
};

const PROP_NAMES = new Set(["john", "jane", "mike", "sarah", "david", "lisa", "robert", "mary", "james", "patricia", "william", "jennifer", "richard", "linda", "joseph", "barbara", "thomas", "elizabeth", "christopher", "susan"]);
const PLACE_NAMES = new Set(["london", "paris", "new york", "tokyo", "berlin", "rome", "madrid", "moscow", "beijing", "sydney", "mumbai", "cairo", "dubai", "singapore", "hong kong", "barcelona", "amsterdam", "los angeles", "chicago", "san francisco"]);
const ORG_NAMES = new Set(["google", "microsoft", "apple", "amazon", "meta", "netflix", "tesla", "ibm", "intel", "oracle", "sap", "adobe", "spotify", "uber", "airbnb", "twitter", "linkedin", "github", "docker", "kubernetes"]);

function countSyllables(word: string): number {
  word = word.toLowerCase().trim();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const vowelMatches = word.match(/[aeiouy]{1,2}/g);
  return vowelMatches ? Math.max(1, vowelMatches.length) : 1;
}

const BASIC_WORDS = new Set(["the", "a", "an", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "can", "could", "will", "would", "shall", "should", "may", "might", "must", "i", "you", "he", "she", "it", "we", "they", "this", "that", "these", "those", "and", "or", "but", "not", "if", "with", "for", "on", "in", "at", "to", "from", "by", "about", "of", "as", "into", "through", "during", "before", "after", "above", "below", "up", "down", "out", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "each", "every", "both", "few", "more", "most", "other", "some", "such", "no", "nor", "only", "own", "same", "so", "than", "too", "very", "just", "also", "now", "man", "woman", "child", "time", "year", "day", "way", "thing", "life", "hand", "part", "place", "case", "week", "work", "point", "world", "school", "state", "family", "group", "number", "night", "water", "people", "long", "good", "new", "first", "last", "big", "small", "high", "old", "great", "right", "left", "early", "young", "important", "public", "come", "get", "give", "go", "keep", "let", "make", "put", "seem", "take", "know", "see", "think", "look", "want", "find", "tell", "ask", "try", "need", "feel", "call", "show", "use", "like", "say", "start", "run", "move", "live", "believe", "hold", "bring", "happen", "write", "provide", "sit", "stand", "set", "meet", "pay", "include", "continue", "set", "change", "play", "turn", "lead", "understand", "watch", "follow", "stop", "create", "speak", "read", "allow", "add", "spend", "grow", "open", "walk", "win", "teach", "offer", "remember", "love", "consider", "appear", "buy", "wait", "serve", "die", "send", "expect", "build", "stay", "fall", "cut", "reach", "kill", "remain", "suggest", "raise", "pass", "sell", "require", "report", "decide", "pull", "carry", "hope", "develop", "produce", "receive", "agree", "support", "start", "finish", "wish", "thank"]);

const ADVANCED_WORDS = new Set(["paradigm", "pragmatic", "quintessential", "ubiquitous", "ephemeral", "serendipity", "dichotomy", "anomaly", "synergy", "leverage", "streamline", "optimize", "facilitate", "implement", "utilize", "conceptualize", "synthesize", "extrapolate", "articulate", "elucidate", "juxtapose", "precipitate", "amalgamate", "conglomerate", "idiosyncratic", "heterogeneous", "homogeneous", "disparate", "concomitant", "perfunctory", "superfluous", "unequivocal", "ambivalent", "capricious", "recalcitrant", "obfuscate", "pernicious", "benevolent", "magnanimous", "fortuitous"]);

function detectLanguageNgram(text: string): { name: string; score: number; confidence: number }[] {
  const clean = text.toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, " ");
  const trigrams: Record<string, number> = {};
  let total = 0;
  for (let i = 0; i < clean.length - 2; i++) {
    const tri = clean.slice(i, i + 3);
    if (/[a-z]{3}/.test(tri)) {
      trigrams[tri] = (trigrams[tri] || 0) + 1;
      total++;
    }
  }
  if (total === 0) return [];
  const scores = NGRAM_PROFILES.map((profile) => {
    let score = 0;
    for (const [tri, freq] of Object.entries(profile.trigrams)) {
      const actual = (trigrams[tri] || 0) / total;
      score += Math.min(freq, actual) * 10;
    }
    return { name: profile.name, score, confidence: 0 };
  });
  scores.sort((a, b) => b.score - a.score);
  const maxScore = scores[0]?.score || 1;
  const top = scores.slice(0, 3);
  for (const s of top) {
    s.confidence = Math.min(100, Math.round((s.score / maxScore) * 100));
  }
  return top;
}

function analyzeText(text: string): Analysis {
  const t = text;
  const words = t.trim() ? t.trim().split(/\s+/).length : 0;
  const chars = t.length;
  const charsNoSpace = t.replace(/\s/g, "").length;
  const sentences = t.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = t.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const lines = t ? t.split("\n").length : 0;

  const wordList = t.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const totalSyllables = wordList.reduce((sum, w) => sum + countSyllables(w), 0);
  const uniqueWords = new Set(wordList).size;

  const freq: Record<string, number> = {};
  wordList.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  const wordFreq = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const charFreqMap: Record<string, number> = {};
  for (const c of t) charFreqMap[c] = (charFreqMap[c] || 0) + 1;
  const charFreq = Object.entries(charFreqMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const avgWordLength = words > 0 ? parseFloat((charsNoSpace / words).toFixed(1)) : 0;
  const avgSentenceLength = sentences > 0 ? parseFloat((words / sentences).toFixed(1)) : 0;
  const longest = wordList.reduce((a, b) => a.length >= b.length ? a : b, "");
  const shortest = wordList.reduce((a, b) => a.length > 0 && a.length <= b.length ? a : b, wordList[0] || "");

  const readingTimeMin = Math.ceil(words / 200);
  const speakingTimeMin = Math.ceil(words / 150);

  const fk = words > 0 && sentences > 0 ? Math.max(0, parseFloat((0.39 * (words / sentences) + 11.8 * (totalSyllables / words) - 15.59).toFixed(1))) : 0;
  const fre = words > 0 && sentences > 0 ? Math.max(0, Math.min(100, parseFloat((206.835 - 1.015 * (words / sentences) - 84.6 * (totalSyllables / words)).toFixed(1)))) : 0;
  const fog = words > 0 && sentences > 0 ? Math.max(0, parseFloat((0.4 * ((words / sentences) + 100 * (totalSyllables / words))).toFixed(1))) : 0;

  const keywordEntries = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const totalWords = wordList.length || 1;
  const keywordDensity: [string, number][] = keywordEntries.map(([w, c]) => [w, parseFloat(((c / totalWords) * 100).toFixed(2))]);

  const letterCounts: Record<string, number> = {};
  let totalLetters = 0;
  for (const c of t.toLowerCase()) { if (/[a-z]/.test(c)) { letterCounts[c] = (letterCounts[c] || 0) + 1; totalLetters++; } }
  const letterDensity = Object.entries(letterCounts).map(([letter, count]) => ({ letter, count, percent: totalLetters > 0 ? parseFloat(((count / totalLetters) * 100).toFixed(1)) : 0 })).sort((a, b) => b.count - a.count);

  const charDensity = Object.entries(charFreqMap).map(([char, count]) => ({ char, count, percent: chars > 0 ? parseFloat(((count / chars) * 100).toFixed(2)) : 0 })).sort((a, b) => b.count - a.count).slice(0, 15);

  let sentimentScore = 0;
  let posCount = 0;
  let negCount = 0;
  for (const w of wordList) {
    if (POSITIVE_WORDS.has(w)) { sentimentScore++; posCount++; }
    if (NEGATIVE_WORDS.has(w)) { sentimentScore--; negCount++; }
    if (INTENSIFIERS.has(w) && (posCount > 0 || negCount > 0)) sentimentScore += sentimentScore > 0 ? 0.5 : -0.5;
  }
  const sentimentLabel = sentimentScore > 0 ? "Positive" : sentimentScore < 0 ? "Negative" : "Neutral";
  const comparative = wordList.length > 0 ? parseFloat((sentimentScore / wordList.length).toFixed(3)) : 0;

  const detectedSig = LANGUAGE_SIGNATURES.find((l) => l.pattern.test(t));
  const detectedLang = detectedSig?.name || "Unknown";
  const languageScores = detectLanguageNgram(t).length > 0 ? detectLanguageNgram(t) : [{ name: detectedLang, score: 100, confidence: 100 }];

  const emotionScores: Record<string, number> = { joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0 };
  for (const w of wordList) {
    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
      if (keywords.includes(w)) emotionScores[emotion] = (emotionScores[emotion] || 0) + 1;
    }
  }
  const maxEmotion = Math.max(...Object.values(emotionScores), 1);
  const emotions = Object.entries(emotionScores).map(([label, score]) => ({ label, score: parseFloat(((score / maxEmotion) * 100).toFixed(0)) }));

  let formalScore = 0;
  let informalScore = 0;
  const informalMarkers = ["gonna", "wanna", "gotta", "ain't", "yeah", "nah", "kinda", "sorta", "lol", "omg", "btw", "imo", "tbh", "idk", "thx", "pls"];
  for (const w of wordList) { if (informalMarkers.includes(w)) informalScore++; if (w.length > 8) formalScore++; }
  const formality = formalScore > informalScore ? "Formal" : informalScore > formalScore ? "Informal" : "Neutral";

  const domain = t.match(/\b(code|api|server|database|function|algorithm|variable|class|object|component|module|config|deploy|test|debug|syntax|runtime|compile)\b/i) ? "Technical" : t.match(/\b(meeting|project|team|budget|deadline|stakeholder|strategy|quarterly|revenue|growth|market|client|partnership|initiative|milestone)\b/i) ? "Business" : "General";

  const entities: { text: string; type: string }[] = [];
  const lowerText = t.toLowerCase();
  for (const name of PROP_NAMES) { if (lowerText.includes(name)) entities.push({ text: name, type: "Person" }); }
  for (const place of PLACE_NAMES) { if (lowerText.includes(place)) entities.push({ text: place, type: "Location" }); }
  for (const org of ORG_NAMES) { if (lowerText.includes(org)) entities.push({ text: org, type: "Organization" }); }

  const lexicalDensity = words > 0 ? parseFloat(((uniqueWords / words) * 100).toFixed(1)) : 0;
  const typeTokenRatio = words > 0 ? parseFloat((uniqueWords / words).toFixed(3)) : 0;

  let basic = 0;
  let advanced = 0;
  let intermediate = 0;
  for (const w of wordList) {
    if (BASIC_WORDS.has(w)) basic++;
    else if (ADVANCED_WORDS.has(w)) advanced++;
    else intermediate++;
  }
  const totalV = basic + intermediate + advanced || 1;
  const vocabLevels = { basic: parseFloat(((basic / totalV) * 100).toFixed(0)), intermediate: parseFloat(((intermediate / totalV) * 100).toFixed(0)), advanced: parseFloat(((advanced / totalV) * 100).toFixed(0)) };

  const suggestions: string[] = [];
  if (avgSentenceLength > 25) suggestions.push("Consider shortening your sentences for better readability (avg > 25 words)");
  if (fre < 50) suggestions.push("Your text is fairly complex. Consider simpler words to improve readability");
  if (lexicalDensity < 40) suggestions.push("Try to reduce word repetition to improve lexical diversity");
  if (sentences > 0 && paragraphs > 0 && sentences / paragraphs < 2) suggestions.push("Some paragraphs may be too short; consider merging related ideas");
  if (avgWordLength > 6) suggestions.push("You're using long words; consider simpler alternatives for broader audience");
  if (keywordEntries.length > 0 && keywordEntries[0][1] / totalWords > 0.1) suggestions.push(`The word '${keywordEntries[0][0]}' is used very frequently; consider synonyms`);
  if (sentences === 0) suggestions.push("Try using more punctuation to structure your text into sentences");
  if (suggestions.length === 0) suggestions.push("Your text looks well-structured!");

  return {
    chars, charsNoSpace, words, sentences, paragraphs, lines, avgWordLength, avgSentenceLength,
    syllables: totalSyllables, readingTime: readingTimeMin < 1 ? "<1 min" : `${readingTimeMin} min`,
    speakingTime: speakingTimeMin < 1 ? "<1 min" : `${speakingTimeMin} min`,
    uniqueWords, longestWord: longest, shortestWord: shortest, wordFrequency: wordFreq, charFrequency: charFreq,
    fleschKincaid: fk, fleschReadingEase: fre, gunningFog: fog, keywordDensity, letterDensity,
    sentiment: { score: sentimentScore, label: sentimentLabel, comparative },
    language: detectedLang, languageScores, emotions, classification: { formality, domain }, entities,
    lexicalDensity, typeTokenRatio, vocabLevels, suggestions, charDensity,
  };
}

export function TextAnalyzer() {
  const [input, setInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const analysis = useMemo(() => input ? analyzeText(input) : null, [input]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeCheck = validateFileSize(file);
    if (!sizeCheck.valid) { alert(sizeCheck.error); return; }
    const reader = new FileReader();
    reader.onload = () => setInput(reader.result as string);
    reader.readAsText(file);
  };

  const copyAll = async () => {
    if (!analysis) return;
    const lines = [
      `Characters: ${analysis.chars} (no spaces: ${analysis.charsNoSpace})`,
      `Words: ${analysis.words} | Unique: ${analysis.uniqueWords}`,
      `Sentences: ${analysis.sentences} | Paragraphs: ${analysis.paragraphs} | Lines: ${analysis.lines}`,
      `Avg Word Length: ${analysis.avgWordLength} | Avg Sentence Length: ${analysis.avgSentenceLength}`,
      `Syllables: ${analysis.syllables} | Reading: ${analysis.readingTime} | Speaking: ${analysis.speakingTime}`,
      `Lexical Density: ${analysis.lexicalDensity}% | TTR: ${analysis.typeTokenRatio}`,
      `Flesch-Kincaid: ${analysis.fleschKincaid} | Reading Ease: ${analysis.fleschReadingEase} | Gunning Fog: ${analysis.gunningFog}`,
      `Sentiment: ${analysis.sentiment.label} (${analysis.sentiment.score})`,
      `Language: ${analysis.language} | Formality: ${analysis.classification.formality} | Domain: ${analysis.classification.domain}`,
      `Vocabulary: Basic ${analysis.vocabLevels.basic}% / Intermediate ${analysis.vocabLevels.intermediate}% / Advanced ${analysis.vocabLevels.advanced}%`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Text Input</label>
          <button onClick={() => fileRef.current?.click()} className="rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">Upload File</button>
          <input ref={fileRef} type="file" accept=".txt,.md,.html" onChange={handleFile} className="hidden" />
        </div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste or type your text here for deep analysis..." rows={8}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      {analysis && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { label: "Words", value: analysis.words },
              { label: "Chars", value: analysis.chars },
              { label: "Sentences", value: analysis.sentences },
              { label: "Paragraphs", value: analysis.paragraphs },
              { label: "Avg Word Len", value: analysis.avgWordLength },
              { label: "Avg Sent Len", value: analysis.avgSentenceLength },
              { label: "Reading", value: analysis.readingTime },
              { label: "Speaking", value: analysis.speakingTime },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-surface-200 bg-surface-50 p-2 text-center dark:border-dark-border dark:bg-dark-surface">
                <div className="text-lg font-bold text-brand-500">{s.value}</div>
                <div className="text-[10px] text-surface-500 dark:text-dark-muted">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Sentiment</p>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${analysis.sentiment.label === "Positive" ? "text-green-600 dark:text-green-400" : analysis.sentiment.label === "Negative" ? "text-red-600 dark:text-red-400" : "text-surface-600 dark:text-dark-muted"}`}>
                  {analysis.sentiment.label}
                </span>
                <span className="text-xs text-surface-400 dark:text-dark-muted">score: {analysis.sentiment.score} (comparative: {analysis.sentiment.comparative})</span>
              </div>
              <div className="flex gap-2 mt-1">
                {analysis.emotions.filter((e) => e.score > 0).map((e) => (
                  <span key={e.label} className="rounded-full bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 text-[10px] text-brand-700 dark:text-brand-400 capitalize">{e.label} {e.score}%</span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Classification</p>
              <div className="flex flex-wrap gap-2 mb-1">
                {analysis.languageScores.map((ls, i) => (
                  <span key={i} className="rounded bg-surface-200 dark:bg-dark-border px-2 py-0.5 text-xs text-surface-700 dark:text-dark-text">
                    {ls.name} <span className="text-surface-400 dark:text-dark-muted">({ls.confidence}%)</span>
                  </span>
                ))}
                <span className="rounded bg-surface-200 dark:bg-dark-border px-2 py-0.5 text-xs text-surface-700 dark:text-dark-text">{analysis.classification.formality}</span>
                <span className="rounded bg-surface-200 dark:bg-dark-border px-2 py-0.5 text-xs text-surface-700 dark:text-dark-text">{analysis.classification.domain}</span>
              </div>
              <p className="text-[10px] text-surface-400 dark:text-dark-muted">
                Lexical Density: {analysis.lexicalDensity}% | TTR: {analysis.typeTokenRatio}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Readability</p>
              <div className="space-y-1">
                {[
                  { label: "Flesch-Kincaid", value: analysis.fleschKincaid, max: 20 },
                  { label: "Reading Ease", value: analysis.fleschReadingEase, max: 100 },
                  { label: "Gunning Fog", value: analysis.gunningFog, max: 20 },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-2 text-xs">
                    <span className="text-surface-500 dark:text-dark-muted w-24">{r.label}</span>
                    <div className="flex-1 h-2 rounded bg-surface-200 dark:bg-dark-border overflow-hidden">
                      <div className="h-full bg-brand-400 rounded transition-all" style={{ width: `${(r.value / r.max) * 100}%` }} />
                    </div>
                    <span className="font-mono text-surface-900 dark:text-dark-text w-8 text-right">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Vocabulary Levels</p>
              <div className="space-y-1">
                {[
                  { label: "Basic", value: analysis.vocabLevels.basic, color: "bg-green-400" },
                  { label: "Intermediate", value: analysis.vocabLevels.intermediate, color: "bg-yellow-400" },
                  { label: "Advanced", value: analysis.vocabLevels.advanced, color: "bg-red-400" },
                ].map((v) => (
                  <div key={v.label} className="flex items-center gap-2 text-xs">
                    <span className="text-surface-500 dark:text-dark-muted w-20">{v.label}</span>
                    <div className="flex-1 h-2 rounded bg-surface-200 dark:bg-dark-border overflow-hidden">
                      <div className={`h-full rounded ${v.color}`} style={{ width: `${v.value}%` }} />
                    </div>
                    <span className="text-surface-900 dark:text-dark-text w-8 text-right">{v.value}%</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-surface-400 dark:text-dark-muted mt-1">Unique: {analysis.uniqueWords} / {analysis.words} words</p>
            </div>

            <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-dark-border dark:bg-dark-surface">
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Entities Detected</p>
              {analysis.entities.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {analysis.entities.map((e, i) => (
                    <span key={i} className="rounded bg-surface-200 dark:bg-dark-border px-2 py-0.5 text-[10px] text-surface-700 dark:text-dark-text">
                      {e.text} <span className="text-surface-400 dark:text-dark-muted">({e.type})</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-surface-400 dark:text-dark-muted italic">None detected</p>
              )}
              <p className="text-[10px] text-surface-400 dark:text-dark-muted mt-1">
                Longest: <span className="font-mono">{analysis.longestWord}</span> | Shortest: <span className="font-mono">{analysis.shortestWord}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Top Words</p>
              <div className="rounded-lg border border-surface-200 bg-white p-2 max-h-32 overflow-auto dark:border-dark-border dark:bg-dark-surface">
                {analysis.wordFrequency.map(([w, c]) => (
                  <div key={w} className="flex justify-between text-xs font-mono py-0.5 px-1 hover:bg-surface-50 dark:hover:bg-dark-bg rounded">
                    <span className="text-surface-900 dark:text-dark-text">{w}</span>
                    <span className="text-surface-500 dark:text-dark-muted">{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Character Density</p>
              <div className="rounded-lg border border-surface-200 bg-white p-2 max-h-32 overflow-auto dark:border-dark-border dark:bg-dark-surface">
                {analysis.charDensity.map((c) => (
                  <div key={c.char} className="flex justify-between text-xs font-mono py-0.5 px-1 hover:bg-surface-50 dark:hover:bg-dark-bg rounded">
                    <span className="text-surface-900 dark:text-dark-text">{c.char === " " ? "␣" : c.char === "\n" ? "↵" : c.char}</span>
                    <span className="text-surface-500 dark:text-dark-muted">{c.count} ({c.percent}%)</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Writing Suggestions</p>
              <div className="rounded-lg border border-surface-200 bg-white p-2 max-h-32 overflow-auto dark:border-dark-border dark:bg-dark-surface">
                {analysis.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-2 text-xs py-0.5">
                    <span className="text-brand-500 shrink-0">&#8226;</span>
                    <span className="text-surface-700 dark:text-dark-text">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={copyAll} className="rounded px-3 py-1 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">Copy All Stats</button>
          </div>
        </>
      )}

      {!input && (
        <p className="text-xs text-surface-400 dark:text-dark-muted italic text-center">Enter text for comprehensive analysis including sentiment, language detection, and readability</p>
      )}
    </div>
  );
}
