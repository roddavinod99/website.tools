"use client";

import { useState, useMemo, useRef } from "react";

interface WordStats {
  words: number;
  chars: number;
  charsNoSpace: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  avgWordLength: number;
  avgSentenceLength: number;
  syllables: number;
  readingTime: string;
  speakingTime: string;
  uniqueWords: number;
  lexicalDiversity: number;
  longestWord: string;
  shortestWord: string;
  wordFrequency: [string, number][];
  charFrequency: [string, number][];
  fleschKincaid: number;
  fleschReadingEase: number;
  gunningFog: number;
  keywordDensity: [string, number][];
  letterDensity: { letter: string; count: number; percent: number }[];
  progressPercent: number;
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;
  let count = 0;
  const vowels = "aeiouy";
  let prevVowel = false;
  for (const c of word) {
    const isV = vowels.includes(c);
    if (isV && !prevVowel) count++;
    prevVowel = isV;
  }
  if (word.endsWith("e")) count--;
  if (word.endsWith("le") && word.length > 2 && !"aeiouy".includes(word[word.length - 3])) count++;
  if (word.endsWith("es") || word.endsWith("ed")) count--;
  return Math.max(1, count);
}

function computeReadability(stats: { words: number; sentences: number; syllables: number; chars: number }): { fleschKincaid: number; fleschReadingEase: number; gunningFog: number } {
  if (stats.words === 0 || stats.sentences === 0) return { fleschKincaid: 0, fleschReadingEase: 0, gunningFog: 0 };
  const fk = 0.39 * (stats.words / stats.sentences) + 11.8 * (stats.syllables / stats.words) - 15.59;
  const fre = 206.835 - 1.015 * (stats.words / stats.sentences) - 84.6 * (stats.syllables / stats.words);
  const fog = 0.4 * ((stats.words / stats.sentences) + 100 * (stats.syllables / stats.words));
  return { fleschKincaid: Math.max(0, parseFloat(fk.toFixed(1))), fleschReadingEase: Math.max(0, Math.min(100, parseFloat(fre.toFixed(1)))), gunningFog: Math.max(0, parseFloat(fog.toFixed(1))) };
}

function fleschLabel(score: number): string {
  if (score >= 90) return "Very Easy";
  if (score >= 80) return "Easy";
  if (score >= 70) return "Fairly Easy";
  if (score >= 60) return "Standard";
  if (score >= 50) return "Fairly Difficult";
  if (score >= 30) return "Difficult";
  return "Very Confusing";
}

