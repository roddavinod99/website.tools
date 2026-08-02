"use client";

import { useState, useCallback } from "react";
import { getStorageJSON, setStorageJSON } from "@/lib/client-storage";

type Category = "Creative" | "Technical" | "Business" | "Educational" | "Personal" | "Analytical";
type Tone = "Professional" | "Casual" | "Academic";
type Format = "Concise" | "Detailed" | "Step-by-Step" | "Bulleted";

const CATEGORIES: Record<Category, string[]> = {
  Creative: ["Story Writing", "Poetry", "Blog Post", "Social Media Content", "Email Copy"],
  Technical: ["Code Review", "Debug Help", "Architecture Design", "API Design", "Code Generation"],
  Business: ["Market Analysis", "Strategy Plan", "Report Writing", "Pitch Deck", "Competitor Analysis"],
  Educational: ["Explain Concept", "Lesson Plan", "Quiz Generation", "Study Guide", "Research Summary"],
  Personal: ["Travel Planning", "Goal Setting", "Decision Making", "Resume Help", "Interview Prep"],
  Analytical: ["Data Analysis", "Pros & Cons", "Risk Assessment", "Root Cause", "Decision Framework"],
};

const CONTEXT_FIELDS: Record<string, string[]> = {
  "Story Writing": ["Genre", "Setting", "Main Character", "Conflict/Theme"],
  "Poetry": ["Theme", "Style/Form", "Mood", "Key Images"],
  "Blog Post": ["Topic", "Target Audience", "Key Points", "Tone"],
  "Social Media Content": ["Platform", "Product/Brand", "Goal", "Audience"],
  "Email Copy": ["Purpose", "Audience", "Key Message", "CTA"],
  "Code Review": ["Language", "Framework", "Focus Area", "Code Snippet"],
  "Debug Help": ["Language", "Error Message", "What I Tried", "Expected Behavior"],
  "Architecture Design": ["Tech Stack", "Scale Requirements", "Constraints", "Components"],
  "API Design": ["Resource", "Methods", "Auth", "Response Format"],
  "Code Generation": ["Language", "Functionality", "Input/Output", "Constraints"],
  "Market Analysis": ["Industry", "Product Type", "Region", "Competitors"],
  "Strategy Plan": ["Business Type", "Goal", "Timeline", "Resources"],
  "Report Writing": ["Topic", "Audience", "Data Source", "Key Findings"],
  "Pitch Deck": ["Company", "Stage", "Ask", "Key Metrics"],
  "Competitor Analysis": ["Your Product", "Competitor", "Features", "Pricing"],
  "Explain Concept": ["Concept", "Audience Level", "Context", "Related Topics"],
  "Lesson Plan": ["Subject", "Grade Level", "Duration", "Learning Objectives"],
  "Quiz Generation": ["Topic", "Difficulty", "Number of Questions", "Question Types"],
  "Study Guide": ["Subject", "Exam Type", "Key Topics", "Time Available"],
  "Research Summary": ["Research Topic", "Key Sources", "Findings", "Implications"],
  "Travel Planning": ["Destination", "Duration", "Budget", "Interests"],
  "Goal Setting": ["Area", "Current Status", "Desired Outcome", "Timeline"],
  "Decision Making": ["Decision", "Options", "Criteria", "Constraints"],
  "Resume Help": ["Target Role", "Experience Level", "Key Skills", "Achievements"],
  "Interview Prep": ["Role", "Company", "Focus Areas", "Concerns"],
  "Data Analysis": ["Data Type", "Question", "Variables", "Method"],
  "Pros & Cons": ["Decision", "Options", "Key Factors", "Stakeholders"],
  "Risk Assessment": ["Project/Activity", "Scope", "Stakeholders", "Timeline"],
  "Root Cause": ["Problem", "Symptoms", "When It Occurs", "Affected Systems"],
  "Decision Framework": ["Decision", "Options", "Criteria", "Weighting"],
};

