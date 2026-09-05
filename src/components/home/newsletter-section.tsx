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
    <section className="border-t border-[var(--color-border)] bg-[var(--color-accent)]" aria-labelledby="newsletter-heading">
      <div className="container py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--color-accent-hover)]">
              <Mail className="h-6 w-6 text-[var(--color-accent-fg)]" />
            </div>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-fg)]/80">
            Newsletter
          </p>
          <h2 id="newsletter-heading" className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-accent-fg)] sm:text-4xl text-balance">
            Stay Updated
          </h2>
          <p className="mt-3 text-base text-[var(--color-accent-fg)]/90 text-pretty">
            Get notified when we add new tools, tutorials, and resources.
          </p>
          {status === "success" ? (
            <p className="mt-8 text-[var(--color-accent-fg)] font-medium">Thanks for subscribing!</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                name="email"
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="Enter your email"
                autoComplete="email"
                className="h-11 sm:w-80 rounded-md border border-[var(--color-accent-fg)]/30 bg-[var(--color-accent-hover)] px-3 text-sm text-[var(--color-accent-fg)] placeholder:text-[var(--color-accent-fg)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-fg)]/40"
              />
              <button type="submit" disabled={status === "loading"}
                className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--color-accent-fg)] px-6 text-sm font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent-fg)]/90 disabled:opacity-50 transition-colors">
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="mt-2 text-sm text-[var(--color-accent-fg)]/90">Something went wrong. Please try again.</p>
          )}
          <p className="mt-3 text-xs text-[var(--color-accent-fg)]/80">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
