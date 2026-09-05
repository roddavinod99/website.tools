"use client";

import { useState, type FormEvent } from "react";

export default function ReportBugPage() {
  const [tool, setTool] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "report-bug", tool, description }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setTool(""); setDescription("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
          Report a Bug
        </h1>
        <p className="mt-2 text-lg text-[var(--color-text-muted)]">
          Found something broken? Let us fix it.
        </p>
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          Help us keep DevStackIO reliable by reporting bugs. Include which tool or page you were using,
          what you did, and what you expected to happen instead of the broken behavior. The more detail you
          provide, the quicker we can diagnose and resolve the problem.
        </p>

        {status === "success" ? (
          <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
            <p className="font-medium text-green-700 dark:text-green-400">Thank you! Your bug report has been received.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">Tool/Page</label>
              <input type="text" value={tool} onChange={(e) => setTool(e.target.value)} required
                placeholder="e.g., JSON Formatter"
                className="mt-1 flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] dark:text-[var(--color-text)] dark:placeholder:text-[var(--color-text-subtle)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">Describe the Bug</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}
                placeholder="What happened? What did you expect to happen?"
                className="mt-1 flex w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] dark:border-[var(--color-border)] dark:bg-[var(--color-surface)] dark:text-[var(--color-text)] dark:placeholder:text-[var(--color-text-subtle)]" />
            </div>
            {status === "error" && (
              <p className="text-sm text-red-600 dark:text-red-400">Failed to submit. Please try again.</p>
            )}
            <button type="submit" disabled={status === "loading"}
              className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors">
              {status === "loading" ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
