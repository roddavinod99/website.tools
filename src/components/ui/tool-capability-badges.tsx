"use client";

import { Cpu, Zap, Copy, Download, Shield, Upload, MousePointer2, RotateCcw, Columns, GitCompare, Code, LayoutDashboard } from "lucide-react";

interface CapabilityBadgesProps {
  capabilities: {
    worker: boolean;
    wasm: boolean;
    copy: boolean;
    download: boolean;
    validation: boolean;
    fileUpload: boolean;
    dragDrop: boolean;
    realTime: boolean;
    multipleInputs: boolean;
    comparison: boolean;
    syntaxHighlighting: boolean;
    tabs: boolean;
  };
}

const CAPABILITY_CONFIG: Array<{
  key: keyof CapabilityBadgesProps["capabilities"];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  { key: "worker", label: "Web Worker", icon: Cpu, description: "Processes in background thread" },
  { key: "wasm", label: "WASM", icon: Zap, description: "WebAssembly accelerated" },
  { key: "realTime", label: "Real-time", icon: RotateCcw, description: "Live preview as you type" },
  { key: "copy", label: "Copy", icon: Copy, description: "One-click copy to clipboard" },
  { key: "download", label: "Download", icon: Download, description: "Export results as file" },
  { key: "validation", label: "Validation", icon: Shield, description: "Input validation & error reporting" },
  { key: "fileUpload", label: "File Upload", icon: Upload, description: "Accepts file input" },
  { key: "dragDrop", label: "Drag & Drop", icon: MousePointer2, description: "Drag files to upload" },
  { key: "multipleInputs", label: "Multi-input", icon: Columns, description: "Multiple input fields" },
  { key: "comparison", label: "Comparison", icon: GitCompare, description: "Side-by-side diff view" },
  { key: "syntaxHighlighting", label: "Syntax Highlight", icon: Code, description: "Code syntax coloring" },
  { key: "tabs", label: "Tabs", icon: LayoutDashboard, description: "Tabbed interface" },
];

export function ToolCapabilityBadges({ capabilities }: CapabilityBadgesProps) {
  const activeCapabilities = CAPABILITY_CONFIG.filter((c) => capabilities[c.key]);

  if (activeCapabilities.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="Tool capabilities">
      {activeCapabilities.map((cap) => (
        <span
          key={cap.key}
          className="inline-flex items-center gap-1.5 rounded-full bg-surface-100 px-2.5 py-1 text-xs font-medium text-surface-700 dark:bg-dark-surface dark:text-dark-muted"
          role="listitem"
          aria-label={cap.description}
        >
          <cap.icon className="h-3 w-3" aria-hidden="true" />
          {cap.label}
        </span>
      ))}
    </div>
  );
}