const TEMPLATES: Record<string, (ctx: Record<string, string>, tone: Tone, format: Format) => string> = {
  "Code Review": (ctx, tone, format) => {
    const toneDesc = tone === "Professional" ? "experienced senior developer" : tone === "Academic" ? "computer science professor specializing in software quality" : "helpful senior developer";
    return `You are a ${toneDesc}. Review the following ${ctx["Language"] || "code"} ${ctx["Framework"] ? `(using ${ctx["Framework"]}) ` : ""}and provide a thorough code review.\n\nFocus areas: ${ctx["Focus Area"] || "security, performance, readability, best practices"}\n\nCode:\n\`\`\`\n${ctx["Code Snippet"] || "[paste code here]"}\n\`\`\`\n\n${format === "Step-by-Step" ? "Provide feedback in this order:\n1. Critical issues (security, bugs)\n2. Performance improvements\n3. Code style and readability\n4. Suggestions for improvement" : format === "Bulleted" ? "Provide feedback as organized bullet points grouped by category." : "Provide a comprehensive review covering bugs, performance, and style."}`;
  },
  "Debug Help": (ctx, tone, format) => {
    return `I need help debugging a ${ctx["Language"] || ""} issue.\n\n**Error:** ${ctx["Error Message"] || "[error message]"}\n**What I tried:** ${ctx["What I Tried"] || "[steps taken]"}\n**Expected:** ${ctx["Expected Behavior"] || "[what should happen]"}\n\n${format === "Step-by-Step" ? "Please help me debug this step by step, explaining the root cause and solution." : "Please help me identify the root cause and provide a solution."}`;
  },
  "Explain Concept": (ctx, tone, format) => {
    const level = ctx["Audience Level"] || "intermediate";
    return `Explain the concept of "${ctx["Concept"] || "[concept]"}" for a ${level} audience.\n\n${ctx["Context"] ? `Context: ${ctx["Context"]}\n` : ""}${ctx["Related Topics"] ? `Related topics to connect: ${ctx["Related Topics"]}\n` : ""}\n${format === "Step-by-Step" ? "Build the explanation progressively from basics to advanced." : format === "Bulleted" ? "Use clear bullet points for key takeaways." : "Provide a clear, comprehensive explanation with examples."}`;
  },
  "Market Analysis": (ctx, tone, format) => {
    return `Conduct a market analysis for the ${ctx["Industry"] || "[industry]"} industry.\n\nProduct/Service: ${ctx["Product Type"] || "[product type]"}\nTarget Region: ${ctx["Region"] || "[region]"}\n${ctx["Competitors"] ? `Key competitors: ${ctx["Competitors"]}\n` : ""}\n${format === "Step-by-Step" ? "Structure the analysis as:\n1. Market size and growth\n2. Key trends\n3. Competitive landscape\n4. Opportunities and threats\n5. Recommendations" : "Provide a comprehensive market analysis with data-driven insights."}`;
  },
  "Resume Help": (ctx, tone, format) => {
    return `Help me optimize my resume for a ${ctx["Target Role"] || "[target role]"} position.\n\nExperience Level: ${ctx["Experience Level"] || "[level]"}\nKey Skills: ${ctx["Key Skills"] || "[skills]"}\nKey Achievements: ${ctx["Achievements"] || "[achievements]"}\n\n${format === "Bulleted" ? "Provide specific, actionable bullet points for each section." : "Provide improved resume content with strong action verbs and quantified achievements."}`;
  },
};

function generateDefault(category: Category, useCase: string, ctx: Record<string, string>, tone: Tone, format: Format): string {
  const toneDesc = tone === "Professional" ? "a professional expert" : tone === "Academic" ? "an academic professional" : "a helpful and friendly assistant";
  const contextStr = Object.entries(ctx).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");

  const formatInstructions: Record<Format, string> = {
    Concise: "Keep the response concise and to-the-point.",
    Detailed: "Provide a comprehensive, detailed response.",
    "Step-by-Step": "Structure the response as clear step-by-step instructions.",
    Bulleted: "Use organized bullet points for easy scanning.",
  };

  return `You are ${toneDesc}. ${category} task: ${useCase}.\n\n${contextStr ? `Context:\n${contextStr}\n\n` : ""}Instructions: ${formatInstructions[format]}`;
}

