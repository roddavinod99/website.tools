import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "new";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-surface-100 text-surface-700 dark:bg-dark-surface dark:text-dark-text",
        variant === "success" && "bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-200",
        variant === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-200",
        variant === "error" && "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200",
        variant === "new" && "bg-brand-600 text-white dark:bg-brand-500",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
