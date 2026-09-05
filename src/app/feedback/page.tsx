"use client";

import { useState, type FormEvent } from "react";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "feedback", feedback, email }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setFeedback(""); setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
          Share Feedback
        </h1>
        <p className="mt-2 text-lg text-[var(--color-text-muted)]">
          We&apos;d love to hear your thoughts.
        </p>
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          Your feedback directly shapes the platform &mdash; from tool accuracy and interface design to
          performance and accessibility. If something felt slow, confusing, or broken, let us know. If you
          can share which tool and page you were using, it helps us reproduce and fix issues faster.
        </p>

        {status === "success" ? (
          <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
            <p className="font-medium text-green-700 dark:text-green-400">Thank you! Your feedback has been received.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">Your Feedback</label>
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} required rows={4}
                placeholder="Tell us what you think..."
                className="mt-1 flex w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">Your Email (optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="If you'd like a reply"
                className="mt-1 flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)]" />
            </div>
            {status === "error" && (
              <p className="text-sm text-red-600 dark:text-red-400">Failed to submit. Please try again.</p>
            )}
            <button type="submit" disabled={status === "loading"}
              className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors">
              {status === "loading" ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
