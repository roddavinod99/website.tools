"use client";

import { useState, type FormEvent } from "react";

export default function SuggestPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "suggest", name, description, email }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setName(""); setDescription(""); setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
          Suggest a Tool
        </h1>
        <p className="mt-2 text-lg text-[var(--color-text-muted)]">
          Have an idea for a tool? Let us know.
        </p>
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          Propose a new online utility you&apos;d like to see on DevStackIO. The best suggestions are specific
          about inputs, outputs, and the use case. We prioritize tools that run entirely in the browser,
          respect user privacy, and help developers complete common tasks more quickly.
        </p>

        {status === "success" ? (
          <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
            <p className="font-medium text-green-700 dark:text-green-400">Thank you! Your suggestion has been received.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">Tool Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                placeholder="e.g., YAML Validator"
                className="mt-1 flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}
                placeholder="Describe what this tool should do..."
                className="mt-1 flex w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">Your Email (optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="So we can follow up"
                className="mt-1 flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)]" />
            </div>
            {status === "error" && (
              <p className="text-sm text-red-600 dark:text-red-400">Failed to submit. Please try again.</p>
            )}
            <button type="submit" disabled={status === "loading"}
              className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors">
              {status === "loading" ? "Submitting..." : "Submit Suggestion"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