export function WordCounter() {
  const [text, setText] = useState("");
  const [includeHtml, setIncludeHtml] = useState(true);
  const [wordGoal, setWordGoal] = useState(500);
  const fileRef = useRef<HTMLInputElement>(null);

  const processedText = useMemo(() => {
    if (includeHtml) return text;
    return text.replace(/<[^>]*>/g, "");
  }, [text, includeHtml]);

  const stats = useMemo((): WordStats => {
    const t = processedText;
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
    const wordFreq = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20);

    const charFreqMap: Record<string, number> = {};
    for (const c of t) { charFreqMap[c] = (charFreqMap[c] || 0) + 1; }
    const charFreq = Object.entries(charFreqMap).sort((a, b) => b[1] - a[1]).slice(0, 20);

    const avgWordLength = words > 0 ? parseFloat((charsNoSpace / words).toFixed(1)) : 0;
    const avgSentenceLength = sentences > 0 ? parseFloat((words / sentences).toFixed(1)) : 0;

    const longest = wordList.reduce((a, b) => a.length >= b.length ? a : b, "");
    const shortest = wordList.reduce((a, b) => a.length > 0 && a.length <= b.length ? a : b, wordList[0] || "");

    const readingTimeMin = words > 0 ? Math.ceil(words / 200) : 0;
    const readingTimeStr = readingTimeMin < 1 ? "<1 min" : `${readingTimeMin} min`;
    const speakingTimeMin = words > 0 ? Math.ceil(words / 150) : 0;
    const speakingTimeStr = speakingTimeMin < 1 ? "<1 min" : `${speakingTimeMin} min`;

    const readability = computeReadability({ words, sentences, syllables: totalSyllables, chars });

    const keywordEntries = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const totalWords = wordList.length || 1;
    const keywordDensity: [string, number][] = keywordEntries.map(([w, c]) => [w, parseFloat(((c / totalWords) * 100).toFixed(2))]);

    const letterCounts: Record<string, number> = {};
    let totalLetters = 0;
    for (const c of t.toLowerCase()) {
      if (/[a-z]/.test(c)) { letterCounts[c] = (letterCounts[c] || 0) + 1; totalLetters++; }
    }
    const letterDensity = Object.entries(letterCounts).map(([letter, count]) => ({
      letter, count, percent: totalLetters > 0 ? parseFloat(((count / totalLetters) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.count - a.count);

    const progressPercent = wordGoal > 0 ? Math.min(100, parseFloat(((words / wordGoal) * 100).toFixed(0))) : 0;
    const lexicalDiversity = totalWords > 0 ? parseFloat(((uniqueWords / totalWords) * 100).toFixed(1)) : 0;

    return {
      words, chars, charsNoSpace, sentences, paragraphs, lines,
      avgWordLength, avgSentenceLength, syllables: totalSyllables,
      readingTime: readingTimeStr, speakingTime: speakingTimeStr,
      uniqueWords, lexicalDiversity, longestWord: longest, shortestWord: shortest,
      wordFrequency: wordFreq, charFrequency: charFreq,
      fleschKincaid: readability.fleschKincaid,
      fleschReadingEase: readability.fleschReadingEase,
      gunningFog: readability.gunningFog,
      keywordDensity, letterDensity, progressPercent,
    };
  }, [processedText, wordGoal]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setText(reader.result as string); };
    reader.readAsText(file);
  };

  const copyStats = async () => {
    const lines = [
      `Words: ${stats.words}`,
      `Characters: ${stats.chars}`,
      `Characters (no spaces): ${stats.charsNoSpace}`,
      `Sentences: ${stats.sentences}`,
      `Paragraphs: ${stats.paragraphs}`,
      `Lines: ${stats.lines}`,
      `Unique Words: ${stats.uniqueWords}`,
      `Lexical Diversity: ${stats.lexicalDiversity}%`,
      `Avg Word Length: ${stats.avgWordLength}`,
      `Avg Sentence Length: ${stats.avgSentenceLength}`,
      `Syllables: ${stats.syllables}`,
      `Reading Time: ${stats.readingTime}`,
      `Speaking Time: ${stats.speakingTime}`,
      `Flesch-Kincaid Grade: ${stats.fleschKincaid}`,
      `Flesch Reading Ease: ${stats.fleschReadingEase} (${fleschLabel(stats.fleschReadingEase)})`,
      `Gunning Fog: ${stats.gunningFog}`,
      `Longest Word: ${stats.longestWord}`,
      `Shortest Word: ${stats.shortestWord}`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Your Text</label>
          <div className="flex gap-2">
            <button onClick={() => fileRef.current?.click()} className="rounded px-2 py-0.5 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">Upload File</button>
            <input ref={fileRef} type="file" accept=".txt,.md,.html,.csv" onChange={handleFileUpload} className="hidden" />
            <label className="flex items-center gap-1 text-xs text-surface-600 dark:text-dark-muted cursor-pointer select-none">
              <input type="checkbox" checked={!includeHtml} onChange={(e) => setIncludeHtml(!e.target.checked)} className="accent-brand-500" />
              Exclude HTML
            </label>
          </div>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste your text here..." rows={8}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      {stats.words > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              { label: "Words", value: stats.words },
              { label: "Characters", value: stats.chars },
              { label: "No Spaces", value: stats.charsNoSpace },
              { label: "Sentences", value: stats.sentences },
              { label: "Paragraphs", value: stats.paragraphs },
              { label: "Lines", value: stats.lines },
              { label: "Unique Words", value: stats.uniqueWords },
              { label: "Lexical Diversity", value: `${stats.lexicalDiversity}%` },
              { label: "Syllables", value: stats.syllables },
              { label: "Reading Time", value: stats.readingTime },
              { label: "Speaking Time", value: stats.speakingTime },
              { label: "Avg Word Len", value: stats.avgWordLength },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-surface-200 bg-surface-50 p-2 text-center dark:border-dark-border dark:bg-dark-surface">
                <div className="text-lg font-bold text-brand-500">{s.value}</div>
                <div className="text-[10px] text-surface-500 dark:text-dark-muted truncate">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Readability Scores</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Flesch-Kincaid", value: stats.fleschKincaid, max: 20 },
                  { label: `Reading Ease (${fleschLabel(stats.fleschReadingEase)})`, value: stats.fleschReadingEase, max: 100 },
                  { label: "Gunning Fog", value: stats.gunningFog, max: 20 },
                ].map((r) => (
                  <div key={r.label} className="rounded border border-surface-200 bg-surface-50 p-2 text-center dark:border-dark-border dark:bg-dark-surface">
                    <div className="text-base font-bold text-surface-900 dark:text-dark-text">{r.value}</div>
                    <div className="text-[10px] text-surface-500 dark:text-dark-muted">{r.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Grade Level</p>
              <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-center dark:border-dark-border dark:bg-dark-surface">
                <div className="text-lg font-bold text-brand-500">{stats.fleschKincaid}</div>
                <div className="text-[10px] text-surface-500 dark:text-dark-muted">Flesch-Kincaid Grade Level</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Word Goal</p>
              <div className="flex items-center gap-2 mb-1">
                <input type="number" min={1} value={wordGoal} onChange={(e) => setWordGoal(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 rounded border border-surface-200 bg-white px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text" />
                <span className="text-xs text-surface-500 dark:text-dark-muted">words</span>
                <span className="text-xs text-surface-900 dark:text-dark-text font-medium">{stats.words} / {wordGoal}</span>
              </div>
              <div className="h-2.5 rounded-full bg-surface-200 dark:bg-dark-border overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${stats.progressPercent}%` }} />
              </div>
              <p className="text-[10px] text-surface-400 dark:text-dark-muted mt-0.5">{stats.progressPercent}% complete</p>
            </div>

            <div>
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Avg Sentence Length</p>
              <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-center dark:border-dark-border dark:bg-dark-surface">
                <div className="text-lg font-bold text-brand-500">{stats.avgSentenceLength}</div>
                <div className="text-[10px] text-surface-500 dark:text-dark-muted">words per sentence</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Word Frequency (Top 20)</p>
              <div className="rounded-lg border border-surface-200 bg-white p-2 max-h-60 overflow-auto dark:border-dark-border dark:bg-dark-surface">
                {stats.wordFrequency.map(([w, c]) => (
                  <div key={w} className="flex justify-between text-xs font-mono py-0.5 px-1 hover:bg-surface-50 dark:hover:bg-dark-bg rounded">
                    <span className="text-surface-900 dark:text-dark-text truncate">{w}</span>
                    <span className="text-surface-500 dark:text-dark-muted shrink-0 ml-2">{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Keyword Density (%)</p>
              <div className="rounded-lg border border-surface-200 bg-white p-2 max-h-60 overflow-auto dark:border-dark-border dark:bg-dark-surface">
                {stats.keywordDensity.map(([w, d]) => (
                  <div key={w} className="flex justify-between text-xs font-mono py-0.5 px-1 hover:bg-surface-50 dark:hover:bg-dark-bg rounded">
                    <span className="text-surface-900 dark:text-dark-text truncate">{w}</span>
                    <span className="text-brand-500 shrink-0 ml-2">{d}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Character Frequency (Top 20)</p>
            <div className="rounded-lg border border-surface-200 bg-white p-2 max-h-60 overflow-auto dark:border-dark-border dark:bg-dark-surface">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                {stats.charFrequency.map(([c, n]) => (
                  <div key={c} className="flex justify-between text-xs font-mono py-0.5 px-1 hover:bg-surface-50 dark:hover:bg-dark-bg rounded">
                    <span className="text-surface-900 dark:text-dark-text">{c === " " ? <span className="text-surface-400">[space]</span> : c}</span>
                    <span className="text-surface-500 dark:text-dark-muted shrink-0 ml-2">{n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">Letter Density</p>
            <div className="rounded-lg border border-surface-200 bg-white p-2 dark:border-dark-border dark:bg-dark-surface">
              {stats.letterDensity.map((l) => (
                <div key={l.letter} className="flex items-center gap-2 text-xs py-0.5">
                  <span className="font-mono w-4 text-center text-surface-900 dark:text-dark-text">{l.letter}</span>
                  <div className="flex-1 h-3 rounded bg-surface-100 dark:bg-dark-bg overflow-hidden">
                    <div className="h-full bg-brand-400 rounded transition-all" style={{ width: `${l.percent}%` }} />
                  </div>
                  <span className="text-surface-400 dark:text-dark-muted w-8 text-right">{l.count}</span>
                  <span className="text-surface-400 dark:text-dark-muted w-10 text-right">{l.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="rounded border border-surface-200 bg-surface-50 p-2 text-xs dark:border-dark-border dark:bg-dark-surface">
              <span className="text-surface-500 dark:text-dark-muted">Longest: </span>
              <span className="font-mono text-surface-900 dark:text-dark-text">{stats.longestWord || "-"}</span>
            </div>
            <div className="rounded border border-surface-200 bg-surface-50 p-2 text-xs dark:border-dark-border dark:bg-dark-surface">
              <span className="text-surface-500 dark:text-dark-muted">Shortest: </span>
              <span className="font-mono text-surface-900 dark:text-dark-text">{stats.shortestWord || "-"}</span>
            </div>
            <div className="flex-1" />
            <button onClick={copyStats} className="rounded px-3 py-1 text-xs border border-surface-200 text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-muted dark:hover:bg-dark-surface">
              Copy Stats
            </button>
          </div>

          <p className="text-[10px] text-surface-400 dark:text-dark-muted text-center">
            Word counting supports English text. Results may vary for other languages.
          </p>
        </>
      )}

      {!text && (
        <p className="text-xs text-surface-400 dark:text-dark-muted italic text-center">Start typing or upload a file to see statistics</p>
      )}
    </div>
  );
}
