"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { faqItems } from "@/lib/constants";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-t border-surface-200 dark:border-dark-border">
      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text sm:text-3xl text-center">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-2">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-surface"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                  aria-expanded={openIndex === i}
                >
                  <span className="font-medium text-surface-900 dark:text-dark-text">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-surface-400 transition-transform duration-200",
                      openIndex === i && "rotate-180",
                    )}
                  />
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-surface-500 dark:text-dark-muted">
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
