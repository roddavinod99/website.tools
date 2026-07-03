"use client";

import { useState, type FormEvent } from "react";

export default function FeatureRequestPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "feature-request", title, description }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setTitle(""); setDescription("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
          Request a Feature
        </h1>
        <p className="mt-2 text-lg text-surface-500 dark:text-dark-muted">
          Help shape the future of DevStackIO.
        </p>

        {status === "success" ? (
          <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
            <p className="font-medium text-green-700 dark:text-green-400">Thank you! Your feature request has been received.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text">Feature Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                placeholder="e.g., Dark mode toggle"
                className="mt-1 flex h-10 w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-dark-text">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}
                placeholder="Describe the feature and how it would benefit you..."
                className="mt-1 flex w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-muted" />
            </div>
            {status === "error" && (
              <p className="text-sm text-red-600 dark:text-red-400">Failed to submit. Please try again.</p>
            )}
            <button type="submit" disabled={status === "loading"}
              className="inline-flex w-full items-center justify-center rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">
              {status === "loading" ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
