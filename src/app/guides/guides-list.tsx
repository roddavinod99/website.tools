"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, ArrowRight } from "lucide-react";

interface GuideTopic {
  title: string;
  description: string;
  slug: string;
  readTime: string;
  category: string;
}

interface GuidesListProps {
  topics: GuideTopic[];
  initialTopic?: string | null | undefined;
}

export function GuidesList({ topics, initialTopic }: GuidesListProps) {
  const searchParams = useSearchParams();
  const urlTopic = searchParams?.get("topic");
  const derivedTopic = urlTopic ? decodeURIComponent(urlTopic) : initialTopic ?? null;
  const [activeTopic, setActiveTopic] = useState<string | null>(derivedTopic);

  const visibleTopics = useMemo(
    () => (activeTopic ? topics.filter((t) => t.category === activeTopic) : topics),
    [topics, activeTopic]
  );

  const handleCategoryChange = (category: string | null) => {
    setActiveTopic(category);
    if (category) {
      window.history.pushState({}, "", `/guides?topic=${encodeURIComponent(category)}`);
    } else {
      window.history.pushState({}, "", `/guides`);
    }
  };

  return (
    <>
      {activeTopic && (
        <div className="mt-4">
          <button
            onClick={() => handleCategoryChange(null)}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
          >
            ← Show all guides
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {visibleTopics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/guides/${topic.slug}`}
            className="group flex items-start gap-4 rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-dark-border dark:bg-dark-surface"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-surface-900 group-hover:text-brand-500 dark:text-dark-text dark:group-hover:text-brand-400">
                {topic.title}
              </h3>
              <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted line-clamp-2">
                {topic.description}
              </p>
              <p className="mt-2 text-xs text-surface-400 dark:text-dark-muted">
                {topic.category} · {topic.readTime} read
              </p>
            </div>
            <ArrowRight className="mt-2 h-4 w-4 flex-shrink-0 text-surface-400" />
          </Link>
        ))}
      </div>

      {visibleTopics.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-surface-300 p-8 text-center text-sm text-surface-500 dark:border-dark-border dark:text-dark-muted">
          No guides found for this topic.
        </div>
      )}
    </>
  );
}