import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "new";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-[var(--selection-bg)] text-[var(--text)]",
        variant === "success" && "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400",
        variant === "warning" && "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400",
        variant === "error" && "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400",
        variant === "new" && "bg-brand-primary text-white dark:bg-brand-bright",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