export function PromptGenerator() {
  const [category, setCategory] = useState<Category>("Technical");
  const [useCase, setUseCase] = useState("Code Review");
  const [tone, setTone] = useState<Tone>("Professional");
  const [format, setFormat] = useState<Format>("Step-by-Step");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [customContext, setCustomContext] = useState("");
  const [output, setOutput] = useState("");
  const [history, setHistory] = useState<string[]>(() => getStorageJSON<string[]>("prompt-generator-history") || []);
  const [favorites, setFavorites] = useState<string[]>(() => getStorageJSON<string[]>("prompt-generator-favorites") || []);
  const [historyTab, setHistoryTab] = useState<"history" | "favorites">("history");

  const fieldsForUseCase = CONTEXT_FIELDS[useCase] || [];

  const generate = useCallback(() => {
    const ctx = { ...fields };
    if (customContext) ctx["Additional"] = customContext;
    const templateFn = TEMPLATES[useCase];
    const result = templateFn ? templateFn(ctx, tone, format) : generateDefault(category, useCase, ctx, tone, format);
    setOutput(result);
    setHistory(prev => {
      const next = [result, ...prev.filter(p => p !== result)].slice(0, 30);
      setStorageJSON("prompt-generator-history", next);
      return next;
    });
  }, [category, useCase, tone, format, fields, customContext]);

  const toggleFavorite = (prompt: string) => {
    setFavorites(prev => {
      const next = prev.includes(prompt) ? prev.filter(p => p !== prompt) : [prompt, ...prev];
      setStorageJSON("prompt-generator-favorites", next);
      return next;
    });
  };

  const removeFromHistory = (prompt: string) => {
    setHistory(prev => {
      const next = prev.filter(p => p !== prompt);
      setStorageJSON("prompt-generator-history", next);
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    setStorageJSON("prompt-generator-history", []);
  };

  const restorePrompt = (prompt: string) => {
    setOutput(prompt);
  };

  const copy = async () => { if (output) await navigator.clipboard.writeText(output); };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Category</label>
          <select value={category} onChange={(e) => { setCategory(e.target.value as Category); setUseCase(CATEGORIES[e.target.value as Category][0]); setFields({}); }}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            {(Object.keys(CATEGORIES) as Category[]).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Use Case</label>
          <select value={useCase} onChange={(e) => { setUseCase(e.target.value); setFields({}); }}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            {CATEGORIES[category].map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Tone</label>
          <select value={tone} onChange={(e) => setTone(e.target.value as Tone)}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option>Professional</option><option>Casual</option><option>Academic</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Output Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as Format)}
            className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text">
            <option>Concise</option><option>Detailed</option><option>Step-by-Step</option><option>Bulleted</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fieldsForUseCase.map(f => (
          <div key={f}>
            <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">{f}</label>
            <input type="text" value={fields[f] || ""} onChange={(e) => setFields(prev => ({ ...prev, [f]: e.target.value }))}
              placeholder={`Enter ${f.toLowerCase()}...`}
              className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="text-xs text-surface-500 dark:text-dark-muted block mb-0.5">Additional Context (optional)</label>
          <textarea value={customContext} onChange={(e) => setCustomContext(e.target.value)}
            placeholder="Add any extra context or requirements..." rows={2}
            className="w-full rounded-lg border border-surface-200 bg-white p-3 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
        </div>
      </div>

      <button onClick={generate} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Generate Prompt</button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-surface-700 dark:text-dark-text">Generated Prompt</label>
            <div className="flex gap-1">
              <button onClick={copy} className="rounded bg-brand-500 px-2 py-0.5 text-xs text-white hover:bg-brand-600">Copy</button>
              <button onClick={() => toggleFavorite(output)} className="rounded border border-surface-200 px-2 py-0.5 text-xs text-surface-600 hover:bg-surface-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface">{favorites.includes(output) ? "★ Saved" : "☆ Save"}</button>
            </div>
          </div>
          <pre className="w-full rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm font-mono text-surface-900 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text whitespace-pre-wrap break-all select-all">{output}</pre>
        </div>
      )}

      {(history.length > 0 || favorites.length > 0) && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 border-b border-surface-200 dark:border-dark-border">
            {(["history", "favorites"] as const).map(tab => (
              <button key={tab} onClick={() => setHistoryTab(tab)}
                className={`px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
                  historyTab === tab
                    ? "border-brand-400 text-brand-600 dark:text-brand-300"
                    : "border-transparent text-surface-500 hover:text-surface-700 dark:text-dark-muted dark:hover:text-dark-text"
                }`}>
                {tab === "history" ? `History (${history.length})` : `Favorites (${favorites.length})`}
              </button>
            ))}
          </div>

          {historyTab === "history" ? (
            history.length > 0 ? (
              <>
                <div className="flex justify-end">
                  <button onClick={clearHistory} className="text-xs text-surface-400 hover:text-red-500 dark:text-dark-muted dark:hover:text-red-400">Clear all</button>
                </div>
                <ul className="space-y-1 max-h-48 overflow-auto">
                  {history.map((p, i) => (
                    <li key={`${i}-${p.slice(0, 32)}`} className="flex items-start gap-2 p-2 rounded border border-surface-200 dark:border-dark-border text-xs text-surface-600 dark:text-dark-muted">
                      <button className="truncate flex-1 text-left hover:text-brand-600 dark:hover:text-brand-300" onClick={() => restorePrompt(p)} title="Load into editor">{p.slice(0, 120)}</button>
                      <button onClick={() => { navigator.clipboard.writeText(p); }} title="Copy prompt" className="shrink-0 hover:text-brand-500">Copy</button>
                      <button onClick={() => toggleFavorite(p)} title={favorites.includes(p) ? "Unsave" : "Save"} className="shrink-0 hover:text-brand-500">{favorites.includes(p) ? "★" : "☆"}</button>
                      <button onClick={() => removeFromHistory(p)} title="Delete" className="shrink-0 hover:text-red-500">×</button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-xs text-surface-400 dark:text-dark-muted">No history yet. Generate a prompt to see it here.</p>
            )
          ) : favorites.length > 0 ? (
            <ul className="space-y-1 max-h-48 overflow-auto">
              {favorites.map((p, i) => (
                <li key={`${i}-${p.slice(0, 32)}`} className="flex items-start gap-2 p-2 rounded border border-surface-200 dark:border-dark-border text-xs text-surface-600 dark:text-dark-muted">
                  <button className="truncate flex-1 text-left hover:text-brand-600 dark:hover:text-brand-300" onClick={() => restorePrompt(p)} title="Load into editor">{p.slice(0, 120)}</button>
                  <button onClick={() => { navigator.clipboard.writeText(p); }} title="Copy prompt" className="shrink-0 hover:text-brand-500">Copy</button>
                  <button onClick={() => toggleFavorite(p)} title="Unsave" className="shrink-0 hover:text-brand-500">★</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-surface-400 dark:text-dark-muted">No favorites yet. Save a prompt to find it here.</p>
          )}
        </div>
      )}
    </div>
  );
}
