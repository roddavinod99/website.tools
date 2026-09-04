import { cn } from "@/lib/utils";

export type LogomarkSize = "sm" | "md" | "lg";

const sizeMap: Record<LogomarkSize, string> = {
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-10 w-10",
};

export function Logomark({ size = "md", className }: { size?: LogomarkSize; className?: string }) {
  return (
    <span
      role="img"
      aria-label="DevStackIO Tools"
      className={cn("inline-flex shrink-0 text-[var(--color-text)]", sizeMap[size], className)}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-full w-full"
      >
        <path d="M14 14 L14 50" />
        <path d="M14 14 L26 14 Q38 14 38 32 Q38 50 26 50 L14 50" />
        <path d="M50 14 L50 50" />
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "text-[var(--color-text)] font-bold tracking-tight",
        className,
      )}
    >
      DevStack<span className="text-[var(--color-accent)]">IO</span>
    </span>
  );
}
