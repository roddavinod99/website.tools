"use client";

import { useEffect, useState } from "react";

const numberFormatter = new Intl.NumberFormat("en-US");

export function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await fetch("/api/visits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
          keepalive: true,
        });
        if (response.ok) {
          const data = (await response.json()) as { count?: number };
          if (mounted && typeof data.count === "number") setCount(data.count);
          return;
        }
      } catch {
        // fall through to the read-only endpoint
      }

      try {
        const response = await fetch("/api/visits", { cache: "no-store" });
        if (response.ok) {
          const data = (await response.json()) as { count?: number };
          if (mounted && typeof data.count === "number") setCount(data.count);
        }
      } catch {
        // Ignore failures: the counter is best-effort and must never break the page.
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  if (count === null) return null;

  return (
    <p
      className="mt-4 text-sm text-surface-500 dark:text-dark-muted"
      data-testid="visit-counter"
    >
      Total Number of Visitors till date:{" "}
      <span className="font-medium text-surface-700 dark:text-dark-text">
        {numberFormatter.format(count)}
      </span>
    </p>
  );
}
