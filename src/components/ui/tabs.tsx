"use client";

import React, { useState } from "react";

interface TabSetProps {
  children: React.ReactNode;
  defaultActive?: string;
  className?: string;
  onChange?: (tabId: string) => void;
}

interface TabSetContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabSetContext = React.createContext<TabSetContextValue | null>(null);

export function TabSet({ children, defaultActive, className = "", onChange }: TabSetProps) {
  const [activeTab, setActiveTab] = useState(defaultActive || "");

  const handleSetActiveTab = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  return (
    <TabSetContext.Provider value={{ activeTab, setActiveTab: handleSetActiveTab }}>
      <div className={className}>{children}</div>
    </TabSetContext.Provider>
  );
}

interface TabListProps {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function TabList({ children, className = "", ariaLabel = "Tabs" }: TabListProps) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={`flex flex-wrap gap-1 border-b border-tool-border ${className}`}>
      {children}
    </div>
  );
}

interface TabProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  badge?: string | number;
}

export function Tab({ id, children, disabled = false, className = "", badge }: TabProps) {
  const context = React.useContext(TabSetContext);
  if (!context) throw new Error("Tab must be used within TabSet");

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === id;

  return (
    <button
      role="tab"
      id={`tab-${id}`}
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(id)}
      className={`
        flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all
        ${isActive
          ? "border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]"
          : "border-b-2 border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {children}
      {badge !== undefined && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-tool-border px-1.5 text-[10px] font-medium text-result-secondary">
          {badge}
        </span>
      )}
    </button>
  );
}

interface TabPanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ id, children, className = "" }: TabPanelProps) {
  const context = React.useContext(TabSetContext);
  if (!context) throw new Error("TabPanel must be used within TabSet");

  const { activeTab } = context;
  const isActive = activeTab === id;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      className={`animate-fade-in ${className}`}
      tabIndex={0}
    >
      {children}
    </div>
  );
}