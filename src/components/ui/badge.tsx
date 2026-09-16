import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "new" | "brand";
  size?: "sm" | "md";
}

const variantClasses: Record<string, string> = {
  default: "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]",
  success: "border-[var(--color-border)] bg-[var(--color-surface)] text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/30 dark:text-amber-300",
  error: "border-[var(--color-border)] bg-[var(--color-surface)] text-red-700 dark:text-red-300",
  info: "border-[var(--color-border)] bg-[var(--color-surface)] text-blue-700",
  new: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/30 dark:text-blue-300",
  brand: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/30 dark:text-blue-300",
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