"use client";

import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !EMAIL_REGEX.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "newsletter", email }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="border-t border-surface-200 bg-brand-500 dark:border-dark-border">
      <div className="container py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Mail className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            Stay Updated
          </h2>
          <p className="mt-2 text-brand-200">
            Get notified when we add new tools, tutorials, and resources.
          </p>
          {status === "success" ? (
            <p className="mt-8 text-white font-medium">Thanks for subscribing!</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="Enter your email"
                className="h-11 sm:w-80 rounded-lg border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-brand-200 focus:outline-none focus:bg-white/20 focus:ring-2 focus:ring-white/30"
              />
              <button type="submit" disabled={status === "loading"}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50 transition-colors">
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="mt-2 text-sm text-red-300">Something went wrong. Please try again.</p>
          )}
          <p className="mt-3 text-xs text-brand-300">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
