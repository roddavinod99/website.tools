"use client";

import { useState, type ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

interface Props {
  title: string;
  description: string;
  tabs: Tab[];
  defaultTab?: string;
}

export function ToolkitShell({ title, description, tabs, defaultTab }: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || "");

  const active = tabs.find((t) => t.id === activeTab);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Navigation */}
      <nav className="lg:w-56 shrink-0">
        <div className="lg:sticky lg:top-24 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left ${
                activeTab === tab.id
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-surface-600 hover:bg-surface-100 dark:text-dark-muted dark:hover:bg-dark-surface"
              }`}
            >
              <span className="h-4 w-4 shrink-0">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-surface-900 dark:text-dark-text">{active?.label || title}</h2>
          <p className="mt-1 text-sm text-surface-500 dark:text-dark-muted">{description}</p>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
          {active?.content}
        </div>
      </div>
    </div>
  );
}
