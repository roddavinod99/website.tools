"use client";

import { useState, useCallback } from "react";

type Tone = "Professional" | "Casual" | "Academic" | "Friendly";

type Dimension = "clarity" | "specificity" | "context" | "structure" | "goal" | "constraints" | "persona" | "formatting";

const DIMENSIONS: { key: Dimension; label: string }[] = [
  { key: "clarity", label: "Clarity" },
  { key: "specificity", label: "Specificity" },
  { key: "context", label: "Context" },
  { key: "structure", label: "Structure" },
  { key: "goal", label: "Goal Orientation" },
  { key: "constraints", label: "Constraints" },
  { key: "persona", label: "Persona" },
  { key: "formatting", label: "Formatting" },
];

function analyzePrompt(prompt: string): Record<Dimension, number> {
  const len = prompt.length;
  const words = prompt.split(/\s+/).length;
  const hasRole = /\b(you are|act as|role|persona|expert|assistant)\b/i.test(prompt);
  const hasGoal = /\b(goal|objective|purpose|task|please|want|need|create|write|generate|help)\b/i.test(prompt);
  const hasConstraints = /\b(must|should|don't|do not|avoid|only|exactly|limit|max|minimum|format|output|return)\b/i.test(prompt);
  const hasContext = /\b(context|background|scenario|given|assuming|based on|for example|e\.g\.|i\.e\.)\b/i.test(prompt);
  const hasStructure = /\b(step|first|then|finally|numbered|bullets|sections|headers|structure|format)\b/i.test(prompt);
  const hasFormatting = /\b(bullet|numbered|markdown|code|json|table|html|plain text|csv)\b/i.test(prompt);
  const sentences = prompt.split(/[.!?]+/).filter(Boolean).length;
  const hasSpecificity = /\d+|specific|exactly|precisely|at least|at most|between/.test(prompt);

  return {
    clarity: Math.min(10, Math.max(1, Math.round(
      (hasGoal ? 2 : 0) + (hasRole ? 1.5 : 0) + (sentences >= 2 ? 1.5 : 0) + (words >= 15 ? 1.5 : 0) + (words >= 30 ? 1.5 : 0) + (hasConstraints ? 1 : 0) + (hasStructure ? 1 : 0)
    ))),
    specificity: Math.min(10, Math.max(1, Math.round(
      (hasSpecificity ? 3 : 0) + (hasConstraints ? 2 : 0) + (words >= 30 ? 2 : 0) + (hasContext ? 1.5 : 0) + (len >= 100 ? 1.5 : 0)
    ))),
    context: Math.min(10, Math.max(1, Math.round(
      (hasContext ? 4 : 0) + (len >= 100 ? 2 : 0) + (words >= 25 ? 2 : 0) + (hasSpecificity ? 2 : 0)
    ))),
    structure: Math.min(10, Math.max(1, Math.round(
      (hasStructure ? 4 : 0) + (hasFormatting ? 2 : 0) + (sentences >= 3 ? 2 : 0) + (words >= 30 ? 2 : 0)
    ))),
    goal: Math.min(10, Math.max(1, Math.round(
      (hasGoal ? 5 : 0) + (hasConstraints ? 2 : 0) + (words >= 20 ? 1.5 : 0) + (hasSpecificity ? 1.5 : 0)
    ))),
    constraints: Math.min(10, Math.max(1, Math.round(
      (hasConstraints ? 5 : 0) + (hasFormatting ? 2 : 0) + (hasSpecificity ? 2 : 0) + (words >= 25 ? 1 : 0)
    ))),
    persona: Math.min(10, Math.max(1, Math.round(
      (hasRole ? 6 : 0) + (words >= 20 ? 2 : 0) + (hasContext ? 2 : 0)
    ))),
    formatting: Math.min(10, Math.max(1, Math.round(
      (hasFormatting ? 5 : 0) + (hasStructure ? 3 : 0) + (hasConstraints ? 2 : 0)
    ))),
  };
}

function improvePrompt(prompt: string, tone: Tone): { improved: string; changes: string[] } {
  const scores = analyzePrompt(prompt);
  const changes: string[] = [];
  let improved = prompt.trim();
  const toneWord = tone === "Professional" ? "professional, authoritative" : tone === "Casual" ? "friendly, approachable" : tone === "Academic" ? "scholarly, evidence-based" : "warm, conversational";

  if (!/\b(you are|act as|role|persona|expert|assistant)\b/i.test(improved)) {
    improved = `You are an expert assistant with deep knowledge. ${improved}`;
    changes.push("Added explicit persona/role definition to anchor the AI's response style");
  }
  if (!/\b(goal|objective|purpose|task|please|want|need|create|write|generate|help)\b/i.test(improved)) {
    improved += `\n\nPlease provide a clear and helpful response.`;
    changes.push("Added explicit goal statement to clarify the desired outcome");
  }
  if (scores.specificity < 5) {
    improved += `\n\nBe specific and detailed in your response. Provide concrete examples where applicable.`;
    changes.push("Added specificity instruction to elicit more detailed, actionable output");
  }
  if (scores.constraints < 5) {
    improved += `\n\nOutput should be well-organized and use a ${toneWord} tone.`;
    changes.push("Added formatting constraints and tone guidance");
  }
  if (!/\b(context|background|scenario|given|assuming|based on)\b/i.test(improved)) {
    if (improved.length < 100) {
      improved += `\n\nProvide relevant context and background for your response.`;
      changes.push("Added context enrichment to improve response relevance");
    }
  }
  if (scores.structure < 5) {
    improved += `\n\nStructure your response with clear sections and use bullet points for key items.`;
    changes.push("Added structural formatting instructions for better-organized output");
  }

  return { improved, changes };
}

export function PromptImprover() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [scores, setScores] = useState<Record<Dimension, number> | null>(null);
  const [changes, setChanges] = useState<string[]>([]);
  const [history, setHistory] = useState<Array<{ original: string; improved: string }>>([]);

  const improve = useCallback(() => {
    if (!input.trim()) return;
    const s = analyzePrompt(input);
    setScores(s);
    const { improved, changes: c } = improvePrompt(input, tone);
    setOutput(improved);
    setChanges(c);
    setHistory(prev => [{ original: input, improved }, ...prev].slice(0, 15));
  }, [input, tone]);

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };

  const avgScore = scores ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length * 10) / 10 : null;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-dark-text mb-1">Your Prompt</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your AI prompt here to analyze and improve it..." rows={6} spellCheck={false}
          className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm font-mono text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
      </div>

      <div className="flex items-center gap-3">
        <select value={tone} onChange={(e) => setTone(e.target.value as Tone)}
          className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
          <option>Professional</option><option>Casual</option><option>Academic</option><option>Friendly</option>
        </select>
        <button onClick={improve} className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Improve Prompt</button>
      </div>

      {scores && (
        <div className="rounded-lg border border-surface-200 dark:border-dark-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-surface-700 dark:text-dark-text">Dimension Scores</h3>
            {avgScore !== null && <span className="text-xs font-medium text-brand-500">Overall: {avgScore}/10</span>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DIMENSIONS.map(d => (
              <div key={d.key}>
                <div className="flex justify-between text-xs text-surface-500 dark:text-dark-muted mb-0.5">
                  <span>{d.label}</span>
                  <span>{scores[d.key]}/10</span>
                </div>
                <div className="h-2 rounded-full bg-surface-100 dark:bg-dark-surface">
                  <div className={`h-2 rounded-full transition-all ${scores[d.key] >= 7 ? "bg-green-500" : scores[d.key] >= 4 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${scores[d.key] * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {changes.length > 0 && (
        <div className="rounded-lg border border-surface-200 dark:border-dark-border p-4">
          <h3 className="text-sm font-medium text-surface-700 dark:text-dark-text mb-2">Changes Made</h3>
          <ul className="space-y-1.5">
            {changes.map((c, i) => (
              <li key={i} className="text-xs text-surface-600 dark:text-dark-muted flex items-start gap-2">
                <span className="text-brand-500 mt-0.5">•</span>{c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Improved Prompt</label>
            <button onClick={copy} className="rounded bg-brand-500 px-2 py-0.5 text-xs text-white hover:bg-brand-600">Copy</button>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text whitespace-pre-wrap break-all select-all">{output}</pre>
        </div>
      )}

      {history.length > 1 && (
        <div>
          <h3 className="text-xs font-medium text-surface-500 dark:text-dark-muted mb-1">History</h3>
          <div className="space-y-1 max-h-40 overflow-auto">
            {history.slice(1).map((h, i) => (
              <div key={i} className="p-2 rounded border border-surface-200 dark:border-dark-border text-xs text-surface-600 dark:text-dark-muted cursor-pointer hover:bg-surface-50 dark:hover:bg-dark-surface" onClick={() => setInput(h.original)}>
                <span className="truncate block">{h.original.slice(0, 80)}...</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
