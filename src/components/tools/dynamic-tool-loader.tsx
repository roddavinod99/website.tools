"use client";

import dynamic from "next/dynamic";

const ToolInterface = dynamic(
  () => import("./tool-interface").then((m) => ({ default: m.ToolInterface })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-sm text-surface-400 dark:text-dark-muted">Loading tool...</div>
      </div>
    ),
  }
);

export { ToolInterface };
