"use client";

interface LoadingStateProps {
  variant?: "skeleton" | "spinner";
  className?: string;
  rows?: number;
}

export function LoadingState({ variant = "skeleton", className = "", rows = 3 }: LoadingStateProps) {
  if (variant === "spinner") {
    return (
      <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-tool-border border-t-brand-primary" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-shimmer h-10 rounded-lg bg-tool-border" />
      ))}
    </div>
  );
}