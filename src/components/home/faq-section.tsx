"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

export function FAQSection({ faqItems }: { faqItems: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-t border-[var(--color-border)]" aria-labelledby="faq-heading">
      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            FAQ
          </p>
          <h2 id="faq-heading" className="mt-2 text-center text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl text-balance">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-2">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                  aria-expanded={openIndex === i}
                >
                  <span className="font-medium text-[var(--color-text)]">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-[var(--color-text-subtle)] transition-transform duration-200",
                      openIndex === i && "rotate-180",
                    )}
                  />
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
