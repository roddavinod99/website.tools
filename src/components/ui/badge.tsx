import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "new" | "brand";
  size?: "sm" | "md";
}

const variantClasses: Record<string, string> = {
  default: "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]",
  success: "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-success)]",
  warning: "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-warning)]",
  error: "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-danger)]",
  info: "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-accent)]",
  new: "border-[var(--color-border)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  brand: "border-[var(--color-border)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
};

const sizeClasses: Record<string, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
};

export function Badge({ className, variant = "default", size = "md", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}